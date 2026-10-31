import type { EnvBindings } from '../../../src/types/database.ts';
import { uploadToR2, getR2AssetUrl } from '../../../src/lib/r2.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Filename, Content-Disposition',
  };

  try {
    const siteUrl = (env.SITE_URL || 'https://barebones3d.com').replace(/\/$/, '');
    const contentType = request.headers.get('content-type') || '';
    const rawFilename = request.headers.get('x-filename') || 'custom_parametric_part.stl';
    const cleanFilename = rawFilename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const itemKey = `ephemeral/stls/${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${cleanFilename}`;

    let binaryData: ArrayBuffer | Uint8Array;

    if (contentType.includes('application/json')) {
      const body: any = await request.json();
      const base64Data = (body.stlBase64 || body.data || '').replace(/^data:[^;]+;base64,/, '');
      if (!base64Data) {
        return new Response(JSON.stringify({ error: 'Missing stlBase64 in JSON payload' }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    } else {
      binaryData = await request.arrayBuffer();
    }

    if (!binaryData || binaryData.byteLength < 80) {
      return new Response(JSON.stringify({ error: 'Invalid STL binary buffer (must be at least 84 bytes)' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Upload to Cloudflare R2 if bucket binding is present
    if (env.BUCKET_ASSETS) {
      await uploadToR2(env.BUCKET_ASSETS, itemKey, binaryData, 'model/stl');
      const stlUrl = getR2AssetUrl(itemKey, env);

      return new Response(
        JSON.stringify({
          success: true,
          key: itemKey,
          stlUrl,
          byteLength: binaryData.byteLength,
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    // Mock/development fallback if R2 binding is absent
    const mockStlUrl = `${siteUrl}/api/assets/${encodeURIComponent(itemKey)}`;
    return new Response(
      JSON.stringify({
        success: true,
        key: itemKey,
        stlUrl: mockStlUrl,
        byteLength: binaryData.byteLength,
        isMock: true,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message || 'Internal server error during STL upload',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Filename, Content-Disposition',
    },
  });
}
