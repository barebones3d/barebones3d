import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  EndstopMountParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Standard switch hole spacings (mm):
 * - OMRON SS-5 / Subminiature: 9.5mm spacing, M2.5 holes
 * - KW11 Mini: 10.0mm spacing, M2.5 holes
 * - Optical Slotted Flag: 19.0mm spacing, M3 holes
 */
const SWITCH_DATA: Record<string, { spacing: number; screw: string }> = {
  'omron-micro': { spacing: 9.5, screw: 'M2.5' },
  'kw11-mini': { spacing: 10.0, screw: 'M2.5' },
  'optical-slotted': { spacing: 19.0, screw: 'M3' },
};

/**
 * Generates an Adjustable Optical / Mechanical Microswitch Endstop Mount using CSG:
 * - Slotted track for precision homing position calibration along aluminum extrusions
 * - Predrilled switch mounting boss pattern
 * - Extrusion slot alignment lug preventing angular twist
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateEndstopMount(params: EndstopMountParams): GeneratedMeshResult {
  const {
    switchType = 'omron-micro',
    mountBodyLength = 32.0,
    mountBodyWidth = 20.0,
    bodyThickness = 5.0,
    slotAdjustLength = 14.0,
    extrusionMountScrew = 'M4',
    switchScrewSize = 'M2.5',
    hasSlotLug = true,
    printer_compensation = 0.15,
  } = params;

  const L = Math.max(22.0, mountBodyLength);
  const W = Math.max(14.0, mountBodyWidth);
  const T = Math.max(3.5, bodyThickness);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Base Plate Block
  const bodyGeom = new THREE.BoxGeometry(L, W, T);
  let mount = new Brush(bodyGeom);
  mount.position.set(0, 0, T / 2);
  mount.updateMatrixWorld();

  // 2. Extrusion Mounting Adjustment Slot (along X)
  const extScrewDia = (SCREW_CLEARANCE_DIAMETERS[extrusionMountScrew] || 4.5) + printer_compensation;
  const extR = extScrewDia / 2;
  const slotTravel = Math.min(L * 0.5, slotAdjustLength);

  // Slotted hole made by intersecting or unioning box and end cylinders
  const slotGeom = new THREE.BoxGeometry(slotTravel, extScrewDia, T * 2);
  const slotBrush = new Brush(slotGeom);
  slotBrush.position.set(-L * 0.22, 0, T / 2);
  slotBrush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, slotBrush, SUBTRACTION);
  mount.updateMatrixWorld();

  // Slot round end 1
  const cyl1Geom = new THREE.CylinderGeometry(extR, extR, T * 2, 24);
  cyl1Geom.rotateX(Math.PI / 2);
  const cyl1Brush = new Brush(cyl1Geom);
  cyl1Brush.position.set(-L * 0.22 - slotTravel / 2, 0, T / 2);
  cyl1Brush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, cyl1Brush, SUBTRACTION);
  mount.updateMatrixWorld();

  // Slot round end 2
  const cyl2Brush = new Brush(cyl1Geom);
  cyl2Brush.position.set(-L * 0.22 + slotTravel / 2, 0, T / 2);
  cyl2Brush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, cyl2Brush, SUBTRACTION);
  mount.updateMatrixWorld();

  // 3. Switch Mounting Holes (on the other end of the plate)
  const swData = SWITCH_DATA[switchType] || SWITCH_DATA['omron-micro'];
  const swScrewDia = (SCREW_CLEARANCE_DIAMETERS[switchScrewSize] || 2.8) + printer_compensation;
  const swR = swScrewDia / 2;
  const halfSpacing = swData.spacing / 2;
  const switchCenterX = L * 0.25;

  // Hole A
  const swHoleGeom = new THREE.CylinderGeometry(swR, swR, T * 2, 24);
  swHoleGeom.rotateX(Math.PI / 2);
  const swHoleA = new Brush(swHoleGeom);
  swHoleA.position.set(switchCenterX, -halfSpacing, T / 2);
  swHoleA.updateMatrixWorld();
  mount = evaluator.evaluate(mount, swHoleA, SUBTRACTION);
  mount.updateMatrixWorld();

  // Hole B
  const swHoleB = new Brush(swHoleGeom);
  swHoleB.position.set(switchCenterX, halfSpacing, T / 2);
  swHoleB.updateMatrixWorld();
  mount = evaluator.evaluate(mount, swHoleB, SUBTRACTION);
  mount.updateMatrixWorld();

  // 4. Extrusion Alignment Slot Lug (on bottom face Z < 0)
  if (hasSlotLug) {
    const lugW = 5.8 - printer_compensation;
    const lugH = 1.8;
    const lugGeom = new THREE.BoxGeometry(L * 0.85, lugW, lugH);
    const lugBrush = new Brush(lugGeom);
    lugBrush.position.set(0, 0, -lugH / 2);
    lugBrush.updateMatrixWorld();
    mount = evaluator.evaluate(mount, lugBrush, ADDITION);
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
