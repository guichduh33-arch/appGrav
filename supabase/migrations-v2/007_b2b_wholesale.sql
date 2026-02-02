-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 007: B2B & Wholesale Module
-- Tables: b2b_orders, b2b_order_items, b2b_payments, b2b_deliveries
-- =====================================================

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
    status b2b_status DEFAULT 'draft',
    payment_status payment_status DEFAULT 'unpaid',

    -- Amounts
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0.11,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) DEFAULT 0,
    amount_due DECIMAL(15,2) DEFAULT 0,

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
    internal_notes TEXT,

    -- Traceability
    created_by UUID,
    approved_by UUID,
    approved_at TIMESTAMPTZ,

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
    unit VARCHAR(20),
    unit_price DECIMAL(12,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,

    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_b2b_items_order ON b2b_order_items(order_id);
CREATE INDEX idx_b2b_items_product ON b2b_order_items(product_id);

-- =====================================================
-- TABLE: b2b_payments
-- =====================================================
CREATE TABLE b2b_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(30) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES b2b_orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),

    amount DECIMAL(15,2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Bank transfer details
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    reference_number VARCHAR(100),

    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_b2b_payments_order ON b2b_payments(order_id);
CREATE INDEX idx_b2b_payments_customer ON b2b_payments(customer_id);
CREATE INDEX idx_b2b_payments_date ON b2b_payments(payment_date);

-- =====================================================
-- TABLE: b2b_deliveries
-- =====================================================
CREATE TABLE b2b_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_number VARCHAR(30) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES b2b_orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),

    status VARCHAR(20) DEFAULT 'pending',
    scheduled_date DATE,
    actual_date DATE,

    delivery_address TEXT,
    driver_name VARCHAR(200),
    vehicle_info VARCHAR(100),

    received_by VARCHAR(200),
    signature_url TEXT,

    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_b2b_deliveries_order ON b2b_deliveries(order_id);
CREATE INDEX idx_b2b_deliveries_customer ON b2b_deliveries(customer_id);
CREATE INDEX idx_b2b_deliveries_status ON b2b_deliveries(status);
CREATE INDEX idx_b2b_deliveries_date ON b2b_deliveries(scheduled_date);

-- =====================================================
-- TABLE: b2b_price_lists
-- =====================================================
CREATE TABLE b2b_price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: b2b_price_list_items
-- =====================================================
CREATE TABLE b2b_price_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_list_id UUID NOT NULL REFERENCES b2b_price_lists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(12,2) NOT NULL,
    min_quantity DECIMAL(10,3) DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(price_list_id, product_id, min_quantity)
);

CREATE INDEX idx_b2b_price_list_items_list ON b2b_price_list_items(price_list_id);
CREATE INDEX idx_b2b_price_list_items_product ON b2b_price_list_items(product_id);

-- =====================================================
-- TABLE: b2b_customer_price_lists
-- =====================================================
CREATE TABLE b2b_customer_price_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    price_list_id UUID NOT NULL REFERENCES b2b_price_lists(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, price_list_id)
);

CREATE INDEX idx_b2b_customer_price_lists_customer ON b2b_customer_price_lists(customer_id);
