import * as THREE from 'three';
import { BevelGearParams, GeneratedMeshResult } from './types';
import {
  computeInvoluteGear2D,
  generateBore2D,
  computeMeshVolume,
  estimateWeightGrams,
  triangulateCap,
} from '../utils/meshMath';

/**
 * Generates a precision Miter / Bevel Gear using Mathematical Slice-Lofting

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

  const boreProfile =
    actualBoreDia > 1.0
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

  const loftSlices = (sA: number, sB: number, loftBore: boolean = true) => {
    // Outer surface (outward normal +r)
    for (let i = 0; i < numOuter; i++) {
      const next = (i + 1) % numOuter;
      const a0 = getOuterIdx(sA, i);
      const a1 = getOuterIdx(sA, next);
      const b0 = getOuterIdx(sB, i);
      const b1 = getOuterIdx(sB, next);
      indices.push(a0, a1, b0);
      indices.push(a1, b1, b0);
    }
    // Bore surface (inward normal -r into bore void)
    if (hasBore && loftBore) {
      for (let i = 0; i < numBore; i++) {
        const next = (i + 1) % numBore;
        const a0 = getBoreIdx(sA, i);
        const a1 = getBoreIdx(sA, next);
        const b0 = getBoreIdx(sB, i);
        const b1 = getBoreIdx(sB, next);
        indices.push(a0, b0, a1);
        indices.push(a1, b0, b1);
      }
    }
  };

  let sliceCount = 0;

  // 1. Hub base slice (if hub active)
  const actualHubLen = hasHub ? Math.max(3, hubLength) : 0;
  const hubRadius = Math.max(actualBoreDia / 2 + 2.5, hubDiameter / 2);

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
    const coneDist = pitchRadius / Math.sin(coneAngleRad);
    const scale = Math.max(0.2, (coneDist - t * faceWidth) / coneDist);

    addSlice(outerProfile, boreProfile, z, scale);
    sliceCount++;

    if (s > 0) {
      loftSlices(coneStartSlice + s - 1, coneStartSlice + s);
    }
  }

  // If hub existed, loft hub top to gear base (horizontal shoulder facing -Z)
  // Decouple vertices to prevent Gouraud normal bleeding from vertical hub and conical teeth
  if (hasHub && actualHubLen > 0) {
    const shoulderBase = positions.length / 3;
    for (let i = 0; i < numOuter; i++) {
      positions.push(hubProfile[i].x, hubProfile[i].y, actualHubLen);
    }
    for (let i = 0; i < numOuter; i++) {
      positions.push(outerProfile[i].x, outerProfile[i].y, actualHubLen);
    }
    for (let i = 0; i < numOuter; i++) {
      const next = (i + 1) % numOuter;
      const h0 = shoulderBase + i;
      const h1 = shoulderBase + next;
      const g0 = shoulderBase + numOuter + i;
      const g1 = shoulderBase + numOuter + next;
      // Downward-facing shoulder step (facing -Z)
      indices.push(g0, h0, g1);
      indices.push(g1, h0, h1);
    }
  }

  // 3. Triangulate Flat Bottom Cap (facing -Z)
  // Decouple vertices from side walls to avoid Gouraud normal smoothing artifacts
  const bottomOuter = hasHub && actualHubLen > 0 ? hubProfile : outerProfile;
  const bottomHoles = hasBore ? boreProfile : null;
  const bottomTris = triangulateCap(bottomOuter, bottomHoles);
  const botCapBaseIdx = positions.length / 3;

  for (let i = 0; i < bottomOuter.length; i++) {
    positions.push(bottomOuter[i].x, bottomOuter[i].y, 0);
  }
  if (hasBore) {
    for (let i = 0; i < numBore; i++) {
      positions.push(boreProfile[i].x, boreProfile[i].y, 0);
    }
  }
  for (const [i0, i1, i2] of bottomTris) {
    indices.push(botCapBaseIdx + i0, botCapBaseIdx + i2, botCapBaseIdx + i1);
  }

  // 4. Triangulate Flat Top Cap (facing +Z)
  // Decouple vertices from conical teeth
  const topScale = Math.max(
    0.2,
    (pitchRadius / Math.sin(coneAngleRad) - faceWidth) / (pitchRadius / Math.sin(coneAngleRad))
  );
  const topOuter = outerProfile.map((p) => new THREE.Vector2(p.x * topScale, p.y * topScale));
  const topHoles = hasBore ? boreProfile : null;
  const topTris = triangulateCap(topOuter, topHoles);
  const topCapBaseIdx = positions.length / 3;
  const topZ = gearStartZ + gearZHeight;

  for (let i = 0; i < topOuter.length; i++) {
    positions.push(topOuter[i].x, topOuter[i].y, topZ);
  }
  if (hasBore) {
    for (let i = 0; i < numBore; i++) {
      positions.push(boreProfile[i].x, boreProfile[i].y, topZ);
    }
  }
  for (const [i0, i1, i2] of topTris) {
    indices.push(topCapBaseIdx + i0, topCapBaseIdx + i1, topCapBaseIdx + i2);
  }

  // 5. BufferGeometry and Metadata
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