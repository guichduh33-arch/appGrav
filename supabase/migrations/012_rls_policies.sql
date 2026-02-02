-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 012: Row Level Security Policies
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_uoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_category_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_count_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_combo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_combo_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_free_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_price_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_customer_price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sound_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lan_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lan_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE display_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_order_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CORE TABLES POLICIES (Public read, auth write)
-- =====================================================

-- Categories
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_insert_auth" ON categories FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "categories_update_auth" ON categories FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "categories_delete_auth" ON categories FOR DELETE TO authenticated USING (TRUE);

-- Sections
CREATE POLICY "sections_select_all" ON sections FOR SELECT USING (TRUE);
CREATE POLICY "sections_insert_auth" ON sections FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "sections_update_auth" ON sections FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "sections_delete_auth" ON sections FOR DELETE TO authenticated USING (TRUE);

-- Products
CREATE POLICY "products_select_all" ON products FOR SELECT USING (TRUE);
CREATE POLICY "products_insert_auth" ON products FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "products_update_auth" ON products FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "products_delete_auth" ON products FOR DELETE TO authenticated USING (TRUE);

-- Product sections
CREATE POLICY "product_sections_select_all" ON product_sections FOR SELECT USING (TRUE);
CREATE POLICY "product_sections_manage_auth" ON product_sections FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Product modifiers
CREATE POLICY "modifiers_select_all" ON product_modifiers FOR SELECT USING (TRUE);
CREATE POLICY "modifiers_manage_auth" ON product_modifiers FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Product UOMs
CREATE POLICY "uoms_select_all" ON product_uoms FOR SELECT USING (TRUE);
CREATE POLICY "uoms_manage_auth" ON product_uoms FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Recipes
CREATE POLICY "recipes_select_all" ON recipes FOR SELECT USING (TRUE);
CREATE POLICY "recipes_manage_auth" ON recipes FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Variant materials
CREATE POLICY "variant_materials_select_all" ON product_variant_materials FOR SELECT USING (TRUE);
CREATE POLICY "variant_materials_manage_auth" ON product_variant_materials FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Suppliers
CREATE POLICY "suppliers_select_all" ON suppliers FOR SELECT USING (TRUE);
CREATE POLICY "suppliers_manage_auth" ON suppliers FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- =====================================================
-- CUSTOMER POLICIES
-- =====================================================

CREATE POLICY "customer_categories_select_all" ON customer_categories FOR SELECT USING (TRUE);
CREATE POLICY "customer_categories_manage_auth" ON customer_categories FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "loyalty_tiers_select_all" ON loyalty_tiers FOR SELECT USING (TRUE);
CREATE POLICY "loyalty_tiers_manage_auth" ON loyalty_tiers FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "customers_select_all" ON customers FOR SELECT USING (TRUE);
CREATE POLICY "customers_manage_auth" ON customers FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "product_category_prices_select_all" ON product_category_prices FOR SELECT USING (TRUE);
CREATE POLICY "product_category_prices_manage_auth" ON product_category_prices FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "loyalty_transactions_select_auth" ON loyalty_transactions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "loyalty_transactions_insert_auth" ON loyalty_transactions FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "loyalty_rewards_select_all" ON loyalty_rewards FOR SELECT USING (TRUE);
CREATE POLICY "loyalty_rewards_manage_auth" ON loyalty_rewards FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "loyalty_redemptions_select_auth" ON loyalty_redemptions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "loyalty_redemptions_insert_auth" ON loyalty_redemptions FOR INSERT TO authenticated WITH CHECK (TRUE);

-- =====================================================
-- SALES POLICIES
-- =====================================================

CREATE POLICY "pos_terminals_select_all" ON pos_terminals FOR SELECT USING (TRUE);
CREATE POLICY "pos_terminals_manage_auth" ON pos_terminals FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "pos_sessions_select_all" ON pos_sessions FOR SELECT USING (TRUE);
CREATE POLICY "pos_sessions_manage_auth" ON pos_sessions FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "orders_select_all" ON orders FOR SELECT USING (TRUE);
CREATE POLICY "orders_manage_auth" ON orders FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "order_items_select_all" ON order_items FOR SELECT USING (TRUE);
CREATE POLICY "order_items_manage_auth" ON order_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "floor_plan_items_select_all" ON floor_plan_items FOR SELECT USING (TRUE);
CREATE POLICY "floor_plan_items_manage_auth" ON floor_plan_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- =====================================================
-- INVENTORY POLICIES
-- =====================================================

CREATE POLICY "stock_locations_select_all" ON stock_locations FOR SELECT USING (TRUE);
CREATE POLICY "stock_locations_manage_auth" ON stock_locations FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "stock_movements_select_auth" ON stock_movements FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "stock_movements_insert_auth" ON stock_movements FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "production_records_select_auth" ON production_records FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "production_records_manage_auth" ON production_records FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "inventory_counts_select_auth" ON inventory_counts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "inventory_counts_manage_auth" ON inventory_counts FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "inventory_count_items_select_auth" ON inventory_count_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "inventory_count_items_manage_auth" ON inventory_count_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "internal_transfers_select_auth" ON internal_transfers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "internal_transfers_manage_auth" ON internal_transfers FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "transfer_items_select_auth" ON transfer_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "transfer_items_manage_auth" ON transfer_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "purchase_orders_select_auth" ON purchase_orders FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "purchase_orders_manage_auth" ON purchase_orders FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "po_items_select_auth" ON po_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "po_items_manage_auth" ON po_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- =====================================================
-- COMBOS & PROMOTIONS POLICIES
-- =====================================================

CREATE POLICY "product_combos_select_all" ON product_combos FOR SELECT USING (TRUE);
CREATE POLICY "product_combos_manage_auth" ON product_combos FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "combo_groups_select_all" ON product_combo_groups FOR SELECT USING (TRUE);
CREATE POLICY "combo_groups_manage_auth" ON product_combo_groups FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "combo_group_items_select_all" ON product_combo_group_items FOR SELECT USING (TRUE);
CREATE POLICY "combo_group_items_manage_auth" ON product_combo_group_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "combo_items_select_all" ON product_combo_items FOR SELECT USING (TRUE);
CREATE POLICY "combo_items_manage_auth" ON product_combo_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "promotions_select_all" ON promotions FOR SELECT USING (TRUE);
CREATE POLICY "promotions_manage_auth" ON promotions FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "promotion_products_select_all" ON promotion_products FOR SELECT USING (TRUE);
CREATE POLICY "promotion_products_manage_auth" ON promotion_products FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "promotion_free_products_select_all" ON promotion_free_products FOR SELECT USING (TRUE);
CREATE POLICY "promotion_free_products_manage_auth" ON promotion_free_products FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "promotion_usage_select_auth" ON promotion_usage FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "promotion_usage_insert_auth" ON promotion_usage FOR INSERT TO authenticated WITH CHECK (TRUE);

-- =====================================================
-- B2B POLICIES
-- =====================================================

CREATE POLICY "b2b_orders_select_auth" ON b2b_orders FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "b2b_orders_manage_auth" ON b2b_orders FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "b2b_order_items_select_auth" ON b2b_order_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "b2b_order_items_manage_auth" ON b2b_order_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "b2b_payments_select_auth" ON b2b_payments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "b2b_payments_manage_auth" ON b2b_payments FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "b2b_deliveries_select_auth" ON b2b_deliveries FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "b2b_deliveries_manage_auth" ON b2b_deliveries FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "b2b_price_lists_select_all" ON b2b_price_lists FOR SELECT USING (TRUE);
CREATE POLICY "b2b_price_lists_manage_auth" ON b2b_price_lists FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "b2b_price_list_items_select_all" ON b2b_price_list_items FOR SELECT USING (TRUE);
CREATE POLICY "b2b_price_list_items_manage_auth" ON b2b_price_list_items FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "b2b_customer_price_lists_select_all" ON b2b_customer_price_lists FOR SELECT USING (TRUE);
CREATE POLICY "b2b_customer_price_lists_manage_auth" ON b2b_customer_price_lists FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- =====================================================
-- USER/PERMISSION POLICIES
-- =====================================================

CREATE POLICY "roles_select_all" ON roles FOR SELECT USING (TRUE);
CREATE POLICY "roles_manage_auth" ON roles FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "permissions_select_all" ON permissions FOR SELECT USING (TRUE);

CREATE POLICY "role_permissions_select_all" ON role_permissions FOR SELECT USING (TRUE);
CREATE POLICY "role_permissions_manage_auth" ON role_permissions FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "user_profiles_select_all" ON user_profiles FOR SELECT USING (TRUE);
CREATE POLICY "user_profiles_manage_auth" ON user_profiles FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "user_roles_select_all" ON user_roles FOR SELECT USING (TRUE);
CREATE POLICY "user_roles_manage_auth" ON user_roles FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "user_permissions_select_all" ON user_permissions FOR SELECT USING (TRUE);
CREATE POLICY "user_permissions_manage_auth" ON user_permissions FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "user_sessions_select_all" ON user_sessions FOR SELECT USING (TRUE);
CREATE POLICY "user_sessions_manage_all" ON user_sessions FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "audit_logs_select_auth" ON audit_logs FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "audit_logs_insert_all" ON audit_logs FOR INSERT WITH CHECK (TRUE);

-- =====================================================
-- SETTINGS POLICIES
-- =====================================================

CREATE POLICY "settings_categories_select_all" ON settings_categories FOR SELECT USING (TRUE);
CREATE POLICY "settings_categories_manage_auth" ON settings_categories FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "settings_select_all" ON settings FOR SELECT USING (TRUE);
CREATE POLICY "settings_manage_auth" ON settings FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "settings_history_select_auth" ON settings_history FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "settings_history_insert_auth" ON settings_history FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "app_settings_select_all" ON app_settings FOR SELECT USING (TRUE);
CREATE POLICY "app_settings_manage_auth" ON app_settings FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "printer_configs_select_all" ON printer_configurations FOR SELECT USING (TRUE);
CREATE POLICY "printer_configs_manage_auth" ON printer_configurations FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "tax_rates_select_all" ON tax_rates FOR SELECT USING (TRUE);
CREATE POLICY "tax_rates_manage_auth" ON tax_rates FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "payment_methods_select_all" ON payment_methods FOR SELECT USING (TRUE);
CREATE POLICY "payment_methods_manage_auth" ON payment_methods FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "business_hours_select_all" ON business_hours FOR SELECT USING (TRUE);
CREATE POLICY "business_hours_manage_auth" ON business_hours FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "email_templates_select_all" ON email_templates FOR SELECT USING (TRUE);
CREATE POLICY "email_templates_manage_auth" ON email_templates FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "receipt_templates_select_all" ON receipt_templates FOR SELECT USING (TRUE);
CREATE POLICY "receipt_templates_manage_auth" ON receipt_templates FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "terminal_settings_select_all" ON terminal_settings FOR SELECT USING (TRUE);
CREATE POLICY "terminal_settings_manage_auth" ON terminal_settings FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "settings_profiles_select_all" ON settings_profiles FOR SELECT USING (TRUE);
CREATE POLICY "settings_profiles_manage_auth" ON settings_profiles FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "sound_assets_select_all" ON sound_assets FOR SELECT USING (TRUE);
CREATE POLICY "sound_assets_manage_auth" ON sound_assets FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- =====================================================
-- LAN/SYNC/DISPLAY POLICIES
-- =====================================================

CREATE POLICY "lan_nodes_select_all" ON lan_nodes FOR SELECT USING (TRUE);
CREATE POLICY "lan_nodes_manage_all" ON lan_nodes FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "lan_messages_select_all" ON lan_messages FOR SELECT USING (TRUE);
CREATE POLICY "lan_messages_manage_all" ON lan_messages FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "sync_devices_select_all" ON sync_devices FOR SELECT USING (TRUE);
CREATE POLICY "sync_devices_manage_all" ON sync_devices FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "sync_queue_select_all" ON sync_queue FOR SELECT USING (TRUE);
CREATE POLICY "sync_queue_manage_all" ON sync_queue FOR ALL USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "sync_conflicts_select_auth" ON sync_conflicts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "sync_conflicts_manage_auth" ON sync_conflicts FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "display_promotions_select_all" ON display_promotions FOR SELECT USING (TRUE);
CREATE POLICY "display_promotions_manage_auth" ON display_promotions FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "display_content_select_all" ON display_content FOR SELECT USING (TRUE);
CREATE POLICY "display_content_manage_auth" ON display_content FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "kds_stations_select_all" ON kds_stations FOR SELECT USING (TRUE);
CREATE POLICY "kds_stations_manage_auth" ON kds_stations FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "kds_order_queue_select_all" ON kds_order_queue FOR SELECT USING (TRUE);
CREATE POLICY "kds_order_queue_manage_all" ON kds_order_queue FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE kds_order_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE lan_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE lan_messages;
