# Godavari Designer

We are currently building the homepage for **Godavari Designer**, a premium 2026 luxury embroidery ecommerce and custom digitizing platform.

The current work is a fully customizable static homepage prototype with a light luxury visual system inspired by Apple, Stripe, Framer, and high-end fashion houses. It includes a cinematic hero, featured collections, an animated process timeline, best-seller product cards, customer stories, a premium CTA section, and a minimal luxury footer.

## What is included now

- `index.html` - Static website entry point.
- `styles.css` - Complete luxury UI system, responsive layout, motion, glassmorphism, hover states, and editorial spacing.
- `app.js` - Homepage content model, rendering logic, admin customization drawer, search, cart, wishlist, quote form, newsletter form, and local persistence.

## Customization

The site is built so an admin can customize the homepage without editing layout code. Click the floating settings button on the page to update:

- Website name and tagline
- Contact details
- Hero heading, subheading, buttons, video, and poster image
- Brand colors
- Collection, product, story, and CTA images
- Full homepage content through the JSON editor

Changes are saved in browser `localStorage` for now. Later, this can be connected to a real admin backend or CMS.

## Current status

This is the first homepage implementation. The design and content are temporary placeholders until final brand images, product details, admin requirements, backend/API details, and ecommerce flow are provided.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 5177
```

Then visit:

```text
http://127.0.0.1:5177
```
