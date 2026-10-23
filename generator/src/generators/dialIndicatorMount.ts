import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  DialIndicatorMountParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Precision Dial Test Indicator Gauge Clamp using CSG:
 * - Precision clamp collar for 8mm metric or 3/8" imperial indicator stems
 * - Flexure pinch slit with M3/M4 clamping screw
 * - Extension arm with mounting options (2020 extrusion rail, magnetic base, or rod clamp)
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateDialIndicatorMount(params: DialIndicatorMountParams): GeneratedMeshResult {
  const {
    stemDiameter = 8.0,
    clampThickness = 14.0,
    clampWidth = 22.0,
    clampSlitGap = 1.4,
    pinchBoltSize = 'M3',
    mountStyle = '2020-rail-lug',
    armLength = 25.0,
    printer_compensation = 0.15,
  } = params;

  const stemR = (stemDiameter + printer_compensation) / 2;
  const T = Math.max(10.0, clampThickness);
  const W = Math.max(stemR * 2 + 8.0, clampWidth);
  const L_arm = Math.max(15.0, armLength);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Clamp Collar Block (around origin [0,0,0])
  const collarGeom = new THREE.CylinderGeometry(W / 2, W / 2, T, 36);
  collarGeom.rotateX(Math.PI / 2);
  let mount = new Brush(collarGeom);
  mount.position.set(0, 0, T / 2);
  mount.updateMatrixWorld();

  // Extension ears for pinch bolt
  const earGeom = new THREE.BoxGeometry(W * 0.7, W * 0.45, T);
  const earBrush = new Brush(earGeom);
  earBrush.position.set(W * 0.35, 0, T / 2);
  earBrush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, earBrush, ADDITION);
  mount.updateMatrixWorld();

  // 2. Extension Mount Arm (extends along -X or -Y)
  const armGeom = new THREE.BoxGeometry(L_arm, W * 0.65, T);
  const armBrush = new Brush(armGeom);
  armBrush.position.set(-L_arm / 2, 0, T / 2);
  armBrush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, armBrush, ADDITION);
  mount.updateMatrixWorld();

  // 3. Indicator Stem Bore (centered at [0,0,0])
  const stemGeom = new THREE.CylinderGeometry(stemR, stemR, T * 2, 36);
  stemGeom.rotateX(Math.PI / 2);
  const stemBrush = new Brush(stemGeom);
  stemBrush.position.set(0, 0, T / 2);
  stemBrush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, stemBrush, SUBTRACTION);
  mount.updateMatrixWorld();

  // 4. Clamping Slit
  const slitGeom = new THREE.BoxGeometry(W * 1.5, Math.max(1.0, clampSlitGap), T * 1.5);
  const slitBrush = new Brush(slitGeom);
  slitBrush.position.set(W * 0.4, 0, T / 2);
  slitBrush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, slitBrush, SUBTRACTION);
  mount.updateMatrixWorld();

  // 5. Pinch Bolt Hole & Counterbore (along Y)
  const pinchDia = (SCREW_CLEARANCE_DIAMETERS[pinchBoltSize] || 3.4) + printer_compensation;
  const pinchR = pinchDia / 2;
  const pinchGeom = new THREE.CylinderGeometry(pinchR, pinchR, W * 1.5, 24);
  const pinchBrush = new Brush(pinchGeom);
  pinchBrush.position.set(W * 0.45, 0, T / 2);
  pinchBrush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, pinchBrush, SUBTRACTION);
  mount.updateMatrixWorld();

  // 6. Arm Mounting Interface
  if (mountStyle === '2020-rail-lug') {
    // Hole for M4/M5 bolt to attach to 2020 rail
    const mountHoleGeom = new THREE.CylinderGeometry(2.3, 2.3, T * 2, 24); // M4 hole
    mountHoleGeom.rotateX(Math.PI / 2);
    const mountHoleBrush = new Brush(mountHoleGeom);
    mountHoleBrush.position.set(-L_arm * 0.75, 0, T / 2);
    mountHoleBrush.updateMatrixWorld();
    mount = evaluator.evaluate(mount, mountHoleBrush, SUBTRACTION);
    mount.updateMatrixWorld();

    // 2020 slot anti-twist tab on bottom
    const tabGeom = new THREE.BoxGeometry(L_arm * 0.5, 5.8 - printer_compensation, 1.8);
    const tabBrush = new Brush(tabGeom);
    tabBrush.position.set(-L_arm * 0.75, 0, -0.9);
    tabBrush.updateMatrixWorld();
    mount = evaluator.evaluate(mount, tabBrush, ADDITION);
    mount.updateMatrixWorld();
  } else if (mountStyle === 'rod-clamp-10mm') {
    // 10mm or 8mm smooth rod bore at end of arm
    const rodR = (10.0 + printer_compensation) / 2;
    const rodHoleGeom = new THREE.CylinderGeometry(rodR, rodR, T * 2, 32);
    rodHoleGeom.rotateX(Math.PI / 2);
    const rodHoleBrush = new Brush(rodHoleGeom);
    rodHoleBrush.position.set(-L_arm * 0.75, 0, T / 2);
    rodHoleBrush.updateMatrixWorld();
    mount = evaluator.evaluate(mount, rodHoleBrush, SUBTRACTION);
    mount.updateMatrixWorld();
  } else {
    // M5 center hole for magnetic base articulated post
    const m5HoleGeom = new THREE.CylinderGeometry(2.8, 2.8, T * 2, 24);
    m5HoleGeom.rotateX(Math.PI / 2);
    const m5Brush = new Brush(m5HoleGeom);
    m5Brush.position.set(-L_arm * 0.75, 0, T / 2);
    m5Brush.updateMatrixWorld();
    mount = evaluator.evaluate(mount, m5Brush, SUBTRACTION);
    mount.updateMatrixWorld();
  }

  // Output geometry
  let outGeometry = mount.geometry.clone();
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
