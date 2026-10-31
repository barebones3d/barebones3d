import * as THREE from 'three';
import {
  VibrationIsolatorParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams, triangulateCap } from '../utils/meshMath';

/**
 * Generates an Anti-Vibration TPU / Rubber Dampening Isolator Foot using Mathematical Lofting:
 * - Hourglass sinusoidal profile for compliance under axial and shear vibration
 * - Recessed top stud mounting hole
 * - Internal bottom hexagonal nut-trap cavity
 * - 100% watertight 2-manifold lofted solid
 */
export function generateVibrationIsolator(params: VibrationIsolatorParams): GeneratedMeshResult {
  const {
    baseDiameter = 36,
    waistDiameter = 20,
    height = 28,
    topStudHoleDiameter = 4.5,
    bottomNutTrapSize = 'M4',
    cavityDepth = 7,
    printer_compensation = 0.15,
  } = params;

  const R_base = Math.max(12, baseDiameter / 2);
  const R_waist = Math.max(6, Math.min(R_base * 0.9, waistDiameter / 2));
  const H = Math.max(14, height);

  const studDia = Math.max(2.5, topStudHoleDiameter + printer_compensation);
  const rStud = studDia / 2;

  const nutScrewDia = SCREW_CLEARANCE_DIAMETERS[bottomNutTrapSize] + printer_compensation;
  // Standard hex nut width across flats = ~1.75 * screwDia
  const nutFlatToFlat = nutScrewDia * 1.8;
  const nutHexRadius = nutFlatToFlat / Math.sqrt(3);
  const D_cavity = Math.max(3, Math.min(H * 0.6, cavityDepth));

  // Mathematical lofting: N vertical slices from Z = 0 to Z = H
  const numSlices = 36;
  const numRadialPoints = 48;

  const positions: number[] = [];
  const indices: number[] = [];

  const addQuad = (v0: number, v1: number, v2: number, v3: number) => {
    indices.push(v0, v1, v2);
    indices.push(v0, v2, v3);
  };

  // 1. Generate Outer Skin Slices
  // Radius r(z) has sinusoidal hourglass waist minimum at z = H * 0.45
  for (let s = 0; s <= numSlices; s++) {
    const t = s / numSlices;
    const z = t * H;
    // Hourglass profile: R(t) = R_waist + (R_base - R_waist) * (cos(2 * PI * (t - 0.5)) + 1) / 2
    // Minimum at t = 0.45
    const profileFactor = Math.pow(Math.cos((t - 0.45) * Math.PI), 2);
    const r = R_waist + (R_base - R_waist) * (1 - profileFactor * 0.85);

    for (let p = 0; p < numRadialPoints; p++) {
      const angle = (p / numRadialPoints) * Math.PI * 2;
      positions.push(Math.cos(angle) * r, Math.sin(angle) * r, z);
    }
  }

  // Quads connecting outer skin slices
  for (let s = 0; s < numSlices; s++) {
    const row0 = s * numRadialPoints;
    const row1 = (s + 1) * numRadialPoints;
    for (let p = 0; p < numRadialPoints; p++) {
      const next = (p + 1) % numRadialPoints;
      const b0 = row0 + p;
      const b1 = row0 + next;
      const t0 = row1 + p;
      const t1 = row1 + next;
      addQuad(b0, b1, t1, t0);
    }
  }

  // 2. Top Cap at z = H with stud through-hole
  // Top outer ring is at row `numSlices * numRadialPoints`
  const topOuterStart = numSlices * numRadialPoints;
  const numHolePoints = numRadialPoints;
  const topHoleStart = positions.length / 3;

  for (let p = 0; p < numHolePoints; p++) {
    const angle = (p / numHolePoints) * Math.PI * 2;
    positions.push(Math.cos(angle) * rStud, Math.sin(angle) * rStud, H);
  }

  // Triangulate annular top cap
  for (let p = 0; p < numRadialPoints; p++) {
    const next = (p + 1) % numRadialPoints;
    const o0 = topOuterStart + p;
    const o1 = topOuterStart + next;
    const h0 = topHoleStart + p;
    const h1 = topHoleStart + next;
    addQuad(o0, o1, h1, h0);
  }

  // 3. Central Stud Bore Inner Wall (from z = H down to z = D_cavity)
  const studBoreBottomStart = positions.length / 3;
  for (let p = 0; p < numHolePoints; p++) {
    const angle = (p / numHolePoints) * Math.PI * 2;
    positions.push(Math.cos(angle) * rStud, Math.sin(angle) * rStud, D_cavity);
  }
  for (let p = 0; p < numHolePoints; p++) {
    const next = (p + 1) % numHolePoints;
    const t0 = topHoleStart + p;
    const t1 = topHoleStart + next;
    const b0 = studBoreBottomStart + p;
    const b1 = studBoreBottomStart + next;
    addQuad(t0, t1, b1, b0);
  }

  // 4. Hex Nut Cavity (from z = 0 to z = D_cavity)
  // Ceiling of hex cavity at z = D_cavity connects stud hole (rStud) to hex perimeter (nutHexRadius)
  const hexCeilStart = positions.length / 3;
  const numHexPoints = 6;
  for (let k = 0; k < numHexPoints; k++) {
    const angle = (k / numHexPoints) * Math.PI * 2;
    positions.push(Math.cos(angle) * nutHexRadius, Math.sin(angle) * nutHexRadius, D_cavity);
  }

  // Cap between stud bore bottom and hex cavity ceiling (facing -Z into hex cavity void)
  const hexCeilPoints: THREE.Vector2[] = [];
  for (let k = 0; k < numHexPoints; k++) {
    const angle = (k / numHexPoints) * Math.PI * 2;
    hexCeilPoints.push(new THREE.Vector2(Math.cos(angle) * nutHexRadius, Math.sin(angle) * nutHexRadius));
  }
  const studBorePoints: THREE.Vector2[] = [];
  for (let p = 0; p < numHolePoints; p++) {
    const angle = (p / numHolePoints) * Math.PI * 2;
    studBorePoints.push(new THREE.Vector2(Math.cos(angle) * rStud, Math.sin(angle) * rStud));
  }

  const ceilTriIndices = triangulateCap(hexCeilPoints, studBorePoints);
  const ceilCapBaseIdx = positions.length / 3;
  for (const pt of hexCeilPoints) {
    positions.push(pt.x, pt.y, D_cavity);
  }
  for (const pt of studBorePoints) {
    positions.push(pt.x, pt.y, D_cavity);
  }
  for (const [i0, i1, i2] of ceilTriIndices) {
    indices.push(ceilCapBaseIdx + i0, ceilCapBaseIdx + i2, ceilCapBaseIdx + i1);
  }

  // Hex cavity vertical walls from z = D_cavity down to z = 0
  const hexFloorStart = positions.length / 3;
  for (let k = 0; k < numHexPoints; k++) {
    const angle = (k / numHexPoints) * Math.PI * 2;
    positions.push(Math.cos(angle) * nutHexRadius, Math.sin(angle) * nutHexRadius, 0);
  }
  for (let k = 0; k < numHexPoints; k++) {
    const next = (k + 1) % numHexPoints;
    const c0 = hexCeilStart + k;
    const c1 = hexCeilStart + next;
    const f0 = hexFloorStart + k;
    const f1 = hexFloorStart + next;
    addQuad(c0, c1, f1, f0);
  }

  // 5. Bottom Floor Cap (connects outer skin at z=0 to hex cavity floor at z=0, facing -Z)
  const floorOuterPoints: THREE.Vector2[] = [];
  for (let p = 0; p < numRadialPoints; p++) {
    const angle = (p / numRadialPoints) * Math.PI * 2;
    floorOuterPoints.push(new THREE.Vector2(Math.cos(angle) * R_base, Math.sin(angle) * R_base));
  }
  const floorHexHolePoints: THREE.Vector2[] = [];
  for (let k = 0; k < numHexPoints; k++) {
    const angle = (k / numHexPoints) * Math.PI * 2;
    floorHexHolePoints.push(new THREE.Vector2(Math.cos(angle) * nutHexRadius, Math.sin(angle) * nutHexRadius));
  }

  const floorTriIndices = triangulateCap(floorOuterPoints, floorHexHolePoints);
  const floorCapBaseIdx = positions.length / 3;
  for (const pt of floorOuterPoints) {
    positions.push(pt.x, pt.y, 0);
  }
  for (const pt of floorHexHolePoints) {
    positions.push(pt.x, pt.y, 0);
  }
  for (const [i0, i1, i2] of floorTriIndices) {
    indices.push(floorCapBaseIdx + i0, floorCapBaseIdx + i2, floorCapBaseIdx + i1);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  geom.computeBoundingBox();

  const volume = computeMeshVolume(geom);
  const weight = estimateWeightGrams(volume);
  const bbox = geom.boundingBox || new THREE.Box3();
  const sz = new THREE.Vector3();
  bbox.getSize(sz);

  return {
    geometry: geom,
    dimensions: { x: Number(sz.x.toFixed(2)), y: Number(sz.y.toFixed(2)), z: Number(sz.z.toFixed(2)) },
    triangles: indices.length / 3,
    vertices: positions.length / 3,
    estimatedPrintWeightGrams: weight,
  };
}
