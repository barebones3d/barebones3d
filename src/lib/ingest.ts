import type { Part, Guide, ToolNeeded, GuideStep } from '../types/database.ts';

export interface IngestedModelData {
  title: string;
  author: string;
  description: string;
  licenseType: string;
  sourceUrl: string;
  downloadUrl?: string;
  suggestedOemNumber?: string;
  suggestedMakesModels: Array<{ make: string; model: string; year_start?: number; year_end?: number }>;
  materialSpec: string;
  suggestedPriceCents: number;
}

/**
 * Validates whether a license permits commercial manufacturing.
 * Returns false for any license containing 'NC' or 'NonCommercial'.
 */
export function isCommercialLicenseAllowed(license: string): boolean {
  const norm = license.toUpperCase().replace(/\s+/g, '');
  if (norm.includes('-NC') || norm.includes('NONCOMMERCIAL') || norm.includes('NON-COMMERCIAL')) {
    return false;
  }
  return true;
}

/**
 * Extracts potential OEM part numbers from text descriptions, titles, or tags.
 * Incorporates specific \b[0-9A-Z]{6,12}\b auto-detection patterns.
 */
export function extractOemPartNumber(text: string): string | null {
  const oemRegexes = [
    /\b(?:OEM|Part|P\/N|#)\s*[:#]?\s*([A-Z0-9]{4,14}(?:-[A-Z0-9]{2,6})?)\b/i,
    /\b([0-9]{5}-[A-Z0-9]{5})\b/,
    /\b([A-Z][0-9]{7,9})\b/,
    /\b([0-9]{11})\b/,
    /\b([0-9]{8})\b/,
    /\b([0-9A-Z]{6,12})\b/ // Direct 6-12 uppercase alphanumeric OEM pattern
  ];

  for (const regex of oemRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const candidate = match[1].toUpperCase();
      // Exclude generic English words that happen to match 6-12 chars
      if (!['REPLACEMENT', 'DISCONTINUED', 'DASHBOARD', 'PRINTABLES', 'THINGIVERSE', 'REPAIR'].includes(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

/**
 * Detects automotive or appliance brand compatibility from text.
 */
export function extractMakeAndModel(text: string): Array<{ make: string; model: string; year_start?: number; year_end?: number }> {
  const results: Array<{ make: string; model: string; year_start?: number; year_end?: number }> = [];
  const knownMakes = ['Subaru', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Whirlpool', 'KitchenAid', 'Bosch', 'Siemens', 'Pioneer', 'Audi', 'Mazda'];

  for (const make of knownMakes) {
    const regex = new RegExp(`\\b${make}\\s+([A-Za-z0-9/\\-\\s]{2,20})\\b`, 'i');
    const match = text.match(regex);
    if (match) {
      const yearMatch = text.match(/\b(19\d\d|20\d\d)\s*(?:-|to)\s*(19\d\d|20\d\d)\b/);
      results.push({
        make,
        model: match[1].trim().split('\n')[0].slice(0, 25),
        year_start: yearMatch ? parseInt(yearMatch[1], 10) : undefined,
        year_end: yearMatch ? parseInt(yearMatch[2], 10) : undefined
      });
      break;
    }
  }

  if (results.length === 0) {
    results.push({ make: 'Generic OEM', model: 'Replacement' });
  }

  return results;
}

/**
 * Parses tools needed and step-by-step instructions from author descriptions.
 * Generates a concise 4-to-6 step procedure formatted for both web and raw Markdown.
 */
export function parseToolsAndSteps(description: string): { 
  tools: ToolNeeded[]; 
  steps: GuideStep[]; 
  difficulty: 'Beginner' | 'Easy' | 'Moderate' | 'Advanced'; 
  timeEstimate: string 
} {
  const tools: ToolNeeded[] = [];
  const steps: GuideStep[] = [];

  const lines = description.split('\n').map(l => l.trim()).filter(Boolean);

  // Common shop tool inference
  const toolKeywords = [
    { name: 'Phillips Screwdriver (#2)', re: /phillips|screwdriver/i, purpose: 'Housing and trim fasteners' },
    { name: 'Flathead Screwdriver', re: /flathead/i, purpose: 'Prying retention tabs' },
    { name: 'Socket Wrench / Hex Driver', re: /socket|hex key|allen key|ratchet|7mm|8mm|10mm/i, purpose: 'Sub-assembly mounting bolts' },
    { name: 'Nylon Plastic Trim Pry Tool', re: /pry tool|trim tool/i, purpose: 'Non-marring panel removal' },
    { name: 'Needle-Nose Pliers', re: /pliers/i, purpose: 'Extracting fractured plastic remnants' },
    { name: 'White Lithium Grease / Silicone Lube', re: /grease|lubricant|silicone/i, purpose: 'Gear and bushing friction reduction' }
  ];

  for (const tk of toolKeywords) {
    if (tk.re.test(description)) {
      tools.push({ name: tk.name, purpose: tk.purpose });
    }
  }

  if (tools.length === 0) {
    tools.push(
      { name: 'Phillips Screwdriver (#2)', purpose: 'Panel and housing fasteners' },
      { name: 'Plastic Trim Pry Tool', purpose: 'Non-marring clip release' },
      { name: 'Needle-Nose Pliers', purpose: 'Extracting broken plastic fragments' }
    );
  }

  // Parse explicit steps from text
  let currentStepNum = 1;
  for (const line of lines) {
    const stepMatch = line.match(/^(?:Step\s*\d+[:.-]?|[0-9]+[.):-])\s*(.*)/i);
    if (stepMatch && stepMatch[1]) {
      const stepText = stepMatch[1].replace(/^[:.-]\s*/, '').trim();
      if (stepText && stepText.length > 5) {
        steps.push({
          step_number: currentStepNum++,
          title: `Procedure Step ${currentStepNum - 1}`,
          text: stepText
        });
      }
    }
  }

  // If text lacked numbered steps, generate a structured 4-to-6 step procedure
  if (steps.length === 0) {
    const baseSteps: GuideStep[] = [
      {
        step_number: 1,
        title: 'Access & Preparation',
        text: 'Disconnect power or battery ground. Remove surrounding cosmetic trim panels or access covers to expose the failed assembly without stressing perimeter retention tabs.',
        tip: 'Use an organizer tray for removed hardware to maintain screw indexing during reassembly.'
      },
      {
        step_number: 2,
        title: 'Component Disassembly & Extraction',
        text: 'Uncouple electrical wire harnesses and back out retaining fasteners. Carefully unseat the fractured OEM component from its mounting bracket or drive spline.',
        warning: 'Avoid applying excessive leverage against aging plastic housings to prevent secondary hairline fractures.'
      },
      {
        step_number: 3,
        title: 'Cavity Cleanout & Inspection',
        text: 'Clear out shattered plastic fragments, hardened factory grease, and debris from the gear teeth or pivot socket. Inspect mating shafts for scoring or burrs.',
        tip: 'Apply fresh white lithium grease to rotating interfaces for wear reduction.'
      },
      {
        step_number: 4,
        title: 'Reproduction Part Fitment & Alignment',
        text: 'Align the 3D printed replacement part onto the drive shaft or hinge channel. The calibrated +0.15mm printer tolerance compensation ensures a snug press-fit without binding.'
      },
      {
        step_number: 5,
        title: 'Mechanical Operation Verification',
        text: 'Manually cycle the mechanism through its full range of motion. Confirm zero binding, smooth travel, and solid retention before closing the enclosure.'
      },
      {
        step_number: 6,
        title: 'Reassembly & Final Functional Testing',
        text: 'Reconnect wiring harnesses, torque fasteners to factory snugness, and snap trim bezels into position. Restore power and execute a full operational diagnostic cycle.'
      }
    ];

    steps.length = 0;
    steps.push(...baseSteps);
  }

  const difficulty = steps.length > 4 ? 'Moderate' : 'Easy';
  const timeEstimate = steps.length > 4 ? '35-45 mins' : '15-20 mins';

  return { tools, steps, difficulty, timeEstimate };
}

/**
 * Transforms parsed metadata into valid Part and Guide domain objects.
 */
export function buildPartAndGuideFromIngest(data: IngestedModelData): { part: Part; guide: Guide } {
  const isCommAllowed = isCommercialLicenseAllowed(data.licenseType);
  const oem = data.suggestedOemNumber || extractOemPartNumber(data.title) || extractOemPartNumber(data.description) || `OEM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const partId = `part_${slug.replace(/-/g, '_').slice(0, 32)}`;
  const makesModels = data.suggestedMakesModels.length > 0 ? data.suggestedMakesModels : extractMakeAndModel(data.description);
  const { tools, steps, difficulty, timeEstimate } = parseToolsAndSteps(data.description);

  const part: Part = {
    id: partId,
    slug,
    title: data.title,
    oem_part_number: oem,
    superseded_numbers: [],
    compatible_makes_models: makesModels,
    material_spec: data.materialSpec || 'PETG',
    retail_price_cents: isCommAllowed ? (data.suggestedPriceCents || 1499) : 0,
    stl_r2_key: `parts/${slug}.stl`,
    original_source_url: data.sourceUrl,
    license_type: data.licenseType,
    attribution_text: `Original design by ${data.author}, licensed under ${data.licenseType}.`,
    is_commercial_allowed: isCommAllowed,
    is_active: true
  };

  const guide: Guide = {
    id: `guide_${partId}`,
    part_id: partId,
    tools_needed: tools,
    difficulty,
    time_estimate: timeEstimate,
    steps,
    faq: [
      {
        question: `How does this reproduction compare to OEM #${oem}?`,
        answer: `This replacement is engineered in ${part.material_spec} with calibrated printer tolerances for a direct mechanical fit.`
      },
      {
        question: `Can I download the free 3D printable STL?`,
        answer: `Yes. Barebones 3D provides free, open-source STL downloads for every catalog part so anyone with a 3D printer can repair their equipment immediately.`
      }
    ]
  };

  return { part, guide };
}
