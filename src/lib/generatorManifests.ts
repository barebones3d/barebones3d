export type VerificationTier = 'raw_generated' | 'geometry_verified' | 'production_certified';

export interface GeneratorManifest {
  id: string;
  title: string;
  partNumber: string;
  tier: VerificationTier;
  endorsed?: boolean; // Production readiness endorsement
  retailPriceCents: number; // e.g. 2400 = $24.00
  defaultMaterial: string;  // e.g. 'PETG Heavy Duty', 'Nylon PA12', 'Automotive ASA'
  supportedMaterials: string[];
  leadTimeDays: number;
}

export const GENERATOR_MANIFESTS: Record<string, GeneratorManifest> = {
  gt2_pulley: {
    id: 'gt2_pulley',
    title: 'GT2 Timing Belt Pulley',
    partNumber: 'BB3D-GT2-PULLEY',
    tier: 'production_certified',
    retailPriceCents: 1800,
    defaultMaterial: 'PETG Heavy Duty',
    supportedMaterials: ['PETG Heavy Duty', 'Nylon PA12', 'Automotive ASA'],
    leadTimeDays: 2,
  },
  herringbone_gear: {
    id: 'herringbone_gear',
    title: 'Precision Herringbone Gear',
    partNumber: 'BB3D-HERRINGBONE-GEAR',
    tier: 'production_certified',
    retailPriceCents: 2400,
    defaultMaterial: 'Nylon PA12',
    supportedMaterials: ['Nylon PA12', 'PETG Heavy Duty', 'Automotive ASA'],
    leadTimeDays: 2,
  },
  bevel_gear: {
    id: 'bevel_gear',
    title: 'Miter / Bevel Gear 90°',
    partNumber: 'BB3D-BEVEL-GEAR',
    tier: 'production_certified',
    retailPriceCents: 2400,
    defaultMaterial: 'Nylon PA12',
    supportedMaterials: ['Nylon PA12', 'PETG Heavy Duty'],
    leadTimeDays: 2,
  },
  chamfer_tool_holder: {
    id: 'chamfer_tool_holder',
    title: 'Fluted Deburring Swivel Blade Handle',
    partNumber: 'BB3D-CHAMFER-HOLDER',
    tier: 'raw_generated',
    retailPriceCents: 2000,
    defaultMaterial: 'PETG Heavy Duty',
    supportedMaterials: ['PETG Heavy Duty', 'Automotive ASA'],
    leadTimeDays: 2,
  },
};

export function getGeneratorManifest(id: string): GeneratorManifest {
  const found = GENERATOR_MANIFESTS[id];
  if (found) return found;

  return {
    id,
    title: String(id).replace(/_/g, ' ').toUpperCase(),
    partNumber: `BB3D-${String(id).replace(/_/g, '-').toUpperCase()}`,
    tier: 'geometry_verified',
    retailPriceCents: 2400,
    defaultMaterial: 'PETG Heavy Duty',
    supportedMaterials: ['PETG Heavy Duty', 'Nylon PA12', 'Automotive ASA'],
    leadTimeDays: 2,
  };
}
