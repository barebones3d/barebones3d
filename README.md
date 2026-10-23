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
1. **Herringbone Double-Helical Gears**:
   - Continuous involute gear tooth profile generation based on metric module ($m$) and pressure angle ($\alpha$).
   - Synchronized opposing helix angles ($+\beta$ and $-\beta$) cancelling axial thrust loads.
   - Bore configurations: Solid hub, Round bore, D-Shaft (keyed flat), and Hex bore.
2. **Bearing Pillow Blocks & Cartridges**:
   - Sized for standard ball bearings (608, 624, 688, or custom OD/ID/W).
   - Constructive Solid Geometry (CSG) modeling: center cylinder boss and ear bosses united via exact mathematical external tangent solid bridges.
   - Bearing pocket with configurable retention ledge, through-hole, and M3–M6 mounting clearance holes.
3. **Structural L-Brackets & Corner Braces**:
   - True CSG dual rectangular box legs with independent thickness and length control.
   - Triangular gusset web reinforcement in the inner corner.
   - Clean subtracted cylindrical drill holes and 90° conical countersinks.
   - Creased normal calculation (`toCreasedNormals`) ensuring crisp planar faces with zero diagonal skinning creases.

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
