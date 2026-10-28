import type { EnvBindings } from '../../src/types/database.ts';
import { getDbAdapter, getPartById, getPartBySlug, getGuideByPartId, getAllActiveParts } from '../../src/lib/db.ts';
import { generatePartMarkdown, generateLlmsTxt } from '../../src/lib/llms.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
  next: () => Promise<Response>;
}

const AI_BOT_REGEX = /GPTBot|ClaudeBot|PerplexityBot|Google-Extended|Amazonbot|Applebot-Extended/i;

export async function onRequest(context: PagesContext): Promise<Response> {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const acceptHeader = request.headers.get('Accept') || '';
  const userAgent = request.headers.get('User-Agent') || '';

  const wantsMarkdown = acceptHeader.includes('text/markdown') ||
                        acceptHeader.includes('text/x-markdown') ||
                        url.pathname.endsWith('.md') ||
                        AI_BOT_REGEX.test(userAgent);

  if (!wantsMarkdown) {
    return next();
  }

  let identifier = url.pathname.replace(/^\/parts\/?/, '').replace(/\.md$/, '').replace(/\/$/, '');

  if (!env.DB) {
    return next();
  }

  const db = getDbAdapter(env.DB);
  const siteUrl = env.SITE_URL || 'https://barebones3d.com';

  if (!identifier) {
    const parts = await getAllActiveParts(db);
    const catalogMarkdown = generateLlmsTxt(parts, siteUrl);
    return new Response(catalogMarkdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Vary': 'Accept, User-Agent',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  let part = await getPartById(db, identifier);
  if (!part) {
    part = await getPartBySlug(db, identifier);
  }

  if (!part) {
    return next();
  }

  const guide = await getGuideByPartId(db, part.id);
  if (!guide) {
    return next();
  }

  const markdown = generatePartMarkdown(part, guide, siteUrl);

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Vary': 'Accept, User-Agent',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
