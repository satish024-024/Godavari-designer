-- ============================================================
-- MIGRATION: 20260904000000_payments_and_entitlements.sql
-- Description: Production-grade purchases, entitlements, webhooks, 
-- and atomic procedures for Razorpay standard checkout.
-- ============================================================

-- 1. Purchases Table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR' NOT NULL,
  status TEXT CHECK (status IN (
    'CREATED', 
    'AUTHORIZED', 
    'PAID', 
    'FAILED', 
    'CANCELLED', 
    'EXPIRED', 
    'REFUND_PENDING', 
    'REFUNDED', 
    'PARTIALLY_REFUNDED'
  )) DEFAULT 'CREATED' NOT NULL,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  payment_method TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  guest_session_id TEXT,
  guest_token_hash TEXT,
  notes JSONB DEFAULT '{}'::jsonb NOT NULL,
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON public.purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_razorpay_order_id ON public.purchases(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_razorpay_payment_id ON public.purchases(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_guest_token_hash ON public.purchases(guest_token_hash);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON public.purchases(created_at);

-- 2. Entitlements Table (Model A: Product access covers all machine formats)
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED')) DEFAULT 'PENDING' NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0 NOT NULL,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_purchase_product_entitlement UNIQUE (purchase_id, product_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_product_entitlement 
  ON public.entitlements(user_id, product_id) 
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_product_id ON public.entitlements(product_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_purchase_id ON public.entitlements(purchase_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_status ON public.entitlements(status);

-- 3. Payment Webhooks Table (Idempotent tracking)
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payload JSONB NOT NULL,
  status TEXT CHECK (status IN ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED')) DEFAULT 'RECEIVED' NOT NULL,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_id ON public.payment_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_order_id ON public.payment_webhooks(razorpay_order_id);

-- 4. Payment Support Tickets Table
CREATE TABLE IF NOT EXISTS public.payment_support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  order_reference TEXT,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED')) DEFAULT 'OPEN' NOT NULL,
  diagnosis JSONB DEFAULT '{}'::jsonb NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.payment_support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_purchase_id ON public.payment_support_tickets(purchase_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON public.payment_support_tickets(email);

-- 5. Atomic Procedure: activate_purchase_entitlement
CREATE OR REPLACE FUNCTION public.activate_purchase_entitlement(
  p_razorpay_order_id TEXT,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT,
  p_payment_method TEXT,
  p_guest_token_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
DECLARE
  v_purchase RECORD;
  v_entitlement RECORD;
  v_now TIMESTAMPTZ := TIMEZONE('utc'::text, NOW());
BEGIN
  -- 1. Select purchase with row lock
  SELECT * INTO v_purchase
  FROM public.purchases
  WHERE razorpay_order_id = p_razorpay_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PURCHASE_NOT_FOUND',
      'message', 'Purchase not found for order ' || p_razorpay_order_id
    );
  END IF;

  -- 2. If already PAID, return idempotent success
  IF v_purchase.status = 'PAID' THEN
    SELECT * INTO v_entitlement
    FROM public.entitlements
    WHERE purchase_id = v_purchase.id;

    RETURN jsonb_build_object(
      'success', true,
      'idempotent', true,
      'purchase_id', v_purchase.id,
      'product_id', v_purchase.product_id,
      'entitlement_id', v_entitlement.id,
      'status', 'PAID'
    );
  END IF;

  -- 3. Update purchase to PAID
  UPDATE public.purchases
  SET status = 'PAID',
      razorpay_payment_id = COALESCE(p_razorpay_payment_id, razorpay_payment_id),
      razorpay_signature = COALESCE(p_razorpay_signature, razorpay_signature),
      payment_method = COALESCE(p_payment_method, payment_method),
      guest_token_hash = COALESCE(p_guest_token_hash, guest_token_hash),
      paid_at = v_now,
      updated_at = v_now
  WHERE id = v_purchase.id;

  -- 4. Upsert Entitlement (ACTIVE)
  IF v_purchase.user_id IS NOT NULL THEN
    INSERT INTO public.entitlements (
      user_id,
      product_id,
      purchase_id,
      status,
      granted_at,
      download_count,
      created_at,
      updated_at
    )
    VALUES (
      v_purchase.user_id,
      v_purchase.product_id,
      v_purchase.id,
      'ACTIVE',
      v_now,
      0,
      v_now,
      v_now
    )
    ON CONFLICT (purchase_id, product_id)
    DO UPDATE SET
      status = 'ACTIVE',
      granted_at = v_now,
      updated_at = v_now
    RETURNING * INTO v_entitlement;
  ELSE
    INSERT INTO public.entitlements (
      user_id,
      product_id,
      purchase_id,
      status,
      granted_at,
      download_count,
      created_at,
      updated_at
    )
    VALUES (
      NULL,
      v_purchase.product_id,
      v_purchase.id,
      'ACTIVE',
      v_now,
      0,
      v_now,
      v_now
    )
    ON CONFLICT (purchase_id, product_id)
    DO UPDATE SET
      status = 'ACTIVE',
      granted_at = v_now,
      updated_at = v_now
    RETURNING * INTO v_entitlement;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'idempotent', false,
    'purchase_id', v_purchase.id,
    'product_id', v_purchase.product_id,
    'entitlement_id', v_entitlement.id,
    'status', 'PAID'
  );
END;
$func$;

-- 6. Atomic Procedure: atomic_increment_download_count
CREATE OR REPLACE FUNCTION public.atomic_increment_download_count(
  p_entitlement_id UUID
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
  UPDATE public.entitlements
  SET download_count = download_count + 1,
      last_downloaded_at = TIMEZONE('utc'::text, NOW()),
      updated_at = TIMEZONE('utc'::text, NOW())
  WHERE id = p_entitlement_id;
$func$;

-- 7. Row Level Security (RLS)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_support_tickets ENABLE ROW LEVEL SECURITY;

-- Purchases policies
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchases;
CREATE POLICY "Admins can view all purchases" ON public.purchases
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Entitlements policies
DROP POLICY IF EXISTS "Users can view own entitlements" ON public.entitlements;
CREATE POLICY "Users can view own entitlements" ON public.entitlements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all entitlements" ON public.entitlements;
CREATE POLICY "Admins can view all entitlements" ON public.entitlements
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Webhooks: Admins only
DROP POLICY IF EXISTS "Admins can view webhooks" ON public.payment_webhooks;
CREATE POLICY "Admins can view webhooks" ON public.payment_webhooks
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Support tickets: Users can create and view their own
DROP POLICY IF EXISTS "Users can create support tickets" ON public.payment_support_tickets;
CREATE POLICY "Users can create support tickets" ON public.payment_support_tickets
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own support tickets" ON public.payment_support_tickets;
CREATE POLICY "Users can view own support tickets" ON public.payment_support_tickets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage support tickets" ON public.payment_support_tickets;
CREATE POLICY "Admins can manage support tickets" ON public.payment_support_tickets
  FOR ALL TO authenticated
  USING (public.is_admin());
