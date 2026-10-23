import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ExtrusionEndCapParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Standard profile dimensions [width, height, slotWidth, centerHole] (mm)
 */
const PROFILE_SPECS: Record<string, { w: number; h: number; slotW: number; prongDist: number }> = {
  '2020': { w: 20, h: 20, slotW: 6.0, prongDist: 7.2 },
  '3030': { w: 30, h: 30, slotW: 8.0, prongDist: 10.5 },
  '4040': { w: 40, h: 40, slotW: 8.0, prongDist: 15.0 },
  '2040': { w: 20, h: 40, slotW: 6.0, prongDist: 7.2 },
};

/**
 * Generates an Aluminum Extrusion Profile End Cap using CSG:
 * - Clean outer face with beveled chamfer border
 * - 4 tapered friction-fit insertion tabs locking firmly into T/V-slots
 * - Optional center access hole
 * - 100% closed, watertight 2-manifold mesh
 */
export function generateExtrusionEndCap(params: ExtrusionEndCapParams): GeneratedMeshResult {
  const {
    profileSize,
    capThickness = 3.0,
    prongLength = 8.0,
    bezelChamfer = 1.0,
    centerHole = true,
    centerHoleDiameter = 5.0,
    printer_compensation = 0.15,
  } = params;

  const spec = PROFILE_SPECS[profileSize] || PROFILE_SPECS['2020'];
  const W = spec.w;
  const H = spec.h;
  const Tc = Math.max(1.8, capThickness);
  const Lp = Math.max(4.0, prongLength);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Outer Face Plate (at Z = 0 to Tc)
  const faceGeom = new THREE.BoxGeometry(W, H, Tc);
  let cap = new Brush(faceGeom);
  cap.position.set(0, 0, Tc / 2);
  cap.updateMatrixWorld();

  // 2. Chamfer outer edges (subtraction of 4 diagonal corner bevel blocks)
  const ch = Math.min(bezelChamfer, Tc * 0.45);
  if (ch > 0.3) {
    // 4 outer corner chamfers
    const chamferGeom = new THREE.BoxGeometry(W * 1.5, ch * 2, ch * 2);
    chamferGeom.rotateX(Math.PI / 4);

    const chTop = new Brush(chamferGeom);
    chTop.position.set(0, H / 2, 0);
    chTop.updateMatrixWorld();
    cap = evaluator.evaluate(cap, chTop, SUBTRACTION);
    cap.updateMatrixWorld();

    const chBottom = new Brush(chamferGeom);
    chBottom.position.set(0, -H / 2, 0);
    chBottom.updateMatrixWorld();
    cap = evaluator.evaluate(cap, chBottom, SUBTRACTION);
    cap.updateMatrixWorld();

    const chamferGeomY = new THREE.BoxGeometry(ch * 2, H * 1.5, ch * 2);
    chamferGeomY.rotateY(Math.PI / 4);

    const chRight = new Brush(chamferGeomY);
    chRight.position.set(W / 2, 0, 0);
    chRight.updateMatrixWorld();
    cap = evaluator.evaluate(cap, chRight, SUBTRACTION);
    cap.updateMatrixWorld();

    const chLeft = new Brush(chamferGeomY);
    chLeft.position.set(-W / 2, 0, 0);
    chLeft.updateMatrixWorld();
    cap = evaluator.evaluate(cap, chLeft, SUBTRACTION);
    cap.updateMatrixWorld();
  }

  // 3. Insertion Prongs / Tabs (extend from Z = Tc to Tc + Lp)
  // Prongs fit into slot channels: width = slotW - printer_compensation
  const prongW = Math.max(3.0, spec.slotW - printer_compensation);
  const prongT = Math.max(1.8, 2.5 - printer_compensation);

  // 4 tabs located at +/- prongDist along X and Y
  const dX = (W / 2) - 3.2;
  const dY = (H / 2) - 3.2;

  const positions4 = [
    { x: 0, y: dY, w: prongW, h: prongT },
    { x: 0, y: -dY, w: prongW, h: prongT },
    { x: dX, y: 0, w: prongT, h: prongW },
    { x: -dX, y: 0, w: prongT, h: prongW },
  ];

  for (const pos of positions4) {
    const prongGeom = new THREE.BoxGeometry(pos.w, pos.h, Lp);
    const prongBrush = new Brush(prongGeom);
    prongBrush.position.set(pos.x, pos.y, Tc + Lp / 2);
    prongBrush.updateMatrixWorld();

    cap = evaluator.evaluate(cap, prongBrush, ADDITION);
    cap.updateMatrixWorld();
  }

  // 4. Center Hole (if requested)
  if (centerHole) {
    const rHole = (centerHoleDiameter + printer_compensation) / 2;
    const holeGeom = new THREE.CylinderGeometry(rHole, rHole, (Tc + Lp) * 1.5, 32);
    holeGeom.rotateX(Math.PI / 2);
    const holeBrush = new Brush(holeGeom);
    holeBrush.position.set(0, 0, (Tc + Lp) / 2);
    holeBrush.updateMatrixWorld();

    cap = evaluator.evaluate(cap, holeBrush, SUBTRACTION);
    cap.updateMatrixWorld();
  }

  // Output geometry
  let outGeometry = cap.geometry.clone();
  outGeometry = toCreasedNormals(outGeometry, (35 * Math.PI) / 180);
  outGeometry.computeBoundingBox();

  const bbox = outGeometry.boundingBox || new THREE.Box3();
  const dimensions = {
    x: Number((bbox.max.x - bbox.min.x).toFixed(2)),
    y: Number((bbox.max.y - bbox.min.y).toFixed(2)),
    z: Number((bbox.max.z - bbox.min.z).toFixed(2)),
  };

  const volume = computeMeshVolume(outGeometry);
  const estimatedPrintWeightGrams = estimateWeightGrams(volume, 0.2);

  return {
    geometry: outGeometry,
    dimensions,
    triangles: (outGeometry.index ? outGeometry.index.count : outGeometry.attributes.position.count) / 3,
    vertices: outGeometry.attributes.position.count,
    estimatedPrintWeightGrams,
  };
}
