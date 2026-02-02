-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 003: Customers & Loyalty Module
-- Tables: customer_categories, customers, loyalty_tiers, loyalty_transactions, etc.
-- =====================================================

-- =====================================================
-- TABLE: customer_categories
-- =====================================================
CREATE TABLE customer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#BA90A2',
    icon TEXT DEFAULT 'users',

    -- Pricing settings
    price_modifier_type TEXT NOT NULL DEFAULT 'retail'
        CHECK (price_modifier_type IN ('retail', 'wholesale', 'custom', 'discount_percentage')),
    discount_percentage NUMERIC(5,2) DEFAULT 0,

    -- Loyalty settings
    loyalty_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    points_per_amount NUMERIC(10,2) DEFAULT 1000,
    points_multiplier NUMERIC(5,2) DEFAULT 1.0,

    -- Auto-discount based on points
    auto_discount_enabled BOOLEAN DEFAULT FALSE,
    auto_discount_threshold INTEGER DEFAULT 100,
    auto_discount_percentage NUMERIC(5,2) DEFAULT 10,

    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_categories_slug ON customer_categories(slug);
CREATE INDEX idx_customer_categories_is_active ON customer_categories(is_active);

-- =====================================================
-- TABLE: loyalty_tiers
-- =====================================================
CREATE TABLE loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    min_lifetime_points INTEGER NOT NULL,
    color TEXT DEFAULT '#CD7F32',
    icon TEXT DEFAULT 'award',

    -- Benefits
    points_multiplier NUMERIC(5,2) DEFAULT 1.0,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    free_delivery BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    birthday_bonus_points INTEGER DEFAULT 0,

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_tiers_slug ON loyalty_tiers(slug);
CREATE INDEX idx_loyalty_tiers_min_points ON loyalty_tiers(min_lifetime_points);

-- =====================================================
-- TABLE: customers
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(255),
    address TEXT,

    -- Customer type and category
    customer_type customer_type DEFAULT 'retail',
    category_id UUID REFERENCES customer_categories(id) ON DELETE SET NULL,

    -- B2B specific
    company_name VARCHAR(200),
    tax_id VARCHAR(50),
    payment_terms payment_terms DEFAULT 'cod',
    credit_limit DECIMAL(15,2) DEFAULT 0,

    -- Loyalty
    loyalty_points INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze'
        CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    loyalty_qr_code TEXT UNIQUE,
    membership_number TEXT UNIQUE,
    points_expiry_date DATE,

    -- Profile
    date_of_birth DATE,
    preferred_language TEXT DEFAULT 'id'
        CHECK (preferred_language IN ('id', 'en', 'fr')),

    -- Stats
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
CREATE INDEX idx_customers_category ON customers(category_id);
CREATE INDEX idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_company ON customers(company_name) WHERE company_name IS NOT NULL;
CREATE INDEX idx_customers_loyalty_qr ON customers(loyalty_qr_code);
CREATE INDEX idx_customers_membership_number ON customers(membership_number);
CREATE INDEX idx_customers_loyalty_tier ON customers(loyalty_tier);

-- =====================================================
-- TABLE: product_category_prices (custom pricing per category)
-- =====================================================
CREATE TABLE product_category_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_category_id UUID NOT NULL REFERENCES customer_categories(id) ON DELETE CASCADE,
    custom_price DECIMAL(12,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, customer_category_id)
);

CREATE INDEX idx_product_category_prices_product ON product_category_prices(product_id);
CREATE INDEX idx_product_category_prices_category ON product_category_prices(customer_category_id);

-- =====================================================
-- TABLE: loyalty_transactions
-- =====================================================
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_id UUID, -- Will reference orders table

    transaction_type TEXT NOT NULL
        CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust', 'bonus', 'refund')),
    points INTEGER NOT NULL,
    points_balance_after INTEGER NOT NULL,

    -- For earn transactions
    order_amount NUMERIC(12,2),
    points_rate NUMERIC(10,2),
    multiplier NUMERIC(5,2) DEFAULT 1.0,

    -- For redeem transactions
    discount_applied NUMERIC(12,2),

    description TEXT,
    reference_number TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);
CREATE INDEX idx_loyalty_transactions_order ON loyalty_transactions(order_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX idx_loyalty_transactions_created ON loyalty_transactions(created_at DESC);

-- =====================================================
-- TABLE: loyalty_rewards
-- =====================================================
CREATE TABLE loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,

    reward_type TEXT NOT NULL
        CHECK (reward_type IN ('product', 'discount_fixed', 'discount_percentage', 'free_item')),

    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    discount_value NUMERIC(12,2),
    min_order_amount NUMERIC(12,2) DEFAULT 0,

    points_required INTEGER NOT NULL,
    quantity_available INTEGER,
    quantity_redeemed INTEGER DEFAULT 0,

    valid_from DATE,
    valid_until DATE,
    min_tier TEXT DEFAULT 'bronze',

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_rewards_type ON loyalty_rewards(reward_type);
CREATE INDEX idx_loyalty_rewards_active ON loyalty_rewards(is_active);

-- =====================================================
-- TABLE: loyalty_redemptions
-- =====================================================
CREATE TABLE loyalty_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES loyalty_rewards(id) ON DELETE CASCADE,
    order_id UUID,
    loyalty_transaction_id UUID REFERENCES loyalty_transactions(id) ON DELETE SET NULL,

    points_used INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'applied', 'expired', 'cancelled')),

    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    applied_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_redemptions_customer ON loyalty_redemptions(customer_id);
CREATE INDEX idx_loyalty_redemptions_status ON loyalty_redemptions(status);
