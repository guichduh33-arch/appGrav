-- Migration: 070_fix_demo_pins.sql
-- Description: Directly set PIN hashes for demo users

-- Step 1: Make sure columns exist
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Step 2: Reset any lockouts
UPDATE public.user_profiles
SET failed_login_attempts = 0, locked_until = NULL
WHERE id IN (
    'a1110000-0000-0000-0000-000000000001',
    'a1110000-0000-0000-0000-000000000002',
    'a1110000-0000-0000-0000-000000000003',
    'a1110000-0000-0000-0000-000000000004',
    'a1110000-0000-0000-0000-000000000005'
);

-- Step 3: Set PIN hashes directly using bcrypt
-- Apni (cashier): PIN 1234
UPDATE public.user_profiles
SET pin_hash = extensions.crypt('1234', extensions.gen_salt('bf', 8))
WHERE id = 'a1110000-0000-0000-0000-000000000001';

-- Dani (manager): PIN 0000
UPDATE public.user_profiles
SET pin_hash = extensions.crypt('0000', extensions.gen_salt('bf', 8))
WHERE id = 'a1110000-0000-0000-0000-000000000002';

-- Irfan (server): PIN 5678
UPDATE public.user_profiles
SET pin_hash = extensions.crypt('5678', extensions.gen_salt('bf', 8))
WHERE id = 'a1110000-0000-0000-0000-000000000003';

-- Bayu (barista): PIN 2222
UPDATE public.user_profiles
SET pin_hash = extensions.crypt('2222', extensions.gen_salt('bf', 8))
WHERE id = 'a1110000-0000-0000-0000-000000000004';

-- Admin: PIN 9999
UPDATE public.user_profiles
SET pin_hash = extensions.crypt('9999', extensions.gen_salt('bf', 8))
WHERE id = 'a1110000-0000-0000-0000-000000000005';

-- Step 4: Verify PIN hashes are set
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.user_profiles
    WHERE pin_hash IS NOT NULL
    AND id IN (
        'a1110000-0000-0000-0000-000000000001',
        'a1110000-0000-0000-0000-000000000002',
        'a1110000-0000-0000-0000-000000000003',
        'a1110000-0000-0000-0000-000000000004',
        'a1110000-0000-0000-0000-000000000005'
    );
    RAISE NOTICE 'Demo users with PIN hash set: %', v_count;

    -- Test PIN verification for Admin user with PIN 9999
    IF EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = 'a1110000-0000-0000-0000-000000000005'
        AND pin_hash = extensions.crypt('9999', pin_hash)
    ) THEN
        RAISE NOTICE 'PIN verification test PASSED for Admin';
    ELSE
        RAISE NOTICE 'PIN verification test FAILED for Admin';
    END IF;
END $$;

-- Step 5: Grant execute permission on verify_user_pin
GRANT EXECUTE ON FUNCTION public.verify_user_pin(UUID, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_user_pin(UUID, VARCHAR) TO authenticated;
