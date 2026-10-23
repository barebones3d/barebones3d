import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import {
  generateHerringboneGear,
  generateBearingPillowBlock,
  generateStructuralBracket,
  generateGT2Pulley,
  generateKnurledKnob,
  generateThreadedFastener,
  generateShaftCoupler,
  generateProjectEnclosure,
  generateStepperMount,
  generateLinearRodClamp,
  generateHoseBarb,
  generateLeadScrewNutBlock,
  generateCableChainLink,
} from './src/generators';

console.log('===============================================================');
console.log('   BAREBONES 3D PARAMETRIC GENERATOR COMPREHENSIVE TEST SUITE   ');
console.log('===============================================================\n');

const exporter = new STLExporter();

function validateMesh(name: string, res: { geometry: THREE.BufferGeometry; dimensions: any; triangles: number; vertices: number; estimatedPrintWeightGrams: number }) {
  if (!res.geometry || res.triangles <= 0 || res.vertices <= 0) {
    throw new Error(`FAIL: ${name} produced invalid mesh (triangles: ${res.triangles}, vertices: ${res.vertices})`);
  }
  if (res.dimensions.x <= 0 || res.dimensions.y <= 0 || res.dimensions.z <= 0) {
    throw new Error(`FAIL: ${name} produced non-positive dimensions: ${JSON.stringify(res.dimensions)}`);
  }
  const mesh = new THREE.Mesh(res.geometry, new THREE.MeshBasicMaterial());
  const bin = exporter.parse(mesh, { binary: true }) as DataView;
  if (!bin || bin.byteLength < 84) {
    throw new Error(`FAIL: ${name} failed binary STL export`);
  }
  console.log(`  ✓ ${name}: ${res.triangles} tris, [${res.dimensions.x} × ${res.dimensions.y} × ${res.dimensions.z} mm], ${res.estimatedPrintWeightGrams}g PLA`);
}

// 1. Herringbone Gear
console.log('[1] Testing Herringbone Gear (Math Lofted):');
validateMesh('Herringbone Gear 24T D-Shaft', generateHerringboneGear({
  module: 1.5,
  toothCount: 24,
  pressureAngle: 20.0,
  helixAngle: 30,
  faceWidth: 16,
  boreDiameter: 5.0,
  boreType: 'd-shaft',
  dShaftFlatOffset: 2.1,
  printer_compensation: 0.15,
}));

// 2. Bearing Pillow Block
console.log('\n[2] Testing Bearing Pillow Block (CSG):');
validateMesh('Pillow Block 608 Ears', generateBearingPillowBlock({
  preset: '608',
  bearingOD: 22,
  bearingID: 8,
  bearingWidth: 7,
  pocketDepth: 7,
  isThroughHole: false,
  wallThickness: 4.5,
  retentionLip: true,
  lipThickness: 1.5,
  lipOverhang: 1.0,
  mountingFlanges: 'two-sided',
  mountHoleSize: 'M4',
  flangeLength: 16,
  printer_compensation: 0.15,
}));

// 3. Structural L-Bracket
console.log('\n[3] Testing Structural L-Bracket (CSG):');
validateMesh('L-Bracket 45x45x30 Gusset', generateStructuralBracket({
  leg1Length: 45,
  leg2Length: 45,
  width: 30,
  thickness: 4.5,
  gussetReinforcement: true,
  gussetThickness: 4.0,
  holePattern: 'four-grid',
  screwSize: 'M4',
  hasCountersink: false,
  printer_compensation: 0.15,
}));

// 4. GT2 Timing Belt Pulley
console.log('\n[4] Testing GT2 Timing Belt Pulley (Math Lofted):');
validateMesh('GT2 Pulley 20T 5mm Bore', generateGT2Pulley({
  toothCount: 20,
  pitch: 2.0,
  beltWidth: 6,
  boreDiameter: 5.0,
  boreType: 'd-shaft',
  dShaftFlatOffset: 2.1,
  flangeType: 'both',
  flangeHeight: 2.0,
  flangeThickness: 1.0,
  hasHub: true,
  hubDiameter: 15.0,
  hubHeight: 6.0,
  printer_compensation: 0.15,
}));

// 5. Knurled Control Knob
console.log('\n[5] Testing Knurled Control Knob (Math Lofted):');
validateMesh('Knurled Knob Diamond 25mm', generateKnurledKnob({
  outerDiameter: 25,
  height: 18,
  knurlPattern: 'diamond',
  knurlCount: 28,
  knurlDepth: 1.0,
  hasPointer: true,
  hasSkirt: true,
  skirtDiameter: 30,
  skirtHeight: 4,
  boreDiameter: 6.0,
  boreType: 'd-shaft',
  dShaftFlatOffset: 2.5,
  boreDepth: 14,
  printer_compensation: 0.15,
}));

// 6. Threaded Fastener (Bolt & Nut)
console.log('\n[6] Testing Threaded Fasteners (Helical Sweep Lofted):');
validateMesh('M8 x 25mm Hex Bolt', generateThreadedFastener({
  fastenerType: 'bolt',
  nominalDiameter: 8,
  pitch: 1.25,
  threadLength: 25,
  headType: 'hex',
  headDiameter: 14,
  headHeight: 5.5,
  nutHeight: 6.5,
  nutWidthAcrossFlats: 13,
  printer_compensation: 0.15,
}));
validateMesh('M8 Hex Nut', generateThreadedFastener({
  fastenerType: 'nut',
  nominalDiameter: 8,
  pitch: 1.25,
  threadLength: 20,
  headType: 'hex',
  headDiameter: 14,
  headHeight: 5,
  nutHeight: 6.5,
  nutWidthAcrossFlats: 13,
  printer_compensation: 0.2,
}));

// 7. Flexible Shaft Coupler
console.log('\n[7] Testing Flexible Shaft Coupler (CSG):');
validateMesh('Coupler 5mm to 8mm Slit Clamp', generateShaftCoupler({
  outerDiameter: 20,
  length: 25,
  bore1Diameter: 5.0,
  bore2Diameter: 8.0,
  bore1Type: 'round',
  bore2Type: 'round',
  couplerStyle: 'slit-clamp',
  slitWidth: 1.2,
  clampScrewSize: 'M3',
  printer_compensation: 0.15,
}));

// 8. Electronics Project Enclosure
console.log('\n[8] Testing Project Enclosure (CSG):');
validateMesh('Project Box 80x50x30 with Standoffs', generateProjectEnclosure({
  innerLength: 80,
  innerWidth: 50,
  innerHeight: 30,
  wallThickness: 2.4,
  floorThickness: 2.0,
  cornerRadius: 4,
  lidLipHeight: 2.5,
  standoffCount: 4,
  standoffHeight: 6,
  standoffScrewSize: 'M3',
  hasCableCutout: true,
  cableCutoutWidth: 12,
  cableCutoutHeight: 8,
  printer_compensation: 0.15,
}));

// 9. NEMA Stepper Motor Mount
console.log('\n[9] Testing NEMA Stepper Mount (CSG):');
validateMesh('NEMA 17 Stepper Mount with Tension Slots', generateStepperMount({
  nemaSize: 'NEMA17',
  faceThickness: 4.5,
  baseThickness: 4.5,
  baseLength: 35,
  motorHoleType: 'slots',
  slotLength: 6,
  hasGussets: true,
  gussetThickness: 4.0,
  baseHoleCount: 2,
  baseScrewSize: 'M4',
  printer_compensation: 0.15,
}));

// 10. Linear Rod Clamp (SK/SHF)
console.log('\n[10] Testing Linear Rod Clamp (CSG):');
validateMesh('SK8 8mm Linear Rod Clamp', generateLinearRodClamp({
  rodDiameter: 8,
  mountStyle: 'horizontal-sk',
  blockHeight: 32,
  blockWidth: 42,
  blockThickness: 14,
  clampGap: 1.5,
  pinchScrewSize: 'M4',
  baseScrewSize: 'M5',
  printer_compensation: 0.15,
}));

// 11. Hose Barb & Pipe Adapter
console.log('\n[11] Testing Hose Barb Adapter (CSG):');
validateMesh('Hose Barb 8mm Coupler', generateHoseBarb({
  barbNominalID: 8,
  barbCount: 3,
  barbLength: 16,
  wallThickness: 2.0,
  connectorType: 'straight-coupler',
  secondBarbNominalID: 8,
  hexNutWidth: 15,
  hexNutThickness: 6,
  printer_compensation: 0.15,
}));

// 12. T8 Leadscrew Nut Block
console.log('\n[12] Testing T8 Leadscrew Nut Block (CSG):');
validateMesh('T8 Leadscrew Nut Block', generateLeadScrewNutBlock({
  leadScrewDia: 8,
  nutFlangeDia: 22,
  boltCircleDia: 16,
  blockWidth: 34,
  blockLength: 30,
  blockHeight: 18,
  nutScrewSize: 'M3',
  gantryScrewSize: 'M4',
  gantryHoleCount: 2,
  pocketDepth: 4.0,
  printer_compensation: 0.15,
}));

// 13. Cable Drag Chain Link
console.log('\n[13] Testing Cable Drag Chain Link (CSG):');
validateMesh('Modular Cable Chain Link 15x10mm', generateCableChainLink({
  chamberWidth: 15,
  chamberHeight: 10,
  pitch: 20,
  wallThickness: 2.0,
  pinDiameter: 4.0,
  maxBendAngle: 40,
  printer_compensation: 0.15,
}));

console.log('\n===============================================================');
console.log('✅ ALL 13 GENERATORS PASSED 100% VALIDATION & STL EXPORT TESTS!');
console.log('===============================================================\n');
