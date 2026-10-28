import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createNodeSqliteAdapter, getAllActiveParts, getGuideByPartId } from '../src/lib/db.ts';
import { renderGuideHtml } from '../src/templates/guideTemplate.ts';
import { renderCatalogHtml } from '../src/templates/catalogTemplate.ts';
import { generateLlmsTxt, generateLlmsFullTxt, generatePartMarkdown } from '../src/lib/llms.ts';
import { generateOpenApiSpec } from '../src/lib/openapi.ts';
import type { Guide } from '../src/types/database.ts';

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

  const migrationFiles = [
    path.join(MIGRATIONS_DIR, '0001_initial_schema.sql'),
    path.join(MIGRATIONS_DIR, '0002_seed_parts.sql'),
    path.join(MIGRATIONS_DIR, '0003_update_pricing_and_monetization.sql')
  ];

  for (const file of migrationFiles) {
    if (fs.existsSync(file)) {
      console.log(`  Applying migration: ${path.basename(file)}`);
      const sql = fs.readFileSync(file, 'utf8');
      await db.execScript(sql);
    }
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

  console.log('✅ [Barebones 3D] LLM-Native build complete!');
}

build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
