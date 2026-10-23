import React from 'react';
import {
  PrimitiveType,
  BearingPresetType,
  ScrewSizeType,
  BEARING_PRESET_DATA,
} from '../generators/types';
import { Sparkles } from 'lucide-react';

interface PresetsBarProps {
  activeModel: PrimitiveType;
  onApplyBearingPreset?: (preset: BearingPresetType) => void;
  onApplyScrewPreset?: (screw: ScrewSizeType) => void;
  onApplyGearPreset?: (presetName: string) => void;
  onApplyBracketPreset?: (presetName: string) => void;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({
  activeModel,
  onApplyBearingPreset,
  onApplyScrewPreset,
  onApplyGearPreset,
  onApplyBracketPreset,
}) => {
  return (
    <div className="bg-[#0b1325] border-b border-slate-800/80 px-4 py-2 flex items-center gap-3 overflow-x-auto text-xs font-mono shrink-0">
      <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>Hardware Presets:</span>
      </div>

      {activeModel === 'bearing_pillow_block' && (
        <div className="flex items-center gap-1.5 shrink-0">
          {(['608', '624', '688'] as const).map((preset) => {
            const data = BEARING_PRESET_DATA[preset];
            return (
              <button
                key={preset}
                onClick={() => onApplyBearingPreset?.(preset)}
                className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
                title={data.name}
              >
                <span className="font-bold text-sky-400">{preset}</span>
                <span className="text-[10px] text-slate-400 ml-1.5">
                  ({data.od}×{data.id}×{data.width}mm)
                </span>
              </button>
            );
          })}
        </div>
      )}

      {activeModel === 'herringbone_gear' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyGearPreset?.('stepper_drive')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="NEMA 17 Stepper Drive: M1.0, 20T, 5mm D-Shaft, 15mm width, 30° Helix"
          >
            <span className="font-bold text-sky-400">NEMA 17 Drive</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M1.0, 20T, 5mm D)</span>
          </button>
          <button
            onClick={() => onApplyGearPreset?.('compact_pinion')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="Compact Pinion: M0.8, 14T, 4mm Round bore, 12mm width, 25° Helix"
          >
            <span className="font-bold text-sky-400">Mini Pinion</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M0.8, 14T, 4mm)</span>
          </button>
          <button
            onClick={() => onApplyGearPreset?.('heavy_bull_gear')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="Heavy Bull Gear: M2.0, 36T, 8mm Hex bore, 25mm width, 30° Helix"
          >
            <span className="font-bold text-sky-400">Bull Gear</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M2.0, 36T, 8mm Hex)</span>
          </button>
        </div>
      )}

      {activeModel === 'structural_bracket' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyBracketPreset?.('compact_corner')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="Compact 25mm Corner Bracket, M3 screws"
          >
            <span className="font-bold text-sky-400">Compact 25mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(25×25×20mm, M3)</span>
          </button>
          <button
            onClick={() => onApplyBracketPreset?.('frame_gusset_m4')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="2020 Aluminum Frame Gusset, 45mm legs, M4 screws"
          >
            <span className="font-bold text-sky-400">2020 Extrusion Rib</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(45×45×30mm, M4)</span>
          </button>
          <button
            onClick={() => onApplyBracketPreset?.('heavy_duty_m5')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="Heavy Duty 75mm Bracket with triangular gusset, 4-hole grid, M5"
          >
            <span className="font-bold text-sky-400">Heavy Duty Shelf</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(75×75×40mm, M5)</span>
          </button>
        </div>
      )}

      {/* Global Fast Screw Size Selector */}
      <div className="ml-auto flex items-center gap-1 shrink-0 text-[11px] text-slate-400">
        <span className="hidden md:inline mr-1">Fast Fastener:</span>
        {(['M3', 'M4', 'M5', 'M6'] as ScrewSizeType[]).map((screw) => (
          <button
            key={screw}
            onClick={() => onApplyScrewPreset?.(screw)}
            className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
            title={`Switch clearance holes to ${screw}`}
          >
            {screw}
          </button>
        ))}
      </div>
    </div>
  );
};
