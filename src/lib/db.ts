import type { Part, PartRaw, Guide, GuideRaw, Order, Fulfillment } from '../types/database.ts';
import { parsePart, parseGuide } from '../types/database.ts';

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid?: number | bigint }>;
  execScript(sql: string): Promise<void>;
}

/**
 * Creates an adapter around Cloudflare D1 database.
 */
export function createD1Adapter(d1: any): DatabaseAdapter {
  return {
    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
      const stmt = d1.prepare(sql).bind(...params);
      const res = await stmt.all();
      return (res.results || []) as T[];
    },
    async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid?: number | bigint }> {
      const stmt = d1.prepare(sql).bind(...params);
      const res = await stmt.run();
      return {
        changes: res.meta?.changes ?? 0,
        lastInsertRowid: res.meta?.last_row_id
      };
    },
    async execScript(sql: string): Promise<void> {
      await d1.exec(sql);
    }
  };
}

/**
 * Resolves a DatabaseAdapter from either a native Cloudflare D1 instance or an existing adapter.
 */
export function getDbAdapter(dbOrD1: any): DatabaseAdapter {
  if (dbOrD1 && typeof dbOrD1.prepare === 'function' && typeof dbOrD1.batch === 'function') {
    return createD1Adapter(dbOrD1);
  }
  return dbOrD1 as DatabaseAdapter;
}

/**
 * Creates an in-memory or local file SQLite adapter using Node.js built-in `node:sqlite`.
 * Used for local testing, staging, and static site generation without live D1 cloud connection.
 */
export function createNodeSqliteAdapter(sqliteDb: any): DatabaseAdapter {
  return {
    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(...params) as T[];
    },
    async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid?: number | bigint }> {
      const stmt = sqliteDb.prepare(sql);
      const res = stmt.run(...params);
      return {
        changes: Number(res.changes),
        lastInsertRowid: res.lastInsertRowid
      };
    },
    async execScript(sql: string): Promise<void> {
      sqliteDb.exec(sql);
    }
  };
}

export async function getPartBySlug(db: DatabaseAdapter, slug: string): Promise<Part | null> {
  const rows = await db.query<PartRaw>('SELECT * FROM parts WHERE slug = ? AND is_active = 1 LIMIT 1', [slug]);
  if (!rows || rows.length === 0) return null;
  return parsePart(rows[0]);
}

export async function getPartById(db: DatabaseAdapter, id: string): Promise<Part | null> {
  const rows = await db.query<PartRaw>('SELECT * FROM parts WHERE id = ? LIMIT 1', [id]);
  if (!rows || rows.length === 0) return null;
  return parsePart(rows[0]);
}

export async function getAllActiveParts(db: DatabaseAdapter): Promise<Part[]> {
  const rows = await db.query<PartRaw>('SELECT * FROM parts WHERE is_active = 1 ORDER BY title ASC');
  return rows.map(parsePart);
}

export async function getGuideByPartId(db: DatabaseAdapter, partId: string): Promise<Guide | null> {
  const rows = await db.query<GuideRaw>('SELECT * FROM guides WHERE part_id = ? LIMIT 1', [partId]);
  if (!rows || rows.length === 0) return null;
  return parseGuide(rows[0]);
}

export async function insertPart(db: DatabaseAdapter, part: Part): Promise<void> {
  await db.execute(`
    INSERT OR REPLACE INTO parts (
      id, slug, title, oem_part_number, superseded_numbers, compatible_makes_models,
      material_spec, retail_price_cents, stl_r2_key, original_source_url,
      license_type, attribution_text, is_commercial_allowed, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    part.id,
    part.slug,
    part.title,
    part.oem_part_number,
    JSON.stringify(part.superseded_numbers || []),
    JSON.stringify(part.compatible_makes_models || []),
    part.material_spec,
    part.retail_price_cents,
    part.stl_r2_key,
    part.original_source_url || null,
    part.license_type,
    part.attribution_text || null,
    part.is_commercial_allowed ? 1 : 0,
    part.is_active ? 1 : 0
  ]);
}

export async function insertGuide(db: DatabaseAdapter, guide: Guide): Promise<void> {
  await db.execute(`
    INSERT OR REPLACE INTO guides (
      id, part_id, tools_needed, difficulty, time_estimate, steps, faq
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    guide.id,
    guide.part_id,
    JSON.stringify(guide.tools_needed || []),
    guide.difficulty,
    guide.time_estimate,
    JSON.stringify(guide.steps || []),
    JSON.stringify(guide.faq || [])
  ]);
}

export async function createOrder(db: DatabaseAdapter, order: Order): Promise<void> {
  await db.execute(`
    INSERT INTO orders (
      id, stripe_session_id, stripe_customer_email, part_id,
      amount_total_cents, shipping_name, shipping_address, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    order.id,
    order.stripe_session_id,
    order.stripe_customer_email,
    order.part_id,
    order.amount_total_cents,
    order.shipping_name || null,
    order.shipping_address ? JSON.stringify(order.shipping_address) : null,
    order.status
  ]);
}

export async function updateOrderStatus(
  db: DatabaseAdapter,
  orderId: string,
  status: Order['status']
): Promise<void> {
  await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
}

export async function createFulfillment(db: DatabaseAdapter, fulfillment: Fulfillment): Promise<void> {
  await db.execute(`
    INSERT INTO fulfillments (
      id, order_id, pod_provider, pod_job_id, tracking_number, carrier, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    fulfillment.id,
    fulfillment.order_id,
    fulfillment.pod_provider,
    fulfillment.pod_job_id || null,
    fulfillment.tracking_number || null,
    fulfillment.carrier || null,
    fulfillment.status
  ]);
}

export async function updateFulfillmentStatus(
  db: DatabaseAdapter,
  fulfillmentId: string,
  status: Fulfillment['status'],
  trackingNumber?: string | null,
  carrier?: string | null
): Promise<void> {
  await db.execute(`
    UPDATE fulfillments 
    SET status = ?, 
        tracking_number = COALESCE(?, tracking_number),
        carrier = COALESCE(?, carrier),
        updated_at = datetime('now')
    WHERE id = ?
  `, [status, trackingNumber, carrier, fulfillmentId]);
}
