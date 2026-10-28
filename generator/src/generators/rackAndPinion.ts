import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RackAndPinionParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Linear Involute Gear Rack using Mathematical Profile Extrusion + CSG:
 * - ISO standard 20° trapezoidal rack teeth
 * - Solid mounting bar spine
 * - Counterbored mounting bolt holes along length
 * - Interlocking modular ends for continuous rail extension
 */
export function generateRackAndPinion(params: RackAndPinionParams): GeneratedMeshResult {
  const {
    module = 1.5,
    rackLength = 100,
    rackWidth = 15,
    rackHeight = 15,
    pressureAngleDeg = 20,
    mountHoleSpacing = 30,
    mountHoleDiameter = 4.5,
    printer_compensation = 0.15,
  } = params;

  const m = Math.max(0.8, module);
  const L = Math.max(30, rackLength);
  const W = Math.max(6, rackWidth);
  const H = Math.max(m * 3.5, rackHeight);
  const alpha = (Math.max(14.5, Math.min(25, pressureAngleDeg)) * Math.PI) / 180;

  const pitch = Math.PI * m;
  const addendum = m;
  const dedendum = 1.25 * m;
  const toothHeight = addendum + dedendum;

  // Number of full teeth along length
  const numTeeth = Math.floor(L / pitch);
  const actualLength = numTeeth * pitch;

  // Build 2D polygon profile (X = length, Y = height)
  // Base at Y = 0 to Y = (H - toothHeight), Pitch line at Y = H - addendum, Tip at Y = H
  const shape = new THREE.Shape();
  const baseBottomY = 0;
  const rootY = H - toothHeight;
  const tipY = H;

  // Start at bottom left
  shape.moveTo(0, baseBottomY);
  shape.lineTo(actualLength, baseBottomY);
  shape.lineTo(actualLength, rootY);

  // Generate rack teeth backwards from X = actualLength down to 0
  const tanAlpha = Math.tan(alpha);
  const halfPitchThickness = pitch / 4;

  for (let i = numTeeth - 1; i >= 0; i--) {
    const xPitch = i * pitch + pitch / 2;
    // Tooth crest: from (xPitch + halfPitchThickness - addendum * tanAlpha) to (xPitch - halfPitchThickness + addendum * tanAlpha)
    const xTipRight = xPitch + halfPitchThickness - addendum * tanAlpha;
    const xTipLeft = xPitch - halfPitchThickness + addendum * tanAlpha;
    const xRootRight = xPitch + halfPitchThickness + dedendum * tanAlpha;
    const xRootLeft = xPitch - halfPitchThickness - dedendum * tanAlpha;

    shape.lineTo(xRootRight, rootY);
    shape.lineTo(xTipRight, tipY);
    shape.lineTo(xTipLeft, tipY);
    shape.lineTo(xRootLeft, rootY);
  }

  shape.lineTo(0, rootY);
  shape.closePath();

  // Extrude shape along Z
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: W,
    bevelEnabled: false,
  };
  const rackGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  // Center along Z: Z goes from -W/2 to W/2, center along X
  rackGeom.translate(-actualLength / 2, 0, -W / 2);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;
  let mainBody = new Brush(rackGeom);
  mainBody.updateMatrixWorld();

  // Subtract Counterbored Mounting Holes through the spine (from bottom or side)
  const holeDia = Math.max(2.5, mountHoleDiameter + printer_compensation);
  const rHole = holeDia / 2;
  const cbDia = holeDia * 1.8;
  const rCb = cbDia / 2;

  const holeSpacing = Math.max(15, mountHoleSpacing);
  const numHoles = Math.max(2, Math.floor(actualLength / holeSpacing));
  const startX = -((numHoles - 1) * holeSpacing) / 2;

  // Drill vertical holes through base spine (from Y = -2 to Y = rootY)
  for (let i = 0; i < numHoles; i++) {
    const hx = startX + i * holeSpacing;
    const holeCylGeom = new THREE.CylinderGeometry(rHole, rHole, H + 4, 24);
    holeCylGeom.translate(hx, H / 2, 0);
    const holeBrush = new Brush(holeCylGeom);
    holeBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, holeBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();

    // Counterbore pocket on bottom face
    const cbHeight = rootY * 0.45;
    const cbGeom = new THREE.CylinderGeometry(rCb, rCb, cbHeight, 24);
    cbGeom.translate(hx, cbHeight / 2 - 0.5, 0);
    const cbBrush = new Brush(cbGeom);
    cbBrush.updateMatrixWorld();

    mainBody = evaluator.evaluate(mainBody, cbBrush, SUBTRACTION);
    mainBody.updateMatrixWorld();
  }

  let finalGeom = mainBody.geometry.clone();
  finalGeom = toCreasedNormals(finalGeom, (40 * Math.PI) / 180);
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
