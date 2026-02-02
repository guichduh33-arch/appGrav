-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Functions & Triggers Migration
-- Version: 2.0.0
-- =====================================================

-- =====================================================
-- DROP EXISTING FUNCTIONS (to allow return type changes)
-- =====================================================
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS generate_session_number() CASCADE;
DROP FUNCTION IF EXISTS generate_movement_id() CASCADE;
DROP FUNCTION IF EXISTS generate_po_number() CASCADE;
DROP FUNCTION IF EXISTS generate_b2b_order_number() CASCADE;
DROP FUNCTION IF EXISTS generate_production_id() CASCADE;
DROP FUNCTION IF EXISTS record_stock_before_after() CASCADE;
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;
DROP FUNCTION IF EXISTS check_stock_alert() CASCADE;
DROP FUNCTION IF EXISTS deduct_stock_from_order() CASCADE;
DROP FUNCTION IF EXISTS calculate_loyalty_points(DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS update_customer_loyalty() CASCADE;
DROP FUNCTION IF EXISTS log_order_changes() CASCADE;
DROP FUNCTION IF EXISTS log_price_changes() CASCADE;
DROP FUNCTION IF EXISTS process_production(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_session_totals() CASCADE;
DROP FUNCTION IF EXISTS calculate_order_totals() CASCADE;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply to all tables with updated_at
CREATE TRIGGER tr_update_categories_timestamp BEFORE
UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_products_timestamp BEFORE
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_customers_timestamp BEFORE
UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_user_profiles_timestamp BEFORE
UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_pos_sessions_timestamp BEFORE
UPDATE ON pos_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_orders_timestamp BEFORE
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_order_items_timestamp BEFORE
UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_recipes_timestamp BEFORE
UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_production_records_timestamp BEFORE
UPDATE ON production_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_suppliers_timestamp BEFORE
UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_purchase_orders_timestamp BEFORE
UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_po_items_timestamp BEFORE
UPDATE ON po_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_b2b_orders_timestamp BEFORE
UPDATE ON b2b_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- =====================================================
-- AUTO-GENERATION FUNCTIONS
-- =====================================================
-- Generate order number: POS-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TRIGGER AS $$
DECLARE today DATE := CURRENT_DATE;
seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM orders
WHERE DATE(created_at) = today;
NEW.order_number := 'POS-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_generate_order_number BEFORE
INSERT ON orders FOR EACH ROW
    WHEN (NEW.order_number IS NULL) EXECUTE FUNCTION generate_order_number();
-- Generate session number: SESSION-YYYYMMDD-XX
CREATE OR REPLACE FUNCTION generate_session_number() RETURNS TRIGGER AS $$
DECLARE today DATE := CURRENT_DATE;
seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM pos_sessions
WHERE DATE(opened_at) = today;
NEW.session_number := 'SESSION-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 2, '0');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_generate_session_number BEFORE
INSERT ON pos_sessions FOR EACH ROW
    WHEN (NEW.session_number IS NULL) EXECUTE FUNCTION generate_session_number();
-- Generate movement ID: MVT-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_movement_id() RETURNS TRIGGER AS $$
DECLARE today DATE := CURRENT_DATE;
seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM stock_movements
WHERE DATE(created_at) = today;
NEW.movement_id := 'MVT-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_generate_movement_id BEFORE
INSERT ON stock_movements FOR EACH ROW
    WHEN (NEW.movement_id IS NULL) EXECUTE FUNCTION generate_movement_id();
-- Generate PO number: PO-YYYYMMDD-XXX
CREATE OR REPLACE FUNCTION generate_po_number() RETURNS TRIGGER AS $$
DECLARE today DATE := CURRENT_DATE;
seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM purchase_orders
WHERE DATE(created_at) = today;
NEW.po_number := 'PO-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_generate_po_number BEFORE
INSERT ON purchase_orders FOR EACH ROW
    WHEN (NEW.po_number IS NULL) EXECUTE FUNCTION generate_po_number();
-- Generate B2B order number: B2B-YYYYMMDD-XXX
CREATE OR REPLACE FUNCTION generate_b2b_order_number() RETURNS TRIGGER AS $$
DECLARE today DATE := CURRENT_DATE;
seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM b2b_orders
WHERE DATE(created_at) = today;
NEW.order_number := 'B2B-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_generate_b2b_order_number BEFORE
INSERT ON b2b_orders FOR EACH ROW
    WHEN (NEW.order_number IS NULL) EXECUTE FUNCTION generate_b2b_order_number();
-- Generate production ID: PROD-YYYYMMDD-XXX
CREATE OR REPLACE FUNCTION generate_production_id() RETURNS TRIGGER AS $$
DECLARE seq_num INTEGER;
BEGIN
SELECT COUNT(*) + 1 INTO seq_num
FROM production_records
WHERE production_date = NEW.production_date;
NEW.production_id := 'PROD-' || TO_CHAR(NEW.production_date, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_generate_production_id BEFORE
INSERT ON production_records FOR EACH ROW
    WHEN (NEW.production_id IS NULL) EXECUTE FUNCTION generate_production_id();
-- =====================================================
-- STOCK MANAGEMENT FUNCTIONS
-- =====================================================
-- Record stock before/after
CREATE OR REPLACE FUNCTION record_stock_before_after() RETURNS TRIGGER AS $$
DECLARE current_qty DECIMAL(10, 3);
movement_qty DECIMAL(10, 3);
BEGIN
SELECT current_stock INTO current_qty
FROM products
WHERE id = NEW.product_id;
NEW.stock_before := COALESCE(current_qty, 0);
CASE
    NEW.movement_type
    WHEN 'purchase',
    'production_in',
    'adjustment_in',
    'transfer' THEN movement_qty := ABS(NEW.quantity);
WHEN 'sale_pos',
'sale_b2b',
'production_out',
'adjustment_out',
'waste' THEN movement_qty := - ABS(NEW.quantity);
ELSE movement_qty := NEW.quantity;
END CASE
;
NEW.stock_after := NEW.stock_before + movement_qty;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_record_stock_before_after BEFORE
INSERT ON stock_movements FOR EACH ROW EXECUTE FUNCTION record_stock_before_after();
-- Update product stock after movement
CREATE OR REPLACE FUNCTION update_product_stock() RETURNS TRIGGER AS $$
DECLARE movement_qty DECIMAL(10, 3);
BEGIN CASE
    NEW.movement_type
    WHEN 'purchase',
    'production_in',
    'adjustment_in',
    'transfer' THEN movement_qty := ABS(NEW.quantity);
WHEN 'sale_pos',
'sale_b2b',
'production_out',
'adjustment_out',
'waste' THEN movement_qty := - ABS(NEW.quantity);
ELSE movement_qty := NEW.quantity;
END CASE
;
UPDATE products
SET current_stock = current_stock + movement_qty,
    updated_at = NOW()
WHERE id = NEW.product_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_update_product_stock
AFTER
INSERT ON stock_movements FOR EACH ROW EXECUTE FUNCTION update_product_stock();
-- Check stock alert
CREATE OR REPLACE FUNCTION check_stock_alert() RETURNS TRIGGER AS $$
DECLARE product_record RECORD;
BEGIN
SELECT id,
    name,
    current_stock,
    min_stock_level INTO product_record
FROM products
WHERE id = NEW.product_id;
IF product_record.current_stock < product_record.min_stock_level THEN
INSERT INTO audit_log (
        action_type,
        severity,
        entity_type,
        entity_id,
        new_value
    )
VALUES (
        'stock_low_alert',
        'warning',
        'product',
        product_record.id,
        jsonb_build_object(
            'product_name',
            product_record.name,
            'current_stock',
            product_record.current_stock,
            'min_level',
            product_record.min_stock_level
        )
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_check_stock_alert
AFTER
INSERT ON stock_movements FOR EACH ROW EXECUTE FUNCTION check_stock_alert();
-- Deduct stock from completed order
CREATE OR REPLACE FUNCTION deduct_stock_from_order() RETURNS TRIGGER AS $$
DECLARE item_record RECORD;
BEGIN IF (
    OLD.payment_status != 'paid'
    AND NEW.payment_status = 'paid'
) THEN FOR item_record IN
SELECT oi.id,
    oi.product_id,
    oi.quantity,
    p.name
FROM order_items oi
    JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = NEW.id
    AND oi.product_id IS NOT NULL LOOP
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
        item_record.product_id,
        'sale_pos',
        item_record.quantity,
        'order',
        NEW.id,
        'POS Sale #' || NEW.order_number,
        NEW.staff_id
    );
END LOOP;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_deduct_stock_from_order
AFTER
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION deduct_stock_from_order();
-- =====================================================
-- LOYALTY & CRM FUNCTIONS
-- =====================================================
-- Calculate loyalty points
CREATE OR REPLACE FUNCTION calculate_loyalty_points(order_total DECIMAL) RETURNS INTEGER AS $$
DECLARE points_rate INTEGER;
BEGIN
SELECT (value::TEXT)::INTEGER INTO points_rate
FROM app_settings
WHERE key = 'loyalty_points_rate';
IF points_rate IS NULL
OR points_rate = 0 THEN points_rate := 1000;
END IF;
RETURN FLOOR(order_total / points_rate);
END;
$$ LANGUAGE plpgsql;
-- Update customer loyalty on order completion
CREATE OR REPLACE FUNCTION update_customer_loyalty() RETURNS TRIGGER AS $$
DECLARE points_earned INTEGER;
BEGIN IF NEW.payment_status = 'paid'
AND NEW.customer_id IS NOT NULL THEN points_earned := calculate_loyalty_points(NEW.total - COALESCE(NEW.discount_amount, 0));
-- Update order with points earned
UPDATE orders
SET points_earned = points_earned
WHERE id = NEW.id;
-- Update customer stats
UPDATE customers
SET loyalty_points = loyalty_points + points_earned - COALESCE(NEW.points_used, 0),
    total_visits = total_visits + 1,
    total_spent = total_spent + NEW.total,
    last_visit_at = NOW(),
    updated_at = NOW()
WHERE id = NEW.customer_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_update_customer_loyalty
AFTER
UPDATE ON orders FOR EACH ROW
    WHEN (
        NEW.payment_status = 'paid'
        AND OLD.payment_status != 'paid'
    ) EXECUTE FUNCTION update_customer_loyalty();
-- =====================================================
-- AUDIT & LOGGING FUNCTIONS
-- =====================================================
-- Log order changes
CREATE OR REPLACE FUNCTION log_order_changes() RETURNS TRIGGER AS $$
DECLARE action_name VARCHAR(100);
sev audit_severity;
BEGIN IF TG_OP = 'UPDATE' THEN -- Order cancelled
IF NEW.status = 'cancelled'
AND OLD.status != 'cancelled' THEN action_name := 'order_cancelled';
sev := 'warning';
-- Discount applied
ELSIF NEW.discount_amount > 0
AND COALESCE(OLD.discount_amount, 0) = 0 THEN action_name := 'discount_applied';
sev := CASE
    WHEN NEW.discount_requires_manager THEN 'warning'
    ELSE 'info'
END;
-- Order paid
ELSIF NEW.payment_status = 'paid'
AND OLD.payment_status != 'paid' THEN action_name := 'order_paid';
sev := 'info';
ELSE RETURN NEW;
END IF;
END IF;
INSERT INTO audit_log (
        action_type,
        severity,
        entity_type,
        entity_id,
        old_value,
        new_value,
        reason,
        requires_manager,
        manager_id,
        user_id,
        session_id
    )
VALUES (
        action_name,
        sev,
        'order',
        NEW.id,
        row_to_json(OLD)::JSONB,
        row_to_json(NEW)::JSONB,
        NEW.cancellation_reason,
        NEW.discount_requires_manager,
        NEW.discount_manager_id,
        NEW.staff_id,
        NEW.session_id
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_log_order_changes
AFTER
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION log_order_changes();
-- Log price changes
CREATE OR REPLACE FUNCTION log_price_changes() RETURNS TRIGGER AS $$ BEGIN IF OLD.retail_price != NEW.retail_price
    OR OLD.wholesale_price != NEW.wholesale_price THEN
INSERT INTO audit_log (
        action_type,
        severity,
        entity_type,
        entity_id,
        old_value,
        new_value
    )
VALUES (
        'price_changed',
        'warning',
        'product',
        NEW.id,
        jsonb_build_object(
            'retail_price',
            OLD.retail_price,
            'wholesale_price',
            OLD.wholesale_price
        ),
        jsonb_build_object(
            'retail_price',
            NEW.retail_price,
            'wholesale_price',
            NEW.wholesale_price
        )
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_log_price_changes
AFTER
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION log_price_changes();
-- =====================================================
-- PRODUCTION FUNCTION
-- =====================================================
-- Process production record
CREATE OR REPLACE FUNCTION process_production(production_uuid UUID) RETURNS BOOLEAN AS $$
DECLARE prod_record RECORD;
recipe_record RECORD;
BEGIN -- Get production record
SELECT * INTO prod_record
FROM production_records
WHERE id = production_uuid;
IF prod_record IS NULL THEN RAISE EXCEPTION 'Production not found: %',
production_uuid;
END IF;
IF prod_record.stock_updated THEN RAISE EXCEPTION 'Production already processed';
END IF;
-- 1. Add finished product to stock
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
        recipe_record.quantity * prod_record.quantity_produced,
        'production',
        prod_record.id,
        'Consumed for production #' || prod_record.production_id,
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
$$ LANGUAGE plpgsql;
-- =====================================================
-- UPDATE SESSION TOTALS FUNCTION
-- =====================================================
-- Update session totals when order is paid
CREATE OR REPLACE FUNCTION update_session_totals() RETURNS TRIGGER AS $$ BEGIN IF NEW.payment_status = 'paid'
    AND OLD.payment_status != 'paid'
    AND NEW.session_id IS NOT NULL THEN
UPDATE pos_sessions
SET total_orders = total_orders + 1,
    total_cash_sales = total_cash_sales + CASE
        WHEN NEW.payment_method = 'cash' THEN NEW.total
        ELSE 0
    END,
    total_card_sales = total_card_sales + CASE
        WHEN NEW.payment_method = 'card' THEN NEW.total
        ELSE 0
    END,
    total_qris_sales = total_qris_sales + CASE
        WHEN NEW.payment_method = 'qris' THEN NEW.total
        ELSE 0
    END,
    total_discounts = total_discounts + COALESCE(NEW.discount_amount, 0),
    expected_cash = opening_cash + total_cash_sales + CASE
        WHEN NEW.payment_method = 'cash' THEN NEW.total
        ELSE 0
    END - total_refunds,
    updated_at = NOW()
WHERE id = NEW.session_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER tr_update_session_totals
AFTER
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_session_totals();
-- =====================================================
-- CALCULATE ORDER TOTALS FUNCTION
-- =====================================================
-- Calculate order totals before insert/update
CREATE OR REPLACE FUNCTION calculate_order_totals() RETURNS TRIGGER AS $$
DECLARE calc_subtotal DECIMAL(12, 2);
calc_tax DECIMAL(12, 2);
calc_discount DECIMAL(12, 2);
BEGIN -- Calculate subtotal from items
SELECT COALESCE(
        SUM(total_price + COALESCE(modifiers_total, 0)),
        0
    ) INTO calc_subtotal
FROM order_items
WHERE order_id = NEW.id;
-- Calculate discount
IF NEW.discount_type = 'percentage' THEN calc_discount := calc_subtotal * (COALESCE(NEW.discount_value, 0) / 100);
ELSIF NEW.discount_type = 'fixed' THEN calc_discount := COALESCE(NEW.discount_value, 0);
ELSE calc_discount := 0;
END IF;
-- Add points discount
calc_discount := calc_discount + COALESCE(NEW.points_discount, 0);
-- Calculate tax on discounted amount
calc_tax := (calc_subtotal - calc_discount) * COALESCE(NEW.tax_rate, 0.11);
-- Update totals
NEW.subtotal := calc_subtotal;
NEW.discount_amount := calc_discount;
NEW.tax_amount := calc_tax;
NEW.total := calc_subtotal - calc_discount + calc_tax;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Note: This trigger needs to be called explicitly or via a recalculate function
-- as order_items may not exist when order is first created