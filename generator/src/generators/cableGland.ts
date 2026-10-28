import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CableGlandParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Industrial Waterproof Cable Gland Compression Nut using CSG:
 * - Hexagonal wrench wrenching collar
 * - Conical strain-relief compression collet fingers with flexure relief slits
 * - Central wire pass-through bore with flared bellmouth entry
 */
export function generateCableGland(params: CableGlandParams): GeneratedMeshResult {
  const {
    cableDiameterMin = 4,
    cableDiameterMax = 8,
    hexNutSize = 22,
    threadLength = 10,
    glandHeight = 24,
    fingerCount = 6,
    printer_compensation = 0.15,
  } = params;

  const D_wireMin = Math.max(2.5, cableDiameterMin + printer_compensation);
  const D_wireMax = Math.max(D_wireMin + 1, cableDiameterMax + printer_compensation);
  const rBore = D_wireMax / 2;

  const hexFlat = Math.max(D_wireMax * 2 + 4, hexNutSize);
  const rHex = hexFlat / Math.sqrt(3); // radius of circumscribed circle of hexagon
  const H_hex = Math.max(6, threadLength * 0.7);
  const H_total = Math.max(H_hex + 10, glandHeight);
  const H_fingers = H_total - H_hex;

  const numFingers = Math.max(4, Math.min(8, Math.round(fingerCount)));

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Hexagonal Nut Body (at z from 0 to H_hex)
  const hexGeom = new THREE.CylinderGeometry(rHex, rHex, H_hex, 6);
  hexGeom.rotateX(Math.PI / 2);
  hexGeom.translate(0, 0, H_hex / 2);
  let mainBody = new Brush(hexGeom);
  mainBody.updateMatrixWorld();

  // 2. Add Conical Finger Collet Sleeve (at z from H_hex to H_total)
  // Tapered from rHex * 0.85 down to rBore + 2.5
  const rFingerBase = rHex * 0.82;
  const rFingerTip = rBore + 2.2;
  const fingerConeGeom = new THREE.CylinderGeometry(rFingerTip, rFingerBase, H_fingers, 36);
  fingerConeGeom.rotateX(Math.PI / 2);
  fingerConeGeom.translate(0, 0, H_hex + H_fingers / 2);
  const fingerConeBrush = new Brush(fingerConeGeom);
  fingerConeBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, fingerConeBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 3. Subtract Central Cable Pass-Through Bore
  const boreGeom = new THREE.CylinderGeometry(rBore, rBore, H_total + 4, 32);
  boreGeom.rotateX(Math.PI / 2);
  boreGeom.translate(0, 0, H_total / 2);
  const boreBrush = new Brush(boreGeom);
  boreBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, boreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Subtract Flared Cable Entry Bellmouth (at z = H_total)
  const bellDepth = 3.0;
  const bellGeom = new THREE.CylinderGeometry(rBore + 2.0, rBore, bellDepth, 32);
  bellGeom.rotateX(Math.PI / 2);
  bellGeom.translate(0, 0, H_total - bellDepth / 2 + 0.1);
  const bellBrush = new Brush(bellGeom);
  bellBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, bellBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 5. Subtract Flexure Relief Slits between fingers (from z = H_hex + 1 to H_total + 1)
  const slitWidth = 1.4;
  const slitLen = rFingerBase * 2.2;
  for (let f = 0; f < numFingers; f++) {
    const angle = (f / numFingers) * Math.PI; // cuts across diameter through center
    const slitGeom = new THREE.BoxGeometry(slitLen, slitWidth, H_fingers + 2);
    slitGeom.rotateZ(angle);
    slitGeom.translate(0, 0, H_hex + H_fingers / 2 + 1);
    const slitBrush = new Brush(slitGeom);
    slitBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, slitBrush, SUBTRACTION);
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
    dimensions: { x: Number(sz.x.toFixed(2)), y: Number(sz.y.toFixed(2)), z: Number(sz.z.toFixed(2)) },
    triangles: finalGeom.index ? finalGeom.index.count / 3 : finalGeom.attributes.position.count / 3,
    vertices: finalGeom.attributes.position.count,
    estimatedPrintWeightGrams: weight,
  };
}
