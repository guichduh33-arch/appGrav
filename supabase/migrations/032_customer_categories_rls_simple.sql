-- Simple fix for customer_categories RLS policies
-- This script safely adds missing policies without conflicts

-- First, check and enable RLS
DO $$
BEGIN
    -- Enable RLS if not enabled
    ALTER TABLE public.customer_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.customer_category_prices ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if already enabled
END $$;

-- Drop only the specific policies we're about to create
DROP POLICY IF EXISTS "Allow public to select customer_categories" ON public.customer_categories;
DROP POLICY IF EXISTS "Allow public to insert customer_categories" ON public.customer_categories;
DROP POLICY IF EXISTS "Allow public to update customer_categories" ON public.customer_categories;
DROP POLICY IF EXISTS "Allow public to delete customer_categories" ON public.customer_categories;

DROP POLICY IF EXISTS "Allow public to select customer_category_prices" ON public.customer_category_prices;
DROP POLICY IF EXISTS "Allow public to insert customer_category_prices" ON public.customer_category_prices;
DROP POLICY IF EXISTS "Allow public to update customer_category_prices" ON public.customer_category_prices;
DROP POLICY IF EXISTS "Allow public to delete customer_category_prices" ON public.customer_category_prices;

-- Create new policies
CREATE POLICY "Allow public to select customer_categories"
    ON public.customer_categories FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public to insert customer_categories"
    ON public.customer_categories FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Allow public to update customer_categories"
    ON public.customer_categories FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public to delete customer_categories"
    ON public.customer_categories FOR DELETE
    TO public
    USING (true);

CREATE POLICY "Allow public to select customer_category_prices"
    ON public.customer_category_prices FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public to insert customer_category_prices"
    ON public.customer_category_prices FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Allow public to update customer_category_prices"
    ON public.customer_category_prices FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public to delete customer_category_prices"
    ON public.customer_category_prices FOR DELETE
    TO public
    USING (true);

-- Verify
SELECT
    tablename,
    policyname
FROM pg_policies
WHERE tablename IN ('customer_categories', 'customer_category_prices')
ORDER BY tablename, policyname;
