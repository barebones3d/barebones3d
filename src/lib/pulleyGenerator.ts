/**
 * Barebones 3D - Standalone GT2 Pulley Math & Binary STL Generator
 * Zero-dependency, pure mathematical lofting engine.
 * Generates watertight 2-manifold binary STL buffers for edge APIs.
 */

interface PulleyOptions {
  teeth: number;
  boreMm: number;
  widthMm: number;
  flangeHeightMm?: number;
}

export function generateGT2PulleyBinarySTL(options: PulleyOptions): Uint8Array {
  const { teeth, boreMm, widthMm } = options;
  const numTeeth = Math.max(10, Math.min(120, Math.round(teeth)));
  const boreRadius = Math.max(1.0, Math.min(15.0, boreMm / 2));
  const height = Math.max(4.0, Math.min(50.0, widthMm));

  const pitch = 2.0;
  const pitchRadius = (numTeeth * pitch) / (2 * Math.PI);
  const outerRadius = Math.max(boreRadius + 1.5, pitchRadius - 0.254);
  const toothDepth = 0.75;
  const rootRadius = Math.max(boreRadius + 1.0, outerRadius - toothDepth);

  const samplesPerTooth = 8;
  const numPoints = numTeeth * samplesPerTooth;

  // Triangles list: each triangle is [nx, ny, nz, x1, y1, z1, x2, y2, z2, x3, y3, z3]
  const triangles: number[][] = [];

  function addTri(
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
    x3: number, y3: number, z3: number
  ) {
    // Normal calculation
    const ax = x2 - x1;
    const ay = y2 - y1;
    const az = z2 - z1;
    const bx = x3 - x1;
    const by = y3 - y1;
    const bz = z3 - z1;

    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
    nx /= len;
    ny /= len;
    nz /= len;

    triangles.push([nx, ny, nz, x1, y1, z1, x2, y2, z2, x3, y3, z3]);
  }

  function addQuad(
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number]
  ) {
    addTri(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
    addTri(p0[0], p0[1], p0[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]);
  }

  // Precompute 2D points for outer tooth profile and inner bore
  const outer2D: [number, number][] = [];
  const inner2D: [number, number][] = [];

  const toothPitchAngle = (2 * Math.PI) / numTeeth;
  const halfTooth = toothPitchAngle / 2;

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const toothIdx = Math.floor(a / toothPitchAngle);
    const localAngle = a - (toothIdx + 0.5) * toothPitchAngle;
    const normalizedDist = Math.abs(localAngle) / halfTooth;
    const flankFactor = Math.pow(Math.sin(normalizedDist * Math.PI * 0.5), 1.6);
    const r = rootRadius + toothDepth * flankFactor;

    outer2D.push([r * Math.cos(angle), r * Math.sin(angle)]);
    inner2D.push([boreRadius * Math.cos(angle), boreRadius * Math.sin(angle)]);
  }

  // 1. Outer Tooth Surface Quad Strips
  for (let i = 0; i < numPoints; i++) {
    const next = (i + 1) % numPoints;
    const o0 = outer2D[i];
    const o1 = outer2D[next];

    addQuad(
      [o0[0], o0[1], 0],
      [o1[0], o1[1], 0],
      [o1[0], o1[1], height],
      [o0[0], o0[1], height]
    );
  }

  // 2. Inner Bore Surface (Facing void)
  for (let i = 0; i < numPoints; i++) {
    const next = (i + 1) % numPoints;
    const b0 = inner2D[i];
    const b1 = inner2D[next];

    addQuad(
      [b0[0], b0[1], 0],
      [b0[0], b0[1], height],
      [b1[0], b1[1], height],
      [b1[0], b1[1], 0]
    );
  }

  // 3. Bottom Cap (z = 0, Normal points down -z)
  for (let i = 0; i < numPoints; i++) {
    const next = (i + 1) % numPoints;
    const o0 = outer2D[i];
    const o1 = outer2D[next];
    const b0 = inner2D[i];
    const b1 = inner2D[next];

    addQuad(
      [o0[0], o0[1], 0],
      [b0[0], b0[1], 0],
      [b1[0], b1[1], 0],
      [o1[0], o1[1], 0]
    );
  }

  // 4. Top Cap (z = height, Normal points up +z)
  for (let i = 0; i < numPoints; i++) {
    const next = (i + 1) % numPoints;
    const o0 = outer2D[i];
    const o1 = outer2D[next];
    const b0 = inner2D[i];
    const b1 = inner2D[next];

    addQuad(
      [o0[0], o0[1], height],
      [o1[0], o1[1], height],
      [b1[0], b1[1], height],
      [b0[0], b0[1], height]
    );
  }

  // Serialize to standard binary STL format (84 + 50 * N bytes)
  const numTriangles = triangles.length;
  const buffer = new ArrayBuffer(84 + numTriangles * 50);
  const view = new DataView(buffer);

  // 80-byte header
  const headerStr = `Barebones 3D GT2 Pulley ${numTeeth}T ${boreMm}mm | CC BY-NC 4.0`.slice(0, 80);
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 0x20);
  }

  // 4-byte uint32 triangle count
  view.setUint32(80, numTriangles, true);

  let offset = 84;
  for (let t = 0; t < numTriangles; t++) {
    const tri = triangles[t];
    // Normal (3 floats)
    view.setFloat32(offset, tri[0], true);
    view.setFloat32(offset + 4, tri[1], true);
    view.setFloat32(offset + 8, tri[2], true);
    // V1 (3 floats)
    view.setFloat32(offset + 12, tri[3], true);
    view.setFloat32(offset + 16, tri[4], true);
    view.setFloat32(offset + 20, tri[5], true);
    // V2 (3 floats)
    view.setFloat32(offset + 24, tri[6], true);
    view.setFloat32(offset + 28, tri[7], true);
    view.setFloat32(offset + 32, tri[8], true);
    // V3 (3 floats)
    view.setFloat32(offset + 36, tri[9], true);
    view.setFloat32(offset + 40, tri[10], true);
    view.setFloat32(offset + 44, tri[11], true);
    // Attribute byte count
    view.setUint16(offset + 48, 0, true);

    offset += 50;
  }

  return new Uint8Array(buffer);
}
