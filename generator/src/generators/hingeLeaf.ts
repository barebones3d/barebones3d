import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals, mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  HingeLeafParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
  SCREW_COUNTERSINK_HEAD_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Interlocking Knuckle Barrel Hinge Leaf using CSG:
 * - Cylindrical barrel knuckles with central hinge pin bore
 * - Rigid flat mounting leaf plate with beveled edges
 * - Countersunk mounting screw holes for flush assembly
 * - Designed for print-in-place or assembly with wire / filament pin
 */
export function generateHingeLeaf(params: HingeLeafParams): GeneratedMeshResult {
  const {
    knuckleCount = 3,
    leafWidth = 30,
    leafLength = 50,
    leafThickness = 3.5,
    pinDiameter = 3.5,
    screwHoleCount = 3,
    screwSize = 'M3',
    knuckleClearance = 0.4,
    printer_compensation = 0.15,
  } = params;

  const numKnuckles = Math.max(2, Math.min(6, Math.round(knuckleCount)));
  const W_leaf = Math.max(16, leafWidth);
  const L_leaf = Math.max(25, leafLength);
  const T_leaf = Math.max(2.0, leafThickness);
  const D_pin = Math.max(2.0, pinDiameter + printer_compensation);
  const R_pin = D_pin / 2;
  const knuckleOD = D_pin + T_leaf * 2;
  const R_knuckle = knuckleOD / 2;

  const screwDia = SCREW_CLEARANCE_DIAMETERS[screwSize] + printer_compensation;
  const rScrew = screwDia / 2;
  const screwHeadDia = SCREW_COUNTERSINK_HEAD_DIAMETERS[screwSize] + printer_compensation;
  const rScrewHead = screwHeadDia / 2;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Flat Mounting Leaf Plate
  const plateGeom = new THREE.BoxGeometry(W_leaf, L_leaf, T_leaf);
  plateGeom.translate(W_leaf / 2, 0, 0);

  // 2. Knuckles and transition wedges
  const knuckleLength = (L_leaf - (numKnuckles - 1) * knuckleClearance) / numKnuckles;
  const knuckleGeoms: THREE.BufferGeometry[] = [];

  for (let k = 0; k < numKnuckles; k++) {
    const yCenter = -L_leaf / 2 + k * (knuckleLength + knuckleClearance) + knuckleLength / 2;

    const knuckleGeom = new THREE.CylinderGeometry(R_knuckle, R_knuckle, knuckleLength, 28);
    knuckleGeom.translate(0, yCenter, 0);
    knuckleGeoms.push(knuckleGeom);

    const wedgeGeom = new THREE.BoxGeometry(R_knuckle, knuckleLength, T_leaf);
    wedgeGeom.translate(R_knuckle / 2, yCenter, 0);
    knuckleGeoms.push(wedgeGeom);
  }

  const mergedKnuckles = mergeGeometries(knuckleGeoms);
  let mainBody = new Brush(plateGeom);
  mainBody.updateMatrixWorld();
  const knucklesBrush = new Brush(mergedKnuckles);
  knucklesBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, knucklesBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 3. Central Pin Bore
  const pinBoreGeom = new THREE.CylinderGeometry(R_pin, R_pin, L_leaf + 8, 28);
  pinBoreGeom.translate(0, 0, 0);
  const pinBoreBrush = new Brush(pinBoreGeom);
  pinBoreBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, pinBoreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Countersunk Screw Holes
  const numHoles = Math.max(1, Math.min(5, Math.round(screwHoleCount)));
  const holeX = R_knuckle + (W_leaf - R_knuckle) * 0.55;
  const holeSpanY = L_leaf * 0.7;
  const holeGeoms: THREE.BufferGeometry[] = [];

  for (let h = 0; h < numHoles; h++) {
    const hy = numHoles === 1 ? 0 : -holeSpanY / 2 + (h / (numHoles - 1)) * holeSpanY;

    // Through-hole
    const holeCylGeom = new THREE.CylinderGeometry(rScrew, rScrew, T_leaf + 4, 20);
    holeCylGeom.rotateX(Math.PI / 2);
    holeCylGeom.translate(holeX, hy, 0);
    holeGeoms.push(holeCylGeom);

    // 90-degree conical countersink on top face (+Z)
    const csDepth = rScrewHead - rScrew;
    const csGeom = new THREE.ConeGeometry(rScrewHead, csDepth * 2, 20);
    csGeom.rotateX(-Math.PI / 2);
    csGeom.translate(holeX, hy, T_leaf / 2);
    holeGeoms.push(csGeom);
  }

  const mergedHoles = mergeGeometries(holeGeoms);
  const holesBrush = new Brush(mergedHoles);
  holesBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, holesBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

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
    dimensions: { x: sz.x, y: sz.y, z: sz.z },
    triangles: finalGeom.index ? finalGeom.index.count / 3 : finalGeom.attributes.position.count / 3,
    vertices: finalGeom.attributes.position.count,
    estimatedPrintWeightGrams: weight,
  };
}
