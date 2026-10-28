import type { EnvBindings } from '../../../../src/types/database.ts';
import { createD1Adapter, getPartById, getPartBySlug } from '../../../../src/lib/db.ts';
import { getR2AssetUrl } from '../../../../src/lib/r2.ts';

interface PagesContext {
  params: { id: string };
  request: Request;
  env: EnvBindings;
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const { params, env } = context;
  const partIdentifier = params.id;

  if (!partIdentifier) {
    return new Response('Part identifier missing', { status: 400 });
  }

  if (!env.DB) {
    return new Response('Database binding unavailable', { status: 500 });
  }

  const db = createD1Adapter(env.DB);
  let part = await getPartById(db, partIdentifier);
  if (!part) {
    part = await getPartBySlug(db, partIdentifier);
  }

  if (!part) {
    return new Response('Part not found', { status: 404 });
  }

  // 1. If R2 binding is directly mounted, stream the asset
  if (env.BUCKET_ASSETS && typeof env.BUCKET_ASSETS.get === 'function') {
    const object = await env.BUCKET_ASSETS.get(part.stl_r2_key);
    if (object) {
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Content-Type', 'model/stl');
      headers.set('Content-Disposition', `attachment; filename="${part.oem_part_number}.stl"`);
      headers.set('Cache-Control', 'public, max-age=86400');
      return new Response(object.body, { headers });
    }
  }

  // 2. Redirect to public R2 asset URL or CDN
  const targetUrl = getR2AssetUrl(part.stl_r2_key, env);
  return Response.redirect(targetUrl, 302);
}
