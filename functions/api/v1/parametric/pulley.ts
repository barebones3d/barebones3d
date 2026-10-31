import { findMatchingStandardPulley, buildAmazonAffiliateUrl } from '../../../../src/lib/standardsCatalog.ts';

interface PagesContext {
  request: Request;
  env?: Record<string, any>;
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid JSON request body' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const teeth = Number(body?.teeth);
    const bore_mm = Number(body?.bore_mm);
    const belt_width_mm = Number(body?.belt_width_mm ?? 6);

    if (!teeth || isNaN(teeth) || teeth < 10 || teeth > 120) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid teeth count. Must be between 10 and 120.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!bore_mm || isNaN(bore_mm) || bore_mm < 2 || bore_mm > 25) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid bore diameter. Must be between 2mm and 25mm.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Mathematical GT2 Pitch Diameter and Outer Diameter
    const pitch_dia = (teeth * 2.0) / Math.PI;
    const outer_dia = pitch_dia - 0.508;
    const wall_thickness = (outer_dia - bore_mm) / 2;

    const pitch_dia_mm = Number(pitch_dia.toFixed(2));
    const outer_dia_mm = Number(outer_dia.toFixed(2));

    // Structural failure validation
    if (wall_thickness < 1.5) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `Insufficient wall thickness (${wall_thickness.toFixed(2)}mm < 1.5mm). Risk of catastrophic failure.`,
          pitch_dia_mm,
          outer_dia_mm,
        }),
        {
          status: 422,
          headers: corsHeaders,
        }
      );
    }

    // Commodity catalog check
    const match = findMatchingStandardPulley(teeth, bore_mm, belt_width_mm);
    const tag = env?.NEXT_PUBLIC_AMAZON_TAG || env?.AMAZON_TAG || 'barebones3d-20';

    const is_standard = match !== null;
    const amazon_buy_url = match
      ? buildAmazonAffiliateUrl(match.amazonSearchQuery, tag)
      : null;

    const responsePayload = {
      valid: true,
      pitch_dia_mm,
      outer_dia_mm,
      is_standard,
      amazon_buy_url,
      stl_download_url: `/api/v1/download/pulley?teeth=${teeth}&bore=${bore_mm}&width=${belt_width_mm}`,
      pod_unit_cost_usd: 8.5,
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ valid: false, error: err.message || 'Internal server error during calculation' }),
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
