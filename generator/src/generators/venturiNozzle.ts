import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { VenturiNozzleParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Eductor / Venturi Mixer Nozzle using Mathematical Lofting + CSG:
 * - Smooth de Laval convergent-divergent throat profile for Bernoulli suction
 * - Internal hollow fluid pathway with constant wall thickness
 * - Orthogonal side vacuum siphon / injection port at maximum velocity throat
 * - Optional inlet mounting flange
 */
export function generateVenturiNozzle(params: VenturiNozzleParams): GeneratedMeshResult {
  const {
    inletDiameter = 28,
    throatDiameter = 10,
    outletDiameter = 24,
    nozzleLength = 65,
    wallThickness = 2.5,
    suctionPortDiameter = 7,
    flangeMount = true,
    printer_compensation = 0.15,
  } = params;

  const L = Math.max(35, nozzleLength);
  const R_in = Math.max(8, inletDiameter / 2);
  const R_out = Math.max(6, outletDiameter / 2);
  const R_throat = Math.max(2.5, Math.min(Math.min(R_in, R_out) * 0.75, throatDiameter / 2));
  const T_wall = Math.max(1.6, wallThickness);
  const zThroat = L * 0.35; // throat location

  // Mathematical profile function for inner radius at distance z along length
  const getInnerRadius = (z: number): number => {
    if (z <= zThroat) {
      // Convergent section (cosine bell taper from R_in to R_throat)
      const u = z / zThroat;
      return R_throat + (R_in - R_throat) * (Math.cos(u * Math.PI) + 1) / 2;
    } else {
      // Divergent diffuser section (conical expansion from R_throat to R_out)
      const u = (z - zThroat) / (L - zThroat);
      return R_throat + (R_out - R_throat) * Math.pow(u, 0.85);
    }
  };

  // Generate outer shell and inner core via slice-lofting
  const numSlices = 40;
  const numRadialPoints = 36;

  const positions: number[] = [];
  const indices: number[] = [];

  const addQuad = (v0: number, v1: number, v2: number, v3: number) => {
    indices.push(v0, v1, v2);
    indices.push(v0, v2, v3);
  };

  // 1. Outer Skin Slices (z from 0 to L, radius = innerRadius + T_wall)
  for (let s = 0; s <= numSlices; s++) {
    const z = (s / numSlices) * L;
    const rOuter = getInnerRadius(z) + T_wall;
    for (let p = 0; p < numRadialPoints; p++) {
      const angle = (p / numRadialPoints) * Math.PI * 2;
      positions.push(Math.cos(angle) * rOuter, Math.sin(angle) * rOuter, z);
    }
  }

  // Quads for outer skin
  for (let s = 0; s < numSlices; s++) {
    const row0 = s * numRadialPoints;
    const row1 = (s + 1) * numRadialPoints;
    for (let p = 0; p < numRadialPoints; p++) {
      const next = (p + 1) % numRadialPoints;
      addQuad(row0 + p, row0 + next, row1 + next, row1 + p);
    }
  }

  // 2. Inner Core Slices (z from 0 to L, radius = innerRadius)
  const innerStart = positions.length / 3;
  for (let s = 0; s <= numSlices; s++) {
    const z = (s / numSlices) * L;
    const rInner = getInnerRadius(z);
    for (let p = 0; p < numRadialPoints; p++) {
      const angle = (p / numRadialPoints) * Math.PI * 2;
      positions.push(Math.cos(angle) * rInner, Math.sin(angle) * rInner, z);
    }
  }

  // Quads for inner bore (facing inwards)
  for (let s = 0; s < numSlices; s++) {
    const row0 = innerStart + s * numRadialPoints;
    const row1 = innerStart + (s + 1) * numRadialPoints;
    for (let p = 0; p < numRadialPoints; p++) {
      const next = (p + 1) % numRadialPoints;
      addQuad(row0 + p, row1 + p, row1 + next, row0 + next);
    }
  }

  // 3. Inlet Annular Cap at z = 0
  const outerInletStart = 0;
  const innerInletStart = innerStart;
  for (let p = 0; p < numRadialPoints; p++) {
    const next = (p + 1) % numRadialPoints;
    addQuad(outerInletStart + next, outerInletStart + p, innerInletStart + p, innerInletStart + next);
  }

  // 4. Outlet Annular Cap at z = L
  const outerOutletStart = numSlices * numRadialPoints;
  const innerOutletStart = innerStart + numSlices * numRadialPoints;
  for (let p = 0; p < numRadialPoints; p++) {
    const next = (p + 1) % numRadialPoints;
    addQuad(outerOutletStart + p, outerOutletStart + next, innerOutletStart + next, innerOutletStart + p);
  }

  const baseGeom = new THREE.BufferGeometry();
  baseGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  baseGeom.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((positions.length / 3) * 2), 2));
  baseGeom.setIndex(indices);
  baseGeom.computeVertexNormals();

  const evaluator = new Evaluator();
  evaluator.useGroups = false;
  let mainBody = new Brush(baseGeom);
  mainBody.updateMatrixWorld();

  // 5. Add Suction Siphon Barb / Port at Throat (along X axis at z = zThroat)
  const portDia = Math.max(3.0, suctionPortDiameter + printer_compensation);
  const rPortInner = portDia / 2;
  const rPortOuter = rPortInner + T_wall;
  const portLen = (R_in + T_wall) * 0.9;

  // Solid cylinder branch
  const portCylGeom = new THREE.CylinderGeometry(rPortOuter, rPortOuter, portLen, 24);
  portCylGeom.rotateZ(Math.PI / 2);
  portCylGeom.translate(portLen / 2 + R_throat + T_wall * 0.5, 0, zThroat);
  const portBrush = new Brush(portCylGeom);
  portBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, portBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // Subtract suction through-bore into throat
  const portHoleGeom = new THREE.CylinderGeometry(rPortInner, rPortInner, portLen + 10, 24);
  portHoleGeom.rotateZ(Math.PI / 2);
  portHoleGeom.translate(portLen / 2 + R_throat, 0, zThroat);
  const portHoleBrush = new Brush(portHoleGeom);
  portHoleBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, portHoleBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 6. Optional Flange Mount at Inlet (z = 0)
  if (flangeMount) {
    const flangeOD = (R_in + T_wall) * 2 + 16;
    const flangeThick = 4.0;
    const flangeGeom = new THREE.CylinderGeometry(flangeOD / 2, flangeOD / 2, flangeThick, 36);
    flangeGeom.rotateX(Math.PI / 2);
    flangeGeom.translate(0, 0, flangeThick / 2);
    const flangeBrush = new Brush(flangeGeom);
    flangeBrush.updateMatrixWorld();
    mainBody = evaluator.evaluate(mainBody, flangeBrush, ADDITION);
    mainBody.updateMatrixWorld();

    // Re-punch central inlet bore through flange
    const flangeBoreGeom = new THREE.CylinderGeometry(R_in, R_in, flangeThick + 4, 36);
    flangeBoreGeom.rotateX(Math.PI / 2);
    flangeBoreGeom.translate(0, 0, flangeThick / 2);
    const flangeBoreBrush = new Brush(flangeBoreGeom);
    flangeBoreBrush.updateMatrixWorld();
    mainBody = evaluator.evaluate(mainBody, flangeBoreBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();

    // 4 bolt holes in flange
    const boltPCD = (R_in + T_wall + flangeOD / 2) / 2 * 2 - 2;
    for (let b = 0; b < 4; b++) {
      const bAngle = (b / 4) * Math.PI * 2 + Math.PI / 4;
      const bx = Math.cos(bAngle) * (boltPCD / 2);
      const by = Math.sin(bAngle) * (boltPCD / 2);

      const bHoleGeom = new THREE.CylinderGeometry(2.2, 2.2, flangeThick + 4, 16);
      bHoleGeom.rotateX(Math.PI / 2);
      bHoleGeom.translate(bx, by, flangeThick / 2);
      const bHoleBrush = new Brush(bHoleGeom);
      bHoleBrush.updateMatrixWorld();
      mainBody = evaluator.evaluate(mainBody, bHoleBrush, SUBTRACTION);
      mainBody.updateMatrixWorld();
    }
  }

  let finalGeom = mainBody.geometry.clone();
  finalGeom = toCreasedNormals(finalGeom, (35 * Math.PI) / 180);
  finalGeom.computeBoundingBox();

  const volume = computeMeshVolume(finalGeom);
  const weight = estimateWeightGrams(volume);
  const bbox = finalGeom.boundingBox || new THREE.Box3();
  const sz = new THREE.Vector3();
  bbox.getSize(sz);

  return {
    geometry: finalGeom,
    dimensions: { x: Number(sz.x.toFixed(2)), y: Number(sz.y.toFixed(2)), z: Number(sz.z.toFixed(2)) },
    triangles: finalGeom.index ? finalGeom.index.count / 3 : finalGeom.attributes.position.count / 3,
    vertices: finalGeom.attributes.position.count,
    estimatedPrintWeightGrams: weight,
  };
}
