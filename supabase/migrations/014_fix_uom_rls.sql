-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Fix RLS Policy for product_uoms table
-- Version: 2.2.1
-- =====================================================
-- Description:
-- The original "modify_uoms_admin" policy using "FOR ALL" 
-- may cause issues on INSERT operations in certain PostgreSQL versions.
-- This migration drops the combined policy and creates explicit 
-- INSERT, UPDATE, DELETE policies for better compatibility.
-- =====================================================
-- Drop the existing combined policy
DROP POLICY IF EXISTS "modify_uoms_admin" ON product_uoms;
-- Create explicit INSERT policy
CREATE POLICY "insert_uoms" ON product_uoms FOR
INSERT TO authenticated WITH CHECK (
        is_admin_or_manager()
        OR can_access_backoffice()
    );
-- Create explicit UPDATE policy
CREATE POLICY "update_uoms" ON product_uoms FOR
UPDATE TO authenticated USING (
        is_admin_or_manager()
        OR can_access_backoffice()
    ) WITH CHECK (
        is_admin_or_manager()
        OR can_access_backoffice()
    );
-- Create explicit DELETE policy
CREATE POLICY "delete_uoms" ON product_uoms FOR DELETE TO authenticated USING (
    is_admin_or_manager()
    OR can_access_backoffice()
);