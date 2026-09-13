/**
 * Sanity Cloud Direct Client
 * Project: 6l7i886u | Dataset: production
 * Directly queries Sanity Content Lake for real-time storefront reflection.
 */

const SANITY_PROJECT_ID = '6l7i886u';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = 'v2024-01-01';

const SANITY_QUERY_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

export async function fetchSanityLake() {
  const groqQuery = `{
    "products": *[_type == "product"] | order(_createdAt desc) {
      _id,
      title,
      code,
      "slug": slug.current,
      price,
      category,
      "image": image.asset->url,
      "gallery": gallery[].asset->url,
      "designFile": designFile.asset->url,
      "designFileName": coalesce(designFileName, designFile.asset->originalFilename),
      "sizes": sizes[]{
        size,
        format,
        "fileUrl": file.asset->url,
        "fileName": file.asset->originalFilename
      },
      stitchCount,
      hoopSize,
      threadColors,
      description,
      _createdAt,
      _updatedAt
    },
    "categories": *[_type == "category"] | order(displayOrder asc) {
      _id,
      title,
      "name": title,
      "slug": slug.current,
      description,
      featured,
      displayOrder,
      "image": image.asset->url,
      "bannerImage": bannerImage.asset->url
    },
    "collections": *[_type == "collection"] | order(displayOrder asc) {
      _id,
      title,
      "slug": slug.current,
      description,
      featured,
      displayOrder,
      "image": image.asset->url,
      "bannerImage": bannerImage.asset->url
    },
    "testimonials": *[_type == "testimonial"] | order(_createdAt desc) {
      _id,
      name,
      role,
      boutiqueName,
      location,
      content,
      rating,
      "avatar": avatar.asset->url
    },
    "faqs": *[_type == "faq"] | order(order asc) {
      _id,
      question,
      answer,
      category,
      order
    },
    "siteContent": *[_type == "siteContent"][0] {
      brandName,
      tagline,
      heroHeadline,
      heroSubheadline,
      ctaTitle,
      ctaSubtitle,
      announcementBar
    },
    "settings": *[_type == "settings"][0] {
      storeName,
      supportEmail,
      supportPhone,
      whatsappNumber,
      instagramHandle,
      currency
    }
  }`;

  try {
    const url = `${SANITY_QUERY_URL}?query=${encodeURIComponent(groqQuery)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Keep cache fresh so Sanity edits immediately reflect on storefront
      cache: 'no-cache'
    });

    if (!res.ok) {
      console.warn(`Sanity API error (${res.status}):`, await res.text().catch(() => ''));
      return null;
    }

    const data = await res.json();
    return data.result || null;
  } catch (err) {
    console.warn('Failed to query Sanity Content Lake:', err);
    return null;
  }
}

/**
 * Maps Sanity product document into storefront product structure
 */
export function mapSanityProduct(p) {
  if (!p) return null;
  const rawId = p._id || `prod_${p.slug || Date.now()}`;
  return {
    id: rawId,
    _id: rawId,
    slug: p.slug || p._id,
    code: p.code || 'GD-COMMERCIAL',
    title: p.title || 'Untitled Embroidery Design',
    description: p.description || '',
    price: Number(p.price || 0),
    category: p.category || 'Blouse Designs',
    categoryId: p.category ? `category_${p.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : 'category_blouses',
    image: p.image || '/banner.jpeg',
    gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : (p.image ? [p.image] : ['/banner.jpeg']),
    designFile: p.designFile || '',
    designFileName: p.designFileName || '',
    sizes: p.sizes || [],
    stitchCount: p.stitchCount || 45000,
    totalStitchCount: p.stitchCount || 45000,
    hoopSize: p.hoopSize || '200mm x 300mm',
    threadColors: p.threadColors || 5,
    formats: [
      { format: 'DST' },
      { format: 'PES' }
    ],
    machineFormats: ['DST', 'PES'],
    difficultyLevel: 'Commercial Grade',
    featured: true,
    bestSeller: false,
    source: 'sanity'
  };
}
