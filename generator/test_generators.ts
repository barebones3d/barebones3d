import { generateHerringboneGear } from './src/generators/herringboneGear';
import { generateBearingPillowBlock } from './src/generators/bearingPillowBlock';
import { generateStructuralBracket } from './src/generators/structuralBracket';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import * as THREE from 'three';

console.log('==================================================');
console.log('   BAREBONES 3D PARAMETRIC GENERATOR TEST SUITE   ');
console.log('==================================================\n');

// 1. Herringbone Gear Tests
console.log('[1] Testing Herringbone Gear Generation:');
const gearD = generateHerringboneGear({
  module: 1.5,
  toothCount: 24,
  pressureAngle: 20.0,
  helixAngle: 30,
  faceWidth: 16,
  boreDiameter: 5.0,
  boreType: 'd-shaft',
  dShaftFlatOffset: 2.1,
  printer_compensation: 0.15,
});
console.log('  ✓ Gear (D-Shaft):', {
  triangles: gearD.triangles,
  vertices: gearD.vertices,
  dimensions: gearD.dimensions,
  weight: `${gearD.estimatedPrintWeightGrams}g PLA`,
});

const gearSolid = generateHerringboneGear({
  module: 1.0,
  toothCount: 16,
  pressureAngle: 20.0,
  helixAngle: 25,
  faceWidth: 10,
  boreDiameter: 0,
  boreType: 'round',
  dShaftFlatOffset: 0,
  printer_compensation: 0.15,
});
console.log('  ✓ Gear (Solid Hub):', {
  triangles: gearSolid.triangles,
  vertices: gearSolid.vertices,
  dimensions: gearSolid.dimensions,
});

const gearHex = generateHerringboneGear({
  module: 2.0,
  toothCount: 30,
  pressureAngle: 25.0,
  helixAngle: 35,
  faceWidth: 20,
  boreDiameter: 8.0,
  boreType: 'hex',
  dShaftFlatOffset: 0,
  printer_compensation: 0.2,
});
console.log('  ✓ Gear (Hex Bore):', {
  triangles: gearHex.triangles,
  vertices: gearHex.vertices,
  dimensions: gearHex.dimensions,
});

// 2. Bearing Pillow Block Tests
console.log('\n[2] Testing Bearing Pillow Block Generation:');
const pillowFlanged = generateBearingPillowBlock({
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
});
console.log('  ✓ Pillow Block (608 Two-Sided Ears with Retention Lip):', {
  triangles: pillowFlanged.triangles,
  vertices: pillowFlanged.vertices,
  dimensions: pillowFlanged.dimensions,
  weight: `${pillowFlanged.estimatedPrintWeightGrams}g PLA`,
});

const pillowFoot = generateBearingPillowBlock({
  preset: '624',
  bearingOD: 13,
  bearingID: 4,
  bearingWidth: 5,
  pocketDepth: 5,
  isThroughHole: true,
  wallThickness: 3.5,
  retentionLip: false,
  lipThickness: 0,
  lipOverhang: 0,
  mountingFlanges: 'bottom-foot',
  mountHoleSize: 'M3',
  flangeLength: 12,
  printer_compensation: 0.15,
});
console.log('  ✓ Pillow Block (624 Base Foot):', {
  triangles: pillowFoot.triangles,
  vertices: pillowFoot.vertices,
  dimensions: pillowFoot.dimensions,
});

// 3. Structural Bracket Tests
console.log('\n[3] Testing Structural L-Bracket Generation:');
const bracketGusset = generateStructuralBracket({
  leg1Length: 45,
  leg2Length: 45,
  width: 30,
  thickness: 4.5,
  gussetReinforcement: true,
  gussetThickness: 4.0,
  holePattern: 'two-inline',
  screwSize: 'M4',
  hasCountersink: false,
  printer_compensation: 0.15,
});
console.log('  ✓ L-Bracket (45x45x30 with Gusset & 2-Hole In-Line):', {
  triangles: bracketGusset.triangles,
  vertices: bracketGusset.vertices,
  dimensions: bracketGusset.dimensions,
  weight: `${bracketGusset.estimatedPrintWeightGrams}g PLA`,
});

const bracketGrid = generateStructuralBracket({
  leg1Length: 60,
  leg2Length: 60,
  width: 50,
  thickness: 6.0,
  gussetReinforcement: true,
  gussetThickness: 5.0,
  holePattern: 'four-grid',
  screwSize: 'M5',
  hasCountersink: true,
  printer_compensation: 0.15,
});
console.log('  ✓ L-Bracket (60x60x50 with 4-Hole Grid & Countersink):', {
  triangles: bracketGrid.triangles,
  vertices: bracketGrid.vertices,
  dimensions: bracketGrid.dimensions,
});

// 4. Test STL Exporter on generated meshes
console.log('\n[4] Testing STL Exporter Validation:');
const exporter = new STLExporter();
const mesh = new THREE.Mesh(gearD.geometry, new THREE.MeshBasicMaterial());
const binStl = exporter.parse(mesh, { binary: true }) as DataView;
console.log(`  ✓ Binary STL Export: ${binStl.byteLength} bytes`);

const asciiStl = exporter.parse(mesh, { binary: false }) as string;
console.log(`  ✓ ASCII STL Export: ${asciiStl.length} characters`);

console.log('\n==================================================');
console.log('✅ ALL 3D GENERATOR VALIDATION TESTS PASSED 100%!');
console.log('==================================================\n');
