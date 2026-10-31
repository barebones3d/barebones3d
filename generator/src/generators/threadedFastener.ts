import * as THREE from 'three';
import { ThreadedFastenerParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams, triangulateCap } from '../utils/meshMath';

/**
 * Computes external thread radius for standard 60-deg metric V-thread.
 */
function getExternalThreadRadius(
  angle: number,
  z: number,
  pitch: number,
  rMaj: number,
  rMin: number
): number {
  // Phase along helical path: 1 full turn per pitch
  const helicalPhase = (z - (pitch * angle) / (2 * Math.PI)) / pitch;
  const u = helicalPhase - Math.floor(helicalPhase); // in [0, 1)

  // V-thread crest at u = 0.5, roots at 0 and 1
  const triangularFactor = 1.0 - 2.0 * Math.abs(u - 0.5); // [0, 1]
  // Truncate sharp crest/root for reliable 3D printing
  const truncatedFactor = Math.min(1.0, Math.max(0.0, (triangularFactor - 0.08) / 0.84));
  let r = rMin + (rMaj - rMin) * truncatedFactor;

  // Lead-in chamfer at tip (first 1.5 pitches)
  const leadInDist = 1.5 * pitch;
  if (z < leadInDist) {
    const leadFrac = Math.max(0.3, z / leadInDist);
    r *= leadFrac;
  }

  return r;
}

/**
 * Computes internal thread radius for nut bore.
 */
function getInternalThreadRadius(
  angle: number,
  z: number,
  pitch: number,
  rMaj: number,
  rMin: number
): number {
  const helicalPhase = (z - (pitch * angle) / (2 * Math.PI)) / pitch;
  const u = helicalPhase - Math.floor(helicalPhase);
  const triangularFactor = 1.0 - 2.0 * Math.abs(u - 0.5);
  const truncatedFactor = Math.min(1.0, Math.max(0.0, (triangularFactor - 0.08) / 0.84));
  // Invert: for internal thread, rMax is the root groove, rMin is the crest thread
  return rMaj - (rMaj - rMin) * truncatedFactor;
}

/**
 * Generates a watertight, mathematically precise Metric Fastener (Bolt or Nut).
 * Features:
 * - True helical 60° metric thread sweep with truncated crests for FDM/SLA printing
 * - Bolt with Hex head, Socket Cap, or Knurled thumb screw drive and lead-in chamfer
 * - Hexagon Nut with matching helical internal thread bore
 * - Watertight 2-manifold mesh with outward-facing normals
 */
export function generateThreadedFastener(params: ThreadedFastenerParams): GeneratedMeshResult {
  const {
    fastenerType,
    nominalDiameter,
    pitch,
    threadLength,
    headType,
    headDiameter,
    headHeight,
    nutHeight,
    nutWidthAcrossFlats,
    printer_compensation,
  } = params;

  const P = Math.max(0.6, pitch);
  const dNom = Math.max(3.0, nominalDiameter);

  // Thread radius calculations (with 3D printer clearance compensation)
  const comp = printer_compensation;
  const rMajExt = Math.max(1.0, dNom / 2 - comp * 0.5);
  const rMinExt = Math.max(0.6, rMajExt - 0.54127 * P);

  const rMinInt = Math.max(1.0, dNom / 2 + comp * 0.5 - 0.54127 * P);
  const rMajInt = Math.max(rMinInt + 0.2, dNom / 2 + comp * 0.5);

  const angularSamples = 36;
  const angles: number[] = [];
  for (let i = 0; i < angularSamples; i++) {
    angles.push((i / angularSamples) * Math.PI * 2);
  }

  const positions: number[] = [];
  const indices: number[] = [];

  if (fastenerType === 'bolt') {
    // ==========================================
    // BOLT GENERATION
    // ==========================================
    const L = Math.max(P * 2, threadLength);
    const Hhead = Math.max(2.5, headHeight);
    const Dhead = Math.max(dNom * 1.4, headDiameter);
    const Rhead = Dhead / 2;

    // Discretize shank along Z: 8 slices per pitch for silky smooth helical flanks
    const slicesPerPitch = 8;
    const shankSlices = Math.max(12, Math.round((L / P) * slicesPerPitch));

    // Outer profile points per slice
    const sliceProfiles: THREE.Vector2[][] = [];
    const sliceZs: number[] = [];

    // Threaded shank slices: z from 0 to L
    for (let s = 0; s <= shankSlices; s++) {
      const z = (s / shankSlices) * L;
      sliceZs.push(z);
      const prof = angles.map((a) => {
        const r = getExternalThreadRadius(a, z, P, rMajExt, rMinExt);
        return new THREE.Vector2(r * Math.cos(a), r * Math.sin(a));
      });
      sliceProfiles.push(prof);
    }

    // Head profile
    const headProfile: THREE.Vector2[] = angles.map((a) => {
      if (headType === 'hex') {
        // Regular hexagon
        const hexAngle = (a % (Math.PI / 3)) - Math.PI / 6;
        const rHex = Rhead / Math.cos(hexAngle);
        return new THREE.Vector2(rHex * Math.cos(a), rHex * Math.sin(a));
      } else if (headType === 'knurled-thumb') {
        const knurl = 0.5 - 0.5 * Math.cos(18 * a);
        const r = Rhead - 0.8 * knurl;
        return new THREE.Vector2(r * Math.cos(a), r * Math.sin(a));
      } else {
        // Socket Cap cylindrical head
        return new THREE.Vector2(Rhead * Math.cos(a), Rhead * Math.sin(a));
      }
    });

    // Step shoulder at z = L from shank radius to head radius
    sliceZs.push(L);
    sliceProfiles.push(headProfile);

    // Top of head at z = L + Hhead
    sliceZs.push(L + Hhead);
    sliceProfiles.push(headProfile);

    const totalSlices = sliceProfiles.length;
    for (let s = 0; s < totalSlices; s++) {
      const z = sliceZs[s];
      const prof = sliceProfiles[s];
      for (let i = 0; i < angularSamples; i++) {
        positions.push(prof[i].x, prof[i].y, z);
      }
    }

    const getIdx = (slice: number, pt: number) => slice * angularSamples + pt;

    // Connect vertical slices and shoulder
    for (let s = 0; s < totalSlices - 1; s++) {
      const isStep = Math.abs(sliceZs[s] - sliceZs[s + 1]) < 0.0001;
      for (let i = 0; i < angularSamples; i++) {
        const nextI = (i + 1) % angularSamples;
        const p00 = getIdx(s, i);
        const p10 = getIdx(s, nextI);
        const p11 = getIdx(s + 1, nextI);
        const p01 = getIdx(s + 1, i);

        if (isStep) {
          // Bottom of head shoulder facing -Z
          indices.push(p00, p01, p11);
          indices.push(p00, p11, p10);
        } else {
          indices.push(p00, p10, p11);
          indices.push(p00, p11, p01);
        }
      }
    }

    // Bottom tip cap (z = 0, facing -Z)
    const botTris = triangulateCap(sliceProfiles[0], null);
    const botCapBaseIdx = positions.length / 3;
    for (const p of sliceProfiles[0]) {
      positions.push(p.x, p.y, 0);
    }
    for (const [i0, i1, i2] of botTris) {
      indices.push(botCapBaseIdx + i0, botCapBaseIdx + i2, botCapBaseIdx + i1);
    }

    // Top head cap (z = L + Hhead, facing +Z)
    const topSlice = totalSlices - 1;
    const topZ = L + Hhead;
    const topTris = triangulateCap(sliceProfiles[topSlice], null);
    const topCapBaseIdx = positions.length / 3;
    for (const p of sliceProfiles[topSlice]) {
      positions.push(p.x, p.y, topZ);
    }
    for (const [i0, i1, i2] of topTris) {
      indices.push(topCapBaseIdx + i0, topCapBaseIdx + i1, topCapBaseIdx + i2);
    }
  } else {
    // ==========================================
    // NUT GENERATION
    // ==========================================
    const Hnut = Math.max(P * 2, nutHeight);
    const Wflats = Math.max(dNom * 1.5, nutWidthAcrossFlats);
    const Rflats = Wflats / 2;

    // Outer hexagon profile
    const outerHexProfile: THREE.Vector2[] = angles.map((a) => {
      const hexAngle = (a % (Math.PI / 3)) - Math.PI / 6;
      const rHex = Rflats / Math.cos(hexAngle);
      return new THREE.Vector2(rHex * Math.cos(a), rHex * Math.sin(a));
    });

    const slicesPerPitch = 8;
    const numSlices = Math.max(12, Math.round((Hnut / P) * slicesPerPitch));

    const sliceBores: THREE.Vector2[][] = [];
    const sliceZs: number[] = [];

    for (let s = 0; s <= numSlices; s++) {
      const z = (s / numSlices) * Hnut;
      sliceZs.push(z);
      const bore = angles.map((a) => {
        const r = getInternalThreadRadius(a, z, P, rMajInt, rMinInt);
        return new THREE.Vector2(r * Math.cos(a), r * Math.sin(a));
      });
      sliceBores.push(bore);
    }

    const vertsPerSlice = angularSamples * 2;
    for (let s = 0; s <= numSlices; s++) {
      const z = sliceZs[s];
      // Outer hex vertices
      for (let i = 0; i < angularSamples; i++) {
        positions.push(outerHexProfile[i].x, outerHexProfile[i].y, z);
      }
      // Inner thread bore vertices
      for (let i = 0; i < angularSamples; i++) {
        positions.push(sliceBores[s][i].x, sliceBores[s][i].y, z);
      }
    }

    const getOutIdx = (slice: number, pt: number) => slice * vertsPerSlice + pt;
    const getInIdx = (slice: number, pt: number) => slice * vertsPerSlice + angularSamples + pt;

    // Connect outer hex walls
    for (let s = 0; s < numSlices; s++) {
      for (let i = 0; i < angularSamples; i++) {
        const nextI = (i + 1) % angularSamples;
        const p00 = getOutIdx(s, i);
        const p10 = getOutIdx(s, nextI);
        const p11 = getOutIdx(s + 1, nextI);
        const p01 = getOutIdx(s + 1, i);

        indices.push(p00, p10, p11);
        indices.push(p00, p11, p01);
      }
    }

    // Connect inner helical thread bore walls (facing inward towards bore axis)
    for (let s = 0; s < numSlices; s++) {
      for (let i = 0; i < angularSamples; i++) {
        const nextI = (i + 1) % angularSamples;
        const b00 = getInIdx(s, i);
        const b10 = getInIdx(s, nextI);
        const b11 = getInIdx(s + 1, nextI);
        const b01 = getInIdx(s + 1, i);

        indices.push(b00, b11, b10);
        indices.push(b00, b01, b11);
      }
    }

    // Bottom face cap (z = 0, facing -Z)
    const botTris = triangulateCap(outerHexProfile, sliceBores[0]);
    const botCapBaseIdx = positions.length / 3;
    for (const p of outerHexProfile) {
      positions.push(p.x, p.y, 0);
    }
    for (const p of sliceBores[0]) {
      positions.push(p.x, p.y, 0);
    }
    for (const [i0, i1, i2] of botTris) {
      indices.push(botCapBaseIdx + i0, botCapBaseIdx + i2, botCapBaseIdx + i1);
    }

    // Top face cap (z = Hnut, facing +Z)
    const topTris = triangulateCap(outerHexProfile, sliceBores[numSlices]);
    const topCapBaseIdx = positions.length / 3;
    for (const p of outerHexProfile) {
      positions.push(p.x, p.y, Hnut);
    }
    for (const p of sliceBores[numSlices]) {
      positions.push(p.x, p.y, Hnut);
    }
    for (const [i0, i1, i2] of topTris) {
      indices.push(topCapBaseIdx + i0, topCapBaseIdx + i1, topCapBaseIdx + i2);
    }
  }

  // Build BufferGeometry
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
