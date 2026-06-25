-- Ensure the storage buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('media-library', 'media-library', true),
  ('digitized-designs', 'digitized-designs', true)
ON CONFLICT (id) DO UPDATE 
SET public = EXCLUDED.public;

-- Drop existing storage policies if they exist to avoid duplicate conflicts
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

-- Allow public read access to all files in media-library and digitized-designs buckets
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('media-library', 'digitized-designs'));

-- Allow public/admin insert access to all files in media-library and digitized-designs buckets
CREATE POLICY "Public Insert Access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('media-library', 'digitized-designs'));

-- Allow public/admin update access
CREATE POLICY "Public Update Access" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('media-library', 'digitized-designs'));

-- Allow public/admin delete access
CREATE POLICY "Public Delete Access" ON storage.objects
  FOR DELETE USING (bucket_id IN ('media-library', 'digitized-designs'));
