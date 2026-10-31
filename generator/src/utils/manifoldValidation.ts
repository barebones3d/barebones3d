import * as THREE from 'three';

export interface ManifoldValidationResult {
  isManifold: boolean;
  openEdges: number;
  multiEdges: number;
  flippedEdges: number;
  signedVolumeMm3: number;
  eulerCharacteristic: number;
  genus: number;
  statusText: string;
}

/**
 * Performs rigorous client-side topological 2-manifold validation on a Three.js BufferGeometry:
 * 1. Welds vertices within 1 micron (0.001mm) precision
 * 2. Checks edge multiplicity: every edge must have exactly 2 incident triangles (0 open boundary edges, 0 multi-edges)
 * 3. Checks triangle winding consistency: adjacent triangles must traverse shared edges in opposite directions
 * 4. Checks signed volume divergence: volume must be strictly positive (outward-facing normals)
 * 5. Computes Euler-Poincaré characteristic: chi = V - E + F (0 for single through-bore torus, 2 for topological sphere)
 */
export function validateMeshManifold(geometry: THREE.BufferGeometry | null): ManifoldValidationResult {
  if (!geometry) {
    return {
      isManifold: false,
      openEdges: 0,
      multiEdges: 0,
      flippedEdges: 0,
      signedVolumeMm3: 0,
      eulerCharacteristic: 0,
      genus: 0,
      statusText: 'No Geometry',
    };
  }

  const pos = geometry.attributes.position;
  if (!pos || pos.count < 3) {
    return {
      isManifold: false,
      openEdges: 0,
      multiEdges: 0,
      flippedEdges: 0,
      signedVolumeMm3: 0,
      eulerCharacteristic: 0,
      genus: 0,
      statusText: 'Degenerate Geometry',
    };
  }

  const idx = geometry.index;
  const numTris = idx ? idx.count / 3 : pos.count / 3;

  const vMap = new Map<string, number>();
  const vList: THREE.Vector3[] = [];

  function getVertexId(x: number, y: number, z: number): number {
    // 1-micron welding resolution prevents floating-point rounding splits across coplanar junctions
    const k = `${Math.round(x * 1000)},${Math.round(y * 1000)},${Math.round(z * 1000)}`;
    const existing = vMap.get(k);
    if (existing !== undefined) return existing;
    const newId = vList.length;
    vList.push(new THREE.Vector3(x, y, z));
    vMap.set(k, newId);
    return newId;
  }

  const triangles: [number, number, number][] = [];
  for (let i = 0; i < numTris; i++) {
    const i0 = idx ? idx.getX(i * 3) : i * 3;
    const i1 = idx ? idx.getX(i * 3 + 1) : i * 3 + 1;
    const i2 = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;

    const v0 = getVertexId(pos.getX(i0), pos.getY(i0), pos.getZ(i0));
    const v1 = getVertexId(pos.getX(i1), pos.getY(i1), pos.getZ(i1));
    const v2 = getVertexId(pos.getX(i2), pos.getY(i2), pos.getZ(i2));

    // Exclude zero-area degenerate slivers where multiple vertices map to same point
    if (v0 !== v1 && v1 !== v2 && v2 !== v0) {
      triangles.push([v0, v1, v2]);
    }
  }

  const edgeMap = new Map<string, [number, number][]>();
  for (const [v0, v1, v2] of triangles) {
    const triEdges: [number, number][] = [
      [v0, v1],
      [v1, v2],
      [v2, v0],
    ];
    for (const [a, b] of triEdges) {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      let list = edgeMap.get(key);
      if (!list) {
        list = [];
        edgeMap.set(key, list);
      }
      list.push([a, b]);
    }
  }

  let openEdges = 0;
  let multiEdges = 0;
  let flippedEdges = 0;

  for (const [, dirs] of edgeMap.entries()) {
    if (dirs.length === 1) {
      openEdges++;
    } else if (dirs.length > 2) {
      multiEdges++;
    } else if (dirs.length === 2) {
      // Correct 2-manifold orientation: shared edge traversed in opposite directions
      if (dirs[0][0] === dirs[1][0] && dirs[0][1] === dirs[1][1]) {
        flippedEdges++;
      }
    }
  }

  // Signed divergence volume
  let signedVol = 0;
  for (const [v0, v1, v2] of triangles) {
    const p0 = vList[v0];
    const p1 = vList[v1];
    const p2 = vList[v2];
    signedVol += p0.dot(p1.clone().cross(p2)) / 6.0;
  }

  const V = vList.length;
  const E = edgeMap.size;
  const F = triangles.length;
  const eulerCharacteristic = V - E + F;
  const genus = Math.max(0, Math.round((2 - eulerCharacteristic) / 2));

  // A solid 2-manifold must have zero open edges, zero non-manifold junctions, zero flipped normals,
  // and strictly positive enclosed volume.
  const isManifold = openEdges === 0 && multiEdges === 0 && flippedEdges === 0 && signedVol > 0;
  const statusText = isManifold ? 'Watertight 2-Manifold' : 'Non-Manifold Mesh';

  return {
    isManifold,
    openEdges,
    multiEdges,
    flippedEdges,
    signedVolumeMm3: Number(signedVol.toFixed(2)),
    eulerCharacteristic,
    genus,
    statusText,
  };
}
