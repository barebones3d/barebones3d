import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SlipRingCapsuleParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Miniature Electrical Slip Ring Housing / Flange Mount using CSG:
 * - Cylindrical stator capsule sleeve
 * - 3 or 4 bolt circular mounting flange
 * - Central rotating rotor clearance bore
 * - Lateral wiring breakout slot
 */
export function generateSlipRingCapsule(params: SlipRingCapsuleParams): GeneratedMeshResult {
  const {
    capsuleOuterDiameter = 22,
    capsuleLength = 28,
    flangeDiameter = 34,
    rotorBoreDiameter = 7,
    mountBoltCount = 3,
    mountBoltPCD = 28,
    cableExitSlotWidth = 4.5,
    printer_compensation = 0.15,
  } = params;

  const D_capsule = Math.max(12, capsuleOuterDiameter);
  const R_capsule = D_capsule / 2;
  const L = Math.max(16, capsuleLength);
  const D_flange = Math.max(D_capsule + 8, flangeDiameter);
  const R_flange = D_flange / 2;
  const T_flange = 3.5;

  const D_bore = Math.max(3, rotorBoreDiameter + printer_compensation);
  const R_bore = D_bore / 2;

  const PCD = Math.max(D_capsule + 4, Math.min(D_flange - 4, mountBoltPCD));
  const R_pcd = PCD / 2;
  const numBolts = mountBoltCount === 4 ? 4 : 3;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Main Cylindrical Sleeve (Z from 0 to L)
  const sleeveGeom = new THREE.CylinderGeometry(R_capsule, R_capsule, L, 36);
  sleeveGeom.rotateX(Math.PI / 2);
  sleeveGeom.translate(0, 0, L / 2);
  let mainBody = new Brush(sleeveGeom);
  mainBody.updateMatrixWorld();

  // 2. Add Stator Mounting Flange at Base (Z from 0 to T_flange)
  const flangeGeom = new THREE.CylinderGeometry(R_flange, R_flange, T_flange, 36);
  flangeGeom.rotateX(Math.PI / 2);
  flangeGeom.translate(0, 0, T_flange / 2);
  const flangeBrush = new Brush(flangeGeom);
  flangeBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, flangeBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 3. Subtract Internal Capsule Cavity (housing the rotating slip ring assembly)
  const cavityR = Math.max(R_bore + 1.5, R_capsule - 2.5);
  const cavityGeom = new THREE.CylinderGeometry(cavityR, cavityR, L - 3, 36);
  cavityGeom.rotateX(Math.PI / 2);
  cavityGeom.translate(0, 0, (L - 3) / 2 + 1.5);
  const cavityBrush = new Brush(cavityGeom);
  cavityBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, cavityBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Subtract Central Rotor Shaft Pass-Through Bore (through-hole from 0 to L)
  const rotorBoreGeom = new THREE.CylinderGeometry(R_bore, R_bore, L + 4, 32);
  rotorBoreGeom.rotateX(Math.PI / 2);
  rotorBoreGeom.translate(0, 0, L / 2);
  const rotorBoreBrush = new Brush(rotorBoreGeom);
  rotorBoreBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, rotorBoreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 5. Subtract Stator Lateral Cable Exit Slot
  const slotW = Math.max(2.5, cableExitSlotWidth);
  const slotGeom = new THREE.BoxGeometry(R_capsule * 2.5, slotW, 8.0);
  slotGeom.translate(R_capsule * 0.7, 0, L - 4);
  const slotBrush = new Brush(slotGeom);
  slotBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, slotBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 6. Subtract Flange Mounting Screw Holes
  const rBoltHole = 1.6; // M3 hole
  for (let b = 0; b < numBolts; b++) {
    const angle = (b / numBolts) * Math.PI * 2;
    const bx = Math.cos(angle) * R_pcd;
    const by = Math.sin(angle) * R_pcd;

    const bHoleGeom = new THREE.CylinderGeometry(rBoltHole, rBoltHole, T_flange + 4, 16);
    bHoleGeom.rotateX(Math.PI / 2);
    bHoleGeom.translate(bx, by, T_flange / 2);
    const bHoleBrush = new Brush(bHoleGeom);
    bHoleBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, bHoleBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();
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
    dimensions: { x: sz.x, y: sz.y, z: sz.z },
    triangles: finalGeom.index ? finalGeom.index.count / 3 : finalGeom.attributes.position.count / 3,
    vertices: finalGeom.attributes.position.count,
    estimatedPrintWeightGrams: weight,
  };
}
