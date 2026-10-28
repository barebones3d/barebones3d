import type { EnvBindings, Guide } from '../src/types/database.ts';
import { getDbAdapter, getAllActiveParts, getGuideByPartId } from '../src/lib/db.ts';
import { generateLlmsFullTxt } from '../src/lib/llms.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const { env } = context;
  const siteUrl = env.SITE_URL || 'https://barebones3d.com';

  if (!env.DB) {
    return new Response('# barebones3d.com\n\nDatabase binding unavailable.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  try {
    const db = getDbAdapter(env.DB);
    const parts = await getAllActiveParts(db);
    const guidesMap = new Map<string, Guide>();

    for (const part of parts) {
      const guide = await getGuideByPartId(db, part.id);
      if (guide) {
        guidesMap.set(part.id, guide);
      }
    }

    const output = generateLlmsFullTxt(parts, guidesMap, siteUrl);

    return new Response(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return new Response(`# barebones3d.com\n\nError generating llms-full.txt: ${err.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
