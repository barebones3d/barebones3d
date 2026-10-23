import React from 'react';
import {
  PrimitiveType,
  HerringboneGearParams,
  BearingPillowBlockParams,
  StructuralBracketParams,
  BoreType,
  MountingFlangeType,
  HolePatternType,
  ScrewSizeType,
} from '../generators/types';
import {
  Sliders,
  HelpCircle,
  Wrench,
  Download,
  Info,
  ChevronRight
} from 'lucide-react';

interface ParameterSidebarProps {
  activeModel: PrimitiveType;
  gearParams: HerringboneGearParams;
  pillowParams: BearingPillowBlockParams;
  bracketParams: StructuralBracketParams;
  onUpdateGearParams: (updates: Partial<HerringboneGearParams>) => void;
  onUpdatePillowParams: (updates: Partial<BearingPillowBlockParams>) => void;
  onUpdateBracketParams: (updates: Partial<StructuralBracketParams>) => void;
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
      // Clamp to hard bounds
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
          className="w-full"
        />
      </div>
    </div>
  );
};

export const ParameterSidebar: React.FC<ParameterSidebarProps> = ({
  activeModel,
  gearParams,
  pillowParams,
  bracketParams,
  onUpdateGearParams,
  onUpdatePillowParams,
  onUpdateBracketParams,
  onExportSTL,
}) => {
  return (
    <aside className="w-full md:w-[380px] h-full bg-[#0b1120] border-r border-slate-800 flex flex-col shrink-0 overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0b1325]">
        <div className="flex items-center gap-2 text-slate-200 font-mono text-sm font-bold uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Parametric Controls</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
          Live 60fps
        </span>
      </div>

      {/* Scrollable Parameters List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
        {/* ===================== HERRINGBONE GEAR CONTROLS ===================== */}
        {activeModel === 'herringbone_gear' && (
          <div className="space-y-5">
            {/* Gear Dimensions Section */}
            <div className="space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Involute Gear Geometry</span>
              </div>

              <NumericField
                label="Module (Tooth Size)"
                value={gearParams.module}
                min={0.5}
                max={5.0}
                step={0.1}
                unit="m"
                tooltip="Pitch diameter divided by number of teeth. Governs tooth size."
                onChange={(module) => onUpdateGearParams({ module })}
              />

              <NumericField
                label="Tooth Count (Z)"
                value={gearParams.toothCount}
                min={8}
                max={80}
                step={1}
                unit="teeth"
                tooltip="Number of gear teeth around the circumference."
                onChange={(toothCount) => onUpdateGearParams({ toothCount })}
              />

              {/* Pressure Angle Select */}
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-slate-300 font-medium block">Pressure Angle</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[14.5, 20.0, 25.0].map((pa) => (
                    <button
                      key={pa}
                      onClick={() => onUpdateGearParams({ pressureAngle: pa })}
                      className={`py-1.5 rounded border transition-all text-center ${
                        gearParams.pressureAngle === pa
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pa}°
                    </button>
                  ))}
                </div>
              </div>

              <NumericField
                label="Helix Angle"
                value={gearParams.helixAngle}
                min={15}
                max={45}
                step={1}
                unit="deg"
                tooltip="Angle of the helical tooth twist. 30° is standard for high strength."
                onChange={(helixAngle) => onUpdateGearParams({ helixAngle })}
              />

              <NumericField
                label="Face Width (Total Thickness)"
                value={gearParams.faceWidth}
                min={5}
                max={50}
                step={1}
                unit="mm"
                tooltip="Total gear height along the shaft axis."
                onChange={(faceWidth) => onUpdateGearParams({ faceWidth })}
              />
            </div>

            {/* Shaft Bore Section */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Center Shaft Bore</span>
              </div>

              {/* Bore Type Select */}
              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-slate-300 font-medium block">Bore Profile</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['round', 'd-shaft', 'hex'] as BoreType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdateGearParams({ boreType: type })}
                      className={`py-1.5 capitalize rounded border transition-all text-center ${
                        gearParams.boreType === type
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type === 'd-shaft' ? 'D-Shaft' : type}
                    </button>
                  ))}
                </div>
              </div>

              <NumericField
                label="Bore Diameter (0 = Solid)"
                value={gearParams.boreDiameter}
                min={0}
                max={Math.max(0, (gearParams.module * (gearParams.toothCount - 2.5) - 3))}
                step={0.5}
                unit="mm"
                tooltip="Shaft bore diameter. Set to 0 for a solid hub."
                onChange={(boreDiameter) => onUpdateGearParams({ boreDiameter })}
              />

              {gearParams.boreType === 'd-shaft' && gearParams.boreDiameter > 0 && (
                <NumericField
                  label="D-Shaft Flat Center Offset"
                  value={gearParams.dShaftFlatOffset}
                  min={0.5}
                  max={gearParams.boreDiameter / 2 - 0.2}
                  step={0.1}
                  unit="mm"
                  tooltip="Distance from center axis to the flat face (typically 2.0 to 2.25mm for 5mm motor shaft)."
                  onChange={(dShaftFlatOffset) => onUpdateGearParams({ dShaftFlatOffset })}
                />
              )}
            </div>

            {/* Calculated Involute Engineering Readout */}
            <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg text-xs font-mono space-y-1 text-slate-400">
              <div className="text-slate-300 font-semibold text-[11px] uppercase pb-1 border-b border-slate-800">
                Calculated Involute Diameters:
              </div>
              <div className="flex justify-between">
                <span>Pitch Diameter:</span>
                <span className="text-sky-400 font-bold">{(gearParams.module * gearParams.toothCount).toFixed(1)} mm</span>
              </div>
              <div className="flex justify-between">
                <span>Tip Diameter:</span>
                <span className="text-slate-200">{(gearParams.module * (gearParams.toothCount + 2)).toFixed(1)} mm</span>
              </div>
              <div className="flex justify-between">
                <span>Root Diameter:</span>
                <span className="text-slate-200">{(gearParams.module * (gearParams.toothCount - 2.5)).toFixed(1)} mm</span>
              </div>
            </div>
          </div>
        )}

        {/* ===================== BEARING PILLOW BLOCK CONTROLS ===================== */}
        {activeModel === 'bearing_pillow_block' && (
          <div className="space-y-5">
            {/* Bearing Specifications */}
            <div className="space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Bearing Pocket Geometry</span>
              </div>

              <NumericField
                label="Bearing Outer Diameter (OD)"
                value={pillowParams.bearingOD}
                min={8}
                max={60}
                step={0.5}
                unit="mm"
                onChange={(bearingOD) => onUpdatePillowParams({ bearingOD, preset: 'custom' })}
              />

              <NumericField
                label="Bearing Inner Diameter (ID)"
                value={pillowParams.bearingID}
                min={2}
                max={pillowParams.bearingOD - 4}
                step={0.5}
                unit="mm"
                onChange={(bearingID) => onUpdatePillowParams({ bearingID, preset: 'custom' })}
              />

              <NumericField
                label="Pocket Depth"
                value={pillowParams.pocketDepth}
                min={2}
                max={30}
                step={0.5}
                unit="mm"
                tooltip="Depth of the bearing recess pocket."
                onChange={(pocketDepth) => onUpdatePillowParams({ pocketDepth })}
              />

              <NumericField
                label="Housing Wall Thickness"
                value={pillowParams.wallThickness}
                min={2}
                max={15}
                step={0.5}
                unit="mm"
                tooltip="Radial thickness around the bearing pocket."
                onChange={(wallThickness) => onUpdatePillowParams({ wallThickness })}
              />

              {/* Retention Lip Switch */}
              <div className="bg-[#1e293b]/70 p-3 rounded-lg border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-200">Rear Retention Lip</span>
                  <input
                    type="checkbox"
                    checked={pillowParams.retentionLip}
                    onChange={(e) => onUpdatePillowParams({ retentionLip: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>
                {pillowParams.retentionLip && (
                  <div className="pt-2 space-y-3 border-t border-slate-700/60">
                    <NumericField
                      label="Lip Ledge Thickness"
                      value={pillowParams.lipThickness}
                      min={0.8}
                      max={5}
                      step={0.2}
                      unit="mm"
                      onChange={(lipThickness) => onUpdatePillowParams({ lipThickness })}
                    />
                    <NumericField
                      label="Lip Radial Overhang"
                      value={pillowParams.lipOverhang}
                      min={0.4}
                      max={3.0}
                      step={0.1}
                      unit="mm"
                      onChange={(lipOverhang) => onUpdatePillowParams({ lipOverhang })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Mounting Flanges */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Mounting Configuration</span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-slate-300 font-medium block">Mounting Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['none', 'two-sided', 'bottom-foot'] as MountingFlangeType[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => onUpdatePillowParams({ mountingFlanges: style })}
                      className={`py-1.5 capitalize rounded border transition-all text-center text-[11px] ${
                        pillowParams.mountingFlanges === style
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {style === 'two-sided' ? '2-Ears' : style === 'bottom-foot' ? 'Base Foot' : 'Cartridge'}
                    </button>
                  ))}
                </div>
              </div>

              {pillowParams.mountingFlanges !== 'none' && (
                <>
                  <div className="space-y-1.5 font-mono text-xs">
                    <label className="text-slate-300 font-medium block">Mount Screw Size</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['M3', 'M4', 'M5', 'M6'] as ScrewSizeType[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => onUpdatePillowParams({ mountHoleSize: s })}
                          className={`py-1.5 rounded border transition-all text-center font-bold ${
                            pillowParams.mountHoleSize === s
                              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                              : 'bg-[#1e293b] border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <NumericField
                    label="Flange Length / Span"
                    value={pillowParams.flangeLength}
                    min={10}
                    max={40}
                    step={1}
                    unit="mm"
                    onChange={(flangeLength) => onUpdatePillowParams({ flangeLength })}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* ===================== STRUCTURAL BRACKET CONTROLS ===================== */}
        {activeModel === 'structural_bracket' && (
          <div className="space-y-5">
            {/* L-Bracket Dimensions */}
            <div className="space-y-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Bracket Profile</span>
              </div>

              <NumericField
                label="Base Leg Length (X)"
                value={bracketParams.leg1Length}
                min={15}
                max={150}
                step={1}
                unit="mm"
                onChange={(leg1Length) => onUpdateBracketParams({ leg1Length })}
              />

              <NumericField
                label="Upright Leg Length (Y)"
                value={bracketParams.leg2Length}
                min={15}
                max={150}
                step={1}
                unit="mm"
                onChange={(leg2Length) => onUpdateBracketParams({ leg2Length })}
              />

              <NumericField
                label="Bracket Width (Z)"
                value={bracketParams.width}
                min={10}
                max={100}
                step={1}
                unit="mm"
                onChange={(width) => onUpdateBracketParams({ width })}
              />

              <NumericField
                label="Wall Thickness"
                value={bracketParams.thickness}
                min={2}
                max={15}
                step={0.5}
                unit="mm"
                onChange={(thickness) => onUpdateBracketParams({ 
                  thickness, 
                  ...(bracketParams.leg1Thickness !== undefined ? { leg1Thickness: thickness, leg2Thickness: thickness } : {}) 
                })}
              />

              {/* Optional Independent Leg Thickness Controls */}
              <div className="bg-[#1e293b]/50 p-2.5 rounded border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Independent Leg Thicknesses</span>
                  <input
                    type="checkbox"
                    checked={bracketParams.leg1Thickness !== undefined}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onUpdateBracketParams({
                          leg1Thickness: bracketParams.thickness,
                          leg2Thickness: bracketParams.thickness,
                        });
                      } else {
                        onUpdateBracketParams({
                          leg1Thickness: undefined,
                          leg2Thickness: undefined,
                        });
                      }
                    }}
                    className="w-3.5 h-3.5 accent-sky-500 cursor-pointer"
                  />
                </div>
                {bracketParams.leg1Thickness !== undefined && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/50">
                    <NumericField
                      label="Base Leg Thick"
                      value={bracketParams.leg1Thickness ?? bracketParams.thickness}
                      min={2}
                      max={15}
                      step={0.5}
                      unit="mm"
                      onChange={(leg1Thickness) => onUpdateBracketParams({ leg1Thickness })}
                    />
                    <NumericField
                      label="Upright Leg Thick"
                      value={bracketParams.leg2Thickness ?? bracketParams.thickness}
                      min={2}
                      max={15}
                      step={0.5}
                      unit="mm"
                      onChange={(leg2Thickness) => onUpdateBracketParams({ leg2Thickness })}
                    />
                  </div>
                )}
              </div>

              {/* Gusset Reinforcement */}
              <div className="bg-[#1e293b]/70 p-3 rounded-lg border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-200">Triangular Gusset Rib</span>
                  <input
                    type="checkbox"
                    checked={bracketParams.gussetReinforcement}
                    onChange={(e) => onUpdateBracketParams({ gussetReinforcement: e.target.checked })}
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>
                {bracketParams.gussetReinforcement && (
                  <div className="pt-2 border-t border-slate-700/60">
                    <NumericField
                      label="Gusset Rib Thickness"
                      value={bracketParams.gussetThickness}
                      min={2}
                      max={Math.min(bracketParams.width - 2, 12)}
                      step={0.5}
                      unit="mm"
                      onChange={(gussetThickness) => onUpdateBracketParams({ gussetThickness })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Fastener Hole Pattern */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-sky-400" />
                <span>Fasteners & Holes</span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                <label className="text-slate-300 font-medium block">Hole Pattern</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['four-grid', 'two-inline', 'single', 'none'] as HolePatternType[]).map((pattern) => (
                    <button
                      key={pattern}
                      onClick={() => onUpdateBracketParams({ holePattern: pattern })}
                      className={`py-1.5 rounded border transition-all text-center text-xs font-mono ${
                        bracketParams.holePattern === pattern
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                          : 'bg-[#1e293b] border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pattern === 'four-grid'
                        ? '4 Holes (2x2)'
                        : pattern === 'two-inline'
                        ? '2 Holes (1/leg)'
                        : pattern === 'single'
                        ? '1 per Side'
                        : 'No Holes'}
                    </button>
                  ))}
                </div>
              </div>

              {bracketParams.holePattern !== 'none' && (
                <>
                  <div className="space-y-1.5 font-mono text-xs">
                    <label className="text-slate-300 font-medium block">Screw Clearance Size</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['M3', 'M4', 'M5', 'M6'] as ScrewSizeType[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => onUpdateBracketParams({ screwSize: s })}
                          className={`py-1.5 rounded border transition-all text-center font-bold ${
                            bracketParams.screwSize === s
                              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                              : 'bg-[#1e293b] border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[#1e293b] rounded border border-slate-700 text-xs font-mono">
                    <span className="text-slate-300">90° Flush Countersink</span>
                    <input
                      type="checkbox"
                      checked={bracketParams.hasCountersink}
                      onChange={(e) => onUpdateBracketParams({ hasCountersink: e.target.checked })}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ===================== GLOBAL 3D PRINT TOLERANCE SECTION ===================== */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            <span>3D Print Tolerance Offset</span>
          </div>

          {activeModel === 'herringbone_gear' && (
            <NumericField
              label="Hole / Bore Compensation"
              value={gearParams.printer_compensation}
              min={-0.2}
              max={0.4}
              step={0.05}
              unit="mm"
              tooltip="Adds radial clearance to internal bores to account for FDM extrusion spread."
              onChange={(printer_compensation) => onUpdateGearParams({ printer_compensation })}
            />
          )}

          {activeModel === 'bearing_pillow_block' && (
            <NumericField
              label="Hole / Bore Compensation"
              value={pillowParams.printer_compensation}
              min={-0.2}
              max={0.4}
              step={0.05}
              unit="mm"
              tooltip="Adds radial clearance to bearing pockets and screw holes (+0.15mm default for press-fit)."
              onChange={(printer_compensation) => onUpdatePillowParams({ printer_compensation })}
            />
          )}

          {activeModel === 'structural_bracket' && (
            <NumericField
              label="Hole / Bore Compensation"
              value={bracketParams.printer_compensation}
              min={-0.2}
              max={0.4}
              step={0.05}
              unit="mm"
              tooltip="Expands screw clearance holes so screws glide in smoothly without binding."
              onChange={(printer_compensation) => onUpdateBracketParams({ printer_compensation })}
            />
          )}

          <p className="text-[10px] text-slate-400 font-mono leading-relaxed bg-[#090d16] p-2.5 rounded border border-slate-800">
            <Info className="w-3 h-3 text-sky-400 inline mr-1 -mt-0.5" />
            Recommended: <strong className="text-slate-200">+0.15mm</strong> for standard 0.4mm nozzle PLA. Use <strong className="text-slate-200">+0.20mm</strong> for PETG or tight press-fit pins.
          </p>
        </div>
      </div>

      {/* Direct Instant STL Download Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#090d16] shrink-0">
        <button
          onClick={() => onExportSTL(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold text-xs font-mono transition-all shadow-lg shadow-sky-500/20"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download .STL File</span>
        </button>
      </div>
    </aside>
  );
};
