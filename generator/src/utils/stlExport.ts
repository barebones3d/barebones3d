import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export interface STLExportOptions {
  filename?: string;
  binary?: boolean;
  partTitle?: string;
  partNumber?: string;
  license?: string;
}

/**
 * Exports a Three.js BufferGeometry to an STL file with embedded CC BY-NC 4.0
 * non-commercial attribution in the header, triggering immediate client-side download.
 * 100% client-side ($0 server compute).
 */
export function exportSTL(
  geometry: THREE.BufferGeometry,
  options: STLExportOptions = {}
): void {
  const {
    filename,
    binary = true,
    partTitle = 'Parametric Component',
    partNumber = 'BB3D-PART',
    license = 'CC BY-NC 4.0',
  } = options;

  // Resolve safe filename
  const cleanBaseName = (filename || `${partNumber}_${partTitle}`)
    .trim()
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .replace(/_{2,}/g, '_');
  const finalFilename = cleanBaseName.toLowerCase().endsWith('.stl')
    ? cleanBaseName
    : `${cleanBaseName}.stl`;

  // Create temporary mesh wrapper for STLExporter
  const tempMesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial()
  );

  const exporter = new STLExporter();
  const output = exporter.parse(tempMesh, { binary });

  let blob: Blob;

  if (binary) {
    const data = output as DataView;

    // Inject CC BY-NC 4.0 attribution into the standard 80-byte binary STL header block
    // Any binary STL reader reads bytes 0-79 as raw ASCII metadata before the uint32 triangle count
    const headerString = `Barebones 3D (barebones3d.com) | ${partNumber} | ${license}`.slice(0, 80);

    for (let i = 0; i < 80; i++) {
      data.setUint8(
        i,
        i < headerString.length ? headerString.charCodeAt(i) : 0x20 // Space-pad remainder
      );
    }

    blob = new Blob([data.buffer as ArrayBuffer], {
      type: 'application/octet-stream',
    });
  } else {
    // Inject legal identifier into ASCII solid/endsolid tags
    const solidTag = `BB3D_${partNumber.replace(/[^a-zA-Z0-9_\-]/g, '_')}_CC_BY_NC_4_0`;
    let asciiText = output as string;

    // Replace default "solid" and "endsolid" definitions
    asciiText = asciiText.replace(/^solid\s*[^\r\n]*/i, `solid ${solidTag}`);
    asciiText = asciiText.replace(/endsolid\s*[^\r\n]*/i, `endsolid ${solidTag}`);

    blob = new Blob([asciiText], { type: 'text/plain;charset=utf-8' });
  }

  // Trigger client-side browser download
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}