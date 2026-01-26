-- Migration: 052_add_missing_rls_policies.sql
-- Description: Add RLS policies to tables that were missing them
-- This fixes a HIGH PRIORITY security issue from the audit
-- Date: 2026-01-24

-- ============================================
-- SECTIONS TABLE - Enable RLS
-- ============================================
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read sections (needed for inventory views)
DROP POLICY IF EXISTS "Authenticated users can read sections" ON public.sections;
CREATE POLICY "Authenticated users can read sections"
    ON public.sections
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins/managers can modify sections
DROP POLICY IF EXISTS "Admins can manage sections" ON public.sections;
CREATE POLICY "Admins can manage sections"
    ON public.sections
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid()
            AND up.role IN ('admin', 'manager')
            AND up.is_active = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid()
            AND r.code IN ('ADMIN', 'SUPER_ADMIN', 'MANAGER')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid()
            AND up.role IN ('admin', 'manager')
            AND up.is_active = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid()
            AND r.code IN ('ADMIN', 'SUPER_ADMIN', 'MANAGER')
        )
    );

-- ============================================
-- PRODUCT_STOCKS TABLE - Enable RLS
-- ============================================
ALTER TABLE public.product_stocks ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read stock levels (needed for POS, inventory views)
DROP POLICY IF EXISTS "Authenticated users can read product_stocks" ON public.product_stocks;
CREATE POLICY "Authenticated users can read product_stocks"
    ON public.product_stocks
    FOR SELECT
    TO authenticated
    USING (true);

-- Users with inventory permissions can modify stock
DROP POLICY IF EXISTS "Inventory users can manage product_stocks" ON public.product_stocks;
CREATE POLICY "Inventory users can manage product_stocks"
    ON public.product_stocks
    FOR ALL
    TO authenticated
    USING (
        -- Legacy role check
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid()
            AND up.role IN ('admin', 'manager', 'backoffice')
            AND up.is_active = true
        )
        OR
        -- New permission check
        EXISTS (
            SELECT 1 FROM public.user_permissions up_perm
            JOIN public.permissions p ON p.id = up_perm.permission_id
            WHERE up_perm.user_id = auth.uid()
            AND p.code IN ('inventory.update', 'inventory.manage')
        )
        OR
        -- Role-based permission check
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.role_permissions rp ON rp.role_id = ur.role_id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ur.user_id = auth.uid()
            AND p.code IN ('inventory.update', 'inventory.manage')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid()
            AND up.role IN ('admin', 'manager', 'backoffice')
            AND up.is_active = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_permissions up_perm
            JOIN public.permissions p ON p.id = up_perm.permission_id
            WHERE up_perm.user_id = auth.uid()
            AND p.code IN ('inventory.update', 'inventory.manage')
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.role_permissions rp ON rp.role_id = ur.role_id
            JOIN public.permissions p ON p.id = rp.permission_id
            WHERE ur.user_id = auth.uid()
            AND p.code IN ('inventory.update', 'inventory.manage')
        )
    );

-- ============================================
-- STORAGE_SECTIONS TABLE (if exists) - Enable RLS
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'storage_sections' AND table_schema = 'public') THEN
        EXECUTE 'ALTER TABLE public.storage_sections ENABLE ROW LEVEL SECURITY';

        -- Drop existing policies if any
        DROP POLICY IF EXISTS "Authenticated users can read storage_sections" ON public.storage_sections;
        DROP POLICY IF EXISTS "Admins can manage storage_sections" ON public.storage_sections;

        -- Create read policy
        CREATE POLICY "Authenticated users can read storage_sections"
            ON public.storage_sections
            FOR SELECT
            TO authenticated
            USING (true);

        -- Create manage policy
        CREATE POLICY "Admins can manage storage_sections"
            ON public.storage_sections
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles up
                    WHERE up.id = auth.uid()
                    AND up.role IN ('admin', 'manager')
                    AND up.is_active = true
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.user_profiles up
                    WHERE up.id = auth.uid()
                    AND up.role IN ('admin', 'manager')
                    AND up.is_active = true
                )
            );
    END IF;
END $$;

-- ============================================
-- SECTION_ITEMS TABLE (if exists) - Enable RLS
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'section_items' AND table_schema = 'public') THEN
        EXECUTE 'ALTER TABLE public.section_items ENABLE ROW LEVEL SECURITY';

        DROP POLICY IF EXISTS "Authenticated users can read section_items" ON public.section_items;
        DROP POLICY IF EXISTS "Inventory users can manage section_items" ON public.section_items;

        CREATE POLICY "Authenticated users can read section_items"
            ON public.section_items
            FOR SELECT
            TO authenticated
            USING (true);

        CREATE POLICY "Inventory users can manage section_items"
            ON public.section_items
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles up
                    WHERE up.id = auth.uid()
                    AND up.role IN ('admin', 'manager', 'backoffice')
                    AND up.is_active = true
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.user_profiles up
                    WHERE up.id = auth.uid()
                    AND up.role IN ('admin', 'manager', 'backoffice')
                    AND up.is_active = true
                )
            );
    END IF;
END $$;

-- ============================================
-- PRODUCT_SECTIONS TABLE (if exists) - Enable RLS
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_sections' AND table_schema = 'public') THEN
        EXECUTE 'ALTER TABLE public.product_sections ENABLE ROW LEVEL SECURITY';

        DROP POLICY IF EXISTS "Authenticated users can read product_sections" ON public.product_sections;
        DROP POLICY IF EXISTS "Admins can manage product_sections" ON public.product_sections;

        CREATE POLICY "Authenticated users can read product_sections"
            ON public.product_sections
            FOR SELECT
            TO authenticated
            USING (true);

        CREATE POLICY "Admins can manage product_sections"
            ON public.product_sections
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_profiles up
                    WHERE up.id = auth.uid()
                    AND up.role IN ('admin', 'manager')
                    AND up.is_active = true
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.user_profiles up
                    WHERE up.id = auth.uid()
                    AND up.role IN ('admin', 'manager')
                    AND up.is_active = true
                )
            );
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify RLS is enabled:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- AND tablename IN ('sections', 'product_stocks', 'storage_sections', 'section_items', 'product_sections');
