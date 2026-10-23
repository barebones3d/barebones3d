import * as THREE from 'three';

export type PrimitiveType = 'herringbone_gear' | 'bearing_pillow_block' | 'structural_bracket';

export type BoreType = 'round' | 'd-shaft' | 'hex';
export type MountingFlangeType = 'none' | 'two-sided' | 'bottom-foot';
export type HolePatternType = 'none' | 'single' | 'two-inline' | 'four-grid';
export type ScrewSizeType = 'M3' | 'M4' | 'M5' | 'M6';
export type BearingPresetType = '608' | '624' | '688' | 'custom';

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

export interface GeneratedMeshResult {
  geometry: THREE.BufferGeometry;
  dimensions: { x: number; y: number; z: number };
  triangles: number;
  vertices: number;
  estimatedPrintWeightGrams: number; // based on 20% infill PLA (~1.24 g/cm3)
}

export const SCREW_CLEARANCE_DIAMETERS: Record<ScrewSizeType, number> = {
  M3: 3.4,
  M4: 4.5,
  M5: 5.5,
  M6: 6.6,
};

export const SCREW_COUNTERSINK_HEAD_DIAMETERS: Record<ScrewSizeType, number> = {
  M3: 6.5,
  M4: 8.5,
  M5: 10.4,
  M6: 12.4,
};

export const BEARING_PRESET_DATA: Record<Exclude<BearingPresetType, 'custom'>, { od: number; id: number; width: number; name: string }> = {
  '608': { od: 22, id: 8, width: 7, name: '608 (22mm OD × 8mm ID × 7mm W) - Skateboard / V-wheel' },
  '624': { od: 13, id: 4, width: 5, name: '624 (13mm OD × 4mm ID × 5mm W) - 3D Printer Idler' },
  '688': { od: 16, id: 8, width: 5, name: '688 (16mm OD × 8mm ID × 5mm W) - Slim Spindle / Stepper' },
};
