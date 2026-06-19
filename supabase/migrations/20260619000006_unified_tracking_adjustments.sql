-- Add reference_number, status_note, status_history, estimated_completion_date columns
ALTER TABLE public.custom_requests ADD COLUMN IF NOT EXISTS reference_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS custom_requests_ref_idx ON public.custom_requests (reference_number);

ALTER TABLE public.custom_requests ADD COLUMN IF NOT EXISTS status_note TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_note TEXT;

ALTER TABLE public.custom_requests ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::JSONB;

ALTER TABLE public.custom_requests ADD COLUMN IF NOT EXISTS estimated_completion_date DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_completion_date DATE;

-- Update constraints for custom_requests status
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

ALTER TABLE public.custom_requests ADD CONSTRAINT custom_requests_status_check
  CHECK (status IN ('Submitted', 'Quote Sent', 'Approved', 'Digitizing', 'Production', 'Delivered', 'Guest Lead', 'Rejected', 'Cancelled'));

-- Create the secure track_by_reference RPC function
CREATE OR REPLACE FUNCTION public.track_by_reference(ref_num TEXT)
RETURNS JSONB AS $$
DECLARE
  order_row RECORD;
  custom_row RECORD;
  result_json JSONB;
  items_json JSONB;
BEGIN
  -- 1. Search in orders table
  SELECT * INTO order_row FROM public.orders WHERE reference_number = ref_num;
  IF FOUND THEN
    -- Fetch associated order items safely with product details
    SELECT jsonb_agg(
      jsonb_build_object(
        'price', oi.price,
        'format', oi.format,
        'product', jsonb_build_object(
          'title', p.title,
          'image', p.image,
          'code', p.code,
          'total_stitch_count', p.total_stitch_count
        )
      )
    ) INTO items_json
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = order_row.id;

    result_json := jsonb_build_object(
      'found', true,
      'type', 'order',
      'reference_number', order_row.reference_number,
      'status', order_row.status,
      'status_note', order_row.status_note,
      'status_history', COALESCE(order_row.status_history, '[]'::jsonb),
      'estimated_completion_date', order_row.estimated_completion_date,
      'created_at', order_row.created_at,
      'total', order_row.total,
      'order_type', order_row.order_type,
      'items', COALESCE(items_json, '[]'::jsonb)
    );
    RETURN result_json;
  END IF;

  -- 2. Search in custom_requests table
  SELECT * INTO custom_row FROM public.custom_requests WHERE reference_number = ref_num;
  IF FOUND THEN
    result_json := jsonb_build_object(
      'found', true,
      'type', 'custom',
      'reference_number', custom_row.reference_number,
      'status', custom_row.status,
      'status_note', custom_row.status_note,
      'status_history', COALESCE(custom_row.status_history, '[]'::jsonb),
      'estimated_completion_date', custom_row.estimated_completion_date,
      'created_at', custom_row.created_at,
      'project_type', custom_row.project_type,
      'notes', custom_row.notes,
      'artwork_attachment', custom_row.artwork_attachment,
      'quote_amount', custom_row.quote_amount,
      'payment_status', custom_row.payment_status,
      'digitized_file', custom_row.digitized_file
    );
    RETURN result_json;
  END IF;

  -- 3. Return not found object
  RETURN jsonb_build_object('found', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
