import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  BearingPillowBlockParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Bearing Pillow Block using Constructive Solid Geometry (CSG):
 * 1. Center cylinder boss sized to house the specified bearing OD + wall thickness.
 * 2. Mounting options:
 *    - 'two-sided': Cylindrical ear bosses at +/- earCenterDist with true mathematical
 *      external tangent solids bridging seamlessly into the center cylinder.
 *    - 'bottom-foot': Pedestal rectangular base foot with smooth tangent web flanks.
 *    - 'none': Compact cylindrical cartridge housing.
 * 3. CSG subtractions:
 *    - Bearing pocket bore (exact depth).
 *    - Shaft clearance bore / retention lip shoulder.
 *    - Clean cylindrical mounting screw holes.
 * 4. Creased normals (35°) ensure razor-flat planar faces with silky smooth cylindrical bores.
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

  // 1. Core Dimensions
  const pocketDia = bearingOD + printer_compensation;
  const pocketRadius = Math.max(1.0, pocketDia / 2);
  const outerRadius = pocketRadius + Math.max(1.5, wallThickness);

  // Depth logic
  const pocketDepth = Math.max(2.0, params.pocketDepth);
  const actualLipThick = retentionLip ? Math.max(0.8, lipThickness) : 0;
  const totalDepth = pocketDepth + actualLipThick;

  // Shaft clearance radius (behind bearing retention ledge)
  const shaftClearanceRadius = retentionLip
    ? Math.max((bearingID + printer_compensation + 0.8) / 2, pocketRadius - Math.max(0.4, lipOverhang))
    : (params.isThroughHole ? pocketRadius : 0);

  const mountHoleDia = SCREW_CLEARANCE_DIAMETERS[mountHoleSize] + printer_compensation;
  const mountHoleRadius = mountHoleDia / 2;

  // Initialize CSG Evaluator
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  const centerOffsetY = mountingFlanges === 'bottom-foot'
    ? outerRadius + Math.max(5.0, wallThickness * 1.2) * 0.5
    : 0;

  // ========================================================
  // STEP 1: Center Cylinder Boss
  // ========================================================
  // Cylinder oriented along Z axis, centered at Z = 0 (from -totalDepth/2 to +totalDepth/2)
  const centerGeom = new THREE.CylinderGeometry(outerRadius, outerRadius, totalDepth, 64);
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

    // External Tangent Angle between center circle (R_c) and ear circle (R_e)
    const diffR = outerRadius - earRadius;
    const alpha = Math.min(0.999, Math.max(0.0, diffR / d));
    const cosPhi = alpha;
    const sinPhi = Math.sqrt(Math.max(0.001, 1 - cosPhi * cosPhi));

    // A. Right Ear Cylinder
    const rightEarGeom = new THREE.CylinderGeometry(earRadius, earRadius, totalDepth, 48);
    rightEarGeom.rotateX(Math.PI / 2);
    const rightEarBrush = new Brush(rightEarGeom);
    rightEarBrush.position.set(d, 0, 0);
    rightEarBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, rightEarBrush, ADDITION);
    body.updateMatrixWorld();

    // B. Left Ear Cylinder
    const leftEarGeom = new THREE.CylinderGeometry(earRadius, earRadius, totalDepth, 48);
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

    // A. Rectangular Base Foot Plate
    const footGeom = new THREE.BoxGeometry(footHalfWidth * 2, footHeight, totalDepth);
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
    }
  }

  // ========================================================
  // STEP 3: Subtractions (Bearing Pocket, Shaft Bore & Screw Holes)
  // ========================================================
  // A. Bearing Pocket Bore: cut from front face (Z = +totalDepth/2) inward to depth pocketDepth
  const pocketCylGeom = new THREE.CylinderGeometry(pocketRadius, pocketRadius, pocketDepth * 2, 64);
  pocketCylGeom.rotateX(Math.PI / 2);
  const pocketBrush = new Brush(pocketCylGeom);
  pocketBrush.position.set(0, centerOffsetY, totalDepth / 2);
  pocketBrush.updateMatrixWorld();
  body = evaluator.evaluate(body, pocketBrush, SUBTRACTION);
  body.updateMatrixWorld();

  // B. Center Shaft Clearance Hole (through entire body)
  if (shaftClearanceRadius > 0) {
    const shaftCylGeom = new THREE.CylinderGeometry(shaftClearanceRadius, shaftClearanceRadius, totalDepth * 4, 64);
    shaftCylGeom.rotateX(Math.PI / 2);
    const shaftBrush = new Brush(shaftCylGeom);
    shaftBrush.position.set(0, centerOffsetY, 0);
    shaftBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, shaftBrush, SUBTRACTION);
    body.updateMatrixWorld();
  }

  // C. Mounting Screw Holes
  if (mountingFlanges === 'two-sided') {
    // Left ear screw clearance hole
    const holeGeom = new THREE.CylinderGeometry(mountHoleRadius, mountHoleRadius, totalDepth * 4, 32);
    holeGeom.rotateX(Math.PI / 2);

    const leftHoleBrush = new Brush(holeGeom);
    leftHoleBrush.position.set(-earCenterDist, 0, 0);
    leftHoleBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, leftHoleBrush, SUBTRACTION);
    body.updateMatrixWorld();

    // Right ear screw clearance hole
    const rightHoleBrush = new Brush(holeGeom);
    rightHoleBrush.position.set(earCenterDist, 0, 0);
    rightHoleBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, rightHoleBrush, SUBTRACTION);
    body.updateMatrixWorld();

  } else if (mountingFlanges === 'bottom-foot') {
    const footHalfWidth = outerRadius + Math.max(8.0, flangeLength);
    const footHeight = Math.max(5.0, wallThickness * 1.2);
    const footHoleX = outerRadius + (footHalfWidth - outerRadius) * 0.5;

    // Screw holes drilled vertically through foot along Y axis
    const footHoleGeom = new THREE.CylinderGeometry(mountHoleRadius, mountHoleRadius, footHeight * 4, 32);

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
  // STEP 4: Calculate Creased Normals
  // ========================================================
  const finalGeometry = toCreasedNormals(body.geometry, THREE.MathUtils.degToRad(35));
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
