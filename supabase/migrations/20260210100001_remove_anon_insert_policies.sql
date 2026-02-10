-- SEC-008: Remove anonymous INSERT policies and unrestricted public SELECT on user_profiles

-- 1. Drop anon INSERT policies that allow unauthenticated writes
DROP POLICY IF EXISTS "categories_insert_anon" ON public.categories;
DROP POLICY IF EXISTS "products_insert_anon" ON public.products;
DROP POLICY IF EXISTS "Allow anon insert product_sections" ON public.product_sections;

-- 2. Drop the overly permissive public SELECT on user_profiles (allows anon to see all profiles)
DROP POLICY IF EXISTS "user_profiles_select_for_login" ON public.user_profiles;

-- 3. Also drop the anon read on product_sections (should be authenticated only)
DROP POLICY IF EXISTS "Allow anon read product_sections" ON public.product_sections;

-- 4. Ensure authenticated SELECT on user_profiles exists (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_profiles'
        AND policyname = 'user_profiles_select_basic'
        AND schemaname = 'public'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'user_profiles'
            AND policyname = 'user_profiles_select'
            AND schemaname = 'public'
        ) THEN
            CREATE POLICY "user_profiles_select_authenticated" ON public.user_profiles
                FOR SELECT TO authenticated
                USING (true);
        END IF;
    END IF;
END $$;
