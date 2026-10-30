export interface CompatibleMakeModel {
  make: string;
  model: string;
  year_start?: number;
  year_end?: number;
  trim?: string;
}

export interface ToolNeeded {
  name: string;
  purpose?: string;
  amazon_search_keyword?: string;
}

export interface GuideStep {
  step_number: number;
  title: string;
  text: string;
  image_url?: string;
  tip?: string;
  warning?: string;
  svg_code?: string;
  action_type?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export type PartStatus = 'active' | 'affiliate_only' | 'cad_waitlist';

export interface Part {
  id: string;
  slug: string;
  title: string;
  oem_part_number: string;
  superseded_numbers: string[];
  compatible_makes_models: CompatibleMakeModel[];
  material_spec: string;
  retail_price_cents: number;
  stl_r2_key: string;
  original_source_url?: string | null;
  license_type: string;
  attribution_text?: string | null;
  is_commercial_allowed: boolean;
  is_active: boolean;
  status: PartStatus;
  created_at?: string;
}

export interface PartRaw {
  id: string;
  slug: string;
  title: string;
  oem_part_number: string;
  superseded_numbers: string;
  compatible_makes_models: string;
  material_spec: string;
  retail_price_cents: number;
  stl_r2_key: string;
  original_source_url?: string | null;
  license_type: string;
  attribution_text?: string | null;
  is_commercial_allowed: number;
  is_active: number;
  status?: string;
  created_at?: string;
}

export interface Guide {
  id: string;
  part_id: string;
  tools_needed: ToolNeeded[];
  difficulty: 'Beginner' | 'Easy' | 'Moderate' | 'Advanced';
  time_estimate: string;
  steps: GuideStep[];
  faq: FAQItem[];
  created_at?: string;
}

export interface GuideRaw {
  id: string;
  part_id: string;
  tools_needed: string;
  difficulty: 'Beginner' | 'Easy' | 'Moderate' | 'Advanced';
  time_estimate: string;
  steps: string;
  faq: string;
  created_at?: string;
}

export interface Order {
  id: string;
  stripe_session_id: string;
  stripe_customer_email: string;
  part_id: string;
  amount_total_cents: number;
  shipping_name?: string | null;
  shipping_address?: ShippingAddress | null;
  status: 'pending' | 'paid' | 'routed_to_pod' | 'fulfilled' | 'cancelled';
  created_at?: string;
}

export interface Fulfillment {
  id: string;
  order_id: string;
  pod_provider: string;
  pod_job_id?: string | null;
  tracking_number?: string | null;
  carrier?: string | null;
  status: 'submitted' | 'printing' | 'shipped' | 'delivered' | 'failed';
  updated_at?: string;
}

export interface EnvBindings {
  DB?: any; // Cloudflare D1Database
  BUCKET_ASSETS?: any; // Cloudflare R2Bucket
  APP_ENV?: string;
  SITE_URL?: string;
  PUBLIC_BUCKET_URL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_WEBHOOK_ENDPOINT_ID?: string;
  SLANT3D_API_KEY?: string;
  SLANT3D_API_URL?: string;
  SLANT3D_PLATFORM_ID?: string;
  FULFILLMENT_PROVIDER?: string;
  MOCK_SERVICES?: string;
}

export function parsePart(raw: PartRaw): Part {
  return {
    ...raw,
    status: (raw.status as PartStatus) || (raw.is_commercial_allowed ? 'active' : 'affiliate_only'),
    superseded_numbers: typeof raw.superseded_numbers === 'string' ? JSON.parse(raw.superseded_numbers || '[]') : raw.superseded_numbers,
    compatible_makes_models: typeof raw.compatible_makes_models === 'string' ? JSON.parse(raw.compatible_makes_models || '[]') : raw.compatible_makes_models,
    is_commercial_allowed: Boolean(raw.is_commercial_allowed),
    is_active: Boolean(raw.is_active),
  };
}

export function parseGuide(raw: GuideRaw): Guide {
  return {
    ...raw,
    tools_needed: typeof raw.tools_needed === 'string' ? JSON.parse(raw.tools_needed || '[]') : raw.tools_needed,
    steps: typeof raw.steps === 'string' ? JSON.parse(raw.steps || '[]') : raw.steps,
    faq: typeof raw.faq === 'string' ? JSON.parse(raw.faq || '[]') : raw.faq,
  };
}
