import React from 'react';
import {
  PrimitiveType,
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
  BoreType,
  ScrewSizeType,
} from '../generators/types';
import { ChevronRight, HelpCircle } from 'lucide-react';

export interface NumericFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  tooltip?: string;
  disabled?: boolean;
}

export const NumericField: React.FC<NumericFieldProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'mm',
  onChange,
  tooltip,
  disabled = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      onChange(clamped);
    }
  };

  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-300 font-medium flex items-center gap-1">
          {label}
          {tooltip && (
            <span title={tooltip} className="text-slate-500 hover:text-sky-400 cursor-help">
              <HelpCircle className="w-3 h-3" />
            </span>
          )}
        </span>
        <div className="flex items-center gap-1 bg-[#1e293b] px-2 py-0.5 rounded border border-slate-700 focus-within:border-sky-400">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={Number(value.toFixed(2))}
            onChange={handleInputChange}
            className="w-14 bg-transparent text-right text-slate-100 font-bold focus:outline-none text-xs"
          />
          <span className="text-[10px] text-slate-400">{unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-sky-400 cursor-pointer"
        />
      </div>
    </div>
  );
};

export interface NewParamControlsProps {
  activeModel: PrimitiveType;
  bevelParams: BevelGearParams;
  idlerParams: TimingBeltIdlerParams;
  vWheelParams: VSlotWheelParams;
  beamParams: FlexibleBeamCouplerParams;
  wormParams: WormGearParams;
  thumbParams: ThumbScrewWheelParams;
  stackParams: VelocityStackParams;
  impellerParams: CentrifugalImpellerParams;
  endCapParams: ExtrusionEndCapParams;
  tNutParams: TNutSlotParams;
  cornerCubeParams: CornerCubeBracketParams;
  ballJointParams: BallJointRodEndParams;
  servoHornParams: ServoHornParams;
  anchorParams: CableGuideAnchorParams;
  damperParams: StepperDamperPlateParams;
  standoffParams: PCBStandoffClipParams;
  endstopParams: EndstopMountParams;
  ductParams: FanDuctShroudParams;
  spoolHubParams: SpoolHolderHubParams;
  dialMountParams: DialIndicatorMountParams;
  onUpdateBevelParams: (updates: Partial<BevelGearParams>) => void;
  onUpdateIdlerParams: (updates: Partial<TimingBeltIdlerParams>) => void;
  onUpdateVWheelParams: (updates: Partial<VSlotWheelParams>) => void;
  onUpdateBeamParams: (updates: Partial<FlexibleBeamCouplerParams>) => void;
  onUpdateWormParams: (updates: Partial<WormGearParams>) => void;
  onUpdateThumbParams: (updates: Partial<ThumbScrewWheelParams>) => void;
  onUpdateStackParams: (updates: Partial<VelocityStackParams>) => void;
  onUpdateImpellerParams: (updates: Partial<CentrifugalImpellerParams>) => void;
  onUpdateEndCapParams: (updates: Partial<ExtrusionEndCapParams>) => void;
  onUpdateTNutParams: (updates: Partial<TNutSlotParams>) => void;
  onUpdateCornerCubeParams: (updates: Partial<CornerCubeBracketParams>) => void;
  onUpdateBallJointParams: (updates: Partial<BallJointRodEndParams>) => void;
  onUpdateServoHornParams: (updates: Partial<ServoHornParams>) => void;
  onUpdateAnchorParams: (updates: Partial<CableGuideAnchorParams>) => void;
  onUpdateDamperParams: (updates: Partial<StepperDamperPlateParams>) => void;
  onUpdateStandoffParams: (updates: Partial<PCBStandoffClipParams>) => void;
  onUpdateEndstopParams: (updates: Partial<EndstopMountParams>) => void;
  onUpdateDuctParams: (updates: Partial<FanDuctShroudParams>) => void;
  onUpdateSpoolHubParams: (updates: Partial<SpoolHolderHubParams>) => void;
  onUpdateDialMountParams: (updates: Partial<DialIndicatorMountParams>) => void;
}

export const NewParamControls: React.FC<NewParamControlsProps> = (props) => {
  const { activeModel } = props;

  // 1. Bevel Gear
  if (activeModel === 'bevel_gear') {
    const { bevelParams, onUpdateBevelParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Bevel Gear Geometry</span>
          </div>
          <NumericField
            label="Metric Module"
            value={bevelParams.module}
            min={0.8}
            max={4.0}
            step={0.1}
            unit="m"
            onChange={(val) => onUpdateBevelParams({ module: val })}
          />
          <NumericField
            label="Tooth Count"
            value={bevelParams.toothCount}
            min={12}
            max={60}
            step={1}
            unit="teeth"
            onChange={(val) => onUpdateBevelParams({ toothCount: Math.round(val) })}
          />
          <NumericField
            label="Pitch Cone Angle"
            value={bevelParams.coneAngleDeg}
            min={30}
            max={60}
            step={1}
            unit="deg"
            tooltip="45° for 1:1 miter gear"
            onChange={(val) => onUpdateBevelParams({ coneAngleDeg: val })}
          />
          <NumericField
            label="Face Width"
            value={bevelParams.faceWidth}
            min={6}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateBevelParams({ faceWidth: val })}
          />
          <NumericField
            label="Shaft Bore"
            value={bevelParams.boreDiameter}
            min={0}
            max={15}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateBevelParams({ boreDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Bore Type</label>
            <select
              value={bevelParams.boreType}
              onChange={(e) => onUpdateBevelParams({ boreType: e.target.value as BoreType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="round">Round</option>
              <option value="d-shaft">D-Shaft</option>
              <option value="hex">Hex</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mounting Hub</label>
            <input
              type="checkbox"
              checked={bevelParams.hasHub}
              onChange={(e) => onUpdateBevelParams({ hasHub: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          {bevelParams.hasHub && (
            <>
              <NumericField
                label="Hub Diameter"
                value={bevelParams.hubDiameter}
                min={10}
                max={35}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateBevelParams({ hubDiameter: val })}
              />
              <NumericField
                label="Hub Length"
                value={bevelParams.hubLength}
                min={4}
                max={20}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateBevelParams({ hubLength: val })}
              />
            </>
          )}
          <NumericField
            label="Printer Tolerance"
            value={bevelParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateBevelParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 2. Timing Belt Idler
  if (activeModel === 'timing_belt_idler') {
    const { idlerParams, onUpdateIdlerParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Idler Pulley Geometry</span>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Surface Profile</label>
            <select
              value={idlerParams.profileType}
              onChange={(e) => onUpdateIdlerParams({ profileType: e.target.value as 'smooth' | 'crowned' })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="smooth">Smooth Flat</option>
              <option value="crowned">Self-Centering Crowned</option>
            </select>
          </div>
          <NumericField
            label="Pulley Diameter"
            value={idlerParams.pulleyDiameter}
            min={12}
            max={35}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateIdlerParams({ pulleyDiameter: val })}
          />
          <NumericField
            label="Belt Width"
            value={idlerParams.beltWidth}
            min={6}
            max={15}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateIdlerParams({ beltWidth: val })}
          />
          <NumericField
            label="Flange Height"
            value={idlerParams.flangeHeight}
            min={1.0}
            max={3.5}
            step={0.2}
            unit="mm"
            onChange={(val) => onUpdateIdlerParams({ flangeHeight: val })}
          />
          <NumericField
            label="Bearing Pocket Depth"
            value={idlerParams.bearingPocketDepth}
            min={4.0}
            max={8.0}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateIdlerParams({ bearingPocketDepth: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={idlerParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateIdlerParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 3. V-Slot Wheel Roller
  if (activeModel === 'v_slot_wheel') {
    const { vWheelParams, onUpdateVWheelParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>V-Slot Wheel Dimensions</span>
          </div>
          <NumericField
            label="Outer Diameter"
            value={vWheelParams.outerDiameter}
            min={18}
            max={35}
            step={1}
            unit="mm"
            tooltip="24mm standard OpenBuilds wheel"
            onChange={(val) => onUpdateVWheelParams({ outerDiameter: val })}
          />
          <NumericField
            label="Wheel Width"
            value={vWheelParams.wheelWidth}
            min={8}
            max={16}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateVWheelParams({ wheelWidth: val })}
          />
          <NumericField
            label="V-Groove Angle"
            value={vWheelParams.vAngleDeg}
            min={70}
            max={110}
            step={1}
            unit="deg"
            tooltip="90° standard 2020 slot angle"
            onChange={(val) => onUpdateVWheelParams({ vAngleDeg: val })}
          />
          <NumericField
            label="V-Groove Depth"
            value={vWheelParams.vDepth}
            min={2.0}
            max={5.5}
            step={0.2}
            unit="mm"
            onChange={(val) => onUpdateVWheelParams({ vDepth: val })}
          />
          <NumericField
            label="Bearing Pocket OD"
            value={vWheelParams.bearingPocketOD}
            min={13}
            max={22}
            step={1}
            unit="mm"
            tooltip="16mm for standard 625 bearing"
            onChange={(val) => onUpdateVWheelParams({ bearingPocketOD: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={vWheelParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateVWheelParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 4. Flexible Beam Coupler
  if (activeModel === 'flexible_beam_coupler') {
    const { beamParams, onUpdateBeamParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Beam Coupler Dimensions</span>
          </div>
          <NumericField
            label="Outer Diameter"
            value={beamParams.outerDiameter}
            min={16}
            max={32}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateBeamParams({ outerDiameter: val })}
          />
          <NumericField
            label="Coupler Length"
            value={beamParams.length}
            min={20}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateBeamParams({ length: val })}
          />
          <NumericField
            label="Bore 1 Diameter (Motor)"
            value={beamParams.bore1Diameter}
            min={4}
            max={12}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateBeamParams({ bore1Diameter: val })}
          />
          <NumericField
            label="Bore 2 Diameter (Shaft)"
            value={beamParams.bore2Diameter}
            min={4}
            max={14}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateBeamParams({ bore2Diameter: val })}
          />
          <NumericField
            label="Spiral Turns"
            value={beamParams.spiralTurns}
            min={2}
            max={5}
            step={0.5}
            unit="turns"
            onChange={(val) => onUpdateBeamParams({ spiralTurns: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={beamParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateBeamParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 5. Worm Gear
  if (activeModel === 'worm_gear') {
    const { wormParams, onUpdateWormParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Worm Screw Parameters</span>
          </div>
          <NumericField
            label="Metric Module"
            value={wormParams.module}
            min={0.8}
            max={3.0}
            step={0.1}
            unit="m"
            onChange={(val) => onUpdateWormParams({ module: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Thread Starts</label>
            <select
              value={wormParams.starts}
              onChange={(e) => onUpdateWormParams({ starts: parseInt(e.target.value) as 1 | 2 })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value={1}>1 Start (High Reduction / Locking)</option>
              <option value={2}>2 Starts (High Speed Efficiency)</option>
            </select>
          </div>
          <NumericField
            label="Thread Length"
            value={wormParams.length}
            min={15}
            max={50}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateWormParams({ length: val })}
          />
          <NumericField
            label="Pitch Diameter"
            value={wormParams.pitchDiameter}
            min={10}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateWormParams({ pitchDiameter: val })}
          />
          <NumericField
            label="Shaft Bore"
            value={wormParams.boreDiameter}
            min={3}
            max={12}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateWormParams({ boreDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Bore Type</label>
            <select
              value={wormParams.boreType}
              onChange={(e) => onUpdateWormParams({ boreType: e.target.value as BoreType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="round">Round</option>
              <option value="d-shaft">D-Shaft</option>
              <option value="hex">Hex</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={wormParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateWormParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 6. Thumb Screw Wheel
  if (activeModel === 'thumb_screw_wheel') {
    const { thumbParams, onUpdateThumbParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Thumb Wheel Dimensions</span>
          </div>
          <NumericField
            label="Wheel Diameter"
            value={thumbParams.outerDiameter}
            min={20}
            max={60}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateThumbParams({ outerDiameter: val })}
          />
          <NumericField
            label="Wheel Thickness"
            value={thumbParams.thickness}
            min={6}
            max={20}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateThumbParams({ thickness: val })}
          />
          <NumericField
            label="Lobe Count"
            value={thumbParams.lobeCount}
            min={4}
            max={12}
            step={1}
            unit="lobes"
            onChange={(val) => onUpdateThumbParams({ lobeCount: Math.round(val) })}
          />
          <NumericField
            label="Lobe Wave Depth"
            value={thumbParams.lobeDepth}
            min={1.0}
            max={4.5}
            step={0.2}
            unit="mm"
            onChange={(val) => onUpdateThumbParams({ lobeDepth: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Fastener Size</label>
            <select
              value={thumbParams.nutSize}
              onChange={(e) => onUpdateThumbParams({ nutSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
              <option value="M5">M5</option>
              <option value="M6">M6</option>
              <option value="M8">M8</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Pocket Style</label>
            <select
              value={thumbParams.pocketType}
              onChange={(e) => onUpdateThumbParams({ pocketType: e.target.value as 'hex-nut' | 'socket-head' })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="hex-nut">Hex Nut Pocket</option>
              <option value="socket-head">Socket Head Cap Recess</option>
            </select>
          </div>
          <NumericField
            label="Pocket Depth"
            value={thumbParams.pocketDepth}
            min={2.5}
            max={10}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateThumbParams({ pocketDepth: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={thumbParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateThumbParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 7. Velocity Stack
  if (activeModel === 'velocity_stack') {
    const { stackParams, onUpdateStackParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Velocity Stack Flare</span>
          </div>
          <NumericField
            label="Throat Diameter (Inlet)"
            value={stackParams.throatDiameter}
            min={15}
            max={80}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateStackParams({ throatDiameter: val })}
          />
          <NumericField
            label="Bellmouth Flare OD"
            value={stackParams.flareDiameter}
            min={30}
            max={130}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateStackParams({ flareDiameter: val })}
          />
          <NumericField
            label="Stack Height"
            value={stackParams.height}
            min={25}
            max={100}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateStackParams({ height: val })}
          />
          <NumericField
            label="Wall Thickness"
            value={stackParams.wallThickness}
            min={1.4}
            max={4.0}
            step={0.2}
            unit="mm"
            onChange={(val) => onUpdateStackParams({ wallThickness: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mounting Flange</label>
            <select
              value={stackParams.flangeType}
              onChange={(e) => onUpdateStackParams({ flangeType: e.target.value as 'round-ring' | 'oval-2bolt' | 'press-fit' })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="round-ring">Circular Bolt Flange</option>
              <option value="oval-2bolt">Oval 2-Bolt Ears</option>
              <option value="press-fit">Press-Fit Collar</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={stackParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateStackParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 8. Centrifugal Impeller
  if (activeModel === 'centrifugal_impeller') {
    const { impellerParams, onUpdateImpellerParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Impeller Vane Parameters</span>
          </div>
          <NumericField
            label="Impeller Diameter"
            value={impellerParams.outerDiameter}
            min={30}
            max={110}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateImpellerParams({ outerDiameter: val })}
          />
          <NumericField
            label="Hub Diameter"
            value={impellerParams.hubDiameter}
            min={12}
            max={35}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateImpellerParams({ hubDiameter: val })}
          />
          <NumericField
            label="Vane Height"
            value={impellerParams.height}
            min={8}
            max={35}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateImpellerParams({ height: val })}
          />
          <NumericField
            label="Blade Count"
            value={impellerParams.bladeCount}
            min={4}
            max={16}
            step={1}
            unit="blades"
            onChange={(val) => onUpdateImpellerParams({ bladeCount: Math.round(val) })}
          />
          <NumericField
            label="Backward Curve Angle"
            value={impellerParams.bladeAngleDeg}
            min={20}
            max={60}
            step={1}
            unit="deg"
            onChange={(val) => onUpdateImpellerParams({ bladeAngleDeg: val })}
          />
          <NumericField
            label="Shaft Bore"
            value={impellerParams.boreDiameter}
            min={3}
            max={12}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateImpellerParams({ boreDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Bore Type</label>
            <select
              value={impellerParams.boreType}
              onChange={(e) => onUpdateImpellerParams({ boreType: e.target.value as BoreType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="round">Round</option>
              <option value="d-shaft">D-Shaft</option>
              <option value="hex">Hex</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Back Plate Disk</label>
            <input
              type="checkbox"
              checked={impellerParams.hasBackPlate}
              onChange={(e) => onUpdateImpellerParams({ hasBackPlate: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          <NumericField
            label="Printer Tolerance"
            value={impellerParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateImpellerParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 9. Extrusion End Cap
  if (activeModel === 'extrusion_end_cap') {
    const { endCapParams, onUpdateEndCapParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Extrusion Profile Spec</span>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Profile Standard</label>
            <select
              value={endCapParams.profileSize}
              onChange={(e) => onUpdateEndCapParams({ profileSize: e.target.value as any })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="2020">2020 (20×20mm)</option>
              <option value="2040">2040 (20×40mm)</option>
              <option value="3030">3030 (30×30mm)</option>
              <option value="4040">4040 (40×40mm)</option>
            </select>
          </div>
          <NumericField
            label="Face Cap Thickness"
            value={endCapParams.capThickness}
            min={2.0}
            max={6.0}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateEndCapParams({ capThickness: val })}
          />
          <NumericField
            label="Slot Prong Depth"
            value={endCapParams.prongLength}
            min={5.0}
            max={15.0}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateEndCapParams({ prongLength: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Center Access Hole</label>
            <input
              type="checkbox"
              checked={endCapParams.centerHole}
              onChange={(e) => onUpdateEndCapParams({ centerHole: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          <NumericField
            label="Printer Tolerance"
            value={endCapParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateEndCapParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 10. Drop-In Slot T-Nut
  if (activeModel === 't_nut_slot') {
    const { tNutParams, onUpdateTNutParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>T-Nut Slot Dimensions</span>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Extrusion Channel</label>
            <select
              value={tNutParams.slotSize}
              onChange={(e) => onUpdateTNutParams({ slotSize: e.target.value as 'slot-6' | 'slot-8' })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="slot-6">Slot 6 (2020 Series)</option>
              <option value="slot-8">Slot 8 (3030/4040 Series)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Thread Size</label>
            <select
              value={tNutParams.threadSize}
              onChange={(e) => onUpdateTNutParams({ threadSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
              <option value="M5">M5</option>
              <option value="M6">M6</option>
            </select>
          </div>
          <NumericField
            label="Nut Length"
            value={tNutParams.nutLength}
            min={10}
            max={25}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateTNutParams({ nutLength: val })}
          />
          <NumericField
            label="Head Height"
            value={tNutParams.headHeight}
            min={3}
            max={8}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateTNutParams({ headHeight: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={tNutParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateTNutParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 11. Corner Cube Bracket
  if (activeModel === 'corner_cube_bracket') {
    const { cornerCubeParams, onUpdateCornerCubeParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Corner Cube Geometry</span>
          </div>
          <NumericField
            label="Cube Size"
            value={cornerCubeParams.cubeSize}
            min={18}
            max={45}
            step={1}
            unit="mm"
            tooltip="20mm for 2020 extrusion"
            onChange={(val) => onUpdateCornerCubeParams({ cubeSize: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Junction Style</label>
            <select
              value={cornerCubeParams.faceCount}
              onChange={(e) => onUpdateCornerCubeParams({ faceCount: parseInt(e.target.value) as 2 | 3 })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value={3}>3-Way (XYZ Corner Block)</option>
              <option value={2}>2-Way (90° L-Bracket)</option>
            </select>
          </div>
          <NumericField
            label="Bolt Hole Dia"
            value={cornerCubeParams.holeDiameter}
            min={4.0}
            max={6.5}
            step={0.2}
            unit="mm"
            onChange={(val) => onUpdateCornerCubeParams({ holeDiameter: val })}
          />
          <NumericField
            label="Counterbore Depth"
            value={cornerCubeParams.counterboreDepth}
            min={4.0}
            max={10.0}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateCornerCubeParams({ counterboreDepth: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={cornerCubeParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateCornerCubeParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 12. Ball Joint Rod End
  if (activeModel === 'ball_joint_rod_end') {
    const { ballJointParams, onUpdateBallJointParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Ball Joint Dimensions</span>
          </div>
          <NumericField
            label="Ball Diameter"
            value={ballJointParams.ballDiameter}
            min={8}
            max={22}
            step={0.5}
            unit="mm"
            tooltip="10mm for Kossel/Delta magnetic or cup link"
            onChange={(val) => onUpdateBallJointParams({ ballDiameter: val })}
          />
          <NumericField
            label="Neck Throat Dia"
            value={ballJointParams.neckDiameter}
            min={5}
            max={14}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateBallJointParams({ neckDiameter: val })}
          />
          <NumericField
            label="Shank Length"
            value={ballJointParams.shankLength}
            min={12}
            max={35}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateBallJointParams({ shankLength: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Shank Thread</label>
            <select
              value={ballJointParams.shankThreadSize}
              onChange={(e) => onUpdateBallJointParams({ shankThreadSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
              <option value="M5">M5</option>
              <option value="M6">M6</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Pinch Flex Slit</label>
            <input
              type="checkbox"
              checked={ballJointParams.hasClampSlit}
              onChange={(e) => onUpdateBallJointParams({ hasClampSlit: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          <NumericField
            label="Printer Tolerance"
            value={ballJointParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateBallJointParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 13. Servo Horn
  if (activeModel === 'servo_horn') {
    const { servoHornParams, onUpdateServoHornParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Servo Horn Configuration</span>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Horn Style</label>
            <select
              value={servoHornParams.hornStyle}
              onChange={(e) => onUpdateServoHornParams({ hornStyle: e.target.value as any })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="single-arm">Single Arm</option>
              <option value="dual-arm">Dual Arm</option>
              <option value="four-star">Four-Star Cross</option>
              <option value="round-wheel">Round Wheel</option>
            </select>
          </div>
          <NumericField
            label="Spline Diameter"
            value={servoHornParams.splineDiameter}
            min={4.5}
            max={8.0}
            step={0.1}
            unit="mm"
            tooltip="5.9mm for standard 25T servo (MG996R)"
            onChange={(val) => onUpdateServoHornParams({ splineDiameter: val })}
          />
          <NumericField
            label="Arm Length"
            value={servoHornParams.armLength}
            min={12}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateServoHornParams({ armLength: val })}
          />
          <NumericField
            label="Arm Thickness"
            value={servoHornParams.armThickness}
            min={2.0}
            max={5.0}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateServoHornParams({ armThickness: val })}
          />
          <NumericField
            label="Linkage Hole Dia"
            value={servoHornParams.linkageHoleDia}
            min={1.2}
            max={2.5}
            step={0.1}
            unit="mm"
            onChange={(val) => onUpdateServoHornParams({ linkageHoleDia: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={servoHornParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateServoHornParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 14. Cable Guide Anchor
  if (activeModel === 'cable_guide_anchor') {
    const { anchorParams, onUpdateAnchorParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Cable Anchor Dimensions</span>
          </div>
          <NumericField
            label="Anchor Length"
            value={anchorParams.anchorLength}
            min={20}
            max={55}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateAnchorParams({ anchorLength: val })}
          />
          <NumericField
            label="Anchor Width"
            value={anchorParams.anchorWidth}
            min={16}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateAnchorParams({ anchorWidth: val })}
          />
          <NumericField
            label="Anchor Height"
            value={anchorParams.anchorHeight}
            min={10}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateAnchorParams({ anchorHeight: val })}
          />
          <NumericField
            label="Bolt Hole Spacing"
            value={anchorParams.mountHoleSpacing}
            min={12}
            max={35}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateAnchorParams({ mountHoleSpacing: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mount Screw</label>
            <select
              value={anchorParams.mountScrewSize}
              onChange={(e) => onUpdateAnchorParams({ mountScrewSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
              <option value="M5">M5</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Extrusion Slot Lug</label>
            <input
              type="checkbox"
              checked={anchorParams.hasExtrusionSlotLug}
              onChange={(e) => onUpdateAnchorParams({ hasExtrusionSlotLug: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          <NumericField
            label="Printer Tolerance"
            value={anchorParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateAnchorParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 15. Stepper Damper Plate
  if (activeModel === 'stepper_damper_plate') {
    const { damperParams, onUpdateDamperParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Damper Plate Parameters</span>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">NEMA Frame</label>
            <select
              value={damperParams.nemaSize}
              onChange={(e) => onUpdateDamperParams({ nemaSize: e.target.value as 'NEMA17' | 'NEMA23' })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="NEMA17">NEMA 17 (42mm)</option>
              <option value="NEMA23">NEMA 23 (57mm)</option>
            </select>
          </div>
          <NumericField
            label="Plate Thickness"
            value={damperParams.plateThickness}
            min={6}
            max={14}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateDamperParams({ plateThickness: val })}
          />
          <NumericField
            label="Flexure Slit Width"
            value={damperParams.flexureSlitWidth}
            min={1.2}
            max={2.5}
            step={0.1}
            unit="mm"
            onChange={(val) => onUpdateDamperParams({ flexureSlitWidth: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={damperParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateDamperParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 16. PCB Standoff Clip
  if (activeModel === 'pcb_standoff_clip') {
    const { standoffParams, onUpdateStandoffParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>PCB Clip Parameters</span>
          </div>
          <NumericField
            label="PCB Board Thickness"
            value={standoffParams.pcbThickness}
            min={1.0}
            max={2.4}
            step={0.1}
            unit="mm"
            tooltip="1.6mm standard FR4 circuit board"
            onChange={(val) => onUpdateStandoffParams({ pcbThickness: val })}
          />
          <NumericField
            label="Standoff Height"
            value={standoffParams.standoffHeight}
            min={5}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateStandoffParams({ standoffHeight: val })}
          />
          <NumericField
            label="Base Diameter"
            value={standoffParams.baseDiameter}
            min={10}
            max={25}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateStandoffParams({ baseDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mounting Base</label>
            <select
              value={standoffParams.baseMountType}
              onChange={(e) => onUpdateStandoffParams({ baseMountType: e.target.value as any })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="m3-screw">M3 Countersunk Screw</option>
              <option value="adhesive-flat">Adhesive Tape Pad</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={standoffParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateStandoffParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 17. Endstop Mount
  if (activeModel === 'endstop_mount') {
    const { endstopParams, onUpdateEndstopParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Endstop Bracket Dimensions</span>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Switch Standard</label>
            <select
              value={endstopParams.switchType}
              onChange={(e) => onUpdateEndstopParams({ switchType: e.target.value as any })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="omron-micro">OMRON SS-5 (9.5mm)</option>
              <option value="kw11-mini">KW11 Mini (10mm)</option>
              <option value="optical-slotted">Optical Flag (19mm)</option>
            </select>
          </div>
          <NumericField
            label="Plate Length"
            value={endstopParams.mountBodyLength}
            min={20}
            max={45}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateEndstopParams({ mountBodyLength: val })}
          />
          <NumericField
            label="Adjustment Slot Travel"
            value={endstopParams.slotAdjustLength}
            min={6}
            max={22}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateEndstopParams({ slotAdjustLength: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Rail Screw</label>
            <select
              value={endstopParams.extrusionMountScrew}
              onChange={(e) => onUpdateEndstopParams({ extrusionMountScrew: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
              <option value="M5">M5</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Extrusion Slot Lug</label>
            <input
              type="checkbox"
              checked={endstopParams.hasSlotLug}
              onChange={(e) => onUpdateEndstopParams({ hasSlotLug: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer"
            />
          </div>
          <NumericField
            label="Printer Tolerance"
            value={endstopParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateEndstopParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 18. Fan Duct Shroud
  if (activeModel === 'fan_duct_shroud') {
    const { ductParams, onUpdateDuctParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Blower Duct Geometry</span>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Blower Fan Spec</label>
            <select
              value={ductParams.fanType}
              onChange={(e) => onUpdateDuctParams({ fanType: e.target.value as any })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="5015-blower">5015 Radial Blower (20×15mm)</option>
              <option value="4010-blower">4010 Compact Blower (16×11mm)</option>
            </select>
          </div>
          <NumericField
            label="Duct Length"
            value={ductParams.ductLength}
            min={25}
            max={65}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDuctParams({ ductLength: val })}
          />
          <NumericField
            label="Downturn Tilt Angle"
            value={ductParams.ductAngleDeg}
            min={25}
            max={60}
            step={1}
            unit="deg"
            tooltip="Points jet at hotend nozzle"
            onChange={(val) => onUpdateDuctParams({ ductAngleDeg: val })}
          />
          <NumericField
            label="Nozzle Width"
            value={ductParams.nozzleWidth}
            min={10}
            max={30}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDuctParams({ nozzleWidth: val })}
          />
          <NumericField
            label="Nozzle Height"
            value={ductParams.nozzleHeight}
            min={3}
            max={8}
            step={0.5}
            unit="mm"
            onChange={(val) => onUpdateDuctParams({ nozzleHeight: val })}
          />
          <NumericField
            label="Wall Thickness"
            value={ductParams.wallThickness}
            min={1.2}
            max={2.5}
            step={0.1}
            unit="mm"
            onChange={(val) => onUpdateDuctParams({ wallThickness: val })}
          />
          <NumericField
            label="Printer Tolerance"
            value={ductParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateDuctParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 19. Spool Holder Hub
  if (activeModel === 'spool_holder_hub') {
    const { spoolHubParams, onUpdateSpoolHubParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Spool Centering Cone</span>
          </div>
          <NumericField
            label="Minimum Spool Bore"
            value={spoolHubParams.spoolBoreMin}
            min={45}
            max={58}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSpoolHubParams({ spoolBoreMin: val })}
          />
          <NumericField
            label="Maximum Spool Bore"
            value={spoolHubParams.spoolBoreMax}
            min={60}
            max={80}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSpoolHubParams({ spoolBoreMax: val })}
          />
          <NumericField
            label="Cone Length"
            value={spoolHubParams.coneLength}
            min={25}
            max={60}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSpoolHubParams({ coneLength: val })}
          />
          <NumericField
            label="Flange Lip Diameter"
            value={spoolHubParams.flangeDiameter}
            min={65}
            max={90}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateSpoolHubParams({ flangeDiameter: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Bearing Pocket</label>
            <select
              value={spoolHubParams.bearingType}
              onChange={(e) => onUpdateSpoolHubParams({ bearingType: e.target.value as any })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="608">608 Bearing (Skate / 8mm Axle)</option>
              <option value="624">624 Bearing (4mm Axle)</option>
              <option value="none-solid">Solid Axle Bore</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={spoolHubParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateSpoolHubParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  // 20. Dial Indicator Mount
  if (activeModel === 'dial_indicator_mount') {
    const { dialMountParams, onUpdateDialMountParams } = props;
    return (
      <div className="space-y-4">
        <div className="space-y-3 bg-[#0d1527] p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-sky-400" />
            <span>Indicator Gauge Clamp</span>
          </div>
          <NumericField
            label="Stem Bore Diameter"
            value={dialMountParams.stemDiameter}
            min={6.0}
            max={12.0}
            step={0.1}
            unit="mm"
            tooltip="8.0mm metric or 9.525mm 3/8-inch"
            onChange={(val) => onUpdateDialMountParams({ stemDiameter: val })}
          />
          <NumericField
            label="Clamp Thickness"
            value={dialMountParams.clampThickness}
            min={10}
            max={22}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDialMountParams({ clampThickness: val })}
          />
          <NumericField
            label="Extension Arm Length"
            value={dialMountParams.armLength}
            min={15}
            max={50}
            step={1}
            unit="mm"
            onChange={(val) => onUpdateDialMountParams({ armLength: val })}
          />
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Mounting Interface</label>
            <select
              value={dialMountParams.mountStyle}
              onChange={(e) => onUpdateDialMountParams({ mountStyle: e.target.value as any })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="2020-rail-lug">2020 Extrusion Rail (M4)</option>
              <option value="rod-clamp-10mm">10mm Smooth Rod Clamp</option>
              <option value="magnetic-base-m5">M5 Magnetic Articulated Post</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 font-medium">Pinch Bolt</label>
            <select
              value={dialMountParams.pinchBoltSize}
              onChange={(e) => onUpdateDialMountParams({ pinchBoltSize: e.target.value as ScrewSizeType })}
              className="bg-[#1e293b] text-slate-100 text-xs px-2.5 py-1 rounded border border-slate-700"
            >
              <option value="M3">M3</option>
              <option value="M4">M4</option>
            </select>
          </div>
          <NumericField
            label="Printer Tolerance"
            value={dialMountParams.printer_compensation}
            min={-0.1}
            max={0.4}
            step={0.05}
            unit="mm"
            onChange={(val) => onUpdateDialMountParams({ printer_compensation: val })}
          />
        </div>
      </div>
    );
  }

  return null;
};
