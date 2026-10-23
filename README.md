# Barebones 3D

> High-precision diagnostic hubs, engineering calculators, and client-side parametric 3D CAD generator.

[![Cloudflare Pages](https://img.shields.io/badge/Deployed-Cloudflare%20Pages-f38020?logo=cloudflare)](https://barebones3d.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r170-black?logo=threedotjs)](https://threejs.org/)
[![Constructive Solid Geometry](https://img.shields.io/badge/Engine-three--bvh--csg-0284c7)](#)

---

## 🛠️ Parametric 3D CAD Generator (`/generator`)

A zero-bloat, client-side parametric CAD tool running 100% in the browser ($0 server compute). Produces watertight (2-manifold) meshes with instantaneous binary and ASCII STL export for FDM / SLA 3D printing.

### Implemented Mechanical Primitives

#### 🌀 Complex Mathematical Profile & Slice-Lofted Primitives (Herringbone Architecture)
1. **GT2 Timing Belt Pulleys**:
   - Curvilinear GT2/GT3 tooth profile calculation with pitch line differential (PLD) and root radius.
   - Slice-based lofting along Z with optional retaining flanges (top/bottom) and set-screw hub collar.
   - Parametric shaft bore (Round, D-Shaft, Hex) with printer clearance compensation.
2. **Herringbone Double-Helical Gears**:
   - Continuous involute gear tooth profile generation based on metric module ($m$) and pressure angle ($\alpha$).
   - Synchronized opposing helix angles ($+\beta$ and $-\beta$) cancelling axial thrust loads.
   - Bore configurations: Solid hub, Round bore, D-Shaft (keyed flat), and Hex bore.
3. **Knurled Control Knobs & Thumbwheels**:
   - Continuous mathematical radial modulation for straight fluted, diamond cross-hatched, or heavy ribbed knurls.
   - Top chamfer bevel with pointer indicator groove and optional flared instrument base skirt.
   - Precision potentiometer shaft bore with blind depth or through-hole.
4. **Threaded Fasteners (Metric Bolts & Nuts)**:
   - Parametric ISO 60° metric thread generation via helical slice sweep with truncated crests for FDM/SLA printing.
   - Bolt heads: Hex drive, Socket head cap, or Knurled thumb screw with lead-in starter chamfer.
   - Matching hexagonal nut with internal helical thread bore.

#### 🧱 Constructive Solid Geometry (CSG) Primitives (`three-bvh-csg`)
5. **Flexible / Clamp Shaft Couplers**:
   - Independent dual internal bores (e.g. 5mm motor shaft to 8mm T8 leadscrew).
   - Longitudinal clamping slits and transverse expansion slots for angular/axial flexure.
   - Cross-drilled pinch bolt clearance holes with socket-head cap counterbores.
6. **Electronics Project Enclosures**:
   - Parameterized box shell with uniform wall and floor thicknesses.
   - Recessed perimeter lid rebate step for snap or flush screw lid fitment.
   - Corner PCB standoff mounting bosses with screw pilot holes and side cable port cutouts.
7. **NEMA Stepper Motor Mounts**:
   - Standard presets for NEMA 14 (35mm), NEMA 17 (42.3mm), and NEMA 23 (56.4mm).
   - Motor faceplate with center pilot bore and elongated tensioning adjustment slots.
   - Rigid 90° mounting base with frame bolt holes and stiffening side gusset webs.
8. **Linear Smooth Rod Clamps (SK / SHF Style)**:
   - Precision cylindrical bore for 8mm, 10mm, 12mm, or 16mm hardened linear motion rods.
   - Flexure slit with transverse pinch bolt hole and socket cap counterbore.
   - Base mounting holes for horizontal pedestal (SK) or vertical flange (SHF) orientation.
9. **Hose Barb & Pipe Adapters**:
   - Stacked conical retention ramp barbs for positive mechanical grip on flexible silicone/PVC tubing.
   - Central hexagonal wrench collar for spanner tightening.
   - Coupler (dual barb), reducer (different ODs), or flanged bulkhead configurations with continuous through-bore.
10. **T8 Anti-Backlash Leadscrew Nut Blocks**:
    - Central leadscrew clearance bore with counterbored pocket for standard T8 nut flange (22mm).
    - 4-hole mounting circle (16mm PCD) for nut retention screws.
    - Horizontal gantry mounting holes with bolt head counterbores.
11. **Modular Cable Drag Chain Links**:
    - Hollow rectangular wire passage with interlocking male/female pivot ear hinges.
    - Integrated mechanical travel stops limiting bend angle to prevent cable fatigue and sagging.
12. **Bearing Pillow Blocks & Cartridges**:
    - Sized for standard ball bearings (608, 624, 688, or custom OD/ID/W).
    - CSG modeling: center cylinder boss and ear bosses united via exact mathematical external tangent solid bridges.
    - Bearing pocket with configurable retention ledge, through-hole, and M3–M6 mounting clearance holes.
13. **Structural L-Brackets & Corner Braces**:
    - True CSG dual rectangular box legs with independent thickness and length control.
    - Triangular gusset web reinforcement in the inner corner with clean subtracted cylindrical drill holes and 90° conical countersinks.
    - Creased normal calculation (`toCreasedNormals`) ensuring crisp planar faces without visual pinching.

---

## 📁 Repository Layout

```text
barebones3d/
├── site/                     # Production static site served on barebones3d.com
│   ├── index.html            # Main marketing landing page
│   ├── generator.html        # Direct routing alias for CAD generator
│   ├── generator/            # Compiled client-side CAD generator assets
│   ├── css/                  # Styling tokens and CSS
│   ├── contact.html          # Contact page
│   ├── privacy.html          # Privacy policy
│   ├── terms.html            # Terms of service
│   ├── _headers              # Cloudflare HTTP security & cache headers
│   └── _redirects            # Routing redirects
├── generator/                # Vite + React + Three.js CAD application source
│   ├── src/
│   │   ├── generators/       # Mathematical CAD geometry engines (CSG)
│   │   ├── components/       # UI (3D Viewport, Sidebar controls, Presets bar)
│   │   └── utils/            # Mesh volume, print weight, STL exporter
│   ├── test_generators.ts    # Headless unit test suite
│   ├── package.json
│   └── vite.config.ts
├── package.json              # Root orchestration scripts
└── README.md
```

---

## 🚀 Development Quickstart

```bash
# 1. Install dependencies
cd generator && npm install --legacy-peer-deps

# 2. Run local development server (live viewport at http://localhost:5173)
npm run dev

# 3. Run geometry & STL exporter unit test suite
npm test

# 4. Build production bundle and sync to site/
npm run build
```

---

## 📄 License
Commercial proprietary software. Copyright © Barebones 3D, L.L.C.
