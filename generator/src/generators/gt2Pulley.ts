import * as THREE from 'three';
import { GT2PulleyParams, GeneratedMeshResult } from './types';
import { generateBore2D, computeMeshVolume, estimateWeightGrams, triangulateCap } from '../utils/meshMath';

/**
 * Computes a precise 2D curvilinear tooth radius for a GT2 belt pulley at a given angle.
 * GT2 belts feature circular arc tooth troughs and rounded crests.
 */
function getGT2Radius(
  angle: number,
  toothCount: number,
  outerRadius: number,
  rootRadius: number
): number {
  const toothPitchAngle = (2 * Math.PI) / toothCount;
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const toothIndex = Math.floor(a / toothPitchAngle);
  const localAngle = a - (toothIndex + 0.5) * toothPitchAngle;

  const halfTooth = toothPitchAngle / 2;
  const normalizedDist = Math.abs(localAngle) / halfTooth;

  const depth = outerRadius - rootRadius;
  const flankFactor = Math.pow(Math.sin(normalizedDist * Math.PI * 0.5), 1.6);
  return rootRadius + depth * flankFactor;
}


/**
 * Generates a watertight, mathematically lofted GT2 Timing Belt Pulley.
 */
export function generateGT2Pulley(params: GT2PulleyParams): GeneratedMeshResult {
  const {
    toothCount,
    pitch,
    beltWidth,
    boreDiameter,
    boreType,
    dShaftFlatOffset,
    flangeType,
    flangeHeight,
    flangeThickness,
    hasHub,
    hubDiameter,
    hubHeight,
    printer_compensation,
  } = params;

  // 1. Core Tooth Math
  const safeToothCount = Math.max(12, toothCount);
  const pitchRadius = (safeToothCount * pitch) / (2 * Math.PI);
  const pld = pitch === 3.0 ? 0.38 : 0.254;
  const outerRadius = Math.max(1.0, pitchRadius - pld);
  const toothDepth = pitch === 3.0 ? 1.15 : 0.75;
  const rootRadius = Math.max(0.5, outerRadius - toothDepth);

  const faceWidth = Math.max(4.0, beltWidth + 1.5);
  const actualFlangeHeight = Math.max(1.0, flangeHeight);
  const flangeRadius = outerRadius + actualFlangeHeight;
  const actualFlangeThick = Math.max(0.8, flangeThickness);

  const hasBottomFlange = flangeType === 'both' || flangeType === 'bottom';
  const hasTopFlange = flangeType === 'both' || flangeType === 'top';

  const actualHubDiameter = hasHub ? Math.max(outerRadius * 1.2, hubDiameter) : 0;
  const hubRadius = actualHubDiameter / 2;
  const actualHubHeight = hasHub ? Math.max(3.0, hubHeight) : 0;

  const maxSafeBoreDia = Math.max(0, (rootRadius - 1.5) * 2);
  const actualBoreDia = Math.min(boreDiameter, maxSafeBoreDia);
  const hasBore = actualBoreDia > 1.0;

  // 2. Discretization around perimeter
  const samplesPerTooth = 8;
  const numOuterPoints = safeToothCount * samplesPerTooth;

  const angles: number[] = [];
  for (let i = 0; i < numOuterPoints; i++) {
    angles.push((i / numOuterPoints) * Math.PI * 2);
  }

  const toothProfile2D: THREE.Vector2[] = angles.map((a) => {
    const r = getGT2Radius(a, safeToothCount, outerRadius, rootRadius);
    return new THREE.Vector2(r * Math.cos(a), r * Math.sin(a));
  });

  const flangeProfile2D: THREE.Vector2[] = angles.map((a) => {
    return new THREE.Vector2(flangeRadius * Math.cos(a), flangeRadius * Math.sin(a));
  });

  const hubProfile2D: THREE.Vector2[] = angles.map((a) => {
    return new THREE.Vector2(hubRadius * Math.cos(a), hubRadius * Math.sin(a));
  });

  let boreProfile2D: THREE.Vector2[] = [];
  let numBorePoints = 0;
  if (hasBore) {
    boreProfile2D = generateBore2D(
      boreType,
      actualBoreDia,
      dShaftFlatOffset,
      printer_compensation,
      numOuterPoints
    );
    numBorePoints = boreProfile2D.length;
  }

  // 3. Define Z-slice layers from bottom to top
  interface SliceDef {
    z: number;
    profile: THREE.Vector2[];
  }

  const slices: SliceDef[] = [];
  let currentZ = 0;

  // Bottom Flange
  if (hasBottomFlange) {
    slices.push({ z: currentZ, profile: flangeProfile2D });
    currentZ += actualFlangeThick;
    slices.push({ z: currentZ, profile: flangeProfile2D });
    slices.push({ z: currentZ, profile: toothProfile2D });
  } else {
    slices.push({ z: currentZ, profile: toothProfile2D });
  }

  // Tooth Face Width
  const toothSegments = 6;
  const toothStartZ = currentZ;
  for (let s = 1; s <= toothSegments; s++) {
    const z = toothStartZ + (s / toothSegments) * faceWidth;
    slices.push({ z, profile: toothProfile2D });
  }
  currentZ += faceWidth;

  // Top Flange
  if (hasTopFlange) {
    slices.push({ z: currentZ, profile: flangeProfile2D });
    currentZ += actualFlangeThick;
    slices.push({ z: currentZ, profile: flangeProfile2D });
  }

  // Hub Collar
  if (hasHub) {
    slices.push({ z: currentZ, profile: hubProfile2D });
    currentZ += actualHubHeight;
    slices.push({ z: currentZ, profile: hubProfile2D });
  }

  // 4. Assemble Positions and Index Buffers
  const positions: number[] = [];
  const indices: number[] = [];
  const totalSlices = slices.length;
  const vertsPerSlice = numOuterPoints + (hasBore ? numBorePoints : 0);

  for (let s = 0; s < totalSlices; s++) {
    const { z, profile } = slices[s];
    for (let i = 0; i < numOuterPoints; i++) {
      positions.push(profile[i].x, profile[i].y, z);
    }
    if (hasBore) {
      for (let i = 0; i < numBorePoints; i++) {
        positions.push(boreProfile2D[i].x, boreProfile2D[i].y, z);
      }
    }
  }

  const getOuterIdx = (slice: number, pointIdx: number) => slice * vertsPerSlice + pointIdx;
  const getBoreIdx = (slice: number, pointIdx: number) => slice * vertsPerSlice + numOuterPoints + pointIdx;

  // 5. Connect Slices with Quads (Vertical walls and horizontal step shoulders)
  for (let s = 0; s < totalSlices - 1; s++) {
    const zCurr = slices[s].z;
    const zNext = slices[s + 1].z;
    const isStepShoulder = Math.abs(zCurr - zNext) < 0.0001;

    // Outer wall / shoulder quads
    for (let i = 0; i < numOuterPoints; i++) {
      const nextI = (i + 1) % numOuterPoints;

      const p00 = getOuterIdx(s, i);
      const p10 = getOuterIdx(s, nextI);
      const p11 = getOuterIdx(s + 1, nextI);
      const p01 = getOuterIdx(s + 1, i);

      if (isStepShoulder) {
        const rCurr = slices[s].profile[i].length();
        const rNext = slices[s + 1].profile[i].length();
        if (rCurr > rNext) {
          indices.push(p00, p10, p11);
          indices.push(p00, p11, p01);
        } else {
          indices.push(p00, p10, p01);
          indices.push(p10, p11, p01);
        }
      } else {
        indices.push(p00, p10, p11);
        indices.push(p00, p11, p01);
      }
    }

    // Inner bore wall quads
    if (hasBore && !isStepShoulder) {
      for (let i = 0; i < numBorePoints; i++) {
        const nextI = (i + 1) % numBorePoints;

        const b00 = getBoreIdx(s, i);
        const b10 = getBoreIdx(s, nextI);
        const b11 = getBoreIdx(s + 1, nextI);
        const b01 = getBoreIdx(s + 1, i);

        indices.push(b00, b11, b10);
        indices.push(b00, b01, b11);
      }
    }
  }

  // 6. Triangulate Flat Bottom Cap (slice 0, facing -Z)
  // Duplicate cap vertices to prevent normal blending across sharp 90-degree edges
  const botOuter = slices[0].profile;
  const botHoles = hasBore ? boreProfile2D : null;
  const botTris = triangulateCap(botOuter, botHoles);
  const botCapBaseIdx = positions.length / 3;

  for (let i = 0; i < numOuterPoints; i++) {
    positions.push(botOuter[i].x, botOuter[i].y, slices[0].z);
  }
  if (hasBore) {
    for (let i = 0; i < numBorePoints; i++) {
      positions.push(boreProfile2D[i].x, boreProfile2D[i].y, slices[0].z);
    }
  }

  for (const [i0, i1, i2] of botTris) {
    indices.push(botCapBaseIdx + i0, botCapBaseIdx + i2, botCapBaseIdx + i1);
  }

  // 7. Triangulate Flat Top Cap (slice totalSlices - 1, facing +Z)
  const topSliceIdx = totalSlices - 1;
  const topOuter = slices[topSliceIdx].profile;
  const topHoles = hasBore ? boreProfile2D : null;
  const topTris = triangulateCap(topOuter, topHoles);
  const topCapBaseIdx = positions.length / 3;

  for (let i = 0; i < numOuterPoints; i++) {
    positions.push(topOuter[i].x, topOuter[i].y, slices[topSliceIdx].z);
  }
  if (hasBore) {
    for (let i = 0; i < numBorePoints; i++) {
      positions.push(boreProfile2D[i].x, boreProfile2D[i].y, slices[topSliceIdx].z);
    }
  }

  for (const [i0, i1, i2] of topTris) {
    indices.push(topCapBaseIdx + i0, topCapBaseIdx + i1, topCapBaseIdx + i2);
  }

  // 8. Construct BufferGeometry and Compute Metadata
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