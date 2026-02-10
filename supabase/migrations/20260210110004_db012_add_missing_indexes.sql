-- =====================================================
-- DB-012: Add missing indexes for performance
-- =====================================================
-- Some of these may already exist with different names from earlier migrations.
-- Using IF NOT EXISTS and unique names prefixed with idx2_ to avoid conflicts.
-- =====================================================

-- orders.customer_id - existing idx_orders_customer has WHERE clause, add unconditional one
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- orders.staff_id - may exist as idx_orders_staff from 017_add_missing_fk
CREATE INDEX IF NOT EXISTS idx_orders_staff_id ON public.orders(staff_id);

-- loyalty_transactions.customer_id - may exist as idx_loyalty_transactions_customer
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON public.loyalty_transactions(customer_id);

-- b2b_order_items.order_id - may exist as idx_b2b_items_order
CREATE INDEX IF NOT EXISTS idx_b2b_order_items_order_id ON public.b2b_order_items(order_id);

-- inventory_count_items.count_id - may exist as idx_inventory_count_items_count
CREATE INDEX IF NOT EXISTS idx_inventory_count_items_count_id ON public.inventory_count_items(count_id);

-- stock_movements.product_id - may exist as idx_stock_movements_product
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);

-- order_items.order_id - may exist as idx_order_items_order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
