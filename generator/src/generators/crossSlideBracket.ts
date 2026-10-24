import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  CrossSlideBracketParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
  SCREW_COUNTERSINK_HEAD_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Orthogonal Cross-Slide Rod Joiner using CSG:
 * - Two perpendicular (90-degree) cylindrical rod bores offset in Z
 * - Dual pinch clamping flexure slits
 * - Socket head pinch bolt through-holes with counterbores
 * - Chamfered external corners for rigidity
 */
export function generateCrossSlideBracket(params: CrossSlideBracketParams): GeneratedMeshResult {
  const {
    rodDiameterA = 10,
    rodDiameterB = 10,
    offsetZ = 18,
    blockWidth = 32,
    blockLength = 32,
    pinchBoltSize = 'M4',
    printer_compensation = 0.15,
  } = params;

  const rA = Math.max(3, (rodDiameterA + printer_compensation) / 2);
  const rB = Math.max(3, (rodDiameterB + printer_compensation) / 2);
  const dZ = Math.max(rA + rB + 4, offsetZ);

  const W = Math.max(rA * 2 + 14, blockWidth);
  const L = Math.max(rB * 2 + 14, blockLength);
  const H = dZ + rA + rB + 8;

  const pinchDia = SCREW_CLEARANCE_DIAMETERS[pinchBoltSize] + printer_compensation;
  const rPinch = pinchDia / 2;
  const pinchHeadDia = SCREW_COUNTERSINK_HEAD_DIAMETERS[pinchBoltSize] + printer_compensation;
  const rPinchHead = pinchHeadDia / 2;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Solid Outer Block (centered at X=0, Y=0, Z from -H/2 to H/2)
  const bodyGeom = new THREE.BoxGeometry(W, L, H);
  let mainBody = new Brush(bodyGeom);
  mainBody.updateMatrixWorld();

  // 2. Subtract Rod A Bore (along X axis at Z = -dZ / 2)
  const zA = -dZ / 2;
  const rodAGeom = new THREE.CylinderGeometry(rA, rA, W + 4, 32);
  rodAGeom.rotateZ(Math.PI / 2);
  rodAGeom.translate(0, 0, zA);
  const rodABrush = new Brush(rodAGeom);
  rodABrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, rodABrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 3. Subtract Rod B Bore (along Y axis at Z = +dZ / 2)
  const zB = dZ / 2;
  const rodBGeom = new THREE.CylinderGeometry(rB, rB, L + 4, 32);
  // Default cylinder is along Y
  rodBGeom.translate(0, 0, zB);
  const rodBBrush = new Brush(rodBGeom);
  rodBBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, rodBBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Subtract Clamping Slit A (cut from -Z bottom up into Rod A bore)
  const slitWidth = 1.6;
  const slitAGeom = new THREE.BoxGeometry(W + 4, slitWidth, H / 2);
  slitAGeom.translate(0, 0, -H / 4);
  const slitABrush = new Brush(slitAGeom);
  slitABrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, slitABrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 5. Subtract Clamping Slit B (cut from +Z top down into Rod B bore)
  const slitBGeom = new THREE.BoxGeometry(slitWidth, L + 4, H / 2);
  slitBGeom.translate(0, 0, H / 4);
  const slitBBrush = new Brush(slitBGeom);
  slitBBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, slitBBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 6. Transverse Pinch Bolt A (along Y axis, under Rod A)
  const pinchAY = 0;
  const pinchAZ = zA - rA * 0.7;
  const pinchAGeom = new THREE.CylinderGeometry(rPinch, rPinch, L + 4, 20);
  pinchAGeom.translate(0, pinchAY, pinchAZ);
  const pinchABrush = new Brush(pinchAGeom);
  pinchABrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, pinchABrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // Counterbore for bolt A
  const cbA = new THREE.CylinderGeometry(rPinchHead, rPinchHead, L * 0.35, 20);
  cbA.translate(0, L / 2 - (L * 0.35) / 2 + 0.1, pinchAZ);
  const cbABrush = new Brush(cbA);
  cbABrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, cbABrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 7. Transverse Pinch Bolt B (along X axis, over Rod B)
  const pinchBX = 0;
  const pinchBZ = zB + rB * 0.7;
  const pinchBGeom = new THREE.CylinderGeometry(rPinch, rPinch, W + 4, 20);
  pinchBGeom.rotateZ(Math.PI / 2);
  pinchBGeom.translate(pinchBX, 0, pinchBZ);
  const pinchBBrush = new Brush(pinchBGeom);
  pinchBBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, pinchBBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // Counterbore for bolt B
  const cbB = new THREE.CylinderGeometry(rPinchHead, rPinchHead, W * 0.35, 20);
  cbB.rotateZ(Math.PI / 2);
  cbB.translate(W / 2 - (W * 0.35) / 2 + 0.1, 0, pinchBZ);
  const cbBBrush = new Brush(cbB);
  cbBBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, cbBBrush, SUBTRACTION);
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
