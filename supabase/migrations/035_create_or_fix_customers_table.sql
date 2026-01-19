-- Create or fix customers table with all necessary columns
-- Run this after the diagnostic script to ensure the table is properly set up

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,

    -- Customer type and category
    customer_type TEXT NOT NULL DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale')),
    category_id UUID REFERENCES public.customer_categories(id) ON DELETE SET NULL,

    -- Loyalty fields
    loyalty_qr_code TEXT UNIQUE,
    membership_number TEXT UNIQUE,
    date_of_birth DATE,
    loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    loyalty_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    points_expiry_date DATE,
    preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('id', 'en', 'fr')),

    -- B2B specific fields
    tax_id TEXT,
    payment_terms INTEGER DEFAULT 30,
    credit_limit NUMERIC(12,2) DEFAULT 0,

    -- Status and metadata
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns if table already exists
DO $$
BEGIN
    -- Add category_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN category_id UUID REFERENCES public.customer_categories(id) ON DELETE SET NULL;
    END IF;

    -- Add loyalty_qr_code if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'loyalty_qr_code'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN loyalty_qr_code TEXT UNIQUE;
    END IF;

    -- Add membership_number if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'membership_number'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN membership_number TEXT UNIQUE;
    END IF;

    -- Add date_of_birth if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'date_of_birth'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN date_of_birth DATE;
    END IF;

    -- Add loyalty_tier if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'loyalty_tier'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum'));
    END IF;

    -- Add loyalty_points if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'loyalty_points'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN loyalty_points INTEGER DEFAULT 0;
    END IF;

    -- Add lifetime_points if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'lifetime_points'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN lifetime_points INTEGER DEFAULT 0;
    END IF;

    -- Add points_expiry_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'points_expiry_date'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN points_expiry_date DATE;
    END IF;

    -- Add preferred_language if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'preferred_language'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN preferred_language TEXT DEFAULT 'fr' CHECK (preferred_language IN ('id', 'en', 'fr'));
    END IF;

    -- Add tax_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'tax_id'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN tax_id TEXT;
    END IF;

    -- Add payment_terms if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'payment_terms'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN payment_terms INTEGER DEFAULT 30;
    END IF;

    -- Add credit_limit if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'customers' AND column_name = 'credit_limit'
    ) THEN
        ALTER TABLE public.customers
        ADD COLUMN credit_limit NUMERIC(12,2) DEFAULT 0;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_category ON public.customers(category_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_qr ON public.customers(loyalty_qr_code);
CREATE INDEX IF NOT EXISTS idx_customers_membership ON public.customers(membership_number);
CREATE INDEX IF NOT EXISTS idx_customers_type ON public.customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON public.customers(is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_customers_updated_at ON public.customers;
CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated to manage customers" ON public.customers;
DROP POLICY IF EXISTS "Allow anon to manage customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to manage customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to select customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to update customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to delete customers" ON public.customers;

-- Create new policies
CREATE POLICY "Allow public to select customers"
    ON public.customers FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public to insert customers"
    ON public.customers FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Allow public to update customers"
    ON public.customers FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public to delete customers"
    ON public.customers FOR DELETE
    TO public
    USING (true);

-- Grant permissions
GRANT ALL ON public.customers TO public;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;

-- Verify the setup
SELECT
    'Setup complete' as status,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'customers';
