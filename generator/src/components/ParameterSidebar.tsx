import React from 'react';
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
  BoreType,
  MountingFlangeType,
  ScrewSizeType,
} from '../generators/types';
import {
  Sliders,
  HelpCircle,
  Download,
  ChevronRight,
} from 'lucide-react';
import { NewParamControls, NewParamControlsProps } from './NewParamControls';

export interface ParameterSidebarProps extends NewParamControlsProps {
  activeModel: PrimitiveType;
  gearParams: HerringboneGearParams;
  pillowParams: BearingPillowBlockParams;
  bracketParams: StructuralBracketParams;
  gt2Params: GT2PulleyParams;
  knobParams: KnurledKnobParams;
  fastenerParams: ThreadedFastenerParams;
  couplerParams: ShaftCouplerParams;
  enclosureParams: ProjectEnclosureParams;
  stepperParams: StepperMountParams;
  clampParams: LinearRodClampParams;
  barbParams: HoseBarbParams;
  nutBlockParams: LeadScrewNutBlockParams;
  chainParams: CableChainLinkParams;
  onUpdateGearParams: (updates: Partial<HerringboneGearParams>) => void;
  onUpdatePillowParams: (updates: Partial<BearingPillowBlockParams>) => void;
  onUpdateBracketParams: (updates: Partial<StructuralBracketParams>) => void;
  onUpdateGT2Params: (updates: Partial<GT2PulleyParams>) => void;
  onUpdateKnobParams: (updates: Partial<KnurledKnobParams>) => void;
  onUpdateFastenerParams: (updates: Partial<ThreadedFastenerParams>) => void;
  onUpdateCouplerParams: (updates: Partial<ShaftCouplerParams>) => void;
  onUpdateEnclosureParams: (updates: Partial<ProjectEnclosureParams>) => void;
  onUpdateStepperParams: (updates: Partial<StepperMountParams>) => void;
  onUpdateClampParams: (updates: Partial<LinearRodClampParams>) => void;
  onUpdateBarbParams: (updates: Partial<HoseBarbParams>) => void;
  onUpdateNutBlockParams: (updates: Partial<LeadScrewNutBlockParams>) => void;
  onUpdateChainParams: (updates: Partial<CableChainLinkParams>) => void;
  onExportSTL: (binary: boolean) => void;
}

// Reusable Slider + Number Field pair with hard bounds
interface NumericFieldProps {
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

const NumericField: React.FC<NumericFieldProps> = ({
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

export const ParameterSidebar: React.FC<ParameterSidebarProps> = (props) => {
  const {
    activeModel,
    gearParams,
    pillowParams,
    bracketParams,
    gt2Params,
    knobParams,
    fastenerParams,
    couplerParams,
    enclosureParams,
    stepperParams,
    clampParams,
    barbParams,
    nutBlockParams,
    chainParams,
    onUpdateGearParams,
    onUpdatePillowParams,
    onUpdateBracketParams,
    onUpdateGT2Params,
    onUpdateKnobParams,
    onUpdateFastenerParams,
    onUpdateCouplerParams,
    onUpdateEnclosureParams,
    onUpdateStepperParams,
    onUpdateClampParams,
    onUpdateBarbParams,
    onUpdateNutBlockParams,
    onUpdateChainParams,
    onExportSTL,
  } = props;
  return (
    <aside className="w-full md:w-[380px] h-full bg-[#0b1120] border-r border-slate-800 flex flex-col shrink-0 overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0b1325]">
        <div className="flex items-center gap-2 text-slate-200 font-mono text-sm font-bold uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Parametric Controls</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
          Live Realtime
        </span>
      </div>

      {/* Scrollable Parameters List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
        {/* ===================== GT2 PULLEY CONTROLS ===================== */}
        {activeModel === 'gt2_pulley' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>GT2 Belt & Tooth Parameters</span>
              </div>
              <NumericField
                label="Tooth Count (Z)"
                value={gt2Params.toothCount}
                min={12}
                max={100}
                step={1}
                unit="teeth"
                onChange={(val) => onUpdateGT2Params({ toothCount: Math.round(val) })}
                tooltip="Number of curvilinear GT2 belt teeth around the pulley"
              />
              <NumericField
                label="Belt Pitch"
                value={gt2Params.pitch}
                min={2.0}
                max={3.0}
                step={1.0}
                unit="mm"
                onChange={(val) => onUpdateGT2Params({ pitch: val })}
                tooltip="Standard GT2 is 2.0mm, GT3 is 3.0mm"
              />
              <NumericField
                label="Belt Width"
                value={gt2Params.beltWidth}
                min={6}
                max={15}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateGT2Params({ beltWidth: val })}
                tooltip="Standard 3D printer belts are 6mm or 9mm wide"
              />
            </div>

            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Flanges & Hub Collar</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Flange Style</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['both', 'bottom', 'top', 'none'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onUpdateGT2Params({ flangeType: style })}
                      className={`py-1 text-xs rounded border capitalize transition-all ${
                        gt2Params.flangeType === style
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              {gt2Params.flangeType !== 'none' && (
                <>
                  <NumericField
                    label="Flange Height (Radius Offset)"
                    value={gt2Params.flangeHeight}
                    min={1.0}
                    max={4.0}
                    step={0.2}
                    unit="mm"
                    onChange={(val) => onUpdateGT2Params({ flangeHeight: val })}
                  />
                  <NumericField
                    label="Flange Thickness"
                    value={gt2Params.flangeThickness}
                    min={0.8}
                    max={2.5}
                    step={0.1}
                    unit="mm"
                    onChange={(val) => onUpdateGT2Params({ flangeThickness: val })}
                  />
                </>
              )}
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs text-slate-300 font-medium">Add Set-Screw Hub Collar</label>
                <input
                  type="checkbox"
                  checked={gt2Params.hasHub}
                  onChange={(e) => onUpdateGT2Params({ hasHub: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>
              {gt2Params.hasHub && (
                <>
                  <NumericField
                    label="Hub Diameter"
                    value={gt2Params.hubDiameter}
                    min={10}
                    max={35}
                    step={1}
                    unit="mm"
                    onChange={(val) => onUpdateGT2Params({ hubDiameter: val })}
                  />
                  <NumericField
                    label="Hub Height"
                    value={gt2Params.hubHeight}
                    min={4}
                    max={15}
                    step={1}
                    unit="mm"
                    onChange={(val) => onUpdateGT2Params({ hubHeight: val })}
                  />
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Shaft Bore</span>
              </div>
              <NumericField
                label="Bore Diameter"
                value={gt2Params.boreDiameter}
                min={0}
                max={15}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdateGT2Params({ boreDiameter: val })}
              />
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Bore Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['round', 'd-shaft', 'hex'] as BoreType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdateGT2Params({ boreType: type })}
                      className={`py-1 text-xs rounded border capitalize transition-all ${
                        gt2Params.boreType === type
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              {gt2Params.boreType === 'd-shaft' && (
                <NumericField
                  label="D-Shaft Flat Offset"
                  value={gt2Params.dShaftFlatOffset}
                  min={0.5}
                  max={6.0}
                  step={0.1}
                  unit="mm"
                  onChange={(val) => onUpdateGT2Params({ dShaftFlatOffset: val })}
                />
              )}
              <NumericField
                label="Printer Tolerance"
                value={gt2Params.printer_compensation}
                min={-0.2}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateGT2Params({ printer_compensation: val })}
                tooltip="Expands internal hole dimensions to compensate for 3D printer plastic shrinkage"
              />
            </div>
          </div>
        )}

        {/* ===================== HERRINGBONE GEAR CONTROLS ===================== */}
        {activeModel === 'herringbone_gear' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Involute Gear Geometry</span>
              </div>
              <NumericField
                label="Module (Tooth Size)"
                value={gearParams.module}
                min={0.5}
                max={4.0}
                step={0.1}
                unit="mm"
                onChange={(val) => onUpdateGearParams({ module: val })}
              />
              <NumericField
                label="Tooth Count (Z)"
                value={gearParams.toothCount}
                min={8}
                max={75}
                step={1}
                unit="teeth"
                onChange={(val) => onUpdateGearParams({ toothCount: Math.round(val) })}
              />
              <NumericField
                label="Helix Angle"
                value={gearParams.helixAngle}
                min={15}
                max={45}
                step={1}
                unit="deg"
                onChange={(val) => onUpdateGearParams({ helixAngle: val })}
              />
              <NumericField
                label="Face Width (Height)"
                value={gearParams.faceWidth}
                min={6}
                max={45}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateGearParams({ faceWidth: val })}
              />
            </div>
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Shaft Bore & Tolerances</span>
              </div>
              <NumericField
                label="Bore Diameter"
                value={gearParams.boreDiameter}
                min={0}
                max={25}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdateGearParams({ boreDiameter: val })}
              />
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Bore Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['round', 'd-shaft', 'hex'] as BoreType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdateGearParams({ boreType: type })}
                      className={`py-1 text-xs rounded border capitalize transition-all ${
                        gearParams.boreType === type
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <NumericField
                label="Printer Tolerance"
                value={gearParams.printer_compensation}
                min={-0.2}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateGearParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== KNURLED KNOB CONTROLS ===================== */}
        {activeModel === 'knurled_knob' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Dial Body & Knurling</span>
              </div>
              <NumericField
                label="Outer Diameter"
                value={knobParams.outerDiameter}
                min={14}
                max={55}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateKnobParams({ outerDiameter: val })}
              />
              <NumericField
                label="Knob Height"
                value={knobParams.height}
                min={10}
                max={35}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateKnobParams({ height: val })}
              />
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Knurl Pattern</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['straight', 'diamond', 'ribbed'] as const).map((pat) => (
                    <button
                      key={pat}
                      onClick={() => onUpdateKnobParams({ knurlPattern: pat })}
                      className={`py-1 text-xs rounded border capitalize transition-all ${
                        knobParams.knurlPattern === pat
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {pat}
                    </button>
                  ))}
                </div>
              </div>
              <NumericField
                label="Knurl Tooth Count"
                value={knobParams.knurlCount}
                min={16}
                max={60}
                step={2}
                unit="ridges"
                onChange={(val) => onUpdateKnobParams({ knurlCount: Math.round(val) })}
              />
              <NumericField
                label="Knurl Depth"
                value={knobParams.knurlDepth}
                min={0.4}
                max={2.5}
                step={0.1}
                unit="mm"
                onChange={(val) => onUpdateKnobParams({ knurlDepth: val })}
              />
            </div>

            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Features & Shaft Bore</span>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">Pointer Indicator Groove</label>
                <input
                  type="checkbox"
                  checked={knobParams.hasPointer}
                  onChange={(e) => onUpdateKnobParams({ hasPointer: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">Base Skirt Flare</label>
                <input
                  type="checkbox"
                  checked={knobParams.hasSkirt}
                  onChange={(e) => onUpdateKnobParams({ hasSkirt: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>
              {knobParams.hasSkirt && (
                <NumericField
                  label="Skirt Diameter"
                  value={knobParams.skirtDiameter}
                  min={knobParams.outerDiameter + 2}
                  max={knobParams.outerDiameter + 20}
                  step={1}
                  unit="mm"
                  onChange={(val) => onUpdateKnobParams({ skirtDiameter: val })}
                />
              )}
              <NumericField
                label="Bore Diameter (Shaft)"
                value={knobParams.boreDiameter}
                min={0}
                max={15}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdateKnobParams({ boreDiameter: val })}
              />
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Bore Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['round', 'd-shaft', 'hex'] as BoreType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdateKnobParams({ boreType: type })}
                      className={`py-1 text-xs rounded border capitalize transition-all ${
                        knobParams.boreType === type
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <NumericField
                label="Printer Tolerance"
                value={knobParams.printer_compensation}
                min={-0.2}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateKnobParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== THREADED FASTENER CONTROLS ===================== */}
        {activeModel === 'threaded_fastener' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Fastener Type & ISO Thread</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {(['bolt', 'nut'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onUpdateFastenerParams({ fastenerType: type })}
                    className={`py-1.5 text-xs rounded border uppercase font-bold transition-all ${
                      fastenerParams.fastenerType === type
                        ? 'bg-sky-500 border-sky-400 text-slate-950'
                        : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <NumericField
                label="Nominal Diameter (M-Size)"
                value={fastenerParams.nominalDiameter}
                min={3}
                max={16}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateFastenerParams({ nominalDiameter: val })}
                tooltip="Diameter e.g. 6mm = M6, 8mm = M8"
              />
              <NumericField
                label="Thread Pitch"
                value={fastenerParams.pitch}
                min={0.5}
                max={2.5}
                step={0.25}
                unit="mm"
                onChange={(val) => onUpdateFastenerParams({ pitch: val })}
                tooltip="Standard metric coarse pitches: M4=0.7, M5=0.8, M6=1.0, M8=1.25"
              />
              {fastenerParams.fastenerType === 'bolt' ? (
                <>
                  <NumericField
                    label="Threaded Length"
                    value={fastenerParams.threadLength}
                    min={6}
                    max={60}
                    step={2}
                    unit="mm"
                    onChange={(val) => onUpdateFastenerParams({ threadLength: val })}
                  />
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-medium">Head Drive Style</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['hex', 'socket-cap', 'knurled-thumb'] as const).map((head) => (
                        <button
                          key={head}
                          onClick={() => onUpdateFastenerParams({ headType: head })}
                          className={`py-1 text-xs rounded border capitalize transition-all ${
                            fastenerParams.headType === head
                              ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                              : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {head}
                        </button>
                      ))}
                    </div>
                  </div>
                  <NumericField
                    label="Head Height"
                    value={fastenerParams.headHeight}
                    min={2.5}
                    max={12}
                    step={0.5}
                    unit="mm"
                    onChange={(val) => onUpdateFastenerParams({ headHeight: val })}
                  />
                </>
              ) : (
                <>
                  <NumericField
                    label="Nut Height"
                    value={fastenerParams.nutHeight}
                    min={3}
                    max={15}
                    step={0.5}
                    unit="mm"
                    onChange={(val) => onUpdateFastenerParams({ nutHeight: val })}
                  />
                  <NumericField
                    label="Nut Width Across Flats"
                    value={fastenerParams.nutWidthAcrossFlats}
                    min={6}
                    max={26}
                    step={1}
                    unit="mm"
                    onChange={(val) => onUpdateFastenerParams({ nutWidthAcrossFlats: val })}
                  />
                </>
              )}
              <NumericField
                label="Printer Tolerance"
                value={fastenerParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateFastenerParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== SHAFT COUPLER CONTROLS ===================== */}
        {activeModel === 'shaft_coupler' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Body & Independent Bores</span>
              </div>
              <NumericField
                label="Outer Diameter"
                value={couplerParams.outerDiameter}
                min={16}
                max={32}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateCouplerParams({ outerDiameter: val })}
              />
              <NumericField
                label="Total Length"
                value={couplerParams.length}
                min={20}
                max={45}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateCouplerParams({ length: val })}
              />
              <NumericField
                label="Bore 1 (Motor Shaft)"
                value={couplerParams.bore1Diameter}
                min={3}
                max={12}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdateCouplerParams({ bore1Diameter: val })}
              />
              <NumericField
                label="Bore 2 (Driven Shaft / Lead)"
                value={couplerParams.bore2Diameter}
                min={3}
                max={14}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdateCouplerParams({ bore2Diameter: val })}
              />
            </div>
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Clamping Flexure</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {(['slit-clamp', 'spiral-beam'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => onUpdateCouplerParams({ couplerStyle: style })}
                    className={`py-1.5 text-xs rounded border capitalize transition-all ${
                      couplerParams.couplerStyle === style
                        ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                        : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <NumericField
                label="Flex Slit Width"
                value={couplerParams.slitWidth}
                min={1.0}
                max={2.5}
                step={0.1}
                unit="mm"
                onChange={(val) => onUpdateCouplerParams({ slitWidth: val })}
              />
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Clamp Screw Size</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['M3', 'M4'] as ScrewSizeType[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => onUpdateCouplerParams({ clampScrewSize: size })}
                      className={`py-1 text-xs rounded border uppercase transition-all ${
                        couplerParams.clampScrewSize === size
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <NumericField
                label="Printer Tolerance"
                value={couplerParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateCouplerParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== PROJECT ENCLOSURE CONTROLS ===================== */}
        {activeModel === 'project_enclosure' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Internal Dimensions</span>
              </div>
              <NumericField
                label="Inner Length"
                value={enclosureParams.innerLength}
                min={30}
                max={150}
                step={2}
                unit="mm"
                onChange={(val) => onUpdateEnclosureParams({ innerLength: val })}
              />
              <NumericField
                label="Inner Width"
                value={enclosureParams.innerWidth}
                min={25}
                max={120}
                step={2}
                unit="mm"
                onChange={(val) => onUpdateEnclosureParams({ innerWidth: val })}
              />
              <NumericField
                label="Inner Height (Depth)"
                value={enclosureParams.innerHeight}
                min={15}
                max={75}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateEnclosureParams({ innerHeight: val })}
              />
              <NumericField
                label="Wall Thickness"
                value={enclosureParams.wallThickness}
                min={1.8}
                max={4.5}
                step={0.2}
                unit="mm"
                onChange={(val) => onUpdateEnclosureParams({ wallThickness: val })}
              />
            </div>
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>PCB Standoffs & Ports</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Corner Standoff Bosses</label>
                <div className="grid grid-cols-3 gap-1">
                  {([0, 2, 4] as const).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => onUpdateEnclosureParams({ standoffCount: cnt })}
                      className={`py-1 text-xs rounded border transition-all ${
                        enclosureParams.standoffCount === cnt
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {cnt === 0 ? 'None' : `${cnt} Bosses`}
                    </button>
                  ))}
                </div>
              </div>
              {enclosureParams.standoffCount > 0 && (
                <NumericField
                  label="Standoff Height"
                  value={enclosureParams.standoffHeight}
                  min={3}
                  max={12}
                  step={0.5}
                  unit="mm"
                  onChange={(val) => onUpdateEnclosureParams({ standoffHeight: val })}
                />
              )}
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">Side Cable Port Cutout</label>
                <input
                  type="checkbox"
                  checked={enclosureParams.hasCableCutout}
                  onChange={(e) => onUpdateEnclosureParams({ hasCableCutout: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>
              {enclosureParams.hasCableCutout && (
                <NumericField
                  label="Port Width"
                  value={enclosureParams.cableCutoutWidth}
                  min={6}
                  max={25}
                  step={1}
                  unit="mm"
                  onChange={(val) => onUpdateEnclosureParams({ cableCutoutWidth: val })}
                />
              )}
              <NumericField
                label="Printer Tolerance"
                value={enclosureParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateEnclosureParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== STEPPER MOUNT CONTROLS ===================== */}
        {activeModel === 'stepper_mount' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>NEMA Standard Size</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['NEMA14', 'NEMA17', 'NEMA23'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateStepperParams({ nemaSize: size })}
                    className={`py-1.5 text-xs rounded border font-bold transition-all ${
                      stepperParams.nemaSize === size
                        ? 'bg-sky-500 border-sky-400 text-slate-950'
                        : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <NumericField
                label="Faceplate Thickness"
                value={stepperParams.faceThickness}
                min={3}
                max={8}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdateStepperParams({ faceThickness: val })}
              />
              <NumericField
                label="Base Plate Length"
                value={stepperParams.baseLength}
                min={20}
                max={50}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateStepperParams({ baseLength: val })}
              />
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Motor Mounting Hole Type</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['slots', 'round'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdateStepperParams({ motorHoleType: type })}
                      className={`py-1 text-xs rounded border capitalize transition-all ${
                        stepperParams.motorHoleType === type
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {type === 'slots' ? 'Tension Slots' : 'Round Holes'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">Stiffening Side Gussets</label>
                <input
                  type="checkbox"
                  checked={stepperParams.hasGussets}
                  onChange={(e) => onUpdateStepperParams({ hasGussets: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>
              <NumericField
                label="Printer Tolerance"
                value={stepperParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateStepperParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== LINEAR ROD CLAMP CONTROLS ===================== */}
        {activeModel === 'linear_rod_clamp' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Smooth Rod Dimensions</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Rod Diameter</label>
                <div className="grid grid-cols-4 gap-1">
                  {([8, 10, 12, 16] as const).map((dia) => (
                    <button
                      key={dia}
                      onClick={() => onUpdateClampParams({ rodDiameter: dia })}
                      className={`py-1 text-xs rounded border font-bold transition-all ${
                        clampParams.rodDiameter === dia
                          ? 'bg-sky-500 border-sky-400 text-slate-950'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {dia}mm
                    </button>
                  ))}
                </div>
              </div>
              <NumericField
                label="Block Width"
                value={clampParams.blockWidth}
                min={30}
                max={65}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateClampParams({ blockWidth: val })}
              />
              <NumericField
                label="Block Height"
                value={clampParams.blockHeight}
                min={24}
                max={50}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateClampParams({ blockHeight: val })}
              />
              <NumericField
                label="Block Thickness"
                value={clampParams.blockThickness}
                min={10}
                max={25}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateClampParams({ blockThickness: val })}
              />
              <NumericField
                label="Clamping Slit Gap"
                value={clampParams.clampGap}
                min={1.0}
                max={2.5}
                step={0.1}
                unit="mm"
                onChange={(val) => onUpdateClampParams({ clampGap: val })}
              />
              <NumericField
                label="Printer Tolerance"
                value={clampParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateClampParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== HOSE BARB CONTROLS ===================== */}
        {activeModel === 'hose_barb' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Tubing & Barb Geometry</span>
              </div>
              <NumericField
                label="Barb Inner Diameter (Tubing ID)"
                value={barbParams.barbNominalID}
                min={3}
                max={20}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdateBarbParams({ barbNominalID: val })}
              />
              <NumericField
                label="Number of Barbs"
                value={barbParams.barbCount}
                min={2}
                max={5}
                step={1}
                unit="ridges"
                onChange={(val) => onUpdateBarbParams({ barbCount: Math.round(val) })}
              />
              <NumericField
                label="Barb Stem Length"
                value={barbParams.barbLength}
                min={10}
                max={30}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateBarbParams({ barbLength: val })}
              />
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Connector Style</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['straight-coupler', 'reducer'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => onUpdateBarbParams({ connectorType: style })}
                      className={`py-1 text-xs rounded border capitalize transition-all ${
                        barbParams.connectorType === style
                          ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {style === 'straight-coupler' ? 'Coupler' : 'Reducer'}
                    </button>
                  ))}
                </div>
              </div>
              {barbParams.connectorType === 'reducer' && (
                <NumericField
                  label="Second Barb ID"
                  value={barbParams.secondBarbNominalID}
                  min={3}
                  max={20}
                  step={0.5}
                  unit="mm"
                  onChange={(val) => onUpdateBarbParams({ secondBarbNominalID: val })}
                />
              )}
              <NumericField
                label="Hex Wrench Nut Width"
                value={barbParams.hexNutWidth}
                min={10}
                max={30}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateBarbParams({ hexNutWidth: val })}
              />
              <NumericField
                label="Printer Tolerance"
                value={barbParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateBarbParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== T8 LEADSCREW NUT BLOCK CONTROLS ===================== */}
        {activeModel === 'lead_screw_nut_block' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Housing Dimensions</span>
              </div>
              <NumericField
                label="Block Width"
                value={nutBlockParams.blockWidth}
                min={26}
                max={45}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateNutBlockParams({ blockWidth: val })}
              />
              <NumericField
                label="Block Length"
                value={nutBlockParams.blockLength}
                min={26}
                max={45}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateNutBlockParams({ blockLength: val })}
              />
              <NumericField
                label="Block Height"
                value={nutBlockParams.blockHeight}
                min={14}
                max={30}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateNutBlockParams({ blockHeight: val })}
              />
              <NumericField
                label="Nut Pocket Depth"
                value={nutBlockParams.pocketDepth}
                min={2.5}
                max={7}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdateNutBlockParams({ pocketDepth: val })}
              />
              <NumericField
                label="Printer Tolerance"
                value={nutBlockParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateNutBlockParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== CABLE CHAIN LINK CONTROLS ===================== */}
        {activeModel === 'cable_chain_link' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Wire Chamber & Pitch</span>
              </div>
              <NumericField
                label="Chamber Width"
                value={chainParams.chamberWidth}
                min={10}
                max={30}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateChainParams({ chamberWidth: val })}
              />
              <NumericField
                label="Chamber Height"
                value={chainParams.chamberHeight}
                min={8}
                max={22}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateChainParams({ chamberHeight: val })}
              />
              <NumericField
                label="Link Pitch (Length)"
                value={chainParams.pitch}
                min={15}
                max={30}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateChainParams({ pitch: val })}
              />
              <NumericField
                label="Wall Thickness"
                value={chainParams.wallThickness}
                min={1.6}
                max={3.0}
                step={0.2}
                unit="mm"
                onChange={(val) => onUpdateChainParams({ wallThickness: val })}
              />
              <NumericField
                label="Printer Tolerance"
                value={chainParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateChainParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== BEARING PILLOW BLOCK CONTROLS ===================== */}
        {activeModel === 'bearing_pillow_block' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Bearing Pocket</span>
              </div>
              <NumericField
                label="Bearing OD"
                value={pillowParams.bearingOD}
                min={10}
                max={40}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdatePillowParams({ bearingOD: val, preset: 'custom' })}
              />
              <NumericField
                label="Bearing ID (Shaft)"
                value={pillowParams.bearingID}
                min={3}
                max={20}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdatePillowParams({ bearingID: val, preset: 'custom' })}
              />
              <NumericField
                label="Pocket Depth"
                value={pillowParams.pocketDepth}
                min={3}
                max={20}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdatePillowParams({ pocketDepth: val })}
              />
              <NumericField
                label="Wall Thickness"
                value={pillowParams.wallThickness}
                min={2.5}
                max={12}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdatePillowParams({ wallThickness: val })}
              />
            </div>
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Mounting Flanges</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['two-sided', 'bottom-foot', 'none'] as MountingFlangeType[]).map((flange) => (
                  <button
                    key={flange}
                    onClick={() => onUpdatePillowParams({ mountingFlanges: flange })}
                    className={`py-1 text-xs rounded border capitalize transition-all ${
                      pillowParams.mountingFlanges === flange
                        ? 'bg-sky-500 border-sky-400 text-slate-950 font-bold'
                        : 'bg-[#1e293b] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {flange === 'two-sided' ? 'Two Ears' : flange === 'bottom-foot' ? 'Base Foot' : 'Cartridge'}
                  </button>
                ))}
              </div>
              <NumericField
                label="Printer Tolerance"
                value={pillowParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdatePillowParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* ===================== STRUCTURAL BRACKET CONTROLS ===================== */}
        {activeModel === 'structural_bracket' && (
          <div className="space-y-5 font-mono">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>L-Bracket Leg Dimensions</span>
              </div>
              <NumericField
                label="Base Leg Length"
                value={bracketParams.leg1Length}
                min={20}
                max={120}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateBracketParams({ leg1Length: val })}
              />
              <NumericField
                label="Upright Leg Length"
                value={bracketParams.leg2Length}
                min={20}
                max={120}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateBracketParams({ leg2Length: val })}
              />
              <NumericField
                label="Bracket Width"
                value={bracketParams.width}
                min={12}
                max={80}
                step={1}
                unit="mm"
                onChange={(val) => onUpdateBracketParams({ width: val })}
              />
              <NumericField
                label="Leg Thickness"
                value={bracketParams.thickness}
                min={2.5}
                max={12}
                step={0.5}
                unit="mm"
                onChange={(val) => onUpdateBracketParams({ thickness: val })}
              />
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">Corner Gusset Rib</label>
                <input
                  type="checkbox"
                  checked={bracketParams.gussetReinforcement}
                  onChange={(e) => onUpdateBracketParams({ gussetReinforcement: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>
              <NumericField
                label="Printer Tolerance"
                value={bracketParams.printer_compensation}
                min={-0.1}
                max={0.4}
                step={0.05}
                unit="mm"
                onChange={(val) => onUpdateBracketParams({ printer_compensation: val })}
              />
            </div>
          </div>
        )}

        {/* 20 New Component Parameter Controls */}
        <NewParamControls {...props} />
      </div>

      {/* Footer Quick Export Action */}
      <div className="p-4 border-t border-slate-800 bg-[#090d16] shrink-0 font-mono">
        <button
          onClick={() => onExportSTL(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-98 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/20"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Export Watertight STL</span>
        </button>
      </div>
    </aside>
  );
};
