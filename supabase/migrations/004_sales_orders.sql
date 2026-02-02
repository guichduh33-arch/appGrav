-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 004: Sales & Orders Module
-- Tables: pos_sessions, orders, order_items, floor_plan_items
-- =====================================================

-- =====================================================
-- TABLE: pos_terminals
-- =====================================================
CREATE TABLE pos_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_name VARCHAR(100) NOT NULL,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    is_hub BOOLEAN DEFAULT FALSE,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',

    -- Settings
    mode VARCHAR(20) DEFAULT 'primary',
    default_printer_id UUID,
    kitchen_printer_id UUID,
    kds_station VARCHAR(20),
    allowed_payment_methods TEXT[],
    default_order_type VARCHAR(20),
    floor_plan_id UUID,
    auto_logout_timeout INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pos_terminals_device ON pos_terminals(device_id);
CREATE INDEX idx_pos_terminals_hub ON pos_terminals(is_hub) WHERE is_hub = TRUE;

-- =====================================================
-- TABLE: pos_sessions (shifts)
-- =====================================================
CREATE TABLE pos_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_number VARCHAR(30) NOT NULL UNIQUE,
    terminal_id UUID REFERENCES pos_terminals(id),

    -- Opening
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    opened_by UUID,
    opening_cash DECIMAL(12,2) DEFAULT 0,
    opening_cash_details JSONB,

    -- Closing
    closed_at TIMESTAMPTZ,
    closed_by UUID,
    closing_cash DECIMAL(12,2),
    closing_cash_details JSONB,

    -- Calculated totals
    total_cash_sales DECIMAL(12,2) DEFAULT 0,
    total_card_sales DECIMAL(12,2) DEFAULT 0,
    total_qris_sales DECIMAL(12,2) DEFAULT 0,
    total_edc_sales DECIMAL(12,2) DEFAULT 0,
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
    manager_id UUID,

    notes TEXT,
    status session_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_status ON pos_sessions(status);
CREATE INDEX idx_sessions_date ON pos_sessions(opened_at);
CREATE INDEX idx_sessions_terminal ON pos_sessions(terminal_id);

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
    discount_manager_id UUID,

    -- Tax (10% included)
    tax_rate DECIMAL(5,4) DEFAULT 0.10,
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

    -- Offline sync
    is_offline BOOLEAN DEFAULT FALSE,
    offline_id VARCHAR(100),
    synced_at TIMESTAMPTZ,

    -- References
    staff_id UUID,
    session_id UUID REFERENCES pos_sessions(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID,
    cancellation_reason TEXT
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_customer ON orders(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status_session ON orders(status, session_id);
CREATE INDEX idx_orders_offline ON orders(is_offline, offline_id) WHERE is_offline = TRUE;

-- =====================================================
-- TABLE: order_items
-- =====================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    combo_id UUID, -- Will reference product_combos

    -- Product snapshot
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(50),

    -- Quantity and price
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,

    -- Modifiers and variants
    modifiers JSONB,
    modifiers_total DECIMAL(12,2) DEFAULT 0,
    selected_variants JSONB,
    combo_selections JSONB,

    -- Notes
    notes TEXT,

    -- KDS dispatch
    dispatch_station dispatch_station,
    item_status item_status DEFAULT 'new',
    is_locked BOOLEAN DEFAULT FALSE,

    -- Preparation
    sent_to_kitchen_at TIMESTAMPTZ,
    prepared_at TIMESTAMPTZ,
    prepared_by UUID,
    served_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_status ON order_items(item_status);
CREATE INDEX idx_order_items_station ON order_items(dispatch_station, item_status);
CREATE INDEX idx_order_items_station_status ON order_items(dispatch_station, item_status)
    WHERE dispatch_station IS NOT NULL;

-- =====================================================
-- TABLE: floor_plan_items (tables and zones)
-- =====================================================
CREATE TABLE floor_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(20) NOT NULL DEFAULT 'table',
    name VARCHAR(100) NOT NULL,
    table_number VARCHAR(10),
    capacity INTEGER DEFAULT 4,
    x_position DECIMAL(10,2) DEFAULT 0,
    y_position DECIMAL(10,2) DEFAULT 0,
    width DECIMAL(10,2) DEFAULT 100,
    height DECIMAL(10,2) DEFAULT 100,
    rotation DECIMAL(5,2) DEFAULT 0,
    shape VARCHAR(20) DEFAULT 'rectangle',
    color VARCHAR(20),
    zone VARCHAR(50),
    floor INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    current_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_floor_plan_items_type ON floor_plan_items(item_type);
CREATE INDEX idx_floor_plan_items_zone ON floor_plan_items(zone);
CREATE INDEX idx_floor_plan_items_available ON floor_plan_items(is_available);
CREATE INDEX idx_floor_plan_items_current_order ON floor_plan_items(current_order_id)
    WHERE current_order_id IS NOT NULL;
