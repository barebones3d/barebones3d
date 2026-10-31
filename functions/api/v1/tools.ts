interface PagesContext {
  request: Request;
}

const TOOLS_SCHEMA = {
  tools: [
    {
      name: "calc_gt2_pulley",
      description: "Calculates pitch diameter, verifies standard availability, generates STL URL",
      parameters: {
        type: "object",
        properties: {
          teeth: { type: "integer", minimum: 10, maximum: 120 },
          bore_mm: { type: "number", minimum: 2, maximum: 25 },
          belt_width_mm: { type: "number", default: 6 }
        },
        required: ["teeth", "bore_mm"]
      }
    }
  ]
};

export async function onRequestGet(_context: PagesContext): Promise<Response> {
  return new Response(JSON.stringify(TOOLS_SCHEMA), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "public, max-age=86400"
    }
  });
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
