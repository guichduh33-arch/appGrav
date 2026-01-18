-- =====================================================
-- ROW LEVEL SECURITY IMPLEMENTATION
-- Critical security update for The Breakery ERP/POS
-- =====================================================

BEGIN;

-- Enable RLS on all critical tables
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to get user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = required_role
  );
$$;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION user_has_any_role(required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = ANY(required_roles)
  );
$$;

-- =====================================================
-- PRODUCTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "products_read_policy" ON products;
DROP POLICY IF EXISTS "products_write_policy" ON products;

CREATE POLICY "products_read_policy"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "products_write_policy"
  ON products FOR ALL
  TO authenticated
  USING (user_has_any_role(ARRAY['admin', 'staff']))
  WITH CHECK (user_has_any_role(ARRAY['admin', 'staff']));

-- =====================================================
-- CATEGORIES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "categories_read_policy" ON categories;
DROP POLICY IF EXISTS "categories_write_policy" ON categories;

CREATE POLICY "categories_read_policy"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "categories_write_policy"
  ON categories FOR ALL
  TO authenticated
  USING (user_has_role('admin'))
  WITH CHECK (user_has_role('admin'));

-- =====================================================
-- CUSTOMERS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "customers_user_policy" ON customers;
DROP POLICY IF EXISTS "customers_staff_policy" ON customers;
DROP POLICY IF EXISTS "customers_write_policy" ON customers;

CREATE POLICY "customers_user_policy"
  ON customers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "customers_staff_policy"
  ON customers FOR SELECT
  TO authenticated
  USING (
    user_has_any_role(ARRAY['admin', 'staff']) AND
    organization_id = get_user_organization_id()
  );

CREATE POLICY "customers_write_policy"
  ON customers FOR ALL
  TO authenticated
  USING (
    user_has_any_role(ARRAY['admin', 'staff']) AND
    organization_id = get_user_organization_id()
  )
  WITH CHECK (
    user_has_any_role(ARRAY['admin', 'staff']) AND
    organization_id = get_user_organization_id()
  );

-- =====================================================
-- SALES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "sales_organization_policy" ON sales;
DROP POLICY IF EXISTS "sales_write_policy" ON sales;

CREATE POLICY "sales_organization_policy"
  ON sales FOR SELECT
  TO authenticated
  USING (
    organization_id = get_user_organization_id() OR
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "sales_write_policy"
  ON sales FOR ALL
  TO authenticated
  USING (
    user_has_any_role(ARRAY['admin', 'staff', 'cashier']) AND
    organization_id = get_user_organization_id()
  )
  WITH CHECK (
    user_has_any_role(ARRAY['admin', 'staff', 'cashier']) AND
    organization_id = get_user_organization_id()
  );

-- =====================================================
-- ORDER_ITEMS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "order_items_policy" ON order_items;

CREATE POLICY "order_items_policy"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = order_items.sale_id
      AND (
        sales.organization_id = get_user_organization_id() OR
        sales.customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = order_items.sale_id
      AND sales.organization_id = get_user_organization_id()
    ) AND
    user_has_any_role(ARRAY['admin', 'staff', 'cashier'])
  );

-- =====================================================
-- INVENTORY TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "inventory_read_policy" ON inventory;
DROP POLICY IF EXISTS "inventory_write_policy" ON inventory;

CREATE POLICY "inventory_read_policy"
  ON inventory FOR SELECT
  TO authenticated
  USING (
    user_has_any_role(ARRAY['admin', 'staff']) AND
    organization_id = get_user_organization_id()
  );

CREATE POLICY "inventory_write_policy"
  ON inventory FOR ALL
  TO authenticated
  USING (
    user_has_any_role(ARRAY['admin', 'inventory_manager']) AND
    organization_id = get_user_organization_id()
  )
  WITH CHECK (
    user_has_any_role(ARRAY['admin', 'inventory_manager']) AND
    organization_id = get_user_organization_id()
  );

-- =====================================================
-- STOCK_MOVEMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "stock_movements_read_policy" ON stock_movements;
DROP POLICY IF EXISTS "stock_movements_write_policy" ON stock_movements;

CREATE POLICY "stock_movements_read_policy"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (
    user_has_any_role(ARRAY['admin', 'staff', 'inventory_manager']) AND
    organization_id = get_user_organization_id()
  );

CREATE POLICY "stock_movements_write_policy"
  ON stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (
    user_has_any_role(ARRAY['admin', 'inventory_manager']) AND
    organization_id = get_user_organization_id() AND
    created_by = auth.uid()
  );

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "users_self_policy" ON users;
DROP POLICY IF EXISTS "users_admin_policy" ON users;

CREATE POLICY "users_self_policy"
  ON users FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_admin_policy"
  ON users FOR ALL
  TO authenticated
  USING (
    user_has_role('admin') AND
    organization_id = get_user_organization_id()
  )
  WITH CHECK (
    user_has_role('admin') AND
    organization_id = get_user_organization_id()
  );

-- =====================================================
-- ORGANIZATIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "organizations_member_policy" ON organizations;
DROP POLICY IF EXISTS "organizations_admin_policy" ON organizations;

CREATE POLICY "organizations_member_policy"
  ON organizations FOR SELECT
  TO authenticated
  USING (id = get_user_organization_id());

CREATE POLICY "organizations_admin_policy"
  ON organizations FOR ALL
  TO authenticated
  USING (
    id = get_user_organization_id() AND
    user_has_role('admin')
  )
  WITH CHECK (
    id = get_user_organization_id() AND
    user_has_role('admin')
  );

-- =====================================================
-- SECURITY INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sales_organization_id ON sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_organization_id ON inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_by ON stock_movements(created_by);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_any_role(TEXT[]) TO authenticated;

COMMIT;