-- ============================================
-- Story 5.9: Stock Deduction on Sale (Auto)
-- ============================================
-- This trigger automatically deducts stock when an order is finalized
-- (status changes to 'completed' or 'paid').
--
-- Key behaviors:
-- 1. Pre-made products (deduct_ingredients = false): Deduct the product itself
-- 2. Made-to-order products (deduct_ingredients = true): Deduct recipe ingredients ONLY
-- 3. Variant materials: If selected_variants contain materials, use those instead of recipe
-- 4. Graceful fallback: No error if no recipe exists for made-to-order product
--
-- IMPORTANT: This function only creates stock_movements.
-- The existing trigger tr_update_product_stock automatically updates products.current_stock.
-- ============================================

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
    v_has_variant_materials BOOLEAN;
    v_sale_movement_type movement_type;
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
            -- ===========================================
            -- CASE 1: PRE-MADE PRODUCT
            -- Deduct the finished product itself
            -- ===========================================
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
                -v_item.quantity,  -- Negative for deduction
                'order',
                NEW.id,
                'Sale of pre-made product'
            );

        ELSE
            -- ===========================================
            -- CASE 2: MADE-TO-ORDER PRODUCT
            -- Deduct ingredients ONLY (not the product itself)
            -- ===========================================

            -- Check if selected_variants contains materials
            v_has_variant_materials := FALSE;

            IF v_item.selected_variants IS NOT NULL AND jsonb_array_length(v_item.selected_variants) > 0 THEN
                -- Loop through variants to find materials
                FOR v_variant_material IN
                    SELECT
                        (mat->>'materialId')::UUID as material_id,
                        (mat->>'quantity')::DECIMAL as quantity_needed
                    FROM jsonb_array_elements(v_item.selected_variants) AS variant,
                         jsonb_array_elements(variant->'materials') AS mat
                    WHERE mat->>'materialId' IS NOT NULL
                      AND (mat->>'materialId')::UUID IS NOT NULL
                LOOP
                    v_has_variant_materials := TRUE;

                    -- Create stock movement for variant material
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
                        -(v_variant_material.quantity_needed * v_item.quantity),
                        'order',
                        NEW.id,
                        'Variant ingredient for made-to-order sale'
                    );
                END LOOP;
            END IF;

            -- If no variant materials found, fall back to recipe ingredients
            IF NOT v_has_variant_materials THEN
                FOR v_recipe IN
                    SELECT r.material_id, r.quantity as quantity_needed
                    FROM recipes r
                    WHERE r.product_id = v_item.product_id
                      AND r.is_active = TRUE
                LOOP
                    -- Create stock movement for recipe ingredient
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
                        -(v_recipe.quantity_needed * v_item.quantity),
                        'order',
                        NEW.id,
                        'Ingredient for made-to-order sale'
                    );
                END LOOP;
                -- Note: If no recipes exist, the loop simply does nothing (graceful fallback)
            END IF;

        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

-- ============================================
-- CREATE TRIGGER
-- ============================================
-- Only fires when order status changes TO completed/paid FROM a non-finalized state

-- Note: order_status enum only has 'completed', not 'paid'
-- Payment status is tracked separately in payment_status column
CREATE TRIGGER tr_deduct_stock_on_sale
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (
    NEW.status = 'completed'
    AND OLD.status <> 'completed'
)
EXECUTE FUNCTION deduct_stock_on_sale_items();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION deduct_stock_on_sale_items() IS 'Automatically deducts stock when an order is finalized. Pre-made products deduct the product itself; made-to-order products deduct recipe ingredients or variant materials.';

COMMENT ON TRIGGER tr_deduct_stock_on_sale ON orders IS 'Triggers stock deduction when order status changes to completed.';
