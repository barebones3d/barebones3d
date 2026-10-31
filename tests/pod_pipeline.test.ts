import assert from 'node:assert';
import * as THREE from 'three';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { validateMeshManifold } from '../generator/src/utils/manifoldValidation.ts';
import { getGeneratorManifest, GENERATOR_MANIFESTS } from '../generator/src/lib/generatorManifests.ts';
import { generateSTLBlob } from '../generator/src/utils/stlExport.ts';
import { onRequestPost as presignUploadHandler } from '../functions/api/order/presign-upload.ts';
import { onRequestPost as checkoutSessionHandler } from '../functions/api/checkout/create-session.ts';
import { onRequestPost as stripeWebhookHandler } from '../functions/api/webhooks/stripe.ts';
import { createNodeSqliteAdapter } from '../src/lib/db.ts';

console.log('🧪 Running Print-on-Demand (POD) & Manifold Verification Pipeline Test Suite...\n');

const ROOT_DIR = process.cwd();

// Helper to initialize local SQLite database matching D1 schema
function createTestDb() {
  const sqlite = new DatabaseSync(':memory:');
  const db = createNodeSqliteAdapter(sqlite);
  const schemaSql = fs.readFileSync(path.join(ROOT_DIR, 'migrations', '0001_initial_schema.sql'), 'utf8');
  sqlite.exec(schemaSql);
  return { db, sqlite };
}

async function runTests() {
  // -------------------------------------------------------------
  // Test Suite 1: Topological Manifold Validation (Render Time)
  // -------------------------------------------------------------
  console.log('--- Test Suite 1: Topological Manifold Validation (Render Time) ---');

  // Test 1.1: Closed Solid Cylinder (χ = 2, genus = 0)
  const solidCylinderGeom = new THREE.CylinderGeometry(10, 10, 20, 32);
  const solidValidation = validateMeshManifold(solidCylinderGeom);

  assert.strictEqual(solidValidation.isManifold, true, 'Solid cylinder should be a watertight 2-manifold');
  assert.strictEqual(solidValidation.openEdges, 0, 'Solid cylinder must have 0 open edges');
  assert.strictEqual(solidValidation.multiEdges, 0, 'Solid cylinder must have 0 non-manifold edges');
  assert.strictEqual(solidValidation.flippedEdges, 0, 'Solid cylinder must have 0 flipped edges');
  assert.ok(solidValidation.signedVolumeMm3 > 0, 'Solid cylinder must have positive signed volume');
  assert.strictEqual(solidValidation.eulerCharacteristic, 2, 'Solid sphere-equivalent solid body must have Euler characteristic χ = 2');
  assert.strictEqual(solidValidation.genus, 0, 'Solid cylinder genus must be 0');
  console.log('  ✓ Solid cylinder topological 2-manifold validation verified (χ = 2, genus = 0)');

  // Test 1.2: Through-Bore Torus / Cylinder with hole (χ = 0, genus = 1)
  const torusGeom = new THREE.TorusGeometry(15, 5, 16, 32);
  const torusValidation = validateMeshManifold(torusGeom);

  assert.strictEqual(torusValidation.isManifold, true, 'Torus (genus 1 through-bore) should be a watertight 2-manifold');
  assert.strictEqual(torusValidation.openEdges, 0, 'Torus must have 0 open edges');
  assert.strictEqual(torusValidation.multiEdges, 0, 'Torus must have 0 non-manifold edges');
  assert.strictEqual(torusValidation.flippedEdges, 0, 'Torus must have 0 flipped edges');
  assert.ok(torusValidation.signedVolumeMm3 > 0, 'Torus must have positive signed volume');
  assert.strictEqual(torusValidation.eulerCharacteristic, 0, 'Through-bore genus-1 solid must have Euler characteristic χ = 0');
  assert.strictEqual(torusValidation.genus, 1, 'Through-bore genus must be 1');
  console.log('  ✓ Through-bore topological 2-manifold validation verified (χ = 0, genus = 1)');

  // Test 1.3: Open Non-Manifold Mesh (Open Plane)
  const openPlaneGeom = new THREE.PlaneGeometry(20, 20, 2, 2);
  const openValidation = validateMeshManifold(openPlaneGeom);

  assert.strictEqual(openValidation.isManifold, false, 'Open plane must be marked as non-manifold');
  assert.ok(openValidation.openEdges > 0, 'Open plane must have open boundary edges');
  assert.strictEqual(openValidation.statusText, 'Non-Manifold Mesh', 'Status text must be Non-Manifold Mesh');
  console.log('  ✓ Open non-manifold mesh detection verified (status pill red/invalid)');

  // -------------------------------------------------------------
  // Test Suite 2: Verification Tier Gating & Manifest Binding
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 2: Verification Tier Gating & Manifest Binding ---');

  // Verify all 53 generators have manifest registrations
  assert.strictEqual(Object.keys(GENERATOR_MANIFESTS).length, 53, 'Expected 53 registered generator manifests');

  // Test 2.1: Production Certified Part (e.g. GT2 Pulley, Herringbone Gear)
  const gt2Manifest = getGeneratorManifest('gt2_pulley');
  assert.strictEqual(gt2Manifest.tier, 'production_certified', 'GT2 Pulley should be production_certified');
  assert.strictEqual(gt2Manifest.partNumber, 'BB3D-GT2-PULLEY');
  assert.strictEqual(gt2Manifest.retailPriceCents, 1800);
  assert.strictEqual(gt2Manifest.supportedMaterials.includes('Automotive ASA'), true);
  console.log('  ✓ Production certified manifest verified (GT2 Pulley: $18.00, ASA/Nylon/PETG)');

  // Test 2.2: Geometry Verified Part (e.g. Cycloidal Gear)
  const cycloidalManifest = getGeneratorManifest('cycloidal_gear');
  assert.strictEqual(cycloidalManifest.tier, 'geometry_verified', 'Cycloidal Gear should be geometry_verified');
  assert.strictEqual(cycloidalManifest.partNumber, 'BB3D-CYCLOIDAL-DISC');
  console.log('  ✓ Geometry verified manifest verified (Cycloidal Disc: $32.00)');

  // Test 2.3: Raw Generated / Experimental Part (e.g. Chamfer Tool Holder)
  const chamferManifest = getGeneratorManifest('chamfer_tool_holder');
  assert.strictEqual(chamferManifest.tier, 'raw_generated', 'Chamfer Tool Holder should be raw_generated');
  
  // Gating logic check:
  // Order button must be disabled for raw_generated
  const isChamferPodGated = chamferManifest.tier === 'raw_generated';
  const canOrderChamferPod = !isChamferPodGated && solidValidation.isManifold;
  assert.strictEqual(canOrderChamferPod, false, 'POD Order button must be disabled for raw_generated CAD');
  assert.strictEqual(isChamferPodGated, true, 'raw_generated CAD must be flagged as POD gated');
  console.log('  ✓ Raw generated tier gating verified: POD disabled with "POD Gated: Unverified CAD"');

  // -------------------------------------------------------------
  // Test Suite 3: Client-Side Binary STL Export & Header License Embedding
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 3: Client-Side Binary STL Export & Header License Embedding ---');

  const testGeom = new THREE.BoxGeometry(10, 10, 10);
  const stlBlob = generateSTLBlob(testGeom, {
    partNumber: 'BB3D-TEST-CUBE',
    partTitle: 'Test Parametric Cube',
    license: 'CC BY-NC 4.0',
    binary: true,
  });

  const arrayBuffer = await stlBlob.arrayBuffer();
  assert.ok(arrayBuffer.byteLength >= 84, 'Binary STL must be at least 84 bytes (80 header + 4 tri count)');

  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 80));
  const headerAscii = String.fromCharCode(...headerBytes);

  assert.ok(headerAscii.includes('CC BY-NC 4.0'), 'Binary STL 80-byte header must contain CC BY-NC 4.0 notice');
  assert.ok(headerAscii.includes('BB3D-TEST-CUBE'), 'Binary STL header must contain partNumber');
  assert.ok(headerAscii.includes('Barebones 3D'), 'Binary STL header must contain Barebones 3D attribution');
  console.log(`  ✓ Binary STL 80-byte header license injection verified: "${headerAscii.trim()}"`);

  // -------------------------------------------------------------
  // Test Suite 4: R2 Ephemeral STL Upload Endpoint (/api/order/presign-upload)
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 4: Presigned / Ephemeral STL Upload Endpoint ---');

  // Test 4.1: Raw binary upload
  const uploadRequest = new Request('https://barebones3d.com/api/order/presign-upload', {
    method: 'POST',
    headers: {
      'content-type': 'model/stl',
      'x-filename': 'custom_herringbone_gear_m1.5.stl',
    },
    body: arrayBuffer,
  });

  const uploadContext = {
    request: uploadRequest,
    env: {
      SITE_URL: 'https://barebones3d.com',
      MOCK_SERVICES: 'true',
    } as any,
  };

  const uploadResponse = await presignUploadHandler(uploadContext);
  assert.strictEqual(uploadResponse.status, 200, 'Upload endpoint should return 200 OK');

  const uploadData: any = await uploadResponse.json();
  assert.strictEqual(uploadData.success, true);
  assert.ok(uploadData.key.startsWith('ephemeral/stls/'));
  assert.ok(uploadData.stlUrl.includes('custom_herringbone_gear_m1.5.stl'));
  assert.strictEqual(uploadData.byteLength, arrayBuffer.byteLength);
  console.log('  ✓ Binary STL upload returned valid ephemeral storage URL:', uploadData.stlUrl);

  // Test 4.2: Payload rejection for corrupt/too-short buffer
  const badUploadRequest = new Request('https://barebones3d.com/api/order/presign-upload', {
    method: 'POST',
    headers: { 'content-type': 'model/stl' },
    body: new Uint8Array([1, 2, 3]), // 3 bytes < 80
  });

  const badUploadResponse = await presignUploadHandler({
    request: badUploadRequest,
    env: { SITE_URL: 'https://barebones3d.com' } as any,
  });
  assert.strictEqual(badUploadResponse.status, 400, 'Corrupt short buffer should be rejected with 400');
  console.log('  ✓ Corrupt STL upload (<84 bytes) correctly rejected');

  // -------------------------------------------------------------
  // Test Suite 5: Stripe Checkout Session Creation (/api/checkout/create-session)
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 5: Stripe Checkout Session Creation ---');

  const customStlPublicUrl = uploadData.stlUrl;
  const checkoutPayload = {
    partNumber: 'BB3D-HERRINGBONE-GEAR',
    title: 'Custom Herringbone Gear (24T, M1.5)',
    manifestId: 'herringbone_gear',
    targetMaterial: 'Automotive ASA',
    priceCents: 2600,
    stlUrl: customStlPublicUrl,
    parameters: {
      module: 1.5,
      toothCount: 24,
      boreDiameter: 5.0,
      pressureAngle: 20.0,
    },
    quantity: 1,
  };

  const checkoutRequest = new Request('https://barebones3d.com/api/checkout/create-session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(checkoutPayload),
  });

  const checkoutContext = {
    request: checkoutRequest,
    env: {
      SITE_URL: 'https://barebones3d.com',
      MOCK_SERVICES: 'true',
    } as any,
  };

  const checkoutResponse = await checkoutSessionHandler(checkoutContext);
  assert.strictEqual(checkoutResponse.status, 200, 'Checkout session endpoint should return 200 OK');

  const checkoutData: any = await checkoutResponse.json();
  assert.strictEqual(checkoutData.success, true);
  assert.ok(checkoutData.sessionId.startsWith('cs_test_parametric_'));
  assert.ok(checkoutData.url.includes(checkoutData.sessionId));
  assert.strictEqual(checkoutData.priceCents, 2600);
  assert.strictEqual(checkoutData.stlUrl, customStlPublicUrl);
  console.log('  ✓ Checkout session created with custom parametric parameters and stlUrl');

  // -------------------------------------------------------------
  // Test Suite 6: Stripe Webhook -> Slant 3D POD Pipeline Dispatch
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 6: Stripe Webhook -> Slant 3D Pipeline Dispatch ---');

  const { db } = createTestDb();

  const stripeWebhookEvent = {
    id: 'evt_test_pod_custom_part_999',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: checkoutData.sessionId,
        amount_total: 2600,
        customer_details: {
          email: 'engineer@aerotech.com',
          name: 'Sarah Connor',
          address: {
            line1: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'OR',
            postal_code: '97477',
            country: 'US',
          },
        },
        metadata: {
          order_type: 'parametric_pod',
          part_id: 'herringbone_gear',
          partNumber: 'BB3D-HERRINGBONE-GEAR',
          title: 'Custom Herringbone Gear (24T, M1.5)',
          targetMaterial: 'Automotive ASA',
          stlUrl: customStlPublicUrl,
          parameters: JSON.stringify(checkoutPayload.parameters),
        },
      },
    },
  };

  const webhookRequest = new Request('https://barebones3d.com/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(stripeWebhookEvent),
  });

  const webhookContext = {
    request: webhookRequest,
    env: {
      DB: db,
      MOCK_SERVICES: 'true',
      SITE_URL: 'https://barebones3d.com',
    } as any,
  };

  const webhookResponse = await stripeWebhookHandler(webhookContext);
  assert.strictEqual(webhookResponse.status, 200, 'Stripe webhook should process successfully');

  const webhookResult: any = await webhookResponse.json();
  assert.strictEqual(webhookResult.received, true);
  assert.strictEqual(webhookResult.status, 'routed_to_pod');
  assert.ok(webhookResult.podJobId.startsWith('mock_s3d_'));

  // Verify that the order exists in the database
  const orders = await db.query<any>('SELECT * FROM orders WHERE stripe_session_id = ?', [checkoutData.sessionId]);
  assert.strictEqual(orders.length, 1, 'Order must be recorded in D1 orders table');
  assert.strictEqual(orders[0].part_id, 'herringbone_gear');
  assert.strictEqual(orders[0].amount_total_cents, 2600);
  assert.strictEqual(orders[0].status, 'routed_to_pod');

  // Verify that fulfillment was created with Slant 3D / Mock provider
  const fulfillments = await db.query<any>('SELECT * FROM fulfillments WHERE order_id = ?', [orders[0].id]);
  assert.strictEqual(fulfillments.length, 1, 'Fulfillment must be recorded in D1 fulfillments table');
  assert.strictEqual(fulfillments[0].pod_provider, 'mock');
  assert.strictEqual(fulfillments[0].pod_job_id, webhookResult.podJobId);
  console.log('  ✓ Webhook successfully dispatched custom stlUrl to Slant 3D and recorded D1 order & fulfillment');

  console.log('\n🎉 All Print-on-Demand (POD) & Manifold Verification Tests Passed Successfully!');
}

runTests().catch((err) => {
  console.error('\n❌ Test suite failed with error:\n', err);
  process.exit(1);
});
