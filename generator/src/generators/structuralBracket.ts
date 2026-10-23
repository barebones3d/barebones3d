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

/**
 * Generates an L-Bracket using Constructive Solid Geometry (CSG):
 * 1. Two clean rectangular cubes for the legs (Base Leg along X, Upright Leg along Y).
 * 2. An optional triangular gusset rib united in the inner corner.
 * 3. Drill holes are cylinders cleanly subtracted from each leg.
 * 4. Countersinks are clean cones subtracted from the surface lined up with the drill holes.
 * 5. Creased normal calculation ensures 100% crisp, flat faces without visual pinching.
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

  // Initialize CSG Evaluator
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // ========================================================
  // STEP 1: Two Rectangular Cubes for the Legs
  // ========================================================
  // Leg 1 (Horizontal Base Leg: X from 0 to L1, Y from 0 to T1, Z centered across W)
  const leg1Geom = new THREE.BoxGeometry(L1, T1, W);
  const leg1Brush = new Brush(leg1Geom);
  leg1Brush.position.set(L1 / 2, T1 / 2, 0);
  leg1Brush.updateMatrixWorld();

  // Leg 2 (Vertical Upright Leg: X from 0 to T2, Y from 0 to L2, Z centered across W)
  // Overlapping solid corner [0, T2] x [0, T1] ensures 100% watertight CSG boolean union
  const leg2Geom = new THREE.BoxGeometry(T2, L2, W);
  const leg2Brush = new Brush(leg2Geom);
  leg2Brush.position.set(T2 / 2, L2 / 2, 0);
  leg2Brush.updateMatrixWorld();

  // Union both rectangular cubes
  let bracket = evaluator.evaluate(leg1Brush, leg2Brush, ADDITION);
  bracket.updateMatrixWorld();

  // ========================================================
  // STEP 2: Triangular Gusset Rib (Between the two legs)
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
    // Center along Z axis
    gussetGeom.translate(0, 0, -maxGussetThick / 2);

    const gussetBrush = new Brush(gussetGeom);
    gussetBrush.position.set(T2, T1, 0);
    gussetBrush.updateMatrixWorld();

    bracket = evaluator.evaluate(bracket, gussetBrush, ADDITION);
    bracket.updateMatrixWorld();
  }

  // ========================================================
  // STEP 3: Drill Holes (Cylinders Subtracted from the Legs)
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
      ? Math.min(L1 - holeRadius - 2.5, Math.max(T2 + gussetL1 + holeRadius + 2.0, T2 + (L1 - T2) * 0.65))
      : T2 + (L1 - T2) * 0.55;

    const yHolePos = (hasGusset && holePattern !== 'four-grid')
      ? Math.min(L2 - holeRadius - 2.5, Math.max(T1 + gussetL2 + holeRadius + 2.0, T1 + (L2 - T1) * 0.65))
      : T1 + (L2 - T1) * 0.55;

    // Drill holes on Leg 1 (Horizontal base leg: vertical cylinder along Y)
    for (const z of zHolePositions) {
      // Cylinder cleanly removed through Leg 1
      const cyl = new Brush(new THREE.CylinderGeometry(holeRadius, holeRadius, T1 * 4, 32));
      cyl.position.set(xHolePos, T1 / 2, z);
      cyl.updateMatrixWorld();
      bracket = evaluator.evaluate(bracket, cyl, SUBTRACTION);
      bracket.updateMatrixWorld();

      // ========================================================
      // STEP 4: Countersink Cone on Leg 1
      // ========================================================
      if (hasCountersink && csDepth1 > 0) {
        // Simple cone frustum removed from Leg 1 lined up with the drill hole
        const cone = new Brush(new THREE.CylinderGeometry(csRadius, holeRadius, csDepth1, 32));
        cone.position.set(xHolePos, T1 - csDepth1 / 2, z);
        cone.updateMatrixWorld();
        bracket = evaluator.evaluate(bracket, cone, SUBTRACTION);
        bracket.updateMatrixWorld();
      }
    }

    // Drill holes on Leg 2 (Vertical upright leg: horizontal cylinder along X)
    for (const z of zHolePositions) {
      // Cylinder cleanly removed through Leg 2
      const cyl = new Brush(new THREE.CylinderGeometry(holeRadius, holeRadius, T2 * 4, 32));
      cyl.rotation.z = Math.PI / 2;
      cyl.position.set(T2 / 2, yHolePos, z);
      cyl.updateMatrixWorld();
      bracket = evaluator.evaluate(bracket, cyl, SUBTRACTION);
      bracket.updateMatrixWorld();

      // Countersink Cone on Leg 2
      if (hasCountersink && csDepth2 > 0) {
        // Simple cone frustum removed from Leg 2 lined up with the drill hole
        const cone = new Brush(new THREE.CylinderGeometry(csRadius, holeRadius, csDepth2, 32));
        cone.rotation.z = -Math.PI / 2;
        cone.position.set(T2 - csDepth2 / 2, yHolePos, z);
        cone.updateMatrixWorld();
        bracket = evaluator.evaluate(bracket, cone, SUBTRACTION);
        bracket.updateMatrixWorld();
      }
    }
  }

  // Calculate Creased Normals so planar faces remain razor flat and crisp
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
