import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { HerringboneGearParams, GeneratedMeshResult } from './types';
import {
  computeInvoluteGear2D,
  generateBore2D,
  computeMeshVolume,
  estimateWeightGrams,
} from '../utils/meshMath';

/**
 * Defensive contour winding check:
 * - Outer boundary contour MUST be Counter-Clockwise (CCW).
 * - Inner hole contour (bore) MUST be Clockwise (CW).
 */
function ensureWinding(points: THREE.Vector2[], clockwise: boolean): THREE.Vector2[] {
  const isCW = THREE.ShapeUtils.isClockWise(points);
  return isCW === clockwise ? points : [...points].reverse();
}

/**
 * Generates a watertight, mathematically precise Herringbone (Double-Helical) Gear.
 * Features:
 * - True involute tooth profile with smooth flanks and multi-point root fillets
 * - Opposing helix angles on top/bottom halves forming a chevron apex at the center plane
 * - Configurable bore: Round, D-Shaft, or Hexagonal with 3D-printer tolerance offset
 * - 45 deg lead-in entry chamfers on top and bottom bore openings for smooth shaft insertion
 * - 100% closed 2-manifold mesh with outward-facing normals
 * - Viewport shading fixed with toCreasedNormals (30 deg)
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

  // 1. Compute 2D gear profile (outer boundary contour MUST be CCW)
  const gearMath = computeInvoluteGear2D(module, toothCount, pressureAngle, 4);
  const outerProfile2D = ensureWinding(gearMath.profilePoints, false);
  const numOuterPoints = outerProfile2D.length;

  // Max safe bore radius is rootRadius minus rim margin (at least 1.5 * module)
  const maxSafeBoreDia = Math.max(0, (gearMath.rootRadius - 1.5 * module) * 2);
  const actualBoreDia = Math.min(params.boreDiameter, maxSafeBoreDia);
  const hasBore = actualBoreDia > 1.0;

  // 2. Compute 2D bore profile (inner hole contour MUST be CW)
  let boreProfile2D: THREE.Vector2[] = [];
  let chamferBoreProfile2D: THREE.Vector2[] = [];
  let numBorePoints = 0;
  const chamferSize = hasBore
    ? Math.max(0.4, Math.min(0.8, actualBoreDia * 0.12, faceWidth * 0.08))
    : 0;

  if (hasBore) {
    const rawBore = generateBore2D(
      boreType,
      actualBoreDia,
      params.dShaftFlatOffset,
      printer_compensation,
      32
    );
    boreProfile2D = ensureWinding(rawBore, true);
    numBorePoints = boreProfile2D.length;

    // 45 deg lead-in entry chamfer bore profile (scaled outward by chamferSize)
    chamferBoreProfile2D = boreProfile2D.map((p) => {
      const len = p.length();
      return len > 0.001
        ? p.clone().multiplyScalar((len + chamferSize) / len)
        : p.clone();
    });
  }

  // 3. Slices along Z axis
  // Ensure slice count is an odd integer (slicesPerHalf * 2 + 1) so that a slice lands exactly at z = 0
  const halfWidth = faceWidth / 2;
  const slicesPerHalf = 12; // 24 slices total across gear height
  const numSlices = slicesPerHalf * 2 + 1; // 25 slices: includes bottom, center (0), and top

  // Pre-calculate z values with dedicated 45 deg chamfer planes at (-halfWidth + chamferSize) and (+halfWidth - chamferSize)
  const zVals: number[] = [];
  zVals.push(-halfWidth);
  zVals.push(-halfWidth + chamferSize);
  for (let i = 2; i <= slicesPerHalf; i++) {
    const frac = (i - 1) / (slicesPerHalf - 1);
    zVals.push((-halfWidth + chamferSize) + frac * (0 - (-halfWidth + chamferSize)));
  }
  for (let i = 1; i <= slicesPerHalf - 2; i++) {
    const frac = i / (slicesPerHalf - 1);
    zVals.push(0 + frac * (halfWidth - chamferSize));
  }
  zVals.push(halfWidth - chamferSize);
  zVals.push(halfWidth);

  // Helix twist calculation: twist rate = tan(helixAngle) / pitchRadius
  const helixAngleRad = (helixAngle * Math.PI) / 180;
  const twistRate = Math.tan(helixAngleRad) / gearMath.pitchRadius;

  const positions: number[] = [];
  const indices: number[] = [];

  // Track vertex offsets for each slice
  // Each slice k has numOuterPoints + (hasBore ? numBorePoints : 0) vertices
  const vertsPerSlice = numOuterPoints + (hasBore ? numBorePoints : 0);

  for (let s = 0; s < numSlices; s++) {
    const z = zVals[s];

    // Herringbone chevron twist:
    // Bottom half (z < 0): twist = z * twistRate
    // Top half (z >= 0): twist = -z * twistRate
    // At z = 0, twist is exactly 0, forming the sharp chevron V apex
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

    // Bore vertices for this slice (with 45 deg entry chamfer at top & bottom caps)
    if (hasBore) {
      const isCapSlice = s === 0 || s === numSlices - 1;
      const activeBore = isCapSlice ? chamferBoreProfile2D : boreProfile2D;
      for (let i = 0; i < numBorePoints; i++) {
        const bp = activeBore[i];
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

        // With CW bore contour, facing inward toward shaft center:
        indices.push(b00, b10, b11);
        indices.push(b00, b11, b01);
      }
    }
  }

  // 6. Triangulate Bottom Cap (slice 0, z = -halfWidth)
  const bottomTwist = -halfWidth * twistRate;
  const cosBot = Math.cos(bottomTwist);
  const sinBot = Math.sin(bottomTwist);
  const botOuter2D = ensureWinding(
    outerProfile2D.map(
      (p) => new THREE.Vector2(p.x * cosBot - p.y * sinBot, p.x * sinBot + p.y * cosBot)
    ),
    false
  );

  let bottomHoles: THREE.Vector2[][] = [];
  if (hasBore) {
    bottomHoles = [ensureWinding(chamferBoreProfile2D, true)];
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
  const topOuter2D = ensureWinding(
    outerProfile2D.map(
      (p) => new THREE.Vector2(p.x * cosTop - p.y * sinTop, p.x * sinTop + p.y * cosTop)
    ),
    false
  );

  let topHoles: THREE.Vector2[][] = [];
  if (hasBore) {
    topHoles = [ensureWinding(chamferBoreProfile2D, true)];
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
  const rawGeometry = new THREE.BufferGeometry();
  rawGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  rawGeometry.setIndex(indices);
  rawGeometry.computeVertexNormals();

  // Apply toCreasedNormals (30 deg) to preserve sharp transitions at tooth flanks and caps
  const finalGeometry = toCreasedNormals(rawGeometry, THREE.MathUtils.degToRad(30));
  finalGeometry.computeBoundingBox();

  const bbox = finalGeometry.boundingBox || new THREE.Box3();
  const dimensions = {
    x: Number((bbox.max.x - bbox.min.x).toFixed(2)),
    y: Number((bbox.max.y - bbox.min.y).toFixed(2)),
    z: Number((bbox.max.z - bbox.min.z).toFixed(2)),
  };

  const volume = computeMeshVolume(finalGeometry);
  const estimatedPrintWeightGrams = estimateWeightGrams(volume, 0.2);

  const posAttr = finalGeometry.attributes.position;
  const index = finalGeometry.index;
  const triangleCount = index ? index.count / 3 : posAttr.count / 3;

  return {
    geometry: finalGeometry,
    dimensions,
    triangles: triangleCount,
    vertices: posAttr.count,
    estimatedPrintWeightGrams,
  };
}
