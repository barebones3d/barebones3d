import React, { useState, useMemo, useCallback } from 'react';
import {
  PrimitiveType,
  HerringboneGearParams,
  BearingPillowBlockParams,
  StructuralBracketParams,
  GeneratedMeshResult,
  BearingPresetType,
  ScrewSizeType,
  BEARING_PRESET_DATA,
} from './generators/types';
import { generateHerringboneGear } from './generators/herringboneGear';
import { generateBearingPillowBlock } from './generators/bearingPillowBlock';
import { generateStructuralBracket } from './generators/structuralBracket';
import { exportSTL } from './utils/stlExport';
import { Header } from './components/Header';
import { PresetsBar } from './components/PresetsBar';
import { ParameterSidebar } from './components/ParameterSidebar';
import { Viewport } from './components/Viewport';

export const App: React.FC = () => {
  // Current active primitive model
  const [activeModel, setActiveModel] = useState<PrimitiveType>('herringbone_gear');

  // --- Initial Parameters ---
  const [gearParams, setGearParams] = useState<HerringboneGearParams>({
    module: 1.5,
    toothCount: 24,
    pressureAngle: 20.0,
    helixAngle: 30,
    faceWidth: 16,
    boreDiameter: 5.0,
    boreType: 'd-shaft',
    dShaftFlatOffset: 2.1,
    printer_compensation: 0.15,
  });

  const [pillowParams, setPillowParams] = useState<BearingPillowBlockParams>({
    preset: '608',
    bearingOD: 22,
    bearingID: 8,
    bearingWidth: 7,
    pocketDepth: 7,
    isThroughHole: false,
    wallThickness: 4.5,
    retentionLip: true,
    lipThickness: 1.5,
    lipOverhang: 1.0,
    mountingFlanges: 'two-sided',
    mountHoleSize: 'M4',
    flangeLength: 16,
    printer_compensation: 0.15,
  });

  const [bracketParams, setBracketParams] = useState<StructuralBracketParams>({
    leg1Length: 45,
    leg2Length: 45,
    width: 30,
    thickness: 4.5,
    gussetReinforcement: true,
    gussetThickness: 4.0,
    holePattern: 'four-grid',
    screwSize: 'M4',
    hasCountersink: false,
    printer_compensation: 0.15,
  });

  // State update handlers
  const handleUpdateGearParams = useCallback((updates: Partial<HerringboneGearParams>) => {
    setGearParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdatePillowParams = useCallback((updates: Partial<BearingPillowBlockParams>) => {
    setPillowParams((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleUpdateBracketParams = useCallback((updates: Partial<StructuralBracketParams>) => {
    setBracketParams((prev) => ({ ...prev, ...updates }));
  }, []);

  // Preset Handlers
  const handleApplyBearingPreset = useCallback((preset: BearingPresetType) => {
    if (preset === 'custom') return;
    const data = BEARING_PRESET_DATA[preset];
    setPillowParams((prev) => ({
      ...prev,
      preset,
      bearingOD: data.od,
      bearingID: data.id,
      bearingWidth: data.width,
      pocketDepth: data.width,
    }));
  }, []);

  const handleApplyScrewPreset = useCallback((screw: ScrewSizeType) => {
    if (activeModel === 'bearing_pillow_block') {
      setPillowParams((prev) => ({ ...prev, mountHoleSize: screw }));
    } else if (activeModel === 'structural_bracket') {
      setBracketParams((prev) => ({ ...prev, screwSize: screw }));
    }
  }, [activeModel]);

  const handleApplyGearPreset = useCallback((presetName: string) => {
    if (presetName === 'stepper_drive') {
      setGearParams({
        module: 1.0,
        toothCount: 20,
        pressureAngle: 20.0,
        helixAngle: 30,
        faceWidth: 15,
        boreDiameter: 5.0,
        boreType: 'd-shaft',
        dShaftFlatOffset: 2.1,
        printer_compensation: 0.15,
      });
    } else if (presetName === 'compact_pinion') {
      setGearParams({
        module: 0.8,
        toothCount: 14,
        pressureAngle: 20.0,
        helixAngle: 25,
        faceWidth: 12,
        boreDiameter: 4.0,
        boreType: 'round',
        dShaftFlatOffset: 1.5,
        printer_compensation: 0.15,
      });
    } else if (presetName === 'heavy_bull_gear') {
      setGearParams({
        module: 2.0,
        toothCount: 36,
        pressureAngle: 20.0,
        helixAngle: 30,
        faceWidth: 25,
        boreDiameter: 10.0,
        boreType: 'hex',
        dShaftFlatOffset: 4.0,
        printer_compensation: 0.15,
      });
    }
  }, []);

  const handleApplyBracketPreset = useCallback((presetName: string) => {
    if (presetName === 'compact_corner') {
      setBracketParams({
        leg1Length: 25,
        leg2Length: 25,
        width: 20,
        thickness: 3.5,
        gussetReinforcement: false,
        gussetThickness: 3.0,
        holePattern: 'single',
        screwSize: 'M3',
        hasCountersink: true,
        printer_compensation: 0.15,
      });
    } else if (presetName === 'frame_gusset_m4') {
      setBracketParams({
        leg1Length: 45,
        leg2Length: 45,
        width: 30,
        thickness: 4.5,
        gussetReinforcement: true,
        gussetThickness: 4.0,
        holePattern: 'four-grid',
        screwSize: 'M4',
        hasCountersink: false,
        printer_compensation: 0.15,
      });
    } else if (presetName === 'heavy_duty_m5') {
      setBracketParams({
        leg1Length: 75,
        leg2Length: 75,
        width: 40,
        thickness: 6.0,
        gussetReinforcement: true,
        gussetThickness: 5.5,
        holePattern: 'four-grid',
        screwSize: 'M5',
        hasCountersink: false,
        printer_compensation: 0.15,
      });
    }
  }, []);

  // Compute 3D Mesh in real-time (<5ms computational latency)
  const meshResult: GeneratedMeshResult = useMemo(() => {
    switch (activeModel) {
      case 'herringbone_gear':
        return generateHerringboneGear(gearParams);
      case 'bearing_pillow_block':
        return generateBearingPillowBlock(pillowParams);
      case 'structural_bracket':
        return generateStructuralBracket(bracketParams);
      default:
        return generateHerringboneGear(gearParams);
    }
  }, [activeModel, gearParams, pillowParams, bracketParams]);

  // Export STL handler
  const handleExportSTL = useCallback((binary: boolean = true) => {
    if (!meshResult || !meshResult.geometry) return;

    let filename = 'model.stl';
    if (activeModel === 'herringbone_gear') {
      filename = `herringbone_gear_m${gearParams.module}_z${gearParams.toothCount}_w${gearParams.faceWidth}mm.stl`;
    } else if (activeModel === 'bearing_pillow_block') {
      filename = `bearing_pillow_block_${pillowParams.preset}_${pillowParams.mountingFlanges}.stl`;
    } else if (activeModel === 'structural_bracket') {
      filename = `structural_l_bracket_${bracketParams.leg1Length}x${bracketParams.leg2Length}x${bracketParams.width}mm.stl`;
    }

    exportSTL(meshResult.geometry, { filename, binary });
  }, [activeModel, meshResult, gearParams, pillowParams, bracketParams]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        activeModel={activeModel}
        onSelectModel={setActiveModel}
        onExportSTL={handleExportSTL}
      />

      {/* Hardware Presets Quick Toolbar */}
      <PresetsBar
        activeModel={activeModel}
        onApplyBearingPreset={handleApplyBearingPreset}
        onApplyScrewPreset={handleApplyScrewPreset}
        onApplyGearPreset={handleApplyGearPreset}
        onApplyBracketPreset={handleApplyBracketPreset}
      />

      {/* Main Split-Screen Work Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar: Parametric Sliders & Number Inputs */}
        <ParameterSidebar
          activeModel={activeModel}
          gearParams={gearParams}
          pillowParams={pillowParams}
          bracketParams={bracketParams}
          onUpdateGearParams={handleUpdateGearParams}
          onUpdatePillowParams={handleUpdatePillowParams}
          onUpdateBracketParams={handleUpdateBracketParams}
          onExportSTL={handleExportSTL}
        />

        {/* Right Viewport: Interactive 3D Canvas */}
        <main className="flex-1 h-full relative overflow-hidden">
          <Viewport
            geometry={meshResult.geometry}
            dimensions={meshResult.dimensions}
            triangles={meshResult.triangles}
            vertices={meshResult.vertices}
            estimatedPrintWeightGrams={meshResult.estimatedPrintWeightGrams}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
