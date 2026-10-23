import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CornerCubeBracketParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Orthogonal Corner Cube Bracket for Aluminum Extrusions:
 * - 3-way (XYZ) or 2-way (XY) 90° structural junction block
 * - Deep cylindrical counterbores on each active face allowing socket head screws to seat fully flush
 * - Outer edge chamfers aligning with extrusion profile styling
 * - 100% closed, watertight 2-manifold CSG solid mesh
 */
export function generateCornerCubeBracket(params: CornerCubeBracketParams): GeneratedMeshResult {
  const {
    cubeSize = 20.0,
    holeDiameter = 5.2,
    counterboreDia = 9.5,
    counterboreDepth = 6.0,
    chamferRadius = 1.0,
    faceCount = 3,
    printer_compensation = 0.15,
  } = params;

  const S = Math.max(15.0, cubeSize);
  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Base solid cube centered at [S/2, S/2, S/2]
  const cubeGeom = new THREE.BoxGeometry(S, S, S);
  let cube = new Brush(cubeGeom);
  cube.position.set(S / 2, S / 2, S / 2);
  cube.updateMatrixWorld();

  // 2. Corner chamfers along the 3 outer edges (+X, +Y, +Z)
  const ch = Math.min(chamferRadius, S * 0.15);
  if (ch > 0.3) {
    const chamferGeom = new THREE.BoxGeometry(S * 1.5, ch * 2, ch * 2);
    chamferGeom.rotateX(Math.PI / 4);

    // Edge parallel to X (at Y=S, Z=S)
    const chX = new Brush(chamferGeom);
    chX.position.set(S / 2, S, S);
    chX.updateMatrixWorld();
    cube = evaluator.evaluate(cube, chX, SUBTRACTION);
    cube.updateMatrixWorld();

    // Edge parallel to Y (at X=S, Z=S)
    const chamferGeomY = new THREE.BoxGeometry(ch * 2, S * 1.5, ch * 2);
    chamferGeomY.rotateY(Math.PI / 4);
    const chY = new Brush(chamferGeomY);
    chY.position.set(S, S / 2, S);
    chY.updateMatrixWorld();
    cube = evaluator.evaluate(cube, chY, SUBTRACTION);
    cube.updateMatrixWorld();

    // Edge parallel to Z (at X=S, Y=S)
    const chamferGeomZ = new THREE.BoxGeometry(ch * 2, ch * 2, S * 1.5);
    chamferGeomZ.rotateZ(Math.PI / 4);
    const chZ = new Brush(chamferGeomZ);
    chZ.position.set(S, S, S / 2);
    chZ.updateMatrixWorld();
    cube = evaluator.evaluate(cube, chZ, SUBTRACTION);
    cube.updateMatrixWorld();
  }

  // 3. Counterbored Mounting Holes on Faces
  const rHole = (holeDiameter + printer_compensation) / 2;
  const rCB = (counterboreDia + printer_compensation) / 2;
  const cbDepth = Math.min(counterboreDepth, S * 0.6);

  // Helper to drill a counterbored hole
  const drillFaceHole = (
    axis: 'x' | 'y' | 'z',
    posX: number,
    posY: number,
    posZ: number,
    dir: 1 | -1
  ) => {
    // Through hole
    const holeGeom = new THREE.CylinderGeometry(rHole, rHole, S * 1.5, 32);
    if (axis === 'x') holeGeom.rotateZ(Math.PI / 2);
    else if (axis === 'y') holeGeom.rotateX(0); // default cylinder is along Y
    else if (axis === 'z') holeGeom.rotateX(Math.PI / 2);

    const holeBrush = new Brush(holeGeom);
    holeBrush.position.set(posX, posY, posZ);
    holeBrush.updateMatrixWorld();
    cube = evaluator.evaluate(cube, holeBrush, SUBTRACTION);
    cube.updateMatrixWorld();

    // Counterbore pocket
    const cbGeom = new THREE.CylinderGeometry(rCB, rCB, cbDepth * 2, 32);
    if (axis === 'x') cbGeom.rotateZ(Math.PI / 2);
    else if (axis === 'y') cbGeom.rotateX(0);
    else if (axis === 'z') cbGeom.rotateX(Math.PI / 2);

    const cbBrush = new Brush(cbGeom);
    let cbX = posX, cbY = posY, cbZ = posZ;
    if (axis === 'x') cbX = dir > 0 ? S : 0;
    if (axis === 'y') cbY = dir > 0 ? S : 0;
    if (axis === 'z') cbZ = dir > 0 ? S : 0;

    cbBrush.position.set(cbX, cbY, cbZ);
    cbBrush.updateMatrixWorld();
    cube = evaluator.evaluate(cube, cbBrush, SUBTRACTION);
    cube.updateMatrixWorld();
  };

  // Face 1: X-Face (at X = S/2, Y = S/2, Z = S/2 drilling along X)
  drillFaceHole('x', S / 2, S / 2, S / 2, 1);

  // Face 2: Y-Face (drilling along Y)
  drillFaceHole('y', S / 2, S / 2, S / 2, 1);

  // Face 3: Z-Face (drilling along Z, if faceCount === 3)
  if (faceCount === 3) {
    drillFaceHole('z', S / 2, S / 2, S / 2, 1);
  }

  // Output geometry
  let outGeometry = cube.geometry.clone();
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
