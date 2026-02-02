-- Migration: 055_recreate_shift_rpc.sql
-- Description: Simplified RPC functions for shift management

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_user_open_shift(UUID);
DROP FUNCTION IF EXISTS get_terminal_open_shifts(VARCHAR);

-- Simple function to get a user's open shift
CREATE OR REPLACE FUNCTION get_user_open_shift(p_user_id UUID)
RETURNS SETOF pos_sessions AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM pos_sessions
    WHERE user_id = p_user_id
      AND status = 'open'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple function to get all open shifts on a terminal
CREATE OR REPLACE FUNCTION get_terminal_open_shifts(p_terminal_id VARCHAR)
RETURNS SETOF pos_sessions AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM pos_sessions
    WHERE terminal_id = p_terminal_id
      AND status = 'open'
    ORDER BY opened_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_user_open_shift(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_terminal_open_shifts(VARCHAR) TO anon, authenticated;
