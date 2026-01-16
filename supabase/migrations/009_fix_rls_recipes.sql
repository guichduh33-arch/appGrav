-- =====================================================
-- FIX RLS POLICIES FOR RECIPES TABLE
-- Run this in Supabase SQL Editor
-- =====================================================
-- Allow everyone to read recipes (needed for the modal to work)
CREATE POLICY "Allow public read access to recipes" ON recipes FOR
SELECT USING (true);
-- Also ensure products can be read (for the material join)
CREATE POLICY "Allow public read access to products" ON products FOR
SELECT USING (true);
-- Verify the policies were created
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('recipes', 'products');