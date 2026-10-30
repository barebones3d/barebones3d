import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createNodeSqliteAdapter, getAllActiveParts, getGuideByPartId } from '../src/lib/db.ts';
import { renderGuideHtml } from '../src/templates/guideTemplate.ts';
import { renderCatalogHtml } from '../src/templates/catalogTemplate.ts';
import { generateLlmsTxt, generateLlmsFullTxt, generatePartMarkdown } from '../src/lib/llms.ts';
import { generateOpenApiSpec } from '../src/lib/openapi.ts';
import type { Guide, Part } from '../src/types/database.ts';

const ROOT_DIR = process.cwd();
const SITE_DIR = path.join(ROOT_DIR, 'site');
const GUIDES_DIR = path.join(SITE_DIR, 'guides');
const API_DIR = path.join(SITE_DIR, 'api');
const MIGRATIONS_DIR = path.join(ROOT_DIR, 'migrations');
const SITE_URL = process.env.SITE_URL || 'https://barebones3d.com';

async function build() {
  console.log('⚡ [Barebones 3D] Building static repair guides, LLM endpoints, and OpenAPI spec...');

  // Initialize SQLite in-memory database and run migrations
  const sqlite = new DatabaseSync(':memory:');
  const db = createNodeSqliteAdapter(sqlite);

  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .map(f => path.join(MIGRATIONS_DIR, f));

  for (const file of migrationFiles) {
    console.log(`  Applying migration: ${path.basename(file)}`);
    const sql = fs.readFileSync(file, 'utf8');
    await db.execScript(sql);
  }

  // Query all active parts
  const parts = await getAllActiveParts(db);
  console.log(`  Found ${parts.length} active parts in database.`);

  if (!fs.existsSync(GUIDES_DIR)) {
    fs.mkdirSync(GUIDES_DIR, { recursive: true });
  }
  if (!fs.existsSync(API_DIR)) {
    fs.mkdirSync(API_DIR, { recursive: true });
  }

  const catalogItems = [];
  const guidesMap = new Map<string, Guide>();

  // Generate each guide page (HTML + Markdown)
  for (const part of parts) {
    const guide = await getGuideByPartId(db, part.id);
    if (!guide) {
      console.warn(`  [WARN] No guide found for part: ${part.id} (${part.slug})`);
      continue;
    }

    catalogItems.push({ part, guide });
    guidesMap.set(part.id, guide);

    const partDir = path.join(GUIDES_DIR, part.slug);
    if (!fs.existsSync(partDir)) {
      fs.mkdirSync(partDir, { recursive: true });
    }

    // 1. Render HTML Guide
    const html = renderGuideHtml(part, guide, SITE_URL);
    fs.writeFileSync(path.join(partDir, 'index.html'), html, 'utf8');

    // 2. Render Raw Markdown Guide (Content Negotiation static fallback)
    const markdown = generatePartMarkdown(part, guide, SITE_URL);
    fs.writeFileSync(path.join(partDir, 'index.md'), markdown, 'utf8');
    fs.writeFileSync(path.join(GUIDES_DIR, `${part.slug}.md`), markdown, 'utf8');

    console.log(`  ✓ Generated guide: /guides/${part.slug}/ (HTML + MD) [${part.oem_part_number}]`);
  }

  // Generate catalog hub index
  const catalogHtml = renderCatalogHtml(catalogItems, SITE_URL);
  fs.writeFileSync(path.join(GUIDES_DIR, 'index.html'), catalogHtml, 'utf8');
  console.log(`  ✓ Generated catalog hub: /guides/index.html (${catalogItems.length} parts)`);

  // Generate /llms.txt
  const llmsTxt = generateLlmsTxt(parts, SITE_URL);
  fs.writeFileSync(path.join(SITE_DIR, 'llms.txt'), llmsTxt, 'utf8');
  console.log(`  ✓ Generated dynamic llms.txt: /llms.txt`);

  // Generate /llms-full.txt
  const llmsFullTxt = generateLlmsFullTxt(parts, guidesMap, SITE_URL);
  fs.writeFileSync(path.join(SITE_DIR, 'llms-full.txt'), llmsFullTxt, 'utf8');
  console.log(`  ✓ Generated dynamic llms-full.txt: /llms-full.txt`);

  // Generate /api/openapi.json
  const openApiSpec = generateOpenApiSpec(SITE_URL);
  fs.writeFileSync(path.join(API_DIR, 'openapi.json'), JSON.stringify(openApiSpec, null, 2), 'utf8');
  console.log(`  ✓ Generated OpenAPI 3.1 Spec: /api/openapi.json`);

  // Generate /OEM_CATALOG.md in project root for planning & deduplication
  const oemCatalogMd = renderOemCatalogMarkdown(parts, SITE_URL);
  fs.writeFileSync(path.join(ROOT_DIR, 'OEM_CATALOG.md'), oemCatalogMd, 'utf8');
  console.log(`  ✓ Generated OEM catalog index: /OEM_CATALOG.md (${parts.length} parts)`);

  console.log('✅ [Barebones 3D] LLM-Native build complete!');
}

function renderOemCatalogMarkdown(parts: Part[], siteUrl: string): string {
  const sorted = [...parts].sort((a, b) => a.title.localeCompare(b.title));

  const tableRows = sorted.map((p, idx) => {
    const supers = Array.isArray(p.superseded_numbers) && p.superseded_numbers.length > 0
      ? p.superseded_numbers.map((s: string) => `\`${s}\``).join(', ')
      : '—';
    const makes = Array.from(new Set(p.compatible_makes_models.map((c: { make: string }) => c.make))).join(' / ') || 'Universal';
    const status = p.is_commercial_allowed ? 'Commercial POD' : 'Free STL Only';
    const price = p.is_commercial_allowed ? `$${(p.retail_price_cents / 100).toFixed(2)}` : '$0.00';
    return `| **${idx + 1}** | \`${p.oem_part_number}\` | ${supers} | ${makes} | ${p.title} | ${p.material_spec} | ${status} | ${price} | [${p.slug}](file://${path.join(ROOT_DIR, 'site', 'guides', p.slug, 'index.html')}) |`;
  }).join('\n');

  // Fast lookup list
  const lookupEntries: Array<{ num: string; type: string; oem: string; slug: string }> = [];
  for (const p of sorted) {
    lookupEntries.push({ num: p.oem_part_number, type: '**Primary OEM**', oem: p.oem_part_number, slug: p.slug });
    if (Array.isArray(p.superseded_numbers)) {
      for (const sup of p.superseded_numbers) {
        if (sup) lookupEntries.push({ num: sup, type: 'Superseded', oem: p.oem_part_number, slug: p.slug });
      }
    }
  }
  lookupEntries.sort((a, b) => a.num.toLowerCase().localeCompare(b.num.toLowerCase()));

  const lookupRows = lookupEntries.map(e => (
    `| \`${e.num}\` | ${e.type} | \`${e.oem}\` | \`${e.slug}\` |`
  )).join('\n');

  const jsonManifest = JSON.stringify(sorted.map(p => ({
    oem_part_number: p.oem_part_number,
    supersedes: p.superseded_numbers || [],
    make: p.compatible_makes_models[0]?.make || 'Universal',
    title: p.title,
    slug: p.slug,
    material: p.material_spec,
    commercial: Boolean(p.is_commercial_allowed),
    price_usd: Number((p.retail_price_cents / 100).toFixed(2))
  })), null, 2);

  return `# Barebones 3D — OEM Replacement Parts Catalog & Deduplication Index

> **Single Source of Truth for Planning & Part Ingestion**  
> Use this document as the reference manifest for all currently cataloged, engineered, and published OEM replacement parts.  
> **Rule for AI Agents & Engineers:** Before proposing, designing, or ingesting a new replacement part, verify that neither the target OEM part number nor any of its superseded/alternate part numbers appear in this index.

**Catalog Status:** ${parts.length} Active Parts Published  
**Last Updated:** ${new Date().toISOString().split('T')[0]}  
**Canonical Web Directory:** [/guides/index.html](${siteUrl}/guides/)  
**LLM Endpoint:** [${siteUrl}/llms.txt](${siteUrl}/llms.txt)

---

## 1. Quick Master Table

| # | OEM Part # | Superseded / Alternate #s | Make / Manufacturer | Title & Description | Material Spec | Status | Price | Slug |
|---|---|---|---|---|---|---|---|---|
${tableRows}

---

## 2. Fast Part Number Lookup (All OEMs & Superseded Numbers)

Use this alphabetized list to instantly test whether an OEM or superseded part number already exists in the catalog:

| Part Number | Type | Canonical OEM Part # | Published Guide Slug |
|---|---|---|---|
${lookupRows}

---

## 3. Machine-Readable JSON Manifest

For automated planning prompts, agents can parse this JSON representation of all ${parts.length} active parts:

\`\`\`json
${jsonManifest}
\`\`\`
`;
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
