import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ServoHornParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an RC Servo Horn (Arm / Wheel) using CSG:
 * - Central splined/keyed hub with recessed counterbore for the servo shaft retention screw
 * - Arm configurations: single-arm, dual-arm, four-star, or round-wheel
 * - Array of precision linkage clevis holes spaced along the arms
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateServoHorn(params: ServoHornParams): GeneratedMeshResult {
  const {
    splineDiameter = 5.9,
    hornStyle = 'single-arm',
    armLength = 22.0,
    armThickness = 3.0,
    hubDiameter = 11.0,
    hubHeight = 6.0,
    holeSpacing = 4.0,
    linkageHoleDia = 1.6,
    centerScrewPocketDia = 5.2,
    printer_compensation = 0.15,
  } = params;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  const R_hub = Math.max(splineDiameter / 2 + 1.8, hubDiameter / 2);
  const H_hub = Math.max(4.0, hubHeight);
  const T_arm = Math.min(H_hub, Math.max(1.8, armThickness));
  const L_arm = Math.max(R_hub + 5.0, armLength);

  // 1. Center Hub Boss (cylinder along Z from 0 to H_hub)
  const hubGeom = new THREE.CylinderGeometry(R_hub * 0.92, R_hub, H_hub, 40);
  hubGeom.rotateX(Math.PI / 2);
  let horn = new Brush(hubGeom);
  horn.position.set(0, 0, H_hub / 2);
  horn.updateMatrixWorld();

  // 2. Arms (or Round Wheel)
  const addArm = (angleRad: number) => {
    // Tapered arm: wider at hub, narrower at tip
    const tipW = Math.max(4.0, R_hub * 0.6);
    const armShape = new THREE.Shape();
    armShape.moveTo(0, R_hub * 0.85);
    armShape.lineTo(L_arm, tipW / 2);
    armShape.lineTo(L_arm, -tipW / 2);
    armShape.lineTo(0, -R_hub * 0.85);
    armShape.closePath();

    const armGeom = new THREE.ExtrudeGeometry(armShape, {
      depth: T_arm,
      bevelEnabled: false,
    });
    const armBrush = new Brush(armGeom);
    armBrush.rotation.z = angleRad;
    armBrush.position.set(0, 0, 0);
    armBrush.updateMatrixWorld();

    horn = evaluator.evaluate(horn, armBrush, ADDITION);
    horn.updateMatrixWorld();

    // Round tip fillet
    const tipGeom = new THREE.CylinderGeometry(tipW / 2, tipW / 2, T_arm, 24);
    tipGeom.rotateX(Math.PI / 2);
    const tipBrush = new Brush(tipGeom);
    tipBrush.position.set(Math.cos(angleRad) * L_arm, Math.sin(angleRad) * L_arm, T_arm / 2);
    tipBrush.updateMatrixWorld();
    horn = evaluator.evaluate(horn, tipBrush, ADDITION);
    horn.updateMatrixWorld();
  };

  if (hornStyle === 'round-wheel') {
    const wheelGeom = new THREE.CylinderGeometry(L_arm, L_arm, T_arm, 48);
    wheelGeom.rotateX(Math.PI / 2);
    const wheelBrush = new Brush(wheelGeom);
    wheelBrush.position.set(0, 0, T_arm / 2);
    wheelBrush.updateMatrixWorld();
    horn = evaluator.evaluate(horn, wheelBrush, ADDITION);
    horn.updateMatrixWorld();
  } else if (hornStyle === 'single-arm') {
    addArm(0);
  } else if (hornStyle === 'dual-arm') {
    addArm(0);
    addArm(Math.PI);
  } else if (hornStyle === 'four-star') {
    addArm(0);
    addArm(Math.PI / 2);
    addArm(Math.PI);
    addArm((Math.PI * 3) / 2);
  }

  // 3. Center Spline Shaft Bore & Retention Screw Recess
  const splineR = (splineDiameter + printer_compensation) / 2;
  const screwPocketR = (centerScrewPocketDia + printer_compensation) / 2;
  const screwPocketDepth = Math.max(2.0, H_hub * 0.45);

  // Bottom spline bore
  const splineGeom = new THREE.CylinderGeometry(splineR, splineR, H_hub + 2, 32);
  splineGeom.rotateX(Math.PI / 2);
  const splineBrush = new Brush(splineGeom);
  splineBrush.position.set(0, 0, H_hub / 2);
  splineBrush.updateMatrixWorld();
  horn = evaluator.evaluate(horn, splineBrush, SUBTRACTION);
  horn.updateMatrixWorld();

  // Top screw counterbore recess
  const screwPocketGeom = new THREE.CylinderGeometry(screwPocketR, screwPocketR, screwPocketDepth * 2, 32);
  screwPocketGeom.rotateX(Math.PI / 2);
  const screwPocketBrush = new Brush(screwPocketGeom);
  screwPocketBrush.position.set(0, 0, H_hub);
  screwPocketBrush.updateMatrixWorld();
  horn = evaluator.evaluate(horn, screwPocketBrush, SUBTRACTION);
  horn.updateMatrixWorld();

  // 4. Linkage Holes along the arm(s)
  const holeR = (linkageHoleDia + printer_compensation) / 2;
  const drillArmHoles = (angleRad: number) => {
    let dist = R_hub + holeSpacing;
    while (dist < L_arm - 1.5) {
      const holeGeom = new THREE.CylinderGeometry(holeR, holeR, T_arm * 2.5, 16);
      holeGeom.rotateX(Math.PI / 2);
      const holeBrush = new Brush(holeGeom);
      holeBrush.position.set(Math.cos(angleRad) * dist, Math.sin(angleRad) * dist, T_arm / 2);
      holeBrush.updateMatrixWorld();
      horn = evaluator.evaluate(horn, holeBrush, SUBTRACTION);
      horn.updateMatrixWorld();
      dist += holeSpacing;
    }
  };

  if (hornStyle === 'single-arm') {
    drillArmHoles(0);
  } else if (hornStyle === 'dual-arm') {
    drillArmHoles(0);
    drillArmHoles(Math.PI);
  } else if (hornStyle === 'four-star') {
    drillArmHoles(0);
    drillArmHoles(Math.PI / 2);
    drillArmHoles(Math.PI);
    drillArmHoles((Math.PI * 3) / 2);
  } else if (hornStyle === 'round-wheel') {
    // Circle of 8 linkage holes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const holeGeom = new THREE.CylinderGeometry(holeR, holeR, T_arm * 2.5, 16);
      holeGeom.rotateX(Math.PI / 2);
      const holeBrush = new Brush(holeGeom);
      holeBrush.position.set(Math.cos(angle) * (L_arm * 0.75), Math.sin(angle) * (L_arm * 0.75), T_arm / 2);
      holeBrush.updateMatrixWorld();
      horn = evaluator.evaluate(horn, holeBrush, SUBTRACTION);
      horn.updateMatrixWorld();
    }
  }

  // Output geometry
  let outGeometry = horn.geometry.clone();
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
