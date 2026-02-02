-- Migration: 065_repair_shift_rpc.sql
-- Description: Repair/recreate shift RPC functions with correct signatures

-- Drop ALL versions of functions first (multiple signatures may exist)
DROP FUNCTION IF EXISTS public.get_user_open_shift(UUID);
DROP FUNCTION IF EXISTS public.get_terminal_open_shifts(VARCHAR);
DROP FUNCTION IF EXISTS public.open_shift(UUID, DECIMAL, VARCHAR, TEXT);
DROP FUNCTION IF EXISTS public.open_shift(UUID, VARCHAR, DECIMAL);
DROP FUNCTION IF EXISTS public.close_shift(UUID, DECIMAL, DECIMAL, TEXT);
DROP FUNCTION IF EXISTS public.close_shift(UUID);

-- Function: Get user's open shift
CREATE OR REPLACE FUNCTION public.get_user_open_shift(p_user_id UUID)
RETURNS SETOF public.pos_sessions AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.pos_sessions
    WHERE user_id = p_user_id
      AND status = 'open'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get all open shifts on a terminal
CREATE OR REPLACE FUNCTION public.get_terminal_open_shifts(p_terminal_id VARCHAR)
RETURNS SETOF public.pos_sessions AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.pos_sessions
    WHERE terminal_id = p_terminal_id
      AND status = 'open'
    ORDER BY opened_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Open a new shift (signature matches useShift.ts: p_user_id, p_opening_cash, p_terminal_id, p_notes)
CREATE OR REPLACE FUNCTION public.open_shift(
    p_user_id UUID,
    p_opening_cash DECIMAL,
    p_terminal_id VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Close any existing open shifts for this user
    UPDATE public.pos_sessions
    SET status = 'closed',
        closed_at = NOW()
    WHERE user_id = p_user_id
      AND status = 'open';

    -- Create new session
    INSERT INTO public.pos_sessions (
        user_id,
        terminal_id,
        opening_cash,
        notes,
        status,
        opened_at
    ) VALUES (
        p_user_id,
        COALESCE(p_terminal_id, 'POS-01'),
        p_opening_cash,
        p_notes,
        'open',
        NOW()
    ) RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Close a shift
CREATE OR REPLACE FUNCTION public.close_shift(
    p_session_id UUID,
    p_closing_cash DECIMAL DEFAULT 0,
    p_counted_cash DECIMAL DEFAULT 0,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.pos_sessions
    SET status = 'closed',
        closed_at = NOW(),
        closing_cash = p_closing_cash,
        counted_cash = p_counted_cash,
        notes = COALESCE(p_notes, notes)
    WHERE id = p_session_id
      AND status = 'open';

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to both anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_user_open_shift(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_terminal_open_shifts(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.open_shift(UUID, DECIMAL, VARCHAR, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.close_shift(UUID, DECIMAL, DECIMAL, TEXT) TO anon, authenticated;
