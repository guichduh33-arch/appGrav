-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Fix Missing RLS Policies
-- Migration: 018_fix_missing_rls.sql
-- =====================================================

-- =====================================================
-- ENABLE RLS ON MISSING TABLES
-- =====================================================

-- Enable RLS on sections table
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Enable RLS on product_stocks table
ALTER TABLE product_stocks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: SECTIONS
-- =====================================================
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

-- =====================================================
-- RLS POLICIES: PRODUCT_STOCKS
-- =====================================================
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
