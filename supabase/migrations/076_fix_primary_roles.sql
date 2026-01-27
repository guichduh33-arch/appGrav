-- Migration: 076_fix_primary_roles.sql
-- Description: Set is_primary = true for all single-role users

-- For users with only one role, make it the primary role
UPDATE public.user_roles
SET is_primary = true
WHERE user_id IN (
    SELECT user_id
    FROM public.user_roles
    GROUP BY user_id
    HAVING COUNT(*) = 1
);

-- Verify
DO $$
DECLARE
    v_primary_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_primary_count
    FROM public.user_roles
    WHERE is_primary = true;

    RAISE NOTICE 'Primary roles set: %', v_primary_count;
END $$;
