-- =====================================================
-- MIGRATION: Fix RLS Policies
-- Description: Unblocks access to Products, Categories, and Recipes.
--             Enables proper visibility for the Application (Authenticated & Anon).
-- =====================================================
-- 1. Ensure RLS is enabled (Standard Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
-- 2. PRODUCTS: Allow Public Read (Needed for Catalog) & Staff Write
DROP POLICY IF EXISTS "products_read_policy" ON products;
DROP POLICY IF EXISTS "products_write_policy" ON products;
DROP POLICY IF EXISTS "Allow read access for all users" ON products;
CREATE POLICY "products_read_policy" ON products FOR
SELECT USING (true);
-- Allow everyone to read products
CREATE POLICY "products_write_policy" ON products FOR ALL USING (auth.role() = 'authenticated');
-- Allow staff to modify
-- 3. CATEGORIES: Allow Public Read & Staff Write
DROP POLICY IF EXISTS "categories_read_policy" ON categories;
DROP POLICY IF EXISTS "categories_write_policy" ON categories;
CREATE POLICY "categories_read_policy" ON categories FOR
SELECT USING (true);
CREATE POLICY "categories_write_policy" ON categories FOR ALL USING (auth.role() = 'authenticated');
-- 4. RECIPES: Allow Staff Read/Write
DROP POLICY IF EXISTS "recipes_policy" ON recipes;
CREATE POLICY "recipes_policy" ON recipes FOR ALL USING (auth.role() = 'authenticated');
-- 5. PRODUCT UOMS: Allow Staff Read/Write
ALTER TABLE product_uoms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_uoms_policy" ON product_uoms;
CREATE POLICY "product_uoms_policy" ON product_uoms FOR ALL USING (auth.role() = 'authenticated');