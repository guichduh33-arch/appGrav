-- =====================================================
-- THE BREAKERY POS & MINI-ERP - CONSOLIDATED SCHEMA
-- Migration 006: Combos & Promotions Module
-- Tables: product_combos, combo_groups, promotions, etc.
-- =====================================================

-- =====================================================
-- TABLE: product_combos
-- =====================================================
CREATE TABLE product_combos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    combo_price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    available_at_pos BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_combos_active ON product_combos(is_active);
CREATE INDEX idx_product_combos_sort ON product_combos(sort_order);

-- =====================================================
-- TABLE: product_combo_groups (choice groups)
-- =====================================================
CREATE TABLE product_combo_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id UUID NOT NULL REFERENCES product_combos(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_selections INTEGER DEFAULT 1,
    max_selections INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_combo_groups_combo ON product_combo_groups(combo_id);
CREATE INDEX idx_combo_groups_sort ON product_combo_groups(sort_order);

-- =====================================================
-- TABLE: product_combo_group_items
-- =====================================================
CREATE TABLE product_combo_group_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES product_combo_groups(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    price_adjustment NUMERIC(10,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_combo_group_items_group ON product_combo_group_items(group_id);
CREATE INDEX idx_combo_group_items_product ON product_combo_group_items(product_id);

-- Legacy table for backwards compatibility
CREATE TABLE product_combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id UUID NOT NULL REFERENCES product_combos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(combo_id, product_id)
);

CREATE INDEX idx_combo_items_combo ON product_combo_items(combo_id);

-- =====================================================
-- TABLE: promotions
-- =====================================================
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount', 'buy_x_get_y', 'free_product'
    is_active BOOLEAN DEFAULT TRUE,

    -- Time constraints
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    days_of_week INTEGER[], -- [0=Sunday, 1=Monday, ..., 6=Saturday]
    time_start TIME,
    time_end TIME,

    -- Discount rules
    discount_percentage NUMERIC(5,2),
    discount_amount NUMERIC(10,2),

    -- Buy X Get Y rules
    buy_quantity INTEGER,
    get_quantity INTEGER,

    -- Minimum requirements
    min_purchase_amount NUMERIC(10,2),
    min_quantity INTEGER,

    -- Usage limits
    max_uses_total INTEGER,
    max_uses_per_customer INTEGER,
    current_uses INTEGER DEFAULT 0,

    -- Priority (higher = applied first)
    priority INTEGER DEFAULT 0,
    is_stackable BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promotions_active ON promotions(is_active, start_date, end_date);
CREATE INDEX idx_promotions_code ON promotions(code) WHERE is_active = TRUE;

-- =====================================================
-- TABLE: promotion_products
-- =====================================================
CREATE TABLE promotion_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_product_or_category CHECK (
        (product_id IS NOT NULL AND category_id IS NULL) OR
        (product_id IS NULL AND category_id IS NOT NULL)
    )
);

CREATE INDEX idx_promotion_products_promotion ON promotion_products(promotion_id);
CREATE INDEX idx_promotion_products_product ON promotion_products(product_id);
CREATE INDEX idx_promotion_products_category ON promotion_products(category_id);

-- =====================================================
-- TABLE: promotion_free_products
-- =====================================================
CREATE TABLE promotion_free_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    free_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promotion_free_products_promotion ON promotion_free_products(promotion_id);

-- =====================================================
-- TABLE: promotion_usage
-- =====================================================
CREATE TABLE promotion_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    discount_amount NUMERIC(10,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_promotion_usage_customer ON promotion_usage(promotion_id, customer_id);
CREATE INDEX idx_promotion_usage_date ON promotion_usage(used_at);
