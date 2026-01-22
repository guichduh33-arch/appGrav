-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    is_sales_point BOOLEAN DEFAULT false,
    is_production_point BOOLEAN DEFAULT false,
    is_warehouse BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Insert default sections
INSERT INTO public.sections (name, slug, is_warehouse)
VALUES ('Main Warehouse', 'warehouse', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.sections (name, slug, is_production_point)
VALUES ('Breakery', 'breakery', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.sections (name, slug, is_production_point)
VALUES ('Pastry', 'pastry', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.sections (name, slug, is_production_point)
VALUES ('Viennoiserie', 'viennoiserie', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.sections (name, slug, is_production_point)
VALUES ('Hot Kitchen', 'hot_kitchen', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.sections (name, slug, is_sales_point)
VALUES ('Cafe', 'cafe', true) ON CONFLICT (slug) DO NOTHING;
-- Create product_stocks table
CREATE TABLE IF NOT EXISTS public.product_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.sections(id),
    product_id UUID REFERENCES public.products(id),
    quantity NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(section_id, product_id)
);
-- Update products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS default_producing_section_id UUID REFERENCES public.sections(id);
-- Update stock_movements table
ALTER TABLE public.stock_movements
ADD COLUMN IF NOT EXISTS from_section_id UUID REFERENCES public.sections(id);
ALTER TABLE public.stock_movements
ADD COLUMN IF NOT EXISTS to_section_id UUID REFERENCES public.sections(id);
-- Create transfer_stock function
CREATE OR REPLACE FUNCTION transfer_stock(
        p_product_id UUID,
        p_from_section_id UUID,
        p_to_section_id UUID,
        p_quantity NUMERIC
    ) RETURNS BOOLEAN LANGUAGE plpgsql AS $$ BEGIN -- Deduct from source
INSERT INTO public.product_stocks (section_id, product_id, quantity)
VALUES (p_from_section_id, p_product_id, - p_quantity) ON CONFLICT (section_id, product_id) DO
UPDATE
SET quantity = product_stocks.quantity - p_quantity;
-- Add to destination
INSERT INTO public.product_stocks (section_id, product_id, quantity)
VALUES (p_to_section_id, p_product_id, p_quantity) ON CONFLICT (section_id, product_id) DO
UPDATE
SET quantity = product_stocks.quantity + p_quantity;
-- Record movement
INSERT INTO public.stock_movements (
        product_id,
        from_section_id,
        to_section_id,
        quantity,
        movement_type
    )
VALUES (
        p_product_id,
        p_from_section_id,
        p_to_section_id,
        p_quantity,
        'transfer'
    );
RETURN TRUE;
END;
$$;
-- Function to deduct stock on sale
CREATE OR REPLACE FUNCTION deduct_stock_on_sale() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_producing_section_id UUID;
BEGIN -- Get the producing section for the product
SELECT default_producing_section_id INTO v_producing_section_id
FROM public.products
WHERE id = NEW.product_id;
-- If there is a producing section, deduct stock/record movement
IF v_producing_section_id IS NOT NULL THEN -- Deduct from the producing section
INSERT INTO public.product_stocks (section_id, product_id, quantity)
VALUES (
        v_producing_section_id,
        NEW.product_id,
        - NEW.quantity
    ) ON CONFLICT (section_id, product_id) DO
UPDATE
SET quantity = product_stocks.quantity - NEW.quantity;
-- Optional: Log movement as 'sale'
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
        - NEW.quantity,
        'sale',
        NEW.order_id::text
    );
END IF;
RETURN NEW;
END;
$$;
-- Create Trigger
DROP TRIGGER IF EXISTS trg_deduct_stock_on_sale ON public.order_items;
CREATE TRIGGER trg_deduct_stock_on_sale
AFTER
INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION deduct_stock_on_sale();