-- Migration: 075_fix_user_roles_fk.sql
-- Description: Ensure foreign keys exist on user_roles table for PostgREST relationship detection

-- Clean orphan records first (user_roles with user_id not in user_profiles)
DELETE FROM public.user_roles
WHERE user_id NOT IN (SELECT id FROM public.user_profiles);

-- First, drop existing constraints if they exist (to recreate them properly)
DO $$
BEGIN
    -- Drop FK to user_profiles if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_roles_user_id_fkey'
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;
    END IF;

    -- Drop FK to roles if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'user_roles_role_id_fkey'
        AND table_name = 'user_roles'
    ) THEN
        ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_role_id_fkey;
    END IF;
END $$;

-- Recreate foreign keys with proper naming
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_id_fkey
FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify
DO $$
DECLARE
    v_fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_fk_count
    FROM information_schema.table_constraints
    WHERE table_name = 'user_roles'
    AND constraint_type = 'FOREIGN KEY';

    RAISE NOTICE 'user_roles FK count: %', v_fk_count;
END $$;
