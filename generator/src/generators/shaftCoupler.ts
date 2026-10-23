import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  ShaftCouplerParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
  SCREW_COUNTERSINK_HEAD_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a Flexible / Clamp Shaft Coupler using Constructive Solid Geometry (CSG):
 * 1. Solid outer cylindrical body sized to outerDiameter and length.
 * 2. Independent dual internal bores (Bore 1 for motor, Bore 2 for driven leadscrew).
 * 3. Longitudinal flex slits and horizontal transverse decoupling cuts.
 * 4. Cross-drilled clamping screw holes with socket-head cap counterbores.
 * 5. Creased normal calculation ensures crisp planar edges and smooth cylindrical surfaces.
 */
export function generateShaftCoupler(params: ShaftCouplerParams): GeneratedMeshResult {
  const {
    outerDiameter,
    length,
    bore1Diameter,
    bore2Diameter,
    couplerStyle,
    slitWidth,
    clampScrewSize,
    printer_compensation,
  } = params;

  const L = Math.max(18.0, length);
  const Dout = Math.max(14.0, outerDiameter);
  const Rout = Dout / 2;

  // Bore diameters with printer compensation
  const b1Dia = Math.max(2.5, bore1Diameter + printer_compensation);
  const b2Dia = Math.max(2.5, bore2Diameter + printer_compensation);
  const rBore1 = b1Dia / 2;
  const rBore2 = b2Dia / 2;

  const screwDia = SCREW_CLEARANCE_DIAMETERS[clampScrewSize] + printer_compensation;
  const rScrew = screwDia / 2;
  const headDia = SCREW_COUNTERSINK_HEAD_DIAMETERS[clampScrewSize] + printer_compensation + 0.5;
  const rHead = headDia / 2;

  const sWidth = Math.max(0.8, slitWidth);

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Outer Cylinder Body (centered on Z axis from -L/2 to +L/2)
  const bodyGeom = new THREE.CylinderGeometry(Rout, Rout, L, 48);
  bodyGeom.rotateX(Math.PI / 2);
  let body = new Brush(bodyGeom);
  body.updateMatrixWorld();

  // 2. Bore 1 (Bottom Half: z from -L/2 to 1.0)
  const bore1Length = L / 2 + 2.0;
  const bore1Geom = new THREE.CylinderGeometry(rBore1, rBore1, bore1Length, 32);
  bore1Geom.rotateX(Math.PI / 2);
  const bore1Brush = new Brush(bore1Geom);
  bore1Brush.position.set(0, 0, -L / 4);
  bore1Brush.updateMatrixWorld();
  body = evaluator.evaluate(body, bore1Brush, SUBTRACTION);
  body.updateMatrixWorld();

  // 3. Bore 2 (Top Half: z from -1.0 to +L/2)
  const bore2Length = L / 2 + 2.0;
  const bore2Geom = new THREE.CylinderGeometry(rBore2, rBore2, bore2Length, 32);
  bore2Geom.rotateX(Math.PI / 2);
  const bore2Brush = new Brush(bore2Geom);
  bore2Brush.position.set(0, 0, L / 4);
  bore2Brush.updateMatrixWorld();
  body = evaluator.evaluate(body, bore2Brush, SUBTRACTION);
  body.updateMatrixWorld();

  // 4. Clamping Slits / Cuts
  if (couplerStyle === 'slit-clamp') {
    // Longitudinal clamping slit cutting through one side (+X) into the central bores
    const slitGeom = new THREE.BoxGeometry(Rout + 2, sWidth, L + 2);
    const slitBrush = new Brush(slitGeom);
    slitBrush.position.set(Rout / 2, 0, 0);
    slitBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, slitBrush, SUBTRACTION);
    body.updateMatrixWorld();

    // Center transverse expansion slot (z = 0)
    const centerSlotGeom = new THREE.BoxGeometry(Dout + 2, sWidth * 1.5, Rout * 1.2);
    const centerSlotBrush = new Brush(centerSlotGeom);
    centerSlotBrush.position.set(0, 0, 0);
    centerSlotBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, centerSlotBrush, SUBTRACTION);
    body.updateMatrixWorld();
  } else {
    // Spiral / Beam flexure cuts: dual staggered transverse cuts
    const cut1Geom = new THREE.BoxGeometry(Dout * 0.8, sWidth * 1.2, sWidth * 1.5);
    const cut1Brush = new Brush(cut1Geom);
    cut1Brush.position.set(Rout * 0.2, 0, -L * 0.15);
    cut1Brush.updateMatrixWorld();
    body = evaluator.evaluate(body, cut1Brush, SUBTRACTION);
    body.updateMatrixWorld();

    const cut2Geom = new THREE.BoxGeometry(Dout * 0.8, sWidth * 1.2, sWidth * 1.5);
    const cut2Brush = new Brush(cut2Geom);
    cut2Brush.position.set(-Rout * 0.2, 0, L * 0.15);
    cut2Brush.updateMatrixWorld();
    body = evaluator.evaluate(body, cut2Brush, SUBTRACTION);
    body.updateMatrixWorld();
  }

  // 5. Clamping Screw Holes (Cross-drilled along Y axis)
  // Lower clamp screw at z = -L / 3
  const zHole1 = -L * 0.3;
  const zHole2 = L * 0.3;
  const xOffset = Rout * 0.55;

  const drillScrew = (zPos: number) => {
    // Screw through-hole
    const screwHoleGeom = new THREE.CylinderGeometry(rScrew, rScrew, Dout + 4, 24);
    const screwHoleBrush = new Brush(screwHoleGeom);
    screwHoleBrush.position.set(xOffset, 0, zPos);
    screwHoleBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, screwHoleBrush, SUBTRACTION);
    body.updateMatrixWorld();

    // Counterbore for screw head on +Y side
    const cbDepth = Rout * 0.6;
    const cbGeom = new THREE.CylinderGeometry(rHead, rHead, cbDepth, 24);
    const cbBrush = new Brush(cbGeom);
    cbBrush.position.set(xOffset, Rout - cbDepth / 2 + 0.5, zPos);
    cbBrush.updateMatrixWorld();
    body = evaluator.evaluate(body, cbBrush, SUBTRACTION);
    body.updateMatrixWorld();
  };

  drillScrew(zHole1);
  drillScrew(zHole2);

  // 6. Final Normals & Metadata
  let geometry = body.geometry.clone();
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
