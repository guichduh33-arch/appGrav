-- Migration: 077_fix_sections_rls.sql
-- Description: Fix RLS on sections table to allow operations with anon key
-- The app uses PIN-based auth (not Supabase Auth), so auth.uid() is always NULL

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "select_all_sections" ON public.sections;
DROP POLICY IF EXISTS "insert_sections_admin" ON public.sections;
DROP POLICY IF EXISTS "update_sections_admin" ON public.sections;
DROP POLICY IF EXISTS "delete_sections_admin" ON public.sections;
DROP POLICY IF EXISTS "Authenticated users can read sections" ON public.sections;
DROP POLICY IF EXISTS "Admins can manage sections" ON public.sections;

-- Create permissive policies for the internal bakery app
-- SELECT: Anyone can read sections
CREATE POLICY "Anyone can read sections" ON public.sections
    FOR SELECT
    USING (true);

-- INSERT: Allow inserts (app handles authorization via PIN login)
CREATE POLICY "Allow section inserts" ON public.sections
    FOR INSERT
    WITH CHECK (true);

-- UPDATE: Allow updates (app handles authorization via PIN login)
CREATE POLICY "Allow section updates" ON public.sections
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- DELETE: Allow deletes (app handles authorization via PIN login)
CREATE POLICY "Allow section deletes" ON public.sections
    FOR DELETE
    USING (true);

-- Verify RLS is enabled
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.sections TO anon, authenticated;
