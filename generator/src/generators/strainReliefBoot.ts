import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals, mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { StrainReliefBootParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Industrial Helical Spiral Strain Relief Cable Boot using Mathematical Lofting + CSG:
 * - Tapered conical flexible boot preventing cable kink at connector junction
 * - Enclosure snap/groove retention collar
 * - Helical spiral relief slots providing progressive graduated bending flexibility
 */
export function generateStrainReliefBoot(params: StrainReliefBootParams): GeneratedMeshResult {
  const {
    cableDiameter = 6,
    flangeDiameter = 18,
    bootLength = 45,
    spiralPitch = 7,
    taperFactor = 0.65,
    slotWidth = 1.6,
    printer_compensation = 0.15,
  } = params;

  const D_cable = Math.max(3, cableDiameter + printer_compensation);
  const rCable = D_cable / 2;
  const L = Math.max(25, bootLength);
  const D_flange = Math.max(D_cable + 6, flangeDiameter);
  const rFlange = D_flange / 2;

  const rBase = rFlange * 0.85;
  const rTip = Math.max(rCable + 1.2, rBase * Math.max(0.4, Math.min(0.85, taperFactor)));
  const H_collar = 8.0;
  const H_boot = L - H_collar;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Retention Flange Collar (at z from 0 to H_collar)
  // Step flange: panel groove
  const collarGeom = new THREE.CylinderGeometry(rFlange, rFlange, H_collar, 36);
  collarGeom.rotateX(Math.PI / 2);
  collarGeom.translate(0, 0, H_collar / 2);
  let mainBody = new Brush(collarGeom);
  mainBody.updateMatrixWorld();

  // Panel retaining groove in collar
  const grooveW = 2.0;
  const grooveD = (rFlange - rBase) * 0.7;
  const grooveGeom = new THREE.CylinderGeometry(rFlange + 1, rFlange + 1, grooveW, 36);
  grooveGeom.rotateX(Math.PI / 2);
  grooveGeom.translate(0, 0, H_collar / 2);

  const grooveInner = new THREE.CylinderGeometry(rFlange - grooveD, rFlange - grooveD, grooveW + 1, 36);
  grooveInner.rotateX(Math.PI / 2);
  grooveInner.translate(0, 0, H_collar / 2);

  let gBrush = new Brush(grooveGeom);
  gBrush.updateMatrixWorld();
  const giBrush = new Brush(grooveInner);
  giBrush.updateMatrixWorld();
  gBrush = evaluator.evaluate(gBrush, giBrush, SUBTRACTION);
  gBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, gBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 2. Tapered Conical Boot Body (z from H_collar to L)
  const coneGeom = new THREE.CylinderGeometry(rTip, rBase, H_boot, 36);
  coneGeom.rotateX(Math.PI / 2);
  coneGeom.translate(0, 0, H_collar + H_boot / 2);
  const coneBrush = new Brush(coneGeom);
  coneBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, coneBrush, ADDITION);
  mainBody.updateMatrixWorld();

  // 3. Subtract Continuous Central Wire Bore
  const boreGeom = new THREE.CylinderGeometry(rCable, rCable, L + 4, 32);
  boreGeom.rotateX(Math.PI / 2);
  boreGeom.translate(0, 0, L / 2);
  const boreBrush = new Brush(boreGeom);
  boreBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, boreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Helical Spiral Progressive Bending Cutout Slots along the boot
  const pitch = Math.max(4.0, spiralPitch);
  const numSpiralSteps = Math.floor((H_boot - 6) / (pitch / 4));
  const sWidth = Math.max(1.0, slotWidth);

  // Array of overlapping angled cuts along a helix
  const slotGeoms: THREE.BufferGeometry[] = [];
  for (let i = 0; i < numSpiralSteps; i++) {
    const frac = i / numSpiralSteps;
    const zCur = H_collar + 3 + frac * (H_boot - 8);
    const angle = (zCur / pitch) * Math.PI * 2;
    const rCur = rBase + (rTip - rBase) * frac;

    // A small slot box rotated tangential to the helix
    const slotBoxGeom = new THREE.BoxGeometry(rCur * 2.2, sWidth, sWidth * 1.5);
    slotBoxGeom.rotateZ(angle);
    slotBoxGeom.translate(0, 0, zCur);
    slotGeoms.push(slotBoxGeom);
  }

  if (slotGeoms.length > 0) {
    const mergedSlots = mergeGeometries(slotGeoms);
    const slotsBrush = new Brush(mergedSlots);
    slotsBrush.updateMatrixWorld();
    mainBody = evaluator.evaluate(mainBody, slotsBrush, SUBTRACTION);
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
