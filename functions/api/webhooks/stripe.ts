import type { EnvBindings, ShippingAddress } from '../../../src/types/database.ts';
import {
  getDbAdapter,
  getPartById,
  createOrder,
  updateOrderStatus,
  createFulfillment
} from '../../../src/lib/db.ts';
import { verifyStripeSignature } from '../../../src/lib/stripe.ts';
import { getFulfillmentProvider } from '../../../src/lib/fulfillment/index.ts';
import { getR2AssetUrl } from '../../../src/lib/r2.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  const signatureHeader = request.headers.get('stripe-signature') || '';
  const rawBody = await request.text();

  // If live webhook secret is configured, verify HMAC signature using Web Crypto API
  if (env.STRIPE_WEBHOOK_SECRET) {
    const isValid = await verifyStripeSignature(rawBody, signatureHeader, env.STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid Stripe signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Malformed JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle successful checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;
    const customerEmail = session.customer_details?.email || session.customer_email || 'customer@example.com';
    const amountTotal = session.amount_total || 0;
    const partId = session.metadata?.part_id;

    if (!partId) {
      return new Response(JSON.stringify({ error: 'Missing part_id in session metadata' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database binding (DB) unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDbAdapter(env.DB);
    const part = await getPartById(db, partId);

    if (!part) {
      return new Response(JSON.stringify({ error: `Part not found in database: ${partId}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract Shipping Information
    const shippingDetails = session.shipping_details || session.customer_details;
    const shippingName = shippingDetails?.name || 'Customer';
    const rawAddr = shippingDetails?.address || {};
    
    const shippingAddress: ShippingAddress = {
      line1: rawAddr.line1 || '123 Main St',
      line2: rawAddr.line2 || null,
      city: rawAddr.city || 'Anytown',
      state: rawAddr.state || 'NC',
      postal_code: rawAddr.postal_code || '28801',
      country: rawAddr.country || 'US'
    };

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // 1. Record Order in D1
    await createOrder(db, {
      id: orderId,
      stripe_session_id: sessionId,
      stripe_customer_email: customerEmail,
      part_id: part.id,
      amount_total_cents: amountTotal,
      shipping_name: shippingName,
      shipping_address: shippingAddress,
      status: 'paid'
    });

    // 2. Resolve STL Asset URL
    const stlUrl = getR2AssetUrl(part.stl_r2_key, env);

    // 3. Dispatch to Fulfillment Provider (Slant 3D or Mock Adapter)
    const provider = getFulfillmentProvider(env);
    
    try {
      const podResult = await provider.submitOrder({
        orderId,
        customerEmail,
        shippingAddress: {
          name: shippingName,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postal_code,
          country: shippingAddress.country
        },
        partId: part.id,
        partTitle: part.title,
        oemPartNumber: part.oem_part_number,
        materialSpec: part.material_spec,
        stlUrl,
        quantity: 1,
        notes: `Order from barebones3d.com (${sessionId})`
      });

      // 4. Record Fulfillment Job
      const fulfillmentId = `ful_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await createFulfillment(db, {
        id: fulfillmentId,
        order_id: orderId,
        pod_provider: provider.name,
        pod_job_id: podResult.podJobId,
        tracking_number: podResult.trackingNumber || null,
        carrier: 'UPS Ground',
        status: 'submitted'
      });

      // 5. Update Order Status
      await updateOrderStatus(db, orderId, 'routed_to_pod');

      return new Response(JSON.stringify({
        received: true,
        orderId,
        podJobId: podResult.podJobId,
        status: 'routed_to_pod'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (fulfillErr: any) {
      // Order is saved as paid, but fulfillment dispatch flagged for manual retry
      return new Response(JSON.stringify({
        received: true,
        orderId,
        warning: `Fulfillment dispatch deferred: ${fulfillErr.message}`
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
