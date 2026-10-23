import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  TNutSlotParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Roll-In / Drop-In Hammer T-Nut for Aluminum Extrusions:
 * - Angled cam corners enabling 90° self-alignment inside extrusion slots when bolt is torqued
 * - Stepped guide lip centering the nut in the slot channel
 * - Threaded screw clearance hole (M3/M4/M5/M6)
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateTNutSlot(params: TNutSlotParams): GeneratedMeshResult {
  const {
    slotSize,
    threadSize = 'M4',
    nutLength = 12.0,
    nutWidth = 6.0,
    headHeight = 4.5,
    hasAntiRotationRidge = true,
    printer_compensation = 0.15,
  } = params;

  const L = Math.max(8.0, nutLength);
  const W = Math.max(5.0, nutWidth);
  const H = Math.max(3.0, headHeight);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Base diamond/chamfered rectangle body
  // Length along X, width along Y, thickness along Z
  const baseGeom = new THREE.BoxGeometry(L, W, H);
  let nut = new Brush(baseGeom);
  nut.position.set(0, 0, H / 2);
  nut.updateMatrixWorld();

  // 2. Roll-in diagonal cam corner cuts (cuts opposing corners at 45°)
  const camCutSize = W * 0.45;
  const cutGeom = new THREE.BoxGeometry(camCutSize * 2, camCutSize * 2, H * 1.5);
  cutGeom.rotateZ(Math.PI / 4);

  // Corner 1: (+X, +Y)
  const cut1 = new Brush(cutGeom);
  cut1.position.set(L / 2, W / 2, H / 2);
  cut1.updateMatrixWorld();
  nut = evaluator.evaluate(nut, cut1, SUBTRACTION);
  nut.updateMatrixWorld();

  // Corner 2: (-X, -Y)
  const cut2 = new Brush(cutGeom);
  cut2.position.set(-L / 2, -W / 2, H / 2);
  cut2.updateMatrixWorld();
  nut = evaluator.evaluate(nut, cut2, SUBTRACTION);
  nut.updateMatrixWorld();

  // 3. Slot alignment step guide (if requested)
  // Extends upward to center inside the slot lip
  if (hasAntiRotationRidge) {
    const slotW = slotSize === 'slot-8' ? 7.6 : 5.8;
    const ridgeW = Math.min(W * 0.75, slotW - printer_compensation);
    const ridgeH = 1.4;

    const ridgeGeom = new THREE.BoxGeometry(L * 0.8, ridgeW, ridgeH);
    const ridgeBrush = new Brush(ridgeGeom);
    ridgeBrush.position.set(0, 0, H + ridgeH / 2);
    ridgeBrush.updateMatrixWorld();

    nut = evaluator.evaluate(nut, ridgeBrush, ADDITION);
    nut.updateMatrixWorld();
  }

  // 4. Center Thread / Screw Hole
  const screwDia = (SCREW_CLEARANCE_DIAMETERS[threadSize] || 4.5) + printer_compensation;
  const screwR = screwDia / 2;

  const holeGeom = new THREE.CylinderGeometry(screwR, screwR, H * 3, 32);
  holeGeom.rotateX(Math.PI / 2);
  const holeBrush = new Brush(holeGeom);
  holeBrush.position.set(0, 0, H / 2);
  holeBrush.updateMatrixWorld();

  nut = evaluator.evaluate(nut, holeBrush, SUBTRACTION);
  nut.updateMatrixWorld();

  // Output geometry
  let outGeometry = nut.geometry.clone();
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
