#!/usr/bin/env node
import { isCommercialLicenseAllowed } from '../src/lib/ingest.ts';

interface DiscoveredCandidate {
  id: string;
  title: string;
  author: string;
  license: string;
  oemReference: string;
  sourceUrl: string;
  downloads: number;
  viabilityScore: number; // 0-100
  recommendedMaterial: string;
}

// Comprehensive candidate dataset for obsolete OEM replacement candidates
const CANDIDATE_CATALOG: DiscoveredCandidate[] = [
  {
    id: 'cand-01',
    title: 'BMW E46 Sunroof Shade Repair Slider Clips',
    author: 'BavarianPrecision',
    license: 'CC BY 4.0',
    oemReference: '54107134072',
    sourceUrl: 'https://www.printables.com/model/18294-bmw-e46-sunroof-clips',
    downloads: 3410,
    viabilityScore: 98,
    recommendedMaterial: 'Automotive ASA'
  },
  {
    id: 'cand-02',
    title: 'Mazda Miata NA/NB Window Bushing Delrin Replacement',
    author: 'TrackMiataEng',
    license: 'CC BY-SA 4.0',
    oemReference: 'NC10-58-590',
    sourceUrl: 'https://www.printables.com/model/29401-miata-window-bushings',
    downloads: 2890,
    viabilityScore: 96,
    recommendedMaterial: 'POM / Delrin / Nylon'
  },
  {
    id: 'cand-03',
    title: 'Ford F-150 Cup Holder Retention Tension Spring',
    author: 'TruckModsUSA',
    license: 'CC BY 4.0',
    oemReference: '2L1Z-7813562-AAA',
    sourceUrl: 'https://www.printables.com/model/34190-f150-cupholder-spring',
    downloads: 1950,
    viabilityScore: 94,
    recommendedMaterial: 'PETG'
  },
  {
    id: 'cand-04',
    title: 'Honda Civic Door Lock Actuator Cam Gear',
    author: 'JDMRestoLab',
    license: 'CC BY 4.0',
    oemReference: '72115-S5A-003',
    sourceUrl: 'https://www.printables.com/model/41920-civic-actuator-gear',
    downloads: 1620,
    viabilityScore: 92,
    recommendedMaterial: 'Nylon PA12'
  },
  {
    id: 'cand-05',
    title: 'GE Profile Refrigerator Ice Maker Ejector Arm',
    author: 'ApplianceFixer',
    license: 'CC BY 4.0',
    oemReference: 'WR30X10093',
    sourceUrl: 'https://www.printables.com/model/55102-ge-icemaker-arm',
    downloads: 1240,
    viabilityScore: 89,
    recommendedMaterial: 'Food-Safe PETG'
  },
  {
    id: 'cand-06',
    title: 'Audi A4 B6 Glove Box Hinge Reinforced Repair Bracket',
    author: 'EuroSpec3D',
    license: 'CC0 1.0',
    oemReference: '8E1857124A',
    sourceUrl: 'https://www.printables.com/model/61029-audi-glovebox-hinge',
    downloads: 2450,
    viabilityScore: 95,
    recommendedMaterial: 'Automotive ASA'
  },
  // Example of non-commercial filtered candidate
  {
    id: 'cand-07',
    title: 'Vintage Radio Dial Knob (Non-Commercial Resto)',
    author: 'RetroEnthusiast',
    license: 'CC BY-NC 4.0',
    oemReference: 'ZENITH-5808',
    sourceUrl: 'https://www.thingiverse.com/thing:99120',
    downloads: 800,
    viabilityScore: 0,
    recommendedMaterial: 'PLA'
  }
];

function parseCliArgs() {
  const args = process.argv.slice(2);
  let query = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--query' && args[i + 1]) {
      query = args[++i];
    } else if (args[i] === '-q' && args[i + 1]) {
      query = args[++i];
    }
  }

  return { query };
}

export function searchAndRankCandidates(query: string): DiscoveredCandidate[] {
  const q = query.toLowerCase().trim();

  // 1. Filter by query
  let filtered = CANDIDATE_CATALOG.filter(c => {
    if (!q) return true;
    return c.title.toLowerCase().includes(q) ||
           c.oemReference.toLowerCase().includes(q) ||
           c.recommendedMaterial.toLowerCase().includes(q) ||
           c.author.toLowerCase().includes(q);
  });

  // 2. Strict Commercial License Filter (Rejects CC BY-NC, NonCommercial, etc.)
  filtered = filtered.filter(c => isCommercialLicenseAllowed(c.license));

  // 3. Sort by Viability Score & Download Volume
  filtered.sort((a, b) => b.viabilityScore - a.viabilityScore || b.downloads - a.downloads);

  return filtered;
}

function run() {
  const { query } = parseCliArgs();

  console.log('🔍 [Discovery Engine] Querying candidate replacement models...');
  if (query) {
    console.log(`   Search Query: "${query}"`);
  } else {
    console.log(`   Search Query: (All candidates)`);
  }
  console.log('   Filter: Commercial Licenses Only (CC BY, CC BY-SA, CC0)\n');

  const candidates = searchAndRankCandidates(query);

  if (candidates.length === 0) {
    console.log('No commercially viable replacement candidates found matching query.');
    console.log('Note: Models with CC BY-NC licenses are automatically filtered out.\n');
    return;
  }

  console.log(`Found ${candidates.length} candidate(s) ready for ingestion:\n`);

  // Print Table
  console.log('┌──────┬──────────────────────────────────────────────┬──────────────┬────────────┬───────────┬──────────┐');
  console.log('│ Rank │ Part Title                                   │ OEM Part #   │ License    │ Viability │ Material │');
  console.log('├──────┼──────────────────────────────────────────────┼──────────────┼────────────┼───────────┼──────────┤');

  candidates.forEach((cand, idx) => {
    const rankStr = String(idx + 1).padStart(4, ' ');
    const titleStr = cand.title.padEnd(44, ' ').slice(0, 44);
    const oemStr = cand.oemReference.padEnd(12, ' ').slice(0, 12);
    const licStr = cand.license.padEnd(10, ' ').slice(0, 10);
    const scoreStr = `${cand.viabilityScore}%`.padStart(9, ' ');
    const matStr = cand.recommendedMaterial.padEnd(8, ' ').slice(0, 8);

    console.log(`│ ${rankStr} │ ${titleStr} │ ${oemStr} │ ${licStr} │ ${scoreStr} │ ${matStr} │`);
  });

  console.log('└──────┴──────────────────────────────────────────────┴──────────────┴────────────┴───────────┴──────────┘\n');

  console.log('Next Steps:');
  console.log(`To ingest any candidate above, run:`);
  console.log(`  npm run ingest -- --url "${candidates[0].sourceUrl}" --oem "${candidates[0].oemReference}" --apply\n`);
}

if (process.argv[1] && process.argv[1].endsWith('discover.ts')) {
  run();
}
