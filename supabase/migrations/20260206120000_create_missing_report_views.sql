-- =====================================================
-- Migration: Missing Report Views, RPCs & system_alerts
-- Story 8.0: Reports Database Foundation
-- =====================================================

-- =====================================================
-- VIEW 1: Profit/Loss Report (daily)
-- Columns match IProfitLossReport interface
-- =====================================================
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

-- =====================================================
-- VIEW 2: Sales by Customer
-- Columns match ISalesByCustomerReport interface
-- =====================================================
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

-- =====================================================
-- VIEW 3: Sales by Hour (per day per hour)
-- Columns match ISalesByHourReport interface
-- =====================================================
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

-- =====================================================
-- VIEW 4: Session Cash Balance
-- Columns match ISessionCashBalanceReport interface
-- =====================================================
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

-- =====================================================
-- VIEW 5: B2B Receivables
-- Columns match IB2BReceivablesReport interface
-- =====================================================
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

-- =====================================================
-- VIEW 6: Stock Warning (enhanced)
-- Columns match IStockWarningReport interface
-- =====================================================
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

-- =====================================================
-- VIEW 7: Expired Stock
-- Columns match IExpiredStockReport interface
-- expiry_date is on stock_movements (per batch)
-- =====================================================
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

-- =====================================================
-- VIEW 8: Unsold Products
-- Columns match IUnsoldProductsReport interface
-- =====================================================
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
-- RPC 1: get_sales_comparison
-- Returns SalesComparison[] (current vs previous period)
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
    -- Current period
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
    -- Previous period
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
-- RPC 2: get_reporting_dashboard_summary
-- Returns DashboardSummary as JSON
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
    -- Period sales and orders
    SELECT
        COALESCE(SUM(o.total), 0),
        COUNT(*)
    INTO v_period_sales, v_period_orders
    FROM orders o
    WHERE o.payment_status = 'paid'
        AND o.created_at >= start_date
        AND o.created_at <= end_date;

    -- Top product by quantity sold
    SELECT
        oi.product_name,
        SUM(oi.quantity)
    INTO v_top_product_name, v_top_product_qty
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.payment_status = 'paid'
        AND o.created_at >= start_date
        AND o.created_at <= end_date
    GROUP BY oi.product_name
    ORDER BY SUM(oi.quantity) DESC
    LIMIT 1;

    -- Low stock count
    SELECT COUNT(*)
    INTO v_low_stock_count
    FROM products
    WHERE is_active = TRUE
        AND current_stock < min_stock_level;

    -- Active sessions
    SELECT COUNT(*)
    INTO v_active_sessions
    FROM pos_sessions
    WHERE status = 'open';

    -- Build JSON result
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

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved
    ON public.system_alerts(is_resolved, severity, created_at DESC)
    WHERE is_resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_system_alerts_type
    ON public.system_alerts(alert_type, created_at DESC);

-- RLS
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated user
CREATE POLICY "Authenticated read system_alerts"
    ON public.system_alerts
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Insert: any authenticated user (triggers create alerts)
CREATE POLICY "Authenticated insert system_alerts"
    ON public.system_alerts
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Update: only is_read, is_resolved, resolved_* fields (authenticated users)
CREATE POLICY "Authenticated update system_alerts"
    ON public.system_alerts
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- No DELETE policy (audit trail is immutable)

-- =====================================================
-- Grant execute on RPCs
-- =====================================================
GRANT EXECUTE ON FUNCTION public.get_sales_comparison TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_reporting_dashboard_summary TO authenticated;
