-- Migration: 067_ensure_demo_users.sql
-- Description: Ensure demo users exist with proper roles for development

-- Step 0: Ensure pin_hash column exists
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);

-- Step 1: Insert demo users if they don't exist
INSERT INTO public.user_profiles (id, name, role, is_active, can_apply_discount, can_cancel_order, can_access_reports)
VALUES
    ('a1110000-0000-0000-0000-000000000001', 'Apni', 'cashier', true, false, false, false),
    ('a1110000-0000-0000-0000-000000000002', 'Dani', 'manager', true, true, true, true),
    ('a1110000-0000-0000-0000-000000000003', 'Irfan', 'server', true, false, false, false),
    ('a1110000-0000-0000-0000-000000000004', 'Bayu', 'barista', true, false, false, false),
    ('a1110000-0000-0000-0000-000000000005', 'Admin', 'admin', true, true, true, true)
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    is_active = true;

-- Step 2: Set PINs using the secure function (will hash automatically)
-- Note: We use a DO block to handle the PIN setting
DO $$
DECLARE
    v_user RECORD;
    v_pins JSONB := '{
        "a1110000-0000-0000-0000-000000000001": "1234",
        "a1110000-0000-0000-0000-000000000002": "0000",
        "a1110000-0000-0000-0000-000000000003": "5678",
        "a1110000-0000-0000-0000-000000000004": "2222",
        "a1110000-0000-0000-0000-000000000005": "9999"
    }'::JSONB;
    v_pin TEXT;
BEGIN
    FOR v_user IN SELECT id FROM public.user_profiles WHERE id IN (
        'a1110000-0000-0000-0000-000000000001',
        'a1110000-0000-0000-0000-000000000002',
        'a1110000-0000-0000-0000-000000000003',
        'a1110000-0000-0000-0000-000000000004',
        'a1110000-0000-0000-0000-000000000005'
    )
    LOOP
        v_pin := v_pins ->> v_user.id::TEXT;
        IF v_pin IS NOT NULL THEN
            -- Hash the PIN and update
            UPDATE public.user_profiles
            SET pin_hash = extensions.crypt(v_pin, extensions.gen_salt('bf', 8)),
                pin_code = NULL
            WHERE id = v_user.id;
        END IF;
    END LOOP;
END $$;

-- Step 3: Ensure roles exist in the roles table
INSERT INTO public.roles (code, name_fr, name_en, name_id, hierarchy_level, is_system)
VALUES
    ('ADMIN', 'Administrateur', 'Administrator', 'Administrator', 100, true),
    ('MANAGER', 'Gérant', 'Manager', 'Manajer', 80, true),
    ('CASHIER', 'Caissier', 'Cashier', 'Kasir', 50, true),
    ('SERVER', 'Serveur', 'Server', 'Pelayan', 40, true),
    ('BARISTA', 'Barista', 'Barista', 'Barista', 40, true),
    ('KITCHEN', 'Cuisine', 'Kitchen', 'Dapur', 30, true),
    ('VIEWER', 'Lecteur', 'Viewer', 'Penonton', 10, true)
ON CONFLICT (code) DO NOTHING;

-- Step 4: Link users to roles in user_roles table
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

-- Step 5: Verify the data
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.user_profiles WHERE role IN ('admin', 'manager');
    RAISE NOTICE 'Found % admin/manager users in user_profiles', v_count;

    SELECT COUNT(*) INTO v_count FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE r.code IN ('ADMIN', 'MANAGER');
    RAISE NOTICE 'Found % admin/manager entries in user_roles', v_count;
END $$;
