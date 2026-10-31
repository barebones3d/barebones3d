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
 * Generates an STL Blob from a Three.js BufferGeometry with embedded CC BY-NC 4.0
 * non-commercial attribution in the 80-byte binary header.
 * 100% client-side ($0 server compute).
 */
export function generateSTLBlob(
  geometry: THREE.BufferGeometry,
  options: STLExportOptions = {}
): Blob {
  const {
    binary = true,
    partTitle = 'Parametric Component',
    partNumber = 'BB3D-PART',
    license = 'CC BY-NC 4.0',
  } = options;

  // Create temporary mesh wrapper for STLExporter
  const tempMesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial()
  );

  const exporter = new STLExporter();
  const output = exporter.parse(tempMesh, { binary });

  if (binary) {
    const data = output as DataView;

    // Inject CC BY-NC 4.0 attribution into the standard 80-byte binary STL header block
    // Any binary STL reader reads bytes 0-79 as raw ASCII metadata before the uint32 triangle count
    const headerString = `Barebones 3D | ${partNumber} | ${partTitle} | ${license}`.slice(0, 80);

    for (let i = 0; i < 80; i++) {
      data.setUint8(
        i,
        i < headerString.length ? headerString.charCodeAt(i) : 0x20 // Space-pad remainder
      );
    }

    return new Blob([data.buffer as ArrayBuffer], {
      type: 'model/stl',
    });
  } else {
    // Inject legal identifier into ASCII solid/endsolid tags
    const solidTag = `BB3D_${partNumber.replace(/[^a-zA-Z0-9_\-]/g, '_')}_CC_BY_NC_4_0`;
    let asciiText = output as string;

    // Replace default "solid" and "endsolid" definitions
    asciiText = asciiText.replace(/^solid\s*[^\r\n]*/i, `solid ${solidTag}`);
    asciiText = asciiText.replace(/endsolid\s*[^\r\n]*/i, `endsolid ${solidTag}`);

    return new Blob([asciiText], { type: 'text/plain;charset=utf-8' });
  }
}

/**
 * Exports a Three.js BufferGeometry to an STL file with embedded CC BY-NC 4.0
 * non-commercial attribution in the header, triggering immediate client-side download.
 */
export function exportSTL(
  geometry: THREE.BufferGeometry,
  options: STLExportOptions = {}
): void {
  const {
    filename,
    partTitle = 'Parametric Component',
    partNumber = 'BB3D-PART',
  } = options;

  const cleanBaseName = (filename || `${partNumber}_${partTitle}`)
    .trim()
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .replace(/_{2,}/g, '_');
  const finalFilename = cleanBaseName.toLowerCase().endsWith('.stl')
    ? cleanBaseName
    : `${cleanBaseName}.stl`;

  const blob = generateSTLBlob(geometry, options);

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