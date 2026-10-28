import type {
  FulfillmentProvider,
  FulfillmentOrderRequest,
  FulfillmentOrderResult,
  FulfillmentStatusResult
} from './types.ts';

export interface Slant3DConfig {
  apiKey: string;
  apiUrl?: string;
  platformId?: string;
}

/**
 * Normalizes Barebones 3D material specifications into Slant 3D standard manufacturing materials.
 */
export function normalizeSlant3DMaterial(materialSpec: string): string {
  const norm = materialSpec.toUpperCase();
  if (norm.includes('ASA')) return 'ASA';
  if (norm.includes('PETG')) return 'PETG';
  if (norm.includes('NYLON') || norm.includes('PA12')) return 'Nylon';
  if (norm.includes('POLYCARBONATE') || norm.includes('PC')) return 'Polycarbonate';
  return 'PETG'; // High-durability default for mechanical replacement parts
}

/**
 * Slant 3D API fulfillment provider adapter.
 * Handles automated Print-on-Demand order submission and status polling.
 */
export class Slant3DFulfillmentProvider implements FulfillmentProvider {
  public readonly name = 'slant3d';
  private apiKey: string;
  private apiUrl: string;
  private platformId: string;

  constructor(config: Slant3DConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = (config.apiUrl || 'https://slant3dapi.com/v2/api').replace(/\/$/, '');
    this.platformId = config.platformId || 'ced31d72-901f-4e75-8db4-964169ff34dc';
  }

  public async submitOrder(request: FulfillmentOrderRequest): Promise<FulfillmentOrderResult> {
    if (!this.apiKey) {
      throw new Error('Slant3DFulfillmentProvider: Missing SLANT3D_API_KEY');
    }

    const payload = {
      orderId: request.orderId,
      customerEmail: request.customerEmail,
      fileURL: request.stlUrl,
      fileName: `${request.oemPartNumber}.stl`,
      material: normalizeSlant3DMaterial(request.materialSpec),
      color: 'Black', // Industrial OEM standard
      infill: 100, // 100% solid mechanical grade
      quantity: request.quantity,
      shippingAddress: {
        name: request.shippingAddress.name,
        address1: request.shippingAddress.line1,
        address2: request.shippingAddress.line2 || '',
        city: request.shippingAddress.city,
        state: request.shippingAddress.state,
        zip: request.shippingAddress.postalCode,
        country: request.shippingAddress.country
      },
      metadata: {
        partId: request.partId,
        oemPartNumber: request.oemPartNumber,
        source: 'barebones3d.com'
      }
    };

    const response = await fetch(`${this.apiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Slant-Platform-Id': this.platformId
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Slant 3D API submission failed (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    const podJobId = data.orderId || data.id || data.jobId || `s3d_${Date.now()}`;

    return {
      success: true,
      provider: this.name,
      podJobId: String(podJobId),
      status: 'submitted',
      estimatedDispatchDays: data.estimatedDispatchDays || 2,
      rawResponse: data
    };
  }

  public async checkOrderStatus(jobId: string): Promise<FulfillmentStatusResult> {
    if (!this.apiKey) {
      throw new Error('Slant3DFulfillmentProvider: Missing SLANT3D_API_KEY');
    }

    const response = await fetch(`${this.apiUrl}/orders/${encodeURIComponent(jobId)}`, {
      method: 'GET',
      headers: {
        'api-key': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Slant-Platform-Id': this.platformId
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Slant 3D order status lookup failed (${response.status}): ${errText}`);
    }

    const data: any = await response.json();
    
    // Map Slant 3D internal statuses to our standard status
    let mappedStatus: 'submitted' | 'printing' | 'shipped' | 'delivered' | 'failed' = 'submitted';
    const s = String(data.status || '').toLowerCase();
    if (s.includes('print') || s.includes('queue') || s.includes('processing')) {
      mappedStatus = 'printing';
    } else if (s.includes('ship') || s.includes('transit')) {
      mappedStatus = 'shipped';
    } else if (s.includes('deliver') || s.includes('complete')) {
      mappedStatus = 'delivered';
    } else if (s.includes('fail') || s.includes('cancel') || s.includes('error')) {
      mappedStatus = 'failed';
    }

    return {
      podJobId: jobId,
      status: mappedStatus,
      trackingNumber: data.trackingNumber || data.tracking_number || null,
      carrier: data.carrier || null,
      rawResponse: data
    };
  }
}
