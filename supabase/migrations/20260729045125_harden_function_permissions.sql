-- Trigger functions are invoked by Postgres, not directly by the Data API.
ALTER FUNCTION public.handle_new_user() SET search_path = public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- This helper is not used by the frontend; keep it unavailable until a caller
-- explicitly needs it.
ALTER FUNCTION public.get_my_role() SET search_path = public;
REVOKE ALL ON FUNCTION public.get_my_role() FROM PUBLIC, anon, authenticated;

-- The function is used inside RLS policies and must be callable only by the
-- authenticated database role.
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Reference tracking is intentionally public, but lock its lookup path.
ALTER FUNCTION public.track_by_reference(text) SET search_path = public;
