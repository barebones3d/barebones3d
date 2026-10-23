import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { HoseBarbParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Hose Barb & Tubing Adapter using Constructive Solid Geometry (CSG):
 * 1. Stacked conical ramp barbs for positive mechanical tube retention.
 * 2. Center hexagonal wrench collar for spanner tightening.
 * 3. Configurable secondary stem: coupler (dual barb) or reducer.
 * 4. Continuous uninterrupted central through-bore for fluid/gas flow.
 */
export function generateHoseBarb(params: HoseBarbParams): GeneratedMeshResult {
  const {
    barbNominalID,
    barbCount,
    barbLength,
    wallThickness,
    connectorType,
    secondBarbNominalID,
    hexNutWidth,
    hexNutThickness,
    printer_compensation,
  } = params;

  // Primary barb sizing (flexible tube stretches over barb)
  const dNom1 = Math.max(3.0, barbNominalID);
  const T_wall = Math.max(1.2, wallThickness);
  const rBore = Math.max(0.8, dNom1 / 2 - printer_compensation / 2); // inner fluid channel
  const rBarbBase1 = rBore + T_wall;
  const rBarbTip1 = rBarbBase1 * 1.25; // 25% flare for tight retention seal

  const numBarbs1 = Math.max(2, Math.min(6, barbCount));
  const stemLen1 = Math.max(10.0, barbLength);
  const barbPitch1 = stemLen1 / numBarbs1;

  // Hex nut collar
  const nutWidth = Math.max(rBarbTip1 * 2 + 4.0, hexNutWidth);
  const nutRadius = nutWidth / (2 * Math.cos(Math.PI / 6)); // outer circumscribed radius of hexagon
  const nutThick = Math.max(4.0, hexNutThickness);

  // Secondary side sizing
  const isReducer = connectorType === 'reducer';
  const dNom2 = isReducer ? Math.max(2.5, secondBarbNominalID) : dNom1;
  const rBarbBase2 = rBore + T_wall;
  const rBarbTip2 = (dNom2 / 2) * 1.25;
  const stemLen2 = connectorType === 'flanged-bulkhead' ? nutThick : stemLen1;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Center Hex Nut Collar (z from -nutThick / 2 to +nutThick / 2)
  const hexGeom = new THREE.CylinderGeometry(nutRadius, nutRadius, nutThick, 6);
  hexGeom.rotateX(Math.PI / 2);
  let fitting = new Brush(hexGeom);
  fitting.position.set(0, 0, 0);
  fitting.updateMatrixWorld();

  // 2. Build Primary Barb Stem (extending in +Z direction)
  let currentZ = nutThick / 2;
  for (let b = 0; b < numBarbs1; b++) {
    // Conical frustum: from rBarbBase1 to rBarbTip1 along barbPitch1
    // CylinderGeometry(radiusTop, radiusBottom, height)
    const coneGeom = new THREE.CylinderGeometry(rBarbTip1, rBarbBase1, barbPitch1, 32);
    coneGeom.rotateX(Math.PI / 2);
    const coneBrush = new Brush(coneGeom);
    coneBrush.position.set(0, 0, currentZ + barbPitch1 / 2);
    coneBrush.updateMatrixWorld();
    fitting = evaluator.evaluate(fitting, coneBrush, ADDITION);
    fitting.updateMatrixWorld();
    currentZ += barbPitch1;
  }
  const topZ = currentZ;

  // 3. Build Secondary Side Stem (extending in -Z direction)
  let botZ = -nutThick / 2;
  if (connectorType === 'straight-coupler' || connectorType === 'reducer') {
    for (let b = 0; b < numBarbs1; b++) {
      const coneGeom = new THREE.CylinderGeometry(rBarbBase2, rBarbTip2, barbPitch1, 32);
      coneGeom.rotateX(Math.PI / 2);
      const coneBrush = new Brush(coneGeom);
      coneBrush.position.set(0, 0, botZ - barbPitch1 / 2);
      coneBrush.updateMatrixWorld();
      fitting = evaluator.evaluate(fitting, coneBrush, ADDITION);
      fitting.updateMatrixWorld();
      botZ -= barbPitch1;
    }
  } else {
    // Flanged Bulkhead: cylindrical threaded/smooth pipe collar
    const pipeGeom = new THREE.CylinderGeometry(rBarbBase1 * 1.1, rBarbBase1 * 1.1, stemLen2, 32);
    pipeGeom.rotateX(Math.PI / 2);
    const pipeBrush = new Brush(pipeGeom);
    pipeBrush.position.set(0, 0, botZ - stemLen2 / 2);
    pipeBrush.updateMatrixWorld();
    fitting = evaluator.evaluate(fitting, pipeBrush, ADDITION);
    fitting.updateMatrixWorld();
    botZ -= stemLen2;
  }

  // 4. Central Fluid Through-Bore Subtraction
  const totalLength = topZ - botZ + 4.0;
  const boreGeom = new THREE.CylinderGeometry(rBore, rBore, totalLength, 32);
  boreGeom.rotateX(Math.PI / 2);
  const boreBrush = new Brush(boreGeom);
  boreBrush.position.set(0, 0, (topZ + botZ) / 2);
  boreBrush.updateMatrixWorld();
  fitting = evaluator.evaluate(fitting, boreBrush, SUBTRACTION);
  fitting.updateMatrixWorld();

  // 5. Final Normals & Metadata
  let geometry = fitting.geometry.clone();
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
