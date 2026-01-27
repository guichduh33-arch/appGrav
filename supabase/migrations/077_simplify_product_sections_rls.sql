-- ============================================
-- Simplify RLS Policies for product_sections
-- Issue: auth.role() check in WITH CHECK clause may fail in certain contexts
-- Solution: Use simple true checks for all authenticated users
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to product_sections" ON public.product_sections;
DROP POLICY IF EXISTS "Allow insert product_sections for authenticated users" ON public.product_sections;
DROP POLICY IF EXISTS "Allow update product_sections for authenticated users" ON public.product_sections;
DROP POLICY IF EXISTS "Allow delete product_sections for authenticated users" ON public.product_sections;

-- Ensure RLS is enabled
ALTER TABLE public.product_sections ENABLE ROW LEVEL SECURITY;

-- Simple policies for all authenticated users
CREATE POLICY "product_sections_select_policy"
    ON public.product_sections
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "product_sections_insert_policy"
    ON public.product_sections
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "product_sections_update_policy"
    ON public.product_sections
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "product_sections_delete_policy"
    ON public.product_sections
    FOR DELETE
    TO authenticated
    USING (true);
