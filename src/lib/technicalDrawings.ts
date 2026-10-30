import type { Part, GuideStep } from '../types/database.ts';

/**
 * Barebones 3D - Technical Orthographic Blueprint & Visual Renderer
 * Generates crisp, zero-dependency inline dark-mode SVG blueprints.
 * Eliminates broken image links, provides exact 3-view orthographic projections,
 * and renders step-by-step action diagrams.
 */

// Common Blueprint Defs: Technical grid, arrowhead markers, glow filters
function getCommonDefs(uniqueId: string): string {
  return `
    <defs>
      <!-- Engineering 20px Grid -->
      <pattern id="grid-${uniqueId}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.75" />
      </pattern>
      <!-- Fine 5px Sub-Grid -->
      <pattern id="subgrid-${uniqueId}" width="5" height="5" patternUnits="userSpaceOnUse">
        <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#0f172a" stroke-width="0.5" />
      </pattern>
      <!-- Dimension Arrow Marker (Amber) -->
      <marker id="dim-arrow-${uniqueId}" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M 0 1.5 L 6 4 L 0 6.5 Z" fill="#f59e0b" />
      </marker>
      <!-- Reverse Dimension Arrow Marker (Amber) -->
      <marker id="dim-arrow-rev-${uniqueId}" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto-start-reverse">
        <path d="M 0 1.5 L 6 4 L 0 6.5 Z" fill="#f59e0b" />
      </marker>
      <!-- Action Arrow Marker (Green) -->
      <marker id="action-arrow-${uniqueId}" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto">
        <path d="M 0 2 L 8 5 L 0 8 Z" fill="#4ade80" />
      </marker>
      <!-- Cyan Glow Filter -->
      <filter id="glow-cyan-${uniqueId}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;
}

function getTitleBlock(part: Part, viewName: string, w: number, h: number): string {
  return `
    <!-- Title Block / Engineering Stamp -->
    <g transform="translate(${w - 220}, ${h - 52})">
      <rect x="0" y="0" width="205" height="42" fill="#0b1329" stroke="#334155" stroke-width="1" rx="4" />
      <text x="10" y="14" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700" letter-spacing="0.05em">BAREBONES 3D SPECIFICATION</text>
      <text x="10" y="26" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="8.5">P/N: ${part.oem_part_number} &bull; ${viewName}</text>
      <text x="10" y="36" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="7.5">MAT: ${part.material_spec} &bull; TOL: &plusmn;0.15mm</text>
    </g>
  `;
}

/**
 * Generates Three Orthographic Views:
 * 1. Isometric 3D Projection (with Orbit HUD)
 * 2. Top-Down Plan View (XY)
 * 3. Side/Profile View with dimensional annotations
 */
export function generateThreeViewOrthographic(part: Part): {
  isometric: string;
  topDown: string;
  sideProfile: string;
} {
  const oem = part.oem_part_number.toUpperCase();
  const slug = part.slug;

  if (oem.includes('72131') || slug.includes('subaru')) {
    return generateSubaruGearDrawings(part);
  } else if (oem.includes('W10195416') || slug.includes('whirlpool')) {
    return generateWhirlpoolWheelDrawings(part);
  } else if (oem.includes('55670') || slug.includes('toyota')) {
    return generateToyotaVentDrawings(part);
  } else if (oem.includes('00605010') || slug.includes('bosch')) {
    return generateBoschHandleDrawings(part);
  } else if (oem.includes('WA-104') || slug.includes('pioneer')) {
    return generatePioneerArmDrawings(part);
  } else if (oem.includes('FL3Z') || oem.includes('1651071') || slug.includes('sunroof')) {
    return generateFordSunroofDrawings(part);
  }

  // Generic parametric mechanical component blueprint for any ingested part
  return generateGenericMechanicalDrawings(part);
}

// ---------------------------------------------------------------------------
// 1. Subaru Blend Door Gear (72131-FG000)
// ---------------------------------------------------------------------------
function generateSubaruGearDrawings(part: Part) {
  const w = 600, h = 380;

  // Isometric
  const isoId = 'subaru-iso';
  const isometric = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Isometric Projection">
      ${getCommonDefs(isoId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${isoId})" />

      <!-- Isometric Axonometric Axes -->
      <g stroke="#334155" stroke-width="0.75" stroke-dasharray="4,4">
        <line x1="300" y1="190" x2="140" y2="280" />
        <line x1="300" y1="190" x2="460" y2="280" />
        <line x1="300" y1="190" x2="300" y2="50" />
      </g>

      <!-- Isometric 3D Solid Model: Sector Gear & Hub -->
      <g transform="translate(300, 195)">
        <!-- Base sector extrusion -->
        <path d="M 0 -10 L 90 -55 A 110 55 0 0 1 10 75 L 0 20 Z" fill="#0f2438" stroke="#0284c7" stroke-width="1.5" />
        <path d="M 0 10 L 90 -35 A 110 55 0 0 1 10 95 L 0 40 Z" fill="#0b1728" stroke="#0284c7" stroke-width="1.5" />
        
        <!-- Gear Teeth Facets (Isometric) -->
        <path d="
          M 90 -55 L 90 -35 L 98 -30 L 98 -50 Z
          M 95 -45 L 95 -25 L 105 -18 L 105 -38 Z
          M 98 -32 L 98 -12 L 109 -3 L 109 -23 Z
          M 94 -18 L 94 2 L 107 12 L 107 -8 Z
          M 85 -5 L 85 15 L 100 28 L 100 8 Z
          M 72 10 L 72 30 L 88 44 L 88 24 Z
          M 55 25 L 55 45 L 72 60 L 72 40 Z
          M 35 40 L 35 60 L 50 76 L 50 56 Z
          M 10 55 L 10 75 L 24 92 L 24 72 Z
        " fill="#164e63" stroke="#38bdf8" stroke-width="1.75" stroke-linejoin="round" />

        <!-- Stepped Drive Hub Cylinder -->
        <ellipse cx="0" cy="-20" rx="38" ry="20" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <path d="M -38 -20 L -38 10 A 38 20 0 0 0 38 10 L 38 -20 Z" fill="#075985" stroke="#38bdf8" stroke-width="2" />
        <ellipse cx="0" cy="10" rx="38" ry="20" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3" />

        <!-- D-Shaft Bore -->
        <path d="M -14 -24 A 16 9 0 0 1 14 -24 L 14 -16 L -14 -16 Z" fill="#030712" stroke="#4ade80" stroke-width="1.75" />

        <!-- Anti-Split Stress-Relief Gusset -->
        <path d="M 0 -16 L 45 -40 L 0 5 Z" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,2" />
      </g>

      <!-- Technical Callouts -->
      <g font-family="'JetBrains Mono', monospace" font-size="10">
        <text x="75" y="80" fill="#38bdf8" font-weight="700">REINFORCED INVOLUTE SECTOR TEETH</text>
        <line x1="280" y1="85" x2="380" y2="150" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="380" cy="150" r="3" fill="#38bdf8" />

        <text x="50" y="270" fill="#4ade80" font-weight="700">CALIBRATED D-SHAFT BORE (+0.15mm)</text>
        <line x1="225" y1="262" x2="290" y2="215" stroke="#4ade80" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="290" cy="215" r="3" fill="#4ade80" />
      </g>

      ${getTitleBlock(part, 'ISOMETRIC 3D', w, h)}
    </svg>
  `;

  // Top-Down (Plan XY)
  const topId = 'subaru-top';
  const topDown = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Top-Down Plan View">
      ${getCommonDefs(topId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${topId})" />

      <!-- Centerlines -->
      <line x1="80" y1="180" x2="520" y2="180" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />
      <line x1="260" y1="40" x2="260" y2="320" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />

      <!-- Main Hub & Sector Outline -->
      <g transform="translate(260, 180)">
        <!-- Sector Pitch Circle -->
        <path d="M 0 0 L 140 -65 A 155 155 0 0 1 65 140 Z" fill="#0f2438" stroke="#38bdf8" stroke-width="2" />
        <path d="M 0 0 L 132 -61 A 145 145 0 0 1 61 132 Z" fill="none" stroke="#0284c7" stroke-width="1" stroke-dasharray="4,4" />

        <!-- Teeth Profile (Plan) -->
        <path d="
          M 140 -65 L 148 -61 L 146 -52 L 138 -55
          L 145 -48 L 152 -43 L 150 -35 L 142 -39
          L 148 -32 L 154 -27 L 152 -19 L 144 -23
          L 149 -16 L 154 -11 L 151 -3 L 143 -7
          L 147 0 L 151 5 L 147 13 L 139 9
          L 142 16 L 145 22 L 139 30 L 131 26
          L 133 33 L 135 40 L 128 47 L 120 43
          L 121 50 L 122 57 L 114 64 L 107 59
          L 106 66 L 105 73 L 96 79 L 90 74
          L 88 81 L 86 88 L 76 93 L 71 87
          L 68 94 L 65 101 L 54 105 L 50 99
        " fill="#0284c7" stroke="#38bdf8" stroke-width="1.75" />

        <!-- Hub Outer Circle -->
        <circle cx="0" cy="0" r="42" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <!-- D-Bore with Flat -->
        <path d="M -16 -16 A 22 22 0 1 1 16 -16 L 16 10 L -16 10 Z" fill="#030712" stroke="#4ade80" stroke-width="2" />
        <!-- Keyway Stop Boss -->
        <rect x="-6" y="-36" width="12" height="14" fill="#075985" stroke="#38bdf8" stroke-width="1.5" />
      </g>

      <!-- Dimension Witness Lines -->
      <g stroke="#f59e0b" stroke-width="1">
        <!-- Sector Radius Dimension -->
        <line x1="260" y1="180" x2="395" y2="105" marker-end="url(#dim-arrow-${topId})" />
        <!-- Pitch Radius Text -->
        <rect x="330" y="115" width="85" height="18" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="336" y="128" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">R 52.4 mm</text>

        <!-- Bore Diameter Dimension -->
        <line x1="260" y1="180" x2="200" y2="120" marker-end="url(#dim-arrow-${topId})" />
        <rect x="135" y="105" width="80" height="18" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="140" y="118" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">&Oslash; 14.80 mm</text>
      </g>

      ${getTitleBlock(part, 'PLAN VIEW (XY)', w, h)}
    </svg>
  `;

  // Side/Profile (Elevation XZ) with dimensional annotations
  const sideId = 'subaru-side';
  const sideProfile = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Side Profile with Dimensions">
      ${getCommonDefs(sideId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${sideId})" />

      <!-- Centerline -->
      <line x1="220" y1="30" x2="220" y2="330" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />

      <!-- Side Profile Geometry (Stepped Hub + Sector Flange) -->
      <g transform="translate(220, 190)">
        <!-- Main Hub Cylinder (Cross Section / Elevation) -->
        <rect x="-35" y="-70" width="70" height="140" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        
        <!-- Through-Bore Channel (Dashed hidden line) -->
        <line x1="-15" y1="-70" x2="-15" y2="70" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" />
        <line x1="15" y1="-70" x2="15" y2="70" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" />

        <!-- Gear Teeth Sector Plate Extrusion (Right Side) -->
        <path d="M 35 -20 L 160 -20 L 165 -15 L 165 25 L 160 30 L 35 30 Z" fill="#0f2438" stroke="#38bdf8" stroke-width="2" />
        
        <!-- Individual Gear Teeth Profile Slices on Flange Edge -->
        <rect x="155" y="-18" width="10" height="8" fill="#0284c7" stroke="#38bdf8" stroke-width="1.2" />
        <rect x="155" y="-6" width="10" height="8" fill="#0284c7" stroke="#38bdf8" stroke-width="1.2" />
        <rect x="155" y="6" width="10" height="8" fill="#0284c7" stroke="#38bdf8" stroke-width="1.2" />
        <rect x="155" y="18" width="10" height="8" fill="#0284c7" stroke="#38bdf8" stroke-width="1.2" />

        <!-- 45° Lead-in Entry Chamfer -->
        <line x1="-35" y1="-70" x2="-25" y2="-60" stroke="#f59e0b" stroke-width="1.5" />
        <line x1="35" y1="-70" x2="25" y2="-60" stroke="#f59e0b" stroke-width="1.5" />
      </g>

      <!-- Dimensional Annotation Witness Lines (Amber) -->
      <g stroke="#f59e0b" stroke-width="1">
        <!-- Total Height H: 26.0 mm -->
        <line x1="140" y1="120" x2="185" y2="120" stroke="#64748b" stroke-width="0.75" />
        <line x1="140" y1="260" x2="185" y2="260" stroke="#64748b" stroke-width="0.75" />
        <line x1="150" y1="123" x2="150" y2="257" marker-start="url(#dim-arrow-rev-${sideId})" marker-end="url(#dim-arrow-${sideId})" />
        <rect x="80" y="180" width="65" height="20" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="86" y="194" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">26.00 mm</text>

        <!-- Sector Flange Thickness t: 8.5 mm -->
        <line x1="410" y1="170" x2="435" y2="170" stroke="#64748b" stroke-width="0.75" />
        <line x1="410" y1="220" x2="435" y2="220" stroke="#64748b" stroke-width="0.75" />
        <line x1="425" y1="173" x2="425" y2="217" marker-start="url(#dim-arrow-rev-${sideId})" marker-end="url(#dim-arrow-${sideId})" />
        <rect x="432" y="186" width="62" height="18" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="438" y="199" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">8.50 mm</text>

        <!-- Hub Outer Diameter Ø 22.0 mm -->
        <line x1="185" y1="80" x2="185" y2="120" stroke="#64748b" stroke-width="0.75" />
        <line x1="255" y1="80" x2="255" y2="120" stroke="#64748b" stroke-width="0.75" />
        <line x1="188" y1="90" x2="252" y2="90" marker-start="url(#dim-arrow-rev-${sideId})" marker-end="url(#dim-arrow-${sideId})" />
        <rect x="188" y="65" width="65" height="18" fill="#0a0f1d" stroke="#38bdf8" stroke-width="0.75" rx="3" />
        <text x="194" y="78" fill="#38bdf8" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">&Oslash; 22.0 mm</text>
      </g>

      ${getTitleBlock(part, 'SIDE ELEVATION (XZ)', w, h)}
    </svg>
  `;

  return { isometric, topDown, sideProfile };
}

// ---------------------------------------------------------------------------
// 2. Whirlpool Dishwasher Wheel (W10195416)
// ---------------------------------------------------------------------------
function generateWhirlpoolWheelDrawings(part: Part) {
  const w = 600, h = 380;
  const isoId = 'whirlpool-iso';
  const topId = 'whirlpool-top';
  const sideId = 'whirlpool-side';

  const isometric = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Isometric Projection">
      ${getCommonDefs(isoId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${isoId})" />

      <g transform="translate(300, 190)">
        <!-- Wheel Outer Rim (Isometric Ellipse) -->
        <ellipse cx="0" cy="0" rx="130" ry="70" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2.5" />
        <ellipse cx="0" cy="18" rx="130" ry="70" fill="#0f2438" stroke="#0284c7" stroke-width="1.5" />
        <path d="M -130 0 L -130 18 A 130 70 0 0 0 130 18 L 130 0 Z" fill="#082f49" stroke="#38bdf8" stroke-width="2" />

        <!-- Inner Tread Channel -->
        <ellipse cx="0" cy="0" rx="105" ry="56" fill="#091b2e" stroke="#0284c7" stroke-width="1.5" />

        <!-- 4 Cross Spokes -->
        <path d="M -105 0 L -40 0 M 105 0 L 40 0" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />
        <path d="M 0 -56 L 0 -22 M 0 56 L 0 22" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />

        <!-- Center Axle Hub Boss -->
        <ellipse cx="0" cy="-6" rx="42" ry="24" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
        <ellipse cx="0" cy="8" rx="42" ry="24" fill="none" stroke="#38bdf8" stroke-width="1.5" />
        
        <!-- Cantilever Snap Retention Tab -->
        <path d="M -16 -12 L 16 -12 L 20 -35 L -20 -35 Z" fill="#042f2e" stroke="#4ade80" stroke-width="2" />
        <path d="M -12 -35 L 12 -35 L 8 -42 L -8 -42 Z" fill="#4ade80" stroke="#4ade80" stroke-width="1" />
        
        <!-- Center Axle Hole -->
        <ellipse cx="0" cy="-6" rx="16" ry="9" fill="#030712" stroke="#4ade80" stroke-width="1.5" />
      </g>

      <!-- Technical Callouts -->
      <g font-family="'JetBrains Mono', monospace" font-size="10">
        <text x="75" y="80" fill="#38bdf8" font-weight="700">REINFORCED HEAVY-DUTY PERIMETER RIM</text>
        <line x1="260" y1="85" x2="320" y2="120" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="320" cy="120" r="3" fill="#38bdf8" />

        <text x="40" y="310" fill="#4ade80" font-weight="700">DETERGENT-PROOF SNAP-LOCK AXLE BOSS</text>
        <line x1="250" y1="305" x2="300" y2="230" stroke="#4ade80" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="300" cy="230" r="3" fill="#4ade80" />
      </g>

      ${getTitleBlock(part, 'ISOMETRIC 3D', w, h)}
    </svg>
  `;

  const topDown = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Top-Down Plan View">
      ${getCommonDefs(topId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${topId})" />

      <line x1="60" y1="180" x2="540" y2="180" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />
      <line x1="280" y1="30" x2="280" y2="330" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />

      <g transform="translate(280, 180)">
        <circle cx="0" cy="0" r="120" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2.5" />
        <circle cx="0" cy="0" r="95" fill="#091b2e" stroke="#0284c7" stroke-width="1.5" />

        <!-- 4 Spokes with fillet fillets -->
        <rect x="-12" y="-95" width="24" height="190" fill="#0f2438" stroke="#38bdf8" stroke-width="1.5" />
        <rect x="-95" y="-12" width="190" height="24" fill="#0f2438" stroke="#38bdf8" stroke-width="1.5" />

        <!-- Hub and Retention Slot -->
        <circle cx="0" cy="0" r="38" fill="#075985" stroke="#38bdf8" stroke-width="2" />
        <circle cx="0" cy="0" r="18" fill="#030712" stroke="#4ade80" stroke-width="2" />
        <path d="M -8 -38 L 8 -38 L 5 -18 L -5 -18 Z" fill="#0a0f1d" stroke="#f59e0b" stroke-width="1.5" />
      </g>

      <!-- Diameter Dimensions -->
      <g stroke="#f59e0b" stroke-width="1">
        <line x1="280" y1="180" x2="385" y2="95" marker-end="url(#dim-arrow-${topId})" />
        <rect x="360" y="65" width="95" height="20" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="366" y="79" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">&Oslash; 36.50 mm</text>

        <line x1="280" y1="180" x2="220" y2="225" marker-end="url(#dim-arrow-${topId})" />
        <rect x="135" y="225" width="85" height="18" fill="#0a0f1d" stroke="#4ade80" stroke-width="0.75" rx="3" />
        <text x="140" y="238" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">&Oslash; 6.35 mm AXLE</text>
      </g>

      ${getTitleBlock(part, 'PLAN VIEW (XY)', w, h)}
    </svg>
  `;

  const sideProfile = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Side Profile with Dimensions">
      ${getCommonDefs(sideId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${sideId})" />

      <line x1="250" y1="30" x2="250" y2="330" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />

      <g transform="translate(250, 180)">
        <!-- Wheel Elevation Profile -->
        <rect x="-115" y="-14" width="230" height="28" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" rx="4" />
        
        <!-- Recessed Tread Slot -->
        <rect x="-105" y="-14" width="210" height="6" fill="#091b2e" stroke="#0284c7" stroke-width="1.2" />

        <!-- Axle Hub Cylinder Extension (Upward) -->
        <rect x="-24" y="-48" width="48" height="34" fill="#075985" stroke="#38bdf8" stroke-width="2" />
        
        <!-- Snap Catch Barbs -->
        <polygon points="-24,-48 -32,-42 -24,-36" fill="#4ade80" stroke="#4ade80" stroke-width="1" />
        <polygon points="24,-48 32,-42 24,-36" fill="#4ade80" stroke="#4ade80" stroke-width="1" />

        <!-- Axle Bore Through-Channel (Hidden Lines) -->
        <line x1="-10" y1="-48" x2="-10" y2="14" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" />
        <line x1="10" y1="-48" x2="10" y2="14" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" />
      </g>

      <!-- Annotations -->
      <g stroke="#f59e0b" stroke-width="1">
        <!-- Wheel Thickness 8.2 mm -->
        <line x1="390" y1="166" x2="420" y2="166" stroke="#64748b" stroke-width="0.75" />
        <line x1="390" y1="194" x2="420" y2="194" stroke="#64748b" stroke-width="0.75" />
        <line x1="410" y1="169" x2="410" y2="191" marker-start="url(#dim-arrow-rev-${sideId})" marker-end="url(#dim-arrow-${sideId})" />
        <rect x="420" y="172" width="62" height="18" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="426" y="185" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">8.20 mm</text>

        <!-- Total Hub Height 22.5 mm -->
        <line x1="100" y1="132" x2="145" y2="132" stroke="#64748b" stroke-width="0.75" />
        <line x1="100" y1="194" x2="145" y2="194" stroke="#64748b" stroke-width="0.75" />
        <line x1="120" y1="135" x2="120" y2="191" marker-start="url(#dim-arrow-rev-${sideId})" marker-end="url(#dim-arrow-${sideId})" />
        <rect x="52" y="155" width="62" height="18" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="58" y="168" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">22.50 mm</text>
      </g>

      ${getTitleBlock(part, 'SIDE ELEVATION (XZ)', w, h)}
    </svg>
  `;

  return { isometric, topDown, sideProfile };
}

// ---------------------------------------------------------------------------
// 3. Toyota Tundra Vent Louver Tab (55670-0C010)
// ---------------------------------------------------------------------------
function generateToyotaVentDrawings(part: Part) {
  const w = 600, h = 380;
  const isoId = 'toyota-iso', topId = 'toyota-top', sideId = 'toyota-side';

  const isometric = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Isometric Projection">
      ${getCommonDefs(isoId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${isoId})" />

      <g transform="translate(300, 180)">
        <!-- Front Beveled Finger Grip Tab -->
        <polygon points="-70,-40 70,-40 90,20 -90,20" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <polygon points="-90,20 90,20 70,55 -70,55" fill="#075985" stroke="#38bdf8" stroke-width="2" />

        <!-- Tactile Grip Serrations -->
        <line x1="-55" y1="-20" x2="55" y2="-20" stroke="#38bdf8" stroke-width="2" />
        <line x1="-65" y1="0" x2="65" y2="0" stroke="#38bdf8" stroke-width="2" />
        <line x1="-60" y1="20" x2="60" y2="20" stroke="#38bdf8" stroke-width="2" />

        <!-- Rear Slider Fork Legs -->
        <path d="M -40 55 L -40 110 L -18 110 L -18 55 Z" fill="#0f2438" stroke="#4ade80" stroke-width="2" />
        <path d="M 18 55 L 18 110 L 40 110 L 40 55 Z" fill="#0f2438" stroke="#4ade80" stroke-width="2" />

        <!-- Louver Interlock Pivot Pin Bosses -->
        <circle cx="-30" cy="95" r="5" fill="#4ade80" stroke="#4ade80" stroke-width="1" />
        <circle cx="30" cy="95" r="5" fill="#4ade80" stroke="#4ade80" stroke-width="1" />
      </g>

      <g font-family="'JetBrains Mono', monospace" font-size="10">
        <text x="80" y="80" fill="#38bdf8" font-weight="700">OEM TEXTURED FINGER GRIP (UV-RESISTANT ASA)</text>
        <line x1="280" y1="85" x2="330" y2="150" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="330" cy="150" r="3" fill="#38bdf8" />

        <text x="50" y="320" fill="#4ade80" font-weight="700">DUAL SLIDER FORK CLIPS (+0.15mm TOLERANCE)</text>
        <line x1="230" y1="315" x2="285" y2="270" stroke="#4ade80" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="285" cy="270" r="3" fill="#4ade80" />
      </g>

      ${getTitleBlock(part, 'ISOMETRIC 3D', w, h)}
    </svg>
  `;

  const topDown = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Top-Down Plan View">
      ${getCommonDefs(topId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${topId})" />

      <line x1="60" y1="180" x2="540" y2="180" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />
      <line x1="270" y1="40" x2="270" y2="320" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />

      <g transform="translate(270, 180)">
        <polygon points="-80,-45 80,-45 95,45 -95,45" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <rect x="-35" y="45" width="70" height="65" fill="#0f2438" stroke="#38bdf8" stroke-width="1.5" />
        <rect x="-12" y="65" width="24" height="45" fill="#0a0f1d" stroke="#4ade80" stroke-width="1.5" />
      </g>

      <!-- Dimensions -->
      <g stroke="#f59e0b" stroke-width="1">
        <line x1="175" y1="110" x2="175" y2="135" stroke="#64748b" stroke-width="0.75" />
        <line x1="365" y1="110" x2="365" y2="135" stroke="#64748b" stroke-width="0.75" />
        <line x1="178" y1="120" x2="362" y2="120" marker-start="url(#dim-arrow-rev-${topId})" marker-end="url(#dim-arrow-${topId})" />
        <rect x="238" y="98" width="65" height="18" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="244" y="111" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">28.50 mm</text>
      </g>

      ${getTitleBlock(part, 'PLAN VIEW (XY)', w, h)}
    </svg>
  `;

  const sideProfile = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Side Profile with Dimensions">
      ${getCommonDefs(sideId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${sideId})" />

      <g transform="translate(260, 180)">
        <path d="M -50 -25 C -20 -35 20 -35 50 -25 L 35 20 L -35 20 Z" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <path d="M -25 20 L -25 75 L -5 75 L -5 20 Z" fill="#0f2438" stroke="#4ade80" stroke-width="2" />
        <circle cx="-15" cy="60" r="4" fill="#4ade80" />
      </g>

      <!-- Dimension Height -->
      <g stroke="#f59e0b" stroke-width="1">
        <line x1="180" y1="145" x2="225" y2="145" stroke="#64748b" stroke-width="0.75" />
        <line x1="180" y1="255" x2="225" y2="255" stroke="#64748b" stroke-width="0.75" />
        <line x1="195" y1="148" x2="195" y2="252" marker-start="url(#dim-arrow-rev-${sideId})" marker-end="url(#dim-arrow-${sideId})" />
        <rect x="135" y="190" width="55" height="18" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="141" y="203" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">18.0 mm</text>
      </g>

      ${getTitleBlock(part, 'SIDE ELEVATION (XZ)', w, h)}
    </svg>
  `;

  return { isometric, topDown, sideProfile };
}

// ---------------------------------------------------------------------------
// 4. Bosch Drain Filter Handle (00605010)
// ---------------------------------------------------------------------------
function generateBoschHandleDrawings(part: Part) {
  const w = 600, h = 380;
  const isoId = 'bosch-iso', topId = 'bosch-top', sideId = 'bosch-side';

  const isometric = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Isometric Projection">
      ${getCommonDefs(isoId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${isoId})" />

      <g transform="translate(300, 190)">
        <!-- Base Ring Disc -->
        <ellipse cx="0" cy="30" rx="110" ry="45" fill="#091b2e" stroke="#0284c7" stroke-width="2" />
        
        <!-- Ergonomic High-Torque Crossbar Grip -->
        <path d="M -90 10 C -90 -40 -30 -60 0 -60 C 30 -60 90 -40 90 10 L 70 20 C 70 -20 25 -35 0 -35 C -25 -35 -70 -20 -70 20 Z" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2.5" />
        
        <!-- M4 Stainless Reinforcing Center Screw Boss -->
        <ellipse cx="0" cy="-35" rx="12" ry="6" fill="#030712" stroke="#4ade80" stroke-width="1.5" />
      </g>

      <g font-family="'JetBrains Mono', monospace" font-size="10">
        <text x="70" y="80" fill="#38bdf8" font-weight="700">SOLID ERGONOMIC TORQUE BRIDGE (PETG)</text>
        <line x1="260" y1="85" x2="310" y2="135" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="310" cy="135" r="3" fill="#38bdf8" />
      </g>

      ${getTitleBlock(part, 'ISOMETRIC 3D', w, h)}
    </svg>
  `;

  const topDown = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Top-Down Plan View">
      ${getCommonDefs(topId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${topId})" />

      <g transform="translate(280, 180)">
        <circle cx="0" cy="0" r="95" fill="#091b2e" stroke="#0284c7" stroke-width="2" />
        <rect x="-85" y="-18" width="170" height="36" rx="8" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <circle cx="0" cy="0" r="8" fill="#030712" stroke="#4ade80" stroke-width="1.5" />
      </g>

      ${getTitleBlock(part, 'PLAN VIEW (XY)', w, h)}
    </svg>
  `;

  const sideProfile = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Side Profile with Dimensions">
      ${getCommonDefs(sideId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${sideId})" />

      <g transform="translate(270, 190)">
        <rect x="-100" y="20" width="200" height="15" fill="#091b2e" stroke="#0284c7" stroke-width="2" rx="3" />
        <path d="M -75 20 C -75 -40 75 -40 75 20 Z" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
      </g>

      <!-- Height Callout -->
      <g stroke="#f59e0b" stroke-width="1">
        <line x1="140" y1="145" x2="185" y2="145" stroke="#64748b" stroke-width="0.75" />
        <line x1="140" y1="225" x2="185" y2="225" stroke="#64748b" stroke-width="0.75" />
        <line x1="155" y1="148" x2="155" y2="222" marker-start="url(#dim-arrow-rev-${sideId})" marker-end="url(#dim-arrow-${sideId})" />
        <rect x="95" y="175" width="55" height="18" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="101" y="188" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">32.0 mm</text>
      </g>

      ${getTitleBlock(part, 'SIDE ELEVATION (XZ)', w, h)}
    </svg>
  `;

  return { isometric, topDown, sideProfile };
}

// ---------------------------------------------------------------------------
// 5. Pioneer Turntable Anti-Skate Arm (WA-104)
// ---------------------------------------------------------------------------
function generatePioneerArmDrawings(part: Part) {
  const w = 600, h = 380;
  const isoId = 'pioneer-iso', topId = 'pioneer-top', sideId = 'pioneer-side';

  const isometric = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Isometric Projection">
      ${getCommonDefs(isoId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${isoId})" />

      <g transform="translate(240, 210)">
        <!-- Tonearm Hex Collar Boss -->
        <ellipse cx="0" cy="0" rx="25" ry="14" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <path d="M -25 0 L -25 28 A 25 14 0 0 0 25 28 L 25 0 Z" fill="#075985" stroke="#38bdf8" stroke-width="2" />
        <polygon points="-7,-4 7,-4 12,0 7,4 -7,4 -12,0" fill="#030712" stroke="#4ade80" stroke-width="1.5" />

        <!-- Cantilever Wire Boom Arm Extrusion -->
        <path d="M 25 10 L 170 -60 L 210 -40" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- 90° Pigtail Filament Loop -->
        <circle cx="215" cy="-38" r="14" fill="none" stroke="#4ade80" stroke-width="4" />
      </g>

      <g font-family="'JetBrains Mono', monospace" font-size="10">
        <text x="60" y="80" fill="#4ade80" font-weight="700">0.050" PRECISION ALLEN COLLAR BORE</text>
        <line x1="210" y1="85" x2="240" y2="200" stroke="#4ade80" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="240" cy="200" r="3" fill="#4ade80" />
      </g>

      ${getTitleBlock(part, 'ISOMETRIC 3D', w, h)}
    </svg>
  `;

  const topDown = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Top-Down Plan View">
      ${getCommonDefs(topId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${topId})" />

      <g transform="translate(180, 180)">
        <circle cx="0" cy="0" r="28" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <circle cx="0" cy="0" r="8" fill="#030712" stroke="#4ade80" stroke-width="1.5" />
        <line x1="28" y1="0" x2="240" y2="0" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" />
        <circle cx="255" cy="0" r="16" fill="none" stroke="#4ade80" stroke-width="4" />
      </g>

      ${getTitleBlock(part, 'PLAN VIEW (XY)', w, h)}
    </svg>
  `;

  const sideProfile = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Side Profile with Dimensions">
      ${getCommonDefs(sideId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${sideId})" />

      <g transform="translate(180, 180)">
        <rect x="-20" y="-30" width="40" height="60" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" rx="3" />
        <path d="M 20 0 L 160 0 L 200 -25" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
        <circle cx="205" cy="-25" r="8" fill="none" stroke="#4ade80" stroke-width="3" />
      </g>

      ${getTitleBlock(part, 'SIDE ELEVATION (XZ)', w, h)}
    </svg>
  `;

  return { isometric, topDown, sideProfile };
}

// ---------------------------------------------------------------------------
// 6. Ford Sunroof Track Slider Lift Arm (FL3Z-1651071-A)
// ---------------------------------------------------------------------------
function generateFordSunroofDrawings(part: Part) {
  const w = 600, h = 380;
  const isoId = 'ford-iso', topId = 'ford-top', sideId = 'ford-side';

  const isometric = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Isometric Projection">
      ${getCommonDefs(isoId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${isoId})" />

      <!-- Isometric Guide Axes -->
      <g stroke="#334155" stroke-width="0.75" stroke-dasharray="4,4">
        <line x1="300" y1="210" x2="100" y2="300" />
        <line x1="300" y1="210" x2="500" y2="300" />
        <line x1="300" y1="210" x2="300" y2="50" />
      </g>

      <!-- Isometric 3D Solid Model: Sunroof Track Slider Lift Arm -->
      <g transform="translate(300, 205)">
        <!-- Lower Extruded Aluminum Track Channel Guide Runner -->
        <polygon points="-160,20 120,-90 150,-78 -130,32" fill="#091b2e" stroke="#0284c7" stroke-width="1.5" />
        <polygon points="-160,20 -130,32 -130,48 -160,36" fill="#0b1728" stroke="#0284c7" stroke-width="1.5" />
        <polygon points="-130,32 150,-78 150,-62 -130,48" fill="#0c4a6e" stroke="#0284c7" stroke-width="1.5" />

        <!-- Reinforced Nylon PA12 Slider Body Block -->
        <polygon points="-140,10 80,-80 110,-68 -110,22" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <polygon points="-140,10 -110,22 -110,36 -140,24" fill="#075985" stroke="#38bdf8" stroke-width="2" />
        <polygon points="-110,22 110,-68 110,-54 -110,36" fill="#0f2438" stroke="#38bdf8" stroke-width="2" />

        <!-- Angled Cam Lift Arm (Rises towards rear at 28°) -->
        <polygon points="-60,-15 40,-55 90,-115 -10,-75" fill="#075985" stroke="#38bdf8" stroke-width="2" />
        <polygon points="-10,-75 90,-115 105,-108 5,-68" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />

        <!-- Upper Glass Bracket Platform -->
        <polygon points="5,-68 105,-108 140,-95 40,-55" fill="#0f2438" stroke="#38bdf8" stroke-width="2" />

        <!-- Torx T25 Fastener Retention Bores -->
        <ellipse cx="35" cy="-66" rx="8" ry="4" fill="#030712" stroke="#4ade80" stroke-width="1.75" />
        <ellipse cx="85" cy="-90" rx="8" ry="4" fill="#030712" stroke="#4ade80" stroke-width="1.75" />

        <!-- Cable Carrier Drive Carriage Snap-Hook Boss -->
        <rect x="-135" y="8" width="22" height="18" rx="2" fill="#030712" stroke="#f59e0b" stroke-width="1.75" />
        <circle cx="-124" cy="17" r="4" fill="#f59e0b" />
      </g>

      <!-- Technical Annotations -->
      <g font-family="'JetBrains Mono', monospace" font-size="10">
        <text x="60" y="75" fill="#38bdf8" font-weight="700">REINFORCED NYLON PA12 LIFT ARM (HEAT DEFLECTION &gt;140&deg;C)</text>
        <line x1="260" y1="80" x2="340" y2="120" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="340" cy="120" r="3" fill="#38bdf8" />

        <text x="50" y="325" fill="#4ade80" font-weight="700">DUAL TORX T25 GLASS MOUNTING BOSSES</text>
        <line x1="240" y1="320" x2="360" y2="140" stroke="#4ade80" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="360" cy="140" r="3" fill="#4ade80" />

        <text x="330" y="270" fill="#f59e0b" font-weight="700">CABLE CARRIER DRIVE HOOK (+0.15mm)</text>
        <line x1="325" y1="265" x2="200" y2="225" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="200" cy="225" r="3" fill="#f59e0b" />
      </g>

      ${getTitleBlock(part, 'ISOMETRIC 3D', w, h)}
    </svg>
  `;

  const topDown = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Top-Down Plan View">
      ${getCommonDefs(topId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${topId})" />

      <!-- Centerlines -->
      <line x1="50" y1="180" x2="550" y2="180" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />
      <line x1="300" y1="40" x2="300" y2="320" stroke="#64748b" stroke-width="0.8" stroke-dasharray="14,3,2,3" />

      <!-- Plan View of Slider Arm -->
      <g transform="translate(300, 180)">
        <!-- Lower Track Guide Channel Silhouette -->
        <rect x="-210" y="-18" width="420" height="36" fill="#091b2e" stroke="#0284c7" stroke-width="1.5" rx="3" />
        <!-- Main Lift Arm Body -->
        <rect x="-180" y="-14" width="360" height="28" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" rx="4" />
        <!-- Glass Mount Pad -->
        <rect x="20" y="-12" width="140" height="24" fill="#0f2438" stroke="#38bdf8" stroke-width="1.5" rx="3" />

        <!-- Torx T25 Holes -->
        <circle cx="45" cy="0" r="5.5" fill="#030712" stroke="#4ade80" stroke-width="1.75" />
        <circle cx="135" cy="0" r="5.5" fill="#030712" stroke="#4ade80" stroke-width="1.75" />

        <!-- Forward Cam Pivot Guide Pin -->
        <circle cx="-150" cy="0" r="6" fill="#030712" stroke="#f59e0b" stroke-width="1.75" />
      </g>

      <!-- Dimension Lines: Total Length -->
      <g stroke="#f59e0b" stroke-width="1">
        <line x1="120" y1="110" x2="120" y2="160" stroke="#64748b" stroke-width="0.75" />
        <line x1="480" y1="110" x2="480" y2="160" stroke="#64748b" stroke-width="0.75" />
        <line x1="123" y1="125" x2="477" y2="125" marker-start="url(#dim-arrow-rev-${topId})" marker-end="url(#dim-arrow-${topId})" />
        <rect x="260" y="113" width="80" height="20" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="268" y="127" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">182.50 mm</text>
      </g>

      <!-- Dimension: Torx Hole Spacing -->
      <g stroke="#4ade80" stroke-width="1">
        <line x1="345" y1="205" x2="345" y2="245" stroke="#64748b" stroke-width="0.75" />
        <line x1="435" y1="205" x2="435" y2="245" stroke="#64748b" stroke-width="0.75" />
        <line x1="348" y1="230" x2="432" y2="230" marker-start="url(#dim-arrow-rev-${topId})" marker-end="url(#dim-arrow-${topId})" />
        <rect x="362" y="220" width="60" height="18" fill="#0a0f1d" stroke="#4ade80" stroke-width="0.75" rx="3" />
        <text x="368" y="233" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="700">90.00 mm</text>
      </g>

      ${getTitleBlock(part, 'PLAN VIEW (XY)', w, h)}
    </svg>
  `;

  const sideProfile = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Side Profile with Dimensions">
      ${getCommonDefs(sideId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${sideId})" />

      <g transform="translate(300, 190)">
        <!-- Horizontal Base Guide Rail -->
        <rect x="-200" y="20" width="400" height="15" fill="#091b2e" stroke="#0284c7" stroke-width="1.5" rx="2" />
        <!-- Angled Cam Ramp Lift Arm Profile -->
        <path d="M -180 20 L -60 20 L 40 -35 L 140 -35 L 140 -15 L 60 -15 L -40 20 Z" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <!-- Forward Pivot Pin Boss -->
        <circle cx="-150" cy="15" r="7" fill="#030712" stroke="#f59e0b" stroke-width="1.75" />
        <!-- Rear Cable Hook Boss -->
        <rect x="120" y="10" width="20" height="16" rx="3" fill="#030712" stroke="#4ade80" stroke-width="1.75" />
      </g>

      <!-- Height Dimension -->
      <g stroke="#f59e0b" stroke-width="1">
        <line x1="80" y1="150" x2="340" y2="150" stroke="#64748b" stroke-width="0.75" />
        <line x1="80" y1="210" x2="100" y2="210" stroke="#64748b" stroke-width="0.75" />
        <line x1="90" y1="153" x2="90" y2="207" marker-start="url(#dim-arrow-rev-${sideId})" marker-end="url(#dim-arrow-${sideId})" />
        <rect x="58" y="172" width="65" height="18" fill="#0a0f1d" stroke="#f59e0b" stroke-width="0.75" rx="3" />
        <text x="64" y="185" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">38.50 mm</text>
      </g>

      ${getTitleBlock(part, 'SIDE ELEVATION (XZ)', w, h)}
    </svg>
  `;

  return { isometric, topDown, sideProfile };
}

// ---------------------------------------------------------------------------
// 7. Generic Mechanical Part Drawing (for any newly ingested JSON part)
// ---------------------------------------------------------------------------
function generateGenericMechanicalDrawings(part: Part) {
  const w = 600, h = 380;
  const isoId = 'generic-iso', topId = 'generic-top', sideId = 'generic-side';

  const isometric = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Isometric Projection">
      ${getCommonDefs(isoId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${isoId})" />

      <g transform="translate(300, 190)">
        <!-- Prismatic Solid Block with Center Bore -->
        <polygon points="-80,-40 60,-90 120,-30 -20,20" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <polygon points="-80,-40 -20,20 -20,80 -80,20" fill="#075985" stroke="#38bdf8" stroke-width="2" />
        <polygon points="-20,20 120,-30 120,30 -20,80" fill="#0f2438" stroke="#38bdf8" stroke-width="2" />

        <!-- Central Cylindrical Bore (Isometric) -->
        <ellipse cx="20" cy="-35" rx="30" ry="16" fill="#030712" stroke="#4ade80" stroke-width="2" />
      </g>

      <g font-family="'JetBrains Mono', monospace" font-size="10">
        <text x="80" y="80" fill="#38bdf8" font-weight="700">WATERTIGHT SOLID MESH &bull; 100% INFILL</text>
        <line x1="280" y1="85" x2="330" y2="150" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="330" cy="150" r="3" fill="#38bdf8" />
      </g>

      ${getTitleBlock(part, 'ISOMETRIC 3D', w, h)}
    </svg>
  `;

  const topDown = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Top-Down Plan View">
      ${getCommonDefs(topId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${topId})" />

      <g transform="translate(280, 180)">
        <rect x="-90" y="-60" width="180" height="120" rx="8" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <circle cx="0" cy="0" r="32" fill="#030712" stroke="#4ade80" stroke-width="2" />
        <circle cx="-60" cy="-35" r="7" fill="#0a0f1d" stroke="#f59e0b" stroke-width="1.5" />
        <circle cx="60" cy="-35" r="7" fill="#0a0f1d" stroke="#f59e0b" stroke-width="1.5" />
        <circle cx="-60" cy="35" r="7" fill="#0a0f1d" stroke="#f59e0b" stroke-width="1.5" />
        <circle cx="60" cy="35" r="7" fill="#0a0f1d" stroke="#f59e0b" stroke-width="1.5" />
      </g>

      ${getTitleBlock(part, 'PLAN VIEW (XY)', w, h)}
    </svg>
  `;

  const sideProfile = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="tech-blueprint-svg" role="img" aria-label="${part.title} Side Profile with Dimensions">
      ${getCommonDefs(sideId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${sideId})" />

      <g transform="translate(280, 180)">
        <rect x="-90" y="-30" width="180" height="60" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
        <line x1="-32" y1="-30" x2="-32" y2="30" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" />
        <line x1="32" y1="-30" x2="32" y2="30" stroke="#4ade80" stroke-width="1.5" stroke-dasharray="4,3" />
      </g>

      ${getTitleBlock(part, 'SIDE ELEVATION (XZ)', w, h)}
    </svg>
  `;

  return { isometric, topDown, sideProfile };
}

/**
 * Generates an Inline Technical Blueprint SVG for a Repair Guide Step.
 * If step has custom svg_code, that is prioritized.
 * Otherwise, synthesizes a dark-mode CAD blueprint diagram illustrating the action.
 */
export function generateStepBlueprintSvg(step: GuideStep, part: Part, stepIndex: number): string {
  if (step.svg_code) {
    return step.svg_code;
  }

  const w = 600, h = 300;
  const uniqueId = `step-svg-${part.slug}-${step.step_number}`;
  const textLower = (step.title + ' ' + step.text).toLowerCase();

  // Determine Action Type
  let actionCategory: 'pry' | 'extract' | 'clean' | 'install' | 'lube' | 'test' = 'install';
  if (/pry|release|unclip|pop|screwdriver/i.test(textLower)) {
    actionCategory = 'pry';
  } else if (/extract|pull|slide off|remove|back out/i.test(textLower)) {
    actionCategory = 'extract';
  } else if (/clean|wipe|inspect|vinegar|residue/i.test(textLower)) {
    actionCategory = 'clean';
  } else if (/grease|lubricat|oil|white lithium/i.test(textLower)) {
    actionCategory = 'lube';
  } else if (/test|verify|cycle|spin|motion/i.test(textLower)) {
    actionCategory = 'test';
  }

  let actionGraphic = '';
  let actionPillText = 'PROCEDURAL FITMENT';
  let actionColor = '#38bdf8';

  switch (actionCategory) {
    case 'pry':
      actionPillText = 'ACTION: LEVERAGE & CLIP RELEASE';
      actionColor = '#f59e0b';
      actionGraphic = `
        <!-- Pry Wedge Vector -->
        <g transform="translate(300, 140)">
          <!-- Retaining Frame / Socket -->
          <rect x="-80" y="-40" width="160" height="80" fill="#091b2e" stroke="#334155" stroke-width="2" rx="4" />
          <!-- Retention Snap Tab -->
          <path d="M -15 -40 L 15 -40 L 25 -10 L -25 -10 Z" fill="#0f2438" stroke="#38bdf8" stroke-width="2" />
          <!-- Pry Tool Blade Wedge (Amber) -->
          <polygon points="-70,45 -10,-15 5,-15 -55,55" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.5" />
          <!-- Dynamic Force Arrow -->
          <path d="M -85 70 Q -65 10 -25 -15" fill="none" stroke="#f59e0b" stroke-width="3" marker-end="url(#dim-arrow-${uniqueId})" />
          <text x="-120" y="90" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">APPLY GENTLE LEVERAGE</text>
        </g>
      `;
      break;

    case 'extract':
      actionPillText = 'ACTION: AXIAL COMPONENT EXTRACTION';
      actionColor = '#f59e0b';
      actionGraphic = `
        <!-- Extraction Motion -->
        <g transform="translate(300, 140)">
          <!-- Drive Spline Shaft -->
          <rect x="-100" y="-12" width="70" height="24" fill="#1e293b" stroke="#64748b" stroke-width="2" />
          <!-- Broken Component Unseating -->
          <rect x="0" y="-35" width="80" height="70" rx="6" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
          <!-- Linear Pull Arrow (Amber) -->
          <line x1="90" y1="0" x2="160" y2="0" stroke="#f59e0b" stroke-width="3.5" marker-end="url(#dim-arrow-${uniqueId})" />
          <text x="100" y="-14" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">WITHDRAWAL VECTOR</text>
        </g>
      `;
      break;

    case 'clean':
      actionPillText = 'ACTION: CAVITY CLEANOUT & CONTACT PREP';
      actionColor = '#4ade80';
      actionGraphic = `
        <!-- Cleanout Reticle -->
        <g transform="translate(300, 140)">
          <circle cx="0" cy="0" r="55" fill="#0f2438" stroke="#334155" stroke-width="2" />
          <circle cx="0" cy="0" r="42" fill="none" stroke="#4ade80" stroke-width="2" stroke-dasharray="8,4" />
          <!-- Crosshairs -->
          <line x1="-65" y1="0" x2="65" y2="0" stroke="#4ade80" stroke-width="1.5" />
          <line x1="0" y1="-65" x2="0" y2="65" stroke="#4ade80" stroke-width="1.5" />
          <circle cx="0" cy="0" r="8" fill="#4ade80" />
          <text x="-65" y="80" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">VERIFY ZERO DEBRIS / SCALE</text>
        </g>
      `;
      break;

    case 'lube':
      actionPillText = 'ACTION: FRICTION-REDUCTION LUBRICATION';
      actionColor = '#f59e0b';
      actionGraphic = `
        <g transform="translate(300, 140)">
          <!-- Gear Teeth / Shaft Hub -->
          <circle cx="0" cy="0" r="45" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
          <!-- Grease Droplets -->
          <circle cx="-15" cy="-15" r="7" fill="#f59e0b" />
          <circle cx="20" cy="-10" r="9" fill="#f59e0b" />
          <circle cx="5" cy="20" r="8" fill="#f59e0b" />
          <text x="-80" y="75" fill="#f59e0b" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">COAT MATING FLANKS (WHITE LITHIUM)</text>
        </g>
      `;
      break;

    case 'test':
      actionPillText = 'ACTION: 360&deg; TRAVEL & CLEARANCE TEST';
      actionColor = '#4ade80';
      actionGraphic = `
        <g transform="translate(300, 140)">
          <circle cx="0" cy="0" r="50" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
          <!-- Radial Rotation Sweep Arrow -->
          <path d="M -65 0 A 65 65 0 1 1 65 0" fill="none" stroke="#4ade80" stroke-width="3" marker-end="url(#action-arrow-${uniqueId})" />
          <text x="-75" y="80" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">CONFIRM ZERO BINDING / SMOOTH TRAVEL</text>
        </g>
      `;
      break;

    case 'install':
    default:
      actionPillText = 'ACTION: PRESS-FIT ENGAGEMENT (+0.15mm)';
      actionColor = '#4ade80';
      actionGraphic = `
        <g transform="translate(300, 140)">
          <!-- Mating Base -->
          <rect x="-70" y="15" width="140" height="30" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="2" />
          <!-- Reproduction Part Seating -->
          <rect x="-50" y="-55" width="100" height="60" rx="6" fill="#0c4a6e" stroke="#38bdf8" stroke-width="2" />
          <!-- Downward Alignment Vector -->
          <line x1="0" y1="-75" x2="0" y2="-20" stroke="#4ade80" stroke-width="3" marker-end="url(#action-arrow-${uniqueId})" />
          <text x="-80" y="70" fill="#4ade80" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="700">ALIGN SPLINE &bull; PRESS UNTIL FULLY SEATED</text>
        </g>
      `;
      break;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" class="step-blueprint-svg" role="img" aria-label="Step ${step.step_number}: ${step.title}">
      ${getCommonDefs(uniqueId)}
      <rect width="100%" height="100%" fill="#0a0f1d" />
      <rect width="100%" height="100%" fill="url(#grid-${uniqueId})" />

      <!-- Step Header Bar inside SVG -->
      <g transform="translate(15, 25)">
        <rect x="0" y="0" width="${w - 30}" height="26" fill="#0f172a" stroke="#1e293b" stroke-width="1" rx="4" />
        <rect x="0" y="0" width="70" height="26" fill="${actionColor}" rx="4" />
        <text x="12" y="17" fill="#000" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="800">STEP ${String(step.step_number).padStart(2, '0')}</text>
        <text x="80" y="17" fill="#f8fafc" font-family="'Inter', sans-serif" font-size="10.5" font-weight="700">${step.title.toUpperCase()}</text>
        <text x="${w - 45}" y="17" fill="${actionColor}" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="700">${actionPillText}</text>
      </g>

      ${actionGraphic}

      <!-- Bottom Watermark & Spec -->
      <g transform="translate(20, ${h - 15})">
        <text x="0" y="0" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="8">BAREBONES 3D TECHNICAL GUIDE &bull; ${part.oem_part_number} &bull; ${part.material_spec}</text>
      </g>
    </svg>
  `;
}
