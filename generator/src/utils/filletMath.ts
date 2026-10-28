import * as THREE from 'three';

/**
 * Fillet & Chamfer Mathematical CAD Utilities
 * Implements zero-error rounding patterns:
 * 1. 2D Pre-Filleted Profile Extrusion (eliminates multi-box unions)
 * 2. 2D Rounded Rectangle Shapes (for flanges and baseplates)
 * 3. 3D Positive Internal Fillet Wedges (concave quarter-round fillers for vertical/horizontal intersections)
 * 4. 3D Oversized Negative Corner Cutters (for CSG corner rounding without coplanar clashes)
 */

/**
 * 1. Traces an L-bracket profile in 2D using THREE.Shape:
 * - Replaces the sharp 90 deg inner crook with a smooth tangent arc of radius innerFillet.
 * - Rounds the outside corner with radius outerFillet.
 * - Returns a clean 2D closed contour ready for single-pass extrusion.
 */
export function createFilletedLProfile(
  l1: number,
  l2: number,
  t1: number,
  t2: number,
  innerFillet: number,
  outerFillet: number
): THREE.Shape {
  // Defensive clamping to prevent self-intersection
  const maxInner = Math.max(0, Math.min((l1 - t2) * 0.85, (l2 - t1) * 0.85));
  const rin = Math.max(0, Math.min(innerFillet, maxInner));

  const maxOuter = Math.max(0, Math.min(t1 * 0.85, t2 * 0.85, l1 * 0.5, l2 * 0.5));
  const rout = Math.max(0, Math.min(outerFillet, maxOuter));

  const shape = new THREE.Shape();

  // Start on bottom edge just after the outer fillet
  shape.moveTo(rout, 0);

  // 1. Bottom edge along Leg 1 (to outer bottom-right tip)
  shape.lineTo(l1, 0);

  // 2. Leg 1 tip vertical face
  shape.lineTo(l1, t1);

  // 3. Inner face of Leg 1 towards the inner crook
  shape.lineTo(t2 + rin, t1);

  // 4. Smooth inner crook tangent arc
  if (rin > 0.05) {
    // Center at (t2 + rin, t1 + rin).
    // Clockwise arc from angle -PI/2 down to -PI (tangent at both ends)
    shape.absarc(t2 + rin, t1 + rin, rin, -Math.PI / 2, -Math.PI, true);
  } else {
    shape.lineTo(t2, t1);
  }

  // 5. Inner face of Leg 2 towards top tip
  shape.lineTo(t2, l2);

  // 6. Leg 2 tip horizontal face
  shape.lineTo(0, l2);

  // 7. Leg 2 outer vertical face down towards outer fillet
  shape.lineTo(0, rout);

  // 8. Outer corner convex fillet
  if (rout > 0.05) {
    // Center at (rout, rout).
    // Counter-clockwise arc from angle PI to 3*PI/2 (tangent to -Y and +X directions)
    shape.absarc(rout, rout, rout, Math.PI, Math.PI * 1.5, false);
  } else {
    shape.lineTo(0, 0);
  }

  shape.closePath();
  return shape;
}

/**
 * 2. Generates a 2D rounded rectangle (with 4 rounded corners) centered at (0, 0).
 * Ideal for baseplates, mounting ears, and flanges prior to extrusion.
 */
export function createRoundedRectShape(
  width: number,
  height: number,
  radius: number
): THREE.Shape {
  const hw = Math.max(0.5, width / 2);
  const hh = Math.max(0.5, height / 2);
  const r = Math.max(0, Math.min(radius, hw * 0.95, hh * 0.95));

  const shape = new THREE.Shape();

  if (r <= 0.05) {
    shape.moveTo(-hw, -hh);
    shape.lineTo(hw, -hh);
    shape.lineTo(hw, hh);
    shape.lineTo(-hw, hh);
    shape.closePath();
    return shape;
  }

  shape.moveTo(hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);

  shape.lineTo(-hw + r, hh);
  shape.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);

  shape.lineTo(-hw, -hh + r);
  shape.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5, false);

  shape.lineTo(hw - r, -hh);
  shape.absarc(hw - r, -hh + r, r, Math.PI * 1.5, Math.PI * 2, false);

  shape.closePath();
  return shape;
}

/**
 * 3. Constructs a positive concave quarter-round fillet wedge geometry along the Z axis.
 * Extruded along Z, centered from -length/2 to +length/2.
 * The 90 deg corner is located at (0, 0) in the XY plane, with legs extending to (radius, 0)
 * and (0, radius), and a concave circular arc connecting them.
 * Used for boolean UNIONS where an upright cylinder or wall meets a flat horizontal plate.
 */
export function createInternalFilletWedge(
  radius: number,
  length: number
): THREE.BufferGeometry {
  const r = Math.max(0.2, radius);
  const len = Math.max(0.5, length);

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(r, 0);
  // Concave arc with center at (r, r), clockwise from -PI/2 to -PI
  shape.absarc(r, r, r, -Math.PI / 2, -Math.PI, true);
  shape.lineTo(0, 0);
  shape.closePath();

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: len,
    bevelEnabled: false,
    curveSegments: 16,
  });
  // Center along Z axis
  geom.translate(0, 0, -len / 2);
  return geom;
}

/**
 * 4. Builds an oversized negative corner cutter for rounding existing boxy corners via CSG.
 * Corner is at (0, 0) in the quadrant [0, radius] x [0, radius].
 * Bounds extend beyond the part perimeter by margin mm along both lateral axes (-margin)
 * and along the extrusion axis Z to strictly prevent coplanar face clashing.
 */
export function createOversizedCornerCutter(
  radius: number,
  height: number,
  margin = 2.0
): THREE.BufferGeometry {
  const r = Math.max(0.2, radius);
  const m = Math.max(0.5, margin);

  const shape = new THREE.Shape();
  shape.moveTo(-m, -m);
  shape.lineTo(r, -m);
  shape.lineTo(r, 0);
  // Concave arc from (r, 0) to (0, r) with center at (r, r)
  shape.absarc(r, r, r, -Math.PI / 2, -Math.PI, true);
  shape.lineTo(-m, r);
  shape.lineTo(-m, -m);
  shape.closePath();

  const totalH = height + 2 * m;
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: totalH,
    bevelEnabled: false,
    curveSegments: 16,
  });
  geom.translate(0, 0, -totalH / 2);
  return geom;
}
