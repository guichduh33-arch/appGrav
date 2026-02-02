-- Migration: Add terminal_id column to pos_sessions
-- Description: Adds terminal_id column if it doesn't exist for multi-terminal support

-- Add terminal_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pos_sessions' AND column_name = 'terminal_id'
    ) THEN
        ALTER TABLE pos_sessions ADD COLUMN terminal_id VARCHAR(50);
    END IF;
END $$;

-- Create index for terminal_id
CREATE INDEX IF NOT EXISTS idx_pos_sessions_terminal ON pos_sessions(terminal_id);
