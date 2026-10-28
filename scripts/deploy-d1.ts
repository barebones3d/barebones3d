#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnv();

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID || '704b8810-4e45-4b2c-b657-18f4c8105ce6';

if (!ACCOUNT_ID || !API_TOKEN) {
  console.error('❌ Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN environment variable.');
  process.exit(1);
}

async function executeSql(sql: string) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });

  const data = await res.json() as any;
  if (!res.ok || !data.success) {
    throw new Error(`D1 API error: ${JSON.stringify(data.errors || data)}`);
  }
  return data.result;
}

async function run() {
  console.log(`🚀 [Cloudflare D1] Applying migrations to database: ${DATABASE_ID}...`);

  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    console.log(`  Applying: ${file}...`);
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    // Split SQL into individual statements by semicolon
    const rawStatements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let count = 0;
    for (const stmt of rawStatements) {
      const cleanStmt = stmt.replace(/--.*$/gm, '').trim();
      if (!cleanStmt) continue;
      console.log(`    [Exec] ${cleanStmt.slice(0, 60).replace(/\n/g, ' ')}...`);
      await executeSql(cleanStmt);
      count++;
    }
    console.log(`  ✓ Applied ${count} statements from ${file}`);
  }

  // Verification
  console.log(`\n🔍 [Verification] Querying parts table on live D1 database...`);
  const result = await executeSql('SELECT id, slug, oem_part_number, material_spec, retail_price_cents, is_commercial_allowed FROM parts;');
  const parts = result[0]?.results || [];
  console.log(`  Found ${parts.length} active parts in production D1 database:`);
  for (const p of parts) {
    console.log(`    - ${p.title || p.slug}: OEM #${p.oem_part_number} (${p.material_spec}) - $${(p.retail_price_cents / 100).toFixed(2)} [Commercial: ${Boolean(p.is_commercial_allowed)}]`);
  }

  console.log(`\n🎉 [Cloudflare D1] Database migration completed successfully!`);
}

run().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
