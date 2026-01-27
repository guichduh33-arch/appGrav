-- ============================================
-- Fix product_sections foreign key references
-- Ensures product_id references products(id) and section_id references sections(id)
-- ============================================

-- Drop existing foreign key constraints if they exist
DO $$
BEGIN
    -- Drop product_id constraint if exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_sections_product_id_fkey'
    ) THEN
        ALTER TABLE public.product_sections DROP CONSTRAINT product_sections_product_id_fkey;
    END IF;

    -- Drop section_id constraint if exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_sections_section_id_fkey'
    ) THEN
        ALTER TABLE public.product_sections DROP CONSTRAINT product_sections_section_id_fkey;
    END IF;
END $$;

-- Clean up any invalid data (products or sections that don't exist)
DELETE FROM public.product_sections
WHERE product_id NOT IN (SELECT id FROM public.products)
   OR section_id NOT IN (SELECT id FROM public.sections);

-- Add correct foreign key constraints
ALTER TABLE public.product_sections
    ADD CONSTRAINT product_sections_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES public.products(id)
    ON DELETE CASCADE;

ALTER TABLE public.product_sections
    ADD CONSTRAINT product_sections_section_id_fkey
    FOREIGN KEY (section_id)
    REFERENCES public.sections(id)
    ON DELETE CASCADE;

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_product_sections_product ON public.product_sections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sections_section ON public.product_sections(section_id);

-- Repopulate if table is empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.product_sections LIMIT 1) THEN
        -- Insert associations between products and sections
        INSERT INTO public.product_sections (product_id, section_id, is_primary)
        SELECT
            p.id as product_id,
            s.id as section_id,
            false as is_primary
        FROM public.products p
        CROSS JOIN public.sections s
        WHERE
            p.product_type IN ('finished', 'semi_finished')
            AND p.is_active = true
            AND s.is_production_point = true
        ON CONFLICT (product_id, section_id) DO NOTHING;

        -- Mark first section as primary for each product
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
    END IF;
END $$;
