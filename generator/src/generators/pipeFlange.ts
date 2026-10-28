import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PipeFlangeParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Industrial 4-Bolt / 6-Bolt / 8-Bolt Raised-Face Pipe Flange using CSG:
 * - Raised gasket sealing face
 * - Concentric O-ring retention groove
 * - Circular bolt pattern with clearance holes
 * - Rear pipe socket welding/glue neck collar
 */
export function generatePipeFlange(params: PipeFlangeParams): GeneratedMeshResult {
  const {
    pipeNominalDiameter = 25,
    flangeOuterDiameter = 70,
    flangeThickness = 10,
    boltHoleCount = 4,
    boltPitchCircleDiameter = 50,
    boltHoleDiameter = 5.5,
    hasORingGroove = true,
    oRingWidth = 3.0,
    printer_compensation = 0.15,
  } = params;

  const D_pipe = Math.max(8, pipeNominalDiameter + printer_compensation);
  const R_pipe = D_pipe / 2;
  const D_flange = Math.max(D_pipe * 2 + 10, flangeOuterDiameter);
  const R_flange = D_flange / 2;
  const T_flange = Math.max(4, flangeThickness);
  const numBolts = boltHoleCount === 8 ? 8 : boltHoleCount === 6 ? 6 : 4;

  const PCD = Math.max(D_pipe + 10, Math.min(D_flange - 8, boltPitchCircleDiameter));
  const R_pcd = PCD / 2;
  const boltDia = Math.max(3, boltHoleDiameter + printer_compensation);
  const rBolt = boltDia / 2;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Main Flange Disc (at origin, z from 0 to T_flange)
  const discGeom = new THREE.CylinderGeometry(R_flange, R_flange, T_flange, 48);
  discGeom.rotateX(Math.PI / 2);
  discGeom.translate(0, 0, T_flange / 2);
  let mainBody = new Brush(discGeom);
  mainBody.updateMatrixWorld();

  // 2. Add Rear Pipe Socket Neck Collar (at -Z face, from -neckLen to 0)
  const neckLen = Math.max(8, D_pipe * 0.45);
  const neckOD = D_pipe + 6.0;
  const neckGeom = new THREE.CylinderGeometry(neckOD / 2, neckOD / 2, neckLen, 36);
  neckGeom.rotateX(Math.PI / 2);
  neckGeom.translate(0, 0, -neckLen / 2);
  const neckBrush = new Brush(neckGeom);
  neckBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, neckBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 3. Add Raised Sealing Face on Front (+Z, z from T_flange to T_flange + 1.5)
  const raisedFaceHeight = 1.6;
  const raisedFaceOD = Math.min(PCD - boltDia * 1.6, D_pipe + 14);
  const raisedGeom = new THREE.CylinderGeometry(raisedFaceOD / 2, raisedFaceOD / 2, raisedFaceHeight, 48);
  raisedGeom.rotateX(Math.PI / 2);
  raisedGeom.translate(0, 0, T_flange + raisedFaceHeight / 2);
  const raisedBrush = new Brush(raisedGeom);
  raisedBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, raisedBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 4. Subtract Central Pipe Through-Bore
  const totalLength = T_flange + neckLen + raisedFaceHeight + 4;
  const pipeBoreGeom = new THREE.CylinderGeometry(R_pipe, R_pipe, totalLength, 48);
  pipeBoreGeom.rotateX(Math.PI / 2);
  pipeBoreGeom.translate(0, 0, (T_flange - neckLen + raisedFaceHeight) / 2);
  const pipeBoreBrush = new Brush(pipeBoreGeom);
  pipeBoreBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, pipeBoreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 5. Subtract Concentric O-Ring Seal Groove on Raised Face
  if (hasORingGroove && raisedFaceOD > D_pipe + 6) {
    const oRingDia = (D_pipe + raisedFaceOD) / 2;
    const rRing = oRingDia / 2;
    const wRing = Math.max(1.8, oRingWidth);
    const dRing = Math.max(1.2, wRing * 0.7);

    // Torus or annular cylinder cut
    const oOuter = rRing + wRing / 2;
    const oInner = rRing - wRing / 2;

    const outerCylGeom = new THREE.CylinderGeometry(oOuter, oOuter, dRing * 2, 48);
    outerCylGeom.rotateX(Math.PI / 2);
    outerCylGeom.translate(0, 0, T_flange + raisedFaceHeight);

    const innerCylGeom = new THREE.CylinderGeometry(oInner, oInner, dRing * 2 + 1, 48);
    innerCylGeom.rotateX(Math.PI / 2);
    innerCylGeom.translate(0, 0, T_flange + raisedFaceHeight);

    let ringBrush = new Brush(outerCylGeom);
    ringBrush.updateMatrixWorld();
    const innerBrush = new Brush(innerCylGeom);
    innerBrush.updateMatrixWorld();
    ringBrush = evaluator.evaluate(ringBrush, innerBrush, SUBTRACTION);
    ringBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, ringBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();
  }

  // 6. Subtract Circular Bolt Hole Pattern
  for (let b = 0; b < numBolts; b++) {
    const angle = (b / numBolts) * Math.PI * 2;
    const bx = Math.cos(angle) * R_pcd;
    const by = Math.sin(angle) * R_pcd;

    const bHoleGeom = new THREE.CylinderGeometry(rBolt, rBolt, T_flange + 4, 24);
    bHoleGeom.rotateX(Math.PI / 2);
    bHoleGeom.translate(bx, by, T_flange / 2);
    const bHoleBrush = new Brush(bHoleGeom);
    bHoleBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, bHoleBrush, SUBTRACTION);
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
