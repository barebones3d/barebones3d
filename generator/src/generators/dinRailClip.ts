import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  DinRailClipParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Industrial 35mm / 15mm DIN Rail Snap-Fit Mounting Bracket using CSG:
 * - Upper rigid retention lip designed for standard EN 50022 top-hat rails
 * - Lower compliant cantilever snap latch with finger release lever
 * - Flat equipment mounting plate with customizable bolt pattern
 */
export function generateDinRailClip(params: DinRailClipParams): GeneratedMeshResult {
  const {
    railWidth = 35,
    clipThickness = 12,
    equipmentPlateWidth = 45,
    equipmentPlateHeight = 55,
    mountHoleSpacing = 30,
    mountScrewSize = 'M3',
    printer_compensation = 0.15,
  } = params;

  const R_width = railWidth === 15 ? 15 : 35;
  const W_plate = Math.max(30, equipmentPlateWidth);
  const H_plate = Math.max(R_width + 16, equipmentPlateHeight);
  const T_clip = Math.max(8, clipThickness);
  const plateThick = 4.0;
  const clipDepth = 12.0;

  const screwDia = SCREW_CLEARANCE_DIAMETERS[mountScrewSize] + printer_compensation;
  const rScrew = screwDia / 2;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Front Equipment Mounting Plate (centered at X=0, Y=0, Z goes from 0 to plateThick)
  const plateGeom = new THREE.BoxGeometry(W_plate, H_plate, plateThick);
  plateGeom.translate(0, 0, plateThick / 2);
  let mainBody = new Brush(plateGeom);
  mainBody.updateMatrixWorld();

  // 2. Add Rear Rail Clamp Body (centered behind plate: Z from -clipDepth to 0)
  const clampBodyWidth = Math.min(W_plate, Math.max(20, T_clip * 1.5));
  const clampBodyHeight = R_width + 12;
  const clampGeom = new THREE.BoxGeometry(clampBodyWidth, clampBodyHeight, clipDepth);
  clampGeom.translate(0, 0, -clipDepth / 2);
  const clampBrush = new Brush(clampGeom);
  clampBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, clampBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 3. Subtract DIN Rail Channel (35mm wide along Y, 7.5mm deep along Z)
  // Standard 35mm DIN rail channel profile:
  const railChannelHeight = R_width + printer_compensation;
  const railChannelDepth = 8.5; // depth into rear of clamp
  const railChannelGeom = new THREE.BoxGeometry(
    clampBodyWidth + 4,
    railChannelHeight,
    railChannelDepth
  );
  // Position so back face of channel leaves 3.5mm wall to front plate
  railChannelGeom.translate(0, 0, -clipDepth + railChannelDepth / 2);
  const railChannelBrush = new Brush(railChannelGeom);
  railChannelBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, railChannelBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Subtract Upper Hook Undercut (catches top lip of DIN rail)
  const topLipDepth = 2.5;
  const topLipHeight = 2.2;
  const topLipGeom = new THREE.BoxGeometry(clampBodyWidth + 4, topLipHeight, topLipDepth);
  topLipGeom.translate(0, railChannelHeight / 2 - topLipHeight / 2, -clipDepth + railChannelDepth + topLipDepth / 2);
  const topLipBrush = new Brush(topLipGeom);
  topLipBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, topLipBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 5. Add Lower Cantilever Snap Latch Arm with Release Tab
  const latchWidth = Math.min(clampBodyWidth * 0.7, 14);
  const latchLength = 16;
  const latchThick = 2.5;

  const latchGeom = new THREE.BoxGeometry(latchWidth, latchLength, latchThick);
  latchGeom.translate(0, -railChannelHeight / 2 - latchLength / 2 + 2, -clipDepth + latchThick / 2);
  const latchBrush = new Brush(latchGeom);
  latchBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, latchBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // Latch thumb tab at bottom
  const tabGeom = new THREE.BoxGeometry(latchWidth + 4, 6, 4);
  tabGeom.translate(0, -railChannelHeight / 2 - latchLength + 1, -clipDepth + 2);
  const tabBrush = new Brush(tabGeom);
  tabBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, tabBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 6. Subtract Equipment Mounting Screw Holes through front plate
  const spacingY = Math.max(16, Math.min(H_plate - 12, mountHoleSpacing));
  const spacingX = Math.max(16, W_plate - 12);
  const holePositions = [
    [-spacingX / 2, spacingY / 2],
    [spacingX / 2, spacingY / 2],
    [-spacingX / 2, -spacingY / 2],
    [spacingX / 2, -spacingY / 2],
  ];

  for (const [hx, hy] of holePositions) {
    const holeGeom = new THREE.CylinderGeometry(rScrew, rScrew, plateThick + 4, 20);
    holeGeom.rotateX(Math.PI / 2);
    holeGeom.translate(hx, hy, plateThick / 2);
    const holeBrush = new Brush(holeGeom);
    holeBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, holeBrush, SUBTRACTION);
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
    dimensions: { x: sz.x, y: sz.y, z: sz.z },
    triangles: finalGeom.index ? finalGeom.index.count / 3 : finalGeom.attributes.position.count / 3,
    vertices: finalGeom.attributes.position.count,
    estimatedPrintWeightGrams: weight,
  };
}
