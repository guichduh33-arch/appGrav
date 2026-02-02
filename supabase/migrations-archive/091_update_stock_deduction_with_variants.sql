-- ============================================
-- Mise à jour de la déduction de stock pour gérer les variants
-- Si des variants avec ingrédients sont sélectionnés, on déduit ces ingrédients
-- Sinon, on utilise la recette de base (comportement actuel)
-- ============================================

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
    v_sale_movement_type movement_type;
    v_variant_material RECORD;
    v_has_variant_materials BOOLEAN := FALSE;
BEGIN
    -- Get order type and product settings
    SELECT order_type INTO v_order_type
    FROM public.orders
    WHERE id = NEW.order_id;

    SELECT deduct_ingredients_on_sale INTO v_deduct_ingredients
    FROM public.products
    WHERE id = NEW.product_id;

    -- Determine sale movement type
    v_sale_movement_type := CASE
        WHEN v_order_type = 'b2b' THEN 'sale_b2b'::movement_type
        ELSE 'sale_pos'::movement_type
    END;

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
        v_sale_movement_type,
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

    -- If product requires ingredient deduction on sale
    IF v_deduct_ingredients THEN
        -- Check if variants with materials are selected
        IF NEW.selected_variants IS NOT NULL AND jsonb_array_length((NEW.selected_variants->'variants')::jsonb) > 0 THEN
            -- Loop through variants to find materials
            FOR v_variant_material IN
                SELECT
                    (material->>'materialId')::UUID as material_id,
                    (material->>'quantity')::DECIMAL as quantity_needed
                FROM jsonb_array_elements(NEW.selected_variants->'variants') AS variant,
                     jsonb_array_elements(variant->'materials') AS material
                WHERE material->>'materialId' IS NOT NULL
            LOOP
                v_has_variant_materials := TRUE;

                -- Get current material stock
                SELECT COALESCE(current_stock, 0) INTO v_material_stock
                FROM public.products
                WHERE id = v_variant_material.material_id;

                -- Generate movement ID for material
                v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

                -- Create stock movement for variant material deduction
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
                    v_variant_material.material_id,
                    v_sale_movement_type,
                    -(v_variant_material.quantity_needed * NEW.quantity),
                    v_material_stock,
                    v_material_stock - (v_variant_material.quantity_needed * NEW.quantity),
                    'order',
                    NEW.order_id,
                    'Variant ingredient for made-to-order sale',
                    auth.uid()
                );

                -- Update material stock
                UPDATE public.products
                SET current_stock = v_material_stock - (v_variant_material.quantity_needed * NEW.quantity),
                    updated_at = NOW()
                WHERE id = v_variant_material.material_id;
            END LOOP;
        END IF;

        -- If no variant materials found, fall back to recipe ingredients
        IF NOT v_has_variant_materials THEN
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

                -- Create stock movement for material deduction with SALE type
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
                    v_sale_movement_type,
                    -(v_recipe.quantity_needed * NEW.quantity),
                    v_material_stock,
                    v_material_stock - (v_recipe.quantity_needed * NEW.quantity),
                    'order',
                    NEW.order_id,
                    'Ingredient for made-to-order sale',
                    auth.uid()
                );

                -- Update material stock
                UPDATE public.products
                SET current_stock = v_material_stock - (v_recipe.quantity_needed * NEW.quantity),
                    updated_at = NOW()
                WHERE id = v_recipe.material_id;
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger already exists, no need to recreate
