-- Verification script for customer loyalty system
-- Run this to check if tables and policies exist

-- Check if tables exist
SELECT
    'customer_categories' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'customer_categories'
    ) as table_exists;

SELECT
    'customer_category_prices' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'customer_category_prices'
    ) as table_exists;

-- Check RLS status
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('customer_categories', 'customer_category_prices')
ORDER BY tablename;

-- Check existing policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('customer_categories', 'customer_category_prices')
ORDER BY tablename, policyname;

-- Check if there's data in customer_categories
SELECT
    COUNT(*) as total_categories,
    COUNT(CASE WHEN is_active THEN 1 END) as active_categories
FROM public.customer_categories;

-- Sample query to test permissions (this is what the frontend does)
SELECT id, name, slug, description, color, price_modifier_type, discount_percentage, is_active
FROM public.customer_categories
ORDER BY name
LIMIT 5;
