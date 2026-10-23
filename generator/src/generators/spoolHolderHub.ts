import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  SpoolHolderHubParams,
  GeneratedMeshResult,
  BEARING_PRESET_DATA,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Universal Conical Filament Spool Centering Hub:
 * - Smooth stepped conical taper adapting 50mm to 75mm spool center openings
 * - Outer retaining lip flange keeping the spool seated
 * - 608/624 ball bearing press-fit pocket or smooth axle rod bore
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateSpoolHolderHub(params: SpoolHolderHubParams): GeneratedMeshResult {
  const {
    spoolBoreMin = 52.0,
    spoolBoreMax = 72.0,
    coneLength = 35.0,
    flangeDiameter = 80.0,
    bearingType = '608',
    axleRodDiameter = 8.0,
    printer_compensation = 0.15,
  } = params;

  const R_min = spoolBoreMin / 2;
  const R_max = spoolBoreMax / 2;
  const L = Math.max(20.0, coneLength);
  const R_flange = Math.max(R_max + 4.0, flangeDiameter / 2);
  const flangeT = 3.5;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Outer Flange Disk (at Z = 0 to flangeT)
  const flangeGeom = new THREE.CylinderGeometry(R_flange, R_flange, flangeT, 48);
  flangeGeom.rotateX(Math.PI / 2);
  let hub = new Brush(flangeGeom);
  hub.position.set(0, 0, flangeT / 2);
  hub.updateMatrixWorld();

  // 2. Conical Taper (from Z = flangeT to flangeT + L, tapering from R_max to R_min)
  const coneGeom = new THREE.CylinderGeometry(R_min, R_max, L, 48);
  coneGeom.rotateX(Math.PI / 2);
  const coneBrush = new Brush(coneGeom);
  coneBrush.position.set(0, 0, flangeT + L / 2);
  coneBrush.updateMatrixWorld();
  hub = evaluator.evaluate(hub, coneBrush, ADDITION);
  hub.updateMatrixWorld();

  // 3. Central Axle or Bearing Pocket Subtraction
  const totalH = flangeT + L;

  if (bearingType !== 'none-solid') {
    const bData = BEARING_PRESET_DATA[bearingType] || BEARING_PRESET_DATA['608'];
    const bOD = (bData.od + printer_compensation) / 2;
    const bDepth = bData.width + 1.0;
    const axleR = (bData.id + printer_compensation + 0.5) / 2;

    // Through-hole for rod axle
    const axleGeom = new THREE.CylinderGeometry(axleR, axleR, totalH * 2, 32);
    axleGeom.rotateX(Math.PI / 2);
    const axleBrush = new Brush(axleGeom);
    axleBrush.position.set(0, 0, totalH / 2);
    axleBrush.updateMatrixWorld();
    hub = evaluator.evaluate(hub, axleBrush, SUBTRACTION);
    hub.updateMatrixWorld();

    // Front bearing pocket (at Z = 0 to bDepth)
    const pocketGeom = new THREE.CylinderGeometry(bOD, bOD, bDepth * 2, 40);
    pocketGeom.rotateX(Math.PI / 2);
    const pocketBrush = new Brush(pocketGeom);
    pocketBrush.position.set(0, 0, 0);
    pocketBrush.updateMatrixWorld();
    hub = evaluator.evaluate(hub, pocketBrush, SUBTRACTION);
    hub.updateMatrixWorld();

    // Rear bearing pocket (at top Z = totalH - bDepth to totalH)
    const pocket2Brush = new Brush(pocketGeom);
    pocket2Brush.position.set(0, 0, totalH);
    pocket2Brush.updateMatrixWorld();
    hub = evaluator.evaluate(hub, pocket2Brush, SUBTRACTION);
    hub.updateMatrixWorld();
  } else {
    // Solid rod bore only
    const rodR = (axleRodDiameter + printer_compensation) / 2;
    const rodGeom = new THREE.CylinderGeometry(rodR, rodR, totalH * 2, 32);
    rodGeom.rotateX(Math.PI / 2);
    const rodBrush = new Brush(rodGeom);
    rodBrush.position.set(0, 0, totalH / 2);
    rodBrush.updateMatrixWorld();
    hub = evaluator.evaluate(hub, rodBrush, SUBTRACTION);
    hub.updateMatrixWorld();
  }

  // Output geometry
  let outGeometry = hub.geometry.clone();
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
