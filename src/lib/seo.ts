import type { Part, Guide } from '../types/database.ts';

/**
 * Converts a human-readable duration (e.g., "45 mins", "1 hour", "15-30 minutes")
 * to an ISO 8601 duration string (e.g., "PT45M", "PT1H").
 */
export function formatIsoDuration(humanDuration: string): string {
  const matchMins = humanDuration.match(/(\d+)\s*(?:m|min|mins|minutes)/i);
  if (matchMins) {
    return `PT${matchMins[1]}M`;
  }
  const matchHours = humanDuration.match(/(\d+)\s*(?:h|hr|hrs|hours)/i);
  if (matchHours) {
    return `PT${matchHours[1]}H`;
  }
  return 'PT30M';
}

/**
 * Standardized multimodal image paths:
 * /assets/parts/[oem-number]-[slug]-[broken|reproduction|installed].webp
 */
export function getStandardPartImages(part: Part, siteUrl: string) {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');
  const oemClean = part.oem_part_number.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const base = `${cleanSiteUrl}/assets/parts/${oemClean}-${part.slug}`;

  return {
    reproduction: `${base}-reproduction.webp`,
    broken: `${base}-broken.webp`,
    installed: `${base}-installed.webp`
  };
}

/**
 * Generates Schema.org HowTo structured data for repair guides with rich multimodal imagery.
 */
export function generateHowToSchema(part: Part, guide: Guide, siteUrl: string): Record<string, any> {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');
  const guideUrl = `${cleanSiteUrl}/guides/${part.slug}`;
  const images = getStandardPartImages(part, siteUrl);
  const oemClean = part.oem_part_number.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${guideUrl}#howto`,
    'name': `How to Repair / Replace ${part.title} (OEM #${part.oem_part_number})`,
    'description': `Complete step-by-step DIY installation and repair guide for ${part.title}. Includes required tools, disassembly instructions, free 3D printable STL files, and OEM fitment details.`,
    'totalTime': formatIsoDuration(guide.time_estimate),
    'estimatedCost': {
      '@type': 'MonetaryAmount',
      'currency': 'USD',
      'value': part.is_commercial_allowed ? (part.retail_price_cents / 100).toFixed(2) : '0.00'
    },
    'image': [
      {
        '@type': 'ImageObject',
        'url': images.reproduction,
        'width': 1920,
        'height': 1080,
        'caption': `Original broken plastic ${part.title} (OEM #${part.oem_part_number}) shown side-by-side with reinforced 3D printed ${part.material_spec} reproduction.`
      },
      {
        '@type': 'ImageObject',
        'url': images.broken,
        'width': 1920,
        'height': 1080,
        'caption': `Failed OEM #${part.oem_part_number} component with typical stress fatigue cracking.`
      },
      {
        '@type': 'ImageObject',
        'url': images.installed,
        'width': 1920,
        'height': 1080,
        'caption': `Reproduction ${part.material_spec} component fully installed in ${part.compatible_makes_models[0]?.make || 'OEM'} assembly.`
      }
    ],
    'tool': guide.tools_needed.map(tool => ({
      '@type': 'HowToTool',
      'name': tool.name,
      ...(tool.purpose ? { 'description': tool.purpose } : {})
    })),
    'supply': [
      {
        '@type': 'HowToSupply',
        'name': `${part.title} (${part.material_spec})`
      }
    ],
    'step': guide.steps.map((step, idx) => {
      const stepImgUrl = `${cleanSiteUrl}/assets/parts/${oemClean}-${part.slug}-step-${step.step_number}.webp`;
      return {
        '@type': 'HowToStep',
        'position': idx + 1,
        'name': step.title,
        'url': `${guideUrl}#step-${step.step_number}`,
        'text': step.text,
        'image': {
          '@type': 'ImageObject',
          'url': step.image_url ? (step.image_url.startsWith('http') ? step.image_url : `${cleanSiteUrl}${step.image_url}`) : stepImgUrl,
          'width': 1920,
          'height': 1080,
          'caption': `Step ${step.step_number}: ${step.title} for ${part.title} (OEM #${part.oem_part_number})`
        }
      };
    })
  };
}

/**
 * Generates Schema.org Product structured data for aftermarket replacement parts with visual identification images.
 */
export function generateProductSchema(part: Part, siteUrl: string): Record<string, any> {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');
  const guideUrl = `${cleanSiteUrl}/guides/${part.slug}`;
  const priceDollars = part.is_commercial_allowed ? (part.retail_price_cents / 100).toFixed(2) : '0.00';
  const primaryMake = part.compatible_makes_models[0]?.make || 'Aftermarket';
  const images = getStandardPartImages(part, siteUrl);

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${guideUrl}#product`,
    'name': `${part.title} - Aftermarket OEM #${part.oem_part_number}`,
    'description': `Commercial-grade 3D printed replacement for discontinued OEM #${part.oem_part_number}. Manufactured in high-performance ${part.material_spec} with precision printer compensation.`,
    'sku': `BB3D-${part.oem_part_number}`,
    'mpn': part.oem_part_number,
    'brand': {
      '@type': 'Brand',
      'name': 'Barebones 3D'
    },
    'category': 'Hardware > Replacement Parts & Diagnostic Components',
    'material': part.material_spec,
    'url': guideUrl,
    'image': [
      {
        '@type': 'ImageObject',
        'url': images.reproduction,
        'width': 1920,
        'height': 1080,
        'caption': `Original broken plastic ${part.title} (OEM #${part.oem_part_number}) shown side-by-side with reinforced 3D printed ${part.material_spec} reproduction.`
      },
      {
        '@type': 'ImageObject',
        'url': images.broken,
        'width': 1920,
        'height': 1080,
        'caption': `Failed OEM #${part.oem_part_number} component with typical stress fatigue cracking.`
      },
      {
        '@type': 'ImageObject',
        'url': images.installed,
        'width': 1920,
        'height': 1080,
        'caption': `Reproduction ${part.material_spec} component fully installed in ${primaryMake} assembly.`
      }
    ],
    'offers': {
      '@type': 'Offer',
      'url': guideUrl,
      'priceCurrency': 'USD',
      'price': priceDollars,
      'priceValidUntil': '2028-12-31',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': part.is_commercial_allowed 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Barebones 3D, L.L.C.',
        'url': cleanSiteUrl
      }
    }
  };

  if (part.superseded_numbers && part.superseded_numbers.length > 0) {
    schema['additionalProperty'] = [
      {
        '@type': 'PropertyValue',
        'name': 'Superseded OEM Numbers',
        'value': part.superseded_numbers.join(', ')
      },
      {
        '@type': 'PropertyValue',
        'name': 'Primary OEM Fitment',
        'value': primaryMake
      }
    ];
  }

  return schema;
}
