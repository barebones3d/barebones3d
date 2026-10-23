import * as THREE from 'three';
import { KnurledKnobParams, GeneratedMeshResult } from './types';
import { generateBore2D, computeMeshVolume, estimateWeightGrams } from '../utils/meshMath';

/**
 * Computes the radial radius for a knurled control knob at a given angle and height.
 */
function getKnurlRadius(
  angle: number,
  zFrac: number, // 0 (bottom of knurl zone) to 1 (top of knurl zone)
  baseRadius: number,
  knurlCount: number,
  knurlDepth: number,
  pattern: 'straight' | 'diamond' | 'ribbed'
): number {
  if (pattern === 'straight') {
    // Pure axial knurl teeth (fluted / ribbed)
    const factor = 0.5 - 0.5 * Math.cos(knurlCount * angle);
    return baseRadius - knurlDepth * factor;
  } else if (pattern === 'diamond') {
    // Diamond knurling: opposing helical waves producing diamond pyramid peaks
    const helixTwist = zFrac * Math.PI * 2;
    const wave1 = Math.cos(knurlCount * angle + helixTwist);
    const wave2 = Math.cos(knurlCount * angle - helixTwist);
    const diamondVal = 0.5 * (wave1 + wave2); // in [-1, 1]
    const factor = Math.max(0, diamondVal); // sharp diamond pyramid crests
    return (baseRadius - knurlDepth) + knurlDepth * factor;
  } else {
    // Ribbed: trapezoidal finger grip ridges
    const toothAngle = (2 * Math.PI) / knurlCount;
    const local = Math.abs(((angle % toothAngle) + toothAngle) % toothAngle - toothAngle / 2);
    const norm = local / (toothAngle / 2); // 0 at ridge center, 1 at groove
    const factor = Math.pow(norm, 2.0);
    return baseRadius - knurlDepth * factor;
  }
}

/**
 * Generates a watertight, mathematically precise Knurled Rotary Control Knob.
 * Features:
 * - Straight fluted, diamond cross-hatched, or heavy ribbed knurling patterns
 * - Optional flared instrument base skirt
 * - Smooth top chamfer
 * - Optional top pointer indicator notch
 * - Precision shaft bore (Round, D-Shaft for potentiometers, or Hex)
 */
export function generateKnurledKnob(params: KnurledKnobParams): GeneratedMeshResult {
  const {
    outerDiameter,
    height,
    knurlPattern,
    knurlCount,
    knurlDepth,
    hasPointer,
    hasSkirt,
    skirtDiameter,
    skirtHeight,
    boreDiameter,
    boreType,
    dShaftFlatOffset,
    boreDepth,
    printer_compensation,
  } = params;

  // 1. Dimensions
  const totalHeight = Math.max(8.0, height);
  const knobRadius = Math.max(5.0, outerDiameter / 2);
  const actualKnurlCount = Math.max(12, knurlCount);
  const actualKnurlDepth = Math.min(knobRadius * 0.4, Math.max(0.3, knurlDepth));

  const actualSkirtHeight = hasSkirt ? Math.min(totalHeight * 0.4, Math.max(2.0, skirtHeight)) : 0;
  const actualSkirtRadius = hasSkirt ? Math.max(knobRadius + 2.0, skirtDiameter / 2) : knobRadius;

  const chamferHeight = Math.min(totalHeight * 0.2, 2.5);
  const knurlZoneHeight = totalHeight - actualSkirtHeight - chamferHeight;

  // Bore setup
  const maxSafeBoreDia = Math.max(0, (knobRadius - actualKnurlDepth - 1.5) * 2);
  const actualBoreDia = Math.min(boreDiameter, maxSafeBoreDia);
  const hasBore = actualBoreDia > 1.0;
  const isBlindBore = boreDepth > 0 && boreDepth < totalHeight;
  const effectiveBoreDepth = isBlindBore ? Math.min(totalHeight - 2.0, boreDepth) : totalHeight;

  // 2. Discretization
  const samplesPerTooth = 4;
  const numOuterPoints = actualKnurlCount * samplesPerTooth;

  const angles: number[] = [];
  for (let i = 0; i < numOuterPoints; i++) {
    angles.push((i / numOuterPoints) * Math.PI * 2);
  }

  // Bore profile
  let boreProfile2D: THREE.Vector2[] = [];
  let numBorePoints = 0;
  if (hasBore) {
    boreProfile2D = generateBore2D(
      boreType,
      actualBoreDia,
      dShaftFlatOffset,
      printer_compensation,
      numOuterPoints
    );
    numBorePoints = boreProfile2D.length;
  }

  // 3. Generate Z Slices
  interface KnobSlice {
    z: number;
    profile: THREE.Vector2[];
    hasBoreAtThisZ: boolean;
  }

  const slices: KnobSlice[] = [];

  // Helper to sample outer profile at height z
  const computeKnobProfile = (z: number): THREE.Vector2[] => {
    return angles.map((a) => {
      let r = knobRadius;

      // Pointer indicator notch (at top angles around 0 deg)
      const isPointerZone = hasPointer && Math.abs(a - Math.PI / 2) < 0.15 && z > totalHeight - chamferHeight * 1.5;

      if (hasSkirt && z <= actualSkirtHeight) {
        // Tapered base skirt: smoothly blends from skirtRadius to knobRadius
        const frac = z / actualSkirtHeight;
        r = actualSkirtRadius * (1 - frac) + knobRadius * frac;
      } else if (z < totalHeight - chamferHeight) {
        // Main knurled grip body
        const zKnurl = z - actualSkirtHeight;
        const zFrac = knurlZoneHeight > 0 ? zKnurl / knurlZoneHeight : 0;
        r = getKnurlRadius(a, zFrac, knobRadius, actualKnurlCount, actualKnurlDepth, knurlPattern);
      } else {
        // Top chamfer bevel
        const chamferFrac = (z - (totalHeight - chamferHeight)) / chamferHeight;
        const topRadius = knobRadius - actualKnurlDepth - 1.0;
        r = knobRadius * (1 - chamferFrac) + topRadius * chamferFrac;
      }

      if (isPointerZone) {
        r -= 1.8; // visible pointer groove indicator
      }

      return new THREE.Vector2(r * Math.cos(a), r * Math.sin(a));
    });
  };

  // Add Skirt Slices
  if (hasSkirt) {
    const skirtSteps = 4;
    for (let i = 0; i <= skirtSteps; i++) {
      const z = (i / skirtSteps) * actualSkirtHeight;
      slices.push({
        z,
        profile: computeKnobProfile(z),
        hasBoreAtThisZ: hasBore && z <= effectiveBoreDepth,
      });
    }
  }

  // Add Knurl Body Slices
  const knurlSteps = knurlPattern === 'diamond' ? 16 : 8;
  const startZ = hasSkirt ? actualSkirtHeight : 0;
  for (let i = (hasSkirt ? 1 : 0); i <= knurlSteps; i++) {
    const z = startZ + (i / knurlSteps) * knurlZoneHeight;
    slices.push({
      z,
      profile: computeKnobProfile(z),
      hasBoreAtThisZ: hasBore && z <= effectiveBoreDepth,
    });
  }

  // Add Chamfer Slices
  const chamferSteps = 4;
  const chamferStartZ = totalHeight - chamferHeight;
  for (let i = 1; i <= chamferSteps; i++) {
    const z = chamferStartZ + (i / chamferSteps) * chamferHeight;
    slices.push({
      z,
      profile: computeKnobProfile(z),
      hasBoreAtThisZ: hasBore && z <= effectiveBoreDepth,
    });
  }

  // 4. Assemble Positions & Indices
  const positions: number[] = [];
  const indices: number[] = [];
  const totalSlices = slices.length;

  // Record vertex index offsets per slice
  const sliceOuterOffsets: number[] = [];
  const sliceBoreOffsets: number[] = [];

  let currentVertCount = 0;
  for (let s = 0; s < totalSlices; s++) {
    const { z, profile, hasBoreAtThisZ } = slices[s];

    sliceOuterOffsets.push(currentVertCount);
    for (let i = 0; i < numOuterPoints; i++) {
      positions.push(profile[i].x, profile[i].y, z);
      currentVertCount++;
    }

    if (hasBoreAtThisZ) {
      sliceBoreOffsets.push(currentVertCount);
      for (let i = 0; i < numBorePoints; i++) {
        positions.push(boreProfile2D[i].x, boreProfile2D[i].y, z);
        currentVertCount++;
      }
    } else {
      sliceBoreOffsets.push(-1);
    }
  }

  // 5. Connect Outer Quads
  for (let s = 0; s < totalSlices - 1; s++) {
    const o0 = sliceOuterOffsets[s];
    const o1 = sliceOuterOffsets[s + 1];

    for (let i = 0; i < numOuterPoints; i++) {
      const nextI = (i + 1) % numOuterPoints;

      const p00 = o0 + i;
      const p10 = o0 + nextI;
      const p11 = o1 + nextI;
      const p01 = o1 + i;

      indices.push(p00, p10, p11);
      indices.push(p00, p11, p01);
    }
  }

  // 6. Connect Inner Bore Quads
  for (let s = 0; s < totalSlices - 1; s++) {
    const b0 = sliceBoreOffsets[s];
    const b1 = sliceBoreOffsets[s + 1];

    if (b0 !== -1 && b1 !== -1) {
      // Cylindrical inner bore wall
      for (let i = 0; i < numBorePoints; i++) {
        const nextI = (i + 1) % numBorePoints;

        const p00 = b0 + i;
        const p10 = b0 + nextI;
        const p11 = b1 + nextI;
        const p01 = b1 + i;

        indices.push(p00, p11, p10);
        indices.push(p00, p01, p11);
      }
    } else if (b0 !== -1 && b1 === -1) {
      // Blind bore bottom shelf cap (facing +Z into the knob interior)
      const shelfTris = THREE.ShapeUtils.triangulateShape(boreProfile2D, []);
      for (const tri of shelfTris) {
        indices.push(b0 + tri[0], b0 + tri[1], b0 + tri[2]);
      }
    }
  }

  // 7. Triangulate Bottom Cap (slice 0, z = 0, facing -Z)
  const botOuter = slices[0].profile;
  const botHoles = slices[0].hasBoreAtThisZ ? [boreProfile2D] : [];
  const botTris = THREE.ShapeUtils.triangulateShape(botOuter, botHoles);
  const b0Outer = sliceOuterOffsets[0];
  const b0Bore = sliceBoreOffsets[0];

  for (const tri of botTris) {
    const idx0 = tri[0] < numOuterPoints ? b0Outer + tri[0] : b0Bore + (tri[0] - numOuterPoints);
    const idx1 = tri[1] < numOuterPoints ? b0Outer + tri[1] : b0Bore + (tri[1] - numOuterPoints);
    const idx2 = tri[2] < numOuterPoints ? b0Outer + tri[2] : b0Bore + (tri[2] - numOuterPoints);
    indices.push(idx0, idx2, idx1);
  }

  // 8. Triangulate Top Cap (slice totalSlices - 1, z = totalHeight, facing +Z)
  const topIdx = totalSlices - 1;
  const topOuter = slices[topIdx].profile;
  const topHasBore = slices[topIdx].hasBoreAtThisZ;
  const topHoles = topHasBore ? [boreProfile2D] : [];
  const topTris = THREE.ShapeUtils.triangulateShape(topOuter, topHoles);
  const topOuterOffset = sliceOuterOffsets[topIdx];
  const topBoreOffset = sliceBoreOffsets[topIdx];

  for (const tri of topTris) {
    const idx0 = tri[0] < numOuterPoints ? topOuterOffset + tri[0] : topBoreOffset + (tri[0] - numOuterPoints);
    const idx1 = tri[1] < numOuterPoints ? topOuterOffset + tri[1] : topBoreOffset + (tri[1] - numOuterPoints);
    const idx2 = tri[2] < numOuterPoints ? topOuterOffset + tri[2] : topBoreOffset + (tri[2] - numOuterPoints);
    indices.push(idx0, idx1, idx2);
  }

  // 9. Build Three.js BufferGeometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
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
    triangles: indices.length / 3,
    vertices: positions.length / 3,
    estimatedPrintWeightGrams,
  };
}
