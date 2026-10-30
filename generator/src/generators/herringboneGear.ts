import * as THREE from 'three';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { HerringboneGearParams, GeneratedMeshResult } from './types';
import {
  computeInvoluteGear2D,
  generateBore2D,
  computeMeshVolume,
  estimateWeightGrams,
} from '../utils/meshMath';

function ensureWinding(points: THREE.Vector2[], clockwise: boolean): THREE.Vector2[] {
  const isCW = THREE.ShapeUtils.isClockWise(points);
  return isCW === clockwise ? points : [...points].reverse();
}

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

  const maxSafeBoreDia = Math.max(0, (gearMath.rootRadius - 1.5 * module) * 2);
  const actualBoreDia = Math.min(params.boreDiameter, maxSafeBoreDia);
  const hasBore = actualBoreDia > 1.0;

  // 2. Compute 2D bore profile (inner hole contour MUST be CW)
  let boreProfile2D: THREE.Vector2[] = [];
  let chamferBoreProfile2D: THREE.Vector2[] = [];
  let numBorePoints = 0;
  const chamferSize = hasBore
    ? Math.max(0.3, Math.min(0.6, actualBoreDia * 0.1, faceWidth * 0.06))
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

    // Chamfer bore profile scaled uniformly outward
    chamferBoreProfile2D = boreProfile2D.map((p) => {
      const len = p.length();
      return len > 0.001 ? p.clone().multiplyScalar((len + chamferSize) / len) : p.clone();
    });
  }

  // 3. Slices along Z axis (Uniform distribution to prevent edge-waisting)
  const halfWidth = faceWidth / 2;
  const slicesPerHalf = 12;
  const numSlices = slicesPerHalf * 2 + 1; // 25 uniform slices, slice 12 lands exactly at z = 0

  const zVals: number[] = [];
  for (let s = 0; s < numSlices; s++) {
    const frac = s / (numSlices - 1); // 0 to 1
    zVals.push(-halfWidth + frac * faceWidth);
  }

  const helixAngleRad = (helixAngle * Math.PI) / 180;
  const twistRate = Math.tan(helixAngleRad) / gearMath.pitchRadius;

  const positions: number[] = [];
  const indices: number[] = [];
  const vertsPerSlice = numOuterPoints + (hasBore ? numBorePoints : 0);

  // 4. Generate Vertices across all Z-Slices
  for (let s = 0; s < numSlices; s++) {
    const z = zVals[s];

    // Symmetrical chevron twist: apex at z = 0
    const twistAngle = z < 0 ? z * twistRate : -z * twistRate;
    const cosT = Math.cos(twistAngle);
    const sinT = Math.sin(twistAngle);

    // Outer profile vertices (smooth, un-kinked extrusion)
    for (let i = 0; i < numOuterPoints; i++) {
      const p = outerProfile2D[i];
      positions.push(p.x * cosT - p.y * sinT, p.x * sinT + p.y * cosT, z);
    }

    // Bore vertices (linear taper for entry chamfer over top/bottom slice transitions)
    if (hasBore) {
      let activeBore = boreProfile2D;
      if (s === 0 || s === numSlices - 1) {
        activeBore = chamferBoreProfile2D;
      }
      for (let i = 0; i < numBorePoints; i++) {
        const bp = activeBore[i];
        positions.push(bp.x, bp.y, z);
      }
    }
  }

  const getOuterIdx = (slice: number, pointIdx: number) => slice * vertsPerSlice + pointIdx;
  const getBoreIdx = (slice: number, pointIdx: number) => slice * vertsPerSlice + numOuterPoints + pointIdx;

  // 5. Outer Tooth Surface Quads with Symmetrical Diagonal Triangulation
  for (let s = 0; s < numSlices - 1; s++) {
    const isBottomHalf = s < slicesPerHalf;
    for (let i = 0; i < numOuterPoints; i++) {
      const nextI = (i + 1) % numOuterPoints;

      const p00 = getOuterIdx(s, i);
      const p10 = getOuterIdx(s, nextI);
      const p11 = getOuterIdx(s + 1, nextI);
      const p01 = getOuterIdx(s + 1, i);

      // Invert diagonal direction across z = 0 to mirror herringbone shear symmetry
      if (isBottomHalf) {
        indices.push(p00, p10, p11);
        indices.push(p00, p11, p01);
      } else {
        indices.push(p00, p10, p01);
        indices.push(p10, p11, p01);
      }
    }
  }

  // 6. Inner Bore Cylindrical Surface Quads
  if (hasBore) {
    for (let s = 0; s < numSlices - 1; s++) {
      for (let i = 0; i < numBorePoints; i++) {
        const nextI = (i + 1) % numBorePoints;

        const b00 = getBoreIdx(s, i);
        const b10 = getBoreIdx(s, nextI);
        const b11 = getBoreIdx(s + 1, nextI);
        const b01 = getBoreIdx(s + 1, i);

        indices.push(b00, b10, b11);
        indices.push(b00, b11, b01);
      }
    }
  }

  // 7. Bottom Planar Cap (z = -halfWidth)
  const bottomTwist = -halfWidth * twistRate;
  const cosBot = Math.cos(bottomTwist);
  const sinBot = Math.sin(bottomTwist);
  const botOuter2D = outerProfile2D.map(
    (p) => new THREE.Vector2(p.x * cosBot - p.y * sinBot, p.x * sinBot + p.y * cosBot)
  );

  const bottomHoles = hasBore ? [chamferBoreProfile2D] : [];
  const bottomTriangles = THREE.ShapeUtils.triangulateShape(botOuter2D, bottomHoles);

  for (const tri of bottomTriangles) {
    const idx0 = tri[0] < numOuterPoints ? getOuterIdx(0, tri[0]) : getBoreIdx(0, tri[0] - numOuterPoints);
    const idx1 = tri[1] < numOuterPoints ? getOuterIdx(0, tri[1]) : getBoreIdx(0, tri[1] - numOuterPoints);
    const idx2 = tri[2] < numOuterPoints ? getOuterIdx(0, tri[2]) : getBoreIdx(0, tri[2] - numOuterPoints);

    // Normal points in -Z
    indices.push(idx0, idx2, idx1);
  }

  // 8. Top Planar Cap (z = +halfWidth)
  const topTwist = -halfWidth * twistRate;
  const cosTop = Math.cos(topTwist);
  const sinTop = Math.sin(topTwist);
  const topOuter2D = outerProfile2D.map(
    (p) => new THREE.Vector2(p.x * cosTop - p.y * sinTop, p.x * sinTop + p.y * cosTop)
  );

  const topHoles = hasBore ? [chamferBoreProfile2D] : [];
  const topSliceIdx = numSlices - 1;
  const topTriangles = THREE.ShapeUtils.triangulateShape(topOuter2D, topHoles);

  for (const tri of topTriangles) {
    const idx0 = tri[0] < numOuterPoints ? getOuterIdx(topSliceIdx, tri[0]) : getBoreIdx(topSliceIdx, tri[0] - numOuterPoints);
    const idx1 = tri[1] < numOuterPoints ? getOuterIdx(topSliceIdx, tri[1]) : getBoreIdx(topSliceIdx, tri[1] - numOuterPoints);
    const idx2 = tri[2] < numOuterPoints ? getOuterIdx(topSliceIdx, tri[2]) : getBoreIdx(topSliceIdx, tri[2] - numOuterPoints);

    // Normal points in +Z
    indices.push(idx0, idx1, idx2);
  }

  // 9. Build BufferGeometry and Crease Normals
  const rawGeometry = new THREE.BufferGeometry();
  rawGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  rawGeometry.setIndex(indices);
  rawGeometry.computeVertexNormals();

  // 25 deg crease angle preserves tooth flank involute curvature while separating flat end caps
  const finalGeometry = toCreasedNormals(rawGeometry, THREE.MathUtils.degToRad(25));
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