import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  ProjectEnclosureParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a parametric Electronics Project Enclosure using Constructive Solid Geometry (CSG):
 * 1. Outer box sized to inner dimensions + wall & floor thicknesses.
 * 2. Hollow inner pocket subtraction.
 * 3. Perimeter recessed lid lip step subtraction.
 * 4. Standoff mounting bosses in the corners with screw pilot holes.
 * 5. Optional side cable cutout slot.
 * 6. Creased normal calculation ensures crisp 90° planar faces.
 */
export function generateProjectEnclosure(params: ProjectEnclosureParams): GeneratedMeshResult {
  const {
    innerLength,
    innerWidth,
    innerHeight,
    wallThickness,
    floorThickness,
    lidLipHeight,
    standoffCount,
    standoffHeight,
    standoffScrewSize,
    hasCableCutout,
    cableCutoutWidth,
    cableCutoutHeight,
    printer_compensation,
  } = params;

  // Strict physical bounds
  const L_in = Math.max(25.0, innerLength);
  const W_in = Math.max(20.0, innerWidth);
  const H_in = Math.max(12.0, innerHeight);

  const T_wall = Math.max(1.6, wallThickness);
  const T_floor = Math.max(1.6, floorThickness);

  const L_out = L_in + 2 * T_wall;
  const W_out = W_in + 2 * T_wall;
  const H_out = H_in + T_floor;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Outer Box (Base at Z = 0, extending to Z = H_out)
  const outerGeom = new THREE.BoxGeometry(L_out, W_out, H_out);
  let box = new Brush(outerGeom);
  box.position.set(0, 0, H_out / 2);
  box.updateMatrixWorld();

  // 2. Hollow Inner Pocket Subtraction
  // Leaves T_floor at the bottom (z from T_floor to H_out + 2)
  const pocketH = H_in + 4.0;
  const pocketGeom = new THREE.BoxGeometry(L_in, W_in, pocketH);
  const pocketBrush = new Brush(pocketGeom);
  pocketBrush.position.set(0, 0, T_floor + pocketH / 2);
  pocketBrush.updateMatrixWorld();
  box = evaluator.evaluate(box, pocketBrush, SUBTRACTION);
  box.updateMatrixWorld();

  // 3. Lid Lip Rebate / Recess Step Subtraction
  // Recess half wall thickness around top perimeter for lid seating
  const lipH = Math.min(H_in * 0.3, Math.max(1.2, lidLipHeight));
  const lipL = L_in + T_wall; // steps into the wall by T_wall / 2
  const lipW = W_in + T_wall;
  const lipGeom = new THREE.BoxGeometry(lipL, lipW, lipH + 1.0);
  const lipBrush = new Brush(lipGeom);
  lipBrush.position.set(0, 0, H_out - lipH / 2 + 0.5);
  lipBrush.updateMatrixWorld();
  box = evaluator.evaluate(box, lipBrush, SUBTRACTION);
  box.updateMatrixWorld();

  // 4. Standoff Bosses with Screw Pilot Holes
  if (standoffCount > 0) {
    const sH = Math.min(H_in * 0.8, Math.max(3.0, standoffHeight));
    const screwDia = SCREW_CLEARANCE_DIAMETERS[standoffScrewSize] + printer_compensation;
    const pilotRadius = Math.max(0.8, (screwDia * 0.8) / 2); // pilot hole for thread engagement
    const bossRadius = pilotRadius + Math.max(1.4, T_wall * 0.8);

    // Standoff positions (tucked into corners of inner pocket)
    const inset = bossRadius + 0.5;
    const xPositions = [-(L_in / 2 - inset), L_in / 2 - inset];
    const yPositions = standoffCount === 4
      ? [-(W_in / 2 - inset), W_in / 2 - inset]
      : [0];

    for (const x of xPositions) {
      for (const y of yPositions) {
        // Add solid boss cylinder
        const bossGeom = new THREE.CylinderGeometry(bossRadius, bossRadius, sH, 24);
        bossGeom.rotateX(Math.PI / 2);
        const bossBrush = new Brush(bossGeom);
        bossBrush.position.set(x, y, T_floor + sH / 2);
        bossBrush.updateMatrixWorld();
        box = evaluator.evaluate(box, bossBrush, ADDITION);
        box.updateMatrixWorld();

        // Subtract pilot screw hole
        const holeGeom = new THREE.CylinderGeometry(pilotRadius, pilotRadius, sH + 2.0, 24);
        holeGeom.rotateX(Math.PI / 2);
        const holeBrush = new Brush(holeGeom);
        holeBrush.position.set(x, y, T_floor + sH / 2 + 1.0);
        holeBrush.updateMatrixWorld();
        box = evaluator.evaluate(box, holeBrush, SUBTRACTION);
        box.updateMatrixWorld();
      }
    }
  }

  // 5. Cable Cutout Slot Subtraction (on +X side wall)
  if (hasCableCutout) {
    const cutW = Math.min(W_in * 0.6, Math.max(5.0, cableCutoutWidth));
    const cutH = Math.min(H_in * 0.6, Math.max(4.0, cableCutoutHeight));
    const cutoutGeom = new THREE.BoxGeometry(T_wall * 3, cutW, cutH);
    const cutoutBrush = new Brush(cutoutGeom);
    // Position on +X face, resting near bottom or centered
    cutoutBrush.position.set(L_out / 2, 0, T_floor + cutH / 2 + 2.0);
    cutoutBrush.updateMatrixWorld();
    box = evaluator.evaluate(box, cutoutBrush, SUBTRACTION);
    box.updateMatrixWorld();
  }

  // 6. Final Normals & Metadata
  let geometry = box.geometry.clone();
  geometry = toCreasedNormals(geometry, (40 * Math.PI) / 180);
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
