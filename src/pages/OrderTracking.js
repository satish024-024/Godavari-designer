import { site, ui, triggerRender } from "../services/store.js";
import { trackingService } from "../services/supabase.js";
import { escapeHtml, attr, icon, money } from "../utils/helpers.js";

// Local Page State
let searchInput = "";
let trackingResult = null; // null | 'not_found' | data object
let isLoading = false;
let errorMessage = "";
let isPrefilled = false;

function normalizeRef(ref) {
  if (!ref) return "";
  return ref.trim().toUpperCase().replace(/\s+/g, "");
}

export function renderOrderTracking() {
  // Read route parameter
  const params = ui.pageParams || {};
  const queryRef = params.ref || "";

  if (queryRef && !isPrefilled) {
    searchInput = queryRef;
    isPrefilled = true;
    isLoading = true;
    errorMessage = "";
    
    // Auto-trigger search asynchronously
    setTimeout(async () => {
      try {
        const result = await trackingService.trackReference(queryRef);
        if (result) {
          trackingResult = result;
        } else {
          trackingResult = "not_found";
        }
      } catch (err) {
        console.error("Tracking error:", err);
        errorMessage = err.message || "Failed to retrieve tracking information.";
        trackingResult = null;
      } finally {
        isLoading = false;
        triggerRender();
      }
    }, 100);
  }

  // HTML Headers
  let contentHtml = "";

  if (isLoading) {
    contentHtml = `
      <div style="text-align: center; padding: 60px 24px;">
        <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
        <p style="color: var(--ink-soft); font-size: 14px;">Retrieving tracking details...</p>
      </div>
    `;
  } else if (errorMessage) {
    contentHtml = `
      <div style="background: #fff0f6; border: 1px solid #ffadd2; border-radius: 6px; padding: 20px; color: #cf1322; text-align: center; margin-bottom: 24px; font-size: 14px;">
        ${escapeHtml(errorMessage)}
      </div>
    `;
  } else if (trackingResult === "not_found") {
    contentHtml = `
      <div style="text-align: center; background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 48px 24px; display: grid; gap: 16px; justify-items: center; box-shadow: var(--shadow-deep);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--ink-soft);">
          ${icon("compass", 28)}
        </div>
        <h2 style="font-family: var(--font-serif); font-size: 24px; color: var(--navy); margin: 0; font-weight: 700;">No Reference Found</h2>
        <p style="color: var(--ink-soft); font-size: 14px; max-width: 440px; margin: 0; line-height: 1.6;">
          We couldn't find any design order or custom digitizing request matching "<strong>${escapeHtml(searchInput)}</strong>". Please verify your reference number and try again.
        </p>
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <a href="#/catalog" class="button button-primary" style="display: inline-flex; align-items: center; gap: 8px; min-height: 48px; text-decoration: none;">
            <span>Browse Catalog</span>
            ${icon("arrow-right", 16)}
          </a>
          <button type="button" onclick="window.location.reload()" class="button button-secondary" style="min-height: 48px; display: flex; align-items: center; gap: 6px;">
            Reset Search
          </button>
        </div>
      </div>
    `;
  } else if (trackingResult) {
    const data = trackingResult;
    const isOrder = data.type === "order";
    const refCode = data.reference_number;
    const currentStatus = data.status;
    const statusNote = data.status_note;
    const estCompletion = data.estimated_completion_date;
    const statusHistory = data.status_history || [];

    // Support URLs
    const whatsappMsg = `Hello Godavari Designer, I have a query regarding my reference: ${refCode}.`;
    const whatsappPhone = (site.brand?.contact?.phone || "919876543210").replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMsg)}`;
    const emailUrl = `mailto:${site.brand?.contact?.email || 'support@godavari.com'}?subject=${encodeURIComponent("Tracking Support - " + refCode)}&body=${encodeURIComponent("Hello,\n\nI need assistance with my reference " + refCode + ". Please help.\n\nThank you.")}`;

    // Format created date
    let createdDateStr = "N/A";
    if (data.created_at) {
      createdDateStr = new Date(data.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }

    // Format estimated completion date
    let estCompletionStr = "";
    if (estCompletion) {
      estCompletionStr = new Date(estCompletion).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }

    // Timeline Configuration
    let stages = [];
    let stageLabels = {};

    if (isOrder) {
      stages = ["pending", "processing", "completed"];
      stageLabels = {
        "pending": "Submitted",
        "processing": "Processing",
        "completed": "Completed",
        "cancelled": "Cancelled"
      };
    } else {
      stages = ["Submitted", "Quote Sent", "Approved", "Digitizing", "Production", "Delivered"];
      stageLabels = {
        "Submitted": "Submitted",
        "Guest Lead": "Submitted",
        "Quote Sent": "Quote Sent",
        "Approved": "Approved",
        "Digitizing": "Digitizing",
        "Production": "Production",
        "Delivered": "Delivered",
        "Rejected": "Rejected",
        "Cancelled": "Cancelled"
      };
    }

    // Standard statuses
    const isSpecialStatus = currentStatus === "cancelled" || currentStatus === "Cancelled" || currentStatus === "Rejected";

    // Build timeline items HTML
    let timelineHtml = "";
    
    if (isSpecialStatus) {
      timelineHtml = `
        <div style="background: #fff1f0; border: 1px solid #ffa39e; border-radius: 6px; padding: 16px; text-align: center; color: #cf1322; font-weight: 600;">
          This tracking reference status is currently marked as: ${escapeHtml(currentStatus.toUpperCase())}.
        </div>
      `;
    } else {
      // Find current stage index in stages
      let currentStageIndex = stages.indexOf(currentStatus);
      if (currentStatus === "Guest Lead") currentStageIndex = 0; // Guest Lead is step 1

      timelineHtml = `
        <div class="tracking-timeline-container" style="margin-top: 24px; position: relative;">
          <div style="position: absolute; top: 16px; left: 0; right: 0; height: 2px; background: var(--border); z-index: 1;"></div>
          <div class="tracking-timeline-flow" style="display: flex; justify-content: space-between; align-items: flex-start; position: relative;">
            
            ${stages.map((stage, index) => {
              let stepClass = "pending"; // default
              let stepColor = "var(--ink-soft)";
              
              if (index < currentStageIndex) {
                stepClass = "completed";
                stepColor = "#25d366"; // Green
              } else if (index === currentStageIndex) {
                stepClass = "current";
                stepColor = "#d4af37"; // Gold
              } else {
                stepClass = "pending";
                stepColor = "#bfbfbf"; // Gray
              }

              // Let's check status_history timestamps to show completed dates
              const historyItem = statusHistory.find(h => {
                if (stage === "Submitted" && (h.status === "Submitted" || h.status === "Guest Lead")) return true;
                return h.status.toLowerCase() === stage.toLowerCase();
              });

              let timeStr = "";
              if (historyItem) {
                timeStr = new Date(historyItem.timestamp).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short"
                });
              }

              return `
                <div class="tracking-step ${stepClass}" style="flex: 1; display: grid; gap: 8px; justify-items: center; text-align: center; position: relative;">
                  <div class="tracking-dot" style="
                    width: 32px; 
                    height: 32px; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 13px; 
                    font-weight: 700; 
                    z-index: 2;
                    background: ${stepClass === 'completed' ? '#25d366' : stepClass === 'current' ? '#d4af37' : '#e5e5e5'};
                    color: ${stepClass === 'pending' ? 'var(--navy)' : '#fff'};
                    border: 2px solid ${stepClass === 'completed' ? '#25d366' : stepClass === 'current' ? '#d4af37' : 'var(--border)'};
                  ">
                    ${stepClass === 'completed' ? icon("check", 14) : index + 1}
                  </div>
                  
                  <div style="display: grid; gap: 2px;">
                    <span class="tracking-label" style="font-weight: 700; font-size: 11px; color: var(--navy); white-space: nowrap;">
                      ${stageLabels[stage] || stage}
                    </span>
                    ${timeStr ? `<span style="font-size: 9px; color: var(--ink-soft);">${timeStr}</span>` : ""}
                  </div>
                </div>
              `;
            }).join("")}
            
          </div>
        </div>
      `;
    }

    // Design Order Items summary
    let itemsSummaryHtml = "";
    if (isOrder) {
      const itemsList = data.items || [];
      const subtotal = Number(data.total || 0);
      const processingFee = subtotal > 0 ? 50 : 0; // standard processing fee
      const grandTotal = subtotal + processingFee;

      itemsSummaryHtml = `
        <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; display: grid; gap: 20px;">
          <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--navy); margin: 0; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Order Summary</h3>
          <div style="display: grid; gap: 16px;">
            ${itemsList.map(item => {
              const product = item.product || {};
              return `
                <div style="display: flex; gap: 16px; align-items: center;">
                  <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" style="width: 64px; height: 64px; object-fit: cover; border: 1px solid var(--border); border-radius: 4px;" />
                  <div style="flex: 1; display: grid; gap: 4px;">
                    <strong style="font-size: 14px; color: var(--navy);">${escapeHtml(product.title)}</strong>
                    <div style="display: flex; gap: 12px; font-size: 12px; color: var(--ink-soft);">
                      <span>Code: ${escapeHtml(product.code)}</span>
                      <span>Format: ${escapeHtml(item.format)}</span>
                      ${product.total_stitch_count ? `<span>Stitches: ${product.total_stitch_count.toLocaleString()}</span>` : ""}
                    </div>
                  </div>
                  <span style="font-weight: 600; color: var(--navy); font-size: 14px;">${money(item.price)}</span>
                </div>
              `;
            }).join("")}
          </div>
          
          <div style="border-top: 1px solid var(--border); padding-top: 16px; display: grid; gap: 8px; font-size: 14px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--ink-soft);">Subtotal:</span>
              <span style="color: var(--navy);">${money(subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--ink-soft);">Processing Fee:</span>
              <span style="color: var(--navy);">${money(processingFee)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; border-top: 1px dashed var(--border); padding-top: 8px; margin-top: 4px;">
              <span style="color: var(--navy);">Grand Total:</span>
              <span style="color: var(--navy);">${money(grandTotal)}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      // Custom request tracking
      const isCartQuote = data.request_source === 'cart_quote';

      if (isCartQuote) {
        const cartItems = data.cart_items || [];
        
        // Download digitized result if delivered/completed
        let downloadFileHtml = "";
        if (data.digitized_file) {
          downloadFileHtml = `
            <div style="background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; padding: 20px; display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
              <div>
                <strong style="color: #389e0d; font-size: 14px; display: block; margin-bottom: 2px;">Designs Ready!</strong>
                <span style="font-size: 12px; color: var(--ink-soft);">Your high-quality embroidery files are ready for download.</span>
              </div>
              <a href="${escapeHtml(data.digitized_file)}" target="_blank" class="button" style="background: #52c41a; color: #fff; border: none; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; font-weight: 700; border-radius: 4px; font-size: 13px;">
                ${icon("arrow-down", 14)} Download Designs
              </a>
            </div>
          `;
        }

        itemsSummaryHtml = `
          <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; display: grid; gap: 16px;">
            <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--navy); margin: 0; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Inquiry Design Items</h3>
            
            <div class="admin-table-wrapper" style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border); color: var(--navy); font-weight: 700;">
                    <th style="padding: 10px 8px;">Design</th>
                    <th style="padding: 10px 8px;">Format</th>
                    <th style="padding: 10px 8px;">Qty</th>
                    <th style="padding: 10px 8px; text-align: right;">Est. Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${cartItems.map(item => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 12px 8px; display: flex; align-items: center; gap: 12px;">
                        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.product_name)}" style="width: 48px; height: 48px; object-fit: cover; border: 1px solid var(--border); border-radius: 4px;" />
                        <div>
                          <strong style="color: var(--navy); display: block;">${escapeHtml(item.product_name)}</strong>
                          <span style="font-size: 10px; color: var(--ink-soft);">Code: ${escapeHtml(item.product_slug)}</span>
                        </div>
                      </td>
                      <td style="padding: 12px 8px;">${escapeHtml(item.selected_format)}</td>
                      <td style="padding: 12px 8px;"><strong>${item.quantity}</strong></td>
                      <td style="padding: 12px 8px; text-align: right; font-weight: 600;">${money(item.line_total)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>

            <div style="font-size: 13px; margin-top: 10px;">
              <span style="color: var(--ink-soft); display: block; margin-bottom: 4px;">Customer Inquiry Notes</span>
              <p style="color: var(--navy); margin: 0; line-height: 1.6; background: var(--surface); padding: 12px; border-radius: 4px; font-style: italic;">
                "${escapeHtml(data.notes || "No notes provided.")}"
              </p>
            </div>

            ${data.quote_amount ? `
              <div style="border-top: 1px solid var(--border); padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="color: var(--ink-soft); font-size: 13px;">Quote Amount:</span>
                  <span style="font-size: 11px; margin-left: 8px; background: ${data.payment_status === 'paid' ? '#f6ffed' : '#fff7e6'}; color: ${data.payment_status === 'paid' ? '#389e0d' : '#d46b08'}; font-weight:700; padding:2px 8px; border-radius:99px; text-transform:uppercase;">
                    ${escapeHtml(data.payment_status)}
                  </span>
                </div>
                <strong style="font-size: 18px; color: var(--navy);">${money(data.quote_amount)}</strong>
              </div>
            ` : ""}

            ${downloadFileHtml}
          </div>
        `;
      } else {
        // Custom digitizing details
        let notesData = {};
        try {
          notesData = JSON.parse(data.notes);
        } catch (e) {
          notesData = {
            project_description: data.notes,
            fabric_type: "N/A",
            machine_format: "DST",
            urgency: "Standard",
            quantity: 1
          };
        }

        // Multiple reference image rendering
        const artworkUrls = data.artwork_attachment ? data.artwork_attachment.split(", ").filter(Boolean) : [];
        let referencesHtml = "";
        if (artworkUrls.length > 0) {
          referencesHtml = `
            <div style="margin-top: 16px;">
              <div style="font-weight: 700; font-size: 12px; color: var(--navy); text-transform: uppercase; margin-bottom: 8px;">Uploaded Artwork Reference Files</div>
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                ${artworkUrls.map((url, idx) => `
                  <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="border: 1px solid var(--border); border-radius: 4px; overflow: hidden; display: block; width: 80px; height: 80px; background: var(--surface);">
                    <img src="${escapeHtml(url)}" alt="Artwork #${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;" />
                  </a>
                `).join("")}
              </div>
            </div>
          `;
        }

        // Download digitized result if delivered/completed
        let downloadFileHtml = "";
        if (data.digitized_file) {
          downloadFileHtml = `
            <div style="background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; padding: 20px; display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
              <div>
                <strong style="color: #389e0d; font-size: 14px; display: block; margin-bottom: 2px;">Digitizing Completed!</strong>
                <span style="font-size: 12px; color: var(--ink-soft);">Your high-quality embroidery files are ready for download.</span>
              </div>
              <a href="${escapeHtml(data.digitized_file)}" target="_blank" class="button" style="background: #52c41a; color: #fff; border: none; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; font-weight: 700; border-radius: 4px; font-size: 13px;">
                ${icon("arrow-down", 14)} Download Design
              </a>
            </div>
          `;
        }

        itemsSummaryHtml = `
          <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; display: grid; gap: 16px;">
            <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--navy); margin: 0; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Digitizing Specifications</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
              <div>
                <span style="color: var(--ink-soft); display: block;">Project Type / Application</span>
                <strong style="color: var(--navy);">${escapeHtml(data.project_type || "N/A")}</strong>
              </div>
              <div>
                <span style="color: var(--ink-soft); display: block;">Fabric Base</span>
                <strong style="color: var(--navy);">${escapeHtml(notesData.fabric_type || "N/A")}</strong>
              </div>
              <div>
                <span style="color: var(--ink-soft); display: block;">Format Selected</span>
                <strong style="color: var(--navy);">${escapeHtml(notesData.machine_format || "DST")}</strong>
              </div>
              <div>
                <span style="color: var(--ink-soft); display: block;">Urgency Priority</span>
                <strong style="color: var(--navy);">${escapeHtml(notesData.urgency || "Standard")}</strong>
              </div>
            </div>

            <div style="border-top: 1px solid var(--border); padding-top: 16px; font-size: 13px;">
              <span style="color: var(--ink-soft); display: block; margin-bottom: 4px;">Custom Request Details</span>
              <p style="color: var(--navy); margin: 0; line-height: 1.6; background: var(--surface); padding: 12px; border-radius: 4px;">
                ${escapeHtml(notesData.project_description || "No description provided.")}
              </p>
            </div>

            ${referencesHtml}

            ${data.quote_amount ? `
              <div style="border-top: 1px solid var(--border); padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <span style="color: var(--ink-soft); font-size: 13px;">Quote Amount:</span>
                  <span style="font-size: 11px; margin-left: 8px; background: ${data.payment_status === 'paid' ? '#f6ffed' : '#fff7e6'}; color: ${data.payment_status === 'paid' ? '#389e0d' : '#d46b08'}; font-weight:700; padding:2px 8px; border-radius:99px; text-transform:uppercase;">
                    ${escapeHtml(data.payment_status)}
                  </span>
                </div>
                <strong style="font-size: 18px; color: var(--navy);">${money(data.quote_amount)}</strong>
              </div>
            ` : ""}

            ${downloadFileHtml}
          </div>
        `;
      }
    }

    // CMS notes updates card
    let updatesSectionHtml = "";
    if (statusNote) {
      updatesSectionHtml = `
        <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 20px; display: grid; gap: 8px; box-shadow: var(--shadow-deep); border-left: 4px solid var(--gold);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--gold); display: flex; align-items: center;">
              ${icon("bell", 16)}
            </span>
            <strong style="color: var(--navy); font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Latest Update</strong>
          </div>
          <p style="color: var(--navy); font-size: 14px; margin: 0; line-height: 1.5; font-style: italic;">
            "${escapeHtml(statusNote)}"
          </p>
        </div>
      `;
    }

    contentHtml = `
      <div style="display: grid; gap: 24px; margin-top: 24px;">
        
        <!-- Timeline Dashboard Header -->
        <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; box-shadow: var(--shadow-deep); display: grid; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
            <div>
              <span style="font-size: 12px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Tracking Reference</span>
              <h2 style="font-size: 20px; font-family: monospace; color: var(--navy); margin: 4px 0 0 0; font-weight: 700;">${escapeHtml(refCode)}</h2>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 12px; color: var(--ink-soft); display: block;">Tracking Registered</span>
              <strong style="color: var(--navy); font-size: 14px;">${createdDateStr}</strong>
            </div>
          </div>

          <!-- Timeline progress dots -->
          ${timelineHtml}

          <!-- Estimated completion date -->
          ${estCompletionStr ? `
            <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 12px 16px; display: flex; align-items: center; gap: 8px; margin-top: 10px;">
              <span style="color: var(--gold); display: flex;">${icon("clock", 16)}</span>
              <span style="font-size: 13px; color: var(--navy); font-weight: 600;">
                Estimated Completion: ${estCompletionStr}
              </span>
            </div>
          ` : ""}
        </div>

        <!-- Latest Updates Section -->
        ${updatesSectionHtml}

        <!-- Details Summary -->
        ${itemsSummaryHtml}

        <!-- Actions CTAs to reduce bounce/abandonment -->
        <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; display: grid; gap: 16px; text-align: center; box-shadow: var(--shadow-deep);">
          <div>
            <h4 style="font-family: var(--font-serif); font-size: 16px; color: var(--navy); margin: 0 0 4px 0; font-weight: 700;">Need help with your shipment or designs?</h4>
            <p style="color: var(--ink-soft); font-size: 13px; margin: 0;">Get in touch directly with our support team. We reply within 24 hours.</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; width: 100%; margin-top: 8px;">
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="button" style="background: #25d366; color: #fff; border: none; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; border-radius: 4px; font-weight: 700; font-size: 14px;">
              ${icon("phone", 16)} WhatsApp Support
            </a>
            <a href="tel:${(site.brand?.contact?.phone || "+919876543210").replace(/\s+/g, '')}" class="button button-secondary" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; font-weight: 700; font-size: 14px;">
              ${icon("phone", 16)} Call Support
            </a>
            <a href="${emailUrl}" class="button button-secondary" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; font-weight: 700; font-size: 14px;">
              ${icon("mail", 16)} Email Support
            </a>
          </div>
        </div>

      </div>
    `;
  } else {
    // Empty state - waiting for query
    contentHtml = `
      <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 48px 24px; text-align: center; display: grid; gap: 16px; justify-items: center; box-shadow: var(--shadow-deep);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--ink-soft);">
          ${icon("search", 24)}
        </div>
        <h3 style="font-family: var(--font-serif); font-size: 20px; color: var(--navy); margin: 0; font-weight: 700;">Awaiting Tracking Reference</h3>
        <p style="color: var(--ink-soft); font-size: 13px; max-width: 360px; margin: 0; line-height: 1.6;">
          Enter your design purchase or custom order ID above to fetch instant shipping and production updates.
        </p>
      </div>
    `;
  }

  return `
    <section class="content-section" style="padding: 120px 24px; background: var(--ivory); min-height: 90vh;">
      <div style="max-width: 720px; margin: 0 auto;">
        
        <!-- Header Text -->
        <div style="text-align: center; margin-bottom: 32px; display: grid; gap: 8px;">
          <h1 style="font-family: var(--font-serif); font-size: 36px; color: var(--navy); margin: 0; font-weight: 700;">Track Your Shipment</h1>
          <p style="color: var(--ink-soft); font-size: 14px; max-width: 500px; margin: 0 auto;">
            Enter your design order ID or custom digitizing request reference code to view production status and download files.
          </p>
        </div>

        <!-- Search Bar Input Card -->
        <div style="background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 24px; margin-bottom: 24px; box-shadow: var(--shadow-deep);">
          <form id="trackSearchForm" style="display: flex; gap: 12px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 260px; position: relative;">
              <input 
                type="text" 
                id="trackingRefInput" 
                placeholder="e.g. GD-ORD-2026-A7X9K2M4" 
                value="${escapeHtml(searchInput)}"
                required 
                style="width: 100%; border: 1px solid var(--border); border-radius: 4px; padding: 12px 16px; font-size: 14px; font-family: monospace; text-transform: uppercase;"
              />
            </div>
            <button 
              type="submit" 
              class="button button-primary" 
              style="min-height: 48px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; padding: 0 24px; flex-shrink: 0;"
              ${isLoading ? "disabled" : ""}
            >
              <span>Track Order</span>
              ${icon("compass", 18)}
            </button>
          </form>
        </div>

        <!-- Dynamic Output -->
        <div id="trackingOutputArea">
          ${contentHtml}
        </div>

      </div>
    </section>
  `;
}

// Bind event listeners
let trackingEventsBound = false;
export function initOrderTrackingDelegates() {
  if (trackingEventsBound) return;
  trackingEventsBound = true;

  document.addEventListener("submit", async (e) => {
    if (e.target.id === "trackSearchForm") {
      e.preventDefault();
      const inputEl = document.getElementById("trackingRefInput");
      if (!inputEl) return;

      const rawVal = inputEl.value;
      if (!rawVal) return;

      const cleanVal = normalizeRef(rawVal);
      searchInput = rawVal;
      isLoading = true;
      errorMessage = "";
      trackingResult = null;
      triggerRender();

      // Update browser hash query param without triggering full reload router loop
      // We update parameter so users can share this URL directly
      const currentHash = window.location.hash.split("?")[0] || "#/track-order";
      window.history.replaceState(null, "", `${currentHash}?ref=${cleanVal}`);

      try {
        const result = await trackingService.trackReference(cleanVal);
        if (result) {
          trackingResult = result;
        } else {
          trackingResult = "not_found";
        }
      } catch (err) {
        console.error("Tracking query error:", err);
        errorMessage = err.message || "Failed to search tracking reference.";
      } finally {
        isLoading = false;
        triggerRender();
      }
    }
  });
}
