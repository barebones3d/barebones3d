import * as THREE from 'three';
import { WormGearParams, GeneratedMeshResult } from './types';
import {
  generateBore2D,
  computeMeshVolume,
  estimateWeightGrams,
  triangulateCap,
} from '../utils/meshMath';

/**
 * Generates an Archimedean / Trapezoidal Helical Worm Gear using Mathematical Slice-Lofting:
 * - Precise helical thread sweep with single or multi-start Archimedean trapezoidal flanks
 * - Center drive shaft bore with optional D-flat
 * - 100% closed, watertight 2-manifold quad-lofted mesh with triangulated caps
 */
export function generateWormGear(params: WormGearParams): GeneratedMeshResult {
  const {
    module,
    starts = 1,
    length,
    pitchDiameter,
    boreDiameter,
    boreType,
    dShaftFlatOffset,
    printer_compensation,
  } = params;

  const lead = Math.PI * module * starts;
  const pitchRadius = pitchDiameter / 2;
  const addendum = module;
  const dedendum = 1.25 * module;
  const tipRadius = pitchRadius + addendum;
  const rootRadius = Math.max(2.0, pitchRadius - dedendum);

  // Central bore
  const maxSafeBore = Math.max(0, (rootRadius - 1.5) * 2);
  const actualBoreDia = Math.min(boreDiameter, maxSafeBore);
  const hasBore = actualBoreDia > 1.0;

  const boreProfile = hasBore
    ? generateBore2D(boreType, actualBoreDia, dShaftFlatOffset, printer_compensation, 32)
    : [];
  const numBore = boreProfile.length;

  // Base 2D profile at z = 0
  // Circle at rootRadius with `starts` trapezoidal teeth rising to tipRadius
  const numPoints = 72;
  const baseProfile: THREE.Vector2[] = [];
  const toothPitchAngle = (Math.PI * 2) / starts;
  const halfToothAngle = (Math.PI * module) / (2 * pitchRadius); // tooth thickness at pitch line

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // Normalized angle within one start pitch
    let relAngle = angle % toothPitchAngle;
    if (relAngle > toothPitchAngle / 2) relAngle -= toothPitchAngle;

    // Check if within tooth flank
    const absRel = Math.abs(relAngle);
    let r = rootRadius;
    if (absRel < halfToothAngle * 0.45) {
      // Tip land
      r = tipRadius;
    } else if (absRel < halfToothAngle * 1.15) {
      // Trapezoidal flank slope
      const frac = (halfToothAngle * 1.15 - absRel) / (halfToothAngle * 0.7);
      r = rootRadius + (tipRadius - rootRadius) * Math.min(1.0, Math.max(0.0, frac));
    }
    baseProfile.push(new THREE.Vector2(r * Math.cos(angle), r * Math.sin(angle)));
  }

  const numOuter = baseProfile.length;
  const positions: number[] = [];
  const indices: number[] = [];

  // Slice-based lofting along Z
  const zSlices = Math.max(30, Math.ceil((length / lead) * 36));
  const zStep = length / zSlices;

  const addSlice = (z: number, twistAngle: number) => {
    const cosT = Math.cos(twistAngle);
    const sinT = Math.sin(twistAngle);

    for (const p of baseProfile) {
      positions.push(p.x * cosT - p.y * sinT, p.x * sinT + p.y * cosT, z);
    }
    if (hasBore) {
      for (const b of boreProfile) {
        positions.push(b.x, b.y, z);
      }
    }
  };

  const getOuterIdx = (slice: number, pt: number) => slice * (numOuter + numBore) + pt;
  const getBoreIdx = (slice: number, pt: number) => slice * (numOuter + numBore) + numOuter + pt;

  for (let s = 0; s <= zSlices; s++) {
    const z = s * zStep;
    const twist = (z / lead) * Math.PI * 2;
    addSlice(z, twist);

    if (s > 0) {
      const sPrev = s - 1;
      const sCurr = s;
      // Loft outer helical flank
      for (let i = 0; i < numOuter; i++) {
        const next = (i + 1) % numOuter;
        const a0 = getOuterIdx(sPrev, i);
        const a1 = getOuterIdx(sPrev, next);
        const b0 = getOuterIdx(sCurr, i);
        const b1 = getOuterIdx(sCurr, next);
        // Outer helical flank (outward normal +r)
        indices.push(a0, a1, b0);
        indices.push(a1, b1, b0);
      }
      // Loft inner bore (inward normal -r into bore void)
      if (hasBore) {
        for (let i = 0; i < numBore; i++) {
          const next = (i + 1) % numBore;
          const a0 = getBoreIdx(sPrev, i);
          const a1 = getBoreIdx(sPrev, next);
          const b0 = getBoreIdx(sCurr, i);
          const b1 = getBoreIdx(sCurr, next);
          indices.push(a0, b0, a1);
          indices.push(a1, b0, b1);
        }
      }
    }
  }

  // Bottom cap (slice 0, z = 0, facing -Z)
  const bottomHoles = hasBore ? boreProfile : null;
  const bottomTris = triangulateCap(baseProfile, bottomHoles);
  const botCapBaseIdx = positions.length / 3;

  for (let i = 0; i < numOuter; i++) {
    positions.push(baseProfile[i].x, baseProfile[i].y, 0);
  }
  if (hasBore) {
    for (let i = 0; i < numBore; i++) {
      positions.push(boreProfile[i].x, boreProfile[i].y, 0);
    }
  }

  for (const [i0, i1, i2] of bottomTris) {
    indices.push(botCapBaseIdx + i0, botCapBaseIdx + i2, botCapBaseIdx + i1);
  }

  // Top cap (last slice, z = length, facing +Z)
  const topTwist = (length / lead) * Math.PI * 2;
  const cosTop = Math.cos(topTwist);
  const sinTop = Math.sin(topTwist);
  const topOuter = baseProfile.map((p) => new THREE.Vector2(p.x * cosTop - p.y * sinTop, p.x * sinTop + p.y * cosTop));
  const topHoles = hasBore ? boreProfile : null;
  const topTris = triangulateCap(topOuter, topHoles);
  const topCapBaseIdx = positions.length / 3;

  for (let i = 0; i < numOuter; i++) {
    positions.push(topOuter[i].x, topOuter[i].y, length);
  }
  if (hasBore) {
    for (let i = 0; i < numBore; i++) {
      positions.push(boreProfile[i].x, boreProfile[i].y, length);
    }
  }

  for (const [i0, i1, i2] of topTris) {
    indices.push(topCapBaseIdx + i0, topCapBaseIdx + i1, topCapBaseIdx + i2);
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
