import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  PeristalticPumpHeadParams,
  GeneratedMeshResult,
  BEARING_PRESET_DATA,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Peristaltic Pump Roller Rotor Head using CSG:
 * - 3 or 4 roller arms designed for standard ball bearings (608, 624, 625)
 * - Tubing retention flanges preventing silicone hose walkout
 * - Central motor shaft hub with D-shaft flat
 * - Rigid star web truss construction
 */
export function generatePeristalticPumpHead(params: PeristalticPumpHeadParams): GeneratedMeshResult {
  const {
    rollerCount = 3,
    rotorOuterDiameter = 52,
    rollerBearingType = '624',
    motorShaftDiameter = 5,
    rotorThickness = 12,
    printer_compensation = 0.15,
  } = params;

  const numRollers = rollerCount === 4 ? 4 : 3;
  const D_rotor = Math.max(32, rotorOuterDiameter);
  const R_rotor = D_rotor / 2;
  const T_rotor = Math.max(8, rotorThickness);

  const bearingMeta = BEARING_PRESET_DATA[rollerBearingType] || BEARING_PRESET_DATA['624'];
  const rBearingOD = (bearingMeta.od + printer_compensation) / 2;
  const rBearingPin = (bearingMeta.id + printer_compensation) / 2;
  const rollerPitchRadius = R_rotor - rBearingOD - 1.5;

  const rShaft = Math.max(1.5, (motorShaftDiameter + printer_compensation) / 2);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Central Hub Cylinder (X=0, Y=0, Z from -T_rotor/2 to T_rotor/2)
  const hubRadius = Math.max(rShaft + 4.5, 9);
  const hubGeom = new THREE.CylinderGeometry(hubRadius, hubRadius, T_rotor, 36);
  hubGeom.rotateX(Math.PI / 2);
  let mainBody = new Brush(hubGeom);
  mainBody.updateMatrixWorld();

  // 2. Add Base Disc Plate (at -Z face, thickness = 3.5mm)
  const plateThick = 3.5;
  const basePlateGeom = new THREE.CylinderGeometry(R_rotor, R_rotor, plateThick, 48);
  basePlateGeom.rotateX(Math.PI / 2);
  basePlateGeom.translate(0, 0, -T_rotor / 2 + plateThick / 2);
  const basePlateBrush = new Brush(basePlateGeom);
  basePlateBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, basePlateBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 3. Add Radial Roller Support Arms
  const armWidth = Math.max(8, rBearingPin * 3.5);
  for (let i = 0; i < numRollers; i++) {
    const angle = (i / numRollers) * Math.PI * 2;
    const ax = Math.cos(angle) * (rollerPitchRadius / 2);
    const ay = Math.sin(angle) * (rollerPitchRadius / 2);

    const armGeom = new THREE.BoxGeometry(rollerPitchRadius, armWidth, T_rotor * 0.7);
    armGeom.rotateZ(angle);
    armGeom.translate(ax, ay, -T_rotor / 2 + (T_rotor * 0.7) / 2);
    const armBrush = new Brush(armGeom);
    armBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, armBrush, ADDITION);
    mainBody.updateMatrixWorld();

    // Cylindrical bearing mounting boss at roller pitch radius
    const bossGeom = new THREE.CylinderGeometry(rBearingPin + 2.5, rBearingPin + 2.5, T_rotor, 24);
    bossGeom.rotateX(Math.PI / 2);
    bossGeom.translate(Math.cos(angle) * rollerPitchRadius, Math.sin(angle) * rollerPitchRadius, 0);
    const bossBrush = new Brush(bossGeom);
    bossBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, bossBrush, ADDITION);
    mainBody.updateMatrixWorld();
  }

  // 4. Subtract Bearing Axle Pin Holes
  for (let i = 0; i < numRollers; i++) {
    const angle = (i / numRollers) * Math.PI * 2;
    const bx = Math.cos(angle) * rollerPitchRadius;
    const by = Math.sin(angle) * rollerPitchRadius;

    const pinHoleGeom = new THREE.CylinderGeometry(rBearingPin, rBearingPin, T_rotor + 4, 24);
    pinHoleGeom.rotateX(Math.PI / 2);
    pinHoleGeom.translate(bx, by, 0);
    const pinHoleBrush = new Brush(pinHoleGeom);
    pinHoleBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, pinHoleBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();
  }

  // 5. Subtract Central Motor Shaft Bore (with D-flat)
  const shaftBoreGeom = new THREE.CylinderGeometry(rShaft, rShaft, T_rotor + 4, 32);
  shaftBoreGeom.rotateX(Math.PI / 2);
  const shaftBoreBrush = new Brush(shaftBoreGeom);
  shaftBoreBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, shaftBoreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // D-shaft flat filler
  const flatOffset = rShaft * 0.75;
  const flatGeom = new THREE.BoxGeometry(rShaft * 2, rShaft - flatOffset, T_rotor + 2);
  flatGeom.translate(0, rShaft - (rShaft - flatOffset) / 2, 0);
  const flatBrush = new Brush(flatGeom);
  flatBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, flatBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 6. Tubing Guide Washers / Edge Chamfer
  const chamferGeom = new THREE.CylinderGeometry(R_rotor + 4, R_rotor, 4, 48);
  chamferGeom.rotateX(Math.PI / 2);
  chamferGeom.translate(0, 0, T_rotor / 2);

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
