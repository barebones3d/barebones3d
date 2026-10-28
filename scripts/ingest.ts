#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  isCommercialLicenseAllowed,
  extractOemPartNumber,
  extractMakeAndModel,
  parseToolsAndSteps,
  buildPartAndGuideFromIngest,
  type IngestedModelData
} from '../src/lib/ingest.ts';

function parseCliArgs() {
  const args = process.argv.slice(2);
  let url = '';
  let apply = false;
  let oem = '';
  let material = 'PETG';
  let price = 1499;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      url = args[++i];
    } else if (args[i] === '--apply') {
      apply = true;
    } else if (args[i] === '--oem' && args[i + 1]) {
      oem = args[++i];
    } else if (args[i] === '--material' && args[i + 1]) {
      material = args[++i];
    } else if (args[i] === '--price' && args[i + 1]) {
      price = parseInt(args[++i], 10);
    }
  }

  return { url, apply, oem, material, price };
}

async function scrapeOrMockUrl(url: string, oemArg: string, matArg: string, priceArg: number): Promise<IngestedModelData> {
  console.log(`🌐 [Ingest] Fetching repository metadata from: ${url}`);

  let title = 'Obsolete OEM Replacement Clip';
  let author = 'OpenSourceDesigner';
  let description = 'Replacement clip for broken OEM dashboard assembly.\n1. Remove trim bezel.\n2. Snap clip into slot.';
  let licenseType = 'CC BY 4.0';

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Barebones3D Ingestion Bot)' } });
    if (res.ok) {
      const html = await res.text();
      // Extract title from og:title or <title>
      const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
                         html.match(/<title>(.*?)<\/title>/i);
      if (titleMatch) title = titleMatch[1].replace(/\s*\|\s*Printables.*$/i, '').trim();

      // Extract description
      const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
      if (descMatch) description = descMatch[1].trim();

      // Check for non-commercial license in HTML
      if (/CC\s*BY-NC|Non-Commercial|NonCommercial/i.test(html)) {
        licenseType = 'CC BY-NC 4.0';
      } else if (/CC0|Public Domain/i.test(html)) {
        licenseType = 'CC0 1.0';
      } else if (/CC\s*BY-SA/i.test(html)) {
        licenseType = 'CC BY-SA 4.0';
      }
    }
  } catch (err: any) {
    console.warn(`  [INFO] Offline/Simulated fetch (${err.message}). Using extracted URL tokens.`);
    const urlSlug = url.split('/').filter(Boolean).pop() || 'replacement-part';
    title = urlSlug.replace(/^\d+-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (url.toLowerCase().includes('non-commercial') || url.toLowerCase().includes('-nc')) {
      licenseType = 'CC BY-NC 4.0';
    }
  }

  return {
    title,
    author,
    description,
    licenseType,
    sourceUrl: url,
    downloadUrl: `${url}/download.stl`,
    suggestedOemNumber: oemArg || undefined,
    suggestedMakesModels: [],
    materialSpec: matArg,
    suggestedPriceCents: priceArg
  };
}

async function run() {
  const { url, apply, oem, material, price } = parseCliArgs();

  if (!url) {
    console.error(`
Usage:
  node scripts/ingest.ts --url <URL> [options]

Options:
  --url <url>         Printables or Thingiverse model URL (Required)
  --oem <number>      Explicit OEM part number override (Optional)
  --material <spec>   Material spec: ASA, PETG, Nylon PA12 (Default: PETG)
  --price <cents>     Retail price in cents (Default: 1499 for $14.99)
  --apply             Directly append to database, update redirects, and rebuild LLM manifests

Examples:
  node scripts/ingest.ts --url "https://www.printables.com/model/49102-subaru-blend-door-gear" --oem "72131-FG000" --material "Nylon PA12" --apply
    `);
    process.exit(1);
  }

  const modelData = await scrapeOrMockUrl(url, oem, material, price);
  const isCommAllowed = isCommercialLicenseAllowed(modelData.licenseType);

  console.log('\n--- Ingestion Analysis ---');
  console.log(`Title:             ${modelData.title}`);
  console.log(`License:           ${modelData.licenseType}`);
  if (isCommAllowed) {
    console.log(`Commercial Status: ✅ ALLOWED (Eligible for Print-on-Demand E-Commerce)`);
  } else {
    console.log(`Commercial Status: ⛔ RESTRICTED (${modelData.licenseType} prohibits commercial sale)`);
    console.log(`                   Enforcing "Digital STL Only" restriction.`);
  }

  const { part, guide } = buildPartAndGuideFromIngest(modelData);

  console.log(`Assigned Slug:     ${part.slug}`);
  console.log(`Detected OEM:      ${part.oem_part_number}`);
  console.log(`Material Spec:     ${part.material_spec}`);
  console.log(`Retail Price:      $${(part.retail_price_cents / 100).toFixed(2)} USD`);
  console.log(`R2 STL Key:        ${part.stl_r2_key}`);
  console.log(`Steps Parsed:      ${guide.steps.length} steps (Formatted for Web & Raw Markdown)`);
  console.log(`Tools Identified:  ${guide.tools_needed.map(t => t.name).join(', ')}`);

  const outputPayload = { part, guide };
  const jsonOut = JSON.stringify(outputPayload, null, 2);

  const outDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const draftFile = path.join(outDir, `ingest_${part.slug}.json`);
  fs.writeFileSync(draftFile, jsonOut, 'utf8');
  console.log(`\n💾 Saved structured payload draft: ${draftFile}`);

  if (apply) {
    console.log('\n⚡ Appending to database seed migration...');
    const seedPath = path.join(process.cwd(), 'migrations', '0002_seed_parts.sql');
    const sqlPart = `
-- Ingested: ${part.title}
INSERT OR REPLACE INTO parts (
  id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
  material_spec, retail_price_cents, stl_r2_key, original_source_url,
  license_type, attribution_text, is_commercial_allowed, is_active
) VALUES (
  '${part.id}', '${part.slug}', '${part.title.replace(/'/g, "''")}', '${part.oem_part_number}',
  '${JSON.stringify(part.superseded_numbers)}', '${JSON.stringify(part.compatible_makes_models)}',
  '${part.material_spec}', ${part.retail_price_cents}, '${part.stl_r2_key}', '${part.original_source_url}',
  '${part.license_type}', '${(part.attribution_text || '').replace(/'/g, "''")}', ${part.is_commercial_allowed ? 1 : 0}, 1
);

INSERT OR REPLACE INTO guides (
  id, part_id, tools_needed, difficulty, time_estimate, steps, faq
) VALUES (
  '${guide.id}', '${part.id}',
  '${JSON.stringify(guide.tools_needed).replace(/'/g, "''")}',
  '${guide.difficulty}', '${guide.time_estimate}',
  '${JSON.stringify(guide.steps).replace(/'/g, "''")}',
  '${JSON.stringify(guide.faq).replace(/'/g, "''")}'
);
`;
    fs.appendFileSync(seedPath, sqlPart, 'utf8');
    console.log(`  ✓ Updated migration: ${seedPath}`);

    // Update site/_redirects with canonical redirect entries
    const redirectsPath = path.join(process.cwd(), 'site', '_redirects');
    const redirectEntries = `
/parts/${part.slug} /guides/${part.slug}/ 301
/parts/${part.oem_part_number.toLowerCase()} /guides/${part.slug}/ 301
`;
    fs.appendFileSync(redirectsPath, redirectEntries, 'utf8');
    console.log(`  ✓ Added 301 redirects to: ${redirectsPath}`);

    // Automatically rebuild and purge/refresh llms.txt and llms-full.txt
    console.log('🔄 Re-building static guides, LLM endpoints, and OpenAPI spec...');
    execSync('node scripts/build-guides.ts', { stdio: 'inherit' });
    console.log('✅ Ingestion, database migration, and LLM manifest refresh complete!');
  }
}

run().catch(err => {
  console.error('❌ Ingestion failed:', err);
  process.exit(1);
});
