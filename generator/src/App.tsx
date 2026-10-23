import React, { useState, useMemo, useCallback } from 'react';
import {
  PrimitiveType,
  HerringboneGearParams,
  BearingPillowBlockParams,
  StructuralBracketParams,
  GT2PulleyParams,
  KnurledKnobParams,
  ThreadedFastenerParams,
  ShaftCouplerParams,
  ProjectEnclosureParams,
  StepperMountParams,
  LinearRodClampParams,
  HoseBarbParams,
  LeadScrewNutBlockParams,
  CableChainLinkParams,
  GeneratedMeshResult,
  BearingPresetType,
  BEARING_PRESET_DATA,
} from './generators/types';
import {
  generateHerringboneGear,
  generateBearingPillowBlock,
  generateStructuralBracket,
  generateGT2Pulley,
  generateKnurledKnob,
  generateThreadedFastener,
  generateShaftCoupler,
  generateProjectEnclosure,
  generateStepperMount,
  generateLinearRodClamp,
  generateHoseBarb,
  generateLeadScrewNutBlock,
  generateCableChainLink,
} from './generators';
import { exportSTL } from './utils/stlExport';
import { Header } from './components/Header';
import { PresetsBar } from './components/PresetsBar';
import { ParameterSidebar } from './components/ParameterSidebar';
import { Viewport } from './components/Viewport';

export const App: React.FC = () => {
  // Current active primitive model (defaults to GT2 Pulley)
  const [activeModel, setActiveModel] = useState<PrimitiveType>('gt2_pulley');

  // --- Initial Parameters for All Models ---
  const [gt2Params, setGt2Params] = useState<GT2PulleyParams>({
    toothCount: 20,
    pitch: 2.0,
    beltWidth: 6,
    boreDiameter: 5.0,
    boreType: 'd-shaft',
    dShaftFlatOffset: 2.1,
    flangeType: 'both',
    flangeHeight: 2.0,
    flangeThickness: 1.0,
    hasHub: true,
    hubDiameter: 15.0,
    hubHeight: 6.0,
    printer_compensation: 0.15,
  });

  const [gearParams, setGearParams] = useState<HerringboneGearParams>({
    module: 1.5,
    toothCount: 24,
    pressureAngle: 20.0,
    helixAngle: 30,
    faceWidth: 16,
    boreDiameter: 5.0,
    boreType: 'd-shaft',
    dShaftFlatOffset: 2.1,
    printer_compensation: 0.15,
  });

  const [pillowParams, setPillowParams] = useState<BearingPillowBlockParams>({
    preset: '608',
    bearingOD: 22,
    bearingID: 8,
    bearingWidth: 7,
    pocketDepth: 7,
    isThroughHole: false,
    wallThickness: 4.5,
    retentionLip: true,
    lipThickness: 1.5,
    lipOverhang: 1.0,
    mountingFlanges: 'two-sided',
    mountHoleSize: 'M4',
    flangeLength: 16,
    printer_compensation: 0.15,
  });

  const [bracketParams, setBracketParams] = useState<StructuralBracketParams>({
    leg1Length: 45,
    leg2Length: 45,
    width: 30,
    thickness: 4.5,
    gussetReinforcement: true,
    gussetThickness: 4.0,
    holePattern: 'four-grid',
    screwSize: 'M4',
    hasCountersink: false,
    printer_compensation: 0.15,
  });

  const [knobParams, setKnobParams] = useState<KnurledKnobParams>({
    outerDiameter: 25,
    height: 18,
    knurlPattern: 'diamond',
    knurlCount: 28,
    knurlDepth: 1.0,
    hasPointer: true,
    hasSkirt: true,
    skirtDiameter: 30,
    skirtHeight: 4,
    boreDiameter: 6.0,
    boreType: 'd-shaft',
    dShaftFlatOffset: 2.5,
    boreDepth: 14,
    printer_compensation: 0.15,
  });

  const [fastenerParams, setFastenerParams] = useState<ThreadedFastenerParams>({
    fastenerType: 'bolt',
    nominalDiameter: 8,
    pitch: 1.25,
    threadLength: 25,
    headType: 'hex',
    headDiameter: 14,
    headHeight: 5.5,
    nutHeight: 6.5,
    nutWidthAcrossFlats: 13,
    printer_compensation: 0.15,
  });

  const [couplerParams, setCouplerParams] = useState<ShaftCouplerParams>({
    outerDiameter: 20,
    length: 25,
    bore1Diameter: 5.0,
    bore2Diameter: 8.0,
    bore1Type: 'round',
    bore2Type: 'round',
    couplerStyle: 'slit-clamp',
    slitWidth: 1.2,
    clampScrewSize: 'M3',
    printer_compensation: 0.15,
  });

  const [enclosureParams, setEnclosureParams] = useState<ProjectEnclosureParams>({
    innerLength: 80,
    innerWidth: 50,
    innerHeight: 30,
    wallThickness: 2.4,
    floorThickness: 2.0,
    cornerRadius: 4,
    lidLipHeight: 2.5,
    standoffCount: 4,
    standoffHeight: 6,
    standoffScrewSize: 'M3',
    hasCableCutout: true,
    cableCutoutWidth: 12,
    cableCutoutHeight: 8,
    printer_compensation: 0.15,
  });

  const [stepperParams, setStepperParams] = useState<StepperMountParams>({
    nemaSize: 'NEMA17',
    faceThickness: 4.5,
    baseThickness: 4.5,
    baseLength: 35,
    motorHoleType: 'slots',
    slotLength: 6,
    hasGussets: true,
    gussetThickness: 4.0,
    baseHoleCount: 2,
    baseScrewSize: 'M4',
    printer_compensation: 0.15,
  });

  const [clampParams, setClampParams] = useState<LinearRodClampParams>({
    rodDiameter: 8,
    mountStyle: 'horizontal-sk',
    blockHeight: 32,
    blockWidth: 42,
    blockThickness: 14,
    clampGap: 1.5,
    pinchScrewSize: 'M4',
    baseScrewSize: 'M5',
    printer_compensation: 0.15,
  });

  const [barbParams, setBarbParams] = useState<HoseBarbParams>({
    barbNominalID: 8,
    barbCount: 3,
    barbLength: 16,
    wallThickness: 2.0,
    connectorType: 'straight-coupler',
    secondBarbNominalID: 8,
    hexNutWidth: 15,
    hexNutThickness: 6,
    printer_compensation: 0.15,
  });

  const [nutBlockParams, setNutBlockParams] = useState<LeadScrewNutBlockParams>({
    leadScrewDia: 8,
    nutFlangeDia: 22,
    boltCircleDia: 16,
    blockWidth: 34,
    blockLength: 30,
    blockHeight: 18,
    nutScrewSize: 'M3',
    gantryScrewSize: 'M4',
    gantryHoleCount: 2,
    pocketDepth: 4.0,
    printer_compensation: 0.15,
  });

  const [chainParams, setChainParams] = useState<CableChainLinkParams>({
    chamberWidth: 15,
    chamberHeight: 10,
    pitch: 20,
    wallThickness: 2.0,
    pinDiameter: 4.0,
    maxBendAngle: 40,
    printer_compensation: 0.15,
  });

  // State update handlers
  const handleUpdateGT2Params = useCallback((updates: Partial<GT2PulleyParams>) => {
    setGt2Params((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateGearParams = useCallback((updates: Partial<HerringboneGearParams>) => {
    setGearParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdatePillowParams = useCallback((updates: Partial<BearingPillowBlockParams>) => {
    setPillowParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateBracketParams = useCallback((updates: Partial<StructuralBracketParams>) => {
    setBracketParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateKnobParams = useCallback((updates: Partial<KnurledKnobParams>) => {
    setKnobParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateFastenerParams = useCallback((updates: Partial<ThreadedFastenerParams>) => {
    setFastenerParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateCouplerParams = useCallback((updates: Partial<ShaftCouplerParams>) => {
    setCouplerParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateEnclosureParams = useCallback((updates: Partial<ProjectEnclosureParams>) => {
    setEnclosureParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateStepperParams = useCallback((updates: Partial<StepperMountParams>) => {
    setStepperParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateClampParams = useCallback((updates: Partial<LinearRodClampParams>) => {
    setClampParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateBarbParams = useCallback((updates: Partial<HoseBarbParams>) => {
    setBarbParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateNutBlockParams = useCallback((updates: Partial<LeadScrewNutBlockParams>) => {
    setNutBlockParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateChainParams = useCallback((updates: Partial<CableChainLinkParams>) => {
    setChainParams((prev) => ({ ...prev, ...updates }));
  }, []);

  // Preset Handlers
  const handleApplyBearingPreset = useCallback((preset: BearingPresetType) => {
    if (preset === 'custom') return;
    const data = BEARING_PRESET_DATA[preset];
    setPillowParams((prev) => ({
      ...prev,
      preset,
      bearingOD: data.od,
      bearingID: data.id,
      bearingWidth: data.width,
      pocketDepth: data.width,
    }));
  }, []);

  const handleApplyPreset = useCallback((presetId: string) => {
    switch (presetId) {
      // GT2 Presets
      case 'gt2_16t_5mm':
        setGt2Params({
          toothCount: 16,
          pitch: 2.0,
          beltWidth: 6,
          boreDiameter: 5.0,
          boreType: 'round',
          dShaftFlatOffset: 0,
          flangeType: 'both',
          flangeHeight: 2.0,
          flangeThickness: 1.0,
          hasHub: false,
          hubDiameter: 0,
          hubHeight: 0,
          printer_compensation: 0.15,
        });
        break;
      case 'gt2_20t_dshaft':
        setGt2Params({
          toothCount: 20,
          pitch: 2.0,
          beltWidth: 6,
          boreDiameter: 5.0,
          boreType: 'd-shaft',
          dShaftFlatOffset: 2.1,
          flangeType: 'both',
          flangeHeight: 2.0,
          flangeThickness: 1.0,
          hasHub: true,
          hubDiameter: 15.0,
          hubHeight: 6.0,
          printer_compensation: 0.15,
        });
        break;
      case 'gt2_36t_8mm':
        setGt2Params({
          toothCount: 36,
          pitch: 2.0,
          beltWidth: 9,
          boreDiameter: 8.0,
          boreType: 'round',
          dShaftFlatOffset: 0,
          flangeType: 'both',
          flangeHeight: 2.0,
          flangeThickness: 1.2,
          hasHub: true,
          hubDiameter: 20.0,
          hubHeight: 8.0,
          printer_compensation: 0.15,
        });
        break;
      case 'gt2_60t_bull':
        setGt2Params({
          toothCount: 60,
          pitch: 2.0,
          beltWidth: 9,
          boreDiameter: 8.0,
          boreType: 'hex',
          dShaftFlatOffset: 0,
          flangeType: 'both',
          flangeHeight: 2.5,
          flangeThickness: 1.5,
          hasHub: false,
          hubDiameter: 0,
          hubHeight: 0,
          printer_compensation: 0.15,
        });
        break;

      // Gear Presets
      case 'stepper_drive':
        setGearParams({
          module: 1.0,
          toothCount: 20,
          pressureAngle: 20.0,
          helixAngle: 30,
          faceWidth: 15,
          boreDiameter: 5.0,
          boreType: 'd-shaft',
          dShaftFlatOffset: 2.1,
          printer_compensation: 0.15,
        });
        break;
      case 'compact_pinion':
        setGearParams({
          module: 0.8,
          toothCount: 14,
          pressureAngle: 20.0,
          helixAngle: 25,
          faceWidth: 12,
          boreDiameter: 4.0,
          boreType: 'round',
          dShaftFlatOffset: 1.5,
          printer_compensation: 0.15,
        });
        break;
      case 'heavy_bull_gear':
        setGearParams({
          module: 2.0,
          toothCount: 36,
          pressureAngle: 20.0,
          helixAngle: 30,
          faceWidth: 25,
          boreDiameter: 10.0,
          boreType: 'hex',
          dShaftFlatOffset: 4.0,
          printer_compensation: 0.15,
        });
        break;

      // Knurled Knob Presets
      case 'knob_pot_fluted':
        setKnobParams({
          outerDiameter: 20,
          height: 15,
          knurlPattern: 'straight',
          knurlCount: 24,
          knurlDepth: 0.8,
          hasPointer: true,
          hasSkirt: false,
          skirtDiameter: 24,
          skirtHeight: 3,
          boreDiameter: 6.0,
          boreType: 'd-shaft',
          dShaftFlatOffset: 2.5,
          boreDepth: 12,
          printer_compensation: 0.15,
        });
        break;
      case 'knob_diamond_pointer':
        setKnobParams({
          outerDiameter: 26,
          height: 18,
          knurlPattern: 'diamond',
          knurlCount: 32,
          knurlDepth: 1.2,
          hasPointer: true,
          hasSkirt: true,
          skirtDiameter: 32,
          skirtHeight: 4,
          boreDiameter: 6.0,
          boreType: 'd-shaft',
          dShaftFlatOffset: 2.5,
          boreDepth: 14,
          printer_compensation: 0.15,
        });
        break;
      case 'knob_bed_level':
        setKnobParams({
          outerDiameter: 45,
          height: 12,
          knurlPattern: 'ribbed',
          knurlCount: 24,
          knurlDepth: 1.8,
          hasPointer: false,
          hasSkirt: false,
          skirtDiameter: 48,
          skirtHeight: 3,
          boreDiameter: 4.2,
          boreType: 'round',
          dShaftFlatOffset: 0,
          boreDepth: 0,
          printer_compensation: 0.15,
        });
        break;

      // Fastener Presets
      case 'bolt_m4_16':
        setFastenerParams({
          fastenerType: 'bolt',
          nominalDiameter: 4,
          pitch: 0.7,
          threadLength: 16,
          headType: 'socket-cap',
          headDiameter: 7,
          headHeight: 4,
          nutHeight: 3.2,
          nutWidthAcrossFlats: 7,
          printer_compensation: 0.15,
        });
        break;
      case 'bolt_m6_25':
        setFastenerParams({
          fastenerType: 'bolt',
          nominalDiameter: 6,
          pitch: 1.0,
          threadLength: 25,
          headType: 'hex',
          headDiameter: 11,
          headHeight: 4.5,
          nutHeight: 5.0,
          nutWidthAcrossFlats: 10,
          printer_compensation: 0.15,
        });
        break;
      case 'bolt_m8_thumb':
        setFastenerParams({
          fastenerType: 'bolt',
          nominalDiameter: 8,
          pitch: 1.25,
          threadLength: 30,
          headType: 'knurled-thumb',
          headDiameter: 20,
          headHeight: 8,
          nutHeight: 6.5,
          nutWidthAcrossFlats: 13,
          printer_compensation: 0.15,
        });
        break;
      case 'nut_m8':
        setFastenerParams({
          fastenerType: 'nut',
          nominalDiameter: 8,
          pitch: 1.25,
          threadLength: 20,
          headType: 'hex',
          headDiameter: 14,
          headHeight: 5,
          nutHeight: 6.5,
          nutWidthAcrossFlats: 13,
          printer_compensation: 0.2,
        });
        break;

      // Shaft Coupler Presets
      case 'coupler_5_to_8':
        setCouplerParams({
          outerDiameter: 20,
          length: 25,
          bore1Diameter: 5.0,
          bore2Diameter: 8.0,
          bore1Type: 'round',
          bore2Type: 'round',
          couplerStyle: 'slit-clamp',
          slitWidth: 1.2,
          clampScrewSize: 'M3',
          printer_compensation: 0.15,
        });
        break;
      case 'coupler_5_to_5':
        setCouplerParams({
          outerDiameter: 19,
          length: 25,
          bore1Diameter: 5.0,
          bore2Diameter: 5.0,
          bore1Type: 'round',
          bore2Type: 'round',
          couplerStyle: 'spiral-beam',
          slitWidth: 1.2,
          clampScrewSize: 'M3',
          printer_compensation: 0.15,
        });
        break;
      case 'coupler_8_to_10':
        setCouplerParams({
          outerDiameter: 25,
          length: 30,
          bore1Diameter: 8.0,
          bore2Diameter: 10.0,
          bore1Type: 'round',
          bore2Type: 'round',
          couplerStyle: 'slit-clamp',
          slitWidth: 1.4,
          clampScrewSize: 'M4',
          printer_compensation: 0.15,
        });
        break;

      // Project Enclosure Presets
      case 'enc_arduino':
        setEnclosureParams({
          innerLength: 75,
          innerWidth: 55,
          innerHeight: 25,
          wallThickness: 2.2,
          floorThickness: 2.0,
          cornerRadius: 4,
          lidLipHeight: 2.5,
          standoffCount: 4,
          standoffHeight: 6,
          standoffScrewSize: 'M3',
          hasCableCutout: true,
          cableCutoutWidth: 14,
          cableCutoutHeight: 10,
          printer_compensation: 0.15,
        });
        break;
      case 'enc_raspberry_pi':
        setEnclosureParams({
          innerLength: 92,
          innerWidth: 62,
          innerHeight: 30,
          wallThickness: 2.4,
          floorThickness: 2.0,
          cornerRadius: 4,
          lidLipHeight: 2.5,
          standoffCount: 4,
          standoffHeight: 5,
          standoffScrewSize: 'M2.5',
          hasCableCutout: true,
          cableCutoutWidth: 16,
          cableCutoutHeight: 12,
          printer_compensation: 0.15,
        });
        break;
      case 'enc_esp32':
        setEnclosureParams({
          innerLength: 60,
          innerWidth: 35,
          innerHeight: 20,
          wallThickness: 2.0,
          floorThickness: 1.8,
          cornerRadius: 3,
          lidLipHeight: 2.0,
          standoffCount: 0,
          standoffHeight: 0,
          standoffScrewSize: 'M2',
          hasCableCutout: true,
          cableCutoutWidth: 10,
          cableCutoutHeight: 6,
          printer_compensation: 0.15,
        });
        break;

      // Stepper Mount Presets
      case 'stepper_nema17':
        setStepperParams({
          nemaSize: 'NEMA17',
          faceThickness: 4.5,
          baseThickness: 4.5,
          baseLength: 35,
          motorHoleType: 'slots',
          slotLength: 6,
          hasGussets: true,
          gussetThickness: 4.0,
          baseHoleCount: 2,
          baseScrewSize: 'M4',
          printer_compensation: 0.15,
        });
        break;
      case 'stepper_nema23':
        setStepperParams({
          nemaSize: 'NEMA23',
          faceThickness: 6.0,
          baseThickness: 6.0,
          baseLength: 45,
          motorHoleType: 'slots',
          slotLength: 8,
          hasGussets: true,
          gussetThickness: 5.5,
          baseHoleCount: 4,
          baseScrewSize: 'M5',
          printer_compensation: 0.15,
        });
        break;
      case 'stepper_nema14':
        setStepperParams({
          nemaSize: 'NEMA14',
          faceThickness: 3.5,
          baseThickness: 3.5,
          baseLength: 28,
          motorHoleType: 'round',
          slotLength: 0,
          hasGussets: true,
          gussetThickness: 3.0,
          baseHoleCount: 2,
          baseScrewSize: 'M3',
          printer_compensation: 0.15,
        });
        break;

      // Linear Clamp Presets
      case 'clamp_sk8':
        setClampParams({
          rodDiameter: 8,
          mountStyle: 'horizontal-sk',
          blockHeight: 32,
          blockWidth: 42,
          blockThickness: 14,
          clampGap: 1.5,
          pinchScrewSize: 'M4',
          baseScrewSize: 'M5',
          printer_compensation: 0.15,
        });
        break;
      case 'clamp_sk10':
        setClampParams({
          rodDiameter: 10,
          mountStyle: 'horizontal-sk',
          blockHeight: 36,
          blockWidth: 48,
          blockThickness: 16,
          clampGap: 1.5,
          pinchScrewSize: 'M4',
          baseScrewSize: 'M5',
          printer_compensation: 0.15,
        });
        break;
      case 'clamp_sk12':
        setClampParams({
          rodDiameter: 12,
          mountStyle: 'horizontal-sk',
          blockHeight: 40,
          blockWidth: 54,
          blockThickness: 18,
          clampGap: 1.8,
          pinchScrewSize: 'M5',
          baseScrewSize: 'M6',
          printer_compensation: 0.15,
        });
        break;

      // Hose Barb Presets
      case 'barb_6mm':
        setBarbParams({
          barbNominalID: 6,
          barbCount: 3,
          barbLength: 15,
          wallThickness: 1.8,
          connectorType: 'straight-coupler',
          secondBarbNominalID: 6,
          hexNutWidth: 12,
          hexNutThickness: 5,
          printer_compensation: 0.15,
        });
        break;
      case 'barb_reducer_8_6':
        setBarbParams({
          barbNominalID: 8,
          barbCount: 3,
          barbLength: 16,
          wallThickness: 2.0,
          connectorType: 'reducer',
          secondBarbNominalID: 6,
          hexNutWidth: 14,
          hexNutThickness: 6,
          printer_compensation: 0.15,
        });
        break;
      case 'barb_12mm':
        setBarbParams({
          barbNominalID: 12,
          barbCount: 4,
          barbLength: 22,
          wallThickness: 2.4,
          connectorType: 'straight-coupler',
          secondBarbNominalID: 12,
          hexNutWidth: 20,
          hexNutThickness: 7,
          printer_compensation: 0.15,
        });
        break;

      // T8 Leadscrew Nut Presets
      case 'nut_block_t8_std':
        setNutBlockParams({
          leadScrewDia: 8,
          nutFlangeDia: 22,
          boltCircleDia: 16,
          blockWidth: 34,
          blockLength: 30,
          blockHeight: 18,
          nutScrewSize: 'M3',
          gantryScrewSize: 'M4',
          gantryHoleCount: 2,
          pocketDepth: 4.0,
          printer_compensation: 0.15,
        });
        break;
      case 'nut_block_t8_antibacklash':
        setNutBlockParams({
          leadScrewDia: 8,
          nutFlangeDia: 22,
          boltCircleDia: 16,
          blockWidth: 36,
          blockLength: 34,
          blockHeight: 24,
          nutScrewSize: 'M3',
          gantryScrewSize: 'M4',
          gantryHoleCount: 4,
          pocketDepth: 6.5,
          printer_compensation: 0.15,
        });
        break;

      // Cable Chain Link Presets
      case 'chain_10x11':
        setChainParams({
          chamberWidth: 10,
          chamberHeight: 11,
          pitch: 16,
          wallThickness: 1.8,
          pinDiameter: 3.5,
          maxBendAngle: 40,
          printer_compensation: 0.15,
        });
        break;
      case 'chain_15x20':
        setChainParams({
          chamberWidth: 20,
          chamberHeight: 15,
          pitch: 24,
          wallThickness: 2.2,
          pinDiameter: 4.5,
          maxBendAngle: 45,
          printer_compensation: 0.15,
        });
        break;

      // Structural Bracket Presets
      case 'compact_corner':
        setBracketParams({
          leg1Length: 25,
          leg2Length: 25,
          width: 20,
          thickness: 3.5,
          gussetReinforcement: false,
          gussetThickness: 3.0,
          holePattern: 'single',
          screwSize: 'M3',
          hasCountersink: true,
          printer_compensation: 0.15,
        });
        break;
      case 'frame_gusset_m4':
        setBracketParams({
          leg1Length: 45,
          leg2Length: 45,
          width: 30,
          thickness: 4.5,
          gussetReinforcement: true,
          gussetThickness: 4.0,
          holePattern: 'four-grid',
          screwSize: 'M4',
          hasCountersink: false,
          printer_compensation: 0.15,
        });
        break;
      case 'heavy_duty_m5':
        setBracketParams({
          leg1Length: 75,
          leg2Length: 75,
          width: 40,
          thickness: 6.0,
          gussetReinforcement: true,
          gussetThickness: 5.5,
          holePattern: 'four-grid',
          screwSize: 'M5',
          hasCountersink: false,
          printer_compensation: 0.15,
        });
        break;
    }
  }, []);

  // Compute 3D Mesh in real-time
  const meshResult: GeneratedMeshResult = useMemo(() => {
    switch (activeModel) {
      case 'gt2_pulley':
        return generateGT2Pulley(gt2Params);
      case 'herringbone_gear':
        return generateHerringboneGear(gearParams);
      case 'bearing_pillow_block':
        return generateBearingPillowBlock(pillowParams);
      case 'structural_bracket':
        return generateStructuralBracket(bracketParams);
      case 'knurled_knob':
        return generateKnurledKnob(knobParams);
      case 'threaded_fastener':
        return generateThreadedFastener(fastenerParams);
      case 'shaft_coupler':
        return generateShaftCoupler(couplerParams);
      case 'project_enclosure':
        return generateProjectEnclosure(enclosureParams);
      case 'stepper_mount':
        return generateStepperMount(stepperParams);
      case 'linear_rod_clamp':
        return generateLinearRodClamp(clampParams);
      case 'hose_barb':
        return generateHoseBarb(barbParams);
      case 'lead_screw_nut_block':
        return generateLeadScrewNutBlock(nutBlockParams);
      case 'cable_chain_link':
        return generateCableChainLink(chainParams);
      default:
        return generateGT2Pulley(gt2Params);
    }
  }, [
    activeModel,
    gt2Params,
    gearParams,
    pillowParams,
    bracketParams,
    knobParams,
    fastenerParams,
    couplerParams,
    enclosureParams,
    stepperParams,
    clampParams,
    barbParams,
    nutBlockParams,
    chainParams,
  ]);

  // Export STL handler
  const handleExportSTL = useCallback((binary: boolean = true) => {
    if (!meshResult || !meshResult.geometry) return;

    let filename = `${activeModel}.stl`;
    switch (activeModel) {
      case 'gt2_pulley':
        filename = `gt2_pulley_${gt2Params.toothCount}T_${gt2Params.boreDiameter}mm.stl`;
        break;
      case 'herringbone_gear':
        filename = `herringbone_gear_m${gearParams.module}_z${gearParams.toothCount}.stl`;
        break;
      case 'bearing_pillow_block':
        filename = `bearing_pillow_block_${pillowParams.preset}.stl`;
        break;
      case 'structural_bracket':
        filename = `structural_l_bracket_${bracketParams.leg1Length}x${bracketParams.leg2Length}mm.stl`;
        break;
      case 'knurled_knob':
        filename = `knurled_knob_${knobParams.outerDiameter}mm_${knobParams.knurlPattern}.stl`;
        break;
      case 'threaded_fastener':
        filename = `${fastenerParams.fastenerType}_M${fastenerParams.nominalDiameter}_pitch${fastenerParams.pitch}.stl`;
        break;
      case 'shaft_coupler':
        filename = `shaft_coupler_${couplerParams.bore1Diameter}to${couplerParams.bore2Diameter}mm.stl`;
        break;
      case 'project_enclosure':
        filename = `project_enclosure_${enclosureParams.innerLength}x${enclosureParams.innerWidth}x${enclosureParams.innerHeight}mm.stl`;
        break;
      case 'stepper_mount':
        filename = `stepper_mount_${stepperParams.nemaSize}.stl`;
        break;
      case 'linear_rod_clamp':
        filename = `linear_rod_clamp_sk${clampParams.rodDiameter}.stl`;
        break;
      case 'hose_barb':
        filename = `hose_barb_${barbParams.barbNominalID}mm_${barbParams.connectorType}.stl`;
        break;
      case 'lead_screw_nut_block':
        filename = `t8_leadscrew_nut_block_${nutBlockParams.blockWidth}x${nutBlockParams.blockLength}mm.stl`;
        break;
      case 'cable_chain_link':
        filename = `cable_chain_link_${chainParams.chamberWidth}x${chainParams.chamberHeight}mm.stl`;
        break;
    }

    exportSTL(meshResult.geometry, { filename, binary });
  }, [
    activeModel,
    meshResult,
    gt2Params,
    gearParams,
    pillowParams,
    bracketParams,
    knobParams,
    fastenerParams,
    couplerParams,
    enclosureParams,
    stepperParams,
    clampParams,
    barbParams,
    nutBlockParams,
    chainParams,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        activeModel={activeModel}
        onSelectModel={setActiveModel}
        onExportSTL={handleExportSTL}
      />

      {/* Hardware Presets Quick Toolbar */}
      <PresetsBar
        activeModel={activeModel}
        onApplyPreset={handleApplyPreset}
        onApplyBearingPreset={handleApplyBearingPreset}
      />

      {/* Main Split-Screen Work Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar: Parametric Sliders & Number Inputs */}
        <ParameterSidebar
          activeModel={activeModel}
          gearParams={gearParams}
          pillowParams={pillowParams}
          bracketParams={bracketParams}
          gt2Params={gt2Params}
          knobParams={knobParams}
          fastenerParams={fastenerParams}
          couplerParams={couplerParams}
          enclosureParams={enclosureParams}
          stepperParams={stepperParams}
          clampParams={clampParams}
          barbParams={barbParams}
          nutBlockParams={nutBlockParams}
          chainParams={chainParams}
          onUpdateGearParams={handleUpdateGearParams}
          onUpdatePillowParams={handleUpdatePillowParams}
          onUpdateBracketParams={handleUpdateBracketParams}
          onUpdateGT2Params={handleUpdateGT2Params}
          onUpdateKnobParams={handleUpdateKnobParams}
          onUpdateFastenerParams={handleUpdateFastenerParams}
          onUpdateCouplerParams={handleUpdateCouplerParams}
          onUpdateEnclosureParams={handleUpdateEnclosureParams}
          onUpdateStepperParams={handleUpdateStepperParams}
          onUpdateClampParams={handleUpdateClampParams}
          onUpdateBarbParams={handleUpdateBarbParams}
          onUpdateNutBlockParams={handleUpdateNutBlockParams}
          onUpdateChainParams={handleUpdateChainParams}
          onExportSTL={handleExportSTL}
        />

        {/* Right Viewport: Interactive 3D Canvas */}
        <main className="flex-1 h-full relative overflow-hidden">
          <Viewport
            geometry={meshResult.geometry}
            dimensions={meshResult.dimensions}
            triangles={meshResult.triangles}
            vertices={meshResult.vertices}
            estimatedPrintWeightGrams={meshResult.estimatedPrintWeightGrams}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
