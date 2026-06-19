-- Add auth_provider column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

-- Update the handle_new_user trigger to populate auth_provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_provider TEXT;
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

  -- Extract provider from raw_app_meta_data
  v_provider := COALESCE(new.raw_app_meta_data->>'provider', 'email');

  INSERT INTO public.profiles (id, name, email, role, auth_provider)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    v_role,
    v_provider
  )
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        name = COALESCE(EXCLUDED.name, profiles.name),
        auth_provider = COALESCE(EXCLUDED.auth_provider, profiles.auth_provider),
        updated_at = TIMEZONE('utc'::text, NOW());

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retroactively set auth_provider for existing users
-- In Supabase, auth.users has raw_app_meta_data->>'provider'
UPDATE public.profiles p
SET auth_provider = COALESCE(u.raw_app_meta_data->>'provider', 'email')
FROM auth.users u
WHERE p.id = u.id;
