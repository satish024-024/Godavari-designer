import { site, triggerRender } from "../services/store.js";
import { testimonialService } from "../services/supabase.js";
import { escapeHtml, attr, icon } from "../utils/helpers.js";

// Reviews State
let reviewsList = [];
let loadingReviews = false;
let reviewsLoaded = false;

async function loadReviews() {
  if (loadingReviews || reviewsLoaded) return;
  loadingReviews = true;
  try {
    const data = await testimonialService.getTestimonials();
    reviewsList = data || [];
    reviewsLoaded = true;
  } catch (err) {
    console.error("Failed to load reviews:", err);
  } finally {
    loadingReviews = false;
    triggerRender();
  }
}

// --------------------------------------------------
// 1. ABOUT US SCREEN
// --------------------------------------------------
export function renderAboutUs() {
  return `
    <article class="content-section" style="padding: 120px 24px; background: var(--ivory); min-height: 90vh; font-family: var(--font-sans);">
      <div style="max-width: 900px; margin: 0 auto; display: grid; gap: 48px;">
        <header style="text-align: center; display: grid; gap: 12px;">
          <span style="font-size: 12px; color: var(--gold); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">About Godavari Designers</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(32px, 5vw, 48px); color: var(--navy); font-weight: 700; margin: 0;">Our Studio & Craftsmanship</h1>
          <div style="width: 60px; height: 1.5px; background: var(--gold); margin: 16px auto 0;"></div>
        </header>

        <section style="display: grid; gap: 40px; line-height: 1.8; color: var(--navy); font-size: 15px;">
          <p style="font-size: 19px; font-family: var(--font-serif); color: var(--gold); line-height: 1.6; text-align: center; max-width: 780px; margin: 0 auto; font-style: italic;">
            Godavari Designers represents the intersection of classical Indian artisanal embroidery and state-of-the-art digital design engineering.
          </p>

          <div style="display: grid; gap: 24px;">
            <h2 style="font-family: var(--font-serif); font-size: 24px; color: var(--navy); margin: 0; text-align: center;">Who We Are & Where We Operate</h2>
            <p style="margin: 0; color: var(--ink-soft); text-align: justify;">
              Founded on the banks of the sacred Godavari river in <strong>Rajahmundry, Andhra Pradesh, India</strong>, Godavari Designers is a professional, registered custom embroidery digitizing studio. We serve boutiques, fashion designers, apparel brands, custom garment workshops, and embroidery businesses across Andhra Pradesh, India, and internationally. Our mission is to preserve heirloom textile traditions while engineering files that run flawlessly on modern industrial and home embroidery machines.
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;">
            <div style="display: grid; gap: 12px; background: #ffffff; padding: 28px; border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-deep);">
              <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">Custom Digitizing</h3>
              <p style="margin: 0; color: var(--ink-soft); font-size: 13.5px; line-height: 1.6;">We convert logos, vector designs, and hand-drawn sketches into high-performance stitch files (DST, PES, EXP, JEF, XXX) optimized for Tajima, Brother, Bernina, Janome, and Singer machines.</p>
            </div>
            <div style="display: grid; gap: 12px; background: #ffffff; padding: 28px; border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-deep);">
              <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">Bridal & Blouse Design</h3>
              <p style="margin: 0; color: var(--ink-soft); font-size: 13.5px; line-height: 1.6;">We create heavy bridal blouse embroidery designs, intricate necklines, and sleeve borders. Every coordinate is digitized with stitch length and density adjustments tailored to silk, velvet, and organza.</p>
            </div>
            <div style="display: grid; gap: 12px; background: #ffffff; padding: 28px; border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-deep);">
              <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">Saree Borders & Logos</h3>
              <p style="margin: 0; color: var(--ink-soft); font-size: 13.5px; line-height: 1.6;">We specialize in continuous repeating saree borders and precision logo digitizing for left-chest shirts, corporate uniforms, caps, and leather goods, ensuring clean lettering and zero thread breaks.</p>
            </div>
          </div>

          <div style="display: grid; gap: 24px; background: #ffffff; border: 1.5px solid var(--gold); border-radius: 8px; padding: 32px; box-shadow: var(--shadow-deep); margin-top: 16px;">
            <h3 style="font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--navy); margin: 0; text-align: center;">Verified Business Information (NAP)</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 12px; font-size: 14px; color: var(--navy);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: var(--gold);">${icon("building-2", 20)}</span>
                <div>
                  <strong>Registered Brand:</strong><br />
                  <span>Godavari Designers</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: var(--gold);">${icon("map-pin", 20)}</span>
                <div>
                  <strong>Studio Location:</strong><br />
                  <span>Rajahmundry, Andhra Pradesh, India</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: var(--gold);">${icon("phone", 20)}</span>
                <div>
                  <strong>Phone / WhatsApp:</strong><br />
                  <a href="tel:+918309897055" style="color: inherit; text-decoration: none;">+91 83098 97055</a>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="color: var(--gold);">${icon("mail", 20)}</span>
                <div>
                  <strong>Primary Email:</strong><br />
                  <a href="mailto:godavaridesigner@gmail.com" style="color: inherit; text-decoration: none;">godavaridesigner@gmail.com</a>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: center; margin-top: 24px;">
              <a href="https://wa.me/918309897055" target="_blank" rel="noopener noreferrer" class="button button-primary" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 12px 28px; border-radius: 4px;">
                <span>Discuss Your Project on WhatsApp</span>
                ${icon("arrow-right", 16)}
              </a>
            </div>
          </div>
        </section>
      </div>
    </article>
  `;
}

// --------------------------------------------------
// 2. OUR PROCESS SCREEN
// --------------------------------------------------
export function renderOurProcess() {
  const steps = [
    { title: "Vectorization", desc: "Hand-drawn illustrations and raw artwork are imported and cleaned into pixel-perfect vector guidelines.", icon: "pen-tool" },
    { title: "Path Optimization", desc: "Our digitizers define travel paths manually to ensure minimal jump stitches and zero unnecessary trims.", icon: "git-commit" },
    { title: "Density Calibration", desc: "Density is adjusted based on recommended fabrics (silk, net, organza) to prevent puckering or heavy spots.", icon: "sliders" },
    { title: "Stitch-out Simulation", desc: "We run virtual stitch-outs to verify directionality, underlay coverage, and color layering sequence.", icon: "activity" },
    { title: "Production Ready Export", desc: "Designs are exported into Tajima (DST), Brother (PES), Janome (JEF) formats, fully production-tested.", icon: "check-square" }
  ];

  return `
    <article class="content-section" style="padding: 120px 24px; background: var(--ivory); min-height: 90vh; font-family: var(--font-sans);">
      <div style="max-width: 900px; margin: 0 auto; display: grid; gap: 48px;">
        <header style="text-align: center; display: grid; gap: 12px;">
          <span style="font-size: 12px; color: var(--gold); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">How It Works</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(32px, 5vw, 48px); color: var(--navy); font-weight: 700; margin: 0;">Our Digitizing Process</h1>
          <div style="width: 60px; height: 1.5px; background: var(--gold); margin: 16px auto 0;"></div>
        </header>

        <section style="display: grid; gap: 24px; position: relative;">
          <div style="position: absolute; left: 35px; top: 20px; bottom: 20px; width: 1px; background: var(--border); z-index: 1;"></div>
          ${steps.map((step, idx) => `
            <div style="display: flex; gap: 24px; align-items: start; position: relative; z-index: 2;">
              <div style="width: 72px; height: 72px; border-radius: 50%; background: #ffffff; border: 1.5px solid var(--gold); display: flex; align-items: center; justify-content: center; color: var(--navy); flex-shrink: 0; box-shadow: var(--shadow-deep);">
                ${icon(step.icon, 24)}
              </div>
              <div style="background: #ffffff; padding: 24px; border: 1px solid var(--border); border-radius: 8px; flex: 1; box-shadow: var(--shadow-deep); display: grid; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-family: var(--font-serif); font-size: 14px; color: var(--gold); font-weight: 700;">Phase 0${idx + 1}</span>
                  <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">${escapeHtml(step.title)}</h3>
                </div>
                <p style="margin: 0; color: var(--ink-soft); font-size: 14px; line-height: 1.6;">${escapeHtml(step.desc)}</p>
              </div>
            </div>
          `).join("")}
        </section>
      </div>
    </article>
  `;
}

// --------------------------------------------------
// 3. WHY GODAVARI SCREEN
// --------------------------------------------------
export function renderWhyGodavari() {
  const points = [
    { title: "Zero Fabric Puckering", desc: "Our manual stitch-angle placement adapts to fabric stretch profiles, ensuring smooth embroideries.", icon: "sparkles" },
    { title: "90% Fewer Thread Breaks", desc: "Engineered underlays and satin path calibrations minimize needle stress and friction breaks.", icon: "shield" },
    { title: "Tested on Tajima Machines", desc: "Every catalog file is physically stitched and cataloged before upload. We don't sell unverified vectors.", icon: "cpu" },
    { title: "Elite Turnaround", desc: "Custom requests receive tailored designer quotes within 12 hours and digitized files within 48 hours.", icon: "clock" }
  ];

  return `
    <article class="content-section" style="padding: 120px 24px; background: var(--ivory); min-height: 90vh; font-family: var(--font-sans);">
      <div style="max-width: 900px; margin: 0 auto; display: grid; gap: 48px;">
        <header style="text-align: center; display: grid; gap: 12px;">
          <span style="font-size: 12px; color: var(--gold); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">The Godavari Advantage</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(32px, 5vw, 48px); color: var(--navy); font-weight: 700; margin: 0;">Why Choose Godavari</h1>
          <div style="width: 60px; height: 1.5px; background: var(--gold); margin: 16px auto 0;"></div>
        </header>

        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
          ${points.map(pt => `
            <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: 32px; box-shadow: var(--shadow-deep); display: grid; gap: 16px; align-content: start;">
              <div style="width: 48px; height: 48px; border-radius: 6px; background: var(--surface); color: var(--gold); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(200, 161, 90, 0.18);">
                ${icon(pt.icon, 20)}
              </div>
              <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">${escapeHtml(pt.title)}</h3>
              <p style="margin: 0; color: var(--ink-soft); font-size: 14px; line-height: 1.6;">${escapeHtml(pt.desc)}</p>
            </div>
          `).join("")}
        </section>
      </div>
    </article>
  `;
}

// --------------------------------------------------
// 4. REVIEWS SCREEN
// --------------------------------------------------
export function renderReviews() {
  loadReviews();

  let reviewCardsHtml = "";
  if (loadingReviews) {
    reviewCardsHtml = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 24px;">
        <div class="luxury-spinner" style="width: 40px; height: 40px; border: 2px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
        <p style="color: var(--ink-soft); font-size: 14px; margin: 0;">Loading reviews wall...</p>
      </div>
    `;
  } else if (reviewsList.length === 0) {
    reviewCardsHtml = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 0; color: var(--ink-soft);">
        No reviews available at the moment.
      </div>
    `;
  } else {
    reviewCardsHtml = reviewsList.map(rev => {
      const stars = Array(Math.round(rev.rating || 5)).fill(icon("star", 14)).join(" ");
      return `
        <article style="background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: 32px; box-shadow: var(--shadow-deep); display: grid; gap: 16px; align-content: start;">
          <div style="display: flex; gap: 4px; color: var(--gold);">
            ${stars}
          </div>
          <blockquote style="margin: 0; font-family: var(--font-serif); font-size: 15px; color: var(--navy); line-height: 1.6; font-style: italic;">
            "${escapeHtml(rev.quote)}"
          </blockquote>
          <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px; border-top: 1px dashed var(--border); padding-top: 16px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: var(--surface); color: var(--gold); display: flex; align-items: center; justify-content: center; font-weight: 700; border: 1px solid var(--border); font-size: 14px;">
              ${rev.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span style="font-family: var(--font-serif); font-size: 14px; font-weight: 600; color: var(--navy); display: block;">${escapeHtml(rev.name)}</span>
              <span style="color: var(--ink-soft); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(rev.role)}</span>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  return `
    <article class="content-section" style="padding: 120px 24px; background: var(--ivory); min-height: 90vh; font-family: var(--font-sans);">
      <div style="max-width: 1000px; margin: 0 auto; display: grid; gap: 48px;">
        <header style="text-align: center; display: grid; gap: 12px;">
          <span style="font-size: 12px; color: var(--gold); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Testimonials</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(32px, 5vw, 48px); color: var(--navy); font-weight: 700; margin: 0;">What Designers Say</h1>
          <div style="width: 60px; height: 1.5px; background: var(--gold); margin: 16px auto 0;"></div>
        </header>

        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
          ${reviewCardsHtml}
        </section>
      </div>
    </article>
  `;
}

// --------------------------------------------------
// 5. CAREERS SCREEN
// --------------------------------------------------
export function renderCareers() {
  const jobs = [
    { title: "Senior Embroidery Digitizer", dept: "Creative Atelier", type: "Full-Time / Remote", desc: "Expertise in Tajima/PES format optimization, manual density calibration, and complex path layout mapping." },
    { title: "Couture Design Illustrator", dept: "Artistic Direction", type: "Full-Time / Hybrid", desc: "Creating luxury wedding vector motifs, border patterns, and bridal lehenga layout illustrations." },
    { title: "Production QA Associate", dept: "Quality Control", type: "Full-Time / On-Site", desc: "Overseeing physical machine stitch-outs, density testing, fabric testing, and compliance." }
  ];

  return `
    <article class="content-section" style="padding: 120px 24px; background: var(--ivory); min-height: 90vh; font-family: var(--font-sans);">
      <div style="max-width: 900px; margin: 0 auto; display: grid; gap: 48px;">
        <header style="text-align: center; display: grid; gap: 12px;">
          <span style="font-size: 12px; color: var(--gold); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Join The Atelier</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(32px, 5vw, 48px); color: var(--navy); font-weight: 700; margin: 0;">Careers at Godavari</h1>
          <div style="width: 60px; height: 1.5px; background: var(--gold); margin: 16px auto 0;"></div>
        </header>

        <section style="display: grid; gap: 32px; line-height: 1.8; color: var(--navy); font-size: 15px;">
          <p style="text-align: center; max-width: 680px; margin: 0 auto; color: var(--ink-soft);">
            Help us bridge the gap between classical craftsmanship and modern digital manufacturing. We provide a luxury environment, remote-first flexibility, and professional advancement opportunities.
          </p>

          <div style="display: grid; gap: 20px; margin-top: 24px;">
            ${jobs.map(job => `
              <div style="background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: 32px; box-shadow: var(--shadow-deep); display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 24px;">
                <div style="display: grid; gap: 8px; flex: 1; min-width: 260px;">
                  <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                    <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">${escapeHtml(job.title)}</h3>
                    <span style="background: var(--surface); color: var(--gold); border: 1px solid rgba(200, 161, 90, 0.18); padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${escapeHtml(job.dept)}</span>
                  </div>
                  <span style="color: var(--ink-soft); font-size: 12px; font-weight: 600;">${escapeHtml(job.type)}</span>
                  <p style="margin: 8px 0 0 0; color: var(--ink-soft); font-size: 14px; line-height: 1.6;">${escapeHtml(job.desc)}</p>
                </div>
                <button type="button" onclick="showToast('Application portal is currently offline. Please email your CV to ${escapeHtml(site.brand?.contact?.email || 'careers@godavaridesigner.com')}')" class="button button-secondary" style="min-height: 40px; padding: 0 20px; font-size: 12px; font-weight: 700; border-radius: 4px; cursor: pointer; text-decoration: none;">
                  Apply Position
                </button>
              </div>
            `).join("")}
          </div>
        </section>
      </div>
    </article>
  `;
}
