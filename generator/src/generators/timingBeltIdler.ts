import * as THREE from 'three';
import {
  TimingBeltIdlerParams,
  GeneratedMeshResult,
  BEARING_PRESET_DATA,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a precision Timing Belt Idler Pulley using slice lofting:
 * - Crowned or flat cylindrical running face for GT2/GT3 belt backs
 * - Dual retention flanges preventing belt wander
 * - Internal press-fit bearing pockets on top and bottom faces with central retention stop shoulder
 * - Watertight 2-manifold lofted quad mesh
 */
export function generateTimingBeltIdler(params: TimingBeltIdlerParams): GeneratedMeshResult {
  const {
    profileType,
    pulleyDiameter,
    beltWidth,
    flangeHeight,
    flangeThickness,
    bearingPreset,
    bearingPocketDepth,
    centerRidgeThickness,
    printer_compensation,
  } = params;

  // Bearing dimensions
  const bData = bearingPreset !== 'custom' && BEARING_PRESET_DATA[bearingPreset]
    ? BEARING_PRESET_DATA[bearingPreset]
    : { od: 16, id: 5, width: 5, name: 'Default 625' };

  const bearingOD = bData.od + printer_compensation;
  const bearingID = bData.id + printer_compensation;

  const baseRadius = Math.max(bearingOD / 2 + 1.8, pulleyDiameter / 2);
  const flangeRadius = baseRadius + Math.max(1.0, flangeHeight);
  const flangeT = Math.max(0.8, flangeThickness);
  const trackWidth = Math.max(beltWidth + 1.0, 6.0);
  const totalHeight = trackWidth + 2 * flangeT;

  const segments = 48;
  const positions: number[] = [];
  const indices: number[] = [];

  // Axial slice definitions: [z, outerRadius, innerRadius]
  // Z goes from 0 to totalHeight
  const zFlangeBottom = flangeT;
  const zFlangeTop = totalHeight - flangeT;

  const pocketDepth = Math.min(bearingPocketDepth, (totalHeight - centerRidgeThickness) / 2);
  const zBottomPocketEnd = pocketDepth;
  const zTopPocketStart = totalHeight - pocketDepth;

  // Sample along Z
  const zLevels: { z: number; rOut: number; rIn: number }[] = [];

  // Bottom flange
  zLevels.push({ z: 0, rOut: flangeRadius, rIn: bearingOD / 2 });
  zLevels.push({ z: zFlangeBottom * 0.5, rOut: flangeRadius, rIn: bearingOD / 2 });
  zLevels.push({ z: zFlangeBottom, rOut: baseRadius, rIn: bearingOD / 2 });

  // Bearing pocket end / shoulder
  if (zBottomPocketEnd > zFlangeBottom && zBottomPocketEnd < zTopPocketStart) {
    zLevels.push({ z: zBottomPocketEnd, rOut: baseRadius, rIn: bearingOD / 2 });
    zLevels.push({ z: zBottomPocketEnd + 0.01, rOut: baseRadius, rIn: bearingID / 2 });
  }

  // Belt track center (with optional crowning)
  const zMid = totalHeight / 2;
  const crownRadius = profileType === 'crowned' ? baseRadius + 0.4 : baseRadius;
  zLevels.push({ z: zMid, rOut: crownRadius, rIn: bearingID / 2 });

  // Top bearing pocket start
  if (zTopPocketStart > zBottomPocketEnd && zTopPocketStart < zFlangeTop) {
    zLevels.push({ z: zTopPocketStart - 0.01, rOut: baseRadius, rIn: bearingID / 2 });
    zLevels.push({ z: zTopPocketStart, rOut: baseRadius, rIn: bearingOD / 2 });
  }

  // Top flange
  zLevels.push({ z: zFlangeTop, rOut: baseRadius, rIn: bearingOD / 2 });
  zLevels.push({ z: zFlangeTop + flangeT * 0.5, rOut: flangeRadius, rIn: bearingOD / 2 });
  zLevels.push({ z: totalHeight, rOut: flangeRadius, rIn: bearingOD / 2 });

  // Sort by z
  zLevels.sort((a, b) => a.z - b.z);

  // Build vertex slices
  const numSlices = zLevels.length;
  for (let s = 0; s < numSlices; s++) {
    const { z, rOut, rIn } = zLevels[s];
    // Outer loop CCW
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(rOut * Math.cos(angle), rOut * Math.sin(angle), z);
    }
    // Inner bore loop CCW
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(rIn * Math.cos(angle), rIn * Math.sin(angle), z);
    }
  }

  const getOutIdx = (slice: number, pt: number) => slice * 2 * segments + pt;
  const getInIdx = (slice: number, pt: number) => slice * 2 * segments + segments + pt;

  // Loft slices
  for (let s = 0; s < numSlices - 1; s++) {
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      // Outer hull
      const o0 = getOutIdx(s, i);
      const o1 = getOutIdx(s, next);
      const o2 = getOutIdx(s + 1, i);
      const o3 = getOutIdx(s + 1, next);
      indices.push(o0, o2, o1);
      indices.push(o1, o2, o3);

      // Inner bore hull (inward-facing normals)
      const b0 = getInIdx(s, i);
      const b1 = getInIdx(s, next);
      const b2 = getInIdx(s + 1, i);
      const b3 = getInIdx(s + 1, next);
      indices.push(b0, b1, b2);
      indices.push(b1, b3, b2);
    }
  }

  // Bottom cap (annulus at slice 0)
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const o0 = getOutIdx(0, i);
    const o1 = getOutIdx(0, next);
    const b0 = getInIdx(0, i);
    const b1 = getInIdx(0, next);
    // Downward normal
    indices.push(o0, b0, o1);
    indices.push(o1, b0, b1);
  }

  // Top cap (annulus at last slice)
  const topS = numSlices - 1;
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const o0 = getOutIdx(topS, i);
    const o1 = getOutIdx(topS, next);
    const b0 = getInIdx(topS, i);
    const b1 = getInIdx(topS, next);
    // Upward normal
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
