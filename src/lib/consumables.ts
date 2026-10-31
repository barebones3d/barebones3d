// src/lib/consumables.ts

export interface AffiliatePillItem {
  label: string;
  searchQuery: string;
}

export function getContextualConsumables(activeModel: string): AffiliatePillItem[] {
  // 1. GT2 Pulleys & Belt hardware
  if (activeModel === 'gt2_pulley' || activeModel === 'timing_belt_idler') {
    return [
      { label: 'M3 Grub Screws', searchQuery: 'M3 cone point grub screws set screws' },
      { label: '608-2RS Bearings', searchQuery: '608-2RS ball bearings' },
      { label: 'Fiberglass GT2 Belt (5M)', searchQuery: 'GT2 timing belt 6mm fiberglass reinforced 5M' },
    ];
  }

  // 2. Gears (Herringbone, Bevel, Worm, Cycloidal, Planetary, Rack, Geneva)
  if (
    activeModel === 'herringbone_gear' ||
    activeModel === 'bevel_gear' ||
    activeModel === 'worm_gear' ||
    activeModel === 'cycloidal_gear' ||
    activeModel === 'planetary_carrier' ||
    activeModel === 'rack_and_pinion' ||
    activeModel === 'geneva_mechanism'
  ) {
    return [
      { label: 'White Lithium Grease', searchQuery: 'white lithium grease mechanical gears' },
      { label: 'M3/M4 Brass Heat-Set Inserts', searchQuery: 'M3 M4 threaded brass heat set inserts soldering iron' },
    ];
  }

  // 3. Obsolete OEM Parts / Mechanical / Enclosures / Others
  return [
    { label: 'High-Strength PETG Filament', searchQuery: 'high strength PETG 3D printer filament 1.75mm' },
    { label: 'Nylon Filament', searchQuery: 'PA12 nylon filament 1.75mm tough' },
  ];
}
