import React from 'react';
import { PrimitiveType } from '../generators/types';
import {
  Cog,
  CircleDot,
  CornerDownRight,
  Download,
  Cpu,
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
  return (
    <header className="h-14 border-b border-slate-800 bg-[#0b1120] px-4 flex items-center justify-between z-20 shrink-0">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm shadow-sky-500/10">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wider text-slate-100 uppercase font-mono">
              Barebones<span className="text-sky-400">3D</span>
            </span>
            <span className="text-[10px] uppercase font-mono bg-sky-950/80 text-sky-300 border border-sky-800 px-1.5 py-0.5 rounded">
              Parametric CAD
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
            Zero-Bloat • 100% Client-Side • Manifold Meshes
          </p>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex items-center bg-[#090d16] p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onSelectModel('herringbone_gear')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
            activeModel === 'herringbone_gear'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cog className={`w-3.5 h-3.5 ${activeModel === 'herringbone_gear' ? 'animate-spin-slow' : ''}`} />
          <span>Herringbone Gear</span>
        </button>

        <button
          onClick={() => onSelectModel('bearing_pillow_block')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
            activeModel === 'bearing_pillow_block'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>Pillow Block</span>
        </button>

        <button
          onClick={() => onSelectModel('structural_bracket')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
            activeModel === 'structural_bracket'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <CornerDownRight className="w-3.5 h-3.5" />
          <span>L-Bracket</span>
        </button>
      </div>

      {/* Export Action */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onExportSTL(true)}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
          title="Download binary STL file directly to your computer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download .STL</span>
        </button>
      </div>
    </header>
  );
};
