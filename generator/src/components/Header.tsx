import React, { useState, useRef, useEffect } from 'react';
import { PrimitiveType, PRIMITIVE_CATALOG, PrimitiveCategory } from '../generators/types';
import {
  Cog,
  CircleDot,
  CornerDownRight,
  Download,
  Cpu,
  ChevronDown,
  Layers,
  Wrench,
  Disc,
  Sliders,
  Box,
  Link,
  Zap,
  Droplet,
  FolderOpen,
  Wind,
  Gauge,
  Compass,
  Fan,
  RotateCw,
  SlidersHorizontal,
  Crosshair,
  Anchor,
  Activity,
  Maximize2,
} from 'lucide-react';

interface HeaderProps {
  activeModel: PrimitiveType;
  onSelectModel: (model: PrimitiveType) => void;
  onExportSTL: (binary: boolean) => void;
  isExporting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeModel,
  onSelectModel,
  onExportSTL,
  isExporting = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeMeta = PRIMITIVE_CATALOG.find((m) => m.id === activeModel) || PRIMITIVE_CATALOG[0];

  const getModelIcon = (id: PrimitiveType, className: string = 'w-4 h-4') => {
    switch (id) {
      case 'gt2_pulley':
      case 'timing_belt_idler':
        return <Disc className={className} />;
      case 'herringbone_gear':
      case 'bevel_gear':
      case 'worm_gear':
        return <Cog className={`${className} ${activeModel === id ? 'animate-spin-slow' : ''}`} />;
      case 'v_slot_wheel':
        return <RotateCw className={className} />;
      case 'shaft_coupler':
      case 'flexible_beam_coupler':
      case 'cable_chain_link':
      case 'ball_joint_rod_end':
        return <Link className={className} />;
      case 'knurled_knob':
      case 'thumb_screw_wheel':
        return <Sliders className={className} />;
      case 'servo_horn':
        return <Compass className={className} />;
      case 'lead_screw_nut_block':
        return <Zap className={className} />;
      case 'stepper_damper_plate':
        return <Activity className={className} />;
      case 'bearing_pillow_block':
        return <CircleDot className={className} />;
      case 'structural_bracket':
      case 'corner_cube_bracket':
        return <CornerDownRight className={className} />;
      case 'stepper_mount':
        return <Layers className={className} />;
      case 'linear_rod_clamp':
        return <Maximize2 className={className} />;
      case 'extrusion_end_cap':
      case 't_nut_slot':
        return <Box className={className} />;
      case 'cable_guide_anchor':
        return <Anchor className={className} />;
      case 'project_enclosure':
        return <Box className={className} />;
      case 'threaded_fastener':
        return <Wrench className={className} />;
      case 'hose_barb':
        return <Droplet className={className} />;
      case 'velocity_stack':
        return <Wind className={className} />;
      case 'centrifugal_impeller':
      case 'fan_duct_shroud':
        return <Fan className={className} />;
      case 'pcb_standoff_clip':
        return <SlidersHorizontal className={className} />;
      case 'endstop_mount':
        return <Crosshair className={className} />;
      case 'spool_holder_hub':
        return <Disc className={className} />;
      case 'dial_indicator_mount':
        return <Gauge className={className} />;
      default:
        return <Cog className={className} />;
    }
  };

  const categories: PrimitiveCategory[] = [
    'Motion & Power',
    'Structural & Mounts',
    'Fluid & Hardware',
    'Electronics & Sensors',
    'Tools & Shop',
  ];

  return (
    <header className="h-14 border-b border-slate-800 bg-[#0b1120] px-4 flex items-center justify-between z-30 shrink-0 relative">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm shadow-sky-500/10 hover:bg-sky-500/20 transition-all"
          title="Return to barebones3d.com"
        >
          <Cpu className="w-4 h-4" />
        </a>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wider text-slate-100 uppercase font-mono">
              Barebones<span className="text-sky-400">3D</span>
            </span>
            <span className="text-[10px] uppercase font-mono bg-sky-950/80 text-sky-300 border border-sky-800 px-1.5 py-0.5 rounded hidden sm:inline-block">
              Parametric CAD ({PRIMITIVE_CATALOG.length} Parts)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block font-mono">
            Zero-Bloat • 100% Client-Side • Watertight Manifold Meshes
          </p>
        </div>
      </div>

      {/* Model Selector Menu Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0e172a] hover:bg-[#16223d] border border-sky-500/40 text-slate-100 font-mono text-xs transition-all shadow-md shadow-sky-950/40"
        >
          <span className="text-sky-400">{getModelIcon(activeModel, 'w-4 h-4 text-sky-400')}</span>
          <div className="flex flex-col text-left">
            <span className="font-bold text-slate-100 leading-tight">{activeMeta.name}</span>
            <span className="text-[9px] text-sky-400 font-normal leading-none hidden sm:block">
              {activeMeta.category}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-1 ${
              menuOpen ? 'rotate-180 text-sky-400' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu Modal */}
        {menuOpen && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[340px] sm:w-[520px] max-h-[82vh] overflow-y-auto bg-[#090e1a] border border-slate-700/80 rounded-xl shadow-2xl shadow-black/80 z-50 p-3.5 font-mono backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <FolderOpen className="w-3.5 h-3.5" />
                Select Parametric Component ({PRIMITIVE_CATALOG.length})
              </span>
              <span className="text-[10px] text-slate-500">Watertight STLs</span>
            </div>

            <div className="space-y-4">
              {categories.map((cat) => {
                const items = PRIMITIVE_CATALOG.filter((m) => m.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 px-1 flex items-center justify-between">
                      <span>{cat}</span>
                      <span className="text-[9px] text-slate-500">({items.length})</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {items.map((item) => {
                        const isSelected = item.id === activeModel;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onSelectModel(item.id);
                              setMenuOpen(false);
                            }}
                            className={`flex items-start gap-2.5 p-2 rounded-lg text-left transition-all ${
                              isSelected
                                ? 'bg-sky-500/15 border border-sky-500/50 text-sky-200'
                                : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                            }`}
                          >
                            <div
                              className={`p-1.5 rounded-md mt-0.5 ${
                                isSelected
                                  ? 'bg-sky-500 text-slate-950 font-bold'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {getModelIcon(item.id, 'w-3.5 h-3.5')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs truncate text-slate-100">
                                  {item.name}
                                </span>
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded border uppercase font-mono ${
                                    item.isMathLofted
                                      ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                                      : 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300'
                                  }`}
                                >
                                  {item.isMathLofted ? 'Math Lofted' : 'CSG Solid'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                {item.shortDesc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Export Action */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onExportSTL(true)}
          disabled={isExporting}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
          title="Download binary STL file directly to your computer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Export .STL</span>
        </button>
      </div>
    </header>
  );
};
