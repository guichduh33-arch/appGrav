-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Stock Opname (Physical Count) Migration
-- Version: 2.3.0
-- =====================================================
-- =====================================================
-- 1. ENUM TYPES
-- =====================================================
DROP TYPE IF EXISTS inventory_count_status CASCADE;
CREATE TYPE inventory_count_status AS ENUM (
    'draft',
    -- In progress
    'completed',
    -- Finalized and potential adjustments made
    'cancelled' -- Abandoned
);
-- =====================================================
-- 2. TABLES
-- =====================================================
-- Inventory Count Session (Header)
CREATE TABLE inventory_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    count_number VARCHAR(30) NOT NULL UNIQUE,
    -- e.g. INV-20231024-001
    status inventory_count_status DEFAULT 'draft',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    started_by UUID REFERENCES user_profiles(id),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES user_profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Inventory Count Items (Details)
CREATE TABLE inventory_count_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_count_id UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    system_stock DECIMAL(10, 3) NOT NULL,
    -- Snapshot at moment of creation/update
    actual_stock DECIMAL(10, 3),
    -- User input
    variance DECIMAL(10, 3),
    -- actual - system
    unit VARCHAR(20),
    -- Base unit
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inv_count_items_product ON inventory_count_items(product_id);
CREATE INDEX idx_inv_count_items_parent ON inventory_count_items(inventory_count_id);
-- =====================================================
-- 3. AUTO-GENERATION & TRIGGERS
-- =====================================================
-- Generate Inventory Count Number: INV-YYYYMMDD-XXX
CREATE OR REPLACE FUNCTION generate_inventory_count_number() RETURNS TRIGGER AS $$
DECLARE today DATE := CURRENT_DATE;
seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM inventory_counts
WHERE DATE(created_at) = today;
NEW.count_number := 'INV-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_generate_inv_count_number BEFORE
INSERT ON inventory_counts FOR EACH ROW
    WHEN (NEW.count_number IS NULL) EXECUTE FUNCTION generate_inventory_count_number();
-- Update timestamps
CREATE TRIGGER tr_update_inventory_counts_timestamp BEFORE
UPDATE ON inventory_counts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_inventory_count_items_timestamp BEFORE
UPDATE ON inventory_count_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- =====================================================
-- 4. BUSINESS LOGIC (Finalize Count)
-- =====================================================
-- Function to finalize inventory count and create adjustments
CREATE OR REPLACE FUNCTION finalize_inventory_count(count_uuid UUID, user_uuid UUID) RETURNS BOOLEAN AS $$
DECLARE count_record RECORD;
item_record RECORD;
BEGIN -- 1. Get and validate count session
SELECT * INTO count_record
FROM inventory_counts
WHERE id = count_uuid;
IF count_record.status != 'draft' THEN RAISE EXCEPTION 'Inventory count is not in draft status';
END IF;
-- 2. Iterate items with variance
FOR item_record IN
SELECT *
FROM inventory_count_items
WHERE inventory_count_id = count_uuid
    AND actual_stock IS NOT NULL
    AND variance != 0 LOOP -- Create stock movement for adjustment
INSERT INTO stock_movements (
        product_id,
        movement_type,
        quantity,
        -- This should be the adjustment amount (variance)
        reason,
        reference_type,
        reference_id,
        staff_id
    )
VALUES (
        item_record.product_id,
        CASE
            WHEN item_record.variance > 0 THEN 'adjustment_in'::movement_type
            ELSE 'adjustment_out'::movement_type
        END,
        ABS(item_record.variance),
        -- Movement quantity is absolute
        'Stock Opname ' || count_record.count_number,
        'inventory_count',
        count_uuid,
        user_uuid
    );
END LOOP;
-- 3. Update status
UPDATE inventory_counts
SET status = 'completed',
    completed_at = NOW(),
    completed_by = user_uuid,
    updated_at = NOW()
WHERE id = count_uuid;
RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =====================================================
-- 5. RLS POLICIES
-- =====================================================
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_count_items ENABLE ROW LEVEL SECURITY;
-- inventory_counts policies
CREATE POLICY "select_inv_counts" ON inventory_counts FOR
SELECT TO authenticated USING (
        can_access_backoffice()
        OR is_admin_or_manager()
    );
CREATE POLICY "insert_inv_counts" ON inventory_counts FOR
INSERT TO authenticated WITH CHECK (
        can_access_backoffice()
        OR is_admin_or_manager()
    );
CREATE POLICY "update_inv_counts" ON inventory_counts FOR
UPDATE TO authenticated USING (
        can_access_backoffice()
        OR is_admin_or_manager()
    );
-- inventory_count_items policies
CREATE POLICY "select_inv_items" ON inventory_count_items FOR
SELECT TO authenticated USING (
        can_access_backoffice()
        OR is_admin_or_manager()
    );
CREATE POLICY "insert_inv_items" ON inventory_count_items FOR
INSERT TO authenticated WITH CHECK (
        can_access_backoffice()
        OR is_admin_or_manager()
    );
CREATE POLICY "update_inv_items" ON inventory_count_items FOR
UPDATE TO authenticated USING (
        can_access_backoffice()
        OR is_admin_or_manager()
    );
CREATE POLICY "delete_inv_items" ON inventory_count_items FOR DELETE TO authenticated USING (
    can_access_backoffice()
    OR is_admin_or_manager()
);