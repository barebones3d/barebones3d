import type { EnvBindings } from '../../../src/types/database.ts';
import { getDbAdapter, getPartById, getPartBySlug } from '../../../src/lib/db.ts';
import { createCheckoutSession } from '../../../src/lib/stripe.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const partIdentifier = body?.part_id || body?.partId;
    const quantity = Math.max(1, Math.min(Number(body?.quantity) || 1, 50));

    if (!partIdentifier || typeof partIdentifier !== 'string') {
      return new Response(JSON.stringify({ error: "Missing required parameter 'part_id'" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database binding (DB) unavailable' }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const db = getDbAdapter(env.DB);
    let part = await getPartById(db, partIdentifier);
    if (!part) {
      part = await getPartBySlug(db, partIdentifier);
    }

    if (!part) {
      return new Response(JSON.stringify({ error: `Part not found: ${partIdentifier}` }), {
        status: 404,
        headers: corsHeaders
      });
    }

    if (!part.is_commercial_allowed) {
      return new Response(JSON.stringify({
        error: 'Commercial reproduction is prohibited under this open-source license.',
        license_type: part.license_type,
        is_commercial_allowed: false,
        free_stl_download_url: `${(env.SITE_URL || 'https://barebones3d.com').replace(/\/$/, '')}/api/parts/${part.id}/download`
      }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const siteUrl = env.SITE_URL || 'https://barebones3d.com';
    const isMock = env.MOCK_SERVICES === 'true';

    const session = await createCheckoutSession({
      part,
      quantity,
      siteUrl,
      stripeSecretKey: env.STRIPE_SECRET_KEY,
      isMock
    });

    return new Response(JSON.stringify({
      success: true,
      checkout_url: session.url,
      session_id: session.sessionId,
      part_id: part.id,
      retail_price_cents: part.retail_price_cents
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      error: err.message || 'Checkout creation failed'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
