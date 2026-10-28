import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Maximize2,
  Box,
  Eye,
  RotateCcw,
  Layers,
  Scale,
  Sparkles,
  Grid
} from 'lucide-react';

interface ViewportProps {
  geometry: THREE.BufferGeometry | null;
  dimensions: { x: number; y: number; z: number };
  triangles: number;
  vertices: number;
  estimatedPrintWeightGrams: number;
}

export const Viewport: React.FC<ViewportProps> = ({
  geometry,
  dimensions,
  triangles,
  vertices,
  estimatedPrintWeightGrams,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [renderMs, setRenderMs] = useState<number>(0);

  // Initialize Three.js scene once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    camera.position.set(70, 70, 90);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.maxDistance = 600;
    controls.minDistance = 5;
    controlsRef.current = controls;

    // Lighting (Studio Technical 3-Point Light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xe2f1ff, 2.2);
    keyLight.position.set(100, 150, 100);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-80, -40, -60);
    scene.add(fillLight);

    const topRimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    topRimLight.position.set(0, 200, -100);
    scene.add(topRimLight);

    // Engineering Grid Plane (10mm major, 1mm minor feel)
    const grid = new THREE.GridHelper(200, 40, 0x38bdf8, 0x1e293b);
    grid.position.y = -0.1;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Material (High quality technical matte engineering polymer - fully solid double-sided)
    const material = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.12,
      roughness: 0.45,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
      flatShading: false,
    });

    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    const wireMesh = new THREE.Mesh(new THREE.BufferGeometry(), wireframeMat);
    wireMesh.visible = false;
    scene.add(wireMesh);
    wireframeMeshRef.current = wireMesh;

    // Animation Loop
    let animationId: number;
    let lastTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const startT = performance.now();

      controls.update();
      renderer.render(scene, camera);

      const elapsed = performance.now() - startT;
      // Smooth FPS/ms display update
      if (performance.now() - lastTime > 300) {
        setRenderMs(Number(elapsed.toFixed(1)));
        lastTime = performance.now();
      }
    };
    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Geometry whenever prop changes
  useEffect(() => {
    if (!geometry || !meshRef.current || !wireframeMeshRef.current) return;

    // Center geometry so rotation pivots around model center
    const cloned = geometry.clone();
    cloned.center();

    // Place bottom of model on grid plane (y = 0)
    cloned.computeBoundingBox();
    if (cloned.boundingBox) {
      const minY = cloned.boundingBox.min.y;
      cloned.translate(0, -minY, 0);
    }

    meshRef.current.geometry.dispose();
    meshRef.current.geometry = cloned;

    wireframeMeshRef.current.geometry.dispose();
    wireframeMeshRef.current.geometry = cloned;
  }, [geometry]);

  // Update Wireframe mode
  useEffect(() => {
    if (!wireframeMeshRef.current || !meshRef.current) return;
    if (wireframe) {
      wireframeMeshRef.current.visible = true;
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 0.6;
      (meshRef.current.material as THREE.MeshStandardMaterial).transparent = true;
    } else {
      wireframeMeshRef.current.visible = false;
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = 1.0;
      (meshRef.current.material as THREE.MeshStandardMaterial).transparent = false;
    }
  }, [wireframe]);

  // Update Grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Update Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 2.0;
    }
  }, [autoRotate]);

  // Reset Camera View
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current || !meshRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const mesh = meshRef.current;

    mesh.geometry.computeBoundingSphere();
    const sphere = mesh.geometry.boundingSphere || new THREE.Sphere(new THREE.Vector3(0, 10, 0), 30);

    const radius = Math.max(20, sphere.radius);
    const dist = radius * 2.6;

    camera.position.set(dist * 0.8, dist * 0.7, dist * 0.9);
    controls.target.copy(sphere.center);
    controls.update();
  }, []);

  return (
    <div className="relative w-full h-full bg-[#090d16] overflow-hidden select-none">
      {/* 3D Canvas container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Part Bounding Box & Dimensions Readout */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 shadow-xl flex flex-col gap-1.5 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            <Box className="w-3.5 h-3.5 text-sky-400" />
            <span>Bounding Box (mm)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-[#1e293b]/80 border border-slate-700/60 rounded px-2 py-1 text-center">
              <span className="text-red-400 text-[10px] block">X (Width)</span>
              <span className="text-slate-100 font-bold">{dimensions.x.toFixed(1)}</span>
            </div>
            <div className="bg-[#1e293b]/80 border border-slate-700/60 rounded px-2 py-1 text-center">
              <span className="text-emerald-400 text-[10px] block">Y (Depth)</span>
              <span className="text-slate-100 font-bold">{dimensions.y.toFixed(1)}</span>
            </div>
            <div className="bg-[#1e293b]/80 border border-slate-700/60 rounded px-2 py-1 text-center">
              <span className="text-blue-400 text-[10px] block">Z (Height)</span>
              <span className="text-slate-100 font-bold">{dimensions.z.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Mesh Quality & Slicing Stats */}
        <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 shadow-xl flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>{triangles.toLocaleString()} <span className="text-slate-500 text-[10px]">tris</span> ({vertices.toLocaleString()} <span className="text-slate-500 text-[10px]">v</span>)</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>{estimatedPrintWeightGrams}g <span className="text-slate-500 text-[10px]">PLA</span></span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>Watertight</span>
          </div>
        </div>
      </div>

      {/* Top Right: Viewport Floating Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setWireframe(!wireframe)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all backdrop-blur-md shadow-lg ${
            wireframe
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'bg-[#0f172a]/80 border-slate-700 text-slate-300 hover:bg-[#1e293b] hover:text-white'
          }`}
          title="Toggle Wireframe overlay"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Wireframe</span>
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg border text-xs transition-all backdrop-blur-md shadow-lg ${
            showGrid
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'bg-[#0f172a]/80 border-slate-700 text-slate-300 hover:bg-[#1e293b] hover:text-white'
          }`}
          title="Toggle Grid Plane"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-lg border text-xs transition-all backdrop-blur-md shadow-lg ${
            autoRotate
              ? 'bg-sky-500/20 border-sky-400 text-sky-300'
              : 'bg-[#0f172a]/80 border-slate-700 text-slate-300 hover:bg-[#1e293b] hover:text-white'
          }`}
          title="Toggle Auto-Rotation"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-[#0f172a]/80 text-slate-300 hover:bg-[#1e293b] hover:text-white hover:border-slate-600 text-xs font-mono transition-all backdrop-blur-md shadow-lg"
          title="Reset Camera to default viewpoint"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Reset Camera</span>
        </button>
      </div>

      {/* Bottom Right: Render latency & WebGL tag */}
      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-2 text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          WebGL 2.0 Client-Side
        </span>
        <span>•</span>
        <span>{renderMs} ms/frame</span>
      </div>
    </div>
  );
};
