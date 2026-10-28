import type { EnvBindings, PartRaw, Part } from '../../../src/types/database.ts';
import { parsePart } from '../../../src/types/database.ts';
import { getDbAdapter, type DatabaseAdapter } from '../../../src/lib/db.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim();

  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (!query) {
    return new Response(JSON.stringify({ error: "Missing required query parameter 'q'" }), {
      status: 400,
      headers: corsHeaders
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database binding (DB) unavailable' }), {
      status: 500,
      headers: corsHeaders
    });
  }

  try {
    const db = getDbAdapter(env.DB);
    const siteUrl = (env.SITE_URL || 'https://barebones3d.com').replace(/\/$/, '');

    // SQL search across OEM part number, title, superseded numbers, and fitment JSON
    const searchPattern = `%${query}%`;
    const rows = await db.query<PartRaw>(`
      SELECT * FROM parts
      WHERE is_active = 1
        AND (
          title LIKE ?
          OR slug LIKE ?
          OR oem_part_number LIKE ?
          OR superseded_numbers LIKE ?
          OR compatible_makes_models LIKE ?
          OR material_spec LIKE ?
        )
      ORDER BY 
        CASE 
          WHEN oem_part_number LIKE ? THEN 1
          WHEN title LIKE ? THEN 2
          ELSE 3
        END,
        retail_price_cents DESC
      LIMIT 20
    `, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]);

    const parts: Part[] = rows.map((r: PartRaw) => parsePart(r));

    const results = parts.map((part: Part) => ({
      id: part.id,
      slug: part.slug,
      title: part.title,
      oem_part_number: part.oem_part_number,
      superseded_numbers: part.superseded_numbers,
      compatible_makes_models: part.compatible_makes_models,
      material_spec: part.material_spec,
      retail_price_cents: part.retail_price_cents,
      retail_price_formatted: part.is_commercial_allowed 
        ? `$${(part.retail_price_cents / 100).toFixed(2)} USD` 
        : 'Free STL Only',
      is_commercial_allowed: part.is_commercial_allowed,
      license_type: part.license_type,
      download_stl_url: `${siteUrl}/api/parts/${part.id}/download`,
      guide_url: `${siteUrl}/guides/${part.slug}`,
      guide_markdown_url: `${siteUrl}/guides/${part.slug}.md`
    }));

    return new Response(JSON.stringify({
      query,
      total: results.length,
      results
    }, null, 2), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Search execution failed' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
