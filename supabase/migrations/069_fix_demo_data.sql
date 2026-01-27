-- Migration: 069_fix_demo_data.sql
-- Description: Ensure demo data is correctly set up with is_active = true

-- Step 1: Add is_active column if missing
ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 2: Set all roles to active
UPDATE public.roles SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Step 3: Ensure demo roles exist with all required fields
INSERT INTO public.roles (code, name_fr, name_en, name_id, hierarchy_level, is_system, is_active)
VALUES
    ('ADMIN', 'Administrateur', 'Administrator', 'Administrator', 100, true, true),
    ('MANAGER', 'Gérant', 'Manager', 'Manajer', 80, true, true),
    ('CASHIER', 'Caissier', 'Cashier', 'Kasir', 50, true, true),
    ('SERVER', 'Serveur', 'Server', 'Pelayan', 40, true, true),
    ('BARISTA', 'Barista', 'Barista', 'Barista', 40, true, true),
    ('KITCHEN', 'Cuisine', 'Kitchen', 'Dapur', 30, true, true),
    ('VIEWER', 'Lecteur', 'Viewer', 'Penonton', 10, true, true)
ON CONFLICT (code) DO UPDATE SET
    is_active = true,
    name_fr = EXCLUDED.name_fr,
    name_en = EXCLUDED.name_en,
    name_id = EXCLUDED.name_id;

-- Step 4: Ensure demo users are active
UPDATE public.user_profiles
SET is_active = true
WHERE id IN (
    'a1110000-0000-0000-0000-000000000001',
    'a1110000-0000-0000-0000-000000000002',
    'a1110000-0000-0000-0000-000000000003',
    'a1110000-0000-0000-0000-000000000004',
    'a1110000-0000-0000-0000-000000000005'
);

-- Step 5: Ensure user_roles entries exist
INSERT INTO public.user_roles (user_id, role_id, is_primary)
SELECT
    up.id as user_id,
    r.id as role_id,
    true as is_primary
FROM public.user_profiles up
CROSS JOIN public.roles r
WHERE
    (up.id = 'a1110000-0000-0000-0000-000000000001' AND r.code = 'CASHIER') OR
    (up.id = 'a1110000-0000-0000-0000-000000000002' AND r.code = 'MANAGER') OR
    (up.id = 'a1110000-0000-0000-0000-000000000003' AND r.code = 'SERVER') OR
    (up.id = 'a1110000-0000-0000-0000-000000000004' AND r.code = 'BARISTA') OR
    (up.id = 'a1110000-0000-0000-0000-000000000005' AND r.code = 'ADMIN')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Step 6: Verify
DO $$
DECLARE
    v_roles INTEGER;
    v_users INTEGER;
    v_links INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_roles FROM public.roles WHERE is_active = true;
    SELECT COUNT(*) INTO v_users FROM public.user_profiles WHERE is_active = true;
    SELECT COUNT(*) INTO v_links FROM public.user_roles;

    RAISE NOTICE 'Active roles: %, Active users: %, User-role links: %', v_roles, v_users, v_links;
END $$;
