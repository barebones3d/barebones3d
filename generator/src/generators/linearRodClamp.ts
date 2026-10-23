import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  LinearRodClampParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
  SCREW_COUNTERSINK_HEAD_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an SK/SHF-style Linear Smooth Rod Support Clamp using Constructive Solid Geometry (CSG):
 * 1. Base pedestal block with arched/filleted upper clamping boss.
 * 2. Precision horizontal cylindrical rod bore.
 * 3. Clamping flexure slit cut through one side to allow pinching.
 * 4. Transverse pinch bolt through-hole with socket head counterbore.
 * 5. Base mounting foot holes for bolting to aluminum extrusion or machine plates.
 */
export function generateLinearRodClamp(params: LinearRodClampParams): GeneratedMeshResult {
  const {
    rodDiameter,
    mountStyle,
    blockHeight,
    blockWidth,
    blockThickness,
    clampGap,
    pinchScrewSize,
    baseScrewSize,
    printer_compensation,
  } = params;

  const rodDia = Math.max(4.0, rodDiameter + printer_compensation);
  const rRod = rodDia / 2;

  const W = Math.max(rodDia * 2.5, blockWidth);
  const H = Math.max(rodDia * 2.2, blockHeight);
  const T = Math.max(8.0, blockThickness);

  const sGap = Math.max(0.8, clampGap);

  const pinchDia = SCREW_CLEARANCE_DIAMETERS[pinchScrewSize] + printer_compensation;
  const rPinch = pinchDia / 2;
  const pinchHeadDia = SCREW_COUNTERSINK_HEAD_DIAMETERS[pinchScrewSize] + printer_compensation;
  const rPinchHead = pinchHeadDia / 2;

  const baseDia = SCREW_CLEARANCE_DIAMETERS[baseScrewSize] + printer_compensation;
  const rBase = baseDia / 2;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Solid Block Body
  // Horizontal SK: Rod at center height (H / 2), base foot at bottom
  const bodyGeom = new THREE.BoxGeometry(W, H, T);
  let body = new Brush(bodyGeom);
  body.position.set(0, H / 2, 0);
  body.updateMatrixWorld();

  // Top chamfer / arch (subtract corner wedges on upper left and right)
  const cutW = W * 0.25;
  const cutH = H * 0.3;
  if (cutW > 2 && cutH > 2) {
    const cornerGeom = new THREE.BoxGeometry(cutW * 2, cutH * 2, T * 2);

    // Top left cut
    const cutLeft = new Brush(cornerGeom);
    cutLeft.position.set(-W / 2, H, 0);
    cutLeft.rotation.z = Math.PI / 4;
    cutLeft.updateMatrixWorld();
    body = evaluator.evaluate(body, cutLeft, SUBTRACTION);
    body.updateMatrixWorld();

    // Top right cut
    const cutRight = new Brush(cornerGeom);
    cutRight.position.set(W / 2, H, 0);
    cutRight.rotation.z = -Math.PI / 4;
    cutRight.updateMatrixWorld();
    body = evaluator.evaluate(body, cutRight, SUBTRACTION);
    body.updateMatrixWorld();
  }

  // 2. Precision Rod Bore Subtraction (along Z axis)
  const rodCenterY = H * 0.55;
  const rodGeom = new THREE.CylinderGeometry(rRod, rRod, T * 3, 48);
  rodGeom.rotateX(Math.PI / 2);
  const rodBrush = new Brush(rodGeom);
  rodBrush.position.set(0, rodCenterY, 0);
  rodBrush.updateMatrixWorld();
  body = evaluator.evaluate(body, rodBrush, SUBTRACTION);
  body.updateMatrixWorld();

  // 3. Clamping Relief Slit Subtraction
  // Slit cuts from rod bore straight up to top edge (+Y)
  const slitHeight = H - rodCenterY + 2.0;
  const slitGeom = new THREE.BoxGeometry(sGap, slitHeight, T * 2);
  const slitBrush = new Brush(slitGeom);
  slitBrush.position.set(0, rodCenterY + slitHeight / 2, 0);
  slitBrush.updateMatrixWorld();
  body = evaluator.evaluate(body, slitBrush, SUBTRACTION);
  body.updateMatrixWorld();

  // 4. Transverse Pinch Bolt Hole (Crosses horizontally along X through the clamp slit)
  const pinchY = rodCenterY + (H - rodCenterY) * 0.55;
  const pinchGeom = new THREE.CylinderGeometry(rPinch, rPinch, W * 1.5, 24);
  pinchGeom.rotateZ(Math.PI / 2);
  const pinchBrush = new Brush(pinchGeom);
  pinchBrush.position.set(0, pinchY, 0);
  pinchBrush.updateMatrixWorld();
  body = evaluator.evaluate(body, pinchBrush, SUBTRACTION);
  body.updateMatrixWorld();

  // Pinch head counterbore on +X face
  const cbDepth = W * 0.3;
  const cbGeom = new THREE.CylinderGeometry(rPinchHead, rPinchHead, cbDepth, 24);
  cbGeom.rotateZ(Math.PI / 2);
  const cbBrush = new Brush(cbGeom);
  cbBrush.position.set(W / 2 - cbDepth / 2 + 0.5, pinchY, 0);
  cbBrush.updateMatrixWorld();
  body = evaluator.evaluate(body, cbBrush, SUBTRACTION);
  body.updateMatrixWorld();

  // 5. Base Mounting Holes (Vertical holes along Y axis for SK pedestal, or along Z for SHF flange)
  const xFootDist = W * 0.38;
  const isVerticalSHF = mountStyle === 'vertical-shf';
  const footHoleGeom = new THREE.CylinderGeometry(rBase, rBase, isVerticalSHF ? T * 3 : H * 2, 24);
  if (isVerticalSHF) {
    footHoleGeom.rotateX(Math.PI / 2);
  }

  // Left foot hole
  const leftHole = new Brush(footHoleGeom);
  leftHole.position.set(-xFootDist, isVerticalSHF ? rodCenterY : H / 2, 0);
  leftHole.updateMatrixWorld();
  body = evaluator.evaluate(body, leftHole, SUBTRACTION);
  body.updateMatrixWorld();

  // Right foot hole
  const rightHole = new Brush(footHoleGeom);
  rightHole.position.set(xFootDist, isVerticalSHF ? rodCenterY : H / 2, 0);
  rightHole.updateMatrixWorld();
  body = evaluator.evaluate(body, rightHole, SUBTRACTION);
  body.updateMatrixWorld();

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
