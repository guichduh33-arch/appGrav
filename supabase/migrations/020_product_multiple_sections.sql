-- =====================================================
-- MIGRATION: Product Multiple Sections Support
-- Description: Allows a product to belong to multiple sections
--              (e.g., sugar can be used in both pastry and bakery)
-- =====================================================

-- 1. Create junction table for product-sections many-to-many relationship
CREATE TABLE IF NOT EXISTS public.product_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, section_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_sections_product ON public.product_sections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sections_section ON public.product_sections(section_id);

-- 3. Migrate existing data from default_producing_section_id
INSERT INTO public.product_sections (product_id, section_id, is_primary)
SELECT id, default_producing_section_id, true
FROM public.products
WHERE default_producing_section_id IS NOT NULL
ON CONFLICT (product_id, section_id) DO NOTHING;

-- 4. Disable RLS for now (same as sections table)
ALTER TABLE public.product_sections DISABLE ROW LEVEL SECURITY;

-- 5. Create helper view for products with their sections
CREATE OR REPLACE VIEW public.view_product_with_sections AS
SELECT
    p.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', s.id,
                'name', s.name,
                'slug', s.slug,
                'is_primary', ps.is_primary
            )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
    ) as sections
FROM public.products p
LEFT JOIN public.product_sections ps ON p.id = ps.product_id
LEFT JOIN public.sections s ON ps.section_id = s.id
GROUP BY p.id;

-- 6. Update deduct_stock_on_sale to use primary section from product_sections
CREATE OR REPLACE FUNCTION deduct_stock_on_sale() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_producing_section_id UUID;
BEGIN
    -- Get the primary section for the product (or first section if no primary)
    SELECT section_id INTO v_producing_section_id
    FROM public.product_sections
    WHERE product_id = NEW.product_id
    ORDER BY is_primary DESC, created_at ASC
    LIMIT 1;

    -- Fallback to default_producing_section_id if no product_sections entry
    IF v_producing_section_id IS NULL THEN
        SELECT default_producing_section_id INTO v_producing_section_id
        FROM public.products
        WHERE id = NEW.product_id;
    END IF;

    -- If there is a producing section, deduct stock/record movement
    IF v_producing_section_id IS NOT NULL THEN
        -- Deduct from the producing section
        INSERT INTO public.product_stocks (section_id, product_id, quantity)
        VALUES (v_producing_section_id, NEW.product_id, -NEW.quantity)
        ON CONFLICT (section_id, product_id) DO UPDATE
        SET quantity = product_stocks.quantity - NEW.quantity;

        -- Log movement as 'sale'
        INSERT INTO public.stock_movements (
            product_id,
            from_section_id,
            quantity,
            movement_type,
            reference_id
        )
        VALUES (
            NEW.product_id,
            v_producing_section_id,
            -NEW.quantity,
            'sale',
            NEW.order_id::text
        );
    END IF;

    RETURN NEW;
END;
$$;
