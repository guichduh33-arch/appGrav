-- C2: Fix deduct_stock_on_sale_items() to also update section_stock
-- Previously, the function only inserted stock_movements but never updated
-- section_stock, which is the source of truth for stock by section.
-- The sync_product_total_stock trigger on section_stock will automatically
-- update products.current_stock when section_stock changes.

CREATE OR REPLACE FUNCTION public.deduct_stock_on_sale_items()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item RECORD;
    v_deduct_ingredients BOOLEAN;
    v_recipe RECORD;
    v_variant_material RECORD;
    v_sale_movement_type movement_type;
    v_variant_material_ids UUID[] := '{}';
    v_product_section_id UUID;
BEGIN
    v_sale_movement_type := CASE
        WHEN NEW.order_type = 'b2b' THEN 'sale_b2b'::movement_type
        ELSE 'sale_pos'::movement_type
    END;

    FOR v_item IN
        SELECT oi.id, oi.product_id, oi.quantity, oi.selected_variants
        FROM order_items oi
        WHERE oi.order_id = NEW.id
          AND oi.product_id IS NOT NULL
    LOOP
        SELECT COALESCE(deduct_ingredients, FALSE), section_id
        INTO v_deduct_ingredients, v_product_section_id
        FROM products
        WHERE id = v_item.product_id;

        IF NOT v_deduct_ingredients THEN
            -- Insert stock movement for pre-made product
            INSERT INTO stock_movements (
                product_id, movement_type, quantity, reference_type, reference_id, reason
            ) VALUES (
                v_item.product_id, v_sale_movement_type,
                v_item.quantity,
                'order', NEW.id, 'Sale of pre-made product'
            );

            -- Deduct from section_stock (if product has a section)
            IF v_product_section_id IS NOT NULL THEN
                UPDATE section_stock
                SET quantity = GREATEST(0, quantity - v_item.quantity),
                    updated_at = NOW()
                WHERE product_id = v_item.product_id
                  AND section_id = v_product_section_id;
            END IF;
        ELSE
            v_variant_material_ids := '{}';

            IF v_item.selected_variants IS NOT NULL AND jsonb_array_length(v_item.selected_variants) > 0 THEN
                FOR v_variant_material IN
                    SELECT
                        (mat->>'materialId')::UUID as material_id,
                        (mat->>'quantity')::DECIMAL as quantity_needed
                    FROM jsonb_array_elements(v_item.selected_variants) AS variant,
                         jsonb_array_elements(COALESCE(variant->'materials', '[]'::jsonb)) AS mat
                    WHERE mat->>'materialId' IS NOT NULL
                      AND (mat->>'materialId')::UUID IS NOT NULL
                LOOP
                    v_variant_material_ids := array_append(v_variant_material_ids, v_variant_material.material_id);

                    INSERT INTO stock_movements (
                        product_id, movement_type, quantity, reference_type, reference_id, reason
                    ) VALUES (
                        v_variant_material.material_id, v_sale_movement_type,
                        (v_variant_material.quantity_needed * v_item.quantity),
                        'order', NEW.id, 'Variant ingredient for made-to-order sale'
                    );

                    -- Deduct variant material from section_stock
                    UPDATE section_stock
                    SET quantity = GREATEST(0, quantity - (v_variant_material.quantity_needed * v_item.quantity)),
                        updated_at = NOW()
                    WHERE product_id = v_variant_material.material_id
                      AND section_id = (SELECT section_id FROM products WHERE id = v_variant_material.material_id);
                END LOOP;
            END IF;

            FOR v_recipe IN
                SELECT r.material_id, r.quantity as quantity_needed
                FROM recipes r
                WHERE r.product_id = v_item.product_id
                  AND r.is_active = TRUE
                  AND r.material_id != ALL(v_variant_material_ids)
            LOOP
                INSERT INTO stock_movements (
                    product_id, movement_type, quantity, reference_type, reference_id, reason
                ) VALUES (
                    v_recipe.material_id, v_sale_movement_type,
                    (v_recipe.quantity_needed * v_item.quantity),
                    'order', NEW.id, 'Ingredient for made-to-order sale'
                );

                -- Deduct recipe material from section_stock
                UPDATE section_stock
                SET quantity = GREATEST(0, quantity - (v_recipe.quantity_needed * v_item.quantity)),
                    updated_at = NOW()
                WHERE product_id = v_recipe.material_id
                  AND section_id = (SELECT section_id FROM products WHERE id = v_recipe.material_id);
            END LOOP;
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;
