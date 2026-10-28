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
