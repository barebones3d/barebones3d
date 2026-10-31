// lib/standardsCatalog.ts

export interface StandardComponent {
  id: string;
  name: string;
  category: 'gt2_pulley' | 'bearing' | 'hardware';
  params: {
    teeth?: number;
    boreMm?: number;
    beltWidthMm?: number;
    innerDiaMm?: number;
    outerDiaMm?: number;
    thicknessMm?: number;
  };
  estPriceUsd: number;
  amazonSearchQuery: string;
}

export const COMMODITY_CATALOG: StandardComponent[] = [
  // Common GT2 Timing Pulleys (6mm & 10mm belt)
  { id: 'gt2-16t-b5-w6', name: 'GT2 16T Pulley (5mm Bore, 6mm Belt)', category: 'gt2_pulley', params: { teeth: 16, boreMm: 5, beltWidthMm: 6 }, estPriceUsd: 2.99, amazonSearchQuery: 'GT2 16 teeth pulley 5mm bore 6mm belt' },
  { id: 'gt2-20t-b5-w6', name: 'GT2 20T Pulley (5mm Bore, 6mm Belt)', category: 'gt2_pulley', params: { teeth: 20, boreMm: 5, beltWidthMm: 6 }, estPriceUsd: 2.99, amazonSearchQuery: 'GT2 20 teeth pulley 5mm bore 6mm belt' },
  { id: 'gt2-20t-b8-w6', name: 'GT2 20T Pulley (8mm Bore, 6mm Belt)', category: 'gt2_pulley', params: { teeth: 20, boreMm: 8, beltWidthMm: 6 }, estPriceUsd: 3.49, amazonSearchQuery: 'GT2 20 teeth pulley 8mm bore 6mm belt' },
  { id: 'gt2-20t-b5-w10', name: 'GT2 20T Pulley (5mm Bore, 10mm Belt)', category: 'gt2_pulley', params: { teeth: 20, boreMm: 5, beltWidthMm: 10 }, estPriceUsd: 3.99, amazonSearchQuery: 'GT2 20 teeth pulley 5mm bore 10mm belt' },
  { id: 'gt2-36t-b5-w6', name: 'GT2 36T Pulley (5mm Bore, 6mm Belt)', category: 'gt2_pulley', params: { teeth: 36, boreMm: 5, beltWidthMm: 6 }, estPriceUsd: 4.49, amazonSearchQuery: 'GT2 36 teeth pulley 5mm bore 6mm belt' },
  { id: 'gt2-36t-b8-w6', name: 'GT2 36T Pulley (8mm Bore, 6mm Belt)', category: 'gt2_pulley', params: { teeth: 36, boreMm: 8, beltWidthMm: 6 }, estPriceUsd: 4.49, amazonSearchQuery: 'GT2 36 teeth pulley 8mm bore 6mm belt' },
  { id: 'gt2-60t-b5-w6', name: 'GT2 60T Pulley (5mm Bore, 6mm Belt)', category: 'gt2_pulley', params: { teeth: 60, boreMm: 5, beltWidthMm: 6 }, estPriceUsd: 5.99, amazonSearchQuery: 'GT2 60 teeth pulley 5mm bore 6mm belt' },
  { id: 'gt2-60t-b8-w6', name: 'GT2 60T Pulley (8mm Bore, 6mm Belt)', category: 'gt2_pulley', params: { teeth: 60, boreMm: 8, beltWidthMm: 6 }, estPriceUsd: 5.99, amazonSearchQuery: 'GT2 60 teeth pulley 8mm bore 6mm belt' },

  // Standard Ball Bearings
  { id: 'brg-608-2rs', name: '608-2RS Bearing (8x22x7mm)', category: 'bearing', params: { innerDiaMm: 8, outerDiaMm: 22, thicknessMm: 7 }, estPriceUsd: 1.25, amazonSearchQuery: '608-2RS ball bearings' },
  { id: 'brg-625-2rs', name: '625-2RS Bearing (5x16x5mm)', category: 'bearing', params: { innerDiaMm: 5, outerDiaMm: 16, thicknessMm: 5 }, estPriceUsd: 1.40, amazonSearchQuery: '625-2RS ball bearings' },
  { id: 'brg-mr105-2rs', name: 'MR105-2RS Bearing (5x10x4mm)', category: 'bearing', params: { innerDiaMm: 5, outerDiaMm: 10, thicknessMm: 4 }, estPriceUsd: 1.50, amazonSearchQuery: 'MR105-2RS bearing' }
];

export function findMatchingStandardPulley(teeth: number, boreMm: number, beltWidthMm: number): StandardComponent | null {
  return COMMODITY_CATALOG.find(item => 
    item.category === 'gt2_pulley' &&
    item.params.teeth === teeth &&
    Math.abs((item.params.boreMm ?? 0) - boreMm) < 0.05 &&
    Math.abs((item.params.beltWidthMm ?? 0) - beltWidthMm) < 0.2
  ) ?? null;
}

export function buildAmazonAffiliateUrl(searchQuery: string, tag?: string): string {
  const resolvedTag = tag || 
    ((globalThis as any).process?.env?.NEXT_PUBLIC_AMAZON_TAG) ||
    'barebones3d-20';
  const cleanTag = encodeURIComponent(resolvedTag);
  return `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${cleanTag}`;
}
