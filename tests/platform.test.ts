import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';

import {
  createNodeSqliteAdapter,
  getPartById,
  getPartBySlug,
  getAllActiveParts,
  getGuideByPartId,
  createOrder,
  updateOrderStatus,
  createFulfillment,
  updateFulfillmentStatus
} from '../src/lib/db.ts';

import {
  formatIsoDuration,
  generateHowToSchema,
  generateProductSchema
} from '../src/lib/seo.ts';

import {
  createCheckoutSession,
  verifyStripeSignature,
  generateStripeSignatureHeader
} from '../src/lib/stripe.ts';

import {
  MockFulfillmentProvider,
  normalizeSlant3DMaterial,
  getFulfillmentProvider
} from '../src/lib/fulfillment/index.ts';

import {
  isCommercialLicenseAllowed,
  extractOemPartNumber,
  extractMakeAndModel,
  parseToolsAndSteps,
  buildPartAndGuideFromIngest
} from '../src/lib/ingest.ts';

import { searchAndRankCandidates } from '../scripts/discover.ts';
import { renderGuideHtml } from '../src/templates/guideTemplate.ts';
import { renderCatalogHtml } from '../src/templates/catalogTemplate.ts';
import { generateLlmsTxt, generateLlmsFullTxt, generatePartMarkdown } from '../src/lib/llms.ts';
import { generateOpenApiSpec } from '../src/lib/openapi.ts';
import { onRequestPost as handleMcpPost } from '../functions/api/mcp.ts';
import type { EnvBindings } from '../src/types/database.ts';

let testCount = 0;
async function it(name: string, fn: () => void | Promise<void>) {
  testCount++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    throw err;
  }
}

async function runPlatformTests() {
  console.log('\n🧪 [Barebones 3D] Running Platform & E-Commerce Test Suite...\n');

  const ROOT_DIR = process.cwd();
  const sqlite = new DatabaseSync(':memory:');
  const db = createNodeSqliteAdapter(sqlite);

  // -------------------------------------------------------------
  // Test Suite 1: Database Migrations & Schema
  // -------------------------------------------------------------
  console.log('--- Test Suite 1: D1 Database Migrations & Schema ---');
  
  await it('Applies 0001_initial_schema.sql and creates all tables', async () => {
    const schemaSql = fs.readFileSync(path.join(ROOT_DIR, 'migrations', '0001_initial_schema.sql'), 'utf8');
    await db.execScript(schemaSql);

    const tables = await db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('parts', 'guides', 'orders', 'fulfillments')"
    );
    const tableNames = tables.map(t => t.name);
    assert.ok(tableNames.includes('parts'), 'Missing parts table');
    assert.ok(tableNames.includes('guides'), 'Missing guides table');
    assert.ok(tableNames.includes('orders'), 'Missing orders table');
    assert.ok(tableNames.includes('fulfillments'), 'Missing fulfillments table');
  });

  await it('Applies 0002_seed_parts.sql and populates catalog', async () => {
    const seedSql = fs.readFileSync(path.join(ROOT_DIR, 'migrations', '0002_seed_parts.sql'), 'utf8');
    await db.execScript(seedSql);

    const parts = await getAllActiveParts(db);
    assert.strictEqual(parts.length >= 5, true, 'Expected at least 5 seed parts');
  });

  await it('Resolves commercial and non-commercial parts by slug', async () => {
    const subaru = await getPartBySlug(db, 'subaru-blend-door-actuator-gear-72131-fg000');
    assert.ok(subaru, 'Subaru part not found');
    assert.strictEqual(subaru!.oem_part_number, '72131-FG000');
    assert.strictEqual(subaru!.is_commercial_allowed, true);
    assert.strictEqual(subaru!.retail_price_cents, 1699);
    assert.strictEqual(subaru!.material_spec, 'Nylon PA12');

    const pioneer = await getPartBySlug(db, 'pioneer-turntable-anti-skate-arm-wa-104');
    assert.ok(pioneer, 'Pioneer non-commercial part not found');
    assert.strictEqual(pioneer!.is_commercial_allowed, false);
    assert.strictEqual(pioneer!.license_type, 'CC BY-NC 4.0');
    assert.strictEqual(pioneer!.retail_price_cents, 0);
  });

  await it('Retrieves guide with tools, steps, and FAQ for a part', async () => {
    const subaru = await getPartBySlug(db, 'subaru-blend-door-actuator-gear-72131-fg000');
    const guide = await getGuideByPartId(db, subaru!.id);
    assert.ok(guide, 'Guide not found');
    assert.strictEqual(guide!.tools_needed.length >= 4, true);
    assert.strictEqual(guide!.steps.length >= 5, true);
    assert.strictEqual(guide!.faq.length >= 3, true);
  });

  // -------------------------------------------------------------
  // Test Suite 2: SEO Schema Architecture
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 2: SEO Schema Architecture (HowTo & Product) ---');

  await it('Generates valid ISO 8601 durations', () => {
    assert.strictEqual(formatIsoDuration('45 mins'), 'PT45M');
    assert.strictEqual(formatIsoDuration('15-30 minutes'), 'PT30M');
    assert.strictEqual(formatIsoDuration('2 hours'), 'PT2H');
  });

  await it('Generates valid Schema.org HowTo structured data', async () => {
    const subaru = (await getPartBySlug(db, 'subaru-blend-door-actuator-gear-72131-fg000'))!;
    const guide = (await getGuideByPartId(db, subaru.id))!;
    const howTo = generateHowToSchema(subaru, guide, 'https://barebones3d.com');

    assert.strictEqual(howTo['@type'], 'HowTo');
    assert.strictEqual(howTo.totalTime, 'PT45M');
    assert.strictEqual(howTo.tool.length, guide.tools_needed.length);
    assert.strictEqual(howTo.step.length, guide.steps.length);
    assert.strictEqual(howTo.step[0].name, 'Lower Dash & Glovebox Removal');
  });

  await it('Generates valid Schema.org Product structured data', async () => {
    const subaru = (await getPartBySlug(db, 'subaru-blend-door-actuator-gear-72131-fg000'))!;
    const product = generateProductSchema(subaru, 'https://barebones3d.com');

    assert.strictEqual(product['@type'], 'Product');
    assert.strictEqual(product.mpn, '72131-FG000');
    assert.strictEqual(product.offers.price, '16.99');
    assert.strictEqual(product.offers.priceCurrency, 'USD');
    assert.strictEqual(product.offers.availability, 'https://schema.org/InStock');

    const pioneer = (await getPartBySlug(db, 'pioneer-turntable-anti-skate-arm-wa-104'))!;
    const pioneerProduct = generateProductSchema(pioneer, 'https://barebones3d.com');
    assert.strictEqual(pioneerProduct.offers.availability, 'https://schema.org/OutOfStock');
  });

  // -------------------------------------------------------------
  // Test Suite 3: Stripe Checkout & License Restrictions
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 3: Stripe Checkout & License Restrictions ---');

  await it('Creates mock checkout session for commercial part with automatic tax and shipping collection', async () => {
    const subaru = (await getPartBySlug(db, 'subaru-blend-door-actuator-gear-72131-fg000'))!;
    const session = await createCheckoutSession({
      part: subaru,
      siteUrl: 'https://barebones3d.com',
      isMock: true
    });

    assert.ok(session.sessionId.startsWith('cs_test_mock_'), 'Expected mock session ID');
    assert.ok(session.url.includes('/order-success?session_id='), 'Expected redirect URL to order success');
  });

  await it('Strictly rejects checkout session creation for Non-Commercial license', async () => {
    const pioneer = (await getPartBySlug(db, 'pioneer-turntable-anti-skate-arm-wa-104'))!;
    let threw = false;
    try {
      await createCheckoutSession({
        part: pioneer,
        siteUrl: 'https://barebones3d.com',
        isMock: true
      });
    } catch (err: any) {
      threw = true;
      assert.ok(err.message.includes('Commercial reproduction is not permitted'));
    }
    assert.strictEqual(threw, true, 'Did not reject non-commercial checkout');
  });

  // -------------------------------------------------------------
  // Test Suite 4: Web Crypto Stripe Signature Verification
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 4: Web Crypto Stripe Signature Verification ---');

  await it('Verifies valid Stripe webhook signatures using Web Crypto HMAC SHA-256', async () => {
    const payload = JSON.stringify({ id: 'evt_test_123', type: 'checkout.session.completed' });
    const secret = 'whsec_test_secret_key_1234567890';
    const timestamp = Math.floor(Date.now() / 1000);

    const sigHeader = await generateStripeSignatureHeader(payload, secret, timestamp);
    const isValid = await verifyStripeSignature(payload, sigHeader, secret, 300);

    assert.strictEqual(isValid, true, 'Valid signature was rejected');
  });

  await it('Rejects tampered payload or incorrect webhook secret', async () => {
    const payload = JSON.stringify({ id: 'evt_test_123', type: 'checkout.session.completed' });
    const secret = 'whsec_test_secret_key_1234567890';
    const sigHeader = await generateStripeSignatureHeader(payload, secret);

    const tamperedPayload = payload.replace('evt_test_123', 'evt_hacked_999');
    const isTamperedValid = await verifyStripeSignature(tamperedPayload, sigHeader, secret, 300);
    assert.strictEqual(isTamperedValid, false, 'Tampered payload was accepted');

    const isWrongSecretValid = await verifyStripeSignature(payload, sigHeader, 'whsec_wrong_secret', 300);
    assert.strictEqual(isWrongSecretValid, false, 'Wrong secret was accepted');
  });

  // -------------------------------------------------------------
  // Test Suite 5: Fulfillment Pipeline & Slant 3D Adapter
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 5: Fulfillment Pipeline & Slant 3D Adapter ---');

  await it('Normalizes materials for Slant 3D manufacturing specs', () => {
    assert.strictEqual(normalizeSlant3DMaterial('Nylon PA12'), 'Nylon');
    assert.strictEqual(normalizeSlant3DMaterial('Automotive ASA'), 'ASA');
    assert.strictEqual(normalizeSlant3DMaterial('Food-Safe PETG'), 'PETG');
    assert.strictEqual(normalizeSlant3DMaterial('High-Heat Polycarbonate'), 'Polycarbonate');
  });

  await it('Submits order to MockFulfillmentProvider and returns tracking status', async () => {
    const provider = new MockFulfillmentProvider();
    const result = await provider.submitOrder({
      orderId: 'ord_test_01',
      customerEmail: 'customer@example.com',
      shippingAddress: {
        name: 'Jane Doe',
        line1: '123 Main St',
        city: 'Charlotte',
        state: 'NC',
        postalCode: '28202',
        country: 'US'
      },
      partId: 'part_subaru_blend_door_72131',
      partTitle: 'Subaru HVAC Blend Door Actuator Split Gear',
      oemPartNumber: '72131-FG000',
      materialSpec: 'Nylon PA12',
      stlUrl: 'https://assets.barebones3d.com/parts/subaru-blend-door-gear-72131-fg000.stl',
      quantity: 1
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.provider, 'mock');
    assert.ok(result.podJobId.startsWith('mock_s3d_'));

    const status = await provider.checkOrderStatus(result.podJobId);
    assert.strictEqual(status.status, 'submitted');
    assert.ok(status.trackingNumber?.startsWith('1Z999BB3D'));
    assert.strictEqual(status.carrier, 'UPS Ground');
  });

  await it('Records order and fulfillment in database end-to-end', async () => {
    const orderId = `ord_test_e2e_${Date.now()}`;
    await createOrder(db, {
      id: orderId,
      stripe_session_id: 'cs_test_e2e_session',
      stripe_customer_email: 'buyer@example.com',
      part_id: 'part_subaru_blend_door_72131',
      amount_total_cents: 1699,
      shipping_name: 'Buyer Name',
      shipping_address: {
        line1: '456 Oak Rd',
        city: 'Raleigh',
        state: 'NC',
        postal_code: '27601',
        country: 'US'
      },
      status: 'paid'
    });

    const fulId = `ful_test_e2e_${Date.now()}`;
    await createFulfillment(db, {
      id: fulId,
      order_id: orderId,
      pod_provider: 'slant3d',
      pod_job_id: 's3d_job_998877',
      tracking_number: '1Z9999999999999999',
      carrier: 'UPS',
      status: 'submitted'
    });

    await updateOrderStatus(db, orderId, 'routed_to_pod');

    const orders = await db.query<any>('SELECT * FROM orders WHERE id = ?', [orderId]);
    assert.strictEqual(orders[0].status, 'routed_to_pod');

    const fuls = await db.query<any>('SELECT * FROM fulfillments WHERE id = ?', [fulId]);
    assert.strictEqual(fuls[0].pod_job_id, 's3d_job_998877');
    assert.strictEqual(fuls[0].tracking_number, '1Z9999999999999999');
  });

  // -------------------------------------------------------------
  // Test Suite 6: Ingestion & Discovery Engine
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 6: Ingestion & Discovery Engine ---');

  await it('License validator correctly classifies commercial vs non-commercial licenses', () => {
    assert.strictEqual(isCommercialLicenseAllowed('CC BY 4.0'), true);
    assert.strictEqual(isCommercialLicenseAllowed('CC BY-SA 4.0'), true);
    assert.strictEqual(isCommercialLicenseAllowed('CC0 1.0 Universal'), true);
    assert.strictEqual(isCommercialLicenseAllowed('MIT'), true);
    assert.strictEqual(isCommercialLicenseAllowed('CC BY-NC 4.0'), false);
    assert.strictEqual(isCommercialLicenseAllowed('CC BY-NC-SA 3.0'), false);
    assert.strictEqual(isCommercialLicenseAllowed('Creative Commons Non-Commercial'), false);
  });

  await it('Extracts OEM numbers and vehicle makes from text descriptions', () => {
    const text1 = 'This replaces broken Subaru Impreza 2008-2014 blend door actuator split gear OEM #72131-FG000.';
    assert.strictEqual(extractOemPartNumber(text1), '72131-FG000');

    const makes1 = extractMakeAndModel(text1);
    assert.strictEqual(makes1[0].make, 'Subaru');
    assert.strictEqual(makes1[0].year_start, 2008);
    assert.strictEqual(makes1[0].year_end, 2014);

    const text2 = 'Dishwasher wheel for Whirlpool W10195416 lower rack.';
    assert.strictEqual(extractOemPartNumber(text2), 'W10195416');
  });

  await it('Parses tools and steps from text', () => {
    const desc = `
      Required tools:
      Phillips screwdriver and plastic pry tool.
      Step 1: Release lower dashboard screws.
      Step 2: Unplug the 5-pin wire connector.
      Step 3: Press new gear onto D-shaft.
    `;
    const { tools, steps } = parseToolsAndSteps(desc);
    assert.strictEqual(tools.some(t => t.name.includes('Phillips')), true);
    assert.strictEqual(tools.some(t => t.name.includes('Pry')), true);
    assert.strictEqual(steps.length, 3);
    assert.strictEqual(steps[0].text, 'Release lower dashboard screws.');
  });

  await it('Builds complete Part and Guide objects from ingested data', () => {
    const { part, guide } = buildPartAndGuideFromIngest({
      title: 'BMW E46 Sunroof Clips',
      author: 'BavarianPrecision',
      description: 'Replaces OEM #54107134072 for BMW 3-Series.\nStep 1: Drop headliner.\nStep 2: Swap clip.',
      licenseType: 'CC BY 4.0',
      sourceUrl: 'https://www.printables.com/model/18294-bmw-e46-sunroof-clips',
      suggestedMakesModels: [],
      materialSpec: 'Automotive ASA',
      suggestedPriceCents: 1599
    });

    assert.strictEqual(part.oem_part_number, '54107134072');
    assert.strictEqual(part.is_commercial_allowed, true);
    assert.strictEqual(part.retail_price_cents, 1599);
    assert.strictEqual(guide.steps.length, 2);
  });

  await it('Discovery search filters only commercial candidates and excludes NC models', () => {
    const candidates = searchAndRankCandidates('');
    assert.strictEqual(candidates.length > 0, true);
    for (const cand of candidates) {
      assert.strictEqual(isCommercialLicenseAllowed(cand.license), true, `Non-commercial candidate leaked: ${cand.license}`);
    }
  });

  // -------------------------------------------------------------
  // Test Suite 7: HTML Guide & Catalog Renderers
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 7: HTML Guide & Catalog Renderers ---');

  await it('Renders full guide HTML with dual action box, schemas, and disclaimers', async () => {
    const subaru = (await getPartBySlug(db, 'subaru-blend-door-actuator-gear-72131-fg000'))!;
    const guide = (await getGuideByPartId(db, subaru.id))!;
    const html = renderGuideHtml(subaru, guide, 'https://barebones3d.com');

    assert.ok(html.includes('HowTo'), 'Missing HowTo schema');
    assert.ok(html.includes('Product'), 'Missing Product schema');
    assert.ok(html.includes('Download Free STL'), 'Missing Free STL button');
    assert.ok(html.includes('Order Reproduction Part'), 'Missing Buy button for commercial part');
    assert.ok(html.includes('Legal &amp; Aftermarket Reproduction Disclaimer'), 'Missing legal disclaimer');
  });

  await it('Renders non-commercial guide HTML with Digital STL Only and disabled buy button', async () => {
    const pioneer = (await getPartBySlug(db, 'pioneer-turntable-anti-skate-arm-wa-104'))!;
    const guide = (await getGuideByPartId(db, pioneer.id))!;
    const html = renderGuideHtml(pioneer, guide, 'https://barebones3d.com');

    assert.ok(html.includes('Digital STL Only (Non-Commercial)'), 'Missing Non-Commercial badge');
    assert.ok(!html.includes('Order Reproduction Part &bull;'), 'Buy button should NOT be present on non-commercial part');
  });

  await it('Renders catalog index HTML with search bar and filter tabs', async () => {
    const parts = await getAllActiveParts(db);
    const items = await Promise.all(parts.map(async part => ({
      part,
      guide: await getGuideByPartId(db, part.id)
    })));

    const html = renderCatalogHtml(items, 'https://barebones3d.com');
    assert.ok(html.includes('Obsolete OEM Replacement Parts &amp; Repair Guides'), 'Missing catalog title');
    assert.ok(html.includes('filter-search'), 'Missing search input');
    assert.ok(html.includes('All Parts'), 'Missing filter tab');
  });

  // -------------------------------------------------------------
  // Test Suite 8: LLM-Native Endpoints, Content Negotiation & MCP Tooling
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 8: LLM-Native Endpoints, Content Negotiation & MCP Tooling ---');

  await it('Generates compliant /llms.txt specification', async () => {
    const parts = await getAllActiveParts(db);
    const llmsTxt = generateLlmsTxt(parts, 'https://barebones3d.com');

    assert.ok(llmsTxt.startsWith('# barebones3d.com'), 'Must start with H1 title');
    assert.ok(
      llmsTxt.includes('> Open-source repair tutorials, downloadable 3D CAD files, and reproduction engineering prints for obsolete OEM hardware.'),
      'Missing required blockquote'
    );
    assert.ok(llmsTxt.includes('## Obsolete Replacement Parts Catalog'), 'Missing catalog section');
    assert.ok(llmsTxt.includes('72131-FG000'), 'Missing OEM part number');
    assert.ok(llmsTxt.includes('Subaru Impreza'), 'Missing compatible make/model');
    assert.ok(llmsTxt.includes('Nylon PA12'), 'Missing material specification');
    assert.ok(llmsTxt.includes('$16.99'), 'Missing price display');
    assert.ok(llmsTxt.includes('https://barebones3d.com/guides/subaru-blend-door-actuator-gear-72131-fg000'), 'Missing guide link');
    assert.ok(llmsTxt.includes('## Developer & Agent Interfaces'), 'Missing Developer & Agent Interfaces section');
    assert.ok(llmsTxt.includes('https://barebones3d.com/api/openapi.json'), 'Missing OpenAPI link');
    assert.ok(llmsTxt.includes('https://barebones3d.com/api/mcp'), 'Missing MCP endpoint link');
    assert.ok(llmsTxt.includes('Accept: text/markdown'), 'Missing markdown negotiation documentation');
  });

  await it('Generates comprehensive /llms-full.txt including all guides', async () => {
    const parts = await getAllActiveParts(db);
    const guidesMap = new Map();
    for (const p of parts) {
      const g = await getGuideByPartId(db, p.id);
      if (g) guidesMap.set(p.id, g);
    }
    const fullTxt = generateLlmsFullTxt(parts, guidesMap, 'https://barebones3d.com');

    assert.ok(fullTxt.includes('# barebones3d.com'), 'Missing header');
    assert.ok(fullTxt.includes('## Obsolete Replacement Parts Catalog'), 'Missing catalog summary');
    assert.ok(fullTxt.includes('Complete Published Repair Guides & Engineering Manifest'), 'Missing full guides header');
    assert.ok(fullTxt.includes('Primary OEM Part #:'), 'Missing OEM cross-references');
    assert.ok(fullTxt.includes('Required Tools & Supplies'), 'Missing tools needed list');
    assert.ok(fullTxt.includes('Step-by-Step Installation Procedure'), 'Missing step instructions');
    assert.ok(fullTxt.includes('Open-Source Attribution & Safety Disclaimer'), 'Missing license attribution');
  });

  await it('Generates clean unstyled Markdown with YAML frontmatter', async () => {
    const subaru = (await getPartBySlug(db, 'subaru-blend-door-actuator-gear-72131-fg000'))!;
    const guide = (await getGuideByPartId(db, subaru.id))!;
    const md = generatePartMarkdown(subaru, guide, 'https://barebones3d.com');

    assert.ok(md.startsWith('---'), 'Markdown must start with YAML frontmatter fence');
    assert.ok(md.includes(`title: "${subaru.title}"`), 'Missing frontmatter title');
    assert.ok(md.includes('oem_part_number: "72131-FG000"'), 'Missing frontmatter oem');
    assert.ok(md.includes('material: "Nylon PA12"'), 'Missing frontmatter material');
    assert.ok(md.includes('price_cents: 1699'), 'Missing frontmatter price');
    assert.ok(md.includes('download_stl_url: "https://barebones3d.com/assets/stl/subaru-blend-door-actuator-gear-72131-fg000.stl"'), 'Missing frontmatter download url');
    assert.ok(md.includes('checkout_api_url: "https://barebones3d.com/api/checkout/create"'), 'Missing frontmatter checkout api url');
    assert.ok(md.includes('## Required Tools & Supplies'), 'Missing Required Tools in markdown');
    assert.ok(md.includes('## Step-by-Step Installation Procedure'), 'Missing Step-by-Step in markdown');
    assert.ok(md.includes('## Open-Source Attribution & Safety Disclaimer'), 'Missing licensing section in markdown');

    // Also test non-commercial part frontmatter
    const pioneer = (await getPartBySlug(db, 'pioneer-turntable-anti-skate-arm-wa-104'))!;
    const pioneerGuide = (await getGuideByPartId(db, pioneer.id))!;
    const pioneerMd = generatePartMarkdown(pioneer, pioneerGuide, 'https://barebones3d.com');
    assert.ok(pioneerMd.includes('price_cents: null'), 'Non-commercial part price must be null');
    assert.ok(pioneerMd.includes('checkout_api_url: null'), 'Non-commercial checkout api url must be null');
  });

  await it('Generates valid OpenAPI 3.1.0 specification', () => {
    const spec = generateOpenApiSpec('https://barebones3d.com');
    assert.strictEqual(spec.openapi, '3.1.0');
    assert.ok(spec.info && spec.info.title.includes('Barebones 3D'));
    assert.ok(spec.paths['/api/parts/search']);
    assert.ok(spec.paths['/api/checkout/create']);
    assert.ok(spec.paths['/api/mcp']);
    assert.strictEqual(spec.paths['/api/parts/search'].get.parameters[0].name, 'q');
  });

  await it('MCP endpoint handles initialize, ping, tools/list, and tool execution', async () => {
    const mockEnv = {
      DB: db,
      SITE_URL: 'https://barebones3d.com',
      STRIPE_SECRET_KEY: 'sk_test_mock_12345'
    } as unknown as EnvBindings;

    // 1. initialize
    const initReq = new Request('https://barebones3d.com/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' })
    });
    const initRes = await handleMcpPost({ request: initReq, env: mockEnv });
    assert.strictEqual(initRes.status, 200);
    const initData = await initRes.json() as any;
    assert.strictEqual(initData.result.protocolVersion, '2024-11-05');
    assert.strictEqual(initData.result.serverInfo.name, 'barebones3d-mcp-server');

    // 2. tools/list
    const listReq = new Request('https://barebones3d.com/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' })
    });
    const listRes = await handleMcpPost({ request: listReq, env: mockEnv });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json() as any;
    const toolNames = listData.result.tools.map((t: any) => t.name);
    assert.ok(toolNames.includes('find_obsolete_part'));
    assert.ok(toolNames.includes('generate_purchase_link'));

    // 3. tools/call: find_obsolete_part
    const searchCallReq = new Request('https://barebones3d.com/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'find_obsolete_part',
          arguments: { query: '72131-FG000' }
        }
      })
    });
    const searchRes = await handleMcpPost({ request: searchCallReq, env: mockEnv });
    assert.strictEqual(searchRes.status, 200);
    const searchData = await searchRes.json() as any;
    assert.strictEqual(searchData.result.isError, false);
    const searchContent = searchData.result.content[0].text;
    assert.ok(searchContent.includes('72131-FG000'));
    assert.ok(searchContent.includes('Subaru'));
    assert.ok(searchContent.includes('Nylon PA12'));

    // 4. tools/call: generate_purchase_link (Non-commercial part protection)
    const ncPurchaseReq = new Request('https://barebones3d.com/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'generate_purchase_link',
          arguments: { part_id: 'pioneer-turntable-anti-skate-arm-wa-104' }
        }
      })
    });
    const ncRes = await handleMcpPost({ request: ncPurchaseReq, env: mockEnv });
    const ncData = await ncRes.json() as any;
    assert.strictEqual(ncData.result.isError, true);
    assert.ok(ncData.result.content[0].text.includes('Non-Commercial'));
  });

  await it('Validates visual search asset alt text and schema image metadata', async () => {
    const subaru = (await getPartBySlug(db, 'subaru-blend-door-actuator-gear-72131-fg000'))!;
    const guide = (await getGuideByPartId(db, subaru.id))!;
    const html = renderGuideHtml(subaru, guide, 'https://barebones3d.com');

    // Expected alt format:
    // "Original broken plastic [Part Name] (OEM #[Number]) shown side-by-side with reinforced 3D printed [Material] reproduction."
    const expectedAlt = `Original broken plastic ${subaru.title} (OEM #${subaru.oem_part_number}) shown side-by-side with reinforced 3D printed ${subaru.material_spec} reproduction.`;
    assert.ok(html.includes(expectedAlt), `Missing required visual search alt text: ${expectedAlt}`);

    // Multimodal schema check
    const howTo = generateHowToSchema(subaru, guide, 'https://barebones3d.com');
    assert.ok(Array.isArray(howTo.image), 'HowTo image should be an array of image objects');
    assert.strictEqual(howTo.image[0].width, 1920);
    assert.strictEqual(howTo.image[0].height, 1080);
    assert.ok(howTo.image[0].caption.includes(subaru.oem_part_number));
  });

  console.log(`\n🎉 All ${testCount} Platform & E-Commerce Tests Passed Successfully!\n`);
}

runPlatformTests().catch(err => {
  console.error('\n❌ Test Suite Aborted with Error:', err);
  process.exit(1);
});
