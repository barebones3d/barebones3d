import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  StructuralBracketParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
  SCREW_COUNTERSINK_HEAD_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';
import { createFilletedLProfile } from '../utils/filletMath';

/**
 * Generates an L-Bracket using 2D Pre-Filleted Profile Extrusion (Method 1) + Defensive CSG:
 * 1. Single-Pass 2D Extrusion:
 *    - Uses createFilletedLProfile to trace the L-bracket profile with a smooth tangent arc
 *      in the inner crook (innerFillet) and a rounded outer corner (outerFillet).
 *    - Extruded across width W without dual-box booleans, guaranteeing zero internal membranes
 *      and sub-16ms generation times.
 * 2. Triangular Gusset Rib:
 *    - Extruded 2D triangular rib centered along Z, nested cleanly into the inner corner joint.
 * 3. Defensive CSG Subtractions:
 *    - Drill hole cylinders oversized along extrusion axis (thickness * 4) penetrating visibly through both sides.
 *    - Countersink cone cutters oversized beyond the leg surface (+1.0mm overshoot) to eliminate coincident faces.
 * 4. Creased Normals (35°) preserve sharp planar leg corners and countersink chamfers without visual pinching.
 */
export function generateStructuralBracket(params: StructuralBracketParams): GeneratedMeshResult {
  const {
    leg1Length,
    leg2Length,
    width,
    thickness,
    gussetReinforcement,
    gussetThickness,
    holePattern,
    screwSize,
    hasCountersink,
    printer_compensation,
  } = params;

  // Strict physical bounds (supporting independent leg thicknesses or uniform)
  const T1 = Math.max(2.0, params.leg1Thickness ?? thickness);
  const T2 = Math.max(2.0, params.leg2Thickness ?? thickness);
  const W = Math.max(8.0, width);
  const L1 = Math.max(T2 + 8.0, leg1Length);
  const L2 = Math.max(T1 + 8.0, leg2Length);

  // Fillet parameters (defaults: inner = 3.0mm, outer = 1.5mm)
  const maxInnerFillet = Math.min(L1 - T2, L2 - T1) * 0.4;
  const innerFillet = Math.max(0.5, Math.min(params.innerFillet ?? 3.0, maxInnerFillet));

  const maxOuterFillet = Math.min(T1, T2);
  const outerFillet = Math.max(0, Math.min(params.outerFillet ?? 1.5, maxOuterFillet));

  // Screw & Countersink dimensions
  const screwDia = SCREW_CLEARANCE_DIAMETERS[screwSize] + printer_compensation;
  const holeRadius = Math.max(0.5, screwDia / 2);

  const csDia = SCREW_COUNTERSINK_HEAD_DIAMETERS[screwSize] + printer_compensation;
  const csRadius = Math.max(holeRadius + 0.8, csDia / 2);
  const csDepth1 = hasCountersink ? Math.min(T1 * 0.65, Math.max(1.2, csRadius - holeRadius)) : 0;
  const csDepth2 = hasCountersink ? Math.min(T2 * 0.65, Math.max(1.2, csRadius - holeRadius)) : 0;

  // Center Gusset Rib dimensions
  const hasGusset = gussetReinforcement;
  const maxGussetThick = Math.min(W - 2.0, Math.max(1.5, gussetThickness));
  const gussetL1 = Math.min(L1 - T2 - 6.0, (L1 - T2) * 0.6);
  const gussetL2 = Math.min(L2 - T1 - 6.0, (L2 - T1) * 0.6);

  // ========================================================
  // STEP 1: Single-Pass Extrusion of 2D Filleted L-Profile
  // ========================================================
  const lShape = createFilletedLProfile(L1, L2, T1, T2, innerFillet, outerFillet);
  const bracketGeom = new THREE.ExtrudeGeometry(lShape, {
    depth: W,
    bevelEnabled: false,
    curveSegments: 16,
  });
  // Center along Z width axis
  bracketGeom.translate(0, 0, -W / 2);

  let bracket = new Brush(bracketGeom);
  bracket.updateMatrixWorld();

  // Initialize CSG Evaluator for additions & subtractions
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // ========================================================
  // STEP 2: Triangular Gusset Rib Placement
  // ========================================================
  if (hasGusset && gussetL1 > 3 && gussetL2 > 3) {
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0);
    triangleShape.lineTo(gussetL1, 0);
    triangleShape.lineTo(0, gussetL2);
    triangleShape.closePath();

    const gussetGeom = new THREE.ExtrudeGeometry(triangleShape, {
      depth: maxGussetThick,
      bevelEnabled: false,
    });
    // Center along Z width axis
    gussetGeom.translate(0, 0, -maxGussetThick / 2);

    const gussetBrush = new Brush(gussetGeom);
    // Position directly at the corner crook (T2, T1, 0)
    gussetBrush.position.set(T2, T1, 0);
    gussetBrush.updateMatrixWorld();

    bracket = evaluator.evaluate(bracket, gussetBrush, ADDITION);
    bracket.updateMatrixWorld();
  }

  // ========================================================
  // STEP 3: Drill Holes & Countersinks (Defensive CSG Subtractions)
  // ========================================================
  if (holePattern !== 'none') {
    // Spacing along width Z (centered or balanced on left & right of the center gusset)
    const maxZ = Math.max(holeRadius + 1.5, W / 2 - Math.max(csRadius, holeRadius) - 1.5);
    const zOffset = Math.min(maxZ, Math.max(holeRadius + 2.5, W * 0.28));
    const zHolePositions = (holePattern === 'four-grid')
      ? [-zOffset, zOffset]
      : [0]; // 'two-inline' or 'single' places 1 centered hole per leg

    // Distance along each leg
    const xHolePos = (hasGusset && holePattern !== 'four-grid')
      ? Math.min(L1 - holeRadius - 2.5, Math.max(T2 + Math.max(gussetL1, innerFillet) + holeRadius + 2.0, T2 + (L1 - T2) * 0.65))
      : Math.max(T2 + innerFillet + holeRadius + 1.5, T2 + (L1 - T2) * 0.55);

    const yHolePos = (hasGusset && holePattern !== 'four-grid')
      ? Math.min(L2 - holeRadius - 2.5, Math.max(T1 + Math.max(gussetL2, innerFillet) + holeRadius + 2.0, T1 + (L2 - T1) * 0.65))
      : Math.max(T1 + innerFillet + holeRadius + 1.5, T1 + (L2 - T1) * 0.55);

    const overshoot = 1.0; // 1.0mm protrusion beyond face to avoid coplanar face artifacts

    // Drill holes on Leg 1 (Horizontal base leg: vertical cylinder along Y)
    for (const z of zHolePositions) {
      // Cylinder oversized along extrusion axis (T1 * 4) visibly penetrating both sides
      const cyl = new Brush(new THREE.CylinderGeometry(holeRadius, holeRadius, T1 * 4, 32));
      cyl.position.set(xHolePos, T1 / 2, z);
      cyl.updateMatrixWorld();
      bracket = evaluator.evaluate(bracket, cyl, SUBTRACTION);
      bracket.updateMatrixWorld();

      // Countersink Cone on Leg 1 (oversized top face protruding beyond face)
      if (hasCountersink && csDepth1 > 0) {
        const coneHeight = csDepth1 + overshoot;
        const coneGeom = new THREE.CylinderGeometry(csRadius + overshoot, holeRadius, coneHeight, 32);
        const cone = new Brush(coneGeom);
        cone.position.set(xHolePos, T1 + (overshoot - csDepth1) / 2, z);
        cone.updateMatrixWorld();
        bracket = evaluator.evaluate(bracket, cone, SUBTRACTION);
        bracket.updateMatrixWorld();
      }
    }

    // Drill holes on Leg 2 (Vertical upright leg: horizontal cylinder along X)
    for (const z of zHolePositions) {
      // Cylinder oversized along extrusion axis (T2 * 4) visibly penetrating both sides
      const cyl = new Brush(new THREE.CylinderGeometry(holeRadius, holeRadius, T2 * 4, 32));
      cyl.rotation.z = Math.PI / 2;
      cyl.position.set(T2 / 2, yHolePos, z);
      cyl.updateMatrixWorld();
      bracket = evaluator.evaluate(bracket, cyl, SUBTRACTION);
      bracket.updateMatrixWorld();

      // Countersink Cone on Leg 2 (oversized top face protruding beyond face)
      if (hasCountersink && csDepth2 > 0) {
        const coneHeight = csDepth2 + overshoot;
        const coneGeom = new THREE.CylinderGeometry(csRadius + overshoot, holeRadius, coneHeight, 32);
        const cone = new Brush(coneGeom);
        cone.rotation.z = -Math.PI / 2;
        cone.position.set(T2 + (overshoot - csDepth2) / 2, yHolePos, z);
        cone.updateMatrixWorld();
        bracket = evaluator.evaluate(bracket, cone, SUBTRACTION);
        bracket.updateMatrixWorld();
      }
    }
  }

  // ========================================================
  // STEP 4: Calculate Creased Normals (35°)
  // ========================================================
  const finalGeometry = toCreasedNormals(bracket.geometry, THREE.MathUtils.degToRad(35));
  finalGeometry.computeBoundingBox();

  const bbox = finalGeometry.boundingBox || new THREE.Box3();
  const dimensions = {
    x: Number((bbox.max.x - bbox.min.x).toFixed(2)),
    y: Number((bbox.max.y - bbox.min.y).toFixed(2)),
    z: Number((bbox.max.z - bbox.min.z).toFixed(2)),
  };

  const volume = computeMeshVolume(finalGeometry);
  const estimatedPrintWeightGrams = estimateWeightGrams(volume, 0.2);

  const posAttr = finalGeometry.attributes.position;
  const index = finalGeometry.index;
  const triangleCount = index ? index.count / 3 : posAttr.count / 3;

  return {
    geometry: finalGeometry,
    dimensions,
    triangles: triangleCount,
    vertices: posAttr.count,
    estimatedPrintWeightGrams,
  };
}
