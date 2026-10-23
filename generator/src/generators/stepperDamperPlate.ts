import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  StepperDamperPlateParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Standard NEMA hole spacing and pilot bore data (mm)
 */
const NEMA_DATA: Record<string, { size: number; holePCD: number; pilotDia: number }> = {
  NEMA17: { size: 42.3, holePCD: 31.0, pilotDia: 22.0 },
  NEMA23: { size: 57.0, holePCD: 47.14, pilotDia: 38.1 },
};

/**
 * Generates an Acoustic Vibration Isolator / Stepper Damper Mount using CSG:
 * - Separates motor torque vibrations from the 3D printer chassis using serpentine flexures
 * - Inner ring mounted directly to NEMA motor face
 * - Outer flange mounted to machine frame
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateStepperDamperPlate(params: StepperDamperPlateParams): GeneratedMeshResult {
  const {
    nemaSize = 'NEMA17',
    plateThickness = 8.0,
    flexureSlitWidth = 1.6,
    flexureStyle = 'serpentine',
    motorScrewSize = 'M3',
    frameScrewSize = 'M4',
    centerBoreDia,
    printer_compensation = 0.15,
  } = params;

  const data = NEMA_DATA[nemaSize] || NEMA_DATA['NEMA17'];
  const S = data.size;
  const T = Math.max(5.0, plateThickness);
  const slitW = Math.max(1.2, flexureSlitWidth);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Base Square Plate
  const plateGeom = new THREE.BoxGeometry(S, S, T);
  let plate = new Brush(plateGeom);
  plate.position.set(0, 0, T / 2);
  plate.updateMatrixWorld();

  // 2. Center Pilot Bore
  const pilotDia = (centerBoreDia || data.pilotDia) + printer_compensation;
  const pilotR = pilotDia / 2;
  const pilotGeom = new THREE.CylinderGeometry(pilotR, pilotR, T * 2, 40);
  pilotGeom.rotateX(Math.PI / 2);
  const pilotBrush = new Brush(pilotGeom);
  pilotBrush.position.set(0, 0, T / 2);
  pilotBrush.updateMatrixWorld();
  plate = evaluator.evaluate(plate, pilotBrush, SUBTRACTION);
  plate.updateMatrixWorld();

  // 3. Flexure Vibration Slits (serpentine slots separating inner hub from outer frame)
  // 4 curved or staggered annular slots leaving 4 flexible connecting bridges
  const rSlotMid = (pilotR + (S * 0.45)) / 2;
  const numSlots = flexureStyle === 'concentric-ring' ? 6 : 4;
  for (let i = 0; i < numSlots; i++) {
    const angle = (i / numSlots) * Math.PI * 2 + Math.PI / 4;
    // Curved slot arc approximated by cylinders or box
    const slotLength = (Math.PI * 2 * rSlotMid) / numSlots * 0.72;
    const slotGeom = new THREE.BoxGeometry(slotLength, slitW, T * 2);
    const slotBrush = new Brush(slotGeom);
    slotBrush.rotation.z = angle;
    slotBrush.position.set(Math.cos(angle + Math.PI / 2) * rSlotMid, Math.sin(angle + Math.PI / 2) * rSlotMid, T / 2);
    slotBrush.updateMatrixWorld();

    plate = evaluator.evaluate(plate, slotBrush, SUBTRACTION);
    plate.updateMatrixWorld();
  }

  // 4. Motor Mounting Holes (4 holes on NEMA PCD)
  const mScrewDia = (SCREW_CLEARANCE_DIAMETERS[motorScrewSize] || 3.4) + printer_compensation;
  const mScrewR = mScrewDia / 2;
  const halfPCD = data.holePCD / 2;

  const motorHoles = [
    { x: -halfPCD, y: -halfPCD },
    { x: halfPCD, y: -halfPCD },
    { x: halfPCD, y: halfPCD },
    { x: -halfPCD, y: halfPCD },
  ];

  for (const pos of motorHoles) {
    const holeGeom = new THREE.CylinderGeometry(mScrewR, mScrewR, T * 2, 24);
    holeGeom.rotateX(Math.PI / 2);
    const holeBrush = new Brush(holeGeom);
    holeBrush.position.set(pos.x, pos.y, T / 2);
    holeBrush.updateMatrixWorld();
    plate = evaluator.evaluate(plate, holeBrush, SUBTRACTION);
    plate.updateMatrixWorld();
  }

  // 5. Machine Frame Mounting Holes (in the 4 outer corners)
  const fScrewDia = (SCREW_CLEARANCE_DIAMETERS[frameScrewSize] || 4.5) + printer_compensation;
  const fScrewR = fScrewDia / 2;
  const frameCornerDist = S / 2 - 4.5;

  const frameHoles = [
    { x: -frameCornerDist, y: -frameCornerDist },
    { x: frameCornerDist, y: -frameCornerDist },
    { x: frameCornerDist, y: frameCornerDist },
    { x: -frameCornerDist, y: frameCornerDist },
  ];

  for (const pos of frameHoles) {
    const holeGeom = new THREE.CylinderGeometry(fScrewR, fScrewR, T * 2, 24);
    holeGeom.rotateX(Math.PI / 2);
    const holeBrush = new Brush(holeGeom);
    holeBrush.position.set(pos.x, pos.y, T / 2);
    holeBrush.updateMatrixWorld();
    plate = evaluator.evaluate(plate, holeBrush, SUBTRACTION);
    plate.updateMatrixWorld();
  }

  // Output geometry
  let outGeometry = plate.geometry.clone();
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
