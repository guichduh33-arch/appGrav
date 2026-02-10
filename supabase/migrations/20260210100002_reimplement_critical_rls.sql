-- DB-001: Reimplement permission-based RLS for critical tables
-- The 20260204130000 migration reverted everything to USING(TRUE).
-- We restore permission checks for security-critical tables only.

-- Helper: ensure get_current_user_profile_id exists
CREATE OR REPLACE FUNCTION public.get_current_user_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 1. user_profiles: write = users.update, self-update allowed
-- =====================================================
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_self" ON public.user_profiles;

CREATE POLICY "user_profiles_insert" ON public.user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (public.user_has_permission(public.get_current_user_profile_id(), 'users.create'));

CREATE POLICY "user_profiles_update_self" ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (
        auth_user_id = auth.uid()
        OR public.user_has_permission(public.get_current_user_profile_id(), 'users.create')
    );

CREATE POLICY "user_profiles_delete" ON public.user_profiles
    FOR DELETE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'users.create'));

-- =====================================================
-- 2. roles: write = users.roles
-- =====================================================
DROP POLICY IF EXISTS "roles_insert" ON public.roles;
DROP POLICY IF EXISTS "roles_update" ON public.roles;
DROP POLICY IF EXISTS "roles_delete" ON public.roles;

CREATE POLICY "roles_insert" ON public.roles
    FOR INSERT TO authenticated
    WITH CHECK (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

CREATE POLICY "roles_update" ON public.roles
    FOR UPDATE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

CREATE POLICY "roles_delete" ON public.roles
    FOR DELETE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles') AND NOT is_system);

-- =====================================================
-- 3. permissions: admin only for write (normally never written at runtime)
-- =====================================================
DROP POLICY IF EXISTS "permissions_insert" ON public.permissions;
DROP POLICY IF EXISTS "permissions_update" ON public.permissions;
DROP POLICY IF EXISTS "permissions_delete" ON public.permissions;

CREATE POLICY "permissions_insert" ON public.permissions
    FOR INSERT TO authenticated
    WITH CHECK (public.is_admin(public.get_current_user_profile_id()));

CREATE POLICY "permissions_update" ON public.permissions
    FOR UPDATE TO authenticated
    USING (public.is_admin(public.get_current_user_profile_id()));

CREATE POLICY "permissions_delete" ON public.permissions
    FOR DELETE TO authenticated
    USING (public.is_admin(public.get_current_user_profile_id()));

-- =====================================================
-- 4. role_permissions: write = users.roles
-- =====================================================
DROP POLICY IF EXISTS "role_permissions_insert" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_update" ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_delete" ON public.role_permissions;

CREATE POLICY "role_permissions_insert" ON public.role_permissions
    FOR INSERT TO authenticated
    WITH CHECK (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

CREATE POLICY "role_permissions_update" ON public.role_permissions
    FOR UPDATE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

CREATE POLICY "role_permissions_delete" ON public.role_permissions
    FOR DELETE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

-- =====================================================
-- 5. user_roles: write = users.roles
-- =====================================================
DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;

CREATE POLICY "user_roles_insert" ON public.user_roles
    FOR INSERT TO authenticated
    WITH CHECK (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

CREATE POLICY "user_roles_update" ON public.user_roles
    FOR UPDATE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

CREATE POLICY "user_roles_delete" ON public.user_roles
    FOR DELETE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

-- =====================================================
-- 6. user_permissions: write = users.roles
-- =====================================================
DROP POLICY IF EXISTS "user_permissions_insert" ON public.user_permissions;
DROP POLICY IF EXISTS "user_permissions_update" ON public.user_permissions;
DROP POLICY IF EXISTS "user_permissions_delete" ON public.user_permissions;

CREATE POLICY "user_permissions_insert" ON public.user_permissions
    FOR INSERT TO authenticated
    WITH CHECK (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

CREATE POLICY "user_permissions_update" ON public.user_permissions
    FOR UPDATE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

CREATE POLICY "user_permissions_delete" ON public.user_permissions
    FOR DELETE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'users.roles'));

-- =====================================================
-- 7. settings: write = settings.update
-- =====================================================
DROP POLICY IF EXISTS "settings_insert" ON public.settings;
DROP POLICY IF EXISTS "settings_update" ON public.settings;
DROP POLICY IF EXISTS "settings_delete" ON public.settings;

CREATE POLICY "settings_insert" ON public.settings
    FOR INSERT TO authenticated
    WITH CHECK (public.user_has_permission(public.get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "settings_update" ON public.settings
    FOR UPDATE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "settings_delete" ON public.settings
    FOR DELETE TO authenticated
    USING (public.user_has_permission(public.get_current_user_profile_id(), 'settings.update'));

-- =====================================================
-- 8. audit_logs: INSERT only (authenticated), no DELETE/UPDATE by users
-- =====================================================
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_update" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_delete" ON public.audit_logs;

-- SELECT: only users with settings.view or admins
CREATE POLICY "audit_logs_select" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        public.user_has_permission(public.get_current_user_profile_id(), 'settings.view')
        OR public.is_admin(public.get_current_user_profile_id())
    );

-- INSERT: any authenticated user (system/app writes audit logs)
CREATE POLICY "audit_logs_insert" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- No UPDATE or DELETE policies = audit logs are immutable
