import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { config } from './config.js';

export let supabase = null;

export function initSupabase() {
  if (!supabase) {
    supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }
}

// ==========================================
// MAPPINGS (Database <-> Frontend Models)
// ==========================================

function mapCategoryFromDB(c) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentCategoryId: c.parent_category_id,
    image: c.image,
    bannerImage: c.banner_image,
    description: c.description,
    featured: c.featured,
    visibility: c.visibility,
    seoTitle: c.seo_title,
    seoDescription: c.seo_description,
    displayOrder: c.display_order,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  };
}

function mapCategoryToDB(c) {
  const db = {
    name: c.name,
    slug: c.slug,
    image: c.image,
    banner_image: c.bannerImage,
    description: c.description,
    featured: !!c.featured,
    visibility: c.visibility !== false,
    seo_title: c.seoTitle || null,
    seo_description: c.seoDescription || null,
    display_order: parseInt(c.displayOrder || 1)
  };
  if (c.parentCategoryId !== undefined) {
    db.parent_category_id = c.parentCategoryId || null;
  }
  return db;
}

function mapCollectionFromDB(c) {
  if (!c) return null;
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description,
    image: c.image,
    bannerImage: c.banner_image,
    featured: c.featured,
    displayOrder: c.display_order,
    seoTitle: c.seo_title,
    seoDescription: c.seo_description,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  };
}

function mapCollectionToDB(c) {
  return {
    title: c.title,
    slug: c.slug,
    description: c.description,
    image: c.image,
    banner_image: c.bannerImage,
    featured: !!c.featured,
    display_order: parseInt(c.displayOrder || 1),
    seo_title: c.seoTitle || null,
    seo_description: c.seoDescription || null
  };
}

function mapProductFromDB(p) {
  if (!p) return null;
  return {
    id: p.id,
    slug: p.slug,
    code: p.code,
    title: p.title,
    description: p.description,
    price: Number(p.price),
    categoryId: p.category_id,
    collectionId: p.collection_id,
    category: p.categories ? p.categories.name : "",
    collection: p.collections ? p.collections.slug : "",
    image: p.image,
    gallery: p.gallery || [],
    designFile: p.design_file,
    width: p.width,
    height: p.height,
    backStitchCount: p.back_stitch_count,
    handStitchCount: p.hand_stitch_count,
    totalStitchCount: p.total_stitch_count,
    stitchCount: p.total_stitch_count,
    rpm: p.rpm,
    estimatedEmbroideryTime: p.estimated_time,
    threadColors: p.thread_colors,
    difficultyLevel: p.difficulty_level,
    recommendedFabrics: p.recommended_fabrics || [],
    formats: p.formats || [],
    machineFormats: (p.formats || []).map(f => f.format),
    featured: p.featured,
    bestSeller: p.best_seller,
    seoTitle: p.seo_title,
    seoDescription: p.seo_description,
    dimensions: `${p.width}mm x ${p.height}mm`,
    createdAt: p.created_at,
    updatedAt: p.updated_at
  };
}

function mapProductToDB(p) {
  return {
    slug: p.slug,
    code: p.code,
    title: p.title,
    description: p.description,
    price: Number(p.price),
    category_id: p.categoryId,
    collection_id: p.collectionId || null,
    image: p.image,
    gallery: p.gallery || [],
    design_file: p.designFile || null,
    width: parseInt(p.width || 100),
    height: parseInt(p.height || 100),
    back_stitch_count: parseInt(p.backStitchCount || 0),
    hand_stitch_count: parseInt(p.handStitchCount || 0),
    total_stitch_count: parseInt(p.totalStitchCount || p.stitchCount || 0),
    rpm: parseInt(p.rpm || 850),
    estimated_time: parseInt(p.estimatedEmbroideryTime || p.estimated_time || 0),
    thread_colors: parseInt(p.threadColors || 0),
    difficulty_level: p.difficultyLevel || "Intermediate",
    recommended_fabrics: p.recommendedFabrics || [],
    formats: p.formats || [],
    featured: !!p.featured,
    best_seller: !!p.bestSeller,
    seo_title: p.seoTitle || null,
    seo_description: p.seoDescription || null
  };
}

function mapCustomRequestFromDB(r) {
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    projectType: r.project_type,
    notes: r.notes,
    artworkAttachment: r.artwork_attachment,
    status: r.status,
    quoteAmount: r.quote_amount ? Number(r.quote_amount) : null,
    paymentStatus: r.payment_status,
    adminNotes: r.admin_notes,
    digitizedFile: r.digitized_file,
    referenceNumber: r.reference_number,
    statusNote: r.status_note,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function mapCustomRequestToDB(r) {
  return {
    user_id: r.userId || null,
    name: r.name,
    email: r.email,
    phone: r.phone || null,
    project_type: r.projectType || r.project_type || "",
    notes: r.notes,
    artwork_attachment: r.artworkAttachment || r.artwork_attachment || "",
    status: r.status || "Submitted",
    quote_amount: r.quoteAmount || null,
    payment_status: r.paymentStatus || "unpaid",
    admin_notes: r.adminNotes || null,
    digitized_file: r.digitizedFile || null,
    reference_number: r.referenceNumber || null,
    status_note: r.statusNote || null
  };
}

// ==========================================
// AUTH SERVICE
// ==========================================

export const authService = {
  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/'
      }
    });
    if (error) throw error;
    return data;
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Fetch user profile role
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileErr) throw profileErr;
    return {
      id: data.user.id,
      email: data.user.email,
      name: profile.name,
      role: profile.role,
      phone: profile.phone || "",
      addressLine1: profile.address_line_1 || "",
      addressLine2: profile.address_line_2 || "",
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "",
      postalCode: profile.postal_code || ""
    };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;
    return {
      id: user.id,
      email: user.email,
      name: profile.name,
      role: profile.role,
      phone: profile.phone || "",
      addressLine1: profile.address_line_1 || "",
      addressLine2: profile.address_line_2 || "",
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "",
      postalCode: profile.postal_code || ""
    };
  },

  async isAdmin() {
    const user = await this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  },

  async signUp(email, password, name, phone, addressFields = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    if (error) throw error;
    if (!data.user) throw new Error("Sign up failed");

    // Wait slightly or update directly
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        name: name,
        phone: phone || null,
        address_line_1: addressFields.addressLine1 || null,
        address_line_2: addressFields.addressLine2 || null,
        city: addressFields.city || null,
        state: addressFields.state || null,
        country: addressFields.country || null,
        postal_code: addressFields.postalCode || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.user.id);

    if (profileErr) {
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          name: name,
          email: email,
          role: 'customer',
          phone: phone || null,
          address_line_1: addressFields.addressLine1 || null,
          address_line_2: addressFields.addressLine2 || null,
          city: addressFields.city || null,
          state: addressFields.state || null,
          country: addressFields.country || null,
          postal_code: addressFields.postalCode || null,
          updated_at: new Date().toISOString()
        });
      if (upsertErr) throw upsertErr;
    }

    // Re-fetch the profile to get the actual DB-assigned role
    // (the trigger may have set 'admin' for approved emails)
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const assignedRole = finalProfile?.role || 'customer';

    return {
      id: data.user.id,
      email: data.user.email,
      name,
      role: assignedRole,
      phone,
      addressLine1: addressFields.addressLine1 || "",
      addressLine2: addressFields.addressLine2 || "",
      city: addressFields.city || "",
      state: addressFields.state || "",
      country: addressFields.country || "",
      postalCode: addressFields.postalCode || ""
    };

  },

  async updateProfile(name, phone, addressFields = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from('profiles')
      .update({
        name: name,
        phone: phone || null,
        address_line_1: addressFields.addressLine1 || null,
        address_line_2: addressFields.addressLine2 || null,
        city: addressFields.city || null,
        state: addressFields.state || null,
        country: addressFields.country || null,
        postal_code: addressFields.postalCode || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;
    return true;
  },

  async sendPasswordResetEmail(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/auth?mode=reset-confirm`
    });
    if (error) throw error;
    return true;
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return true;
  }
};

// ==========================================
// CATEGORY SERVICE
// ==========================================

export const categoryService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data.map(mapCategoryFromDB);
  },

  async getCategory(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapCategoryFromDB(data);
  },

  async createCategory(cat) {
    const dbCat = mapCategoryToDB(cat);
    // If id is provided as a UUID, use it, otherwise let DB generate it
    if (cat.id && cat.id.includes('-')) dbCat.id = cat.id;
    const { data, error } = await supabase
      .from('categories')
      .insert(dbCat)
      .select()
      .single();
    if (error) throw error;
    return mapCategoryFromDB(data);
  },

  async updateCategory(id, cat) {
    const dbCat = mapCategoryToDB(cat);
    const { data, error } = await supabase
      .from('categories')
      .update(dbCat)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapCategoryFromDB(data);
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ==========================================
// COLLECTION SERVICE
// ==========================================

export const collectionService = {
  async getCollections() {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data.map(mapCollectionFromDB);
  },

  async getCollection(id) {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return mapCollectionFromDB(data);
  },

  async createCollection(col) {
    const dbCol = mapCollectionToDB(col);
    if (col.id && col.id.includes('-')) dbCol.id = col.id;
    const { data, error } = await supabase
      .from('collections')
      .insert(dbCol)
      .select()
      .single();
    if (error) throw error;
    return mapCollectionFromDB(data);
  },

  async updateCollection(id, col) {
    const dbCol = mapCollectionToDB(col);
    const { data, error } = await supabase
      .from('collections')
      .update(dbCol)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapCollectionFromDB(data);
  },

  async deleteCollection(id) {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ==========================================
// PRODUCT SERVICE
// ==========================================

export const productService = {
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), collections(slug)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapProductFromDB);
  },

  async getProductBySlug(slug) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), collections(slug)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return mapProductFromDB(data);
  },

  async createProduct(prod) {
    const dbProd = mapProductToDB(prod);
    if (prod.id && prod.id.includes('-')) dbProd.id = prod.id;
    const { data, error } = await supabase
      .from('products')
      .insert(dbProd)
      .select()
      .single();
    if (error) throw error;
    return mapProductFromDB(data);
  },

  async updateProduct(id, prod) {
    const dbProd = mapProductToDB(prod);
    const { data, error } = await supabase
      .from('products')
      .update(dbProd)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapProductFromDB(data);
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ==========================================
// WEBSITE SETTINGS SERVICE
// ==========================================

export const settingsService = {
  async getWebsiteSettings() {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*');
    if (error) throw error;
    
    const settings = {};
    data.forEach((row) => {
      settings[row.key] = row.value;
    });
    return settings;
  },

  async updateWebsiteSettings(key, value) {
    const { error } = await supabase
      .from('website_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
};

// ==========================================
// CUSTOM REQUEST SERVICE
// ==========================================

export const customRequestService = {
  async getRequests() {
    const { data, error } = await supabase
      .from('custom_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(mapCustomRequestFromDB);
  },

  async createRequest(req) {
    const dbReq = mapCustomRequestToDB(req);
    dbReq.status_history = [
      {
        status: dbReq.status || 'Submitted',
        timestamp: new Date().toISOString()
      }
    ];
    const { data, error } = await supabase
      .from('custom_requests')
      .insert(dbReq)
      .select()
      .single();
    if (error) throw error;
    return mapCustomRequestFromDB(data);
  },

  async updateRequest(id, req) {
    const dbReq = mapCustomRequestToDB(req);
    const { data, error } = await supabase
      .from('custom_requests')
      .update(dbReq)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapCustomRequestFromDB(data);
  },

  async getUserCustomRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('custom_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapCustomRequestFromDB);
  }
};

// ==========================================
// TESTIMONIALS SERVICE
// ==========================================

export const testimonialService = {
  async getTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createTestimonial(test) {
    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        name: test.name,
        role: test.role,
        quote: test.quote,
        rating: Number(test.rating || 5.0),
        image: test.image || null,
        display_order: parseInt(test.displayOrder || test.display_order || 1)
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTestimonial(id, test) {
    const { data, error } = await supabase
      .from('testimonials')
      .update({
        name: test.name,
        role: test.role,
        quote: test.quote,
        rating: Number(test.rating || 5.0),
        image: test.image || null,
        display_order: parseInt(test.displayOrder || test.display_order || 1)
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTestimonial(id) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ==========================================
// FAQS SERVICE
// ==========================================

export const faqService = {
  async getFaqs() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createFaq(faq) {
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        display_order: parseInt(faq.displayOrder || faq.display_order || 1)
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateFaq(id, faq) {
    const { data, error } = await supabase
      .from('faqs')
      .update({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        display_order: parseInt(faq.displayOrder || faq.display_order || 1)
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteFaq(id) {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ==========================================
// ORDER SERVICE
// ==========================================

export const orderService = {
  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(title, image, code))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createOrder(order, items) {
    // 1. Insert order
    const { data: dbOrder, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: order.userId || null,
        total: Number(order.total),
        payment_status: order.paymentStatus || 'pending',
        status: order.status || 'pending',
        reference_number: order.referenceNumber || null,
        customer_name: order.customerName || null,
        customer_email: order.customerEmail || null,
        customer_phone: order.customerPhone || null,
        shipping_address: order.shippingAddress || null,
        order_type: order.orderType || 'design',
        notes: order.notes || null,
        status_history: [
          {
            status: order.status || 'pending',
            timestamp: new Date().toISOString()
          }
        ]
      })
      .select()
      .single();
      
    if (orderErr) throw orderErr;

    // 2. Insert order items
    const dbItems = items.map(item => ({
      order_id: dbOrder.id,
      product_id: item.productId,
      price: Number(item.price),
      format: item.format
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(dbItems);
      
    if (itemsErr) throw itemsErr;
    return dbOrder;
  },

  async updateOrder(id, order) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: order.paymentStatus,
        status: order.status
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getUserOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// ==========================================
// STORAGE SERVICE
// ==========================================

export const storageService = {
  async uploadMedia(file, bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (error) throw error;

    if (bucket === 'media-library') {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      return urlData.publicUrl;
    }
    return data.path;
  },

  async uploadImage(file, filename) {
    return this.uploadMedia(file, 'media-library', `images/${filename}`);
  },

  async uploadVideo(file, filename) {
    return this.uploadMedia(file, 'media-library', `videos/${filename}`);
  },

  async uploadDesignFile(file, filename) {
    return this.uploadMedia(file, 'digitized-designs', `designs/${filename}`);
  },

  async deleteMedia(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    if (error) throw error;
  }
};

// ==========================================
// TRACKING SERVICE
// ==========================================

export const trackingService = {
  async trackReference(ref) {
    if (!ref) return null;
    // Normalize: uppercase, remove spaces, trim
    const cleanRef = ref.trim().toUpperCase().replace(/\s+/g, '');
    const { data, error } = await supabase.rpc('track_by_reference', { ref_num: cleanRef });
    if (error) throw error;
    return data && data.found ? data : null;
  }
};
