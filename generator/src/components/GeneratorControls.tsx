import React, { useState } from 'react';
import * as THREE from 'three';
import { Download, ShoppingBag, Truck, AlertTriangle, CheckCircle, ShieldCheck, Layers, Loader2 } from 'lucide-react';
import { PrimitiveType } from '../generators/types';
import { getGeneratorManifest } from '../lib/generatorManifests';
import { ManifoldValidationResult } from '../utils/manifoldValidation';
import { generateSTLBlob, exportSTL } from '../utils/stlExport';
import { SmartSpecBanner } from './SmartSpecBanner';
import { ConsumablesAffiliateToolbar } from './ConsumablesAffiliateToolbar';
import { StandardComponent } from '../lib/standardsCatalog';

export interface GeneratorControlsProps {
  activeModel: PrimitiveType;
  geometry: THREE.BufferGeometry | null;
  parameters: Record<string, any>;
  validation: ManifoldValidationResult;
  onAddToCart?: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  standardMatch?: StandardComponent | null;
}

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  activeModel,
  geometry,
  parameters,
  validation,
  onAddToCart,
  cartCount = 0,
  onOpenCart,
  standardMatch,
}) => {
  const manifest = getGeneratorManifest(activeModel);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(manifest.defaultMaterial);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Verification Tier gating rules
  const isPodGated = manifest.tier === 'raw_generated';
  const isManifold = validation.isManifold;
  const canOrderPod = !isPodGated && isManifold && !!geometry;
  const formattedPrice = `$${(manifest.retailPriceCents / 100).toFixed(2)}`;

  // 1. Free STL Download Handler with CC BY-NC 4.0 notice in 80-byte header
  const handleFreeDownload = () => {
    if (!geometry) return;
    exportSTL(geometry, {
      partNumber: manifest.partNumber,
      partTitle: manifest.title,
      filename: `${manifest.partNumber.toLowerCase()}_${Date.now()}.stl`,
      binary: true,
      license: 'CC BY-NC 4.0',
    });
  };

  // 2. Slant 3D & Stripe Print-on-Demand Pipeline
  const handleOrderProductionPrint = async () => {
    if (!canOrderPod || !geometry) return;
    setIsOrdering(true);
    setOrderError(null);

    try {
      // Step A: Generate binary STL in browser memory
      const stlBlob = generateSTLBlob(geometry, {
        partNumber: manifest.partNumber,
        partTitle: manifest.title,
        binary: true,
        license: 'CC BY-NC 4.0',
      });

      // Step B: Upload binary STL to Cloudflare R2 ephemeral storage
      const uploadRes = await fetch('/api/order/presign-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'model/stl',
          'X-Filename': `${manifest.partNumber}.stl`,
        },
        body: stlBlob,
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${uploadRes.status}`);
      }

      const uploadJson = await uploadRes.json();
      const stlUrl = uploadJson.stlUrl;

      // Step C: Create Stripe Checkout Session passing Slant 3D fulfillment metadata
      const checkoutRes = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partNumber: manifest.partNumber,
          title: manifest.title,
          manifestId: manifest.id,
          targetMaterial: selectedMaterial,
          priceCents: manifest.retailPriceCents,
          stlUrl,
          parameters,
          quantity: 1,
        }),
      });

      if (!checkoutRes.ok) {
        const checkoutErr = await checkoutRes.json().catch(() => ({}));
        throw new Error(checkoutErr.error || `Checkout failed with status ${checkoutRes.status}`);
      }

      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error('No checkout URL returned from session creator');
      }
    } catch (err: any) {
      console.error('POD order failed:', err);
      setOrderError(err.message || 'Failed to initialize POD checkout');
      setIsOrdering(false);
    }
  };

  return (
    <div className="p-3 border-t border-slate-800 bg-[#090d16] shrink-0 font-mono space-y-2.5">
      {/* Smart Commodity Spec Banner */}
      <SmartSpecBanner match={standardMatch ?? null} />

      {/* Engineering Quality & Verification Manifest Badge */}
      <div className="flex items-center justify-between text-[11px] bg-[#0f172a] border border-slate-800 rounded-lg px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          {manifest.tier === 'production_certified' ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified CAD</span>
            </span>
          ) : manifest.tier === 'geometry_verified' ? (
            <span className="flex items-center gap-1 text-sky-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified CAD</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Experimental CAD</span>
            </span>
          )}
        </div>

        {/* Live Topological Manifold Indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              validation.isManifold
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                : 'bg-red-950/60 text-red-300 border-red-800/80 animate-pulse'
            }`}
            title={`Open: ${validation.openEdges}, Multi: ${validation.multiEdges}, Flipped: ${validation.flippedEdges}, χ: ${validation.eulerCharacteristic}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${validation.isManifold ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span>{validation.statusText}</span>
          </span>
        </div>
      </div>

      {/* Production POD Material Picker */}
      {!isPodGated && manifest.supportedMaterials.length > 1 && (
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[10px] flex items-center gap-1">
            <Layers className="w-3 h-3 text-sky-400" />
            <span>Material:</span>
          </span>
          <div className="flex items-center gap-1">
            {manifest.supportedMaterials.map((mat) => (
              <button
                key={mat}
                onClick={() => setSelectedMaterial(mat)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  selectedMaterial === mat
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="space-y-1.5">
        {/* Order Production Print Button */}
        <button
          onClick={handleOrderProductionPrint}
          disabled={!canOrderPod || isOrdering}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition-all shadow-md ${
            isOrdering
              ? 'bg-emerald-800/50 text-emerald-200 cursor-wait'
              : canOrderPod
              ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-emerald-600/20'
              : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
          }`}
          title={
            isPodGated
              ? 'CAD design is in experimental tier and not certified for direct POD manufacturing'
              : !isManifold
              ? 'Mesh has topological defects; adjust parameters to restore 2-manifold solid'
              : `Order physical industrial FDM part in ${selectedMaterial}`
          }
        >
          {isOrdering ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
              <span>Preparing Slant 3D Order...</span>
            </>
          ) : isPodGated ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>POD Gated: Unverified CAD</span>
            </>
          ) : !isManifold ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Mesh Non-Manifold ({validation.openEdges} open edges)</span>
            </>
          ) : (
            <>
              <Truck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Order Production Print ({formattedPrice})</span>
            </>
          )}
        </button>

        {orderError && (
          <div className="text-[10px] text-red-400 bg-red-950/40 border border-red-800/50 rounded px-2 py-1">
            {orderError}
          </div>
        )}

        {/* Free STL Download and Add to Cart Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Download Free STL Button */}
          <button
            onClick={handleFreeDownload}
            className="relative flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-98 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/20"
            title="Download watertight binary STL file with embedded CC BY-NC 4.0 license"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="truncate">Download STL</span>
            {isPodGated && (
              <span className="px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700 text-[9px] uppercase tracking-wider font-extrabold">
                EXP
              </span>
            )}
          </button>

          {/* Add to Print Cart Button */}
          <button
            onClick={onAddToCart}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-bold text-xs transition-all border border-slate-700"
            title="Add part to Custom Print Cart for consolidated shipping"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-300" />
            <span className="truncate">Add to Cart</span>
            {cartCount > 0 && (
              <span
                onClick={(e) => {
                  if (onOpenCart) {
                    e.stopPropagation();
                    onOpenCart();
                  }
                }}
                className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] hover:bg-emerald-900 cursor-pointer"
                title="View cart drawer"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Contextual Amazon Hardware & Consumables Affiliate Toolbar */}
      <ConsumablesAffiliateToolbar activeModel={activeModel} />
    </div>
  );
};
