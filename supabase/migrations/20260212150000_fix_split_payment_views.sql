-- =====================================================
-- S10 FIX: Update reporting views to use order_payments
-- instead of orders.payment_method for correct split
-- payment attribution.
--
-- Before: Split payment orders counted 100% under first
--   payment method (orders.payment_method).
-- After: Revenue correctly attributed to each payment
--   method via order_payments table.
-- =====================================================

-- =====================================================
-- VIEW: Daily KPIs (fix payment method breakdown)
-- =====================================================
CREATE OR REPLACE VIEW view_daily_kpis AS
WITH payment_data AS (
    -- Real order_payments records
    SELECT
        op.order_id,
        op.payment_method,
        op.amount
    FROM order_payments op
    JOIN orders o ON op.order_id = o.id
    WHERE o.payment_status = 'paid'

    UNION ALL

    -- Fallback for orders without order_payments (pre-split-payment era)
    SELECT
        o.id AS order_id,
        o.payment_method,
        o.total AS amount
    FROM orders o
    WHERE o.payment_status = 'paid'
      AND o.payment_method IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM order_payments op WHERE op.order_id = o.id)
)
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
    -- Payment method breakdown from order_payments (split-payment aware)
    COALESCE(SUM(pd.amount) FILTER (WHERE pd.payment_method = 'cash'), 0) AS cash_sales,
    COALESCE(SUM(pd.amount) FILTER (WHERE pd.payment_method = 'card'), 0) AS card_sales,
    COALESCE(SUM(pd.amount) FILTER (WHERE pd.payment_method = 'qris'), 0) AS qris_sales,
    COALESCE(SUM(pd.amount) FILTER (WHERE pd.payment_method = 'edc'), 0) AS edc_sales
FROM orders o
LEFT JOIN payment_data pd ON pd.order_id = o.id
WHERE o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(o.created_at)
ORDER BY report_date DESC;


-- =====================================================
-- VIEW: Payment Method Stats (fully split-payment aware)
-- =====================================================
CREATE OR REPLACE VIEW view_payment_method_stats AS
WITH payment_data AS (
    SELECT
        o.created_at,
        op.payment_method,
        op.amount,
        op.order_id
    FROM order_payments op
    JOIN orders o ON op.order_id = o.id
    WHERE o.payment_status = 'paid'

    UNION ALL

    SELECT
        o.created_at,
        o.payment_method,
        o.total AS amount,
        o.id AS order_id
    FROM orders o
    WHERE o.payment_status = 'paid'
      AND o.payment_method IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM order_payments op WHERE op.order_id = o.id)
)
SELECT
    DATE(pd.created_at) AS report_date,
    pd.payment_method,
    COUNT(*) AS transaction_count,
    SUM(pd.amount) AS total_amount,
    AVG(pd.amount) AS avg_amount
FROM payment_data pd
WHERE pd.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(pd.created_at), pd.payment_method
ORDER BY report_date DESC, total_amount DESC;
