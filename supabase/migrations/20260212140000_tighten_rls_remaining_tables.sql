-- =====================================================
-- B3 FIX: Tighten RLS on all remaining tables
-- Replaces USING(TRUE) / WITH CHECK(TRUE) write policies
-- with permission-based checks using user_has_permission().
-- Following the pattern from 20260210100002_reimplement_critical_rls.sql.
--
-- Already fixed (skip): user_profiles, roles, permissions,
--   role_permissions, user_roles, user_permissions, settings, audit_logs
-- =====================================================

-- Helper: concise permission check for RLS policies
CREATE OR REPLACE FUNCTION public.current_user_can(p_permission VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
BEGIN
    RETURN public.user_has_permission(
        public.get_current_user_profile_id(),
        p_permission
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_can(VARCHAR) TO authenticated;

-- =====================================================
-- Temporary helper to batch-replace policies
-- =====================================================
CREATE OR REPLACE FUNCTION _tmp_tighten_rls(
    p_table       TEXT,
    p_old_policies TEXT[],
    p_perm_insert  TEXT,
    p_perm_update  TEXT,
    p_add_select   BOOLEAN DEFAULT TRUE
) RETURNS VOID AS $$
DECLARE
    pol TEXT;
BEGIN
    -- 1. Drop old permissive policies
    FOREACH pol IN ARRAY p_old_policies LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, p_table);
    END LOOP;

    -- 2. Ensure authenticated SELECT exists
    IF p_add_select THEN
        BEGIN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (TRUE)',
                p_table || '_select_auth', p_table
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
    END IF;

    -- 3. Permission-gated INSERT
    EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.current_user_can(%L))',
        p_table || '_insert_perm', p_table, p_perm_insert
    );

    -- 4. Permission-gated UPDATE
    EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.current_user_can(%L))',
        p_table || '_update_perm', p_table, p_perm_update
    );

    -- 5. Permission-gated DELETE
    EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.current_user_can(%L))',
        p_table || '_delete_perm', p_table, p_perm_update
    );
END;
$$ LANGUAGE plpgsql;


-- =============================================================
-- GROUP 1: Product Management (products.create / products.update)
-- =============================================================

-- 1a. Tables with existing separate INSERT/UPDATE/DELETE policies
--     (categories, sections, products already have public SELECT)
SELECT _tmp_tighten_rls('categories',
    ARRAY['categories_insert_auth', 'categories_update_auth', 'categories_delete_auth'],
    'products.create', 'products.update', FALSE);

SELECT _tmp_tighten_rls('sections',
    ARRAY['sections_insert_auth', 'sections_update_auth', 'sections_delete_auth'],
    'products.create', 'products.update', FALSE);

SELECT _tmp_tighten_rls('products',
    ARRAY['products_insert_auth', 'products_update_auth', 'products_delete_auth'],
    'products.create', 'products.update', FALSE);

-- 1b. Tables with FOR ALL policies
SELECT _tmp_tighten_rls('product_sections',
    ARRAY['product_sections_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('product_modifiers',
    ARRAY['modifiers_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('product_uoms',
    ARRAY['uoms_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('recipes',
    ARRAY['recipes_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('product_variant_materials',
    ARRAY['variant_materials_manage_auth'],
    'products.create', 'products.update');


-- =============================================================
-- GROUP 2: Combos & Promotions (products.create / products.update)
-- =============================================================

SELECT _tmp_tighten_rls('product_combos',
    ARRAY['product_combos_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('product_combo_groups',
    ARRAY['combo_groups_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('product_combo_group_items',
    ARRAY['combo_group_items_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('product_combo_items',
    ARRAY['combo_items_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('promotions',
    ARRAY['promotions_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('promotion_products',
    ARRAY['promotion_products_manage_auth'],
    'products.create', 'products.update');

SELECT _tmp_tighten_rls('promotion_free_products',
    ARRAY['promotion_free_products_manage_auth'],
    'products.create', 'products.update');


-- =============================================================
-- GROUP 3: Customer Management (customers.create / customers.update)
-- =============================================================

SELECT _tmp_tighten_rls('customer_categories',
    ARRAY['customer_categories_manage_auth'],
    'customers.create', 'customers.update');

SELECT _tmp_tighten_rls('customers',
    ARRAY['customers_manage_auth'],
    'customers.create', 'customers.update');

SELECT _tmp_tighten_rls('product_category_prices',
    ARRAY['product_category_prices_manage_auth'],
    'products.pricing', 'products.pricing');

SELECT _tmp_tighten_rls('loyalty_tiers',
    ARRAY['loyalty_tiers_manage_auth'],
    'customers.loyalty', 'customers.loyalty');

SELECT _tmp_tighten_rls('loyalty_rewards',
    ARRAY['loyalty_rewards_manage_auth'],
    'customers.loyalty', 'customers.loyalty');


-- =============================================================
-- GROUP 4: Inventory (inventory.create / inventory.update)
-- =============================================================

SELECT _tmp_tighten_rls('suppliers',
    ARRAY['suppliers_manage_auth'],
    'inventory.create', 'inventory.update');

SELECT _tmp_tighten_rls('stock_locations',
    ARRAY['stock_locations_manage_auth'],
    'inventory.create', 'inventory.update');

SELECT _tmp_tighten_rls('production_records',
    ARRAY['production_records_manage_auth'],
    'inventory.create', 'inventory.update');

SELECT _tmp_tighten_rls('inventory_counts',
    ARRAY['inventory_counts_manage_auth'],
    'inventory.create', 'inventory.update');

SELECT _tmp_tighten_rls('inventory_count_items',
    ARRAY['inventory_count_items_manage_auth'],
    'inventory.create', 'inventory.update');

SELECT _tmp_tighten_rls('internal_transfers',
    ARRAY['internal_transfers_manage_auth'],
    'inventory.create', 'inventory.update');

SELECT _tmp_tighten_rls('transfer_items',
    ARRAY['transfer_items_manage_auth'],
    'inventory.create', 'inventory.update');

-- stock_movements: special case — multiple permission sources
-- (inserted by POS triggers, inventory adjustments, and purchases)
DROP POLICY IF EXISTS "stock_movements_insert_auth" ON public.stock_movements;
CREATE POLICY "stock_movements_insert_perm" ON public.stock_movements
    FOR INSERT TO authenticated
    WITH CHECK (
        public.current_user_can('inventory.create')
        OR public.current_user_can('inventory.adjust')
        OR public.current_user_can('sales.create')
    );


-- =============================================================
-- GROUP 5: Purchasing (inventory.create / inventory.update)
-- =============================================================

SELECT _tmp_tighten_rls('purchase_orders',
    ARRAY['purchase_orders_manage_auth'],
    'inventory.create', 'inventory.update');

SELECT _tmp_tighten_rls('po_items',
    ARRAY['po_items_manage_auth'],
    'inventory.create', 'inventory.update');


-- =============================================================
-- GROUP 6: Sales & POS (sales.create)
-- =============================================================

SELECT _tmp_tighten_rls('pos_terminals',
    ARRAY['pos_terminals_manage_auth'],
    'sales.create', 'sales.create');

SELECT _tmp_tighten_rls('pos_sessions',
    ARRAY['pos_sessions_manage_auth'],
    'sales.create', 'sales.create');

SELECT _tmp_tighten_rls('orders',
    ARRAY['orders_manage_auth'],
    'sales.create', 'sales.create');

SELECT _tmp_tighten_rls('order_items',
    ARRAY['order_items_manage_auth'],
    'sales.create', 'sales.create');

SELECT _tmp_tighten_rls('floor_plan_items',
    ARRAY['floor_plan_items_manage_auth'],
    'sales.create', 'sales.create');

-- order_payments: tighten existing policies
DROP POLICY IF EXISTS "op_insert" ON public.order_payments;
DROP POLICY IF EXISTS "op_update" ON public.order_payments;
CREATE POLICY "op_insert_perm" ON public.order_payments
    FOR INSERT TO authenticated
    WITH CHECK (public.current_user_can('sales.create'));
CREATE POLICY "op_update_perm" ON public.order_payments
    FOR UPDATE TO authenticated
    USING (public.current_user_can('sales.create'));

-- Sales auxiliary: INSERT-only immutable records (no UPDATE/DELETE)
DO $$
DECLARE
    tbl TEXT;
    old_pol TEXT;
BEGIN
    FOR tbl, old_pol IN SELECT * FROM (VALUES
        ('loyalty_transactions', 'loyalty_transactions_insert_auth'),
        ('loyalty_redemptions', 'loyalty_redemptions_insert_auth'),
        ('promotion_usage', 'promotion_usage_insert_auth')
    ) AS t(tbl, old_pol)
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', old_pol, tbl);
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.current_user_can(''sales.create''))',
            tbl || '_insert_perm', tbl
        );
    END LOOP;
END;
$$;


-- =============================================================
-- GROUP 7: B2B (sales.create)
-- =============================================================

SELECT _tmp_tighten_rls('b2b_orders',
    ARRAY['b2b_orders_manage_auth'],
    'sales.create', 'sales.create');

SELECT _tmp_tighten_rls('b2b_order_items',
    ARRAY['b2b_order_items_manage_auth'],
    'sales.create', 'sales.create');

SELECT _tmp_tighten_rls('b2b_payments',
    ARRAY['b2b_payments_manage_auth'],
    'sales.create', 'sales.create');

SELECT _tmp_tighten_rls('b2b_deliveries',
    ARRAY['b2b_deliveries_manage_auth'],
    'sales.create', 'sales.create');

SELECT _tmp_tighten_rls('b2b_price_lists',
    ARRAY['b2b_price_lists_manage_auth'],
    'products.pricing', 'products.pricing');

SELECT _tmp_tighten_rls('b2b_price_list_items',
    ARRAY['b2b_price_list_items_manage_auth'],
    'products.pricing', 'products.pricing');

SELECT _tmp_tighten_rls('b2b_customer_price_lists',
    ARRAY['b2b_customer_price_lists_manage_auth'],
    'products.pricing', 'products.pricing');


-- =============================================================
-- GROUP 8: Settings & Config (settings.update)
-- =============================================================

SELECT _tmp_tighten_rls('settings_categories',
    ARRAY['settings_categories_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('app_settings',
    ARRAY['app_settings_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('printer_configurations',
    ARRAY['printer_configs_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('tax_rates',
    ARRAY['tax_rates_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('payment_methods',
    ARRAY['payment_methods_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('business_hours',
    ARRAY['business_hours_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('email_templates',
    ARRAY['email_templates_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('receipt_templates',
    ARRAY['receipt_templates_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('terminal_settings',
    ARRAY['terminal_settings_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('settings_profiles',
    ARRAY['settings_profiles_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('sound_assets',
    ARRAY['sound_assets_manage_auth'],
    'settings.update', 'settings.update');


-- =============================================================
-- GROUP 9: Display & KDS Config (settings.update)
-- =============================================================

SELECT _tmp_tighten_rls('display_promotions',
    ARRAY['display_promotions_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('display_content',
    ARRAY['display_content_manage_auth'],
    'settings.update', 'settings.update');

SELECT _tmp_tighten_rls('kds_stations',
    ARRAY['kds_stations_manage_auth'],
    'settings.update', 'settings.update');


-- =============================================================
-- GROUP 10: LAN/Sync/System tables
-- Replace public access (USING TRUE without TO authenticated)
-- with authenticated-only (no permission check — system-level ops)
-- =============================================================

DO $$
DECLARE
    tbl TEXT;
    old_pol TEXT;
BEGIN
    FOR tbl, old_pol IN SELECT * FROM (VALUES
        ('lan_nodes',     'lan_nodes_manage_all'),
        ('lan_messages',  'lan_messages_manage_all'),
        ('sync_devices',  'sync_devices_manage_all'),
        ('sync_queue',    'sync_queue_manage_all'),
        ('kds_order_queue', 'kds_order_queue_manage_all')
    ) AS t(tbl, old_pol)
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', old_pol, tbl);

        -- SELECT: authenticated
        BEGIN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (TRUE)',
                tbl || '_select_auth', tbl
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;

        -- INSERT: authenticated (no permission check for system ops)
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (TRUE)',
            tbl || '_insert_auth', tbl
        );

        -- UPDATE: authenticated
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (TRUE)',
            tbl || '_update_auth', tbl
        );

        -- DELETE: authenticated
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (TRUE)',
            tbl || '_delete_auth', tbl
        );
    END LOOP;
END;
$$;

-- sync_conflicts: already requires authenticated, keep as is
DROP POLICY IF EXISTS "sync_conflicts_manage_auth" ON public.sync_conflicts;
CREATE POLICY "sync_conflicts_select_auth" ON public.sync_conflicts
    FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "sync_conflicts_insert_auth" ON public.sync_conflicts
    FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "sync_conflicts_update_auth" ON public.sync_conflicts
    FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "sync_conflicts_delete_auth" ON public.sync_conflicts
    FOR DELETE TO authenticated USING (TRUE);

-- user_sessions: keep authenticated-only (session management)
DROP POLICY IF EXISTS "user_sessions_manage_all" ON public.user_sessions;
CREATE POLICY "user_sessions_select_auth" ON public.user_sessions
    FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "user_sessions_insert_auth" ON public.user_sessions
    FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "user_sessions_update_auth" ON public.user_sessions
    FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "user_sessions_delete_auth" ON public.user_sessions
    FOR DELETE TO authenticated USING (TRUE);

-- settings_history: keep INSERT-only for authenticated (immutable audit trail)
-- SELECT already exists, INSERT already exists — just drop old and tighten
DROP POLICY IF EXISTS "settings_history_insert_auth" ON public.settings_history;
CREATE POLICY "settings_history_insert_perm" ON public.settings_history
    FOR INSERT TO authenticated
    WITH CHECK (TRUE); -- any authenticated user can create history entries (triggered by system)


-- =============================================================
-- CLEANUP: Drop temporary helper function
-- =============================================================
DROP FUNCTION _tmp_tighten_rls(TEXT, TEXT[], TEXT, TEXT, BOOLEAN);
