import { site, wishlist } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl, isMobileViewport } from "../utils/helpers.js";
import { renderThreads } from "../components/ThreadLayer.js";


function renderSectionHeading(kicker, title, actionLabel, targetHref) {
  return `
    <div class="section-heading reveal">
      <div>
        <p class="section-kicker">${escapeHtml(kicker)}</p>
        <h2>${escapeHtml(title)}</h2>
      </div>
      ${
        actionLabel
          ? `<a href="${attr(targetHref)}" class="text-action" style="text-decoration:none;">
              ${escapeHtml(actionLabel)}
              ${icon("arrow-right", 18)}
            </a>`
          : ""
      }
    </div>
  `;
}

function renderHero() {
  // Video source strategy: CMS video -> Local development fallback
  let videoSrc = "";
  if (site.hero.videoUrl) {
    const resolvedUrl = mediaUrl(site.hero.videoUrl);
    if (resolvedUrl && !resolvedUrl.includes("mixkit.co")) {
      videoSrc = resolvedUrl;
    }
  }
  if (!videoSrc) {
    videoSrc = "./Embroidery_machine_stitching_flo_202606191150.mp4";
  }

  const posterSrc = mediaUrl(site.hero.posterImage);

  return `
    <section class="hero" id="home">
      <div class="hero-media" aria-hidden="true">
        <img class="hero-poster" src="${attr(posterSrc)}" alt="" />
        ${
          videoSrc
            ? `<video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="${attr(posterSrc)}">
                <source src="${attr(videoSrc)}" type="video/mp4" />
              </video>`
            : ""
        }
        <div class="hero-video-overlay"></div>
      </div>
      <div class="hero-veil" aria-hidden="true"></div>
      ${renderThreads()}
      <div class="hero-inner">
        <div class="hero-copy reveal">
          <p class="section-kicker">Premium Digitizing Atelier</p>
          <h1 style="font-size: clamp(32px, 6vw, 56px); line-height: 1.15; font-weight: 700; margin: 0 0 20px;">Godavari Designers — Custom Embroidery Digitizing in Rajahmundry</h1>
          <p class="hero-subtitle" style="font-size: 15.5px; line-height: 1.7; color: rgba(255, 255, 255, 0.88); max-width: 680px; margin: 0 0 32px;">Godavari Designers provides custom embroidery digitizing services in Rajahmundry for bridal blouse designs, saree borders, logo embroidery, and machine-ready embroidery files for boutiques and fashion businesses.</p>
          <div class="hero-actions">
            <a href="#/catalog" class="button button-primary">
              <span>${escapeHtml(site.hero.primaryButton)}</span>
              ${icon("arrow-right", 20)}
            </a>
            <a href="#/custom-order" class="button button-secondary" style="text-decoration:none; display:inline-flex; align-items:center;">
              <span>${escapeHtml(site.hero.secondaryButton)}</span>
              ${icon("sparkles", 18)}
            </a>
          </div>
          <div class="hero-meta">
            <div class="avatar-stack" aria-hidden="true">
              ${site.stories.clients
                .slice(0, 4)
                .map((client) => `<img src="${attr(mediaUrl(client.image))}" alt="" />`)
                .join("")}
            </div>
            <span>${escapeHtml(site.brand.trustText)}</span>
            <button type="button" class="story-link" data-action="open-story">
              <span class="play-dot">${icon("play", 14)}</span>
              ${escapeHtml(site.brand.storyLabel)}
            </button>
          </div>
        </div>
      </div>
      <button type="button" class="scroll-cue" data-action="scroll-to" data-target="collections" aria-label="Scroll to collections">
        ${icon("chevron-down", 22)}
        <span>Scroll to explore</span>
      </button>
    </section>
  `;
}

function renderCollections() {
  return `
    <section class="content-section collections-section" id="collections">
      <div class="section-heading reveal">
        <div>
          <p class="section-kicker">Featured Collections</p>
          <h2>Luxury Machine-Ready Worlds</h2>
        </div>
        <div class="heading-actions-wrap">
          <a href="#/catalog" class="text-action" style="text-decoration:none;">
            View All Collections
            ${icon("arrow-right", 18)}
          </a>
          <div class="carousel-controls-desktop">
            <button type="button" class="round-control static-control" data-action="scroll-carousel" data-target="collectionTrack" data-direction="-1" aria-label="Previous collections">
              ${icon("arrow-left", 18)}
            </button>
            <button type="button" class="round-control static-control" data-action="scroll-carousel" data-target="collectionTrack" data-direction="1" aria-label="Next collections">
              ${icon("arrow-right", 18)}
            </button>
          </div>
        </div>
      </div>
      <div class="carousel-shell">
        <div class="collection-track" id="collectionTrack">
          ${site.collections
            .map(
              (collection, index) => `
                <article class="collection-card reveal" style="--delay:${index * 80}ms">
                  <img src="${attr(mediaUrl(collection.image))}" alt="${attr(collection.title)}" loading="lazy" />
                  <div class="collection-overlay">
                    <p>${escapeHtml(collection.description)}</p>
                  </div>
                  <div class="collection-content">
                    <h3>${escapeHtml(collection.title)}</h3>
                    <a href="#/catalog?collection=${collection.slug || collection.id}" class="gold-circle" aria-label="Browse ${attr(collection.title)} embroidery collection">
                      ${icon("arrow-right", 18)}
                    </a>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderProcess() {
  const isMobile = isMobileViewport();


  if (isMobile) {
    return `
      <section class="content-section process-section" id="process">
        ${renderSectionHeading("How It Works", "From Sketch To Stitch File", "", "")}
        <div class="timeline-vertical-refined">
          <div class="timeline-vertical-thread"></div>
          ${site.steps
            .map(
              (step, index) => `
                <article class="timeline-vertical-step reveal" style="--step:${index}; --delay:${index * 60}ms">
                  <div class="timeline-vertical-hoop">
                    <div class="timeline-vertical-hoop-inner">
                      ${icon(step.icon, 18)}
                    </div>
                  </div>
                  <div class="timeline-vertical-content">
                    <h3>
                      <span class="timeline-vertical-num">${index + 1}</span>
                      ${escapeHtml(step.title)}
                    </h3>
                    <p>${escapeHtml(step.body)}</p>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  return `
    <section class="content-section process-section" id="process">
      ${renderSectionHeading("How It Works", "From Sketch To Stitch File", "", "")}
      <div class="carousel-shell">
        <button type="button" class="round-control left timeline-scroll-btn" data-action="scroll-carousel" data-target="timelineTrack" data-direction="-1" aria-label="Previous step">
          ${icon("arrow-left", 18)}
        </button>
        <div class="timeline reveal" id="timelineTrack">
          <div class="timeline-thread" aria-hidden="true"></div>
          ${site.steps
            .map(
              (step, index) => `
                <article class="timeline-step" style="--step:${index}">
                  <div class="step-number">${index + 1}</div>
                  <div class="step-icon">${icon(step.icon, 30)}</div>
                  <h3>${escapeHtml(step.title)}</h3>
                  <p>${escapeHtml(step.body)}</p>
                </article>
              `
            )
            .join("")}
        </div>
        <button type="button" class="round-control right timeline-scroll-btn" data-action="scroll-carousel" data-target="timelineTrack" data-direction="1" aria-label="Next step">
          ${icon("arrow-right", 18)}
        </button>
      </div>
    </section>
  `;
}

function renderBestSellers() {
  return `
    <section class="content-section best-sellers-section" id="best-sellers">
      ${renderSectionHeading("Best Sellers", "Premium Embroidery Showcase", "View All Designs", "#/catalog")}
      <div class="product-grid">
        ${site.products
          .map(
            (product, index) => `
              <article class="product-card reveal" style="--delay:${index * 70}ms">
                <div class="product-media">
                  <a href="#/product/${product.slug}">
                    <img src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" loading="lazy" />
                  </a>
                  <span class="product-label">${escapeHtml(product.label)}</span>
                  <button type="button" class="heart-button ${wishlist.has(product.id) ? "active" : ""}" data-action="toggle-wishlist" data-id="${attr(product.id)}" aria-label="Save ${attr(product.title)}">
                    ${icon("heart", 18)}
                  </button>
                </div>
                <div class="product-info">
                  <div>
                    <a href="#/product/${product.slug}" style="text-decoration:none; color:inherit;">
                      <h3>${escapeHtml(product.title)}</h3>
                    </a>
                    <p style="font-size:12px; color:var(--ink-soft); margin-top:2px;">${product.totalStitchCount.toLocaleString()} stitches &bull; ${escapeHtml(product.dimensions)}</p>
                    <p style="font-weight:700; margin-top:4px;">${money(product.price)}</p>
                  </div>
                  <button type="button" class="bag-mini" data-action="add-cart" data-id="${attr(product.id)}" aria-label="Add ${attr(product.title)} to cart">
                    ${icon("shopping-bag", 18)}
                  </button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderStories() {
  const mainClientImage = site.stories.clients[1]?.image ? mediaUrl(site.stories.clients[1].image) : mediaUrl(site.hero.posterImage);
  return `
    <section class="content-section stories-section" id="stories">
      ${renderSectionHeading("Customer Stories", "Fashion Houses, Boutique Owners, Designer Labels", "", "")}
      <div class="stories-layout">
        <article class="testimonial reveal">
          <span class="quote-mark">"</span>
          <p>${escapeHtml(site.stories.quote)}</p>
          <div class="rating">${icon("star", 16)} ${icon("star", 16)} ${icon("star", 16)} ${icon("star", 16)} ${icon("star", 16)} <span>${escapeHtml(site.stories.rating)}</span></div>
          <div class="testimonial-person">
            <img src="${attr(mainClientImage)}" alt="${attr(site.stories.person)}" />
            <div>
              <strong>${escapeHtml(site.stories.person)}</strong>
              <span>${escapeHtml(site.stories.role)}</span>
            </div>
          </div>
        </article>
        <div class="client-showcase reveal">
          <div class="logo-row">
            ${site.stories.clients
              .map(
                (client) => `
                  <button type="button" data-action="open-story">
                    <span>${escapeHtml(client.type)}</span>
                    <strong>${escapeHtml(client.name)}</strong>
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="story-gallery">
            ${site.stories.clients
              .slice(0, 3)
              .map(
                (client) => `
                  <article>
                    <img src="${attr(mediaUrl(client.image))}" alt="${attr(client.name)}" loading="lazy" />
                    <div>
                      <strong>${escapeHtml(client.name)}</strong>
                      <span>${escapeHtml(client.quote)}</span>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderCta() {
  return `
    <section class="premium-cta" id="cta">
      <img src="${attr(mediaUrl(site.cta.image))}" alt="" loading="lazy" />
      <div class="premium-cta-copy reveal">
        <p class="section-kicker">Custom Digitizing Studio</p>
        <h2 class="cta-headline">Bring Your Design To Life</h2>
        <p class="cta-subtext">Upload blouse photos, saree references, sketches, logos, or inspiration.</p>
        <div class="hero-actions cta-actions">
          <a href="#/custom-order" class="button button-secondary upload-promo-btn">
            <span>Upload Reference Photos</span>
            ${icon("upload-cloud", 20)}
          </a>
        </div>
      </div>
    </section>
  `;
}

function renderServicesSection() {
  return `
    <section class="content-section services-grid-section" style="padding: 80px 24px 20px; background: var(--ivory);">
      <div class="section-heading reveal" style="text-align: center; max-width: 800px; margin: 0 auto 40px; display: grid; gap: 8px;">
        <p class="section-kicker" style="color: var(--gold); text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; margin: 0;">What We Do</p>
        <h2 style="font-family: var(--font-serif); font-size: clamp(24px, 4vw, 32px); font-weight: 700; color: var(--navy); margin: 0;">Specialized Embroidery Services</h2>
        <div style="width: 50px; height: 1.5px; background: var(--gold); margin: 12px auto 0;"></div>
      </div>
      <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px;">
        <!-- Card 1 -->
        <article style="background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: 28px 24px; display: grid; gap: 14px; box-shadow: var(--shadow-deep); transition: transform 200ms ease;">
          <div style="color: var(--gold);">${icon("upload-cloud", 28)}</div>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 700; margin: 0; color: var(--navy);">Custom Embroidery Digitizing</h3>
          <p style="font-size: 13.5px; color: var(--ink-soft); line-height: 1.6; margin: 0;">Convert logos, hand sketches, and vectors into flawless, machine-ready stitch files.</p>
          <a href="#/services/custom-embroidery-digitizing" style="font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; display: flex; align-items: center; gap: 6px;">
            <span>Learn More</span>
            ${icon("arrow-right", 14)}
          </a>
        </article>
        <!-- Card 2 -->
        <article style="background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: 28px 24px; display: grid; gap: 14px; box-shadow: var(--shadow-deep); transition: transform 200ms ease;">
          <div style="color: var(--gold);">${icon("heart", 28)}</div>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 700; margin: 0; color: var(--navy);">Bridal Blouse Designs</h3>
          <p style="font-size: 13.5px; color: var(--ink-soft); line-height: 1.6; margin: 0;">Intricate zari embroidery placements, custom necklines, and sleeve borders for bridal wear.</p>
          <a href="#/services/bridal-blouse-embroidery-designs" style="font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; display: flex; align-items: center; gap: 6px;">
            <span>Learn More</span>
            ${icon("arrow-right", 14)}
          </a>
        </article>
        <!-- Card 3 -->
        <article style="background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: 28px 24px; display: grid; gap: 14px; box-shadow: var(--shadow-deep); transition: transform 200ms ease;">
          <div style="color: var(--gold);">${icon("repeat", 28)}</div>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 700; margin: 0; color: var(--navy);">Saree Border Digitizing</h3>
          <p style="font-size: 13.5px; color: var(--ink-soft); line-height: 1.6; margin: 0;">Seamless repeating border files and lace trims engineered for continuous multi-hoop runs.</p>
          <a href="#/services/saree-border-embroidery-designs" style="font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; display: flex; align-items: center; gap: 6px;">
            <span>Learn More</span>
            ${icon("arrow-right", 14)}
          </a>
        </article>
        <!-- Card 4 -->
        <article style="background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: 28px 24px; display: grid; gap: 14px; box-shadow: var(--shadow-deep); transition: transform 200ms ease;">
          <div style="color: var(--gold);">${icon("award", 28)}</div>
          <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 700; margin: 0; color: var(--navy);">Logo & Branding</h3>
          <p style="font-size: 13.5px; color: var(--ink-soft); line-height: 1.6; margin: 0;">Precision lettering and stable underlays optimized for left-chest shirts, caps, and workwear.</p>
          <a href="#/services/logo-embroidery-digitizing" style="font-size: 13px; font-weight: 700; color: var(--gold); text-decoration: none; display: flex; align-items: center; gap: 6px;">
            <span>Learn More</span>
            ${icon("arrow-right", 14)}
          </a>
        </article>
      </div>
    </section>
  `;
}

function renderAboutSection() {
  return `
    <section class="content-section about-trust-section" id="about-brand" style="background: var(--ivory); padding: 80px 24px; border-top: 1px solid var(--border);">
      <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; align-items: center;">
        <div class="reveal">
          <p class="section-kicker" style="color: var(--gold); text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; margin: 0 0 8px;">About The Studio</p>
          <h2 style="font-family: var(--font-serif); font-size: clamp(28px, 4vw, 36px); font-weight: 700; color: var(--navy); margin: 0 0 20px; line-height: 1.2;">Godavari Designers</h2>
          <p style="font-size: 14.5px; color: var(--ink-soft); line-height: 1.7; margin: 0 0 16px;">
            Based in the historic city of <strong>Rajahmundry, Andhra Pradesh</strong>, Godavari Designers is a premier custom embroidery digitizing studio and digital design library. We bridge classical textile craftsmanship with advanced digital embroidery technology.
          </p>
          <p style="font-size: 14.5px; color: var(--ink-soft); line-height: 1.7; margin: 0;">
            We specialize in engineering flawless, machine-ready files for boutiques, fashion designers, and apparel brands. From complex bridal blouse zari work to continuous saree border repeats and precision corporate logos, our digitizing is built to minimize thread breaks and maximize fabric stability.
          </p>
        </div>
        <div class="reveal" style="display: grid; gap: 24px; background: #ffffff; border: 1px solid var(--border); border-radius: 8px; padding: 36px; box-shadow: var(--shadow-deep);">
          <h3 style="font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--navy); margin: 0; border-bottom: 1.5px solid var(--gold); padding-bottom: 12px;">Why Choose Us</h3>
          
          <div style="display: grid; gap: 6px;">
            <strong style="font-size: 14px; color: var(--navy); display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--gold);">${icon("award", 16)}</span> Custom Digitizing Specialization
            </strong>
            <p style="font-size: 13px; color: var(--ink-soft); margin: 0 0 0 24px; line-height: 1.5;">
              Every stitch angle, density, and underlay path is calibrated manually to preserve the premium feel of hand-embroidery.
            </p>
          </div>

          <div style="display: grid; gap: 6px;">
            <strong style="font-size: 14px; color: var(--navy); display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--gold);">${icon("heart", 16)}</span> Bridal & Boutique Focus
            </strong>
            <p style="font-size: 13px; color: var(--ink-soft); margin: 0 0 0 24px; line-height: 1.5;">
              Tailored necklines, heavy sleeve designs, and continuous borders optimized for silk, organza, and velvet fabrics.
            </p>
          </div>

          <div style="display: grid; gap: 6px;">
            <strong style="font-size: 14px; color: var(--navy); display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--gold);">${icon("package-check", 16)}</span> Machine-Ready Deliverables
            </strong>
            <p style="font-size: 13px; color: var(--ink-soft); margin: 0 0 0 24px; line-height: 1.5;">
              Get DST, PES, EXP, JEF, or XXX files. Physically test-stitched to ensure flawless production on your machines.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderHome() {
  return `
    ${renderHero()}
    ${renderServicesSection()}
    ${renderCollections()}
    ${renderProcess()}
    ${renderBestSellers()}
    ${renderAboutSection()}
    ${renderStories()}
    ${renderCta()}
  `;
}
