import type { Part, Guide } from '../types/database.ts';
import { generateHowToSchema, generateProductSchema } from '../lib/seo.ts';

export function renderGuideHtml(part: Part, guide: Guide, siteUrl: string): string {
  const howToSchema = generateHowToSchema(part, guide, siteUrl);
  const productSchema = generateProductSchema(part, siteUrl);
  const priceDollars = (part.retail_price_cents / 100).toFixed(2);
  const primaryMake = part.compatible_makes_models[0]?.make || 'OEM';

  const makesHtml = part.compatible_makes_models.map(c => `
    <span class="compat-tag">
      <strong>${c.make} ${c.model}</strong>
      ${c.year_start ? `<span class="compat-years">(${c.year_start}–${c.year_end || 'Present'})</span>` : ''}
    </span>
  `).join('');

  const supersededHtml = part.superseded_numbers.length > 0 
    ? `<div class="meta-row"><span class="meta-label">Supersedes OEM:</span> <span class="meta-val font-mono">${part.superseded_numbers.join(', ')}</span></div>`
    : '';

  const toolsHtml = guide.tools_needed.map(t => `
    <div class="tool-card">
      <span class="tool-icon">🔧</span>
      <div class="tool-info">
        <div class="tool-name">${t.name}</div>
        ${t.purpose ? `<div class="tool-purpose">${t.purpose}</div>` : ''}
      </div>
    </div>
  `).join('');

  const oemClean = part.oem_part_number.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cleanSiteUrl = siteUrl.replace(/\/$/, '');

  const stepsHtml = guide.steps.map(step => {
    const stepImgUrl = `${cleanSiteUrl}/assets/parts/${oemClean}-${part.slug}-step-${step.step_number}.webp`;
    const altText = `Original broken plastic ${part.title} (OEM #${part.oem_part_number}) shown side-by-side with reinforced 3D printed ${part.material_spec} reproduction.`;

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
        <div class="step-photo-slot">
          <img 
            src="${step.image_url ? (step.image_url.startsWith('http') ? step.image_url : `${cleanSiteUrl}${step.image_url}`) : stepImgUrl}"
            alt="${altText}"
            width="800"
            height="450"
            loading="lazy"
            class="step-visual-img"
            onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';"
          />
          <div class="photo-placeholder" style="display: none;">
            <span class="blueprint-icon">📐</span>
            <span class="photo-label">TECHNICAL DIAGRAM / STEP ${step.step_number}</span>
            <span class="photo-sub">${part.title} &bull; OEM #${part.oem_part_number}</span>
          </div>
        </div>
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

  // Commercial license enforcer block
  const commercialActionBoxHtml = part.is_commercial_allowed ? `
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
  ` : `
    <div class="action-card action-non-commercial">
      <div class="action-badge-row">
        <span class="action-pill-nc">FREE STL ONLY</span>
        <span class="action-pill-lead">⚡ Open Source</span>
      </div>
      <h3 class="action-title">Digital STL Download Only</h3>
      <p class="nc-explanation">
        ${part.id === 'part_whirlpool_wheel_w10195416' 
          ? 'Due to mass-market injection-molded commodity multi-packs, this part is provided strictly as a verified, free open-source 3D printable STL for personal DIY repair.' 
          : `The original author shared this 3D design under a <strong>${part.license_type}</strong> non-commercial license. In strict compliance with open-source creator rights, Barebones 3D does not offer paid commercial reproductions for this item.`}
      </p>
      <div class="nc-callout">
        <span>📥 Download the verified, pre-calibrated STL file to 3D print yourself on Bambu, Prusa, or any FDM printer.</span>
      </div>
      <a href="/api/parts/${part.id}/download" class="btn-primary buy-btn" style="text-align: center; justify-content: center; margin-top: 1rem; text-decoration: none;">
        <span>📥 Download Free STL (.stl)</span>
      </a>
    </div>
  `;

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
            <span class="tag-pill green">${part.is_commercial_allowed ? 'COMMERCIAL POD AVAILABLE' : 'DIGITAL STL ONLY'}</span>
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
        </header>

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
        </footer>

      </div>

      <!-- Right Column: Dual Action Box (Sticky Action Console) -->
      <aside class="guide-sidebar-col">
        <div class="sticky-action-container">

          <!-- Free Download Action Card -->
          <div class="action-card action-free">
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

          <!-- Commercial Print-on-Demand Action Card -->
          ${commercialActionBoxHtml}

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

</body>
</html>`;
}
