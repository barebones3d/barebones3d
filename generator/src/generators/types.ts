import * as THREE from 'three';

export type PrimitiveType =
  // Original 13 primitives
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
  | 'cable_chain_link'
  // 20 New Hobbyist & Maker primitives
  | 'bevel_gear'
  | 'timing_belt_idler'
  | 'v_slot_wheel'
  | 'flexible_beam_coupler'
  | 'worm_gear'
  | 'thumb_screw_wheel'
  | 'velocity_stack'
  | 'centrifugal_impeller'
  | 'extrusion_end_cap'
  | 't_nut_slot'
  | 'corner_cube_bracket'
  | 'ball_joint_rod_end'
  | 'servo_horn'
  | 'cable_guide_anchor'
  | 'stepper_damper_plate'
  | 'pcb_standoff_clip'
  | 'endstop_mount'
  | 'fan_duct_shroud'
  | 'spool_holder_hub'
  | 'dial_indicator_mount';

export type PrimitiveCategory =
  | 'Motion & Power'
  | 'Structural & Mounts'
  | 'Fluid & Hardware'
  | 'Electronics & Sensors'
  | 'Tools & Shop';

export interface PrimitiveMeta {
  id: PrimitiveType;
  name: string;
  category: PrimitiveCategory;
  shortDesc: string;
  isMathLofted: boolean; // uses mathematical profile + slice-lofting (herringboneGear technique)
}

export const PRIMITIVE_CATALOG: PrimitiveMeta[] = [
  // --- Motion & Power ---
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
    id: 'bevel_gear',
    name: 'Miter / Bevel Gear',
    category: 'Motion & Power',
    shortDesc: 'Conical pitch 90° transmission gear with tapered involute teeth',
    isMathLofted: true,
  },
  {
    id: 'timing_belt_idler',
    name: 'Belt Idler Pulley',
    category: 'Motion & Power',
    shortDesc: 'Crowned or smooth belt idler with dual bearing pockets',
    isMathLofted: true,
  },
  {
    id: 'v_slot_wheel',
    name: 'V-Slot Rail Wheel',
    category: 'Motion & Power',
    shortDesc: 'Precision 45° dual V-roller for 2020 extrusion linear motion',
    isMathLofted: true,
  },
  {
    id: 'worm_gear',
    name: 'Helical Worm Screw',
    category: 'Motion & Power',
    shortDesc: 'High-reduction worm screw drive with continuous helical sweep',
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
    id: 'flexible_beam_coupler',
    name: 'Helical Beam Coupler',
    category: 'Motion & Power',
    shortDesc: 'Continuous helical spring cut body accommodating axial/angular runout',
    isMathLofted: true,
  },
  {
    id: 'knurled_knob',
    name: 'Knurled Control Knob',
    category: 'Motion & Power',
    shortDesc: 'Radial knurled dial with pointer and shaft bore',
    isMathLofted: true,
  },
  {
    id: 'thumb_screw_wheel',
    name: 'Scalloped Thumb Wheel',
    category: 'Motion & Power',
    shortDesc: 'Ergonomic high-torque thumb wheel with embedded hex nut pocket',
    isMathLofted: true,
  },
  {
    id: 'servo_horn',
    name: 'Micro / RC Servo Horn',
    category: 'Motion & Power',
    shortDesc: 'Splined hub arm with linkage pin holes and retention screw recess',
    isMathLofted: false,
  },
  {
    id: 'lead_screw_nut_block',
    name: 'T8 Leadscrew Nut Block',
    category: 'Motion & Power',
    shortDesc: 'Z-axis anti-backlash nut housing with gantry mounts',
    isMathLofted: false,
  },
  {
    id: 'stepper_damper_plate',
    name: 'Stepper Damper Mount',
    category: 'Motion & Power',
    shortDesc: 'NEMA motor acoustic decoupler with flexural serpentine isolators',
    isMathLofted: false,
  },

  // --- Structural & Mounts ---
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
    id: 'corner_cube_bracket',
    name: '3-Way Corner Cube',
    category: 'Structural & Mounts',
    shortDesc: 'Rigid 3-way orthogonal 90° junction block for aluminum profiles',
    isMathLofted: false,
  },
  {
    id: 't_nut_slot',
    name: 'Drop-In Slot T-Nut',
    category: 'Structural & Mounts',
    shortDesc: 'Cam-locking roll-in nut for 2020/3030 extrusion slot channels',
    isMathLofted: false,
  },
  {
    id: 'extrusion_end_cap',
    name: 'Extrusion Profile End Cap',
    category: 'Structural & Mounts',
    shortDesc: 'Flush snap-fit protective bezel cap for 2020/3030/4040 rails',
    isMathLofted: false,
  },
  {
    id: 'ball_joint_rod_end',
    name: 'Ball Joint Rod End',
    category: 'Structural & Mounts',
    shortDesc: 'Articulating ball socket link with pinch clamp and threaded shank',
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
    id: 'cable_guide_anchor',
    name: 'Cable Guide Anchor',
    category: 'Structural & Mounts',
    shortDesc: 'Drag chain and wire harness terminating bracket with tie slots',
    isMathLofted: false,
  },

  // --- Fluid & Hardware ---
  {
    id: 'threaded_fastener',
    name: 'Threaded Bolt & Nut',
    category: 'Fluid & Hardware',
    shortDesc: 'ISO 60° metric thread generator with hex drive',
    isMathLofted: true,
  },
  {
    id: 'velocity_stack',
    name: 'Velocity Stack Air Horn',
    category: 'Fluid & Hardware',
    shortDesc: 'Aerodynamic exponential flare intake horn with mounting flange',
    isMathLofted: true,
  },
  {
    id: 'centrifugal_impeller',
    name: 'Centrifugal Impeller',
    category: 'Fluid & Hardware',
    shortDesc: 'Curved backward-inclined pump/fan rotor with shaft bore',
    isMathLofted: true,
  },
  {
    id: 'hose_barb',
    name: 'Hose Barb & Pipe Adapter',
    category: 'Fluid & Hardware',
    shortDesc: 'Tubing connector with conical retention barbs & hex nut',
    isMathLofted: false,
  },
  {
    id: 'fan_duct_shroud',
    name: 'Radial Blower Fan Duct',
    category: 'Fluid & Hardware',
    shortDesc: '5015/4010 directional cooling nozzle targeting the hotend print tip',
    isMathLofted: false,
  },

  // --- Electronics & Sensors ---
  {
    id: 'project_enclosure',
    name: 'Project Enclosure',
    category: 'Electronics & Sensors',
    shortDesc: 'Electronics box with PCB standoffs and wire ports',
    isMathLofted: false,
  },
  {
    id: 'pcb_standoff_clip',
    name: 'PCB Edge Standoff Clip',
    category: 'Electronics & Sensors',
    shortDesc: 'Snap-latch retaining clip for 1.6mm FR4 circuit boards',
    isMathLofted: false,
  },
  {
    id: 'endstop_mount',
    name: 'Optical/Micro Endstop Mount',
    category: 'Electronics & Sensors',
    shortDesc: 'Slotted microswitch bracket for calibration and homing triggers',
    isMathLofted: false,
  },

  // --- Tools & Shop ---
  {
    id: 'spool_holder_hub',
    name: 'Universal Spool Hub',
    category: 'Tools & Shop',
    shortDesc: 'Conical centering hub adapter for 50-75mm filament spools with 608 bearing',
    isMathLofted: false,
  },
  {
    id: 'dial_indicator_mount',
    name: 'Dial Indicator Clamp',
    category: 'Tools & Shop',
    shortDesc: 'Precision 8mm / 3/8" gauge stem clamp with fine-tuning arm',
    isMathLofted: false,
  },
];

export type BoreType = 'round' | 'd-shaft' | 'hex';
export type MountingFlangeType = 'none' | 'two-sided' | 'bottom-foot';
export type HolePatternType = 'none' | 'single' | 'two-inline' | 'four-grid';
export type ScrewSizeType = 'M2' | 'M2.5' | 'M3' | 'M4' | 'M5' | 'M6' | 'M8';
export type BearingPresetType = '608' | '624' | '625' | '688' | 'custom';

// =========================================================================
// Parameter Interfaces: Original 13 Components
// =========================================================================

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

// =========================================================================
// Parameter Interfaces: 20 New Hobbyist Components
// =========================================================================

// --- 14. Bevel Gear Params ---
export interface BevelGearParams {
  module: number;           // 0.8 to 4.0 mm
  toothCount: number;       // 12 to 60 teeth
  coneAngleDeg: number;     // 30 to 60 deg (45 deg = 1:1 miter gear)
  faceWidth: number;        // 6 to 25 mm
  boreDiameter: number;     // 0 to 20 mm
  boreType: BoreType;
  dShaftFlatOffset: number;
  hasHub: boolean;
  hubDiameter: number;      // 10 to 35 mm
  hubLength: number;        // 4 to 20 mm
  printer_compensation: number;
}

// --- 15. Timing Belt Idler Pulley Params ---
export interface TimingBeltIdlerParams {
  profileType: 'smooth' | 'crowned';
  pulleyDiameter: number;   // 10 to 35 mm
  beltWidth: number;        // 6 to 15 mm
  flangeHeight: number;     // 1.0 to 3.5 mm
  flangeThickness: number;  // 0.8 to 2.0 mm
  bearingPreset: BearingPresetType;
  bearingPocketDepth: number; // 4 to 8 mm
  centerRidgeThickness: number; // 1.0 to 3.0 mm
  printer_compensation: number;
}

// --- 16. V-Slot Extrusion Wheel Roller Params ---
export interface VSlotWheelParams {
  outerDiameter: number;    // 20 to 35 mm (standard 24mm)
  wheelWidth: number;       // 8 to 15 mm (standard 11mm)
  vAngleDeg: number;        // 70 to 110 deg (standard 90 deg V-groove)
  vDepth: number;           // 2.0 to 6.0 mm
  bearingPocketOD: number;  // 16 mm (625 bearing)
  bearingPocketDepth: number; // 5.0 mm standard
  centerRidgeWidth: number; // 1.0 to 2.5 mm
  printer_compensation: number;
}

// --- 17. Helical Beam Coupler Params ---
export interface FlexibleBeamCouplerParams {
  outerDiameter: number;    // 16 to 30 mm
  length: number;           // 20 to 45 mm
  bore1Diameter: number;    // 4 to 12 mm
  bore2Diameter: number;    // 4 to 14 mm
  spiralPitch: number;      // 2.5 to 6.0 mm
  spiralTurns: number;      // 2 to 5 turns
  spiralSlotWidth: number;  // 1.2 to 2.5 mm
  clampScrewSize: ScrewSizeType;
  printer_compensation: number;
}

// --- 18. Helical Worm Screw Gear Params ---
export interface WormGearParams {
  module: number;           // 0.8 to 3.0 mm
  starts: 1 | 2;            // single or double start helical thread
  length: number;           // 15 to 50 mm
  pitchDiameter: number;    // 10 to 30 mm
  boreDiameter: number;     // 3 to 12 mm
  boreType: BoreType;
  dShaftFlatOffset: number;
  printer_compensation: number;
}

// --- 19. Thumb Screw / Finger Nut Wheel Params ---
export interface ThumbScrewWheelParams {
  outerDiameter: number;    // 20 to 60 mm
  thickness: number;        // 6 to 20 mm
  lobeCount: number;        // 4 to 12 lobes
  lobeDepth: number;        // 1.0 to 5.0 mm
  nutSize: ScrewSizeType;   // M3, M4, M5, M6, M8
  pocketType: 'hex-nut' | 'socket-head';
  pocketDepth: number;      // 2.5 to 10 mm
  throughHoleDia: number;   // 3.4 to 9.0 mm
  printer_compensation: number;
}

// --- 20. Velocity Stack Air Horn Params ---
export interface VelocityStackParams {
  throatDiameter: number;   // 15 to 80 mm
  flareDiameter: number;    // 30 to 130 mm
  height: number;           // 25 to 100 mm
  wallThickness: number;    // 1.6 to 4.5 mm
  flangeType: 'round-ring' | 'oval-2bolt' | 'press-fit';
  flangeBoltSize: ScrewSizeType;
  boltCircleDia: number;
  printer_compensation: number;
}

// --- 21. Centrifugal Impeller Params ---
export interface CentrifugalImpellerParams {
  outerDiameter: number;    // 30 to 120 mm
  hubDiameter: number;      // 12 to 35 mm
  height: number;           // 8 to 35 mm
  bladeCount: number;       // 4 to 16 blades
  bladeThickness: number;   // 1.2 to 3.5 mm
  bladeAngleDeg: number;    // 20 to 60 deg backward curve
  boreDiameter: number;     // 3 to 12 mm
  boreType: BoreType;
  dShaftFlatOffset: number;
  hasBackPlate: boolean;
  backPlateThickness: number;
  printer_compensation: number;
}

// --- 22. Extrusion End Cap Params ---
export interface ExtrusionEndCapParams {
  profileSize: '2020' | '3030' | '4040' | '2040';
  capThickness: number;     // 2.0 to 6.0 mm
  prongLength: number;      // 5.0 to 15.0 mm
  bezelChamfer: number;     // 0.5 to 3.0 mm
  centerHole: boolean;
  centerHoleDiameter: number; // 4.0 to 8.0 mm
  printer_compensation: number;
}

// --- 23. Drop-In Slot T-Nut Params ---
export interface TNutSlotParams {
  slotSize: 'slot-6' | 'slot-8';
  threadSize: ScrewSizeType; // M3, M4, M5, M6
  nutLength: number;        // 10 to 25 mm
  nutWidth: number;         // 6 to 12 mm
  headHeight: number;       // 3 to 8 mm
  hasAntiRotationRidge: boolean;
  printer_compensation: number;
}

// --- 24. 3-Way Corner Cube Bracket Params ---
export interface CornerCubeBracketParams {
  cubeSize: number;         // 20 to 45 mm (e.g. 20mm for 2020)
  holeDiameter: number;     // 4.5 to 6.5 mm (M5 clearance)
  counterboreDia: number;   // 8.0 to 12.0 mm
  counterboreDepth: number; // 4.0 to 10.0 mm
  chamferRadius: number;    // 0.5 to 3.0 mm
  faceCount: 2 | 3;         // 2-way L or 3-way XYZ cube
  printer_compensation: number;
}

// --- 25. Ball Joint Rod End Params ---
export interface BallJointRodEndParams {
  ballDiameter: number;     // 8 to 22 mm
  neckDiameter: number;     // 5 to 14 mm
  shankDiameter: number;    // 8 to 18 mm
  shankLength: number;      // 12 to 40 mm
  shankThreadSize: ScrewSizeType;
  hasClampSlit: boolean;
  pinchScrewSize: ScrewSizeType;
  printer_compensation: number;
}

// --- 26. Micro / RC Servo Horn Params ---
export interface ServoHornParams {
  splineDiameter: number;   // 4.5 to 8.0 mm (25T 5.9mm standard)
  hornStyle: 'single-arm' | 'dual-arm' | 'four-star' | 'round-wheel';
  armLength: number;        // 12 to 45 mm
  armThickness: number;     // 2.0 to 5.0 mm
  hubDiameter: number;      // 8 to 16 mm
  hubHeight: number;        // 4 to 10 mm
  holeSpacing: number;      // 3 to 6 mm
  linkageHoleDia: number;   // 1.2 to 2.5 mm
  centerScrewPocketDia: number; // 4.0 to 7.0 mm
  printer_compensation: number;
}

// --- 27. Cable Guide Anchor Bracket Params ---
export interface CableGuideAnchorParams {
  anchorWidth: number;      // 16 to 45 mm
  anchorLength: number;     // 20 to 55 mm
  anchorHeight: number;     // 10 to 30 mm
  slotStyle: 'zip-tie' | 'clamp-bar' | 'chain-bracket';
  tieSlotWidth: number;     // 2.5 to 5.0 mm
  mountHoleSpacing: number; // 12 to 35 mm
  mountScrewSize: ScrewSizeType;
  hasExtrusionSlotLug: boolean;
  printer_compensation: number;
}

// --- 28. Stepper Motor Damper Mount Params ---
export interface StepperDamperPlateParams {
  nemaSize: 'NEMA17' | 'NEMA23';
  plateThickness: number;   // 6 to 14 mm
  flexureSlitWidth: number; // 1.2 to 2.5 mm
  flexureStyle: 'serpentine' | 'concentric-ring';
  motorScrewSize: ScrewSizeType;
  frameScrewSize: ScrewSizeType;
  centerBoreDia: number;    // 22 to 40 mm
  printer_compensation: number;
}

// --- 29. PCB Edge Standoff Clip Params ---
export interface PCBStandoffClipParams {
  pcbThickness: number;     // 1.0 to 2.4 mm (standard 1.6mm)
  standoffHeight: number;   // 5 to 30 mm
  clipType: 'edge-clip' | 'corner-clip' | 'through-hole-snap';
  baseDiameter: number;     // 10 to 25 mm
  baseMountType: 'm3-screw' | 'adhesive-flat';
  barbOverhang: number;     // 0.8 to 2.0 mm
  printer_compensation: number;
}

// --- 30. Optical / Mechanical Endstop Mount Params ---
export interface EndstopMountParams {
  switchType: 'omron-micro' | 'kw11-mini' | 'optical-slotted';
  mountBodyLength: number;  // 20 to 45 mm
  mountBodyWidth: number;   // 14 to 30 mm
  bodyThickness: number;    // 3.0 to 8.0 mm
  slotAdjustLength: number; // 6 to 25 mm
  extrusionMountScrew: ScrewSizeType;
  switchScrewSize: ScrewSizeType;
  hasSlotLug: boolean;
  printer_compensation: number;
}

// --- 31. Radial Blower Fan Cooling Duct Params ---
export interface FanDuctShroudParams {
  fanType: '5015-blower' | '4010-blower' | '4010-axial';
  ductLength: number;       // 25 to 65 mm
  ductAngleDeg: number;     // 25 to 60 deg down-tilt
  nozzleWidth: number;      // 10 to 30 mm
  nozzleHeight: number;     // 3 to 8 mm
  wallThickness: number;    // 1.2 to 2.5 mm
  mountTabDistance: number; // 20 to 45 mm
  mountScrewSize: ScrewSizeType;
  printer_compensation: number;
}

// --- 32. Universal Spool Hub Centering Adapter Params ---
export interface SpoolHolderHubParams {
  spoolBoreMin: number;     // 48 to 56 mm
  spoolBoreMax: number;     // 58 to 78 mm
  coneLength: number;       // 25 to 60 mm
  flangeDiameter: number;   // 65 to 90 mm
  bearingType: '608' | '624' | 'none-solid';
  axleRodDiameter: number;  // 8.0 to 16.0 mm
  printer_compensation: number;
}

// --- 33. Dial Test Indicator Clamp Params ---
export interface DialIndicatorMountParams {
  stemDiameter: number;     // 8.0 mm metric / 9.525 mm 3/8" imperial
  clampThickness: number;   // 10 to 22 mm
  clampWidth: number;       // 18 to 35 mm
  clampSlitGap: number;     // 1.2 to 2.5 mm
  pinchBoltSize: ScrewSizeType;
  mountStyle: '2020-rail-lug' | 'magnetic-base-m5' | 'rod-clamp-10mm';
  armLength: number;        // 15 to 50 mm
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
  '625': { od: 16, id: 5, width: 5, name: '625 (16mm OD × 5mm ID × 5mm W) - V-Slot Roller' },
  '688': { od: 16, id: 8, width: 5, name: '688 (16mm OD × 8mm ID × 5mm W) - Slim Spindle / Stepper' },
};
