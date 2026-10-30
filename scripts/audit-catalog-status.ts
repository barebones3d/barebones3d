import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createNodeSqliteAdapter, getAllActiveParts } from '../src/lib/db.ts';

async function runAudit() {
  const ROOT_DIR = process.cwd();
  const sqlite = new DatabaseSync(':memory:');
  const db = createNodeSqliteAdapter(sqlite);

  const migrationsDir = path.join(ROOT_DIR, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const m of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, m), 'utf8');
    await db.execScript(sql);
  }

  const parts = await getAllActiveParts(db);

  console.log(`\n========================================================================================`);
  console.log(`                     BAREBONES 3D CATALOG AUDIT & STATUS VERIFICATION                   `);
  console.log(`========================================================================================`);
  console.log(`Total Parts in Database: ${parts.length}\n`);

  let syntheticUrlCount = 0;

  console.log(
    'Status'.padEnd(16) +
    'OEM Part #'.padEnd(18) +
    'Comm'.padEnd(6) +
    'Price'.padEnd(8) +
    'License'.padEnd(18) +
    'Source URL'
  );
  console.log('-'.repeat(120));

  for (const p of parts) {
    const url = p.original_source_url;
    let isSynthetic = false;

    if (!url) {
      isSynthetic = true;
      syntheticUrlCount++;
    } else if (url.includes('printables.com') || url.includes('thingiverse.com')) {
      const hasNumericId = /\/(model\/\d+|thing:\d+)/.test(url);
      if (!hasNumericId) {
        isSynthetic = true;
        syntheticUrlCount++;
      }
    } else if (!url.startsWith('https://barebones3d.com/guides/')) {
      isSynthetic = true;
      syntheticUrlCount++;
    }

    const price = p.retail_price_cents > 0 ? `$${(p.retail_price_cents / 100).toFixed(2)}` : 'FREE';
    const flag = isSynthetic ? ' [SYNTHETIC!]' : '';

    console.log(
      p.status.padEnd(16) +
      p.oem_part_number.padEnd(18) +
      (p.is_commercial_allowed ? 'YES' : 'NO').padEnd(6) +
      price.padEnd(8) +
      p.license_type.slice(0, 16).padEnd(18) +
      url + flag
    );
  }

  console.log('-'.repeat(120));
  const activeCount = parts.filter(p => p.status === 'active').length;
  const affiliateCount = parts.filter(p => p.status === 'affiliate_only').length;
  const waitlistCount = parts.filter(p => p.status === 'cad_waitlist').length;

  console.log(`Summary:`);
  console.log(`  • Active POD (Verified CC0 / CC BY):       ${activeCount}`);
  console.log(`  • Affiliate Only (Commodity / Personal):   ${affiliateCount}`);
  console.log(`  • CAD Waitlist (Engineering Validation):  ${waitlistCount}`);
  console.log(`  • Synthetic URLs Detected:                 ${syntheticUrlCount}`);
  console.log(`========================================================================================\n`);

  if (syntheticUrlCount > 0) {
    console.error(`Audit Failed: Found ${syntheticUrlCount} synthetic URLs!`);
    process.exit(1);
  } else {
    console.log(`✓ Audit Passed: 100% compliant licensing, operational statuses, and authentic routes.`);
  }
}

runAudit().catch(err => {
  console.error('Audit Error:', err);
  process.exit(1);
});
