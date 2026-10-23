import * as THREE from 'three';
import { HerringboneGearParams, GeneratedMeshResult } from './types';
import {
  computeInvoluteGear2D,
  generateBore2D,
  computeMeshVolume,
  estimateWeightGrams,
} from '../utils/meshMath';

/**
 * Generates a watertight, mathematically precise Herringbone (Double-Helical) Gear.
 * Features:
 * - True involute tooth profile with smooth flanks and root fillets
 * - Opposing helix angles on top/bottom halves forming a chevron apex at the center plane
 * - Configurable bore: Round, D-Shaft, or Hexagonal with 3D-printer tolerance offset
 * - 100% closed 2-manifold mesh with outward-facing normals
 */
export function generateHerringboneGear(params: HerringboneGearParams): GeneratedMeshResult {
  const {
    module,
    toothCount,
    pressureAngle,
    helixAngle,
    faceWidth,
    boreType,
    printer_compensation,
  } = params;

  // 1. Compute 2D gear profile
  const gearMath = computeInvoluteGear2D(module, toothCount, pressureAngle, 4);
  const outerProfile2D = gearMath.profilePoints;
  const numOuterPoints = outerProfile2D.length;

  // Max safe bore radius is rootRadius minus rim margin (at least 1.5 * module)
  const maxSafeBoreDia = Math.max(0, (gearMath.rootRadius - 1.5 * module) * 2);
  const actualBoreDia = Math.min(params.boreDiameter, maxSafeBoreDia);
  const hasBore = actualBoreDia > 1.0;

  // 2. Compute 2D bore profile (if bore is active)
  let boreProfile2D: THREE.Vector2[] = [];
  let numBorePoints = 0;
  if (hasBore) {
    boreProfile2D = generateBore2D(
      boreType,
      actualBoreDia,
      params.dShaftFlatOffset,
      printer_compensation,
      32
    );
    numBorePoints = boreProfile2D.length;
  }

  // 3. Slices along Z axis
  const halfWidth = faceWidth / 2;
  const slicesPerHalf = 12; // 24 slices total across gear height
  const numSlices = slicesPerHalf * 2 + 1; // includes bottom, center (0), and top

  // Helix twist calculation: twist rate = tan(helixAngle) / pitchRadius
  const helixAngleRad = (helixAngle * Math.PI) / 180;
  const twistRate = Math.tan(helixAngleRad) / gearMath.pitchRadius;

  const positions: number[] = [];
  const indices: number[] = [];

  // Track vertex offsets for each slice
  // Each slice k has numOuterPoints + (hasBore ? numBorePoints : 0) vertices
  const vertsPerSlice = numOuterPoints + (hasBore ? numBorePoints : 0);

  for (let s = 0; s < numSlices; s++) {
    // z ranges from -halfWidth to +halfWidth
    const frac = s / (numSlices - 1);
    const z = -halfWidth + frac * faceWidth;

    // Herringbone chevron twist:
    // Bottom half (z < 0): twist = z * twistRate
    // Top half (z >= 0): twist = -z * twistRate
    // At z = 0, twist is 0, forming the chevron V apex
    const twistAngle = z < 0 ? z * twistRate : -z * twistRate;

    const cosT = Math.cos(twistAngle);
    const sinT = Math.sin(twistAngle);

    // Outer gear profile vertices for this slice
    for (let i = 0; i < numOuterPoints; i++) {
      const p = outerProfile2D[i];
      const rx = p.x * cosT - p.y * sinT;
      const ry = p.x * sinT + p.y * cosT;
      positions.push(rx, ry, z);
    }

    // Bore vertices for this slice (straight drive shaft, un-twisted)
    if (hasBore) {
      for (let i = 0; i < numBorePoints; i++) {
        const bp = boreProfile2D[i];
        positions.push(bp.x, bp.y, z);
      }
    }
  }

  // Helper to get vertex index in slice s
  const getOuterIdx = (slice: number, pointIdx: number) => {
    return slice * vertsPerSlice + pointIdx;
  };
  const getBoreIdx = (slice: number, pointIdx: number) => {
    return slice * vertsPerSlice + numOuterPoints + pointIdx;
  };

  // 4. Generate Outer Tooth Surface Quads (between consecutive slices)
  for (let s = 0; s < numSlices - 1; s++) {
    for (let i = 0; i < numOuterPoints; i++) {
      const nextI = (i + 1) % numOuterPoints;

      const p00 = getOuterIdx(s, i);
      const p10 = getOuterIdx(s, nextI);
      const p11 = getOuterIdx(s + 1, nextI);
      const p01 = getOuterIdx(s + 1, i);

      // CCW viewed from outside: (p00, p10, p11) and (p00, p11, p01)
      indices.push(p00, p10, p11);
      indices.push(p00, p11, p01);
    }
  }

  // 5. Generate Inner Bore Surface Quads (between consecutive slices)
  if (hasBore) {
    for (let s = 0; s < numSlices - 1; s++) {
      for (let i = 0; i < numBorePoints; i++) {
        const nextI = (i + 1) % numBorePoints;

        const b00 = getBoreIdx(s, i);
        const b10 = getBoreIdx(s, nextI);
        const b11 = getBoreIdx(s + 1, nextI);
        const b01 = getBoreIdx(s + 1, i);

        // Facing inward toward bore center: (b00, b11, b10) and (b00, b01, b11)
        indices.push(b00, b11, b10);
        indices.push(b00, b01, b11);
      }
    }
  }

  // 6. Triangulate Bottom Cap (slice 0, z = -halfWidth)
  // Outer profile is rotated by bottom twist angle
  const bottomTwist = -halfWidth * twistRate;
  const cosBot = Math.cos(bottomTwist);
  const sinBot = Math.sin(bottomTwist);
  const botOuter2D = outerProfile2D.map(
    (p) => new THREE.Vector2(p.x * cosBot - p.y * sinBot, p.x * sinBot + p.y * cosBot)
  );

  let bottomHoles: THREE.Vector2[][] = [];
  if (hasBore) {
    bottomHoles = [boreProfile2D];
  }

  const bottomTriangles = THREE.ShapeUtils.triangulateShape(botOuter2D, bottomHoles);
  // Bottom cap normal must point in -Z direction: reverse triangle winding
  for (const tri of bottomTriangles) {
    const idx0 = tri[0] < numOuterPoints ? getOuterIdx(0, tri[0]) : getBoreIdx(0, tri[0] - numOuterPoints);
    const idx1 = tri[1] < numOuterPoints ? getOuterIdx(0, tri[1]) : getBoreIdx(0, tri[1] - numOuterPoints);
    const idx2 = tri[2] < numOuterPoints ? getOuterIdx(0, tri[2]) : getBoreIdx(0, tri[2] - numOuterPoints);

    indices.push(idx0, idx2, idx1);
  }

  // 7. Triangulate Top Cap (slice numSlices - 1, z = +halfWidth)
  const topTwist = -halfWidth * twistRate; // (-z * twistRate at z = +halfWidth)
  const cosTop = Math.cos(topTwist);
  const sinTop = Math.sin(topTwist);
  const topOuter2D = outerProfile2D.map(
    (p) => new THREE.Vector2(p.x * cosTop - p.y * sinTop, p.x * sinTop + p.y * cosTop)
  );

  let topHoles: THREE.Vector2[][] = [];
  if (hasBore) {
    topHoles = [boreProfile2D];
  }

  const topSliceIdx = numSlices - 1;
  const topTriangles = THREE.ShapeUtils.triangulateShape(topOuter2D, topHoles);
  // Top cap normal must point in +Z direction: standard CCW winding
  for (const tri of topTriangles) {
    const idx0 = tri[0] < numOuterPoints ? getOuterIdx(topSliceIdx, tri[0]) : getBoreIdx(topSliceIdx, tri[0] - numOuterPoints);
    const idx1 = tri[1] < numOuterPoints ? getOuterIdx(topSliceIdx, tri[1]) : getBoreIdx(topSliceIdx, tri[1] - numOuterPoints);
    const idx2 = tri[2] < numOuterPoints ? getOuterIdx(topSliceIdx, tri[2]) : getBoreIdx(topSliceIdx, tri[2] - numOuterPoints);

    indices.push(idx0, idx1, idx2);
  }

  // 8. Build Three.js BufferGeometry
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
