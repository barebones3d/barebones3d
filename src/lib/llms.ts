import type { Part, Guide } from '../types/database.ts';
import { buildAmazonSearchUrl, isCheaperOnAmazon, getPartAmazonSearchQuery } from './affiliate.ts';

/**
 * Generates the standardized /llms.txt summary document.
 */
export function generateLlmsTxt(parts: Part[], siteUrl: string): string {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  const catalogLines = parts.map(part => {
    let priceStr = part.is_commercial_allowed 
      ? `$${(part.retail_price_cents / 100).toFixed(2)} USD` 
      : 'Free STL Only';
    if (part.oem_part_number === '55670-0C010') {
      priceStr += ' (Includes 2-pack bundle option at checkout)';
    }

    const makes = part.compatible_makes_models
      .map(c => `${c.make} ${c.model}${c.year_start ? ` (${c.year_start}-${c.year_end || 'Present'})` : ''}`)
      .slice(0, 3)
      .join(', ');

    return `- [${part.title}](${cleanSiteUrl}/guides/${part.slug}): OEM #${part.oem_part_number} | Fitment: ${makes || 'Universal'} | Material: ${part.material_spec} | Price: ${priceStr}`;
  });

  return `# barebones3d.com

> Open-source repair tutorials, downloadable 3D CAD files, and reproduction engineering prints for obsolete OEM hardware.

Barebones 3D provides precision diagnostic guides and commercial-grade replacement components for discontinued automotive, appliance, and electromechanical assemblies. All designs feature pre-calibrated printer tolerance compensation (+0.15mm) and are verified 100% watertight 2-manifold solids.

## Obsolete Replacement Parts Catalog

${catalogLines.join('\n')}

## Developer & Agent Interfaces

- **OpenAPI 3.1 Specification:** [${cleanSiteUrl}/api/openapi.json](${cleanSiteUrl}/api/openapi.json)
- **Model Context Protocol (MCP) Streamable Server:** [${cleanSiteUrl}/api/mcp](${cleanSiteUrl}/api/mcp)
- **Full Catalog & Guide Manifest:** [${cleanSiteUrl}/llms-full.txt](${cleanSiteUrl}/llms-full.txt)
- **Part Fitment Search API:** \`GET ${cleanSiteUrl}/api/parts/search?q={query}\`
- **Agent Checkout Initiation API:** \`POST ${cleanSiteUrl}/api/checkout/create\`
- **Markdown Content Negotiation:** Pass \`Accept: text/markdown\` or append \`.md\` to any guide URL (e.g. \`${cleanSiteUrl}/guides/{slug}.md\`) for raw token-efficient LLM ingestion.

## Licensing & Commercial Policy

- Open-source designs released under CC BY 4.0 or CC0 permit both free self-printing and commercial print-on-demand drop-shipping.
- Designs released under CC BY-NC (Non-Commercial) strictly restrict automated manufacturing orders. These are flagged as "Digital STL Only" to protect original creator rights.
- All OEM part numbers and vehicle/appliance brand references are used strictly for technical compatibility and identification purposes.
`;
}

/**
 * Generates the complete single-file manifest containing all guides in Markdown.
 */
export function generateLlmsFullTxt(parts: Part[], guides: Map<string, Guide>, siteUrl: string): string {
  const summary = generateLlmsTxt(parts, siteUrl);
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  const fullGuides = parts.map(part => {
    const guide = guides.get(part.id);
    if (!guide) return '';
    return generatePartMarkdown(part, guide, cleanSiteUrl);
  }).filter(Boolean);

  return `${summary}

---
# Complete Published Repair Guides & Engineering Manifest
---

${fullGuides.join('\n\n---\n\n')}
`;
}

/**
 * Generates clean, unstyled UTF-8 Markdown with YAML frontmatter for an individual part guide.
 */
export function generatePartMarkdown(part: Part, guide: Guide, siteUrl: string): string {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');
  const priceDollars = (part.retail_price_cents / 100).toFixed(2);
  const downloadUrl = `${cleanSiteUrl}/assets/stl/${part.slug}.stl`;
  const checkoutUrl = `${cleanSiteUrl}/api/checkout/create`;

  const makesList = part.compatible_makes_models.map(c => 
    `  - make: "${c.make}"\n    model: "${c.model}"${c.year_start ? `\n    year_start: ${c.year_start}` : ''}${c.year_end ? `\n    year_end: ${c.year_end}` : ''}`
  ).join('\n');

  const supersededList = part.superseded_numbers.length > 0
    ? part.superseded_numbers.map(s => `  - "${s}"`).join('\n')
    : '  []';

  const toolsList = guide.tools_needed.map(t => {
    const toolSearchUrl = buildAmazonSearchUrl(t.name);
    return `- **[${t.name}](${toolSearchUrl})**${t.purpose ? `: ${t.purpose}` : ''} *(Search on Amazon)*`;
  }).join('\n');

  const stepsList = guide.steps.map(s => {
    let out = `### Step ${s.step_number}: ${s.title}\n\n${s.text}`;
    if (s.tip) out += `\n\n> **Pro Tip:** ${s.tip}`;
    if (s.warning) out += `\n\n> **Caution:** ${s.warning}`;
    const imgUrl = `/assets/parts/${part.oem_part_number.toLowerCase()}-${part.slug}-step-${s.step_number}.webp`;
    const altText = `Original broken plastic ${part.title} (OEM #${part.oem_part_number}) shown side-by-side with reinforced 3D printed ${part.material_spec} reproduction.`;
    out += `\n\n![${altText}](${cleanSiteUrl}${imgUrl})`;
    return out;
  }).join('\n\n');

  const faqList = guide.faq.map(f => 
    `#### Q: ${f.question}\n**A:** ${f.answer}`
  ).join('\n\n');

  const partAmazonSearchUrl = buildAmazonSearchUrl(getPartAmazonSearchQuery(part.title, part.oem_part_number));
  const isCommodity = isCheaperOnAmazon(part.id, part.oem_part_number);

  return `---
title: "${part.title}"
slug: "${part.slug}"
oem_part_number: "${part.oem_part_number}"
superseded_numbers:
${supersededList}
compatible_vehicles_and_appliances:
${makesList}
material: "${part.material_spec}"
price_cents: ${part.is_commercial_allowed ? part.retail_price_cents : 'null'}
price_formatted: ${part.is_commercial_allowed ? `"$${priceDollars} USD"` : '"Free STL Only"'}
is_commercial_allowed: ${part.is_commercial_allowed}
license: "${part.license_type}"
download_stl_url: "${downloadUrl}"
checkout_api_url: ${part.is_commercial_allowed ? `"${checkoutUrl}"` : 'null'}
canonical_guide_url: "${cleanSiteUrl}/guides/${part.slug}"
---

# ${part.title} (OEM #${part.oem_part_number})

## Technical Specifications
- **Primary OEM Part #:** \`${part.oem_part_number}\`
- **Engineering Material:** ${part.material_spec} (100% solid infill, calibrated printer compensation)
- **Repair Difficulty:** ${guide.difficulty}
- **Estimated Repair Time:** ${guide.time_estimate}
- **Commercial Purchase:** ${part.is_commercial_allowed ? `$${priceDollars} USD (Printed on-demand in 48h via Slant 3D)` : isCommodity ? `Digital STL Only / Commodity Multi-Pack on Amazon: [Search Amazon Catalog](${partAmazonSearchUrl}) (Cheaper than custom 3D printing)` : 'Digital STL Only (Commercial reproduction restricted by author license)'}
- **Direct STL Download:** [${part.oem_part_number}.stl](${downloadUrl})
- **Amazon OEM & Hardware Search:** [Check Price & Availability on Amazon](${partAmazonSearchUrl})

## Required Tools & Supplies
${toolsList}

## Step-by-Step Installation Procedure
${stepsList}

## Frequently Asked Questions
${faqList}

## Open-Source Attribution & Safety Disclaimer
${part.attribution_text || `Original 3D CAD model licensed under ${part.license_type}.`}
${part.original_source_url ? `Original Source: ${part.original_source_url}` : ''}

> **Legal Disclaimer:** Barebones 3D, L.L.C. is an independent engineering firm. This replacement component is an aftermarket reproduction designed for personal repair, restoration, and life-extension. Barebones 3D is not affiliated with, authorized by, sponsored by, or endorsed by the original equipment manufacturer. All trademarks and OEM part numbers are referenced solely for identification and compatibility purposes.
`;
}
