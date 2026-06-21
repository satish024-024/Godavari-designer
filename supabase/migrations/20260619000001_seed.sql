-- Migration to seed initial database state

-- 1. Seed Categories
INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'd3b07384-d113-4ec5-a5d6-d05b5832a821',
  'Bridal',
  'bridal',
  NULL,
  'media-collection-bridal',
  'media-collection-bridal',
  'Heirloom motifs, veil borders and couture wedding details.',
  true,
  true,
  'Couture Bridal Embroidery Designs | Godavari Designer',
  'Browse heirloom bridal embroidery designs, veil borders, and lehenga details.',
  1
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'c8397a6e-4b2a-4a2b-8a7e-40742ff82c89',
  'Blouse Designs',
  'blouses',
  NULL,
  'media-collection-blouses',
  'media-collection-blouses',
  'Back-neck artwork, sleeves and precision blouse placements.',
  false,
  true,
  'Designer Blouse Embroidery Placements | Godavari Designer',
  'Exquisite back-neck, sleeves, and front blouse embroidery placements.',
  2
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Saree Borders',
  'saree',
  NULL,
  'media-collection-saree',
  'media-collection-saree',
  'Machine-ready ornate borders for silk, net and organza sarees.',
  false,
  true,
  'Saree Border Machine Embroidery Designs | Godavari Designer',
  'Ornate borders and trims for sarees, net borders, and silk fabrics.',
  3
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'e74288b2-b108-4c28-98e3-99b350bc82ee',
  'Kids Wear',
  'kids-wear',
  NULL,
  'media-collection-kids',
  'media-collection-kids',
  'Soft festive details for lehengas, frocks and tiny occasionwear.',
  false,
  true,
  'Festive Kids Wear Machine Embroidery Patterns | Godavari Designer',
  'Soft festive embroidery designs for children, frocks, and small lehengas.',
  4
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'a2b1660d-2bc6-46b5-827c-65ff52b9fb1a',
  'Luxury Floral',
  'floral-collection',
  NULL,
  'media-collection-floral',
  'media-collection-floral',
  'Dimensional florals, gold vines and elevated botanical patterns.',
  false,
  true,
  'Luxury Floral Machine Embroidery Collections | Godavari Designer',
  'Elevated floral embroidery motifs, botanical vines, and gold rose designs.',
  5
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'b7389a9f-5060-449e-b9b2-386d4e5f082e',
  'Designer',
  'designer',
  NULL,
  'media-collection-floral',
  'media-collection-floral',
  'Couture digitizing and premium designer placements.',
  true,
  true,
  'Designer Embroidery Collection | Godavari Designer',
  'Browse designer embroidery patterns and couture placements.',
  6
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'cd0863bb-9a1d-40a1-8d26-6677f975471d',
  'Luxury',
  'luxury',
  NULL,
  'media-product-peony',
  'media-product-peony',
  'Ultra high stitch-count premium masterpieces.',
  true,
  true,
  'Luxury Masterpiece Embroidery | Godavari Designer',
  'High stitch count premium luxury embroidery designs.',
  7
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  '23c108bb-a0f2-4e4b-b8ea-9cde2f310f82',
  '3D Flower',
  '3d-flower',
  'd3b07384-d113-4ec5-a5d6-d05b5832a821',
  'media-collection-bridal',
  'media-collection-bridal',
  'Three-dimensional flower motifs.',
  false,
  true,
  '3D Flower Bridal Embroidery | Godavari Designer',
  'Dimensional flower embroidery patterns.',
  1
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  '5c3452bd-2d88-4fb7-87db-2b5b5c92c48e',
  'Cutwork',
  'cutwork',
  'd3b07384-d113-4ec5-a5d6-d05b5832a821',
  'media-collection-bridal',
  'media-collection-bridal',
  'Cutwork designs.',
  true,
  true,
  'Cutwork Bridal Embroidery | Godavari Designer',
  'Cutwork designs for bridal wear.',
  2
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'ab5b84c8-2d82-4fcf-b673-8aefcb8b5f3a',
  'Embossed',
  'embossed',
  'd3b07384-d113-4ec5-a5d6-d05b5832a821',
  'media-collection-bridal',
  'media-collection-bridal',
  'Raised embossed textures.',
  false,
  true,
  'Embossed Bridal Embroidery | Godavari Designer',
  'Raised embossed textures for luxury lehengas.',
  3
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  '4c23dbd4-1a91-4993-85f2-9bc5f590db21',
  'Peacock',
  'peacock',
  'd3b07384-d113-4ec5-a5d6-d05b5832a821',
  'media-collection-bridal',
  'media-collection-bridal',
  'Elegant peacock designs.',
  false,
  true,
  'Peacock Bridal Embroidery | Godavari Designer',
  'Peacock motifs for ethnic bridal couture.',
  4
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'e3d098ee-55ee-45df-95bf-9eb845a77028',
  'Boat Neck',
  'boat-neck',
  'c8397a6e-4b2a-4a2b-8a7e-40742ff82c89',
  'media-collection-blouses',
  'media-collection-blouses',
  'Boat neck placement patterns.',
  false,
  true,
  'Boat Neck Blouse Embroidery | Godavari Designer',
  'Boat neck embroidery placements.',
  1
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'db708bcf-69bb-4ec5-85db-234b6b6ec8bb',
  'Pot Neck',
  'pot-neck',
  'c8397a6e-4b2a-4a2b-8a7e-40742ff82c89',
  'media-collection-blouses',
  'media-collection-blouses',
  'Pot neck placement patterns.',
  false,
  true,
  'Pot Neck Blouse Embroidery | Godavari Designer',
  'Pot neck embroidery placements.',
  2
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  '7f23c21c-5bb5-4df3-8d69-58b29df21d5a',
  'V Neck',
  'v-neck',
  'c8397a6e-4b2a-4a2b-8a7e-40742ff82c89',
  'media-collection-blouses',
  'media-collection-blouses',
  'V neck placement patterns.',
  false,
  true,
  'V Neck Blouse Embroidery | Godavari Designer',
  'V neck embroidery placements.',
  3
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d470',
  'Neckline',
  'neckline',
  'c8397a6e-4b2a-4a2b-8a7e-40742ff82c89',
  'media-collection-blouses',
  'media-collection-blouses',
  'Regal necklines and collar placements.',
  true,
  true,
  'Neckline Embroidery Designs | Godavari Designer',
  'Regal neckline and collar embroidery placements.',
  4
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  '61b8fbf2-d39f-4318-971c-3b91bc6fe91b',
  'Floral',
  'floral-saree',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'media-collection-saree',
  'media-collection-saree',
  'Floral saree borders and motifs.',
  true,
  true,
  'Floral Saree Borders | Godavari Designer',
  'Floral patterns for saree borders.',
  1
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'de305bc8-5221-4f38-89c0-54fb81f6d0f1',
  'Temple',
  'temple',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'media-collection-saree',
  'media-collection-saree',
  'Traditional temple saree borders.',
  false,
  true,
  'Temple Saree Borders | Godavari Designer',
  'Temple borders for traditional sarees.',
  2
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'c18f3a38-f9b0-4dbf-8647-7bc9c8c9a3d4',
  'Traditional',
  'traditional',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'media-collection-saree',
  'media-collection-saree',
  'Ethnic traditional borders and motifs.',
  true,
  true,
  'Traditional Saree Borders | Godavari Designer',
  'Ethnic border machine embroidery.',
  3
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  '11c4c1a7-de34-4b5a-93ef-92e1fc16d3f2',
  'Borders',
  'borders',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'media-collection-saree',
  'media-collection-saree',
  'Exquisite borders for sarees and lehengas.',
  false,
  true,
  'Embroidery Borders | Godavari Designer',
  'Premium machine-ready embroidery borders.',
  4
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  '1f2a3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  'Zari Work',
  'zari-work',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'media-collection-saree',
  'media-collection-saree',
  'Traditional gold metallic thread zari patterns.',
  false,
  true,
  'Zari Work Embroidery | Godavari Designer',
  'Gold metallic zari work embroidery patterns.',
  5
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

INSERT INTO public.categories (id, name, slug, parent_category_id, image, banner_image, description, featured, visibility, seo_title, seo_description, display_order)
VALUES (
  'e43a52bd-2d88-4fb7-87db-2b5b5c92c48f',
  'Kids',
  'kids-sub',
  'e74288b2-b108-4c28-98e3-99b350bc82ee',
  'media-collection-kids',
  'media-collection-kids',
  'Children festive wear designs.',
  true,
  true,
  'Kids Embroidery Designs | Godavari Designer',
  'Festive children wear embroidery designs.',
  1
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  parent_category_id = EXCLUDED.parent_category_id,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  description = EXCLUDED.description,
  featured = EXCLUDED.featured,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  display_order = EXCLUDED.display_order;

-- 2. Seed Collections
INSERT INTO public.collections (id, title, slug, description, image, banner_image, featured, display_order, seo_title, seo_description)
VALUES (
  'd3b07384-d113-4ec5-a5d6-d05b5832a001',
  'Bridal Collection',
  'bridal',
  'Heirloom motifs, veil borders and couture wedding details.',
  'media-collection-bridal',
  'media-collection-bridal',
  true,
  1,
  'Bridal Collection Collection | Godavari',
  'Browse the premium bridal collection embroidery collection.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  featured = EXCLUDED.featured;

INSERT INTO public.collections (id, title, slug, description, image, banner_image, featured, display_order, seo_title, seo_description)
VALUES (
  'c8397a6e-4b2a-4a2b-8a7e-40742ff82002',
  'Designer Blouses',
  'blouses',
  'Back-neck artwork, sleeves and precision blouse placements.',
  'media-collection-blouses',
  'media-collection-blouses',
  true,
  1,
  'Designer Blouses Collection | Godavari',
  'Browse the premium designer blouses embroidery collection.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  featured = EXCLUDED.featured;

INSERT INTO public.collections (id, title, slug, description, image, banner_image, featured, display_order, seo_title, seo_description)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d003',
  'Saree Borders',
  'saree',
  'Machine-ready ornate borders for silk, net and organza sarees.',
  'media-collection-saree',
  'media-collection-saree',
  true,
  1,
  'Saree Borders Collection | Godavari',
  'Browse the premium saree borders embroidery collection.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  featured = EXCLUDED.featured;

INSERT INTO public.collections (id, title, slug, description, image, banner_image, featured, display_order, seo_title, seo_description)
VALUES (
  'e74288b2-b108-4c28-98e3-99b350bc2004',
  'Kids Wear',
  'kids',
  'Soft festive details for lehengas, frocks and tiny occasionwear.',
  'media-collection-kids',
  'media-collection-kids',
  true,
  1,
  'Kids Wear Collection | Godavari',
  'Browse the premium kids wear embroidery collection.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  featured = EXCLUDED.featured;

INSERT INTO public.collections (id, title, slug, description, image, banner_image, featured, display_order, seo_title, seo_description)
VALUES (
  'a2b1660d-2bc6-46b5-827c-65ff52b92005',
  'Luxury Floral',
  'floral',
  'Dimensional florals, gold vines and elevated botanical patterns.',
  'media-collection-floral',
  'media-collection-floral',
  true,
  1,
  'Luxury Floral Collection | Godavari',
  'Browse the premium luxury floral embroidery collection.'
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  banner_image = EXCLUDED.banner_image,
  featured = EXCLUDED.featured;

-- 3. Seed Products
INSERT INTO public.products (
  id, slug, code, title, description, price, category_id, collection_id, image, gallery,
  width, height, back_stitch_count, hand_stitch_count, total_stitch_count, rpm, estimated_time, thread_colors,
  difficulty_level, recommended_fabrics, formats, featured, best_seller, seo_title, seo_description
) VALUES (
  'e810a08e-8a7a-40a2-9a3a-6ff9f2c68001',
  'royal-peony-floral',
  'GD-1028',
  'Royal Peony Floral',
  'A majestic royal peony embroidery motif meticulously digitized for high-end boutique blouses, designer kurtas, and decorative centerpieces. Features smooth stitch runs, optimized jump stitches, and premium shading depth to capture realistic floral elegance on silk, velvet, or organza.',
  45,
  'a2b1660d-2bc6-46b5-827c-65ff52b9fb1a',
  'a2b1660d-2bc6-46b5-827c-65ff52b92005',
  'media-product-peony',
  '{"media-product-peony","media-collection-floral"}',
  140,
  165,
  2400,
  0,
  34500,
  850,
  40,
  6,
  'Intermediate',
  '{"Silk","Organza","Velvet"}',
  '[{"format":"DST","machineBrand":"Tajima","machineModel":"TMEZ-SC","hoopSize":"200mm x 200mm","price":45},{"format":"PES","machineBrand":"Brother","machineModel":"PR1055X","hoopSize":"200mm x 200mm","price":45},{"format":"EXP","machineBrand":"Bernina","machineModel":"E16","hoopSize":"200mm x 200mm","price":45},{"format":"JEF","machineBrand":"Janome","machineModel":"MC550E","hoopSize":"200mm x 200mm","price":45},{"format":"XXX","machineBrand":"Singer","machineModel":"EM9305","hoopSize":"200mm x 200mm","price":45}]'::jsonb,
  true,
  true,
  'Royal Peony Floral Design Motif (GD-1028) | Godavari',
  'Download the Royal Peony machine embroidery design motif. Optimized for silk, velvet, and organza fabrics. Available in DST, PES, EXP, and JEF.'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  collection_id = EXCLUDED.collection_id,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  back_stitch_count = EXCLUDED.back_stitch_count,
  hand_stitch_count = EXCLUDED.hand_stitch_count,
  total_stitch_count = EXCLUDED.total_stitch_count,
  rpm = EXCLUDED.rpm,
  estimated_time = EXCLUDED.estimated_time,
  thread_colors = EXCLUDED.thread_colors,
  difficulty_level = EXCLUDED.difficulty_level,
  recommended_fabrics = EXCLUDED.recommended_fabrics,
  formats = EXCLUDED.formats,
  featured = EXCLUDED.featured,
  best_seller = EXCLUDED.best_seller,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

INSERT INTO public.products (
  id, slug, code, title, description, price, category_id, collection_id, image, gallery,
  width, height, back_stitch_count, hand_stitch_count, total_stitch_count, rpm, estimated_time, thread_colors,
  difficulty_level, recommended_fabrics, formats, featured, best_seller, seo_title, seo_description
) VALUES (
  'e810a08e-8a7a-40a2-9a3a-6ff9f2c68002',
  'bridal-gold-bloom',
  'GD-2041',
  'Bridal Gold Bloom',
  'An heirloom-grade gold floral bloom embroidery pattern designed for bridal lehengas, heavy dupattas, and luxury wedding veils. Digitized for multi-directional metallic thread stability, minimizing thread breaks while maintaining a dense, rich 3D gold finish.',
  65,
  'd3b07384-d113-4ec5-a5d6-d05b5832a821',
  'd3b07384-d113-4ec5-a5d6-d05b5832a001',
  'media-collection-bridal',
  '{"media-collection-bridal"}',
  180,
  220,
  4800,
  0,
  58000,
  850,
  68,
  8,
  'Advanced',
  '{"Silk","Net","Velvet"}',
  '[{"format":"DST","machineBrand":"Tajima","machineModel":"TMEZ-SC","hoopSize":"200mm x 300mm","price":65},{"format":"PES","machineBrand":"Brother","machineModel":"PR1055X","hoopSize":"200mm x 300mm","price":65},{"format":"EXP","machineBrand":"Bernina","machineModel":"E16","hoopSize":"200mm x 300mm","price":65},{"format":"JEF","machineBrand":"Janome","machineModel":"MC550E","hoopSize":"200mm x 300mm","price":65}]'::jsonb,
  true,
  true,
  'Bridal Gold Bloom Lehenga Embroidery Design (GD-2041) | Godavari',
  'Premium bridal gold bloom machine embroidery design with 58,000 stitches. Perfect for wedding lehengas, veils, and heavy boutique wear.'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  collection_id = EXCLUDED.collection_id,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  back_stitch_count = EXCLUDED.back_stitch_count,
  hand_stitch_count = EXCLUDED.hand_stitch_count,
  total_stitch_count = EXCLUDED.total_stitch_count,
  rpm = EXCLUDED.rpm,
  estimated_time = EXCLUDED.estimated_time,
  thread_colors = EXCLUDED.thread_colors,
  difficulty_level = EXCLUDED.difficulty_level,
  recommended_fabrics = EXCLUDED.recommended_fabrics,
  formats = EXCLUDED.formats,
  featured = EXCLUDED.featured,
  best_seller = EXCLUDED.best_seller,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

INSERT INTO public.products (
  id, slug, code, title, description, price, category_id, collection_id, image, gallery,
  width, height, back_stitch_count, hand_stitch_count, total_stitch_count, rpm, estimated_time, thread_colors,
  difficulty_level, recommended_fabrics, formats, featured, best_seller, seo_title, seo_description
) VALUES (
  'e810a08e-8a7a-40a2-9a3a-6ff9f2c68003',
  'designer-vine-border',
  'GD-1877',
  'Designer Vine Border',
  'A sleek, repeating vine border trailing embroidery design. Masterfully engineered for running borders on designer sarees, dupatta edges, and ethnic kurtis. The continuous seamless loop ensures zero overlaps and flawless stitching sequences.',
  35,
  '11c4c1a7-de34-4b5a-93ef-92e1fc16d3f2',
  'f47ac10b-58cc-4372-a567-0e02b2c3d003',
  'media-product-floral-vine',
  '{"media-product-floral-vine"}',
  100,
  300,
  2000,
  0,
  29000,
  850,
  34,
  4,
  'Beginner',
  '{"Organza","Net","Georgette"}',
  '[{"format":"DST","machineBrand":"Tajima","machineModel":"TMEZ-SC","hoopSize":"130mm x 300mm","price":35},{"format":"PES","machineBrand":"Brother","machineModel":"PR1055X","hoopSize":"130mm x 300mm","price":35},{"format":"EXP","machineBrand":"Bernina","machineModel":"E16","hoopSize":"130mm x 300mm","price":35}]'::jsonb,
  false,
  true,
  'Designer Vine Border Saree Embroidery Design (GD-1877) | Godavari',
  'Buy repeating vine border machine embroidery pattern for boutique saree border stitching. Seamless continuous looping, optimized for running stitch borders.'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  collection_id = EXCLUDED.collection_id,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  back_stitch_count = EXCLUDED.back_stitch_count,
  hand_stitch_count = EXCLUDED.hand_stitch_count,
  total_stitch_count = EXCLUDED.total_stitch_count,
  rpm = EXCLUDED.rpm,
  estimated_time = EXCLUDED.estimated_time,
  thread_colors = EXCLUDED.thread_colors,
  difficulty_level = EXCLUDED.difficulty_level,
  recommended_fabrics = EXCLUDED.recommended_fabrics,
  formats = EXCLUDED.formats,
  featured = EXCLUDED.featured,
  best_seller = EXCLUDED.best_seller,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

INSERT INTO public.products (
  id, slug, code, title, description, price, category_id, collection_id, image, gallery,
  width, height, back_stitch_count, hand_stitch_count, total_stitch_count, rpm, estimated_time, thread_colors,
  difficulty_level, recommended_fabrics, formats, featured, best_seller, seo_title, seo_description
) VALUES (
  'e810a08e-8a7a-40a2-9a3a-6ff9f2c68004',
  'regal-paisley-motif',
  'GD-3102',
  'Regal Paisley Motif',
  'A regal, traditional paisley (buta) patch design featuring dense gold zari fill and delicate outline runs. Perfect for matching side panels on bridal lehengas, sherwani collars, and premium wedding ethnic wear.',
  42,
  'c18f3a38-f9b0-4dbf-8647-7bc9c8c9a3d4',
  'd3b07384-d113-4ec5-a5d6-d05b5832a001',
  'media-product-paisley',
  '{"media-product-paisley"}',
  150,
  180,
  3800,
  0,
  41000,
  850,
  50,
  5,
  'Intermediate',
  '{"Silk","Velvet","Georgette"}',
  '[{"format":"DST","machineBrand":"Tajima","machineModel":"TMEZ-SC","hoopSize":"200mm x 200mm","price":42},{"format":"PES","machineBrand":"Brother","machineModel":"PR1055X","hoopSize":"200mm x 200mm","price":42},{"format":"EXP","machineBrand":"Bernina","machineModel":"E16","hoopSize":"200mm x 200mm","price":42},{"format":"JEF","machineBrand":"Janome","machineModel":"MC550E","hoopSize":"200mm x 200mm","price":42}]'::jsonb,
  true,
  false,
  'Regal Paisley Motif Lehenga Embroidery Pattern (GD-3102) | Godavari',
  'Intricate traditional regal paisley patch design. Dense zari gold embroidery file with 41,000 stitches, ideal for bridal and wedding couture.'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  collection_id = EXCLUDED.collection_id,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  back_stitch_count = EXCLUDED.back_stitch_count,
  hand_stitch_count = EXCLUDED.hand_stitch_count,
  total_stitch_count = EXCLUDED.total_stitch_count,
  rpm = EXCLUDED.rpm,
  estimated_time = EXCLUDED.estimated_time,
  thread_colors = EXCLUDED.thread_colors,
  difficulty_level = EXCLUDED.difficulty_level,
  recommended_fabrics = EXCLUDED.recommended_fabrics,
  formats = EXCLUDED.formats,
  featured = EXCLUDED.featured,
  best_seller = EXCLUDED.best_seller,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

INSERT INTO public.products (
  id, slug, code, title, description, price, category_id, collection_id, image, gallery,
  width, height, back_stitch_count, hand_stitch_count, total_stitch_count, rpm, estimated_time, thread_colors,
  difficulty_level, recommended_fabrics, formats, featured, best_seller, seo_title, seo_description
) VALUES (
  'e810a08e-8a7a-40a2-9a3a-6ff9f2c68005',
  'kids-floral-garden',
  'GD-4058',
  'Kids Floral Garden',
  'A playful, delicate floral garden motif designed specifically for children''s festive wear, frocks, lehengas, and tiny borders. Engineered with a low stitch density and soft fills to prevent fabric stiffening on lightweight kid-friendly fabrics.',
  36,
  'e43a52bd-2d88-4fb7-87db-2b5b5c92c48f',
  'e74288b2-b108-4c28-98e3-99b350bc2004',
  'media-collection-kids',
  '{"media-collection-kids"}',
  70,
  130,
  1200,
  0,
  18000,
  850,
  23,
  3,
  'Beginner',
  '{"Cotton","Silk","Organza"}',
  '[{"format":"DST","machineBrand":"Tajima","machineModel":"TMEZ-SC","hoopSize":"100mm x 150mm","price":36},{"format":"PES","machineBrand":"Brother","machineModel":"PR1055X","hoopSize":"100mm x 150mm","price":36},{"format":"EXP","machineBrand":"Bernina","machineModel":"E16","hoopSize":"100mm x 150mm","price":36},{"format":"JEF","machineBrand":"Janome","machineModel":"MC550E","hoopSize":"100mm x 150mm","price":36},{"format":"XXX","machineBrand":"Singer","machineModel":"EM9305","hoopSize":"100mm x 150mm","price":36}]'::jsonb,
  false,
  true,
  'Kids Floral Garden Dress Embroidery Design (GD-4058) | Godavari',
  'Soft mini floral garden machine embroidery pattern for kids festive wear. Low density stitch structure for comfortable, soft drape on child fabrics.'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  collection_id = EXCLUDED.collection_id,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  back_stitch_count = EXCLUDED.back_stitch_count,
  hand_stitch_count = EXCLUDED.hand_stitch_count,
  total_stitch_count = EXCLUDED.total_stitch_count,
  rpm = EXCLUDED.rpm,
  estimated_time = EXCLUDED.estimated_time,
  thread_colors = EXCLUDED.thread_colors,
  difficulty_level = EXCLUDED.difficulty_level,
  recommended_fabrics = EXCLUDED.recommended_fabrics,
  formats = EXCLUDED.formats,
  featured = EXCLUDED.featured,
  best_seller = EXCLUDED.best_seller,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

INSERT INTO public.products (
  id, slug, code, title, description, price, category_id, collection_id, image, gallery,
  width, height, back_stitch_count, hand_stitch_count, total_stitch_count, rpm, estimated_time, thread_colors,
  difficulty_level, recommended_fabrics, formats, featured, best_seller, seo_title, seo_description
) VALUES (
  'e810a08e-8a7a-40a2-9a3a-6ff9f2c68006',
  'zari-leaf-trail',
  'GD-2766',
  'Zari Leaf Trail',
  'A classic zari leaf trail continuous border design. Beautifully digitized for borders of designer sarees, lehenga hems, and sherwani cuffs. Standardized for high-speed embroidery machines with minimal color changes and trim commands.',
  39,
  '1f2a3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  'f47ac10b-58cc-4372-a567-0e02b2c3d003',
  'media-product-golden-leaf',
  '{"media-product-golden-leaf"}',
  90,
  200,
  1900,
  0,
  25500,
  850,
  32,
  3,
  'Intermediate',
  '{"Silk","Georgette","Organza"}',
  '[{"format":"DST","machineBrand":"Tajima","machineModel":"TMEZ-SC","hoopSize":"100mm x 250mm","price":39},{"format":"PES","machineBrand":"Brother","machineModel":"PR1055X","hoopSize":"100mm x 250mm","price":39},{"format":"EXP","machineBrand":"Bernina","machineModel":"E16","hoopSize":"100mm x 250mm","price":39}]'::jsonb,
  false,
  false,
  'Zari Leaf Trail Saree Border Embroidery Design (GD-2766) | Godavari',
  'Get the zari leaf border machine embroidery design with 25,500 stitches. Optimized for high-speed boutique production on wedding sarees.'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  collection_id = EXCLUDED.collection_id,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  back_stitch_count = EXCLUDED.back_stitch_count,
  hand_stitch_count = EXCLUDED.hand_stitch_count,
  total_stitch_count = EXCLUDED.total_stitch_count,
  rpm = EXCLUDED.rpm,
  estimated_time = EXCLUDED.estimated_time,
  thread_colors = EXCLUDED.thread_colors,
  difficulty_level = EXCLUDED.difficulty_level,
  recommended_fabrics = EXCLUDED.recommended_fabrics,
  formats = EXCLUDED.formats,
  featured = EXCLUDED.featured,
  best_seller = EXCLUDED.best_seller,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

INSERT INTO public.products (
  id, slug, code, title, description, price, category_id, collection_id, image, gallery,
  width, height, back_stitch_count, hand_stitch_count, total_stitch_count, rpm, estimated_time, thread_colors,
  difficulty_level, recommended_fabrics, formats, featured, best_seller, seo_title, seo_description
) VALUES (
  'e810a08e-8a7a-40a2-9a3a-6ff9f2c68007',
  'cutwork-elegance',
  'GD-3345',
  'Cutwork Elegance',
  'A heavy cutwork back-neck design pattern for bridal blouses. Digitized with specialized satin stitch outlines and secure cut-out borders to guide precise fabric trimming, giving a flawless hollow lace effect on silk and georgette.',
  55,
  '5c3452bd-2d88-4fb7-87db-2b5b5c92c48e',
  'c8397a6e-4b2a-4a2b-8a7e-40742ff82002',
  'media-product-net',
  '{"media-product-net"}',
  180,
  200,
  2800,
  0,
  31000,
  800,
  40,
  5,
  'Advanced',
  '{"Net","Silk","Organza"}',
  '[{"format":"DST","machineBrand":"Tajima","machineModel":"TMEZ-SC","hoopSize":"200mm x 250mm","price":55},{"format":"PES","machineBrand":"Brother","machineModel":"PR1055X","hoopSize":"200mm x 250mm","price":55},{"format":"EXP","machineBrand":"Bernina","machineModel":"E16","hoopSize":"200mm x 250mm","price":55}]'::jsonb,
  true,
  true,
  'Cutwork Elegance Blouse Back-Neck Embroidery (GD-3345) | Godavari',
  'Exquisite cutwork back-neck designer blouse machine embroidery file. Clean satin stitch edges for perfect cutout guides. Compatible with DST, PES, EXP.'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  collection_id = EXCLUDED.collection_id,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  back_stitch_count = EXCLUDED.back_stitch_count,
  hand_stitch_count = EXCLUDED.hand_stitch_count,
  total_stitch_count = EXCLUDED.total_stitch_count,
  rpm = EXCLUDED.rpm,
  estimated_time = EXCLUDED.estimated_time,
  thread_colors = EXCLUDED.thread_colors,
  difficulty_level = EXCLUDED.difficulty_level,
  recommended_fabrics = EXCLUDED.recommended_fabrics,
  formats = EXCLUDED.formats,
  featured = EXCLUDED.featured,
  best_seller = EXCLUDED.best_seller,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

INSERT INTO public.products (
  id, slug, code, title, description, price, category_id, collection_id, image, gallery,
  width, height, back_stitch_count, hand_stitch_count, total_stitch_count, rpm, estimated_time, thread_colors,
  difficulty_level, recommended_fabrics, formats, featured, best_seller, seo_title, seo_description
) VALUES (
  'e810a08e-8a7a-40a2-9a3a-6ff9f2c68008',
  'neckline-royal-design',
  'GD-5120',
  'Neckline Royal Design',
  'A magnificent regal front-neck and collar embroidery placement. Features traditional Indian neckline curvatures and royal leaf motifs, with outlines structured to accept manual stone-fixing or beadwork overlays for a hybrid luxury finish.',
  48,
  'f47ac10b-58cc-4372-a567-0e02b2c3d470',
  'c8397a6e-4b2a-4a2b-8a7e-40742ff82002',
  'media-collection-blouses',
  '{"media-collection-blouses"}',
  150,
  150,
  1600,
  0,
  22000,
  850,
  28,
  4,
  'Intermediate',
  '{"Silk","Cotton","Georgette"}',
  '[{"format":"DST","machineBrand":"Tajima","machineModel":"TMEZ-SC","hoopSize":"200mm x 200mm","price":48},{"format":"PES","machineBrand":"Brother","machineModel":"PR1055X","hoopSize":"200mm x 200mm","price":48},{"format":"EXP","machineBrand":"Bernina","machineModel":"E16","hoopSize":"200mm x 200mm","price":48},{"format":"JEF","machineBrand":"Janome","machineModel":"MC550E","hoopSize":"200mm x 200mm","price":48}]'::jsonb,
  false,
  false,
  'Royal Neckline Collar Machine Embroidery Pattern (GD-5120) | Godavari',
  'Regal front-neck collar embroidery design with 22,000 stitches. Indian boutique style placement template for kurtas and wedding blouses.'
) ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  collection_id = EXCLUDED.collection_id,
  image = EXCLUDED.image,
  gallery = EXCLUDED.gallery,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  back_stitch_count = EXCLUDED.back_stitch_count,
  hand_stitch_count = EXCLUDED.hand_stitch_count,
  total_stitch_count = EXCLUDED.total_stitch_count,
  rpm = EXCLUDED.rpm,
  estimated_time = EXCLUDED.estimated_time,
  thread_colors = EXCLUDED.thread_colors,
  difficulty_level = EXCLUDED.difficulty_level,
  recommended_fabrics = EXCLUDED.recommended_fabrics,
  formats = EXCLUDED.formats,
  featured = EXCLUDED.featured,
  best_seller = EXCLUDED.best_seller,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description;

-- 4. Seed Website Settings
INSERT INTO public.website_settings (key, value)
VALUES ('homepage_content', '{"theme":{"ivory":"#F8F6F2","surface":"#EFE8DD","navy":"#111D42","gold":"#C8A15A","border":"#E6DED1","glass":"rgba(255, 255, 255, 0.68)","blush":"#D8A7A0","sage":"#8D9B83"},"brand":{"name":"Godavari Designer","tagline":"Precision. Passion. Perfection.","descriptor":"Luxury embroidery designs, digitized to perfection for fashion that inspires.","trustText":"Trusted by 2,500+ Fashion Brands Worldwide","storyLabel":"Watch Our Story","qualityTitle":"Premium Quality","qualityText":"Machine-Ready Designs","contact":{"email":"hello@godavaridesigner.com","phone":"+91 98765 43210","address":"Hyderabad, India","instagram":"@godavaridesigner"}},"navigation":[{"label":"Collections","target":"collections"},{"label":"Custom Digitizing","target":"process"},{"label":"Design Library","target":"best-sellers"},{"label":"About Us","target":"stories"},{"label":"Inspiration","target":"cta"},{"label":"Contact","target":"footer"}],"hero":{"eyebrow":"Passion. Perfection.","heading":"Embroidery Reimagined","subheading":"Custom Digitizing, Luxury Embroidery Designs, Machine-Ready Collections.","primaryButton":"Browse Designs","secondaryButton":"Request Custom Quote","videoUrl":"media-hero-video","posterImage":"media-hero-bg","note":"Cinematic machine stitching with luxury floral embroidery direction."},"collections":[{"id":"bridal","title":"Bridal Collection","description":"Heirloom motifs, veil borders and couture wedding details.","image":"media-collection-bridal"},{"id":"blouses","title":"Designer Blouses","description":"Back-neck artwork, sleeves and precision blouse placements.","image":"media-collection-blouses"},{"id":"saree","title":"Saree Borders","description":"Machine-ready ornate borders for silk, net and organza sarees.","image":"media-collection-saree"},{"id":"kids","title":"Kids Wear","description":"Soft festive details for lehengas, frocks and tiny occasionwear.","image":"media-collection-kids"},{"id":"floral","title":"Luxury Floral","description":"Dimensional florals, gold vines and elevated botanical patterns.","image":"media-collection-floral"}],"steps":[{"title":"Upload Design","body":"Upload your artwork, sketch or reference.","icon":"upload-cloud"},{"title":"Get Quote","body":"Receive a custom quote within 24 hours.","icon":"receipt-text"},{"title":"Approve Sample","body":"Review and approve your stitch sample.","icon":"badge-check"},{"title":"Production","body":"Precision embroidery with luxury quality.","icon":"factory"},{"title":"Delivery","body":"Delivered to your doorstep.","icon":"package-check"}],"stories":{"quote":"Godavari transformed our ideas into exquisite embroidery that elevates our entire collection.","person":"Neha Mehta","role":"Designer, Delhi","rating":"5.0","clients":[{"name":"House of Anaya","type":"Fashion House","quote":"The sampling quality made approvals effortless.","image":"media-client-1"},{"name":"Label Neha","type":"Designer Label","quote":"Digitizing felt exact, refined and ready for production.","image":"media-client-2"},{"name":"Saaz Couture","type":"Couture Studio","quote":"Our bridal pieces now carry a richer finish.","image":"media-client-3"},{"name":"Ivy & Oak Designs","type":"Boutique","quote":"A calm, premium experience from quote to delivery.","image":"media-client-4"},{"name":"Meera Bridals","type":"Bridal Atelier","quote":"Every motif arrived production-ready.","image":"media-client-5"}]},"cta":{"headline":"Bring Your Embroidery Vision To Life","text":"Transform ideas into precision embroidery crafted for fashion brands, boutiques and designers.","primaryButton":"Request Custom Quote","secondaryButton":"Browse Collections","image":"media-cta-bg"},"footer":{"columns":[{"title":"Shop","links":["All Collections","Best Sellers","New Arrivals","Design Library","Custom Digitizing"]},{"title":"Company","links":["About Us","Our Process","Why Godavari","Reviews","Careers"]},{"title":"Support","links":["FAQs","Shipping & Delivery","Returns & Refunds","Terms of Service","Privacy Policy"]}],"newsletterTitle":"Stay Inspired","newsletterText":"Subscribe to get updates on new designs, offers and embroidery inspirations."}}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
