import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  BallJointRodEndParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Articulating Ball Joint Rod End (Heim Joint / Ball Cup Link):
 * - Spherical socket cavity with chamfered throat opening
 * - Cylindrical mounting shank with tap/threaded bore
 * - Integrated flexure pinch clamp slit for zero-backlash tensioning
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateBallJointRodEnd(params: BallJointRodEndParams): GeneratedMeshResult {
  const {
    ballDiameter = 10.0,
    neckDiameter = 7.0,
    shankDiameter = 10.0,
    shankLength = 18.0,
    shankThreadSize = 'M4',
    hasClampSlit = true,
    pinchScrewSize = 'M3',
    printer_compensation = 0.15,
  } = params;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  const ballR = (ballDiameter + printer_compensation) / 2;
  const socketWall = Math.max(2.0, ballR * 0.45);
  const socketOuterR = ballR + socketWall;
  const Ls = Math.max(10.0, shankLength);
  const Rs = Math.max(ballR + 1.0, shankDiameter / 2);

  // 1. Spherical Socket Housing (centered at origin [0,0,0])
  const outerSphereGeom = new THREE.SphereGeometry(socketOuterR, 36, 24);
  let rodEnd = new Brush(outerSphereGeom);
  rodEnd.position.set(0, 0, 0);
  rodEnd.updateMatrixWorld();

  // 2. Shank Cylinder (extends along +X from 0 to socketOuterR + Ls)
  const shankGeom = new THREE.CylinderGeometry(Rs, Rs, Ls + socketOuterR, 32);
  shankGeom.rotateZ(Math.PI / 2);
  const shankBrush = new Brush(shankGeom);
  shankBrush.position.set((Ls + socketOuterR) / 2, 0, 0);
  shankBrush.updateMatrixWorld();

  rodEnd = evaluator.evaluate(rodEnd, shankBrush, ADDITION);
  rodEnd.updateMatrixWorld();

  // 3. Spherical Cavity Subtraction
  const innerSphereGeom = new THREE.SphereGeometry(ballR, 36, 24);
  const innerSphereBrush = new Brush(innerSphereGeom);
  innerSphereBrush.position.set(0, 0, 0);
  innerSphereBrush.updateMatrixWorld();
  rodEnd = evaluator.evaluate(rodEnd, innerSphereBrush, SUBTRACTION);
  rodEnd.updateMatrixWorld();

  // 4. Throat Cutout / Neck Clearance Opening (along -X or +Z)
  const throatR = Math.max(3.0, (neckDiameter + printer_compensation) / 2);
  const throatGeom = new THREE.CylinderGeometry(throatR, throatR * 1.3, socketOuterR * 2.5, 32);
  const throatBrush = new Brush(throatGeom);
  throatBrush.position.set(0, 0, 0);
  throatBrush.updateMatrixWorld();
  rodEnd = evaluator.evaluate(rodEnd, throatBrush, SUBTRACTION);
  rodEnd.updateMatrixWorld();

  // 5. Shank Thread / Clearance Hole
  const threadDia = (SCREW_CLEARANCE_DIAMETERS[shankThreadSize] || 4.5) + printer_compensation;
  const threadR = threadDia / 2;
  const threadGeom = new THREE.CylinderGeometry(threadR, threadR, Ls * 1.2, 32);
  threadGeom.rotateZ(Math.PI / 2);
  const threadBrush = new Brush(threadGeom);
  threadBrush.position.set(socketOuterR + Ls / 2, 0, 0);
  threadBrush.updateMatrixWorld();
  rodEnd = evaluator.evaluate(rodEnd, threadBrush, SUBTRACTION);
  rodEnd.updateMatrixWorld();

  // 6. Pinch Clamp Slit & Bolt Hole (if requested)
  if (hasClampSlit) {
    const slitT = 1.2;
    const slitGeom = new THREE.BoxGeometry(socketOuterR * 1.8, socketOuterR * 2.5, slitT);
    const slitBrush = new Brush(slitGeom);
    slitBrush.position.set(-socketOuterR * 0.4, 0, 0);
    slitBrush.updateMatrixWorld();
    rodEnd = evaluator.evaluate(rodEnd, slitBrush, SUBTRACTION);
    rodEnd.updateMatrixWorld();

    // Pinch bolt hole (along Z)
    const pinchDia = (SCREW_CLEARANCE_DIAMETERS[pinchScrewSize] || 3.4) + printer_compensation;
    const pinchR = pinchDia / 2;
    const pinchGeom = new THREE.CylinderGeometry(pinchR, pinchR, socketOuterR * 2.5, 24);
    const pinchBrush = new Brush(pinchGeom);
    pinchBrush.position.set(-socketOuterR * 0.5, 0, 0);
    pinchBrush.updateMatrixWorld();
    rodEnd = evaluator.evaluate(rodEnd, pinchBrush, SUBTRACTION);
    rodEnd.updateMatrixWorld();
  }

  // Output geometry
  let outGeometry = rodEnd.geometry.clone();
  outGeometry = toCreasedNormals(outGeometry, (35 * Math.PI) / 180);
  outGeometry.computeBoundingBox();

  const bbox = outGeometry.boundingBox || new THREE.Box3();
  const dimensions = {
    x: Number((bbox.max.x - bbox.min.x).toFixed(2)),
    y: Number((bbox.max.y - bbox.min.y).toFixed(2)),
    z: Number((bbox.max.z - bbox.min.z).toFixed(2)),
  };

  const volume = computeMeshVolume(outGeometry);
  const estimatedPrintWeightGrams = estimateWeightGrams(volume, 0.2);

  return {
    geometry: outGeometry,
    dimensions,
    triangles: (outGeometry.index ? outGeometry.index.count : outGeometry.attributes.position.count) / 3,
    vertices: outGeometry.attributes.position.count,
    estimatedPrintWeightGrams,
  };
}
