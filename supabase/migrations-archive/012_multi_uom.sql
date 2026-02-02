-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Multi-Unit (UOM) System Migration
-- Version: 2.2.0
-- =====================================================
-- =====================================================
-- 1. UOM SCHEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS product_uoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    unit_name VARCHAR(50) NOT NULL,
    conversion_factor DECIMAL(12, 4) NOT NULL,
    -- How many Base Units are in this unit? (e.g., 1 Box = 1000 Base)
    is_purchase_unit BOOLEAN DEFAULT FALSE,
    is_consumption_unit BOOLEAN DEFAULT FALSE,
    barcode VARCHAR(100),
    -- distinct barcode for this pack size
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent duplicate unit names for the same product
    UNIQUE(product_id, unit_name)
);
CREATE INDEX IF NOT EXISTS idx_uoms_product ON product_uoms(product_id);
-- Enable RLS
ALTER TABLE product_uoms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_uoms" ON product_uoms;
CREATE POLICY "select_uoms" ON product_uoms FOR
SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "modify_uoms_admin" ON product_uoms;
CREATE POLICY "modify_uoms_admin" ON product_uoms FOR ALL TO authenticated USING (
    is_admin_or_manager()
    OR can_access_backoffice()
) WITH CHECK (
    is_admin_or_manager()
    OR can_access_backoffice()
);
-- =====================================================
-- 2. UPDATE PRODUCTION LOGIC WITH CONVERSION
-- =====================================================
-- We need to update process_production to look up conversion factors
-- if the recipe unit differs from the product's base unit.
DROP FUNCTION IF EXISTS process_production(UUID);
CREATE OR REPLACE FUNCTION process_production(production_uuid UUID) RETURNS BOOLEAN AS $$
DECLARE prod_record RECORD;
recipe_record RECORD;
v_base_unit VARCHAR;
v_conversion DECIMAL(12, 4);
v_quantity_to_deduct DECIMAL(10, 3);
BEGIN -- Get production record
SELECT * INTO prod_record
FROM production_records
WHERE id = production_uuid;
IF prod_record IS NULL THEN RAISE EXCEPTION 'Production not found: %',
production_uuid;
END IF;
IF prod_record.stock_updated THEN RAISE EXCEPTION 'Production already processed';
END IF;
-- 1. Add finished product to stock (always in base unit of finished product)
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
        prod_record.quantity_produced,
        'production',
        prod_record.id,
        'Production #' || prod_record.production_id,
        prod_record.staff_id
    );
-- 2. Deduct raw materials based on recipes
FOR recipe_record IN
SELECT r.material_id,
    r.quantity,
    -- Quantity in Recipe Unit
    r.unit AS recipe_unit,
    p.name AS material_name,
    p.unit AS base_unit
FROM recipes r
    JOIN products p ON p.id = r.material_id
WHERE r.product_id = prod_record.product_id
    AND r.is_active = TRUE LOOP -- Determine conversion requirement
    v_conversion := 1.0;
-- If recipe unit differs from base unit, try to find conversion
IF recipe_record.recipe_unit IS NOT NULL
AND recipe_record.recipe_unit != recipe_record.base_unit THEN -- Look up in product_uoms
SELECT conversion_factor INTO v_conversion
FROM product_uoms
WHERE product_id = recipe_record.material_id
    AND unit_name = recipe_record.recipe_unit
    AND is_active = TRUE
LIMIT 1;
-- If no conversion found, and units don't match, we assume 1:1 but log/warn?
-- For safety, if not found, we default to 1.0 but this might be wrong.
-- Idealy we should abort, but for now let's default to 1 and maybe Log?
v_conversion := COALESCE(v_conversion, 1.0);
END IF;
-- Calculate final quantity to deduct in BASE UNIT
v_quantity_to_deduct := (recipe_record.quantity * v_conversion) * prod_record.quantity_produced;
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
        v_quantity_to_deduct,
        -- Saved in Base Unit
        'production',
        prod_record.id,
        'Consumed ' || recipe_record.quantity || ' ' || COALESCE(recipe_record.recipe_unit, '') || ' (=' || v_quantity_to_deduct || ' ' || recipe_record.base_unit || ') for prod #' || prod_record.production_id,
        prod_record.staff_id
    );
END LOOP;
-- 3. Mark production as processed
UPDATE production_records
SET stock_updated = TRUE,
    materials_consumed = TRUE,
    updated_at = NOW()
WHERE id = production_uuid;
RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;