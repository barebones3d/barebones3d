import * as THREE from 'three';
import { Evaluator, Brush, ADDITION, SUBTRACTION } from 'three-bvh-csg';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  StepperMountParams,
  GeneratedMeshResult,
  SCREW_CLEARANCE_DIAMETERS,
} from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

interface NemaData {
  width: number;
  boltSpacing: number;
  pilotDia: number;
  defaultScrew: 'M3' | 'M4' | 'M5';
}

const NEMA_DATA: Record<'NEMA14' | 'NEMA17' | 'NEMA23', NemaData> = {
  NEMA14: { width: 35.2, boltSpacing: 26.0, pilotDia: 22.0, defaultScrew: 'M3' },
  NEMA17: { width: 42.3, boltSpacing: 31.04, pilotDia: 22.0, defaultScrew: 'M3' },
  NEMA23: { width: 56.4, boltSpacing: 47.14, pilotDia: 38.1, defaultScrew: 'M5' },
};

/**
 * Generates an ultra-rigid NEMA Stepper Motor Mount using Constructive Solid Geometry (CSG):
 * 1. Vertical faceplate matching NEMA 14 / 17 / 23 dimensions.
 * 2. Horizontal base mounting foot.
 * 3. Side triangular stiffening gussets to eliminate flexing under high belt tension.
 * 4. Center pilot clearance hole and 4 motor screw holes / tension adjustment slots.
 * 5. Base plate mounting holes for frame attachment.
 */
export function generateStepperMount(params: StepperMountParams): GeneratedMeshResult {
  const {
    nemaSize,
    faceThickness,
    baseThickness,
    baseLength,
    motorHoleType,
    slotLength,
    hasGussets,
    gussetThickness,
    baseHoleCount,
    baseScrewSize,
    printer_compensation,
  } = params;

  const data = NEMA_DATA[nemaSize];
  const motorWidth = data.width;
  const boltSpacing = data.boltSpacing;
  const pilotDia = data.pilotDia + printer_compensation;
  const motorScrewDia = SCREW_CLEARANCE_DIAMETERS[data.defaultScrew] + printer_compensation;

  const T_face = Math.max(3.0, faceThickness);
  const T_base = Math.max(3.0, baseThickness);
  const L_base = Math.max(20.0, baseLength);
  const W_plate = motorWidth;
  const H_face = motorWidth;

  const evaluator = new Evaluator();
  evaluator.useGroups = false;

  // 1. Vertical Faceplate (at X = 0 to T_face, Y from -W_plate/2 to +W_plate/2, Z from 0 to H_face)
  const faceGeom = new THREE.BoxGeometry(T_face, W_plate, H_face);
  let mount = new Brush(faceGeom);
  mount.position.set(T_face / 2, 0, H_face / 2);
  mount.updateMatrixWorld();

  // 2. Horizontal Base Foot (extends backward in -X direction from 0 to -L_base)
  const baseGeom = new THREE.BoxGeometry(L_base, W_plate, T_base);
  const baseBrush = new Brush(baseGeom);
  baseBrush.position.set(-L_base / 2 + T_face, 0, T_base / 2);
  baseBrush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, baseBrush, ADDITION);
  mount.updateMatrixWorld();

  // 3. Dual Side Gussets (Left & Right ribs on outer edges)
  if (hasGussets) {
    const gThick = Math.min(W_plate * 0.25, Math.max(2.5, gussetThickness));
    const gLenX = Math.min(L_base - 5.0, H_face * 0.7);
    const gLenZ = Math.min(H_face - 5.0, H_face * 0.7);

    if (gLenX > 5 && gLenZ > 5) {
      const gussetShape = new THREE.Shape();
      gussetShape.moveTo(0, 0);
      gussetShape.lineTo(-gLenX, 0);
      gussetShape.lineTo(0, gLenZ);
      gussetShape.closePath();

      const ribGeom = new THREE.ExtrudeGeometry(gussetShape, {
        depth: gThick,
        bevelEnabled: false,
      });

      // Left Gusset (at -Y side)
      const leftRibGeom = ribGeom.clone();
      leftRibGeom.rotateY(-Math.PI / 2);
      leftRibGeom.rotateX(Math.PI / 2);
      const leftRibBrush = new Brush(leftRibGeom);
      leftRibBrush.position.set(0, -W_plate / 2 + gThick, T_base);
      leftRibBrush.updateMatrixWorld();
      mount = evaluator.evaluate(mount, leftRibBrush, ADDITION);
      mount.updateMatrixWorld();

      // Right Gusset (at +Y side)
      const rightRibBrush = new Brush(leftRibGeom);
      rightRibBrush.position.set(0, W_plate / 2, T_base);
      rightRibBrush.updateMatrixWorld();
      mount = evaluator.evaluate(mount, rightRibBrush, ADDITION);
      mount.updateMatrixWorld();
    }
  }

  // 4. Center Pilot Bore Subtraction
  const pilotGeom = new THREE.CylinderGeometry(pilotDia / 2, pilotDia / 2, T_face * 3, 32);
  pilotGeom.rotateZ(Math.PI / 2);
  const pilotBrush = new Brush(pilotGeom);
  pilotBrush.position.set(T_face / 2, 0, H_face / 2);
  pilotBrush.updateMatrixWorld();
  mount = evaluator.evaluate(mount, pilotBrush, SUBTRACTION);
  mount.updateMatrixWorld();

  // 5. Motor Mounting Screw Holes / Slots
  const halfSpacing = boltSpacing / 2;
  const motorHoleRadius = motorScrewDia / 2;
  const isSlots = motorHoleType === 'slots';
  const slotExt = isSlots ? Math.max(2.0, slotLength) : 0;

  const yOffsets = [-halfSpacing, halfSpacing];
  const zOffsets = [H_face / 2 - halfSpacing, H_face / 2 + halfSpacing];

  for (const y of yOffsets) {
    for (const z of zOffsets) {
      if (isSlots) {
        // Tension slot along Z axis
        const slotBoxGeom = new THREE.BoxGeometry(T_face * 3, motorScrewDia, slotExt);
        const slotBoxBrush = new Brush(slotBoxGeom);
        slotBoxBrush.position.set(T_face / 2, y, z);
        slotBoxBrush.updateMatrixWorld();
        mount = evaluator.evaluate(mount, slotBoxBrush, SUBTRACTION);
        mount.updateMatrixWorld();

        // Round ends of slot
        for (const endZ of [z - slotExt / 2, z + slotExt / 2]) {
          const endGeom = new THREE.CylinderGeometry(motorHoleRadius, motorHoleRadius, T_face * 3, 20);
          endGeom.rotateZ(Math.PI / 2);
          const endBrush = new Brush(endGeom);
          endBrush.position.set(T_face / 2, y, endZ);
          endBrush.updateMatrixWorld();
          mount = evaluator.evaluate(mount, endBrush, SUBTRACTION);
          mount.updateMatrixWorld();
        }
      } else {
        // Clean round drill hole
        const holeGeom = new THREE.CylinderGeometry(motorHoleRadius, motorHoleRadius, T_face * 3, 24);
        holeGeom.rotateZ(Math.PI / 2);
        const holeBrush = new Brush(holeGeom);
        holeBrush.position.set(T_face / 2, y, z);
        holeBrush.updateMatrixWorld();
        mount = evaluator.evaluate(mount, holeBrush, SUBTRACTION);
        mount.updateMatrixWorld();
      }
    }
  }

  // 6. Base Foot Mounting Holes Subtraction
  const baseScrewDia = SCREW_CLEARANCE_DIAMETERS[baseScrewSize] + printer_compensation;
  const baseHoleRadius = baseScrewDia / 2;
  const baseHoleYOffsets = [-W_plate * 0.3, W_plate * 0.3];
  const baseHoleXOffsets = baseHoleCount === 4
    ? [-L_base * 0.35, -L_base * 0.75]
    : [-L_base * 0.5];

  for (const x of baseHoleXOffsets) {
    for (const y of baseHoleYOffsets) {
      const bHoleGeom = new THREE.CylinderGeometry(baseHoleRadius, baseHoleRadius, T_base * 3, 24);
      const bHoleBrush = new Brush(bHoleGeom);
      bHoleBrush.position.set(x + T_face, y, T_base / 2);
      bHoleBrush.updateMatrixWorld();
      mount = evaluator.evaluate(mount, bHoleBrush, SUBTRACTION);
      mount.updateMatrixWorld();
    }
  }

  // 7. Final Normals & Metadata
  let geometry = mount.geometry.clone();
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
