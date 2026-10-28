import type { EnvBindings } from '../../src/types/database.ts';
import { getDbAdapter, getPartBySlug, getGuideByPartId, getAllActiveParts } from '../../src/lib/db.ts';
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

  // Extract slug from URL pathname (e.g. /guides/subaru-gear.md or /guides/subaru-gear/)
  let slug = url.pathname.replace(/^\/guides\/?/, '').replace(/\.md$/, '').replace(/\/$/, '');

  if (!env.DB) {
    return next();
  }

  const db = getDbAdapter(env.DB);
  const siteUrl = env.SITE_URL || 'https://barebones3d.com';

  // If requesting the guides root (/guides or /guides/) with markdown negotiation, return parts catalog
  if (!slug) {
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

  const part = await getPartBySlug(db, slug);
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
