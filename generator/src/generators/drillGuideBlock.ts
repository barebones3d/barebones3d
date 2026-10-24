import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { DrillGuideBlockParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Multi-Diameter Perpendicular Drill Guide Block with Pipe V-Groove using CSG:
 * - Precision stepped through-holes for 3mm, 4mm, 5mm, 6mm, 8mm, 10mm drill bits
 * - 90-degree V-channel on underside for auto-centering on round pipes and cylinders
 * - Centerline registration sight notches
 */
export function generateDrillGuideBlock(params: DrillGuideBlockParams): GeneratedMeshResult {
  const {
    blockLength = 80,
    blockWidth = 35,
    blockHeight = 25,
    vGrooveDepth = 6,
    hasCenterlineAlignment = true,
    printer_compensation = 0.15,
  } = params;

  const L = Math.max(50, blockLength);
  const W = Math.max(25, blockWidth);
  const H = Math.max(18, blockHeight);
  const D_v = Math.max(3, Math.min(H * 0.45, vGrooveDepth));

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Solid Main Block (X from -L/2 to L/2, Y from -W/2 to W/2, Z from 0 to H)
  const bodyGeom = new THREE.BoxGeometry(L, W, H);
  bodyGeom.translate(0, 0, H / 2);
  let mainBody = new Brush(bodyGeom);
  mainBody.updateMatrixWorld();

  // 2. Subtract 90-degree V-Groove along X-axis on bottom (Z = 0)
  // 90 deg V groove: width at base = 2 * D_v
  const vShape = new THREE.Shape();
  vShape.moveTo(-D_v, -0.1);
  vShape.lineTo(0, D_v);
  vShape.lineTo(D_v, -0.1);
  vShape.closePath();

  const vGeom = new THREE.ExtrudeGeometry(vShape, { depth: L + 4, bevelEnabled: false });
  // Extrude along Z by default, rotate so it runs along X
  vGeom.rotateY(Math.PI / 2);
  vGeom.translate(-L / 2 - 2, 0, 0);
  const vBrush = new Brush(vGeom);
  vBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, vBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 3. Subtract Multi-Diameter Drill Guide Holes (3, 4, 5, 6, 8, 10 mm)
  const drillSizes = [3.0, 4.0, 5.0, 6.0, 8.0, 10.0];
  const numDrills = drillSizes.length;
  const drillSpan = L * 0.78;

  for (let i = 0; i < numDrills; i++) {
    const dia = drillSizes[i] + printer_compensation;
    const rDrill = dia / 2;
    const xPos = -drillSpan / 2 + (i / (numDrills - 1)) * drillSpan;

    const holeGeom = new THREE.CylinderGeometry(rDrill, rDrill, H + 4, 24);
    holeGeom.translate(xPos, 0, H / 2);
    const holeBrush = new Brush(holeGeom);
    holeBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, holeBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();

    // Chamfer at drill entrance (+Z top) for easy bit lead-in
    const chamferGeom = new THREE.CylinderGeometry(rDrill + 1.2, rDrill, 2.0, 24);
    chamferGeom.translate(xPos, 0, H - 1.0 + 0.1);
    const chamferBrush = new Brush(chamferGeom);
    chamferBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, chamferBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();
  }

  // 4. Centerline Alignment V-Notches on ends (for positioning on pencil lines)
  if (hasCenterlineAlignment) {
    const notchDepth = 2.5;
    const notchBox1 = new THREE.BoxGeometry(notchDepth * 2, 1.2, H + 2);
    notchBox1.translate(-L / 2, 0, H / 2);
    const nBrush1 = new Brush(notchBox1);
    nBrush1.updateMatrixWorld();
    mainBody = evaluator.evaluate(mainBody, nBrush1, SUBTRACTION);
    mainBody.updateMatrixWorld();

    const notchBox2 = new THREE.BoxGeometry(notchDepth * 2, 1.2, H + 2);
    notchBox2.translate(L / 2, 0, H / 2);
    const nBrush2 = new Brush(notchBox2);
    nBrush2.updateMatrixWorld();
    mainBody = evaluator.evaluate(mainBody, nBrush2, SUBTRACTION);
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
    dimensions: { x: sz.x, y: sz.y, z: sz.z },
    triangles: finalGeom.index ? finalGeom.index.count / 3 : finalGeom.attributes.position.count / 3,
    vertices: finalGeom.attributes.position.count,
    estimatedPrintWeightGrams: weight,
  };
}
