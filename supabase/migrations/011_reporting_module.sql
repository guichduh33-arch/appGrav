-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Reporting & Analytics Module
-- Version: 2.1.0
-- =====================================================
-- =====================================================
-- 1. SYSTEM LOGGING (Technical & Security)
-- =====================================================
-- System Logs Table
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    severity VARCHAR(20) NOT NULL CHECK (
        severity IN ('info', 'warning', 'error', 'critical')
    ),
    source VARCHAR(50) NOT NULL,
    -- 'api', 'client', 'database', 'edge_function'
    component VARCHAR(50),
    -- 'auth', 'payment', 'inventory', etc.
    message TEXT NOT NULL,
    stack_trace TEXT,
    meta JSONB,
    -- Additional context
    user_id UUID REFERENCES user_profiles(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_system_logs_severity ON system_logs(severity);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX idx_system_logs_source ON system_logs(source);
-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
-- Policy: Admins can see all logs
CREATE POLICY "admins_read_system_logs" ON system_logs FOR
SELECT TO authenticated USING (is_admin_or_manager());
-- Policy: Everyone can insert logs (for client-side error tracking)
CREATE POLICY "everyone_insert_system_logs" ON system_logs FOR
INSERT TO authenticated WITH CHECK (TRUE);
-- =====================================================
-- 2. REPORTING AGGREGATES (Views)
-- =====================================================
-- View: Daily Sales KPIs
-- Aggregates orders by day for quick charting
CREATE OR REPLACE VIEW view_daily_kpis AS
SELECT origin_date AS date,
    COUNT(orders.id) AS total_orders,
    COALESCE(SUM(orders.total), 0) AS total_revenue,
    COALESCE(SUM(orders.subtotal - orders.discount_amount), 0) AS net_revenue,
    COALESCE(SUM(orders.tax_amount), 0) AS total_tax,
    COALESCE(SUM(orders.discount_amount), 0) AS total_discount,
    CASE
        WHEN COUNT(orders.id) > 0 THEN COALESCE(SUM(orders.total), 0) / COUNT(orders.id)
        ELSE 0
    END AS avg_basket_value
FROM (
        SELECT id,
            DATE(created_at) AS origin_date,
            total,
            subtotal,
            discount_amount,
            tax_amount
        FROM orders
        WHERE status != 'cancelled'
            AND payment_status = 'paid'
    ) AS orders
GROUP BY origin_date;
-- View: Staff Performance
CREATE OR REPLACE VIEW view_staff_performance AS
SELECT u.id AS staff_id,
    u.name AS staff_name,
    u.role,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_sales,
    COALESCE(AVG(o.total), 0) AS avg_ticket_size,
    COUNT(o.id) FILTER (
        WHERE o.discount_amount > 0
    ) AS orders_with_discount
FROM user_profiles u
    LEFT JOIN orders o ON o.staff_id = u.id
    AND o.status != 'cancelled'
    AND o.payment_status = 'paid'
GROUP BY u.id,
    u.name,
    u.role;
-- View: Product Performance (Best Sellers)
CREATE OR REPLACE VIEW view_product_performance AS
SELECT p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    p.sku,
    COALESCE(SUM(oi.quantity), 0) AS quantity_sold,
    COALESCE(SUM(oi.total_price), 0) AS revenue_generated,
    COUNT(DISTINCT oi.order_id) AS times_ordered
FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.status != 'cancelled'
    AND o.payment_status = 'paid'
GROUP BY p.id,
    p.name,
    c.name,
    p.sku;
-- View: Sales Heatmap (Day of Week & Hour)
-- Helps verify busy hours
CREATE OR REPLACE VIEW view_sales_heatmap AS
SELECT EXTRACT(
        DOW
        FROM o.created_at
    ) AS day_of_week,
    -- 0=Sunday
    EXTRACT(
        HOUR
        FROM o.created_at
    ) AS hour_of_day,
    COUNT(o.id) AS order_count,
    SUM(o.total) AS total_revenue
FROM orders o
WHERE o.status != 'cancelled'
    AND o.payment_status = 'paid'
GROUP BY EXTRACT(
        DOW
        FROM o.created_at
    ),
    EXTRACT(
        HOUR
        FROM o.created_at
    );
-- =====================================================
-- 3. STOCK & INVENTORY HISTORY
-- =====================================================
-- Table: Daily Stock Snapshots
-- Intended to be populated daily to track inventory value over time
CREATE TABLE reporting_stock_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_items_count INTEGER DEFAULT 0,
    total_value_cost DECIMAL(15, 2) DEFAULT 0,
    -- Value based on cost price
    total_value_retail DECIMAL(15, 2) DEFAULT 0,
    -- Value based on retail price
    low_stock_count INTEGER DEFAULT 0,
    out_of_stock_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(snapshot_date)
);
CREATE INDEX idx_snapshots_date ON reporting_stock_snapshots(snapshot_date);
-- Enable RLS
ALTER TABLE reporting_stock_snapshots ENABLE ROW LEVEL SECURITY;
-- Policy: Only Admins/Managers/Backoffice can read snapshots
CREATE POLICY "staff_read_snapshots" ON reporting_stock_snapshots FOR
SELECT TO authenticated USING (
        is_admin_or_manager()
        OR can_access_backoffice()
    );
-- Function to capture stock snapshot
-- Can be called via cron or edge function
CREATE OR REPLACE FUNCTION capture_daily_stock_snapshot() RETURNS UUID AS $$
DECLARE new_snapshot_id UUID;
v_total_items INTEGER;
v_total_cost DECIMAL(15, 2);
v_total_retail DECIMAL(15, 2);
v_low_stock INTEGER;
v_out_stock INTEGER;
BEGIN -- Calculate aggregates
SELECT COUNT(*),
    COALESCE(SUM(current_stock * cost_price), 0),
    COALESCE(SUM(current_stock * retail_price), 0),
    COUNT(*) FILTER (
        WHERE current_stock <= min_stock_level
            AND current_stock > 0
    ),
    COUNT(*) FILTER (
        WHERE current_stock <= 0
    ) INTO v_total_items,
    v_total_cost,
    v_total_retail,
    v_low_stock,
    v_out_stock
FROM products
WHERE is_active = TRUE;
-- Insert or Update snapshot for today
INSERT INTO reporting_stock_snapshots (
        snapshot_date,
        total_items_count,
        total_value_cost,
        total_value_retail,
        low_stock_count,
        out_of_stock_count
    )
VALUES (
        CURRENT_DATE,
        v_total_items,
        v_total_cost,
        v_total_retail,
        v_low_stock,
        v_out_stock
    ) ON CONFLICT (snapshot_date) DO
UPDATE
SET total_items_count = EXCLUDED.total_items_count,
    total_value_cost = EXCLUDED.total_value_cost,
    total_value_retail = EXCLUDED.total_value_retail,
    low_stock_count = EXCLUDED.low_stock_count,
    out_of_stock_count = EXCLUDED.out_of_stock_count,
    created_at = NOW()
RETURNING id INTO new_snapshot_id;
RETURN new_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Security Definer needed if this is called by a scheduler or trigger 
-- that might not typically have write access to this table, 
-- or to ensure consistent calculations regardless of user.
-- =====================================================
-- 4. RPC FUNCTIONS FOR API
-- =====================================================
-- RPC: Get Sales Analytics with Custom Range
-- Helper to verify permission
CREATE OR REPLACE FUNCTION check_reporting_access() RETURNS BOOLEAN AS $$
DECLARE user_p RECORD;
BEGIN
SELECT role,
    can_access_reports INTO user_p
FROM user_profiles
WHERE auth_user_id = auth.uid();
IF user_p.role IN ('admin', 'manager')
OR user_p.can_access_reports THEN RETURN TRUE;
END IF;
RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION get_sales_analytics(
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        trunc_interval VARCHAR DEFAULT 'day' -- 'hour', 'day', 'week', 'month'
    ) RETURNS TABLE (
        period TIMESTAMP,
        total_sales DECIMAL,
        order_count BIGINT,
        avg_order_value DECIMAL
    ) AS $$ BEGIN IF NOT check_reporting_access() THEN RAISE EXCEPTION 'Access Denied: Reporting permissions required.';
END IF;
RETURN QUERY
SELECT DATE_TRUNC(trunc_interval, created_at) AS period,
    COALESCE(SUM(total), 0) AS total_sales,
    COUNT(id) AS order_count,
    CASE
        WHEN COUNT(id) > 0 THEN COALESCE(SUM(total), 0) / COUNT(id)
        ELSE 0
    END AS avg_order_value
FROM orders
WHERE created_at BETWEEN start_date AND end_date
    AND status != 'cancelled'
    AND payment_status = 'paid'
GROUP BY 1
ORDER BY 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- RPC: Top Selling Products
CREATE OR REPLACE FUNCTION get_top_products(
        start_date TIMESTAMP DEFAULT NULL,
        end_date TIMESTAMP DEFAULT NULL,
        limit_count INTEGER DEFAULT 10
    ) RETURNS TABLE (
        product_name VARCHAR,
        sku VARCHAR,
        quantity_sold DECIMAL,
        total_revenue DECIMAL
    ) AS $$ BEGIN IF NOT check_reporting_access() THEN RAISE EXCEPTION 'Access Denied: Reporting permissions required.';
END IF;
RETURN QUERY
SELECT p.name,
    p.sku,
    SUM(oi.quantity) AS quantity_sold,
    SUM(oi.total_price) AS total_revenue
FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
WHERE o.status != 'cancelled'
    AND o.payment_status = 'paid'
    AND (
        start_date IS NULL
        OR o.created_at >= start_date
    )
    AND (
        end_date IS NULL
        OR o.created_at <= end_date
    )
GROUP BY p.id,
    p.name,
    p.sku
ORDER BY total_revenue DESC
LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;