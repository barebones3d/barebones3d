import type { Part, Guide } from '../types/database.ts';
import { generateHowToSchema, generateProductSchema } from '../lib/seo.ts';
import { buildAmazonSearchUrl, isCheaperOnAmazon, getPartAmazonSearchQuery } from '../lib/affiliate.ts';
import { generateThreeViewOrthographic, generateStepBlueprintSvg } from '../lib/technicalDrawings.ts';

export function renderGuideHtml(part: Part, guide: Guide, siteUrl: string): string {
  const howToSchema = generateHowToSchema(part, guide, siteUrl);
  const productSchema = generateProductSchema(part, siteUrl);
  const priceDollars = (part.retail_price_cents / 100).toFixed(2);
  const primaryMake = part.compatible_makes_models[0]?.make || 'OEM';
  const partAmazonUrl = buildAmazonSearchUrl(getPartAmazonSearchQuery(part.title, part.oem_part_number));
  const isCommodityCheaperOnAmazon = isCheaperOnAmazon(part.id, part.oem_part_number);
  const threeViews = generateThreeViewOrthographic(part);

  const makesHtml = part.compatible_makes_models.map(c => {
    const label = c.model.toLowerCase().startsWith(c.make.toLowerCase())
      ? c.model
      : `${c.make} ${c.model}`;
    return `
    <span class="compat-tag">
      <strong>${label}</strong>
      ${c.year_start ? `<span class="compat-years">(${c.year_start}–${c.year_end || 'Present'})</span>` : ''}
    </span>
  `;
  }).join('');

  const supersededHtml = part.superseded_numbers.length > 0 
    ? `<div class="meta-row"><span class="meta-label">Supersedes OEM:</span> <span class="meta-val font-mono">${part.superseded_numbers.join(', ')}</span></div>`
    : '';

  const toolsHtml = guide.tools_needed.map(t => {
    const toolAmazonUrl = buildAmazonSearchUrl(t.amazon_search_keyword || t.name);
    return `
    <div class="tool-card">
      <span class="tool-icon">🔧</span>
      <div class="tool-info">
        <div class="tool-name">${t.name}</div>
        ${t.purpose ? `<div class="tool-purpose">${t.purpose}</div>` : ''}
        <a href="${toolAmazonUrl}" target="_blank" rel="nofollow noopener sponsored" class="tool-amazon-link" title="Search ${t.name} on Amazon">
          <span>Check on Amazon &rarr;</span>
        </a>
      </div>
    </div>
  `;
  }).join('');

  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  const stepsHtml = guide.steps.map(step => {
    const altText = `Technical installation procedure for ${part.title} (OEM #${part.oem_part_number}) - Step ${step.step_number}: ${step.title}`;
    const stepVisualHtml = step.svg_code
      ? `<div class="step-visual-slot">${step.svg_code}</div>`
      : step.image_url
        ? `<div class="step-visual-slot">
            <img 
              src="${step.image_url.startsWith('http') ? step.image_url : `${cleanSiteUrl}${step.image_url}`}"
              alt="${altText}"
              width="800"
              height="450"
              loading="lazy"
              class="step-visual-img"
              onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='block';"
            />
            <div class="step-svg-fallback" style="display: none;">
              ${generateStepBlueprintSvg(step, part, step.step_number)}
            </div>
          </div>`
        : `<div class="step-visual-slot">${generateStepBlueprintSvg(step, part, step.step_number)}</div>`;

    return `
    <article class="step-card" id="step-${step.step_number}">
      <div class="step-header">
        <span class="step-badge">STEP ${String(step.step_number).padStart(2, '0')}</span>
        <h3 class="step-title">${step.title}</h3>
      </div>
      <div class="step-body">
        <p class="step-text">${step.text}</p>
        ${step.tip ? `
          <div class="step-callout tip">
            <span class="callout-icon">💡</span>
            <div><strong>Pro Tip:</strong> ${step.tip}</div>
          </div>
        ` : ''}
        ${step.warning ? `
          <div class="step-callout warning">
            <span class="callout-icon">⚠️</span>
            <div><strong>Caution:</strong> ${step.warning}</div>
          </div>
        ` : ''}
        ${stepVisualHtml}
      </div>
    </article>
  `;
  }).join('');

  const faqHtml = guide.faq.map(item => `
    <details class="faq-item">
      <summary class="faq-question">${item.question}</summary>
      <div class="faq-answer">${item.answer}</div>
    </details>
  `).join('');

  const isToyotaTab = part.oem_part_number === '55670-0C010';

  // Commercial print-on-demand card (Active POD models only)
  const commercialActionBoxHtml = `
    <div class="action-card action-commercial">
      <div class="action-badge-row">
        <span class="action-pill-cyan">PRINT-ON-DEMAND</span>
        <span class="action-pill-lead">⚡ Ships in 48h</span>
      </div>
      <h3 class="action-title">Order Reproduction Part</h3>
      <div class="action-price-row">
        <span class="action-price" id="action-price-val">$${priceDollars}</span>
        <span class="action-currency">USD</span>
      </div>
      ${isToyotaTab ? `
      <div class="bundle-selector" style="margin: 0.85rem 0; padding: 0.75rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px;">
        <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #94a3b8; margin-bottom: 0.5rem; letter-spacing: 0.05em;">Select Quantity Option</div>
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0.5rem; cursor: pointer; border-radius: 6px; font-size: 0.9rem; color: #f8fafc;">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="radio" name="variant-option" value="single" checked style="accent-color: #06b6d4;">
            <span>Single Tab</span>
          </span>
          <span style="font-weight: 700; color: #38bdf8;">$15.00</span>
        </label>
        <label style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0.5rem; cursor: pointer; border-radius: 6px; font-size: 0.9rem; color: #f8fafc; background: rgba(56, 189, 248, 0.06); margin-top: 0.25rem;">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="radio" name="variant-option" value="2-pack" style="accent-color: #06b6d4;">
            <span>2-Pack Driver &amp; Passenger Bundle</span>
          </span>
          <span style="font-weight: 700; color: #34d399;">$24.00 <span style="font-size: 0.75rem; color: #10b981; font-weight: 800;">(SAVE $6)</span></span>
        </label>
      </div>
      <div class="bundle-callout" style="margin-bottom: 0.75rem; font-size: 0.8rem; color: #38bdf8; display: flex; align-items: center; gap: 0.4rem;">
        <span>✨</span> <em>Includes 2-pack bundle option at checkout</em>
      </div>
      ` : ''}
      <ul class="action-features">
        <li><strong>Material:</strong> Industrial ${part.material_spec} (100% Solid)</li>
        <li><strong>Fulfillment:</strong> Slant 3D Automated POD Manufacturing</li>
        <li><strong>Tolerance:</strong> Guaranteed precision direct bolt-on fit</li>
        <li><strong>Taxes & Shipping:</strong> Calculated securely at Stripe checkout</li>
      </ul>
      <button id="buy-button" class="btn-primary buy-btn" data-part-id="${part.id}">
        <span id="buy-button-text">Order Reproduction Part &bull; $${priceDollars}</span>
        <span class="btn-arrow">&rarr;</span>
      </button>
      <div id="buy-error" class="action-error" style="display: none;"></div>
      <div class="action-footnote">🔒 Powered by Stripe Checkout &bull; Address &amp; Tax Verified</div>
    </div>
  `;

  // Dynamic Sidebar Action Console based on operational catalog status
  let sidebarActionsHtml = '';

  if (part.status === 'cad_waitlist') {
    sidebarActionsHtml = `
      <!-- CAD Waitlist Engineering Production Card -->
      <div class="action-card action-waitlist" id="cad-waitlist" style="border-color: rgba(168, 85, 247, 0.45); background: linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%);">
        <div class="action-badge-row">
          <span class="action-pill-purple" style="background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.5); color: #c084fc; font-weight: 700; font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); text-transform: uppercase;">ENGINEERING VALIDATION</span>
          <span class="action-pill-lead" style="color: #c084fc;">⚡ Batch 1 Priority</span>
        </div>
        <h3 class="action-title" style="color: #f1f5f9; margin-top: 0.5rem;">Join Production Waitlist</h3>
        <p class="nc-explanation" style="font-size: 0.88rem; line-height: 1.5; color: #cbd5e1; margin: 0.75rem 0 1rem 0;">
          High-precision CAD model in engineering validation. Enter your email to be notified when the first SLS Nylon batch ships.
        </p>

        <form id="waitlist-form" class="waitlist-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <input 
            type="email" 
            id="waitlist-email" 
            required 
            placeholder="your.email@example.com" 
            style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: rgba(10, 15, 29, 0.9); border: 1px solid rgba(168, 85, 247, 0.4); color: #fff; font-size: 0.9rem;"
          />
          <button type="submit" id="waitlist-btn" class="btn-primary" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; font-weight: 800; justify-content: center; width: 100%; padding: 0.85rem 1rem; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.35);">
            <span>🔔 Join Production Waitlist &rarr;</span>
          </button>
        </form>
        <div id="waitlist-success" style="display: none; padding: 0.85rem; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: var(--radius-sm); color: #4ade80; font-size: 0.85rem; text-align: center; margin-top: 0.75rem;">
          ✓ You're on the list! We'll alert you the moment Batch 1 SLS Nylon production begins.
        </div>
        <div class="action-footnote" style="margin-top: 0.75rem; font-size: 0.72rem; color: #94a3b8; text-align: center;">
          🔒 Zero spam &bull; Direct engineering status updates only
        </div>
      </div>

      <!-- Disabled STL Card (CAD Under Development) -->
      <div class="action-card action-disabled-stl" style="margin-top: 1rem; border: 1px dashed rgba(148, 163, 184, 0.25); background: rgba(15, 23, 42, 0.5);">
        <div class="action-badge-row">
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: #94a3b8; background: rgba(148, 163, 184, 0.1); padding: 0.15rem 0.5rem; border-radius: 4px;">CAD UNDER DEVELOPMENT</span>
        </div>
        <h3 class="action-title" style="font-size: 1rem; color: #94a3b8; margin: 0.5rem 0 0.35rem 0;">Digital STL Not Ready</h3>
        <p class="action-desc" style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.85rem;">
          Tolerance calibration and FEA stress testing are currently in progress. STL download will unlock upon validation.
        </p>
        <div class="btn-disabled">
          <span>🔒 CAD Under Development</span>
        </div>
      </div>

      <!-- Amazon OEM Alternative Search Card -->
      <div class="action-card action-amazon" style="margin-top: 1rem; border-color: rgba(245, 158, 11, 0.35);">
        <div class="action-badge-row">
          <span class="action-pill-amber">🛒 AMAZON EQUIVALENT</span>
          <span class="action-pill-lead">⚡ Prime Search</span>
        </div>
        <h3 class="action-title" style="font-size: 1.05rem;">Need Immediate Replacement?</h3>
        <p class="nc-explanation" style="font-size: 0.8rem; margin-bottom: 0.75rem;">
          While our engineering team validates this CAD model, search active manufacturer or aftermarket listings for OEM #${part.oem_part_number} on Amazon:
        </p>
        <a href="${partAmazonUrl}" target="_blank" rel="nofollow noopener sponsored" class="btn-amazon" style="display: flex; width: 100%; text-align: center; justify-content: center; padding: 0.65rem 1rem; font-size: 0.85rem; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; border-radius: var(--radius-sm); font-weight: 700; text-decoration: none;">
          <span>🔍 Search #${part.oem_part_number} on Amazon &rarr;</span>
        </a>
      </div>
    `;
  } else if (part.status === 'affiliate_only') {
    sidebarActionsHtml = `
      <!-- Emphasized Amazon Multi-Pack Card -->
      <div class="action-card action-amazon" style="border-color: rgba(245, 158, 11, 0.5); background: linear-gradient(180deg, rgba(245, 158, 11, 0.09) 0%, rgba(15, 23, 42, 0.95) 100%);">
        <div class="action-badge-row">
          <span class="action-pill-amber">🛒 AMAZON COMMODITY PACK</span>
          <span class="action-pill-lead">⚡ Prime 1-Day</span>
        </div>
        <h3 class="action-title">Order Multi-Pack on Amazon</h3>
        <div class="action-price-row">
          <span class="action-price" style="color: #f59e0b;">$7–$12</span>
          <span class="action-currency">USD / Multi-Pack</span>
        </div>
        <p class="nc-explanation" style="margin: 0.75rem 0 1rem 0; font-size: 0.88rem; line-height: 1.5;">
          <strong>Cheaper than 3D Printing:</strong> Mass injection-molded multi-packs for OEM #${part.oem_part_number} are readily available on Amazon for less than the cost of custom manufacturing. If you need a fast repair, order the multi-pack with Prime delivery:
        </p>
        <a href="${partAmazonUrl}" target="_blank" rel="nofollow noopener sponsored" class="btn-primary buy-btn" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 800; text-decoration: none; justify-content: center; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);">
          <span>🛒 Order Multi-Pack on Amazon &rarr;</span>
        </a>
        <div class="action-footnote" style="margin-top: 0.75rem; font-size: 0.72rem; color: #94a3b8; text-align: center;">
          📦 Ships via Amazon Prime &bull; Verified OEM Fitment
        </div>
      </div>

      <!-- Free STL Download Option (Open Source DIY) -->
      <div class="action-card action-free" style="margin-top: 1rem;">
        <div class="action-badge-row">
          <span class="action-pill-green">100% FREE &amp; OPEN SOURCE</span>
          <span class="action-pill-license">${part.license_type}</span>
        </div>
        <h3 class="action-title">Digital STL Download Only</h3>
        <p class="action-desc">
          Have your own 3D printer? Download the slicer-ready 3D model (+0.15mm mechanical tolerance) for personal DIY printing on Bambu, Prusa, or any FDM/SLA machine.
        </p>
        <a href="/api/parts/${part.id}/download" class="btn-secondary download-btn" download>
          <span>📥 Download Free STL (.stl)</span>
        </a>
        <div class="action-specs-compact">
          <span>Slicer: 0.12–0.16mm</span> &bull; 
          <span>Infill: 100% solid</span>
        </div>
      </div>
    `;
  } else {
    // Active POD (CC0 / CC BY verified models)
    sidebarActionsHtml = `
      <!-- Commercial Print-on-Demand Action Card -->
      ${commercialActionBoxHtml}

      <!-- Free Download Action Card -->
      <div class="action-card action-free" style="margin-top: 1rem;">
        <div class="action-badge-row">
          <span class="action-pill-green">100% FREE &amp; OPEN SOURCE</span>
          <span class="action-pill-license">${part.license_type}</span>
        </div>
        <h3 class="action-title">Download Free STL</h3>
        <p class="action-desc">
          Direct slicer-ready 3D model with pre-compensated mechanical tolerances (+0.15mm) for FDM and SLA printers.
        </p>
        <a href="/api/parts/${part.id}/download" class="btn-secondary download-btn" download>
          <span>📥 Download Free STL (.stl)</span>
        </a>
        <div class="action-specs-compact">
          <span>Slicer: 0.12–0.16mm layer height</span> &bull; 
          <span>Infill: 100% solid</span>
        </div>
      </div>

      <!-- Amazon OEM Equivalent Sourcing Card -->
      <div class="action-card action-amazon" style="margin-top: 1rem; border-color: rgba(245, 158, 11, 0.35);">
        <div class="action-badge-row">
          <span class="action-pill-amber">🛒 AMAZON EQUIVALENT</span>
          <span class="action-pill-lead">⚡ Prime Search</span>
        </div>
        <h3 class="action-title" style="font-size: 1.05rem;">Looking for Off-the-Shelf Part?</h3>
        <p class="nc-explanation" style="font-size: 0.8rem; margin-bottom: 0.75rem;">
          Need an OEM or aftermarket replacement? Search active catalog listings for #${part.oem_part_number} on Amazon:
        </p>
        <a href="${partAmazonUrl}" target="_blank" rel="nofollow noopener sponsored" class="btn-amazon" style="display: flex; width: 100%; text-align: center; justify-content: center; padding: 0.65rem 1rem; font-size: 0.85rem; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #f59e0b; border-radius: var(--radius-sm); font-weight: 700; text-decoration: none;">
          <span>🔍 Search #${part.oem_part_number} on Amazon &rarr;</span>
        </a>
      </div>
    `;
  }


  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${part.title} (OEM #${part.oem_part_number}) Repair Guide &amp; STL | Barebones 3D</title>
  <meta name="description" content="Free DIY repair guide, installation tutorial, and open-source 3D printable STL for ${part.title} (OEM #${part.oem_part_number}). Compatible with ${primaryMake}. Manufactured in ${part.material_spec}.">
  <link rel="canonical" href="${siteUrl.replace(/\/$/, '')}/guides/${part.slug}">
  <link rel="alternate" type="text/markdown" href="${siteUrl.replace(/\/$/, '')}/guides/${part.slug}.md" title="${part.title} Markdown Document">

  <!-- Google Fonts Preconnect & Async Display -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">

  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/guides.css">

  <!-- Schema.org JSON-LD Structured Data: HowTo & Product -->
  <script type="application/ld+json">
  ${JSON.stringify(howToSchema, null, 2)}
  </script>
  ${part.is_commercial_allowed ? `
  <script type="application/ld+json">
  ${JSON.stringify(productSchema, null, 2)}
  </script>` : ''}
</head>
<body>

  <!-- Navigation Header -->
  <header class="header-nav">
    <div class="nav-container">
      <a href="/" class="brand-logo">
        <span class="logo-badge">BB-3D</span>
        <span>BAREBONES 3D</span>
      </a>
      <nav class="nav-links" aria-label="Main Navigation">
        <a href="/guides/" style="color: #38bdf8; font-weight: 700;">Repair Guides &amp; Parts</a>
        <a href="/generator/" style="color: #38bdf8; font-weight: 700; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); padding: 0.35rem 0.75rem; border-radius: 6px;">⚡ 3D CAD Generator</a>
        <a href="/#network">Diagnostic Network</a>
        <a href="/contact">Contact</a>
      </nav>
    </div>
  </header>

  <!-- Breadcrumbs -->
  <nav class="guide-breadcrumbs" aria-label="Breadcrumb">
    <div class="breadcrumbs-container">
      <a href="/">Home</a>
      <span class="crumb-sep">/</span>
      <a href="/guides/">Repair Guides</a>
      <span class="crumb-sep">/</span>
      <span class="crumb-current">${part.title}</span>
    </div>
  </nav>

  <!-- Main Content Container -->
  <main class="guide-main">
    <div class="guide-layout">

      <!-- Left Column: Primary Content -->
      <div class="guide-content-col">
        
        <!-- Header & OEM Meta -->
        <header class="guide-header-card">
          <div class="guide-tag-row">
            <span class="tag-pill cyan">OBSOLETE OEM REPLACEMENT</span>
            <span class="tag-pill blue">${part.material_spec}</span>
            ${part.status === 'cad_waitlist' 
              ? `<span class="tag-pill purple">CAD UNDER DEVELOPMENT</span>`
              : part.status === 'affiliate_only'
                ? `<span class="tag-pill amber">COMMODITY / FREE STL</span>`
                : `<span class="tag-pill green">COMMERCIAL POD AVAILABLE</span>`
            }
          </div>

          <h1 class="guide-main-title">${part.title}</h1>
          
          <div class="oem-spec-grid">
            <div class="oem-spec-box">
              <span class="spec-label">OEM Part Number</span>
              <span class="spec-value font-mono">${part.oem_part_number}</span>
            </div>
            <div class="oem-spec-box">
              <span class="spec-label">Material Spec</span>
              <span class="spec-value">${part.material_spec}</span>
            </div>
            <div class="oem-spec-box">
              <span class="spec-label">Repair Difficulty</span>
              <span class="spec-value">${guide.difficulty}</span>
            </div>
            <div class="oem-spec-box">
              <span class="spec-label">Time Estimate</span>
              <span class="spec-value">${guide.time_estimate}</span>
            </div>
          </div>

          ${supersededHtml}

          <div class="compat-section">
            <span class="meta-label">Confirmed Make &amp; Model Compatibility:</span>
            <div class="compat-list">
              ${makesHtml}
            </div>
          </div>

          <div class="amazon-oem-search-row">
            <div class="amazon-search-info">
              <span class="amazon-search-badge">AMAZON CATALOG SEARCH</span>
              <span class="amazon-search-label">Need factory OEM assembly or hardware?</span>
            </div>
            <a href="${partAmazonUrl}" target="_blank" rel="nofollow noopener sponsored" class="amazon-search-inline-btn" title="Search ${part.oem_part_number} on Amazon">
              <span>Search Amazon Catalog &rarr;</span>
            </a>
          </div>
        </header>

        <!-- Static-First Technical Orthographic Projections (Three-View CAD Layout) -->
        <section class="technical-views-section">
          <div class="technical-views-header">
            <div class="tech-header-title">
              <span class="tech-pill">TECHNICAL BLUEPRINT</span>
              <h2>Engineering Orthographic Projections</h2>
            </div>
            <span class="tech-sub">Watertight 2-Manifold Solid &bull; Scale 1:1 Projections &bull; Tol &plusmn;0.15mm</span>
          </div>

          <div class="technical-views-grid">
            <!-- View 1: Isometric Projection with 3D Orbit Modal Trigger -->
            <div class="tech-view-card is-isometric">
              <div class="tech-view-label">
                <span class="view-tag">ISO 3D</span>
                <span class="view-name">Isometric Projection</span>
              </div>
              <div class="tech-svg-container">
                ${threeViews.isometric}
                <button id="open-3d-modal-btn" class="inspect-3d-btn" type="button" aria-haspopup="dialog" aria-controls="model-3d-dialog">
                  <span>🔍 Tap to Orbit &amp; Inspect 3D Model</span>
                </button>
              </div>
            </div>

            <!-- View 2: Top-Down Plan View (XY) -->
            <div class="tech-view-card">
              <div class="tech-view-label">
                <span class="view-tag">PLAN (XY)</span>
                <span class="view-name">Top-Down Orthographic</span>
              </div>
              <div class="tech-svg-container">
                ${threeViews.topDown}
              </div>
            </div>

            <!-- View 3: Side Profile Elevation View (XZ) with Dimensions -->
            <div class="tech-view-card">
              <div class="tech-view-label">
                <span class="view-tag">ELEV (XZ)</span>
                <span class="view-name">Side Profile &amp; Dimensions</span>
              </div>
              <div class="tech-svg-container">
                ${threeViews.sideProfile}
              </div>
            </div>
          </div>
        </section>

        <!-- Tools Needed Section -->
        <section class="guide-section">
          <div class="section-title-row">
            <h2 class="section-title">Required Tools &amp; Supplies</h2>
            <span class="section-count">${guide.tools_needed.length} Items</span>
          </div>
          <div class="tools-grid">
            ${toolsHtml}
          </div>
        </section>

        <!-- Step-by-Step Repair Guide -->
        <section class="guide-section">
          <div class="section-title-row">
            <h2 class="section-title">Step-by-Step Installation Tutorial</h2>
            <span class="section-count">${guide.steps.length} Steps</span>
          </div>
          <div class="steps-flow">
            ${stepsHtml}
          </div>
        </section>

        <!-- FAQ Section -->
        <section class="guide-section">
          <div class="section-title-row">
            <h2 class="section-title">Frequently Asked Questions</h2>
          </div>
          <div class="faq-list">
            ${faqHtml}
          </div>
        </section>

        <!-- Attribution & Aftermarket Safety Disclaimer Footer -->
        <footer class="guide-safety-footer">
          <div class="attribution-card">
            <h3 class="footer-block-title">Open-Source License &amp; Attribution</h3>
            <p>
              ${part.attribution_text || `Original 3D CAD model licensed under ${part.license_type}.`}
            </p>
            ${part.original_source_url ? `
              <p>
                Source Repository: <a href="${part.original_source_url}" target="_blank" rel="noopener noreferrer">${part.original_source_url}</a>
              </p>
            ` : ''}
          </div>

          <div class="disclaimer-card">
            <h3 class="footer-block-title">Legal &amp; Aftermarket Reproduction Disclaimer</h3>
            <p>
              <strong>IMPORTANT NOTICE:</strong> Barebones 3D, L.L.C. is an independent engineering firm and diagnostic hardware network.
              This component is an independently engineered aftermarket reproduction designed strictly for repair, restoration, and life extension of obsolete or broken equipment.
              Barebones 3D is <strong>not affiliated with, endorsed by, authorized by, or sponsored by ${primaryMake}</strong> or any other Original Equipment Manufacturer (OEM).
              All OEM part numbers, brand names, and model designations referenced on this page are used strictly for technical identification, compatibility reference, and descriptive fitment purposes.
            </p>
          </div>

          <div class="disclaimer-card affiliate-card">
            <h3 class="footer-block-title">FTC &amp; Amazon Associates Disclosure</h3>
            <p>
              As an Amazon Associate, Barebones 3D earns from qualifying purchases. Outbound links to tools, supplies, and replacement parts contain referral tracking parameters (Tag: <code>barebones3dco-20</code>) that credit qualifying purchases at zero added cost to you.
            </p>
          </div>
        </footer>

      </div>

      <!-- Right Column: Dual Action Box (Sticky Action Console) -->
      <aside class="guide-sidebar-col">
        <div class="sticky-action-container">
          ${sidebarActionsHtml}
        </div>
      </aside>

    </div>
  </main>

  <!-- Interactive Checkout Client Script -->
  ${part.is_commercial_allowed ? `
  <script>
    (function() {
      const buyBtn = document.getElementById('buy-button');
      const errBox = document.getElementById('buy-error');
      const priceVal = document.getElementById('action-price-val');
      const btnText = document.getElementById('buy-button-text');
      if (!buyBtn) return;

      let selectedBundle = 'single';
      const variantRadios = document.querySelectorAll('input[name="variant-option"]');
      variantRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
          if (radio.checked) {
            selectedBundle = radio.value;
            if (selectedBundle === '2-pack') {
              if (priceVal) priceVal.textContent = '$24.00';
              if (btnText) btnText.innerHTML = 'Order 2-Pack Bundle &bull; $24.00';
            } else {
              if (priceVal) priceVal.textContent = '$${priceDollars}';
              if (btnText) btnText.innerHTML = 'Order Reproduction Part &bull; $${priceDollars}';
            }
          }
        });
      });

      buyBtn.addEventListener('click', async function() {
        const partId = buyBtn.getAttribute('data-part-id');
        const origText = buyBtn.innerHTML;
        buyBtn.disabled = true;
        buyBtn.innerHTML = '<span>⚡ Preparing Stripe Checkout...</span>';
        if (errBox) errBox.style.display = 'none';

        try {
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ partId: partId, quantity: 1, bundle: selectedBundle })
          });

          const data = await res.json();
          if (!res.ok || !data.url) {
            throw new Error(data.error || 'Failed to initiate checkout');
          }

          window.location.href = data.url;
        } catch (err) {
          buyBtn.disabled = false;
          buyBtn.innerHTML = origText;
          if (errBox) {
            errBox.textContent = err.message || 'Checkout failed. Please try again.';
            errBox.style.display = 'block';
          }
        }
      });
    })();
  </script>
  ` : ''}

  <!-- Lazy-Loaded 3D Model-Viewer Modal -->
  <dialog id="model-3d-dialog" class="model-modal-dialog">
    <div class="model-modal-header">
      <div class="model-modal-title-col">
        <div class="model-modal-badges">
          <span class="modal-badge cyan">3D CAD INSPECTOR</span>
          <span class="modal-badge green">WATERTIGHT SOLID</span>
          <span class="modal-badge amber">CALIBRATED TOLERANCES</span>
        </div>
        <h3 class="model-modal-title">${part.title}</h3>
        <span class="model-modal-sub">OEM #${part.oem_part_number} &bull; ${part.material_spec}</span>
      </div>
      <button id="close-3d-modal-btn" class="model-modal-close" type="button" aria-label="Close 3D Viewer">&times; Close (ESC)</button>
    </div>

    <div id="model-viewer-mount" class="model-viewer-mount">
      <div class="model-loading-indicator">
        <div class="model-loading-spinner"></div>
        <span>Initializing Google &lt;model-viewer&gt; 3D Engine...</span>
      </div>
    </div>

    <div class="model-modal-footer">
      <div class="model-controls-hint">
        <span>🖱️ Left Click / Drag: Orbit</span> &bull; 
        <span>Scroll: Zoom</span> &bull; 
        <span>Right Click: Pan</span> &bull; 
        <span>Auto-Rotate: Active</span>
      </div>
      ${part.status === 'cad_waitlist' ? `
      <div class="btn-disabled" style="padding: 0.5rem 1rem; font-size: 0.85rem; width: auto;">
        <span>🔒 CAD Under Development</span>
      </div>
      ` : `
      <a href="/api/parts/${part.id}/download" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" download>
        <span>📥 Download STL</span>
      </a>
      `}
    </div>
  </dialog>

  <!-- Lazy Initialization Script for Google <model-viewer> -->
  <script>
    (function() {
      const openBtn = document.getElementById('open-3d-modal-btn');
      const dialog = document.getElementById('model-3d-dialog');
      const closeBtn = document.getElementById('close-3d-modal-btn');
      const mount = document.getElementById('model-viewer-mount');
      if (!openBtn || !dialog || !mount) return;

      let viewerLoaded = false;
      const stlUrl = '/api/parts/${part.id}/download';

      function init3DViewer() {
        if (viewerLoaded) return;
        viewerLoaded = true;

        mount.innerHTML = '<div class="model-loading-indicator"><div class="model-loading-spinner"></div><span>Connecting to R2 Storage &amp; Initializing Google &lt;model-viewer&gt;...</span><span style="font-size: 0.75rem; color: #64748b; font-family: monospace;">Source: ' + encodeURIComponent('${part.oem_part_number}') + '.stl</span></div>';

        // 1. Lazy-load Google's model-viewer script if not already present
        if (!document.getElementById('google-model-viewer-script')) {
          const script = document.createElement('script');
          script.id = 'google-model-viewer-script';
          script.type = 'module';
          script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
          document.head.appendChild(script);
        }

        // 2. Inject <model-viewer> DOM element with camera-controls, auto-rotate, dark cyan environment
        const mv = document.createElement('model-viewer');
        mv.id = 'interactive-3d-viewer';
        mv.setAttribute('src', stlUrl);
        mv.setAttribute('alt', '${part.title.replace(/'/g, "\\'")} 3D Model');
        mv.setAttribute('camera-controls', '');
        mv.setAttribute('auto-rotate', '');
        mv.setAttribute('rotation-per-second', '25deg');
        mv.setAttribute('shadow-intensity', '1.5');
        mv.setAttribute('shadow-softness', '0.5');
        mv.setAttribute('exposure', '1.1');
        mv.style.width = '100%';
        mv.style.height = '100%';
        mv.style.background = 'radial-gradient(circle at center, #0e2a47 0%, #0a0f1d 75%)';

        // 3. Fallback: if model-viewer cannot parse direct STL, gracefully fallback to interactive Three.js viewport
        mv.addEventListener('error', function(err) {
          console.warn('model-viewer requires glb/gltf; switching to Three.js STL viewport...', err);
          initThreeJsFallback(mount, stlUrl);
        });

        mount.innerHTML = '';
        mount.appendChild(mv);
      }

      function initThreeJsFallback(container, url) {
        container.innerHTML = '<div class="model-loading-indicator"><div class="model-loading-spinner"></div><span>Loading Three.js 3D Viewport...</span></div>';
        
        function loadScript(src, cb) {
          const s = document.createElement('script');
          s.src = src;
          s.onload = cb;
          document.head.appendChild(s);
        }

        loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', function() {
          loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js', function() {
            loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', function() {
              container.innerHTML = '';
              const w = container.clientWidth || 800;
              const h = container.clientHeight || 500;

              const scene = new THREE.Scene();
              scene.background = new THREE.Color(0x0a0f1d);

              const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
              camera.position.set(50, 45, 60);

              const renderer = new THREE.WebGLRenderer({ antialias: true });
              renderer.setSize(w, h);
              renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
              container.appendChild(renderer.domElement);

              const controls = new THREE.OrbitControls(camera, renderer.domElement);
              controls.enableDamping = true;
              controls.autoRotate = true;
              controls.autoRotateSpeed = 2.5;

              // Dark Cyan Lighting Environment
              const ambient = new THREE.AmbientLight(0x0c4a6e, 2.0);
              scene.add(ambient);

              const dirCyan1 = new THREE.DirectionalLight(0x38bdf8, 3.0);
              dirCyan1.position.set(40, 80, 50);
              scene.add(dirCyan1);

              const dirCyan2 = new THREE.DirectionalLight(0x0284c7, 1.8);
              dirCyan2.position.set(-40, -40, -40);
              scene.add(dirCyan2);

              const loader = new THREE.STLLoader();
              loader.load(url, function(geometry) {
                geometry.center();
                geometry.computeVertexNormals();
                const material = new THREE.MeshStandardMaterial({
                  color: 0x38bdf8,
                  roughness: 0.3,
                  metalness: 0.25
                });
                const mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
              }, undefined, function(loadErr) {
                console.error('Failed to load STL model into Three.js:', loadErr);
              });

              function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
              }
              animate();

              window.addEventListener('resize', function() {
                if (!container.clientWidth) return;
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
              });
            });
          });
        });
      }

      openBtn.addEventListener('click', function() {
        dialog.showModal();
        init3DViewer();
      });

      closeBtn.addEventListener('click', function() {
        dialog.close();
      });

      dialog.addEventListener('click', function(e) {
        if (e.target === dialog) dialog.close();
      });
    })();
  </script>

  <script>
    (function() {
      var waitlistForm = document.getElementById('waitlist-form');
      if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
          e.preventDefault();
          var emailInput = document.getElementById('waitlist-email');
          var successMsg = document.getElementById('waitlist-success');
          if (emailInput && emailInput.value) {
            waitlistForm.style.display = 'none';
            if (successMsg) successMsg.style.display = 'block';
          }
        });
      }
    })();
  </script>

</body>
</html>`;
}
