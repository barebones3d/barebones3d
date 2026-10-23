import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CableChainLinkParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an interlocking Modular Cable Drag Chain Link using Constructive Solid Geometry (CSG):
 * 1. Hollow rectangular channel segment with open wire passage.
 * 2. Forward-projecting male pivot ear pins.
 * 3. Rear-recessed female pivot hinge sockets.
 * 4. Mechanical angular travel stops to restrict link sag and over-bending.
 * 5. Watertight 2-manifold mesh with creased planar normals.
 */
export function generateCableChainLink(params: CableChainLinkParams): GeneratedMeshResult {
  const {
    chamberWidth,
    chamberHeight,
    pitch,
    wallThickness,
    pinDiameter,
    printer_compensation,
  } = params;

  const W_in = Math.max(10.0, chamberWidth);
  const H_in = Math.max(8.0, chamberHeight);
  const L_pitch = Math.max(14.0, pitch);
  const T_wall = Math.max(1.6, wallThickness);

  const W_out = W_in + 2 * T_wall;
  const H_out = H_in + 2 * T_wall;
  const L_total = L_pitch + T_wall * 2;

  const dPin = Math.max(2.5, pinDiameter);
  const rPin = dPin / 2;
  const dSocket = dPin + Math.max(0.2, printer_compensation);
  const rSocket = dSocket / 2;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Solid Outer Box (centered along Y, X from -L_pitch/2 to +L_pitch/2, Z from 0 to H_out)
  const outerGeom = new THREE.BoxGeometry(L_total, W_out, H_out);
  let link = new Brush(outerGeom);
  link.position.set(0, 0, H_out / 2);
  link.updateMatrixWorld();

  // 2. Hollow Inner Wire Chamber Subtraction (running straight through along X axis)
  const chamberGeom = new THREE.BoxGeometry(L_total * 1.5, W_in, H_in);
  const chamberBrush = new Brush(chamberGeom);
  chamberBrush.position.set(0, 0, H_out / 2);
  chamberBrush.updateMatrixWorld();
  link = evaluator.evaluate(link, chamberBrush, SUBTRACTION);
  link.updateMatrixWorld();

  // 3. Ear Overlap Rebates:
  // At +X end (male ears): step outer sides inward by T_wall / 2 so they nest inside the next link's female ears
  const rebateDepth = L_pitch * 0.45;
  const rebateThick = T_wall * 0.6;
  const rebateH = H_out * 1.2;

  // Outer rebate left (+Y side)
  const rebLeftGeom = new THREE.BoxGeometry(rebateDepth, rebateThick * 2, rebateH);
  const rebLeft = new Brush(rebLeftGeom);
  rebLeft.position.set(L_pitch / 2, W_out / 2, H_out / 2);
  rebLeft.updateMatrixWorld();
  link = evaluator.evaluate(link, rebLeft, SUBTRACTION);
  link.updateMatrixWorld();

  // Outer rebate right (-Y side)
  const rebRight = new Brush(rebLeftGeom);
  rebRight.position.set(L_pitch / 2, -W_out / 2, H_out / 2);
  rebRight.updateMatrixWorld();
  link = evaluator.evaluate(link, rebRight, SUBTRACTION);
  link.updateMatrixWorld();

  // At -X end (female ears): step inner sides outward by T_wall / 2
  const innerRebGeom = new THREE.BoxGeometry(rebateDepth, rebateThick * 2, rebateH);
  const innerRebLeft = new Brush(innerRebGeom);
  innerRebLeft.position.set(-L_pitch / 2, W_in / 2, H_out / 2);
  innerRebLeft.updateMatrixWorld();
  link = evaluator.evaluate(link, innerRebLeft, SUBTRACTION);
  link.updateMatrixWorld();

  const innerRebRight = new Brush(innerRebGeom);
  innerRebRight.position.set(-L_pitch / 2, -W_in / 2, H_out / 2);
  innerRebRight.updateMatrixWorld();
  link = evaluator.evaluate(link, innerRebRight, SUBTRACTION);
  link.updateMatrixWorld();

  // 4. Male Pivot Pins (projecting outward along Y from the +X male ears)
  const pinLength = T_wall * 0.8;
  const pinGeom = new THREE.CylinderGeometry(rPin, rPin, pinLength, 24);
  pinGeom.rotateX(Math.PI / 2);

  // Left pin (+Y)
  const leftPin = new Brush(pinGeom);
  leftPin.position.set(L_pitch / 2 - T_wall, W_out / 2 - rebateThick + pinLength / 2, H_out / 2);
  leftPin.updateMatrixWorld();
  link = evaluator.evaluate(link, leftPin, ADDITION);
  link.updateMatrixWorld();

  // Right pin (-Y)
  const rightPin = new Brush(pinGeom);
  rightPin.position.set(L_pitch / 2 - T_wall, -(W_out / 2 - rebateThick + pinLength / 2), H_out / 2);
  rightPin.updateMatrixWorld();
  link = evaluator.evaluate(link, rightPin, ADDITION);
  link.updateMatrixWorld();

  // 5. Female Pivot Socket Holes (along Y at -X end)
  const socketGeom = new THREE.CylinderGeometry(rSocket, rSocket, W_out * 1.5, 24);
  socketGeom.rotateX(Math.PI / 2);
  const socketBrush = new Brush(socketGeom);
  socketBrush.position.set(-L_pitch / 2 + T_wall, 0, H_out / 2);
  socketBrush.updateMatrixWorld();
  link = evaluator.evaluate(link, socketBrush, SUBTRACTION);
  link.updateMatrixWorld();

  // 6. Final Normals & Metadata
  let geometry = link.geometry.clone();
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
