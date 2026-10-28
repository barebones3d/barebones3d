import type { EnvBindings, PartRaw, Part } from '../../src/types/database.ts';
import { parsePart } from '../../src/types/database.ts';
import { getDbAdapter, getPartById, getPartBySlug, getGuideByPartId, type DatabaseAdapter } from '../../src/lib/db.ts';
import { createCheckoutSession } from '../../src/lib/stripe.ts';

interface PagesContext {
  request: Request;
  env: EnvBindings;
}

const MCP_TOOLS = [
  {
    name: 'find_obsolete_part',
    description: 'Searches for discontinued or obsolete OEM replacement parts by part number, vehicle make/model, or appliance name. Returns 3D CAD specifications, material engineering properties (ASA, Nylon, PETG), and repair guide overview.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'OEM part number, vehicle make/model, or appliance name (e.g. "72131-FG000", "Subaru blend door gear", "Whirlpool rack wheel")'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'generate_purchase_link',
    description: 'Creates an instant Stripe Checkout payment link for a commercial 3D reproduction part with automatic sales tax and shipping calculation. Dispatched to Slant 3D automated manufacturing upon checkout.',
    inputSchema: {
      type: 'object',
      properties: {
        part_id: {
          type: 'string',
          description: 'The unique part identifier or slug (e.g. "part_subaru_blend_door_72131" or "subaru-blend-door-actuator-gear-72131-fg000")'
        }
      },
      required: ['part_id']
    }
  }
];

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' }
    }), { status: 400, headers: corsHeaders });
  }

  const { jsonrpc = '2.0', id, method, params } = body || {};

  // 1. MCP initialize handshake
  if (method === 'initialize') {
    return new Response(JSON.stringify({
      jsonrpc,
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'barebones3d-mcp-server',
          version: '1.0.0'
        }
      }
    }), { status: 200, headers: corsHeaders });
  }

  // 2. Notification acknowledgement
  if (method === 'notifications/initialized') {
    return new Response(JSON.stringify({ jsonrpc }), { status: 200, headers: corsHeaders });
  }

  // 3. Ping
  if (method === 'ping') {
    return new Response(JSON.stringify({ jsonrpc, id, result: {} }), { status: 200, headers: corsHeaders });
  }

  // 4. List Tools
  if (method === 'tools/list') {
    return new Response(JSON.stringify({
      jsonrpc,
      id,
      result: {
        tools: MCP_TOOLS
      }
    }), { status: 200, headers: corsHeaders });
  }

  // 5. Call Tool
  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    if (!env.DB) {
      return new Response(JSON.stringify({
        jsonrpc,
        id,
        error: { code: -32603, message: 'Database binding (DB) is unavailable on edge worker.' }
      }), { status: 500, headers: corsHeaders });
    }

    const db = getDbAdapter(env.DB);
    const siteUrl = (env.SITE_URL || 'https://barebones3d.com').replace(/\/$/, '');

    // Tool A: find_obsolete_part
    if (toolName === 'find_obsolete_part') {
      const q = String(args.query || '').trim();
      if (!q) {
        return new Response(JSON.stringify({
          jsonrpc,
          id,
          error: { code: -32602, message: "Missing required argument 'query'" }
        }), { status: 400, headers: corsHeaders });
      }

      const searchPattern = `%${q}%`;
      const rows = await db.query<PartRaw>(`
        SELECT * FROM parts
        WHERE is_active = 1
          AND (
            title LIKE ? OR slug LIKE ? OR oem_part_number LIKE ?
            OR superseded_numbers LIKE ? OR compatible_makes_models LIKE ?
          )
        LIMIT 5
      `, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]);

      const parts: Part[] = rows.map((r: PartRaw) => parsePart(r));

      if (parts.length === 0) {
        return new Response(JSON.stringify({
          jsonrpc,
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `No matching obsolete parts found for query: "${q}". You can also browse all parts at ${siteUrl}/guides/.`
              }
            ]
          }
        }), { status: 200, headers: corsHeaders });
      }

      const textBlocks = await Promise.all(parts.map(async (part: Part) => {
        const guide = await getGuideByPartId(db, part.id);
        const price = part.is_commercial_allowed 
          ? `$${(part.retail_price_cents / 100).toFixed(2)} USD` 
          : 'Free STL Only (Non-Commercial)';

        const makes = part.compatible_makes_models.map(c => `${c.make} ${c.model}`).join(', ');

        return `### ${part.title} (OEM #${part.oem_part_number})
- **Part ID:** \`${part.id}\`
- **OEM Part Number:** \`${part.oem_part_number}\`
- **Supersedes:** ${part.superseded_numbers.join(', ') || 'None'}
- **Confirmed Compatibility:** ${makes || 'Universal'}
- **Material Spec:** ${part.material_spec} (100% solid infill, +0.15mm printer compensation)
- **Retail Price:** ${price}
- **Free STL Download:** ${siteUrl}/api/parts/${part.id}/download
- **Full Repair Guide:** ${siteUrl}/guides/${part.slug}
- **Raw Markdown Guide:** ${siteUrl}/guides/${part.slug}.md
${guide ? `- **Repair Overview:** ${guide.difficulty} difficulty &bull; ${guide.time_estimate} &bull; ${guide.steps.length} steps` : ''}`;
      }));

      return new Response(JSON.stringify({
        jsonrpc,
        id,
        result: {
          isError: false,
          content: [
            {
              type: 'text',
              text: `Found ${parts.length} matching obsolete OEM replacement component(s):\n\n${textBlocks.join('\n\n---\n\n')}`
            }
          ]
        }
      }), { status: 200, headers: corsHeaders });
    }

    // Tool B: generate_purchase_link
    if (toolName === 'generate_purchase_link') {
      const partId = String(args.part_id || '').trim();
      if (!partId) {
        return new Response(JSON.stringify({
          jsonrpc,
          id,
          error: { code: -32602, message: "Missing required argument 'part_id'" }
        }), { status: 400, headers: corsHeaders });
      }

      let part = await getPartById(db, partId);
      if (!part) {
        part = await getPartBySlug(db, partId);
      }

      if (!part) {
        return new Response(JSON.stringify({
          jsonrpc,
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `Part identifier "${partId}" was not found in the catalog.`
              }
            ],
            isError: true
          }
        }), { status: 200, headers: corsHeaders });
      }

      // Check commercial permission
      if (!part.is_commercial_allowed) {
        return new Response(JSON.stringify({
          jsonrpc,
          id,
          result: {
            isError: true,
            content: [
              {
                type: 'text',
                text: `⚠️ Commercial purchase is disabled for ${part.title} (OEM #${part.oem_part_number}) because the original creator licensed it under ${part.license_type} (Non-Commercial).\n\nYou can download the free 3D printable STL for personal repair at: ${siteUrl}/api/parts/${part.id}/download`
              }
            ]
          }
        }), { status: 200, headers: corsHeaders });
      }

      const isMock = env.MOCK_SERVICES === 'true';
      const session = await createCheckoutSession({
        part,
        quantity: 1,
        siteUrl,
        stripeSecretKey: env.STRIPE_SECRET_KEY,
        isMock
      });

      const price = `$${(part.retail_price_cents / 100).toFixed(2)} USD`;
      return new Response(JSON.stringify({
        jsonrpc,
        id,
        result: {
          isError: false,
          content: [
            {
              type: 'text',
              text: `Ready to order reproduction part for ${part.title} (OEM #${part.oem_part_number}):\n\n- **Price:** ${price}\n- **Material:** ${part.material_spec} (100% Solid Industrial Spec)\n- **Fulfillment:** Automated dropshipping via Slant 3D (Ships in ~48h)\n- **Secure Checkout URL:** ${session.url}\n\nPlease click the link to enter your shipping address and complete payment via Stripe.`
            }
          ]
        }
      }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      jsonrpc,
      id,
      error: { code: -32601, message: `Tool not found: ${toolName}` }
    }), { status: 404, headers: corsHeaders });
  }

  return new Response(JSON.stringify({
    jsonrpc,
    id,
    error: { code: -32601, message: `Method not supported: ${method}` }
  }), { status: 404, headers: corsHeaders });
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const { env } = context;
  const siteUrl = (env.SITE_URL || 'https://barebones3d.com').replace(/\/$/, '');

  return new Response(JSON.stringify({
    name: 'barebones3d-mcp-server',
    version: '1.0.0',
    description: 'Remote Model Context Protocol (MCP) server for barebones3d.com',
    endpoints: {
      jsonrpc: `${siteUrl}/api/mcp`,
      openapi: `${siteUrl}/api/openapi.json`,
      llms_manifest: `${siteUrl}/llms.txt`
    },
    tools: MCP_TOOLS
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
