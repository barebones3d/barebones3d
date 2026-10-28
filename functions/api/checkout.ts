import type { EnvBindings } from '../../src/types/database.ts';
import { getDbAdapter, getPartById } from '../../src/lib/db.ts';
import { createCheckoutSession } from '../../src/lib/stripe.ts';

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
    'Content-Type': 'application/json'
  };

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { partId, quantity = 1, bundle } = body || {};
    if (!partId || typeof partId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid partId' }), {
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
    const part = await getPartById(db, partId);

    if (!part) {
      return new Response(JSON.stringify({ error: `Part not found: ${partId}` }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Strict Enforcement of Non-Commercial License Restrictions
    if (!part.is_commercial_allowed) {
      return new Response(JSON.stringify({
        error: 'Commercial reproduction is not permitted under this open-source license.',
        licenseType: part.license_type,
        isCommercialAllowed: false
      }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const siteUrl = env.SITE_URL || 'https://barebones3d.com';
    const isMock = env.MOCK_SERVICES === 'true';

    const session = await createCheckoutSession({
      part,
      quantity: Math.max(1, Math.min(Number(quantity) || 1, 50)),
      siteUrl,
      stripeSecretKey: env.STRIPE_SECRET_KEY,
      isMock,
      bundle
    });

    return new Response(JSON.stringify({
      success: true,
      url: session.url,
      sessionId: session.sessionId
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      error: err.message || 'Internal server error during checkout initiation'
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
