-- Migration to update website settings for Local SEO proximity, footer links, and contact phone/email.
-- This aligns existing production database settings with the revised Phase 25 strategy.

-- 1. Update Brand Contact Row
UPDATE public.website_settings
SET value = '{
  "name": "Godavari Designer",
  "contact": {
    "email": "godavaridesigner@gmail.com",
    "phone": "+91 83098 97055",
    "address": "Rajahmundry, Andhra Pradesh, India",
    "instagram": "@godavaridesigners"
  },
  "tagline": "Precision. Passion. Perfection.",
  "trustText": "Trusted by 2,500+ Fashion Brands Worldwide",
  "storyLabel": "Watch Our Story",
  "qualityTitle": "Premium Quality",
  "qualityText": "Machine-Ready Designs"
}'::jsonb
WHERE key = 'brand';

-- 2. Update Footer Columns
UPDATE public.website_settings
SET value = '{
  "columns": [
    {
      "title": "Shop & Services",
      "links": [
        "Design Library",
        "Custom Digitizing",
        "Bridal Blouse Embroidery",
        "Saree Border Embroidery",
        "Logo Digitizing"
      ]
    },
    {
      "title": "Locations & Company",
      "links": [
        "Rajahmundry Embroidery Services",
        "Andhra Pradesh Embroidery Services",
        "About Us",
        "Our Process",
        "Why Godavari"
      ]
    },
    {
      "title": "Support",
      "links": [
        "Track Order",
        "FAQs",
        "Contact / WhatsApp",
        "Shipping & Delivery",
        "Returns & Refunds",
        "Terms of Service",
        "Privacy Policy"
      ]
    }
  ],
  "newsletterTitle": "Stay Inspired",
  "newsletterText": "Subscribe to get updates on new designs, offers and embroidery inspirations."
}'::jsonb
WHERE key = 'footer';

-- 3. Update homepage_content (which contains nested brand and footer)
UPDATE public.website_settings
SET value = jsonb_set(
  jsonb_set(
    value,
    '{brand}',
    '{
      "name": "Godavari Designer",
      "contact": {
        "email": "godavaridesigner@gmail.com",
        "phone": "+91 83098 97055",
        "address": "Rajahmundry, Andhra Pradesh, India",
        "instagram": "@godavaridesigners"
      },
      "tagline": "Precision. Passion. Perfection.",
      "trustText": "Trusted by 2,500+ Fashion Brands Worldwide",
      "storyLabel": "Watch Our Story",
      "qualityTitle": "Premium Quality",
      "qualityText": "Machine-Ready Designs"
    }'::jsonb
  ),
  '{footer}',
  '{
    "columns": [
      {
        "title": "Shop & Services",
        "links": [
          "Design Library",
          "Custom Digitizing",
          "Bridal Blouse Embroidery",
          "Saree Border Embroidery",
          "Logo Digitizing"
        ]
      },
      {
        "title": "Locations & Company",
        "links": [
          "Rajahmundry Embroidery Services",
          "Andhra Pradesh Embroidery Services",
          "About Us",
          "Our Process",
          "Why Godavari"
        ]
      },
      {
        "title": "Support",
        "links": [
          "Track Order",
          "FAQs",
          "Contact / WhatsApp",
          "Shipping & Delivery",
          "Returns & Refunds",
          "Terms of Service",
          "Privacy Policy"
        ]
      }
    ],
    "newsletterTitle": "Stay Inspired",
    "newsletterText": "Subscribe to get updates on new designs, offers and embroidery inspirations."
  }'::jsonb
)
WHERE key = 'homepage_content';
