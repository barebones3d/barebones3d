import React from 'react';
import { StandardComponent, buildAmazonAffiliateUrl } from '../lib/standardsCatalog';
import { ExternalLink, Zap } from 'lucide-react';

interface SmartSpecBannerProps {
  match: StandardComponent | null;
}

export const SmartSpecBanner: React.FC<SmartSpecBannerProps> = ({ match }) => {
  if (!match) return null;

  const amazonTag =
    ((globalThis as any).process?.env?.NEXT_PUBLIC_AMAZON_TAG) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AMAZON_TAG)) ||
    'barebones3d-20';

  const amazonUrl = buildAmazonAffiliateUrl(match.amazonSearchQuery, amazonTag);

  return (
    <div className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2 shadow-sm font-sans">
      <div className="flex items-center gap-1.5 min-w-0">
        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate">
          Standard size match: ~${match.estPriceUsd.toFixed(2)} on Amazon (faster &amp; cheaper than custom printing).
        </span>
      </div>
      <a
        href={amazonUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="shrink-0 inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-amber-100 hover:underline text-xs"
      >
        <span>View on Amazon</span>
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};
