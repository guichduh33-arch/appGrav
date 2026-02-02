-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Row Level Security Policies
-- Version: 2.0.0
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
    role user_role;
BEGIN
    SELECT up.role INTO role
    FROM user_profiles up
    WHERE up.auth_user_id = auth.uid();
    
    RETURN role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can access POS
CREATE OR REPLACE FUNCTION can_access_pos()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'manager', 'cashier', 'server');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can access backoffice
CREATE OR REPLACE FUNCTION can_access_backoffice()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'manager', 'backoffice');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can access kitchen/KDS
CREATE OR REPLACE FUNCTION can_access_kds()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'manager', 'barista', 'kitchen');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user's profile ID
CREATE OR REPLACE FUNCTION get_user_profile_id()
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
BEGIN
    SELECT id INTO profile_id
    FROM user_profiles
    WHERE auth_user_id = auth.uid();
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUTH INTEGRATION
-- =====================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (auth_user_id, name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cashier')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users (needs to be created after auth schema exists)
-- Note: This may need to be run separately in Supabase Dashboard
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Verify manager PIN
CREATE OR REPLACE FUNCTION verify_manager_pin(pin_input VARCHAR)
RETURNS TABLE (
    user_id UUID,
    user_name VARCHAR,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.name,
        (up.pin_code = pin_input AND up.role IN ('admin', 'manager')) AS is_valid
    FROM user_profiles up
    WHERE up.pin_code = pin_input
    AND up.role IN ('admin', 'manager')
    AND up.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES: CATEGORIES
-- =====================================================
CREATE POLICY "select_all_categories" ON categories
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "insert_categories_admin" ON categories
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_or_manager());

CREATE POLICY "update_categories_admin" ON categories
    FOR UPDATE TO authenticated
    USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

CREATE POLICY "delete_categories_admin" ON categories
    FOR DELETE TO authenticated
    USING (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: PRODUCTS
-- =====================================================
CREATE POLICY "select_all_products" ON products
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "insert_products_admin" ON products
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_or_manager());

CREATE POLICY "update_products_admin" ON products
    FOR UPDATE TO authenticated
    USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

CREATE POLICY "delete_products_admin" ON products
    FOR DELETE TO authenticated
    USING (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: PRODUCT_MODIFIERS
-- =====================================================
CREATE POLICY "select_all_modifiers" ON product_modifiers
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "modify_modifiers_admin" ON product_modifiers
    FOR ALL TO authenticated
    USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: CUSTOMERS
-- =====================================================
CREATE POLICY "select_customers" ON customers
    FOR SELECT TO authenticated 
    USING (can_access_pos() OR can_access_backoffice());

CREATE POLICY "insert_customers" ON customers
    FOR INSERT TO authenticated
    WITH CHECK (can_access_pos() OR can_access_backoffice());

CREATE POLICY "update_customers" ON customers
    FOR UPDATE TO authenticated
    USING (can_access_pos() OR can_access_backoffice())
    WITH CHECK (can_access_pos() OR can_access_backoffice());

CREATE POLICY "delete_customers_admin" ON customers
    FOR DELETE TO authenticated
    USING (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: USER_PROFILES
-- =====================================================
CREATE POLICY "select_own_profile" ON user_profiles
    FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid() OR is_admin_or_manager());

CREATE POLICY "anon_read_active_profiles" ON user_profiles
    FOR SELECT TO anon
    USING (is_active = true);

CREATE POLICY "update_own_profile" ON user_profiles
    FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "admin_manage_profiles" ON user_profiles
    FOR ALL TO authenticated
    USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: POS_SESSIONS
-- =====================================================
CREATE POLICY "select_sessions" ON pos_sessions
    FOR SELECT TO authenticated
    USING (can_access_pos() OR is_admin_or_manager());

CREATE POLICY "insert_sessions" ON pos_sessions
    FOR INSERT TO authenticated
    WITH CHECK (can_access_pos());

CREATE POLICY "update_sessions" ON pos_sessions
    FOR UPDATE TO authenticated
    USING (can_access_pos())
    WITH CHECK (can_access_pos());

CREATE POLICY "close_sessions_manager" ON pos_sessions
    FOR UPDATE TO authenticated
    USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: ORDERS
-- =====================================================
CREATE POLICY "select_orders" ON orders
    FOR SELECT TO authenticated
    USING (
        can_access_pos() OR 
        can_access_kds() OR 
        is_admin_or_manager()
    );

CREATE POLICY "insert_orders" ON orders
    FOR INSERT TO authenticated
    WITH CHECK (can_access_pos());

CREATE POLICY "update_orders" ON orders
    FOR UPDATE TO authenticated
    USING (can_access_pos() OR can_access_kds())
    WITH CHECK (can_access_pos() OR can_access_kds());

CREATE POLICY "cancel_orders_manager" ON orders
    FOR UPDATE TO authenticated
    USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: ORDER_ITEMS
-- =====================================================
CREATE POLICY "select_order_items" ON order_items
    FOR SELECT TO authenticated 
    USING (TRUE);

CREATE POLICY "insert_order_items" ON order_items
    FOR INSERT TO authenticated
    WITH CHECK (can_access_pos());

CREATE POLICY "update_order_items" ON order_items
    FOR UPDATE TO authenticated
    USING (can_access_pos() OR can_access_kds());

CREATE POLICY "delete_order_items" ON order_items
    FOR DELETE TO authenticated
    USING (can_access_pos());

-- =====================================================
-- RLS POLICIES: STOCK_MOVEMENTS
-- =====================================================
CREATE POLICY "select_stock_movements" ON stock_movements
    FOR SELECT TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "insert_stock_movements" ON stock_movements
    FOR INSERT TO authenticated
    WITH CHECK (can_access_backoffice() OR is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: RECIPES
-- =====================================================
CREATE POLICY "select_recipes" ON recipes
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "modify_recipes_admin" ON recipes
    FOR ALL TO authenticated
    USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: PRODUCTION_RECORDS
-- =====================================================
CREATE POLICY "select_production" ON production_records
    FOR SELECT TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "insert_production" ON production_records
    FOR INSERT TO authenticated
    WITH CHECK (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "update_production" ON production_records
    FOR UPDATE TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: SUPPLIERS
-- =====================================================
CREATE POLICY "select_suppliers" ON suppliers
    FOR SELECT TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "modify_suppliers" ON suppliers
    FOR ALL TO authenticated
    USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: PURCHASE_ORDERS
-- =====================================================
CREATE POLICY "select_po" ON purchase_orders
    FOR SELECT TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "insert_po" ON purchase_orders
    FOR INSERT TO authenticated
    WITH CHECK (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "update_po" ON purchase_orders
    FOR UPDATE TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "delete_po_admin" ON purchase_orders
    FOR DELETE TO authenticated
    USING (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: PO_ITEMS
-- =====================================================
CREATE POLICY "select_po_items" ON po_items
    FOR SELECT TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "modify_po_items" ON po_items
    FOR ALL TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager())
    WITH CHECK (can_access_backoffice() OR is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: B2B_ORDERS
-- =====================================================
CREATE POLICY "select_b2b_orders" ON b2b_orders
    FOR SELECT TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "insert_b2b_orders" ON b2b_orders
    FOR INSERT TO authenticated
    WITH CHECK (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "update_b2b_orders" ON b2b_orders
    FOR UPDATE TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "delete_b2b_orders_admin" ON b2b_orders
    FOR DELETE TO authenticated
    USING (is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: B2B_ORDER_ITEMS
-- =====================================================
CREATE POLICY "select_b2b_items" ON b2b_order_items
    FOR SELECT TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager());

CREATE POLICY "modify_b2b_items" ON b2b_order_items
    FOR ALL TO authenticated
    USING (can_access_backoffice() OR is_admin_or_manager())
    WITH CHECK (can_access_backoffice() OR is_admin_or_manager());

-- =====================================================
-- RLS POLICIES: AUDIT_LOG
-- =====================================================
CREATE POLICY "select_audit_log" ON audit_log
    FOR SELECT TO authenticated
    USING (is_admin_or_manager());

CREATE POLICY "insert_audit_log" ON audit_log
    FOR INSERT TO authenticated
    WITH CHECK (TRUE);

-- =====================================================
-- RLS POLICIES: APP_SETTINGS
-- =====================================================
CREATE POLICY "select_settings" ON app_settings
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "modify_settings_admin" ON app_settings
    FOR ALL TO authenticated
    USING (is_admin_or_manager())
    WITH CHECK (is_admin_or_manager());
