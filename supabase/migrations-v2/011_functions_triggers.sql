-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 011: Functions & Triggers
-- All database functions and triggers
-- =====================================================

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUTO-GENERATION FUNCTIONS
-- =====================================================

-- Generate order number: POS-YYYYMMDD-XXXX
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM orders
    WHERE DATE(created_at) = today;
    NEW.order_number := 'POS-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate session number: SESSION-YYYYMMDD-XX
CREATE OR REPLACE FUNCTION generate_session_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM pos_sessions
    WHERE DATE(opened_at) = today;
    NEW.session_number := 'SESSION-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 2, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate movement ID: MVT-YYYYMMDD-XXXXX
CREATE OR REPLACE FUNCTION generate_movement_id()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM stock_movements
    WHERE DATE(created_at) = today;
    NEW.movement_id := 'MVT-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate PO number: PO-YYYYMMDD-XXX
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM purchase_orders
    WHERE DATE(created_at) = today;
    NEW.po_number := 'PO-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate B2B order number: B2B-YYYYMMDD-XXX
CREATE OR REPLACE FUNCTION generate_b2b_order_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM b2b_orders
    WHERE DATE(created_at) = today;
    NEW.order_number := 'B2B-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate production ID: PROD-YYYYMMDD-XXX
CREATE OR REPLACE FUNCTION generate_production_id()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM production_records
    WHERE production_date = NEW.production_date;
    NEW.production_id := 'PROD-' || TO_CHAR(NEW.production_date, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate transfer number: TRF-YYYYMMDD-XXX
CREATE OR REPLACE FUNCTION generate_transfer_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM internal_transfers
    WHERE DATE(created_at) = today;
    NEW.transfer_number := 'TRF-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate inventory count number: CNT-YYYYMMDD-XX
CREATE OR REPLACE FUNCTION generate_count_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM inventory_counts
    WHERE count_date = NEW.count_date;
    NEW.count_number := 'CNT-' || TO_CHAR(NEW.count_date, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 2, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate B2B payment number
CREATE OR REPLACE FUNCTION generate_b2b_payment_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM b2b_payments
    WHERE DATE(created_at) = today;
    NEW.payment_number := 'PAY-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate B2B delivery number
CREATE OR REPLACE FUNCTION generate_b2b_delivery_number()
RETURNS TRIGGER AS $$
DECLARE
    today DATE := CURRENT_DATE;
    seq_num INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_num
    FROM b2b_deliveries
    WHERE DATE(created_at) = today;
    NEW.delivery_number := 'DLV-' || TO_CHAR(today, 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STOCK MANAGEMENT FUNCTIONS
-- =====================================================

-- Record stock before/after
CREATE OR REPLACE FUNCTION record_stock_before_after()
RETURNS TRIGGER AS $$
DECLARE
    current_qty DECIMAL(10,3);
    movement_qty DECIMAL(10,3);
BEGIN
    SELECT current_stock INTO current_qty
    FROM products
    WHERE id = NEW.product_id;

    NEW.stock_before := COALESCE(current_qty, 0);

    CASE NEW.movement_type
        WHEN 'purchase', 'production_in', 'adjustment_in', 'transfer_in' THEN
            movement_qty := ABS(NEW.quantity);
        WHEN 'sale_pos', 'sale_b2b', 'production_out', 'adjustment_out', 'waste', 'transfer_out', 'ingredient' THEN
            movement_qty := -ABS(NEW.quantity);
        ELSE
            movement_qty := NEW.quantity;
    END CASE;

    NEW.stock_after := NEW.stock_before + movement_qty;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update product stock after movement
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    movement_qty DECIMAL(10,3);
BEGIN
    CASE NEW.movement_type
        WHEN 'purchase', 'production_in', 'adjustment_in', 'transfer_in' THEN
            movement_qty := ABS(NEW.quantity);
        WHEN 'sale_pos', 'sale_b2b', 'production_out', 'adjustment_out', 'waste', 'transfer_out', 'ingredient' THEN
            movement_qty := -ABS(NEW.quantity);
        ELSE
            movement_qty := NEW.quantity;
    END CASE;

    UPDATE products
    SET current_stock = current_stock + movement_qty, updated_at = NOW()
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSION FUNCTIONS
-- =====================================================

-- Check if user has a specific permission
CREATE OR REPLACE FUNCTION user_has_permission(p_user_id UUID, p_permission_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_direct_grant BOOLEAN := FALSE;
    v_has_direct_revoke BOOLEAN := FALSE;
BEGIN
    -- Check for direct user permission
    SELECT
        COALESCE(bool_or(is_granted = TRUE AND (valid_until IS NULL OR valid_until > NOW())), FALSE),
        COALESCE(bool_or(is_granted = FALSE AND (valid_until IS NULL OR valid_until > NOW())), FALSE)
    INTO v_has_direct_grant, v_has_direct_revoke
    FROM user_permissions up
    JOIN permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
    AND p.code = p_permission_code
    AND (up.valid_from IS NULL OR up.valid_from <= NOW());

    IF v_has_direct_revoke THEN RETURN FALSE; END IF;
    IF v_has_direct_grant THEN RETURN TRUE; END IF;

    -- Check role-based permissions
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
        AND p.code = p_permission_code
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
        AND r.code IN ('SUPER_ADMIN', 'ADMIN')
        AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
        AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- LOYALTY FUNCTIONS
-- =====================================================

-- Add loyalty points
CREATE OR REPLACE FUNCTION add_loyalty_points(
    p_customer_id UUID,
    p_order_id UUID,
    p_order_amount NUMERIC(12,2),
    p_created_by UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_points_per_amount NUMERIC(10,2);
    v_points_multiplier NUMERIC(5,2);
    v_loyalty_enabled BOOLEAN;
    v_current_points INTEGER;
    v_earned_points INTEGER;
    v_new_balance INTEGER;
BEGIN
    SELECT
        COALESCE(cc.loyalty_enabled, FALSE),
        COALESCE(cc.points_per_amount, 1000),
        COALESCE(cc.points_multiplier, 1.0),
        c.loyalty_points
    INTO v_loyalty_enabled, v_points_per_amount, v_points_multiplier, v_current_points
    FROM customers c
    LEFT JOIN customer_categories cc ON c.category_id = cc.id
    WHERE c.id = p_customer_id;

    IF NOT v_loyalty_enabled THEN RETURN 0; END IF;

    v_earned_points := FLOOR(p_order_amount / v_points_per_amount * v_points_multiplier);
    IF v_earned_points <= 0 THEN RETURN 0; END IF;

    v_new_balance := v_current_points + v_earned_points;

    UPDATE customers
    SET loyalty_points = v_new_balance,
        lifetime_points = COALESCE(lifetime_points, 0) + v_earned_points,
        total_spent = COALESCE(total_spent, 0) + p_order_amount,
        total_visits = COALESCE(total_visits, 0) + 1,
        last_visit_at = NOW()
    WHERE id = p_customer_id;

    INSERT INTO loyalty_transactions (
        customer_id, order_id, transaction_type, points, points_balance_after,
        order_amount, points_rate, multiplier, description, created_by
    ) VALUES (
        p_customer_id, p_order_id, 'earn', v_earned_points, v_new_balance,
        p_order_amount, v_points_per_amount, v_points_multiplier,
        'Points earned from order', p_created_by
    );

    RETURN v_earned_points;
END;
$$ LANGUAGE plpgsql;

-- Redeem loyalty points
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
    p_customer_id UUID,
    p_points INTEGER,
    p_order_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT 'Points redemption',
    p_created_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_points INTEGER;
    v_new_balance INTEGER;
BEGIN
    SELECT loyalty_points INTO v_current_points
    FROM customers WHERE id = p_customer_id;

    IF v_current_points < p_points THEN
        RAISE EXCEPTION 'Insufficient loyalty points';
    END IF;

    v_new_balance := v_current_points - p_points;

    UPDATE customers SET loyalty_points = v_new_balance WHERE id = p_customer_id;

    INSERT INTO loyalty_transactions (
        customer_id, order_id, transaction_type, points, points_balance_after,
        description, created_by
    ) VALUES (
        p_customer_id, p_order_id, 'redeem', -p_points, v_new_balance,
        p_description, p_created_by
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Get customer price for product
CREATE OR REPLACE FUNCTION get_customer_product_price(p_product_id UUID, p_customer_category_slug VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
    v_category_id UUID;
    v_price_modifier_type TEXT;
    v_discount_percentage NUMERIC(5,2);
    v_custom_price NUMERIC(12,2);
    v_retail_price NUMERIC(12,2);
    v_wholesale_price NUMERIC(12,2);
BEGIN
    SELECT cc.id, cc.price_modifier_type, cc.discount_percentage
    INTO v_category_id, v_price_modifier_type, v_discount_percentage
    FROM customer_categories cc
    WHERE cc.slug = p_customer_category_slug;

    SELECT retail_price, wholesale_price
    INTO v_retail_price, v_wholesale_price
    FROM products WHERE id = p_product_id;

    IF v_category_id IS NULL THEN RETURN COALESCE(v_retail_price, 0); END IF;

    CASE v_price_modifier_type
        WHEN 'retail' THEN RETURN COALESCE(v_retail_price, 0);
        WHEN 'wholesale' THEN RETURN COALESCE(v_wholesale_price, v_retail_price, 0);
        WHEN 'custom' THEN
            SELECT custom_price INTO v_custom_price
            FROM product_category_prices
            WHERE customer_category_id = v_category_id AND product_id = p_product_id AND is_active = TRUE;
            RETURN COALESCE(v_custom_price, v_retail_price, 0);
        WHEN 'discount_percentage' THEN
            RETURN COALESCE(v_retail_price, 0) * (1 - COALESCE(v_discount_percentage, 0) / 100);
        ELSE RETURN COALESCE(v_retail_price, 0);
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CUSTOMER QR CODE GENERATION
-- =====================================================
CREATE OR REPLACE FUNCTION generate_customer_qr_code()
RETURNS TRIGGER AS $$
DECLARE
    qr_prefix TEXT := 'BRK';
    random_part TEXT;
    final_qr TEXT;
BEGIN
    IF NEW.loyalty_qr_code IS NULL THEN
        random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');

        WHILE EXISTS (SELECT 1 FROM customers WHERE loyalty_qr_code = final_qr) LOOP
            random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
            final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');
        END LOOP;

        NEW.loyalty_qr_code := final_qr;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- B2B ORDER TOTALS
-- =====================================================
CREATE OR REPLACE FUNCTION update_b2b_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal DECIMAL(15,2);
    v_discount_amount DECIMAL(15,2);
    v_tax_amount DECIMAL(15,2);
    v_total DECIMAL(15,2);
    v_paid_amount DECIMAL(15,2);
    v_order RECORD;
BEGIN
    SELECT * INTO v_order FROM b2b_orders WHERE id = COALESCE(NEW.order_id, OLD.order_id);

    SELECT COALESCE(SUM(total), 0) INTO v_subtotal
    FROM b2b_order_items WHERE order_id = v_order.id;

    v_discount_amount := v_subtotal * COALESCE(v_order.discount_percent, 0) / 100;
    v_tax_amount := (v_subtotal - v_discount_amount) * COALESCE(v_order.tax_rate, 0.11);
    v_total := v_subtotal - v_discount_amount + v_tax_amount;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid_amount
    FROM b2b_payments WHERE order_id = v_order.id;

    UPDATE b2b_orders
    SET subtotal = v_subtotal,
        discount_amount = v_discount_amount,
        tax_amount = v_tax_amount,
        total = v_total,
        amount_due = v_total - v_paid_amount,
        paid_amount = v_paid_amount,
        updated_at = NOW()
    WHERE id = v_order.id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- APPLY TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER tr_update_categories_timestamp BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_sections_timestamp BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_customers_timestamp BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_user_profiles_timestamp BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_pos_sessions_timestamp BEFORE UPDATE ON pos_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_order_items_timestamp BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_recipes_timestamp BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_production_records_timestamp BEFORE UPDATE ON production_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_suppliers_timestamp BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_purchase_orders_timestamp BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_b2b_orders_timestamp BEFORE UPDATE ON b2b_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_roles_timestamp BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_settings_timestamp BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_customer_categories_timestamp BEFORE UPDATE ON customer_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_loyalty_tiers_timestamp BEFORE UPDATE ON loyalty_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_promotions_timestamp BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_product_combos_timestamp BEFORE UPDATE ON product_combos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_update_internal_transfers_timestamp BEFORE UPDATE ON internal_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generation triggers
CREATE TRIGGER tr_generate_order_number BEFORE INSERT ON orders FOR EACH ROW WHEN (NEW.order_number IS NULL) EXECUTE FUNCTION generate_order_number();
CREATE TRIGGER tr_generate_session_number BEFORE INSERT ON pos_sessions FOR EACH ROW WHEN (NEW.session_number IS NULL) EXECUTE FUNCTION generate_session_number();
CREATE TRIGGER tr_generate_movement_id BEFORE INSERT ON stock_movements FOR EACH ROW WHEN (NEW.movement_id IS NULL) EXECUTE FUNCTION generate_movement_id();
CREATE TRIGGER tr_generate_po_number BEFORE INSERT ON purchase_orders FOR EACH ROW WHEN (NEW.po_number IS NULL) EXECUTE FUNCTION generate_po_number();
CREATE TRIGGER tr_generate_b2b_order_number BEFORE INSERT ON b2b_orders FOR EACH ROW WHEN (NEW.order_number IS NULL) EXECUTE FUNCTION generate_b2b_order_number();
CREATE TRIGGER tr_generate_production_id BEFORE INSERT ON production_records FOR EACH ROW WHEN (NEW.production_id IS NULL) EXECUTE FUNCTION generate_production_id();
CREATE TRIGGER tr_generate_transfer_number BEFORE INSERT ON internal_transfers FOR EACH ROW WHEN (NEW.transfer_number IS NULL) EXECUTE FUNCTION generate_transfer_number();
CREATE TRIGGER tr_generate_count_number BEFORE INSERT ON inventory_counts FOR EACH ROW WHEN (NEW.count_number IS NULL) EXECUTE FUNCTION generate_count_number();
CREATE TRIGGER tr_generate_b2b_payment_number BEFORE INSERT ON b2b_payments FOR EACH ROW WHEN (NEW.payment_number IS NULL) EXECUTE FUNCTION generate_b2b_payment_number();
CREATE TRIGGER tr_generate_b2b_delivery_number BEFORE INSERT ON b2b_deliveries FOR EACH ROW WHEN (NEW.delivery_number IS NULL) EXECUTE FUNCTION generate_b2b_delivery_number();

-- Stock triggers
CREATE TRIGGER tr_record_stock_before_after BEFORE INSERT ON stock_movements FOR EACH ROW EXECUTE FUNCTION record_stock_before_after();
CREATE TRIGGER tr_update_product_stock AFTER INSERT ON stock_movements FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Customer QR code
CREATE TRIGGER tr_generate_customer_qr_code BEFORE INSERT ON customers FOR EACH ROW EXECUTE FUNCTION generate_customer_qr_code();

-- B2B order totals
CREATE TRIGGER tr_update_b2b_totals_on_items AFTER INSERT OR UPDATE OR DELETE ON b2b_order_items FOR EACH ROW EXECUTE FUNCTION update_b2b_order_totals();
CREATE TRIGGER tr_update_b2b_totals_on_payments AFTER INSERT OR UPDATE OR DELETE ON b2b_payments FOR EACH ROW EXECUTE FUNCTION update_b2b_order_totals();
