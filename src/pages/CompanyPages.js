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
          <span style="font-size: 12px; color: var(--gold); text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Our Story</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(32px, 5vw, 48px); color: var(--navy); font-weight: 700; margin: 0;">Heritage & Craftsmanship</h1>
          <div style="width: 60px; height: 1.5px; background: var(--gold); margin: 16px auto 0;"></div>
        </header>

        <section style="display: grid; gap: 32px; line-height: 1.8; color: var(--navy); font-size: 15px;">
          <p style="font-size: 18px; font-family: var(--font-serif); color: var(--gold); line-height: 1.6; text-align: center; max-width: 720px; margin: 0 auto;">
            Godavari Designer represents the intersection of classical Indian artisanal embroidery and state-of-the-art digital engineering.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; margin-top: 16px;">
            <div style="display: grid; gap: 12px; background: #ffffff; padding: 32px; border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-deep);">
              <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">The Atelier Philosophy</h3>
              <p style="margin: 0; color: var(--ink-soft); font-size: 14px;">We treat machine embroidery not merely as a production process, but as an art form. Every stitch direction, tie-off, and density profile is meticulously hand-placed by master digitizers to achieve the look and feel of manual handiwork.</p>
            </div>
            <div style="display: grid; gap: 12px; background: #ffffff; padding: 32px; border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow-deep);">
              <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 600; margin: 0; color: var(--navy);">Precision Engineering</h3>
              <p style="margin: 0; color: var(--ink-soft); font-size: 14px;">By optimizing path routing and minimizing trim sequences, our designs run smoothly on industrial machines, preventing thread breaks and fabric puckering while reducing wear and tear on your equipment.</p>
            </div>
          </div>
          <p style="text-align: center; max-width: 680px; margin: 20px auto 0; color: var(--ink-soft);">
            Founded on the banks of the sacred Godavari region, our team preserves heirloom textile traditions by rendering them compatible with Tajima, Brother, Bernina, Janome, and Singer formats for designers worldwide.
          </p>
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
                <button type="button" onclick="showToast('Application portal is currently offline. Please email your CV to careers@godavaridesigner.com')" class="button button-secondary" style="min-height: 40px; padding: 0 20px; font-size: 12px; font-weight: 700; border-radius: 4px; cursor: pointer; text-decoration: none;">
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
