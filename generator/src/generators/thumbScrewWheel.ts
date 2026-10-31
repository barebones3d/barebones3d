import * as THREE from 'three';
import {
  ThumbScrewWheelParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import {
  generateScallopedPerimeter2D,
  generateHexNut2D,
  computeMeshVolume,
  estimateWeightGrams,
  triangulateCap,
} from '../utils/meshMath';

/**
 * Standard metric hex nut width-across-flats (mm):
 * M3: 5.5, M4: 7.0, M5: 8.0, M6: 10.0, M8: 13.0
 */
const NUT_FLAT_WIDTHS: Record<string, number> = {
  M2: 4.0,
  'M2.5': 5.0,
  M3: 5.5,
  M4: 7.0,
  M5: 8.0,
  M6: 10.0,
  M8: 13.0,
};

/**
 * Generates an Ergonomic Scalloped Thumb Screw Wheel using Mathematical Slice-Lofting:
 * - Scalloped wave finger lobes designed for maximum hand torque without hot-spots
 * - Embedded hex nut or socket cap head press-fit pocket
 * - Coaxial through-hole for fastener shank
 * - Top comfort chamfer/dome
 * - 100% closed, watertight 2-manifold mesh
 */
export function generateThumbScrewWheel(params: ThumbScrewWheelParams): GeneratedMeshResult {
  const {
    outerDiameter,
    thickness,
    nutSize,
    printer_compensation = 0.15,
  } = params;

  const actualLobeCount = params.lobeCount || (params as any).scallopCount || 6;
  const actualLobeDepth = params.lobeDepth || (params as any).scallopDepth || 2.0;
  const actualPocketDepth = Math.min(params.pocketDepth || (params as any).nutTrapDepth || 4.0, (params.thickness || 8) - 2.0);
  const actualPocketType = params.pocketType || 'hex-nut';

  const baseRadius = outerDiameter / 2 - actualLobeDepth;
  const T = thickness;
  const numOuter = 72;

  // Outer scalloped perimeter
  const outerProfile = generateScallopedPerimeter2D(baseRadius, actualLobeCount, actualLobeDepth, numOuter);

  // Fastener pocket geometry
  const nutFlat = (NUT_FLAT_WIDTHS[nutSize] || 8.0) + printer_compensation;
  const throughHoleDia = (SCREW_CLEARANCE_DIAMETERS[nutSize] || 5.5) + printer_compensation;
  const throughHoleRadius = throughHoleDia / 2;

  // Hex nut pocket profile or round socket pocket profile (both sampled to 48 points)
  const numBore = 48;

  const getPocketPoints = (radiusOrNut: number, isHex: boolean): THREE.Vector2[] => {
    const pts: THREE.Vector2[] = [];
    if (isHex) {
      // 6-sided polygon resampled to numBore points
      const hexVerts = generateHexNut2D(nutFlat, 0);
      for (let i = 0; i < numBore; i++) {
        const segFrac = (i / numBore) * 6;
        const side = Math.floor(segFrac);
        const frac = segFrac - side;
        const pA = hexVerts[side];
        const pB = hexVerts[(side + 1) % 6];
        pts.push(new THREE.Vector2(pA.x + (pB.x - pA.x) * frac, pA.y + (pB.y - pA.y) * frac));
      }
    } else {
      // Round socket head cap recess
      for (let i = 0; i < numBore; i++) {
        const angle = (i / numBore) * Math.PI * 2;
        pts.push(new THREE.Vector2(radiusOrNut * Math.cos(angle), radiusOrNut * Math.sin(angle)));
      }
    }
    return pts;
  };

  const throughHoleProfile: THREE.Vector2[] = [];
  for (let i = 0; i < numBore; i++) {
    const angle = (i / numBore) * Math.PI * 2;
    throughHoleProfile.push(new THREE.Vector2(throughHoleRadius * Math.cos(angle), throughHoleRadius * Math.sin(angle)));
  }

  const socketHeadRadius = (nutFlat * 1.1) / 2;
  const hexNutProfile = getPocketPoints(socketHeadRadius, actualPocketType === 'hex-nut');

  const positions: number[] = [];
  const indices: number[] = [];

  const addSlice = (profile2D: THREE.Vector2[], bore2D: THREE.Vector2[], z: number) => {
    for (const p of profile2D) {
      positions.push(p.x, p.y, z);
    }
    for (const b of bore2D) {
      positions.push(b.x, b.y, z);
    }
  };

  const getOuterIdx = (slice: number, pt: number) => slice * (numOuter + numBore) + pt;
  const getBoreIdx = (slice: number, pt: number) => slice * (numOuter + numBore) + numOuter + pt;

  const loftSlices = (sA: number, sB: number) => {
    // Outer shell (outward normal +r)
    for (let i = 0; i < numOuter; i++) {
      const next = (i + 1) % numOuter;
      const a0 = getOuterIdx(sA, i);
      const a1 = getOuterIdx(sA, next);
      const b0 = getOuterIdx(sB, i);
      const b1 = getOuterIdx(sB, next);
      indices.push(a0, a1, b0);
      indices.push(a1, b1, b0);
    }
    // Inner bore shell (inward normal -r into bore void)
    for (let i = 0; i < numBore; i++) {
      const next = (i + 1) % numBore;
      const a0 = getBoreIdx(sA, i);
      const a1 = getBoreIdx(sA, next);
      const b0 = getBoreIdx(sB, i);
      const b1 = getBoreIdx(sB, next);
      indices.push(a0, b0, a1);
      indices.push(a1, b0, b1);
    }
  };

  // Slices:
  // Z=0: Bottom face (with hex nut pocket)
  // Z=actualPocketDepth: Hex nut pocket top / shoulder step
  // Z=actualPocketDepth + step: Through hole start
  // Z=T - chamfer: Main body top
  // Z=T: Chamfered top crown
  const chamferH = Math.min(1.5, T * 0.15);
  let sliceCount = 0;

  // 1. Z=0
  addSlice(outerProfile, hexNutProfile, 0);
  sliceCount++;

  // 2. Z=actualPocketDepth (bottom pocket zone)
  addSlice(outerProfile, hexNutProfile, actualPocketDepth);
  sliceCount++;
  loftSlices(0, 1);

  // 3. Step transition into through-hole
  addSlice(outerProfile, throughHoleProfile, actualPocketDepth + 0.01);
  sliceCount++;
  loftSlices(1, 2);

  // 4. Z = T - chamferH
  addSlice(outerProfile, throughHoleProfile, T - chamferH);
  sliceCount++;
  loftSlices(2, 3);

  // 5. Z = T (Top chamfered crown: 92% scale on outer profile)
  const chamferOuter = outerProfile.map((p) => new THREE.Vector2(p.x * 0.92, p.y * 0.92));
  addSlice(chamferOuter, throughHoleProfile, T);
  sliceCount++;
  loftSlices(3, 4);

  // Bottom cap at slice 0 (annulus between outerProfile and hexNutProfile, facing -Z)
  const bottomTris = triangulateCap(outerProfile, hexNutProfile);
  const botCapBaseIdx = positions.length / 3;

  for (let i = 0; i < numOuter; i++) {
    positions.push(outerProfile[i].x, outerProfile[i].y, 0);
  }
  for (let i = 0; i < numBore; i++) {
    positions.push(hexNutProfile[i].x, hexNutProfile[i].y, 0);
  }

  for (const [i0, i1, i2] of bottomTris) {
    indices.push(botCapBaseIdx + i0, botCapBaseIdx + i2, botCapBaseIdx + i1);
  }

  // Top cap at slice 4 (annulus between chamferOuter and throughHoleProfile, facing +Z)
  const topTris = triangulateCap(chamferOuter, throughHoleProfile);
  const topCapBaseIdx = positions.length / 3;

  for (let i = 0; i < numOuter; i++) {
    positions.push(chamferOuter[i].x, chamferOuter[i].y, T);
  }
  for (let i = 0; i < numBore; i++) {
    positions.push(throughHoleProfile[i].x, throughHoleProfile[i].y, T);
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
