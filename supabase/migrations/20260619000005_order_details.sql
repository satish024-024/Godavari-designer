-- Add details columns to public.orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reference_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'design' NOT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Drop constraints if they exist or recreate
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_type_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_order_type_check CHECK (order_type IN ('design', 'custom'));

-- Re-enable RLS policy permissions to allow public inserts (supporting guest checkout)
DROP POLICY IF EXISTS "Allow users to create own orders" ON public.orders;
CREATE POLICY "Allow users to create own orders" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to create own order items" ON public.order_items;
CREATE POLICY "Allow users to create own order items" ON public.order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);
