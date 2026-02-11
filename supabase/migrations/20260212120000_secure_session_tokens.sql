-- =====================================================
-- Migration: Secure session tokens (I10)
-- - Update trigger to clear plaintext session_token after hashing
-- - Clear existing plaintext tokens that already have hashes
-- - Restrict RLS so users.view cannot read other users' tokens
-- =====================================================

-- 1. Update the trigger function to clear plaintext after computing hash
CREATE OR REPLACE FUNCTION hash_session_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_token IS NOT NULL THEN
        NEW.session_token_hash := encode(sha256(NEW.session_token::bytea), 'hex');
        -- Clear plaintext — edge functions must use hash-based lookup
        NEW.session_token := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Backfill hashes for any existing sessions that have plaintext but no hash
UPDATE user_sessions
SET session_token_hash = encode(sha256(session_token::bytea), 'hex')
WHERE session_token IS NOT NULL
  AND (session_token_hash IS NULL OR session_token_hash = '');

-- 3. Clear all remaining plaintext tokens
UPDATE user_sessions
SET session_token = NULL
WHERE session_token IS NOT NULL;

-- 4. Fix RLS: users with users.view should NOT see other users' session token columns
-- Drop old permissive policy
DROP POLICY IF EXISTS "user_sessions_select_own" ON user_sessions;

-- Recreate: users see their own sessions only (no cross-user token leakage)
-- Admins with users.view can see session metadata but not tokens
CREATE POLICY "user_sessions_select_own" ON user_sessions
    FOR SELECT TO authenticated
    USING (user_id = get_current_user_profile_id());

-- Separate policy for admins: can see other sessions but token columns are already NULL
CREATE POLICY "user_sessions_select_admin" ON user_sessions
    FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.view'));
