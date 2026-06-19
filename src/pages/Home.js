import { site, wishlist } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl } from "../utils/helpers.js";
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
          <p class="section-kicker">${escapeHtml(site.hero.eyebrow)}</p>
          <h1>${escapeHtml(site.hero.heading).replace(" ", "<br />")}</h1>
          <p class="hero-subtitle">${escapeHtml(site.hero.subheading)}</p>
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
      ${renderSectionHeading("Featured Collections", "Luxury Machine-Ready Worlds", "View All", "#/catalog")}
      <div class="carousel-shell">
        <button type="button" class="round-control left" data-action="scroll-carousel" data-target="collectionTrack" data-direction="-1" aria-label="Previous collections">
          ${icon("arrow-left", 18)}
        </button>
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
                    <a href="#/catalog?collection=${collection.id}" class="gold-circle" aria-label="Open ${attr(collection.title)}">
                      ${icon("arrow-right", 18)}
                    </a>
                  </div>
                </article>
              `
            )
            .join("")}
        </div>
        <button type="button" class="round-control right" data-action="scroll-carousel" data-target="collectionTrack" data-direction="1" aria-label="Next collections">
          ${icon("arrow-right", 18)}
        </button>
      </div>
    </section>
  `;
}

function renderProcess() {
  return `
    <section class="content-section process-section" id="process">
      ${renderSectionHeading("How It Works", "From Sketch To Stitch File", "", "")}
      <div class="timeline reveal">
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
        <h2>${escapeHtml(site.cta.headline)}</h2>
        <p>${escapeHtml(site.cta.text)}</p>
        <div class="hero-actions">
          <a href="#/custom-order" class="button button-primary" style="text-decoration:none; display:inline-flex; align-items:center;">
            <span>${escapeHtml(site.cta.primaryButton)}</span>
            ${icon("arrow-right", 20)}
          </a>
          <a href="#/catalog" class="button button-secondary">
            <span>${escapeHtml(site.cta.secondaryButton)}</span>
            ${icon("sparkles", 18)}
          </a>
        </div>
      </div>
    </section>
  `;
}

export function renderHome() {
  return `
    ${renderHero()}
    ${renderCollections()}
    ${renderProcess()}
    ${renderBestSellers()}
    ${renderStories()}
    ${renderCta()}
  `;
}
