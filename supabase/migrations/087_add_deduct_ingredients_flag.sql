-- ============================================
-- Add flag to control ingredient deduction on sale
-- Some products are made-to-order (deduct ingredients on sale)
-- Others are batch-produced (ingredients already deducted during production)
-- ============================================

-- Add column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS deduct_ingredients_on_sale BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.products.deduct_ingredients_on_sale IS
'If true, deduct recipe ingredients when this product is sold (made-to-order items like coffee, sandwiches). If false, ingredients were already deducted during batch production (croissants, bread, etc.)';

-- Update the sales trigger to deduct ingredients when flag is true
CREATE OR REPLACE FUNCTION deduct_stock_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_stock DECIMAL;
    v_movement_id VARCHAR(30);
    v_order_type VARCHAR(20);
    v_deduct_ingredients BOOLEAN;
    v_recipe RECORD;
    v_material_stock DECIMAL;
BEGIN
    -- Get order type and product settings
    SELECT order_type INTO v_order_type
    FROM public.orders
    WHERE id = NEW.order_id;

    SELECT deduct_ingredients_on_sale INTO v_deduct_ingredients
    FROM public.products
    WHERE id = NEW.product_id;

    -- Get current stock
    SELECT COALESCE(current_stock, 0) INTO v_current_stock
    FROM public.products
    WHERE id = NEW.product_id;

    -- Generate movement ID for product
    v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

    -- Create stock movement for sold product
    INSERT INTO public.stock_movements (
        movement_id,
        product_id,
        movement_type,
        quantity,
        stock_before,
        stock_after,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
    VALUES (
        v_movement_id,
        NEW.product_id,
        CASE
            WHEN v_order_type = 'b2b' THEN 'sale_b2b'::movement_type
            ELSE 'sale_pos'::movement_type
        END,
        -NEW.quantity,
        v_current_stock,
        v_current_stock - NEW.quantity,
        'order',
        NEW.order_id,
        'Sale from order',
        auth.uid()
    );

    -- Update product stock
    UPDATE public.products
    SET current_stock = v_current_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    -- If product requires ingredient deduction on sale, deduct recipe materials
    IF v_deduct_ingredients THEN
        FOR v_recipe IN
            SELECT r.material_id, r.quantity as quantity_needed
            FROM public.recipes r
            WHERE r.product_id = NEW.product_id
              AND r.is_active = TRUE
        LOOP
            -- Get current material stock
            SELECT COALESCE(current_stock, 0) INTO v_material_stock
            FROM public.products
            WHERE id = v_recipe.material_id;

            -- Generate movement ID for material
            v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

            -- Create stock movement for material deduction
            INSERT INTO public.stock_movements (
                movement_id,
                product_id,
                movement_type,
                quantity,
                stock_before,
                stock_after,
                reference_type,
                reference_id,
                reason,
                staff_id
            )
            VALUES (
                v_movement_id,
                v_recipe.material_id,
                'production_out'::movement_type,
                -(v_recipe.quantity_needed * NEW.quantity),
                v_material_stock,
                v_material_stock - (v_recipe.quantity_needed * NEW.quantity),
                'order',
                NEW.order_id,
                'Ingredient deduction for sale',
                auth.uid()
            );

            -- Update material stock
            UPDATE public.products
            SET current_stock = v_material_stock - (v_recipe.quantity_needed * NEW.quantity),
                updated_at = NOW()
            WHERE id = v_recipe.material_id;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;

-- Recreate trigger (already exists but this ensures it's using the new function)
DROP TRIGGER IF EXISTS trg_deduct_stock_on_sale ON public.order_items;
CREATE TRIGGER trg_deduct_stock_on_sale
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION deduct_stock_on_sale();
