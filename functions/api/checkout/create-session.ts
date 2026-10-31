import type { EnvBindings } from '../../../src/types/database.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const {
      partNumber = 'BB3D-CUSTOM',
      title = 'Custom Parametric Part',
      manifestId = 'custom_parametric',
      targetMaterial = 'PETG Heavy Duty',
      priceCents = 2400,
      stlUrl,
      parameters = {},
      quantity = 1,
      customerEmail,
    } = body || {};

    if (!stlUrl) {
      return new Response(JSON.stringify({ error: 'Missing required field: stlUrl' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const siteUrl = (env.SITE_URL || 'https://barebones3d.com').replace(/\/$/, '');
    const isMock =
      env.MOCK_SERVICES === 'true' ||
      !env.STRIPE_SECRET_KEY ||
      env.STRIPE_SECRET_KEY.startsWith('mock_');

    const totalQuantity = Math.max(1, Math.min(Number(quantity) || 1, 50));
    const effectivePriceCents = Math.max(500, Number(priceCents) || 2400);

    if (isMock) {
      const mockSessionId = `cs_test_parametric_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return new Response(
        JSON.stringify({
          success: true,
          sessionId: mockSessionId,
          url: `${siteUrl}/order-success?session_id=${mockSessionId}&mock=true&manifestId=${manifestId}&material=${encodeURIComponent(targetMaterial)}`,
          partNumber,
          title,
          priceCents: effectivePriceCents,
          stlUrl,
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    // Prepare Stripe Checkout Session parameters
    const stripeParams = new URLSearchParams();
    stripeParams.append('mode', 'payment');
    stripeParams.append('success_url', `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`);
    stripeParams.append('cancel_url', `${siteUrl}/generator.html?checkout_cancelled=1`);

    if (customerEmail && customerEmail.includes('@')) {
      stripeParams.append('customer_email', customerEmail);
    }

    // Line item for the custom physical 3D print
    stripeParams.append('line_items[0][price_data][currency]', 'usd');
    stripeParams.append('line_items[0][price_data][unit_amount]', String(effectivePriceCents));
    stripeParams.append(
      'line_items[0][price_data][product_data][name]',
      `${title} (${partNumber})`
    );
    stripeParams.append(
      'line_items[0][price_data][product_data][description]',
      `Custom Parametric 3D Print — Material: ${targetMaterial}. Industrial FDM / SLA on-demand manufacturing.`
    );
    stripeParams.append('line_items[0][quantity]', String(totalQuantity));

    // Automated tax and physical shipping address collection
    stripeParams.append('automatic_tax[enabled]', 'true');
    stripeParams.append('shipping_address_collection[allowed_countries][0]', 'US');
    stripeParams.append('shipping_address_collection[allowed_countries][1]', 'CA');

    // Slant 3D Fulfillment & Model URL Metadata
    stripeParams.append('metadata[order_type]', 'parametric_pod');
    stripeParams.append('metadata[part_id]', manifestId);
    stripeParams.append('metadata[partId]', manifestId);
    stripeParams.append('metadata[manifestId]', manifestId);
    stripeParams.append('metadata[partNumber]', partNumber);
    stripeParams.append('metadata[title]', title);
    stripeParams.append('metadata[targetMaterial]', targetMaterial);
    stripeParams.append('metadata[stlUrl]', stlUrl);
    stripeParams.append('metadata[stl_url]', stlUrl);
    stripeParams.append('metadata[parameters]', JSON.stringify(parameters).slice(0, 480));

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripeParams.toString(),
    });

    if (!stripeResponse.ok) {
      const errText = await stripeResponse.text();
      throw new Error(`Stripe API session creation failed (${stripeResponse.status}): ${errText}`);
    }

    const session: any = await stripeResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message || 'Internal server error creating checkout session',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
