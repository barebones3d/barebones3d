import * as THREE from 'three';
import { BoreType } from '../generators/types';

/**
 * Calculates involute function: inv(phi) = tan(phi) - phi
 */
export function involute(phiRad: number): number {
  return Math.tan(phiRad) - phiRad;
}

export interface InvoluteGearMathResult {
  pitchRadius: number;
  baseRadius: number;
  tipRadius: number;
  rootRadius: number;
  profilePoints: THREE.Vector2[]; // 2D points of one full gear cross-section in CCW order
}

/**
 * Computes a mathematically precise involute gear profile (2D contour).
 */
export function computeInvoluteGear2D(
  module: number,
  toothCount: number,
  pressureAngleDeg: number,
  samplesPerFlank: number = 5
): InvoluteGearMathResult {
  const pressureAngleRad = (pressureAngleDeg * Math.PI) / 180;
  const pitchRadius = (module * toothCount) / 2;
  const baseRadius = pitchRadius * Math.cos(pressureAngleRad);
  const addendum = module;
  const dedendum = 1.25 * module;
  const tipRadius = pitchRadius + addendum;
  const rootRadius = Math.max(0.2, pitchRadius - dedendum);

  const circularPitch = Math.PI * module;
  const toothPitchAngle = (2 * Math.PI) / toothCount;
  const halfToothThicknessAngleAtPitch = (circularPitch / 2) / (2 * pitchRadius); // half of tooth arc in radians
  const invAlpha = involute(pressureAngleRad);

  const points: THREE.Vector2[] = [];

  for (let t = 0; t < toothCount; t++) {
    const toothCenterAngle = t * toothPitchAngle;

    // --- Right flank (from root up to tip) ---
    // Under base circle (radial flank down to root)
    if (rootRadius < baseRadius) {
      const phiRoot = toothCenterAngle - (halfToothThicknessAngleAtPitch + invAlpha);
      points.push(new THREE.Vector2(rootRadius * Math.cos(phiRoot), rootRadius * Math.sin(phiRoot)));
    }

    // Involute curve up to tip
    const rStart = Math.max(rootRadius, baseRadius);
    for (let s = 0; s <= samplesPerFlank; s++) {
      const frac = s / samplesPerFlank;
      const r = rStart + (tipRadius - rStart) * frac;
      const alphaR = Math.acos(Math.min(1.0, baseRadius / r));
      const thetaR = toothCenterAngle - (halfToothThicknessAngleAtPitch + invAlpha - involute(alphaR));
      points.push(new THREE.Vector2(r * Math.cos(thetaR), r * Math.sin(thetaR)));
    }

    // --- Top land (at tip radius) ---
    // Handled by top point of right flank and top point of left flank

    // --- Left flank (from tip down to root) ---
    for (let s = samplesPerFlank; s >= 0; s--) {
      const frac = s / samplesPerFlank;
      const r = rStart + (tipRadius - rStart) * frac;
      const alphaR = Math.acos(Math.min(1.0, baseRadius / r));
      const thetaR = toothCenterAngle + (halfToothThicknessAngleAtPitch + invAlpha - involute(alphaR));
      points.push(new THREE.Vector2(r * Math.cos(thetaR), r * Math.sin(thetaR)));
    }

    // Radial flank down to root on left side
    if (rootRadius < baseRadius) {
      const phiRoot = toothCenterAngle + (halfToothThicknessAngleAtPitch + invAlpha);
      points.push(new THREE.Vector2(rootRadius * Math.cos(phiRoot), rootRadius * Math.sin(phiRoot)));
    }

    // Root bottom fillet curve between left flank and next right flank
    const leftFlankRootAngle = toothCenterAngle + (halfToothThicknessAngleAtPitch + invAlpha);
    const nextToothRightAngle = toothCenterAngle + toothPitchAngle - (halfToothThicknessAngleAtPitch + invAlpha);
    const valleySpan = nextToothRightAngle - leftFlankRootAngle;
    const filletSamples = 3;
    for (let f = 1; f <= filletSamples; f++) {
      const fAngle = leftFlankRootAngle + (valleySpan * f) / (filletSamples + 1);
      points.push(new THREE.Vector2(rootRadius * Math.cos(fAngle), rootRadius * Math.sin(fAngle)));
    }
  }

  return {
    pitchRadius,
    baseRadius,
    tipRadius,
    rootRadius,
    profilePoints: points,
  };
}

/**
 * Generates 2D points for the internal shaft bore (ordered CCW).
 */
export function generateBore2D(
  boreType: BoreType,
  diameter: number,
  dShaftFlatOffset: number,
  printerCompensation: number,
  segments: number = 32
): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];
  const compensatedDia = Math.max(0.5, diameter + printerCompensation);
  const radius = compensatedDia / 2;

  const bType = boreType || 'round';
  if (bType === 'd-shaft') {
    // D-shaft has a flat chord at y = offset - printerCompensation/2
    const safeOffset = (typeof dShaftFlatOffset === 'number' && !isNaN(dShaftFlatOffset) && dShaftFlatOffset !== 0)
      ? dShaftFlatOffset
      : radius * 0.7;
    const flatY = Math.min(radius * 0.9, Math.max(-radius * 0.9, safeOffset - printerCompensation / 2));
    const flatHalfWidth = Math.sqrt(Math.max(0, radius * radius - flatY * flatY));

    const angleStart = Math.atan2(flatY, flatHalfWidth);
    const angleEnd = Math.atan2(flatY, -flatHalfWidth);

    // Flat edge
    points.push(new THREE.Vector2(flatHalfWidth, flatY));
    points.push(new THREE.Vector2(-flatHalfWidth, flatY));

    // Circular arc for the remaining portion
    for (let i = 1; i < segments; i++) {
      const frac = i / segments;
      const angle = angleEnd + (Math.PI * 2 - (angleEnd - angleStart)) * frac;
      points.push(new THREE.Vector2(radius * Math.cos(angle), radius * Math.sin(angle)));
    }
  } else if (bType === 'hex') {
    // Hexagonal bore: 6 equal vertices
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      points.push(new THREE.Vector2(radius * Math.cos(angle), radius * Math.sin(angle)));
    }
  } else {
    // Default: 'round' bore
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector2(radius * Math.cos(angle), radius * Math.sin(angle)));
    }
  }

  return points;
}

/**
 * Calculates volume of any closed triangulated BufferGeometry in mm^3.
 * Signed volume sum over tetrahedra.
 */
export function computeMeshVolume(geometry: THREE.BufferGeometry): number {
  let volume = 0;
  const pos = geometry.attributes.position;
  const index = geometry.index;

  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const p3 = new THREE.Vector3();

  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const i1 = index.getX(i);
      const i2 = index.getX(i + 1);
      const i3 = index.getX(i + 2);

      p1.fromBufferAttribute(pos, i1);
      p2.fromBufferAttribute(pos, i2);
      p3.fromBufferAttribute(pos, i3);

      volume += p1.dot(p2.cross(p3)) / 6.0;
    }
  } else {
    for (let i = 0; i < pos.count; i += 3) {
      p1.fromBufferAttribute(pos, i);
      p2.fromBufferAttribute(pos, i + 1);
      p3.fromBufferAttribute(pos, i + 2);

      volume += p1.dot(p2.cross(p3)) / 6.0;
    }
  }

  return Math.abs(volume);
}

/**
 * Estimates weight in grams based on volume in mm^3, infill ratio, and PLA density (1.24 g/cm3).
 */
export function estimateWeightGrams(volumeMm3: number, infillRatio: number = 0.2): number {
  const volumeCm3 = volumeMm3 / 1000.0;
  const shellRatio = 0.25; // 3-4 perimeters + top/bottom solid layers
  const effectiveDensityMultiplier = shellRatio * 1.0 + (1 - shellRatio) * infillRatio;
  const plaDensityGPerCm3 = 1.24;
  return Number((volumeCm3 * effectiveDensityMultiplier * plaDensityGPerCm3).toFixed(1));
}

/**
 * Generates 2D points for a regular hexagon sized by width-across-flats (metric hex nut socket).
 * Ordered CCW.
 */
export function generateHexNut2D(
  widthAcrossFlats: number,
  printerCompensation: number = 0.15
): THREE.Vector2[] {
  const w = widthAcrossFlats + printerCompensation;
  const r = w / Math.sqrt(3); // circumscribed radius
  const points: THREE.Vector2[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    points.push(new THREE.Vector2(r * Math.cos(angle), r * Math.sin(angle)));
  }
  return points;
}

/**
 * Generates 2D points for an ergonomic scalloped wavy perimeter (CCW).
 */
export function generateScallopedPerimeter2D(
  baseRadius: number,
  lobeCount: number,
  lobeDepth: number,
  samples: number = 72
): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2;
    const r = Math.max(1.0, baseRadius + lobeDepth * Math.cos(lobeCount * angle));
    points.push(new THREE.Vector2(r * Math.cos(angle), r * Math.sin(angle)));
  }
  return points;
}

/**
 * Robust triangulation for planar end caps with optional hole contour.
 * Enforces CCW outer contour and CW hole contour as required by Mapbox Earcut,
 * then maps triangle vertex indices back to original array order.
 *
 * Returned indices:
 * - 0 to outerPoints.length - 1: corresponds to outerPoints
 * - outerPoints.length to outerPoints.length + holePoints.length - 1: corresponds to holePoints
 */
export function triangulateCap(
  outerPoints: THREE.Vector2[],
  holePoints: THREE.Vector2[] | THREE.Vector2[][] | null
): [number, number, number][] {
  const isOuterCW = THREE.ShapeUtils.isClockWise(outerPoints);
  const contour = isOuterCW ? outerPoints.slice().reverse() : outerPoints.slice();

  let holes: THREE.Vector2[][] = [];
  interface HoleMeta {
    origOffset: number;
    length: number;
    isReversed: boolean;
  }
  const holesMeta: HoleMeta[] = [];

  if (holePoints && holePoints.length > 0) {
    const isMultiHole = Array.isArray(holePoints[0]);
    const holesList: THREE.Vector2[][] = isMultiHole
      ? (holePoints as THREE.Vector2[][])
      : [holePoints as THREE.Vector2[]];

    let currentOffset = outerPoints.length;
    for (const h of holesList) {
      if (h && h.length >= 3) {
        const isHoleCW = THREE.ShapeUtils.isClockWise(h);
        if (!isHoleCW) {
          holes.push(h.slice().reverse());
          holesMeta.push({ origOffset: currentOffset, length: h.length, isReversed: true });
        } else {
          holes.push(h.slice());
          holesMeta.push({ origOffset: currentOffset, length: h.length, isReversed: false });
        }
        currentOffset += h.length;
      }
    }
  }

  const rawTriangles = THREE.ShapeUtils.triangulateShape(contour, holes);
  const numOuter = outerPoints.length;

  const mappedTriangles: [number, number, number][] = [];
  for (const [a, b, c] of rawTriangles) {
    const remap = (idx: number): number => {
      if (idx < numOuter) {
        return isOuterCW ? numOuter - 1 - idx : idx;
      } else {
        let acc = numOuter;
        for (const meta of holesMeta) {
          if (idx < acc + meta.length) {
            const holeLocalIdx = idx - acc;
            const remappedHoleIdx = meta.isReversed ? meta.length - 1 - holeLocalIdx : holeLocalIdx;
            return meta.origOffset + remappedHoleIdx;
          }
          acc += meta.length;
        }
        return idx;
      }
    };
    mappedTriangles.push([remap(a), remap(b), remap(c)]);
  }
  return mappedTriangles;
}

