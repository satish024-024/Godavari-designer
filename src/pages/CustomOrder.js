import { site, ui, currentUser, showToast, triggerRender } from "../services/store.js";
import { customRequestService, storageService } from "../services/supabase.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";

// Local State
let lastPage = "";
let uploadedAttachments = {}; // Mapping from zoneId to { name, url }
let uploadStates = {}; // Mapping from zoneId to null | 'uploading' | 'success'
let selectedUrgency = "Standard";
let selectedFormat = "DST";
let selectedFabric = "Silk";
let selectedApplication = "Bridal";
let submissionResult = null; // null | { referenceNumber, name, email, phone, projectType, notes, status, createdAt }

let prefilledProductId = null;
let prefilledProductSlug = null;
let prefilledProductName = null;

// Generate GD quote reference numbers (e.g. GD-CUS-2026-Q4P8M1Z7)
function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randStr = '';
  for (let i = 0; i < 8; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GD-CUS-${year}-${randStr}`;
}

export function renderCustomOrder() {
  // Reset local state on fresh page load
  if (lastPage !== "custom-order") {
    lastPage = "custom-order";
    uploadedAttachments = {};
    uploadStates = {};
    selectedUrgency = "Standard";
    selectedFormat = "DST";
    selectedFabric = "Silk";
    selectedApplication = "Bridal";
    submissionResult = null;

    // Parse prefill query params on fresh load
    const params = ui.pageParams || {};
    prefilledProductId = params.product_id || params.productId || null;
    prefilledProductSlug = params.product_slug || params.productSlug || null;
    prefilledProductName = params.product_name || params.productName || null;
    if (params.format) {
      selectedFormat = params.format;
    }
  }

  // If submitted, show success timeline and tracking dashboard
  if (submissionResult) {
    const isGuest = submissionResult.status === "Guest Lead";
    return `
      <section class="content-section success-section" style="padding: 120px 24px; background: var(--ivory);">
        <div class="success-card">
          <div class="success-check-icon">
            ${icon("check", 32)}
          </div>
          
          <h1 style="font-family: var(--font-serif); font-size: 32px; color: var(--navy); margin-top: 0; margin-bottom: 12px;">Quote Request Submitted</h1>
          <p style="color: var(--ink-soft); font-size: 14px; max-width: 500px; margin: 0 auto 24px;">
            Thank you for requesting a custom digitizing quote! Our digitizers will review your artwork and specifications. A digital sampling draft and quote details will be sent to your email.
          </p>

          <div class="tracking-info-card" style="max-width: 440px; margin: 0 auto 36px;">
            <div class="info-row">
              <span style="color:var(--ink-soft);">Reference ID:</span>
              <strong style="color:var(--navy); font-family:monospace; font-size:14px;">${escapeHtml(submissionResult.referenceNumber)}</strong>
            </div>
            <div class="info-row">
              <span style="color:var(--ink-soft);">Client Name:</span>
              <strong style="color:var(--navy);">${escapeHtml(submissionResult.name)}</strong>
            </div>
            <div class="info-row">
              <span style="color:var(--ink-soft);">Project Type:</span>
              <strong style="color:var(--navy);">${escapeHtml(submissionResult.projectType)}</strong>
            </div>
            <div class="info-row">
              <span style="color:var(--ink-soft);">Submission Status:</span>
              <span style="border-radius:99px; background: ${isGuest ? "#ffe58f" : "#b7eb8f"}; color: ${isGuest ? "#ad6800" : "#389e0d"}; font-size:11px; font-weight:700; padding:2px 8px;">
                ${escapeHtml(submissionResult.status)}
              </span>
            </div>
          </div>

          <!-- Step Progress Tracker Timeline -->
          <div style="font-weight:700; font-size:12px; color:var(--navy); text-transform:uppercase; margin-bottom:12px;">Track Process Flow</div>
          <div class="tracking-timeline-container" style="max-width: 500px; margin: 24px auto 36px; position: relative;">
            <div style="position: absolute; top: 16px; left: 24px; right: 24px; height: 2px; background: var(--border); z-index: 1;"></div>
            <div class="tracking-timeline-flow" style="display: flex; justify-content: space-between; align-items: flex-start; position: relative;">
              
              <div class="tracking-step active" style="flex: 1; display: grid; gap: 8px; justify-items: center; text-align: center; position: relative; z-index: 2;">
                <div class="tracking-dot" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: var(--gold); color: #fff; border: 2px solid var(--gold);">1</div>
                <div>
                  <span class="tracking-label" style="font-size: 10px; font-weight: 700; color: var(--gold);">${isGuest ? "Guest Lead" : "Submitted"}</span>
                </div>
              </div>

              <div class="tracking-step pending" style="flex: 1; display: grid; gap: 8px; justify-items: center; text-align: center; position: relative; z-index: 2;">
                <div class="tracking-dot" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: #e5e5e5; color: var(--navy); border: 2px solid var(--border);">2</div>
                <div>
                  <span class="tracking-label" style="font-size: 10px; font-weight: 700; color: var(--ink-soft);">Quote Sent</span>
                </div>
              </div>

              <div class="tracking-step pending" style="flex: 1; display: grid; gap: 8px; justify-items: center; text-align: center; position: relative; z-index: 2;">
                <div class="tracking-dot" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: #e5e5e5; color: var(--navy); border: 2px solid var(--border);">3</div>
                <div>
                  <span class="tracking-label" style="font-size: 10px; font-weight: 700; color: var(--ink-soft);">Approved</span>
                </div>
              </div>

              <div class="tracking-step pending" style="flex: 1; display: grid; gap: 8px; justify-items: center; text-align: center; position: relative; z-index: 2;">
                <div class="tracking-dot" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: #e5e5e5; color: var(--navy); border: 2px solid var(--border);">4</div>
                <div>
                  <span class="tracking-label" style="font-size: 10px; font-weight: 700; color: var(--ink-soft);">Digitizing</span>
                </div>
              </div>

              <div class="tracking-step pending" style="flex: 1; display: grid; gap: 8px; justify-items: center; text-align: center; position: relative; z-index: 2;">
                <div class="tracking-dot" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: #e5e5e5; color: var(--navy); border: 2px solid var(--border);">5</div>
                <div>
                  <span class="tracking-label" style="font-size: 10px; font-weight: 700; color: var(--ink-soft);">Production</span>
                </div>
              </div>

              <div class="tracking-step pending" style="flex: 1; display: grid; gap: 8px; justify-items: center; text-align: center; position: relative; z-index: 2;">
                <div class="tracking-dot" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: #e5e5e5; color: var(--navy); border: 2px solid var(--border);">6</div>
                <div>
                  <span class="tracking-label" style="font-size: 10px; font-weight: 700; color: var(--ink-soft);">Delivered</span>
                </div>
              </div>

            </div>
          </div>

          ${submissionResult.isLocalFallback ? `
            <div style="font-size: 12px; color: #d93838; background: #fff2f0; border: 1px solid #ffccc7; padding: 10px 12px; border-radius: 4px; line-height: 1.5; margin: 0 auto 20px; max-width: 440px; text-align: left;">
              ⚠️ Note: Could not save to database (login required / offline). Please click the green button below to send your request details directly on WhatsApp so we can process your custom order.
            </div>
          ` : ''}

          <div class="tracking-actions-row" style="max-width: 440px; margin: 24px auto 0; display: flex; flex-direction: column; gap: 12px;">
            ${submissionResult.whatsappUrl ? `
              <a href="${submissionResult.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="button" style="background: #25d366; color: #fff; text-decoration: none; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; font-weight: 700; border-radius: 4px; width: 100%;">
                ${icon("message-square", 18)}
                <span>Send details via WhatsApp</span>
              </a>
            ` : ''}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%;">
              <button type="button" class="button button-secondary" data-action="reset-custom-order" style="min-height: 48px; font-weight: 700; border-radius: 4px; width: 100%;">Request Another</button>
              <a href="#/" class="button button-primary" style="min-height: 48px; font-weight: 700; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; width: 100%;">Back to Home</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // Render Quote Request Form
  const defaultName = currentUser ? currentUser.name : "";
  const defaultEmail = currentUser ? currentUser.email : "";
  const defaultPhone = currentUser ? (currentUser.phone || "") : "";

  return `
    <section class="content-section custom-order-section" style="padding-top: var(--header-height); background: var(--ivory);">
      <div style="width: min(100%, 1280px); margin: 0 auto; padding: 24px 24px 80px;">
        
        <div style="margin-bottom: 32px;">
          <h1 style="font-family: var(--font-serif); font-size: clamp(36px, 4.5vw, 54px); color: var(--navy); font-weight: 700; margin: 0 0 8px;">Request Custom Digitizing</h1>
          <p style="color: var(--ink-soft); font-size: 15px; max-width: 600px; margin: 0;">Upload your custom sketch or artwork, define dimensions, and receive production-ready embroidery files.</p>
        </div>

        <div class="custom-order-layout">
          
          <!-- Left Column: Trust Info Card -->
          <div class="trust-card">
            <h2 class="trust-card-title">Custom Digitizing Services</h2>
            <p style="font-size:13px; color:var(--ink-soft); margin-bottom: 20px;">Premium quality matching thread structures, perfect for luxury boutiques and design labels.</p>
            
            <div class="trust-card-list">
              <div class="trust-card-item">
                <span>${icon("check", 16)}</span>
                <span>Bridal Blouse Digitizing</span>
              </div>
              <div class="trust-card-item">
                <span>${icon("check", 16)}</span>
                <span>Saree Border Placements</span>
              </div>
              <div class="trust-card-item">
                <span>${icon("check", 16)}</span>
                <span>Corporate Logo Stitches</span>
              </div>
              <div class="trust-card-item">
                <span>${icon("check", 16)}</span>
                <span>3D Puff & Applique Work</span>
              </div>
              <div class="trust-card-item">
                <span>${icon("check", 16)}</span>
                <span>Designer Wear Layouts</span>
              </div>
              <div class="trust-card-item">
                <span>${icon("check", 16)}</span>
                <span>Bulk Production Calibration</span>
              </div>
            </div>

            <hr style="border:0; border-top: 1px solid var(--border); margin: 24px 0;" />

            <div style="font-size:12px; color:var(--ink-soft); line-height:1.6; display:grid; gap:8px;">
              <div>🕒 <strong>Typical Delivery:</strong> 24–48 Hours</div>
              <div>💻 <strong>Available Formats:</strong> DST • PES • JEF • EXP • XXX</div>
              <div>🧵 <strong>Optimized speed:</strong> 850–1200 RPM matching tension</div>
            </div>

            <hr style="border:0; border-top: 1px solid var(--border); margin: 24px 0;" />

            <div style="display: grid; gap: 12px; background: #ffffff; border: 1px solid var(--border); border-radius: 6px; padding: 16px;">
              <h3 style="font-family: var(--font-serif); font-size: 14px; font-weight: 700; color: var(--navy); margin: 0;">Related Services</h3>
              <div style="display: grid; gap: 8px;">
                <a href="#/services/custom-embroidery-digitizing" style="font-size: 13px; font-weight: 600; color: var(--gold); text-decoration: none; display: flex; align-items: center; gap: 4px;">
                  <span>Custom Embroidery Digitizing</span>
                  ${icon("arrow-right", 12)}
                </a>
                <a href="#/services/bridal-blouse-embroidery-designs" style="font-size: 13px; font-weight: 600; color: var(--gold); text-decoration: none; display: flex; align-items: center; gap: 4px;">
                  <span>Bridal Blouse Designs</span>
                  ${icon("arrow-right", 12)}
                </a>
                <a href="#/services/saree-border-embroidery-designs" style="font-size: 13px; font-weight: 600; color: var(--gold); text-decoration: none; display: flex; align-items: center; gap: 4px;">
                  <span>Saree Border Digitizing</span>
                  ${icon("arrow-right", 12)}
                </a>
                <a href="#/services/logo-embroidery-digitizing" style="font-size: 13px; font-weight: 600; color: var(--gold); text-decoration: none; display: flex; align-items: center; gap: 4px;">
                  <span>Logo & Branding Digitizing</span>
                  ${icon("arrow-right", 12)}
                </a>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Form steps -->
          <form id="customDigitizingForm" class="form-step-container">
            
            <!-- Step 1: Customer Information -->
            <div class="form-step-card">
              <div class="form-step-title">
                <span style="color:var(--gold);">${icon("user", 20)}</span>
                <span>Customer Information</span>
              </div>
              <div class="form-step-desc">Provide your contact details so we can send the digitized quote draft.</div>
              
              ${
                !currentUser
                  ? `
                    <div style="background: rgba(200, 161, 90, 0.08); border: 1px solid rgba(200, 161, 90, 0.28); border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 13px; color: var(--navy); display: flex; align-items: flex-start; gap: 8px;">
                      <span style="color:var(--gold); flex-shrink:0;">${icon("info", 16)}</span>
                      <span>
                        <strong>Guest Quote Submission Enabled</strong>. Registration is recommended for tracking project history, but guest inquiries will be processed instantly.
                      </span>
                    </div>
                  `
                  : ""
              }

              <div style="display: grid; gap: 16px;">
                <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                  <span>Full Name *</span>
                  <input type="text" name="customerName" value="${attr(defaultName)}" required placeholder="e.g. Sameer Kumar" autocomplete="name" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                </label>
                
                <div class="checkout-contact-grid">
                  <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                    <span>Email Address *</span>
                    <input type="email" name="customerEmail" value="${attr(defaultEmail)}" required placeholder="name@designer.com" autocomplete="email" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                  </label>
                  <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                    <span>Phone Number *</span>
                     <input type="tel" name="customerPhone" required value="${attr(defaultPhone)}" placeholder="+91 83098 97055" autocomplete="tel" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                  </label>
                </div>
              </div>
            </div>

            <!-- Step 2: Project Specifications -->
            <div class="form-step-card">
              <div class="form-step-title">
                <span style="color:var(--gold);">${icon("layers", 20)}</span>
                <span>Project Details</span>
              </div>
              <div class="form-step-desc">Outline your design specifications, dimensions, and urgency constraints.</div>

              <div style="display: grid; gap: 16px;">
                ${
                  prefilledProductName
                    ? `
                      <div style="background: rgba(200, 161, 90, 0.08); border: 1px solid rgba(200, 161, 90, 0.28); border-radius: 6px; padding: 14px; margin-bottom: 4px; font-size: 13px; color: var(--navy);">
                        <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--gold); letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Requested Customization For</span>
                        <strong>${escapeHtml(prefilledProductName)}</strong>
                        <div style="font-size: 12px; color: var(--ink-soft); margin-top: 4px;">
                          Base Product: <a href="#/product/${attr(prefilledProductSlug)}" style="color: var(--gold); text-decoration: underline;">View Original Design</a>
                        </div>
                      </div>
                    `
                    : ""
                }
                <div class="project-spec-grid">
                  <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                    <span>Project Name *</span>
                    <input type="text" name="projectName" required value="${attr(prefilledProductName ? `Custom Version - ${prefilledProductName}` : "")}" placeholder="e.g. Bridal Lotus Blouse Back" style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                  </label>
                  <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                    <span>Quantity Needed *</span>
                    <input type="number" name="quantity" value="1" min="1" required style="width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 4px;" />
                  </label>
                </div>

                <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                  <span>Stitch Description & Special Instructions *</span>
                  <textarea name="projectDescription" required placeholder="Describe dimensions (e.g. width 18cm, pot neck neck depth 9 inches), specific fabrics or placement, thread guidelines..." style="width: 100%; height: 110px; padding: 10px; border: 1px solid var(--border); border-radius: 4px; resize: none;"></textarea>
                </label>

                <!-- Urgency Level Selectable Cards -->
                <div style="font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 2px;">Select Urgency Level</div>
                <div class="urgency-grid">
                  <div class="option-select-card ${selectedUrgency === "Standard" ? "active" : ""}" data-action="set-urgency" data-urgency="Standard">
                    <div class="option-select-title">Standard</div>
                    <div class="option-select-desc">3–5 Days &bull; Reg Price</div>
                  </div>
                  <div class="option-select-card ${selectedUrgency === "Priority" ? "active" : ""}" data-action="set-urgency" data-urgency="Priority">
                    <div class="option-select-title">Priority</div>
                    <div class="option-select-desc">24–48 Hours &bull; +25%</div>
                  </div>
                  <div class="option-select-card ${selectedUrgency === "Urgent" ? "active" : ""}" data-action="set-urgency" data-urgency="Urgent">
                    <div class="option-select-title">Urgent</div>
                    <div class="option-select-desc">Under 12 Hours &bull; +50%</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Embroidery details -->
            <div class="form-step-card">
              <div class="form-step-title">
                <span style="color:var(--gold);">${icon("cpu", 20)}</span>
                <span>Embroidery Specifications</span>
              </div>
              <div class="form-step-desc">Target format and fabric optimizations. No hardcoded specs.</div>

              <div style="display: grid; gap: 20px;">
                
                <!-- Format Select badges -->
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 10px;">Select Format</div>
                  <div class="spec-cards-grid">
                    ${["DST", "PES", "JEF", "EXP", "XXX"]
                      .map(
                        (fmt) => `
                          <div class="spec-option-card ${selectedFormat === fmt ? "active" : ""}" data-action="set-format" data-format="${attr(fmt)}">
                            ${escapeHtml(fmt)}
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                </div>

                <!-- Fabric Select cards -->
                <div>
                  <div style="font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 10px;">Target Fabric Type</div>
                  <div class="spec-cards-grid">
                    ${["Silk", "Net", "Cotton", "Organza", "Georgette", "Velvet"]
                      .map(
                        (fab) => `
                          <div class="spec-option-card ${selectedFabric === fab ? "active" : ""}" data-action="set-fabric" data-fabric="${attr(fab)}">
                            ${escapeHtml(fab)}
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                </div>

                <!-- Application Type Selection -->
                <label style="display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: var(--navy);">
                  <span>Application Use Case *</span>
                  <select id="customApplicationSelect" required style="width:100%; padding:10px; border:1px solid var(--border); border-radius:4px; background:#fff;">
                    ${["Bridal", "Blouse", "Saree Border", "Kids Wear", "Designer Wear", "Bulk Production"]
                      .map(
                        (app) => `
                          <option value="${attr(app)}" ${selectedApplication === app ? "selected" : ""}>
                            ${escapeHtml(app)} Layout
                          </option>
                        `
                      )
                      .join("")}
                  </select>
                </label>

              </div>
            </div>

            <!-- Step 4: Touch-Friendly Upload Area -->
            <div class="form-step-card">
              <div class="form-step-title">
                <span style="color:var(--gold);">${icon("upload-cloud", 20)}</span>
                <span>Upload Reference Artwork</span>
              </div>
              <div class="form-step-desc">Upload mockups, placement photos, or vector files. Max 5MB per file.</div>

              <div class="upload-grid">
                <!-- Zone 1: Logo -->
                <div class="upload-card">
                  <div class="upload-card-label">Logo / Graphic</div>
                  ${renderUploadZone("logo", "Upload Logo", "PNG, JPG")}
                </div>

                <!-- Zone 2: Sketch -->
                <div class="upload-card">
                  <div class="upload-card-label">Hand Sketch</div>
                  ${renderUploadZone("sketch", "Upload Sketch", "PNG, JPG, PDF")}
                </div>

                <!-- Zone 3: Blouse Photo -->
                <div class="upload-card">
                  <div class="upload-card-label">Blouse Placement</div>
                  ${renderUploadZone("blouse", "Placement Photo", "Sleeve/Back mockups")}
                </div>

                <!-- Zone 4: Saree Photo -->
                <div class="upload-card">
                  <div class="upload-card-label">Saree Placement</div>
                  ${renderUploadZone("saree", "Border Photo", "Motif placements")}
                </div>

                <!-- Zone 5: Reference -->
                <div class="upload-card">
                  <div class="upload-card-label">Reference Design</div>
                  ${renderUploadZone("reference", "Ref Design", "Similar embroidery")}
                </div>
              </div>
            </div>

            <button type="submit" class="button button-primary" style="width:100%; min-height:54px; font-size:16px; font-weight:700; border:none; border-radius:6px; box-shadow:var(--shadow-deep); margin-top:12px; display:flex; align-items:center; justify-content:center; gap:8px;">
              <span>Submit Digitizing Quote Request</span>
              ${icon("arrow-right", 18)}
            </button>

          </form>

        </div>
      </div>
    </section>
  `;
}

// Upload zone sub-component renderer
function renderUploadZone(zoneId, title, sub) {
  const uploadState = uploadStates[zoneId];
  const fileData = uploadedAttachments[zoneId];
  
  if (uploadState === "uploading") {
    return `
      <div class="upload-dropzone" style="cursor:wait; opacity:0.8;">
        <div class="upload-dropzone-icon animate-spin" style="margin-bottom:12px;">${icon("refresh-cw", 20)}</div>
        <span>Uploading File...</span>
      </div>
    `;
  }
  
  if (fileData) {
    const isPdf = fileData.name.endsWith(".pdf");
    const previewSrc = isPdf 
      ? "https://cdn-icons-png.flaticon.com/512/337/337946.png" 
      : fileData.url;
      
    return `
      <div class="upload-preview-area">
        <img class="upload-preview-thumb" src="${attr(previewSrc)}" alt="Preview" />
        <span class="upload-preview-name" title="${attr(fileData.name)}">${escapeHtml(fileData.name)}</span>
        <button type="button" class="upload-preview-remove" data-action="remove-upload" data-zone="${attr(zoneId)}" aria-label="Delete">
          ${icon("trash", 14)}
        </button>
      </div>
    `;
  }

  return `
    <label class="upload-dropzone" data-zone="${attr(zoneId)}">
      <input type="file" class="hidden-file-input" data-zone="${attr(zoneId)}" style="display:none;" />
      <span class="upload-dropzone-icon">${icon("plus", 20)}</span>
      <span>${escapeHtml(title)}</span>
      <p style="font-size:9px; color:var(--ink-soft); margin-top:2px;">${escapeHtml(sub)}</p>
    </label>
  `;
}

// Interactive file drag/drop/selection trigger logic
async function triggerFileUpload(file, zoneId) {
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast("File size exceeds 5MB limit");
    return;
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    showToast("Unsupported file type. Use PNG, JPG, WebP or PDF");
    return;
  }

  uploadStates[zoneId] = "uploading";
  triggerRender();

  try {
    const filename = `custom-request-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const publicUrl = await storageService.uploadMedia(file, "media-library", `custom-requests/${filename}`);
    
    uploadedAttachments[zoneId] = {
      name: file.name,
      url: publicUrl
    };
    uploadStates[zoneId] = "success";
    showToast(`${file.name} uploaded successfully!`);
  } catch (error) {
    console.error("Storage upload error:", error);
    uploadStates[zoneId] = null;
    showToast(`Upload failed: ${error.message}`);
  }
  triggerRender();
}

let eventsBound = false;
export function initCustomOrderEvents() {
  if (eventsBound) return;
  eventsBound = true;

  // Bind change handlers for input type file uploads
  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("hidden-file-input")) {
      const file = e.target.files[0];
      const zoneId = e.target.dataset.zone;
      triggerFileUpload(file, zoneId);
    }
    
    // Bind select elements
    if (e.target.id === "customApplicationSelect") {
      selectedApplication = e.target.value;
      triggerRender();
    }
  });

  // Handle Drag-and-drop triggers
  document.addEventListener("dragover", (e) => {
    const zone = e.target.closest(".upload-dropzone");
    if (zone) {
      e.preventDefault();
      zone.classList.add("dragover");
    }
  });

  document.addEventListener("dragleave", (e) => {
    const zone = e.target.closest(".upload-dropzone");
    if (zone) {
      zone.classList.remove("dragover");
    }
  });

  document.addEventListener("drop", (e) => {
    const zone = e.target.closest(".upload-dropzone");
    if (zone) {
      e.preventDefault();
      zone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      const zoneId = zone.dataset.zone;
      triggerFileUpload(file, zoneId);
    }
  });

  // Delegated clicks
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "set-urgency") {
      selectedUrgency = target.dataset.urgency;
      triggerRender();
    }

    if (action === "set-format") {
      selectedFormat = target.dataset.format;
      triggerRender();
    }

    if (action === "set-fabric") {
      selectedFabric = target.dataset.fabric;
      triggerRender();
    }

    if (action === "remove-upload") {
      const zoneId = target.dataset.zone;
      delete uploadedAttachments[zoneId];
      uploadStates[zoneId] = null;
      showToast("Attachment removed");
      triggerRender();
    }

    if (action === "reset-custom-order") {
      submissionResult = null;
      uploadedAttachments = {};
      uploadStates = {};
      selectedUrgency = "Standard";
      selectedFormat = "DST";
      selectedFabric = "Silk";
      selectedApplication = "Bridal";
      prefilledProductId = null;
      prefilledProductSlug = null;
      prefilledProductName = null;
      // Also clear url query parameters to prevent re-prefilling on reload
      window.location.hash = "#/custom-order";
      triggerRender();
    }
  });

  // Form submit
  document.addEventListener("submit", async (e) => {
    if (e.target.id === "customDigitizingForm") {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      const submitBtn = e.target.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `Submitting Request...`;
      }

      try {
        const refNum = generateReferenceNumber();
        
        // Collate files
        const attachmentsArray = Object.values(uploadedAttachments).map(a => a.url);
        const commaSeparatedUrls = attachmentsArray.join(", ");
        
        // Structured notes JSON payload
        const notesPayload = {
          reference_number: refNum,
          customer_name: formData.get("customerName"),
          customer_email: formData.get("customerEmail"),
          customer_phone: formData.get("customerPhone"),
          project_name: formData.get("projectName"),
          project_description: formData.get("projectDescription"),
          quantity: parseInt(formData.get("quantity") || 1),
          urgency: selectedUrgency,
          machine_format: selectedFormat,
          fabric_type: selectedFabric,
          application_type: selectedApplication,
          prefilled_product_id: prefilledProductId,
          prefilled_product_slug: prefilledProductSlug,
          prefilled_product_name: prefilledProductName,
          attachments: attachmentsArray,
          created_at: new Date().toISOString()
        };

        // If authenticated -> status is Submitted, if guest -> status is Guest Lead
        const statusVal = currentUser ? "Submitted" : "Guest Lead";

        const requestData = {
          userId: currentUser ? currentUser.id : null,
          name: formData.get("customerName"),
          email: formData.get("customerEmail"),
          phone: formData.get("customerPhone"),
          projectType: selectedApplication,
          notes: JSON.stringify(notesPayload), // Saved separately in JSON block inside notes
          artworkAttachment: commaSeparatedUrls,
          status: statusVal,
          referenceNumber: refNum
        };

        let result;
        let isLocalFallback = false;
        try {
          result = await customRequestService.createRequest(requestData);
        } catch (dbErr) {
          console.warn("Database insert failed for custom order, falling back to WhatsApp:", dbErr);
          isLocalFallback = true;
          result = {
            referenceNumber: refNum,
            name: requestData.name,
            email: requestData.email,
            phone: requestData.phone,
            projectType: requestData.projectType,
            notes: requestData.notes,
            status: "Guest Lead",
            createdAt: new Date().toISOString(),
            isLocalFallback: true
          };
        }

        // Open WhatsApp
        const whatsappPhone = (site.brand?.contact?.phone || "918309897055").replace(/[^0-9]/g, '');
        const whatsappMsg = `Hello Godavari Designer, I would like to request a Custom Digitizing Quote.

Reference: ${result.referenceNumber}
Customer: ${result.name}
Email: ${result.email}
Phone: ${result.phone}
Project Type: ${result.projectType}
Urgency: ${selectedUrgency}
Machine Format: ${selectedFormat}
Fabric: ${selectedFabric}
Description: ${formData.get("projectDescription")}
Attachments: ${commaSeparatedUrls || "None"}`;

        const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMsg)}`;

        try {
          window.open(whatsappUrl, "_blank");
        } catch (popErr) {
          console.warn("Popup blocked, fallback will be handled by success page button", popErr);
        }

        submissionResult = {
          ...result,
          whatsappUrl,
          isLocalFallback
        };

        if (!isLocalFallback) {
          showToast("Quote request submitted successfully!");
        } else {
          showToast("Request prepared. Please send via WhatsApp.");
        }
        triggerRender();
      } catch (err) {
        console.error("Error submitting quote request:", err);
        showToast(`Request failed: ${err.message}`);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `Submit Digitizing Quote Request ${icon("arrow-right", 18)}`;
        }
      }
    }
  });
}
