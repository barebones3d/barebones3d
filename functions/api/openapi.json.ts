import type { EnvBindings } from '../../src/types/database.ts';
import { generateOpenApiSpec } from '../../src/lib/openapi.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const { env } = context;
  const siteUrl = env.SITE_URL || 'https://barebones3d.com';
  const spec = generateOpenApiSpec(siteUrl);

  return new Response(JSON.stringify(spec, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
