import { site, wishlist, isProductUnlocked, downloadMachineFile } from "../services/store.js";
import { escapeHtml, attr, icon, money, mediaUrl, isMobileViewport } from "../utils/helpers.js";
import { renderThreads } from "../components/ThreadLayer.js";


function renderSectionHeading(kicker, title, actionLabel, targetHref) {
  return `
    <div class="section-heading reveal is-visible">
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
        <div class="hero-content reveal" style="text-align: center; display: flex; flex-direction: column; align-items: center;">
          
          <!-- Brand Logo Emblem -->
          <div style="margin-bottom: 20px;">
            <img src="/logo.jpeg" alt="Godavari Designers Emblem" style="width: 76px; height: 76px; border-radius: 50%; object-fit: cover; border: 2.5px solid var(--gold); box-shadow: 0 8px 30px rgba(0,0,0,0.35);" />
          </div>

          <!-- Atelier Eyebrow -->
          <p class="section-kicker" style="margin: 0 0 8px; color: var(--gold); font-size: 12px; letter-spacing: 0.2em; font-weight: 700; text-transform: uppercase;">
            Premier Digitizing Atelier & Digital Marketplace
          </p>

          <!-- Clean Brand Name -->
          <h1 style="font-family: var(--font-serif); font-size: clamp(38px, 6vw, 68px); font-weight: 700; line-height: 1.1; margin: 0 0 16px; color: #ffffff; letter-spacing: -0.01em; text-shadow: 0 4px 24px rgba(0,0,0,0.4);">
            Godavari Designers
          </h1>

          <!-- Concise Description -->
          <p style="font-size: clamp(15px, 2vw, 19px); line-height: 1.6; color: rgba(255, 255, 255, 0.92); max-width: 680px; margin: 0 auto; text-shadow: 0 2px 12px rgba(0,0,0,0.35); font-weight: 500;">
            Download machine-ready embroidery files (.DST, .PES, .JEF, .EXP) and custom digitizing crafted for flawless commercial production.
          </p>

        </div>
      </div>
      <button type="button" class="scroll-cue" data-action="scroll-to" data-target="new-arrivals" aria-label="Scroll to new arrivals">
        ${icon("chevron-down", 22)}
        <span>Scroll to explore</span>
      </button>
    </section>
  `;
}

function renderNewArrivals() {
  const newProducts = (site.products || []).slice(0, 4);

  return `
    <section class="content-section new-arrivals-section" id="new-arrivals" style="padding-top: 50px;">
      ${renderSectionHeading("Fresh From Atelier", "New Arrivals", "Explore All Designs", "#/catalog")}
      <div class="product-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px;">
        ${newProducts
          .map(
            (product, index) => {
              const isSaved = wishlist.has(product.id);
              const defaultFormat = (product.formats && product.formats[0]) ? product.formats[0].format : "DST";
              const isUnlocked = isProductUnlocked(product.id);
              return `
                <article class="product-card reveal is-visible" style="--delay:${index * 70}ms; border-radius: 10px; border: 1px solid var(--border); background: #fff; overflow: hidden; box-shadow: var(--shadow); transition: transform 0.3s ease, box-shadow 0.3s ease;">
                  <div class="product-media" style="position: relative; aspect-ratio: 1 / 1; background: #faf8f5; overflow: hidden;">
                    <a href="#/product/${product.slug}" style="display: block; width: 100%; height: 100%; -webkit-touch-callout: none;">
                      <img src="${attr(mediaUrl(product.image))}" alt="${attr(product.title)}" loading="lazy" class="image-shield" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none; -webkit-user-select: none; user-select: none;" oncontextmenu="return false;" />
                    </a>
                    
                    <!-- Entitlement / New Arrival Badge -->
                    ${isUnlocked ? `
                      <span style="position: absolute; bottom: 10px; left: 10px; z-index: 2; display: inline-flex; align-items: center; gap: 5px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); border: 1px solid #b7eb8f; border-radius: 99px; padding: 4px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #389e0d;">
                        <span style="color: #52c41a;">✓</span>
                        Unlocked
                      </span>
                    ` : `
                      <span style="position: absolute; bottom: 10px; left: 10px; z-index: 2; display: inline-flex; align-items: center; gap: 5px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); border: 1px solid rgba(200, 161, 90, 0.4); border-radius: 99px; padding: 4px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--navy);">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--gold);"></span>
                        New
                      </span>
                    `}

                    <!-- Wishlist toggle -->
                    <button type="button" class="heart-button ${isSaved ? "active" : ""}" data-action="toggle-wishlist" data-id="${attr(product.id)}" aria-label="Save ${attr(product.title)}" style="position: absolute; top: 10px; right: 10px; z-index: 2; width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(230, 222, 209, 0.7); background: rgba(255, 255, 255, 0.88); display: grid; place-items: center; color: var(--navy); cursor: pointer;">
                      ${icon("heart", 16)}
                    </button>

                    <!-- Watermark Overlay (Anti-theft) -->
                    <div class="watermark-overlay">
                      <img src="/logo.jpeg" class="watermark-logo" alt="logo" />
                      <span class="watermark-text">GD • ${escapeHtml(product.code)}</span>
                    </div>
                  </div>

                  <div class="product-info" style="padding: 14px 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gold); background: rgba(200, 161, 90, 0.1); border: 1px solid rgba(200, 161, 90, 0.25); border-radius: 4px; padding: 2px 6px;">${escapeHtml(product.code)}</span>
                      <strong style="font-size: 16px; font-weight: 800; color: var(--gold);">${money(product.price)}</strong>
                    </div>

                    <a href="#/product/${product.slug}" style="text-decoration: none; color: inherit; display: block; margin-bottom: 8px;">
                      <h3 style="font-family: var(--font-serif); font-size: 16px; font-weight: 700; margin: 0; color: var(--navy); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(product.title)}</h3>
                    </a>

                    <!-- Specs row -->
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--ink-soft); margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed var(--border);">
                      <span>${product.totalStitchCount ? product.totalStitchCount.toLocaleString() : "35,000"} stitches</span>
                      <span>${escapeHtml(product.dimensions || "200x200mm")}</span>
                    </div>

                    <!-- Available Formats badges -->
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;">
                      ${(product.machineFormats || ["DST", "PES", "JEF"]).map(f => `
                        <span style="font-size: 9.5px; font-weight: 700; color: var(--navy); background: #f8f6f2; border: 1px solid rgba(200, 161, 90, 0.25); border-radius: 4px; padding: 1px 5px;">${escapeHtml(f)}</span>
                      `).join("")}
                    </div>

                    <!-- Quick Action Buttons -->
                    <div style="display: flex; gap: 8px;">
                      ${isUnlocked ? `
                        <button type="button" class="button button-primary" data-action="download-machine-file" data-id="${attr(product.id)}" data-format="${attr(defaultFormat)}" style="flex: 1.4; font-size: 11.5px; height: 36px; padding: 0; display: flex; justify-content: center; align-items: center; gap: 6px; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; background: #237804; color: #fff;">
                          ${icon("download", 14)} Download .${escapeHtml(defaultFormat)}
                        </button>
                        <a href="#/product/${product.slug}" class="button button-secondary" style="flex: 0.6; font-size: 11.5px; height: 36px; padding: 0; display: flex; justify-content: center; align-items: center; text-decoration: none; font-weight: 700; border-radius: 6px;">
                          Details
                        </a>
                      ` : `
                        <button type="button" class="button button-secondary" data-action="add-cart" data-id="${attr(product.id)}" data-format="${attr(defaultFormat)}" style="flex: 1; font-size: 11.5px; height: 36px; padding: 0; display: flex; justify-content: center; align-items: center; gap: 5px; font-weight: 700; border-radius: 6px; cursor: pointer;">
                          ${icon("shopping-bag", 14)} Cart
                        </button>
                        <button type="button" class="button button-primary" data-action="buy-now" data-id="${attr(product.id)}" data-format="${attr(defaultFormat)}" data-price="${attr(product.price)}" data-title="${attr(product.title)}" data-code="${attr(product.code)}" style="flex: 1.3; font-size: 11.5px; height: 36px; padding: 0; display: flex; justify-content: center; align-items: center; gap: 5px; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; background: var(--navy); color: #fff;">
                          ${icon("zap", 13)} Buy Now
                        </button>
                      `}
                    </div>
                  </div>
                </article>
              `;
            }
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderWhatsAppCustomBanner() {
  const whatsappPhone = (site.brand?.contact?.phone || "+91 83098 97055").replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent("Hello Godavari Designers, I would like to request a custom machine embroidery design file.")}`;

  return `
    <section class="content-section whatsapp-order-section" id="whatsapp-custom" style="padding: 30px clamp(16px, 4vw, 40px);">
      <div style="background: linear-gradient(135deg, #0d1b2a 0%, #111d42 60%, #1a2d5a 100%); border-radius: 16px; padding: clamp(28px, 5vw, 56px); color: #ffffff; position: relative; overflow: hidden; box-shadow: var(--shadow-deep); border: 1px solid rgba(200, 161, 90, 0.35);">
        
        <!-- Decorative subtle gold watermark glow -->
        <div style="position: absolute; right: -50px; bottom: -50px; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(200, 161, 90, 0.15) 0%, transparent 70%); pointer-events: none;"></div>

        <div style="max-width: 820px; margin: 0 auto; text-align: center; position: relative; z-index: 2;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(37, 211, 102, 0.15); border: 1px solid rgba(37, 211, 102, 0.35); border-radius: 99px; padding: 6px 16px; margin-bottom: 16px;">
            <span style="color: #25D366; display: flex;">${icon("message-circle", 16)}</span>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #25D366;">Instant Custom Digitizing Service</span>
          </div>

          <h2 style="font-family: var(--font-serif); font-size: clamp(26px, 4.5vw, 40px); font-weight: 700; margin: 0 0 14px; line-height: 1.2; color: #ffffff;">
            Request Custom Orders via WhatsApp
          </h2>
          
          <p style="font-size: clamp(14px, 2vw, 16px); line-height: 1.6; color: rgba(255, 255, 255, 0.86); margin: 0 auto 28px; max-width: 660px;">
            Have a custom blouse sketch, bridal photo, or boutique logo? Send it directly on WhatsApp. Mention your required dimensions and receive a machine-ready file (.DST, .PES, .JEF) with express turnaround!
          </p>

          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 14px;">
            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="button" style="background: #25D366; color: #ffffff; font-weight: 700; font-size: 14.5px; padding: 14px 28px; min-height: 48px; border-radius: 99px; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4); border: none; transition: transform 0.2s ease;">
              ${icon("message-circle", 20)}
              <span>Chat on WhatsApp (+91 83098 97055)</span>
            </a>

            <a href="#/custom-order" class="button button-secondary" style="background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.35); color: #ffffff; font-weight: 600; font-size: 14px; padding: 14px 24px; min-height: 48px; border-radius: 99px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
              <span>Submit Form Online</span>
              ${icon("arrow-right", 16)}
            </a>
          </div>

          <!-- Quick badges -->
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; margin-top: 28px; font-size: 12px; color: rgba(255, 255, 255, 0.75);">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <span style="color: var(--gold);">${icon("check", 14)}</span> 24–48h Turnaround
            </span>
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <span style="color: var(--gold);">${icon("check", 14)}</span> All Machine Formats (.DST, .PES, .JEF)
            </span>
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <span style="color: var(--gold);">${icon("check", 14)}</span> 100% Test-Stitched Guarantee
            </span>
          </div>

        </div>
      </div>
    </section>
  `;
}

function renderCollections() {
  const collectionsData = [
    {
      title: "All Collections",
      subtitle: "Browse Full Library",
      description: "Explore 10,000+ digitized embroidery designs across all styles and machine formats.",
      image: "media-collection-floral",
      link: "#/catalog"
    },
    {
      title: "Kids Wear",
      subtitle: "Comfort-Fills & Motifs",
      description: "Gentle, festive embroidery motifs and soft patterns engineered for kids' ethnic outfits.",
      image: "media-collection-kids",
      link: "#/catalog?category=kids-wear"
    },
    {
      title: "Bridal Collection",
      subtitle: "Heirloom Zari Couture",
      description: "Intricate bridal blouse back-necks, royal lehenga motifs, and heavy metallic thread files.",
      image: "media-collection-bridal",
      link: "#/catalog?category=bridal"
    },
    {
      title: "Saree Borders",
      subtitle: "Continuous Multi-Hoop Repeats",
      description: "Seamless repeating border files and lace trims engineered for continuous machine runs.",
      image: "media-collection-saree",
      link: "#/catalog?category=saree-borders"
    }
  ];

  return `
    <section class="content-section collections-section" id="collections">
      <div class="section-heading reveal">
        <div>
          <p class="section-kicker">Curated Categories</p>
          <h2>Featured Collections</h2>
        </div>
        <a href="#/catalog" class="text-action" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
          View All Collections
          ${icon("arrow-right", 18)}
        </a>
      </div>

      <div class="collections-four-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
        ${collectionsData
          .map(
            (collection, index) => `
              <article class="collection-card reveal is-visible" style="--delay:${index * 80}ms; border-radius: 12px; overflow: hidden; position: relative; min-height: 280px; box-shadow: var(--shadow);">
                <img src="${attr(mediaUrl(collection.image))}" alt="${attr(collection.title)}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;" />
                
                <div class="collection-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(17, 29, 66, 0.2) 0%, rgba(17, 29, 66, 0.88) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; color: #fff;">
                  <span style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gold); margin-bottom: 4px;">${escapeHtml(collection.subtitle)}</span>
                  <h3 style="font-family: var(--font-serif); font-size: 22px; font-weight: 700; margin: 0 0 6px; color: #fff;">${escapeHtml(collection.title)}</h3>
                  <p style="font-size: 12px; line-height: 1.4; color: rgba(255, 255, 255, 0.85); margin: 0 0 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(collection.description)}</p>
                  
                  <a href="${attr(collection.link)}" class="button button-secondary" style="align-self: flex-start; background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.4); color: #fff; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 99px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                    <span>Explore</span>
                    ${icon("arrow-right", 14)}
                  </a>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderProcess() {
  const isMobile = isMobileViewport();

  const customOrderSteps = [
    {
      num: 1,
      title: "Share Your Design (WhatsApp)",
      body: "Send your logo, hand sketch, blouse reference, or artwork directly on WhatsApp.",
      icon: "message-circle"
    },
    {
      num: 2,
      title: "Provide Details",
      body: "Mention required dimensions (width & height in inches or mm) and machine format (.DST, .PES, .JEF).",
      icon: "ruler"
    },
    {
      num: 3,
      title: "Get Quote & Approvals",
      body: "We calculate exact stitch counts, provide transparent pricing, and send a stitch simulation preview.",
      icon: "badge-check"
    },
    {
      num: 4,
      title: "Digitizing Process",
      body: "Master digitizers calibrate stitch angles, pull compensation, underlays, and density for zero thread breaks.",
      icon: "cpu"
    },
    {
      num: 5,
      title: "Delivery",
      body: "Receive your test-stitched machine-ready files instantly on WhatsApp and email, ready to stitch!",
      icon: "package-check"
    }
  ];

  if (isMobile) {
    return `
      <section class="content-section process-section" id="process">
        ${renderSectionHeading("How It Works", "How to Request Custom Orders", "", "")}
        <div class="timeline-vertical-refined">
          <div class="timeline-vertical-thread"></div>
          ${customOrderSteps
            .map(
              (step, index) => `
                <article class="timeline-vertical-step reveal is-visible" style="--step:${index}; --delay:${index * 60}ms">
                  <div class="timeline-vertical-hoop">
                    <div class="timeline-vertical-hoop-inner">
                      ${icon(step.icon, 18)}
                    </div>
                  </div>
                  <div class="timeline-vertical-content">
                    <h3>
                      <span class="timeline-vertical-num">${step.num}</span>
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
      ${renderSectionHeading("How It Works", "How to Request Custom Orders", "", "")}
      <div class="carousel-shell">
        <button type="button" class="round-control left timeline-scroll-btn" data-action="scroll-carousel" data-target="timelineTrack" data-direction="-1" aria-label="Previous step">
          ${icon("arrow-left", 18)}
        </button>
        <div class="timeline reveal is-visible" id="timelineTrack" style="grid-template-columns: repeat(5, minmax(220px, 1fr));">
          <div class="timeline-thread" aria-hidden="true"></div>
          ${customOrderSteps
            .map(
              (step, index) => `
                <article class="timeline-step" style="--step:${index}">
                  <div class="step-number">${step.num}</div>
                  <div class="step-icon">${icon(step.icon, 28)}</div>
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
  const reviews = [
    {
      name: "Sravani Reddy",
      role: "Boutique Owner • Hyderabad",
      initials: "SR",
      rating: "5.0",
      tag: "Tajima Multi-Head • Bridal Blouse .DST",
      quote: "Downloaded the Bridal Gold Bloom back-neck .DST design for a rush wedding order. Stitched out flawlessly on our Tajima machine with zero thread breaks. The instant PhonePe unlock saved us a full day!"
    },
    {
      name: "Sri Lakshmi Embroidery",
      role: "Machine Unit Proprietor • Rajahmundry",
      initials: "SL",
      rating: "5.0",
      tag: "Barudan 12-Needle • Saree Borders",
      quote: "Godavari Designers has the best stitch density calibration in Andhra. We regularly run their saree borders on our multi-head machines with zero fabric puckering and crisp satin borders."
    },
    {
      name: "Pooja Sharma",
      role: "Pooja Couture • Visakhapatnam",
      initials: "PS",
      rating: "5.0",
      tag: "Custom Digitizing • .PES / Brother",
      quote: "Uploaded our client's hand sketch for custom digitizing on Monday. By morning, the production-ready machine file was ready with complete color sequences and exact stitch count specs."
    },
    {
      name: "Murali Krishna",
      role: "Krishna Digitizing & Textiles • Vijayawada",
      initials: "MK",
      rating: "5.0",
      tag: "Multi-Format • Instant DST & JEF",
      quote: "The instant file download system works just like downloading premium fonts or wallpapers. 1-click UPI payment and authentic .DST files download immediately. Outstanding convenience for busy production."
    },
    {
      name: "Divya Bharathi",
      role: "Aura Designer Blouses • Guntur",
      initials: "DB",
      rating: "5.0",
      tag: "Ricoma Commercial • Blouse Necklines",
      quote: "Every design includes exact hoop dimensions and stitch counts. Their boat neck and cutwork collections helped us expand our bridal boutique offerings effortlessly without an in-house puncher."
    },
    {
      name: "Ramesh Varma",
      role: "Varma Embroidery Works • Kakinada",
      initials: "RV",
      rating: "5.0",
      tag: "Commercial Tajima • Heavy Zari Shading",
      quote: "Super clean jump stitches and trims. Even intricate zari shading runs smoothly at 850 RPM without thread snapping. Truly production-ready digitizing."
    }
  ];

  return `
    <section class="content-section stories-section" id="stories" style="padding: 60px 0;">
      ${renderSectionHeading("Verified Feedback", "Customer Reviews & Experiences", "", "")}
      
      <!-- Trust & Satisfaction Summary Bar -->
      <div style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(230, 222, 209, 0.9); border-radius: 12px; padding: 18px 24px; margin-bottom: 32px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="display: flex; gap: 3px; color: var(--gold);">
            ${icon("star", 18)} ${icon("star", 18)} ${icon("star", 18)} ${icon("star", 18)} ${icon("star", 18)}
          </div>
          <div>
            <strong style="font-size: 15px; color: var(--navy); font-weight: 700;">4.9 / 5.0 Rating</strong>
            <span style="font-size: 13px; color: var(--ink-soft); margin-left: 8px;">Based on 850+ verified machine design downloads & custom orders</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #389e0d; background: rgba(82, 196, 26, 0.08); border: 1px solid rgba(82, 196, 26, 0.25); padding: 4px 12px; border-radius: 99px;">
            <span>✓</span> 100% Machine Tested (.DST / .PES / .JEF)
          </span>
          <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--navy); background: rgba(17, 29, 66, 0.05); border: 1px solid rgba(17, 29, 66, 0.12); padding: 4px 12px; border-radius: 99px;">
            ⚡ Zero Thread Break Guarantee
          </span>
        </div>
      </div>

      <!-- Reviews Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
        ${reviews
          .map(
            (rev, index) => `
              <article class="reveal is-visible" style="--delay:${index * 80}ms; background: #ffffff; border: 1px solid rgba(230, 222, 209, 0.9); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-sm); transition: transform 0.3s ease, box-shadow 0.3s ease;">
                <div>
                  <!-- Header: Stars + Verified Badge -->
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                    <div style="display: flex; gap: 3px; color: var(--gold);">
                      ${icon("star", 15)} ${icon("star", 15)} ${icon("star", 15)} ${icon("star", 15)} ${icon("star", 15)}
                    </div>
                    <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: #389e0d; background: rgba(82, 196, 26, 0.1); border-radius: 99px; padding: 3px 8px;">
                      <span>✓</span> Verified Buyer
                    </span>
                  </div>

                  <!-- Product / Machine Tag -->
                  <div style="margin-bottom: 12px;">
                    <span style="font-size: 11px; font-weight: 600; color: var(--gold); background: rgba(200, 161, 90, 0.12); border: 1px solid rgba(200, 161, 90, 0.25); border-radius: 4px; padding: 2px 8px; display: inline-block;">
                      ${escapeHtml(rev.tag)}
                    </span>
                  </div>

                  <!-- Review Quote -->
                  <p style="font-size: 14px; line-height: 1.65; color: var(--navy); margin: 0 0 20px; font-style: normal;">
                    "${escapeHtml(rev.quote)}"
                  </p>
                </div>

                <!-- Reviewer Details -->
                <div style="display: flex; align-items: center; gap: 12px; padding-top: 14px; border-top: 1px solid rgba(230, 222, 209, 0.6);">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--navy), #273b6b); color: #ffffff; font-weight: 700; font-size: 13px; display: grid; place-items: center; border: 1.5px solid var(--gold); flex-shrink: 0;">
                    ${escapeHtml(rev.initials)}
                  </div>
                  <div>
                    <strong style="display: block; font-size: 14px; font-weight: 700; color: var(--navy);">${escapeHtml(rev.name)}</strong>
                    <span style="display: block; font-size: 12px; color: var(--ink-soft); font-weight: 500;">${escapeHtml(rev.role)}</span>
                  </div>
                </div>
              </article>
            `
          )
          .join("")}
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
    <section class="content-section services-grid-section">
      <div class="section-heading reveal" style="text-align: center; max-width: 800px; margin: 0 auto 40px; display: grid; gap: 8px;">
        <p class="section-kicker" style="color: var(--gold); text-transform: uppercase; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; margin: 0;">What We Do</p>
        <h2 style="font-family: var(--font-serif); font-size: clamp(24px, 4vw, 32px); font-weight: 700; color: var(--navy); margin: 0;">Specialized Embroidery Services</h2>
        <div style="width: 50px; height: 1.5px; background: var(--gold); margin: 12px auto 0;"></div>
      </div>
      <div class="services-grid">
        <!-- Card 1 -->
        <article class="service-card">
          <div class="service-icon">${icon("upload-cloud", 28)}</div>
          <h3>Custom Embroidery Digitizing</h3>
          <p>Convert logos, hand sketches, and vectors into flawless, machine-ready stitch files.</p>
          <a href="#/services/custom-embroidery-digitizing" class="service-link">
            <span>Learn More</span>
            ${icon("arrow-right", 14)}
          </a>
        </article>
        <!-- Card 2 -->
        <article class="service-card">
          <div class="service-icon">${icon("heart", 28)}</div>
          <h3>Bridal Blouse Designs</h3>
          <p>Intricate zari embroidery placements, custom necklines, and sleeve borders for bridal wear.</p>
          <a href="#/services/bridal-blouse-embroidery-designs" class="service-link">
            <span>Learn More</span>
            ${icon("arrow-right", 14)}
          </a>
        </article>
        <!-- Card 3 -->
        <article class="service-card">
          <div class="service-icon">${icon("repeat", 28)}</div>
          <h3>Saree Border Digitizing</h3>
          <p>Seamless repeating border files and lace trims engineered for continuous multi-hoop runs.</p>
          <a href="#/services/saree-border-embroidery-designs" class="service-link">
            <span>Learn More</span>
            ${icon("arrow-right", 14)}
          </a>
        </article>
        <!-- Card 4 -->
        <article class="service-card">
          <div class="service-icon">${icon("award", 28)}</div>
          <h3>Logo & Branding</h3>
          <p>Precision lettering and stable underlays optimized for left-chest shirts, caps, and workwear.</p>
          <a href="#/services/logo-embroidery-digitizing" class="service-link">
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
    ${renderNewArrivals()}
    ${renderWhatsAppCustomBanner()}
    ${renderCollections()}
    ${renderProcess()}
    ${renderBestSellers()}
    ${renderAboutSection()}
    ${renderStories()}
    ${renderCta()}
  `;
}
