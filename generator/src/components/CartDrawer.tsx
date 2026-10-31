import React, { useState } from 'react';
import { CartItem, calculateCartPricing } from '../lib/cart';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Sparkles, Loader2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onClearCart,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isOpen) return null;

  const pricing = calculateCartPricing(cart);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/pod/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          destination: { country: 'US' },
        }),
      });

      const data: any = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to initiate POD checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err.message || 'Checkout connection error. Please try again.');
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#090d16] border-l border-slate-800 text-slate-100 h-full flex flex-col shadow-2xl z-10">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0c1220]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-sm tracking-wide">Custom Print-on-Demand Cart</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-mono">
              {cart.length} {cart.length === 1 ? 'part' : 'parts'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Shipping Incentive Banner */}
        {cart.length === 1 && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-200 text-xs flex items-center gap-2 shrink-0">
            <Truck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Add a 2nd part with <strong className="text-sky-300 font-semibold">$0 extra shipping</strong> (consolidated package pricing).
            </span>
          </div>
        )}

        {cart.length >= 2 && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-center gap-2 shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-emerald-300 font-semibold">Consolidated Shipping Active:</strong> Saves ~${pricing.shippingSavings.toFixed(2)} per additional part.
            </span>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-600 mb-3 stroke-[1.5]" />
              <p className="font-medium text-slate-300 text-sm">Your print cart is empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Tune any parametric component in the 3D viewport and click &quot;Add to Custom Print Cart&quot; to bundle parts.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 font-mono text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs truncate">
                    <span>{item.partName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                    {Object.entries(item.parametricConfig || {})
                      .slice(0, 4)
                      .map(([key, val]) => (
                        <span key={key} className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                          {key}: {typeof val === 'number' ? val.toFixed(1) : String(val)}
                        </span>
                      ))}
                  </div>
                  <div className="text-sky-400 font-bold mt-1.5 text-xs">
                    ${item.unitPriceUsd.toFixed(2)} USD
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors shrink-0"
                  title="Remove part"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-[#0c1220] shrink-0 space-y-3 font-mono text-xs">
            {checkoutError && (
              <div className="p-2 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs">
                {checkoutError}
              </div>
            )}

            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Parts Subtotal ({pricing.itemCount}):</span>
                <span className="font-bold text-slate-100">${pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1">
                  <span>Flat Consolidated Shipping:</span>
                  {cart.length >= 2 && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1 rounded border border-emerald-800">
                      SAVINGS ACTIVE
                    </span>
                  )}
                </span>
                <span className="font-bold text-slate-100">${pricing.shipping.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-slate-100">
                <span>Estimated Total:</span>
                <span className="text-sky-400 text-base">${pricing.total.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || cart.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-98 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Order...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Stripe Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manufactured via Slant 3D</span>
              </span>
              <button
                onClick={onClearCart}
                className="hover:text-rose-400 hover:underline"
              >
                Clear cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
