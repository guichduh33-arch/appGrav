-- ============================================
-- Complete Stock Movements Automation
-- Handles: Sales, Purchases, Production, Stock Opname
-- ============================================

-- ============================================
-- 1. SALES: Auto-deduct stock on order_items INSERT
-- ============================================
CREATE OR REPLACE FUNCTION deduct_stock_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_stock DECIMAL;
    v_movement_id VARCHAR(30);
BEGIN
    -- Get current stock
    SELECT COALESCE(current_stock, 0) INTO v_current_stock
    FROM public.products
    WHERE id = NEW.product_id;

    -- Generate movement ID
    v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

    -- Create stock movement
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
        'sale',
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

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deduct_stock_on_sale ON public.order_items;
CREATE TRIGGER trg_deduct_stock_on_sale
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION deduct_stock_on_sale();

-- ============================================
-- 2. PURCHASES: Auto-add stock on PO receipt
-- ============================================
CREATE OR REPLACE FUNCTION add_stock_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_stock DECIMAL;
    v_movement_id VARCHAR(30);
    v_qty_change DECIMAL;
BEGIN
    -- Only process if quantity_received increased
    v_qty_change := COALESCE(NEW.quantity_received, 0) - COALESCE(OLD.quantity_received, 0);

    IF v_qty_change <= 0 THEN
        RETURN NEW;
    END IF;

    -- Get current stock
    SELECT COALESCE(current_stock, 0) INTO v_current_stock
    FROM public.products
    WHERE id = NEW.product_id;

    -- Generate movement ID
    v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

    -- Create stock movement
    INSERT INTO public.stock_movements (
        movement_id,
        product_id,
        movement_type,
        quantity,
        stock_before,
        stock_after,
        unit_cost,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
    VALUES (
        v_movement_id,
        NEW.product_id,
        'purchase',
        v_qty_change,
        v_current_stock,
        v_current_stock + v_qty_change,
        NEW.unit_price,
        'purchase_order',
        NEW.po_id,
        'Purchase order receipt',
        auth.uid()
    );

    -- Update product stock
    UPDATE public.products
    SET current_stock = v_current_stock + v_qty_change,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_add_stock_on_purchase ON public.po_items;
CREATE TRIGGER trg_add_stock_on_purchase
    AFTER UPDATE OF quantity_received ON public.po_items
    FOR EACH ROW
    EXECUTE FUNCTION add_stock_on_purchase();

-- ============================================
-- 3. STOCK OPNAME: Update finalize function
-- ============================================
CREATE OR REPLACE FUNCTION finalize_inventory_count(count_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_record RECORD;
    item_record RECORD;
    v_current_stock DECIMAL;
    v_movement_id VARCHAR(30);
BEGIN
    -- Get and validate count session
    SELECT * INTO count_record
    FROM inventory_counts
    WHERE id = count_uuid;

    IF count_record IS NULL THEN
        RAISE EXCEPTION 'Inventory count not found';
    END IF;

    IF count_record.status != 'draft' THEN
        RAISE EXCEPTION 'Inventory count is not in draft status';
    END IF;

    -- Iterate items with variance
    FOR item_record IN
        SELECT *
        FROM inventory_count_items
        WHERE inventory_count_id = count_uuid
          AND actual_stock IS NOT NULL
          AND variance != 0
    LOOP
        -- Get current stock
        SELECT COALESCE(current_stock, 0) INTO v_current_stock
        FROM public.products
        WHERE id = item_record.product_id;

        -- Generate movement ID
        v_movement_id := 'MV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || SUBSTRING(md5(random()::text) FROM 1 FOR 4);

        -- Create stock movement for adjustment
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
                WHEN item_record.variance > 0 THEN 'adjustment_in'
                ELSE 'adjustment_out'
            END,
            item_record.variance,
            v_current_stock,
            v_current_stock + item_record.variance,
            'inventory_count',
            count_uuid,
            'Stock Opname ' || count_record.count_number,
            user_uuid
        );

        -- Update product stock
        UPDATE public.products
        SET current_stock = v_current_stock + item_record.variance,
            updated_at = NOW()
        WHERE id = item_record.product_id;
    END LOOP;

    -- Update status
    UPDATE inventory_counts
    SET status = 'completed',
        completed_at = NOW(),
        completed_by = user_uuid,
        updated_at = NOW()
    WHERE id = count_uuid;

    RETURN TRUE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION finalize_inventory_count(UUID, UUID) TO authenticated;
