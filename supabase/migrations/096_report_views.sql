-- Migration: Report SQL Views
-- Epic 3: Story 3.1 & 3.2
-- Creates optimized views for report queries

-- =============================================================
-- VIEW: Profit/Loss Report (FR35)
-- Daily aggregations with revenue, costs, and margins
-- =============================================================

DROP VIEW IF EXISTS public.view_profit_loss;

CREATE VIEW public.view_profit_loss AS
SELECT
  date_trunc('day', o.created_at)::date as report_date,
  COUNT(DISTINCT o.id) as order_count,
  SUM(o.total) as gross_revenue,
  SUM(o.total * 10 / 110) as tax_collected,
  SUM(o.discount_value) as total_discounts,
  COALESCE(SUM(
    (SELECT SUM(oi.quantity * COALESCE(p.cost_price, 0))
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = o.id)
  ), 0) as cogs,
  SUM(o.total) - COALESCE(SUM(
    (SELECT SUM(oi.quantity * COALESCE(p.cost_price, 0))
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = o.id)
  ), 0) as gross_profit,
  CASE
    WHEN SUM(o.total) > 0
    THEN ((SUM(o.total) - COALESCE(SUM(
      (SELECT SUM(oi.quantity * COALESCE(p.cost_price, 0))
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = o.id)
    ), 0)) / SUM(o.total)) * 100
    ELSE 0
  END as margin_percentage
FROM orders o
WHERE o.status = 'completed'
GROUP BY date_trunc('day', o.created_at)
ORDER BY report_date DESC;

-- =============================================================
-- VIEW: Sales by Customer (FR36)
-- Customer-level sales aggregations
-- =============================================================

DROP VIEW IF EXISTS public.view_sales_by_customer;

CREATE VIEW public.view_sales_by_customer AS
SELECT
  c.id as customer_id,
  c.name as customer_name,
  c.company_name,
  c.phone,
  c.customer_type,
  cc.name as category_name,
  c.loyalty_tier,
  COUNT(DISTINCT o.id) as order_count,
  SUM(o.total) as total_spent,
  AVG(o.total) as avg_basket,
  MIN(o.created_at) as first_order_at,
  MAX(o.created_at) as last_order_at,
  -- Days since last order
  EXTRACT(DAY FROM (NOW() - MAX(o.created_at))) as days_since_last_order
FROM customers c
LEFT JOIN customer_categories cc ON cc.id = c.category_id
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'completed'
WHERE c.is_active = true
GROUP BY c.id, c.name, c.company_name, c.phone, c.customer_type, cc.name, c.loyalty_tier
ORDER BY total_spent DESC NULLS LAST;

-- =============================================================
-- VIEW: Sales by Hour (FR37)
-- Hourly sales distribution
-- =============================================================

DROP VIEW IF EXISTS public.view_sales_by_hour;

CREATE VIEW public.view_sales_by_hour AS
SELECT
  EXTRACT(HOUR FROM o.created_at) as hour_of_day,
  date_trunc('day', o.created_at)::date as report_date,
  COUNT(DISTINCT o.id) as order_count,
  SUM(o.total) as total_revenue,
  AVG(o.total) as avg_order_value
FROM orders o
WHERE o.status = 'completed'
GROUP BY EXTRACT(HOUR FROM o.created_at), date_trunc('day', o.created_at)
ORDER BY report_date DESC, hour_of_day;

-- =============================================================
-- VIEW: Session Cash Balance (FR44)
-- POS session cash reconciliation
-- =============================================================

DROP VIEW IF EXISTS public.view_session_cash_balance;

CREATE VIEW public.view_session_cash_balance AS
SELECT
  ps.id as session_id,
  ps.session_number,
  up.name as cashier_name,
  ps.opened_at,
  ps.closed_at,
  ps.opening_cash,
  ps.closing_cash,
  -- Calculate cash received from cash payments
  COALESCE((
    SELECT SUM(o.total)
    FROM orders o
    WHERE o.session_id = ps.id
      AND o.status = 'completed'
      AND o.payment_method = 'cash'
  ), 0) as cash_received,
  -- Expected cash = opening + cash received
  ps.opening_cash + COALESCE((
    SELECT SUM(o.total)
    FROM orders o
    WHERE o.session_id = ps.id
      AND o.status = 'completed'
      AND o.payment_method = 'cash'
  ), 0) as expected_cash,
  -- Cash difference
  COALESCE(ps.closing_cash, 0) - (
    ps.opening_cash + COALESCE((
      SELECT SUM(o.total)
      FROM orders o
      WHERE o.session_id = ps.id
        AND o.status = 'completed'
        AND o.payment_method = 'cash'
    ), 0)
  ) as cash_difference,
  -- Total orders in session
  (SELECT COUNT(*) FROM orders o WHERE o.session_id = ps.id AND o.status = 'completed') as order_count,
  -- Total revenue in session
  (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.session_id = ps.id AND o.status = 'completed') as total_revenue,
  ps.status
FROM pos_sessions ps
LEFT JOIN user_profiles up ON up.id = ps.opened_by
ORDER BY ps.opened_at DESC;

-- =============================================================
-- VIEW: B2B Receivables (FR45)
-- Outstanding B2B balances
-- =============================================================

DROP VIEW IF EXISTS public.view_b2b_receivables;

CREATE VIEW public.view_b2b_receivables AS
SELECT
  c.id as customer_id,
  c.name as customer_name,
  c.company_name,
  c.phone,
  c.credit_limit,
  c.credit_balance,
  -- Outstanding from B2B orders
  COALESCE((
    SELECT SUM(bo.amount_due)
    FROM b2b_orders bo
    WHERE bo.customer_id = c.id
      AND bo.payment_status IN ('unpaid', 'partial')
  ), 0) as outstanding_amount,
  -- Count of unpaid orders
  (SELECT COUNT(*) FROM b2b_orders bo WHERE bo.customer_id = c.id AND bo.payment_status IN ('unpaid', 'partial')) as unpaid_order_count,
  -- Oldest unpaid order
  (SELECT MIN(bo.created_at) FROM b2b_orders bo WHERE bo.customer_id = c.id AND bo.payment_status IN ('unpaid', 'partial')) as oldest_unpaid_at,
  -- Days overdue (oldest unpaid)
  CASE
    WHEN (SELECT MIN(bo.created_at) FROM b2b_orders bo WHERE bo.customer_id = c.id AND bo.payment_status IN ('unpaid', 'partial')) IS NOT NULL
    THEN EXTRACT(DAY FROM (NOW() - (SELECT MIN(bo.created_at) FROM b2b_orders bo WHERE bo.customer_id = c.id AND bo.payment_status IN ('unpaid', 'partial'))))
    ELSE 0
  END as days_overdue
FROM customers c
WHERE c.customer_type = 'wholesale'
  AND c.is_active = true
ORDER BY outstanding_amount DESC NULLS LAST;

-- =============================================================
-- VIEW: Stock Warning (FR40, FR41)
-- Products with low stock levels
-- =============================================================

DROP VIEW IF EXISTS public.view_stock_warning;

CREATE VIEW public.view_stock_warning AS
SELECT
  p.id as product_id,
  p.sku,
  p.name as product_name,
  cat.name as category_name,
  p.current_stock,
  p.unit,
  p.min_stock_level,
  p.cost_price,
  p.retail_price,
  -- Calculate percentage of minimum
  CASE
    WHEN COALESCE(p.min_stock_level, 0) > 0
    THEN (p.current_stock::float / p.min_stock_level::float) * 100
    ELSE 100
  END as stock_percentage,
  -- Alert level
  CASE
    WHEN p.current_stock <= 0 THEN 'out_of_stock'
    WHEN COALESCE(p.min_stock_level, 0) > 0 AND p.current_stock <= p.min_stock_level * 0.5 THEN 'critical'
    WHEN COALESCE(p.min_stock_level, 0) > 0 AND p.current_stock <= p.min_stock_level THEN 'warning'
    ELSE 'ok'
  END as alert_level,
  -- Reorder quantity suggested
  CASE
    WHEN COALESCE(p.min_stock_level, 0) > 0 AND p.current_stock < p.min_stock_level
    THEN (p.min_stock_level * 2) - p.current_stock
    ELSE 0
  END as suggested_reorder,
  -- Value at risk
  p.cost_price * GREATEST(0, COALESCE(p.min_stock_level, 0) - p.current_stock) as value_at_risk
FROM products p
LEFT JOIN categories cat ON cat.id = p.category_id
WHERE p.is_active = true
  AND p.product_type IN ('finished', 'semi_finished')
  AND (
    p.current_stock <= 0
    OR (COALESCE(p.min_stock_level, 0) > 0 AND p.current_stock <= p.min_stock_level)
  )
ORDER BY
  CASE
    WHEN p.current_stock <= 0 THEN 1
    WHEN COALESCE(p.min_stock_level, 0) > 0 AND p.current_stock <= p.min_stock_level * 0.5 THEN 2
    ELSE 3
  END,
  p.current_stock ASC;

-- =============================================================
-- VIEW: Expired Stock (FR42)
-- Products with upcoming or past expiry dates
-- Note: Simplified - uses last stock receipt date + default shelf life
-- =============================================================

DROP VIEW IF EXISTS public.view_expired_stock;

CREATE VIEW public.view_expired_stock AS
SELECT
  p.id as product_id,
  p.sku,
  p.name as product_name,
  cat.name as category_name,
  p.current_stock,
  p.unit,
  p.cost_price,
  -- Estimate expiry based on last stock receipt + 30 days default shelf life
  COALESCE(
    (SELECT MAX(sm.created_at)::date + interval '30 days'
     FROM stock_movements sm
     WHERE sm.product_id = p.id
       AND sm.movement_type IN ('purchase', 'production_in', 'adjustment_in')
       AND sm.quantity > 0),
    p.created_at::date + interval '30 days'
  )::date as estimated_expiry_date,
  -- Days until estimated expiry (date subtraction returns integer in PostgreSQL)
  (COALESCE(
    (SELECT MAX(sm.created_at)::date + 30
     FROM stock_movements sm
     WHERE sm.product_id = p.id
       AND sm.movement_type IN ('purchase', 'production_in', 'adjustment_in')
       AND sm.quantity > 0),
    p.created_at::date + 30
  ) - CURRENT_DATE) as days_until_expiry,
  -- Expiry status (estimated)
  CASE
    WHEN COALESCE(
      (SELECT MAX(sm.created_at)::date + interval '30 days'
       FROM stock_movements sm
       WHERE sm.product_id = p.id
         AND sm.movement_type IN ('purchase', 'production_in', 'adjustment_in')
         AND sm.quantity > 0),
      p.created_at::date + interval '30 days'
    )::date < CURRENT_DATE THEN 'expired'
    WHEN COALESCE(
      (SELECT MAX(sm.created_at)::date + interval '30 days'
       FROM stock_movements sm
       WHERE sm.product_id = p.id
         AND sm.movement_type IN ('purchase', 'production_in', 'adjustment_in')
         AND sm.quantity > 0),
      p.created_at::date + interval '30 days'
    )::date <= CURRENT_DATE + interval '7 days' THEN 'expiring_soon'
    WHEN COALESCE(
      (SELECT MAX(sm.created_at)::date + interval '30 days'
       FROM stock_movements sm
       WHERE sm.product_id = p.id
         AND sm.movement_type IN ('purchase', 'production_in', 'adjustment_in')
         AND sm.quantity > 0),
      p.created_at::date + interval '30 days'
    )::date <= CURRENT_DATE + interval '30 days' THEN 'expiring'
    ELSE 'ok'
  END as expiry_status,
  -- Potential loss if expired
  p.cost_price * p.current_stock as potential_loss
FROM products p
LEFT JOIN categories cat ON cat.id = p.category_id
WHERE p.is_active = true
  AND p.current_stock > 0
  AND p.product_type IN ('finished', 'semi_finished', 'raw_material')
ORDER BY estimated_expiry_date ASC NULLS LAST;

-- =============================================================
-- VIEW: Unsold Products (FR43)
-- Products with no recent sales
-- =============================================================

DROP VIEW IF EXISTS public.view_unsold_products;

CREATE VIEW public.view_unsold_products AS
SELECT
  p.id as product_id,
  p.sku,
  p.name as product_name,
  cat.name as category_name,
  p.current_stock,
  p.unit,
  p.cost_price,
  p.retail_price,
  -- Last sale date
  (SELECT MAX(o.created_at)
   FROM order_items oi
   JOIN orders o ON o.id = oi.order_id
   WHERE oi.product_id = p.id AND o.status = 'completed') as last_sale_at,
  -- Days since last sale
  EXTRACT(DAY FROM (NOW() - COALESCE(
    (SELECT MAX(o.created_at)
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE oi.product_id = p.id AND o.status = 'completed'),
    p.created_at
  ))) as days_since_sale,
  -- Total units sold all time
  COALESCE((
    SELECT SUM(oi.quantity)
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.product_id = p.id AND o.status = 'completed'
  ), 0) as total_units_sold,
  -- Stock value
  p.cost_price * p.current_stock as stock_value
FROM products p
LEFT JOIN categories cat ON cat.id = p.category_id
WHERE p.is_active = true
  AND p.product_type = 'finished'
  AND p.current_stock > 0
ORDER BY days_since_sale DESC NULLS FIRST;

-- =============================================================
-- VIEW: Payment Method Stats
-- Distribution by payment method
-- =============================================================

DROP VIEW IF EXISTS public.view_payment_method_stats;

CREATE VIEW public.view_payment_method_stats AS
SELECT
  date_trunc('day', o.created_at)::date as report_date,
  o.payment_method,
  COUNT(*) as transaction_count,
  SUM(o.total) as total_amount,
  AVG(o.total) as avg_amount
FROM orders o
WHERE o.status = 'completed'
  AND o.payment_method IS NOT NULL
GROUP BY date_trunc('day', o.created_at), o.payment_method
ORDER BY report_date DESC, total_amount DESC;

-- =============================================================
-- Indexes for Performance
-- =============================================================

-- Index on orders for date range queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);

-- Index for customer queries
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type) WHERE is_active = true;

-- Index for stock queries
CREATE INDEX IF NOT EXISTS idx_products_current_stock ON products(current_stock) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_min_stock ON products(min_stock_level) WHERE is_active = true;

-- =============================================================
-- RLS Policies for Views
-- Note: Views inherit RLS from underlying tables
-- =============================================================

-- Grant SELECT on views to authenticated users
GRANT SELECT ON public.view_profit_loss TO authenticated;
GRANT SELECT ON public.view_sales_by_customer TO authenticated;
GRANT SELECT ON public.view_sales_by_hour TO authenticated;
GRANT SELECT ON public.view_session_cash_balance TO authenticated;
GRANT SELECT ON public.view_b2b_receivables TO authenticated;
GRANT SELECT ON public.view_stock_warning TO authenticated;
GRANT SELECT ON public.view_expired_stock TO authenticated;
GRANT SELECT ON public.view_unsold_products TO authenticated;
GRANT SELECT ON public.view_payment_method_stats TO authenticated;
