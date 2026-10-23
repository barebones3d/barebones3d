import * as THREE from 'three';
import { VSlotWheelParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an OpenBuilds / 2020 V-Slot Extrusion Wheel Roller using slice lofting:
 * - Precision dual 45° angled V-groove (standard 90° included angle) riding smoothly in extrusion slots
 * - Dual internal bearing pockets for standard 625 bearings (16mm OD × 5mm depth)
 * - Central internal retention spacer lip preventing bearing outer races from binding
 * - Watertight 2-manifold quad-lofted mesh
 */
export function generateVSlotWheel(params: VSlotWheelParams): GeneratedMeshResult {
  const {
    outerDiameter = 24.0,
    wheelWidth = 11.0,
    vAngleDeg = 90.0,
    vDepth = 3.5,
    bearingPocketOD = 16.0,
    bearingPocketDepth = 5.0,
    centerRidgeWidth = 1.0,
    printer_compensation = 0.15,
  } = params;

  const R_out = outerDiameter / 2;
  const W = Math.max(8.0, wheelWidth);
  const halfAngleRad = ((vAngleDeg / 2) * Math.PI) / 180;
  const grooveDepth = Math.min(vDepth, R_out - (bearingPocketOD / 2 + 1.5));
  const R_valley = R_out - grooveDepth;

  const bPocketOD = (bearingPocketOD + printer_compensation) / 2;
  const bPocketDepth = Math.min(bearingPocketDepth, (W - centerRidgeWidth) / 2);
  const throughHoleRadius = 5.2 / 2; // clearance for M5 axle screw

  const segments = 48;
  const positions: number[] = [];
  const indices: number[] = [];

  // V-Groove profile along Z (from 0 to W)
  // Z=0: outer rim
  // Z=W/2 - halfGrooveWidth: groove start
  // Z=W/2: groove bottom (valley)
  // Z=W/2 + halfGrooveWidth: groove end
  // Z=W: outer rim
  const halfGrooveWidth = grooveDepth * Math.tan(halfAngleRad);
  const zMid = W / 2;
  const zGrooveStart = Math.max(0.5, zMid - halfGrooveWidth);
  const zGrooveEnd = Math.min(W - 0.5, zMid + halfGrooveWidth);

  // Bearing pockets:
  // Z=0 to bPocketDepth: radius is bPocketOD
  // Z=bPocketDepth to W - bPocketDepth: radius is throughHoleRadius
  // Z=W - bPocketDepth to W: radius is bPocketOD

  const zLevels: { z: number; rOut: number; rIn: number }[] = [];

  // 1. Bottom Face
  zLevels.push({ z: 0, rOut: R_out, rIn: bPocketOD });

  // 2. Before groove
  if (zGrooveStart > bPocketDepth) {
    zLevels.push({ z: bPocketDepth, rOut: R_out, rIn: bPocketOD });
    zLevels.push({ z: bPocketDepth + 0.01, rOut: R_out, rIn: throughHoleRadius });
    zLevels.push({ z: zGrooveStart, rOut: R_out, rIn: throughHoleRadius });
  } else {
    zLevels.push({ z: zGrooveStart, rOut: R_out, rIn: bPocketOD });
    if (bPocketDepth < zMid) {
      zLevels.push({ z: bPocketDepth, rOut: R_valley + (R_out - R_valley) * ((zMid - bPocketDepth) / halfGrooveWidth), rIn: bPocketOD });
      zLevels.push({ z: bPocketDepth + 0.01, rOut: R_valley + (R_out - R_valley) * ((zMid - bPocketDepth) / halfGrooveWidth), rIn: throughHoleRadius });
    }
  }

  // 3. Groove Center (apex valley)
  zLevels.push({ z: zMid, rOut: R_valley, rIn: throughHoleRadius });

  // 4. After groove
  const zTopPocketStart = W - bPocketDepth;
  if (zGrooveEnd < zTopPocketStart) {
    zLevels.push({ z: zGrooveEnd, rOut: R_out, rIn: throughHoleRadius });
    zLevels.push({ z: zTopPocketStart - 0.01, rOut: R_out, rIn: throughHoleRadius });
    zLevels.push({ z: zTopPocketStart, rOut: R_out, rIn: bPocketOD });
  } else {
    if (zTopPocketStart > zMid) {
      zLevels.push({ z: zTopPocketStart - 0.01, rOut: R_valley + (R_out - R_valley) * ((zTopPocketStart - zMid) / halfGrooveWidth), rIn: throughHoleRadius });
      zLevels.push({ z: zTopPocketStart, rOut: R_valley + (R_out - R_valley) * ((zTopPocketStart - zMid) / halfGrooveWidth), rIn: bPocketOD });
    }
    zLevels.push({ z: zGrooveEnd, rOut: R_out, rIn: bPocketOD });
  }

  // 5. Top Face
  zLevels.push({ z: W, rOut: R_out, rIn: bPocketOD });

  // Sort by z
  zLevels.sort((a, b) => a.z - b.z);

  const numSlices = zLevels.length;
  for (let s = 0; s < numSlices; s++) {
    const { z, rOut, rIn } = zLevels[s];
    // Outer loop CCW
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(rOut * Math.cos(angle), rOut * Math.sin(angle), z);
    }
    // Inner loop CCW
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(rIn * Math.cos(angle), rIn * Math.sin(angle), z);
    }
  }

  const getOutIdx = (slice: number, pt: number) => slice * 2 * segments + pt;
  const getInIdx = (slice: number, pt: number) => slice * 2 * segments + segments + pt;

  // Loft adjacent slices
  for (let s = 0; s < numSlices - 1; s++) {
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      // Outer shell
      const o0 = getOutIdx(s, i);
      const o1 = getOutIdx(s, next);
      const o2 = getOutIdx(s + 1, i);
      const o3 = getOutIdx(s + 1, next);
      indices.push(o0, o2, o1);
      indices.push(o1, o2, o3);

      // Inner bore shell
      const b0 = getInIdx(s, i);
      const b1 = getInIdx(s, next);
      const b2 = getInIdx(s + 1, i);
      const b3 = getInIdx(s + 1, next);
      indices.push(b0, b1, b2);
      indices.push(b1, b3, b2);
    }
  }

  // Bottom cap annulus
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const o0 = getOutIdx(0, i);
    const o1 = getOutIdx(0, next);
    const b0 = getInIdx(0, i);
    const b1 = getInIdx(0, next);
    indices.push(o0, b0, o1);
    indices.push(o1, b0, b1);
  }

  // Top cap annulus
  const topS = numSlices - 1;
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const o0 = getOutIdx(topS, i);
    const o1 = getOutIdx(topS, next);
    const b0 = getInIdx(topS, i);
    const b1 = getInIdx(topS, next);
    indices.push(o0, o1, b0);
    indices.push(o1, b1, b0);
  }

  // BufferGeometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();

  const bbox = geometry.boundingBox || new THREE.Box3();
  const dimensions = {
    x: Number((bbox.max.x - bbox.min.x).toFixed(2)),
    y: Number((bbox.max.y - bbox.min.y).toFixed(2)),
    z: Number((bbox.max.z - bbox.min.z).toFixed(2)),
  };

  const volume = computeMeshVolume(geometry);
  const estimatedPrintWeightGrams = estimateWeightGrams(volume, 0.2);

  return {
    geometry,
    dimensions,
    triangles: indices.length / 3,
    vertices: positions.length / 3,
    estimatedPrintWeightGrams,
  };
}
