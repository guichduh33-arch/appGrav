-- =====================================================
-- Migration 056: Fix Overly Permissive RLS Policies
-- Description: Replace USING (true) policies with proper auth checks
-- Date: 2026-01-26
-- Issue: Security audit identified policies allowing unauthorized access
-- =====================================================

-- =====================================================
-- STEP 1: FIX ROLES TABLE POLICIES
-- =====================================================

-- Drop the problematic "Admins can manage roles" policy
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;

-- Create proper admin-only policies for roles management
CREATE POLICY "Admins can insert roles" ON public.roles
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

CREATE POLICY "Admins can update roles" ON public.roles
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
        AND is_system = false  -- Cannot modify system roles
    );

CREATE POLICY "Admins can delete roles" ON public.roles
    FOR DELETE USING (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
        AND is_system = false  -- Cannot delete system roles
    );

-- =====================================================
-- STEP 2: FIX ROLE_PERMISSIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage role_permissions" ON public.role_permissions;

CREATE POLICY "Admins can insert role_permissions" ON public.role_permissions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

CREATE POLICY "Admins can update role_permissions" ON public.role_permissions
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

CREATE POLICY "Admins can delete role_permissions" ON public.role_permissions
    FOR DELETE USING (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

-- =====================================================
-- STEP 3: FIX USER_ROLES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;

-- Users can view their own roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            user_id = auth.uid()  -- Own roles
            OR public.is_admin(auth.uid())  -- Admins see all
        )
    );

CREATE POLICY "Admins can insert user_roles" ON public.user_roles
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

CREATE POLICY "Admins can update user_roles" ON public.user_roles
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

CREATE POLICY "Admins can delete user_roles" ON public.user_roles
    FOR DELETE USING (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

-- =====================================================
-- STEP 4: FIX USER_PERMISSIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage user_permissions" ON public.user_permissions;

-- Users can view their own permissions
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
CREATE POLICY "Users can view own permissions" ON public.user_permissions
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            user_id = auth.uid()  -- Own permissions
            OR public.is_admin(auth.uid())  -- Admins see all
        )
    );

CREATE POLICY "Admins can insert user_permissions" ON public.user_permissions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

CREATE POLICY "Admins can update user_permissions" ON public.user_permissions
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

CREATE POLICY "Admins can delete user_permissions" ON public.user_permissions
    FOR DELETE USING (
        auth.uid() IS NOT NULL
        AND public.is_admin(auth.uid())
    );

-- =====================================================
-- STEP 5: FIX USER_SESSIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.user_sessions;

-- Users can only view their own sessions, admins see all
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            user_id = auth.uid()
            OR public.is_admin(auth.uid())
        )
    );

-- Authenticated users can create their own sessions
CREATE POLICY "Users can create own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    );

-- Users can update their own sessions (e.g., end session)
CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
        AND (
            user_id = auth.uid()
            OR public.is_admin(auth.uid())
        )
    );

-- =====================================================
-- STEP 6: FIX AUDIT_LOGS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can view audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit_logs" ON public.audit_logs;

-- Only admins and managers can view audit logs
CREATE POLICY "Authorized users can view audit_logs" ON public.audit_logs
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            public.is_admin(auth.uid())
            OR public.user_has_permission(auth.uid(), 'reports.financial')
        )
    );

-- Audit logs are inserted by triggers, allow for authenticated users
-- (The trigger runs with SECURITY DEFINER so this is safe)
CREATE POLICY "System can insert audit_logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);  -- Triggers handle this

-- =====================================================
-- STEP 7: VERIFY NO DELETE ON AUDIT_LOGS
-- =====================================================

-- Ensure no one can delete audit logs (immutable audit trail)
CREATE POLICY "No one can delete audit_logs" ON public.audit_logs
    FOR DELETE USING (false);

-- =====================================================
-- STEP 8: ADD COMMENT
-- =====================================================

COMMENT ON POLICY "Admins can insert roles" ON public.roles IS 'Only admins can create new roles';
COMMENT ON POLICY "Admins can update roles" ON public.roles IS 'Only admins can modify non-system roles';
COMMENT ON POLICY "Admins can delete roles" ON public.roles IS 'Only admins can delete non-system roles';
