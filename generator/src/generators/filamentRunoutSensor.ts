import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  FilamentRunoutSensorParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Enclosed 3D Printer Filament Runout Sensor Body using CSG:
 * - Straight low-friction filament guide channel with entry/exit funnels
 * - Cavity for KW11 or OMRON SS-5 microswitch lever
 * - Pneumatic Bowden coupler ports (PC4-M6 or PC4-M10)
 * - Extrusion frame mounting holes
 */
export function generateFilamentRunoutSensor(params: FilamentRunoutSensorParams): GeneratedMeshResult {
  const {
    filamentDiameter = 1.75,
    microswitchType = 'kw11',
    bodyLength = 36,
    bodyWidth = 24,
    bodyHeight = 16,
    couplerThread = 'M6',
    mountHoleSpacing = 20,
    mountScrewSize = 'M3',
    printer_compensation = 0.15,
  } = params;

  const L = Math.max(30, bodyLength);
  const W = Math.max(20, bodyWidth);
  const H = Math.max(14, bodyHeight);

  // Filament channel diameter
  const D_fil = (filamentDiameter === 2.85 ? 3.2 : 2.1) + printer_compensation;
  const rFil = D_fil / 2;

  const screwDia = SCREW_CLEARANCE_DIAMETERS[mountScrewSize] + printer_compensation;
  const rScrew = screwDia / 2;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Solid Enclosure Block (centered at X=0, Y=0, Z=0)
  const bodyGeom = new THREE.BoxGeometry(L, W, H);
  let mainBody = new Brush(bodyGeom);
  mainBody.updateMatrixWorld();

  // 2. Subtract Continuous Filament Channel through center (along X axis at Y=0, Z=0)
  const filChannelGeom = new THREE.CylinderGeometry(rFil, rFil, L + 4, 24);
  filChannelGeom.rotateZ(Math.PI / 2);
  const filChannelBrush = new Brush(filChannelGeom);
  filChannelBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, filChannelBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 3. Entry and Exit Funnels (conical flares for easy filament insertion)
  const funnelDepth = 3.5;
  const funnelRadius = rFil + 2.5;

  // Inlet funnel (at -X)
  const inFunnelGeom = new THREE.CylinderGeometry(rFil, funnelRadius, funnelDepth, 24);
  inFunnelGeom.rotateZ(Math.PI / 2);
  inFunnelGeom.translate(-L / 2 + funnelDepth / 2 - 0.1, 0, 0);
  const inFunnelBrush = new Brush(inFunnelGeom);
  inFunnelBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, inFunnelBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // Outlet funnel (at +X)
  const outFunnelGeom = new THREE.CylinderGeometry(funnelRadius, rFil, funnelDepth, 24);
  outFunnelGeom.rotateZ(Math.PI / 2);
  outFunnelGeom.translate(L / 2 - funnelDepth / 2 + 0.1, 0, 0);
  const outFunnelBrush = new Brush(outFunnelGeom);
  outFunnelBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, outFunnelBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Pneumatic Bowden Coupler Ports (M6 or M10 bore at entrance and exit)
  if (couplerThread !== 'none-smooth') {
    const threadDia = couplerThread === 'M10' ? 9.5 : 5.8;
    const rThread = (threadDia + printer_compensation) / 2;
    const threadDepth = 6.0;

    // Inlet coupler pocket
    const inCplGeom = new THREE.CylinderGeometry(rThread, rThread, threadDepth, 24);
    inCplGeom.rotateZ(Math.PI / 2);
    inCplGeom.translate(-L / 2 + threadDepth / 2, 0, 0);
    const inCplBrush = new Brush(inCplGeom);
    inCplBrush.updateMatrixWorld();
    mainBody = evaluator.evaluate(mainBody, inCplBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();

    // Outlet coupler pocket
    const outCplGeom = new THREE.CylinderGeometry(rThread, rThread, threadDepth, 24);
    outCplGeom.rotateZ(Math.PI / 2);
    outCplGeom.translate(L / 2 - threadDepth / 2, 0, 0);
    const outCplBrush = new Brush(outCplGeom);
    outCplBrush.updateMatrixWorld();
    mainBody = evaluator.evaluate(mainBody, outCplBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();
  }

  // 5. Internal Microswitch Pocket (positioned at +Y side intersecting filament path)
  // KW11 is approx 20mm x 10.5mm x 6.5mm, SS-5 is 19.8mm x 10.2mm x 6.4mm
  const swLength = microswitchType === 'kw11' ? 20.5 : 19.8;
  const swWidth = 10.5;
  const swDepth = 7.0;

  const swCavityGeom = new THREE.BoxGeometry(swLength, swWidth, swDepth);
  swCavityGeom.translate(0, swWidth / 2 - 1.5, 0);
  const swCavityBrush = new Brush(swCavityGeom);
  swCavityBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, swCavityBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // Wire exit slot for microswitch terminals (open to top +Z face)
  const wireSlotGeom = new THREE.BoxGeometry(swLength * 0.7, swWidth, H / 2 + 2);
  wireSlotGeom.translate(0, swWidth / 2, H / 4);
  const wireSlotBrush = new Brush(wireSlotGeom);
  wireSlotBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, wireSlotBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 6. Subtract Mounting Screw Holes (along Z axis on -Y base lip)
  const mountHoleDist = Math.max(14, Math.min(L - 10, mountHoleSpacing));
  const mountY = -W / 2 + 5.5;

  const mHole1Geom = new THREE.CylinderGeometry(rScrew, rScrew, H + 4, 20);
  mHole1Geom.translate(-mountHoleDist / 2, mountY, 0);
  const mHole1Brush = new Brush(mHole1Geom);
  mHole1Brush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, mHole1Brush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  const mHole2Geom = new THREE.CylinderGeometry(rScrew, rScrew, H + 4, 20);
  mHole2Geom.translate(mountHoleDist / 2, mountY, 0);
  const mHole2Brush = new Brush(mHole2Geom);
  mHole2Brush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, mHole2Brush, SUBTRACTION);
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
    dimensions: { x: Number(sz.x.toFixed(2)), y: Number(sz.y.toFixed(2)), z: Number(sz.z.toFixed(2)) },
    triangles: finalGeom.index ? finalGeom.index.count / 3 : finalGeom.attributes.position.count / 3,
    vertices: finalGeom.attributes.position.count,
    estimatedPrintWeightGrams: weight,
  };
}
