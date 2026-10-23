import * as THREE from 'three';

export type PrimitiveType =
  | 'herringbone_gear'
  | 'bearing_pillow_block'
  | 'structural_bracket'
  | 'gt2_pulley'
  | 'knurled_knob'
  | 'threaded_fastener'
  | 'shaft_coupler'
  | 'project_enclosure'
  | 'stepper_mount'
  | 'linear_rod_clamp'
  | 'hose_barb'
  | 'lead_screw_nut_block'
  | 'cable_chain_link';

export type PrimitiveCategory = 'Motion & Power' | 'Structural & Mounts' | 'Fluid & Hardware';

export interface PrimitiveMeta {
  id: PrimitiveType;
  name: string;
  category: PrimitiveCategory;
  shortDesc: string;
  isMathLofted: boolean; // uses mathematical profile + slice-lofting (herringboneGear technique)
}

export const PRIMITIVE_CATALOG: PrimitiveMeta[] = [
  {
    id: 'gt2_pulley',
    name: 'GT2 Timing Pulley',
    category: 'Motion & Power',
    shortDesc: 'Curvilinear tooth belt drive with flanges, hub, and bore',
    isMathLofted: true,
  },
  {
    id: 'herringbone_gear',
    name: 'Herringbone Gear',
    category: 'Motion & Power',
    shortDesc: 'Double-helical involute gear cancelling axial thrust',
    isMathLofted: true,
  },
  {
    id: 'shaft_coupler',
    name: 'Flexible Shaft Coupler',
    category: 'Motion & Power',
    shortDesc: 'Motor-to-leadscrew coupler with clamping flex slits',
    isMathLofted: false,
  },
  {
    id: 'knurled_knob',
    name: 'Knurled Control Knob',
    category: 'Motion & Power',
    shortDesc: 'Radial knurled dial with pointer and shaft bore',
    isMathLofted: true,
  },
  {
    id: 'lead_screw_nut_block',
    name: 'T8 Leadscrew Nut Block',
    category: 'Motion & Power',
    shortDesc: 'Z-axis anti-backlash nut housing with gantry mounts',
    isMathLofted: false,
  },
  {
    id: 'bearing_pillow_block',
    name: 'Bearing Pillow Block',
    category: 'Structural & Mounts',
    shortDesc: 'Rigid housing for 608/624/688 ball bearings',
    isMathLofted: false,
  },
  {
    id: 'structural_bracket',
    name: 'Structural L-Bracket',
    category: 'Structural & Mounts',
    shortDesc: 'Gusset-reinforced 90° frame brace with drill holes',
    isMathLofted: false,
  },
  {
    id: 'stepper_mount',
    name: 'NEMA Stepper Mount',
    category: 'Structural & Mounts',
    shortDesc: 'NEMA 14/17/23 bracket with belt tensioning slots',
    isMathLofted: false,
  },
  {
    id: 'linear_rod_clamp',
    name: 'Linear Rod Clamp',
    category: 'Structural & Mounts',
    shortDesc: 'Precision SK/SHF clamp for 8/10/12mm smooth rods',
    isMathLofted: false,
  },
  {
    id: 'cable_chain_link',
    name: 'Cable Drag Chain Link',
    category: 'Structural & Mounts',
    shortDesc: 'Interlocking wire carrier link with travel stops',
    isMathLofted: false,
  },
  {
    id: 'project_enclosure',
    name: 'Project Enclosure',
    category: 'Fluid & Hardware',
    shortDesc: 'Electronics box with PCB standoffs and wire ports',
    isMathLofted: false,
  },
  {
    id: 'threaded_fastener',
    name: 'Threaded Bolt & Nut',
    category: 'Fluid & Hardware',
    shortDesc: 'ISO 60° metric thread generator with hex drive',
    isMathLofted: true,
  },
  {
    id: 'hose_barb',
    name: 'Hose Barb & Pipe Adapter',
    category: 'Fluid & Hardware',
    shortDesc: 'Tubing connector with conical retention barbs & hex nut',
    isMathLofted: false,
  },
];

export type BoreType = 'round' | 'd-shaft' | 'hex';
export type MountingFlangeType = 'none' | 'two-sided' | 'bottom-foot';
export type HolePatternType = 'none' | 'single' | 'two-inline' | 'four-grid';
export type ScrewSizeType = 'M2' | 'M2.5' | 'M3' | 'M4' | 'M5' | 'M6' | 'M8';
export type BearingPresetType = '608' | '624' | '688' | 'custom';

// --- 1. Herringbone Gear Params ---
export interface HerringboneGearParams {
  module: number;           // 0.5 to 5.0 mm
  toothCount: number;       // 8 to 80
  pressureAngle: number;    // 14.5, 20, 25 deg
  helixAngle: number;       // 15 to 45 deg
  faceWidth: number;        // 5 to 50 mm
  boreDiameter: number;     // 0 to max root diameter mm
  boreType: BoreType;       // round, d-shaft, hex
  dShaftFlatOffset: number; // distance from shaft center to flat
  printer_compensation: number; // -0.2 to +0.4 mm
}

// --- 2. Bearing Pillow Block Params ---
export interface BearingPillowBlockParams {
  preset: BearingPresetType;
  bearingOD: number;        // mm
  bearingID: number;        // mm (through hole / shaft)
  bearingWidth: number;     // mm
  pocketDepth: number;      // mm (if < bearingWidth, partial)
  isThroughHole: boolean;   // true = full through hole for shaft
  wallThickness: number;    // 2 to 15 mm
  retentionLip: boolean;    // boolean lip on rear
  lipThickness: number;     // 0.8 to 4 mm
  lipOverhang: number;      // 0.5 to 3 mm
  mountingFlanges: MountingFlangeType; // 'none' | 'two-sided' | 'bottom-foot'
  mountHoleSize: ScrewSizeType;
  flangeLength: number;     // 10 to 40 mm
  printer_compensation: number; // -0.2 to +0.4 mm
}

// --- 3. Structural Bracket Params ---
export interface StructuralBracketParams {
  leg1Length: number;       // 15 to 150 mm (base leg)
  leg2Length: number;       // 15 to 150 mm (upright leg)
  width: number;            // 10 to 100 mm
  thickness: number;        // 2 to 15 mm (overall or default)
  leg1Thickness?: number;   // optional independent base leg thickness
  leg2Thickness?: number;   // optional independent upright leg thickness
  gussetReinforcement: boolean;
  gussetThickness: number;  // 2 to 12 mm
  holePattern: HolePatternType; // 'none' | 'single' | 'two-inline' | 'four-grid'
  screwSize: ScrewSizeType; // M3, M4, M5, M6
  hasCountersink: boolean;  // 90 deg countersink
  printer_compensation: number; // -0.2 to +0.4 mm
}

// --- 4. GT2 Timing Belt Pulley Params ---
export interface GT2PulleyParams {
  toothCount: number;       // 14 to 100 teeth
  pitch: number;            // 2.0 (GT2) or 3.0 (GT3)
  beltWidth: number;        // 6, 9, 10, 15 mm
  boreDiameter: number;     // 0 to 20 mm
  boreType: BoreType;       // round, d-shaft, hex
  dShaftFlatOffset: number; // flat chord offset
  flangeType: 'both' | 'bottom' | 'top' | 'none';
  flangeHeight: number;     // 1.0 to 3.5 mm (above tooth tips)
  flangeThickness: number;  // 0.8 to 2.5 mm
  hasHub: boolean;          // collar boss for set screws
  hubDiameter: number;      // 10 to 35 mm
  hubHeight: number;        // 4 to 15 mm
  printer_compensation: number;
}

// --- 5. Knurled Control Knob Params ---
export interface KnurledKnobParams {
  outerDiameter: number;    // 14 to 60 mm
  height: number;           // 10 to 40 mm
  knurlPattern: 'straight' | 'diamond' | 'ribbed';
  knurlCount: number;       // 16 to 64
  knurlDepth: number;       // 0.4 to 2.5 mm
  hasPointer: boolean;      // indicator notch
  hasSkirt: boolean;        // flared base skirt
  skirtDiameter: number;    // 16 to 70 mm
  skirtHeight: number;      // 2 to 8 mm
  boreDiameter: number;     // 0 to 20 mm (e.g. 6mm pot shaft)
  boreType: BoreType;
  dShaftFlatOffset: number;
  boreDepth: number;        // 0 = through-hole, >0 = blind pocket
  printer_compensation: number;
}

// --- 6. Threaded Fastener (Bolt & Nut) Params ---
export interface ThreadedFastenerParams {
  fastenerType: 'bolt' | 'nut';
  nominalDiameter: number;  // 3 to 20 mm
  pitch: number;            // 0.5 to 2.5 mm
  threadLength: number;     // 6 to 80 mm (bolt only)
  headType: 'hex' | 'socket-cap' | 'knurled-thumb';
  headDiameter: number;     // 6 to 35 mm
  headHeight: number;       // 2.5 to 14 mm
  nutHeight: number;        // 3 to 18 mm (nut only)
  nutWidthAcrossFlats: number; // 6 to 32 mm
  printer_compensation: number;
}

// --- 7. Flexible Shaft Coupler Params ---
export interface ShaftCouplerParams {
  outerDiameter: number;    // 16 to 35 mm
  length: number;           // 20 to 50 mm
  bore1Diameter: number;    // 3 to 14 mm (motor shaft, e.g. 5mm)
  bore2Diameter: number;    // 3 to 16 mm (driven shaft, e.g. 8mm)
  bore1Type: 'round' | 'd-shaft';
  bore2Type: 'round' | 'd-shaft';
  couplerStyle: 'slit-clamp' | 'spiral-beam';
  slitWidth: number;        // 1.0 to 2.5 mm
  clampScrewSize: ScrewSizeType;
  printer_compensation: number;
}

// --- 8. Electronics Project Enclosure Params ---
export interface ProjectEnclosureParams {
  innerLength: number;      // 30 to 180 mm
  innerWidth: number;       // 25 to 140 mm
  innerHeight: number;      // 15 to 90 mm
  wallThickness: number;    // 1.8 to 5.0 mm
  floorThickness: number;   // 1.8 to 4.5 mm
  cornerRadius: number;     // 0 to 10 mm
  lidLipHeight: number;     // 1.5 to 4.0 mm
  standoffCount: 0 | 2 | 4;
  standoffHeight: number;   // 3 to 12 mm
  standoffScrewSize: ScrewSizeType;
  hasCableCutout: boolean;
  cableCutoutWidth: number; // 6 to 30 mm
  cableCutoutHeight: number;// 4 to 20 mm
  printer_compensation: number;
}

// --- 9. NEMA Stepper Motor Mount Params ---
export interface StepperMountParams {
  nemaSize: 'NEMA14' | 'NEMA17' | 'NEMA23';
  faceThickness: number;    // 3 to 10 mm
  baseThickness: number;    // 3 to 10 mm
  baseLength: number;       // 20 to 60 mm
  motorHoleType: 'slots' | 'round';
  slotLength: number;       // 3 to 15 mm
  hasGussets: boolean;
  gussetThickness: number;  // 2.5 to 8 mm
  baseHoleCount: 2 | 4;
  baseScrewSize: ScrewSizeType;
  printer_compensation: number;
}

// --- 10. Linear Rod Clamp (SK/SHF Style) Params ---
export interface LinearRodClampParams {
  rodDiameter: number;      // 6, 8, 10, 12, 16, 20 mm
  mountStyle: 'horizontal-sk' | 'vertical-shf';
  blockHeight: number;      // 20 to 60 mm
  blockWidth: number;       // 30 to 80 mm
  blockThickness: number;   // 10 to 30 mm
  clampGap: number;         // 1.0 to 3.0 mm
  pinchScrewSize: ScrewSizeType;
  baseScrewSize: ScrewSizeType;
  printer_compensation: number;
}

// --- 11. Hose Barb & Pipe Adapter Params ---
export interface HoseBarbParams {
  barbNominalID: number;    // 3 to 25 mm (flexible tubing ID)
  barbCount: number;        // 2 to 6 barbs
  barbLength: number;       // 10 to 35 mm
  wallThickness: number;    // 1.4 to 4.0 mm
  connectorType: 'straight-coupler' | 'reducer' | 'flanged-bulkhead';
  secondBarbNominalID: number; // used if reducer
  hexNutWidth: number;      // wrench grip across flats
  hexNutThickness: number;  // 3 to 10 mm
  printer_compensation: number;
}

// --- 12. T8 Leadscrew Nut Block Params ---
export interface LeadScrewNutBlockParams {
  leadScrewDia: number;     // 8 mm standard
  nutFlangeDia: number;     // 22 mm standard
  boltCircleDia: number;    // 16 mm standard PCD
  blockWidth: number;       // 25 to 50 mm
  blockLength: number;      // 25 to 50 mm
  blockHeight: number;      // 14 to 35 mm
  nutScrewSize: ScrewSizeType;
  gantryScrewSize: ScrewSizeType;
  gantryHoleCount: 2 | 4;
  pocketDepth: number;      // 3 to 8 mm
  printer_compensation: number;
}

// --- 13. Cable Drag Chain Link Params ---
export interface CableChainLinkParams {
  chamberWidth: number;     // 10 to 35 mm
  chamberHeight: number;    // 8 to 25 mm
  pitch: number;            // 15 to 35 mm
  wallThickness: number;    // 1.6 to 3.2 mm
  pinDiameter: number;      // 3.0 to 6.0 mm
  maxBendAngle: number;     // 25 to 55 deg
  printer_compensation: number;
}

export interface GeneratedMeshResult {
  geometry: THREE.BufferGeometry;
  dimensions: { x: number; y: number; z: number };
  triangles: number;
  vertices: number;
  estimatedPrintWeightGrams: number; // based on 20% infill PLA (~1.24 g/cm3)
}

export const SCREW_CLEARANCE_DIAMETERS: Record<ScrewSizeType, number> = {
  M2: 2.3,
  'M2.5': 2.8,
  M3: 3.4,
  M4: 4.5,
  M5: 5.5,
  M6: 6.6,
  M8: 8.8,
};

export const SCREW_COUNTERSINK_HEAD_DIAMETERS: Record<ScrewSizeType, number> = {
  M2: 4.5,
  'M2.5': 5.5,
  M3: 6.5,
  M4: 8.5,
  M5: 10.4,
  M6: 12.4,
  M8: 16.0,
};

export const BEARING_PRESET_DATA: Record<Exclude<BearingPresetType, 'custom'>, { od: number; id: number; width: number; name: string }> = {
  '608': { od: 22, id: 8, width: 7, name: '608 (22mm OD × 8mm ID × 7mm W) - Skateboard / V-wheel' },
  '624': { od: 13, id: 4, width: 5, name: '624 (13mm OD × 4mm ID × 5mm W) - 3D Printer Idler' },
  '688': { od: 16, id: 8, width: 5, name: '688 (16mm OD × 8mm ID × 5mm W) - Slim Spindle / Stepper' },
};
