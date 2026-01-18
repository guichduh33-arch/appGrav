-- =====================================================
-- MIGRATION: Product UOM Context Preferences
-- Description: Add stock_opname_unit flag to product_uoms
--              and preferred unit settings to products
-- =====================================================

-- 1. Add is_stock_opname_unit to product_uoms
ALTER TABLE public.product_uoms
ADD COLUMN IF NOT EXISTS is_stock_opname_unit BOOLEAN DEFAULT false;

-- 2. Add preferred unit references to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS preferred_stock_unit_id UUID REFERENCES public.product_uoms(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS preferred_recipe_unit_id UUID REFERENCES public.product_uoms(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS preferred_purchase_unit_id UUID REFERENCES public.product_uoms(id) ON DELETE SET NULL;

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_preferred_units ON public.products(preferred_stock_unit_id, preferred_recipe_unit_id, preferred_purchase_unit_id);
