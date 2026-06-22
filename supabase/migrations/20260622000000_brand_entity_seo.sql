-- Migration to update website settings to plural "Godavari Designers" and align brand descriptor
-- for homepage entity SEO and search result Trust quality.

-- 1. Update Brand settings row
UPDATE public.website_settings
SET value = '{
  "name": "Godavari Designers",
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
  "qualityText": "Machine-Ready Designs",
  "descriptor": "Godavari Designers provides custom embroidery digitizing, bridal blouse embroidery designs, saree border embroidery, and logo digitizing services in Rajahmundry, Andhra Pradesh, India."
}'::jsonb
WHERE key = 'brand';

-- 2. Update homepage_content (which contains nested brand)
UPDATE public.website_settings
SET value = jsonb_set(
  value,
  '{brand}',
  '{
    "name": "Godavari Designers",
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
    "qualityText": "Machine-Ready Designs",
    "descriptor": "Godavari Designers provides custom embroidery digitizing, bridal blouse embroidery designs, saree border embroidery, and logo digitizing services in Rajahmundry, Andhra Pradesh, India."
  }'::jsonb
)
WHERE key = 'homepage_content';
