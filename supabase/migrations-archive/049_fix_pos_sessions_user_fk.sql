-- Migration: Fix pos_sessions foreign keys
-- Description: Change FK from auth.users to user_profiles for demo mode compatibility

-- Drop all existing foreign key constraints
ALTER TABLE pos_sessions DROP CONSTRAINT IF EXISTS pos_sessions_user_id_fkey;
ALTER TABLE pos_sessions DROP CONSTRAINT IF EXISTS pos_sessions_closed_by_fkey;

-- Add new FK to user_profiles instead of auth.users
ALTER TABLE pos_sessions
ADD CONSTRAINT pos_sessions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Only add closed_by FK if column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pos_sessions' AND column_name = 'closed_by'
    ) THEN
        ALTER TABLE pos_sessions
        ADD CONSTRAINT pos_sessions_closed_by_fkey
        FOREIGN KEY (closed_by) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;
