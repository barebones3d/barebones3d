import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  PiezoMountParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Piezoelectric Disc 3D Printer Contact Probe Mount using CSG:
 * - Recessed seat for 20mm or 27mm brass piezo buzzer disc
 * - Peripheral flexure diaphragm annular channel for sensitive micro-deflection
 * - Central nozzle contact pin aperture
 * - Peripheral mounting bolt tabs
 */
export function generatePiezoMount(params: PiezoMountParams): GeneratedMeshResult {
  const {
    piezoDiscDiameter = 20,
    mountRingOD = 32,
    diaphragmClearance = 1.2,
    bodyThickness = 6,
    contactPinDiameter = 3.5,
    mountScrewSize = 'M3',
    mountHoleCount = 3,
    printer_compensation = 0.15,
  } = params;

  const D_piezo = (piezoDiscDiameter === 27 ? 27.2 : 20.2) + printer_compensation;
  const R_piezo = D_piezo / 2;
  const D_outer = Math.max(D_piezo + 8, mountRingOD);
  const R_outer = D_outer / 2;
  const T = Math.max(4, bodyThickness);

  const D_pin = Math.max(2.0, contactPinDiameter + printer_compensation);
  const rPin = D_pin / 2;

  const screwDia = SCREW_CLEARANCE_DIAMETERS[mountScrewSize] + printer_compensation;
  const rScrew = screwDia / 2;
  const numMounts = mountHoleCount === 4 ? 4 : 3;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Main Annular Body Disc (Z from 0 to T)
  const bodyGeom = new THREE.CylinderGeometry(R_outer, R_outer, T, 48);
  bodyGeom.rotateX(Math.PI / 2);
  bodyGeom.translate(0, 0, T / 2);
  let mainBody = new Brush(bodyGeom);
  mainBody.updateMatrixWorld();

  // 2. Add Perimeter Mounting Lugs / Ears
  const lugRadius = rScrew + 3.0;
  const lugPCD = R_outer + lugRadius * 0.7;
  for (let m = 0; m < numMounts; m++) {
    const angle = (m / numMounts) * Math.PI * 2;
    const lx = Math.cos(angle) * lugPCD;
    const ly = Math.sin(angle) * lugPCD;

    const lugGeom = new THREE.CylinderGeometry(lugRadius, lugRadius, T, 24);
    lugGeom.rotateX(Math.PI / 2);
    lugGeom.translate(lx, ly, T / 2);
    const lugBrush = new Brush(lugGeom);
    lugBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, lugBrush, ADDITION);
    mainBody.updateMatrixWorld();
  }

  // 3. Subtract Piezo Disc Recessed Pocket (from top Z = T down to T - 1.5)
  const piezoDepth = 1.6;
  const piezoSeatGeom = new THREE.CylinderGeometry(R_piezo, R_piezo, piezoDepth * 2, 48);
  piezoSeatGeom.rotateX(Math.PI / 2);
  piezoSeatGeom.translate(0, 0, T);
  const piezoSeatBrush = new Brush(piezoSeatGeom);
  piezoSeatBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, piezoSeatBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Subtract Annular Diaphragm Flexure Channel beneath the brass ring perimeter
  const flexWidth = 2.0;
  const flexDepth = Math.max(0.8, diaphragmClearance);
  const flexR = R_piezo * 0.75;
  const flexOuter = flexR + flexWidth / 2;
  const flexInner = flexR - flexWidth / 2;

  const fOutGeom = new THREE.CylinderGeometry(flexOuter, flexOuter, flexDepth * 2, 48);
  fOutGeom.rotateX(Math.PI / 2);
  fOutGeom.translate(0, 0, T - piezoDepth);

  const fInGeom = new THREE.CylinderGeometry(flexInner, flexInner, flexDepth * 2 + 1, 48);
  fInGeom.rotateX(Math.PI / 2);
  fInGeom.translate(0, 0, T - piezoDepth);

  let fBrush = new Brush(fOutGeom);
  fBrush.updateMatrixWorld();
  const fiBrush = new Brush(fInGeom);
  fiBrush.updateMatrixWorld();
  fBrush = evaluator.evaluate(fBrush, fiBrush, SUBTRACTION);
  fBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, fBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 5. Subtract Central Contact Pin Through-Hole
  const pinHoleGeom = new THREE.CylinderGeometry(rPin, rPin, T + 4, 24);
  pinHoleGeom.rotateX(Math.PI / 2);
  pinHoleGeom.translate(0, 0, T / 2);
  const pinHoleBrush = new Brush(pinHoleGeom);
  pinHoleBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, pinHoleBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 6. Subtract Mounting Screw Holes through lugs
  for (let m = 0; m < numMounts; m++) {
    const angle = (m / numMounts) * Math.PI * 2;
    const lx = Math.cos(angle) * lugPCD;
    const ly = Math.sin(angle) * lugPCD;

    const mHoleGeom = new THREE.CylinderGeometry(rScrew, rScrew, T + 4, 20);
    mHoleGeom.rotateX(Math.PI / 2);
    mHoleGeom.translate(lx, ly, T / 2);
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
