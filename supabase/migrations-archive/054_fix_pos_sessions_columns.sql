-- Migration: 054_fix_pos_sessions_columns.sql
-- Description: Ensure pos_sessions has all required columns and fix RPC functions

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- expected_qris
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'expected_qris') THEN
        ALTER TABLE pos_sessions ADD COLUMN expected_qris DECIMAL(15,2) DEFAULT 0;
    END IF;

    -- expected_edc
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'expected_edc') THEN
        ALTER TABLE pos_sessions ADD COLUMN expected_edc DECIMAL(15,2) DEFAULT 0;
    END IF;

    -- actual_qris
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'actual_qris') THEN
        ALTER TABLE pos_sessions ADD COLUMN actual_qris DECIMAL(15,2);
    END IF;

    -- actual_edc
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'actual_edc') THEN
        ALTER TABLE pos_sessions ADD COLUMN actual_edc DECIMAL(15,2);
    END IF;

    -- qris_difference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'qris_difference') THEN
        ALTER TABLE pos_sessions ADD COLUMN qris_difference DECIMAL(15,2);
    END IF;

    -- edc_difference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'edc_difference') THEN
        ALTER TABLE pos_sessions ADD COLUMN edc_difference DECIMAL(15,2);
    END IF;

    -- expected_cash (should exist, but just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'expected_cash') THEN
        ALTER TABLE pos_sessions ADD COLUMN expected_cash DECIMAL(15,2) DEFAULT 0;
    END IF;

    -- actual_cash
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'actual_cash') THEN
        ALTER TABLE pos_sessions ADD COLUMN actual_cash DECIMAL(15,2);
    END IF;

    -- cash_difference
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'cash_difference') THEN
        ALTER TABLE pos_sessions ADD COLUMN cash_difference DECIMAL(15,2);
    END IF;

    -- total_sales
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'total_sales') THEN
        ALTER TABLE pos_sessions ADD COLUMN total_sales DECIMAL(15,2) DEFAULT 0;
    END IF;

    -- transaction_count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'transaction_count') THEN
        ALTER TABLE pos_sessions ADD COLUMN transaction_count INTEGER DEFAULT 0;
    END IF;

    -- notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'notes') THEN
        ALTER TABLE pos_sessions ADD COLUMN notes TEXT;
    END IF;

    -- closed_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pos_sessions' AND column_name = 'closed_by') THEN
        ALTER TABLE pos_sessions ADD COLUMN closed_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Recreate the RPC function to get a user's open shift
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
        COALESCE(ps.expected_cash, 0::DECIMAL(15,2)) as expected_cash,
        COALESCE(ps.expected_qris, 0::DECIMAL(15,2)) as expected_qris,
        COALESCE(ps.expected_edc, 0::DECIMAL(15,2)) as expected_edc,
        ps.actual_cash,
        ps.actual_qris,
        ps.actual_edc,
        ps.cash_difference,
        ps.qris_difference,
        ps.edc_difference,
        COALESCE(ps.total_sales, 0::DECIMAL(15,2)) as total_sales,
        COALESCE(ps.transaction_count, 0) as transaction_count,
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

-- Recreate the function to get all open shifts on a terminal
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
        COALESCE(ps.total_sales, 0::DECIMAL(15,2)) as total_sales,
        COALESCE(ps.transaction_count, 0) as transaction_count
    FROM pos_sessions ps
    LEFT JOIN user_profiles up ON ps.user_id = up.id
    WHERE ps.terminal_id = p_terminal_id
      AND ps.status = 'open'
    ORDER BY ps.opened_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure permissions are granted
GRANT EXECUTE ON FUNCTION get_user_open_shift(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_terminal_open_shifts(VARCHAR) TO anon, authenticated;
