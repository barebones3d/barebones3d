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
  onApplyPreset: (presetId: string) => void;
  onApplyBearingPreset?: (preset: BearingPresetType) => void;
  onApplyScrewPreset?: (screw: ScrewSizeType) => void;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({
  activeModel,
  onApplyPreset,
  onApplyBearingPreset,
}) => {
  return (
    <div className="bg-[#0b1325] border-b border-slate-800/80 px-4 py-2 flex items-center gap-3 overflow-x-auto text-xs font-mono shrink-0 scrollbar-none">
      <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <span>Hardware Presets:</span>
      </div>

      {/* GT2 Pulley Presets */}
      {activeModel === 'gt2_pulley' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('gt2_16t_5mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="GT2 16 Tooth, 5mm round bore, 6mm belt with flanges"
          >
            <span className="font-bold text-sky-400">16T Stepper</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(16T, 5mm, 6mm W)</span>
          </button>
          <button
            onClick={() => onApplyPreset('gt2_20t_dshaft')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="GT2 20 Tooth, 5mm D-Shaft, 6mm belt, hub collar"
          >
            <span className="font-bold text-sky-400">20T NEMA 17</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(20T, 5mm D, Hub)</span>
          </button>
          <button
            onClick={() => onApplyPreset('gt2_36t_8mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="GT2 36 Tooth, 8mm bore, 9mm belt reduction drive"
          >
            <span className="font-bold text-sky-400">36T Reduction</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(36T, 8mm, 9mm W)</span>
          </button>
          <button
            onClick={() => onApplyPreset('gt2_60t_bull')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
            title="GT2 60 Tooth, 8mm hex bore, 9mm belt high-torque gear"
          >
            <span className="font-bold text-sky-400">60T High-Torque</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(60T, 8mm Hex)</span>
          </button>
        </div>
      )}

      {/* Herringbone Gear Presets */}
      {activeModel === 'herringbone_gear' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('stepper_drive')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">NEMA 17 Drive</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M1.0, 20T, 5mm D)</span>
          </button>
          <button
            onClick={() => onApplyPreset('compact_pinion')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Mini Pinion</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M0.8, 14T, 4mm)</span>
          </button>
          <button
            onClick={() => onApplyPreset('heavy_bull_gear')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Bull Gear</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M2.0, 36T, 8mm Hex)</span>
          </button>
        </div>
      )}

      {/* Knurled Knob Presets */}
      {activeModel === 'knurled_knob' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('knob_pot_fluted')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Potentiometer 6mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(20mm, Straight Flute)</span>
          </button>
          <button
            onClick={() => onApplyPreset('knob_diamond_pointer')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Encoder Dial</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(26mm, Diamond + Pointer)</span>
          </button>
          <button
            onClick={() => onApplyPreset('knob_bed_level')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Bed Level Thumbwheel</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(45mm, Ribbed Grip)</span>
          </button>
        </div>
      )}

      {/* Threaded Fastener Presets */}
      {activeModel === 'threaded_fastener' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('bolt_m4_16')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M4 × 16mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Socket Cap Bolt)</span>
          </button>
          <button
            onClick={() => onApplyPreset('bolt_m6_25')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M6 × 25mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Hex Head Bolt)</span>
          </button>
          <button
            onClick={() => onApplyPreset('bolt_m8_thumb')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M8 Thumb Screw</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Knurled Head)</span>
          </button>
          <button
            onClick={() => onApplyPreset('nut_m8')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M8 Hex Nut</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Internal Thread)</span>
          </button>
        </div>
      )}

      {/* Shaft Coupler Presets */}
      {activeModel === 'shaft_coupler' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('coupler_5_to_8')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">5mm → 8mm Clamp</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(NEMA17 to T8 Lead)</span>
          </button>
          <button
            onClick={() => onApplyPreset('coupler_5_to_5')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">5mm → 5mm Beam</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Direct Stepper Flex)</span>
          </button>
          <button
            onClick={() => onApplyPreset('coupler_8_to_10')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">8mm → 10mm Heavy</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Ballscrew Clamp)</span>
          </button>
        </div>
      )}

      {/* Project Enclosure Presets */}
      {activeModel === 'project_enclosure' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('enc_arduino')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Arduino Uno</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(75×55×25mm, 4 Standoffs)</span>
          </button>
          <button
            onClick={() => onApplyPreset('enc_raspberry_pi')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Raspberry Pi 4</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(92×62×30mm, Cable Port)</span>
          </button>
          <button
            onClick={() => onApplyPreset('enc_esp32')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">ESP32 DevKit</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(60×35×20mm)</span>
          </button>
        </div>
      )}

      {/* Stepper Mount Presets */}
      {activeModel === 'stepper_mount' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('stepper_nema17')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">NEMA 17 Bracket</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(42.3mm, Tension Slots)</span>
          </button>
          <button
            onClick={() => onApplyPreset('stepper_nema23')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">NEMA 23 Heavy</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(56.4mm, M5 Gusseted)</span>
          </button>
          <button
            onClick={() => onApplyPreset('stepper_nema14')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">NEMA 14 Mini</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(35.2mm, Compact)</span>
          </button>
        </div>
      )}

      {/* Linear Rod Clamp Presets */}
      {activeModel === 'linear_rod_clamp' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('clamp_sk8')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">SK8 (8mm Rod)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(42×32mm Pedestal)</span>
          </button>
          <button
            onClick={() => onApplyPreset('clamp_sk10')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">SK10 (10mm Rod)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(48×36mm Pedestal)</span>
          </button>
          <button
            onClick={() => onApplyPreset('clamp_sk12')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">SK12 (12mm Rod)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(54×40mm Pedestal)</span>
          </button>
        </div>
      )}

      {/* Hose Barb Presets */}
      {activeModel === 'hose_barb' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('barb_6mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">6mm (1/4") Coupler</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Pneumatics / Aquarium)</span>
          </button>
          <button
            onClick={() => onApplyPreset('barb_reducer_8_6')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">8mm → 6mm Reducer</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Liquid Cooling)</span>
          </button>
          <button
            onClick={() => onApplyPreset('barb_12mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">12mm (1/2") Flow</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(High-Volume Tubing)</span>
          </button>
        </div>
      )}

      {/* T8 Leadscrew Nut Block Presets */}
      {activeModel === 'lead_screw_nut_block' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('nut_block_t8_std')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">T8 Standard Nut</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(22mm Flange, 16mm PCD)</span>
          </button>
          <button
            onClick={() => onApplyPreset('nut_block_t8_antibacklash')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">T8 Anti-Backlash</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Deep Pocket Preload)</span>
          </button>
        </div>
      )}

      {/* Cable Drag Chain Presets */}
      {activeModel === 'cable_chain_link' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('chain_10x11')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">10 × 11mm Compact</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Ender 3 / Toolhead)</span>
          </button>
          <button
            onClick={() => onApplyPreset('chain_15x20')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">15 × 20mm Medium</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(CNC / Laser Bed)</span>
          </button>
        </div>
      )}

      {/* Bearing Pillow Block Presets */}
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

      {/* Structural Bracket Presets */}
      {activeModel === 'structural_bracket' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('compact_corner')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Compact 25mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(25×25×20mm, M3)</span>
          </button>
          <button
            onClick={() => onApplyPreset('frame_gusset_m4')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2020 Extrusion Rib</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(45×45×30mm, M4)</span>
          </button>
          <button
            onClick={() => onApplyPreset('heavy_duty_m5')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Heavy Duty M5</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(75×75×40mm)</span>
          </button>
        </div>
      )}
    </div>
  );
};
