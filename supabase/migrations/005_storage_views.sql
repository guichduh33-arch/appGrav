-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Storage Configuration
-- Version: 2.0.0
-- =====================================================

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Note: Bucket creation is typically done via Supabase Dashboard or CLI
-- The following SQL is for reference and may need to be run separately

-- Product images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    TRUE,
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Receipts bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'receipts',
    'receipts',
    FALSE,
    2097152,  -- 2MB limit
    ARRAY['application/pdf', 'image/png', 'image/jpeg']
) ON CONFLICT (id) DO NOTHING;

-- Invoices bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoices',
    'invoices',
    FALSE,
    10485760,  -- 10MB limit
    ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Product Images: Public read
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Product Images: Admin upload
CREATE POLICY "Admin upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'product-images' AND 
    (SELECT is_admin_or_manager())
);

-- Product Images: Admin update
CREATE POLICY "Admin update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (
    bucket_id = 'product-images' AND 
    (SELECT is_admin_or_manager())
);

-- Product Images: Admin delete
CREATE POLICY "Admin delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'product-images' AND 
    (SELECT is_admin_or_manager())
);

-- Receipts: Staff can create
CREATE POLICY "Staff create receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'receipts' AND 
    (SELECT can_access_pos())
);

-- Receipts: Staff and backoffice can read
CREATE POLICY "Staff read receipts"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'receipts' AND 
    (SELECT can_access_pos() OR can_access_backoffice())
);

-- Invoices: Backoffice can create
CREATE POLICY "Backoffice create invoices"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'invoices' AND 
    (SELECT can_access_backoffice() OR is_admin_or_manager())
);

-- Invoices: Backoffice and admin can read
CREATE POLICY "Backoffice read invoices"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'invoices' AND 
    (SELECT can_access_backoffice() OR is_admin_or_manager())
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active products for POS
CREATE OR REPLACE VIEW pos_products AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.retail_price,
    p.current_stock,
    p.image_url,
    p.category_id,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    c.dispatch_station
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.pos_visible = TRUE 
AND p.available_for_sale = TRUE 
AND p.is_active = TRUE
AND (c.is_active = TRUE OR c.id IS NULL);

-- Today's orders summary
CREATE OR REPLACE VIEW todays_orders AS
SELECT 
    o.id,
    o.order_number,
    o.order_type,
    o.table_number,
    o.status,
    o.payment_status,
    o.total,
    o.payment_method,
    o.created_at,
    up.name as staff_name,
    c.name as customer_name
FROM orders o
LEFT JOIN user_profiles up ON up.id = o.staff_id
LEFT JOIN customers c ON c.id = o.customer_id
WHERE DATE(o.created_at) = CURRENT_DATE
ORDER BY o.created_at DESC;

-- KDS queue view
CREATE OR REPLACE VIEW kds_queue AS
SELECT 
    oi.id,
    oi.order_id,
    o.order_number,
    o.table_number,
    o.order_type,
    oi.product_name,
    oi.quantity,
    oi.modifiers,
    oi.notes,
    oi.dispatch_station,
    oi.item_status,
    oi.sent_to_kitchen_at,
    EXTRACT(EPOCH FROM (NOW() - oi.sent_to_kitchen_at))::INTEGER as wait_seconds
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE oi.item_status IN ('new', 'preparing')
AND oi.dispatch_station IS NOT NULL
AND oi.dispatch_station != 'none'
AND o.status NOT IN ('cancelled', 'completed')
ORDER BY oi.sent_to_kitchen_at ASC;

-- Low stock products
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.current_stock,
    p.min_stock_level,
    p.unit,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.current_stock < p.min_stock_level
AND p.is_active = TRUE
ORDER BY (p.current_stock / NULLIF(p.min_stock_level, 0)) ASC;

-- Daily sales summary
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(*) as total_orders,
    SUM(o.total) as total_revenue,
    SUM(o.discount_amount) as total_discounts,
    SUM(o.tax_amount) as total_tax,
    SUM(CASE WHEN o.payment_method = 'cash' THEN o.total ELSE 0 END) as cash_sales,
    SUM(CASE WHEN o.payment_method = 'card' THEN o.total ELSE 0 END) as card_sales,
    SUM(CASE WHEN o.payment_method = 'qris' THEN o.total ELSE 0 END) as qris_sales,
    AVG(o.total) as average_order_value
FROM orders o
WHERE o.payment_status = 'paid'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;
