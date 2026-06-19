-- 1. Profiles Table (RBAC / Auth integration)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT CHECK (role IN ('admin', 'customer')) DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image TEXT NOT NULL,
  banner_image TEXT NOT NULL,
  description TEXT NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  visibility BOOLEAN DEFAULT true NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  display_order INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  banner_image TEXT NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  display_order INTEGER DEFAULT 1 NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  design_file TEXT,
  
  -- Embroidery Specifications
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  back_stitch_count INTEGER DEFAULT 0 NOT NULL,
  hand_stitch_count INTEGER DEFAULT 0 NOT NULL,
  total_stitch_count INTEGER NOT NULL,
  rpm INTEGER DEFAULT 850 NOT NULL,
  estimated_time INTEGER NOT NULL,
  thread_colors INTEGER NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Intermediate' NOT NULL,
  recommended_fabrics TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  formats JSONB DEFAULT '[]'::JSONB NOT NULL,
  
  featured BOOLEAN DEFAULT false NOT NULL,
  best_seller BOOLEAN DEFAULT false NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Custom Requests Table
CREATE TABLE IF NOT EXISTS public.custom_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  project_type TEXT NOT NULL,
  notes TEXT NOT NULL,
  artwork_attachment TEXT NOT NULL,
  status TEXT CHECK (status IN ('Submitted', 'Quote Sent', 'Approved', 'Digitizing', 'Production', 'Delivered')) DEFAULT 'Submitted' NOT NULL,
  quote_amount NUMERIC(10, 2),
  payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid')) DEFAULT 'unpaid' NOT NULL,
  admin_notes TEXT,
  digitized_file TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Website Settings Table
CREATE TABLE IF NOT EXISTS public.website_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) on all public tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if requesting user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Allow public read of profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow admins all access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_admin());

-- Categories Policies
CREATE POLICY "Allow public read of categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Allow admins all access to categories" ON public.categories
  FOR ALL TO authenticated USING (public.is_admin());

-- Collections Policies
CREATE POLICY "Allow public read of collections" ON public.collections
  FOR SELECT USING (true);

CREATE POLICY "Allow admins all access to collections" ON public.collections
  FOR ALL TO authenticated USING (public.is_admin());

-- Products Policies
CREATE POLICY "Allow public read of products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Allow admins all access to products" ON public.products
  FOR ALL TO authenticated USING (public.is_admin());

-- Custom Requests Policies
CREATE POLICY "Allow users to view own custom requests" ON public.custom_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create custom requests" ON public.custom_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admins all access to custom requests" ON public.custom_requests
  FOR ALL TO authenticated USING (public.is_admin());

-- Website Settings Policies
CREATE POLICY "Allow public read of website settings" ON public.website_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow admins all access to website settings" ON public.website_settings
  FOR ALL TO authenticated USING (public.is_admin());

-- Trigger to automatically create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    CASE WHEN new.email = 'admin@godavari.com' THEN 'admin'::text ELSE 'customer'::text END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
