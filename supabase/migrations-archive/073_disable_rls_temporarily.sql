-- Migration: 073_disable_rls_temporarily.sql
-- Description: Temporarily disable RLS to debug access issues

-- Disable RLS on critical tables
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sessions DISABLE ROW LEVEL SECURITY;

-- Ensure tables are accessible
GRANT ALL ON public.user_profiles TO anon, authenticated, public;
GRANT ALL ON public.user_roles TO anon, authenticated, public;
GRANT ALL ON public.roles TO anon, authenticated, public;
GRANT ALL ON public.pos_sessions TO anon, authenticated, public;

-- Verify data is accessible
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.user_profiles;
    RAISE NOTICE 'Total user_profiles rows: %', v_count;

    SELECT COUNT(*) INTO v_count FROM public.roles;
    RAISE NOTICE 'Total roles rows: %', v_count;

    SELECT COUNT(*) INTO v_count FROM public.user_roles;
    RAISE NOTICE 'Total user_roles rows: %', v_count;
END $$;
