import { site, triggerRender, getFaqs } from "../services/store.js";
import { escapeHtml, icon } from "../utils/helpers.js";

// Helper to render luxury layout with title, kicker, and structured content sections
function renderSupportLayout(kicker, title, sectionsHtml) {
  return `
    <article class="content-section" style="padding: 120px 24px; background: var(--ivory); min-height: 90vh; font-family: var(--font-sans);">
      <div style="max-width: 800px; margin: 0 auto; display: grid; gap: 48px;">
        <header style="text-align: center; display: grid; gap: 12px;">
          <span style="font-size: 12px; color: var(--gold); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">${escapeHtml(kicker)}</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(32px, 5vw, 42px); color: var(--navy); font-weight: 700; margin: 0;">${escapeHtml(title)}</h1>
          <div style="width: 60px; height: 1.5px; background: var(--gold); margin: 16px auto 0;"></div>
        </header>

        <section style="background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: clamp(24px, 5vw, 48px); box-shadow: var(--shadow-deep); display: grid; gap: 32px; line-height: 1.8; color: var(--navy); font-size: 14px;">
          ${sectionsHtml}
        </section>
      </div>
    </article>
  `;
}

// --------------------------------------------------
// 1. FAQs SCREEN
// --------------------------------------------------
export function renderFAQs() {
  const faqsList = getFaqs() || [];

  let faqsHtml = "";
  if (faqsList.length === 0) {
    faqsHtml = `
      <p style="color: var(--ink-soft); text-align: center; font-style: italic;">No frequently asked questions available.</p>
    `;
  } else {
    // Group FAQs by category
    const grouped = {};
    faqsList.forEach(faq => {
      const cat = faq.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(faq);
    });

    faqsHtml = Object.entries(grouped).map(([category, items]) => `
      <div style="display: grid; gap: 16px; border-bottom: 1px dashed var(--border); padding-bottom: 24px; margin-bottom: 8px;">
        <h3 style="font-family: var(--font-serif); font-size: 16px; color: var(--gold); font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(category)}</h3>
        <div style="display: grid; gap: 16px;">
          ${items.map(faq => `
            <div style="display: grid; gap: 6px;">
              <strong style="font-size: 15px; color: var(--navy); display: flex; gap: 8px; align-items: start;">
                <span style="color: var(--gold);">${icon("help-circle", 16)}</span>
                <span>${escapeHtml(faq.question)}</span>
              </strong>
              <p style="margin: 0 0 0 24px; color: var(--ink-soft); font-size: 14px; line-height: 1.6;">${escapeHtml(faq.answer)}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  return renderSupportLayout("Help Center", "Frequently Asked Questions", faqsHtml);
}

// --------------------------------------------------
// 2. SHIPPING & DELIVERY SCREEN
// --------------------------------------------------
export function renderShippingDelivery() {
  const sectionsHtml = `
    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">1. Digital File Delivery</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        All embroidery designs purchased from our catalog library are available for **instant digital download** immediately following payment verification. A download button will appear on the confirmation screen, and links will be sent to your registered email address. You can also access downloads under your order tracking or account profile tabs.
      </p>
    </div>

    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">2. Custom Digitizing Orders</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        Custom digitizing requests are processed manually by our creative team:
        - **Price Quotes**: Emailed within 12-24 hours of submission.
        - **Stitch-out Simulation & File Delivery**: Once you approve the quote and proceed with payment, we digitize, run simulations, and deliver files within **2-3 business days** (expedited delivery is available upon request).
      </p>
    </div>

    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">3. File Formats Included</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        Your purchase grants you download rights to all supported machine formats including **Tajima (DST), Brother (PES), Janome (JEF), Bernina (EXP), and Singer (XXX)**. We do not ship physical USBs, cards, or fabrics.
      </p>
    </div>
  `;

  return renderSupportLayout("Delivery Terms", "Shipping & Delivery Policy", sectionsHtml);
}

// --------------------------------------------------
// 3. RETURNS & REFUNDS SCREEN
// --------------------------------------------------
export function renderReturnsRefunds() {
  const sectionsHtml = `
    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">1. Digital Goods Refund Policy</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        Due to the electronic nature of our downloadable embroidery designs, we **do not offer refunds, exchanges, or returns** once files are purchased and downloaded. Please ensure your machine hoop sizes and compatibility match our designs prior to completing checkout.
      </p>
    </div>

    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">2. Custom Digitizing Adjustments</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        For custom orders, your satisfaction is our primary goal. If a digitized custom design does not stitch out correctly on your production machine:
        - We provide **up to three (3) rounds of manual stitch calibration edits** (stitch density adjustments, path updates, size corrections) free of charge within 14 days of delivery.
        - You must supply a photograph of the physical stitch-out showing the issue (puckering, gaps, loopings) to help us recalibrate.
      </p>
    </div>

    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">3. Contact Support</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        If you experience technical issues downloading your files or importing them into your machine software, please contact our digitizers at **${escapeHtml(site.brand?.contact?.email || 'support@godavaridesigner.com')}** for immediate support.
      </p>
    </div>
  `;

  return renderSupportLayout("Client Guarantees", "Returns & Refunds Policy", sectionsHtml);
}

// --------------------------------------------------
// 4. TERMS OF SERVICE SCREEN
// --------------------------------------------------
export function renderTermsService() {
  const sectionsHtml = `
    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">1. Design Usage License</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        By purchasing a design from Godavari Designer, you receive a **non-exclusive, royalty-free commercial usage license**:
        - You **may** embroider the design on garments, fabrics, or finished items for personal use or resale.
        - You **may not** resell, share, lease, trade, copy, or redistribute the digital design files themselves, in whole or in part, under any circumstances.
      </p>
    </div>

    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">2. Intellectual Property Rights</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        All designs, vector paths, digitizing guidelines, photographs, brand copy, and software components on this website are protected under international copyright law and remain the sole property of Godavari Designer.
      </p>
    </div>

    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">3. Limitation of Liability</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        While we stitch-test and verify our designs, Godavari Designer cannot be held liable for fabric damage, needles broken, or production machine malfunctions resulting from the use of our files. Always run a small test stitch-out on backing material prior to production.
      </p>
    </div>
  `;

  return renderSupportLayout("Legal Terms", "Terms of Service Agreement", sectionsHtml);
}

// --------------------------------------------------
// 5. PRIVACY POLICY SCREEN
// --------------------------------------------------
export function renderPrivacyPolicy() {
  const sectionsHtml = `
    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">1. Information Collected</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        We collect only essential details necessary to process design catalog purchases, track custom digitized requests, and verify user profiles. This includes your name, email address, phone number, shipping address, and files uploaded for custom quotes.
      </p>
    </div>

    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">2. Secure Payment Processing</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        We never process or store raw credit card numbers or banking secrets. Payment transactions are executed securely via accredited gateways (Stripe, Razorpay, or PayPal) and encrypted via SSL protocols.
      </p>
    </div>

    <div style="display: grid; gap: 12px;">
      <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">3. Data Security</h3>
      <p style="margin: 0; color: var(--ink-soft); line-height: 1.7;">
        We implement industry-standard database security patterns to protect your user profile and files. We never share, rent, sell, or disclose your contact details or custom digitizing artwork to third-party databases.
      </p>
    </div>
  `;

  return renderSupportLayout("Data Protection", "Privacy Policy Statement", sectionsHtml);
}
