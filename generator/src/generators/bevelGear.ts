import * as THREE from 'three';
import { BevelGearParams, GeneratedMeshResult } from './types';
import {
  computeInvoluteGear2D,
  generateBore2D,
  computeMeshVolume,
  estimateWeightGrams,
} from '../utils/meshMath';

/**
 * Generates a precision Miter / Bevel Gear using Mathematical Slice-Lofting:
 * - Straight conical involute tooth flanks tapered from heel (pitch radius) to toe
 * - Integrated rear mounting hub collar
 * - Central shaft bore (round, D-shaft, or hex)
 * - Watertight 2-manifold lofted quad mesh with triangulated caps
 */
export function generateBevelGear(params: BevelGearParams): GeneratedMeshResult {
  const {
    module,
    toothCount,
    coneAngleDeg = 45,
    faceWidth,
    boreDiameter,
    boreType,
    dShaftFlatOffset,
    hasHub,
    hubDiameter,
    hubLength,
    printer_compensation,
  } = params;

  const coneAngleRad = ((coneAngleDeg || 45) * Math.PI) / 180;
  const baseGear = computeInvoluteGear2D(module, toothCount, 20.0, 3);
  const outerProfile = baseGear.profilePoints;
  const numOuter = outerProfile.length;
  const pitchRadius = baseGear.pitchRadius;

  // Maximum safe bore
  const maxSafeBore = Math.max(0, (baseGear.rootRadius * 0.7 - 1.0) * 2);
  const requestedBore = boreDiameter !== undefined ? boreDiameter : 5.0;
  const actualBoreDia = Math.min(requestedBore, maxSafeBore);

  const boreProfile = actualBoreDia > 1.0
    ? generateBore2D(boreType || 'round', actualBoreDia, dShaftFlatOffset || 0, printer_compensation || 0, 32)
    : [];
  const numBore = boreProfile.length;
  const hasBore = numBore >= 3;

  const positions: number[] = [];
  const indices: number[] = [];

  const addSlice = (
    profile2D: THREE.Vector2[],
    bore2D: THREE.Vector2[],
    z: number,
    scale: number = 1.0
  ) => {
    for (const p of profile2D) {
      positions.push(p.x * scale, p.y * scale, z);
    }
    if (hasBore) {
      for (const b of bore2D) {
        positions.push(b.x, b.y, z);
      }
    }
  };

  const getOuterIdx = (slice: number, pt: number) => slice * (numOuter + numBore) + pt;
  const getBoreIdx = (slice: number, pt: number) => slice * (numOuter + numBore) + numOuter + pt;

  const loftSlices = (sA: number, sB: number) => {
    // Outer surface
    for (let i = 0; i < numOuter; i++) {
      const next = (i + 1) % numOuter;
      const a0 = getOuterIdx(sA, i);
      const a1 = getOuterIdx(sA, next);
      const b0 = getOuterIdx(sB, i);
      const b1 = getOuterIdx(sB, next);
      indices.push(a0, b0, a1);
      indices.push(a1, b0, b1);
    }
    // Bore surface
    if (hasBore) {
      for (let i = 0; i < numBore; i++) {
        const next = (i + 1) % numBore;
        const a0 = getBoreIdx(sA, i);
        const a1 = getBoreIdx(sA, next);
        const b0 = getBoreIdx(sB, i);
        const b1 = getBoreIdx(sB, next);
        // Inward facing: reverse winding
        indices.push(a0, a1, b0);
        indices.push(a1, b1, b0);
      }
    }
  };

  let sliceCount = 0;

  // 1. Hub base slice (if hub active)
  const actualHubLen = hasHub ? Math.max(3, hubLength) : 0;
  const hubRadius = Math.max(actualBoreDia / 2 + 2.5, hubDiameter / 2);

  // Generate hub circular profile resampled to numOuter points
  const hubProfile: THREE.Vector2[] = [];
  for (let i = 0; i < numOuter; i++) {
    const angle = (i / numOuter) * Math.PI * 2;
    hubProfile.push(new THREE.Vector2(hubRadius * Math.cos(angle), hubRadius * Math.sin(angle)));
  }

  if (hasHub && actualHubLen > 0) {
    addSlice(hubProfile, boreProfile, 0, 1.0); // slice 0: bottom of hub
    sliceCount++;
    addSlice(hubProfile, boreProfile, actualHubLen, 1.0); // slice 1: top of hub
    sliceCount++;
    loftSlices(0, 1);
  }

  // 2. Bevel Cone Slices
  const gearStartZ = actualHubLen;
  const gearZHeight = faceWidth * Math.cos(coneAngleRad);
  const gearNumSlices = 10;

  const coneStartSlice = sliceCount;
  for (let s = 0; s <= gearNumSlices; s++) {
    const t = s / gearNumSlices;
    const z = gearStartZ + t * gearZHeight;
    // Radius taper factor from pitch cone geometry
    const coneDist = pitchRadius / Math.sin(coneAngleRad);
    const scale = Math.max(0.2, (coneDist - t * faceWidth) / coneDist);

    addSlice(outerProfile, boreProfile, z, scale);
    sliceCount++;

    if (s > 0) {
      loftSlices(coneStartSlice + s - 1, coneStartSlice + s);
    }
  }

  // If hub existed, loft hub top to gear base (or cap transition)
  if (hasHub && actualHubLen > 0) {
    loftSlices(1, coneStartSlice);
  }

  // 3. Bottom Cap (at slice 0)
  const bottomOuter = hasHub && actualHubLen > 0 ? hubProfile : outerProfile;
  const bottomHoles = hasBore ? [boreProfile] : [];
  const bottomTris = THREE.ShapeUtils.triangulateShape(bottomOuter, bottomHoles);
  for (const tri of bottomTris) {
    const i0 = tri[0] < numOuter ? getOuterIdx(0, tri[0]) : getBoreIdx(0, tri[0] - numOuter);
    const i1 = tri[1] < numOuter ? getOuterIdx(0, tri[1]) : getBoreIdx(0, tri[1] - numOuter);
    const i2 = tri[2] < numOuter ? getOuterIdx(0, tri[2]) : getBoreIdx(0, tri[2] - numOuter);
    // Downward normal: reverse winding
    indices.push(i0, i2, i1);
  }

  // 4. Top Cap (at last slice)
  const topSliceIdx = sliceCount - 1;
  const topScale = Math.max(0.2, (pitchRadius / Math.sin(coneAngleRad) - faceWidth) / (pitchRadius / Math.sin(coneAngleRad)));
  const topOuter = outerProfile.map((p) => new THREE.Vector2(p.x * topScale, p.y * topScale));
  const topTris = THREE.ShapeUtils.triangulateShape(topOuter, bottomHoles);
  for (const tri of topTris) {
    const i0 = tri[0] < numOuter ? getOuterIdx(topSliceIdx, tri[0]) : getBoreIdx(topSliceIdx, tri[0] - numOuter);
    const i1 = tri[1] < numOuter ? getOuterIdx(topSliceIdx, tri[1]) : getBoreIdx(topSliceIdx, tri[1] - numOuter);
    const i2 = tri[2] < numOuter ? getOuterIdx(topSliceIdx, tri[2]) : getBoreIdx(topSliceIdx, tri[2] - numOuter);
    indices.push(i0, i1, i2);
  }

  // 5. BufferGeometry
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
