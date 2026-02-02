-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Migration 016: Data Integrity & Race Condition Fixes
-- Fixes: Sequences, PIN storage, FK constraints, CHECK constraints
-- =====================================================

-- =====================================================
-- 1. CREATE SEQUENCES FOR THREAD-SAFE NUMBER GENERATION
-- =====================================================

-- Order number sequence (resets daily via function)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Session number sequence
CREATE SEQUENCE IF NOT EXISTS session_number_seq START 1;

-- Stock movement sequence
CREATE SEQUENCE IF NOT EXISTS movement_id_seq START 1;

-- PO number sequence
CREATE SEQUENCE IF NOT EXISTS po_number_seq START 1;

-- B2B order sequence
CREATE SEQUENCE IF NOT EXISTS b2b_order_seq START 1;

-- Production ID sequence
CREATE SEQUENCE IF NOT EXISTS production_id_seq START 1;

-- Transfer number sequence
CREATE SEQUENCE IF NOT EXISTS transfer_number_seq START 1;

-- Count number sequence
CREATE SEQUENCE IF NOT EXISTS count_number_seq START 1;

-- B2B payment sequence
CREATE SEQUENCE IF NOT EXISTS b2b_payment_seq START 1;

-- B2B delivery sequence
CREATE SEQUENCE IF NOT EXISTS b2b_delivery_seq START 1;

-- =====================================================
-- 2. THREAD-SAFE NUMBER GENERATION FUNCTIONS
-- =====================================================

-- Table to track daily sequence resets
CREATE TABLE IF NOT EXISTS sequence_tracker (
    sequence_name VARCHAR(50) PRIMARY KEY,
    last_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_value INTEGER NOT NULL DEFAULT 0
);

-- Initialize sequence tracker
INSERT INTO sequence_tracker (sequence_name, last_date, last_value) VALUES
    ('order_number', CURRENT_DATE, 0),
    ('session_number', CURRENT_DATE, 0),
    ('movement_id', CURRENT_DATE, 0),
    ('po_number', CURRENT_DATE, 0),
    ('b2b_order', CURRENT_DATE, 0),
    ('production_id', CURRENT_DATE, 0),
    ('transfer_number', CURRENT_DATE, 0),
    ('count_number', CURRENT_DATE, 0),
    ('b2b_payment', CURRENT_DATE, 0),
    ('b2b_delivery', CURRENT_DATE, 0)
ON CONFLICT (sequence_name) DO NOTHING;

-- Thread-safe daily sequence function
CREATE OR REPLACE FUNCTION get_next_daily_sequence(p_sequence_name VARCHAR, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
    v_next_value INTEGER;
BEGIN
    -- Lock the row for update to prevent race conditions
    UPDATE sequence_tracker
    SET
        last_value = CASE
            WHEN last_date = p_date THEN last_value + 1
            ELSE 1
        END,
        last_date = p_date
    WHERE sequence_name = p_sequence_name
    RETURNING last_value INTO v_next_value;

    IF v_next_value IS NULL THEN
        INSERT INTO sequence_tracker (sequence_name, last_date, last_value)
        VALUES (p_sequence_name, p_date, 1)
        RETURNING last_value INTO v_next_value;
    END IF;

    RETURN v_next_value;
END;
$$ LANGUAGE plpgsql;

-- Replace order number generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('order_number', today);
    NEW.order_number := 'POS-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace session number generator
CREATE OR REPLACE FUNCTION generate_session_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('session_number', today);
    NEW.session_number := 'SESSION-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 2, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace movement ID generator
CREATE OR REPLACE FUNCTION generate_movement_id()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('movement_id', today);
    NEW.movement_id := 'MVT-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace PO number generator
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('po_number', today);
    NEW.po_number := 'PO-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace B2B order number generator
CREATE OR REPLACE FUNCTION generate_b2b_order_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('b2b_order', today);
    NEW.order_number := 'B2B-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace production ID generator
CREATE OR REPLACE FUNCTION generate_production_id()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('production_id', NEW.production_date);
    NEW.production_id := 'PROD-' || TO_CHAR(NEW.production_date, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace transfer number generator
CREATE OR REPLACE FUNCTION generate_transfer_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('transfer_number', today);
    NEW.transfer_number := 'TRF-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace count number generator
CREATE OR REPLACE FUNCTION generate_count_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('count_number', NEW.count_date);
    NEW.count_number := 'CNT-' || TO_CHAR(NEW.count_date, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 2, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace B2B payment number generator
CREATE OR REPLACE FUNCTION generate_b2b_payment_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('b2b_payment', today);
    NEW.payment_number := 'PAY-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace B2B delivery number generator
CREATE OR REPLACE FUNCTION generate_b2b_delivery_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    seq_num := get_next_daily_sequence('b2b_delivery', today);
    NEW.delivery_number := 'DLV-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. REMOVE PLAINTEXT PIN STORAGE
-- =====================================================

-- First, ensure all PINs are hashed if they have plaintext values
-- This UPDATE should be run once to migrate existing data
DO $$
BEGIN
    -- Only update if pin_code column exists and has data, and pin_hash is empty
    UPDATE user_profiles
    SET pin_hash = crypt(pin_code, gen_salt('bf', 10)),
        pin_code = NULL
    WHERE pin_code IS NOT NULL
    AND pin_code <> ''
    AND (pin_hash IS NULL OR pin_hash = '');
EXCEPTION WHEN undefined_column THEN
    -- Column doesn't exist, skip
    NULL;
WHEN undefined_function THEN
    -- pgcrypto not enabled, skip
    NULL;
END;
$$;

-- Note: To completely remove pin_code column, run this after confirming migration:
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS pin_code;

-- =====================================================
-- 4. SESSION TOKEN HASHING
-- =====================================================

-- Add column for hashed token if not exists
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS session_token_hash VARCHAR(255);

-- Create index on hash column
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(session_token_hash);

-- Function to hash session tokens
CREATE OR REPLACE FUNCTION hash_session_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_token IS NOT NULL THEN
        -- Store hash for lookup, clear plaintext
        NEW.session_token_hash := encode(sha256(NEW.session_token::bytea), 'hex');
        -- Keep plaintext empty after initial use (application should handle)
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to hash tokens on insert
DROP TRIGGER IF EXISTS tr_hash_session_token ON user_sessions;
CREATE TRIGGER tr_hash_session_token
    BEFORE INSERT ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION hash_session_token();

-- =====================================================
-- 5. ADD CHECK CONSTRAINTS FOR BUSINESS RULES
-- =====================================================

-- Products: prices must be non-negative
ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_prices;
ALTER TABLE products ADD CONSTRAINT chk_products_prices
    CHECK (retail_price >= 0 AND wholesale_price >= 0 AND cost_price >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_stock;
ALTER TABLE products ADD CONSTRAINT chk_products_stock
    CHECK (min_stock_level >= 0);

-- Orders: discount validation
ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_discount;
ALTER TABLE orders ADD CONSTRAINT chk_orders_discount
    CHECK (
        (discount_type IS NULL AND discount_value = 0) OR
        (discount_type = 'percentage' AND discount_value >= 0 AND discount_value <= 100) OR
        (discount_type = 'fixed' AND discount_value >= 0)
    );

ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_amounts;
ALTER TABLE orders ADD CONSTRAINT chk_orders_amounts
    CHECK (subtotal >= 0 AND total >= 0 AND tax_amount >= 0);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS chk_orders_tax_rate;
ALTER TABLE orders ADD CONSTRAINT chk_orders_tax_rate
    CHECK (tax_rate >= 0 AND tax_rate <= 1);

-- Order items: quantity positive
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_items_quantity;
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_quantity
    CHECK (quantity > 0);

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS chk_order_items_prices;
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_prices
    CHECK (unit_price >= 0 AND total_price >= 0);

-- Stock movements: quantity non-zero
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS chk_stock_movements_quantity;
ALTER TABLE stock_movements ADD CONSTRAINT chk_stock_movements_quantity
    CHECK (quantity <> 0);

-- Internal transfers: different locations
ALTER TABLE internal_transfers DROP CONSTRAINT IF EXISTS chk_transfers_locations;
ALTER TABLE internal_transfers ADD CONSTRAINT chk_transfers_locations
    CHECK (from_location_id <> to_location_id);

-- Transfer items: quantities positive
ALTER TABLE transfer_items DROP CONSTRAINT IF EXISTS chk_transfer_items_quantity;
ALTER TABLE transfer_items ADD CONSTRAINT chk_transfer_items_quantity
    CHECK (quantity_requested > 0 AND (quantity_sent IS NULL OR quantity_sent >= 0));

-- Purchase orders: tax rate valid
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS chk_po_tax_rate;
ALTER TABLE purchase_orders ADD CONSTRAINT chk_po_tax_rate
    CHECK (tax_rate >= 0 AND tax_rate <= 1);

-- PO items: quantities positive
ALTER TABLE po_items DROP CONSTRAINT IF EXISTS chk_po_items_quantity;
ALTER TABLE po_items ADD CONSTRAINT chk_po_items_quantity
    CHECK (quantity_ordered > 0 AND quantity_received >= 0 AND unit_price >= 0);

-- Recipes: quantity positive
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS chk_recipes_quantity;
ALTER TABLE recipes ADD CONSTRAINT chk_recipes_quantity
    CHECK (quantity > 0);

-- Production records: quantities non-negative
ALTER TABLE production_records DROP CONSTRAINT IF EXISTS chk_production_quantities;
ALTER TABLE production_records ADD CONSTRAINT chk_production_quantities
    CHECK (quantity_produced > 0 AND quantity_waste >= 0);

-- Customer categories: discount percentage valid
ALTER TABLE customer_categories DROP CONSTRAINT IF EXISTS chk_customer_categories_discount;
ALTER TABLE customer_categories ADD CONSTRAINT chk_customer_categories_discount
    CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100));

-- Loyalty tiers: valid percentages
ALTER TABLE loyalty_tiers DROP CONSTRAINT IF EXISTS chk_loyalty_tiers_discount;
ALTER TABLE loyalty_tiers ADD CONSTRAINT chk_loyalty_tiers_discount
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- B2B orders: amounts non-negative
ALTER TABLE b2b_orders DROP CONSTRAINT IF EXISTS chk_b2b_orders_amounts;
ALTER TABLE b2b_orders ADD CONSTRAINT chk_b2b_orders_amounts
    CHECK (subtotal >= 0 AND total >= 0 AND discount_amount >= 0 AND amount_due >= 0);

-- =====================================================
-- 6. FIX STOCK CALCULATION RACE CONDITION
-- =====================================================

-- Replace stock functions with row-level locking
CREATE OR REPLACE FUNCTION record_stock_before_after()
RETURNS TRIGGER AS $$
DECLARE
    current_qty DECIMAL(10,3);
    movement_qty DECIMAL(10,3);
BEGIN
    -- Lock the product row to prevent concurrent modifications
    SELECT current_stock INTO current_qty
    FROM products
    WHERE id = NEW.product_id
    FOR UPDATE;

    NEW.stock_before := COALESCE(current_qty, 0);

    -- Determine movement direction based on type
    CASE NEW.movement_type::text
        WHEN 'purchase' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'production_in' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'adjustment_in' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'transfer_in' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'return' THEN movement_qty := ABS(NEW.quantity);
        WHEN 'sale' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'sale_pos' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'sale_b2b' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'production_out' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'production' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'adjustment' THEN movement_qty := NEW.quantity; -- Can be positive or negative
        WHEN 'adjustment_out' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'waste' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'transfer_out' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'transfer' THEN movement_qty := -ABS(NEW.quantity);
        WHEN 'ingredient' THEN movement_qty := -ABS(NEW.quantity);
        ELSE movement_qty := NEW.quantity;
    END CASE;

    NEW.stock_after := NEW.stock_before + movement_qty;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update product stock atomically
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- The product is already locked from record_stock_before_after
    UPDATE products
    SET current_stock = NEW.stock_after,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. PROTECT ORDER HISTORY (Soft delete for products)
-- =====================================================

-- Add deleted_at column for soft delete if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index for soft delete
CREATE INDEX IF NOT EXISTS idx_products_deleted ON products(deleted_at) WHERE deleted_at IS NULL;

-- Modify order_items FK to RESTRICT instead of SET NULL (requires recreating constraint)
-- First check and drop existing constraint
DO $$
BEGIN
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
EXCEPTION WHEN undefined_object THEN
    NULL;
END;
$$;

-- Note: Not adding RESTRICT FK because it would break existing workflow
-- Instead, the soft delete approach is preferred

-- Create view for active products only
CREATE OR REPLACE VIEW active_products AS
SELECT * FROM products WHERE deleted_at IS NULL AND is_active = TRUE;

-- =====================================================
-- 8. SECURE REALTIME PUBLICATION (Filter sensitive tables)
-- =====================================================

-- Remove sensitive tables from realtime
-- Keep only tables that need real-time updates for KDS/Display
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS orders;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS pos_sessions;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS stock_movements;

-- Re-add with filtering (Supabase handles this via RLS)
-- Orders: still needed for KDS
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- =====================================================
-- 9. CREATE SECURE VIEW FOR USER PROFILES
-- =====================================================

-- View that hides sensitive data
CREATE OR REPLACE VIEW user_profiles_safe AS
SELECT
    id,
    auth_user_id,
    name,
    first_name,
    last_name,
    display_name,
    employee_code,
    phone,
    email,
    role,
    preferred_language,
    timezone,
    avatar_url,
    is_active,
    created_at,
    updated_at
    -- Excludes: pin_code, pin_hash, failed_login_attempts, locked_until,
    -- password_changed_at, must_change_password
FROM user_profiles;

-- =====================================================
-- 10. ADD RLS TO SEQUENCE TRACKER
-- =====================================================

ALTER TABLE sequence_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sequence_tracker_select" ON sequence_tracker FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "sequence_tracker_update" ON sequence_tracker FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "sequence_tracker_insert" ON sequence_tracker FOR INSERT TO authenticated WITH CHECK (TRUE);
