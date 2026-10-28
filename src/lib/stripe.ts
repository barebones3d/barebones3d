import type { Part } from '../types/database.ts';

export interface CreateCheckoutSessionOptions {
  part: Part;
  quantity?: number;
  siteUrl: string;
  stripeSecretKey?: string;
  isMock?: boolean;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

/**
 * Creates a Stripe Checkout Session with Address Collection and Automatic Tax.
 * In mock mode, generates a valid mock session without external network calls.
 */
export async function createCheckoutSession(
  options: CreateCheckoutSessionOptions
): Promise<CheckoutSessionResult> {
  const { part, quantity = 1, siteUrl, stripeSecretKey, isMock } = options;

  if (!part.is_commercial_allowed) {
    throw new Error('Commercial reproduction is not permitted under this part\'s license.');
  }

  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  // Mock Mode for local testing and CI/CD
  if (isMock || !stripeSecretKey || stripeSecretKey.startsWith('mock_')) {
    const mockSessionId = `cs_test_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      sessionId: mockSessionId,
      url: `${cleanSiteUrl}/order-success?session_id=${mockSessionId}&mock=true`
    };
  }

  // Live Stripe API call using standard fetch and URLSearchParams
  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('success_url', `${cleanSiteUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`);
  params.append('cancel_url', `${cleanSiteUrl}/guides/${part.slug}?cancelled=1`);
  
  // Line items
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][unit_amount]', String(part.retail_price_cents));
  params.append('line_items[0][price_data][product_data][name]', `${part.title} (OEM #${part.oem_part_number})`);
  params.append('line_items[0][price_data][product_data][description]', `3D Printed Reproduction in ${part.material_spec}`);
  params.append('line_items[0][price_data][product_data][metadata][part_id]', part.id);
  params.append('line_items[0][price_data][product_data][metadata][oem_part_number]', part.oem_part_number);
  params.append('line_items[0][quantity]', String(quantity));

  // Automatic Tax
  params.append('automatic_tax[enabled]', 'true');

  // Shipping Address Collection (US and CA)
  params.append('shipping_address_collection[allowed_countries][0]', 'US');
  params.append('shipping_address_collection[allowed_countries][1]', 'CA');

  // Metadata
  params.append('metadata[part_id]', part.id);
  params.append('metadata[material_spec]', part.material_spec);
  params.append('metadata[slug]', part.slug);

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Stripe Checkout Session creation failed (${response.status}): ${errText}`);
  }

  const session: any = await response.json();
  return {
    sessionId: session.id,
    url: session.url
  };
}

/**
 * Timing-safe string comparison to prevent side-channel timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifies a Stripe Webhook signature using Web Crypto API (SubtleCrypto).
 * Works directly in Cloudflare Workers, Pages Functions, and modern Node.js.
 */
export async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string,
  toleranceSeconds: number = 300
): Promise<boolean> {
  if (!signatureHeader || !webhookSecret) {
    return false;
  }

  // Parse header: t=timestamp,v1=signature
  const parts = signatureHeader.split(',');
  let timestamp: string | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.trim().split('=');
    if (key === 't') {
      timestamp = value;
    } else if (key === 'v1') {
      signatures.push(value);
    }
  }

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  // Check timestamp drift
  const tsNum = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (toleranceSeconds > 0 && Math.abs(now - tsNum) > toleranceSeconds) {
    return false;
  }

  // Compute expected HMAC SHA-256 using Web Crypto
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signedPayload = `${timestamp}.${rawBody}`;
  const signedBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedSignature = Array.from(new Uint8Array(signedBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Compare with any provided v1 signatures
  for (const sig of signatures) {
    if (timingSafeEqual(sig, expectedSignature)) {
      return true;
    }
  }

  return false;
}

/**
 * Helper to generate valid Stripe signature headers for testing and webhook simulation.
 */
export async function generateStripeSignatureHeader(
  rawBody: string,
  webhookSecret: string,
  timestamp?: number
): Promise<string> {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signedPayload = `${ts}.${rawBody}`;
  const signedBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const hex = Array.from(new Uint8Array(signedBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `t=${ts},v1=${hex}`;
}

export interface StripeSyncResult {
  productId: string;
  priceId: string;
  action: 'created' | 'updated' | 'unchanged';
}

/**
 * Synchronizes a Barebones 3D commercial replacement part with Stripe Products and Prices.
 */
export async function syncStripeProduct(
  stripeSecretKey: string,
  part: Part,
  siteUrl: string = 'https://barebones3d.com'
): Promise<StripeSyncResult> {
  if (!part.is_commercial_allowed) {
    throw new Error(`Part ${part.id} is non-commercial and cannot be synchronized to Stripe.`);
  }

  const authHeader = {
    'Authorization': `Bearer ${stripeSecretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  // 1. Search for existing product with matching part_id in metadata
  const listRes = await fetch(`https://api.stripe.com/v1/products?limit=100`, {
    headers: { 'Authorization': `Bearer ${stripeSecretKey}` }
  });
  if (!listRes.ok) {
    const errText = await listRes.text();
    throw new Error(`Failed to list Stripe products: ${errText}`);
  }
  const listData: any = await listRes.json();
  const existingProduct = (listData.data || []).find((p: any) => p.metadata?.part_id === part.id || p.metadata?.slug === part.slug);

  let productId = existingProduct?.id;
  let action: 'created' | 'updated' | 'unchanged' = 'unchanged';

  const productParams = new URLSearchParams();
  productParams.append('name', `${part.title} (OEM #${part.oem_part_number})`);
  productParams.append('description', `3D Printed Commercial Reproduction in ${part.material_spec}. Compatible with ${part.oem_part_number}.`);
  productParams.append('metadata[part_id]', part.id);
  productParams.append('metadata[oem_part_number]', part.oem_part_number);
  productParams.append('metadata[slug]', part.slug);
  productParams.append('metadata[material_spec]', part.material_spec);
  productParams.append('active', String(Boolean(part.is_active)));
  productParams.append('tax_code', 'txcd_99999999'); // Tangible personal property

  if (productId) {
    // Update existing product
    const updateRes = await fetch(`https://api.stripe.com/v1/products/${productId}`, {
      method: 'POST',
      headers: authHeader,
      body: productParams.toString()
    });
    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Failed to update Stripe product ${productId}: ${err}`);
    }
  } else {
    // Create new product
    action = 'created';
    const createRes = await fetch(`https://api.stripe.com/v1/products`, {
      method: 'POST',
      headers: authHeader,
      body: productParams.toString()
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create Stripe product: ${err}`);
    }
    const created: any = await createRes.json();
    productId = created.id;
  }

  // 2. Check and sync active price
  const priceListRes = await fetch(`https://api.stripe.com/v1/prices?product=${productId}&active=true`, {
    headers: { 'Authorization': `Bearer ${stripeSecretKey}` }
  });
  if (!priceListRes.ok) {
    const errText = await priceListRes.text();
    throw new Error(`Failed to list Stripe prices: ${errText}`);
  }
  const priceData: any = await priceListRes.json();
  const activePrices = priceData.data || [];
  const matchingPrice = activePrices.find((pr: any) => pr.unit_amount === part.retail_price_cents && pr.currency === 'usd');

  let priceId = matchingPrice?.id;

  if (!priceId) {
    if (existingProduct) action = 'updated';
    // Archive old active prices if amount changed
    for (const oldPrice of activePrices) {
      await fetch(`https://api.stripe.com/v1/prices/${oldPrice.id}`, {
        method: 'POST',
        headers: authHeader,
        body: new URLSearchParams({ active: 'false' }).toString()
      });
    }

    // Create new price
    const newPriceParams = new URLSearchParams();
    newPriceParams.append('product', productId);
    newPriceParams.append('currency', 'usd');
    newPriceParams.append('unit_amount', String(part.retail_price_cents));
    newPriceParams.append('tax_behavior', 'exclusive');
    newPriceParams.append('metadata[part_id]', part.id);

    const createPriceRes = await fetch(`https://api.stripe.com/v1/prices`, {
      method: 'POST',
      headers: authHeader,
      body: newPriceParams.toString()
    });
    if (!createPriceRes.ok) {
      const err = await createPriceRes.text();
      throw new Error(`Failed to create Stripe price: ${err}`);
    }
    const createdPrice: any = await createPriceRes.json();
    priceId = createdPrice.id;
  }

  return { productId, priceId, action };
}

