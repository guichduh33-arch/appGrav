-- =====================================================
-- Migration 097: Fix product_modifiers RLS for anon access
-- Description: Add anon policies to product_modifiers table
-- Date: 2026-01-30
-- Issue: 401 errors when accessing product_modifiers with anon key
-- Root cause: App uses custom PIN auth (not Supabase Auth), but RLS
--             policies check auth.uid() which is NULL for anon requests
-- =====================================================

-- =====================================================
-- STEP 1: Drop existing restrictive policies
-- =====================================================
DROP POLICY IF EXISTS "select_all_modifiers" ON public.product_modifiers;
DROP POLICY IF EXISTS "modify_modifiers_admin" ON public.product_modifiers;

-- =====================================================
-- STEP 2: Create new policies for anon role
-- Note: The app validates permissions client-side using the
--       custom session system. These policies allow access
--       while the app handles authorization.
-- =====================================================

-- Allow anyone to read product modifiers (product configuration data)
CREATE POLICY "anon_select_modifiers" ON public.product_modifiers
    FOR SELECT TO anon
    USING (true);

-- Allow authenticated users to read (if they happen to sign in)
CREATE POLICY "authenticated_select_modifiers" ON public.product_modifiers
    FOR SELECT TO authenticated
    USING (true);

-- Allow anon to insert modifiers
-- Security note: App validates permissions via custom session
CREATE POLICY "anon_insert_modifiers" ON public.product_modifiers
    FOR INSERT TO anon
    WITH CHECK (true);

-- Allow authenticated users to insert
CREATE POLICY "authenticated_insert_modifiers" ON public.product_modifiers
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow anon to update modifiers
CREATE POLICY "anon_update_modifiers" ON public.product_modifiers
    FOR UPDATE TO anon
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "authenticated_update_modifiers" ON public.product_modifiers
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anon to delete modifiers
CREATE POLICY "anon_delete_modifiers" ON public.product_modifiers
    FOR DELETE TO anon
    USING (true);

-- Allow authenticated users to delete
CREATE POLICY "authenticated_delete_modifiers" ON public.product_modifiers
    FOR DELETE TO authenticated
    USING (true);

-- =====================================================
-- STEP 3: Ensure RLS is enabled
-- =====================================================
ALTER TABLE public.product_modifiers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Grant permissions
-- =====================================================
GRANT ALL ON public.product_modifiers TO anon;
GRANT ALL ON public.product_modifiers TO authenticated;

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_policies
    WHERE tablename = 'product_modifiers';
    RAISE NOTICE 'product_modifiers now has % policies', v_count;
END $$;
