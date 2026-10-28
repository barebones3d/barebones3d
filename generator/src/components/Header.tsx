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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrimitiveCategory | 'All'>('All');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (menuOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
      setSelectedCategory('All');
    }
  }, [menuOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

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
      case 'piezo_mount':
        return <Gauge className={className} />;
      case 'cycloidal_gear':
        return <Cog className={`${className} ${activeModel === id ? 'animate-spin-slow' : ''}`} />;
      case 'geneva_mechanism':
      case 'peristaltic_pump_head':
        return <RotateCw className={className} />;
      case 'planetary_carrier':
      case 'slip_ring_capsule':
        return <Disc className={className} />;
      case 'rack_and_pinion':
        return <SlidersHorizontal className={className} />;
      case 'scotch_yoke':
      case 'vibration_isolator':
        return <Activity className={className} />;
      case 'din_rail_clip':
        return <Anchor className={className} />;
      case 'hinge_leaf':
      case 'strain_relief_boot':
        return <Link className={className} />;
      case 'spindle_mount':
      case 'pipe_flange':
        return <CircleDot className={className} />;
      case 'cross_slide_bracket':
        return <Maximize2 className={className} />;
      case 'venturi_nozzle':
        return <Wind className={className} />;
      case 'cable_gland':
      case 'chamfer_tool_holder':
        return <Wrench className={className} />;
      case 'filament_runout_sensor':
        return <Crosshair className={className} />;
      case 'drill_guide_block':
        return <Box className={className} />;
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

  // Filter components by active category and search text
  const filteredComponents = PRIMITIVE_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.shortDesc.toLowerCase().includes(query) ||
      (item.isMathLofted ? 'math lofted' : 'csg solid').includes(query);
    return matchesCategory && matchesSearch;
  });

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

      {/* Model Selector Dropdown & Catalog Button at Top Center */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <div className="absolute left-2.5 pointer-events-none text-sky-400">
            {getModelIcon(activeModel, 'w-4 h-4')}
          </div>
          <select
            value={activeModel}
            onChange={(e) => onSelectModel(e.target.value as PrimitiveType)}
            className="bg-[#0e172a] hover:bg-[#16223d] border border-sky-500/50 hover:border-sky-400 text-slate-100 font-mono text-xs rounded-lg pl-8 pr-8 py-1.5 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all font-bold shadow-md shadow-sky-950/40"
            title={`Select parametric 3D model (${PRIMITIVE_CATALOG.length} parts)`}
          >
            {categories.map((cat) => (
              <optgroup key={cat} label={`── ${cat.toUpperCase()} ──`} className="bg-[#0b1120] text-sky-400 font-bold">
                {PRIMITIVE_CATALOG.filter((m) => m.category === cat).map((item) => (
                  <option key={item.id} value={item.id} className="bg-[#0e172a] text-slate-200 font-medium py-1">
                    {item.name} ({item.isMathLofted ? 'Math Loft' : 'CSG'})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-sky-400 absolute right-2.5 pointer-events-none" />
        </div>

        {/* Visual Catalog / Search Modal Trigger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e172a] hover:bg-[#16223d] border border-slate-700 hover:border-sky-500/60 text-slate-300 hover:text-sky-300 font-mono text-xs transition-all cursor-pointer shadow-sm"
          title={`Browse visual catalog of all ${PRIMITIVE_CATALOG.length} parts with search and filtering`}
        >
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Catalog</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-sky-950 border border-sky-800 text-sky-300 font-mono font-bold">
            {PRIMITIVE_CATALOG.length}
          </span>
        </button>
      </div>

        {/* Full-Screen Backdrop Modal Dialog for All Components */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="w-full max-w-4xl max-h-[90vh] bg-[#090e1a] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black p-4 sm:p-6 font-mono flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm tracking-wide">
                  <FolderOpen className="w-4 h-4" />
                  <span>Parametric Component Catalog ({PRIMITIVE_CATALOG.length} Parts)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono hidden sm:inline-block">
                    Press ESC to close
                  </span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Search & Category Filter Controls */}
              <div className="space-y-3 pb-3 border-b border-slate-800/80 shrink-0">
                {/* Search Input */}
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${PRIMITIVE_CATALOG.length} parts by name, category, or spec (e.g. gear, t-nut, blower, 2020)...`}
                    className="w-full bg-[#0e172a] border border-slate-700 focus:border-sky-500 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === 'All'
                        ? 'bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/20'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    All Parts ({PRIMITIVE_CATALOG.length})
                  </button>
                  {categories.map((cat) => {
                    const count = PRIMITIVE_CATALOG.filter((m) => m.category === cat).length;
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/20'
                            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable 2-Column Component Cards Grid */}
              <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
                {filteredComponents.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No components found matching "{searchQuery}". Try searching for "gear", "screw", "bearing", or "bracket".
                  </div>
                ) : (
                  categories.map((cat) => {
                    const items = filteredComponents.filter((m) => m.category === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-2">
                        <div className="text-[11px] uppercase font-bold text-sky-400/90 tracking-wider px-1 flex items-center justify-between border-b border-slate-800 pb-1">
                          <span>{cat}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {items.length} {items.length === 1 ? 'part' : 'parts'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map((item) => {
                            const isSelected = item.id === activeModel;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  onSelectModel(item.id);
                                  setMenuOpen(false);
                                }}
                                className={`flex items-start gap-3 p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                                  isSelected
                                    ? 'bg-sky-500/20 border-sky-500 text-sky-200 shadow-md shadow-sky-950/50'
                                    : 'bg-[#0e1628]/80 hover:bg-[#16223d] border-slate-800/80 hover:border-sky-500/40 text-slate-300'
                                }`}
                              >
                                <div
                                  className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                                    isSelected
                                      ? 'bg-sky-500 text-slate-950 font-bold'
                                      : 'bg-slate-800 text-slate-400 group-hover:text-sky-400'
                                  }`}
                                >
                                  {getModelIcon(item.id, 'w-4 h-4')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <span
                                      className={`font-bold text-xs truncate ${
                                        isSelected ? 'text-sky-300' : 'text-slate-100'
                                      }`}
                                    >
                                      {item.name}
                                    </span>
                                    <span
                                      className={`text-[8px] px-1 py-0.2 rounded border uppercase font-mono shrink-0 ${
                                        item.isMathLofted
                                          ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                                          : 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300'
                                      }`}
                                    >
                                      {item.isMathLofted ? 'Math Lofted' : 'CSG Solid'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                                    {item.shortDesc}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer with Active Model Status */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>Currently Loaded:</span>
                  <span className="font-bold text-sky-400">{activeMeta.name}</span>
                  <span className="text-[10px] text-slate-500">({activeMeta.category})</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Showing {filteredComponents.length} of {PRIMITIVE_CATALOG.length} models
                </div>
              </div>
            </div>
          </div>
        )}

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
