-- ============================================================
-- Phase 15: Enterprise Admin Provisioning
-- Approved admin emails automatically receive role = 'admin'
-- ============================================================

-- Step 1: Drop and recreate the handle_new_user trigger function
-- with multi-admin email support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Determine role based on approved admin emails
  IF new.email IN (
    'satishkumarkadali024@gmail.com',
    'godavaridesigner@gmail.com'
  ) THEN
    v_role := 'admin';
  ELSE
    v_role := 'customer';
  END IF;

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    v_role
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        name = COALESCE(EXCLUDED.name, profiles.name),
        updated_at = TIMEZONE('utc'::text, NOW());

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Retroactively promote any existing accounts with approved emails
-- that may have been created with role = 'customer' before this migration
UPDATE public.profiles
SET role = 'admin', updated_at = TIMEZONE('utc'::text, NOW())
WHERE email IN (
  'satishkumarkadali024@gmail.com',
  'godavaridesigner@gmail.com'
)
AND role != 'admin';

-- Step 3: Create a secure server-side function to get caller's role
-- This is called from the frontend and always returns the DB value
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN COALESCE(v_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users only
REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

-- Step 4: Ensure orders table has user_id linked to auth.users
-- (Confirm column exists with FK - safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN user_id UUID REFERENCES auth.users ON DELETE SET NULL;
  END IF;
END $$;

-- Step 5: Create index on orders.user_id for fast customer lookups
-- (Supports payment history, invoicing, and customer dashboard queries)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
