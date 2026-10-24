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

      {/* Bevel Gear Presets */}
      {activeModel === 'bevel_gear' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('bevel_1to1_m15')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">1:1 Miter M1.5</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(20T, 45°, 5mm D)</span>
          </button>
          <button
            onClick={() => onApplyPreset('bevel_nema17_m10')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">NEMA 17 90° Drive</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M1.0, 24T, Hub)</span>
          </button>
          <button
            onClick={() => onApplyPreset('bevel_heavyduty_m20')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Heavy Duty M2.0</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(30T, 8mm Hex)</span>
          </button>
        </div>
      )}

      {/* Timing Belt Idler Presets */}
      {activeModel === 'timing_belt_idler' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('idler_gt2_608')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">GT2 608 Smooth</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(22mm OD, 608 Bearing)</span>
          </button>
          <button
            onClick={() => onApplyPreset('idler_mini_624')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Mini 624 Idler</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(14mm OD, 624 Bearing)</span>
          </button>
          <button
            onClick={() => onApplyPreset('idler_crowned_625')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Crowned 9mm Belt</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(18mm OD, 625 Bearing)</span>
          </button>
        </div>
      )}

      {/* V-Slot Wheel Presets */}
      {activeModel === 'v_slot_wheel' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('vwheel_openbuilds_std')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Standard 24mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(OpenBuilds 625 Dual Bearing)</span>
          </button>
          <button
            onClick={() => onApplyPreset('vwheel_mini_15')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Mini V-Wheel 15.5mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Compact Extrusion)</span>
          </button>
          <button
            onClick={() => onApplyPreset('vwheel_heavy_30')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Heavy CNC 30mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(High Load Ridge)</span>
          </button>
        </div>
      )}

      {/* Flexible Beam Coupler Presets */}
      {activeModel === 'flexible_beam_coupler' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('beam_5to8_nema17')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">NEMA 17 to T8 (5→8mm)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(19mm OD, 25mm L)</span>
          </button>
          <button
            onClick={() => onApplyPreset('beam_5to5_direct')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Direct 5→5mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Dual Motor Sync)</span>
          </button>
          <button
            onClick={() => onApplyPreset('beam_8to10_cnc')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">CNC Heavy 8→10mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(25mm OD, M4 Clamps)</span>
          </button>
        </div>
      )}

      {/* Worm Gear Presets */}
      {activeModel === 'worm_gear' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('worm_single_m10')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Single Start M1.0</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(High Reduction, 5mm D)</span>
          </button>
          <button
            onClick={() => onApplyPreset('worm_double_m15')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Double Start M1.5</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(High Speed, 8mm Bore)</span>
          </button>
          <button
            onClick={() => onApplyPreset('worm_micro_m08')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Micro Drive M0.8</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Micro Servo / 3mm Bore)</span>
          </button>
        </div>
      )}

      {/* Thumb Screw Wheel Presets */}
      {activeModel === 'thumb_screw_wheel' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('thumb_m3_bed')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M3 Bed Leveling</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(30mm, 6 Lobes)</span>
          </button>
          <button
            onClick={() => onApplyPreset('thumb_m4_knob')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M4 Clamp Knob</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(36mm, 8 Lobes)</span>
          </button>
          <button
            onClick={() => onApplyPreset('thumb_m5_jig')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M5 Jig Handle</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(45mm, 7 Lobes)</span>
          </button>
          <button
            onClick={() => onApplyPreset('thumb_m8_heavy')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M8 High Torque</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(55mm, Heavy Grip)</span>
          </button>
        </div>
      )}

      {/* Velocity Stack Presets */}
      {activeModel === 'velocity_stack' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('stack_carb_28')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">28mm Carb / Drone</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(28→55mm Flare)</span>
          </button>
          <button
            onClick={() => onApplyPreset('stack_itb_40')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">40mm ITB Flare</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(40→75mm, 2-Bolt Flange)</span>
          </button>
          <button
            onClick={() => onApplyPreset('stack_turbo_60')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">60mm High Flow</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(60→110mm Trumpet)</span>
          </button>
        </div>
      )}

      {/* Centrifugal Impeller Presets */}
      {activeModel === 'centrifugal_impeller' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('impeller_water_50')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">50mm Water Pump</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(6 Vanes, 5mm D-Shaft)</span>
          </button>
          <button
            onClick={() => onApplyPreset('impeller_blower_75')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">75mm Air Blower</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(10 Vanes, 8mm Bore)</span>
          </button>
          <button
            onClick={() => onApplyPreset('impeller_mini_35')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Mini Cooler 35mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(8 Vanes, 3mm Bore)</span>
          </button>
        </div>
      )}

      {/* Extrusion End Cap Presets */}
      {activeModel === 'extrusion_end_cap' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('endcap_2020')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2020 Standard</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(20×20mm, 5mm Hole)</span>
          </button>
          <button
            onClick={() => onApplyPreset('endcap_2040')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2040 Dual Rail</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(20×40mm, Flush)</span>
          </button>
          <button
            onClick={() => onApplyPreset('endcap_3030')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">3030 Heavy Frame</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(30×30mm, 8mm Hole)</span>
          </button>
        </div>
      )}

      {/* Drop-In T-Nut Presets */}
      {activeModel === 't_nut_slot' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('tnut_2020_m4')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2020 Slot 6 (M4)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Standard Roll-In)</span>
          </button>
          <button
            onClick={() => onApplyPreset('tnut_2020_m5')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2020 Slot 6 (M5)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Heavy Bracket Bolt)</span>
          </button>
          <button
            onClick={() => onApplyPreset('tnut_3030_m6')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">3030 Slot 8 (M6)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(High Load CNC)</span>
          </button>
        </div>
      )}

      {/* Corner Cube Presets */}
      {activeModel === 'corner_cube_bracket' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('corner_cube_2020_3way')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2020 3-Way XYZ</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(20mm Cube, M5 Socket)</span>
          </button>
          <button
            onClick={() => onApplyPreset('corner_cube_2020_2way')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2020 2-Way Corner</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(L-Bracket Style)</span>
          </button>
          <button
            onClick={() => onApplyPreset('corner_cube_3030_3way')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">3030 3-Way Cube</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(30mm, M6 Socket)</span>
          </button>
        </div>
      )}

      {/* Ball Joint Rod End Presets */}
      {activeModel === 'ball_joint_rod_end' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('ball_kossel_m4')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Kossel Delta Rod</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(10mm Ball, M4 Shank)</span>
          </button>
          <button
            onClick={() => onApplyPreset('ball_rc_m3')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">RC Steering (M3)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(8mm Ball, Pinch Slit)</span>
          </button>
          <button
            onClick={() => onApplyPreset('ball_cnc_m6')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Heavy CNC Link</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(16mm Ball, M6 Shank)</span>
          </button>
        </div>
      )}

      {/* Servo Horn Presets */}
      {activeModel === 'servo_horn' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('servo_single_25t')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Standard 25T Single</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(25mm Arm, 1.6mm Holes)</span>
          </button>
          <button
            onClick={() => onApplyPreset('servo_dual_25t')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Dual Arm 25T</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(35mm Symmetrical)</span>
          </button>
          <button
            onClick={() => onApplyPreset('servo_micro_21t')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Micro 9g (SG90)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(16mm Arm, 4.8mm Spline)</span>
          </button>
        </div>
      )}

      {/* Cable Guide Anchor Presets */}
      {activeModel === 'cable_guide_anchor' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('anchor_2020_m4')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2020 Extrusion Mount</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(20mm Spacing, M4)</span>
          </button>
          <button
            onClick={() => onApplyPreset('anchor_dragchain_m5')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Heavy Drag Chain</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(32mm Body, M5)</span>
          </button>
        </div>
      )}

      {/* Stepper Damper Plate Presets */}
      {activeModel === 'stepper_damper_plate' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('damper_nema17_serpentine')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">NEMA 17 Serpentine</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(42.3mm, 8mm Thick)</span>
          </button>
          <button
            onClick={() => onApplyPreset('damper_nema23_heavy')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">NEMA 23 High Torque</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(57mm, M4/M5)</span>
          </button>
        </div>
      )}

      {/* PCB Standoff Clip Presets */}
      {activeModel === 'pcb_standoff_clip' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('standoff_10mm_m3')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">10mm M3 Edge Snap</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(1.6mm FR4 Board)</span>
          </button>
          <button
            onClick={() => onApplyPreset('standoff_15mm_high')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">15mm High Clearance</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Under-Board Wire Space)</span>
          </button>
        </div>
      )}

      {/* Endstop Mount Presets */}
      {activeModel === 'endstop_mount' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('endstop_omron_2020')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">OMRON SS-5 on 2020</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(9.5mm Spacing, M4 Slot)</span>
          </button>
          <button
            onClick={() => onApplyPreset('endstop_kw11')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">KW11 Microswitch</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(10mm Spacing, M3)</span>
          </button>
          <button
            onClick={() => onApplyPreset('endstop_optical')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Optical Flag Sensor</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(19mm Hole Spacing)</span>
          </button>
        </div>
      )}

      {/* Fan Duct Shroud Presets */}
      {activeModel === 'fan_duct_shroud' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('duct_5015_standard')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">5015 Radial Blower</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(20×15 Inlet, 40° Angle)</span>
          </button>
          <button
            onClick={() => onApplyPreset('duct_4010_mini')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">4010 Compact Blower</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(16×11 Inlet, 35° Angle)</span>
          </button>
        </div>
      )}

      {/* Universal Spool Hub Presets */}
      {activeModel === 'spool_holder_hub' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('spool_std_1kg')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Standard 1kg Spool</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(52→72mm, 608 Bearing)</span>
          </button>
          <button
            onClick={() => onApplyPreset('spool_mini_250g')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Small 250g Spool</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(45→60mm, 608)</span>
          </button>
        </div>
      )}

      {/* Dial Indicator Mount Presets */}
      {activeModel === 'dial_indicator_mount' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('dial_8mm_2020')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">8mm Metric on 2020 Rail</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M4 Pinch Bolt)</span>
          </button>
          <button
            onClick={() => onApplyPreset('dial_38inch_2020')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">3/8" Imperial on 2020</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(9.525mm Stem)</span>
          </button>
          <button
            onClick={() => onApplyPreset('dial_rod_10mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">10mm Smooth Rod Clamp</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Gantry Tramming)</span>
          </button>
        </div>
      )}

      {/* Bearing Pillow Block Presets */}
      {activeModel === 'bearing_pillow_block' && (
        <div className="flex items-center gap-1.5 shrink-0">
          {(['608', '624', '625', '688'] as const).map((preset) => {
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

      {/* 20 Maker & Machine Components Presets */}
      {/* 1. Cycloidal Gear */}
      {activeModel === 'cycloidal_gear' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('cycloidal_10to1')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">10:1 Reducer</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(10 Lobe, 35mm PCD)</span>
          </button>
          <button
            onClick={() => onApplyPreset('cycloidal_20to1_heavy')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">20:1 Actuator</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(20 Lobe, 50mm PCD)</span>
          </button>
        </div>
      )}

      {/* 2. Geneva Mechanism */}
      {activeModel === 'geneva_mechanism' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('geneva_4slot_90deg')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">4-Station (90°)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(4 Slots, 35mm R)</span>
          </button>
          <button
            onClick={() => onApplyPreset('geneva_6slot_60deg')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">6-Station (60°)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(6 Slots, 45mm R)</span>
          </button>
        </div>
      )}

      {/* 3. Planetary Carrier */}
      {activeModel === 'planetary_carrier' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('planetary_3planet_nema17')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">3-Planet NEMA 17</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(3-Pin, 40mm PCD)</span>
          </button>
          <button
            onClick={() => onApplyPreset('planetary_4planet_heavy')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">4-Planet Heavy</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(4-Pin, 55mm PCD)</span>
          </button>
        </div>
      )}

      {/* 4. Rack and Pinion */}
      {activeModel === 'rack_and_pinion' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('rack_m10_150mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M1.0 150mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(150mm, 12mm W, M4)</span>
          </button>
          <button
            onClick={() => onApplyPreset('rack_m15_200mm_heavy')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M1.5 200mm Heavy</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(200mm, 18mm W, M5)</span>
          </button>
        </div>
      )}

      {/* 5. Scotch Yoke */}
      {activeModel === 'scotch_yoke' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('scotch_30mm_stroke')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">30mm Stroke</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(30mm Travel, 6mm Rod)</span>
          </button>
          <button
            onClick={() => onApplyPreset('scotch_50mm_stroke')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">50mm Stroke</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(50mm Travel, 8mm Rod)</span>
          </button>
        </div>
      )}

      {/* 6. DIN Rail Clip */}
      {activeModel === 'din_rail_clip' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('din_std_20mm_m3')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">35mm Rail (20mm W)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M3 Holes, Tab)</span>
          </button>
          <button
            onClick={() => onApplyPreset('din_wide_35mm_m4')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">35mm Rail (35mm W)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(M4 Holes, Heavy)</span>
          </button>
        </div>
      )}

      {/* 7. Hinge Leaf */}
      {activeModel === 'hinge_leaf' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('hinge_3barrel_m3')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">3-Knuckle 50mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(3-Barrel, M3 CS)</span>
          </button>
          <button
            onClick={() => onApplyPreset('hinge_5barrel_m4')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">5-Knuckle 80mm</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(5-Barrel, M4 CS)</span>
          </button>
        </div>
      )}

      {/* 8. Spindle Mount */}
      {activeModel === 'spindle_mount' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('spindle_52mm_300w')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">52mm DC Spindle</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(300W/500W, M5)</span>
          </button>
          <button
            onClick={() => onApplyPreset('spindle_65mm_makita')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">65mm Makita Router</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(RT0701C, M5)</span>
          </button>
          <button
            onClick={() => onApplyPreset('spindle_80mm_vfd')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">80mm Water-Cooled</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(1.5kW/2.2kW, M6)</span>
          </button>
        </div>
      )}

      {/* 9. Vibration Isolator */}
      {activeModel === 'vibration_isolator' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('isolator_d35_m4')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">D35 M4 Foot</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(35mm Base, TPU)</span>
          </button>
          <button
            onClick={() => onApplyPreset('isolator_d50_m6')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">D50 M6 Heavy</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(50mm Base, Machine)</span>
          </button>
        </div>
      )}

      {/* 10. Cross Slide Bracket */}
      {activeModel === 'cross_slide_bracket' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('cross_8mm_linear')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Dual 8mm Rods</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(8×8mm Orthogonal)</span>
          </button>
          <button
            onClick={() => onApplyPreset('cross_10mm_linear')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Dual 10mm Rods</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(10×10mm Joiner)</span>
          </button>
        </div>
      )}

      {/* 11. Venturi Nozzle */}
      {activeModel === 'venturi_nozzle' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('venturi_suction_d24')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">24mm Siphon Eductor</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(8mm Throat, 6mm Port)</span>
          </button>
          <button
            onClick={() => onApplyPreset('venturi_mixer_d32')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">32mm Industrial Mixer</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(12mm Throat, Flange)</span>
          </button>
        </div>
      )}

      {/* 12. Pipe Flange */}
      {activeModel === 'pipe_flange' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('flange_1inch_4bolt')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">1" Nominal 4-Bolt</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(33.4mm OD, O-Ring)</span>
          </button>
          <button
            onClick={() => onApplyPreset('flange_2inch_6bolt')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2" Nominal 6-Bolt</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(60.3mm OD, 6 Holes)</span>
          </button>
        </div>
      )}

      {/* 13. Peristaltic Pump Head */}
      {activeModel === 'peristaltic_pump_head' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('pump_3roller_608')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">3-Roller 608 NEMA 17</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(8mm Pin, 5mm D)</span>
          </button>
          <button
            onClick={() => onApplyPreset('pump_4roller_624')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">4-Roller 624 Micro</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(4mm Pin, 4 Rollers)</span>
          </button>
        </div>
      )}

      {/* 14. Cable Gland */}
      {activeModel === 'cable_gland' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('gland_pg7_4to7mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">PG7 / M12 (4-7mm)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(18mm Hex, 6 Collet)</span>
          </button>
          <button
            onClick={() => onApplyPreset('gland_m20_8to12mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">M20 (8-12mm)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(27mm Hex, Heavy)</span>
          </button>
        </div>
      )}

      {/* 15. Strain Relief Boot */}
      {activeModel === 'strain_relief_boot' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('boot_usb_4mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">USB Cable (4.5mm)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(35mm L, Spiral)</span>
          </button>
          <button
            onClick={() => onApplyPreset('boot_power_8mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Power Cable (8mm)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(50mm L, Heavy)</span>
          </button>
        </div>
      )}

      {/* 16. Filament Runout Sensor */}
      {activeModel === 'filament_runout_sensor' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('runout_175_kw11')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">1.75mm KW11 Bowden</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Microswitch, PC4-M6)</span>
          </button>
          <button
            onClick={() => onApplyPreset('runout_285_optical')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">2.85mm Optical</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(Photointerrupter)</span>
          </button>
        </div>
      )}

      {/* 17. Slip Ring Capsule */}
      {activeModel === 'slip_ring_capsule' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('slipring_22mm_flange')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">22mm Capsule</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(3-Bolt Flange, Slot)</span>
          </button>
          <button
            onClick={() => onApplyPreset('slipring_30mm_heavy')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">30mm Heavy Stator</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(4-Bolt Flange)</span>
          </button>
        </div>
      )}

      {/* 18. Piezo Mount */}
      {activeModel === 'piezo_mount' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('piezo_20mm_probe')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">20mm Piezo Probe</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(0.8mm Diaphragm)</span>
          </button>
          <button
            onClick={() => onApplyPreset('piezo_27mm_bed')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">27mm Bed Sensor</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(High-Sensitivity)</span>
          </button>
        </div>
      )}

      {/* 19. Drill Guide Block */}
      {activeModel === 'drill_guide_block' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('drill_guide_metric_3to10')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Metric 3-10mm (6-Bore)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(80mm L, V-Groove)</span>
          </button>
          <button
            onClick={() => onApplyPreset('drill_guide_compact_4to8')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Compact 4-8mm (4-Bore)</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(60mm L)</span>
          </button>
        </div>
      )}

      {/* 20. Chamfer Tool Holder */}
      {activeModel === 'chamfer_tool_holder' && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApplyPreset('chamfer_handle_32mm')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">3.2mm Swivel Blade</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(90mm L, 8 Flutes)</span>
          </button>
          <button
            onClick={() => onApplyPreset('chamfer_heavy_grip')}
            className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500/50 border border-slate-700 text-slate-300 transition-all text-xs"
          >
            <span className="font-bold text-sky-400">Ergonomic Palm Handle</span>
            <span className="text-[10px] text-slate-400 ml-1.5">(110mm L, 6 Flutes)</span>
          </button>
        </div>
      )}
    </div>
  );
};
