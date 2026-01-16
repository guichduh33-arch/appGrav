-- =====================================================
-- DATABASE MIGRATION: Stock Triggers
-- Description: Automates stock updates based on stock_movements
-- =====================================================

-- 1. Function to update product stock based on movement
CREATE OR REPLACE FUNCTION fn_update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Determine if we are adding or subtracting stock
    -- ADD: purchase, production_in, adjustment_in
    -- SUBTRACT: sale_pos, sale_b2b, production_out, adjustment_out, waste, transfer (from source)
    
    IF OLD.id IS NOT NULL THEN
        RAISE EXCEPTION 'Stock movements are immutable and cannot be updated or deleted. Create a correcting movement instead.';
    END IF;

    -- Update the product's current stock
    IF NEW.movement_type IN ('purchase', 'production_in', 'adjustment_in') THEN
        UPDATE products 
        SET 
            current_stock = current_stock + NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
    ELSIF NEW.movement_type IN ('sale_pos', 'sale_b2b', 'production_out', 'adjustment_out', 'waste') THEN
        UPDATE products 
        SET 
            current_stock = current_stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
    ELSIF NEW.movement_type = 'transfer' THEN
        -- Transfers might need more complex logic if tracking multiple locations.
        -- For now, a 'transfer' type usually implies moving OUT of the main inventory to somewhere else (or just a generic move).
        -- Let's treat it as a subtraction for now, assuming single warehouse.
        UPDATE products 
        SET 
            current_stock = current_stock - NEW.quantity,
            updated_at = NOW()
        WHERE id = NEW.product_id;
        
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS tr_stock_update ON stock_movements;
CREATE TRIGGER tr_stock_update
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION fn_update_product_stock();

-- 3. Function to automatically create stock movement on Order Completion
-- This ensures POS sales automatically deduct stock
CREATE OR REPLACE FUNCTION fn_create_movements_on_order_complete()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- Only run when status changes to 'completed' or 'served' (depending on when you want to deduct)
    -- Let's stick to 'completed' (paid) for strict inventory control, or 'served' if we want it earlier.
    -- Phase 1 logic: deduct on 'completed'.
    
    IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
        
        -- Loop through order items
        FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
            
            -- Insert stock movement (Trigger fn_update_product_stock will handle the actual update)
            INSERT INTO stock_movements (
                movement_id,
                product_id,
                movement_type,
                quantity,
                reference_type,
                reference_id,
                stock_before, -- Will be calculated approx or ignored in simple logic, let's pass 0 and fix in app logic if needed, 
                              -- but ideally the trigger shouldn't rely on client passing 'stock_before'. 
                              -- Let's update table definition to make stock_before/after optional or handled by DB?
                              -- For now, let's just insert 0 and let the app/traceability suffer slightly, OR fetch it.
                stock_after,
                reason,
                created_at
            ) VALUES (
                'MV-' || substr(md5(random()::text), 1, 8), -- Generate a random ID or better logic
                item.product_id,
                'sale_pos',
                item.quantity,
                'order',
                NEW.id,
                0, -- Placeholder
                0, -- Placeholder
                'POS Order: ' || NEW.order_number,
                NOW()
            );
            
        END LOOP;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The implementation of fn_create_movements_on_order_complete is complex because stock_movements requires
-- a unique movement_id and stock_before/after snapshots. 
-- Ideally stock_before/after should be populated by the BEFORE INSERT trigger or just calculated.
-- For now, I will NOT create the order trigger yet, as it requires more robust ID generation and snapshotting logic
-- that might break the simple flow. I will stick to the basic tr_stock_update for now and let the application service handle specific creation.
