import * as THREE from 'three';
import { GenevaMechanismParams, GeneratedMeshResult } from './types';
import { computeMeshVolume, estimateWeightGrams, triangulateCap } from '../utils/meshMath';

/**
 * Generates an Intermittent Motion Geneva Mechanism (Maltese Cross Wheel):
 * - Radial driven slots for drive pin engagement with rounded bottoms
 * - Concave locking arc detents for non-slip dwell between index steps
 * - Center shaft mounting bore
 * - Watertight 2-manifold lofted solid mesh
 */
export function generateGenevaMechanism(params: GenevaMechanismParams): GeneratedMeshResult {
  const {
    slotCount = 4,
    wheelRadius = 35,
    pinDiameter = 4,
    slotWidth = 4.4,
    thickness = 6,
    centerBoreDiameter = 6,
    lockingRadius = 18,
    printer_compensation = 0.15,
  } = params;

  const N = Math.max(3, Math.min(8, Math.round(slotCount)));
  const Rw = Math.max(18, wheelRadius);
  const sW = Math.max(pinDiameter + 0.2, slotWidth + printer_compensation);
  const halfSlot = sW / 2;
  const T = Math.max(3, thickness);
  const R_lock = Math.max(8, Math.min(Rw * 0.65, lockingRadius));

  // Generate 2D boundary of Geneva cross
  const outerCoords2D: THREE.Vector2[] = [];
  const sectorAngle = (Math.PI * 2) / N;

  // For each of the N sectors: slot -> outer tip -> locking concave arc -> outer tip
  for (let s = 0; s < N; s++) {
    const baseAngle = s * sectorAngle;

    // Slot points (from outer radius in towards center, round slot bottom, back out)
    const slotDir = new THREE.Vector2(Math.cos(baseAngle), Math.sin(baseAngle));
    const slotNorm = new THREE.Vector2(-slotDir.y, slotDir.x);

    // Slot depth: goes down to ~0.35 * Rw
    const slotInnerR = Math.max(centerBoreDiameter / 2 + 3, Rw * 0.35);

    // Entry point 1 (left side of slot at Rw)
    const pEntry1 = slotDir.clone().multiplyScalar(Rw).add(slotNorm.clone().multiplyScalar(halfSlot));
    // Inner bottom 1
    const pInner1 = slotDir.clone().multiplyScalar(slotInnerR).add(slotNorm.clone().multiplyScalar(halfSlot));
    // Semicircular bottom arc
    const numBot = 8;
    const botCenter = slotDir.clone().multiplyScalar(slotInnerR);
    const bottomPoints: THREE.Vector2[] = [];
    for (let b = 0; b <= numBot; b++) {
      const bAngle = Math.PI / 2 + (b / numBot) * Math.PI;
      const bx = botCenter.x + Math.cos(baseAngle + bAngle) * halfSlot;
      const by = botCenter.y + Math.sin(baseAngle + bAngle) * halfSlot;
      bottomPoints.push(new THREE.Vector2(bx, by));
    }
    // Entry point 2 (right side of slot at Rw)
    const pEntry2 = slotDir.clone().multiplyScalar(Rw).sub(slotNorm.clone().multiplyScalar(halfSlot));

    outerCoords2D.push(pEntry1);
    outerCoords2D.push(pInner1);
    outerCoords2D.push(...bottomPoints);
    outerCoords2D.push(pEntry2);

    // Now transition to the locking circular arc between slot s and slot s+1
    // The locking arc center is outside the wheel at distance (Rw + R_lock * 0.6)
    const midAngle = baseAngle + sectorAngle / 2;
    const lockCenterDist = Rw * 1.05;
    const lockCenterX = Math.cos(midAngle) * lockCenterDist;
    const lockCenterY = Math.sin(midAngle) * lockCenterDist;

    // Concave arc points (curves inwards towards center of Geneva wheel)
    const numLock = 12;
    for (let k = 0; k <= numLock; k++) {
      // Angle along midAngle
      const t = -0.5 + k / numLock; // -0.5 to +0.5
      const arcSweepAngle = Math.PI + t * (sectorAngle * 0.8);
      const lx = lockCenterX + Math.cos(midAngle + arcSweepAngle) * R_lock;
      const ly = lockCenterY + Math.sin(midAngle + arcSweepAngle) * R_lock;
      outerCoords2D.push(new THREE.Vector2(lx, ly));
    }
  }

  // Central shaft bore
  const boreDia = Math.max(3, centerBoreDiameter + printer_compensation);
  const rBore = boreDia / 2;
  const numBorePoints = 32;
  const boreCoords2D: THREE.Vector2[] = [];
  for (let i = 0; i < numBorePoints; i++) {
    const a = (i / numBorePoints) * Math.PI * 2;
    boreCoords2D.push(new THREE.Vector2(Math.cos(a) * rBore, Math.sin(a) * rBore));
  }

  const positions: number[] = [];
  const indices: number[] = [];

  const addQuad = (v0: number, v1: number, v2: number, v3: number) => {
    indices.push(v0, v1, v2);
    indices.push(v0, v2, v3);
  };

  const zBot = -T / 2;
  const zTop = T / 2;
  const numOuter = outerCoords2D.length;

  // 1. Outer Perimeter Wall Quads (separate wall vertices)
  const wallBotBase = positions.length / 3;
  for (let i = 0; i < numOuter; i++) {
    positions.push(outerCoords2D[i].x, outerCoords2D[i].y, zBot);
  }
  const wallTopBase = positions.length / 3;
  for (let i = 0; i < numOuter; i++) {
    positions.push(outerCoords2D[i].x, outerCoords2D[i].y, zTop);
  }
  for (let i = 0; i < numOuter; i++) {
    const next = (i + 1) % numOuter;
    const b0 = wallBotBase + i;
    const b1 = wallBotBase + next;
    const t0 = wallTopBase + i;
    const t1 = wallTopBase + next;
    addQuad(b0, b1, t1, t0);
  }

  // 2. Central Bore Wall Quads (inward facing, separate wall vertices)
  const boreWallBotBase = positions.length / 3;
  for (let i = 0; i < numBorePoints; i++) {
    positions.push(boreCoords2D[i].x, boreCoords2D[i].y, zBot);
  }
  const boreWallTopBase = positions.length / 3;
  for (let i = 0; i < numBorePoints; i++) {
    positions.push(boreCoords2D[i].x, boreCoords2D[i].y, zTop);
  }
  for (let i = 0; i < numBorePoints; i++) {
    const next = (i + 1) % numBorePoints;
    const b0 = boreWallBotBase + i;
    const b1 = boreWallBotBase + next;
    const t0 = boreWallTopBase + i;
    const t1 = boreWallTopBase + next;
    addQuad(b0, t0, t1, b1);
  }

  // 3. Bottom Cap (facing -Z, decoupled cap vertices)
  const capTris = triangulateCap(outerCoords2D, boreCoords2D);
  const botCapBase = positions.length / 3;
  for (let i = 0; i < numOuter; i++) {
    positions.push(outerCoords2D[i].x, outerCoords2D[i].y, zBot);
  }
  for (let i = 0; i < numBorePoints; i++) {
    positions.push(boreCoords2D[i].x, boreCoords2D[i].y, zBot);
  }
  for (const [i0, i1, i2] of capTris) {
    indices.push(botCapBase + i0, botCapBase + i2, botCapBase + i1);
  }

  // 4. Top Cap (facing +Z, decoupled cap vertices)
  const topCapBase = positions.length / 3;
  for (let i = 0; i < numOuter; i++) {
    positions.push(outerCoords2D[i].x, outerCoords2D[i].y, zTop);
  }
  for (let i = 0; i < numBorePoints; i++) {
    positions.push(boreCoords2D[i].x, boreCoords2D[i].y, zTop);
  }
  for (const [i0, i1, i2] of capTris) {
    indices.push(topCapBase + i0, topCapBase + i1, topCapBase + i2);
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
