import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createNodeSqliteAdapter, getAllActiveParts } from '../src/lib/db.ts';
import { syncStripeProduct } from '../src/lib/stripe.ts';

// Simple .env parser if not already loaded
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
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

async function run() {
  loadEnv();
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error('❌ Error: STRIPE_SECRET_KEY is not defined in .env or environment.');
    process.exit(1);
  }

  console.log('🔄 [Barebones 3D] Synchronizing commercial replacement parts with Stripe Products & Prices...');
  console.log(`Using Stripe key prefix: ${stripeSecretKey.slice(0, 15)}...`);

  // Load parts from migrations into SQLite
  const sqlite = new DatabaseSync(':memory:');
  const db = createNodeSqliteAdapter(sqlite);

  const migrationsDir = path.join(process.cwd(), 'migrations');
  const migrationFiles = [
    '0001_initial_schema.sql',
    '0002_seed_parts.sql',
    '0003_update_pricing_and_monetization.sql'
  ];

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf8');
      await db.execScript(sql);
    }
  }

  const parts = await getAllActiveParts(db);
  const commercialParts = parts.filter(p => Boolean(p.is_commercial_allowed));
  const nonCommercialParts = parts.filter(p => !p.is_commercial_allowed);

  console.log(`Found ${parts.length} total catalog parts (${commercialParts.length} commercial, ${nonCommercialParts.length} non-commercial open STL).`);

  let successCount = 0;
  for (const part of commercialParts) {
    try {
      console.log(`Syncing ${part.title} ($${(part.retail_price_cents / 100).toFixed(2)} USD)...`);
      const res = await syncStripeProduct(stripeSecretKey, part);
      console.log(`  -> ✅ [${res.action.toUpperCase()}] Product: ${res.productId} | Price: ${res.priceId}`);
      successCount++;
    } catch (err: any) {
      console.log(`  -> ❌ FAILED: ${err.message}`);
    }
  }

  // Deactivate any previously commercial products that have pivoted to Free STL Only
  for (const part of nonCommercialParts) {
    try {
      const listRes = await fetch(`https://api.stripe.com/v1/products?limit=100`, {
        headers: { 'Authorization': `Bearer ${stripeSecretKey}` }
      });
      if (listRes.ok) {
        const listData: any = await listRes.json();
        const existing = (listData.data || []).find((p: any) => p.metadata?.part_id === part.id || p.metadata?.slug === part.slug);
        if (existing && existing.active) {
          console.log(`Deactivating non-commercial/commodity product in Stripe: ${part.title} (${existing.id})...`);
          await fetch(`https://api.stripe.com/v1/products/${existing.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeSecretKey}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ active: 'false' }).toString()
          });
          console.log(`  -> ✅ [DEACTIVATED] Product archived: ${existing.id}`);
        }
      }
    } catch (err: any) {
      console.log(`  -> ⚠️ Archive note: ${err.message}`);
    }
  }

  console.log(`\n🎉 Synchronized ${successCount}/${commercialParts.length} commercial products with Stripe!`);
}

run();
