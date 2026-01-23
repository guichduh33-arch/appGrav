-- =====================================================
-- Migration 047: Fix User Profiles RLS for PIN-based Auth
-- Description: Allow user management without Supabase Auth
-- Date: 2026-01-21
-- =====================================================

-- =====================================================
-- STEP 1: Drop existing restrictive policies on user_profiles
-- =====================================================

DROP POLICY IF EXISTS "select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "anon_read_active_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_manage_profiles" ON public.user_profiles;

-- =====================================================
-- STEP 2: Create new permissive policies for user_profiles
-- =====================================================

-- Allow anyone to read user profiles (needed for login screen)
DROP POLICY IF EXISTS "allow_read_user_profiles" ON public.user_profiles;
CREATE POLICY "allow_read_user_profiles" ON public.user_profiles
    FOR SELECT
    USING (true);

-- Allow insert for creating new users
DROP POLICY IF EXISTS "allow_insert_user_profiles" ON public.user_profiles;
CREATE POLICY "allow_insert_user_profiles" ON public.user_profiles
    FOR INSERT
    WITH CHECK (true);

-- Allow update for modifying users
DROP POLICY IF EXISTS "allow_update_user_profiles" ON public.user_profiles;
CREATE POLICY "allow_update_user_profiles" ON public.user_profiles
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow delete (soft delete via is_active)
DROP POLICY IF EXISTS "allow_delete_user_profiles" ON public.user_profiles;
CREATE POLICY "allow_delete_user_profiles" ON public.user_profiles
    FOR DELETE
    USING (true);

-- =====================================================
-- STEP 3: Fix user_roles RLS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;

-- Allow read on user_roles
DROP POLICY IF EXISTS "allow_read_user_roles" ON public.user_roles;
CREATE POLICY "allow_read_user_roles" ON public.user_roles
    FOR SELECT
    USING (true);

-- Allow insert on user_roles
DROP POLICY IF EXISTS "allow_insert_user_roles" ON public.user_roles;
CREATE POLICY "allow_insert_user_roles" ON public.user_roles
    FOR INSERT
    WITH CHECK (true);

-- Allow update on user_roles
DROP POLICY IF EXISTS "allow_update_user_roles" ON public.user_roles;
CREATE POLICY "allow_update_user_roles" ON public.user_roles
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow delete on user_roles
DROP POLICY IF EXISTS "allow_delete_user_roles" ON public.user_roles;
CREATE POLICY "allow_delete_user_roles" ON public.user_roles
    FOR DELETE
    USING (true);

-- =====================================================
-- STEP 4: Verify RLS is enabled
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Grant permissions
-- =====================================================

GRANT ALL ON public.user_profiles TO anon;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_roles TO anon;
GRANT ALL ON public.user_roles TO authenticated;

-- =====================================================
-- Verification
-- =====================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM pg_policies WHERE tablename = 'user_profiles';
    RAISE NOTICE 'user_profiles has % RLS policies', v_count;

    SELECT COUNT(*) INTO v_count FROM pg_policies WHERE tablename = 'user_roles';
    RAISE NOTICE 'user_roles has % RLS policies', v_count;
END $$;
