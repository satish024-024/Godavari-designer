-- Migration to update descriptions and SEO metadata for Categories, Collections, and Products
-- This aligns existing production data with the high-quality content rewrite strategy.

-- 1. Update Categories
UPDATE public.categories SET
  description = 'Heirloom-quality bridal machine embroidery designs, intricate wedding lehenga borders, and couture blouse back-neck patterns. Meticulously digitized to ensure flawless stitching with gold zari and metallic threads on premium silks, velvets, and organza veils.',
  seo_title = 'Luxury Bridal & Wedding Lehenga Embroidery Designs | Godavari',
  seo_description = 'Explore heirloom bridal machine embroidery designs. Premium lehenga borders, blouse back-necks, and veil embroidery files in DST, PES, and EXP formats.'
WHERE slug = 'bridal';

UPDATE public.categories SET
  description = 'Exquisite designer blouse embroidery placement files, featuring detailed back-necks, front collars, and sleeve borders. Fully optimized computer embroidery designs compatible with Tajima, Brother, and other commercial sewing machines.',
  seo_title = 'Designer Blouse Embroidery Designs & Neck Patterns | Godavari',
  seo_description = 'Download luxury blouse neck designs, sleeve borders, and computer embroidery patterns. Compatible with all major machine formats.'
WHERE slug = 'blouses';

UPDATE public.categories SET
  description = 'Intricate, repeating machine embroidery borders and lace trims engineered for wedding sarees, dupattas, and heavy drapes. Offers seamless continuous loops that guarantee neat stitch sequences and zero overlapping errors.',
  seo_title = 'Luxury Saree Border Machine Embroidery Designs | Godavari',
  seo_description = 'High-quality saree border embroidery files. Elegant gold zari borders, temple borders, and lace trims for silk & organza sarees.'
WHERE slug = 'saree';

UPDATE public.categories SET
  description = 'Soft, skin-safe festive embroidery motifs and patterns designed for kids'' ethnic wear, frocks, sherwanis, and mini lehengas. Engineered with low stitch density and light fills to keep fabrics comfortable and flexible.',
  seo_title = 'Festive Kids Wear Machine Embroidery Patterns | Godavari',
  seo_description = 'Delicate, skin-safe festive embroidery designs for children. Cute frocks, kid lehengas, and ethnic sherwani motifs.'
WHERE slug = 'kids-wear';

UPDATE public.categories SET
  description = 'Dimensional floral motifs, botanical vine borders, and gold rose patterns. Digitized with sophisticated shading techniques and stitch directions to create elevated 3D textured effects on luxury apparel.',
  seo_title = 'Luxury Floral Machine Embroidery Patterns & Vines | Godavari',
  seo_description = 'Premium floral embroidery patterns, rose motifs, and gold vine borders for luxury boutique stitching.'
WHERE slug = 'floral-collection';

UPDATE public.categories SET
  description = 'Intricate bridal cutwork embroidery designs. Digitized with dense, secure satin stitch edges to serve as perfect fabric cutting guides, achieving a clean hollow lace look on boutique blouses.',
  seo_title = 'Bridal Cutwork Blouse Embroidery Designs | Godavari',
  seo_description = 'Intricate cutwork machine embroidery patterns. Exquisite back-neck cutouts and lace border files.'
WHERE slug = 'cutwork';

UPDATE public.categories SET
  description = 'Classic gold metallic thread zari work patterns. Authentic Indian motifs designed for high-density metallic thread stability, minimizing breaks on high-speed machines.',
  seo_title = 'Traditional Gold Zari Work Machine Embroidery | Godavari',
  seo_description = 'Couture gold metallic zari embroidery files. Premium motifs for wedding lehengas and festive blouses.'
WHERE slug = 'zari-work';

-- 2. Update Collections
UPDATE public.collections SET
  description = 'Heirloom-quality bridal machine embroidery designs, intricate wedding lehenga borders, and couture blouse back-neck patterns. Meticulously digitized to ensure flawless stitching with gold zari and metallic threads on premium silks, velvets, and organza veils.',
  seo_title = 'Bridal Collection Collection | Godavari',
  seo_description = 'Browse the premium bridal collection embroidery collection.'
WHERE slug = 'bridal';

UPDATE public.collections SET
  description = 'Exquisite designer blouse embroidery placement files, featuring detailed back-necks, front collars, and sleeve borders. Fully optimized computer embroidery designs compatible with Tajima, Brother, and other commercial sewing machines.',
  seo_title = 'Designer Blouses Collection | Godavari',
  seo_description = 'Browse the premium designer blouses embroidery collection.'
WHERE slug = 'blouses';

UPDATE public.collections SET
  description = 'Intricate, repeating machine embroidery borders and lace trims engineered for wedding sarees, dupattas, and heavy drapes. Offers seamless continuous loops that guarantee neat stitch sequences and zero overlapping errors.',
  seo_title = 'Saree Borders Collection | Godavari',
  seo_description = 'Browse the premium saree borders embroidery collection.'
WHERE slug = 'saree';

UPDATE public.collections SET
  description = 'Soft, skin-safe festive embroidery motifs and patterns designed for kids'' ethnic wear, frocks, sherwanis, and mini lehengas. Engineered with low stitch density and light fills to keep fabrics comfortable and flexible.',
  seo_title = 'Kids Wear Collection | Godavari',
  seo_description = 'Browse the premium kids wear embroidery collection.'
WHERE slug = 'kids';

UPDATE public.collections SET
  description = 'Dimensional floral motifs, botanical vine borders, and gold rose patterns. Digitized with sophisticated shading techniques and stitch directions to create elevated 3D textured effects on luxury apparel.',
  seo_title = 'Luxury Floral Collection | Godavari',
  seo_description = 'Browse the premium luxury floral embroidery collection.'
WHERE slug = 'floral';

-- 3. Update Products
UPDATE public.products SET
  description = 'A majestic royal peony embroidery motif meticulously digitized for high-end boutique blouses, designer kurtas, and decorative centerpieces. Features smooth stitch runs, optimized jump stitches, and premium shading depth to capture realistic floral elegance on silk, velvet, or organza.',
  seo_title = 'Royal Peony Floral Design Motif (GD-1028) | Godavari',
  seo_description = 'Download the Royal Peony machine embroidery design motif. Optimized for silk, velvet, and organza fabrics. Available in DST, PES, EXP, and JEF.'
WHERE slug = 'royal-peony-floral';

UPDATE public.products SET
  description = 'An heirloom-grade gold floral bloom embroidery pattern designed for bridal lehengas, heavy dupattas, and luxury wedding veils. Digitized for multi-directional metallic thread stability, minimizing thread breaks while maintaining a dense, rich 3D gold finish.',
  seo_title = 'Bridal Gold Bloom Lehenga Embroidery Design (GD-2041) | Godavari',
  seo_description = 'Premium bridal gold bloom machine embroidery design with 58,000 stitches. Perfect for wedding lehengas, veils, and heavy boutique wear.'
WHERE slug = 'bridal-gold-bloom';

UPDATE public.products SET
  description = 'A sleek, repeating vine border trailing embroidery design. Masterfully engineered for running borders on designer sarees, dupatta edges, and ethnic kurtis. The continuous seamless loop ensures zero overlaps and flawless stitching sequences.',
  seo_title = 'Designer Vine Border Saree Embroidery Design (GD-1877) | Godavari',
  seo_description = 'Buy repeating vine border machine embroidery pattern for boutique saree border stitching. Seamless continuous looping, optimized for running stitch borders.'
WHERE slug = 'designer-vine-border';

UPDATE public.products SET
  description = 'A regal, traditional paisley (buta) patch design featuring dense gold zari fill and delicate outline runs. Perfect for matching side panels on bridal lehengas, sherwani collars, and premium wedding ethnic wear.',
  seo_title = 'Regal Paisley Motif Lehenga Embroidery Pattern (GD-3102) | Godavari',
  seo_description = 'Intricate traditional regal paisley patch design. Dense zari gold embroidery file with 41,000 stitches, ideal for bridal and wedding couture.'
WHERE slug = 'regal-paisley-motif';

UPDATE public.products SET
  description = 'A playful, delicate floral garden motif designed specifically for children''s festive wear, frocks, lehengas, and tiny borders. Engineered with a low stitch density and soft fills to prevent fabric stiffening on lightweight kid-friendly fabrics.',
  seo_title = 'Kids Floral Garden Dress Embroidery Design (GD-4058) | Godavari',
  seo_description = 'Soft mini floral garden machine embroidery pattern for kids festive wear. Low density stitch structure for comfortable, soft drape on child fabrics.'
WHERE slug = 'kids-floral-garden';

UPDATE public.products SET
  description = 'A classic zari leaf trail continuous border design. Beautifully digitized for borders of designer sarees, lehenga hems, and sherwani cuffs. Standardized for high-speed embroidery machines with minimal color changes and trim commands.',
  seo_title = 'Zari Leaf Trail Saree Border Embroidery Design (GD-2766) | Godavari',
  seo_description = 'Get the zari leaf border machine embroidery design with 25,500 stitches. Optimized for high-speed boutique production on wedding sarees.'
WHERE slug = 'zari-leaf-trail';

UPDATE public.products SET
  description = 'A heavy cutwork back-neck design pattern for bridal blouses. Digitized with specialized satin stitch outlines and secure cut-out borders to guide precise fabric trimming, giving a flawless hollow lace effect on silk and georgette.',
  seo_title = 'Cutwork Elegance Blouse Back-Neck Embroidery (GD-3345) | Godavari',
  seo_description = 'Exquisite cutwork back-neck designer blouse machine embroidery file. Clean satin stitch edges for perfect cutout guides. Compatible with DST, PES, EXP.'
WHERE slug = 'cutwork-elegance';

UPDATE public.products SET
  description = 'A magnificent regal front-neck and collar embroidery placement. Features traditional Indian neckline curvatures and royal leaf motifs, with outlines structured to accept manual stone-fixing or beadwork overlays for a hybrid luxury finish.',
  seo_title = 'Royal Neckline Collar Machine Embroidery Pattern (GD-5120) | Godavari',
  seo_description = 'Regal front-neck collar embroidery design with 22,000 stitches. Indian boutique style placement template for kurtas and wedding blouses.'
WHERE slug = 'neckline-royal-design';
