import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  LeadScrewNutBlockParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
  SCREW_COUNTERSINK_HEAD_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a T8 Anti-Backlash Leadscrew Nut Mounting Block using Constructive Solid Geometry (CSG):
 * 1. Solid rectangular housing block.
 * 2. Central clearance through-bore for the rotating T8 leadscrew rod.
 * 3. Counterbored circular pocket recess for standard T8 brass/POM nut flange.
 * 4. 4-bolt circular hole pattern (standard 16mm PCD) for nut retention screws.
 * 5. Perpendicular gantry plate mounting holes with counterbores.
 */
export function generateLeadScrewNutBlock(params: LeadScrewNutBlockParams): GeneratedMeshResult {
  const {
    leadScrewDia,
    nutFlangeDia,
    boltCircleDia,
    blockWidth,
    blockLength,
    blockHeight,
    nutScrewSize,
    gantryScrewSize,
    gantryHoleCount,
    pocketDepth,
    printer_compensation,
  } = params;

  const W = Math.max(25.0, blockWidth);
  const L = Math.max(25.0, blockLength);
  const H = Math.max(14.0, blockHeight);

  // Leadscrew clearance bore (needs ~2mm radial clearance so screw does not bind)
  const lsDia = Math.max(8.0, leadScrewDia);
  const clearanceBoreDia = lsDia + 2.5 + printer_compensation;
  const rBore = clearanceBoreDia / 2;

  // Nut flange recess pocket
  const fDia = Math.max(18.0, nutFlangeDia + printer_compensation);
  const rPocket = fDia / 2;
  const pDepth = Math.min(H * 0.6, Math.max(2.5, pocketDepth));

  // Nut mounting screws (4 holes on boltCircleDia)
  const pcd = Math.max(12.0, boltCircleDia);
  const rPCD = pcd / 2;
  const nutScrewDia = SCREW_CLEARANCE_DIAMETERS[nutScrewSize] + printer_compensation;
  const rNutScrew = nutScrewDia / 2;

  // Gantry mounting holes
  const gantryScrewDia = SCREW_CLEARANCE_DIAMETERS[gantryScrewSize] + printer_compensation;
  const rGantryScrew = gantryScrewDia / 2;
  const gantryHeadDia = SCREW_COUNTERSINK_HEAD_DIAMETERS[gantryScrewSize] + printer_compensation;
  const rGantryHead = gantryHeadDia / 2;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Solid Block Body (centered on X and Y, Z from 0 to H)
  const bodyGeom = new THREE.BoxGeometry(L, W, H);
  let body = new Brush(bodyGeom);
  body.position.set(0, 0, H / 2);
  body.updateMatrixWorld();

  // 2. Central Leadscrew Through-Bore (along Z axis)
  const boreGeom = new THREE.CylinderGeometry(rBore, rBore, H * 2, 32);
  const boreBrush = new Brush(boreGeom);
  boreBrush.position.set(0, 0, H / 2);
  boreBrush.updateMatrixWorld();
  body = evaluator.evaluate(body, boreBrush, SUBTRACTION);
  body.updateMatrixWorld();

  // 3. Nut Flange Counterbored Pocket Recess (from top face Z = H down by pDepth)
  const pocketGeom = new THREE.CylinderGeometry(rPocket, rPocket, pDepth * 2, 36);
  const pocketBrush = new Brush(pocketGeom);
  pocketBrush.position.set(0, 0, H);
  pocketBrush.updateMatrixWorld();
  body = evaluator.evaluate(body, pocketBrush, SUBTRACTION);
  body.updateMatrixWorld();

  // 4. 4 Nut Flange Retention Screw Holes (4 holes on bolt circle)
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const x = rPCD * Math.cos(angle);
    const y = rPCD * Math.sin(angle);

    const holeGeom = new THREE.CylinderGeometry(rNutScrew, rNutScrew, H * 2, 20);
    const holeBrush = new Brush(holeGeom);
    holeBrush.position.set(x, y, H / 2);
    holeBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, holeBrush, SUBTRACTION);
    body.updateMatrixWorld();
  }

  // 5. Gantry Mounting Holes (drilled horizontally along Y axis from front to rear)
  const gantryY = W * 1.5;
  const gantryZ = H * 0.45;
  const xOffsets = gantryHoleCount === 4
    ? [-L * 0.35, L * 0.35]
    : [0];
  const zOffsets = gantryHoleCount === 4
    ? [H * 0.3, H * 0.7]
    : [gantryZ];

  for (const x of xOffsets) {
    for (const z of zOffsets) {
      const gHoleGeom = new THREE.CylinderGeometry(rGantryScrew, rGantryScrew, gantryY, 24);
      gHoleGeom.rotateX(Math.PI / 2);
      const gHoleBrush = new Brush(gHoleGeom);
      gHoleBrush.position.set(x, 0, z);
      gHoleBrush.updateMatrixWorld();
      body = evaluator.evaluate(body, gHoleBrush, SUBTRACTION);
      body.updateMatrixWorld();

      // Counterbore for screw head on front face (+Y)
      const cbDepth = W * 0.25;
      const cbGeom = new THREE.CylinderGeometry(rGantryHead, rGantryHead, cbDepth * 2, 24);
      cbGeom.rotateX(Math.PI / 2);
      const cbBrush = new Brush(cbGeom);
      cbBrush.position.set(x, W / 2, z);
      cbBrush.updateMatrixWorld();
      body = evaluator.evaluate(body, cbBrush, SUBTRACTION);
      body.updateMatrixWorld();
    }
  }

  // 6. Final Normals & Metadata
  let geometry = body.geometry.clone();
  geometry = toCreasedNormals(geometry, (35 * Math.PI) / 180);
  geometry.computeBoundingBox();

  const bbox = geometry.boundingBox || new THREE.Box3();
  const dimensions = {
    x: Number((bbox.max.x - bbox.min.x).toFixed(2)),
    y: Number((bbox.max.y - bbox.min.y).toFixed(2)),
    z: Number((bbox.max.z - bbox.min.z).toFixed(2)),
  };

  const volume = computeMeshVolume(geometry);
  const estimatedPrintWeightGrams = estimateWeightGrams(volume, 0.2);

  return {
    geometry,
    dimensions,
    triangles: (geometry.index ? geometry.index.count : geometry.attributes.position.count) / 3,
    vertices: geometry.attributes.position.count,
    estimatedPrintWeightGrams,
  };
}
