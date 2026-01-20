-- =====================================================
-- Migration 046: Fix Admin User Roles & Permissions
-- Description: Ensure admin users have proper roles assigned and can manage users
-- Date: 2026-01-21
-- =====================================================

-- =====================================================
-- STEP 1: DIAGNOSTIC - Check current state
-- =====================================================

-- Show users without roles assigned
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.user_profiles up
    WHERE NOT EXISTS (
        SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.id
    );
    RAISE NOTICE 'Users without roles: %', v_count;
END $$;

-- =====================================================
-- STEP 2: Assign ADMIN role to users with role='admin'
-- =====================================================

-- First, ensure all users with legacy 'admin' role have the ADMIN role in user_roles
INSERT INTO public.user_roles (user_id, role_id, is_primary)
SELECT
    up.id,
    r.id,
    true
FROM public.user_profiles up
CROSS JOIN public.roles r
WHERE up.role::TEXT = 'admin'
AND r.code = 'ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = up.id AND ur.role_id = r.id
)
ON CONFLICT (user_id, role_id) DO UPDATE SET is_primary = true;

-- =====================================================
-- STEP 3: Ensure ADMIN role has all user management permissions
-- =====================================================

-- Make sure ADMIN role has users.* permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'ADMIN'
AND p.code IN ('users.view', 'users.create', 'users.update', 'users.delete', 'users.roles', 'users.permissions')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Also ensure SUPER_ADMIN has all permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- STEP 4: Verify the fix
-- =====================================================

-- Show admin users and their roles
DO $$
DECLARE
    v_record RECORD;
BEGIN
    RAISE NOTICE '--- Admin Users and their Roles ---';
    FOR v_record IN
        SELECT
            up.name,
            up.role::TEXT as legacy_role,
            r.code as new_role,
            ur.is_primary
        FROM public.user_profiles up
        LEFT JOIN public.user_roles ur ON up.id = ur.user_id
        LEFT JOIN public.roles r ON ur.role_id = r.id
        WHERE up.role::TEXT IN ('admin', 'manager')
        ORDER BY up.name
    LOOP
        RAISE NOTICE 'User: %, Legacy: %, New Role: %, Primary: %',
            v_record.name, v_record.legacy_role, v_record.new_role, v_record.is_primary;
    END LOOP;
END $$;

-- Show permissions for ADMIN role
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE r.code = 'ADMIN' AND p.code LIKE 'users.%';

    RAISE NOTICE 'ADMIN role has % user-related permissions', v_count;
END $$;

-- =====================================================
-- STEP 5: Also assign roles to other user types
-- =====================================================

-- Cashiers
INSERT INTO public.user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM public.user_profiles up
CROSS JOIN public.roles r
WHERE up.role::TEXT = 'cashier' AND r.code = 'CASHIER'
AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.id AND ur.role_id = r.id)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Managers
INSERT INTO public.user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM public.user_profiles up
CROSS JOIN public.roles r
WHERE up.role::TEXT = 'manager' AND r.code = 'MANAGER'
AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.id AND ur.role_id = r.id)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Servers
INSERT INTO public.user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM public.user_profiles up
CROSS JOIN public.roles r
WHERE up.role::TEXT = 'server' AND r.code = 'SERVER'
AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.id AND ur.role_id = r.id)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Baristas
INSERT INTO public.user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM public.user_profiles up
CROSS JOIN public.roles r
WHERE up.role::TEXT = 'barista' AND r.code = 'BARISTA'
AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.id AND ur.role_id = r.id)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Kitchen
INSERT INTO public.user_roles (user_id, role_id, is_primary)
SELECT up.id, r.id, true
FROM public.user_profiles up
CROSS JOIN public.roles r
WHERE up.role::TEXT = 'kitchen' AND r.code = 'KITCHEN'
AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = up.id AND ur.role_id = r.id)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- =====================================================
-- STEP 6: Final verification
-- =====================================================

DO $$
DECLARE
    v_total_users INTEGER;
    v_users_with_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_users FROM public.user_profiles WHERE is_active = true;
    SELECT COUNT(DISTINCT user_id) INTO v_users_with_roles FROM public.user_roles;

    RAISE NOTICE '--- Final Status ---';
    RAISE NOTICE 'Total active users: %', v_total_users;
    RAISE NOTICE 'Users with roles assigned: %', v_users_with_roles;
END $$;
