-- ============================================================
-- Phase 16: Safe Idempotent Realtime Publication Enablement
-- Adds all core storefront tables to the supabase_realtime publication
-- ============================================================

DO $$
DECLARE
  t_name TEXT;
  tables_to_add TEXT[] := ARRAY['products', 'categories', 'collections', 'testimonials', 'faqs', 'website_settings'];
BEGIN
  -- Ensure publication exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    EXECUTE 'CREATE PUBLICATION supabase_realtime';
  END IF;

  -- Add each table to the publication if not already present
  FOREACH t_name IN ARRAY tables_to_add LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = t_name
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.' || quote_ident(t_name);
    END IF;
  END LOOP;
END $$;
