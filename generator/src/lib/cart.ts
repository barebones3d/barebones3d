// generator/src/lib/cart.ts

export interface CartItem {
  id: string;
  partName: string;
  partType: string;
  parametricConfig: Record<string, any>;
  stlBlobRef?: string;
  unitPriceUsd: number;
  createdAt: number;
}

const STORAGE_KEY = 'barebones3d_pod_cart';

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load cart from localStorage:', err);
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
}

export function calculateCartPricing(items: CartItem[]) {
  const count = items.length;
  const subtotal = items.reduce((acc, item) => acc + item.unitPriceUsd, 0);
  const flatShipping = count > 0 ? 5.99 : 0;
  // Consolidated shipping savings: ~$5.50 per additional part after the first
  const shippingSavings = count >= 2 ? (count - 1) * 5.50 : 0;
  const total = subtotal + flatShipping;

  return {
    itemCount: count,
    subtotal: Number(subtotal.toFixed(2)),
    shipping: Number(flatShipping.toFixed(2)),
    shippingSavings: Number(shippingSavings.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}
