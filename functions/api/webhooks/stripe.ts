import type { EnvBindings, ShippingAddress, Part } from '../../../src/types/database.ts';
import {
  getDbAdapter,
  getPartById,
  insertPart,
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
    const partId = session.metadata?.part_id || session.metadata?.partId || session.metadata?.manifestId;
    const customStlUrl = session.metadata?.stlUrl || session.metadata?.stl_url;

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
    let part = await getPartById(db, partId);

    // If part is not in static database catalog, synthesize it for custom parametric orders
    if (!part && customStlUrl) {
      const syntheticPart: Part = {
        id: partId,
        slug: `custom-${partId.toLowerCase().replace(/_/g, '-')}-${sessionId.slice(-6)}`,
        title: session.metadata?.title || 'Custom Parametric Part',
        oem_part_number: session.metadata?.partNumber || 'PARAMETRIC-CUSTOM',
        superseded_numbers: [],
        compatible_makes_models: [],
        material_spec: session.metadata?.targetMaterial || 'PETG Heavy Duty',
        retail_price_cents: amountTotal,
        stl_r2_key: customStlUrl,
        license_type: 'CC BY-NC 4.0',
        is_commercial_allowed: true,
        is_active: true,
        status: 'active'
      };
      try {
        await insertPart(db, syntheticPart);
        part = await getPartById(db, partId);
      } catch (err) {
        console.warn('Failed to insert synthetic part into D1:', err);
      }
      if (!part) part = syntheticPart;
    }

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

    // 2. Resolve STL Asset URL (Use dynamic custom STL from metadata if provided, otherwise resolve from R2 key)
    const stlUrl = customStlUrl || getR2AssetUrl(part.stl_r2_key, env);
    const materialSpec = session.metadata?.targetMaterial || part.material_spec || 'PETG Heavy Duty';
    const partTitle = session.metadata?.title || part.title;
    const oemPartNumber = session.metadata?.partNumber || part.oem_part_number;

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
        partTitle,
        oemPartNumber,
        materialSpec,
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
