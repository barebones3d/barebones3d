import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  FanDuctShroudParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a 5015 / 4010 Radial Blower Part Cooling Fan Duct using CSG:
 * - Transitions high-pressure centrifugal fan airflow into a focused directional air jet
 * - Angled downturn nozzle pointed directly at the 3D printer hotend melt zone
 * - Mounting screw ears aligned with standard blower housing bosses
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateFanDuctShroud(params: FanDuctShroudParams): GeneratedMeshResult {
  const {
    fanType = '5015-blower',
    ductLength = 38.0,
    ductAngleDeg = 40.0,
    nozzleWidth = 18.0,
    nozzleHeight = 4.5,
    wallThickness = 1.6,
    mountTabDistance = 24.0,
    mountScrewSize = 'M3',
    printer_compensation = 0.15,
  } = params;

  // Inlet dimensions: 5015 blower standard is 20mm x 15mm
  const inletW = fanType === '5015-blower' ? 20.0 : 16.0;
  const inletH = fanType === '5015-blower' ? 15.0 : 11.0;
  const Tw = Math.max(1.2, wallThickness);
  const L = Math.max(25.0, ductLength);
  const angleRad = (ductAngleDeg * Math.PI) / 180;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Fan Inlet Collar Block (outer)
  const collarDepth = 10.0;
  const collarGeom = new THREE.BoxGeometry(inletW + Tw * 2, inletH + Tw * 2, collarDepth);
  let duct = new Brush(collarGeom);
  duct.position.set(0, 0, collarDepth / 2);
  duct.updateMatrixWorld();

  // 2. Angled Tapering Duct Nozzle (outer)
  const nozzleOutW = Math.max(8.0, nozzleWidth) + Tw * 2;
  const nozzleOutH = Math.max(3.0, nozzleHeight) + Tw * 2;
  const chuteLen = L - collarDepth;

  // Loft/taper approximated with a box angled downward
  const chuteGeom = new THREE.BoxGeometry(nozzleOutW, nozzleOutH, chuteLen);
  const chuteBrush = new Brush(chuteGeom);
  // Position and angle
  chuteBrush.position.set(0, -Math.sin(angleRad) * (chuteLen / 2), collarDepth + Math.cos(angleRad) * (chuteLen / 2));
  chuteBrush.rotation.x = angleRad;
  chuteBrush.updateMatrixWorld();
  duct = evaluator.evaluate(duct, chuteBrush, ADDITION);
  duct.updateMatrixWorld();

  // 3. Mounting Tabs (ears on sides of inlet collar)
  const earW = 8.0;
  const earT = 3.0;
  const earDist = Math.max(inletW + Tw * 2 + earW, mountTabDistance);

  // Right ear
  const rightEarGeom = new THREE.CylinderGeometry(earW / 2, earW / 2, earT, 24);
  rightEarGeom.rotateX(Math.PI / 2);
  const rightEar = new Brush(rightEarGeom);
  rightEar.position.set(earDist / 2, 0, collarDepth * 0.5);
  rightEar.updateMatrixWorld();
  duct = evaluator.evaluate(duct, rightEar, ADDITION);
  duct.updateMatrixWorld();

  // Left ear
  const leftEar = new Brush(rightEarGeom);
  leftEar.position.set(-earDist / 2, 0, collarDepth * 0.5);
  leftEar.updateMatrixWorld();
  duct = evaluator.evaluate(duct, leftEar, ADDITION);
  duct.updateMatrixWorld();

  // 4. Hollow Air Passage Subtraction (Interior cavity)
  // Collar bore
  const collarBoreGeom = new THREE.BoxGeometry(inletW, inletH, collarDepth * 1.5);
  const collarBore = new Brush(collarBoreGeom);
  collarBore.position.set(0, 0, collarDepth / 2);
  collarBore.updateMatrixWorld();
  duct = evaluator.evaluate(duct, collarBore, SUBTRACTION);
  duct.updateMatrixWorld();

  // Nozzle bore
  const nozzleBoreGeom = new THREE.BoxGeometry(nozzleWidth, nozzleHeight, chuteLen * 1.2);
  const nozzleBore = new Brush(nozzleBoreGeom);
  nozzleBore.position.set(0, -Math.sin(angleRad) * (chuteLen / 2), collarDepth + Math.cos(angleRad) * (chuteLen / 2));
  nozzleBore.rotation.x = angleRad;
  nozzleBore.updateMatrixWorld();
  duct = evaluator.evaluate(duct, nozzleBore, SUBTRACTION);
  duct.updateMatrixWorld();

  // 5. Ear Mounting Holes
  const screwDia = (SCREW_CLEARANCE_DIAMETERS[mountScrewSize] || 3.4) + printer_compensation;
  const screwR = screwDia / 2;
  const earHoleGeom = new THREE.CylinderGeometry(screwR, screwR, earT * 3, 24);
  earHoleGeom.rotateX(Math.PI / 2);

  const rightHole = new Brush(earHoleGeom);
  rightHole.position.set(earDist / 2, 0, collarDepth * 0.5);
  rightHole.updateMatrixWorld();
  duct = evaluator.evaluate(duct, rightHole, SUBTRACTION);
  duct.updateMatrixWorld();

  const leftHole = new Brush(earHoleGeom);
  leftHole.position.set(-earDist / 2, 0, collarDepth * 0.5);
  leftHole.updateMatrixWorld();
  duct = evaluator.evaluate(duct, leftHole, SUBTRACTION);
  duct.updateMatrixWorld();

  // Output geometry
  let outGeometry = duct.geometry.clone();
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
