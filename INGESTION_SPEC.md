# Barebones 3D — JSON Product Ingestion Specification

> **Target Standard:** Barebones 3D Autonomous Part Ingestion & Catalog Scaling Pipeline  
> **Command:** `pnpm run ingest:json --file <path-to-json>` (or `node scripts/ingest-json.ts --file <path-to-json>`)  
> **Schema Version:** 2.0 (Static-First Visual Architecture & LLM Token Conservation)

---

## 1. Overview & Architecture Rationale

To maintain extreme efficiency and eliminate excessive LLM context token usage during autonomous research, new product additions to Barebones 3D are decoupled from live generative LLM sessions:

1. **External Research:** An operator or autonomous research subagent identifies high-demand broken obsolete OEM parts, sources a CC-licensed 3D model (from Printables, MakerWorld, Thingiverse, or internal CAD), extracts vehicle fitment, and identifies required workshop tools.
2. **Structured JSON Hand-off:** All metadata is structured into a standardized, validated `.json` file following this specification.
3. **Automated Zero-Token Ingestion:** Running `pnpm run ingest:json --file ./new-part.json` automatically:
   - Validates all fields against the strict schema.
   - Downloads the watertight binary `.stl` file and stages it for Cloudflare R2 object storage (`barebones3d-assets`).
   - Generates three-view orthographic technical CAD blueprint SVGs (Isometric, Top-Down Plan XY, and Side Elevation XZ with dimensions).
   - Generates dark-mode inline step blueprints (`#0a0f1d`, grid lines `#1e293b`, geometry `#38bdf8`, action indicators `#f59e0b` or `#4ade80`).
   - Inserts records into Cloudflare D1 database migrations (`migrations/0002_seed_parts.sql`).
   - Appends 301 canonical redirects to `site/_redirects`.
   - Recompiles static HTML repair guides (`/guides/[slug]/index.html`), Markdown endpoints (`/guides/[slug].md`), and dynamic `/llms.txt` / `/llms-full.txt` catalogs.

---

## 2. Strict JSON Schema Specification

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Barebones3DPartIngestion",
  "type": "object",
  "required": [
    "oem_part_number",
    "make",
    "model_compatibility",
    "material",
    "retail_price_cents",
    "stl_source_url",
    "tools_needed",
    "steps"
  ],
  "properties": {
    "oem_part_number": {
      "type": "string",
      "description": "Primary Original Equipment Manufacturer part number. Format: Alphanumeric uppercase (e.g. 72131-FG000, 55670-0C010, W10195416)."
    },
    "make": {
      "type": "string",
      "description": "Primary automotive manufacturer or appliance brand (e.g. Toyota, Subaru, Whirlpool, Bosch, Pioneer)."
    },
    "title": {
      "type": "string",
      "description": "Human-readable functional part title (e.g. Toyota Tacoma Heater Control Valve Arm). If omitted, auto-generated from make and OEM."
    },
    "slug": {
      "type": "string",
      "description": "Unique URL slug identifier. If omitted, automatically derived from make, title, and OEM."
    },
    "superseded_numbers": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Alternative or superseded OEM part numbers."
    },
    "model_compatibility": {
      "type": "array",
      "minItems": 1,
      "description": "Confirmed vehicles or appliances this replacement part fits.",
      "items": {
        "oneOf": [
          { "type": "string" },
          {
            "type": "object",
            "required": ["model"],
            "properties": {
              "make": { "type": "string" },
              "model": { "type": "string" },
              "year_start": { "type": "integer" },
              "year_end": { "type": "integer" },
              "trim": { "type": "string" }
            }
          }
        ]
      }
    },
    "material": {
      "type": "string",
      "description": "Engineering material specification (e.g. 'Industrial Nylon PA12', 'Automotive ASA', 'Food-Safe PETG')."
    },
    "retail_price_cents": {
      "type": "integer",
      "minimum": 0,
      "description": "Print-on-Demand commercial retail price in USD cents (e.g. 1850 for $18.50). Enter 0 for digital-only / free parts."
    },
    "stl_source_url": {
      "type": "string",
      "description": "Public URL or local filesystem path to the CC-licensed watertight binary STL model."
    },
    "license_type": {
      "type": "string",
      "default": "CC BY 4.0",
      "description": "Open-source license (e.g. 'CC BY 4.0', 'CC BY-SA 4.0', 'CC0 1.0', 'CC BY-NC 4.0'). If non-commercial ('-NC'), commercial sale is automatically disabled."
    },
    "tools_needed": {
      "type": "array",
      "description": "Tools and workshop supplies required to perform the repair.",
      "items": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string", "description": "Tool name (e.g. 'Phillips #2 Screwdriver')" },
          "purpose": { "type": "string", "description": "Specific repair purpose (e.g. 'Glove box trim screws')" },
          "amazon_search_keyword": { "type": "string", "description": "Search keyword for compliant affiliate search linking with tag barebones3dco-20." }
        }
      }
    },
    "steps": {
      "type": "array",
      "minItems": 3,
      "description": "Sequential step-by-step repair and installation instructions.",
      "items": {
        "type": "object",
        "required": ["title", "text"],
        "properties": {
          "title": { "type": "string", "description": "Step headline (e.g. 'Lower Dash Removal')" },
          "text": { "type": "string", "description": "Detailed technical instructions." },
          "action_type": {
            "type": "string",
            "enum": ["pry", "extract", "clean", "install", "lube", "test"],
            "description": "Action category used to synthesize the dark-mode inline blueprint SVG."
          },
          "svg_code": {
            "type": "string",
            "description": "Optional inline SVG string override. If omitted, synthesized automatically from action_type."
          },
          "tip": { "type": "string", "description": "Pro tip callout." },
          "warning": { "type": "string", "description": "Safety / damage caution callout." }
        }
      }
    },
    "difficulty": {
      "type": "string",
      "enum": ["Beginner", "Easy", "Moderate", "Advanced"],
      "default": "Moderate"
    },
    "time_estimate": {
      "type": "string",
      "default": "30 mins",
      "description": "Estimated repair duration (e.g. '20 mins', '45 mins', '1 hour')."
    },
    "faq": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["question", "answer"],
        "properties": {
          "question": { "type": "string" },
          "answer": { "type": "string" }
        }
      }
    },
    "attribution_text": {
      "type": "string",
      "description": "Attribution to original open-source 3D designer and repository link."
    }
  }
}
```

---

## 3. Concrete Example Payload (`scratch/example-part.json`)

```json
{
  "oem_part_number": "87240-04020",
  "make": "Toyota",
  "title": "Toyota Tacoma Heater Control Valve Actuator Arm",
  "model_compatibility": [
    { "make": "Toyota", "model": "Tacoma", "year_start": 1995, "year_end": 2004 },
    { "make": "Toyota", "model": "4Runner", "year_start": 1996, "year_end": 2002 }
  ],
  "material": "High-Temp Nylon PA12",
  "retail_price_cents": 1850,
  "stl_source_url": "https://www.printables.com/model/sample-heater-valve-arm.stl",
  "tools_needed": [
    {
      "name": "10mm Socket Wrench",
      "purpose": "Firewall bracket mounting bolts",
      "amazon_search_keyword": "10mm socket wrench"
    },
    {
      "name": "Hose Pinch Pliers",
      "purpose": "Clamp heater core coolant hoses",
      "amazon_search_keyword": "coolant hose pinch-off pliers"
    },
    {
      "name": "Needle-Nose Pliers",
      "purpose": "Cable retention spring clip",
      "amazon_search_keyword": "needle-nose pliers"
    }
  ],
  "steps": [
    {
      "title": "Coolant Line Isolation",
      "text": "Clamp the inlet and outlet 5/8 inch coolant lines near the firewall to avoid draining the engine cooling system.",
      "action_type": "extract",
      "warning": "Ensure engine is cold before handling pressurized cooling hoses."
    },
    {
      "title": "Bowden Cable Release",
      "text": "Pry open the cable retention clip with needle nose pliers and slide the loop off the fractured OEM actuator arm pin.",
      "action_type": "pry",
      "tip": "Mark cable jacket position with paint marker for zero-drift alignment."
    },
    {
      "title": "Valve Spindle Inspection",
      "text": "Wipe the brass valve spindle clean with rubbing alcohol. Confirm free 90-degree rotary movement without binding.",
      "action_type": "clean"
    },
    {
      "title": "Reproduction Arm Installation",
      "text": "Press-fit the reinforced Nylon PA12 replacement arm over the keyed brass shaft until it bottoms flush against the collar.",
      "action_type": "install",
      "tip": "The calibrated +0.15mm printer tolerance guarantees a snug press-fit without wobble."
    },
    {
      "title": "Operational Cable Verification",
      "text": "Cycle temperature selector knob inside the cab across full Cold-to-Hot range. Confirm full 90-degree valve sweep.",
      "action_type": "test"
    }
  ],
  "license_type": "CC BY 4.0",
  "difficulty": "Moderate",
  "time_estimate": "35 mins"
}
```

---

## 4. Execution & Pipeline Integration

Run the ingestion CLI from the repository root:
```bash
# Using pnpm
pnpm run ingest:json --file ./scratch/example-part.json

# Using npm
npm run ingest:json -- --file ./scratch/example-part.json

# With direct Cloudflare remote deployment
npm run ingest:json -- --file ./scratch/example-part.json --remote
```

### Automated Ingestion Steps:
1. **Schema Check:** Validates all mandatory fields, OEM number formats, and action types.
2. **Binary STL Processing:** Downloads the referenced STL model, checks for watertight binary structure, saves to `site/assets/stl/<slug>.stl`, and stages for R2 object storage.
3. **Database Migration:** Inserts `INSERT OR REPLACE INTO parts` and `INSERT OR REPLACE INTO guides` into `migrations/0002_seed_parts.sql`.
4. **URL Redirects:** Adds canonical 301 redirects to `site/_redirects` (`/parts/<slug>` and `/parts/<oem>`).
5. **Static Generation:** Executes `node scripts/build-guides.ts` to output:
   - `/guides/<slug>/index.html` (with Three-View Orthographic Layout & Lazy 3D Modal)
   - `/guides/<slug>.md` (clean unstyled markdown for LLMs)
   - Updated `/guides/index.html` catalog
   - Updated `/llms.txt` and `/llms-full.txt` endpoints
