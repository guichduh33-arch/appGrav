-- ============================================
-- Story 5.10: Variant Ingredient Deduction
-- ============================================
-- Extends the trigger from Story 5.9 to support COMBINATION of variants + recipe:
-- 1. Collect all variant material IDs first
-- 2. Deduct variant materials with their specific quantities
-- 3. Deduct recipe ingredients ONLY if NOT replaced by variants
--
-- Key change: Replace "either/or" logic with "combine and exclude" logic
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
    v_sale_movement_type movement_type;
    -- NEW: Array to track variant material IDs for substitution logic
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
            -- ===========================================
            -- CASE 1: PRE-MADE PRODUCT
            -- Deduct the finished product itself (unchanged from 5.9)
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
                -v_item.quantity,
                'order',
                NEW.id,
                'Sale of pre-made product'
            );

        ELSE
            -- ===========================================
            -- CASE 2: MADE-TO-ORDER PRODUCT
            -- NEW LOGIC: Combine variants + recipe (exclude substituted)
            -- ===========================================

            -- Reset variant material IDs for each order item
            v_variant_material_ids := '{}';

            -- PHASE 1: Process all variant materials and track their IDs
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
                    -- Track this material ID for substitution exclusion
                    v_variant_material_ids := array_append(
                        v_variant_material_ids,
                        v_variant_material.material_id
                    );

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

            -- PHASE 2: Deduct recipe ingredients NOT replaced by variants
            -- This always runs (even if variants exist) to handle combination cases
            FOR v_recipe IN
                SELECT r.material_id, r.quantity as quantity_needed
                FROM recipes r
                WHERE r.product_id = v_item.product_id
                  AND r.is_active = TRUE
                  -- EXCLUDE ingredients that are replaced by variant materials
                  AND r.material_id != ALL(v_variant_material_ids)
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
            -- Note: If no recipes exist and no variants, the loops simply do nothing (graceful fallback)

        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION deduct_stock_on_sale_items() IS
'Automatically deducts stock when an order is finalized.
Pre-made products (deduct_ingredients=false): Deduct the product itself.
Made-to-order products (deduct_ingredients=true):
  - Phase 1: Deduct all variant materials
  - Phase 2: Deduct recipe ingredients NOT replaced by variant materials
This allows combinations like: coffee (from recipe) + oat milk (from variant).
Story 5.10 extends Story 5.9 with substitution logic.';

-- ============================================
-- TESTS: Story 5.10 Acceptance Criteria (DISABLED for db pull compatibility)
-- Tests below are commented out - run manually via SQL Editor if needed
-- ============================================
/*
-- These tests create temporary data, verify trigger behavior, and clean up.
-- Run with: supabase db execute --file <this_file> OR via Supabase Dashboard SQL Editor
--
-- IMPORTANT: Tests use DO blocks with EXCEPTION handling for rollback
-- ============================================

-- Test 1: Variant Substitution (AC1, AC4)
-- Café Latte with Oat Milk variant - should deduct coffee (recipe) + oat milk (variant), NOT regular milk
DO $$
DECLARE
    v_cafe_latte_id UUID := gen_random_uuid();
    v_coffee_id UUID := gen_random_uuid();
    v_milk_id UUID := gen_random_uuid();
    v_oat_milk_id UUID := gen_random_uuid();
    v_category_id UUID;
    v_order_id UUID := gen_random_uuid();
    v_pos_session_id UUID;
    v_movement_count INTEGER;
    v_coffee_deducted DECIMAL;
    v_oat_milk_deducted DECIMAL;
    v_regular_milk_deducted DECIMAL;
BEGIN
    RAISE NOTICE '=== Test 1: Variant Substitution (AC1, AC4) ===';

    -- Get first category for test products
    SELECT id INTO v_category_id FROM categories LIMIT 1;
    IF v_category_id IS NULL THEN
        RAISE NOTICE 'SKIP: No categories found for test';
        RETURN;
    END IF;

    -- Get a valid POS session
    SELECT id INTO v_pos_session_id FROM pos_sessions WHERE status = 'open' LIMIT 1;

    -- Create test products (raw materials)
    INSERT INTO products (id, name, category_id, retail_price, product_type, current_stock)
    VALUES
        (v_coffee_id, 'TEST_Coffee Grounds', v_category_id, 0, 'raw_material', 5000),
        (v_milk_id, 'TEST_Regular Milk', v_category_id, 0, 'raw_material', 10000),
        (v_oat_milk_id, 'TEST_Oat Milk', v_category_id, 0, 'raw_material', 10000);

    -- Create Café Latte (made-to-order product)
    INSERT INTO products (id, name, category_id, retail_price, product_type, deduct_ingredients, current_stock)
    VALUES (v_cafe_latte_id, 'TEST_Cafe Latte', v_category_id, 35000, 'finished', TRUE, 0);

    -- Create recipe: coffee 18g + regular milk 250ml
    INSERT INTO recipes (product_id, material_id, quantity, is_active)
    VALUES
        (v_cafe_latte_id, v_coffee_id, 18, TRUE),
        (v_cafe_latte_id, v_milk_id, 250, TRUE);

    -- Create order with Café Latte + Oat Milk variant
    INSERT INTO orders (id, order_number, status, order_type, subtotal, tax_amount, total, pos_session_id)
    VALUES (v_order_id, 'TEST-001', 'pending', 'dine_in', 35000, 3182, 35000, v_pos_session_id);

    -- Add order item with selected_variants containing oat milk material
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, selected_variants)
    VALUES (
        v_order_id,
        v_cafe_latte_id,
        1,
        35000,
        35000,
        '[{"groupName": "Milk Type", "optionIds": ["oat_milk"], "optionLabels": ["Oat Milk"], "materials": [{"materialId": "' || v_oat_milk_id || '", "quantity": 250}]}]'::jsonb
    );

    -- Trigger the stock deduction by completing the order
    UPDATE orders SET status = 'completed' WHERE id = v_order_id;

    -- Verify: Coffee should be deducted (from recipe)
    SELECT COALESCE(SUM(ABS(quantity)), 0) INTO v_coffee_deducted
    FROM stock_movements
    WHERE reference_id = v_order_id AND product_id = v_coffee_id;

    -- Verify: Oat milk should be deducted (from variant)
    SELECT COALESCE(SUM(ABS(quantity)), 0) INTO v_oat_milk_deducted
    FROM stock_movements
    WHERE reference_id = v_order_id AND product_id = v_oat_milk_id;

    -- Verify: Regular milk should NOT be deducted (replaced by variant)
    SELECT COALESCE(SUM(ABS(quantity)), 0) INTO v_regular_milk_deducted
    FROM stock_movements
    WHERE reference_id = v_order_id AND product_id = v_milk_id;

    -- Assert results
    IF v_coffee_deducted = 18 AND v_oat_milk_deducted = 250 AND v_regular_milk_deducted = 0 THEN
        RAISE NOTICE '✅ Test 1 PASSED: Coffee=18g, OatMilk=250ml, RegularMilk=0 (correctly substituted)';
    ELSE
        RAISE NOTICE '❌ Test 1 FAILED: Coffee=%, OatMilk=%, RegularMilk=% (expected 18, 250, 0)',
            v_coffee_deducted, v_oat_milk_deducted, v_regular_milk_deducted;
    END IF;

    -- Cleanup
    DELETE FROM stock_movements WHERE reference_id = v_order_id;
    DELETE FROM order_items WHERE order_id = v_order_id;
    DELETE FROM orders WHERE id = v_order_id;
    DELETE FROM recipes WHERE product_id = v_cafe_latte_id;
    DELETE FROM products WHERE id IN (v_cafe_latte_id, v_coffee_id, v_milk_id, v_oat_milk_id);

    RAISE NOTICE '=== Test 1 Complete ===';
END $$;

-- Test 2: Multiple Toppings (AC2)
-- Bubble Tea with tapioca + coconut jelly - should deduct BOTH toppings
DO $$
DECLARE
    v_bubble_tea_id UUID := gen_random_uuid();
    v_tea_id UUID := gen_random_uuid();
    v_tapioca_id UUID := gen_random_uuid();
    v_jelly_id UUID := gen_random_uuid();
    v_category_id UUID;
    v_order_id UUID := gen_random_uuid();
    v_pos_session_id UUID;
    v_tapioca_deducted DECIMAL;
    v_jelly_deducted DECIMAL;
BEGIN
    RAISE NOTICE '=== Test 2: Multiple Toppings (AC2) ===';

    SELECT id INTO v_category_id FROM categories LIMIT 1;
    IF v_category_id IS NULL THEN
        RAISE NOTICE 'SKIP: No categories found for test';
        RETURN;
    END IF;

    SELECT id INTO v_pos_session_id FROM pos_sessions WHERE status = 'open' LIMIT 1;

    -- Create test products
    INSERT INTO products (id, name, category_id, retail_price, product_type, current_stock)
    VALUES
        (v_tea_id, 'TEST_Black Tea', v_category_id, 0, 'raw_material', 10000),
        (v_tapioca_id, 'TEST_Tapioca Pearls', v_category_id, 0, 'raw_material', 5000),
        (v_jelly_id, 'TEST_Coconut Jelly', v_category_id, 0, 'raw_material', 5000);

    INSERT INTO products (id, name, category_id, retail_price, product_type, deduct_ingredients, current_stock)
    VALUES (v_bubble_tea_id, 'TEST_Bubble Tea', v_category_id, 25000, 'finished', TRUE, 0);

    -- Recipe: tea 300ml (base)
    INSERT INTO recipes (product_id, material_id, quantity, is_active)
    VALUES (v_bubble_tea_id, v_tea_id, 300, TRUE);

    -- Order with BOTH toppings as variants
    INSERT INTO orders (id, order_number, status, order_type, subtotal, tax_amount, total, pos_session_id)
    VALUES (v_order_id, 'TEST-002', 'pending', 'dine_in', 34000, 3091, 34000, v_pos_session_id);

    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, selected_variants)
    VALUES (
        v_order_id,
        v_bubble_tea_id,
        1,
        34000,
        34000,
        '[{"groupName": "Topping", "optionIds": ["tapioca", "jelly"], "optionLabels": ["Tapioca", "Jelly"], "materials": [{"materialId": "' || v_tapioca_id || '", "quantity": 50}, {"materialId": "' || v_jelly_id || '", "quantity": 40}]}]'::jsonb
    );

    -- Trigger deduction
    UPDATE orders SET status = 'completed' WHERE id = v_order_id;

    -- Verify BOTH toppings deducted
    SELECT COALESCE(SUM(ABS(quantity)), 0) INTO v_tapioca_deducted
    FROM stock_movements WHERE reference_id = v_order_id AND product_id = v_tapioca_id;

    SELECT COALESCE(SUM(ABS(quantity)), 0) INTO v_jelly_deducted
    FROM stock_movements WHERE reference_id = v_order_id AND product_id = v_jelly_id;

    IF v_tapioca_deducted = 50 AND v_jelly_deducted = 40 THEN
        RAISE NOTICE '✅ Test 2 PASSED: Tapioca=50g, Jelly=40g (both toppings deducted)';
    ELSE
        RAISE NOTICE '❌ Test 2 FAILED: Tapioca=%, Jelly=% (expected 50, 40)',
            v_tapioca_deducted, v_jelly_deducted;
    END IF;

    -- Cleanup
    DELETE FROM stock_movements WHERE reference_id = v_order_id;
    DELETE FROM order_items WHERE order_id = v_order_id;
    DELETE FROM orders WHERE id = v_order_id;
    DELETE FROM recipes WHERE product_id = v_bubble_tea_id;
    DELETE FROM products WHERE id IN (v_bubble_tea_id, v_tea_id, v_tapioca_id, v_jelly_id);

    RAISE NOTICE '=== Test 2 Complete ===';
END $$;

-- Test 3: Proportional Quantity (AC3)
-- Sugar level 50% variant with 15ml instead of recipe's 30ml
DO $$
DECLARE
    v_drink_id UUID := gen_random_uuid();
    v_sugar_syrup_id UUID := gen_random_uuid();
    v_category_id UUID;
    v_order_id UUID := gen_random_uuid();
    v_pos_session_id UUID;
    v_sugar_deducted DECIMAL;
BEGIN
    RAISE NOTICE '=== Test 3: Proportional Quantity (AC3) ===';

    SELECT id INTO v_category_id FROM categories LIMIT 1;
    IF v_category_id IS NULL THEN
        RAISE NOTICE 'SKIP: No categories found for test';
        RETURN;
    END IF;

    SELECT id INTO v_pos_session_id FROM pos_sessions WHERE status = 'open' LIMIT 1;

    -- Create products
    INSERT INTO products (id, name, category_id, retail_price, product_type, current_stock)
    VALUES (v_sugar_syrup_id, 'TEST_Sugar Syrup', v_category_id, 0, 'raw_material', 10000);

    INSERT INTO products (id, name, category_id, retail_price, product_type, deduct_ingredients, current_stock)
    VALUES (v_drink_id, 'TEST_Sweet Drink', v_category_id, 20000, 'finished', TRUE, 0);

    -- Recipe: sugar syrup 30ml (100% = default)
    INSERT INTO recipes (product_id, material_id, quantity, is_active)
    VALUES (v_drink_id, v_sugar_syrup_id, 30, TRUE);

    -- Order with 50% sugar variant (15ml)
    INSERT INTO orders (id, order_number, status, order_type, subtotal, tax_amount, total, pos_session_id)
    VALUES (v_order_id, 'TEST-003', 'pending', 'dine_in', 20000, 1818, 20000, v_pos_session_id);

    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, selected_variants)
    VALUES (
        v_order_id,
        v_drink_id,
        1,
        20000,
        20000,
        '[{"groupName": "Sugar Level", "optionIds": ["50_percent"], "optionLabels": ["50%"], "materials": [{"materialId": "' || v_sugar_syrup_id || '", "quantity": 15}]}]'::jsonb
    );

    UPDATE orders SET status = 'completed' WHERE id = v_order_id;

    -- Should deduct 15ml (from variant), NOT 30ml (from recipe)
    SELECT COALESCE(SUM(ABS(quantity)), 0) INTO v_sugar_deducted
    FROM stock_movements WHERE reference_id = v_order_id AND product_id = v_sugar_syrup_id;

    IF v_sugar_deducted = 15 THEN
        RAISE NOTICE '✅ Test 3 PASSED: Sugar=15ml (proportional quantity from variant)';
    ELSE
        RAISE NOTICE '❌ Test 3 FAILED: Sugar=% (expected 15, variant replaces recipe)',
            v_sugar_deducted;
    END IF;

    -- Cleanup
    DELETE FROM stock_movements WHERE reference_id = v_order_id;
    DELETE FROM order_items WHERE order_id = v_order_id;
    DELETE FROM orders WHERE id = v_order_id;
    DELETE FROM recipes WHERE product_id = v_drink_id;
    DELETE FROM products WHERE id IN (v_drink_id, v_sugar_syrup_id);

    RAISE NOTICE '=== Test 3 Complete ===';
END $$;

-- Test 4: Variant Without Materials (AC5)
-- Size variant with price only (no materials) - recipe should be fully deducted
DO $$
DECLARE
    v_product_id UUID := gen_random_uuid();
    v_ingredient_id UUID := gen_random_uuid();
    v_category_id UUID;
    v_order_id UUID := gen_random_uuid();
    v_pos_session_id UUID;
    v_ingredient_deducted DECIMAL;
BEGIN
    RAISE NOTICE '=== Test 4: Variant Without Materials (AC5) ===';

    SELECT id INTO v_category_id FROM categories LIMIT 1;
    IF v_category_id IS NULL THEN
        RAISE NOTICE 'SKIP: No categories found for test';
        RETURN;
    END IF;

    SELECT id INTO v_pos_session_id FROM pos_sessions WHERE status = 'open' LIMIT 1;

    -- Create products
    INSERT INTO products (id, name, category_id, retail_price, product_type, current_stock)
    VALUES (v_ingredient_id, 'TEST_Base Ingredient', v_category_id, 0, 'raw_material', 10000);

    INSERT INTO products (id, name, category_id, retail_price, product_type, deduct_ingredients, current_stock)
    VALUES (v_product_id, 'TEST_Product With Recipe', v_category_id, 15000, 'finished', TRUE, 0);

    -- Recipe: ingredient 100g
    INSERT INTO recipes (product_id, material_id, quantity, is_active)
    VALUES (v_product_id, v_ingredient_id, 100, TRUE);

    -- Order with SIZE variant (no materials, price-only adjustment)
    INSERT INTO orders (id, order_number, status, order_type, subtotal, tax_amount, total, pos_session_id)
    VALUES (v_order_id, 'TEST-004', 'pending', 'dine_in', 18000, 1636, 18000, v_pos_session_id);

    INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, selected_variants)
    VALUES (
        v_order_id,
        v_product_id,
        1,
        18000,
        18000,
        -- Variant with NO materials array (price-only)
        '[{"groupName": "Size", "optionIds": ["large"], "optionLabels": ["Large"], "priceAdjustment": 3000}]'::jsonb
    );

    UPDATE orders SET status = 'completed' WHERE id = v_order_id;

    -- Recipe ingredient should be fully deducted (variant has no materials to replace)
    SELECT COALESCE(SUM(ABS(quantity)), 0) INTO v_ingredient_deducted
    FROM stock_movements WHERE reference_id = v_order_id AND product_id = v_ingredient_id;

    IF v_ingredient_deducted = 100 THEN
        RAISE NOTICE '✅ Test 4 PASSED: Ingredient=100g (recipe fully deducted, variant has no materials)';
    ELSE
        RAISE NOTICE '❌ Test 4 FAILED: Ingredient=% (expected 100)',
            v_ingredient_deducted;
    END IF;

    -- Cleanup
    DELETE FROM stock_movements WHERE reference_id = v_order_id;
    DELETE FROM order_items WHERE order_id = v_order_id;
    DELETE FROM orders WHERE id = v_order_id;
    DELETE FROM recipes WHERE product_id = v_product_id;
    DELETE FROM products WHERE id IN (v_product_id, v_ingredient_id);

    RAISE NOTICE '=== Test 4 Complete ===';
END $$;

-- ============================================
-- END OF TESTS
-- ============================================
RAISE NOTICE '';
RAISE NOTICE '=== Story 5.10 Tests Complete ===';
RAISE NOTICE 'Check output above for PASSED/FAILED status';
RAISE NOTICE '';
*/
