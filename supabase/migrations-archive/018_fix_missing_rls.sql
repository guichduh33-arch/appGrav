-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Fix Missing RLS Policies
-- Migration: 018_fix_missing_rls.sql
-- =====================================================

-- =====================================================
-- ENABLE RLS ON MISSING TABLES (if they exist)
-- =====================================================

-- Enable RLS on sections table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sections') THEN
        ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on product_stocks table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_stocks') THEN
        ALTER TABLE product_stocks ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =====================================================
-- RLS POLICIES: SECTIONS (if table exists)
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sections') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "select_all_sections" ON sections;
        DROP POLICY IF EXISTS "insert_sections_admin" ON sections;
        DROP POLICY IF EXISTS "update_sections_admin" ON sections;
        DROP POLICY IF EXISTS "delete_sections_admin" ON sections;

        -- Create policies
        CREATE POLICY "select_all_sections" ON sections
            FOR SELECT TO authenticated USING (TRUE);

        CREATE POLICY "insert_sections_admin" ON sections
            FOR INSERT TO authenticated
            WITH CHECK (is_admin_or_manager());

        CREATE POLICY "update_sections_admin" ON sections
            FOR UPDATE TO authenticated
            USING (is_admin_or_manager())
            WITH CHECK (is_admin_or_manager());

        CREATE POLICY "delete_sections_admin" ON sections
            FOR DELETE TO authenticated
            USING (is_admin_or_manager());
    END IF;
END $$;

-- =====================================================
-- RLS POLICIES: PRODUCT_STOCKS (if table exists)
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_stocks') THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "select_product_stocks" ON product_stocks;
        DROP POLICY IF EXISTS "insert_product_stocks" ON product_stocks;
        DROP POLICY IF EXISTS "update_product_stocks" ON product_stocks;
        DROP POLICY IF EXISTS "delete_product_stocks_admin" ON product_stocks;

        -- Create policies
        CREATE POLICY "select_product_stocks" ON product_stocks
            FOR SELECT TO authenticated
            USING (can_access_backoffice() OR can_access_pos() OR is_admin_or_manager());

        CREATE POLICY "insert_product_stocks" ON product_stocks
            FOR INSERT TO authenticated
            WITH CHECK (can_access_backoffice() OR is_admin_or_manager());

        CREATE POLICY "update_product_stocks" ON product_stocks
            FOR UPDATE TO authenticated
            USING (can_access_backoffice() OR is_admin_or_manager())
            WITH CHECK (can_access_backoffice() OR is_admin_or_manager());

        CREATE POLICY "delete_product_stocks_admin" ON product_stocks
            FOR DELETE TO authenticated
            USING (is_admin_or_manager());
    END IF;
END $$;
