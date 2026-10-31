import React from 'react';
import { PrimitiveType } from '../generators/types';
import { buildAmazonAffiliateUrl } from '../lib/standardsCatalog';
import { getContextualConsumables } from '../lib/consumables';
import { ExternalLink } from 'lucide-react';

interface ConsumablesAffiliateToolbarProps {
  activeModel: PrimitiveType;
}

export const ConsumablesAffiliateToolbar: React.FC<ConsumablesAffiliateToolbarProps> = ({ activeModel }) => {
  const pills = getContextualConsumables(activeModel);

  const amazonTag =
    ((globalThis as any).process?.env?.NEXT_PUBLIC_AMAZON_TAG) ||
    ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AMAZON_TAG)) ||
    'barebones3d-20';

  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0 w-full"
      title="Recommended Hardware & Consumables"
    >
      <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono shrink-0 select-none">
        Hardware:
      </span>
      {pills.map((pill) => {
        const affiliateUrl = buildAmazonAffiliateUrl(pill.searchQuery, amazonTag);
        return (
          <a
            key={pill.label}
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-xs px-2.5 py-1 rounded-full border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
            title={`Buy ${pill.label} on Amazon`}
          >
            <span>{pill.label}</span>
            <ExternalLink className="w-2.5 h-2.5 text-neutral-400 group-hover:text-neutral-200 shrink-0" />
          </a>
        );
      })}
    </div>
  );
};
