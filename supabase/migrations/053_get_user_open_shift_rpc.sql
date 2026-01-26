-- Migration: Get User Open Shift RPC
-- Description: Creates an RPC function to get a user's open shift, bypassing RLS
-- This is needed because the app uses PIN authentication with anon key

-- Function to get a user's open shift
CREATE OR REPLACE FUNCTION get_user_open_shift(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    session_number VARCHAR(50),
    user_id UUID,
    user_name VARCHAR(255),
    terminal_id VARCHAR(50),
    status VARCHAR(20),
    opened_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    opening_cash DECIMAL(15,2),
    expected_cash DECIMAL(15,2),
    expected_qris DECIMAL(15,2),
    expected_edc DECIMAL(15,2),
    actual_cash DECIMAL(15,2),
    actual_qris DECIMAL(15,2),
    actual_edc DECIMAL(15,2),
    cash_difference DECIMAL(15,2),
    qris_difference DECIMAL(15,2),
    edc_difference DECIMAL(15,2),
    total_sales DECIMAL(15,2),
    transaction_count INTEGER,
    notes TEXT,
    closed_by UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.id,
        ps.session_number,
        ps.user_id,
        COALESCE(up.display_name, up.name)::VARCHAR(255) as user_name,
        ps.terminal_id,
        ps.status,
        ps.opened_at,
        ps.closed_at,
        ps.opening_cash,
        ps.expected_cash,
        ps.expected_qris,
        ps.expected_edc,
        ps.actual_cash,
        ps.actual_qris,
        ps.actual_edc,
        ps.cash_difference,
        ps.qris_difference,
        ps.edc_difference,
        ps.total_sales,
        ps.transaction_count,
        ps.notes,
        ps.closed_by,
        ps.created_at,
        ps.updated_at
    FROM pos_sessions ps
    LEFT JOIN user_profiles up ON ps.user_id = up.id
    WHERE ps.user_id = p_user_id
      AND ps.status = 'open'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all open shifts on a terminal
CREATE OR REPLACE FUNCTION get_terminal_open_shifts(p_terminal_id VARCHAR)
RETURNS TABLE (
    id UUID,
    session_number VARCHAR(50),
    user_id UUID,
    user_name VARCHAR(255),
    terminal_id VARCHAR(50),
    status VARCHAR(20),
    opened_at TIMESTAMPTZ,
    opening_cash DECIMAL(15,2),
    total_sales DECIMAL(15,2),
    transaction_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.id,
        ps.session_number,
        ps.user_id,
        COALESCE(up.display_name, up.name)::VARCHAR(255) as user_name,
        ps.terminal_id,
        ps.status,
        ps.opened_at,
        ps.opening_cash,
        ps.total_sales,
        ps.transaction_count
    FROM pos_sessions ps
    LEFT JOIN user_profiles up ON ps.user_id = up.id
    WHERE ps.terminal_id = p_terminal_id
      AND ps.status = 'open'
    ORDER BY ps.opened_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_user_open_shift(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_terminal_open_shifts(VARCHAR) TO anon, authenticated;
