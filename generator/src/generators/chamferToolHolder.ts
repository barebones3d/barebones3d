import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  ChamferToolHolderParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Ergonomic Deburring Tool Handle with Collet Chuck using Mathematical Lofting + CSG:
 * - Contoured ergonomic palm grip with multi-flute non-slip ribs
 * - Front collet nose with bore for standard 3.2mm swivel deburring blades or needle files
 * - Transverse locking set-screw thread hole
 * - 100% watertight 2-manifold lofted solid
 */
export function generateChamferToolHolder(params: ChamferToolHolderParams): GeneratedMeshResult {
  const {
    handleDiameter = 24,
    handleLength = 90,
    fluteCount = 8,
    fluteDepth = 1.6,
    colletBoreDiameter = 3.2,
    colletDepth = 24,
    setScrewSize = 'M3',
    ergonomicPalmGrip = true,
    printer_compensation = 0.15,
  } = params;

  const L = Math.max(50, handleLength);
  const D_max = Math.max(16, handleDiameter);
  const R_max = D_max / 2;
  const numFlutes = Math.max(4, Math.min(12, Math.round(fluteCount)));
  const dFlute = Math.max(0.6, Math.min(R_max * 0.35, fluteDepth));

  const D_collet = Math.max(2.5, colletBoreDiameter + printer_compensation);
  const rCollet = D_collet / 2;
  const colletLen = Math.max(12, Math.min(L * 0.5, colletDepth));

  const screwDia = SCREW_CLEARANCE_DIAMETERS[setScrewSize] + printer_compensation;
  const rScrew = screwDia / 2;

  // Mathematical lofting of ergonomic contoured handle with flutes
  const numSlices = 48;
  const numRadialPoints = numFlutes * 6; // e.g. 48 points for 8 flutes

  const positions: number[] = [];
  const indices: number[] = [];

  const addQuad = (v0: number, v1: number, v2: number, v3: number) => {
    indices.push(v0, v1, v2);
    indices.push(v0, v2, v3);
  };

  // Generate outer fluted ergonomic skin
  // z from 0 (front nose) to L (rear palm cap)
  for (let s = 0; s <= numSlices; s++) {
    const t = s / numSlices; // 0 (nose) to 1 (rear)
    const z = t * L;

    // Longitudinal ergonomic radius envelope
    let rBase = R_max;
    if (t < 0.12) {
      // Front collet nose taper
      const u = t / 0.12;
      rBase = (rCollet + 3.0) + (R_max * 0.7 - (rCollet + 3.0)) * u;
    } else if (t < 0.35) {
      // Finger waist grip dip
      const u = (t - 0.12) / 0.23;
      rBase = R_max * 0.7 + (R_max * 0.85 - R_max * 0.7) * u;
    } else if (t < 0.85) {
      // Palm swell bulge
      const u = (t - 0.35) / 0.5;
      const swell = Math.sin(u * Math.PI);
      rBase = R_max * 0.85 + (R_max * 0.15) * swell;
    } else {
      // Rear dome taper
      const u = (t - 0.85) / 0.15;
      rBase = R_max - (R_max * 0.3) * (u * u);
    }

    if (!ergonomicPalmGrip) {
      rBase = R_max;
    }

    // Flute depth modulation: flutes fade out at front nose (t < 0.12) and rear tip (t > 0.9)
    let fluteFade = 1.0;
    if (t < 0.15) fluteFade = Math.max(0, (t - 0.05) / 0.1);
    else if (t > 0.85) fluteFade = Math.max(0, (0.95 - t) / 0.1);

    for (let p = 0; p < numRadialPoints; p++) {
      const angle = (p / numRadialPoints) * Math.PI * 2;
      // Scalloped flute: sinusoidal inward dent
      const fluteRipple = Math.pow(Math.cos((numFlutes * angle) / 2), 2);
      const r = rBase - dFlute * fluteFade * fluteRipple;
      positions.push(Math.cos(angle) * r, Math.sin(angle) * r, z);
    }
  }

  // Quads connecting slices
  for (let s = 0; s < numSlices; s++) {
    const row0 = s * numRadialPoints;
    const row1 = (s + 1) * numRadialPoints;
    for (let p = 0; p < numRadialPoints; p++) {
      const next = (p + 1) % numRadialPoints;
      addQuad(row0 + p, row0 + next, row1 + next, row1 + p);
    }
  }

  // Front cap at z = 0 (annular, or flat if bore subtracted later)
  const frontOuter = 0;
  const frontCenter = positions.length / 3;
  positions.push(0, 0, 0);
  for (let p = 0; p < numRadialPoints; p++) {
    const next = (p + 1) % numRadialPoints;
    indices.push(frontOuter + next, frontOuter + p, frontCenter);
  }

  // Rear cap at z = L
  const rearOuter = numSlices * numRadialPoints;
  const rearCenter = positions.length / 3;
  positions.push(0, 0, L);
  for (let p = 0; p < numRadialPoints; p++) {
    const next = (p + 1) % numRadialPoints;
    indices.push(rearOuter + p, rearOuter + next, rearCenter);
  }

  const baseGeom = new THREE.BufferGeometry();
  baseGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  baseGeom.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((positions.length / 3) * 2), 2));
  baseGeom.setIndex(indices);
  baseGeom.computeVertexNormals();

  const evaluator = new Evaluator();
  evaluator.useGroups = false;
  let mainBody = new Brush(baseGeom);
  mainBody.updateMatrixWorld();

  // Subtract Collet Blade Bore (at front z = 0 into z = colletLen)
  const colletGeom = new THREE.CylinderGeometry(rCollet, rCollet, colletLen * 2, 24);
  colletGeom.rotateX(Math.PI / 2);
  colletGeom.translate(0, 0, 0);
  const colletBrush = new Brush(colletGeom);
  colletBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, colletBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

  // Subtract Transverse Locking Set Screw Hole (along X axis at z = colletLen * 0.5)
  const screwZ = colletLen * 0.5;
  const screwHoleGeom = new THREE.CylinderGeometry(rScrew, rScrew, R_max * 2.5, 20);
  screwHoleGeom.rotateZ(Math.PI / 2);
  screwHoleGeom.translate(0, 0, screwZ);
  const screwHoleBrush = new Brush(screwHoleGeom);
  screwHoleBrush.updateMatrixWorld();

  mainBody = evaluator.evaluate(mainBody, screwHoleBrush, SUBTRACTION);
  mainBody.updateMatrixWorld();

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
