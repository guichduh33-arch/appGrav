-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Migration 015: Security & Integrity Fixes
-- Fixes: RLS policies, race conditions, FK constraints,
--        sensitive data protection, business rules
-- =====================================================

-- =====================================================
-- 1. DROP ALL PERMISSIVE RLS POLICIES
-- =====================================================

-- Core tables
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_auth" ON categories;
DROP POLICY IF EXISTS "categories_update_auth" ON categories;
DROP POLICY IF EXISTS "categories_delete_auth" ON categories;

DROP POLICY IF EXISTS "sections_select_all" ON sections;
DROP POLICY IF EXISTS "sections_insert_auth" ON sections;
DROP POLICY IF EXISTS "sections_update_auth" ON sections;
DROP POLICY IF EXISTS "sections_delete_auth" ON sections;

DROP POLICY IF EXISTS "products_select_all" ON products;
DROP POLICY IF EXISTS "products_insert_auth" ON products;
DROP POLICY IF EXISTS "products_update_auth" ON products;
DROP POLICY IF EXISTS "products_delete_auth" ON products;

DROP POLICY IF EXISTS "product_sections_select_all" ON product_sections;
DROP POLICY IF EXISTS "product_sections_manage_auth" ON product_sections;

DROP POLICY IF EXISTS "modifiers_select_all" ON product_modifiers;
DROP POLICY IF EXISTS "modifiers_manage_auth" ON product_modifiers;

DROP POLICY IF EXISTS "uoms_select_all" ON product_uoms;
DROP POLICY IF EXISTS "uoms_manage_auth" ON product_uoms;

DROP POLICY IF EXISTS "recipes_select_all" ON recipes;
DROP POLICY IF EXISTS "recipes_manage_auth" ON recipes;

DROP POLICY IF EXISTS "variant_materials_select_all" ON product_variant_materials;
DROP POLICY IF EXISTS "variant_materials_manage_auth" ON product_variant_materials;

DROP POLICY IF EXISTS "suppliers_select_all" ON suppliers;
DROP POLICY IF EXISTS "suppliers_manage_auth" ON suppliers;

-- Customer tables
DROP POLICY IF EXISTS "customer_categories_select_all" ON customer_categories;
DROP POLICY IF EXISTS "customer_categories_manage_auth" ON customer_categories;

DROP POLICY IF EXISTS "loyalty_tiers_select_all" ON loyalty_tiers;
DROP POLICY IF EXISTS "loyalty_tiers_manage_auth" ON loyalty_tiers;

DROP POLICY IF EXISTS "customers_select_all" ON customers;
DROP POLICY IF EXISTS "customers_manage_auth" ON customers;

DROP POLICY IF EXISTS "product_category_prices_select_all" ON product_category_prices;
DROP POLICY IF EXISTS "product_category_prices_manage_auth" ON product_category_prices;

DROP POLICY IF EXISTS "loyalty_transactions_select_auth" ON loyalty_transactions;
DROP POLICY IF EXISTS "loyalty_transactions_insert_auth" ON loyalty_transactions;

DROP POLICY IF EXISTS "loyalty_rewards_select_all" ON loyalty_rewards;
DROP POLICY IF EXISTS "loyalty_rewards_manage_auth" ON loyalty_rewards;

DROP POLICY IF EXISTS "loyalty_redemptions_select_auth" ON loyalty_redemptions;
DROP POLICY IF EXISTS "loyalty_redemptions_insert_auth" ON loyalty_redemptions;

-- Sales tables
DROP POLICY IF EXISTS "pos_terminals_select_all" ON pos_terminals;
DROP POLICY IF EXISTS "pos_terminals_manage_auth" ON pos_terminals;

DROP POLICY IF EXISTS "pos_sessions_select_all" ON pos_sessions;
DROP POLICY IF EXISTS "pos_sessions_manage_auth" ON pos_sessions;

DROP POLICY IF EXISTS "orders_select_all" ON orders;
DROP POLICY IF EXISTS "orders_manage_auth" ON orders;

DROP POLICY IF EXISTS "order_items_select_all" ON order_items;
DROP POLICY IF EXISTS "order_items_manage_auth" ON order_items;

DROP POLICY IF EXISTS "floor_plan_items_select_all" ON floor_plan_items;
DROP POLICY IF EXISTS "floor_plan_items_manage_auth" ON floor_plan_items;

-- Inventory tables
DROP POLICY IF EXISTS "stock_locations_select_all" ON stock_locations;
DROP POLICY IF EXISTS "stock_locations_manage_auth" ON stock_locations;

DROP POLICY IF EXISTS "stock_movements_select_auth" ON stock_movements;
DROP POLICY IF EXISTS "stock_movements_insert_auth" ON stock_movements;

DROP POLICY IF EXISTS "production_records_select_auth" ON production_records;
DROP POLICY IF EXISTS "production_records_manage_auth" ON production_records;

DROP POLICY IF EXISTS "inventory_counts_select_auth" ON inventory_counts;
DROP POLICY IF EXISTS "inventory_counts_manage_auth" ON inventory_counts;

DROP POLICY IF EXISTS "inventory_count_items_select_auth" ON inventory_count_items;
DROP POLICY IF EXISTS "inventory_count_items_manage_auth" ON inventory_count_items;

DROP POLICY IF EXISTS "internal_transfers_select_auth" ON internal_transfers;
DROP POLICY IF EXISTS "internal_transfers_manage_auth" ON internal_transfers;

DROP POLICY IF EXISTS "transfer_items_select_auth" ON transfer_items;
DROP POLICY IF EXISTS "transfer_items_manage_auth" ON transfer_items;

DROP POLICY IF EXISTS "purchase_orders_select_auth" ON purchase_orders;
DROP POLICY IF EXISTS "purchase_orders_manage_auth" ON purchase_orders;

DROP POLICY IF EXISTS "po_items_select_auth" ON po_items;
DROP POLICY IF EXISTS "po_items_manage_auth" ON po_items;

-- Combos & Promotions
DROP POLICY IF EXISTS "product_combos_select_all" ON product_combos;
DROP POLICY IF EXISTS "product_combos_manage_auth" ON product_combos;

DROP POLICY IF EXISTS "combo_groups_select_all" ON product_combo_groups;
DROP POLICY IF EXISTS "combo_groups_manage_auth" ON product_combo_groups;

DROP POLICY IF EXISTS "combo_group_items_select_all" ON product_combo_group_items;
DROP POLICY IF EXISTS "combo_group_items_manage_auth" ON product_combo_group_items;

DROP POLICY IF EXISTS "combo_items_select_all" ON product_combo_items;
DROP POLICY IF EXISTS "combo_items_manage_auth" ON product_combo_items;

DROP POLICY IF EXISTS "promotions_select_all" ON promotions;
DROP POLICY IF EXISTS "promotions_manage_auth" ON promotions;

DROP POLICY IF EXISTS "promotion_products_select_all" ON promotion_products;
DROP POLICY IF EXISTS "promotion_products_manage_auth" ON promotion_products;

DROP POLICY IF EXISTS "promotion_free_products_select_all" ON promotion_free_products;
DROP POLICY IF EXISTS "promotion_free_products_manage_auth" ON promotion_free_products;

DROP POLICY IF EXISTS "promotion_usage_select_auth" ON promotion_usage;
DROP POLICY IF EXISTS "promotion_usage_insert_auth" ON promotion_usage;

-- B2B tables
DROP POLICY IF EXISTS "b2b_orders_select_auth" ON b2b_orders;
DROP POLICY IF EXISTS "b2b_orders_manage_auth" ON b2b_orders;

DROP POLICY IF EXISTS "b2b_order_items_select_auth" ON b2b_order_items;
DROP POLICY IF EXISTS "b2b_order_items_manage_auth" ON b2b_order_items;

DROP POLICY IF EXISTS "b2b_payments_select_auth" ON b2b_payments;
DROP POLICY IF EXISTS "b2b_payments_manage_auth" ON b2b_payments;

DROP POLICY IF EXISTS "b2b_deliveries_select_auth" ON b2b_deliveries;
DROP POLICY IF EXISTS "b2b_deliveries_manage_auth" ON b2b_deliveries;

DROP POLICY IF EXISTS "b2b_price_lists_select_all" ON b2b_price_lists;
DROP POLICY IF EXISTS "b2b_price_lists_manage_auth" ON b2b_price_lists;

DROP POLICY IF EXISTS "b2b_price_list_items_select_all" ON b2b_price_list_items;
DROP POLICY IF EXISTS "b2b_price_list_items_manage_auth" ON b2b_price_list_items;

DROP POLICY IF EXISTS "b2b_customer_price_lists_select_all" ON b2b_customer_price_lists;
DROP POLICY IF EXISTS "b2b_customer_price_lists_manage_auth" ON b2b_customer_price_lists;

-- User/Permission tables
DROP POLICY IF EXISTS "roles_select_all" ON roles;
DROP POLICY IF EXISTS "roles_manage_auth" ON roles;

DROP POLICY IF EXISTS "permissions_select_all" ON permissions;

DROP POLICY IF EXISTS "role_permissions_select_all" ON role_permissions;
DROP POLICY IF EXISTS "role_permissions_manage_auth" ON role_permissions;

DROP POLICY IF EXISTS "user_profiles_select_all" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_manage_auth" ON user_profiles;

DROP POLICY IF EXISTS "user_roles_select_all" ON user_roles;
DROP POLICY IF EXISTS "user_roles_manage_auth" ON user_roles;

DROP POLICY IF EXISTS "user_permissions_select_all" ON user_permissions;
DROP POLICY IF EXISTS "user_permissions_manage_auth" ON user_permissions;

DROP POLICY IF EXISTS "user_sessions_select_all" ON user_sessions;
DROP POLICY IF EXISTS "user_sessions_manage_all" ON user_sessions;

DROP POLICY IF EXISTS "audit_logs_select_auth" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_all" ON audit_logs;

-- Settings tables
DROP POLICY IF EXISTS "settings_categories_select_all" ON settings_categories;
DROP POLICY IF EXISTS "settings_categories_manage_auth" ON settings_categories;

DROP POLICY IF EXISTS "settings_select_all" ON settings;
DROP POLICY IF EXISTS "settings_manage_auth" ON settings;

DROP POLICY IF EXISTS "settings_history_select_auth" ON settings_history;
DROP POLICY IF EXISTS "settings_history_insert_auth" ON settings_history;

DROP POLICY IF EXISTS "app_settings_select_all" ON app_settings;
DROP POLICY IF EXISTS "app_settings_manage_auth" ON app_settings;

DROP POLICY IF EXISTS "printer_configs_select_all" ON printer_configurations;
DROP POLICY IF EXISTS "printer_configs_manage_auth" ON printer_configurations;

DROP POLICY IF EXISTS "tax_rates_select_all" ON tax_rates;
DROP POLICY IF EXISTS "tax_rates_manage_auth" ON tax_rates;

DROP POLICY IF EXISTS "payment_methods_select_all" ON payment_methods;
DROP POLICY IF EXISTS "payment_methods_manage_auth" ON payment_methods;

DROP POLICY IF EXISTS "business_hours_select_all" ON business_hours;
DROP POLICY IF EXISTS "business_hours_manage_auth" ON business_hours;

DROP POLICY IF EXISTS "email_templates_select_all" ON email_templates;
DROP POLICY IF EXISTS "email_templates_manage_auth" ON email_templates;

DROP POLICY IF EXISTS "receipt_templates_select_all" ON receipt_templates;
DROP POLICY IF EXISTS "receipt_templates_manage_auth" ON receipt_templates;

DROP POLICY IF EXISTS "terminal_settings_select_all" ON terminal_settings;
DROP POLICY IF EXISTS "terminal_settings_manage_auth" ON terminal_settings;

DROP POLICY IF EXISTS "settings_profiles_select_all" ON settings_profiles;
DROP POLICY IF EXISTS "settings_profiles_manage_auth" ON settings_profiles;

DROP POLICY IF EXISTS "sound_assets_select_all" ON sound_assets;
DROP POLICY IF EXISTS "sound_assets_manage_auth" ON sound_assets;

-- LAN/Sync/Display tables
DROP POLICY IF EXISTS "lan_nodes_select_all" ON lan_nodes;
DROP POLICY IF EXISTS "lan_nodes_manage_all" ON lan_nodes;

DROP POLICY IF EXISTS "lan_messages_select_all" ON lan_messages;
DROP POLICY IF EXISTS "lan_messages_manage_all" ON lan_messages;

DROP POLICY IF EXISTS "sync_devices_select_all" ON sync_devices;
DROP POLICY IF EXISTS "sync_devices_manage_all" ON sync_devices;

DROP POLICY IF EXISTS "sync_queue_select_all" ON sync_queue;
DROP POLICY IF EXISTS "sync_queue_manage_all" ON sync_queue;

DROP POLICY IF EXISTS "sync_conflicts_select_auth" ON sync_conflicts;
DROP POLICY IF EXISTS "sync_conflicts_manage_auth" ON sync_conflicts;

DROP POLICY IF EXISTS "display_promotions_select_all" ON display_promotions;
DROP POLICY IF EXISTS "display_promotions_manage_auth" ON display_promotions;

DROP POLICY IF EXISTS "display_content_select_all" ON display_content;
DROP POLICY IF EXISTS "display_content_manage_auth" ON display_content;

DROP POLICY IF EXISTS "kds_stations_select_all" ON kds_stations;
DROP POLICY IF EXISTS "kds_stations_manage_auth" ON kds_stations;

DROP POLICY IF EXISTS "kds_order_queue_select_all" ON kds_order_queue;
DROP POLICY IF EXISTS "kds_order_queue_manage_all" ON kds_order_queue;

-- =====================================================
-- 2. CREATE SECURE RLS POLICIES WITH PERMISSION CHECKS
-- =====================================================

-- Helper function to get current user's profile ID
CREATE OR REPLACE FUNCTION get_current_user_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- PRODUCTS MODULE - products.view, products.create, products.update, products.delete
-- =====================================================

-- Categories
CREATE POLICY "categories_select" ON categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "categories_insert" ON categories FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "categories_update" ON categories FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "categories_delete" ON categories FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

-- Sections
CREATE POLICY "sections_select" ON sections FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "sections_insert" ON sections FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "sections_update" ON sections FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "sections_delete" ON sections FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

-- Products
CREATE POLICY "products_select" ON products FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "products_insert" ON products FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "products_update" ON products FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "products_delete" ON products FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

-- Product sections
CREATE POLICY "product_sections_select" ON product_sections FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "product_sections_insert" ON product_sections FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "product_sections_update" ON product_sections FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "product_sections_delete" ON product_sections FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

-- Product modifiers
CREATE POLICY "modifiers_select" ON product_modifiers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "modifiers_insert" ON product_modifiers FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "modifiers_update" ON product_modifiers FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "modifiers_delete" ON product_modifiers FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

-- Product UOMs
CREATE POLICY "uoms_select" ON product_uoms FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "uoms_insert" ON product_uoms FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "uoms_update" ON product_uoms FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "uoms_delete" ON product_uoms FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

-- Recipes
CREATE POLICY "recipes_select" ON recipes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "recipes_insert" ON recipes FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "recipes_update" ON recipes FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "recipes_delete" ON recipes FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

-- Variant materials
CREATE POLICY "variant_materials_select" ON product_variant_materials FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "variant_materials_insert" ON product_variant_materials FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "variant_materials_update" ON product_variant_materials FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "variant_materials_delete" ON product_variant_materials FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

-- Suppliers
CREATE POLICY "suppliers_select" ON suppliers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "suppliers_insert" ON suppliers FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.create'));
CREATE POLICY "suppliers_update" ON suppliers FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.update'));
CREATE POLICY "suppliers_delete" ON suppliers FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.delete'));

-- =====================================================
-- CUSTOMERS MODULE - customers.view, customers.create, customers.update, customers.loyalty
-- =====================================================

CREATE POLICY "customer_categories_select" ON customer_categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "customer_categories_insert" ON customer_categories FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'customers.create'));
CREATE POLICY "customer_categories_update" ON customer_categories FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'customers.update'));
CREATE POLICY "customer_categories_delete" ON customer_categories FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'customers.update'));

CREATE POLICY "loyalty_tiers_select" ON loyalty_tiers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "loyalty_tiers_insert" ON loyalty_tiers FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'customers.loyalty'));
CREATE POLICY "loyalty_tiers_update" ON loyalty_tiers FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'customers.loyalty'));
CREATE POLICY "loyalty_tiers_delete" ON loyalty_tiers FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'customers.loyalty'));

CREATE POLICY "customers_select" ON customers FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "customers_insert" ON customers FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'customers.create'));
CREATE POLICY "customers_update" ON customers FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'customers.update'));
CREATE POLICY "customers_delete" ON customers FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'customers.update'));

CREATE POLICY "product_category_prices_select" ON product_category_prices FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "product_category_prices_insert" ON product_category_prices FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.pricing'));
CREATE POLICY "product_category_prices_update" ON product_category_prices FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.pricing'));
CREATE POLICY "product_category_prices_delete" ON product_category_prices FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.pricing'));

CREATE POLICY "loyalty_transactions_select" ON loyalty_transactions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "loyalty_transactions_insert" ON loyalty_transactions FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'customers.loyalty'));

CREATE POLICY "loyalty_rewards_select" ON loyalty_rewards FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "loyalty_rewards_insert" ON loyalty_rewards FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'customers.loyalty'));
CREATE POLICY "loyalty_rewards_update" ON loyalty_rewards FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'customers.loyalty'));
CREATE POLICY "loyalty_rewards_delete" ON loyalty_rewards FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'customers.loyalty'));

CREATE POLICY "loyalty_redemptions_select" ON loyalty_redemptions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "loyalty_redemptions_insert" ON loyalty_redemptions FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'customers.loyalty'));

-- =====================================================
-- SALES MODULE - sales.view, sales.create, sales.void, sales.discount
-- =====================================================

CREATE POLICY "pos_terminals_select" ON pos_terminals FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "pos_terminals_insert" ON pos_terminals FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "pos_terminals_update" ON pos_terminals FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "pos_terminals_delete" ON pos_terminals FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "pos_sessions_select" ON pos_sessions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "pos_sessions_insert" ON pos_sessions FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "pos_sessions_update" ON pos_sessions FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.create'));

CREATE POLICY "orders_select" ON orders FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "orders_insert" ON orders FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "orders_update" ON orders FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "orders_delete" ON orders FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.void'));

CREATE POLICY "order_items_select" ON order_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "order_items_insert" ON order_items FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "order_items_update" ON order_items FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "order_items_delete" ON order_items FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.void'));

CREATE POLICY "floor_plan_items_select" ON floor_plan_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "floor_plan_items_insert" ON floor_plan_items FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "floor_plan_items_update" ON floor_plan_items FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.create') OR
           user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "floor_plan_items_delete" ON floor_plan_items FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

-- =====================================================
-- INVENTORY MODULE - inventory.view, inventory.create, inventory.update, inventory.adjust
-- =====================================================

CREATE POLICY "stock_locations_select" ON stock_locations FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "stock_locations_insert" ON stock_locations FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.create'));
CREATE POLICY "stock_locations_update" ON stock_locations FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.update'));
CREATE POLICY "stock_locations_delete" ON stock_locations FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.delete'));

CREATE POLICY "stock_movements_select" ON stock_movements FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.view'));
CREATE POLICY "stock_movements_insert" ON stock_movements FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.adjust'));

CREATE POLICY "production_records_select" ON production_records FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.view'));
CREATE POLICY "production_records_insert" ON production_records FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.create'));
CREATE POLICY "production_records_update" ON production_records FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.update'));
CREATE POLICY "production_records_delete" ON production_records FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.delete'));

CREATE POLICY "inventory_counts_select" ON inventory_counts FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.view'));
CREATE POLICY "inventory_counts_insert" ON inventory_counts FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.adjust'));
CREATE POLICY "inventory_counts_update" ON inventory_counts FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.adjust'));
CREATE POLICY "inventory_counts_delete" ON inventory_counts FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.delete'));

CREATE POLICY "inventory_count_items_select" ON inventory_count_items FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.view'));
CREATE POLICY "inventory_count_items_insert" ON inventory_count_items FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.adjust'));
CREATE POLICY "inventory_count_items_update" ON inventory_count_items FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.adjust'));
CREATE POLICY "inventory_count_items_delete" ON inventory_count_items FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.delete'));

CREATE POLICY "internal_transfers_select" ON internal_transfers FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.view'));
CREATE POLICY "internal_transfers_insert" ON internal_transfers FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.create'));
CREATE POLICY "internal_transfers_update" ON internal_transfers FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.update'));
CREATE POLICY "internal_transfers_delete" ON internal_transfers FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.delete'));

CREATE POLICY "transfer_items_select" ON transfer_items FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.view'));
CREATE POLICY "transfer_items_insert" ON transfer_items FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.create'));
CREATE POLICY "transfer_items_update" ON transfer_items FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.update'));
CREATE POLICY "transfer_items_delete" ON transfer_items FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.delete'));

CREATE POLICY "purchase_orders_select" ON purchase_orders FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.view'));
CREATE POLICY "purchase_orders_insert" ON purchase_orders FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.create'));
CREATE POLICY "purchase_orders_update" ON purchase_orders FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.update'));
CREATE POLICY "purchase_orders_delete" ON purchase_orders FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.delete'));

CREATE POLICY "po_items_select" ON po_items FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.view'));
CREATE POLICY "po_items_insert" ON po_items FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'inventory.create'));
CREATE POLICY "po_items_update" ON po_items FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.update'));
CREATE POLICY "po_items_delete" ON po_items FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'inventory.delete'));

-- =====================================================
-- COMBOS & PROMOTIONS - products.create, products.update
-- =====================================================

CREATE POLICY "product_combos_select" ON product_combos FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "product_combos_insert" ON product_combos FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "product_combos_update" ON product_combos FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "product_combos_delete" ON product_combos FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

CREATE POLICY "combo_groups_select" ON product_combo_groups FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "combo_groups_insert" ON product_combo_groups FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "combo_groups_update" ON product_combo_groups FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "combo_groups_delete" ON product_combo_groups FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

CREATE POLICY "combo_group_items_select" ON product_combo_group_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "combo_group_items_insert" ON product_combo_group_items FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "combo_group_items_update" ON product_combo_group_items FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "combo_group_items_delete" ON product_combo_group_items FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

CREATE POLICY "combo_items_select" ON product_combo_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "combo_items_insert" ON product_combo_items FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "combo_items_update" ON product_combo_items FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "combo_items_delete" ON product_combo_items FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

CREATE POLICY "promotions_select" ON promotions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "promotions_insert" ON promotions FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "promotions_update" ON promotions FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "promotions_delete" ON promotions FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

CREATE POLICY "promotion_products_select" ON promotion_products FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "promotion_products_insert" ON promotion_products FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "promotion_products_update" ON promotion_products FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "promotion_products_delete" ON promotion_products FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

CREATE POLICY "promotion_free_products_select" ON promotion_free_products FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "promotion_free_products_insert" ON promotion_free_products FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.create'));
CREATE POLICY "promotion_free_products_update" ON promotion_free_products FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.update'));
CREATE POLICY "promotion_free_products_delete" ON promotion_free_products FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.delete'));

CREATE POLICY "promotion_usage_select" ON promotion_usage FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "promotion_usage_insert" ON promotion_usage FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'sales.create'));

-- =====================================================
-- B2B MODULE
-- =====================================================

CREATE POLICY "b2b_orders_select" ON b2b_orders FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.view'));
CREATE POLICY "b2b_orders_insert" ON b2b_orders FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "b2b_orders_update" ON b2b_orders FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "b2b_orders_delete" ON b2b_orders FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.void'));

CREATE POLICY "b2b_order_items_select" ON b2b_order_items FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.view'));
CREATE POLICY "b2b_order_items_insert" ON b2b_order_items FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "b2b_order_items_update" ON b2b_order_items FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "b2b_order_items_delete" ON b2b_order_items FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.void'));

CREATE POLICY "b2b_payments_select" ON b2b_payments FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.view'));
CREATE POLICY "b2b_payments_insert" ON b2b_payments FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "b2b_payments_update" ON b2b_payments FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "b2b_payments_delete" ON b2b_payments FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.void'));

CREATE POLICY "b2b_deliveries_select" ON b2b_deliveries FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.view'));
CREATE POLICY "b2b_deliveries_insert" ON b2b_deliveries FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "b2b_deliveries_update" ON b2b_deliveries FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.create'));
CREATE POLICY "b2b_deliveries_delete" ON b2b_deliveries FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'sales.void'));

CREATE POLICY "b2b_price_lists_select" ON b2b_price_lists FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "b2b_price_lists_insert" ON b2b_price_lists FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.pricing'));
CREATE POLICY "b2b_price_lists_update" ON b2b_price_lists FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.pricing'));
CREATE POLICY "b2b_price_lists_delete" ON b2b_price_lists FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.pricing'));

CREATE POLICY "b2b_price_list_items_select" ON b2b_price_list_items FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "b2b_price_list_items_insert" ON b2b_price_list_items FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.pricing'));
CREATE POLICY "b2b_price_list_items_update" ON b2b_price_list_items FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.pricing'));
CREATE POLICY "b2b_price_list_items_delete" ON b2b_price_list_items FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.pricing'));

CREATE POLICY "b2b_customer_price_lists_select" ON b2b_customer_price_lists FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "b2b_customer_price_lists_insert" ON b2b_customer_price_lists FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'products.pricing'));
CREATE POLICY "b2b_customer_price_lists_update" ON b2b_customer_price_lists FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.pricing'));
CREATE POLICY "b2b_customer_price_lists_delete" ON b2b_customer_price_lists FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'products.pricing'));

-- =====================================================
-- USER/PERMISSION MODULE - users.view, users.create, users.roles
-- =====================================================

CREATE POLICY "roles_select" ON roles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "roles_insert" ON roles FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'users.roles'));
CREATE POLICY "roles_update" ON roles FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.roles'));
CREATE POLICY "roles_delete" ON roles FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.roles') AND NOT is_system);

CREATE POLICY "permissions_select" ON permissions FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "role_permissions_select" ON role_permissions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "role_permissions_insert" ON role_permissions FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'users.roles'));
CREATE POLICY "role_permissions_update" ON role_permissions FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.roles'));
CREATE POLICY "role_permissions_delete" ON role_permissions FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.roles'));

-- User profiles: users can see basic info but sensitive data is protected
CREATE POLICY "user_profiles_select_basic" ON user_profiles FOR SELECT TO authenticated
    USING (TRUE);
CREATE POLICY "user_profiles_insert" ON user_profiles FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'users.create'));
CREATE POLICY "user_profiles_update_self" ON user_profiles FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid() OR user_has_permission(get_current_user_profile_id(), 'users.create'));
CREATE POLICY "user_profiles_delete" ON user_profiles FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.create'));

CREATE POLICY "user_roles_select" ON user_roles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "user_roles_insert" ON user_roles FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'users.roles'));
CREATE POLICY "user_roles_update" ON user_roles FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.roles'));
CREATE POLICY "user_roles_delete" ON user_roles FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.roles'));

CREATE POLICY "user_permissions_select" ON user_permissions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "user_permissions_insert" ON user_permissions FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'users.roles'));
CREATE POLICY "user_permissions_update" ON user_permissions FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.roles'));
CREATE POLICY "user_permissions_delete" ON user_permissions FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'users.roles'));

-- User sessions: users can only see their own sessions
CREATE POLICY "user_sessions_select_own" ON user_sessions FOR SELECT TO authenticated
    USING (user_id = get_current_user_profile_id() OR user_has_permission(get_current_user_profile_id(), 'users.view'));
CREATE POLICY "user_sessions_insert" ON user_sessions FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "user_sessions_update_own" ON user_sessions FOR UPDATE TO authenticated
    USING (user_id = get_current_user_profile_id());
CREATE POLICY "user_sessions_delete_own" ON user_sessions FOR DELETE TO authenticated
    USING (user_id = get_current_user_profile_id() OR user_has_permission(get_current_user_profile_id(), 'users.create'));

-- Audit logs: only admins can view, only system can insert
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.view') OR
           is_admin(get_current_user_profile_id()));
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (TRUE);

-- =====================================================
-- SETTINGS MODULE - settings.view, settings.update
-- =====================================================

CREATE POLICY "settings_categories_select" ON settings_categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "settings_categories_insert" ON settings_categories FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "settings_categories_update" ON settings_categories FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "settings_categories_delete" ON settings_categories FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "settings_select" ON settings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "settings_insert" ON settings FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "settings_update" ON settings FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "settings_delete" ON settings FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "settings_history_select" ON settings_history FOR SELECT TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.view'));
CREATE POLICY "settings_history_insert" ON settings_history FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "app_settings_select" ON app_settings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "app_settings_insert" ON app_settings FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "app_settings_update" ON app_settings FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "app_settings_delete" ON app_settings FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "printer_configs_select" ON printer_configurations FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "printer_configs_insert" ON printer_configurations FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "printer_configs_update" ON printer_configurations FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "printer_configs_delete" ON printer_configurations FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "tax_rates_select" ON tax_rates FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "tax_rates_insert" ON tax_rates FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "tax_rates_update" ON tax_rates FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "tax_rates_delete" ON tax_rates FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "payment_methods_select" ON payment_methods FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "payment_methods_insert" ON payment_methods FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "payment_methods_update" ON payment_methods FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "payment_methods_delete" ON payment_methods FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "business_hours_select" ON business_hours FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "business_hours_insert" ON business_hours FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "business_hours_update" ON business_hours FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "business_hours_delete" ON business_hours FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "email_templates_select" ON email_templates FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "email_templates_insert" ON email_templates FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "email_templates_update" ON email_templates FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "email_templates_delete" ON email_templates FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "receipt_templates_select" ON receipt_templates FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "receipt_templates_insert" ON receipt_templates FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "receipt_templates_update" ON receipt_templates FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "receipt_templates_delete" ON receipt_templates FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "terminal_settings_select" ON terminal_settings FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "terminal_settings_insert" ON terminal_settings FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "terminal_settings_update" ON terminal_settings FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "terminal_settings_delete" ON terminal_settings FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "settings_profiles_select" ON settings_profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "settings_profiles_insert" ON settings_profiles FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "settings_profiles_update" ON settings_profiles FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "settings_profiles_delete" ON settings_profiles FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update') AND NOT is_system);

CREATE POLICY "sound_assets_select" ON sound_assets FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "sound_assets_insert" ON sound_assets FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "sound_assets_update" ON sound_assets FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "sound_assets_delete" ON sound_assets FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update') AND NOT is_system);

-- =====================================================
-- LAN/SYNC/DISPLAY - Secure with authentication
-- =====================================================

CREATE POLICY "lan_nodes_select" ON lan_nodes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "lan_nodes_insert" ON lan_nodes FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "lan_nodes_update" ON lan_nodes FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "lan_nodes_delete" ON lan_nodes FOR DELETE TO authenticated USING (TRUE);

CREATE POLICY "lan_messages_select" ON lan_messages FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "lan_messages_insert" ON lan_messages FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "lan_messages_update" ON lan_messages FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "lan_messages_delete" ON lan_messages FOR DELETE TO authenticated USING (TRUE);

CREATE POLICY "sync_devices_select" ON sync_devices FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "sync_devices_insert" ON sync_devices FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "sync_devices_update" ON sync_devices FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "sync_devices_delete" ON sync_devices FOR DELETE TO authenticated USING (TRUE);

CREATE POLICY "sync_queue_select" ON sync_queue FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "sync_queue_insert" ON sync_queue FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "sync_queue_update" ON sync_queue FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "sync_queue_delete" ON sync_queue FOR DELETE TO authenticated USING (TRUE);

CREATE POLICY "sync_conflicts_select" ON sync_conflicts FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "sync_conflicts_insert" ON sync_conflicts FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "sync_conflicts_update" ON sync_conflicts FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "sync_conflicts_delete" ON sync_conflicts FOR DELETE TO authenticated USING (TRUE);

CREATE POLICY "display_promotions_select" ON display_promotions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "display_promotions_insert" ON display_promotions FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "display_promotions_update" ON display_promotions FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "display_promotions_delete" ON display_promotions FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "display_content_select" ON display_content FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "display_content_insert" ON display_content FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "display_content_update" ON display_content FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "display_content_delete" ON display_content FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "kds_stations_select" ON kds_stations FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "kds_stations_insert" ON kds_stations FOR INSERT TO authenticated
    WITH CHECK (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "kds_stations_update" ON kds_stations FOR UPDATE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));
CREATE POLICY "kds_stations_delete" ON kds_stations FOR DELETE TO authenticated
    USING (user_has_permission(get_current_user_profile_id(), 'settings.update'));

CREATE POLICY "kds_order_queue_select" ON kds_order_queue FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "kds_order_queue_insert" ON kds_order_queue FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "kds_order_queue_update" ON kds_order_queue FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "kds_order_queue_delete" ON kds_order_queue FOR DELETE TO authenticated USING (TRUE);
