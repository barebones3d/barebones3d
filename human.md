# Operator Deployment & Configuration Playbook: barebones3d.com

> **Document Classification:** Production Manual Operations Runbook  
> **Target Platform:** Cloudflare Pages (Static Edge + Functions) + Cloudflare D1 + Cloudflare R2 + Stripe + Slant 3D API  
> **Last Verified:** October 2026

---

## Table of Contents
1. [Overview & Architecture Summary](#1-overview--architecture-summary)
2. [Cloudflare Infrastructure Provisioning](#2-cloudflare-infrastructure-provisioning)
   - [2.1 D1 Database Creation & Migration](#21-d1-database-creation--migration)
   - [2.2 R2 Storage Bucket Creation & Public Domain](#22-r2-storage-bucket-creation--public-domain)
   - [2.3 Cloudflare Pages Project & Bindings](#23-cloudflare-pages-project--bindings)
   - [2.4 Custom Domain & DNS Records](#24-custom-domain--dns-records)
3. [Stripe Payment & Webhook Configuration](#3-stripe-payment--webhook-configuration)
   - [3.1 API Keys & Account Capabilities](#31-api-keys--account-capabilities)
   - [3.2 Stripe Tax & Address Collection Setup](#32-stripe-tax--address-collection-setup)
   - [3.3 Webhook Endpoint Registration & Signing Secret](#33-webhook-endpoint-registration--signing-secret)
4. [Slant 3D Print-on-Demand (POD) Setup](#4-slant-3d-print-on-demand-pod-setup)
   - [4.1 Account Registration & API Key](#41-account-registration--api-key)
   - [4.2 Manufacturing Balance & Default Payment Method](#42-manufacturing-balance--default-payment-method)
   - [4.3 Material & Slicing Specifications](#43-material--slicing-specifications)
5. [Environment Variables & Secret Provisioning](#5-environment-variables--secret-provisioning)
   - [5.1 Setting Production Secrets via Wrangler](#51-setting-production-secrets-via-wrangler)
   - [5.2 Complete `.env.production` Template](#52-complete-envproduction-template)
6. [Ingestion & Discovery Operations CLI](#6-ingestion--discovery-operations-cli)
7. [Verification & Health Checks](#7-verification--health-checks)
8. [LLM-Native Retrieval, Remote MCP & Agentic Commerce](#8-llm-native-retrieval-remote-mcp--agentic-commerce)
   - [8.1 Testing /llms.txt and Content Negotiation via curl](#81-testing-llmstxt-and-content-negotiation-via-curl)
   - [8.2 Connecting Remote MCP Server to Claude Desktop](#82-connecting-remote-mcp-server-to-claude-desktop)
   - [8.3 Testing Tools with MCP Inspector](#83-testing-tools-with-mcp-inspector)
   - [8.4 Cloudflare WAF & Bot Management Recommendations](#84-cloudflare-waf--bot-management-recommendations)

---

## 1. Overview & Architecture Summary

`barebones3d.com` operates as a high-performance, edge-rendered hybrid e-commerce and technical repair hub:
* **Static Edge Delivery:** Pre-rendered HTML repair guides (`/guides/[slug]/`) and client-side parametric 3D CAD engine (`/generator/`) served globally via Cloudflare CDN.
* **Serverless Backend:** Cloudflare Pages Functions (`functions/api/checkout.ts`, `functions/api/webhooks/stripe.ts`, `functions/api/parts/[id]/download.ts`).
* **Relational Storage:** Cloudflare D1 distributed SQLite database storing parts, repair guides, order records, and fulfillment tracking jobs.
* **Binary Asset Storage:** Cloudflare R2 bucket (`barebones3d-assets`) hosting watertight `.stl` models and repair photography.
* **Payment Processing:** Stripe Checkout with automated sales tax calculation and physical shipping address collection.
* **Manufacturing Fulfillment:** Slant 3D API adapter submitting automated print-on-demand jobs upon successful Stripe checkout completion.

---

## 2. Cloudflare Infrastructure Provisioning

### 2.1 D1 Database Creation & Migration

1. **Log in to Cloudflare via CLI:**
   ```bash
   npx wrangler login
   ```

2. **Create the D1 Database:**
   ```bash
   npx wrangler d1 create barebones3d-db
   ```
   *Output will display your database binding configuration:*
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "barebones3d-db"
   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

3. **Update `wrangler.toml`:**
   Copy the generated `database_id` into your root `wrangler.toml` under `[[d1_databases]]`.

4. **Execute Migrations on Production D1:**
   Apply the initial schema and seed catalog:
   ```bash
   # Run schema table creation
   npx wrangler d1 execute barebones3d-db --remote --file=./migrations/0001_initial_schema.sql

   # Run seed parts catalog
   npx wrangler d1 execute barebones3d-db --remote --file=./migrations/0002_seed_parts.sql
   ```

5. **Verify Database Records:**
   ```bash
   npx wrangler d1 execute barebones3d-db --remote --command="SELECT slug, oem_part_number, material_spec, is_commercial_allowed FROM parts;"
   ```

---

### 2.2 R2 Storage Bucket Creation & Public Domain

1. **Create the R2 Bucket for STLs and Photography:**
   ```bash
   npx wrangler r2 bucket create barebones3d-assets
   ```

2. **Configure Public Access / Custom Domain for Fast CDN Downloads:**
   * Go to **Cloudflare Dashboard** &rarr; **R2 Object Storage** &rarr; Select `barebones3d-assets`.
   * Click **Settings** &rarr; **Public Access**.
   * Under **Custom Domains**, click **Connect Domain**.
   * Enter: `assets.barebones3d.com` and click **Continue**.
   * Cloudflare automatically provisions an SSL certificate and DNS CNAME record.
   * *Alternative:* If using an R2 managed `r2.dev` subdomain, click **Allow Access** under *R2.dev subdomain*.

3. **Upload Seed STL Files to R2:**
   Upload your `.stl` files to match the keys defined in the parts catalog (e.g., `parts/<slug>.stl`):
   ```bash
   npx wrangler r2 object put barebones3d-assets/parts/subaru-blend-door-gear-72131-fg000.stl --file=./scratch/subaru_gear.stl
   npx wrangler r2 object put barebones3d-assets/parts/whirlpool-dishwasher-rack-wheel-w10195416.stl --file=./scratch/whirlpool_wheel.stl
   npx wrangler r2 object put barebones3d-assets/parts/toyota-vent-clip-55670-0c010.stl --file=./scratch/toyota_clip.stl
   npx wrangler r2 object put barebones3d-assets/parts/bosch-drain-filter-handle-00605010.stl --file=./scratch/bosch_handle.stl
   npx wrangler r2 object put barebones3d-assets/parts/pioneer-turntable-anti-skate-arm-wa-104.stl --file=./scratch/pioneer_arm.stl
   ```

---

### 2.3 Cloudflare Pages Project & Bindings

1. **Verify Pages Build Directory:**
   The output directory is configured as `site` in `wrangler.toml` and package build scripts.

2. **Link Project to Cloudflare Pages:**
   ```bash
   npx wrangler pages project create barebones3d --production-branch main
   ```

3. **Bind D1 and R2 to Pages in Cloudflare Dashboard:**
   * Go to **Workers & Pages** &rarr; **barebones3d** &rarr; **Settings** &rarr; **Functions**.
   * Under **D1 database bindings**:
     * Variable name: `DB`
     * D1 database: `barebones3d-db`
   * Under **R2 bucket bindings**:
     * Variable name: `BUCKET_ASSETS`
     * R2 bucket: `barebones3d-assets`
   * Under **Compatibility Flags**: Ensure `nodejs_compat` is enabled.

---

### 2.4 Custom Domain & DNS Records

1. In **Cloudflare Dashboard** &rarr; **Workers & Pages** &rarr; **barebones3d** &rarr; **Custom domains**:
   * Add: `barebones3d.com`
   * Add: `www.barebones3d.com`
2. Ensure DNS records in Cloudflare DNS are set to **Proxied (Orange Cloud)**.

---

## 3. Stripe Payment & Webhook Configuration

### 3.1 API Keys & Account Capabilities

1. Log in to the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Navigate to **Developers** &rarr; **API Keys**.
3. Obtain:
   * **Publishable Key:** `pk_live_...` (or `pk_test_...` for staging)
   * **Secret Key:** `rk_live_...` or `sk_live_...` (Restricted Key recommended with permissions: `Checkout Sessions: Write`, `Customers: Read`, `Tax: Read`).

### 3.2 Stripe Tax & Address Collection Setup

1. In the Stripe Dashboard, go to **Settings** &rarr; **Tax**.
2. Click **Activate Stripe Tax**.
3. Set your origin address (e.g., North Carolina, USA) and default tax code:
   * Default Tax Category: `General - Tangible Goods` (`txcd_99999999`).
4. Our checkout endpoint automatically passes:
   * `automatic_tax: { enabled: true }`
   * `shipping_address_collection: { allowed_countries: ['US', 'CA'] }`

### 3.3 Webhook Endpoint Registration & Signing Secret

1. Navigate to **Developers** &rarr; **Webhooks** &rarr; **Add destination**.
2. Set Endpoint URL:
   ```text
   https://barebones3d.com/api/webhooks/stripe
   ```
3. Under **Events to send**, select:
   * `checkout.session.completed`
4. Click **Add endpoint**.
5. Reveal the **Signing Secret** (`whsec_...`).
6. Securely set this secret in Cloudflare Pages (see Section 5).

---

## 4. Slant 3D Print-on-Demand (POD) Setup

### 4.1 Account Registration & API Key

1. Sign up or log in at [Slant 3D API Portal](https://www.slant3d.com/) (or Slant 3D Teleport).
2. Navigate to **Developer Settings** / **API Credentials**.
3. Generate a new API Key:
   * Label: `Barebones 3D Production Worker`
   * Copy the generated key (`s3d_live_...`).

### 4.2 Manufacturing Balance & Default Payment Method

1. Go to **Billing** in Slant 3D.
2. Add a corporate credit card or pre-fund a manufacturing deposit balance.
3. Automated orders submitted via the `/orders` endpoint will draw against this deposit as parts are sliced and queued on the print farm.

### 4.3 Material & Slicing Specifications

Barebones 3D parts are mapped in `src/lib/fulfillment/slant3d.ts`:
| Part Type / Application | Barebones Spec | Slant 3D Filament | Infill |
|---|---|---|---|
| Automotive Under-Hood & Interior | Automotive ASA | ASA Black | 100% Solid |
| Automotive High-Wear Drive Gears | Nylon PA12 | Nylon PA12 Black | 100% Solid |
| Appliances & Dishwasher Racks | Food-Safe PETG | PETG Black / Natural | 100% Solid |
| Washing Machine Drain Grips | Reinforced PETG | PETG Black | 100% Solid |

---

## 5. Environment Variables & Secret Provisioning

### 5.1 Setting Production Secrets via Wrangler

Secrets must **never** be committed to version control. Set them directly in Cloudflare Pages using Wrangler CLI:

```bash
# 1. Stripe Secret Key
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name barebones3d
# (Paste your secret key when prompted)

# 2. Stripe Webhook Signing Secret (whsec_...)
npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name barebones3d
# (Paste your whsec_ key when prompted)

# 3. Slant 3D API Key
npx wrangler pages secret put SLANT3D_API_KEY --project-name barebones3d
# (Paste your Slant 3D key when prompted)
```

### 5.2 Complete `.env.production` Template

Create a local `.env.production` (or `.env.production.local`) for reference:

```env
# ==============================================================================
# BAREBONES 3D PRODUCTION ENVIRONMENT VARIABLES (.env.production)
# ==============================================================================

# Application Environment & Domains
APP_ENV="production"
SITE_URL="https://barebones3d.com"
PUBLIC_BUCKET_URL="https://assets.barebones3d.com"

# Cloudflare D1 Database Binding Name
D1_DATABASE_NAME="barebones3d-db"

# Cloudflare R2 Storage Bucket Name
R2_BUCKET_NAME="barebones3d-assets"

# Stripe Payments & Checkout Configuration
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key_here"
STRIPE_SECRET_KEY="rk_live_your_stripe_restricted_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_signing_secret_here"

# Slant 3D Print-on-Demand Dropshipping API
FULFILLMENT_PROVIDER="slant3d"
SLANT3D_API_URL="https://api.slant3d.com/v1"
SLANT3D_API_KEY="s3d_live_your_slant3d_api_key_here"

# Mock Services Switch (Set to "false" for live production processing)
MOCK_SERVICES="false"
```

---

## 6. Ingestion & Discovery Operations CLI

Operators can continuously expand the obsolete OEM catalog using the included CLI tools:

### Discovery Mode (Find New Commercially Viable Parts):
```bash
# Scan for obsolete automotive clips
npm run discover -- --query "clip"

# Scan for HVAC blend door gears
npm run discover -- --query "gear"

# Output entire prioritized candidate matrix
npm run discover
```

### Ingestion Mode (Import Model from Printables/Thingiverse):
```bash
# Ingest and validate license (saves draft JSON payload in scratch/)
npm run ingest -- --url "https://www.printables.com/model/18294-bmw-e46-sunroof-clips" --oem "54107134072" --material "Automotive ASA" --price 1599

# Ingest and automatically append to production D1 seed migration:
npm run ingest -- --url "https://www.printables.com/model/18294-bmw-e46-sunroof-clips" --oem "54107134072" --material "Automotive ASA" --price 1599 --apply

# Re-build static guide pages after applying new parts:
npm run build:guides
```

---

## 7. Verification & Health Checks

Perform these verification checks prior to public traffic launch:

1. **Run Full Verification Test Suite:**
   ```bash
   npm test
   ```
   *Expected:* All 53 CAD math generators and all 22 Platform/E-Commerce tests pass with 100% pass rate.

2. **Run TypeScript Compiler Validation:**
   ```bash
   npm run typecheck
   ```
   *Expected:* Zero errors (`Found 0 errors`).

3. **Run Production Build:**
   ```bash
   npm run build
   ```
   *Expected:* Builds React/Three CAD studio, copies distribution to `site/generator/`, and compiles all static repair guides to `site/guides/[slug]/index.html`.

4. **Verify Live Edge Endpoints:**
   * **Catalog Hub:** `https://barebones3d.com/guides/`
   * **Subaru Repair Guide:** `https://barebones3d.com/guides/subaru-blend-door-actuator-gear-72131-fg000/`
   * **Checkout Initiation API:** `POST https://barebones3d.com/api/checkout` with `{"partId":"part_subaru_blend_door_72131"}`
   * **Stripe Webhook Listener:** `POST https://barebones3d.com/api/webhooks/stripe`
   * **STL Download Stream:** `GET https://barebones3d.com/api/parts/part_subaru_blend_door_72131/download`
   * **Client-Side CAD Engine:** `https://barebones3d.com/generator/`

---

## 8. LLM-Native Retrieval, Remote MCP & Agentic Commerce

`barebones3d.com` provides first-class native infrastructure for AI search crawlers (Perplexity, ChatGPT Search, Claude), agentic purchasing systems, and visual identification models.

### 8.1 Testing /llms.txt and Content Negotiation via curl

The platform serves token-efficient plain text and Markdown endpoints designed for direct ingestion by large language models:

#### 1. Retrieve the Summary Manifest (`/llms.txt`):
```bash
curl -i https://barebones3d.com/llms.txt
```
*Expected Headers:*
* `Content-Type: text/plain; charset=utf-8`
* `Cache-Control: public, max-age=3600, s-maxage=86400`
*Expected Body:* H1 `# barebones3d.com`, platform mission blockquote, active parts catalog with OEM numbers, materials, prices, and links to developer interfaces.

#### 2. Retrieve the Full Repository Guide Manifest (`/llms-full.txt`):
```bash
curl -i https://barebones3d.com/llms-full.txt
```
*Expected:* The full catalog summary followed by the concatenated Markdown text of all published repair guides with complete disassembly steps, tool lists, and manufacturing tolerances.

#### 3. Test Markdown Content Negotiation via `Accept: text/markdown`:
Automated LLM agents pass the `Accept: text/markdown` header to retrieve pure Markdown with YAML frontmatter without downloading bulky HTML/CSS:
```bash
curl -i -H "Accept: text/markdown" https://barebones3d.com/guides/subaru-blend-door-actuator-gear-72131-fg000
```

#### 4. Test Direct `.md` Extension Route:
```bash
curl -i https://barebones3d.com/guides/subaru-blend-door-actuator-gear-72131-fg000.md
```

#### 5. Test AI User-Agent Auto-Negotiation:
Verified search bot crawlers automatically receive clean Markdown:
```bash
curl -i -A "ClaudeBot/1.0" https://barebones3d.com/guides/subaru-blend-door-actuator-gear-72131-fg000
curl -i -A "GPTBot/1.0" https://barebones3d.com/guides/subaru-blend-door-actuator-gear-72131-fg000
curl -i -A "PerplexityBot/1.0" https://barebones3d.com/guides/subaru-blend-door-actuator-gear-72131-fg000
```
*Expected Response:*
* `Content-Type: text/markdown; charset=utf-8`
* `Vary: Accept, User-Agent`
* YAML frontmatter block containing `title`, `oem_part_number`, `material`, `price_cents`, `download_stl_url`, and `checkout_api_url`.

#### 6. Test Part Search API:
```bash
curl -i "https://barebones3d.com/api/parts/search?q=72131-FG000"
```

#### 7. Test Agent Checkout Initiation:
```bash
curl -i -X POST https://barebones3d.com/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{"part_id": "part_subaru_blend_door_72131"}'
```
*Expected Output:*
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_live_...",
  "session_id": "cs_live_...",
  "expires_at": "..."
}
```

---

### 8.2 Connecting Remote MCP Server to Claude Desktop

The Barebones 3D Model Context Protocol (MCP) server runs at `/api/mcp` as a streamable JSON-RPC 2.0 endpoint. It exposes two core tools to LLM assistants:
1. `find_obsolete_part`: Search catalog by OEM number, vehicle make/model, or appliance name to retrieve technical fitment, material specifications, and repair overviews.
2. `generate_purchase_link`: Generates a direct pre-filled Stripe Checkout link for commercial reproduction parts (with automatic non-commercial license enforcement).

#### Configuration:
Add the `barebones3d` remote server entry to your Claude Desktop configuration file:
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "barebones3d": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://barebones3d.com/api/mcp"
      ]
    }
  }
}
```

#### Verification in Claude Desktop:
1. Restart Claude Desktop.
2. In a conversation, click the **Tools (hammer)** icon in the prompt box.
3. Confirm that `find_obsolete_part` and `generate_purchase_link` appear in the active tools list.
4. Test with a natural language query:
   > *"My 2011 Subaru Impreza heater won't switch between hot and cold air. Is there a 3D printed replacement gear available on barebones3d?"*
   *Claude Desktop will invoke `find_obsolete_part({"query": "Subaru Impreza blend door gear"})` and provide the OEM fitment details, recommended Nylon PA12 material, and guide link.*
5. Follow up with purchase request:
   > *"Please generate a purchase link for that part."*
   *Claude Desktop will invoke `generate_purchase_link({"part_id": "subaru-blend-door-actuator-gear-72131-fg000"})` and return the secure Stripe Checkout URL.*

---

### 8.3 Testing Tools with MCP Inspector

You can test and debug the MCP endpoints locally or against production using Anthropic's official MCP Inspector:

1. **Launch the MCP Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector
   ```
2. In the Inspector UI:
   * **Transport Type:** Select `HTTP (Streamable)` or `SSE Proxy`.
   * **Target URL:**
     * *Local Development:* `http://localhost:8788/api/mcp` (when running `npx wrangler pages dev site`)
     * *Production:* `https://barebones3d.com/api/mcp`
   * Click **Connect**.
3. **Verify Tool List:**
   Click **List Tools**. The inspector should display:
   * `find_obsolete_part`
   * `generate_purchase_link`
4. **Execute `find_obsolete_part`:**
   * Arguments:
     ```json
     {
       "query": "72131-FG000"
     }
     ```
   * Click **Run Tool**. Confirm `isError: false` and text block returning technical specifications for the Subaru split gear.
5. **Execute `generate_purchase_link` (Commercial Part):**
   * Arguments:
     ```json
     {
       "part_id": "part_subaru_blend_door_72131"
     }
     ```
   * Confirm that a valid Stripe Checkout session URL is returned.
6. **Verify Non-Commercial License Protection:**
   * Arguments:
     ```json
     {
       "part_id": "pioneer-turntable-anti-skate-arm-wa-104"
     }
     ```
   * Confirm `isError: true` and that the response explains commercial reproduction is restricted by the creator's CC BY-NC license, directing the user to the free STL download.

---

### 8.4 Cloudflare WAF & Bot Management Recommendations

To maximize visibility across conversational AI engines while preventing hostile content scrapers, configure Cloudflare WAF as follows:

1. **Navigate to Cloudflare Dashboard:**
   Go to your `barebones3d.com` zone &rarr; **Security** &rarr; **WAF** &rarr; **Custom Rules**.

2. **Rule 1: Allow Verified AI Search Crawlers & Autonomous Agents (Priority 1):**
   * **Rule Name:** `Allow-Verified-AI-Crawlers`
   * **Filter Expression:**
     ```
     (cf.client.bot and (
       http.user_agent contains "GPTBot" or
       http.user_agent contains "ClaudeBot" or
       http.user_agent contains "PerplexityBot" or
       http.user_agent contains "Google-Extended" or
       http.user_agent contains "Amazonbot" or
       http.user_agent contains "Applebot-Extended"
     ))
     ```
   * **Action:** **Skip**
   * **Skip Options:** Select:
     * *All remaining custom rules*
     * *Rate Limiting rules*
     * *Bot Management / Managed Challenge*
   * *Rationale:* Allows search retrieval indexing and user-directed AI assistants to ingest token-efficient Markdown without getting blocked by Cloudflare captchas or rate limits.

3. **Rule 2: Protect Agent Checkout Rate Limiting (Priority 2):**
   Go to **Security** &rarr; **WAF** &rarr; **Rate limiting rules**:
   * **Rule Name:** `Protect-Agent-Checkout-API`
   * **Filter Expression:**
     ```
     (http.request.uri.path eq "/api/checkout/create" and http.request.method eq "POST")
     ```
   * **Characteristics:** `IP`
   * **Rate:** 20 requests per 1 minute.
   * **Action:** **Managed Challenge**
   * *Rationale:* Prevents card-testing bot attacks and abusive automated order link generation.

4. **Rule 3: Cloudflare Bot Fight Mode:**
   Go to **Security** &rarr; **Bots**:
   * Enable **Bot Fight Mode** (or **Super Bot Fight Mode** on Pro/Business plans).
   * Set *Definitely Automated* traffic to **Block** or **Managed Challenge**.
   * Cloudflare automatically validates cryptographic signatures and IP ranges for certified bots (e.g., `cf.client.bot = true`), ensuring your `Allow-Verified-AI-Crawlers` rule exempts legitimate retrieval bots.

