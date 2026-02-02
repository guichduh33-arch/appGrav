-- Migration: 071_fix_rpc_permissions.sql
-- Description: Ensure all RPC functions have correct permissions for anon/authenticated roles

-- Grant execute on PIN verification functions
GRANT EXECUTE ON FUNCTION public.verify_user_pin(UUID, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_user_pin(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_manager_pin(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_manager_pin(VARCHAR) TO authenticated;

-- Grant execute on shift functions
GRANT EXECUTE ON FUNCTION public.get_user_open_shift(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_open_shift(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.open_shift(UUID, DECIMAL, VARCHAR, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.open_shift(UUID, DECIMAL, VARCHAR, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_shift(UUID, DECIMAL, DECIMAL, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.close_shift(UUID, DECIMAL, DECIMAL, TEXT) TO authenticated;

-- Grant select on tables needed for verification
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.roles TO anon;
GRANT SELECT ON public.roles TO authenticated;

-- Grant insert/update on pos_sessions for shift operations
GRANT SELECT, INSERT, UPDATE ON public.pos_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.pos_sessions TO authenticated;

-- Note: set_user_pin function may not exist, skip granting

-- Verify the functions are accessible
DO $$
DECLARE
    v_result BOOLEAN;
BEGIN
    -- Test verify_user_pin function with Admin (ID: a1110000-0000-0000-0000-000000000005, PIN: 9999)
    SELECT public.verify_user_pin('a1110000-0000-0000-0000-000000000005'::UUID, '9999') INTO v_result;

    IF v_result = true THEN
        RAISE NOTICE 'verify_user_pin function test: PASSED';
    ELSE
        RAISE NOTICE 'verify_user_pin function test: FAILED (returned false)';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'verify_user_pin function test: ERROR - %', SQLERRM;
END $$;
