-- Migration: Fix RLS policies for combo and promotion tables
-- The original policies used auth.role() = 'authenticated' which is incorrect
-- auth.role() returns 'anon' or 'service_role', not 'authenticated'
-- The correct check is auth.uid() IS NOT NULL

-- =====================================================
-- Fix product_combos policies
-- =====================================================
DROP POLICY IF EXISTS "Allow insert combos for authenticated users" ON product_combos;
DROP POLICY IF EXISTS "Allow update combos for authenticated users" ON product_combos;
DROP POLICY IF EXISTS "Allow delete combos for authenticated users" ON product_combos;

CREATE POLICY "Allow insert combos for authenticated users"
    ON product_combos FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update combos for authenticated users"
    ON product_combos FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete combos for authenticated users"
    ON product_combos FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Fix product_combo_groups policies
-- =====================================================
DROP POLICY IF EXISTS "Allow insert combo groups for authenticated users" ON product_combo_groups;
DROP POLICY IF EXISTS "Allow update combo groups for authenticated users" ON product_combo_groups;
DROP POLICY IF EXISTS "Allow delete combo groups for authenticated users" ON product_combo_groups;

CREATE POLICY "Allow insert combo groups for authenticated users"
    ON product_combo_groups FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update combo groups for authenticated users"
    ON product_combo_groups FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete combo groups for authenticated users"
    ON product_combo_groups FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Fix product_combo_group_items policies
-- =====================================================
DROP POLICY IF EXISTS "Allow insert combo group items for authenticated users" ON product_combo_group_items;
DROP POLICY IF EXISTS "Allow update combo group items for authenticated users" ON product_combo_group_items;
DROP POLICY IF EXISTS "Allow delete combo group items for authenticated users" ON product_combo_group_items;

CREATE POLICY "Allow insert combo group items for authenticated users"
    ON product_combo_group_items FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update combo group items for authenticated users"
    ON product_combo_group_items FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete combo group items for authenticated users"
    ON product_combo_group_items FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Fix promotions policies
-- =====================================================
DROP POLICY IF EXISTS "Allow insert promotions for authenticated users" ON promotions;
DROP POLICY IF EXISTS "Allow update promotions for authenticated users" ON promotions;
DROP POLICY IF EXISTS "Allow delete promotions for authenticated users" ON promotions;

CREATE POLICY "Allow insert promotions for authenticated users"
    ON promotions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update promotions for authenticated users"
    ON promotions FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete promotions for authenticated users"
    ON promotions FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Fix promotion_products policies
-- =====================================================
DROP POLICY IF EXISTS "Allow insert promotion products for authenticated users" ON promotion_products;
DROP POLICY IF EXISTS "Allow update promotion products for authenticated users" ON promotion_products;
DROP POLICY IF EXISTS "Allow delete promotion products for authenticated users" ON promotion_products;

CREATE POLICY "Allow insert promotion products for authenticated users"
    ON promotion_products FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update promotion products for authenticated users"
    ON promotion_products FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete promotion products for authenticated users"
    ON promotion_products FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Fix promotion_free_products policies
-- =====================================================
DROP POLICY IF EXISTS "Allow insert promotion free products for authenticated users" ON promotion_free_products;
DROP POLICY IF EXISTS "Allow update promotion free products for authenticated users" ON promotion_free_products;
DROP POLICY IF EXISTS "Allow delete promotion free products for authenticated users" ON promotion_free_products;

CREATE POLICY "Allow insert promotion free products for authenticated users"
    ON promotion_free_products FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow update promotion free products for authenticated users"
    ON promotion_free_products FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow delete promotion free products for authenticated users"
    ON promotion_free_products FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Fix promotion_usage policies
-- =====================================================
DROP POLICY IF EXISTS "Allow insert promotion usage for authenticated users" ON promotion_usage;

CREATE POLICY "Allow insert promotion usage for authenticated users"
    ON promotion_usage FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
