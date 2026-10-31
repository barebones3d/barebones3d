import type { EnvBindings } from '../../../src/types/database.ts';
import { uploadToR2 } from '../../../src/lib/r2.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
}

interface CartItemPayload {
  id: string;
  partName: string;
  partType?: string;
  parametricConfig?: Record<string, any>;
  stlBlobRef?: string;
  unitPriceUsd: number;
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
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const items: CartItemPayload[] = body?.items;
    const destination = body?.destination || { country: 'US' };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty or invalid' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const siteUrl = (env.SITE_URL || 'https://barebones3d.com').replace(/\/$/, '');
    const isMock = env.MOCK_SERVICES === 'true' || !env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY.startsWith('mock_');

    // Ephemeral STL Storage handling (7-day lifecycle)
    const stlFileUrls: Record<string, string> = {};
    for (const item of items) {
      const itemKey = `ephemeral/stls/${Date.now()}_${item.id}.stl`;
      if (item.stlBlobRef && env.BUCKET_ASSETS) {
        try {
          // If stlBlobRef contains base64 data
          const base64Data = item.stlBlobRef.replace(/^data:[^;]+;base64,/, '');
          const binaryBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          await uploadToR2(env.BUCKET_ASSETS, itemKey, binaryBuffer, 'model/stl');
          const publicBase = env.PUBLIC_BUCKET_URL || 'https://assets.barebones3d.com';
          stlFileUrls[item.id] = `${publicBase}/${itemKey}`;
        } catch (e) {
          console.warn(`Could not upload ephemeral STL for ${item.id}:`, e);
          stlFileUrls[item.id] = `${siteUrl}/api/v1/download/pulley?teeth=20&bore=5&width=6`;
        }
      } else {
        // Fallback parametric generation URL
        stlFileUrls[item.id] = `${siteUrl}/api/v1/download/pulley?teeth=20&bore=5&width=6`;
      }
    }

    // Pricing calculation
    // Base tier ($6-$10 depending on volume: standard $8.50 base)
    // Single flat consolidated shipping fee ($5.50 - $7.00: $5.99 flat)
    const flatShippingCents = 599; // $5.99 single flat shipping fee

    if (isMock) {
      const mockSessionId = `cs_test_mock_cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      return new Response(
        JSON.stringify({
          success: true,
          sessionId: mockSessionId,
          url: `${siteUrl}/order-success?session_id=${mockSessionId}&mock=true&items=${items.length}`,
          pricing: {
            partsSubtotal: items.reduce((acc, i) => acc + i.unitPriceUsd, 0),
            shipping: 5.99,
            currency: 'USD',
          },
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    // Live Stripe Checkout Session with Slant 3D Fulfillment Metadata
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${siteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${siteUrl}/generator.html?cart_cancelled=1`);

    // Line items for each part
    items.forEach((item, index) => {
      const unitAmountCents = Math.round((Number(item.unitPriceUsd) || 8.5) * 100);
      params.append(`line_items[${index}][price_data][currency]`, 'usd');
      params.append(`line_items[${index}][price_data][unit_amount]`, String(unitAmountCents));
      params.append(`line_items[${index}][price_data][product_data][name]`, item.partName);
      params.append(
        `line_items[${index}][price_data][product_data][description]`,
        `Custom Parametric FDM Print in High-Durability PETG / ASA`
      );
      params.append(`line_items[${index}][price_data][product_data][metadata][part_type]`, item.partType || 'parametric_component');
      params.append(`line_items[${index}][price_data][product_data][metadata][stl_url]`, stlFileUrls[item.id] || '');
      params.append(`line_items[${index}][quantity]`, '1');
    });

    // Flat consolidated shipping line item ($5.99 total, covers all parts)
    const shippingIndex = items.length;
    params.append(`line_items[${shippingIndex}][price_data][currency]`, 'usd');
    params.append(`line_items[${shippingIndex}][price_data][unit_amount]`, String(flatShippingCents));
    params.append(
      `line_items[${shippingIndex}][price_data][product_data][name]`,
      'Consolidated Flat-Rate Shipping (US & Canada)'
    );
    params.append(
      `line_items[${shippingIndex}][price_data][product_data][description]`,
      `Single flat fee covers all ${items.length} custom parts bundled together.`
    );
    params.append(`line_items[${shippingIndex}][quantity]`, '1');

    // Automatic tax & shipping collection
    params.append('automatic_tax[enabled]', 'true');
    params.append('shipping_address_collection[allowed_countries][0]', destination.country || 'US');
    if ((destination.country || 'US') !== 'CA') {
      params.append('shipping_address_collection[allowed_countries][1]', 'CA');
    }

    // Slant 3D Fulfillment metadata passed to webhook
    params.append('metadata[order_type]', 'pod_cart_bundle');
    params.append('metadata[fulfillment_provider]', 'slant3d');
    params.append('metadata[item_count]', String(items.length));
    params.append(
      'metadata[slant3d_bundle_manifest]',
      JSON.stringify(
        items.map(item => ({
          name: item.partName,
          stlUrl: stlFileUrls[item.id],
          material: 'PETG',
          color: 'Black',
          infill: 100,
          quantity: 1,
        }))
      ).slice(0, 500) // Keep Stripe metadata string under 500 chars limit
    );

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!stripeResponse.ok) {
      const errText = await stripeResponse.text();
      throw new Error(`Stripe API checkout failed (${stripeResponse.status}): ${errText}`);
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
        error: err.message || 'Internal server error during POD checkout',
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
