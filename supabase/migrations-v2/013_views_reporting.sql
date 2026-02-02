-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 013: Views & Reporting
-- =====================================================

-- =====================================================
-- VIEW: Daily KPIs
-- =====================================================
CREATE OR REPLACE VIEW view_daily_kpis AS
SELECT
    DATE(o.created_at) AS report_date,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'completed') AS completed_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'cancelled') AS cancelled_orders,
    COALESCE(SUM(o.total) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_revenue,
    COALESCE(SUM(o.discount_amount) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_discounts,
    COALESCE(SUM(o.tax_amount) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_tax,
    COALESCE(AVG(o.total) FILTER (WHERE o.payment_status = 'paid'), 0) AS avg_order_value,
    COUNT(DISTINCT o.customer_id) FILTER (WHERE o.customer_id IS NOT NULL) AS unique_customers,
    COALESCE(SUM(o.total) FILTER (WHERE o.payment_method = 'cash' AND o.payment_status = 'paid'), 0) AS cash_sales,
    COALESCE(SUM(o.total) FILTER (WHERE o.payment_method = 'card' AND o.payment_status = 'paid'), 0) AS card_sales,
    COALESCE(SUM(o.total) FILTER (WHERE o.payment_method = 'qris' AND o.payment_status = 'paid'), 0) AS qris_sales,
    COALESCE(SUM(o.total) FILTER (WHERE o.payment_method = 'edc' AND o.payment_status = 'paid'), 0) AS edc_sales
FROM orders o
WHERE o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(o.created_at)
ORDER BY report_date DESC;

-- =====================================================
-- VIEW: Inventory Valuation
-- =====================================================
CREATE OR REPLACE VIEW view_inventory_valuation AS
SELECT
    p.id AS product_id,
    p.sku,
    p.name,
    p.product_type,
    c.name AS category_name,
    p.current_stock,
    p.unit,
    p.cost_price,
    p.retail_price,
    (p.current_stock * p.cost_price) AS stock_value_cost,
    (p.current_stock * p.retail_price) AS stock_value_retail,
    p.min_stock_level,
    CASE
        WHEN p.current_stock <= 0 THEN 'out_of_stock'
        WHEN p.current_stock < p.min_stock_level THEN 'low_stock'
        ELSE 'in_stock'
    END AS stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE
ORDER BY p.name;

-- =====================================================
-- VIEW: Payment Method Stats
-- =====================================================
CREATE OR REPLACE VIEW view_payment_method_stats AS
SELECT
    DATE(o.created_at) AS report_date,
    o.payment_method,
    COUNT(*) AS transaction_count,
    SUM(o.total) AS total_amount,
    AVG(o.total) AS avg_amount
FROM orders o
WHERE o.payment_status = 'paid'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(o.created_at), o.payment_method
ORDER BY report_date DESC, total_amount DESC;

-- =====================================================
-- VIEW: Product Sales Performance
-- =====================================================
CREATE OR REPLACE VIEW view_product_sales AS
SELECT
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    COUNT(DISTINCT oi.order_id) AS order_count,
    SUM(oi.quantity) AS total_quantity,
    SUM(oi.total_price) AS total_revenue,
    AVG(oi.unit_price) AS avg_unit_price,
    p.retail_price AS current_price,
    p.cost_price,
    SUM(oi.total_price) - (SUM(oi.quantity) * p.cost_price) AS gross_profit
FROM order_items oi
JOIN products p ON oi.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
JOIN orders o ON oi.order_id = o.id
WHERE o.payment_status = 'paid'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.sku, p.name, c.name, p.retail_price, p.cost_price
ORDER BY total_revenue DESC;

-- =====================================================
-- VIEW: Staff Performance
-- =====================================================
CREATE OR REPLACE VIEW view_staff_performance AS
SELECT
    up.id AS staff_id,
    up.name AS staff_name,
    up.role,
    COUNT(DISTINCT o.id) AS orders_processed,
    COALESCE(SUM(o.total) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_sales,
    COALESCE(AVG(o.total) FILTER (WHERE o.payment_status = 'paid'), 0) AS avg_order_value,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'cancelled') AS cancelled_orders,
    COALESCE(SUM(o.discount_amount) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_discounts_given
FROM user_profiles up
LEFT JOIN orders o ON up.id = o.staff_id
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
WHERE up.is_active = TRUE
GROUP BY up.id, up.name, up.role
ORDER BY total_sales DESC;

-- =====================================================
-- VIEW: Hourly Sales
-- =====================================================
CREATE OR REPLACE VIEW view_hourly_sales AS
SELECT
    DATE(o.created_at) AS sale_date,
    EXTRACT(HOUR FROM o.created_at) AS hour_of_day,
    COUNT(*) AS order_count,
    SUM(o.total) AS total_sales,
    AVG(o.total) AS avg_order_value
FROM orders o
WHERE o.payment_status = 'paid'
    AND o.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(o.created_at), EXTRACT(HOUR FROM o.created_at)
ORDER BY sale_date DESC, hour_of_day;

-- =====================================================
-- VIEW: Category Sales
-- =====================================================
CREATE OR REPLACE VIEW view_category_sales AS
SELECT
    c.id AS category_id,
    c.name AS category_name,
    c.icon,
    c.color,
    COUNT(DISTINCT oi.order_id) AS order_count,
    SUM(oi.quantity) AS items_sold,
    SUM(oi.total_price) AS total_revenue,
    AVG(oi.total_price) AS avg_item_value
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
    AND o.payment_status = 'paid'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.icon, c.color
ORDER BY total_revenue DESC NULLS LAST;

-- =====================================================
-- VIEW: Customer Insights
-- =====================================================
CREATE OR REPLACE VIEW view_customer_insights AS
SELECT
    c.id AS customer_id,
    c.name AS customer_name,
    c.customer_type,
    cc.name AS category_name,
    c.loyalty_tier,
    c.loyalty_points,
    c.lifetime_points,
    c.total_visits,
    c.total_spent,
    CASE WHEN c.total_visits > 0 THEN c.total_spent / c.total_visits ELSE 0 END AS avg_order_value,
    c.last_visit_at,
    CURRENT_DATE - DATE(c.last_visit_at) AS days_since_last_visit
FROM customers c
LEFT JOIN customer_categories cc ON c.category_id = cc.id
WHERE c.is_active = TRUE
ORDER BY c.total_spent DESC;

-- =====================================================
-- VIEW: Stock Alerts
-- =====================================================
CREATE OR REPLACE VIEW view_stock_alerts AS
SELECT
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    p.current_stock,
    p.min_stock_level,
    p.unit,
    (p.min_stock_level - p.current_stock) AS quantity_needed,
    CASE
        WHEN p.current_stock <= 0 THEN 'critical'
        WHEN p.current_stock < p.min_stock_level * 0.5 THEN 'warning'
        ELSE 'low'
    END AS alert_level
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE
    AND p.current_stock < p.min_stock_level
ORDER BY
    CASE WHEN p.current_stock <= 0 THEN 0 ELSE 1 END,
    (p.current_stock / NULLIF(p.min_stock_level, 0)) ASC;

-- =====================================================
-- VIEW: Session Summary
-- =====================================================
CREATE OR REPLACE VIEW view_session_summary AS
SELECT
    ps.id AS session_id,
    ps.session_number,
    ps.opened_at,
    ps.closed_at,
    ps.status,
    up_open.name AS opened_by_name,
    up_close.name AS closed_by_name,
    ps.opening_cash,
    ps.closing_cash,
    ps.total_orders,
    ps.total_cash_sales,
    ps.total_card_sales,
    ps.total_qris_sales,
    ps.total_discounts,
    ps.total_refunds,
    (ps.total_cash_sales + ps.total_card_sales + ps.total_qris_sales) AS total_sales,
    ps.expected_cash,
    ps.cash_difference,
    ps.difference_reason
FROM pos_sessions ps
LEFT JOIN user_profiles up_open ON ps.opened_by = up_open.id
LEFT JOIN user_profiles up_close ON ps.closed_by = up_close.id
ORDER BY ps.opened_at DESC;

-- =====================================================
-- VIEW: B2B Performance
-- =====================================================
CREATE OR REPLACE VIEW view_b2b_performance AS
SELECT
    c.id AS customer_id,
    c.name AS customer_name,
    c.company_name,
    COUNT(DISTINCT bo.id) AS total_orders,
    SUM(bo.total) AS total_revenue,
    AVG(bo.total) AS avg_order_value,
    SUM(bo.paid_amount) AS total_paid,
    SUM(bo.amount_due) AS total_outstanding,
    MAX(bo.order_date) AS last_order_date
FROM customers c
JOIN b2b_orders bo ON c.id = bo.customer_id
WHERE c.customer_type = 'wholesale'
GROUP BY c.id, c.name, c.company_name
ORDER BY total_revenue DESC;

-- =====================================================
-- VIEW: Production Summary
-- =====================================================
CREATE OR REPLACE VIEW view_production_summary AS
SELECT
    pr.production_date,
    p.id AS product_id,
    p.name AS product_name,
    s.name AS section_name,
    SUM(pr.quantity_produced) AS total_produced,
    SUM(pr.quantity_waste) AS total_waste,
    COUNT(*) AS production_batches
FROM production_records pr
JOIN products p ON pr.product_id = p.id
LEFT JOIN sections s ON pr.section_id = s.id
WHERE pr.production_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pr.production_date, p.id, p.name, s.name
ORDER BY pr.production_date DESC, total_produced DESC;

-- =====================================================
-- VIEW: KDS Queue Status
-- =====================================================
CREATE OR REPLACE VIEW view_kds_queue_status AS
SELECT
    koq.station_type,
    koq.status,
    COUNT(*) AS order_count,
    AVG(EXTRACT(EPOCH FROM (NOW() - koq.created_at))) AS avg_wait_seconds
FROM kds_order_queue koq
WHERE koq.status IN ('pending', 'preparing')
GROUP BY koq.station_type, koq.status
ORDER BY koq.station_type, koq.status;

-- =====================================================
-- VIEW: Order Type Distribution
-- =====================================================
CREATE OR REPLACE VIEW view_order_type_distribution AS
SELECT
    DATE(o.created_at) AS report_date,
    o.order_type,
    COUNT(*) AS order_count,
    SUM(o.total) AS total_revenue,
    AVG(o.total) AS avg_order_value
FROM orders o
WHERE o.payment_status = 'paid'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(o.created_at), o.order_type
ORDER BY report_date DESC, order_count DESC;
