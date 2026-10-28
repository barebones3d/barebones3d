import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  BearingPillowBlockParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';
import { createRoundedRectShape, createInternalFilletWedge } from '../utils/filletMath';

/**
 * Generates a Bearing Pillow Block using Defensive Constructive Solid Geometry (CSG):
 * 1. Base Housing Block: Center cylinder boss sized to house the bearing OD + wall thickness.
 * 2. Mounting Flange Additions:
 *    - 'two-sided': Cylindrical ear bosses at +/- earCenterDist with true mathematical
 *      external tangent solids bridging seamlessly into the center cylinder.
 *    - 'bottom-foot': Pedestal base foot with 4 pre-rounded corners (createRoundedRectShape)
 *      and positive transition fillet wedges (createInternalFilletWedge) reinforcing the joint seam.
 *    - 'none': Compact cylindrical cartridge housing.
 * 3. Defensive CSG Subtractions:
 *    - Bearing Pocket Cutter: Cylindrical brush extending beyond front face (pocketDepth + 2.0)
 *      to strictly eliminate coplanar face artifacts.
 *    - Bearing Pocket Entry Chamfer: Shallow 45 deg entry cone (0.8mm depth, radius + 0.5mm)
 *      oversized beyond front face to ease bearing insertion without tool catching.
 *    - Retention Lip: Concentric stepped cylinder / lip ledge on rear face.
 *    - Shaft Clearance Hole: Pass-through cylindrical cutter with diameter (bearingID + printer_compensation)
 *      oversized along extrusion axis (totalDepth * 4) penetrating completely through.
 *    - Mounting Holes: Screw clearance holes (screwDia + printer_compensation) passing completely through flanges.
 * 4. Creased Normals (30°) preserve crisp planar mounting flats while smoothing cylindrical bores.
 */
export function generateBearingPillowBlock(params: BearingPillowBlockParams): GeneratedMeshResult {
  const {
    bearingOD,
    bearingID,
    wallThickness,
    retentionLip,
    lipThickness,
    lipOverhang,
    mountingFlanges,
    mountHoleSize,
    flangeLength,
    printer_compensation,
  } = params;

  // 1. Core Diameters and Radii
  const pocketDia = bearingOD + printer_compensation;
  const pocketRadius = Math.max(1.0, pocketDia / 2);
  const outerRadius = pocketRadius + Math.max(1.5, wallThickness);

  // Depth logic
  const pocketDepth = Math.max(2.0, params.pocketDepth);
  const actualLipThick = retentionLip ? Math.max(0.8, lipThickness) : 0;
  const totalDepth = pocketDepth + actualLipThick;

  // Fillet & Chamfer options
  const cornerFillet = Math.max(0, Math.min(params.cornerFillet ?? 2.0, 8.0));
  const hasLeadInChamfer = params.leadInChamfer !== false;

  // Shaft clearance hole diameter & radius (boreID + printer_compensation)
  const shaftDia = bearingID + printer_compensation;
  const minShaftRadius = Math.max(0.5, shaftDia / 2);
  const shaftClearanceRadius = retentionLip
    ? Math.max(minShaftRadius, pocketRadius - Math.max(0.4, lipOverhang))
    : minShaftRadius;

  // Screw clearance hole diameter & radius (screwDia + printer_compensation)
  const mountHoleDia = SCREW_CLEARANCE_DIAMETERS[mountHoleSize] + printer_compensation;
  const mountHoleRadius = Math.max(0.5, mountHoleDia / 2);

  // Initialize CSG Evaluator
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  const centerOffsetY = mountingFlanges === 'bottom-foot'
    ? outerRadius + Math.max(5.0, wallThickness * 1.2) * 0.5
    : 0;

  // ========================================================
  // STEP 1: Base Housing Block (Center Cylinder Boss)
  // ========================================================
  // Cylinder oriented along Z axis, centered at Z = 0 (from -totalDepth/2 to +totalDepth/2)
  const centerGeom = new THREE.CylinderGeometry(outerRadius, outerRadius, totalDepth, 32);
  centerGeom.rotateX(Math.PI / 2);

  let body = new Brush(centerGeom);
  body.position.set(0, centerOffsetY, 0);
  body.updateMatrixWorld();

  let earCenterDist = 0;

  // ========================================================
  // STEP 2: Flange Additions (Two-Sided Ears or Bottom Foot)
  // ========================================================
  if (mountingFlanges === 'two-sided') {
    const earRadius = mountHoleRadius + Math.max(2.5, wallThickness * 0.7);
    earCenterDist = outerRadius + Math.max(6.0, flangeLength * 0.75);
    const d = earCenterDist;

    // External Tangent Angle between center cylinder (R_c) and ear cylinder (R_e)
    const diffR = outerRadius - earRadius;
    const alpha = Math.min(0.999, Math.max(0.0, diffR / d));
    const cosPhi = alpha;
    const sinPhi = Math.sqrt(Math.max(0.001, 1 - cosPhi * cosPhi));

    // A. Right Ear Cylinder
    const rightEarGeom = new THREE.CylinderGeometry(earRadius, earRadius, totalDepth, 24);
    rightEarGeom.rotateX(Math.PI / 2);
    const rightEarBrush = new Brush(rightEarGeom);
    rightEarBrush.position.set(d, 0, 0);
    rightEarBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, rightEarBrush, ADDITION);
    body.updateMatrixWorld();

    // B. Left Ear Cylinder
    const leftEarGeom = new THREE.CylinderGeometry(earRadius, earRadius, totalDepth, 24);
    leftEarGeom.rotateX(Math.PI / 2);
    const leftEarBrush = new Brush(leftEarGeom);
    leftEarBrush.position.set(-d, 0, 0);
    leftEarBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, leftEarBrush, ADDITION);
    body.updateMatrixWorld();

    // C. Right Tangent Solid Bridge
    const rightBridgeShape = new THREE.Shape();
    rightBridgeShape.moveTo(0, 0);
    rightBridgeShape.lineTo(outerRadius * cosPhi, outerRadius * sinPhi);
    rightBridgeShape.lineTo(d + earRadius * cosPhi, earRadius * sinPhi);
    rightBridgeShape.lineTo(d, 0);
    rightBridgeShape.lineTo(d + earRadius * cosPhi, -earRadius * sinPhi);
    rightBridgeShape.lineTo(outerRadius * cosPhi, -outerRadius * sinPhi);
    rightBridgeShape.closePath();

    const rightBridgeGeom = new THREE.ExtrudeGeometry(rightBridgeShape, {
      depth: totalDepth,
      bevelEnabled: false,
    });
    rightBridgeGeom.translate(0, 0, -totalDepth / 2);
    const rightBridgeBrush = new Brush(rightBridgeGeom);
    rightBridgeBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, rightBridgeBrush, ADDITION);
    body.updateMatrixWorld();

    // D. Left Tangent Solid Bridge
    const leftBridgeShape = new THREE.Shape();
    leftBridgeShape.moveTo(0, 0);
    leftBridgeShape.lineTo(-outerRadius * cosPhi, outerRadius * sinPhi);
    leftBridgeShape.lineTo(-d - earRadius * cosPhi, earRadius * sinPhi);
    leftBridgeShape.lineTo(-d, 0);
    leftBridgeShape.lineTo(-d - earRadius * cosPhi, -earRadius * sinPhi);
    leftBridgeShape.lineTo(-outerRadius * cosPhi, -outerRadius * sinPhi);
    leftBridgeShape.closePath();

    const leftBridgeGeom = new THREE.ExtrudeGeometry(leftBridgeShape, {
      depth: totalDepth,
      bevelEnabled: false,
    });
    leftBridgeGeom.translate(0, 0, -totalDepth / 2);
    const leftBridgeBrush = new Brush(leftBridgeGeom);
    leftBridgeBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, leftBridgeBrush, ADDITION);
    body.updateMatrixWorld();

  } else if (mountingFlanges === 'bottom-foot') {
    const footHalfWidth = outerRadius + Math.max(8.0, flangeLength);
    const footHeight = Math.max(5.0, wallThickness * 1.2);

    // A. Base Foot Plate with 4 Pre-Rounded Corners (Method 1)
    const footShape = createRoundedRectShape(footHalfWidth * 2, totalDepth, cornerFillet);
    const footGeom = new THREE.ExtrudeGeometry(footShape, {
      depth: footHeight,
      bevelEnabled: false,
      curveSegments: 16,
    });
    // Extruded along Z in 2D shape coords; rotate to orient along Y axis
    footGeom.rotateX(Math.PI / 2);
    const footBrush = new Brush(footGeom);
    footBrush.position.set(0, footHeight / 2, 0);
    footBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, footBrush, ADDITION);
    body.updateMatrixWorld();

    // B. Smooth Tangent Gussets from foot to cylinder
    const xFootCorner = footHalfWidth - 3.0;
    const yFootTop = footHeight;
    const dy = yFootTop - centerOffsetY;
    const dx = xFootCorner;
    const distSq = dx * dx + dy * dy;

    if (distSq > outerRadius * outerRadius) {
      const dist = Math.sqrt(distSq);
      const theta = Math.atan2(dy, dx);
      const beta = Math.acos(Math.min(0.999, outerRadius / dist));

      // Right Tangent Point on cylinder
      const rTanX = outerRadius * Math.cos(theta + beta);
      const rTanY = centerOffsetY + outerRadius * Math.sin(theta + beta);

      const rightFootShape = new THREE.Shape();
      rightFootShape.moveTo(0, centerOffsetY);
      rightFootShape.lineTo(rTanX, rTanY);
      rightFootShape.lineTo(xFootCorner, yFootTop);
      rightFootShape.lineTo(0, yFootTop);
      rightFootShape.closePath();

      const rightFootGeom = new THREE.ExtrudeGeometry(rightFootShape, {
        depth: totalDepth,
        bevelEnabled: false,
      });
      rightFootGeom.translate(0, 0, -totalDepth / 2);
      const rFootBrush = new Brush(rightFootGeom);
      rFootBrush.updateMatrixWorld();
      body = evaluator.evaluate(body, rFootBrush, ADDITION);
      body.updateMatrixWorld();

      // Left Tangent Gusset
      const leftFootShape = new THREE.Shape();
      leftFootShape.moveTo(0, centerOffsetY);
      leftFootShape.lineTo(-rTanX, rTanY);
      leftFootShape.lineTo(-xFootCorner, yFootTop);
      leftFootShape.lineTo(0, yFootTop);
      leftFootShape.closePath();

      const leftFootGeom = new THREE.ExtrudeGeometry(leftFootShape, {
        depth: totalDepth,
        bevelEnabled: false,
      });
      leftFootGeom.translate(0, 0, -totalDepth / 2);
      const lFootBrush = new Brush(leftFootGeom);
      lFootBrush.updateMatrixWorld();
      body = evaluator.evaluate(body, lFootBrush, ADDITION);
      body.updateMatrixWorld();
    } else {
      // C. Housing-to-Base Transition Fillet (Method 3: Positive Filler Wedges)
      // When gussets are not active, reinforce the cylinder-to-foot joint seam with internal fillet wedges
      const wedgeRadius = Math.max(1.0, Math.min(3.0, wallThickness * 0.5));
      const rightWedgeGeom = createInternalFilletWedge(wedgeRadius, totalDepth);
      const rightWedgeBrush = new Brush(rightWedgeGeom);
      rightWedgeBrush.position.set(outerRadius * 0.9, footHeight, 0);
      rightWedgeBrush.updateMatrixWorld();
      body = evaluator.evaluate(body, rightWedgeBrush, ADDITION);
      body.updateMatrixWorld();

      const leftWedgeGeom = createInternalFilletWedge(wedgeRadius, totalDepth);
      leftWedgeGeom.scale(-1, 1, 1);
      const leftWedgeBrush = new Brush(leftWedgeGeom);
      leftWedgeBrush.position.set(-outerRadius * 0.9, footHeight, 0);
      leftWedgeBrush.updateMatrixWorld();
      body = evaluator.evaluate(body, leftWedgeBrush, ADDITION);
      body.updateMatrixWorld();
    }
  }

  // ========================================================
  // STEP 3: Defensive Subtractions (Bearing Pocket, Shaft Hole, Mounting Screws)
  // ========================================================

  // A. Bearing Pocket Cutter:
  // Front face of body sits at Z = +totalDepth/2.
  // Pocket floor sits at Z = +totalDepth/2 - pocketDepth.
  // To avoid coplanar face artifacts, extend cutter height 2.0 mm beyond the front face.
  if (params.isThroughHole && !retentionLip && pocketDepth >= totalDepth) {
    // Full pass-through bearing pocket bore
    const throughPocketGeom = new THREE.CylinderGeometry(pocketRadius, pocketRadius, totalDepth * 4, 32);
    throughPocketGeom.rotateX(Math.PI / 2);
    const throughPocketBrush = new Brush(throughPocketGeom);
    throughPocketBrush.position.set(0, centerOffsetY, 0);
    throughPocketBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, throughPocketBrush, SUBTRACTION);
    body.updateMatrixWorld();
  } else {
    // Stepped pocket: extends 2.0mm beyond front face to avoid coplanar face artifacts
    const pocketCutterHeight = pocketDepth + 2.0;
    const pocketCylGeom = new THREE.CylinderGeometry(pocketRadius, pocketRadius, pocketCutterHeight, 32);
    pocketCylGeom.rotateX(Math.PI / 2);
    const pocketBrush = new Brush(pocketCylGeom);
    const pocketCenterZ = (totalDepth / 2 - pocketDepth) + pocketCutterHeight / 2;
    pocketBrush.position.set(0, centerOffsetY, pocketCenterZ);
    pocketBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, pocketBrush, SUBTRACTION);
    body.updateMatrixWorld();
  }

  // B. Bearing Pocket Entry Chamfer (Method 2: Lead-in entry chamfer to ease bearing press-fit)
  if (hasLeadInChamfer) {
    const chamferDepth = 0.8;
    const chamferOuterRadius = pocketRadius + 0.5;
    const overshoot = 0.5;
    const slope = 0.5 / 0.8;
    const coneH = chamferDepth + overshoot;
    const coneGeom = new THREE.CylinderGeometry(
      chamferOuterRadius + overshoot * slope,
      pocketRadius,
      coneH,
      32
    );
    coneGeom.rotateX(Math.PI / 2);
    const chamferBrush = new Brush(coneGeom);
    const chamferCenterZ = (totalDepth / 2 - chamferDepth) + coneH / 2;
    chamferBrush.position.set(0, centerOffsetY, chamferCenterZ);
    chamferBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, chamferBrush, SUBTRACTION);
    body.updateMatrixWorld();
  }

  // C. Center Shaft Clearance Hole:
  // If retentionLip is active OR through-hole is requested, subtract inner cylinder with diameter (boreID + printer_compensation)
  // extending completely through both sides (oversized totalDepth * 4)
  if (retentionLip || params.isThroughHole) {
    const shaftCylGeom = new THREE.CylinderGeometry(shaftClearanceRadius, shaftClearanceRadius, totalDepth * 4, 32);
    shaftCylGeom.rotateX(Math.PI / 2);
    const shaftBrush = new Brush(shaftCylGeom);
    shaftBrush.position.set(0, centerOffsetY, 0);
    shaftBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, shaftBrush, SUBTRACTION);
    body.updateMatrixWorld();
  }

  // D. Mounting Holes & Ears:
  // Screw clearance holes (screwDia + printer_compensation) passing completely through the flanges
  if (mountingFlanges === 'two-sided') {
    const holeGeom = new THREE.CylinderGeometry(mountHoleRadius, mountHoleRadius, totalDepth * 4, 24);
    holeGeom.rotateX(Math.PI / 2);

    // Left ear clearance hole
    const leftHoleBrush = new Brush(holeGeom);
    leftHoleBrush.position.set(-earCenterDist, 0, 0);
    leftHoleBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, leftHoleBrush, SUBTRACTION);
    body.updateMatrixWorld();

    // Right ear clearance hole
    const rightHoleBrush = new Brush(holeGeom);
    rightHoleBrush.position.set(earCenterDist, 0, 0);
    rightHoleBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, rightHoleBrush, SUBTRACTION);
    body.updateMatrixWorld();

  } else if (mountingFlanges === 'bottom-foot') {
    const footHalfWidth = outerRadius + Math.max(8.0, flangeLength);
    const footHeight = Math.max(5.0, wallThickness * 1.2);
    const footHoleX = outerRadius + (footHalfWidth - outerRadius) * 0.5;

    // Screw clearance holes drilled vertically through foot along Y axis
    const footHoleGeom = new THREE.CylinderGeometry(mountHoleRadius, mountHoleRadius, footHeight * 4, 24);

    const leftFootHole = new Brush(footHoleGeom);
    leftFootHole.position.set(-footHoleX, footHeight / 2, 0);
    leftFootHole.updateMatrixWorld();
    body = evaluator.evaluate(body, leftFootHole, SUBTRACTION);
    body.updateMatrixWorld();

    const rightFootHole = new Brush(footHoleGeom);
    rightFootHole.position.set(footHoleX, footHeight / 2, 0);
    rightFootHole.updateMatrixWorld();
    body = evaluator.evaluate(body, rightFootHole, SUBTRACTION);
    body.updateMatrixWorld();
  }

  // ========================================================
  // STEP 4: Creased Normals (30°)
  // ========================================================
  const finalGeometry = toCreasedNormals(body.geometry, THREE.MathUtils.degToRad(30));
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
