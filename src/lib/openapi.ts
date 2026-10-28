/**
 * Generates the official OpenAPI 3.1.0 specification for barebones3d.com
 */
export function generateOpenApiSpec(siteUrl: string): Record<string, any> {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  return {
    openapi: '3.1.0',
    info: {
      title: 'Barebones 3D Autonomous Commerce & Obsolete Parts API',
      version: '1.0.0',
      description: 'Programmatic API for AI agents to query obsolete OEM hardware fitment, retrieve engineering specifications, and generate Stripe Checkout links for automated 3D print dropshipping.',
      contact: {
        name: 'Barebones 3D Engineering',
        url: cleanSiteUrl
      }
    },
    servers: [
      {
        url: cleanSiteUrl,
        description: 'Production Edge Server'
      }
    ],
    paths: {
      '/api/parts/search': {
        get: {
          summary: 'Search Obsolete OEM Parts',
          description: 'Search the catalog by OEM part number, vehicle make/model, or appliance type. Returns matching parts with material specifications, pricing, and license availability.',
          operationId: 'searchParts',
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              description: 'Search query string (e.g., "72131-FG000", "Subaru blend door", "Whirlpool dishwasher wheel")',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Matching parts list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      query: { type: 'string' },
                      total: { type: 'integer' },
                      results: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/PartSummary'
                        }
                      }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Missing query parameter'
            }
          }
        }
      },
      '/api/checkout/create': {
        post: {
          summary: 'Create Checkout Session Link',
          description: 'Initiates a Stripe Checkout session for a commercial reproduction part. Returns a pre-filled direct payment URL with automatic tax calculation and address collection.',
          operationId: 'createCheckout',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['part_id'],
                  properties: {
                    part_id: {
                      type: 'string',
                      description: 'Unique identifier of the part to purchase (e.g. "part_subaru_blend_door_72131")'
                    },
                    quantity: {
                      type: 'integer',
                      default: 1,
                      minimum: 1,
                      maximum: 50
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Checkout session created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      checkout_url: { type: 'string', format: 'uri' },
                      session_id: { type: 'string' },
                      expires_at: { type: 'string' }
                    }
                  }
                }
              }
            },
            '403': {
              description: 'Commercial manufacturing prohibited by non-commercial license'
            },
            '404': {
              description: 'Part not found'
            }
          }
        }
      },
      '/api/mcp': {
        post: {
          summary: 'Model Context Protocol (MCP) Streamable Server',
          description: 'Streamable JSON-RPC 2.0 Model Context Protocol endpoint providing tool discovery and execution for autonomous AI agents (find_obsolete_part, generate_purchase_link).',
          operationId: 'handleMcp',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['jsonrpc', 'method'],
                  properties: {
                    jsonrpc: { type: 'string', enum: ['2.0'] },
                    id: { type: ['string', 'number', 'null'] },
                    method: { type: 'string' },
                    params: { type: 'object' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'JSON-RPC 2.0 MCP Response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      jsonrpc: { type: 'string' },
                      id: { type: ['string', 'number', 'null'] },
                      result: { type: 'object' },
                      error: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        PartSummary: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slug: { type: 'string' },
            title: { type: 'string' },
            oem_part_number: { type: 'string' },
            superseded_numbers: {
              type: 'array',
              items: { type: 'string' }
            },
            compatible_makes_models: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  make: { type: 'string' },
                  model: { type: 'string' },
                  year_start: { type: 'integer' },
                  year_end: { type: 'integer' }
                }
              }
            },
            material_spec: { type: 'string' },
            retail_price_cents: { type: 'integer' },
            retail_price_formatted: { type: 'string' },
            is_commercial_allowed: { type: 'boolean' },
            license_type: { type: 'string' },
            download_stl_url: { type: 'string', format: 'uri' },
            guide_url: { type: 'string', format: 'uri' },
            guide_markdown_url: { type: 'string', format: 'uri' }
          }
        }
      }
    }
  };
}
