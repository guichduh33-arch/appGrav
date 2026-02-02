-- ============================================
-- Update deduct_production_ingredients function
-- Fix column names: notes->reason, created_by->staff_id
-- Add stock_before and stock_after
-- ============================================

CREATE OR REPLACE FUNCTION public.deduct_production_ingredients(
    p_production_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product_id UUID;
    v_quantity DECIMAL;
    v_recipe RECORD;
    v_material_stock DECIMAL;
    v_product_stock DECIMAL;
BEGIN
    -- Get production record details
    SELECT product_id, quantity_produced
    INTO v_product_id, v_quantity
    FROM public.production_records
    WHERE id = p_production_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Production record not found';
    END IF;

    -- Deduct each material based on recipe
    FOR v_recipe IN
        SELECT r.material_id, r.quantity as quantity_needed, p.name as material_name
        FROM public.recipes r
        JOIN public.products p ON p.id = r.material_id
        WHERE r.product_id = v_product_id
          AND r.is_active = TRUE
    LOOP
        -- Get current stock before deduction
        SELECT COALESCE(current_stock, 0) INTO v_material_stock
        FROM public.products
        WHERE id = v_recipe.material_id;

        -- Create stock movement for deduction
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
            'MV-' || gen_random_uuid()::text,
            v_recipe.material_id,
            'production_out',
            -(v_recipe.quantity_needed * v_quantity),
            v_material_stock,
            v_material_stock - (v_recipe.quantity_needed * v_quantity),
            'production',
            p_production_id,
            'Déduction automatique pour production',
            auth.uid()
        );

        -- Update product stock
        UPDATE public.products
        SET current_stock = COALESCE(current_stock, 0) - (v_recipe.quantity_needed * v_quantity),
            updated_at = NOW()
        WHERE id = v_recipe.material_id;
    END LOOP;

    -- Also increase stock of produced item
    SELECT COALESCE(current_stock, 0) INTO v_product_stock
    FROM public.products
    WHERE id = v_product_id;

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
        'MV-' || gen_random_uuid()::text,
        v_product_id,
        'production_in',
        v_quantity,
        v_product_stock,
        v_product_stock + v_quantity,
        'production',
        p_production_id,
        'Production enregistrée',
        auth.uid()
    );

    UPDATE public.products
    SET current_stock = COALESCE(current_stock, 0) + v_quantity,
        updated_at = NOW()
    WHERE id = v_product_id;

    RETURN TRUE;
END;
$$;
