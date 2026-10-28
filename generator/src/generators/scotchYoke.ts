import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ScotchYokeParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Scotch Yoke Linear Reciprocating Carriage using CSG:
 * - Central transverse vertical slot for crank pin roller
 * - Dual axial output pushrods / shaft clamps
 * - Chamfered guide ways for smooth reciprocating linear motion
 * - Lightweight stiffening webs
 */
export function generateScotchYoke(params: ScotchYokeParams): GeneratedMeshResult {
  const {
    yokeStroke = 40,
    slotWidth = 8,
    blockLength = 70,
    blockHeight = 36,
    blockThickness = 12,
    rodDiameter = 8,
    printer_compensation = 0.15,
  } = params;

  const stroke = Math.max(15, yokeStroke);
  const sWidth = Math.max(4, slotWidth + printer_compensation);
  const T = Math.max(8, blockThickness);
  const W = Math.max(sWidth + 14, Math.min(120, blockLength));
  const H = Math.max(stroke + sWidth + 12, blockHeight);
  const rRod = Math.max(2, (rodDiameter + printer_compensation) / 2);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Central Yoke Carriage Block
  const bodyGeom = new THREE.BoxGeometry(W, H, T);
  let mainBody = new Brush(bodyGeom);
  mainBody.updateMatrixWorld();

  // 2. Add Left and Right Axial Output Rod Bosses (along X axis)
  const bossLen = 16;
  const bossDia = rRod * 2 + 6;
  const rBoss = bossDia / 2;

  // Left boss
  const leftBossGeom = new THREE.CylinderGeometry(rBoss, rBoss, bossLen, 24);
  leftBossGeom.rotateZ(Math.PI / 2);
  leftBossGeom.translate(-W / 2 - bossLen / 2, 0, 0);
  const leftBossBrush = new Brush(leftBossGeom);
  leftBossBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, leftBossBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // Right boss
  const rightBossGeom = new THREE.CylinderGeometry(rBoss, rBoss, bossLen, 24);
  rightBossGeom.rotateZ(Math.PI / 2);
  rightBossGeom.translate(W / 2 + bossLen / 2, 0, 0);
  const rightBossBrush = new Brush(rightBossGeom);
  rightBossBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, rightBossBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 3. Subtract Transverse Crank Slot (vertical along Y axis, depth through Z)
  // Rounded slot ends: box with two cylinders at ends
  const slotHeight = stroke + sWidth;
  const slotBoxGeom = new THREE.BoxGeometry(sWidth, slotHeight - sWidth, T + 4);
  const slotBoxBrush = new Brush(slotBoxGeom);
  slotBoxBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, slotBoxBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // Upper slot semicircular cap
  const capTopGeom = new THREE.CylinderGeometry(sWidth / 2, sWidth / 2, T + 4, 24);
  capTopGeom.rotateX(Math.PI / 2);
  capTopGeom.translate(0, (slotHeight - sWidth) / 2, 0);
  const capTopBrush = new Brush(capTopGeom);
  capTopBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, capTopBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // Lower slot semicircular cap
  const capBotGeom = new THREE.CylinderGeometry(sWidth / 2, sWidth / 2, T + 4, 24);
  capBotGeom.rotateX(Math.PI / 2);
  capBotGeom.translate(0, -(slotHeight - sWidth) / 2, 0);
  const capBotBrush = new Brush(capBotGeom);
  capBotBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, capBotBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Subtract Axial Output Rod Bores (through left and right bosses)
  const leftBoreGeom = new THREE.CylinderGeometry(rRod, rRod, bossLen + 10, 24);
  leftBoreGeom.rotateZ(Math.PI / 2);
  leftBoreGeom.translate(-W / 2 - bossLen / 2, 0, 0);
  const leftBoreBrush = new Brush(leftBoreGeom);
  leftBoreBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, leftBoreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  const rightBoreGeom = new THREE.CylinderGeometry(rRod, rRod, bossLen + 10, 24);
  rightBoreGeom.rotateZ(Math.PI / 2);
  rightBoreGeom.translate(W / 2 + bossLen / 2, 0, 0);
  const rightBoreBrush = new Brush(rightBoreGeom);
  rightBoreBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, rightBoreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 5. Weight-reduction corner cutouts
  if (W > 50 && H > 45) {
    const pocketW = (W - sWidth - 16) / 2;
    const pocketH = (H - stroke) * 0.45;
    if (pocketW > 4 && pocketH > 4) {
      // 4 pockets
      const xs = [-(W / 2 - pocketW / 2 - 4), W / 2 - pocketW / 2 - 4];
      const ys = [-(H / 2 - pocketH / 2 - 4), H / 2 - pocketH / 2 - 4];
      for (const px of xs) {
        for (const py of ys) {
          const pGeom = new THREE.BoxGeometry(pocketW, pocketH, T + 2);
          pGeom.translate(px, py, 0);
          const pBrush = new Brush(pGeom);
          pBrush.updateMatrixWorld();
          mainBody = evaluator.evaluate(mainBody, pBrush, SUBTRACTION);
          mainBody.updateMatrixWorld();
        }
      }
    }
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
