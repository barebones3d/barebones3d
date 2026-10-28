import * as THREE from 'three';
import { CycloidalGearParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Generates an Epicycloidal Reduction Gear Disc (Cycloidal Drive):
 * - True mathematical cycloidal lobe profile based on pin radius, eccentricity, and lobe count
 * - Central eccentric bearing bore
 * - Array of circular output drive pin holes
 * - Watertight 2-manifold lofted solid mesh
 */
export function generateCycloidalGear(params: CycloidalGearParams): GeneratedMeshResult {
  const {
    rotorLobes = 10,
    pinCircleDiameter = 50,
    rollerDiameter = 6,
    eccentricity = 1.5,
    thickness = 8,
    boreDiameter = 12,
    driveHoleCount = 6,
    driveHoleDiameter = 8,
    printer_compensation = 0.15,
  } = params;

  const N = Math.max(6, Math.min(36, Math.round(rotorLobes)));
  const R_pin = Math.max(15, pinCircleDiameter / 2);
  const R_r = Math.max(1.5, rollerDiameter / 2);
  const e = Math.max(0.5, Math.min(eccentricity, R_pin / (N + 1) * 0.8));
  const T = Math.max(3, thickness);

  const numProfilePoints = Math.max(120, N * 16);
  const outerCoords2D: THREE.Vector2[] = [];

  // Generate true cycloidal lobe contour
  for (let i = 0; i < numProfilePoints; i++) {
    const theta = (i / numProfilePoints) * Math.PI * 2;
    const denom = R_pin / ((N + 1) * e) - Math.cos(N * theta);
    const psi = Math.atan2(Math.sin(N * theta), Math.max(0.001, denom));

    const cx = R_pin * Math.cos(theta) - e * Math.cos((N + 1) * theta);
    const cy = -R_pin * Math.sin(theta) + e * Math.sin((N + 1) * theta);

    const x = cx - R_r * Math.cos(theta - psi);
    const y = cy + R_r * Math.sin(theta - psi);
    outerCoords2D.push(new THREE.Vector2(x, y));
  }

  // Central bore
  const boreDia = Math.max(4, boreDiameter + printer_compensation);
  const rBore = boreDia / 2;
  const numBorePoints = 36;
  const boreCoords2D: THREE.Vector2[] = [];
  for (let i = 0; i < numBorePoints; i++) {
    const a = (i / numBorePoints) * Math.PI * 2;
    boreCoords2D.push(new THREE.Vector2(Math.cos(a) * rBore, Math.sin(a) * rBore));
  }

  // Drive pin holes
  const driveHoles: THREE.Vector2[][] = [];
  const driveDia = Math.max(3, driveHoleDiameter + printer_compensation);
  const rDrive = driveDia / 2;
  const drivePCD = (R_pin * 0.6 + rBore) / 2 + rBore * 0.3;
  const numDrivePoints = 24;

  const numHoles = Math.max(3, Math.min(8, Math.round(driveHoleCount)));
  for (let h = 0; h < numHoles; h++) {
    const holeAngle = (h / numHoles) * Math.PI * 2;
    const hcx = Math.cos(holeAngle) * drivePCD;
    const hcy = Math.sin(holeAngle) * drivePCD;
    const holeRing: THREE.Vector2[] = [];
    for (let p = 0; p < numDrivePoints; p++) {
      const a = (p / numDrivePoints) * Math.PI * 2;
      holeRing.push(new THREE.Vector2(hcx + Math.cos(a) * rDrive, hcy + Math.sin(a) * rDrive));
    }
    driveHoles.push(holeRing);
  }

  // Triangulate 2D cap using THREE.ShapeUtils
  const allHoles = [boreCoords2D, ...driveHoles];
  const capTris = THREE.ShapeUtils.triangulateShape(outerCoords2D, allHoles);

  // Reconstruct unified 2D point array matching ShapeUtils index order
  const allPoints2D: THREE.Vector2[] = [...outerCoords2D];
  const holeStartOffsets: number[] = [];
  for (const hole of allHoles) {
    holeStartOffsets.push(allPoints2D.length);
    allPoints2D.push(...hole);
  }

  // Build 3D mesh: bottom cap (z = -T/2), top cap (z = +T/2), and lofted vertical walls
  const positions: number[] = [];
  const indices: number[] = [];

  const addQuad = (v0: number, v1: number, v2: number, v3: number) => {
    indices.push(v0, v1, v2);
    indices.push(v0, v2, v3);
  };

  const zBot = -T / 2;
  const zTop = T / 2;

  // 1. Bottom Cap
  const botBase = positions.length / 3;
  const numVertices2D = allPoints2D.length;
  for (let i = 0; i < numVertices2D; i++) {
    positions.push(allPoints2D[i].x, allPoints2D[i].y, zBot);
  }
  for (const tri of capTris) {
    indices.push(
      botBase + tri[0],
      botBase + tri[2],
      botBase + tri[1]
    );
  }

  // 2. Top Cap
  const topBase = positions.length / 3;
  for (let i = 0; i < numVertices2D; i++) {
    positions.push(allPoints2D[i].x, allPoints2D[i].y, zTop);
  }
  for (const tri of capTris) {
    indices.push(
      topBase + tri[0],
      topBase + tri[1],
      topBase + tri[2]
    );
  }

  // 3. Outer Wall Quads
  for (let i = 0; i < numProfilePoints; i++) {
    const next = (i + 1) % numProfilePoints;
    const b0 = botBase + i;
    const b1 = botBase + next;
    const t0 = topBase + i;
    const t1 = topBase + next;
    addQuad(b0, b1, t1, t0);
  }

  // 4. Bore Wall Quads (inward facing)
  const boreOffset = holeStartOffsets[0];
  for (let i = 0; i < numBorePoints; i++) {
    const next = (i + 1) % numBorePoints;
    const b0 = botBase + boreOffset + i;
    const b1 = botBase + boreOffset + next;
    const t0 = topBase + boreOffset + i;
    const t1 = topBase + boreOffset + next;
    addQuad(b0, t0, t1, b1);
  }

  // 5. Drive Hole Walls (inward facing)
  for (let h = 0; h < driveHoles.length; h++) {
    const hOffset = holeStartOffsets[1 + h];
    for (let i = 0; i < numDrivePoints; i++) {
      const next = (i + 1) % numDrivePoints;
      const b0 = botBase + hOffset + i;
      const b1 = botBase + hOffset + next;
      const t0 = topBase + hOffset + i;
      const t1 = topBase + hOffset + next;
      addQuad(b0, t0, t1, b1);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  geom.computeBoundingBox();

  const volume = computeMeshVolume(geom);
  const weight = estimateWeightGrams(volume);
  const bbox = geom.boundingBox || new THREE.Box3();
  const sz = new THREE.Vector3();
  bbox.getSize(sz);

  return {
    geometry: geom,
    dimensions: { x: Number(sz.x.toFixed(2)), y: Number(sz.y.toFixed(2)), z: Number(sz.z.toFixed(2)) },
    triangles: indices.length / 3,
    vertices: positions.length / 3,
    estimatedPrintWeightGrams: weight,
  };
}
