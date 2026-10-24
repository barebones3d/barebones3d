import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, ADDITION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PlanetaryCarrierParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Planetary Gearbox Planet Carrier Plate using CSG:
 * - Central sun gear shaft pass-through bore
 * - Symmetrical 3 or 4 planet gear pin journals on a pitch circle
 * - Rigid standoff posts for double-shear carrier alignment
 * - Weight-reduction web cutouts
 */
export function generatePlanetaryCarrier(params: PlanetaryCarrierParams): GeneratedMeshResult {
  const {
    planetCount = 3,
    carrierDiameter = 50,
    plateThickness = 5,
    pinPitchDiameter = 32,
    pinHoleDiameter = 4,
    sunShaftBore = 8,
    postHeight = 16,
    printer_compensation = 0.15,
  } = params;

  const numPlanets = planetCount === 4 ? 4 : 3;
  const D_carrier = Math.max(30, carrierDiameter);
  const R_carrier = D_carrier / 2;
  const T_plate = Math.max(3, plateThickness);
  const H_post = Math.max(6, postHeight);
  const PCD_pin = Math.max(16, Math.min(D_carrier - 8, pinPitchDiameter));
  const R_pin_pcd = PCD_pin / 2;
  const D_pin = Math.max(2.5, pinHoleDiameter + printer_compensation);
  const R_pin = D_pin / 2;
  const D_sun = Math.max(4, sunShaftBore + printer_compensation);
  const R_sun = D_sun / 2;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Base Carrier Disc (at z = 0 to T_plate)
  const baseDiscGeom = new THREE.CylinderGeometry(R_carrier, R_carrier, T_plate, 48);
  baseDiscGeom.rotateX(Math.PI / 2);
  baseDiscGeom.translate(0, 0, T_plate / 2);
  let mainBody = new Brush(baseDiscGeom);
  mainBody.updateMatrixWorld();

  // 2. Add Standoff Posts positioned between planet pins
  const postRadius = Math.max(3, (R_carrier - R_pin_pcd) * 0.7);
  for (let i = 0; i < numPlanets; i++) {
    // Offset angle halfway between planet pin holes
    const postAngle = (i / numPlanets) * Math.PI * 2 + Math.PI / numPlanets;
    const px = Math.cos(postAngle) * (R_pin_pcd * 1.05);
    const py = Math.sin(postAngle) * (R_pin_pcd * 1.05);

    const postGeom = new THREE.CylinderGeometry(postRadius, postRadius, H_post, 24);
    postGeom.rotateX(Math.PI / 2);
    postGeom.translate(px, py, T_plate + H_post / 2);
    const postBrush = new Brush(postGeom);
    postBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, postBrush, ADDITION);
    mainBody.updateMatrixWorld();
  }

  // 3. Central Sun Shaft Bore (through-hole)
  const totalZ = T_plate + H_post + 4;
  const sunBoreGeom = new THREE.CylinderGeometry(R_sun, R_sun, totalZ, 36);
  sunBoreGeom.rotateX(Math.PI / 2);
  sunBoreGeom.translate(0, 0, totalZ / 2 - 2);
  const sunBoreBrush = new Brush(sunBoreGeom);
  sunBoreBrush.updateMatrixWorld();
  mainBody = evaluator.evaluate(mainBody, sunBoreBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // 4. Planet Pin Holes (through base plate)
  for (let i = 0; i < numPlanets; i++) {
    const pinAngle = (i / numPlanets) * Math.PI * 2;
    const px = Math.cos(pinAngle) * R_pin_pcd;
    const py = Math.sin(pinAngle) * R_pin_pcd;

    const pinHoleGeom = new THREE.CylinderGeometry(R_pin, R_pin, T_plate + 4, 24);
    pinHoleGeom.rotateX(Math.PI / 2);
    pinHoleGeom.translate(px, py, T_plate / 2);
    const pinHoleBrush = new Brush(pinHoleGeom);
    pinHoleBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, pinHoleBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();
  }

  // 5. Weight-reduction pocket cutouts between pins if space permits
  if (R_pin_pcd > R_sun + 8 && D_carrier > 45) {
    const pocketR = (R_pin_pcd - R_sun - 2) * 0.45;
    for (let i = 0; i < numPlanets; i++) {
      const pocketAngle = (i / numPlanets) * Math.PI * 2 + Math.PI / numPlanets;
      const kx = Math.cos(pocketAngle) * (R_sun + (R_pin_pcd - R_sun) * 0.5);
      const ky = Math.sin(pocketAngle) * (R_sun + (R_pin_pcd - R_sun) * 0.5);

      const pocketGeom = new THREE.CylinderGeometry(pocketR, pocketR, T_plate + 2, 20);
      pocketGeom.rotateX(Math.PI / 2);
      pocketGeom.translate(kx, ky, T_plate / 2);
      const pocketBrush = new Brush(pocketGeom);
      pocketBrush.updateMatrixWorld();

      mainBody = evaluator.evaluate(mainBody, pocketBrush, SUBTRACTION);
      mainBody.updateMatrixWorld();
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
    dimensions: { x: sz.x, y: sz.y, z: sz.z },
    triangles: finalGeom.index ? finalGeom.index.count / 3 : finalGeom.attributes.position.count / 3,
    vertices: finalGeom.attributes.position.count,
    estimatedPrintWeightGrams: weight,
  };
}
