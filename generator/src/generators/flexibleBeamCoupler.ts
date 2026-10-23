import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  FlexibleBeamCouplerParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Helical Beam Flexible Shaft Coupler using CSG & Helical geometry:
 * - Cylindrical aluminum/PETG body with dual independent shaft bores (e.g. 5mm motor to 8mm leadscrew)
 * - Central flexible beam zone with multi-turn overlapping flexure slits
 * - Top and bottom pinch bolt counterbores and clamping slit channels
 * - Watertight 2-manifold mesh with creased normals
 */
export function generateFlexibleBeamCoupler(params: FlexibleBeamCouplerParams): GeneratedMeshResult {
  const {
    outerDiameter,
    length,
    bore1Diameter,
    bore2Diameter,
    spiralPitch,
    spiralTurns,
    spiralSlotWidth,
    clampScrewSize = 'M3',
    printer_compensation = 0.15,
  } = params;

  const R = outerDiameter / 2;
  const L = length;
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Base solid cylinder along Z
  const mainCylinderGeom = new THREE.CylinderGeometry(R, R, L, 48);
  mainCylinderGeom.rotateX(Math.PI / 2);
  let coupler = new Brush(mainCylinderGeom);
  coupler.position.set(0, 0, 0);
  coupler.updateMatrixWorld();

  // 2. Shaft Bores
  // Bottom bore 1 (motor shaft) from -L/2 to 0
  const r1 = (bore1Diameter + printer_compensation) / 2;
  const bore1Geom = new THREE.CylinderGeometry(r1, r1, L / 2 + 2, 32);
  bore1Geom.rotateX(Math.PI / 2);
  const bore1Brush = new Brush(bore1Geom);
  bore1Brush.position.set(0, 0, -L / 4);
  bore1Brush.updateMatrixWorld();
  coupler = evaluator.evaluate(coupler, bore1Brush, SUBTRACTION);
  coupler.updateMatrixWorld();

  // Top bore 2 (leadscrew shaft) from 0 to +L/2
  const r2 = (bore2Diameter + printer_compensation) / 2;
  const bore2Geom = new THREE.CylinderGeometry(r2, r2, L / 2 + 2, 32);
  bore2Geom.rotateX(Math.PI / 2);
  const bore2Brush = new Brush(bore2Geom);
  bore2Brush.position.set(0, 0, L / 4);
  bore2Brush.updateMatrixWorld();
  coupler = evaluator.evaluate(coupler, bore2Brush, SUBTRACTION);
  coupler.updateMatrixWorld();

  // 3. Central Helical Flexure Slits
  // Series of staggered circumferential slots overlapping at 120° or 180° along the central flexure zone
  const flexZoneHeight = Math.min(L * 0.5, spiralPitch * spiralTurns);
  const zStart = -flexZoneHeight / 2;
  const numCuts = Math.max(3, Math.floor(spiralTurns * 3));
  const zStep = flexZoneHeight / numCuts;
  const slotW = Math.max(1.0, spiralSlotWidth);

  for (let i = 0; i < numCuts; i++) {
    const zCut = zStart + (i + 0.5) * zStep;
    const angle = i * (Math.PI * 0.67); // staggered spiral progression

    // Cut block penetrating past center
    const cutGeom = new THREE.BoxGeometry(outerDiameter * 1.2, outerDiameter * 0.7, slotW);
    const cutBrush = new Brush(cutGeom);
    cutBrush.position.set(Math.cos(angle) * (R * 0.35), Math.sin(angle) * (R * 0.35), zCut);
    cutBrush.rotation.z = angle;
    cutBrush.updateMatrixWorld();

    coupler = evaluator.evaluate(coupler, cutBrush, SUBTRACTION);
    coupler.updateMatrixWorld();
  }

  // 4. Clamping Slits at Ends
  const slitT = 1.4;
  // Bottom clamp slit
  const slit1Geom = new THREE.BoxGeometry(outerDiameter * 1.1, slitT, L * 0.22);
  const slit1Brush = new Brush(slit1Geom);
  slit1Brush.position.set(0, 0, -L / 2 + (L * 0.11));
  slit1Brush.updateMatrixWorld();
  coupler = evaluator.evaluate(coupler, slit1Brush, SUBTRACTION);
  coupler.updateMatrixWorld();

  // Top clamp slit (rotated 90° for cross balance)
  const slit2Geom = new THREE.BoxGeometry(slitT, outerDiameter * 1.1, L * 0.22);
  const slit2Brush = new Brush(slit2Geom);
  slit2Brush.position.set(0, 0, L / 2 - (L * 0.11));
  slit2Brush.updateMatrixWorld();
  coupler = evaluator.evaluate(coupler, slit2Brush, SUBTRACTION);
  coupler.updateMatrixWorld();

  // 5. Pinch Screw Holes at Ends
  const screwDia = (SCREW_CLEARANCE_DIAMETERS[clampScrewSize] || 3.4) + printer_compensation;
  const screwR = screwDia / 2;

  // Bottom pinch screw (along Y)
  const pinch1Geom = new THREE.CylinderGeometry(screwR, screwR, outerDiameter * 1.2, 24);
  pinch1Geom.rotateZ(Math.PI / 2);
  const pinch1Brush = new Brush(pinch1Geom);
  pinch1Brush.position.set(0, 0, -L / 2 + (L * 0.11));
  pinch1Brush.updateMatrixWorld();
  coupler = evaluator.evaluate(coupler, pinch1Brush, SUBTRACTION);
  coupler.updateMatrixWorld();

  // Top pinch screw (along X)
  const pinch2Geom = new THREE.CylinderGeometry(screwR, screwR, outerDiameter * 1.2, 24);
  const pinch2Brush = new Brush(pinch2Geom);
  pinch2Brush.position.set(0, 0, L / 2 - (L * 0.11));
  pinch2Brush.updateMatrixWorld();
  coupler = evaluator.evaluate(coupler, pinch2Brush, SUBTRACTION);
  coupler.updateMatrixWorld();

  // 6. Geometry output
  let outGeometry = coupler.geometry.clone();
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
