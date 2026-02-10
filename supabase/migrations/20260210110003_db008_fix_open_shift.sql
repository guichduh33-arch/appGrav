-- =====================================================
-- DB-008: Fix open_shift() function
-- =====================================================
-- Problems:
-- 1. Uses p_user_id parameter from client (can be spoofed) instead of auth.uid()
-- 2. Generates RANDOM() session_number bypassing the generate_session_number() trigger
--
-- Fixes:
-- 1. Use auth.uid() to get the real caller identity
-- 2. Let session_number be NULL so the BEFORE INSERT trigger generates it
-- 3. Keep p_terminal_id and p_opening_cash as parameters
-- =====================================================

-- Drop old signatures to avoid overload conflicts
DROP FUNCTION IF EXISTS public.open_shift(UUID, VARCHAR, DECIMAL);
DROP FUNCTION IF EXISTS public.open_shift(UUID, DECIMAL, VARCHAR, TEXT);

CREATE OR REPLACE FUNCTION public.open_shift(
    p_opening_cash DECIMAL,
    p_terminal_id VARCHAR,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auth_user_id UUID;
    v_user_profile_id UUID;
    v_session_id UUID;
    v_session_number VARCHAR(50);
    v_user_name VARCHAR(200);
BEGIN
    -- SECURITY: Get the actual caller's identity from auth context
    v_auth_user_id := auth.uid();

    IF v_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get user profile ID and name
    SELECT id, COALESCE(display_name, name)
    INTO v_user_profile_id, v_user_name
    FROM public.user_profiles
    WHERE auth_user_id = v_auth_user_id;

    IF v_user_profile_id IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    -- Check if user already has an open shift
    IF EXISTS (
        SELECT 1 FROM public.pos_sessions
        WHERE (user_id = v_user_profile_id OR opened_by = v_user_profile_id)
          AND status = 'open'
    ) THEN
        RAISE EXCEPTION 'User already has an open shift';
    END IF;

    -- Create new session (session_number = NULL lets generate_session_number() trigger fill it)
    INSERT INTO public.pos_sessions (
        id,
        user_id,
        opened_by,
        terminal_id_str,
        status,
        opened_at,
        opening_cash,
        expected_cash,
        expected_qris,
        expected_edc,
        total_sales,
        transaction_count,
        notes
    )
    VALUES (
        gen_random_uuid(),
        v_user_profile_id,
        v_user_profile_id,
        p_terminal_id,
        'open',
        NOW(),
        p_opening_cash,
        p_opening_cash,
        0,
        0,
        0,
        0,
        p_notes
    )
    RETURNING id, session_number INTO v_session_id, v_session_number;

    RETURN jsonb_build_object(
        'session_id', v_session_id,
        'session_number', v_session_number,
        'user_name', v_user_name,
        'terminal_id', p_terminal_id,
        'opening_cash', p_opening_cash,
        'status', 'open'
    );
END;
$$;

-- Grant execute permission (new signature without p_user_id)
GRANT EXECUTE ON FUNCTION public.open_shift(DECIMAL, VARCHAR, TEXT) TO authenticated;

COMMENT ON FUNCTION public.open_shift(DECIMAL, VARCHAR, TEXT) IS 'Opens a new POS shift. DB-008: Uses auth.uid() instead of client-provided user_id. Lets generate_session_number() trigger handle session numbering.';
