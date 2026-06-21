import { site } from "../services/store.js";
import { LOCATIONS_DATA } from "../data/seoLandingPages.js";
import { escapeHtml, icon } from "../utils/helpers.js";

export function renderLocationPage(slug) {
  const location = LOCATIONS_DATA[slug];
  if (!location) {
    return `<div style="padding:100px; text-align:center; font-family:var(--font-sans); color:var(--navy);">Location page not found.</div>`;
  }

  return `
    <article style="background: var(--ivory); min-height: 90vh; font-family: var(--font-sans); color: var(--navy); padding-bottom: 80px;">
      <!-- Breadcrumb Bar -->
      <div style="max-width: 1100px; margin: 0 auto; padding: 24px 24px 0; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;">
        <a href="#/" style="color: var(--ink-soft); text-decoration: none; transition: color 200ms;">Home</a>
        <span style="color: var(--border); font-weight: normal;">/</span>
        <span style="color: var(--ink-soft);">Locations</span>
        <span style="color: var(--border); font-weight: normal;">/</span>
        <span style="color: var(--navy);">${escapeHtml(location.kicker)}</span>
      </div>

      <!-- Hero Section -->
      <section style="max-width: 1100px; margin: 24px auto 0; padding: 0 24px;">
        <div style="background: #111D42; color: #fff; border-radius: 12px; padding: clamp(40px, 8vw, 85px) 24px; text-align: center; display: grid; gap: 16px; position: relative; overflow: hidden; box-shadow: var(--shadow-deep);">
          <div style="position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(var(--gold) 1px, transparent 1px); background-size: 20px 20px;"></div>
          <div style="max-width: 800px; margin: 0 auto; z-index: 1; display: grid; gap: 16px;">
            <span style="font-size: 11px; text-transform: uppercase; color: var(--gold); font-weight: 700; letter-spacing: 0.15em;">${escapeHtml(location.kicker)}</span>
            <h1 style="font-family: var(--font-serif); font-size: clamp(26px, 4.5vw, 40px); font-weight: 700; line-height: 1.2; margin: 0; color: #ffffff;">${escapeHtml(location.h1)}</h1>
            <div style="width: 65px; height: 2px; background: var(--gold); margin: 8px auto 16px;"></div>
            <p style="font-size: 15px; color: rgba(255,255,255,0.7); max-width: 600px; margin: 0 auto;">
              ${escapeHtml(location.trustSection.experience)} &middot; ${escapeHtml(location.trustSection.rating)}
            </p>
          </div>
        </div>
      </section>

      <!-- Content Grid -->
      <section style="max-width: 1100px; margin: 40px auto 0; padding: 0 24px; display: grid; grid-template-columns: 1fr; gap: 40px; position: relative; z-index: 2;">
        
        <!-- Main Content -->
        <div style="display: grid; gap: 40px;">
          
          <!-- Editorial Copy Card -->
          <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 12px; padding: clamp(24px, 5vw, 48px); box-shadow: var(--shadow-deep); display: grid; gap: 32px; line-height: 1.8; font-size: 15px;">
            <div>
              <h2 style="font-family: var(--font-serif); font-size: 22px; font-weight: 700; margin: 0 0 16px; color: var(--navy);">Our Custom Embroidery Solutions</h2>
              <p style="color: var(--ink-soft); margin: 0;">${escapeHtml(location.intro)}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; border-top: 1px solid var(--border); padding-top: 28px;">
              <!-- Services Available -->
              <div>
                <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 700; margin: 0 0 16px; color: var(--navy);">Services Available</h3>
                <ul style="margin: 0; padding-left: 20px; color: var(--ink-soft); font-size: 14px; display: grid; gap: 10px;">
                  ${location.serviceCoverage.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
              </div>
              
              <!-- How Remote Ordering Works -->
              <div>
                <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 700; margin: 0 0 16px; color: var(--navy);">How Remote Ordering Works</h3>
                <ol style="margin: 0; padding-left: 20px; color: var(--ink-soft); font-size: 14px; display: grid; gap: 10px;">
                  ${location.remoteOrdering.map(step => `<li>${escapeHtml(step)}</li>`).join("")}
                </ol>
              </div>
            </div>

            <!-- Trust section details -->
            <div style="border-top: 1px solid var(--border); padding-top: 28px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
              <div>
                <h4 style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: var(--gold); letter-spacing: 0.05em;">Coverage Area</h4>
                <p style="margin: 0; font-size: 15px; font-weight: 700; color: var(--navy);">${escapeHtml(location.trustSection.experience)}</p>
              </div>
              <div>
                <h4 style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: var(--gold); letter-spacing: 0.05em;">Client Rating</h4>
                <p style="margin: 0; font-size: 15px; font-weight: 700; color: var(--navy);">${escapeHtml(location.trustSection.rating)}</p>
              </div>
              <div>
                <h4 style="margin: 0 0 4px; font-size: 11px; text-transform: uppercase; color: var(--gold); letter-spacing: 0.05em;">Boutique Network</h4>
                <p style="margin: 0; font-size: 15px; font-weight: 700; color: var(--navy);">${escapeHtml(location.trustSection.partners)}</p>
              </div>
            </div>
          </div>

          <!-- Maps Integration (Only for Rajahmundry) -->
          ${location.showMap && location.mapUrl ? `
            <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: var(--shadow-deep); display: grid; gap: 16px;">
              <h3 style="font-family: var(--font-serif); font-size: 20px; font-weight: 700; margin: 0; color: var(--navy); text-align: center;">Our Workspace Location</h3>
              <div style="width: 100%; height: 350px; overflow: hidden; border-radius: 8px; border: 1px solid var(--border);">
                <iframe src="${location.mapUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </div>
          ` : ""}

          <!-- FAQs Section -->
          <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 12px; padding: clamp(24px, 5vw, 40px); box-shadow: var(--shadow-deep); display: grid; gap: 24px;">
            <h3 style="font-family: var(--font-serif); font-size: 24px; font-weight: 700; margin: 0; color: var(--navy); text-align: center;">Frequently Asked Questions</h3>
            <div style="display: grid; gap: 20px; margin-top: 10px;">
              ${location.faqs.map(faq => `
                <div style="display: grid; gap: 6px; border-bottom: 1px solid var(--ivory); padding-bottom: 16px;">
                  <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--navy); display: flex; align-items: start; gap: 8px;">
                    <span style="color: var(--gold); font-size: 18px; line-height: 1;">&middot;</span>
                    <span>${escapeHtml(faq.q)}</span>
                  </h4>
                  <p style="margin: 0 0 0 16px; font-size: 13px; color: var(--ink-soft); line-height: 1.6;">${escapeHtml(faq.a)}</p>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Related Links Row -->
          <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: var(--shadow-deep); display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: center;">
            <span style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--gold); letter-spacing: 0.05em;">Embroidery Offerings:</span>
            ${location.internalLinks.map(link => `
              <a href="${link.url}" style="font-size: 14px; font-weight: 600; color: var(--navy); text-decoration: none; transition: color 200ms; border-bottom: 1.5px solid var(--border); padding-bottom: 2px;" onmouseover="this.style.color='var(--gold)';" onmouseout="this.style.color='var(--navy)';">
                ${escapeHtml(link.text)}
              </a>
            `).join("")}
          </div>

          <!-- B2B & Lead CTA Card -->
          <div style="background: #111D42; border-radius: 12px; padding: 48px 32px; text-align: center; color: #ffffff; display: grid; gap: 24px; box-shadow: var(--shadow-deep);">
            <div style="display:grid; gap:8px;">
              <h3 style="font-family: var(--font-serif); font-size: 28px; font-weight: 600; margin: 0; color: #ffffff;">Embroidery Digitizing on WhatsApp</h3>
              <p style="color: rgba(255,255,255,0.7); max-width: 600px; margin: 0 auto; font-size: 14px; line-height: 1.6;">
                Get in touch with our design team immediately. Submit your sketches, dimensions, and fabric selection for a quick quotes and machine setups.
              </p>
            </div>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: 8px;">
              <a href="#/custom-order" class="button button-primary" style="background: var(--gold); color: var(--navy); text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; border-radius: 6px;">
                <span>Submit Custom Inquiry</span>
                ${icon("arrow-right", 18)}
              </a>
              <a href="https://wa.me/918309897055?text=${encodeURIComponent('Hi Godavari Designers, I would like to inquire about your local digitizing services in ' + location.kicker + '.')}" target="_blank" class="button" style="background: #25D366; color: #fff; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; border-radius: 6px; border: 0;">
                <span>Chat on WhatsApp</span>
                ${icon("phone", 18)}
              </a>
            </div>
          </div>

        </div>

      </section>
    </article>
  `;
}
