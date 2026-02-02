-- ============================================
-- Fix RLS Policies for product_sections
-- Issue: Old policy checked obsolete user_profiles.role field
-- Solution: Use simple authenticated check like other config tables
-- ============================================

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Authenticated users can read product_sections" ON public.product_sections;
DROP POLICY IF EXISTS "Admins can manage product_sections" ON public.product_sections;

-- Ensure RLS is enabled
ALTER TABLE public.product_sections ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow read access to product_sections"
    ON public.product_sections
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow all authenticated users to insert
CREATE POLICY "Allow insert product_sections for authenticated users"
    ON public.product_sections
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to update
CREATE POLICY "Allow update product_sections for authenticated users"
    ON public.product_sections
    FOR UPDATE
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to delete
CREATE POLICY "Allow delete product_sections for authenticated users"
    ON public.product_sections
    FOR DELETE
    TO authenticated
    USING (auth.role() = 'authenticated');
