import assert from 'node:assert';
import {
  COMMODITY_CATALOG,
  findMatchingStandardPulley,
  buildAmazonAffiliateUrl,
} from '../src/lib/standardsCatalog.ts';
import { getContextualConsumables } from '../src/lib/consumables.ts';
import { calculateCartPricing } from '../generator/src/lib/cart.ts';
import type { CartItem } from '../generator/src/lib/cart.ts';
import { onRequestGet as getTools } from '../functions/api/v1/tools.ts';
import { onRequestPost as calcPulley } from '../functions/api/v1/parametric/pulley.ts';
import { onRequestGet as downloadPulley } from '../functions/api/v1/download/pulley.ts';
import { onRequestPost as podCheckout } from '../functions/api/pod/checkout.ts';
import { onRequestPost as mcpHandler } from '../functions/api/mcp.ts';

console.log('🧪 Running Monetization, Cart, Standards Catalog & AI Tooling Test Suite...\n');

async function runTests() {
  // --- Test Suite 1: Standards Catalog & Lookup ---
  console.log('--- Test Suite 1: Standards Catalog & Lookup ---');
  assert.strictEqual(COMMODITY_CATALOG.length, 11, 'Catalog should contain 11 standard components');

  // Exact matches
  const match16T = findMatchingStandardPulley(16, 5.0, 6.0);
  assert.ok(match16T, 'Should match GT2 16T Pulley 5mm bore 6mm belt');
  assert.strictEqual(match16T?.id, 'gt2-16t-b5-w6');
  assert.strictEqual(match16T?.estPriceUsd, 2.99);

  const match20T_8mm = findMatchingStandardPulley(20, 8.0, 6.0);
  assert.ok(match20T_8mm, 'Should match GT2 20T Pulley 8mm bore 6mm belt');
  assert.strictEqual(match20T_8mm?.estPriceUsd, 3.49);

  const match60T = findMatchingStandardPulley(60, 5.0, 6.0);
  assert.ok(match60T, 'Should match GT2 60T Pulley 5mm bore 6mm belt');
  assert.strictEqual(match60T?.estPriceUsd, 5.99);

  // Non-matching custom pulley
  const matchCustom = findMatchingStandardPulley(27, 6.35, 9.0);
  assert.strictEqual(matchCustom, null, 'Custom 27T pulley should return null');
  console.log('  ✓ Standard pulley catalog detection and tolerances verified');

  // Amazon Affiliate URL generation
  const affiliateUrl = buildAmazonAffiliateUrl('GT2 20 teeth pulley 5mm bore 6mm belt', 'custom-tag-20');
  assert.ok(affiliateUrl.includes('tag=custom-tag-20'), 'Affiliate URL must include custom tag');
  assert.ok(affiliateUrl.includes('https://www.amazon.com/s?k='), 'Affiliate URL must point to compliant Amazon search');
  console.log('  ✓ Amazon affiliate link formatting verified');

  // --- Test Suite 2: Contextual Consumables Mapping ---
  console.log('\n--- Test Suite 2: Contextual Consumables Mapping ---');
  const pulleyPills = getContextualConsumables('gt2_pulley');
  const pillLabels = pulleyPills.map(p => p.label);
  assert.ok(pillLabels.includes('M3 Grub Screws'), 'GT2 pulley must include M3 Grub Screws');
  assert.ok(pillLabels.includes('608-2RS Bearings'), 'GT2 pulley must include 608-2RS Bearings');
  assert.ok(pillLabels.includes('Fiberglass GT2 Belt (5M)'), 'GT2 pulley must include Fiberglass GT2 Belt (5M)');

  const gearPills = getContextualConsumables('herringbone_gear');
  const gearLabels = gearPills.map(p => p.label);
  assert.ok(gearLabels.includes('White Lithium Grease'), 'Gears must include White Lithium Grease');
  assert.ok(gearLabels.includes('M3/M4 Brass Heat-Set Inserts'), 'Gears must include M3/M4 Brass Heat-Set Inserts');

  const otherPills = getContextualConsumables('structural_bracket');
  const otherLabels = otherPills.map(p => p.label);
  assert.ok(otherLabels.includes('High-Strength PETG Filament'), 'Structural must include High-Strength PETG Filament');
  assert.ok(otherLabels.includes('Nylon Filament'), 'Structural must include Nylon Filament');
  console.log('  ✓ Dynamic contextual links mapped correctly for pulleys, gears, and structural parts');

  // --- Test Suite 3: Local Cart Pricing & Volume Shipping Incentives ---
  console.log('\n--- Test Suite 3: Local Cart Pricing & Volume Shipping Incentives ---');
  const emptyPricing = calculateCartPricing([]);
  assert.strictEqual(emptyPricing.itemCount, 0);
  assert.strictEqual(emptyPricing.subtotal, 0);
  assert.strictEqual(emptyPricing.shipping, 0);

  const sampleItem1: CartItem = {
    id: 'item_1',
    partName: 'GT2 Pulley 20T',
    partType: 'gt2_pulley',
    parametricConfig: { teeth: 20, boreMm: 5 },
    unitPriceUsd: 8.50,
    createdAt: Date.now()
  };

  const sampleItem2: CartItem = {
    id: 'item_2',
    partName: 'Herringbone Gear M1.5',
    partType: 'herringbone_gear',
    parametricConfig: { module: 1.5, teeth: 24 },
    unitPriceUsd: 8.50,
    createdAt: Date.now()
  };

  // Single item pricing: flat $5.99 shipping, 0 savings
  const singlePricing = calculateCartPricing([sampleItem1]);
  assert.strictEqual(singlePricing.itemCount, 1);
  assert.strictEqual(singlePricing.subtotal, 8.50);
  assert.strictEqual(singlePricing.shipping, 5.99);
  assert.strictEqual(singlePricing.shippingSavings, 0);
  assert.strictEqual(singlePricing.total, 14.49);

  // Multi-item bundle pricing: consolidated $5.99 shipping, ~$5.50 savings per extra part
  const multiPricing = calculateCartPricing([sampleItem1, sampleItem2]);
  assert.strictEqual(multiPricing.itemCount, 2);
  assert.strictEqual(multiPricing.subtotal, 17.00);
  assert.strictEqual(multiPricing.shipping, 5.99, 'Second item adds $0 extra shipping');
  assert.strictEqual(multiPricing.shippingSavings, 5.50, 'Saves $5.50 on consolidated shipping');
  assert.strictEqual(multiPricing.total, 22.99);
  console.log('  ✓ Consolidated shipping calculation and volume bundling incentives verified');

  // --- Test Suite 4: /api/pod/checkout Handler ---
  console.log('\n--- Test Suite 4: /api/pod/checkout Handler ---');
  const checkoutReq = new Request('https://barebones3d.com/api/pod/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [sampleItem1, sampleItem2],
      destination: { country: 'US' }
    })
  });

  const checkoutRes = await podCheckout({
    request: checkoutReq,
    env: {
      SITE_URL: 'https://barebones3d.com',
      MOCK_SERVICES: 'true'
    } as any
  });

  assert.strictEqual(checkoutRes.status, 200);
  const checkoutData: any = await checkoutRes.json();
  assert.ok(checkoutData.success, 'Checkout response should indicate success');
  assert.ok(checkoutData.url.includes('/order-success?session_id='), 'Mock checkout should return order-success redirect');
  assert.strictEqual(checkoutData.pricing.partsSubtotal, 17.00);
  assert.strictEqual(checkoutData.pricing.shipping, 5.99);
  console.log('  ✓ POD checkout endpoint creates session with consolidated pricing');

  // --- Test Suite 5: AI & MCP Endpoints ---
  console.log('\n--- Test Suite 5: AI & MCP Endpoints ---');

  // 1. GET /api/v1/tools
  const toolsRes = await getTools({ request: new Request('https://barebones3d.com/api/v1/tools') });
  assert.strictEqual(toolsRes.status, 200);
  const toolsData: any = await toolsRes.json();
  assert.ok(Array.isArray(toolsData.tools));
  const calcTool = toolsData.tools.find((t: any) => t.name === 'calc_gt2_pulley');
  assert.ok(calcTool, 'calc_gt2_pulley tool must be registered in /api/v1/tools');
  assert.ok(calcTool.parameters.properties.teeth);
  assert.ok(calcTool.parameters.properties.bore_mm);
  console.log('  ✓ GET /api/v1/tools returns token-efficient JSON schema');

  // 2. POST /api/v1/parametric/pulley (Valid Standard Match)
  const calcReq = new Request('https://barebones3d.com/api/v1/parametric/pulley', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teeth: 20, bore_mm: 5, belt_width_mm: 6 })
  });
  const calcRes = await calcPulley({ request: calcReq, env: {} });
  assert.strictEqual(calcRes.status, 200);
  const calcData: any = await calcRes.json();
  assert.strictEqual(calcData.valid, true);
  assert.strictEqual(calcData.pitch_dia_mm, 12.73);
  assert.strictEqual(calcData.outer_dia_mm, 12.22);
  assert.strictEqual(calcData.is_standard, true);
  assert.ok(calcData.amazon_buy_url.includes('https://www.amazon.com/s?k='));
  assert.ok(calcData.stl_download_url.includes('/api/v1/download/pulley?teeth=20&bore=5&width=6'));
  assert.strictEqual(calcData.pod_unit_cost_usd, 8.50);
  console.log('  ✓ POST /api/v1/parametric/pulley computes diameters and matches standard catalog');

  // 3. POST /api/v1/parametric/pulley (Structural Failure / Thin Wall)
  const thinWallReq = new Request('https://barebones3d.com/api/v1/parametric/pulley', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teeth: 12, bore_mm: 8, belt_width_mm: 6 })
  });
  const thinWallRes = await calcPulley({ request: thinWallReq, env: {} });
  assert.strictEqual(thinWallRes.status, 422, 'Thin wall should return 422 Unprocessable');
  const thinWallData: any = await thinWallRes.json();
  assert.strictEqual(thinWallData.valid, false);
  assert.ok(thinWallData.error.includes('Insufficient wall thickness'));
  console.log('  ✓ Wall thickness validation blocks structural failure (< 1.5mm)');

  // 4. GET /api/v1/download/pulley
  const downloadReq = new Request('https://barebones3d.com/api/v1/download/pulley?teeth=20&bore=5&width=6');
  const downloadRes = await downloadPulley({ request: downloadReq });
  assert.strictEqual(downloadRes.status, 200);
  assert.strictEqual(downloadRes.headers.get('Content-Type'), 'model/stl');
  assert.ok(downloadRes.headers.get('Content-Disposition')?.includes('gt2_pulley_20T_5mm.stl'));
  const stlBuffer = await downloadRes.arrayBuffer();
  assert.ok(stlBuffer.byteLength > 84, 'STL buffer must contain header and triangles');
  // Check triangle count in binary STL header (bytes 80-83)
  const view = new DataView(stlBuffer);
  const triCount = view.getUint32(80, true);
  assert.ok(triCount > 0, `Generated STL has ${triCount} triangles`);
  assert.strictEqual(stlBuffer.byteLength, 84 + triCount * 50, 'STL file size matches exact binary STL spec');
  console.log(`  ✓ GET /api/v1/download/pulley produces valid binary STL (${triCount} tris, ${stlBuffer.byteLength} bytes)`);

  // 5. MCP Tool Execution (calc_gt2_pulley via JSON-RPC)
  const mcpReq = new Request('https://barebones3d.com/api/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'mcp-test-1',
      method: 'tools/call',
      params: {
        name: 'calc_gt2_pulley',
        arguments: { teeth: 20, bore_mm: 5, belt_width_mm: 6 }
      }
    })
  });
  const mcpRes = await mcpHandler({ request: mcpReq, env: { MOCK_SERVICES: 'true' } as any });
  assert.strictEqual(mcpRes.status, 200);
  const mcpData: any = await mcpRes.json();
  assert.strictEqual(mcpData.id, 'mcp-test-1');
  assert.strictEqual(mcpData.result.isError, false);
  const mcpPayload = JSON.parse(mcpData.result.content[0].text);
  assert.strictEqual(mcpPayload.valid, true);
  assert.strictEqual(mcpPayload.is_standard, true);
  console.log('  ✓ MCP Server handles calc_gt2_pulley tool calls seamlessly');

  console.log('\n🎉 All Monetization, Cart, Standards Catalog & AI Tooling Tests Passed Successfully!');
}

runTests().catch((err) => {
  console.error('\n❌ Test failure:', err);
  process.exit(1);
});
