-- Migration: 068_fix_roles_rls.sql
-- Description: Fix RLS policies for roles table to allow public read access

-- =====================================================
-- STEP 1: Drop potentially conflicting policies on roles
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.roles;
DROP POLICY IF EXISTS "allow_read_roles" ON public.roles;

-- =====================================================
-- STEP 2: Create fully permissive read policy for roles
-- =====================================================

CREATE POLICY "allow_read_roles" ON public.roles
    FOR SELECT
    USING (true);

CREATE POLICY "allow_insert_roles" ON public.roles
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "allow_update_roles" ON public.roles
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_delete_roles" ON public.roles
    FOR DELETE
    USING (true);

-- =====================================================
-- STEP 3: Ensure RLS is enabled but permissive
-- =====================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Grant permissions
-- =====================================================

GRANT ALL ON public.roles TO anon;
GRANT ALL ON public.roles TO authenticated;

-- =====================================================
-- STEP 5: Verify data exists
-- =====================================================

DO $$
DECLARE
    v_role_count INTEGER;
    v_user_count INTEGER;
    v_user_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_role_count FROM public.roles;
    RAISE NOTICE 'Total roles: %', v_role_count;

    SELECT COUNT(*) INTO v_user_count FROM public.user_profiles WHERE is_active = true;
    RAISE NOTICE 'Total active users: %', v_user_count;

    SELECT COUNT(*) INTO v_user_role_count FROM public.user_roles;
    RAISE NOTICE 'Total user_roles entries: %', v_user_role_count;
END $$;
