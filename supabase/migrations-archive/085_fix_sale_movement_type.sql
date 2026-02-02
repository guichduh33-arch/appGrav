-- ============================================
-- Fix movement_type for sales trigger
-- Use sale_pos or sale_b2b based on order type
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
BEGIN
    -- Get order type to determine movement type
    SELECT order_type INTO v_order_type
    FROM public.orders
    WHERE id = NEW.order_id;

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

    RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS trg_deduct_stock_on_sale ON public.order_items;
CREATE TRIGGER trg_deduct_stock_on_sale
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION deduct_stock_on_sale();
