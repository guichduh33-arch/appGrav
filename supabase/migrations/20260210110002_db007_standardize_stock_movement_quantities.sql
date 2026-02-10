-- =====================================================
-- DB-007: Standardize stock_movements quantities
-- =====================================================
-- Convention: quantities in stock_movements are ALWAYS positive.
-- The direction (in/out) is determined solely by movement_type.
--
-- Fixes:
-- 1. deduct_stock_on_sale_items() - was inserting negative quantities
-- 2. record_stock_before_after() - now uses movement_type to determine direction
--    for stock_after calculation, not the sign of the quantity
-- 3. Add a CHECK constraint to enforce positive quantities going forward
-- =====================================================

-- Fix record_stock_before_after() to use movement_type for direction
CREATE OR REPLACE FUNCTION record_stock_before_after()
RETURNS TRIGGER AS $$
DECLARE
    current_qty DECIMAL(10,3);
    signed_qty DECIMAL(10,3);
BEGIN
    SELECT current_stock INTO current_qty
    FROM products
    WHERE id = NEW.product_id;

    NEW.stock_before := COALESCE(current_qty, 0);

    -- Ensure quantity is stored as positive (convention)
    NEW.quantity := ABS(NEW.quantity);

    -- Determine signed quantity based on movement_type (not quantity sign)
    CASE NEW.movement_type
        WHEN 'purchase', 'production_in', 'adjustment_in', 'transfer_in' THEN
            signed_qty := NEW.quantity;
        WHEN 'sale_pos', 'sale_b2b', 'production_out', 'adjustment_out', 'waste', 'transfer_out', 'ingredient' THEN
            signed_qty := -NEW.quantity;
        ELSE
            signed_qty := NEW.quantity;
    END CASE;

    NEW.stock_after := NEW.stock_before + signed_qty;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION record_stock_before_after() IS 'BEFORE INSERT trigger on stock_movements. Ensures quantity is always positive (ABS). Calculates stock_before/stock_after using movement_type to determine direction. DB-007.';

-- Fix deduct_stock_on_sale_items() to insert positive quantities
CREATE OR REPLACE FUNCTION deduct_stock_on_sale_items()
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
BEGIN
    -- Determine sale movement type based on order type
    v_sale_movement_type := CASE
        WHEN NEW.order_type = 'b2b' THEN 'sale_b2b'::movement_type
        ELSE 'sale_pos'::movement_type
    END;

    -- Loop through all items in this order
    FOR v_item IN
        SELECT oi.id, oi.product_id, oi.quantity, oi.selected_variants
        FROM order_items oi
        WHERE oi.order_id = NEW.id
          AND oi.product_id IS NOT NULL
    LOOP
        -- Get product's deduct_ingredients flag
        SELECT COALESCE(deduct_ingredients, FALSE) INTO v_deduct_ingredients
        FROM products
        WHERE id = v_item.product_id;

        IF NOT v_deduct_ingredients THEN
            -- CASE 1: PRE-MADE PRODUCT - deduct the product itself
            INSERT INTO stock_movements (
                product_id,
                movement_type,
                quantity,
                reference_type,
                reference_id,
                reason
            )
            VALUES (
                v_item.product_id,
                v_sale_movement_type,
                v_item.quantity,  -- POSITIVE: direction from movement_type
                'order',
                NEW.id,
                'Sale of pre-made product'
            );

        ELSE
            -- CASE 2: MADE-TO-ORDER PRODUCT
            v_variant_material_ids := '{}';

            -- PHASE 1: Process variant materials
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
                    v_variant_material_ids := array_append(
                        v_variant_material_ids,
                        v_variant_material.material_id
                    );

                    INSERT INTO stock_movements (
                        product_id,
                        movement_type,
                        quantity,
                        reference_type,
                        reference_id,
                        reason
                    )
                    VALUES (
                        v_variant_material.material_id,
                        v_sale_movement_type,
                        (v_variant_material.quantity_needed * v_item.quantity),  -- POSITIVE
                        'order',
                        NEW.id,
                        'Variant ingredient for made-to-order sale'
                    );
                END LOOP;
            END IF;

            -- PHASE 2: Deduct recipe ingredients NOT replaced by variants
            FOR v_recipe IN
                SELECT r.material_id, r.quantity as quantity_needed
                FROM recipes r
                WHERE r.product_id = v_item.product_id
                  AND r.is_active = TRUE
                  AND r.material_id != ALL(v_variant_material_ids)
            LOOP
                INSERT INTO stock_movements (
                    product_id,
                    movement_type,
                    quantity,
                    reference_type,
                    reference_id,
                    reason
                )
                VALUES (
                    v_recipe.material_id,
                    v_sale_movement_type,
                    (v_recipe.quantity_needed * v_item.quantity),  -- POSITIVE
                    'order',
                    NEW.id,
                    'Ingredient for made-to-order sale'
                );
            END LOOP;

        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION deduct_stock_on_sale_items() IS 'Automatically deducts stock when order is finalized. DB-007: All quantities are now positive; direction determined by movement_type (sale_pos/sale_b2b).';

-- Fix existing negative quantities in the database
UPDATE stock_movements
SET quantity = ABS(quantity)
WHERE quantity < 0;

-- Add CHECK constraint to enforce positive quantities going forward
-- (drop first if it exists to be idempotent)
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS chk_stock_movements_positive_qty;
ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_positive_qty CHECK (quantity >= 0);
