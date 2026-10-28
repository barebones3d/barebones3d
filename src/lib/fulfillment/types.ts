export interface FulfillmentAddress {
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface FulfillmentOrderRequest {
  orderId: string;
  customerEmail: string;
  shippingAddress: FulfillmentAddress;
  partId: string;
  partTitle: string;
  oemPartNumber: string;
  materialSpec: string;
  stlUrl: string;
  quantity: number;
  notes?: string;
}

export interface FulfillmentOrderResult {
  success: boolean;
  provider: string;
  podJobId: string;
  status: 'submitted' | 'printing' | 'shipped' | 'delivered' | 'failed';
  estimatedDispatchDays?: number;
  trackingNumber?: string | null;
  rawResponse?: any;
}

export interface FulfillmentStatusResult {
  podJobId: string;
  status: 'submitted' | 'printing' | 'shipped' | 'delivered' | 'failed';
  trackingNumber?: string | null;
  carrier?: string | null;
  rawResponse?: any;
}

export interface FulfillmentProvider {
  readonly name: string;
  submitOrder(request: FulfillmentOrderRequest): Promise<FulfillmentOrderResult>;
  checkOrderStatus(jobId: string): Promise<FulfillmentStatusResult>;
}
