import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export interface STLExportOptions {
  filename?: string;
  binary?: boolean;
}

/**
 * Exports a Three.js BufferGeometry to an STL file and triggers immediate client-side download.
 * 100% client-side ($0 server compute).
 */
export function exportSTL(
  geometry: THREE.BufferGeometry,
  options: STLExportOptions = {}
): void {
  const {
    filename = 'parametric_model.stl',
    binary = true,
  } = options;

  // Create a temporary mesh to pass to STLExporter
  const tempMesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial()
  );

  const exporter = new STLExporter();
  const output = exporter.parse(tempMesh, { binary });

  let blob: Blob;
  if (binary) {
    // When binary: true, output is a DataView
    const data = output as DataView;
    blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  } else {
    // When binary: false, output is an ASCII string
    blob = new Blob([output as string], { type: 'text/plain' });
  }

  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = filename.endsWith('.stl') ? filename : `${filename}.stl`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}
