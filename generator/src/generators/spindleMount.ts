import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  SpindleMountParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
  SCREW_COUNTERSINK_HEAD_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Heavy-Duty CNC Spindle Split Clamp (52mm, 65mm, 80mm) using CSG:
 * - Cylindrical clamping collar with tension pinch bolt ears
 * - Clamping relief slit for tight spindle locking
 * - Rear heavy mounting flange for Z-axis gantry plate bolting
 */
export function generateSpindleMount(params: SpindleMountParams): GeneratedMeshResult {
  const {
    spindleDiameter = 65,
    clampHeight = 30,
    wallThickness = 12,
    pinchBoltSize = 'M5',
    baseMountWidth = 90,
    baseMountHoleSpacingX = 60,
    baseMountHoleSpacingY = 20,
    printer_compensation = 0.15,
  } = params;

  const D_spindle = Math.max(30, spindleDiameter + printer_compensation);
  const R_spindle = D_spindle / 2;
  const H = Math.max(18, clampHeight);
  const T_wall = Math.max(6, wallThickness);
  const R_outer = R_spindle + T_wall;

  const pinchDia = SCREW_CLEARANCE_DIAMETERS[pinchBoltSize] + printer_compensation;
  const rPinch = pinchDia / 2;
  const pinchHeadDia = SCREW_COUNTERSINK_HEAD_DIAMETERS[pinchBoltSize] + printer_compensation;
  const rPinchHead = pinchHeadDia / 2;

  const W_base = Math.max(R_outer * 2 + 10, baseMountWidth);
  const T_base = Math.max(8, T_wall * 0.9);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Main Cylindrical Clamp Collar (at origin X=0, Y=0, Z from -H/2 to H/2)
  const collarGeom = new THREE.CylinderGeometry(R_outer, R_outer, H, 48);
  collarGeom.rotateX(Math.PI / 2);
  let mainBody = new Brush(collarGeom);
  mainBody.updateMatrixWorld();

  // 2. Add Rear Gantry Mounting Plate (at -Y side)
  const baseGeom = new THREE.BoxGeometry(W_base, T_base, H);
  baseGeom.translate(0, -R_spindle - T_base / 2, 0);
  const baseBrush = new Brush(baseGeom);
  baseBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, baseBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 3. Add Front Pinch Bolt Tabs (at +Y side)
  const tabWidth = R_outer * 1.6;
  const tabDepth = 18.0;
  const tabGeom = new THREE.BoxGeometry(tabWidth, tabDepth, H);
  tabGeom.translate(0, R_spindle + tabDepth / 2, 0);
  const tabBrush = new Brush(tabGeom);
  tabBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, tabBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 4. Subtract Central Spindle Bore
  const spindleBoreGeom = new THREE.CylinderGeometry(R_spindle, R_spindle, H + 4, 64);
  spindleBoreGeom.rotateX(Math.PI / 2);
  const spindleBoreBrush = new Brush(spindleBoreGeom);
  spindleBoreBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, spindleBoreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 5. Subtract Clamping Split Slit (from spindle bore through front pinch tabs, along Y at X=0)
  const slitWidth = 2.4;
  const slitGeom = new THREE.BoxGeometry(slitWidth, tabDepth + R_outer + 4, H + 4);
  slitGeom.translate(0, R_spindle + tabDepth / 2, 0);
  const slitBrush = new Brush(slitGeom);
  slitBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, slitBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 6. Subtract Transverse Pinch Bolt Holes through tabs (along X axis)
  const pinchZOffsets = H >= 28 ? [-H * 0.25, H * 0.25] : [0];
  const pinchY = R_spindle + tabDepth * 0.55;

  for (const pz of pinchZOffsets) {
    const pinchHoleGeom = new THREE.CylinderGeometry(rPinch, rPinch, tabWidth + 4, 24);
    pinchHoleGeom.rotateZ(Math.PI / 2);
    pinchHoleGeom.translate(0, pinchY, pz);
    const pinchHoleBrush = new Brush(pinchHoleGeom);
    pinchHoleBrush.updateMatrixWorld();
    mainBody = evaluator.evaluate(mainBody, pinchHoleBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();

    // Counterbore for bolt head on right tab (+X)
    const cbDepth = tabWidth * 0.25;
    const cbGeom = new THREE.CylinderGeometry(rPinchHead, rPinchHead, cbDepth, 24);
    cbGeom.rotateZ(Math.PI / 2);
    cbGeom.translate(tabWidth / 2 - cbDepth / 2 + 0.1, pinchY, pz);
    const cbBrush = new Brush(cbGeom);
    cbBrush.updateMatrixWorld();
    mainBody = evaluator.evaluate(mainBody, cbBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();
  }

  // 7. Subtract Rear Mounting Plate Holes (4 holes along Y axis through base plate)
  const rMount = rPinch;
  const spanX = Math.min(W_base - 14, Math.max(30, baseMountHoleSpacingX));
  const spanZ = Math.min(H - 8, Math.max(10, baseMountHoleSpacingY));

  const mountHoles = [
    [-spanX / 2, -spanZ / 2],
    [spanX / 2, -spanZ / 2],
    [-spanX / 2, spanZ / 2],
    [spanX / 2, spanZ / 2],
  ];

  for (const [mx, mz] of mountHoles) {
    const mHoleGeom = new THREE.CylinderGeometry(rMount, rMount, T_base + 4, 20);
    // Cylinder along Y axis by default
    mHoleGeom.translate(mx, -R_spindle - T_base / 2, mz);
    const mHoleBrush = new Brush(mHoleGeom);
    mHoleBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, mHoleBrush, SUBTRACTION);
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
    dimensions: { x: Number(sz.x.toFixed(2)), y: Number(sz.y.toFixed(2)), z: Number(sz.z.toFixed(2)) },
    triangles: finalGeom.index ? finalGeom.index.count / 3 : finalGeom.attributes.position.count / 3,
    vertices: finalGeom.attributes.position.count,
    estimatedPrintWeightGrams: weight,
  };
}
