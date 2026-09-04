-- Allow public read of files inside storage buckets so images render on the website
DROP POLICY IF EXISTS "Public Read Storage" ON storage.objects;
CREATE POLICY "Public Read Storage"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('media-library', 'digitized-designs'));
