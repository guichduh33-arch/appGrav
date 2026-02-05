-- =====================================================
-- Migration: Add Missing Shift Columns and Functions
-- Date: 2026-02-05
-- Description: Adds missing columns to pos_sessions,
--              and creates open_shift, close_shift, and
--              related RPC functions
-- =====================================================

-- =====================================================
-- PART 1: Add missing columns to pos_sessions
-- =====================================================

-- Add user_id column (alias for opened_by for compatibility)
ALTER TABLE public.pos_sessions
    ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update user_id from opened_by where null
UPDATE public.pos_sessions SET user_id = opened_by WHERE user_id IS NULL AND opened_by IS NOT NULL;

-- Add expected payment columns
ALTER TABLE public.pos_sessions
    ADD COLUMN IF NOT EXISTS expected_qris DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS expected_edc DECIMAL(12,2) DEFAULT 0;

-- Add actual payment columns
ALTER TABLE public.pos_sessions
    ADD COLUMN IF NOT EXISTS actual_cash DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS actual_qris DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS actual_edc DECIMAL(12,2);

-- Add difference columns
ALTER TABLE public.pos_sessions
    ADD COLUMN IF NOT EXISTS qris_difference DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS edc_difference DECIMAL(12,2);

-- Add total_sales and transaction_count columns
ALTER TABLE public.pos_sessions
    ADD COLUMN IF NOT EXISTS total_sales DECIMAL(12,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS transaction_count INTEGER DEFAULT 0;

-- =====================================================
-- PART 2: Handle terminal_id type change
-- The table has terminal_id as UUID FK to pos_terminals,
-- but frontend uses VARCHAR terminal IDs like TERM-XXX.
-- We'll add a varchar column for frontend compatibility.
-- =====================================================

-- Add terminal_id_str for string-based terminal IDs
ALTER TABLE public.pos_sessions
    ADD COLUMN IF NOT EXISTS terminal_id_str VARCHAR(50);

-- Create index for terminal_id_str lookups
CREATE INDEX IF NOT EXISTS idx_pos_sessions_terminal_str ON public.pos_sessions(terminal_id_str);

-- =====================================================
-- PART 3: Create get_user_open_shift function
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_open_shift(
    p_user_id UUID
)
RETURNS TABLE (
    id UUID,
    session_number VARCHAR(30),
    user_id UUID,
    user_name VARCHAR(200),
    terminal_id VARCHAR(50),
    status VARCHAR(20),
    opened_at TIMESTAMPTZ,
    opening_cash DECIMAL(12,2),
    expected_cash DECIMAL(12,2),
    expected_qris DECIMAL(12,2),
    expected_edc DECIMAL(12,2),
    total_sales DECIMAL(12,2),
    transaction_count INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.id,
        ps.session_number,
        COALESCE(ps.user_id, ps.opened_by) AS user_id,
        COALESCE(up.display_name, up.name) AS user_name,
        COALESCE(ps.terminal_id_str, ps.terminal_id::VARCHAR) AS terminal_id,
        ps.status::VARCHAR(20),
        ps.opened_at,
        ps.opening_cash,
        COALESCE(ps.expected_cash, ps.opening_cash) AS expected_cash,
        COALESCE(ps.expected_qris, 0::DECIMAL(12,2)) AS expected_qris,
        COALESCE(ps.expected_edc, 0::DECIMAL(12,2)) AS expected_edc,
        COALESCE(ps.total_sales, 0::DECIMAL(12,2)) AS total_sales,
        COALESCE(ps.transaction_count, 0) AS transaction_count,
        ps.notes,
        ps.created_at,
        ps.updated_at
    FROM public.pos_sessions ps
    LEFT JOIN public.user_profiles up ON up.id = COALESCE(ps.user_id, ps.opened_by)
    WHERE (ps.user_id = p_user_id OR ps.opened_by = p_user_id)
      AND ps.status = 'open';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_open_shift(UUID) TO authenticated;

-- =====================================================
-- PART 4: Create get_terminal_open_shifts function
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_terminal_open_shifts(
    p_terminal_id VARCHAR
)
RETURNS TABLE (
    id UUID,
    session_number VARCHAR(30),
    user_id UUID,
    user_name VARCHAR(200),
    terminal_id VARCHAR(50),
    status VARCHAR(20),
    opened_at TIMESTAMPTZ,
    opening_cash DECIMAL(12,2),
    expected_cash DECIMAL(12,2),
    expected_qris DECIMAL(12,2),
    expected_edc DECIMAL(12,2),
    total_sales DECIMAL(12,2),
    transaction_count INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.id,
        ps.session_number,
        COALESCE(ps.user_id, ps.opened_by) AS user_id,
        COALESCE(up.display_name, up.name) AS user_name,
        COALESCE(ps.terminal_id_str, ps.terminal_id::VARCHAR) AS terminal_id,
        ps.status::VARCHAR(20),
        ps.opened_at,
        ps.opening_cash,
        COALESCE(ps.expected_cash, ps.opening_cash) AS expected_cash,
        COALESCE(ps.expected_qris, 0::DECIMAL(12,2)) AS expected_qris,
        COALESCE(ps.expected_edc, 0::DECIMAL(12,2)) AS expected_edc,
        COALESCE(ps.total_sales, 0::DECIMAL(12,2)) AS total_sales,
        COALESCE(ps.transaction_count, 0) AS transaction_count,
        ps.notes,
        ps.created_at,
        ps.updated_at
    FROM public.pos_sessions ps
    LEFT JOIN public.user_profiles up ON up.id = COALESCE(ps.user_id, ps.opened_by)
    WHERE ps.terminal_id_str = p_terminal_id
      AND ps.status = 'open';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_terminal_open_shifts(VARCHAR) TO authenticated;

-- =====================================================
-- PART 5: Create open_shift function
-- =====================================================
CREATE OR REPLACE FUNCTION public.open_shift(
    p_user_id UUID,
    p_opening_cash DECIMAL,
    p_terminal_id VARCHAR,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_id UUID;
    v_session_number VARCHAR(50);
    v_user_name VARCHAR(200);
BEGIN
    -- Get user name (use display_name if available, otherwise name)
    SELECT COALESCE(display_name, name) INTO v_user_name
    FROM public.user_profiles
    WHERE id = p_user_id;

    -- Generate session number
    v_session_number := 'SH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- Create new session
    INSERT INTO public.pos_sessions (
        id,
        session_number,
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
        v_session_number,
        p_user_id,
        p_user_id,
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
    RETURNING id INTO v_session_id;

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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.open_shift(UUID, DECIMAL, VARCHAR, TEXT) TO authenticated;

-- Add closed_by_name column for storing the name of who closed the shift
ALTER TABLE public.pos_sessions
    ADD COLUMN IF NOT EXISTS closed_by_name VARCHAR(200);

-- =====================================================
-- PART 6: Create close_shift function
-- =====================================================
CREATE OR REPLACE FUNCTION public.close_shift(
    p_session_id UUID,
    p_actual_cash DECIMAL,
    p_actual_qris DECIMAL,
    p_actual_edc DECIMAL,
    p_closed_by VARCHAR,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_cash_diff DECIMAL;
    v_qris_diff DECIMAL;
    v_edc_diff DECIMAL;
    v_total_sales DECIMAL;
    v_transaction_count INTEGER;
    v_closed_by_uuid UUID;
BEGIN
    -- Get current session
    SELECT
        id,
        opening_cash,
        expected_cash,
        expected_qris,
        expected_edc,
        status
    INTO v_session
    FROM public.pos_sessions
    WHERE id = p_session_id AND status = 'open';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found or already closed';
    END IF;

    -- Calculate totals from orders (check both session_id and pos_session_id for compatibility)
    SELECT
        COALESCE(SUM(total), 0),
        COUNT(*)
    INTO v_total_sales, v_transaction_count
    FROM public.orders
    WHERE (session_id = p_session_id OR pos_session_id = p_session_id)
      AND status = 'completed';

    -- Calculate differences
    v_cash_diff := p_actual_cash - COALESCE(v_session.expected_cash, v_session.opening_cash);
    v_qris_diff := p_actual_qris - COALESCE(v_session.expected_qris, 0);
    v_edc_diff := p_actual_edc - COALESCE(v_session.expected_edc, 0);

    -- Try to get UUID for closed_by (in case it's passed as UUID string)
    BEGIN
        v_closed_by_uuid := p_closed_by::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_closed_by_uuid := NULL;
    END;

    -- Update session
    UPDATE public.pos_sessions
    SET
        status = 'closed',
        closed_at = NOW(),
        actual_cash = p_actual_cash,
        actual_qris = p_actual_qris,
        actual_edc = p_actual_edc,
        cash_difference = v_cash_diff,
        qris_difference = v_qris_diff,
        edc_difference = v_edc_diff,
        total_sales = v_total_sales,
        transaction_count = v_transaction_count,
        closed_by = v_closed_by_uuid,
        closed_by_name = p_closed_by,
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_session_id;

    RETURN jsonb_build_object(
        'session_id', p_session_id,
        'status', 'closed',
        'total_sales', v_total_sales,
        'transaction_count', v_transaction_count,
        'reconciliation', jsonb_build_object(
            'cash', jsonb_build_object(
                'expected', COALESCE(v_session.expected_cash, v_session.opening_cash),
                'actual', p_actual_cash,
                'difference', v_cash_diff
            ),
            'qris', jsonb_build_object(
                'expected', COALESCE(v_session.expected_qris, 0),
                'actual', p_actual_qris,
                'difference', v_qris_diff
            ),
            'edc', jsonb_build_object(
                'expected', COALESCE(v_session.expected_edc, 0),
                'actual', p_actual_edc,
                'difference', v_edc_diff
            )
        )
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.close_shift(UUID, DECIMAL, DECIMAL, DECIMAL, VARCHAR, TEXT) TO authenticated;

-- =====================================================
-- PART 7: Create update_lan_node_heartbeat function
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_lan_node_heartbeat(
    p_device_id VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.lan_nodes
    SET
        last_heartbeat = NOW(),
        status = 'online',
        updated_at = NOW()
    WHERE device_id = p_device_id;

    RETURN FOUND;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_lan_node_heartbeat(VARCHAR) TO authenticated;

-- =====================================================
-- PART 8: Add pos_session_id column to orders if missing
-- =====================================================
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS pos_session_id UUID REFERENCES public.pos_sessions(id);

CREATE INDEX IF NOT EXISTS idx_orders_pos_session ON public.orders(pos_session_id) WHERE pos_session_id IS NOT NULL;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
