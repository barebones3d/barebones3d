-- Barebones 3D Platform Database Schema
-- schema.sql (D1 / SQLite)

-- 1. Parts Catalog Table
CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  oem_part_number TEXT NOT NULL,
  superseded_numbers TEXT DEFAULT '[]',          -- JSON array of strings
  compatible_makes_models TEXT DEFAULT '[]',     -- JSON array of objects: { make, model, year_start, year_end }
  material_spec TEXT NOT NULL,                   -- e.g. 'ASA', 'PETG', 'Nylon PA12'
  retail_price_cents INTEGER NOT NULL,           -- e.g. 1899 = $18.99
  stl_r2_key TEXT NOT NULL,                      -- e.g. 'parts/subaru-blend-door-gear-72131-fg000.stl'
  original_source_url TEXT,
  license_type TEXT NOT NULL,                    -- e.g. 'CC BY 4.0', 'CC0 1.0', 'CC BY-NC 4.0'
  attribution_text TEXT,
  is_commercial_allowed INTEGER NOT NULL DEFAULT 1, -- 1 = TRUE, 0 = FALSE (enforces -NC restrictions)
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_parts_slug ON parts(slug);
CREATE INDEX IF NOT EXISTS idx_parts_oem ON parts(oem_part_number);
CREATE INDEX IF NOT EXISTS idx_parts_active ON parts(is_active);

-- 2. Repair Guides Table
CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY,
  part_id TEXT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  tools_needed TEXT NOT NULL DEFAULT '[]',       -- JSON array of objects: { name, purpose }
  difficulty TEXT NOT NULL DEFAULT 'Moderate',   -- 'Beginner', 'Easy', 'Moderate', 'Advanced'
  time_estimate TEXT NOT NULL DEFAULT '30 mins', -- e.g. '15-30 minutes'
  steps TEXT NOT NULL DEFAULT '[]',              -- JSON array of objects: { step_number, title, text, image_url, tip, warning }
  faq TEXT NOT NULL DEFAULT '[]',                -- JSON array of objects: { question, answer }
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_guides_part_id ON guides(part_id);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_customer_email TEXT NOT NULL,
  part_id TEXT NOT NULL REFERENCES parts(id),
  amount_total_cents INTEGER NOT NULL,
  shipping_name TEXT,
  shipping_address TEXT,                         -- JSON object: { line1, line2, city, state, postal_code, country }
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'routed_to_pod', 'fulfilled', 'cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_part_id ON orders(part_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 4. Fulfillments Table
CREATE TABLE IF NOT EXISTS fulfillments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  pod_provider TEXT NOT NULL DEFAULT 'slant3d',
  pod_job_id TEXT,
  tracking_number TEXT,
  carrier TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'printing', 'shipped', 'delivered', 'failed')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fulfillments_order_id ON fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_pod_job_id ON fulfillments(pod_job_id);
