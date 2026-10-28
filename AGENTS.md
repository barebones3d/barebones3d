# AGENTS.md — Barebones 3D CAD Engineering & Part Refactoring Guidelines

> **System Handbook for AI Agents & Engineers**  
> Standards, computational geometry patterns, and filleting/chamfering utilities for developing and refactoring parametric 3D CAD generators in `/generator/src/generators/`.

---

## 1. Core Principles & Guarantees

Every 3D generator in Barebones 3D must strictly adhere to four non-negotiable guarantees:

1. **Watertight 2-Manifold Solids:** Every generated mesh must be a closed, orientable 2-manifold solid with zero non-manifold edges, zero floating coplanar slivers, zero naked boundaries, and consistent outward-facing triangle winding. Meshes must slice flawlessly in Bambu Studio, PrusaSlicer, and OrcaSlicer without warnings.
2. **Sub-16ms Generation Budget:** Generators run client-side in the browser on every slider change. Execution time must stay strictly under **16ms** (60 FPS) to maintain fluid, stutter-free viewport interaction.
3. **Physical 3D Printability:** Parts are designed for real-world FDM/SLA mechanical applications. Wall thicknesses, fillet radii, screw clearances, and bore tolerances must incorporate printer compensation and prevent stress concentrations.
4. **Accurate Metadata:** All generators must return `GeneratedMeshResult` containing:
   * `geometry: THREE.BufferGeometry` with computed bounding box, bounding sphere, and creased normals.
   * `dimensions: [width, depth, height]` (all numbers rounded to 2 decimal places via `.toFixed(2)`).
   * `volumeMm3: number` computed via `computeMeshVolume(geometry)`.
   * `estimatedWeightGrams: number` computed via `estimateWeightGrams(volumeMm3, density)`.

---

## 2. Dual-Architecture Geometry Engine

Always select the correct modeling paradigm based on geometry type:

### Pattern A: Direct Coordinate Lofting / Quad-Strips (NO CSG)
* **Use for:** Gears, GT2 timing pulleys, revolving profiles, splined shafts, screws, threads, impellers, velocity stacks, spiral strain boots.
* **Technique:**
  1. Calculate exact 2D profile coordinates algebraically in the XY plane.
  2. Step along the Z axis, applying smooth twists, scaling, or offsets per slice.
  3. Stitch adjacent slices into quad strips using indexed triangle winding:
     ```ts
     // Triangle 1: (p00, p10, p11), Triangle 2: (p00, p11, p01)
     indices.push(p00, p10, p11, p00, p11, p01);
     ```
  4. Cap top and bottom faces using ear-clipping triangulation (e.g., `THREE.ShapeUtils.triangulateShape`).
* **Why:** $O(N)$ linear computational complexity, sub-5ms generation, zero CSG boolean failure modes.

### Pattern B: Defensive CSG (`three-bvh-csg`)
* **Use for:** Prismatic parts, L-brackets, pillow blocks, mounting plates, clamps, enclosures, drill guides, sensor housings.
* **Technique:**
  1. Build minimal solid brushes (`Brush`) using primitives or extruded 2D shapes.
  2. Union primary structural bodies with `evaluator.evaluate(body, addition, ADDITION)`.
  3. Subtract features (bores, slots, counterbores, chamfers) with `evaluator.evaluate(target, cutter, SUBTRACTION)`.
  4. Dispose intermediate brushes and geometries immediately.
  5. Apply `toCreasedNormals(finalGeometry, THREE.MathUtils.degToRad(30..35))`.

---

## 3. Filleting, Chamfering, & Stress-Relief Patterns

### ⚠️ Strict Prohibition: Never Use Naive 3D CSG Edge Filleting
**DO NOT attempt naive 3D edge filleting via arbitrary CSG subtractions on un-extended planes.** Arbitrary 3D CSG bevels on coplanar boundaries cause coplanar face clashing, degenerate sliver triangles, non-manifold edges, high polygon bloat, and boolean crashes.

Instead, **strictly apply the four zero-error rounding patterns** provided in [`src/utils/filletMath.ts`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/utils/filletMath.ts):

---

### Method 1: Pre-Filleted 2D Closed Profiles (Single-Pass Extrusion)
* **When to use:** L-brackets, angle irons, flanges, baseplates, mounting ears, motor mounting feet.
* **Mechanism:** Round all sharp corners in 2D vector space using `THREE.Shape`, then extrude once along the depth axis with `THREE.ExtrudeGeometry(shape, { bevelEnabled: false })`.
* **Key Functions:**
  * `createFilletedLProfile(l1, l2, t1, t2, innerFillet, outerFillet): THREE.Shape`
    * Traces an L-bracket profile in 2D.
    * Replaces the sharp 90° inner crook with a smooth tangent arc (`absarc`) of radius `innerFillet`.
    * Rounds the outside corner with radius `outerFillet`.
    * Eliminates dual-box boolean unions entirely, avoiding internal non-manifold seam planes.
  * `createRoundedRectShape(width, height, radius): THREE.Shape`
    * Generates a centered 2D rounded rectangle with 4 smooth corner arcs.
    * Use for mounting ears, flanges, and baseplates prior to extrusion.
* **Defensive Clamping:** Always clamp fillets so they never self-intersect:
  ```ts
  const maxInner = Math.min((l1 - t2) * 0.85, (l2 - t1) * 0.85);
  const rin = Math.max(0, Math.min(innerFillet, maxInner));
  ```

---

### Method 2: Defensive Oversized Subtractions & Lead-In Chamfers
* **When to use:** Bearing bores, shaft entries, screw clearance holes, bolt counterbores.
* **Mechanism:**
  * **Oversized Cutters:** Always extend cylindrical and rectangular cutters beyond the part boundaries along the cutting axis (e.g., `depth * 4` or `+2.0mm` overshoot on both sides). Never allow a cutter face to be coplanar with the target mesh face.
  * **Conical Lead-in Chamfers:** To ease bearing or shaft insertion and eliminate 3D printing elephant-foot friction, subtract a shallow entry cone:
    ```ts
    // Shallow 45° conical entry cutter with axial overshoot
    const chamferDepth = 0.8;
    const overshoot = 0.5;
    const chamferCutterGeom = new THREE.CylinderGeometry(
      pocketRadius + 0.5 + overshoot, // Large outer entry rim
      pocketRadius,                   // Inner bearing bore match
      chamferDepth + overshoot,
      32
    );
    // Align cutter top flush beyond the front face
    chamferCutterGeom.rotateX(Math.PI / 2);
    chamferCutterGeom.translate(0, 0, frontFaceZ + (chamferDepth + overshoot) / 2 - overshoot);
    ```

---

### Method 3: Positive Internal Fillet Wedges (`createInternalFilletWedge`)
* **When to use:** Where an upright cylinder or vertical wall meets a flat horizontal plate (e.g. pillow block housing-to-base joint, stepper mount faceplate-to-base joint).
* **Mechanism:** Construct a positive concave quarter-round fillet wedge geometry along the junction axis and perform a boolean **ADDITION** (`evaluator.evaluate(base, wedge, ADDITION)`).
* **Key Function:**
  * `createInternalFilletWedge(radius: number, length: number): THREE.BufferGeometry`
    * Extruded along Z, centered from `-length/2` to `+length/2`.
    * Right angle at `(0, 0)` in XY, concave tangent arc connecting `(radius, 0)` to `(0, radius)`.
    * Mirror and position along junction seams to reinforce high-stress corners.

---

### Method 4: Oversized Negative Corner Cutters (`createOversizedCornerCutter`)
* **When to use:** Rounding exterior corners of existing 3D solid blocks when 2D profile pre-filleting is not feasible.
* **Mechanism:** Perform a boolean **SUBTRACTION** using a cutter that extends beyond the part boundaries by `margin` (default `2.0mm`) along both lateral axes and in height.
* **Key Function:**
  * `createOversizedCornerCutter(radius: number, height: number, margin = 2.0): THREE.BufferGeometry`
    * Corner at `(0, 0)`.
    * Extends from `-margin` to `+radius` in XY, and `-(height/2 + margin)` to `+(height/2 + margin)` in Z.
    * Strictly prevents coplanar boundary clashing and non-manifold edge creation.

---

## 4. Gear Teeth & Shaft Stress-Relief Standards

When working with gears, pulleys, and drive components:

1. **Trochoidal / Circular Root Fillets:**
   * Every involute gear tooth profile (`computeInvoluteGear2D` in [`src/utils/meshMath.ts`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/utils/meshMath.ts)) must generate smooth multi-sample circular fillets spanning the base of the involute flank to the dedendum root circle.
   * Sharp non-filleted tooth roots cause catastrophic stress risers and crack propagation in 3D printed gear trains.
2. **Shaft Bore Lead-In Chamfers:**
   * For drive shaft bores (Round, D-Shaft, Hex), add a 45° lead-in chamfer ($0.5\text{mm}$ to $1.0\text{mm}$) on the top and bottom cap slices so motor shafts and axles slide in without snagging layer lines.
3. **Chevron Apex Symmetry:**
   * For herringbone gears, ensure the slice count is odd (e.g., 25 slices) with the central chevron apex located precisely at $z = 0$.

---

## 5. Mesh Hygiene, Polygon Budgets, & Shading

### Radial Segment Budget
To guarantee the sub-16ms runtime budget during CSG evaluations:
* **Main bearing pockets / large cylindrical shells:** 28 to 32 radial segments.
* **Mounting screw holes & small ear bosses:** 16 to 24 radial segments.
* **Fillet arcs and curved profile segments:** 12 to 16 curve segments.
* **DO NOT** use 64+ radial segments in CSG operations. CSG BVH tree construction scales quadratically with triangle count and causes UI freezing.

### Surface Normal Shading
* **Never** leave raw faceted normals on cylindrical surfaces, and **never** use un-creased global smooth normals (which cause pillowy, bulging planar faces).
* Always compute creased normals:
  ```ts
  import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

  // 30° - 35° crease angle preserves crisp 90° planar edges while smoothing fillets and bores
  const finalGeometry = toCreasedNormals(rawGeometry, THREE.MathUtils.degToRad(32));
  ```

---

## 6. Implementation & Refactoring Workflow

When adding or refactoring any component generator:

1. **Identify Stress Risers & Sharp Corners:**
   * Inner right-angle crooks $\rightarrow$ Apply **Method 1** (`createFilletedLProfile`) or **Method 3** (`createInternalFilletWedge`).
   * Outer base/flange corners $\rightarrow$ Apply **Method 1** (`createRoundedRectShape`).
   * Bore & bearing pocket entries $\rightarrow$ Apply **Method 2** (45° lead-in chamfer cone).
   * Exterior box corners $\rightarrow$ Apply **Method 4** (`createOversizedCornerCutter`).
2. **Update Parameter Interfaces ([`src/generators/types.ts`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/generators/types.ts)):**
   * Add typed fillet/chamfer parameters with sensible defaults (e.g., `innerFillet?: number`, `outerFillet?: number`, `cornerFillet?: number`, `leadInChamfer?: boolean`).
3. **Expose Controls in UI ([`src/components/ParameterSidebar.tsx`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/components/ParameterSidebar.tsx)):**
   * Provide sliders with step sizes of `0.25mm` or `0.5mm`.
   * Add defensive maximum bounds (`max={Math.min(...)}`) to prevent self-intersecting geometry.
4. **Update App State & Presets ([`src/App.tsx`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/App.tsx)):**
   * Initialize state defaults and configure preset buttons with realistic fillet dimensions.
5. **Headless Verification ([`test_generators.ts`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/test_generators.ts)):**
   * Add or update test cases covering default, min-fillet, and max-fillet parameters.
   * Run the test suite:
     ```bash
     npm test
     ```
   * Ensure 100% test pass rate with zero non-manifold edges, valid bounding dimensions, and successful binary STL export.
6. **Production Build Validation:**
   * Run TypeScript check and production build:
     ```bash
     npx tsc --noEmit && npm run build
     ```

---

## 7. Directives for Creating New Part Generators (Step-by-Step SOP)

Follow this rigorous, standardized 7-step process whenever creating a new parametric CAD generator from scratch:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   NEW PART CREATION PIPELINE                           │
├─────────────────┬──────────────────────┬───────────────────────────────┤
│ 1. Architecture │ 2. Implementation    │ 3. UI & Catalog Registration  │
│    Pattern A/B  │    Types & Math      │    Sidebar, Presets, App      │
├─────────────────┴──────────────────────┴───────────────────────────────┤
│ 4. Headless Verification: Euler, Watertight, Winding, Volume, STL      │
├────────────────────────────────────────────────────────────────────────┤
│ 5. Sync & Production Deployment: Build, Sync Site, Wrangler Pages      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Step 1: Modeling Architecture Selection
Determine the primary modeling pattern before writing geometry code:
* **Pattern A: Direct Math Lofting / Quad-Strips (NO CSG):**
  * **Choose if:** The part has radial, rotational, helical, or continuous cross-sectional symmetry (gears, pulleys, sprockets, knobs, wheels, nozzles, boots, screws).
  * **Guarantee:** Zero CSG boolean failures, exact analytical control, execution under $3\text{ms}$.
* **Pattern B: Defensive CSG (`three-bvh-csg`):**
  * **Choose if:** The part has orthogonal intersecting prismatic features, pockets, cross-drilled channels, or thin rib gussets on flat plates (brackets, pillow blocks, enclosures, mounts).
  * **Guarantee:** Strict oversized cutters ($+2.0\text{mm}$ axial overshoot) and zero coplanar face clashing.

---

### Step 2: Parameter Interface & Catalog Registration
1. **Define the Typed Parameter Interface in [`generator/src/generators/types.ts`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/generators/types.ts):**
   ```ts
   export interface MyNewPartParams {
     // Functional engineering dimensions (in mm or degrees)
     primaryDiameter: number;
     totalLength: number;
     wallThickness: number;

     // Mechanical interface features
     boreType?: 'round' | 'd-shaft' | 'hex';
     boreDiameter?: number;
     dShaftFlatOffset?: number;

     // Fillets, Chamfers & Stress Relief
     cornerFillet?: number;
     leadInChamfer?: boolean;

     // Mandatory 3D Print Tolerance Offset
     printer_compensation: number; // typically 0.15mm
   }
   ```
2. **Register in `PRIMITIVE_CATALOG` in [`generator/src/generators/types.ts`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/generators/types.ts):**
   * Assign an immutable snake_case `id`.
   * Assign one of the five primary categories: `'Structural & Mounts'`, `'Motion & Power'`, `'Sensors & Electromechanical'`, `'Fluid & Hardware'`, or `'Enclosures & Jigs'`.
   * Set `isMathLofted: true` (Pattern A) or `false` (Pattern B).

---

### Step 3: Implement the Generator Function
Create [`generator/src/generators/<partName>.ts`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/generators/) and export:
```ts
export function generateMyNewPart(params: MyNewPartParams): GeneratedMeshResult
```

#### Non-Negotiable Implementation Rules:
1. **Defensive Parameter Sanitization:**
   Never assume params are valid numbers. Always clamp and fall back to safe engineering defaults:
   ```ts
   const D = Math.max(5.0, params.primaryDiameter || 20.0);
   const L = Math.max(2.0, params.totalLength || 15.0);
   const comp = typeof params.printer_compensation === 'number' ? params.printer_compensation : 0.15;
   ```
2. **Printer Tolerance Compensation:**
   * **Internal Bores / Bearing Pockets / Bolt Holes:** Expand radius: $r_{\text{cut}} = \frac{D_{\text{bore}} + \text{comp}}{2}$.
   * **External Shafts / Locating Bosses / Tenons:** Contract radius: $r_{\text{boss}} = \frac{D_{\text{shaft}} - \text{comp}}{2}$.
3. **Strict Triangle Winding Invariants (Pattern A Math Lofting):**
   All triangle vertices must be wound counter-clockwise (CCW) when viewed from the outside of the solid:
   * **Outer Shell Quads:** Outward normal $+\hat{r}$:
     ```ts
     indices.push(p00, p10, p11); // Tri 1: CCW
     indices.push(p00, p11, p01); // Tri 2: CCW
     ```
   * **Internal Bores & Ducts:** Inward normal $-\hat{r}$ (pointing into the void hole):
     ```ts
     indices.push(b00, b01, b10);
     indices.push(b10, b01, b11);
     ```
   * **Bottom End Caps & Pocket Floors:** Outward normal $-\hat{z}$ (pointing downward into void).
   * **Top End Caps:** Outward normal $+\hat{z}$ (pointing upward into ambient space).
   * **Blind Bore Ceilings:** Must point down into $-\hat{z}$ (into the bore void, never into the solid ceiling).
   * **Step Shoulders:**
     * Stepping inward ($r_{\text{curr}} > r_{\text{next}}$): Faces $+\hat{z}$.
     * Stepping outward ($r_{\text{curr}} < r_{\text{next}}$): Faces $-\hat{z}$.
4. **Defensive CSG Invariants (Pattern B):**
   * Cylindrical and slot cutters must extend beyond part boundaries by $\ge 2.0\text{mm}$ along the depth/cutting axis (`cutterLength = partThickness + 4.0`, translated $-2.0\text{mm}$).
   * Dispose all intermediate geometries and brushes (`geom.dispose()`, `brush.geometry.dispose()`).
   * Apply `toCreasedNormals(finalGeometry, THREE.MathUtils.degToRad(32))` to preserve crisp planar junctions while smoothing curved bores.
5. **Standard Metadata Return:**
   ```ts
   geometry.computeBoundingBox();
   geometry.computeBoundingSphere();
   const bbox = geometry.boundingBox || new THREE.Box3();
   const dimensions = {
     x: Number((bbox.max.x - bbox.min.x).toFixed(2)),
     y: Number((bbox.max.y - bbox.min.y).toFixed(2)),
     z: Number((bbox.max.z - bbox.min.z).toFixed(2)),
   };
   const volume = computeMeshVolume(geometry);
   const estimatedPrintWeightGrams = estimateWeightGrams(volume, 0.2); // 20% infill PLA

   return {
     geometry,
     dimensions,
     triangles: geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3,
     vertices: geometry.attributes.position.count,
     estimatedPrintWeightGrams,
   };
   ```

---

### Step 4: Export Generator
Export the new generator in [`generator/src/generators/index.ts`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/generators/index.ts).

---

### Step 5: Wire Parameter Sidebar & Presets
1. **Parameter Sidebar Controls ([`generator/src/components/ParameterSidebar.tsx`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/components/ParameterSidebar.tsx)):**
   * Add a control block under `selectedPart === '<part_id>'`.
   * Group inputs into clear sections (Primary Geometry, Mounting / Interface, Tolerances).
   * Clamp slider inputs dynamically (`min`, `max`, `step`) to prevent degenerate or self-intersecting geometries.
2. **Preset Buttons ([`generator/src/components/PresetsBar.tsx`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/components/PresetsBar.tsx)):**
   * Add 2 to 4 realistic engineering presets (e.g., standard bolt sizes, common shaft couplings, standard bearing frame dimensions).
3. **App State Initialization ([`generator/src/App.tsx`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/App.tsx)):**
   * Add default parameter state and integrate with URL search param sync (`?part=<part_id>`).

---

### Step 6: Headless Verification & OpenSCAD 2-Manifold Testing
Add a dedicated test case to [`generator/test_generators.ts`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/test_generators.ts):

```ts
// In test_generators.ts
validateMesh('My New Part M4 Standard', generateMyNewPart({
  primaryDiameter: 25,
  totalLength: 30,
  wallThickness: 2.5,
  printer_compensation: 0.15,
}), isMathLofted); // Pass true for Math Lofted parts to run 2-manifold check
```

Run the automated test suite:
```bash
npm test
```

#### The Automated 2-Manifold Test Enforces:
* **$V - E + F = 2 - 2g$:** Evaluates Euler-Poincaré topology ($0$ for genus-1 torus with through-shaft bore).
* **0 Open Edges:** Every edge shared by $\ge 2$ triangles (zero holes or naked borders).
* **0 Non-Manifold Multi-Edges:** No edge shared by $> 2$ triangles.
* **0 Flipped Winding Edges:** Neighboring triangles traverse shared edges in opposite directions.
* **Positive Signed Divergence Volume ($V > 0$):** Verifies all outward normals point into air/space, guaranteeing flawless OpenSCAD CSG evaluation and slicer compatibility.
* **Valid Binary STL Export:** Verifies export output byte length $\ge 84$ bytes.

---

### Step 7: Build, Sync, & Deploy
1. **Production Build:**
   ```bash
   npm --prefix generator run build
   ```
2. **Synchronize Distribution Files to Landing Site:**
   ```bash
   npm run sync:site
   ```
3. **Update Catalog Headers & Static Pages:**
   * Ensure `PRIMITIVE_CATALOG.length` is dynamically reflected in [`generator/src/components/Header.tsx`](file:///Users/brandonpersonal/Documents/Git/barebones3d/generator/src/components/Header.tsx).
   * Update [`site/index.html`](file:///Users/brandonpersonal/Documents/Git/barebones3d/site/index.html) directory cards if needed.
4. **Deploy to Cloudflare Pages:**
   ```bash
   CLOUDFLARE_ACCOUNT_ID=2bbe914ca4d82460c51d668407bb3dbd npx wrangler pages deploy site --project-name barebones3d --branch main
   ```
5. **Git Commit & Push:**
   Commit clean changes and push to `origin/main`.

