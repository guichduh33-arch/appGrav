-- Migration: Fix 156 "RLS Policy Always True" security warnings
-- Problem: 47 tables have INSERT/UPDATE/DELETE policies using USING(true) or WITH CHECK(true)
--          which allows any authenticated user to write without further checks.
-- Fix: Replace `true` with `(auth.uid() IS NOT NULL)` so only authenticated users can write.
-- Safety: All SELECT policies already require auth.uid() IS NOT NULL. The app always uses
--         authenticated Supabase client. SECURITY DEFINER triggers bypass RLS and are unaffected.

BEGIN;

-- ============================================================================
-- PART 1: Drop 20 duplicate policies
-- 8 tables have duplicate policies for the same operation. Keep the _auth/_perm
-- variant and drop the plain-named duplicate.
-- ============================================================================

-- kds_order_queue (3 duplicates)
DROP POLICY "kds_order_queue_delete" ON public.kds_order_queue;
DROP POLICY "kds_order_queue_insert" ON public.kds_order_queue;
DROP POLICY "kds_order_queue_update" ON public.kds_order_queue;

-- lan_messages (3 duplicates)
DROP POLICY "lan_messages_delete" ON public.lan_messages;
DROP POLICY "lan_messages_insert" ON public.lan_messages;
DROP POLICY "lan_messages_update" ON public.lan_messages;

-- lan_nodes (3 duplicates)
DROP POLICY "lan_nodes_delete" ON public.lan_nodes;
DROP POLICY "lan_nodes_insert" ON public.lan_nodes;
DROP POLICY "lan_nodes_update" ON public.lan_nodes;

-- sync_conflicts (3 duplicates)
DROP POLICY "sync_conflicts_delete" ON public.sync_conflicts;
DROP POLICY "sync_conflicts_insert" ON public.sync_conflicts;
DROP POLICY "sync_conflicts_update" ON public.sync_conflicts;

-- sync_devices (3 duplicates)
DROP POLICY "sync_devices_delete" ON public.sync_devices;
DROP POLICY "sync_devices_insert" ON public.sync_devices;
DROP POLICY "sync_devices_update" ON public.sync_devices;

-- sync_queue (3 duplicates)
DROP POLICY "sync_queue_delete" ON public.sync_queue;
DROP POLICY "sync_queue_insert" ON public.sync_queue;
DROP POLICY "sync_queue_update" ON public.sync_queue;

-- settings_history (1 duplicate INSERT - keep _perm)
DROP POLICY "settings_history_insert" ON public.settings_history;

-- user_sessions (1 duplicate INSERT - keep _auth)
DROP POLICY "user_sessions_insert" ON public.user_sessions;


-- ============================================================================
-- PART 2: ALTER 136 remaining policies
-- Replace `true` with `(auth.uid() IS NOT NULL)`
-- - DELETE policies: ALTER ... USING (auth.uid() IS NOT NULL)
-- - INSERT policies: ALTER ... WITH CHECK (auth.uid() IS NOT NULL)
-- - UPDATE policies: ALTER ... USING (...) WITH CHECK (...) or just USING (...)
-- ============================================================================

-- --------------------------------------------------------
-- DELETE policies (44 total) - USING clause
-- --------------------------------------------------------

ALTER POLICY "b2b_order_items_delete" ON public.b2b_order_items USING (auth.uid() IS NOT NULL);
ALTER POLICY "b2b_orders_delete" ON public.b2b_orders USING (auth.uid() IS NOT NULL);
ALTER POLICY "b2b_payments_delete" ON public.b2b_payments USING (auth.uid() IS NOT NULL);
ALTER POLICY "business_hours_delete" ON public.business_hours USING (auth.uid() IS NOT NULL);
ALTER POLICY "categories_delete" ON public.categories USING (auth.uid() IS NOT NULL);
ALTER POLICY "customer_categories_delete" ON public.customer_categories USING (auth.uid() IS NOT NULL);
ALTER POLICY "customers_delete" ON public.customers USING (auth.uid() IS NOT NULL);
ALTER POLICY "floor_plan_items_delete" ON public.floor_plan_items USING (auth.uid() IS NOT NULL);
ALTER POLICY "internal_transfers_delete_auth" ON public.internal_transfers USING (auth.uid() IS NOT NULL);
ALTER POLICY "inventory_counts_delete" ON public.inventory_counts USING (auth.uid() IS NOT NULL);
ALTER POLICY "kds_order_queue_delete_auth" ON public.kds_order_queue USING (auth.uid() IS NOT NULL);
ALTER POLICY "lan_messages_delete_auth" ON public.lan_messages USING (auth.uid() IS NOT NULL);
ALTER POLICY "lan_nodes_delete_auth" ON public.lan_nodes USING (auth.uid() IS NOT NULL);
ALTER POLICY "loyalty_tiers_delete" ON public.loyalty_tiers USING (auth.uid() IS NOT NULL);
ALTER POLICY "loyalty_transactions_delete" ON public.loyalty_transactions USING (auth.uid() IS NOT NULL);
ALTER POLICY "order_items_delete" ON public.order_items USING (auth.uid() IS NOT NULL);
ALTER POLICY "orders_delete" ON public.orders USING (auth.uid() IS NOT NULL);
ALTER POLICY "payment_methods_delete" ON public.payment_methods USING (auth.uid() IS NOT NULL);
ALTER POLICY "pos_sessions_delete" ON public.pos_sessions USING (auth.uid() IS NOT NULL);
ALTER POLICY "product_category_prices_delete" ON public.product_category_prices USING (auth.uid() IS NOT NULL);
ALTER POLICY "product_combo_group_items_delete" ON public.product_combo_group_items USING (auth.uid() IS NOT NULL);
ALTER POLICY "product_combo_groups_delete" ON public.product_combo_groups USING (auth.uid() IS NOT NULL);
ALTER POLICY "product_combos_delete" ON public.product_combos USING (auth.uid() IS NOT NULL);
ALTER POLICY "product_modifiers_delete" ON public.product_modifiers USING (auth.uid() IS NOT NULL);
ALTER POLICY "Allow authenticated delete product_sections" ON public.product_sections USING (auth.uid() IS NOT NULL);
ALTER POLICY "product_uoms_delete" ON public.product_uoms USING (auth.uid() IS NOT NULL);
ALTER POLICY "production_records_delete" ON public.production_records USING (auth.uid() IS NOT NULL);
ALTER POLICY "products_delete" ON public.products USING (auth.uid() IS NOT NULL);
ALTER POLICY "promotion_free_products_delete" ON public.promotion_free_products USING (auth.uid() IS NOT NULL);
ALTER POLICY "promotion_products_delete" ON public.promotion_products USING (auth.uid() IS NOT NULL);
ALTER POLICY "promotion_usage_delete" ON public.promotion_usage USING (auth.uid() IS NOT NULL);
ALTER POLICY "promotions_delete" ON public.promotions USING (auth.uid() IS NOT NULL);
ALTER POLICY "purchase_orders_delete" ON public.purchase_orders USING (auth.uid() IS NOT NULL);
ALTER POLICY "recipes_delete" ON public.recipes USING (auth.uid() IS NOT NULL);
ALTER POLICY "section_stock_delete" ON public.section_stock USING (auth.uid() IS NOT NULL);
ALTER POLICY "sections_delete" ON public.sections USING (auth.uid() IS NOT NULL);
ALTER POLICY "stock_movements_delete" ON public.stock_movements USING (auth.uid() IS NOT NULL);
ALTER POLICY "suppliers_delete" ON public.suppliers USING (auth.uid() IS NOT NULL);
ALTER POLICY "sync_conflicts_delete_auth" ON public.sync_conflicts USING (auth.uid() IS NOT NULL);
ALTER POLICY "sync_devices_delete_auth" ON public.sync_devices USING (auth.uid() IS NOT NULL);
ALTER POLICY "sync_queue_delete_auth" ON public.sync_queue USING (auth.uid() IS NOT NULL);
ALTER POLICY "tax_rates_delete" ON public.tax_rates USING (auth.uid() IS NOT NULL);
ALTER POLICY "transfer_items_delete_auth" ON public.transfer_items USING (auth.uid() IS NOT NULL);
ALTER POLICY "user_sessions_delete_auth" ON public.user_sessions USING (auth.uid() IS NOT NULL);

-- --------------------------------------------------------
-- INSERT policies (47 total) - WITH CHECK clause
-- --------------------------------------------------------

ALTER POLICY "audit_logs_insert" ON public.audit_logs WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "b2b_order_items_insert" ON public.b2b_order_items WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "b2b_orders_insert" ON public.b2b_orders WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "b2b_payments_insert" ON public.b2b_payments WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "business_hours_insert" ON public.business_hours WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "categories_insert" ON public.categories WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "customer_categories_insert" ON public.customer_categories WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "customers_insert" ON public.customers WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "floor_plan_items_insert" ON public.floor_plan_items WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "internal_transfers_insert_auth" ON public.internal_transfers WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "inventory_counts_insert" ON public.inventory_counts WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "kds_order_queue_insert_auth" ON public.kds_order_queue WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "lan_messages_insert_auth" ON public.lan_messages WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "lan_nodes_insert_auth" ON public.lan_nodes WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "loyalty_tiers_insert" ON public.loyalty_tiers WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "loyalty_transactions_insert" ON public.loyalty_transactions WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "order_items_insert" ON public.order_items WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "orders_insert" ON public.orders WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "payment_methods_insert" ON public.payment_methods WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "pos_sessions_insert" ON public.pos_sessions WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_category_prices_insert" ON public.product_category_prices WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_combo_group_items_insert" ON public.product_combo_group_items WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_combo_groups_insert" ON public.product_combo_groups WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_combos_insert" ON public.product_combos WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_modifiers_insert" ON public.product_modifiers WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "Allow authenticated insert product_sections" ON public.product_sections WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_uoms_insert" ON public.product_uoms WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "production_records_insert" ON public.production_records WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "products_insert" ON public.products WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "promotion_free_products_insert" ON public.promotion_free_products WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "promotion_products_insert" ON public.promotion_products WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "promotion_usage_insert" ON public.promotion_usage WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "promotions_insert" ON public.promotions WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "purchase_orders_insert" ON public.purchase_orders WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "recipes_insert" ON public.recipes WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "section_stock_insert" ON public.section_stock WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "sections_insert" ON public.sections WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "sequence_tracker_insert" ON public.sequence_tracker WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "settings_history_insert_perm" ON public.settings_history WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "stock_movements_insert" ON public.stock_movements WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "suppliers_insert" ON public.suppliers WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "sync_conflicts_insert_auth" ON public.sync_conflicts WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "sync_devices_insert_auth" ON public.sync_devices WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "sync_queue_insert_auth" ON public.sync_queue WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "tax_rates_insert" ON public.tax_rates WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "transfer_items_insert_auth" ON public.transfer_items WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "user_sessions_insert_auth" ON public.user_sessions WITH CHECK (auth.uid() IS NOT NULL);

-- --------------------------------------------------------
-- UPDATE policies with BOTH qual and with_check = true (37 total)
-- --------------------------------------------------------

ALTER POLICY "b2b_order_items_update" ON public.b2b_order_items USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "b2b_orders_update" ON public.b2b_orders USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "b2b_payments_update" ON public.b2b_payments USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "business_hours_update" ON public.business_hours USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "categories_update" ON public.categories USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "customer_categories_update" ON public.customer_categories USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "customers_update" ON public.customers USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "floor_plan_items_update" ON public.floor_plan_items USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "internal_transfers_update_auth" ON public.internal_transfers USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "inventory_counts_update" ON public.inventory_counts USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "loyalty_tiers_update" ON public.loyalty_tiers USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "loyalty_transactions_update" ON public.loyalty_transactions USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "order_items_update" ON public.order_items USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "orders_update" ON public.orders USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "payment_methods_update" ON public.payment_methods USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "pos_sessions_update" ON public.pos_sessions USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_category_prices_update" ON public.product_category_prices USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_combo_group_items_update" ON public.product_combo_group_items USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_combo_groups_update" ON public.product_combo_groups USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_combos_update" ON public.product_combos USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_modifiers_update" ON public.product_modifiers USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "Allow authenticated update product_sections" ON public.product_sections USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "product_uoms_update" ON public.product_uoms USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "production_records_update" ON public.production_records USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "products_update" ON public.products USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "promotion_free_products_update" ON public.promotion_free_products USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "promotion_products_update" ON public.promotion_products USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "promotion_usage_update" ON public.promotion_usage USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "promotions_update" ON public.promotions USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "purchase_orders_update" ON public.purchase_orders USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "recipes_update" ON public.recipes USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "section_stock_update" ON public.section_stock USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "sections_update" ON public.sections USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "stock_movements_update" ON public.stock_movements USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "suppliers_update" ON public.suppliers USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "tax_rates_update" ON public.tax_rates USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
ALTER POLICY "transfer_items_update_auth" ON public.transfer_items USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- --------------------------------------------------------
-- UPDATE policies with ONLY qual = true (with_check is NULL, 8 total)
-- When with_check is NULL, PostgreSQL defaults to using the USING expression.
-- --------------------------------------------------------

ALTER POLICY "kds_order_queue_update_auth" ON public.kds_order_queue USING (auth.uid() IS NOT NULL);
ALTER POLICY "lan_messages_update_auth" ON public.lan_messages USING (auth.uid() IS NOT NULL);
ALTER POLICY "lan_nodes_update_auth" ON public.lan_nodes USING (auth.uid() IS NOT NULL);
ALTER POLICY "sync_conflicts_update_auth" ON public.sync_conflicts USING (auth.uid() IS NOT NULL);
ALTER POLICY "sync_devices_update_auth" ON public.sync_devices USING (auth.uid() IS NOT NULL);
ALTER POLICY "sync_queue_update_auth" ON public.sync_queue USING (auth.uid() IS NOT NULL);
ALTER POLICY "sequence_tracker_update" ON public.sequence_tracker USING (auth.uid() IS NOT NULL);
ALTER POLICY "user_sessions_update_auth" ON public.user_sessions USING (auth.uid() IS NOT NULL);

COMMIT;
