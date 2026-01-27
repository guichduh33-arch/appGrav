-- Migration: 066_add_pos_sessions_user_id.sql
-- Description: Ensure user_id column exists on pos_sessions and fix RPC functions

-- Step 1: Add user_id column if it doesn't exist
ALTER TABLE public.pos_sessions
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Step 2: Add status column if it doesn't exist
ALTER TABLE public.pos_sessions
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'open';

-- Step 3: Add terminal_id column if it doesn't exist
ALTER TABLE public.pos_sessions
ADD COLUMN IF NOT EXISTS terminal_id VARCHAR(50);

-- Step 4: Add notes column if it doesn't exist
ALTER TABLE public.pos_sessions
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Step 5: Add counted_cash column if it doesn't exist
ALTER TABLE public.pos_sessions
ADD COLUMN IF NOT EXISTS counted_cash DECIMAL(12,2);

-- Step 6: Populate user_id from opened_by for existing records
UPDATE public.pos_sessions
SET user_id = opened_by
WHERE user_id IS NULL AND opened_by IS NOT NULL;

-- Step 7: Add FK constraint if not exists (may fail silently if exists)
DO $$
BEGIN
    ALTER TABLE public.pos_sessions
    ADD CONSTRAINT pos_sessions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Step 8: Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_pos_sessions_user_id ON public.pos_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON public.pos_sessions(status);

-- Step 9: Re-create RPC functions with correct column references
DROP FUNCTION IF EXISTS public.get_user_open_shift(UUID);
DROP FUNCTION IF EXISTS public.get_terminal_open_shifts(VARCHAR);
DROP FUNCTION IF EXISTS public.open_shift(UUID, DECIMAL, VARCHAR, TEXT);
DROP FUNCTION IF EXISTS public.close_shift(UUID, DECIMAL, DECIMAL, TEXT);

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

-- Function: Open a new shift
CREATE OR REPLACE FUNCTION public.open_shift(
    p_user_id UUID,
    p_opening_cash DECIMAL,
    p_terminal_id VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_session_number VARCHAR(50);
BEGIN
    -- Generate session number
    v_session_number := 'SHIFT-' || to_char(NOW(), 'YYYYMMDD-HH24MISS');

    -- Close any existing open shifts for this user
    UPDATE public.pos_sessions
    SET status = 'closed',
        closed_at = NOW()
    WHERE user_id = p_user_id
      AND status = 'open';

    -- Create new session
    INSERT INTO public.pos_sessions (
        session_number,
        user_id,
        opened_by,
        terminal_id,
        opening_cash,
        notes,
        status,
        opened_at
    ) VALUES (
        v_session_number,
        p_user_id,
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_open_shift(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_terminal_open_shifts(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.open_shift(UUID, DECIMAL, VARCHAR, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.close_shift(UUID, DECIMAL, DECIMAL, TEXT) TO anon, authenticated;
