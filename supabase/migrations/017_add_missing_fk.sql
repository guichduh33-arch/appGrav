-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Migration 017: Add Missing Foreign Key Constraints
-- Adds FK constraints on user references for integrity
-- =====================================================

-- =====================================================
-- POS SESSIONS - User References
-- =====================================================

-- opened_by
ALTER TABLE pos_sessions DROP CONSTRAINT IF EXISTS fk_pos_sessions_opened_by;
ALTER TABLE pos_sessions ADD CONSTRAINT fk_pos_sessions_opened_by
    FOREIGN KEY (opened_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- closed_by
ALTER TABLE pos_sessions DROP CONSTRAINT IF EXISTS fk_pos_sessions_closed_by;
ALTER TABLE pos_sessions ADD CONSTRAINT fk_pos_sessions_closed_by
    FOREIGN KEY (closed_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- manager_id
ALTER TABLE pos_sessions DROP CONSTRAINT IF EXISTS fk_pos_sessions_manager;
ALTER TABLE pos_sessions ADD CONSTRAINT fk_pos_sessions_manager
    FOREIGN KEY (manager_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- ORDERS - User References
-- =====================================================

-- staff_id
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_staff;
ALTER TABLE orders ADD CONSTRAINT fk_orders_staff
    FOREIGN KEY (staff_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- discount_manager_id
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_discount_manager;
ALTER TABLE orders ADD CONSTRAINT fk_orders_discount_manager
    FOREIGN KEY (discount_manager_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- cancelled_by
ALTER TABLE orders DROP CONSTRAINT IF EXISTS fk_orders_cancelled_by;
ALTER TABLE orders ADD CONSTRAINT fk_orders_cancelled_by
    FOREIGN KEY (cancelled_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- ORDER ITEMS - User References
-- =====================================================

-- prepared_by
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS fk_order_items_prepared_by;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_prepared_by
    FOREIGN KEY (prepared_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- STOCK MOVEMENTS - User References
-- =====================================================

-- staff_id
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS fk_stock_movements_staff;
ALTER TABLE stock_movements ADD CONSTRAINT fk_stock_movements_staff
    FOREIGN KEY (staff_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- PRODUCTION RECORDS - User References
-- =====================================================

-- staff_id
ALTER TABLE production_records DROP CONSTRAINT IF EXISTS fk_production_staff;
ALTER TABLE production_records ADD CONSTRAINT fk_production_staff
    FOREIGN KEY (staff_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- INVENTORY COUNTS - User References
-- =====================================================

-- created_by
ALTER TABLE inventory_counts DROP CONSTRAINT IF EXISTS fk_inventory_counts_created_by;
ALTER TABLE inventory_counts ADD CONSTRAINT fk_inventory_counts_created_by
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- validated_by
ALTER TABLE inventory_counts DROP CONSTRAINT IF EXISTS fk_inventory_counts_validated_by;
ALTER TABLE inventory_counts ADD CONSTRAINT fk_inventory_counts_validated_by
    FOREIGN KEY (validated_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- INVENTORY COUNT ITEMS - User References
-- =====================================================

-- counted_by
ALTER TABLE inventory_count_items DROP CONSTRAINT IF EXISTS fk_inventory_count_items_counted_by;
ALTER TABLE inventory_count_items ADD CONSTRAINT fk_inventory_count_items_counted_by
    FOREIGN KEY (counted_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- INTERNAL TRANSFERS - User References
-- =====================================================

-- created_by
ALTER TABLE internal_transfers DROP CONSTRAINT IF EXISTS fk_transfers_created_by;
ALTER TABLE internal_transfers ADD CONSTRAINT fk_transfers_created_by
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- approved_by
ALTER TABLE internal_transfers DROP CONSTRAINT IF EXISTS fk_transfers_approved_by;
ALTER TABLE internal_transfers ADD CONSTRAINT fk_transfers_approved_by
    FOREIGN KEY (approved_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- received_by
ALTER TABLE internal_transfers DROP CONSTRAINT IF EXISTS fk_transfers_received_by;
ALTER TABLE internal_transfers ADD CONSTRAINT fk_transfers_received_by
    FOREIGN KEY (received_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- PURCHASE ORDERS - User References
-- =====================================================

-- created_by
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS fk_po_created_by;
ALTER TABLE purchase_orders ADD CONSTRAINT fk_po_created_by
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- received_by
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS fk_po_received_by;
ALTER TABLE purchase_orders ADD CONSTRAINT fk_po_received_by
    FOREIGN KEY (received_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- LOYALTY TRANSACTIONS - User References
-- =====================================================

-- created_by
ALTER TABLE loyalty_transactions DROP CONSTRAINT IF EXISTS fk_loyalty_transactions_created_by;
ALTER TABLE loyalty_transactions ADD CONSTRAINT fk_loyalty_transactions_created_by
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- ROLE PERMISSIONS - User References
-- =====================================================

-- granted_by
ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS fk_role_permissions_granted_by;
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_granted_by
    FOREIGN KEY (granted_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- USER PROFILES - Self References
-- =====================================================

-- created_by
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS fk_user_profiles_created_by;
ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_created_by
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- updated_by
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS fk_user_profiles_updated_by;
ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_updated_by
    FOREIGN KEY (updated_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- USER ROLES - User References
-- =====================================================

-- assigned_by
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS fk_user_roles_assigned_by;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_assigned_by
    FOREIGN KEY (assigned_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- USER PERMISSIONS - User References
-- =====================================================

-- granted_by
ALTER TABLE user_permissions DROP CONSTRAINT IF EXISTS fk_user_permissions_granted_by;
ALTER TABLE user_permissions ADD CONSTRAINT fk_user_permissions_granted_by
    FOREIGN KEY (granted_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- SETTINGS PROFILES - User References
-- =====================================================

-- created_by
ALTER TABLE settings_profiles DROP CONSTRAINT IF EXISTS fk_settings_profiles_created_by;
ALTER TABLE settings_profiles ADD CONSTRAINT fk_settings_profiles_created_by
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- =====================================================
-- B2B ORDERS - User References
-- =====================================================

-- created_by (if column exists)
DO $$
BEGIN
    ALTER TABLE b2b_orders ADD CONSTRAINT fk_b2b_orders_created_by
        FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN undefined_column THEN
    NULL;
END;
$$;

-- =====================================================
-- CREATE INDEXES ON NEW FK COLUMNS FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pos_sessions_opened_by ON pos_sessions(opened_by);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_closed_by ON pos_sessions(closed_by);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_manager ON pos_sessions(manager_id);
CREATE INDEX IF NOT EXISTS idx_orders_staff ON orders(staff_id);
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_by ON orders(cancelled_by);
CREATE INDEX IF NOT EXISTS idx_order_items_prepared_by ON order_items(prepared_by);
CREATE INDEX IF NOT EXISTS idx_stock_movements_staff ON stock_movements(staff_id);
CREATE INDEX IF NOT EXISTS idx_production_staff ON production_records(staff_id);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_created_by ON inventory_counts(created_by);
CREATE INDEX IF NOT EXISTS idx_transfers_created_by ON internal_transfers(created_by);
CREATE INDEX IF NOT EXISTS idx_po_created_by ON purchase_orders(created_by);
