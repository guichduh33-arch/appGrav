-- ============================================
-- Populate product_sections table
-- Associates all finished/semi-finished products with all production sections
-- ============================================

-- Clear existing data to avoid conflicts
TRUNCATE TABLE public.product_sections CASCADE;

-- Insert associations between products and sections
-- Each finished/semi_finished product will be associated with ALL production sections
INSERT INTO public.product_sections (product_id, section_id, is_primary)
SELECT
    p.id as product_id,
    s.id as section_id,
    false as is_primary  -- None are marked as primary initially
FROM public.products p
CROSS JOIN public.sections s
WHERE
    p.product_type IN ('finished', 'semi_finished')
    AND p.is_active = true
    AND s.is_production_point = true
ON CONFLICT (product_id, section_id) DO NOTHING;

-- Optionally, mark the first section as primary for each product
-- This updates the first association for each product to be the primary one
WITH ranked_sections AS (
    SELECT
        ps.product_id,
        ps.section_id,
        ROW_NUMBER() OVER (PARTITION BY ps.product_id ORDER BY s.name) as rn
    FROM public.product_sections ps
    JOIN public.sections s ON s.id = ps.section_id
)
UPDATE public.product_sections ps
SET is_primary = true
FROM ranked_sections rs
WHERE ps.product_id = rs.product_id
    AND ps.section_id = rs.section_id
    AND rs.rn = 1;
