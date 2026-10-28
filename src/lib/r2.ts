import type { EnvBindings } from '../types/database.ts';

/**
 * Returns the publicly accessible URL for an STL file stored in R2.
 */
export function getR2AssetUrl(stlKey: string, env: EnvBindings): string {
  if (env.PUBLIC_BUCKET_URL) {
    const base = env.PUBLIC_BUCKET_URL.replace(/\/$/, '');
    const cleanKey = stlKey.replace(/^\//, '');
    return `${base}/${cleanKey}`;
  }

  // Fallback to internal API route if public R2 bucket domain is not configured
  const site = (env.SITE_URL || 'https://barebones3d.com').replace(/\/$/, '');
  return `${site}/api/assets/${encodeURIComponent(stlKey)}`;
}

/**
 * Uploads an STL or asset to Cloudflare R2.
 */
export async function uploadToR2(
  bucket: any,
  key: string,
  data: ArrayBuffer | Uint8Array | string,
  contentType = 'model/stl'
): Promise<string> {
  if (!bucket || typeof bucket.put !== 'function') {
    throw new Error('R2 Bucket binding BUCKET_ASSETS is not available');
  }

  await bucket.put(key, data, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable'
    }
  });

  return key;
}
