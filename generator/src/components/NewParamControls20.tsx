import React from 'react';
import {
  PrimitiveType,
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
  ScrewSizeType,
} from '../generators/types';
import { NumericField } from './NewParamControls';

export interface NewParamControls20Props {
  activeModel: PrimitiveType;

  // 20 New Parameter States
  cycloidalParams: CycloidalGearParams;
  genevaParams: GenevaMechanismParams;
  planetaryParams: PlanetaryCarrierParams;
  rackParams: RackAndPinionParams;
  scotchParams: ScotchYokeParams;
  dinRailParams: DinRailClipParams;
  hingeParams: HingeLeafParams;
  spindleParams: SpindleMountParams;
  isolatorParams: VibrationIsolatorParams;
  crossSlideParams: CrossSlideBracketParams;
  venturiParams: VenturiNozzleParams;
  flangeParams: PipeFlangeParams;
  pumpParams: PeristalticPumpHeadParams;
  glandParams: CableGlandParams;
  bootParams: StrainReliefBootParams;
  runoutParams: FilamentRunoutSensorParams;
  slipRingParams: SlipRingCapsuleParams;
  piezoParams: PiezoMountParams;
  drillGuideParams: DrillGuideBlockParams;
  chamferParams: ChamferToolHolderParams;

  // 20 New Update Handlers
  onUpdateCycloidalParams: (updates: Partial<CycloidalGearParams>) => void;
  onUpdateGenevaParams: (updates: Partial<GenevaMechanismParams>) => void;
  onUpdatePlanetaryParams: (updates: Partial<PlanetaryCarrierParams>) => void;
  onUpdateRackParams: (updates: Partial<RackAndPinionParams>) => void;
  onUpdateScotchParams: (updates: Partial<ScotchYokeParams>) => void;
  onUpdateDinRailParams: (updates: Partial<DinRailClipParams>) => void;
  onUpdateHingeParams: (updates: Partial<HingeLeafParams>) => void;
  onUpdateSpindleParams: (updates: Partial<SpindleMountParams>) => void;
  onUpdateIsolatorParams: (updates: Partial<VibrationIsolatorParams>) => void;
  onUpdateCrossSlideParams: (updates: Partial<CrossSlideBracketParams>) => void;
  onUpdateVenturiParams: (updates: Partial<VenturiNozzleParams>) => void;
  onUpdateFlangeParams: (updates: Partial<PipeFlangeParams>) => void;
  onUpdatePumpParams: (updates: Partial<PeristalticPumpHeadParams>) => void;
  onUpdateGlandParams: (updates: Partial<CableGlandParams>) => void;
  onUpdateBootParams: (updates: Partial<StrainReliefBootParams>) => void;
  onUpdateRunoutParams: (updates: Partial<FilamentRunoutSensorParams>) => void;
  onUpdateSlipRingParams: (updates: Partial<SlipRingCapsuleParams>) => void;
  onUpdatePiezoParams: (updates: Partial<PiezoMountParams>) => void;
  onUpdateDrillGuideParams: (updates: Partial<DrillGuideBlockParams>) => void;
  onUpdateChamferParams: (updates: Partial<ChamferToolHolderParams>) => void;
}

export const NewParamControls20: React.FC<NewParamControls20Props> = ({
  activeModel,
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
  onUpdateCycloidalParams,
  onUpdateGenevaParams,
  onUpdatePlanetaryParams,
  onUpdateRackParams,
  onUpdateScotchParams,
  onUpdateDinRailParams,
  onUpdateHingeParams,
  onUpdateSpindleParams,
  onUpdateIsolatorParams,
  onUpdateCrossSlideParams,
  onUpdateVenturiParams,
  onUpdateFlangeParams,
  onUpdatePumpParams,
  onUpdateGlandParams,
  onUpdateBootParams,
  onUpdateRunoutParams,
  onUpdateSlipRingParams,
  onUpdatePiezoParams,
  onUpdateDrillGuideParams,
  onUpdateChamferParams,
}) => {
  // 1. Cycloidal Gear
  if (activeModel === 'cycloidal_gear') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Cycloidal Disc Geometry</div>
          <NumericField
            label="Rotor Lobes"
            value={cycloidalParams.rotorLobes}
            min={8}
            max={30}
            step={1}
            unit="lobes"
            tooltip="Number of cycloidal teeth (reduction ratio = lobes)"
            onChange={(val) => onUpdateCycloidalParams({ rotorLobes: val })}
          />
          <NumericField
            label="Pin Circle Diameter"
            value={cycloidalParams.pinCircleDiameter}
            min={35}
            max={80}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateCycloidalParams({ pinCircleDiameter: val })}
          />
          <NumericField
            label="Roller Pin Diameter"
            value={cycloidalParams.rollerDiameter}
            min={3}
            max={10}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateCycloidalParams({ rollerDiameter: val })}
          />
          <NumericField
            label="Eccentricity"
            value={cycloidalParams.eccentricity}
            min={1.0}
            max={3.0}
            step={0.1}
            unit="mm"
            tooltip="Input cam eccentric offset (e)"
            onChange={(val) => onUpdateCycloidalParams({ eccentricity: val })}
          />
          <NumericField
            label="Disc Thickness"
            value={cycloidalParams.thickness}
            min={5}
            max={20}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateCycloidalParams({ thickness: val })}
          />
          <NumericField
            label="Bore Diameter"
            value={cycloidalParams.boreDiameter}
            min={8}
            max={22}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateCycloidalParams({ boreDiameter: val })}
          />
          <NumericField
            label="Drive Pin Hole Count"
            value={cycloidalParams.driveHoleCount}
            min={4}
            max={8}
            step={1}
            unit="holes"
            onChange={(val) => onUpdateCycloidalParams({ driveHoleCount: val })}
          />
          <NumericField
            label="Drive Hole Diameter"
            value={cycloidalParams.driveHoleDiameter}
            min={6}
            max={14}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateCycloidalParams({ driveHoleDiameter: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={cycloidalParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateCycloidalParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 2. Geneva Mechanism
  if (activeModel === 'geneva_mechanism') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Geneva Wheel Parameters</div>
          <NumericField
            label="Indexing Slots"
            value={genevaParams.slotCount}
            min={4}
            max={8}
            step={1}
            unit="slots"
            tooltip="Number of indexing stations"
            onChange={(val) => onUpdateGenevaParams({ slotCount: val })}
          />
          <NumericField
            label="Wheel Radius"
            value={genevaParams.wheelRadius}
            min={25}
            max={60}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateGenevaParams({ wheelRadius: val })}
          />
          <NumericField
            label="Drive Pin Diameter"
            value={genevaParams.pinDiameter}
            min={3}
            max={8}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateGenevaParams({ pinDiameter: val })}
          />
          <NumericField
            label="Slot Width"
            value={genevaParams.slotWidth}
            min={3.5}
            max={9}
            step={0.2}
            unit="mm"
            onChange={(val) => onUpdateGenevaParams({ slotWidth: val })}
          />
          <NumericField
            label="Detent Lock Radius"
            value={genevaParams.lockingRadius}
            min={12}
            max={28}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateGenevaParams({ lockingRadius: val })}
          />
          <NumericField
            label="Plate Thickness"
            value={genevaParams.thickness}
            min={4}
            max={15}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateGenevaParams({ thickness: val })}
          />
          <NumericField
            label="Center Bore"
            value={genevaParams.centerBoreDiameter}
            min={5}
            max={15}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateGenevaParams({ centerBoreDiameter: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={genevaParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateGenevaParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 3. Planetary Carrier
  if (activeModel === 'planetary_carrier') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Planet Carrier Geometry</div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Planet Count</label>
            <select
              value={planetaryParams.planetCount}
              onChange={(e) => onUpdatePlanetaryParams({ planetCount: parseInt(e.target.value) as 3 | 4 })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="3">3 Planets</option>
              <option value="4">4 Planets</option>
            </select>
          </div>
          <NumericField
            label="Carrier Diameter"
            value={planetaryParams.carrierDiameter}
            min={35}
            max={75}
            step={1}
            unit="mm"
            onChange={(val) => onUpdatePlanetaryParams({ carrierDiameter: val })}
          />
          <NumericField
            label="Pin PCD"
            value={planetaryParams.pinPitchDiameter}
            min={22}
            max={50}
            step={1}
            unit="mm"
            tooltip="Pitch Circle Diameter of planet pins"
            onChange={(val) => onUpdatePlanetaryParams({ pinPitchDiameter: val })}
          />
          <NumericField
            label="Planet Pin Hole"
            value={planetaryParams.pinHoleDiameter}
            min={3}
            max={8}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdatePlanetaryParams({ pinHoleDiameter: val })}
          />
          <NumericField
            label="Plate Thickness"
            value={planetaryParams.plateThickness}
            min={4}
            max={10}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdatePlanetaryParams({ plateThickness: val })}
          />
          <NumericField
            label="Sun Shaft Bore"
            value={planetaryParams.sunShaftBore}
            min={5}
            max={14}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdatePlanetaryParams({ sunShaftBore: val })}
          />
          <NumericField
            label="Standoff Height"
            value={planetaryParams.postHeight}
            min={10}
            max={28}
            step={1}
            unit="mm"
            onChange={(val) => onUpdatePlanetaryParams({ postHeight: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={planetaryParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdatePlanetaryParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 4. Rack and Pinion
  if (activeModel === 'rack_and_pinion') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Linear Involute Rack</div>
          <NumericField
            label="Gear Module"
            value={rackParams.module}
            min={1.0}
            max={3.0}
            step={0.1}
            unit="M"
            onChange={(val) => onUpdateRackParams({ module: val })}
          />
          <NumericField
            label="Rack Length"
            value={rackParams.rackLength}
            min={60}
            max={200}
            step={5}
            unit="mm"
            onChange={(val) => onUpdateRackParams({ rackLength: val })}
          />
          <NumericField
            label="Rack Width"
            value={rackParams.rackWidth}
            min={10}
            max={25}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateRackParams({ rackWidth: val })}
          />
          <NumericField
            label="Rack Total Height"
            value={rackParams.rackHeight}
            min={10}
            max={25}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateRackParams({ rackHeight: val })}
          />
          <NumericField
            label="Pressure Angle"
            value={rackParams.pressureAngleDeg}
            min={14.5}
            max={25}
            step={0.5}
            unit="°"
            onChange={(val) => onUpdateRackParams({ pressureAngleDeg: val })}
          />
          <NumericField
            label="Hole Spacing"
            value={rackParams.mountHoleSpacing}
            min={20}
            max={50}
            step={5}
            unit="mm"
            onChange={(val) => onUpdateRackParams({ mountHoleSpacing: val })}
          />
          <NumericField
            label="Hole Diameter"
            value={rackParams.mountHoleDiameter}
            min={3.4}
            max={6.6}
            step={0.2}
            unit="mm"
            onChange={(val) => onUpdateRackParams({ mountHoleDiameter: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={rackParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateRackParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 5. Scotch Yoke
  if (activeModel === 'scotch_yoke') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Scotch Yoke Carriage</div>
          <NumericField
            label="Crank Stroke"
            value={scotchParams.yokeStroke}
            min={20}
            max={60}
            step={1}
            unit="mm"
            tooltip="Full linear travel stroke (2 * crank radius)"
            onChange={(val) => onUpdateScotchParams({ yokeStroke: val })}
          />
          <NumericField
            label="Slot Width"
            value={scotchParams.slotWidth}
            min={6}
            max={14}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateScotchParams({ slotWidth: val })}
          />
          <NumericField
            label="Block Length"
            value={scotchParams.blockLength}
            min={40}
            max={90}
            step={2}
            unit="mm"
            onChange={(val) => onUpdateScotchParams({ blockLength: val })}
          />
          <NumericField
            label="Block Height"
            value={scotchParams.blockHeight}
            min={24}
            max={50}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateScotchParams({ blockHeight: val })}
          />
          <NumericField
            label="Block Thickness"
            value={scotchParams.blockThickness}
            min={8}
            max={18}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateScotchParams({ blockThickness: val })}
          />
          <NumericField
            label="Rod Diameter"
            value={scotchParams.rodDiameter}
            min={6}
            max={12}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateScotchParams({ rodDiameter: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={scotchParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateScotchParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 6. DIN Rail Clip
  if (activeModel === 'din_rail_clip') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">DIN 35mm Rail Clip</div>
          <NumericField
            label="Rail Width"
            value={dinRailParams.railWidth}
            min={15}
            max={35}
            step={1}
            unit="mm"
            tooltip="35mm standard or 15mm mini rail"
            onChange={(val) => onUpdateDinRailParams({ railWidth: val })}
          />
          <NumericField
            label="Clip Thickness"
            value={dinRailParams.clipThickness}
            min={10}
            max={22}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDinRailParams({ clipThickness: val })}
          />
          <NumericField
            label="Plate Width"
            value={dinRailParams.equipmentPlateWidth}
            min={35}
            max={70}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDinRailParams({ equipmentPlateWidth: val })}
          />
          <NumericField
            label="Plate Height"
            value={dinRailParams.equipmentPlateHeight}
            min={45}
            max={85}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDinRailParams({ equipmentPlateHeight: val })}
          />
          <NumericField
            label="Hole Spacing"
            value={dinRailParams.mountHoleSpacing}
            min={20}
            max={50}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDinRailParams({ mountHoleSpacing: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mount Screw</label>
            <select
              value={dinRailParams.mountScrewSize}
              onChange={(e) => onUpdateDinRailParams({ mountScrewSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
              <option value="M5">M5</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={dinRailParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateDinRailParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 7. Hinge Leaf
  if (activeModel === 'hinge_leaf') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Knuckle Hinge Parameters</div>
          <NumericField
            label="Knuckle Count"
            value={hingeParams.knuckleCount}
            min={3}
            max={6}
            step={1}
            unit="barrels"
            onChange={(val) => onUpdateHingeParams({ knuckleCount: val })}
          />
          <NumericField
            label="Leaf Width"
            value={hingeParams.leafWidth}
            min={20}
            max={50}
            step={2}
            unit="mm"
            onChange={(val) => onUpdateHingeParams({ leafWidth: val })}
          />
          <NumericField
            label="Leaf Length"
            value={hingeParams.leafLength}
            min={30}
            max={80}
            step={5}
            unit="mm"
            onChange={(val) => onUpdateHingeParams({ leafLength: val })}
          />
          <NumericField
            label="Leaf Thickness"
            value={hingeParams.leafThickness}
            min={2.5}
            max={5.0}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateHingeParams({ leafThickness: val })}
          />
          <NumericField
            label="Pin Diameter"
            value={hingeParams.pinDiameter}
            min={3.0}
            max={6.0}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateHingeParams({ pinDiameter: val })}
          />
          <NumericField
            label="Screw Hole Count"
            value={hingeParams.screwHoleCount}
            min={2}
            max={4}
            step={1}
            unit="holes"
            onChange={(val) => onUpdateHingeParams({ screwHoleCount: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mounting Screw</label>
            <select
              value={hingeParams.screwSize}
              onChange={(e) => onUpdateHingeParams({ screwSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
              <option value="M5">M5</option>
            </select>
          </div>
          <NumericField
            label="Knuckle Clearance"
            value={hingeParams.knuckleClearance}
            min={0.3}
            max={0.8}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateHingeParams({ knuckleClearance: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={hingeParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateHingeParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 8. Spindle Mount
  if (activeModel === 'spindle_mount') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">CNC Spindle Collar</div>
          <NumericField
            label="Spindle Diameter"
            value={spindleParams.spindleDiameter}
            min={52}
            max={80}
            step={1}
            unit="mm"
            tooltip="52mm (300W/500W), 65mm (Makita RT0701C), 80mm (Water-Cooled)"
            onChange={(val) => onUpdateSpindleParams({ spindleDiameter: val })}
          />
          <NumericField
            label="Clamp Height"
            value={spindleParams.clampHeight}
            min={20}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSpindleParams({ clampHeight: val })}
          />
          <NumericField
            label="Wall Thickness"
            value={spindleParams.wallThickness}
            min={8}
            max={16}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSpindleParams({ wallThickness: val })}
          />
          <NumericField
            label="Base Mount Width"
            value={spindleParams.baseMountWidth}
            min={70}
            max={110}
            step={2}
            unit="mm"
            onChange={(val) => onUpdateSpindleParams({ baseMountWidth: val })}
          />
          <NumericField
            label="Hole Spacing X"
            value={spindleParams.baseMountHoleSpacingX}
            min={40}
            max={80}
            step={2}
            unit="mm"
            onChange={(val) => onUpdateSpindleParams({ baseMountHoleSpacingX: val })}
          />
          <NumericField
            label="Hole Spacing Y"
            value={spindleParams.baseMountHoleSpacingY}
            min={15}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSpindleParams({ baseMountHoleSpacingY: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Pinch Bolt</label>
            <select
              value={spindleParams.pinchBoltSize}
              onChange={(e) => onUpdateSpindleParams({ pinchBoltSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M4">M4</option>
              <option value="M5">M5</option>
              <option value="M6">M6</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={spindleParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateSpindleParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 9. Vibration Isolator
  if (activeModel === 'vibration_isolator') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Hourglass Isolator Foot</div>
          <NumericField
            label="Base Diameter"
            value={isolatorParams.baseDiameter}
            min={25}
            max={55}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateIsolatorParams({ baseDiameter: val })}
          />
          <NumericField
            label="Waist Diameter"
            value={isolatorParams.waistDiameter}
            min={14}
            max={32}
            step={1}
            unit="mm"
            tooltip="Narrow flexure throat diameter"
            onChange={(val) => onUpdateIsolatorParams({ waistDiameter: val })}
          />
          <NumericField
            label="Total Height"
            value={isolatorParams.height}
            min={18}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateIsolatorParams({ height: val })}
          />
          <NumericField
            label="Top Stud Hole"
            value={isolatorParams.topStudHoleDiameter}
            min={3.4}
            max={6.6}
            step={0.2}
            unit="mm"
            onChange={(val) => onUpdateIsolatorParams({ topStudHoleDiameter: val })}
          />
          <NumericField
            label="Cavity Depth"
            value={isolatorParams.cavityDepth}
            min={4}
            max={12}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateIsolatorParams({ cavityDepth: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Nut Trap Size</label>
            <select
              value={isolatorParams.bottomNutTrapSize}
              onChange={(e) => onUpdateIsolatorParams({ bottomNutTrapSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
              <option value="M5">M5</option>
              <option value="M6">M6</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={isolatorParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateIsolatorParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 10. Cross Slide Bracket
  if (activeModel === 'cross_slide_bracket') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Orthogonal Dual-Rod Clamp</div>
          <NumericField
            label="Rod Diameter A"
            value={crossSlideParams.rodDiameterA}
            min={8}
            max={16}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateCrossSlideParams({ rodDiameterA: val })}
          />
          <NumericField
            label="Rod Diameter B"
            value={crossSlideParams.rodDiameterB}
            min={8}
            max={16}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateCrossSlideParams({ rodDiameterB: val })}
          />
          <NumericField
            label="Offset Z"
            value={crossSlideParams.offsetZ}
            min={14}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateCrossSlideParams({ offsetZ: val })}
          />
          <NumericField
            label="Block Width"
            value={crossSlideParams.blockWidth}
            min={24}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateCrossSlideParams({ blockWidth: val })}
          />
          <NumericField
            label="Block Length"
            value={crossSlideParams.blockLength}
            min={24}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateCrossSlideParams({ blockLength: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Pinch Bolt Size</label>
            <select
              value={crossSlideParams.pinchBoltSize}
              onChange={(e) => onUpdateCrossSlideParams({ pinchBoltSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
              <option value="M5">M5</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={crossSlideParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateCrossSlideParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 11. Venturi Nozzle
  if (activeModel === 'venturi_nozzle') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Eductor / Venturi Nozzle</div>
          <NumericField
            label="Inlet Diameter"
            value={venturiParams.inletDiameter}
            min={16}
            max={40}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateVenturiParams({ inletDiameter: val })}
          />
          <NumericField
            label="Throat Diameter"
            value={venturiParams.throatDiameter}
            min={6}
            max={16}
            step={0.5}
            unit="mm"
            tooltip="Constricted velocity throat for Bernoulli vacuum"
            onChange={(val) => onUpdateVenturiParams({ throatDiameter: val })}
          />
          <NumericField
            label="Outlet Diameter"
            value={venturiParams.outletDiameter}
            min={16}
            max={40}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateVenturiParams({ outletDiameter: val })}
          />
          <NumericField
            label="Nozzle Length"
            value={venturiParams.nozzleLength}
            min={40}
            max={90}
            step={2}
            unit="mm"
            onChange={(val) => onUpdateVenturiParams({ nozzleLength: val })}
          />
          <NumericField
            label="Wall Thickness"
            value={venturiParams.wallThickness}
            min={2.0}
            max={4.5}
            step={0.2}
            unit="mm"
            onChange={(val) => onUpdateVenturiParams({ wallThickness: val })}
          />
          <NumericField
            label="Suction Port Diameter"
            value={venturiParams.suctionPortDiameter}
            min={5}
            max={12}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateVenturiParams({ suctionPortDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Inlet Flange Mount</label>
            <input
              type="checkbox"
              checked={venturiParams.flangeMount}
              onChange={(e) => onUpdateVenturiParams({ flangeMount: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          <NumericField
            label="Printer Tolerance"
            value={venturiParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateVenturiParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 12. Pipe Flange
  if (activeModel === 'pipe_flange') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Pipe Flange with O-Ring</div>
          <NumericField
            label="Pipe Nominal Diameter"
            value={flangeParams.pipeNominalDiameter}
            min={12}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateFlangeParams({ pipeNominalDiameter: val })}
          />
          <NumericField
            label="Flange Outer Diameter"
            value={flangeParams.flangeOuterDiameter}
            min={45}
            max={100}
            step={2}
            unit="mm"
            onChange={(val) => onUpdateFlangeParams({ flangeOuterDiameter: val })}
          />
          <NumericField
            label="Flange Thickness"
            value={flangeParams.flangeThickness}
            min={6}
            max={15}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateFlangeParams({ flangeThickness: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Bolt Hole Count</label>
            <select
              value={flangeParams.boltHoleCount}
              onChange={(e) => onUpdateFlangeParams({ boltHoleCount: parseInt(e.target.value) as 4 | 6 | 8 })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="4">4 Bolts</option>
              <option value="6">6 Bolts</option>
              <option value="8">8 Bolts</option>
            </select>
          </div>
          <NumericField
            label="Bolt Pitch Circle"
            value={flangeParams.boltPitchCircleDiameter}
            min={32}
            max={80}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateFlangeParams({ boltPitchCircleDiameter: val })}
          />
          <NumericField
            label="Bolt Hole Diameter"
            value={flangeParams.boltHoleDiameter}
            min={3.5}
            max={8.5}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateFlangeParams({ boltHoleDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">O-Ring Face Groove</label>
            <input
              type="checkbox"
              checked={flangeParams.hasORingGroove}
              onChange={(e) => onUpdateFlangeParams({ hasORingGroove: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          <NumericField
            label="Printer Tolerance"
            value={flangeParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateFlangeParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 13. Peristaltic Pump Head
  if (activeModel === 'peristaltic_pump_head') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Peristaltic Rotor Disc</div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Roller Count</label>
            <select
              value={pumpParams.rollerCount}
              onChange={(e) => onUpdatePumpParams({ rollerCount: parseInt(e.target.value) as 3 | 4 })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="3">3 Rollers</option>
              <option value="4">4 Rollers</option>
            </select>
          </div>
          <NumericField
            label="Rotor Diameter"
            value={pumpParams.rotorOuterDiameter}
            min={35}
            max={70}
            step={1}
            unit="mm"
            onChange={(val) => onUpdatePumpParams({ rotorOuterDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Roller Bearing</label>
            <select
              value={pumpParams.rollerBearingType}
              onChange={(e) => onUpdatePumpParams({ rollerBearingType: e.target.value as '608' | '624' | '625' })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="608">608 (8mm Pin)</option>
              <option value="624">624 (4mm Pin)</option>
              <option value="625">625 (5mm Pin)</option>
            </select>
          </div>
          <NumericField
            label="Motor Shaft Diameter"
            value={pumpParams.motorShaftDiameter}
            min={5}
            max={8}
            step={0.5}
            unit="mm"
            tooltip="5mm for NEMA 17 or 8mm for NEMA 23"
            onChange={(val) => onUpdatePumpParams({ motorShaftDiameter: val })}
          />
          <NumericField
            label="Rotor Thickness"
            value={pumpParams.rotorThickness}
            min={8}
            max={16}
            step={1}
            unit="mm"
            onChange={(val) => onUpdatePumpParams({ rotorThickness: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={pumpParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdatePumpParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 14. Cable Gland
  if (activeModel === 'cable_gland') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Hex Compression Gland</div>
          <NumericField
            label="Cable Min Diameter"
            value={glandParams.cableDiameterMin}
            min={3}
            max={10}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateGlandParams({ cableDiameterMin: val })}
          />
          <NumericField
            label="Cable Max Diameter"
            value={glandParams.cableDiameterMax}
            min={6}
            max={16}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateGlandParams({ cableDiameterMax: val })}
          />
          <NumericField
            label="Hex Nut Across Flats"
            value={glandParams.hexNutSize}
            min={16}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateGlandParams({ hexNutSize: val })}
          />
          <NumericField
            label="Thread Length"
            value={glandParams.threadLength}
            min={8}
            max={16}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateGlandParams({ threadLength: val })}
          />
          <NumericField
            label="Gland Height"
            value={glandParams.glandHeight}
            min={18}
            max={35}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateGlandParams({ glandHeight: val })}
          />
          <NumericField
            label="Collet Fingers"
            value={glandParams.fingerCount}
            min={4}
            max={8}
            step={1}
            unit="fingers"
            onChange={(val) => onUpdateGlandParams({ fingerCount: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={glandParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateGlandParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 15. Strain Relief Boot
  if (activeModel === 'strain_relief_boot') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Spiral Strain Relief Boot</div>
          <NumericField
            label="Cable Diameter"
            value={bootParams.cableDiameter}
            min={3.5}
            max={10}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateBootParams({ cableDiameter: val })}
          />
          <NumericField
            label="Flange Diameter"
            value={bootParams.flangeDiameter}
            min={12}
            max={26}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateBootParams({ flangeDiameter: val })}
          />
          <NumericField
            label="Boot Length"
            value={bootParams.bootLength}
            min={25}
            max={65}
            step={2}
            unit="mm"
            onChange={(val) => onUpdateBootParams({ bootLength: val })}
          />
          <NumericField
            label="Spiral Pitch"
            value={bootParams.spiralPitch}
            min={4}
            max={10}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateBootParams({ spiralPitch: val })}
          />
          <NumericField
            label="Taper Factor"
            value={bootParams.taperFactor}
            min={0.4}
            max={0.8}
            step={0.05}
            unit="ratio"
            onChange={(val) => onUpdateBootParams({ taperFactor: val })}
          />
          <NumericField
            label="Slot Width"
            value={bootParams.slotWidth}
            min={1.2}
            max={2.5}
            step={0.1}
            unit="mm"
            onChange={(val) => onUpdateBootParams({ slotWidth: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={bootParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateBootParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 16. Filament Runout Sensor
  if (activeModel === 'filament_runout_sensor') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Runout Sensor Enclosure</div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Filament Diameter</label>
            <select
              value={runoutParams.filamentDiameter}
              onChange={(e) => onUpdateRunoutParams({ filamentDiameter: parseFloat(e.target.value) as 1.75 | 2.85 })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="1.75">1.75 mm</option>
              <option value="2.85">2.85 mm</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Microswitch</label>
            <select
              value={runoutParams.microswitchType}
              onChange={(e) => onUpdateRunoutParams({ microswitchType: e.target.value as 'kw11' | 'omron-ss5' })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="kw11">KW11 (Standard Lever)</option>
              <option value="omron-ss5">OMRON SS-5 Submini</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Bowden Fitting</label>
            <select
              value={runoutParams.couplerThread}
              onChange={(e) => onUpdateRunoutParams({ couplerThread: e.target.value as 'M6' | 'M10' | 'none-smooth' })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M6">PC4-M6</option>
              <option value="M10">PC4-M10</option>
              <option value="none-smooth">Smooth Guide</option>
            </select>
          </div>
          <NumericField
            label="Body Length"
            value={runoutParams.bodyLength}
            min={28}
            max={42}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateRunoutParams({ bodyLength: val })}
          />
          <NumericField
            label="Body Width"
            value={runoutParams.bodyWidth}
            min={18}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateRunoutParams({ bodyWidth: val })}
          />
          <NumericField
            label="Body Height"
            value={runoutParams.bodyHeight}
            min={12}
            max={20}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateRunoutParams({ bodyHeight: val })}
          />
          <NumericField
            label="Mount Hole Spacing"
            value={runoutParams.mountHoleSpacing}
            min={16}
            max={28}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateRunoutParams({ mountHoleSpacing: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mount Screw</label>
            <select
              value={runoutParams.mountScrewSize}
              onChange={(e) => onUpdateRunoutParams({ mountScrewSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M2.5">M2.5</option>
              <option value="M3">M3</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={runoutParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateRunoutParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 17. Slip Ring Capsule
  if (activeModel === 'slip_ring_capsule') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Slip Ring Capsule Mount</div>
          <NumericField
            label="Capsule OD"
            value={slipRingParams.capsuleOuterDiameter}
            min={12}
            max={28}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSlipRingParams({ capsuleOuterDiameter: val })}
          />
          <NumericField
            label="Capsule Length"
            value={slipRingParams.capsuleLength}
            min={18}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSlipRingParams({ capsuleLength: val })}
          />
          <NumericField
            label="Flange Diameter"
            value={slipRingParams.flangeDiameter}
            min={22}
            max={42}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSlipRingParams({ flangeDiameter: val })}
          />
          <NumericField
            label="Rotor Bore Diameter"
            value={slipRingParams.rotorBoreDiameter}
            min={4}
            max={10}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateSlipRingParams({ rotorBoreDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mount Bolt Count</label>
            <select
              value={slipRingParams.mountBoltCount}
              onChange={(e) => onUpdateSlipRingParams({ mountBoltCount: parseInt(e.target.value) as 3 | 4 })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="3">3 Bolts</option>
              <option value="4">4 Bolts</option>
            </select>
          </div>
          <NumericField
            label="Mount Bolt PCD"
            value={slipRingParams.mountBoltPCD}
            min={18}
            max={36}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSlipRingParams({ mountBoltPCD: val })}
          />
          <NumericField
            label="Cable Exit Slot Width"
            value={slipRingParams.cableExitSlotWidth}
            min={3}
            max={7}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateSlipRingParams({ cableExitSlotWidth: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={slipRingParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateSlipRingParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 18. Piezo Mount
  if (activeModel === 'piezo_mount') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Piezo Bed Sensor Ring</div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Piezo Disc</label>
            <select
              value={piezoParams.piezoDiscDiameter}
              onChange={(e) => onUpdatePiezoParams({ piezoDiscDiameter: parseInt(e.target.value) as 20 | 27 })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="20">20 mm Disc</option>
              <option value="27">27 mm Disc</option>
            </select>
          </div>
          <NumericField
            label="Mount Ring OD"
            value={piezoParams.mountRingOD}
            min={28}
            max={38}
            step={1}
            unit="mm"
            onChange={(val) => onUpdatePiezoParams({ mountRingOD: val })}
          />
          <NumericField
            label="Diaphragm Clearance"
            value={piezoParams.diaphragmClearance}
            min={0.8}
            max={2.2}
            step={0.1}
            unit="mm"
            onChange={(val) => onUpdatePiezoParams({ diaphragmClearance: val })}
          />
          <NumericField
            label="Body Thickness"
            value={piezoParams.bodyThickness}
            min={4}
            max={8}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdatePiezoParams({ bodyThickness: val })}
          />
          <NumericField
            label="Contact Pin Diameter"
            value={piezoParams.contactPinDiameter}
            min={2.5}
            max={5.0}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdatePiezoParams({ contactPinDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mount Screw</label>
            <select
              value={piezoParams.mountScrewSize}
              onChange={(e) => onUpdatePiezoParams({ mountScrewSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M2.5">M2.5</option>
              <option value="M3">M3</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={piezoParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdatePiezoParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 19. Drill Guide Block
  if (activeModel === 'drill_guide_block') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Multi-Bore Drill Guide Block</div>
          <NumericField
            label="Block Length"
            value={drillGuideParams.blockLength}
            min={50}
            max={110}
            step={5}
            unit="mm"
            onChange={(val) => onUpdateDrillGuideParams({ blockLength: val })}
          />
          <NumericField
            label="Block Width"
            value={drillGuideParams.blockWidth}
            min={25}
            max={50}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDrillGuideParams({ blockWidth: val })}
          />
          <NumericField
            label="Block Height"
            value={drillGuideParams.blockHeight}
            min={20}
            max={40}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDrillGuideParams({ blockHeight: val })}
          />
          <NumericField
            label="V-Groove Depth"
            value={drillGuideParams.vGrooveDepth}
            min={4}
            max={10}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateDrillGuideParams({ vGrooveDepth: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Centerline Sight Notches</label>
            <input
              type="checkbox"
              checked={drillGuideParams.hasCenterlineAlignment}
              onChange={(e) => onUpdateDrillGuideParams({ hasCenterlineAlignment: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          <NumericField
            label="Printer Tolerance"
            value={drillGuideParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateDrillGuideParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 20. Chamfer Tool Holder
  if (activeModel === 'chamfer_tool_holder') {
    return (
      <div className="space-y-4">
        <div className="bg-[#10192d] p-3 rounded-lg border border-slate-800 space-y-3 font-mono">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Deburring Tool Handle</div>
          <NumericField
            label="Handle Diameter"
            value={chamferParams.handleDiameter}
            min={18}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateChamferParams({ handleDiameter: val })}
          />
          <NumericField
            label="Handle Length"
            value={chamferParams.handleLength}
            min={70}
            max={110}
            step={2}
            unit="mm"
            onChange={(val) => onUpdateChamferParams({ handleLength: val })}
          />
          <NumericField
            label="Flute Count"
            value={chamferParams.fluteCount}
            min={6}
            max={10}
            step={1}
            unit="flutes"
            onChange={(val) => onUpdateChamferParams({ fluteCount: val })}
          />
          <NumericField
            label="Flute Depth"
            value={chamferParams.fluteDepth}
            min={1.0}
            max={2.5}
            step={0.1}
            unit="mm"
            onChange={(val) => onUpdateChamferParams({ fluteDepth: val })}
          />
          <NumericField
            label="Collet Bore"
            value={chamferParams.colletBoreDiameter}
            min={3.2}
            max={6.5}
            step={0.1}
            unit="mm"
            tooltip="3.2mm for standard swivel blades"
            onChange={(val) => onUpdateChamferParams({ colletBoreDiameter: val })}
          />
          <NumericField
            label="Collet Depth"
            value={chamferParams.colletDepth}
            min={18}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateChamferParams({ colletDepth: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Set Screw</label>
            <select
              value={chamferParams.setScrewSize}
              onChange={(e) => onUpdateChamferParams({ setScrewSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Ergonomic Palm Grip</label>
            <input
              type="checkbox"
              checked={chamferParams.ergonomicPalmGrip}
              onChange={(e) => onUpdateChamferParams({ ergonomicPalmGrip: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          <NumericField
            label="Printer Tolerance"
            value={chamferParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateChamferParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  return null;
};
