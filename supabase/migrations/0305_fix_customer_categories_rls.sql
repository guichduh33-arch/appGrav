-- Fix RLS policies for customer categories
-- Run this if you're getting permission errors when loading customer categories

-- Enable RLS on customer_categories if not already enabled
ALTER TABLE public.customer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_category_prices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated to manage customer_categories" ON public.customer_categories;
DROP POLICY IF EXISTS "Allow anon to manage customer_categories" ON public.customer_categories;
DROP POLICY IF EXISTS "Allow public to manage customer_categories" ON public.customer_categories;

DROP POLICY IF EXISTS "Allow authenticated to manage customer_category_prices" ON public.customer_category_prices;
DROP POLICY IF EXISTS "Allow anon to manage customer_category_prices" ON public.customer_category_prices;
DROP POLICY IF EXISTS "Allow public to manage customer_category_prices" ON public.customer_category_prices;

-- Create permissive policies for public access
-- Customer Categories
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

-- Customer Category Prices
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

-- Grant necessary permissions
GRANT ALL ON public.customer_categories TO public;
GRANT ALL ON public.customer_category_prices TO public;

-- Verify the fix
SELECT
    'customer_categories' as table_name,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'customer_categories'
UNION ALL
SELECT
    'customer_category_prices' as table_name,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'customer_category_prices';
