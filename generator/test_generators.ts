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
  generateBevelGear,
  generateTimingBeltIdler,
  generateVSlotWheel,
  generateFlexibleBeamCoupler,
  generateWormGear,
  generateThumbScrewWheel,
  generateVelocityStack,
  generateCentrifugalImpeller,
  generateExtrusionEndCap,
  generateTNutSlot,
  generateCornerCubeBracket,
  generateBallJointRodEnd,
  generateServoHorn,
  generateCableGuideAnchor,
  generateStepperDamperPlate,
  generatePCBStandoffClip,
  generateEndstopMount,
  generateFanDuctShroud,
  generateSpoolHolderHub,
  generateDialIndicatorMount,
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

// 14. Bevel Gear
console.log('\n[14] Testing Bevel Gear (Math Lofted):');
validateMesh('Bevel Gear 20T M1.5', generateBevelGear({
  module: 1.5,
  toothCount: 20,
  coneAngleDeg: 45,
  faceWidth: 10,
  boreDiameter: 5.0,
  boreType: 'round',
  dShaftFlatOffset: 0,
  hasHub: true,
  hubDiameter: 18,
  hubLength: 8,
  printer_compensation: 0.15,
}));

// 15. Timing Belt Idler
console.log('\n[15] Testing Timing Belt Idler (Math Lofted):');
validateMesh('Timing Belt Idler 608 Crowned', generateTimingBeltIdler({
  profileType: 'crowned',
  pulleyDiameter: 18,
  beltWidth: 6,
  flangeHeight: 2.5,
  flangeThickness: 1.5,
  bearingPreset: '608',
  bearingPocketDepth: 7,
  centerRidgeThickness: 1.5,
  printer_compensation: 0.15,
}));

// 16. V-Slot Dual Angle Wheel
console.log('\n[16] Testing V-Slot Wheel (Math Lofted):');
validateMesh('V-Slot Wheel 24mm 625 Bearings', generateVSlotWheel({
  outerDiameter: 24,
  wheelWidth: 11,
  vAngleDeg: 90,
  vDepth: 3.5,
  bearingPocketOD: 16,
  bearingPocketDepth: 5.0,
  centerRidgeWidth: 1.0,
  printer_compensation: 0.15,
}));

// 17. Flexible Beam Coupler
console.log('\n[17] Testing Flexible Beam Coupler (CSG / Helical):');
validateMesh('Helical Beam Coupler 5mm to 8mm', generateFlexibleBeamCoupler({
  outerDiameter: 19,
  length: 25,
  bore1Diameter: 5,
  bore2Diameter: 8,
  spiralPitch: 4.5,
  spiralTurns: 3,
  spiralSlotWidth: 1.2,
  clampScrewSize: 'M3',
  printer_compensation: 0.15,
}));

// 18. Worm Gear Screw
console.log('\n[18] Testing Worm Gear Screw (Math Lofted):');
validateMesh('Archimedean Worm Screw M1.5', generateWormGear({
  module: 1.5,
  starts: 1,
  pitchDiameter: 18,
  length: 25,
  boreDiameter: 5,
  boreType: 'round',
  dShaftFlatOffset: 0,
  printer_compensation: 0.15,
}));

// 19. Thumb Screw Knob Wheel
console.log('\n[19] Testing Thumb Screw Wheel (Math Lofted):');
validateMesh('Ergonomic Thumb Screw M4', generateThumbScrewWheel({
  outerDiameter: 28,
  thickness: 10,
  lobeCount: 6,
  lobeDepth: 2.5,
  nutSize: 'M4',
  pocketType: 'hex-nut',
  pocketDepth: 4.0,
  throughHoleDia: 4.2,
  printer_compensation: 0.15,
}));

// 20. Velocity Stack
console.log('\n[20] Testing Velocity Stack (Math Lofted):');
validateMesh('Bellmouth Velocity Stack 30mm', generateVelocityStack({
  throatDiameter: 20,
  flareDiameter: 40,
  height: 25,
  wallThickness: 2.0,
  flangeType: 'round-ring',
  flangeBoltSize: 'M3',
  boltCircleDia: 32,
  printer_compensation: 0.15,
}));

// 21. Centrifugal Impeller
console.log('\n[21] Testing Centrifugal Impeller (CSG):');
validateMesh('Backward-Curved Centrifugal Impeller', generateCentrifugalImpeller({
  outerDiameter: 50,
  hubDiameter: 15,
  height: 12,
  bladeCount: 8,
  bladeThickness: 1.5,
  bladeAngleDeg: 35,
  boreDiameter: 5,
  boreType: 'round',
  dShaftFlatOffset: 0,
  hasBackPlate: true,
  backPlateThickness: 2.0,
  printer_compensation: 0.15,
}));

// 22. Extrusion End Cap
console.log('\n[22] Testing Extrusion End Cap (CSG):');
validateMesh('2020 Extrusion Flush End Cap', generateExtrusionEndCap({
  profileSize: '2020',
  capThickness: 3.0,
  prongLength: 8.0,
  bezelChamfer: 0.8,
  centerHole: true,
  centerHoleDiameter: 4.2,
  printer_compensation: 0.15,
}));

// 23. Roll-in T-Nut
console.log('\n[23] Testing Roll-in T-Nut (CSG):');
validateMesh('Drop-In Cam T-Nut M4', generateTNutSlot({
  slotSize: 'slot-6',
  threadSize: 'M4',
  nutLength: 12,
  nutWidth: 7,
  headHeight: 4,
  hasAntiRotationRidge: true,
  printer_compensation: 0.15,
}));

// 24. Corner Cube Junction Bracket
console.log('\n[24] Testing Corner Cube Bracket (CSG):');
validateMesh('3-Way Corner Cube 20mm M5', generateCornerCubeBracket({
  cubeSize: 20,
  holeDiameter: 5.2,
  counterboreDia: 9.5,
  counterboreDepth: 6.0,
  chamferRadius: 1.0,
  faceCount: 3,
  printer_compensation: 0.15,
}));

// 25. Ball Joint Rod End (Heim Joint)
console.log('\n[25] Testing Ball Joint Rod End (CSG):');
validateMesh('Ball Joint Rod End 10mm Cup', generateBallJointRodEnd({
  ballDiameter: 10,
  neckDiameter: 6,
  shankDiameter: 10,
  shankLength: 15,
  shankThreadSize: 'M4',
  hasClampSlit: true,
  pinchScrewSize: 'M2.5',
  printer_compensation: 0.15,
}));

// 26. RC Servo Horn
console.log('\n[26] Testing RC Servo Horn (CSG):');
validateMesh('25T Servo Horn Single Arm', generateServoHorn({
  splineDiameter: 5.9,
  hornStyle: 'single-arm',
  armLength: 24,
  armThickness: 3.0,
  hubDiameter: 12,
  hubHeight: 5,
  holeSpacing: 4.0,
  linkageHoleDia: 1.8,
  centerScrewPocketDia: 5.0,
  printer_compensation: 0.15,
}));

// 27. Cable Guide Anchor
console.log('\n[27] Testing Cable Guide Anchor (CSG):');
validateMesh('2020 Cable Guide Anchor', generateCableGuideAnchor({
  anchorWidth: 20,
  anchorLength: 25,
  anchorHeight: 14,
  slotStyle: 'zip-tie',
  tieSlotWidth: 4.5,
  mountHoleSpacing: 16,
  mountScrewSize: 'M4',
  hasExtrusionSlotLug: true,
  printer_compensation: 0.15,
}));

// 28. Stepper Vibration Damper Plate
console.log('\n[28] Testing Stepper Damper Plate (CSG):');
validateMesh('NEMA 17 Serpentine Vibration Damper', generateStepperDamperPlate({
  nemaSize: 'NEMA17',
  plateThickness: 6.0,
  flexureSlitWidth: 1.5,
  flexureStyle: 'serpentine',
  motorScrewSize: 'M3',
  frameScrewSize: 'M3',
  centerBoreDia: 23,
  printer_compensation: 0.15,
}));

// 29. PCB Standoff Edge Clip
console.log('\n[29] Testing PCB Standoff Clip (CSG):');
validateMesh('PCB Snap Clip 1.6mm FR4', generatePCBStandoffClip({
  pcbThickness: 1.6,
  standoffHeight: 8.0,
  clipType: 'edge-clip',
  baseDiameter: 14,
  baseMountType: 'm3-screw',
  barbOverhang: 1.2,
  printer_compensation: 0.15,
}));

// 30. Microswitch Endstop Mount
console.log('\n[30] Testing Microswitch Endstop Mount (CSG):');
validateMesh('Omron SS-5 Endstop Mount', generateEndstopMount({
  switchType: 'omron-micro',
  mountBodyLength: 25,
  mountBodyWidth: 16,
  bodyThickness: 4.0,
  slotAdjustLength: 12,
  extrusionMountScrew: 'M4',
  switchScrewSize: 'M2.5',
  hasSlotLug: true,
  printer_compensation: 0.15,
}));

// 31. Radial Blower Fan Duct Shroud
console.log('\n[31] Testing Radial Blower Fan Duct (CSG):');
validateMesh('5015 Radial Blower Shroud', generateFanDuctShroud({
  fanType: '5015-blower',
  ductLength: 35,
  ductAngleDeg: 45,
  nozzleWidth: 20,
  nozzleHeight: 6,
  wallThickness: 1.6,
  mountTabDistance: 32,
  mountScrewSize: 'M3',
  printer_compensation: 0.15,
}));

// 32. Universal Spool Holder Hub
console.log('\n[32] Testing Spool Holder Hub (CSG):');
validateMesh('Universal Spool Hub 50-72mm', generateSpoolHolderHub({
  spoolBoreMin: 50,
  spoolBoreMax: 72,
  coneLength: 35,
  flangeDiameter: 78,
  bearingType: '608',
  axleRodDiameter: 8.0,
  printer_compensation: 0.15,
}));

// 33. Dial Indicator Rail Mount
console.log('\n[33] Testing Dial Indicator Mount (CSG):');
validateMesh('Dial Indicator 8mm Stem Clamp', generateDialIndicatorMount({
  stemDiameter: 8.0,
  clampThickness: 14,
  clampWidth: 20,
  clampSlitGap: 1.5,
  pinchBoltSize: 'M4',
  mountStyle: '2020-rail-lug',
  armLength: 20,
  printer_compensation: 0.15,
}));

console.log('\n===============================================================');
console.log('✅ ALL 33 GENERATORS PASSED 100% VALIDATION & STL EXPORT TESTS!');
console.log('===============================================================\n');

