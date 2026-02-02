-- =====================================================
-- FIX PRODUCTION PROCESS
-- Include Waste in Material Consumption
-- =====================================================
CREATE OR REPLACE FUNCTION process_production(production_uuid UUID) RETURNS BOOLEAN AS $$
DECLARE prod_record RECORD;
recipe_record RECORD;
total_qty DECIMAL(10, 3);
BEGIN -- Get production record
SELECT * INTO prod_record
FROM production_records
WHERE id = production_uuid;
IF prod_record IS NULL THEN RAISE EXCEPTION 'Production not found: %',
production_uuid;
END IF;
IF prod_record.stock_updated THEN RAISE EXCEPTION 'Production already processed';
END IF;
-- Calculate total quantity (Good + Waste)
-- This is the amount of materials we actually used
total_qty := prod_record.quantity_produced + COALESCE(prod_record.quantity_waste, 0);
-- 1. Add finished product to stock (Good Quantity)
-- We add the TOTAL produced first (as if all were good), then remove waste?
-- OR we just add the good quantity?
-- Standard accounting: 
-- Material Credit (Total) -> WIP -> Finished Goods Debit (Good) + Loss Debit (Waste)
-- In our simple system:
-- 1. Add 'production_in' for TOTAL amount (to balance materials)
-- 2. Subtract 'waste' for WASTE amount
-- Result: Stock increases by Good Qty, but history shows Production In (Total) and Waste (Loss).
INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
VALUES (
        prod_record.product_id,
        'production_in',
        total_qty,
        -- Add everything we made
        'production',
        prod_record.id,
        'Production #' || prod_record.production_id,
        prod_record.staff_id
    );
-- 2. If there is waste, remove it immediately
IF prod_record.quantity_waste > 0 THEN
INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
VALUES (
        prod_record.product_id,
        'waste',
        prod_record.quantity_waste,
        -- Remove bad stuff
        'production',
        prod_record.id,
        'Production Waste #' || prod_record.production_id,
        prod_record.staff_id
    );
END IF;
-- 3. Deduct raw materials based on TOTAL quantity (Good + Waste)
FOR recipe_record IN
SELECT r.material_id,
    r.quantity,
    p.name
FROM recipes r
    JOIN products p ON p.id = r.material_id
WHERE r.product_id = prod_record.product_id
    AND r.is_active = TRUE LOOP
INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        reason,
        staff_id
    )
VALUES (
        recipe_record.material_id,
        'production_out',
        recipe_record.quantity * total_qty,
        -- Consume based on total output
        'production',
        prod_record.id,
        'Consumed for production #' || prod_record.production_id,
        prod_record.staff_id
    );
END LOOP;
-- 4. Mark production as processed
UPDATE production_records
SET stock_updated = TRUE,
    materials_consumed = TRUE,
    updated_at = NOW()
WHERE id = production_uuid;
RETURN TRUE;
END;
$$ LANGUAGE plpgsql;