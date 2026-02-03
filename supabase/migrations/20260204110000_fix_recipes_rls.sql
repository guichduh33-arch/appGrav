-- Fix RLS policies for recipes table to allow import for authenticated users
-- The previous policy required inventory.create permission which was too restrictive

-- Drop existing policies
DROP POLICY IF EXISTS "recipes_select" ON recipes;
DROP POLICY IF EXISTS "recipes_insert" ON recipes;
DROP POLICY IF EXISTS "recipes_update" ON recipes;
DROP POLICY IF EXISTS "recipes_delete" ON recipes;

-- Create simpler policies that allow all authenticated users to manage recipes
-- Recipes are not sensitive data and should be accessible to all staff

CREATE POLICY "recipes_select" ON recipes
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "recipes_insert" ON recipes
    FOR INSERT TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "recipes_update" ON recipes
    FOR UPDATE TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

CREATE POLICY "recipes_delete" ON recipes
    FOR DELETE TO authenticated
    USING (TRUE);
