-- =====================================================
-- DB-006: Fix finalize_inventory_count() to use section_stock
-- =====================================================
-- Problem: After DB-005 disabled tr_update_product_stock, finalize_inventory_count()
-- does a direct UPDATE of products.current_stock which bypasses sync_product_total_stock().
-- Since section_stock is the source of truth (via trg_sync_product_stock),
-- finalize_inventory_count() must update section_stock instead.
--
-- Logic: For each inventory count item with variance:
--   1. Insert stock_movement (adjustment_in or adjustment_out)
--   2. UPSERT into section_stock (use count's section_id or default warehouse)
--   3. Let trg_sync_product_stock propagate to products.current_stock
-- =====================================================

-- Drop old signature(s) for clean replacement
DROP FUNCTION IF EXISTS finalize_inventory_count(UUID, UUID);
DROP FUNCTION IF EXISTS finalize_inventory_count(UUID);

CREATE OR REPLACE FUNCTION finalize_inventory_count(count_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_record RECORD;
    item_record RECORD;
    v_current_stock DECIMAL;
    v_movement_id VARCHAR(30);
    v_variance DECIMAL;
    v_user_id UUID;
    v_user_profile_id UUID;
    v_target_section_id UUID;
BEGIN
    -- SECURITY: Get the actual caller's identity from auth context
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get user profile ID
    SELECT id INTO v_user_profile_id
    FROM user_profiles
    WHERE auth_user_id = v_user_id
    LIMIT 1;

    IF v_user_profile_id IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    -- SECURITY: Verify caller has the required permission
    IF NOT user_has_permission(v_user_profile_id, 'inventory.adjust') THEN
        RAISE EXCEPTION 'Permission denied: inventory.adjust required';
    END IF;

    -- 1. Get and validate count session
    SELECT * INTO count_record
    FROM inventory_counts
    WHERE id = count_uuid;

    IF count_record IS NULL THEN
        RAISE EXCEPTION 'Inventory count not found';
    END IF;

    IF count_record.status != 'draft' THEN
        RAISE EXCEPTION 'Inventory count is not in draft status';
    END IF;

    -- Determine target section: use count's section_id if available, else default to warehouse
    v_target_section_id := count_record.section_id;
    IF v_target_section_id IS NULL THEN
        SELECT id INTO v_target_section_id
        FROM sections
        WHERE code = 'warehouse' AND is_active = TRUE
        LIMIT 1;
    END IF;

    -- 2. Iterate items with variance
    FOR item_record IN
        SELECT *
        FROM inventory_count_items
        WHERE count_id = count_uuid
          AND counted_quantity IS NOT NULL
          AND difference IS NOT NULL
          AND difference != 0
    LOOP
        v_variance := item_record.difference;

        -- Get current stock from product
        SELECT COALESCE(current_stock, 0) INTO v_current_stock
        FROM public.products
        WHERE id = item_record.product_id;

        -- Generate unique movement ID
        v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

        -- Create stock movement for adjustment (quantities are always positive)
        INSERT INTO stock_movements (
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
            item_record.product_id,
            CASE
                WHEN v_variance > 0 THEN 'adjustment_in'::movement_type
                ELSE 'adjustment_out'::movement_type
            END,
            ABS(v_variance),
            v_current_stock,
            v_current_stock + v_variance,
            'inventory_count',
            count_uuid::text,
            'Stock Opname ' || count_record.count_number,
            v_user_profile_id
        );

        -- Update section_stock instead of products.current_stock directly
        -- This lets trg_sync_product_stock propagate to products.current_stock
        IF v_target_section_id IS NOT NULL THEN
            INSERT INTO section_stock (section_id, product_id, quantity, last_counted_at, last_counted_by)
            VALUES (v_target_section_id, item_record.product_id, GREATEST(0, COALESCE(v_current_stock, 0) + v_variance), NOW(), v_user_profile_id)
            ON CONFLICT (section_id, product_id) DO UPDATE SET
                quantity = GREATEST(0, section_stock.quantity + item_record.difference),
                last_counted_at = NOW(),
                last_counted_by = v_user_profile_id,
                updated_at = NOW();
        ELSE
            -- Fallback: direct update if no sections exist at all (backward compatibility)
            UPDATE public.products
            SET current_stock = v_current_stock + v_variance,
                updated_at = NOW()
            WHERE id = item_record.product_id;
        END IF;
    END LOOP;

    -- 3. Update inventory count status
    UPDATE inventory_counts
    SET status = 'completed',
        validated_at = NOW(),
        validated_by = v_user_profile_id,
        updated_at = NOW()
    WHERE id = count_uuid;

    RETURN TRUE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION finalize_inventory_count(UUID) TO authenticated;

COMMENT ON FUNCTION finalize_inventory_count IS 'Finalizes an inventory count by creating stock movements for variances and updating section_stock (which propagates to products.current_stock via trigger). DB-006: Uses section_stock as source of truth instead of direct products update.';
