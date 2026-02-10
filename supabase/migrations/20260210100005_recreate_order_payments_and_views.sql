-- DB-003: Recreate order_payments table and all dropped report views
-- The 20260207043009 remote_schema migration dropped order_payments, system_alerts,
-- and all report views. We recreate them here.

-- =====================================================
-- TABLE: order_payments (for split payment support)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    cash_received DECIMAL(12,2),
    change_given DECIMAL(12,2),
    reference VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed',
    is_offline BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_payments_order_status ON public.order_payments(order_id, status);
CREATE INDEX IF NOT EXISTS idx_order_payments_created ON public.order_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_order_payments_sync ON public.order_payments(is_offline, synced_at) WHERE is_offline = true;

-- RLS
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "op_select" ON public.order_payments;
DROP POLICY IF EXISTS "op_insert" ON public.order_payments;
DROP POLICY IF EXISTS "op_update" ON public.order_payments;

CREATE POLICY "op_select" ON public.order_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "op_insert" ON public.order_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "op_update" ON public.order_payments FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

-- Grant access
GRANT SELECT, INSERT, UPDATE ON public.order_payments TO authenticated;

COMMENT ON TABLE public.order_payments IS 'Individual payment records for orders, supporting split payments';

-- =====================================================
-- TABLE: system_alerts (Anomaly Detection)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    title TEXT NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by UUID REFERENCES public.user_profiles(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved
    ON public.system_alerts(is_resolved, severity, created_at DESC)
    WHERE is_resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_system_alerts_type
    ON public.system_alerts(alert_type, created_at DESC);

ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "system_alerts_select" ON public.system_alerts;
DROP POLICY IF EXISTS "system_alerts_insert" ON public.system_alerts;
DROP POLICY IF EXISTS "system_alerts_update" ON public.system_alerts;

CREATE POLICY "system_alerts_select" ON public.system_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "system_alerts_insert" ON public.system_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "system_alerts_update" ON public.system_alerts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);

GRANT SELECT, INSERT, UPDATE ON public.system_alerts TO authenticated;

-- =====================================================
-- VIEW 1: Daily KPIs (from 013_views_reporting)
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
-- VIEW 2: Inventory Valuation (from 013)
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
-- VIEW 3: Payment Method Stats (from 013)
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
-- VIEW 4: Product Sales Performance (from 013)
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
-- VIEW 5: Staff Performance (from 013)
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
-- VIEW 6: Hourly Sales (from 013)
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
-- VIEW 7: Category Sales (from 013)
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
-- VIEW 8: Customer Insights (from 013)
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
-- VIEW 9: Stock Alerts (from 013)
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
-- VIEW 10: Session Summary (from 013)
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
    (COALESCE(ps.total_cash_sales,0) + COALESCE(ps.total_card_sales,0) + COALESCE(ps.total_qris_sales,0)) AS total_sales,
    ps.expected_cash,
    ps.cash_difference,
    ps.difference_reason
FROM pos_sessions ps
LEFT JOIN user_profiles up_open ON ps.opened_by = up_open.id
LEFT JOIN user_profiles up_close ON ps.closed_by = up_close.id
ORDER BY ps.opened_at DESC;

-- =====================================================
-- VIEW 11: B2B Performance (from 013)
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
-- VIEW 12: Production Summary (from 013)
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
-- VIEW 13: KDS Queue Status (from 013)
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
-- VIEW 14: Order Type Distribution (from 013)
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

-- =====================================================
-- VIEWS from 20260206120000 (8 report views)
-- =====================================================

-- VIEW: Profit/Loss Report
CREATE OR REPLACE VIEW view_profit_loss AS
SELECT
    DATE(o.created_at) AS report_date,
    COUNT(DISTINCT o.id) AS order_count,
    COALESCE(SUM(o.total), 0) AS gross_revenue,
    COALESCE(SUM(o.tax_amount), 0) AS tax_collected,
    COALESCE(SUM(o.discount_amount), 0) AS total_discounts,
    COALESCE(SUM(oi_agg.item_cogs), 0) AS cogs,
    COALESCE(SUM(o.total), 0) - COALESCE(SUM(oi_agg.item_cogs), 0) AS gross_profit,
    CASE
        WHEN COALESCE(SUM(o.total), 0) > 0
        THEN ROUND(((COALESCE(SUM(o.total), 0) - COALESCE(SUM(oi_agg.item_cogs), 0)) / COALESCE(SUM(o.total), 0)) * 100, 2)
        ELSE 0
    END AS margin_percentage
FROM orders o
LEFT JOIN (
    SELECT
        oi.order_id,
        SUM(oi.quantity * COALESCE(p.cost_price, 0)) AS item_cogs
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY oi.order_id
) oi_agg ON o.id = oi_agg.order_id
WHERE o.payment_status = 'paid'
    AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(o.created_at)
ORDER BY report_date DESC;

-- VIEW: Sales by Customer
CREATE OR REPLACE VIEW view_sales_by_customer AS
SELECT
    c.id AS customer_id,
    c.name AS customer_name,
    c.company_name,
    c.phone,
    COALESCE(c.customer_type, 'retail') AS customer_type,
    cc.name AS category_name,
    c.loyalty_tier,
    COUNT(DISTINCT o.id) AS order_count,
    COALESCE(SUM(o.total), 0) AS total_spent,
    CASE
        WHEN COUNT(DISTINCT o.id) > 0
        THEN ROUND(COALESCE(SUM(o.total), 0) / COUNT(DISTINCT o.id), 0)
        ELSE 0
    END AS avg_basket,
    MIN(o.created_at) AS first_order_at,
    MAX(o.created_at) AS last_order_at,
    COALESCE(CURRENT_DATE - DATE(MAX(o.created_at)), 0) AS days_since_last_order
FROM customers c
LEFT JOIN customer_categories cc ON c.category_id = cc.id
LEFT JOIN orders o ON c.id = o.customer_id AND o.payment_status = 'paid'
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.company_name, c.phone, c.customer_type, cc.name, c.loyalty_tier
ORDER BY total_spent DESC;

-- VIEW: Sales by Hour
CREATE OR REPLACE VIEW view_sales_by_hour AS
SELECT
    EXTRACT(HOUR FROM o.created_at)::INTEGER AS hour_of_day,
    DATE(o.created_at) AS report_date,
    COUNT(*) AS order_count,
    COALESCE(SUM(o.total), 0) AS total_revenue,
    COALESCE(AVG(o.total), 0) AS avg_order_value
FROM orders o
WHERE o.payment_status = 'paid'
    AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(o.created_at), EXTRACT(HOUR FROM o.created_at)
ORDER BY report_date DESC, hour_of_day;

-- VIEW: Session Cash Balance
CREATE OR REPLACE VIEW view_session_cash_balance AS
SELECT
    ps.id AS session_id,
    COALESCE(ps.terminal_id_str, ps.terminal_id::VARCHAR) AS terminal_id,
    up.name AS cashier_name,
    ps.opened_at AS started_at,
    ps.closed_at AS ended_at,
    COALESCE(ps.opening_cash, 0) AS opening_cash,
    ps.closing_cash,
    COALESCE(ps.total_cash_sales, 0) AS cash_received,
    COALESCE(ps.expected_cash, 0) AS expected_cash,
    COALESCE(ps.cash_difference, 0) AS cash_difference,
    COALESCE(ps.total_orders, 0) AS order_count,
    COALESCE(ps.total_cash_sales, 0) + COALESCE(ps.total_card_sales, 0) + COALESCE(ps.total_qris_sales, 0) AS total_revenue,
    ps.status
FROM pos_sessions ps
LEFT JOIN user_profiles up ON ps.opened_by = up.id
ORDER BY ps.opened_at DESC;

-- VIEW: B2B Receivables
CREATE OR REPLACE VIEW view_b2b_receivables AS
SELECT
    c.id AS customer_id,
    c.name AS customer_name,
    c.company_name,
    c.phone,
    COALESCE(c.credit_limit, 0) AS credit_limit,
    COALESCE(c.credit_limit, 0) - COALESCE(SUM(bo.amount_due), 0) AS credit_balance,
    COALESCE(SUM(bo.amount_due), 0) AS outstanding_amount,
    COUNT(DISTINCT bo.id) FILTER (WHERE bo.amount_due > 0) AS unpaid_order_count,
    MIN(bo.created_at) FILTER (WHERE bo.amount_due > 0) AS oldest_unpaid_at,
    COALESCE(
        CURRENT_DATE - DATE(MIN(bo.created_at) FILTER (WHERE bo.amount_due > 0)),
        0
    ) AS days_overdue
FROM customers c
LEFT JOIN b2b_orders bo ON c.id = bo.customer_id
WHERE c.customer_type = 'wholesale' AND c.is_active = TRUE
GROUP BY c.id, c.name, c.company_name, c.phone, c.credit_limit
ORDER BY outstanding_amount DESC;

-- VIEW: Stock Warning
CREATE OR REPLACE VIEW view_stock_warning AS
SELECT
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    COALESCE(p.current_stock, 0) AS current_stock,
    COALESCE(p.unit, 'unit') AS unit,
    COALESCE(p.min_stock_level, 0) AS min_stock_level,
    COALESCE(p.cost_price, 0) AS cost_price,
    COALESCE(p.retail_price, 0) AS retail_price,
    CASE
        WHEN COALESCE(p.min_stock_level, 0) > 0
        THEN ROUND((COALESCE(p.current_stock, 0) / p.min_stock_level) * 100, 1)
        ELSE 100
    END AS stock_percentage,
    CASE
        WHEN COALESCE(p.current_stock, 0) <= 0 THEN 'out_of_stock'
        WHEN COALESCE(p.current_stock, 0) < COALESCE(p.min_stock_level, 0) * 0.5 THEN 'critical'
        WHEN COALESCE(p.current_stock, 0) < COALESCE(p.min_stock_level, 0) THEN 'warning'
        ELSE 'ok'
    END AS alert_level,
    GREATEST(COALESCE(p.min_stock_level, 0) - COALESCE(p.current_stock, 0), 0) AS suggested_reorder,
    GREATEST(COALESCE(p.min_stock_level, 0) - COALESCE(p.current_stock, 0), 0) * COALESCE(p.cost_price, 0) AS value_at_risk
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE
ORDER BY
    CASE
        WHEN COALESCE(p.current_stock, 0) <= 0 THEN 0
        WHEN COALESCE(p.current_stock, 0) < COALESCE(p.min_stock_level, 0) * 0.5 THEN 1
        WHEN COALESCE(p.current_stock, 0) < COALESCE(p.min_stock_level, 0) THEN 2
        ELSE 3
    END,
    p.name;

-- VIEW: Expired Stock
CREATE OR REPLACE VIEW view_expired_stock AS
SELECT
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    COALESCE(p.current_stock, 0) AS current_stock,
    COALESCE(p.unit, 'unit') AS unit,
    COALESCE(p.cost_price, 0) AS cost_price,
    nearest_expiry.expiry_date,
    (nearest_expiry.expiry_date - CURRENT_DATE) AS days_until_expiry,
    CASE
        WHEN nearest_expiry.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN nearest_expiry.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
        WHEN nearest_expiry.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring'
        ELSE 'ok'
    END AS expiry_status,
    COALESCE(p.current_stock, 0) * COALESCE(p.cost_price, 0) AS potential_loss
FROM products p
JOIN (
    SELECT DISTINCT ON (product_id)
        product_id,
        expiry_date
    FROM stock_movements
    WHERE expiry_date IS NOT NULL
    ORDER BY product_id, expiry_date ASC
) nearest_expiry ON p.id = nearest_expiry.product_id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE
    AND COALESCE(p.current_stock, 0) > 0
ORDER BY nearest_expiry.expiry_date ASC;

-- VIEW: Unsold Products
CREATE OR REPLACE VIEW view_unsold_products AS
SELECT
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    COALESCE(p.current_stock, 0) AS current_stock,
    COALESCE(p.unit, 'unit') AS unit,
    COALESCE(p.cost_price, 0) AS cost_price,
    COALESCE(p.retail_price, 0) AS retail_price,
    last_sale.last_sale_at,
    COALESCE(CURRENT_DATE - DATE(last_sale.last_sale_at), 9999) AS days_since_sale,
    COALESCE(last_sale.total_units_sold, 0) AS total_units_sold,
    COALESCE(p.current_stock, 0) * COALESCE(p.cost_price, 0) AS stock_value
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN (
    SELECT
        oi.product_id,
        MAX(o.created_at) AS last_sale_at,
        SUM(oi.quantity)::INTEGER AS total_units_sold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
    GROUP BY oi.product_id
) last_sale ON p.id = last_sale.product_id
WHERE p.is_active = TRUE
    AND p.product_type = 'finished'
ORDER BY days_since_sale DESC;

-- =====================================================
-- RPC: get_sales_comparison
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_sales_comparison(
    current_start TIMESTAMPTZ,
    current_end TIMESTAMPTZ,
    previous_start TIMESTAMPTZ,
    previous_end TIMESTAMPTZ
)
RETURNS TABLE (
    period_label TEXT,
    total_revenue NUMERIC,
    net_revenue NUMERIC,
    transaction_count BIGINT,
    avg_basket NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        'current'::TEXT AS period_label,
        COALESCE(SUM(o.total), 0) AS total_revenue,
        COALESCE(SUM(o.total), 0) - COALESCE(SUM(o.tax_amount), 0) AS net_revenue,
        COUNT(*)::BIGINT AS transaction_count,
        COALESCE(AVG(o.total), 0) AS avg_basket
    FROM orders o
    WHERE o.payment_status = 'paid'
        AND o.created_at >= current_start
        AND o.created_at <= current_end
    UNION ALL
    SELECT
        'previous'::TEXT AS period_label,
        COALESCE(SUM(o.total), 0) AS total_revenue,
        COALESCE(SUM(o.total), 0) - COALESCE(SUM(o.tax_amount), 0) AS net_revenue,
        COUNT(*)::BIGINT AS transaction_count,
        COALESCE(AVG(o.total), 0) AS avg_basket
    FROM orders o
    WHERE o.payment_status = 'paid'
        AND o.created_at >= previous_start
        AND o.created_at <= previous_end;
END;
$$;

-- =====================================================
-- RPC: get_reporting_dashboard_summary
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_reporting_dashboard_summary(
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    v_period_sales NUMERIC;
    v_period_orders BIGINT;
    v_top_product_name TEXT;
    v_top_product_qty NUMERIC;
    v_low_stock_count BIGINT;
    v_active_sessions BIGINT;
BEGIN
    SELECT COALESCE(SUM(o.total), 0), COUNT(*)
    INTO v_period_sales, v_period_orders
    FROM orders o
    WHERE o.payment_status = 'paid'
        AND o.created_at >= start_date
        AND o.created_at <= end_date;

    SELECT oi.product_name, SUM(oi.quantity)
    INTO v_top_product_name, v_top_product_qty
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.payment_status = 'paid'
        AND o.created_at >= start_date
        AND o.created_at <= end_date
    GROUP BY oi.product_name
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 1;

    SELECT COUNT(*) INTO v_low_stock_count
    FROM products WHERE is_active = TRUE AND current_stock < min_stock_level;

    SELECT COUNT(*) INTO v_active_sessions
    FROM pos_sessions WHERE status = 'open';

    result := json_build_object(
        'period_sales', v_period_sales,
        'period_orders', v_period_orders,
        'top_product', CASE
            WHEN v_top_product_name IS NOT NULL
            THEN json_build_object('name', v_top_product_name, 'qty', v_top_product_qty)
            ELSE NULL
        END,
        'low_stock_alerts', v_low_stock_count,
        'active_sessions', v_active_sessions
    );

    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_sales_comparison TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_reporting_dashboard_summary TO authenticated;
