import { generateGT2PulleyBinarySTL } from '../../../../src/lib/pulleyGenerator.ts';

interface PagesContext {
  request: Request;
}

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const url = new URL(context.request.url);
  const teeth = parseInt(url.searchParams.get('teeth') || '20', 10);
  const bore = parseFloat(url.searchParams.get('bore') || '5');
  const width = parseFloat(url.searchParams.get('width') || '6');

  if (isNaN(teeth) || teeth < 10 || teeth > 120) {
    return new Response('Invalid teeth parameter (10-120)', { status: 400 });
  }

  if (isNaN(bore) || bore < 2 || bore > 25) {
    return new Response('Invalid bore parameter (2-25mm)', { status: 400 });
  }

  const pitch_dia = (teeth * 2.0) / Math.PI;
  const outer_dia = pitch_dia - 0.508;
  if ((outer_dia - bore) / 2 < 1.5) {
    return new Response('Insufficient wall thickness (< 1.5mm). Structural failure risk.', { status: 422 });
  }

  try {
    const stlBytes = generateGT2PulleyBinarySTL({
      teeth,
      boreMm: bore,
      widthMm: width,
    });
    const filename = `gt2_pulley_${teeth}T_${bore}mm.stl`;

    return new Response(stlBytes.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'model/stl',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(`Error generating STL: ${err.message}`, { status: 500 });
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
