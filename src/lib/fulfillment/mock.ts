import type {
  FulfillmentProvider,
  FulfillmentOrderRequest,
  FulfillmentOrderResult,
  FulfillmentStatusResult
} from './types.ts';

export class MockFulfillmentProvider implements FulfillmentProvider {
  public readonly name = 'mock';
  private orders: Map<string, { request: FulfillmentOrderRequest; status: 'submitted' | 'printing' | 'shipped'; trackingNumber?: string }> = new Map();

  public async submitOrder(request: FulfillmentOrderRequest): Promise<FulfillmentOrderResult> {
    const podJobId = `mock_s3d_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    this.orders.set(podJobId, {
      request,
      status: 'submitted',
      trackingNumber: `1Z999BB3D${Math.floor(Math.random() * 89999999 + 10000000)}`
    });

    return {
      success: true,
      provider: this.name,
      podJobId,
      status: 'submitted',
      estimatedDispatchDays: 2,
      rawResponse: {
        mock: true,
        orderId: request.orderId,
        material: request.materialSpec,
        stlUrl: request.stlUrl
      }
    };
  }

  public async checkOrderStatus(jobId: string): Promise<FulfillmentStatusResult> {
    const found = this.orders.get(jobId);
    if (!found) {
      return {
        podJobId: jobId,
        status: 'submitted',
        trackingNumber: null,
        carrier: null
      };
    }

    return {
      podJobId: jobId,
      status: found.status,
      trackingNumber: found.trackingNumber || null,
      carrier: 'UPS Ground'
    };
  }

  public getMockOrders() {
    return Array.from(this.orders.entries());
  }
}
