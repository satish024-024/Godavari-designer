-- Drop the old status check constraint if it exists (names can be system-generated)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT conname
        FROM pg_constraint con
        INNER JOIN pg_class rel ON rel.oid = con.conrelid
        INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
          AND rel.relname = 'custom_requests'
          AND con.contype = 'c'
          AND con.conname LIKE '%status%'
    LOOP
        EXECUTE 'ALTER TABLE public.custom_requests DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END;
$$;

-- Add updated status check constraint supporting 'Guest Lead'
ALTER TABLE public.custom_requests ADD CONSTRAINT custom_requests_status_check
  CHECK (status IN ('Submitted', 'Quote Sent', 'Approved', 'Digitizing', 'Production', 'Delivered', 'Guest Lead'));

-- Replace RLS insert policy on custom_requests to allow anonymous/guest submissions
DROP POLICY IF EXISTS "Allow users to create custom requests" ON public.custom_requests;

CREATE POLICY "Allow public insert custom requests" ON public.custom_requests
  FOR INSERT TO public WITH CHECK (true);
