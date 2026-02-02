-- Complete fix for customers and customer_categories RLS policies
-- This migration ensures all tables work correctly with the anon key

-- ============================================
-- 1. FIX CUSTOMER_CATEGORIES TABLE
-- ============================================

-- Ensure customer_categories table exists
CREATE TABLE IF NOT EXISTS public.customer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    price_modifier_type TEXT NOT NULL DEFAULT 'retail' CHECK (price_modifier_type IN ('retail', 'wholesale', 'discount_percentage', 'custom')),
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on customer_categories
ALTER TABLE public.customer_categories ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for customer_categories
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'customer_categories' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.customer_categories', pol.policyname);
    END LOOP;
END $$;

-- Create permissive policies for customer_categories
CREATE POLICY "customer_categories_select" ON public.customer_categories FOR SELECT TO public USING (true);
CREATE POLICY "customer_categories_insert" ON public.customer_categories FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "customer_categories_update" ON public.customer_categories FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "customer_categories_delete" ON public.customer_categories FOR DELETE TO public USING (true);

-- Grant permissions
GRANT ALL ON public.customer_categories TO anon;
GRANT ALL ON public.customer_categories TO authenticated;
GRANT ALL ON public.customer_categories TO public;

-- Insert default categories if empty
INSERT INTO public.customer_categories (name, slug, description, color, price_modifier_type, discount_percentage)
SELECT * FROM (VALUES
    ('Standard', 'standard', 'Client standard avec prix de base', '#6B7280', 'retail', 0),
    ('Wholesale', 'wholesale', 'Client grossiste avec prix de gros', '#3B82F6', 'wholesale', 0),
    ('VIP', 'vip', 'Client VIP avec 10% de réduction', '#F59E0B', 'discount_percentage', 10),
    ('Staff', 'staff', 'Employé avec 20% de réduction', '#10B981', 'discount_percentage', 20)
) AS v(name, slug, description, color, price_modifier_type, discount_percentage)
WHERE NOT EXISTS (SELECT 1 FROM public.customer_categories LIMIT 1);

-- ============================================
-- 2. FIX CUSTOMERS TABLE
-- ============================================

-- Drop the foreign key constraint temporarily if it exists and causes issues
ALTER TABLE IF EXISTS public.customers DROP CONSTRAINT IF EXISTS customers_category_id_fkey;

-- Ensure customers table exists with all columns
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    customer_type TEXT NOT NULL DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale')),
    category_id UUID,
    loyalty_qr_code TEXT,
    membership_number TEXT,
    date_of_birth DATE,
    loyalty_tier TEXT DEFAULT 'bronze',
    loyalty_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    points_expiry_date DATE,
    preferred_language TEXT DEFAULT 'fr',
    tax_id TEXT,
    payment_terms INTEGER DEFAULT 30,
    credit_limit NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns (safe operations)
DO $$
BEGIN
    -- Add category_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'category_id') THEN
        ALTER TABLE public.customers ADD COLUMN category_id UUID;
    END IF;

    -- Add loyalty fields if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'loyalty_qr_code') THEN
        ALTER TABLE public.customers ADD COLUMN loyalty_qr_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'membership_number') THEN
        ALTER TABLE public.customers ADD COLUMN membership_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.customers ADD COLUMN date_of_birth DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'loyalty_tier') THEN
        ALTER TABLE public.customers ADD COLUMN loyalty_tier TEXT DEFAULT 'bronze';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'loyalty_points') THEN
        ALTER TABLE public.customers ADD COLUMN loyalty_points INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'lifetime_points') THEN
        ALTER TABLE public.customers ADD COLUMN lifetime_points INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'preferred_language') THEN
        ALTER TABLE public.customers ADD COLUMN preferred_language TEXT DEFAULT 'fr';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'tax_id') THEN
        ALTER TABLE public.customers ADD COLUMN tax_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'payment_terms') THEN
        ALTER TABLE public.customers ADD COLUMN payment_terms INTEGER DEFAULT 30;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'credit_limit') THEN
        ALTER TABLE public.customers ADD COLUMN credit_limit NUMERIC(12,2) DEFAULT 0;
    END IF;
END $$;

-- Re-add foreign key constraint (optional, won't fail if categories don't exist)
DO $$
BEGIN
    ALTER TABLE public.customers
    ADD CONSTRAINT customers_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES public.customer_categories(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_table THEN NULL;
END $$;

-- Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for customers
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'customers' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.customers', pol.policyname);
    END LOOP;
END $$;

-- Create permissive policies for customers
CREATE POLICY "customers_select" ON public.customers FOR SELECT TO public USING (true);
CREATE POLICY "customers_insert" ON public.customers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "customers_update" ON public.customers FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "customers_delete" ON public.customers FOR DELETE TO public USING (true);

-- Grant permissions
GRANT ALL ON public.customers TO anon;
GRANT ALL ON public.customers TO authenticated;
GRANT ALL ON public.customers TO public;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_category_id ON public.customers(category_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON public.customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON public.customers(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_customers_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customers_timestamp ON public.customers;
CREATE TRIGGER trigger_update_customers_timestamp
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_timestamp();

-- ============================================
-- 3. VERIFICATION
-- ============================================

DO $$
DECLARE
    customer_count INTEGER;
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO customer_count FROM public.customers;
    SELECT COUNT(*) INTO category_count FROM public.customer_categories;
    RAISE NOTICE 'Migration complete: % customers, % categories', customer_count, category_count;
END $$;
