-- DB-002: Fix purchase_order_items RLS policies
-- Replace "public" role policies with "authenticated" role policies

-- Drop all existing policies (both old and potentially conflicting names)
DROP POLICY IF EXISTS "Authenticated users can view purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Authenticated users can insert purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Authenticated users can update purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Authenticated users can delete purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow authenticated read purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow authenticated insert purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow authenticated update purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow authenticated delete purchase_order_items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "po_items_select" ON public.purchase_order_items;
DROP POLICY IF EXISTS "po_items_insert" ON public.purchase_order_items;
DROP POLICY IF EXISTS "po_items_update" ON public.purchase_order_items;
DROP POLICY IF EXISTS "po_items_delete" ON public.purchase_order_items;
DROP POLICY IF EXISTS "poi_select" ON public.purchase_order_items;
DROP POLICY IF EXISTS "poi_insert" ON public.purchase_order_items;
DROP POLICY IF EXISTS "poi_update" ON public.purchase_order_items;
DROP POLICY IF EXISTS "poi_delete" ON public.purchase_order_items;

-- Ensure RLS is enabled
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create new properly scoped policies (authenticated role only)
CREATE POLICY "poi_select" ON public.purchase_order_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "poi_insert" ON public.purchase_order_items
    FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "poi_update" ON public.purchase_order_items
    FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "poi_delete" ON public.purchase_order_items
    FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
