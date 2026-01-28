-- Migration 030: Combos and Promotions Module
-- Add support for product combos and time-based promotions

-- =====================================================
-- TABLE: product_combos
-- Stores combo deals (e.g., Coffee + Croissant)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_combos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    combo_price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    available_at_pos BOOLEAN DEFAULT true,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: product_combo_items
-- Items included in a combo
-- =====================================================
CREATE TABLE IF NOT EXISTS product_combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id UUID NOT NULL REFERENCES product_combos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_optional BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(combo_id, product_id)
);

-- =====================================================
-- TABLE: promotions
-- Time-based promotions with flexible rules
-- =====================================================
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount', 'buy_x_get_y', 'free_product'
    is_active BOOLEAN DEFAULT true,

    -- Time constraints
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    days_of_week INTEGER[], -- Array: [0=Sunday, 1=Monday, ..., 6=Saturday]
    time_start TIME,
    time_end TIME,

    -- Discount rules (for percentage/fixed_amount types)
    discount_percentage NUMERIC(5, 2),
    discount_amount NUMERIC(10, 2),

    -- Buy X Get Y rules
    buy_quantity INTEGER,
    get_quantity INTEGER,

    -- Minimum requirements
    min_purchase_amount NUMERIC(10, 2),
    min_quantity INTEGER,

    -- Usage limits
    max_uses_total INTEGER,
    max_uses_per_customer INTEGER,
    current_uses INTEGER DEFAULT 0,

    -- Priority (higher number = applied first)
    priority INTEGER DEFAULT 0,

    -- Stackable with other promotions
    is_stackable BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active promotions lookup
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code) WHERE is_active = true;

-- =====================================================
-- TABLE: promotion_products
-- Products eligible for promotion (if empty, applies to all)
-- =====================================================
CREATE TABLE IF NOT EXISTS promotion_products (
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

-- =====================================================
-- TABLE: promotion_free_products
-- For 'free_product' type promotions
-- =====================================================
CREATE TABLE IF NOT EXISTS promotion_free_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    free_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: promotion_usage
-- Track promotion usage per customer
-- =====================================================
CREATE TABLE IF NOT EXISTS promotion_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    discount_amount NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for usage tracking
CREATE INDEX IF NOT EXISTS idx_promotion_usage_customer ON promotion_usage(promotion_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_date ON promotion_usage(used_at);

-- =====================================================
-- FUNCTION: check_promotion_validity
-- Validates if a promotion is currently valid
-- =====================================================
CREATE OR REPLACE FUNCTION check_promotion_validity(
    p_promotion_id UUID,
    p_customer_id UUID DEFAULT NULL,
    p_purchase_amount NUMERIC DEFAULT 0
)
RETURNS TABLE(
    is_valid BOOLEAN,
    reason TEXT
) AS $$
DECLARE
    v_promotion RECORD;
    v_current_time TIME;
    v_current_day INTEGER;
    v_customer_uses INTEGER;
BEGIN
    -- Get promotion details
    SELECT * INTO v_promotion
    FROM promotions
    WHERE id = p_promotion_id;

    -- Check if promotion exists and is active
    IF NOT FOUND OR NOT v_promotion.is_active THEN
        RETURN QUERY SELECT false, 'Promotion not found or inactive';
        RETURN;
    END IF;

    -- Check date range
    IF v_promotion.start_date IS NOT NULL AND NOW() < v_promotion.start_date THEN
        RETURN QUERY SELECT false, 'Promotion not yet started';
        RETURN;
    END IF;

    IF v_promotion.end_date IS NOT NULL AND NOW() > v_promotion.end_date THEN
        RETURN QUERY SELECT false, 'Promotion expired';
        RETURN;
    END IF;

    -- Check day of week
    IF v_promotion.days_of_week IS NOT NULL THEN
        v_current_day := EXTRACT(DOW FROM NOW())::INTEGER;
        IF NOT (v_current_day = ANY(v_promotion.days_of_week)) THEN
            RETURN QUERY SELECT false, 'Promotion not valid on this day';
            RETURN;
        END IF;
    END IF;

    -- Check time range
    IF v_promotion.time_start IS NOT NULL AND v_promotion.time_end IS NOT NULL THEN
        v_current_time := NOW()::TIME;
        IF v_current_time < v_promotion.time_start OR v_current_time > v_promotion.time_end THEN
            RETURN QUERY SELECT false, 'Promotion not valid at this time';
            RETURN;
        END IF;
    END IF;

    -- Check minimum purchase amount
    IF v_promotion.min_purchase_amount IS NOT NULL AND p_purchase_amount < v_promotion.min_purchase_amount THEN
        RETURN QUERY SELECT false, 'Minimum purchase amount not met';
        RETURN;
    END IF;

    -- Check total usage limit
    IF v_promotion.max_uses_total IS NOT NULL AND v_promotion.current_uses >= v_promotion.max_uses_total THEN
        RETURN QUERY SELECT false, 'Promotion usage limit reached';
        RETURN;
    END IF;

    -- Check per-customer usage limit
    IF p_customer_id IS NOT NULL AND v_promotion.max_uses_per_customer IS NOT NULL THEN
        SELECT COUNT(*) INTO v_customer_uses
        FROM promotion_usage
        WHERE promotion_id = p_promotion_id AND customer_id = p_customer_id;

        IF v_customer_uses >= v_promotion.max_uses_per_customer THEN
            RETURN QUERY SELECT false, 'Customer usage limit reached';
            RETURN;
        END IF;
    END IF;

    -- All checks passed
    RETURN QUERY SELECT true, 'Valid'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: get_applicable_promotions
-- Returns all valid promotions for given products
-- =====================================================
CREATE OR REPLACE FUNCTION get_applicable_promotions(
    p_product_ids UUID[],
    p_category_ids UUID[],
    p_customer_id UUID DEFAULT NULL,
    p_subtotal NUMERIC DEFAULT 0
)
RETURNS TABLE(
    promotion_id UUID,
    promotion_code VARCHAR,
    promotion_name VARCHAR,
    promotion_type VARCHAR,
    discount_percentage NUMERIC,
    discount_amount NUMERIC,
    priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.id,
        p.code,
        p.name,
        p.promotion_type,
        p.discount_percentage,
        p.discount_amount,
        p.priority
    FROM promotions p
    LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
    WHERE p.is_active = true
        AND (p.start_date IS NULL OR NOW() >= p.start_date)
        AND (p.end_date IS NULL OR NOW() <= p.end_date)
        AND (p.days_of_week IS NULL OR EXTRACT(DOW FROM NOW())::INTEGER = ANY(p.days_of_week))
        AND (p.time_start IS NULL OR NOW()::TIME >= p.time_start)
        AND (p.time_end IS NULL OR NOW()::TIME <= p.time_end)
        AND (p.min_purchase_amount IS NULL OR p_subtotal >= p.min_purchase_amount)
        AND (p.max_uses_total IS NULL OR p.current_uses < p.max_uses_total)
        AND (
            -- No specific products/categories (applies to all)
            NOT EXISTS (SELECT 1 FROM promotion_products WHERE promotion_id = p.id)
            OR
            -- Matches specific products
            pp.product_id = ANY(p_product_ids)
            OR
            -- Matches categories
            pp.category_id = ANY(p_category_ids)
        )
    ORDER BY p.priority DESC, p.discount_percentage DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: record_promotion_usage
-- Records when a promotion is used
-- =====================================================
CREATE OR REPLACE FUNCTION record_promotion_usage(
    p_promotion_id UUID,
    p_customer_id UUID,
    p_order_id UUID,
    p_discount_amount NUMERIC
)
RETURNS VOID AS $$
BEGIN
    -- Insert usage record
    INSERT INTO promotion_usage (promotion_id, customer_id, order_id, discount_amount)
    VALUES (p_promotion_id, p_customer_id, p_order_id, p_discount_amount);

    -- Increment promotion usage counter
    UPDATE promotions
    SET current_uses = current_uses + 1
    WHERE id = p_promotion_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers for updated_at timestamps
-- =====================================================
CREATE TRIGGER update_product_combos_updated_at
    BEFORE UPDATE ON product_combos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- RLS Policies
-- =====================================================
-- Product Combos
ALTER TABLE product_combos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to combos" ON product_combos FOR SELECT USING (true);
CREATE POLICY "Allow insert combos for authenticated users" ON product_combos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update combos for authenticated users" ON product_combos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete combos for authenticated users" ON product_combos FOR DELETE USING (auth.role() = 'authenticated');

-- Combo Items
ALTER TABLE product_combo_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to combo items" ON product_combo_items FOR SELECT USING (true);
CREATE POLICY "Allow insert combo items for authenticated users" ON product_combo_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update combo items for authenticated users" ON product_combo_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete combo items for authenticated users" ON product_combo_items FOR DELETE USING (auth.role() = 'authenticated');

-- Promotions
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to promotions" ON promotions FOR SELECT USING (true);
CREATE POLICY "Allow insert promotions for authenticated users" ON promotions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update promotions for authenticated users" ON promotions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete promotions for authenticated users" ON promotions FOR DELETE USING (auth.role() = 'authenticated');

-- Promotion Products
ALTER TABLE promotion_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to promotion products" ON promotion_products FOR SELECT USING (true);
CREATE POLICY "Allow insert promotion products for authenticated users" ON promotion_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update promotion products for authenticated users" ON promotion_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete promotion products for authenticated users" ON promotion_products FOR DELETE USING (auth.role() = 'authenticated');

-- Promotion Free Products
ALTER TABLE promotion_free_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to promotion free products" ON promotion_free_products FOR SELECT USING (true);
CREATE POLICY "Allow insert promotion free products for authenticated users" ON promotion_free_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update promotion free products for authenticated users" ON promotion_free_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete promotion free products for authenticated users" ON promotion_free_products FOR DELETE USING (auth.role() = 'authenticated');

-- Promotion Usage
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to promotion usage" ON promotion_usage FOR SELECT USING (true);
CREATE POLICY "Allow insert promotion usage for authenticated users" ON promotion_usage FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================
COMMENT ON TABLE product_combos IS 'Product combo deals (e.g., Coffee + Croissant bundle)';
COMMENT ON TABLE product_combo_items IS 'Items included in combo deals';
COMMENT ON TABLE promotions IS 'Time-based promotions with flexible rules';
COMMENT ON TABLE promotion_products IS 'Products/categories eligible for promotions';
COMMENT ON TABLE promotion_free_products IS 'Free products offered in promotions';
COMMENT ON TABLE promotion_usage IS 'Tracks promotion usage per customer and order';
