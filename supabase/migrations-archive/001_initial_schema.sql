-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Database Schema Migration - Complete Version
-- Version: 2.0.0
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
-- Note: pg_trgm and unaccent removed for Supabase compatibility

-- Set timezone
ALTER DATABASE postgres SET timezone TO 'Asia/Makassar'; -- WITA (UTC+8)

-- =====================================================
-- RESET SCHEMA
-- =====================================================
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS b2b_order_items CASCADE;
DROP TABLE IF EXISTS b2b_orders CASCADE;
DROP TABLE IF EXISTS po_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS production_records CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS pos_sessions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS product_modifiers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- Product types
DROP TYPE IF EXISTS product_type CASCADE;
CREATE TYPE product_type AS ENUM (
    'finished',        -- Finished product for sale
    'semi_finished',   -- Semi-finished product
    'raw_material'     -- Raw material
);

-- Dispatch stations for KDS
DROP TYPE IF EXISTS dispatch_station CASCADE;
CREATE TYPE dispatch_station AS ENUM (
    'barista',         -- Coffee and beverages
    'kitchen',         -- Kitchen (bagels, sandwiches)
    'display',         -- Display case (pastries)
    'none'             -- No dispatch
);

-- Order status
DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM (
    'new',             -- New order
    'preparing',       -- Being prepared
    'ready',           -- Ready
    'served',          -- Served
    'completed',       -- Completed (paid)
    'cancelled'        -- Cancelled
);

-- Payment status
DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM (
    'unpaid',          -- Not paid
    'partial',         -- Partially paid
    'paid'             -- Paid
);

-- Payment methods
DROP TYPE IF EXISTS payment_method CASCADE;
CREATE TYPE payment_method AS ENUM (
    'cash',            -- Cash
    'card',            -- Credit/Debit card
    'qris',            -- QRIS (Indonesia QR)
    'split',           -- Split payment
    'transfer'         -- Bank transfer (B2B)
);

-- Order types
DROP TYPE IF EXISTS order_type CASCADE;
CREATE TYPE order_type AS ENUM (
    'dine_in',         -- Dine in
    'takeaway',        -- Takeaway
    'delivery',        -- Delivery
    'b2b'              -- B2B order
);

-- Item status for KDS
DROP TYPE IF EXISTS item_status CASCADE;
CREATE TYPE item_status AS ENUM (
    'new',             -- New
    'preparing',       -- Being prepared
    'ready',           -- Ready
    'served'           -- Served
);

-- Stock movement types
DROP TYPE IF EXISTS movement_type CASCADE;
CREATE TYPE movement_type AS ENUM (
    'purchase',        -- Supplier purchase
    'production_in',   -- Production input (finished product)
    'production_out',  -- Production output (raw materials)
    'sale_pos',        -- POS sale
    'sale_b2b',        -- B2B sale
    'adjustment_in',   -- Positive adjustment
    'adjustment_out',  -- Negative adjustment
    'waste',           -- Waste/loss
    'transfer'         -- Transfer
);

-- Discount types
DROP TYPE IF EXISTS discount_type CASCADE;
CREATE TYPE discount_type AS ENUM (
    'percentage',      -- Percentage discount
    'fixed',           -- Fixed amount
    'free'             -- Free item
);

-- Purchase order status
DROP TYPE IF EXISTS po_status CASCADE;
CREATE TYPE po_status AS ENUM (
    'draft',           -- Draft
    'sent',            -- Sent to supplier
    'partial',         -- Partially received
    'received',        -- Fully received
    'cancelled'        -- Cancelled
);

-- Expense types
DROP TYPE IF EXISTS expense_type CASCADE;
CREATE TYPE expense_type AS ENUM (
    'cogs',            -- Cost of Goods Sold
    'general'          -- General expenses
);

-- Payment terms for B2B
DROP TYPE IF EXISTS payment_terms CASCADE;
CREATE TYPE payment_terms AS ENUM (
    'cod',             -- Cash on Delivery
    'net15',           -- 15 days
    'net30',           -- 30 days
    'net60'            -- 60 days
);

-- Customer types
DROP TYPE IF EXISTS customer_type CASCADE;
CREATE TYPE customer_type AS ENUM (
    'retail',          -- Individual customer
    'wholesale'        -- Business customer
);

-- User roles
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM (
    'admin',           -- Administrator
    'manager',         -- Manager
    'cashier',         -- Cashier
    'server',          -- Server
    'barista',         -- Barista
    'kitchen',         -- Kitchen staff
    'backoffice'       -- Back-office
);

-- Audit severity
DROP TYPE IF EXISTS audit_severity CASCADE;
CREATE TYPE audit_severity AS ENUM (
    'info',            -- Information
    'warning',         -- Warning
    'critical'         -- Critical
);

-- Session status
DROP TYPE IF EXISTS session_status CASCADE;
CREATE TYPE session_status AS ENUM (
    'open',            -- Open
    'closed'           -- Closed
);

-- Modifier group type
DROP TYPE IF EXISTS modifier_group_type CASCADE;
CREATE TYPE modifier_group_type AS ENUM (
    'single',          -- Single selection (radio)
    'multiple'         -- Multiple selection (checkbox)
);

-- =====================================================
-- TABLE: categories
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),                              -- Emoji
    color VARCHAR(7),                              -- Hex color
    dispatch_station dispatch_station DEFAULT 'none',
    is_raw_material BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_sort ON categories(sort_order);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = TRUE;

-- =====================================================
-- TABLE: products
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    product_type product_type DEFAULT 'finished',
    
    -- Pricing
    retail_price DECIMAL(12,2) DEFAULT 0,
    wholesale_price DECIMAL(12,2) DEFAULT 0,
    cost_price DECIMAL(12,2) DEFAULT 0,
    
    -- Stock
    current_stock DECIMAL(10,3) DEFAULT 0,
    min_stock_level DECIMAL(10,3) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pcs',
    
    -- Visibility
    pos_visible BOOLEAN DEFAULT TRUE,
    available_for_sale BOOLEAN DEFAULT TRUE,
    
    -- Media
    image_url TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_pos ON products(pos_visible, available_for_sale) 
    WHERE pos_visible = TRUE AND available_for_sale = TRUE;
CREATE INDEX idx_products_stock_alert ON products(current_stock, min_stock_level) 
    WHERE current_stock < min_stock_level;
-- Simple index for product name search (avoid function-based indexes for Supabase compatibility)
CREATE INDEX idx_products_name ON products(name);

-- =====================================================
-- TABLE: product_modifiers
-- =====================================================
CREATE TABLE product_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to product OR category (one only)
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    
    -- Group options
    group_name VARCHAR(100) NOT NULL,
    group_type modifier_group_type DEFAULT 'single',
    group_required BOOLEAN DEFAULT FALSE,
    group_sort_order INTEGER DEFAULT 0,
    
    -- Individual option
    option_id VARCHAR(50) NOT NULL,
    option_label VARCHAR(100) NOT NULL,
    option_icon VARCHAR(10),
    price_adjustment DECIMAL(10,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    option_sort_order INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: either product_id or category_id, not both
    CONSTRAINT check_modifier_link CHECK (
        (product_id IS NOT NULL AND category_id IS NULL) OR
        (product_id IS NULL AND category_id IS NOT NULL)
    )
);

CREATE INDEX idx_modifiers_product ON product_modifiers(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_modifiers_category ON product_modifiers(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_modifiers_group ON product_modifiers(group_name, group_sort_order);

-- =====================================================
-- TABLE: customers
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(255),
    address TEXT,
    
    -- Customer type
    customer_type customer_type DEFAULT 'retail',
    
    -- B2B specific
    company_name VARCHAR(200),
    tax_id VARCHAR(50),                            -- NPWP (Indonesia)
    payment_terms payment_terms DEFAULT 'cod',
    credit_limit DECIMAL(15,2) DEFAULT 0,
    
    -- Loyalty (retail)
    loyalty_points INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    last_visit_at TIMESTAMPTZ,
    
    -- Metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_company ON customers(company_name) WHERE company_name IS NOT NULL;

-- =====================================================
-- TABLE: user_profiles
-- =====================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,                      -- Reference to auth.users
    
    name VARCHAR(200) NOT NULL,
    role user_role NOT NULL DEFAULT 'cashier',
    pin_code VARCHAR(10),                          -- Encrypted PIN
    
    -- Specific permissions
    can_apply_discount BOOLEAN DEFAULT FALSE,
    can_cancel_order BOOLEAN DEFAULT FALSE,
    can_access_reports BOOLEAN DEFAULT FALSE,
    
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_profiles_auth ON user_profiles(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- =====================================================
-- TABLE: pos_sessions
-- =====================================================
CREATE TABLE pos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_number VARCHAR(30) NOT NULL UNIQUE,
    
    -- Opening
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    opened_by UUID REFERENCES user_profiles(id),
    opening_cash DECIMAL(12,2) DEFAULT 0,
    opening_cash_details JSONB,
    
    -- Closing
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES user_profiles(id),
    closing_cash DECIMAL(12,2),
    closing_cash_details JSONB,
    
    -- Calculated totals
    total_cash_sales DECIMAL(12,2) DEFAULT 0,
    total_card_sales DECIMAL(12,2) DEFAULT 0,
    total_qris_sales DECIMAL(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_discounts DECIMAL(12,2) DEFAULT 0,
    total_refunds DECIMAL(12,2) DEFAULT 0,
    
    -- Reconciliation
    expected_cash DECIMAL(12,2),
    cash_difference DECIMAL(12,2),
    difference_reason TEXT,
    
    -- Tips
    tips_cash DECIMAL(12,2) DEFAULT 0,
    tips_card DECIMAL(12,2) DEFAULT 0,
    
    -- Validation
    manager_validated BOOLEAN DEFAULT FALSE,
    manager_id UUID REFERENCES user_profiles(id),
    
    notes TEXT,
    status session_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_status ON pos_sessions(status);
CREATE INDEX idx_sessions_date ON pos_sessions(opened_at);

-- =====================================================
-- TABLE: orders
-- =====================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) NOT NULL UNIQUE,
    
    -- Type and context
    order_type order_type DEFAULT 'dine_in',
    table_number VARCHAR(10),
    
    -- Customer
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(200),
    
    -- Status
    status order_status DEFAULT 'new',
    payment_status payment_status DEFAULT 'unpaid',
    
    -- Amounts
    subtotal DECIMAL(12,2) DEFAULT 0,
    
    -- Discount
    discount_type discount_type,
    discount_value DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_reason TEXT,
    discount_requires_manager BOOLEAN DEFAULT FALSE,
    discount_manager_id UUID REFERENCES user_profiles(id),
    
    -- Tax
    tax_rate DECIMAL(5,4) DEFAULT 0.11,            -- 11% PPN
    tax_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Total
    total DECIMAL(12,2) DEFAULT 0,
    
    -- Payment
    payment_method payment_method,
    payment_details JSONB,
    cash_received DECIMAL(12,2),
    change_given DECIMAL(12,2),
    
    -- Loyalty
    points_earned INTEGER DEFAULT 0,
    points_used INTEGER DEFAULT 0,
    points_discount DECIMAL(12,2) DEFAULT 0,
    
    -- References
    staff_id UUID REFERENCES user_profiles(id),
    session_id UUID REFERENCES pos_sessions(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES user_profiles(id),
    cancellation_reason TEXT
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_customer ON orders(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);
-- Note: DATE(created_at) index removed as it requires IMMUTABLE marking
-- Use idx_orders_date on created_at instead for date filtering
CREATE INDEX idx_orders_status_session ON orders (status, session_id);

-- =====================================================
-- TABLE: order_items
-- =====================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product snapshot
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(50),
    
    -- Quantity and price
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    
    -- Modifiers
    modifiers JSONB,
    modifiers_total DECIMAL(12,2) DEFAULT 0,
    
    -- Notes
    notes TEXT,
    
    -- KDS dispatch
    dispatch_station dispatch_station,
    item_status item_status DEFAULT 'new',
    
    -- Preparation
    sent_to_kitchen_at TIMESTAMPTZ,
    prepared_at TIMESTAMPTZ,
    prepared_by UUID REFERENCES user_profiles(id),
    served_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_status ON order_items(item_status);
CREATE INDEX idx_order_items_station ON order_items(dispatch_station, item_status);
CREATE INDEX idx_order_items_station_status ON order_items (dispatch_station, item_status) 
    WHERE dispatch_station IS NOT NULL;

-- =====================================================
-- TABLE: stock_movements
-- =====================================================
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movement_id VARCHAR(30) NOT NULL UNIQUE,
    
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type movement_type NOT NULL,
    
    -- Quantity (positive or negative based on type)
    quantity DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(12,2),
    
    -- Source reference
    reference_type VARCHAR(50),
    reference_id UUID,
    
    -- Stock before/after
    stock_before DECIMAL(10,3) NOT NULL,
    stock_after DECIMAL(10,3) NOT NULL,
    
    -- Metadata
    reason TEXT,
    staff_id UUID REFERENCES user_profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_ref ON stock_movements(reference_type, reference_id);
CREATE INDEX idx_stock_movements_product_date ON stock_movements (product_id, created_at DESC);

-- =====================================================
-- TABLE: recipes
-- =====================================================
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    quantity DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(product_id, material_id)
);

CREATE INDEX idx_recipes_product ON recipes(product_id);
CREATE INDEX idx_recipes_material ON recipes(material_id);

-- =====================================================
-- TABLE: production_records
-- =====================================================
CREATE TABLE production_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_id VARCHAR(30) NOT NULL UNIQUE,
    
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_produced DECIMAL(10,3) NOT NULL,
    quantity_waste DECIMAL(10,3) DEFAULT 0,
    
    production_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Traceability
    staff_id UUID REFERENCES user_profiles(id),
    staff_name VARCHAR(200),
    
    -- Processing status
    stock_updated BOOLEAN DEFAULT FALSE,
    materials_consumed BOOLEAN DEFAULT FALSE,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_product ON production_records(product_id);
CREATE INDEX idx_production_date ON production_records(production_date);

-- =====================================================
-- TABLE: suppliers
-- =====================================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(200),
    
    -- Payment
    payment_terms payment_terms DEFAULT 'cod',
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suppliers_name ON suppliers(name);

-- =====================================================
-- TABLE: purchase_orders
-- =====================================================
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(30) NOT NULL UNIQUE,
    
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    
    -- Dates
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_date DATE,
    received_date DATE,
    
    -- Status
    status po_status DEFAULT 'draft',
    expense_type expense_type DEFAULT 'cogs',
    
    -- Amounts
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0.11,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) DEFAULT 0,
    
    notes TEXT,
    
    -- Traceability
    created_by UUID REFERENCES user_profiles(id),
    received_by UUID REFERENCES user_profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(order_date);

-- =====================================================
-- TABLE: po_items
-- =====================================================
CREATE TABLE po_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    
    quantity_ordered DECIMAL(10,3) NOT NULL,
    quantity_received DECIMAL(10,3) DEFAULT 0,
    
    unit_price DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_items_po ON po_items(po_id);
CREATE INDEX idx_po_items_product ON po_items(product_id);

-- =====================================================
-- TABLE: b2b_orders
-- =====================================================
CREATE TABLE b2b_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) NOT NULL UNIQUE,
    
    customer_id UUID NOT NULL REFERENCES customers(id),
    
    -- Dates
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    delivered_at TIMESTAMPTZ,
    
    -- Status
    status order_status DEFAULT 'new',
    payment_status payment_status DEFAULT 'unpaid',
    
    -- Amounts
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0.11,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) DEFAULT 0,
    
    -- Payment
    payment_method payment_method DEFAULT 'transfer',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    paid_at TIMESTAMPTZ,
    
    -- Stock
    stock_deducted BOOLEAN DEFAULT FALSE,
    
    -- Invoice
    invoice_number VARCHAR(30),
    invoice_generated_at TIMESTAMPTZ,
    invoice_url TEXT,
    
    notes TEXT,
    
    -- Traceability
    created_by UUID REFERENCES user_profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_b2b_customer ON b2b_orders(customer_id);
CREATE INDEX idx_b2b_status ON b2b_orders(status);
CREATE INDEX idx_b2b_payment ON b2b_orders(payment_status);
CREATE INDEX idx_b2b_date ON b2b_orders(order_date);

-- =====================================================
-- TABLE: b2b_order_items
-- =====================================================
CREATE TABLE b2b_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES b2b_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    
    -- Product snapshot
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(50),
    
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_b2b_items_order ON b2b_order_items(order_id);
CREATE INDEX idx_b2b_items_product ON b2b_order_items(product_id);

-- =====================================================
-- TABLE: audit_log
-- =====================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Action
    action_type VARCHAR(100) NOT NULL,
    severity audit_severity DEFAULT 'info',
    
    -- Target entity
    entity_type VARCHAR(50),
    entity_id UUID,
    
    -- Changes
    old_value JSONB,
    new_value JSONB,
    
    -- Context
    reason TEXT,
    requires_manager BOOLEAN DEFAULT FALSE,
    manager_approved BOOLEAN,
    manager_id UUID REFERENCES user_profiles(id),
    
    -- User
    user_id UUID REFERENCES user_profiles(id),
    user_name VARCHAR(200),
    user_role user_role,
    
    -- Technical
    ip_address INET,
    device_info TEXT,
    session_id UUID REFERENCES pos_sessions(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_action ON audit_log(action_type);
CREATE INDEX idx_audit_severity ON audit_log(severity);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_date ON audit_log(created_at);
CREATE INDEX idx_audit_session ON audit_log(session_id);

-- =====================================================
-- TABLE: app_settings
-- =====================================================
CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO app_settings (key, value, description) VALUES
    ('tax_rate', '0.11', 'Default tax rate (11% PPN)'),
    ('currency', '"IDR"', 'Currency'),
    ('currency_symbol', '"Rp"', 'Currency symbol'),
    ('loyalty_points_rate', '1000', 'Amount in IDR for 1 loyalty point'),
    ('loyalty_points_value', '100', 'Value in IDR of 1 loyalty point'),
    ('discount_manager_threshold', '10', 'Discount % threshold requiring manager approval'),
    ('receipt_header', '{"line1": "THE BREAKERY", "line2": "French Bakery & Coffee", "line3": "Lombok, Indonesia"}', 'Receipt header'),
    ('receipt_footer', '{"line1": "Merci de votre visite!", "line2": "See you soon!"}', 'Receipt footer'),
    ('business_hours', '{"open": "07:00", "close": "18:00"}', 'Business hours'),
    ('print_server_url', '"http://192.168.1.50:3001"', 'Print server URL');

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_movements;
