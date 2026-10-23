import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CentrifugalImpellerParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates a High-Performance Centrifugal Impeller / Pump Rotor:
 * - Conical aerodynamic hub center with central drive motor shaft bore
 * - Circular back-plate disk
 * - Radial array of backward-inclined curved vanes channeling fluid/air outward
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateCentrifugalImpeller(params: CentrifugalImpellerParams): GeneratedMeshResult {
  const {
    outerDiameter,
    hubDiameter,
    height,
    bladeCount,
    bladeThickness,
    bladeAngleDeg = 35.0,
    boreDiameter,
    boreType,
    dShaftFlatOffset,
    hasBackPlate,
    backPlateThickness,
    printer_compensation = 0.15,
  } = params;

  const R_tip = outerDiameter / 2;
  const R_hub = Math.max(boreDiameter / 2 + 2.5, hubDiameter / 2);
  const H = height;
  const backPlateT = hasBackPlate ? Math.max(1.4, backPlateThickness) : 0;
  const vaneHeight = H - backPlateT;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Back Plate Disk (at z = 0 to backPlateT)
  const plateGeom = new THREE.CylinderGeometry(R_tip, R_tip, Math.max(0.8, backPlateT), 48);
  plateGeom.rotateX(Math.PI / 2);
  let impeller = new Brush(plateGeom);
  impeller.position.set(0, 0, backPlateT / 2);
  impeller.updateMatrixWorld();

  // 2. Conical Center Hub (tapers from R_hub at base to R_hub * 0.7 at top)
  const hubGeom = new THREE.CylinderGeometry(R_hub * 0.7, R_hub, vaneHeight, 40);
  hubGeom.rotateX(Math.PI / 2);
  const hubBrush = new Brush(hubGeom);
  hubBrush.position.set(0, 0, backPlateT + vaneHeight / 2);
  hubBrush.updateMatrixWorld();
  impeller = evaluator.evaluate(impeller, hubBrush, ADDITION);
  impeller.updateMatrixWorld();

  // 3. Backward-Curved Vanes
  // Shape of a curved logarithmic arc blade
  const bladeAngleRad = (bladeAngleDeg * Math.PI) / 180;
  const bladeT = Math.max(1.0, bladeThickness);

  for (let b = 0; b < bladeCount; b++) {
    const startAngle = (b / bladeCount) * Math.PI * 2;
    const curveShape = new THREE.Shape();

    // Generate spline curve points from hub to tip
    const numPts = 12;
    const outerCurve: THREE.Vector2[] = [];
    const innerCurve: THREE.Vector2[] = [];

    for (let i = 0; i <= numPts; i++) {
      const frac = i / numPts;
      const r = R_hub * 0.95 + (R_tip - R_hub * 0.95) * frac;
      // Backward curvature offset angle
      const theta = startAngle - Math.sin(frac * Math.PI * 0.5) * bladeAngleRad;

      const normX = -Math.sin(theta);
      const normY = Math.cos(theta);

      outerCurve.push(new THREE.Vector2(
        r * Math.cos(theta) + (normX * bladeT) / 2,
        r * Math.sin(theta) + (normY * bladeT) / 2
      ));
      innerCurve.push(new THREE.Vector2(
        r * Math.cos(theta) - (normX * bladeT) / 2,
        r * Math.sin(theta) - (normY * bladeT) / 2
      ));
    }

    curveShape.moveTo(outerCurve[0].x, outerCurve[0].y);
    for (let i = 1; i < outerCurve.length; i++) {
      curveShape.lineTo(outerCurve[i].x, outerCurve[i].y);
    }
    for (let i = innerCurve.length - 1; i >= 0; i--) {
      curveShape.lineTo(innerCurve[i].x, innerCurve[i].y);
    }
    curveShape.closePath();

    const bladeGeom = new THREE.ExtrudeGeometry(curveShape, {
      depth: vaneHeight,
      bevelEnabled: false,
    });
    const bladeBrush = new Brush(bladeGeom);
    bladeBrush.position.set(0, 0, backPlateT);
    bladeBrush.updateMatrixWorld();

    impeller = evaluator.evaluate(impeller, bladeBrush, ADDITION);
    impeller.updateMatrixWorld();
  }

  // 4. Central Shaft Bore Subtraction
  const actualBoreDia = (boreDiameter + printer_compensation);
  const boreR = actualBoreDia / 2;

  if (actualBoreDia > 1.0) {
    if (boreType === 'd-shaft') {
      const boreGeom = new THREE.CylinderGeometry(boreR, boreR, H * 1.5, 32);
      boreGeom.rotateX(Math.PI / 2);
      const boreBrush = new Brush(boreGeom);
      boreBrush.position.set(0, 0, H / 2);
      boreBrush.updateMatrixWorld();

      // D-shaft flat key block
      const flatOffset = (dShaftFlatOffset || boreR * 0.8) - printer_compensation / 2;
      const flatBoxGeom = new THREE.BoxGeometry(boreR * 2.5, (boreR - flatOffset) * 2, H * 1.6);
      const flatBoxBrush = new Brush(flatBoxGeom);
      flatBoxBrush.position.set(0, flatOffset + (boreR - flatOffset), H / 2);
      flatBoxBrush.updateMatrixWorld();

      const combinedBore = evaluator.evaluate(boreBrush, flatBoxBrush, SUBTRACTION);
      combinedBore.updateMatrixWorld();
      impeller = evaluator.evaluate(impeller, combinedBore, SUBTRACTION);
      impeller.updateMatrixWorld();
    } else {
      const boreGeom = new THREE.CylinderGeometry(boreR, boreR, H * 1.5, 32);
      boreGeom.rotateX(Math.PI / 2);
      const boreBrush = new Brush(boreGeom);
      boreBrush.position.set(0, 0, H / 2);
      boreBrush.updateMatrixWorld();
      impeller = evaluator.evaluate(impeller, boreBrush, SUBTRACTION);
      impeller.updateMatrixWorld();
    }
  }

  // 5. Output geometry
  let outGeometry = impeller.geometry.clone();
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
