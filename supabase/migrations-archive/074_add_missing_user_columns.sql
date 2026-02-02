-- Migration: 074_add_missing_user_columns.sql
-- Description: Add missing columns to user_profiles that are expected by the app

-- Add missing columns
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(200);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS employee_code VARCHAR(20);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'id';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Makassar';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Set display_name from name for existing users
UPDATE public.user_profiles
SET display_name = name
WHERE display_name IS NULL AND name IS NOT NULL;

-- Verify columns exist
DO $$
DECLARE
    v_col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name IN ('display_name', 'first_name', 'last_name', 'employee_code', 'phone');

    RAISE NOTICE 'User profile columns added: % of 5 key columns exist', v_col_count;
END $$;
