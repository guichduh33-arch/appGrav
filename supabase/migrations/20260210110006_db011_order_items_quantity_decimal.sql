-- =====================================================
-- DB-011: Change order_items.quantity from INTEGER to DECIMAL(10,3)
-- =====================================================
-- Products can be sold in fractional quantities (e.g., 0.5 kg of bread).
-- The INTEGER type truncates these values. Change to DECIMAL(10,3) for precision.
--
-- Must drop and recreate dependent views first.
-- =====================================================

-- Step 1: Drop dependent views
DROP VIEW IF EXISTS view_product_sales;
DROP VIEW IF EXISTS view_category_sales;
DROP VIEW IF EXISTS view_profit_loss;
DROP VIEW IF EXISTS view_unsold_products;

-- Step 2: Alter column type
ALTER TABLE public.order_items
    ALTER COLUMN quantity TYPE DECIMAL(10,3);

-- Step 3: Recreate views

-- view_product_sales
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

-- view_category_sales
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

-- view_profit_loss
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
        WHEN COALESCE(SUM(o.total), 0) > 0 THEN
            ROUND((COALESCE(SUM(o.total), 0) - COALESCE(SUM(oi_agg.item_cogs), 0)) / COALESCE(SUM(o.total), 0) * 100, 2)
        ELSE 0
    END AS margin_percentage
FROM orders o
LEFT JOIN (
    SELECT oi.order_id,
           SUM(oi.quantity * COALESCE(p.cost_price, 0)) AS item_cogs
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY oi.order_id
) oi_agg ON o.id = oi_agg.order_id
WHERE o.payment_status = 'paid'
    AND o.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(o.created_at)
ORDER BY DATE(o.created_at) DESC;

-- view_unsold_products
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
    SELECT oi.product_id,
           MAX(o.created_at) AS last_sale_at,
           SUM(oi.quantity)::integer AS total_units_sold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'paid'
    GROUP BY oi.product_id
) last_sale ON p.id = last_sale.product_id
WHERE p.is_active = TRUE
    AND p.product_type = 'finished'
ORDER BY COALESCE(CURRENT_DATE - DATE(last_sale.last_sale_at), 9999) DESC;
