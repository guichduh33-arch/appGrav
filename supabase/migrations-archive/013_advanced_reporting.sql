-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Advanced Reporting Module Migration
-- Version: 2.3.0
-- Description: Adds Audit Logs, Waste Analysis, Payment Stats, and Comparison RPCs
-- =====================================================
-- =====================================================
-- 1. SCHEMA ENHANCEMENTS
-- =====================================================
-- Add Shelf Life to Products for Expiry Management
ALTER TABLE products
ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER DEFAULT 3;
COMMENT ON COLUMN products.shelf_life_days IS 'Estimated shelf life in days. Used for expiry alerts.';
-- =====================================================
-- 2. AUDIT LOGGING TRIGGERS
-- =====================================================
-- Function to handle Audit Logging automatically
CREATE OR REPLACE FUNCTION fn_audit_product_changes() RETURNS TRIGGER AS $$
DECLARE v_user_id UUID;
v_diffs JSONB;
BEGIN -- Try to get user ID from Supabase auth (if available) or fallback
-- Note: auth.uid() only works if RLs is active and called via API.
-- If called via trigger info might be missing, so we handle gracefully.
BEGIN v_user_id := auth.uid();
EXCEPTION
WHEN OTHERS THEN v_user_id := NULL;
END;
-- Compare columns to find what changed (simplified check)
v_diffs := '{}'::jsonb;
IF OLD.retail_price IS DISTINCT
FROM NEW.retail_price THEN v_diffs := v_diffs || jsonb_build_object(
        'retail_price',
        jsonb_build_object('old', OLD.retail_price, 'new', NEW.retail_price)
    );
END IF;
IF OLD.cost_price IS DISTINCT
FROM NEW.cost_price THEN v_diffs := v_diffs || jsonb_build_object(
        'cost_price',
        jsonb_build_object('old', OLD.cost_price, 'new', NEW.cost_price)
    );
END IF;
-- Only insert if relevant fields changed
IF v_diffs != '{}'::jsonb THEN
INSERT INTO audit_log (
        action_type,
        severity,
        entity_type,
        entity_id,
        old_value,
        new_value,
        reason,
        user_id,
        created_at
    )
VALUES (
        'UPDATE',
        'warning',
        -- Price changes are sensitive
        'product',
        NEW.id,
        row_to_json(OLD)::jsonb,
        row_to_json(NEW)::jsonb,
        'Auto-detected Product Change: ' || v_diffs::text,
        v_user_id,
        NOW()
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger: Product Changes
DROP TRIGGER IF EXISTS tr_audit_products ON products;
CREATE TRIGGER tr_audit_products
AFTER
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION fn_audit_product_changes();
-- =====================================================
-- 3. REPORTING VIEWS
-- =====================================================
-- VIEW: Payment Method Statistics
-- Breaks down sales by Payment Method (Cash, QRIS, Card, etc.)
CREATE OR REPLACE VIEW view_payment_method_stats AS
SELECT COALESCE(payment_method::text, 'unknown') as payment_method,
    COUNT(id) as transaction_count,
    COALESCE(SUM(total), 0) as total_revenue,
    DATE(created_at) as report_date
FROM orders
WHERE status != 'cancelled'
    AND payment_status = 'paid'
GROUP BY payment_method,
    DATE(created_at);
-- VIEW: Stock Waste Analysis
-- Detailed breakdown of waste and losses
CREATE OR REPLACE VIEW view_stock_waste AS
SELECT p.name as product_name,
    c.name as category_name,
    sm.reason,
    COUNT(sm.id) as waste_events,
    SUM(ABS(sm.quantity)) as waste_quantity,
    SUM(ABS(sm.quantity) * p.cost_price) as loss_value_at_cost,
    SUM(ABS(sm.quantity) * p.retail_price) as loss_value_at_retail,
    DATE_TRUNC('day', sm.created_at) as waste_date
FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
WHERE sm.movement_type = 'waste'
GROUP BY p.name,
    c.name,
    sm.reason,
    DATE_TRUNC('day', sm.created_at);
-- VIEW: Session Discrepancies (Cash Audit)
-- Identifies sessions with cash mismatch
CREATE OR REPLACE VIEW view_session_discrepancies AS
SELECT ps.session_number,
    up.name as staff_name,
    ps.opened_at,
    ps.closed_at,
    ps.expected_cash,
    ps.closing_cash,
    ps.cash_difference,
    CASE
        WHEN ABS(ps.cash_difference) > 50000 THEN 'critical' -- > 50k IDR mismatch
        WHEN ABS(ps.cash_difference) > 1000 THEN 'warning'
        ELSE 'info'
    END as severity
FROM pos_sessions ps
    LEFT JOIN user_profiles up ON ps.closed_by = up.id
WHERE ps.status = 'closed'
    AND ps.cash_difference IS NOT NULL
    AND ps.cash_difference != 0
ORDER BY ps.closed_at DESC;
-- VIEW: Real-time Inventory Valuation
CREATE OR REPLACE VIEW view_inventory_valuation AS
SELECT COUNT(id) as total_skus,
    SUM(current_stock) as total_items_in_stock,
    SUM(current_stock * cost_price) as total_valuation_cost,
    SUM(current_stock * retail_price) as total_valuation_retail
FROM products
WHERE is_active = TRUE;
-- =====================================================
-- 4. REPORTING RPC FUNCTIONS (API)
-- =====================================================
-- RPC: Get Sales Comparison (N vs N-1)
-- Allows comparing two date ranges (e.g., This Week vs Last Week)
CREATE OR REPLACE FUNCTION get_sales_comparison(
        current_start TIMESTAMP,
        current_end TIMESTAMP,
        previous_start TIMESTAMP,
        previous_end TIMESTAMP
    ) RETURNS TABLE (
        period_label TEXT,
        -- 'current' or 'previous'
        total_revenue DECIMAL,
        net_revenue DECIMAL,
        transaction_count BIGINT,
        avg_basket DECIMAL
    ) AS $$ BEGIN RETURN QUERY -- Current Period
SELECT 'current'::TEXT as period_label,
    COALESCE(SUM(total), 0) as total_revenue,
    COALESCE(SUM(subtotal - discount_amount), 0) as net_revenue,
    COUNT(id) as transaction_count,
    CASE
        WHEN COUNT(id) > 0 THEN COALESCE(SUM(total), 0) / COUNT(id)
        ELSE 0
    END as avg_basket
FROM orders
WHERE created_at BETWEEN current_start AND current_end
    AND status != 'cancelled'
    AND payment_status = 'paid'
UNION ALL
-- Previous Period
SELECT 'previous'::TEXT as period_label,
    COALESCE(SUM(total), 0) as total_revenue,
    COALESCE(SUM(subtotal - discount_amount), 0) as net_revenue,
    COUNT(id) as transaction_count,
    CASE
        WHEN COUNT(id) > 0 THEN COALESCE(SUM(total), 0) / COUNT(id)
        ELSE 0
    END as avg_basket
FROM orders
WHERE created_at BETWEEN previous_start AND previous_end
    AND status != 'cancelled'
    AND payment_status = 'paid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- RPC: Get Dashboard Summary
-- Holistic view for the main dashboard
CREATE OR REPLACE FUNCTION get_reporting_dashboard_summary(
        start_date TIMESTAMP,
        end_date TIMESTAMP
    ) RETURNS JSONB AS $$
DECLARE v_sales RECORD;
v_top_product RECORD;
v_low_stock_count INTEGER;
v_open_sessions INTEGER;
BEGIN -- 1. Sales Metrics
SELECT COALESCE(SUM(total), 0) as total_revenue,
    COUNT(id) as total_orders INTO v_sales
FROM orders
WHERE created_at BETWEEN start_date AND end_date
    AND status != 'cancelled'
    AND payment_status = 'paid';
-- 2. Top Product (Qty)
SELECT p.name,
    SUM(oi.quantity) as qty INTO v_top_product
FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
WHERE o.created_at BETWEEN start_date AND end_date
    AND o.status != 'cancelled'
    AND o.payment_status = 'paid'
GROUP BY p.name
ORDER BY SUM(oi.quantity) DESC
LIMIT 1;
-- 3. Alerts
SELECT COUNT(*) INTO v_low_stock_count
FROM products
WHERE current_stock <= min_stock_level
    AND is_active = TRUE;
SELECT COUNT(*) INTO v_open_sessions
FROM pos_sessions
WHERE status = 'open';
-- Build JSON Response
RETURN jsonb_build_object(
    'period_sales',
    v_sales.total_revenue,
    'period_orders',
    v_sales.total_orders,
    'top_product',
    CASE
        WHEN v_top_product.name IS NOT NULL THEN jsonb_build_object(
            'name',
            v_top_product.name,
            'qty',
            v_top_product.qty
        )
        ELSE NULL
    END,
    'low_stock_alerts',
    v_low_stock_count,
    'active_sessions',
    v_open_sessions
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;