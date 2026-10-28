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
  BevelGearParams,
  TimingBeltIdlerParams,
  VSlotWheelParams,
  FlexibleBeamCouplerParams,
  WormGearParams,
  ThumbScrewWheelParams,
  VelocityStackParams,
  CentrifugalImpellerParams,
  ExtrusionEndCapParams,
  TNutSlotParams,
  CornerCubeBracketParams,
  BallJointRodEndParams,
  ServoHornParams,
  CableGuideAnchorParams,
  StepperDamperPlateParams,
  PCBStandoffClipParams,
  EndstopMountParams,
  FanDuctShroudParams,
  SpoolHolderHubParams,
  DialIndicatorMountParams,
  CycloidalGearParams,
  GenevaMechanismParams,
  PlanetaryCarrierParams,
  RackAndPinionParams,
  ScotchYokeParams,
  DinRailClipParams,
  HingeLeafParams,
  SpindleMountParams,
  VibrationIsolatorParams,
  CrossSlideBracketParams,
  VenturiNozzleParams,
  PipeFlangeParams,
  PeristalticPumpHeadParams,
  CableGlandParams,
  StrainReliefBootParams,
  FilamentRunoutSensorParams,
  SlipRingCapsuleParams,
  PiezoMountParams,
  DrillGuideBlockParams,
  ChamferToolHolderParams,
  GeneratedMeshResult,
  BearingPresetType,
  BEARING_PRESET_DATA,
  PRIMITIVE_CATALOG,
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
  generateBevelGear,
  generateTimingBeltIdler,
  generateVSlotWheel,
  generateFlexibleBeamCoupler,
  generateWormGear,
  generateThumbScrewWheel,
  generateVelocityStack,
  generateCentrifugalImpeller,
  generateExtrusionEndCap,
  generateTNutSlot,
  generateCornerCubeBracket,
  generateBallJointRodEnd,
  generateServoHorn,
  generateCableGuideAnchor,
  generateStepperDamperPlate,
  generatePCBStandoffClip,
  generateEndstopMount,
  generateFanDuctShroud,
  generateSpoolHolderHub,
  generateDialIndicatorMount,
  generateCycloidalGear,
  generateGenevaMechanism,
  generatePlanetaryCarrier,
  generateRackAndPinion,
  generateScotchYoke,
  generateDinRailClip,
  generateHingeLeaf,
  generateSpindleMount,
  generateVibrationIsolator,
  generateCrossSlideBracket,
  generateVenturiNozzle,
  generatePipeFlange,
  generatePeristalticPumpHead,
  generateCableGland,
  generateStrainReliefBoot,
  generateFilamentRunoutSensor,
  generateSlipRingCapsule,
  generatePiezoMount,
  generateDrillGuideBlock,
  generateChamferToolHolder,
} from './generators';
import { exportSTL } from './utils/stlExport';
import { Header } from './components/Header';
import { PresetsBar } from './components/PresetsBar';
import { ParameterSidebar } from './components/ParameterSidebar';
import { Viewport } from './components/Viewport';

export const App: React.FC = () => {
  // Current active primitive model (defaults to GT2 Pulley or URL ?part= query)
  const [activeModel, setActiveModel] = useState<PrimitiveType>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const partParam = params.get('part') || window.location.hash.replace('#', '');
      if (partParam && PRIMITIVE_CATALOG.some((p) => p.id === partParam)) {
        return partParam as PrimitiveType;
      }
    } catch {
      // fallback
    }
    return 'gt2_pulley';
  });

  const handleSelectModel = useCallback((model: PrimitiveType) => {
    setActiveModel(model);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('part', model);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  }, []);

  // --- Initial Parameters: Original 13 Models ---
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
    cornerFillet: 2.0,
    leadInChamfer: true,
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
    innerFillet: 3.0,
    outerFillet: 1.5,
    gussetReinforcement: true,
    gussetThickness: 4.0,
    holePattern: 'four-grid',
    screwSize: 'M4',
    hasCountersink: false,
    printer_compensation: 0.15,
  });

  const [knobParams, setKnobParams] = useState<KnurledKnobParams>({
    outerDiameter: 26,
    height: 18,
    knurlPattern: 'diamond',
    knurlCount: 32,
    knurlDepth: 1.0,
    hasPointer: true,
    hasSkirt: true,
    skirtDiameter: 32,
    skirtHeight: 3.5,
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
    headType: 'socket-cap',
    headDiameter: 13,
    headHeight: 8,
    nutHeight: 6.8,
    nutWidthAcrossFlats: 13,
    printer_compensation: 0.15,
  });

  const [couplerParams, setCouplerParams] = useState<ShaftCouplerParams>({
    outerDiameter: 19,
    length: 25,
    bore1Diameter: 5.0,
    bore2Diameter: 8.0,
    bore1Type: 'd-shaft',
    bore2Type: 'round',
    couplerStyle: 'slit-clamp',
    slitWidth: 1.5,
    clampScrewSize: 'M3',
    printer_compensation: 0.15,
  });

  const [enclosureParams, setEnclosureParams] = useState<ProjectEnclosureParams>({
    innerLength: 85,
    innerWidth: 55,
    innerHeight: 30,
    wallThickness: 2.5,
    floorThickness: 2.0,
    cornerRadius: 4.0,
    lidLipHeight: 2.5,
    standoffCount: 4,
    standoffHeight: 5.0,
    standoffScrewSize: 'M3',
    hasCableCutout: true,
    cableCutoutWidth: 14,
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
    hexNutWidth: 14,
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

  // --- Initial Parameters: 20 New Hobbyist Models ---
  const [bevelParams, setBevelParams] = useState<BevelGearParams>({
    module: 1.5,
    toothCount: 20,
    coneAngleDeg: 45,
    faceWidth: 12,
    boreDiameter: 5.0,
    boreType: 'd-shaft',
    dShaftFlatOffset: 2.1,
    hasHub: true,
    hubDiameter: 16,
    hubLength: 8,
    printer_compensation: 0.15,
  });

  const [idlerParams, setIdlerParams] = useState<TimingBeltIdlerParams>({
    profileType: 'smooth',
    pulleyDiameter: 18,
    beltWidth: 6,
    flangeHeight: 2.0,
    flangeThickness: 1.0,
    bearingPreset: '608',
    bearingPocketDepth: 7.0,
    centerRidgeThickness: 1.5,
    printer_compensation: 0.15,
  });

  const [vWheelParams, setVWheelParams] = useState<VSlotWheelParams>({
    outerDiameter: 24.0,
    wheelWidth: 11.0,
    vAngleDeg: 90.0,
    vDepth: 3.5,
    bearingPocketOD: 16.0,
    bearingPocketDepth: 5.0,
    centerRidgeWidth: 1.0,
    printer_compensation: 0.15,
  });

  const [beamParams, setBeamParams] = useState<FlexibleBeamCouplerParams>({
    outerDiameter: 19.0,
    length: 25.0,
    bore1Diameter: 5.0,
    bore2Diameter: 8.0,
    spiralPitch: 3.5,
    spiralTurns: 3.5,
    spiralSlotWidth: 1.6,
    clampScrewSize: 'M3',
    printer_compensation: 0.15,
  });

  const [wormParams, setWormParams] = useState<WormGearParams>({
    module: 1.0,
    starts: 1,
    length: 28.0,
    pitchDiameter: 16.0,
    boreDiameter: 5.0,
    boreType: 'd-shaft',
    dShaftFlatOffset: 2.1,
    printer_compensation: 0.15,
  });

  const [thumbParams, setThumbParams] = useState<ThumbScrewWheelParams>({
    outerDiameter: 32.0,
    thickness: 10.0,
    lobeCount: 6,
    lobeDepth: 2.5,
    nutSize: 'M4',
    pocketType: 'hex-nut',
    pocketDepth: 4.5,
    throughHoleDia: 4.5,
    printer_compensation: 0.15,
  });

  const [stackParams, setStackParams] = useState<VelocityStackParams>({
    throatDiameter: 28.0,
    flareDiameter: 55.0,
    height: 45.0,
    wallThickness: 2.0,
    flangeType: 'round-ring',
    flangeBoltSize: 'M4',
    boltCircleDia: 42.0,
    printer_compensation: 0.15,
  });

  const [impellerParams, setImpellerParams] = useState<CentrifugalImpellerParams>({
    outerDiameter: 50.0,
    hubDiameter: 16.0,
    height: 14.0,
    bladeCount: 6,
    bladeThickness: 1.8,
    bladeAngleDeg: 35.0,
    boreDiameter: 5.0,
    boreType: 'd-shaft',
    dShaftFlatOffset: 2.1,
    hasBackPlate: true,
    backPlateThickness: 2.0,
    printer_compensation: 0.15,
  });

  const [endCapParams, setEndCapParams] = useState<ExtrusionEndCapParams>({
    profileSize: '2020',
    capThickness: 3.0,
    prongLength: 8.0,
    bezelChamfer: 1.2,
    centerHole: true,
    centerHoleDiameter: 5.0,
    printer_compensation: 0.15,
  });

  const [tNutParams, setTNutParams] = useState<TNutSlotParams>({
    slotSize: 'slot-6',
    threadSize: 'M4',
    nutLength: 12.0,
    nutWidth: 6.0,
    headHeight: 4.5,
    hasAntiRotationRidge: true,
    printer_compensation: 0.15,
  });

  const [cornerCubeParams, setCornerCubeParams] = useState<CornerCubeBracketParams>({
    cubeSize: 20.0,
    holeDiameter: 5.2,
    counterboreDia: 9.5,
    counterboreDepth: 6.0,
    chamferRadius: 1.0,
    faceCount: 3,
    printer_compensation: 0.15,
  });

  const [ballJointParams, setBallJointParams] = useState<BallJointRodEndParams>({
    ballDiameter: 10.0,
    neckDiameter: 7.0,
    shankDiameter: 10.0,
    shankLength: 18.0,
    shankThreadSize: 'M4',
    hasClampSlit: true,
    pinchScrewSize: 'M3',
    printer_compensation: 0.15,
  });

  const [servoHornParams, setServoHornParams] = useState<ServoHornParams>({
    splineDiameter: 5.9,
    hornStyle: 'single-arm',
    armLength: 22.0,
    armThickness: 3.0,
    hubDiameter: 11.0,
    hubHeight: 6.0,
    holeSpacing: 4.0,
    linkageHoleDia: 1.6,
    centerScrewPocketDia: 5.2,
    printer_compensation: 0.15,
  });

  const [anchorParams, setAnchorParams] = useState<CableGuideAnchorParams>({
    anchorWidth: 24.0,
    anchorLength: 32.0,
    anchorHeight: 16.0,
    slotStyle: 'zip-tie',
    tieSlotWidth: 3.2,
    mountHoleSpacing: 20.0,
    mountScrewSize: 'M4',
    hasExtrusionSlotLug: true,
    printer_compensation: 0.15,
  });

  const [damperParams, setDamperParams] = useState<StepperDamperPlateParams>({
    nemaSize: 'NEMA17',
    plateThickness: 8.0,
    flexureSlitWidth: 1.6,
    flexureStyle: 'serpentine',
    motorScrewSize: 'M3',
    frameScrewSize: 'M4',
    centerBoreDia: 22.0,
    printer_compensation: 0.15,
  });

  const [standoffParams, setStandoffParams] = useState<PCBStandoffClipParams>({
    pcbThickness: 1.6,
    standoffHeight: 12.0,
    clipType: 'edge-clip',
    baseDiameter: 16.0,
    baseMountType: 'm3-screw',
    barbOverhang: 1.2,
    printer_compensation: 0.15,
  });

  const [endstopParams, setEndstopParams] = useState<EndstopMountParams>({
    switchType: 'omron-micro',
    mountBodyLength: 32.0,
    mountBodyWidth: 20.0,
    bodyThickness: 5.0,
    slotAdjustLength: 14.0,
    extrusionMountScrew: 'M4',
    switchScrewSize: 'M2.5',
    hasSlotLug: true,
    printer_compensation: 0.15,
  });

  const [ductParams, setDuctParams] = useState<FanDuctShroudParams>({
    fanType: '5015-blower',
    ductLength: 38.0,
    ductAngleDeg: 40.0,
    nozzleWidth: 18.0,
    nozzleHeight: 4.5,
    wallThickness: 1.6,
    mountTabDistance: 24.0,
    mountScrewSize: 'M3',
    printer_compensation: 0.15,
  });

  const [spoolHubParams, setSpoolHubParams] = useState<SpoolHolderHubParams>({
    spoolBoreMin: 52.0,
    spoolBoreMax: 72.0,
    coneLength: 35.0,
    flangeDiameter: 80.0,
    bearingType: '608',
    axleRodDiameter: 8.0,
    printer_compensation: 0.15,
  });

  const [dialMountParams, setDialMountParams] = useState<DialIndicatorMountParams>({
    stemDiameter: 8.0,
    clampThickness: 14.0,
    clampWidth: 22.0,
    clampSlitGap: 1.4,
    pinchBoltSize: 'M3',
    mountStyle: '2020-rail-lug',
    armLength: 25.0,
    printer_compensation: 0.15,
  });

  // --- 20 Maker & Machine Components State (34-53) ---
  const [cycloidalParams, setCycloidalParams] = useState<CycloidalGearParams>({
    rotorLobes: 10,
    pinCircleDiameter: 70.0,
    rollerDiameter: 5.0,
    eccentricity: 1.5,
    thickness: 8.0,
    boreDiameter: 12.0,
    driveHoleCount: 6,
    driveHoleDiameter: 10.0,
    printer_compensation: 0.15,
  });

  const [genevaParams, setGenevaParams] = useState<GenevaMechanismParams>({
    slotCount: 4,
    wheelRadius: 35.0,
    pinDiameter: 6.0,
    slotWidth: 6.5,
    thickness: 6.0,
    centerBoreDiameter: 5.0,
    lockingRadius: 18.0,
    printer_compensation: 0.15,
  });

  const [planetaryParams, setPlanetaryParams] = useState<PlanetaryCarrierParams>({
    planetCount: 3,
    carrierDiameter: 55.0,
    plateThickness: 5.0,
    pinPitchDiameter: 40.0,
    pinHoleDiameter: 5.0,
    sunShaftBore: 8.0,
    postHeight: 14.0,
    printer_compensation: 0.15,
  });

  const [rackParams, setRackParams] = useState<RackAndPinionParams>({
    module: 1.0,
    rackLength: 150.0,
    rackWidth: 12.0,
    rackHeight: 15.0,
    pressureAngleDeg: 20.0,
    mountHoleSpacing: 30.0,
    mountHoleDiameter: 4.5,
    printer_compensation: 0.15,
  });

  const [scotchParams, setScotchParams] = useState<ScotchYokeParams>({
    yokeStroke: 30.0,
    slotWidth: 8.0,
    blockLength: 60.0,
    blockHeight: 32.0,
    blockThickness: 10.0,
    rodDiameter: 8.0,
    printer_compensation: 0.15,
  });

  const [dinRailParams, setDinRailParams] = useState<DinRailClipParams>({
    railWidth: 35.0,
    clipThickness: 14.0,
    equipmentPlateWidth: 45.0,
    equipmentPlateHeight: 55.0,
    mountHoleSpacing: 25.0,
    mountScrewSize: 'M3',
    printer_compensation: 0.15,
  });

  const [hingeParams, setHingeParams] = useState<HingeLeafParams>({
    knuckleCount: 3,
    leafWidth: 30.0,
    leafLength: 50.0,
    leafThickness: 3.5,
    pinDiameter: 3.5,
    screwHoleCount: 3,
    screwSize: 'M3',
    knuckleClearance: 0.4,
    printer_compensation: 0.15,
  });

  const [spindleParams, setSpindleParams] = useState<SpindleMountParams>({
    spindleDiameter: 65.0,
    clampHeight: 30.0,
    wallThickness: 12.0,
    pinchBoltSize: 'M5',
    baseMountWidth: 95.0,
    baseMountHoleSpacingX: 80.0,
    baseMountHoleSpacingY: 25.0,
    printer_compensation: 0.15,
  });

  const [isolatorParams, setIsolatorParams] = useState<VibrationIsolatorParams>({
    baseDiameter: 36.0,
    waistDiameter: 22.0,
    height: 28.0,
    topStudHoleDiameter: 4.5,
    bottomNutTrapSize: 'M4',
    cavityDepth: 8.0,
    printer_compensation: 0.15,
  });

  const [crossSlideParams, setCrossSlideParams] = useState<CrossSlideBracketParams>({
    rodDiameterA: 10.0,
    rodDiameterB: 10.0,
    offsetZ: 18.0,
    blockWidth: 32.0,
    blockLength: 32.0,
    pinchBoltSize: 'M3',
    printer_compensation: 0.15,
  });

  const [venturiParams, setVenturiParams] = useState<VenturiNozzleParams>({
    inletDiameter: 28.0,
    throatDiameter: 10.0,
    outletDiameter: 24.0,
    nozzleLength: 65.0,
    wallThickness: 2.5,
    suctionPortDiameter: 7.0,
    flangeMount: true,
    printer_compensation: 0.15,
  });

  const [flangeParams, setFlangeParams] = useState<PipeFlangeParams>({
    pipeNominalDiameter: 33.4,
    flangeOuterDiameter: 75.0,
    flangeThickness: 8.0,
    boltHoleCount: 4,
    boltPitchCircleDiameter: 58.0,
    boltHoleDiameter: 5.5,
    hasORingGroove: true,
    oRingWidth: 3.0,
    printer_compensation: 0.15,
  });

  const [pumpParams, setPumpParams] = useState<PeristalticPumpHeadParams>({
    rollerCount: 3,
    rotorOuterDiameter: 52.0,
    rollerBearingType: '624',
    tubeChannelWidth: 10.0,
    motorShaftDiameter: 5.0,
    rotorThickness: 12.0,
    printer_compensation: 0.15,
  });

  const [glandParams, setGlandParams] = useState<CableGlandParams>({
    cableDiameterMin: 4.0,
    cableDiameterMax: 8.0,
    hexNutSize: 22.0,
    threadLength: 12.0,
    glandHeight: 26.0,
    fingerCount: 6,
    printer_compensation: 0.15,
  });

  const [bootParams, setBootParams] = useState<StrainReliefBootParams>({
    cableDiameter: 6.0,
    flangeDiameter: 18.0,
    bootLength: 45.0,
    spiralPitch: 7.0,
    taperFactor: 0.65,
    slotWidth: 1.6,
    printer_compensation: 0.15,
  });

  const [runoutParams, setRunoutParams] = useState<FilamentRunoutSensorParams>({
    filamentDiameter: 1.75,
    microswitchType: 'kw11',
    bodyLength: 36.0,
    bodyWidth: 24.0,
    bodyHeight: 16.0,
    couplerThread: 'M6',
    mountHoleSpacing: 20.0,
    mountScrewSize: 'M3',
    printer_compensation: 0.15,
  });

  const [slipRingParams, setSlipRingCapsuleParams] = useState<SlipRingCapsuleParams>({
    capsuleOuterDiameter: 22.0,
    capsuleLength: 28.0,
    flangeDiameter: 34.0,
    rotorBoreDiameter: 8.0,
    mountBoltCount: 3,
    mountBoltPCD: 26.0,
    cableExitSlotWidth: 4.0,
    printer_compensation: 0.15,
  });

  const [piezoParams, setPiezoParams] = useState<PiezoMountParams>({
    piezoDiscDiameter: 20,
    mountRingOD: 28.0,
    diaphragmClearance: 1.2,
    bodyThickness: 6.0,
    contactPinDiameter: 4.0,
    mountScrewSize: 'M3',
    mountHoleCount: 3,
    printer_compensation: 0.15,
  });

  const [drillGuideParams, setDrillGuideParams] = useState<DrillGuideBlockParams>({
    blockLength: 80.0,
    blockWidth: 35.0,
    blockHeight: 25.0,
    vGrooveDepth: 6.0,
    hasCenterlineAlignment: true,
    printer_compensation: 0.15,
  });

  const [chamferParams, setChamferParams] = useState<ChamferToolHolderParams>({
    handleDiameter: 22.0,
    handleLength: 90.0,
    fluteCount: 8,
    fluteDepth: 1.5,
    colletBoreDiameter: 3.2,
    colletDepth: 22.0,
    setScrewSize: 'M3',
    ergonomicPalmGrip: true,
    printer_compensation: 0.15,
  });

  // State update handlers
  const handleUpdateGT2Params = useCallback((u: Partial<GT2PulleyParams>) => setGt2Params((p) => ({ ...p, ...u })), []);
  const handleUpdateGearParams = useCallback((u: Partial<HerringboneGearParams>) => setGearParams((p) => ({ ...p, ...u })), []);
  const handleUpdatePillowParams = useCallback((u: Partial<BearingPillowBlockParams>) => setPillowParams((p) => ({ ...p, ...u })), []);
  const handleUpdateBracketParams = useCallback((u: Partial<StructuralBracketParams>) => setBracketParams((p) => ({ ...p, ...u })), []);
  const handleUpdateKnobParams = useCallback((u: Partial<KnurledKnobParams>) => setKnobParams((p) => ({ ...p, ...u })), []);
  const handleUpdateFastenerParams = useCallback((u: Partial<ThreadedFastenerParams>) => setFastenerParams((p) => ({ ...p, ...u })), []);
  const handleUpdateCouplerParams = useCallback((u: Partial<ShaftCouplerParams>) => setCouplerParams((p) => ({ ...p, ...u })), []);
  const handleUpdateEnclosureParams = useCallback((u: Partial<ProjectEnclosureParams>) => setEnclosureParams((p) => ({ ...p, ...u })), []);
  const handleUpdateStepperParams = useCallback((u: Partial<StepperMountParams>) => setStepperParams((p) => ({ ...p, ...u })), []);
  const handleUpdateClampParams = useCallback((u: Partial<LinearRodClampParams>) => setClampParams((p) => ({ ...p, ...u })), []);
  const handleUpdateBarbParams = useCallback((u: Partial<HoseBarbParams>) => setBarbParams((p) => ({ ...p, ...u })), []);
  const handleUpdateNutBlockParams = useCallback((u: Partial<LeadScrewNutBlockParams>) => setNutBlockParams((p) => ({ ...p, ...u })), []);
  const handleUpdateChainParams = useCallback((u: Partial<CableChainLinkParams>) => setChainParams((p) => ({ ...p, ...u })), []);

  // 20 Previous New Handlers
  const handleUpdateBevelParams = useCallback((u: Partial<BevelGearParams>) => setBevelParams((p) => ({ ...p, ...u })), []);
  const handleUpdateIdlerParams = useCallback((u: Partial<TimingBeltIdlerParams>) => setIdlerParams((p) => ({ ...p, ...u })), []);
  const handleUpdateVWheelParams = useCallback((u: Partial<VSlotWheelParams>) => setVWheelParams((p) => ({ ...p, ...u })), []);
  const handleUpdateBeamParams = useCallback((u: Partial<FlexibleBeamCouplerParams>) => setBeamParams((p) => ({ ...p, ...u })), []);
  const handleUpdateWormParams = useCallback((u: Partial<WormGearParams>) => setWormParams((p) => ({ ...p, ...u })), []);
  const handleUpdateThumbParams = useCallback((u: Partial<ThumbScrewWheelParams>) => setThumbParams((p) => ({ ...p, ...u })), []);
  const handleUpdateStackParams = useCallback((u: Partial<VelocityStackParams>) => setStackParams((p) => ({ ...p, ...u })), []);
  const handleUpdateImpellerParams = useCallback((u: Partial<CentrifugalImpellerParams>) => setImpellerParams((p) => ({ ...p, ...u })), []);
  const handleUpdateEndCapParams = useCallback((u: Partial<ExtrusionEndCapParams>) => setEndCapParams((p) => ({ ...p, ...u })), []);
  const handleUpdateTNutParams = useCallback((u: Partial<TNutSlotParams>) => setTNutParams((p) => ({ ...p, ...u })), []);
  const handleUpdateCornerCubeParams = useCallback((u: Partial<CornerCubeBracketParams>) => setCornerCubeParams((p) => ({ ...p, ...u })), []);
  const handleUpdateBallJointParams = useCallback((u: Partial<BallJointRodEndParams>) => setBallJointParams((p) => ({ ...p, ...u })), []);
  const handleUpdateServoHornParams = useCallback((u: Partial<ServoHornParams>) => setServoHornParams((p) => ({ ...p, ...u })), []);
  const handleUpdateAnchorParams = useCallback((u: Partial<CableGuideAnchorParams>) => setAnchorParams((p) => ({ ...p, ...u })), []);
  const handleUpdateDamperParams = useCallback((u: Partial<StepperDamperPlateParams>) => setDamperParams((p) => ({ ...p, ...u })), []);
  const handleUpdateStandoffParams = useCallback((u: Partial<PCBStandoffClipParams>) => setStandoffParams((p) => ({ ...p, ...u })), []);
  const handleUpdateEndstopParams = useCallback((u: Partial<EndstopMountParams>) => setEndstopParams((p) => ({ ...p, ...u })), []);
  const handleUpdateDuctParams = useCallback((u: Partial<FanDuctShroudParams>) => setDuctParams((p) => ({ ...p, ...u })), []);
  const handleUpdateSpoolHubParams = useCallback((u: Partial<SpoolHolderHubParams>) => setSpoolHubParams((p) => ({ ...p, ...u })), []);
  const handleUpdateDialMountParams = useCallback((u: Partial<DialIndicatorMountParams>) => setDialMountParams((p) => ({ ...p, ...u })), []);

  // 20 Maker & Machine Component Handlers (34-53)
  const handleUpdateCycloidalParams = useCallback((u: Partial<CycloidalGearParams>) => setCycloidalParams((p) => ({ ...p, ...u })), []);
  const handleUpdateGenevaParams = useCallback((u: Partial<GenevaMechanismParams>) => setGenevaParams((p) => ({ ...p, ...u })), []);
  const handleUpdatePlanetaryParams = useCallback((u: Partial<PlanetaryCarrierParams>) => setPlanetaryParams((p) => ({ ...p, ...u })), []);
  const handleUpdateRackParams = useCallback((u: Partial<RackAndPinionParams>) => setRackParams((p) => ({ ...p, ...u })), []);
  const handleUpdateScotchParams = useCallback((u: Partial<ScotchYokeParams>) => setScotchParams((p) => ({ ...p, ...u })), []);
  const handleUpdateDinRailParams = useCallback((u: Partial<DinRailClipParams>) => setDinRailParams((p) => ({ ...p, ...u })), []);
  const handleUpdateHingeParams = useCallback((u: Partial<HingeLeafParams>) => setHingeParams((p) => ({ ...p, ...u })), []);
  const handleUpdateSpindleParams = useCallback((u: Partial<SpindleMountParams>) => setSpindleParams((p) => ({ ...p, ...u })), []);
  const handleUpdateIsolatorParams = useCallback((u: Partial<VibrationIsolatorParams>) => setIsolatorParams((p) => ({ ...p, ...u })), []);
  const handleUpdateCrossSlideParams = useCallback((u: Partial<CrossSlideBracketParams>) => setCrossSlideParams((p) => ({ ...p, ...u })), []);
  const handleUpdateVenturiParams = useCallback((u: Partial<VenturiNozzleParams>) => setVenturiParams((p) => ({ ...p, ...u })), []);
  const handleUpdateFlangeParams = useCallback((u: Partial<PipeFlangeParams>) => setFlangeParams((p) => ({ ...p, ...u })), []);
  const handleUpdatePumpParams = useCallback((u: Partial<PeristalticPumpHeadParams>) => setPumpParams((p) => ({ ...p, ...u })), []);
  const handleUpdateGlandParams = useCallback((u: Partial<CableGlandParams>) => setGlandParams((p) => ({ ...p, ...u })), []);
  const handleUpdateBootParams = useCallback((u: Partial<StrainReliefBootParams>) => setBootParams((p) => ({ ...p, ...u })), []);
  const handleUpdateRunoutParams = useCallback((u: Partial<FilamentRunoutSensorParams>) => setRunoutParams((p) => ({ ...p, ...u })), []);
  const handleUpdateSlipRingParams = useCallback((u: Partial<SlipRingCapsuleParams>) => setSlipRingCapsuleParams((p) => ({ ...p, ...u })), []);
  const handleUpdatePiezoParams = useCallback((u: Partial<PiezoMountParams>) => setPiezoParams((p) => ({ ...p, ...u })), []);
  const handleUpdateDrillGuideParams = useCallback((u: Partial<DrillGuideBlockParams>) => setDrillGuideParams((p) => ({ ...p, ...u })), []);
  const handleUpdateChamferParams = useCallback((u: Partial<ChamferToolHolderParams>) => setChamferParams((p) => ({ ...p, ...u })), []);

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
        setGt2Params((p) => ({ ...p, toothCount: 16, pitch: 2.0, beltWidth: 6, boreDiameter: 5.0, boreType: 'round', hasHub: false }));
        break;
      case 'gt2_20t_dshaft':
        setGt2Params((p) => ({ ...p, toothCount: 20, pitch: 2.0, beltWidth: 6, boreDiameter: 5.0, boreType: 'd-shaft', dShaftFlatOffset: 2.1, hasHub: true, hubDiameter: 15.0, hubHeight: 6.0 }));
        break;
      case 'gt2_36t_8mm':
        setGt2Params((p) => ({ ...p, toothCount: 36, pitch: 2.0, beltWidth: 9, boreDiameter: 8.0, boreType: 'round', hasHub: true, hubDiameter: 20.0, hubHeight: 8.0 }));
        break;
      case 'gt2_60t_bull':
        setGt2Params((p) => ({ ...p, toothCount: 60, pitch: 2.0, beltWidth: 9, boreDiameter: 8.0, boreType: 'hex', hasHub: true, hubDiameter: 25.0, hubHeight: 10.0 }));
        break;

      // Herringbone Presets
      case 'stepper_drive':
        setGearParams((p) => ({ ...p, module: 1.0, toothCount: 20, faceWidth: 15, boreDiameter: 5.0, boreType: 'd-shaft', dShaftFlatOffset: 2.1 }));
        break;
      case 'compact_pinion':
        setGearParams((p) => ({ ...p, module: 0.8, toothCount: 14, faceWidth: 10, boreDiameter: 4.0, boreType: 'round' }));
        break;
      case 'heavy_bull_gear':
        setGearParams((p) => ({ ...p, module: 2.0, toothCount: 36, faceWidth: 24, boreDiameter: 8.0, boreType: 'hex' }));
        break;

      // Structural Bracket Presets
      case 'compact_corner':
        setBracketParams((p) => ({ ...p, leg1Length: 25, leg2Length: 25, width: 20, thickness: 3.0, innerFillet: 2.0, outerFillet: 1.0, gussetReinforcement: false, screwSize: 'M3' }));
        break;
      case 'frame_gusset_m4':
        setBracketParams((p) => ({ ...p, leg1Length: 45, leg2Length: 45, width: 30, thickness: 4.5, innerFillet: 3.0, outerFillet: 1.5, gussetReinforcement: true, gussetThickness: 4.0, screwSize: 'M4' }));
        break;
      case 'heavy_duty_m5':
        setBracketParams((p) => ({ ...p, leg1Length: 75, leg2Length: 75, width: 40, thickness: 6.0, innerFillet: 5.0, outerFillet: 2.5, gussetReinforcement: true, gussetThickness: 5.5, screwSize: 'M5' }));
        break;

      // Knurled Knob Presets
      case 'knob_pot_fluted':
        setKnobParams((p) => ({ ...p, outerDiameter: 24, height: 16, knurlPattern: 'straight', knurlCount: 24, hasPointer: true }));
        break;
      case 'knob_bed_level_m4':
        setKnobParams((p) => ({ ...p, outerDiameter: 34, height: 12, knurlPattern: 'diamond', knurlCount: 36, hasSkirt: false }));
        break;
      case 'knob_audio_ribbed':
        setKnobParams((p) => ({ ...p, outerDiameter: 28, height: 20, knurlPattern: 'ribbed', knurlCount: 28, hasSkirt: true }));
        break;

      // Bevel Gear Presets
      case 'bevel_1to1_m15':
        setBevelParams((p) => ({ ...p, module: 1.5, toothCount: 20, coneAngleDeg: 45, faceWidth: 12, boreDiameter: 5.0, boreType: 'd-shaft', dShaftFlatOffset: 2.1, hasHub: true, hubDiameter: 16, hubLength: 8 }));
        break;
      case 'bevel_nema17_m10':
        setBevelParams((p) => ({ ...p, module: 1.0, toothCount: 24, coneAngleDeg: 45, faceWidth: 10, boreDiameter: 5.0, boreType: 'd-shaft', dShaftFlatOffset: 2.1, hasHub: true, hubDiameter: 15, hubLength: 7 }));
        break;
      case 'bevel_heavyduty_m20':
        setBevelParams((p) => ({ ...p, module: 2.0, toothCount: 30, coneAngleDeg: 45, faceWidth: 18, boreDiameter: 8.0, boreType: 'hex', hasHub: true, hubDiameter: 24, hubLength: 12 }));
        break;

      // Timing Belt Idler Presets
      case 'idler_gt2_608':
        setIdlerParams((p) => ({ ...p, profileType: 'smooth', pulleyDiameter: 22, beltWidth: 6, flangeHeight: 2.0, flangeThickness: 1.0, bearingPreset: '608', bearingPocketDepth: 7.0 }));
        break;
      case 'idler_mini_624':
        setIdlerParams((p) => ({ ...p, profileType: 'smooth', pulleyDiameter: 14, beltWidth: 6, flangeHeight: 1.8, flangeThickness: 0.9, bearingPreset: '624', bearingPocketDepth: 5.0 }));
        break;
      case 'idler_crowned_625':
        setIdlerParams((p) => ({ ...p, profileType: 'crowned', pulleyDiameter: 18, beltWidth: 9, flangeHeight: 2.0, flangeThickness: 1.2, bearingPreset: '625', bearingPocketDepth: 5.0 }));
        break;

      // V-Slot Wheel Presets
      case 'vwheel_openbuilds_std':
        setVWheelParams((p) => ({ ...p, outerDiameter: 24.0, wheelWidth: 11.0, vAngleDeg: 90.0, vDepth: 3.5, bearingPocketOD: 16.0, bearingPocketDepth: 5.0 }));
        break;
      case 'vwheel_mini_15':
        setVWheelParams((p) => ({ ...p, outerDiameter: 15.5, wheelWidth: 8.5, vAngleDeg: 90.0, vDepth: 2.5, bearingPocketOD: 13.0, bearingPocketDepth: 4.0 }));
        break;
      case 'vwheel_heavy_30':
        setVWheelParams((p) => ({ ...p, outerDiameter: 30.0, wheelWidth: 14.0, vAngleDeg: 90.0, vDepth: 4.5, bearingPocketOD: 16.0, bearingPocketDepth: 5.0 }));
        break;

      // Flexible Beam Coupler Presets
      case 'beam_5to8_nema17':
        setBeamParams((p) => ({ ...p, outerDiameter: 19.0, length: 25.0, bore1Diameter: 5.0, bore2Diameter: 8.0, spiralPitch: 3.5, spiralTurns: 3.5 }));
        break;
      case 'beam_5to5_direct':
        setBeamParams((p) => ({ ...p, outerDiameter: 19.0, length: 22.0, bore1Diameter: 5.0, bore2Diameter: 5.0, spiralPitch: 3.2, spiralTurns: 3.0 }));
        break;
      case 'beam_8to10_cnc':
        setBeamParams((p) => ({ ...p, outerDiameter: 25.0, length: 30.0, bore1Diameter: 8.0, bore2Diameter: 10.0, spiralPitch: 4.0, spiralTurns: 4.0 }));
        break;

      // Worm Gear Presets
      case 'worm_single_m10':
        setWormParams((p) => ({ ...p, module: 1.0, starts: 1, length: 28.0, pitchDiameter: 16.0, boreDiameter: 5.0, boreType: 'd-shaft', dShaftFlatOffset: 2.1 }));
        break;
      case 'worm_double_m15':
        setWormParams((p) => ({ ...p, module: 1.5, starts: 2, length: 35.0, pitchDiameter: 22.0, boreDiameter: 8.0, boreType: 'round' }));
        break;
      case 'worm_micro_m08':
        setWormParams((p) => ({ ...p, module: 0.8, starts: 1, length: 18.0, pitchDiameter: 11.0, boreDiameter: 3.0, boreType: 'round' }));
        break;

      // Thumb Screw Wheel Presets
      case 'thumb_m3_bed':
        setThumbParams((p) => ({ ...p, outerDiameter: 30.0, thickness: 9.0, lobeCount: 6, lobeDepth: 2.5, nutSize: 'M3', pocketType: 'hex-nut', pocketDepth: 4.0 }));
        break;
      case 'thumb_m4_knob':
        setThumbParams((p) => ({ ...p, outerDiameter: 36.0, thickness: 11.0, lobeCount: 8, lobeDepth: 2.8, nutSize: 'M4', pocketType: 'hex-nut', pocketDepth: 5.0 }));
        break;
      case 'thumb_m5_jig':
        setThumbParams((p) => ({ ...p, outerDiameter: 45.0, thickness: 13.0, lobeCount: 7, lobeDepth: 3.5, nutSize: 'M5', pocketType: 'hex-nut', pocketDepth: 6.0 }));
        break;
      case 'thumb_m8_heavy':
        setThumbParams((p) => ({ ...p, outerDiameter: 55.0, thickness: 16.0, lobeCount: 6, lobeDepth: 4.5, nutSize: 'M8', pocketType: 'hex-nut', pocketDepth: 8.0 }));
        break;

      // Velocity Stack Presets
      case 'stack_carb_28':
        setStackParams((p) => ({ ...p, throatDiameter: 28.0, flareDiameter: 55.0, height: 45.0, flangeType: 'round-ring', boltCircleDia: 42.0 }));
        break;
      case 'stack_itb_40':
        setStackParams((p) => ({ ...p, throatDiameter: 40.0, flareDiameter: 75.0, height: 60.0, flangeType: 'oval-2bolt', boltCircleDia: 60.0 }));
        break;
      case 'stack_turbo_60':
        setStackParams((p) => ({ ...p, throatDiameter: 60.0, flareDiameter: 110.0, height: 80.0, flangeType: 'round-ring', boltCircleDia: 85.0 }));
        break;

      // Centrifugal Impeller Presets
      case 'impeller_water_50':
        setImpellerParams((p) => ({ ...p, outerDiameter: 50.0, hubDiameter: 16.0, height: 14.0, bladeCount: 6, bladeAngleDeg: 35.0, boreDiameter: 5.0, boreType: 'd-shaft', dShaftFlatOffset: 2.1 }));
        break;
      case 'impeller_blower_75':
        setImpellerParams((p) => ({ ...p, outerDiameter: 75.0, hubDiameter: 22.0, height: 20.0, bladeCount: 10, bladeAngleDeg: 40.0, boreDiameter: 8.0, boreType: 'round' }));
        break;
      case 'impeller_mini_35':
        setImpellerParams((p) => ({ ...p, outerDiameter: 35.0, hubDiameter: 12.0, height: 10.0, bladeCount: 8, bladeAngleDeg: 30.0, boreDiameter: 3.0, boreType: 'round' }));
        break;

      // Extrusion End Cap Presets
      case 'endcap_2020':
        setEndCapParams((p) => ({ ...p, profileSize: '2020', capThickness: 3.0, prongLength: 8.0, centerHole: true }));
        break;
      case 'endcap_2040':
        setEndCapParams((p) => ({ ...p, profileSize: '2040', capThickness: 3.0, prongLength: 8.0, centerHole: false }));
        break;
      case 'endcap_3030':
        setEndCapParams((p) => ({ ...p, profileSize: '3030', capThickness: 4.0, prongLength: 10.0, centerHole: true }));
        break;

      // Drop-In T-Nut Presets
      case 'tnut_2020_m4':
        setTNutParams((p) => ({ ...p, slotSize: 'slot-6', threadSize: 'M4', nutLength: 12.0, nutWidth: 6.0, headHeight: 4.5 }));
        break;
      case 'tnut_2020_m5':
        setTNutParams((p) => ({ ...p, slotSize: 'slot-6', threadSize: 'M5', nutLength: 14.0, nutWidth: 6.0, headHeight: 4.5 }));
        break;
      case 'tnut_3030_m6':
        setTNutParams((p) => ({ ...p, slotSize: 'slot-8', threadSize: 'M6', nutLength: 16.0, nutWidth: 8.0, headHeight: 5.5 }));
        break;

      // Corner Cube Presets
      case 'corner_cube_2020_3way':
        setCornerCubeParams((p) => ({ ...p, cubeSize: 20.0, holeDiameter: 5.2, counterboreDia: 9.5, counterboreDepth: 6.0, faceCount: 3 }));
        break;
      case 'corner_cube_2020_2way':
        setCornerCubeParams((p) => ({ ...p, cubeSize: 20.0, holeDiameter: 5.2, counterboreDia: 9.5, counterboreDepth: 6.0, faceCount: 2 }));
        break;
      case 'corner_cube_3030_3way':
        setCornerCubeParams((p) => ({ ...p, cubeSize: 30.0, holeDiameter: 6.5, counterboreDia: 11.5, counterboreDepth: 8.0, faceCount: 3 }));
        break;

      // Ball Joint Rod End Presets
      case 'ball_kossel_m4':
        setBallJointParams((p) => ({ ...p, ballDiameter: 10.0, neckDiameter: 7.0, shankDiameter: 10.0, shankLength: 18.0, shankThreadSize: 'M4', hasClampSlit: true }));
        break;
      case 'ball_rc_m3':
        setBallJointParams((p) => ({ ...p, ballDiameter: 8.0, neckDiameter: 5.5, shankDiameter: 8.0, shankLength: 14.0, shankThreadSize: 'M3', hasClampSlit: true }));
        break;
      case 'ball_cnc_m6':
        setBallJointParams((p) => ({ ...p, ballDiameter: 16.0, neckDiameter: 10.0, shankDiameter: 14.0, shankLength: 25.0, shankThreadSize: 'M6', hasClampSlit: true }));
        break;

      // Servo Horn Presets
      case 'servo_single_25t':
        setServoHornParams((p) => ({ ...p, splineDiameter: 5.9, hornStyle: 'single-arm', armLength: 25.0, armThickness: 3.0, linkageHoleDia: 1.6 }));
        break;
      case 'servo_dual_25t':
        setServoHornParams((p) => ({ ...p, splineDiameter: 5.9, hornStyle: 'dual-arm', armLength: 35.0, armThickness: 3.2, linkageHoleDia: 1.6 }));
        break;
      case 'servo_micro_21t':
        setServoHornParams((p) => ({ ...p, splineDiameter: 4.8, hornStyle: 'single-arm', armLength: 16.0, armThickness: 2.2, linkageHoleDia: 1.2 }));
        break;

      // Cable Guide Anchor Presets
      case 'anchor_2020_m4':
        setAnchorParams((p) => ({ ...p, anchorWidth: 24.0, anchorLength: 32.0, anchorHeight: 16.0, mountHoleSpacing: 20.0, mountScrewSize: 'M4', hasExtrusionSlotLug: true }));
        break;
      case 'anchor_dragchain_m5':
        setAnchorParams((p) => ({ ...p, anchorWidth: 32.0, anchorLength: 42.0, anchorHeight: 20.0, mountHoleSpacing: 28.0, mountScrewSize: 'M5', hasExtrusionSlotLug: true }));
        break;

      // Stepper Damper Presets
      case 'damper_nema17_serpentine':
        setDamperParams((p) => ({ ...p, nemaSize: 'NEMA17', plateThickness: 8.0, flexureSlitWidth: 1.6 }));
        break;
      case 'damper_nema23_heavy':
        setDamperParams((p) => ({ ...p, nemaSize: 'NEMA23', plateThickness: 10.0, flexureSlitWidth: 2.0 }));
        break;

      // PCB Standoff Presets
      case 'standoff_10mm_m3':
        setStandoffParams((p) => ({ ...p, pcbThickness: 1.6, standoffHeight: 10.0, baseMountType: 'm3-screw' }));
        break;
      case 'standoff_15mm_high':
        setStandoffParams((p) => ({ ...p, pcbThickness: 1.6, standoffHeight: 15.0, baseMountType: 'm3-screw' }));
        break;

      // Endstop Mount Presets
      case 'endstop_omron_2020':
        setEndstopParams((p) => ({ ...p, switchType: 'omron-micro', mountBodyLength: 32.0, slotAdjustLength: 14.0, extrusionMountScrew: 'M4' }));
        break;
      case 'endstop_kw11':
        setEndstopParams((p) => ({ ...p, switchType: 'kw11-mini', mountBodyLength: 30.0, slotAdjustLength: 12.0, extrusionMountScrew: 'M4' }));
        break;
      case 'endstop_optical':
        setEndstopParams((p) => ({ ...p, switchType: 'optical-slotted', mountBodyLength: 38.0, slotAdjustLength: 16.0, extrusionMountScrew: 'M4' }));
        break;

      // Fan Duct Presets
      case 'duct_5015_standard':
        setDuctParams((p) => ({ ...p, fanType: '5015-blower', ductLength: 38.0, ductAngleDeg: 40.0, nozzleWidth: 18.0, nozzleHeight: 4.5 }));
        break;
      case 'duct_4010_mini':
        setDuctParams((p) => ({ ...p, fanType: '4010-blower', ductLength: 30.0, ductAngleDeg: 35.0, nozzleWidth: 14.0, nozzleHeight: 4.0 }));
        break;

      // Spool Hub Presets
      case 'spool_std_1kg':
        setSpoolHubParams((p) => ({ ...p, spoolBoreMin: 52.0, spoolBoreMax: 72.0, coneLength: 35.0, bearingType: '608' }));
        break;
      case 'spool_mini_250g':
        setSpoolHubParams((p) => ({ ...p, spoolBoreMin: 45.0, spoolBoreMax: 60.0, coneLength: 28.0, bearingType: '608' }));
        break;

      // Dial Indicator Presets
      case 'dial_8mm_2020':
        setDialMountParams((p) => ({ ...p, stemDiameter: 8.0, mountStyle: '2020-rail-lug', armLength: 25.0 }));
        break;
      case 'dial_38inch_2020':
        setDialMountParams((p) => ({ ...p, stemDiameter: 9.525, mountStyle: '2020-rail-lug', armLength: 25.0 }));
        break;
      case 'dial_rod_10mm':
        setDialMountParams((p) => ({ ...p, stemDiameter: 8.0, mountStyle: 'rod-clamp-10mm', armLength: 28.0 }));
        break;

      // 20 Maker & Machine Components Presets (34-53)
      case 'cycloidal_10to1':
        setCycloidalParams((p) => ({ ...p, rotorLobes: 10, pinCircleDiameter: 70.0, rollerDiameter: 5.0, eccentricity: 1.5 }));
        break;
      case 'cycloidal_20to1_heavy':
        setCycloidalParams((p) => ({ ...p, rotorLobes: 20, pinCircleDiameter: 100.0, rollerDiameter: 6.0, eccentricity: 2.0 }));
        break;

      case 'geneva_4slot_90deg':
        setGenevaParams((p) => ({ ...p, slotCount: 4, wheelRadius: 35.0, pinDiameter: 6.0 }));
        break;
      case 'geneva_6slot_60deg':
        setGenevaParams((p) => ({ ...p, slotCount: 6, wheelRadius: 45.0, pinDiameter: 6.0 }));
        break;

      case 'planetary_3planet_nema17':
        setPlanetaryParams((p) => ({ ...p, planetCount: 3, carrierDiameter: 55.0, pinPitchDiameter: 40.0, pinHoleDiameter: 5.0 }));
        break;
      case 'planetary_4planet_heavy':
        setPlanetaryParams((p) => ({ ...p, planetCount: 4, carrierDiameter: 70.0, pinPitchDiameter: 55.0, pinHoleDiameter: 6.0 }));
        break;

      case 'rack_m10_150mm':
        setRackParams((p) => ({ ...p, module: 1.0, rackLength: 150.0, rackWidth: 12.0, mountHoleDiameter: 4.5 }));
        break;
      case 'rack_m15_200mm_heavy':
        setRackParams((p) => ({ ...p, module: 1.5, rackLength: 200.0, rackWidth: 18.0, mountHoleDiameter: 5.5 }));
        break;

      case 'scotch_30mm_stroke':
        setScotchParams((p) => ({ ...p, yokeStroke: 30.0, slotWidth: 8.0, rodDiameter: 8.0 }));
        break;
      case 'scotch_50mm_stroke':
        setScotchParams((p) => ({ ...p, yokeStroke: 50.0, slotWidth: 10.0, rodDiameter: 10.0 }));
        break;

      case 'din_std_20mm_m3':
        setDinRailParams((p) => ({ ...p, railWidth: 35.0, clipThickness: 14.0, mountScrewSize: 'M3' }));
        break;
      case 'din_wide_35mm_m4':
        setDinRailParams((p) => ({ ...p, railWidth: 35.0, clipThickness: 18.0, mountScrewSize: 'M4' }));
        break;

      case 'hinge_3barrel_m3':
        setHingeParams((p) => ({ ...p, knuckleCount: 3, leafWidth: 30.0, leafLength: 50.0, screwSize: 'M3' }));
        break;
      case 'hinge_5barrel_m4':
        setHingeParams((p) => ({ ...p, knuckleCount: 5, leafWidth: 40.0, leafLength: 80.0, screwSize: 'M4' }));
        break;

      case 'spindle_52mm_300w':
        setSpindleParams((p) => ({ ...p, spindleDiameter: 52.0, clampHeight: 25.0, baseMountWidth: 80.0, baseMountHoleSpacingX: 70.0 }));
        break;
      case 'spindle_65mm_makita':
        setSpindleParams((p) => ({ ...p, spindleDiameter: 65.0, clampHeight: 30.0, baseMountWidth: 95.0, baseMountHoleSpacingX: 80.0 }));
        break;
      case 'spindle_80mm_vfd':
        setSpindleParams((p) => ({ ...p, spindleDiameter: 80.0, clampHeight: 35.0, baseMountWidth: 110.0, baseMountHoleSpacingX: 95.0 }));
        break;

      case 'isolator_d35_m4':
        setIsolatorParams((p) => ({ ...p, baseDiameter: 35.0, waistDiameter: 22.0, height: 28.0, bottomNutTrapSize: 'M4' }));
        break;
      case 'isolator_d50_m6':
        setIsolatorParams((p) => ({ ...p, baseDiameter: 50.0, waistDiameter: 30.0, height: 38.0, bottomNutTrapSize: 'M6' }));
        break;

      case 'cross_8mm_linear':
        setCrossSlideParams((p) => ({ ...p, rodDiameterA: 8.0, rodDiameterB: 8.0, blockWidth: 28.0 }));
        break;
      case 'cross_10mm_linear':
        setCrossSlideParams((p) => ({ ...p, rodDiameterA: 10.0, rodDiameterB: 10.0, blockWidth: 32.0 }));
        break;

      case 'venturi_suction_d24':
        setVenturiParams((p) => ({ ...p, inletDiameter: 24.0, throatDiameter: 8.0, outletDiameter: 20.0, suctionPortDiameter: 6.0 }));
        break;
      case 'venturi_mixer_d32':
        setVenturiParams((p) => ({ ...p, inletDiameter: 32.0, throatDiameter: 12.0, outletDiameter: 28.0, suctionPortDiameter: 8.0 }));
        break;

      case 'flange_1inch_4bolt':
        setFlangeParams((p) => ({ ...p, pipeNominalDiameter: 33.4, flangeOuterDiameter: 75.0, boltHoleCount: 4, boltPitchCircleDiameter: 58.0 }));
        break;
      case 'flange_2inch_6bolt':
        setFlangeParams((p) => ({ ...p, pipeNominalDiameter: 60.3, flangeOuterDiameter: 110.0, boltHoleCount: 6, boltPitchCircleDiameter: 90.0 }));
        break;

      case 'pump_3roller_608':
        setPumpParams((p) => ({ ...p, rollerCount: 3, rotorOuterDiameter: 52.0, rollerBearingType: '608', motorShaftDiameter: 5.0 }));
        break;
      case 'pump_4roller_624':
        setPumpParams((p) => ({ ...p, rollerCount: 4, rotorOuterDiameter: 44.0, rollerBearingType: '624', motorShaftDiameter: 5.0 }));
        break;

      case 'gland_pg7_4to7mm':
        setGlandParams((p) => ({ ...p, cableDiameterMin: 4.0, cableDiameterMax: 7.0, hexNutSize: 18.0, threadLength: 10.0 }));
        break;
      case 'gland_m20_8to12mm':
        setGlandParams((p) => ({ ...p, cableDiameterMin: 8.0, cableDiameterMax: 12.0, hexNutSize: 27.0, threadLength: 14.0 }));
        break;

      case 'boot_usb_4mm':
        setBootParams((p) => ({ ...p, cableDiameter: 4.5, bootLength: 35.0, spiralPitch: 6.0 }));
        break;
      case 'boot_power_8mm':
        setBootParams((p) => ({ ...p, cableDiameter: 8.0, bootLength: 50.0, spiralPitch: 8.0 }));
        break;

      case 'runout_175_kw11':
        setRunoutParams((p) => ({ ...p, filamentDiameter: 1.75, microswitchType: 'kw11', couplerThread: 'M6' }));
        break;
      case 'runout_285_optical':
        setRunoutParams((p) => ({ ...p, filamentDiameter: 2.85, microswitchType: 'omron-ss5', couplerThread: 'M10' }));
        break;

      case 'slipring_22mm_flange':
        setSlipRingCapsuleParams((p) => ({ ...p, capsuleOuterDiameter: 22.0, flangeDiameter: 34.0, mountBoltCount: 3 }));
        break;
      case 'slipring_30mm_heavy':
        setSlipRingCapsuleParams((p) => ({ ...p, capsuleOuterDiameter: 30.0, flangeDiameter: 45.0, mountBoltCount: 4 }));
        break;

      case 'piezo_20mm_probe':
        setPiezoParams((p) => ({ ...p, piezoDiscDiameter: 20, mountRingOD: 28.0, diaphragmClearance: 1.0 }));
        break;
      case 'piezo_27mm_bed':
        setPiezoParams((p) => ({ ...p, piezoDiscDiameter: 27, mountRingOD: 36.0, diaphragmClearance: 1.2 }));
        break;

      case 'drill_guide_metric_3to10':
        setDrillGuideParams((p) => ({ ...p, blockLength: 80.0, blockWidth: 35.0, vGrooveDepth: 6.0 }));
        break;
      case 'drill_guide_compact_4to8':
        setDrillGuideParams((p) => ({ ...p, blockLength: 60.0, blockWidth: 30.0, vGrooveDepth: 5.0 }));
        break;

      case 'chamfer_handle_32mm':
        setChamferParams((p) => ({ ...p, colletBoreDiameter: 3.2, handleDiameter: 22.0, handleLength: 90.0, fluteCount: 8 }));
        break;
      case 'chamfer_heavy_grip':
        setChamferParams((p) => ({ ...p, colletBoreDiameter: 3.2, handleDiameter: 28.0, handleLength: 110.0, fluteCount: 6 }));
        break;
    }
  }, []);

  // Compute 3D Mesh in real-time
  const meshResult: GeneratedMeshResult = useMemo(() => {
    switch (activeModel) {
      // Original 13
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

      // 20 New Models
      case 'bevel_gear':
        return generateBevelGear(bevelParams);
      case 'timing_belt_idler':
        return generateTimingBeltIdler(idlerParams);
      case 'v_slot_wheel':
        return generateVSlotWheel(vWheelParams);
      case 'flexible_beam_coupler':
        return generateFlexibleBeamCoupler(beamParams);
      case 'worm_gear':
        return generateWormGear(wormParams);
      case 'thumb_screw_wheel':
        return generateThumbScrewWheel(thumbParams);
      case 'velocity_stack':
        return generateVelocityStack(stackParams);
      case 'centrifugal_impeller':
        return generateCentrifugalImpeller(impellerParams);
      case 'extrusion_end_cap':
        return generateExtrusionEndCap(endCapParams);
      case 't_nut_slot':
        return generateTNutSlot(tNutParams);
      case 'corner_cube_bracket':
        return generateCornerCubeBracket(cornerCubeParams);
      case 'ball_joint_rod_end':
        return generateBallJointRodEnd(ballJointParams);
      case 'servo_horn':
        return generateServoHorn(servoHornParams);
      case 'cable_guide_anchor':
        return generateCableGuideAnchor(anchorParams);
      case 'stepper_damper_plate':
        return generateStepperDamperPlate(damperParams);
      case 'pcb_standoff_clip':
        return generatePCBStandoffClip(standoffParams);
      case 'endstop_mount':
        return generateEndstopMount(endstopParams);
      case 'fan_duct_shroud':
        return generateFanDuctShroud(ductParams);
      case 'spool_holder_hub':
        return generateSpoolHolderHub(spoolHubParams);
      case 'dial_indicator_mount':
        return generateDialIndicatorMount(dialMountParams);

      // 20 Maker & Machine Models (34-53)
      case 'cycloidal_gear':
        return generateCycloidalGear(cycloidalParams);
      case 'geneva_mechanism':
        return generateGenevaMechanism(genevaParams);
      case 'planetary_carrier':
        return generatePlanetaryCarrier(planetaryParams);
      case 'rack_and_pinion':
        return generateRackAndPinion(rackParams);
      case 'scotch_yoke':
        return generateScotchYoke(scotchParams);
      case 'din_rail_clip':
        return generateDinRailClip(dinRailParams);
      case 'hinge_leaf':
        return generateHingeLeaf(hingeParams);
      case 'spindle_mount':
        return generateSpindleMount(spindleParams);
      case 'vibration_isolator':
        return generateVibrationIsolator(isolatorParams);
      case 'cross_slide_bracket':
        return generateCrossSlideBracket(crossSlideParams);
      case 'venturi_nozzle':
        return generateVenturiNozzle(venturiParams);
      case 'pipe_flange':
        return generatePipeFlange(flangeParams);
      case 'peristaltic_pump_head':
        return generatePeristalticPumpHead(pumpParams);
      case 'cable_gland':
        return generateCableGland(glandParams);
      case 'strain_relief_boot':
        return generateStrainReliefBoot(bootParams);
      case 'filament_runout_sensor':
        return generateFilamentRunoutSensor(runoutParams);
      case 'slip_ring_capsule':
        return generateSlipRingCapsule(slipRingParams);
      case 'piezo_mount':
        return generatePiezoMount(piezoParams);
      case 'drill_guide_block':
        return generateDrillGuideBlock(drillGuideParams);
      case 'chamfer_tool_holder':
        return generateChamferToolHolder(chamferParams);

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
    bevelParams,
    idlerParams,
    vWheelParams,
    beamParams,
    wormParams,
    thumbParams,
    stackParams,
    impellerParams,
    endCapParams,
    tNutParams,
    cornerCubeParams,
    ballJointParams,
    servoHornParams,
    anchorParams,
    damperParams,
    standoffParams,
    endstopParams,
    ductParams,
    spoolHubParams,
    dialMountParams,
    cycloidalParams,
    genevaParams,
    planetaryParams,
    rackParams,
    scotchParams,
    dinRailParams,
    hingeParams,
    spindleParams,
    isolatorParams,
    crossSlideParams,
    venturiParams,
    flangeParams,
    pumpParams,
    glandParams,
    bootParams,
    runoutParams,
    slipRingParams,
    piezoParams,
    drillGuideParams,
    chamferParams,
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
      case 'bevel_gear':
        filename = `bevel_gear_m${bevelParams.module}_z${bevelParams.toothCount}_cone${bevelParams.coneAngleDeg}deg.stl`;
        break;
      case 'timing_belt_idler':
        filename = `timing_belt_idler_${idlerParams.pulleyDiameter}mm_${idlerParams.bearingPreset}.stl`;
        break;
      case 'v_slot_wheel':
        filename = `v_slot_wheel_${vWheelParams.outerDiameter}mm_625bearing.stl`;
        break;
      case 'flexible_beam_coupler':
        filename = `flexible_beam_coupler_${beamParams.bore1Diameter}to${beamParams.bore2Diameter}mm.stl`;
        break;
      case 'worm_gear':
        filename = `worm_gear_m${wormParams.module}_starts${wormParams.starts}.stl`;
        break;
      case 'thumb_screw_wheel':
        filename = `thumb_screw_wheel_${thumbParams.outerDiameter}mm_${thumbParams.nutSize}.stl`;
        break;
      case 'velocity_stack':
        filename = `velocity_stack_${stackParams.throatDiameter}to${stackParams.flareDiameter}mm.stl`;
        break;
      case 'centrifugal_impeller':
        filename = `centrifugal_impeller_${impellerParams.outerDiameter}mm_${impellerParams.bladeCount}blades.stl`;
        break;
      case 'extrusion_end_cap':
        filename = `extrusion_end_cap_${endCapParams.profileSize}.stl`;
        break;
      case 't_nut_slot':
        filename = `t_nut_${tNutParams.slotSize}_${tNutParams.threadSize}.stl`;
        break;
      case 'corner_cube_bracket':
        filename = `corner_cube_${cornerCubeParams.cubeSize}mm_${cornerCubeParams.faceCount}way.stl`;
        break;
      case 'ball_joint_rod_end':
        filename = `ball_joint_rod_end_${ballJointParams.ballDiameter}mm_${ballJointParams.shankThreadSize}.stl`;
        break;
      case 'servo_horn':
        filename = `servo_horn_${servoHornParams.splineDiameter}mm_${servoHornParams.hornStyle}.stl`;
        break;
      case 'cable_guide_anchor':
        filename = `cable_guide_anchor_${anchorParams.anchorWidth}x${anchorParams.anchorLength}mm.stl`;
        break;
      case 'stepper_damper_plate':
        filename = `stepper_damper_${damperParams.nemaSize}.stl`;
        break;
      case 'pcb_standoff_clip':
        filename = `pcb_standoff_clip_${standoffParams.standoffHeight}mm.stl`;
        break;
      case 'endstop_mount':
        filename = `endstop_mount_${endstopParams.switchType}.stl`;
        break;
      case 'fan_duct_shroud':
        filename = `fan_duct_shroud_${ductParams.fanType}.stl`;
        break;
      case 'spool_holder_hub':
        filename = `spool_holder_hub_${spoolHubParams.spoolBoreMin}to${spoolHubParams.spoolBoreMax}mm.stl`;
        break;
      case 'dial_indicator_mount':
        filename = `dial_indicator_mount_${dialMountParams.stemDiameter}mm.stl`;
        break;
      case 'cycloidal_gear':
        filename = `cycloidal_gear_${cycloidalParams.rotorLobes}lobes_e${cycloidalParams.eccentricity}mm.stl`;
        break;
      case 'geneva_mechanism':
        filename = `geneva_wheel_${genevaParams.slotCount}slots_${genevaParams.wheelRadius}mm.stl`;
        break;
      case 'planetary_carrier':
        filename = `planetary_carrier_${planetaryParams.planetCount}planet_${planetaryParams.pinPitchDiameter}mmPCD.stl`;
        break;
      case 'rack_and_pinion':
        filename = `gear_rack_m${rackParams.module}_${rackParams.rackLength}mm.stl`;
        break;
      case 'scotch_yoke':
        filename = `scotch_yoke_${scotchParams.yokeStroke}mm_stroke.stl`;
        break;
      case 'din_rail_clip':
        filename = `din_rail_clip_${dinRailParams.railWidth}mm_${dinRailParams.mountScrewSize}.stl`;
        break;
      case 'hinge_leaf':
        filename = `hinge_leaf_${hingeParams.knuckleCount}barrel_${hingeParams.leafLength}mm.stl`;
        break;
      case 'spindle_mount':
        filename = `spindle_mount_${spindleParams.spindleDiameter}mm.stl`;
        break;
      case 'vibration_isolator':
        filename = `vibration_isolator_${isolatorParams.baseDiameter}mm_${isolatorParams.bottomNutTrapSize}.stl`;
        break;
      case 'cross_slide_bracket':
        filename = `cross_slide_bracket_${crossSlideParams.rodDiameterA}x${crossSlideParams.rodDiameterB}mm.stl`;
        break;
      case 'venturi_nozzle':
        filename = `venturi_nozzle_${venturiParams.inletDiameter}to${venturiParams.throatDiameter}mm.stl`;
        break;
      case 'pipe_flange':
        filename = `pipe_flange_${flangeParams.pipeNominalDiameter}mm_${flangeParams.boltHoleCount}bolt.stl`;
        break;
      case 'peristaltic_pump_head':
        filename = `peristaltic_pump_rotor_${pumpParams.rollerCount}rollers_${pumpParams.rotorOuterDiameter}mm.stl`;
        break;
      case 'cable_gland':
        filename = `cable_gland_${glandParams.hexNutSize}mm_${glandParams.cableDiameterMin}to${glandParams.cableDiameterMax}mm.stl`;
        break;
      case 'strain_relief_boot':
        filename = `strain_relief_boot_${bootParams.cableDiameter}mm_${bootParams.bootLength}mm.stl`;
        break;
      case 'filament_runout_sensor':
        filename = `filament_runout_sensor_${runoutParams.filamentDiameter}mm_${runoutParams.microswitchType}.stl`;
        break;
      case 'slip_ring_capsule':
        filename = `slip_ring_capsule_${slipRingParams.capsuleOuterDiameter}mm.stl`;
        break;
      case 'piezo_mount':
        filename = `piezo_mount_${piezoParams.piezoDiscDiameter}mm.stl`;
        break;
      case 'drill_guide_block':
        filename = `drill_guide_block_${drillGuideParams.blockLength}mm.stl`;
        break;
      case 'chamfer_tool_holder':
        filename = `chamfer_tool_holder_${chamferParams.handleDiameter}mm_${chamferParams.handleLength}mm.stl`;
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
    bevelParams,
    idlerParams,
    vWheelParams,
    beamParams,
    wormParams,
    thumbParams,
    stackParams,
    impellerParams,
    endCapParams,
    tNutParams,
    cornerCubeParams,
    ballJointParams,
    servoHornParams,
    anchorParams,
    damperParams,
    standoffParams,
    endstopParams,
    ductParams,
    spoolHubParams,
    dialMountParams,
    cycloidalParams,
    genevaParams,
    planetaryParams,
    rackParams,
    scotchParams,
    dinRailParams,
    hingeParams,
    spindleParams,
    isolatorParams,
    crossSlideParams,
    venturiParams,
    flangeParams,
    pumpParams,
    glandParams,
    bootParams,
    runoutParams,
    slipRingParams,
    piezoParams,
    drillGuideParams,
    chamferParams,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        activeModel={activeModel}
        onSelectModel={handleSelectModel}
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
          onSelectModel={handleSelectModel}
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
          bevelParams={bevelParams}
          idlerParams={idlerParams}
          vWheelParams={vWheelParams}
          beamParams={beamParams}
          wormParams={wormParams}
          thumbParams={thumbParams}
          stackParams={stackParams}
          impellerParams={impellerParams}
          endCapParams={endCapParams}
          tNutParams={tNutParams}
          cornerCubeParams={cornerCubeParams}
          ballJointParams={ballJointParams}
          servoHornParams={servoHornParams}
          anchorParams={anchorParams}
          damperParams={damperParams}
          standoffParams={standoffParams}
          endstopParams={endstopParams}
          ductParams={ductParams}
          spoolHubParams={spoolHubParams}
          dialMountParams={dialMountParams}
          cycloidalParams={cycloidalParams}
          genevaParams={genevaParams}
          planetaryParams={planetaryParams}
          rackParams={rackParams}
          scotchParams={scotchParams}
          dinRailParams={dinRailParams}
          hingeParams={hingeParams}
          spindleParams={spindleParams}
          isolatorParams={isolatorParams}
          crossSlideParams={crossSlideParams}
          venturiParams={venturiParams}
          flangeParams={flangeParams}
          pumpParams={pumpParams}
          glandParams={glandParams}
          bootParams={bootParams}
          runoutParams={runoutParams}
          slipRingParams={slipRingParams}
          piezoParams={piezoParams}
          drillGuideParams={drillGuideParams}
          chamferParams={chamferParams}
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
          onUpdateBevelParams={handleUpdateBevelParams}
          onUpdateIdlerParams={handleUpdateIdlerParams}
          onUpdateVWheelParams={handleUpdateVWheelParams}
          onUpdateBeamParams={handleUpdateBeamParams}
          onUpdateWormParams={handleUpdateWormParams}
          onUpdateThumbParams={handleUpdateThumbParams}
          onUpdateStackParams={handleUpdateStackParams}
          onUpdateImpellerParams={handleUpdateImpellerParams}
          onUpdateEndCapParams={handleUpdateEndCapParams}
          onUpdateTNutParams={handleUpdateTNutParams}
          onUpdateCornerCubeParams={handleUpdateCornerCubeParams}
          onUpdateBallJointParams={handleUpdateBallJointParams}
          onUpdateServoHornParams={handleUpdateServoHornParams}
          onUpdateAnchorParams={handleUpdateAnchorParams}
          onUpdateDamperParams={handleUpdateDamperParams}
          onUpdateStandoffParams={handleUpdateStandoffParams}
          onUpdateEndstopParams={handleUpdateEndstopParams}
          onUpdateDuctParams={handleUpdateDuctParams}
          onUpdateSpoolHubParams={handleUpdateSpoolHubParams}
          onUpdateDialMountParams={handleUpdateDialMountParams}
          onUpdateCycloidalParams={handleUpdateCycloidalParams}
          onUpdateGenevaParams={handleUpdateGenevaParams}
          onUpdatePlanetaryParams={handleUpdatePlanetaryParams}
          onUpdateRackParams={handleUpdateRackParams}
          onUpdateScotchParams={handleUpdateScotchParams}
          onUpdateDinRailParams={handleUpdateDinRailParams}
          onUpdateHingeParams={handleUpdateHingeParams}
          onUpdateSpindleParams={handleUpdateSpindleParams}
          onUpdateIsolatorParams={handleUpdateIsolatorParams}
          onUpdateCrossSlideParams={handleUpdateCrossSlideParams}
          onUpdateVenturiParams={handleUpdateVenturiParams}
          onUpdateFlangeParams={handleUpdateFlangeParams}
          onUpdatePumpParams={handleUpdatePumpParams}
          onUpdateGlandParams={handleUpdateGlandParams}
          onUpdateBootParams={handleUpdateBootParams}
          onUpdateRunoutParams={handleUpdateRunoutParams}
          onUpdateSlipRingParams={handleUpdateSlipRingParams}
          onUpdatePiezoParams={handleUpdatePiezoParams}
          onUpdateDrillGuideParams={handleUpdateDrillGuideParams}
          onUpdateChamferParams={handleUpdateChamferParams}
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
