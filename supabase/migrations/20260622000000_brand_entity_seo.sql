-- Migration to update website settings to plural "Godavari Designers" and align brand descriptor
-- for homepage entity SEO and search result Trust quality.
-- Bulletproof version: Ensures the website_settings table exists and uses UPSERT.

-- 1. Create table if not exists (prevents relation not found errors on fresh databases)
CREATE TABLE IF NOT EXISTS public.website_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Upsert Brand settings row
INSERT INTO public.website_settings (key, value, updated_at)
VALUES (
  'brand',
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
  }'::jsonb,
  NOW()
)
ON CONFLICT (key)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;

-- 3. Upsert homepage_content (which contains nested brand)
INSERT INTO public.website_settings (key, value, updated_at)
VALUES (
  'homepage_content',
  '{
    "brand": {
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
    }
  }'::jsonb,
  NOW()
)
ON CONFLICT (key)
DO UPDATE SET
  value = jsonb_set(
    COALESCE(public.website_settings.value, '{}'::jsonb),
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
  ),
  updated_at = NOW();
