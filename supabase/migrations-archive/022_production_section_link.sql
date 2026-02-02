-- =====================================================
-- MIGRATION: Production Records - Section Link
-- Description: Add section_id to production_records
--              to track which section produced the item
-- =====================================================

-- 1. Add section_id to production_records
ALTER TABLE public.production_records
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;

-- 2. Add created_by to track who entered the production
ALTER TABLE public.production_records
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_production_records_section ON public.production_records(section_id);
CREATE INDEX IF NOT EXISTS idx_production_records_date_section ON public.production_records(production_date, section_id);

-- 4. Create view for production with section info
CREATE OR REPLACE VIEW public.view_production_by_section AS
SELECT
    pr.*,
    p.name as product_name,
    p.sku as product_sku,
    c.name as category_name,
    c.icon as category_icon,
    s.name as section_name
FROM public.production_records pr
LEFT JOIN public.products p ON pr.product_id = p.id
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.sections s ON pr.section_id = s.id
ORDER BY pr.production_date DESC, pr.created_at DESC;
