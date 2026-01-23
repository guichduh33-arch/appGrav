-- Migration: Customer Loyalty System
-- Description: Advanced customer management with categories, tiered pricing, loyalty points and QR codes
-- Date: 2026-01-19

-- =============================================
-- CUSTOMER CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.customer_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#BA90A2',
    icon TEXT DEFAULT 'users',

    -- Pricing settings
    price_modifier_type TEXT NOT NULL DEFAULT 'retail' CHECK (price_modifier_type IN ('retail', 'wholesale', 'custom', 'discount_percentage')),
    discount_percentage NUMERIC(5,2) DEFAULT 0,

    -- Loyalty settings
    loyalty_enabled BOOLEAN NOT NULL DEFAULT false,
    points_per_amount NUMERIC(10,2) DEFAULT 1000,  -- e.g., 1 point per 1000 IDR
    points_multiplier NUMERIC(5,2) DEFAULT 1.0,     -- e.g., 2x points for VIP

    -- Auto-discount based on points
    auto_discount_enabled BOOLEAN DEFAULT false,
    auto_discount_threshold INTEGER DEFAULT 100,    -- Points needed to trigger auto-discount
    auto_discount_percentage NUMERIC(5,2) DEFAULT 10,

    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- CUSTOMER CATEGORY PRICES (for custom pricing per category)
-- =============================================
CREATE TABLE IF NOT EXISTS public.customer_category_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.customer_categories(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    custom_price NUMERIC(12,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT customer_category_prices_unique UNIQUE (category_id, product_id)
);

-- =============================================
-- ALTER CUSTOMERS TABLE - Add new fields
-- =============================================
-- Add category reference
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.customer_categories(id) ON DELETE SET NULL;

-- Add QR code for loyalty
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS loyalty_qr_code TEXT UNIQUE;

-- Add membership card number
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS membership_number TEXT UNIQUE;

-- Add date of birth for birthday rewards
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add loyalty tier
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum'));

-- Add lifetime points (never decreases)
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0;

-- Add points expiry date
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS points_expiry_date DATE;

-- Add preferred language
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'id' CHECK (preferred_language IN ('id', 'en', 'fr'));

-- =============================================
-- LOYALTY TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,

    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust', 'bonus', 'refund')),
    points INTEGER NOT NULL,
    points_balance_after INTEGER NOT NULL,

    -- For earn transactions
    order_amount NUMERIC(12,2),
    points_rate NUMERIC(10,2),  -- Points per amount used
    multiplier NUMERIC(5,2) DEFAULT 1.0,

    -- For redeem transactions
    discount_applied NUMERIC(12,2),

    description TEXT,
    reference_number TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- LOYALTY TIERS CONFIGURATION
-- =============================================
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    min_lifetime_points INTEGER NOT NULL,
    color TEXT DEFAULT '#CD7F32',
    icon TEXT DEFAULT 'award',

    -- Benefits
    points_multiplier NUMERIC(5,2) DEFAULT 1.0,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    free_delivery BOOLEAN DEFAULT false,
    priority_support BOOLEAN DEFAULT false,
    birthday_bonus_points INTEGER DEFAULT 0,

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- LOYALTY REWARDS (redeemable items)
-- =============================================
CREATE TABLE IF NOT EXISTS public.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,

    reward_type TEXT NOT NULL CHECK (reward_type IN ('product', 'discount_fixed', 'discount_percentage', 'free_item')),

    -- For product rewards
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,

    -- For discount rewards
    discount_value NUMERIC(12,2),
    min_order_amount NUMERIC(12,2) DEFAULT 0,

    points_required INTEGER NOT NULL,
    quantity_available INTEGER,  -- NULL for unlimited
    quantity_redeemed INTEGER DEFAULT 0,

    valid_from DATE,
    valid_until DATE,

    -- Tier restrictions
    min_tier TEXT DEFAULT 'bronze',

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- REWARD REDEMPTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.loyalty_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.loyalty_rewards(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    loyalty_transaction_id UUID REFERENCES public.loyalty_transactions(id) ON DELETE SET NULL,

    points_used INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'expired', 'cancelled')),

    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    applied_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_customer_categories_slug ON public.customer_categories(slug);
CREATE INDEX IF NOT EXISTS idx_customer_categories_is_active ON public.customer_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_customer_category_prices_category ON public.customer_category_prices(category_id);
CREATE INDEX IF NOT EXISTS idx_customer_category_prices_product ON public.customer_category_prices(product_id);

CREATE INDEX IF NOT EXISTS idx_customers_category ON public.customers(category_id);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_qr ON public.customers(loyalty_qr_code);
CREATE INDEX IF NOT EXISTS idx_customers_membership_number ON public.customers(membership_number);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_tier ON public.customers(loyalty_tier);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON public.loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_order ON public.loyalty_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON public.loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created ON public.loyalty_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_slug ON public.loyalty_tiers(slug);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_min_points ON public.loyalty_tiers(min_lifetime_points);

CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_type ON public.loyalty_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON public.loyalty_rewards(is_active);

CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_customer ON public.loyalty_redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_redemptions_status ON public.loyalty_redemptions(status);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_customer_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customer_categories_updated_at ON public.customer_categories;
CREATE TRIGGER trigger_update_customer_categories_updated_at
    BEFORE UPDATE ON public.customer_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_categories_updated_at();

CREATE OR REPLACE FUNCTION update_customer_category_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customer_category_prices_updated_at ON public.customer_category_prices;
CREATE TRIGGER trigger_update_customer_category_prices_updated_at
    BEFORE UPDATE ON public.customer_category_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_category_prices_updated_at();

CREATE OR REPLACE FUNCTION update_loyalty_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_loyalty_tiers_updated_at ON public.loyalty_tiers;
CREATE TRIGGER trigger_update_loyalty_tiers_updated_at
    BEFORE UPDATE ON public.loyalty_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_tiers_updated_at();

CREATE OR REPLACE FUNCTION update_loyalty_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_loyalty_rewards_updated_at ON public.loyalty_rewards;
CREATE TRIGGER trigger_update_loyalty_rewards_updated_at
    BEFORE UPDATE ON public.loyalty_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_rewards_updated_at();

-- =============================================
-- GENERATE UNIQUE QR CODE FOR CUSTOMER
-- =============================================
CREATE OR REPLACE FUNCTION generate_customer_qr_code()
RETURNS TRIGGER AS $$
DECLARE
    qr_prefix TEXT := 'BRK';
    random_part TEXT;
    final_qr TEXT;
BEGIN
    IF NEW.loyalty_qr_code IS NULL THEN
        -- Generate a unique QR code: BRK-XXXXXX-YYYY
        random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');

        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM public.customers WHERE loyalty_qr_code = final_qr) LOOP
            random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
            final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');
        END LOOP;

        NEW.loyalty_qr_code := final_qr;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_customer_qr_code ON public.customers;
CREATE TRIGGER trigger_generate_customer_qr_code
    BEFORE INSERT ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION generate_customer_qr_code();

-- =============================================
-- GENERATE MEMBERSHIP NUMBER
-- =============================================
CREATE OR REPLACE FUNCTION generate_membership_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INT;
    final_number TEXT;
BEGIN
    IF NEW.membership_number IS NULL THEN
        year_part := to_char(NOW(), 'YY');

        SELECT COALESCE(MAX(
            CAST(SUBSTRING(membership_number FROM 'M' || year_part || '(\d+)') AS INT)
        ), 0) + 1
        INTO sequence_num
        FROM public.customers
        WHERE membership_number LIKE 'M' || year_part || '%';

        final_number := 'M' || year_part || LPAD(sequence_num::TEXT, 5, '0');
        NEW.membership_number := final_number;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_membership_number ON public.customers;
CREATE TRIGGER trigger_generate_membership_number
    BEFORE INSERT ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION generate_membership_number();

-- =============================================
-- UPDATE LOYALTY TIER BASED ON LIFETIME POINTS
-- =============================================
CREATE OR REPLACE FUNCTION update_customer_loyalty_tier()
RETURNS TRIGGER AS $$
DECLARE
    new_tier TEXT;
BEGIN
    -- Find the highest tier the customer qualifies for
    SELECT slug INTO new_tier
    FROM public.loyalty_tiers
    WHERE min_lifetime_points <= NEW.lifetime_points
    AND is_active = true
    ORDER BY min_lifetime_points DESC
    LIMIT 1;

    IF new_tier IS NOT NULL AND new_tier != COALESCE(NEW.loyalty_tier, 'bronze') THEN
        NEW.loyalty_tier := new_tier;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customer_loyalty_tier ON public.customers;
CREATE TRIGGER trigger_update_customer_loyalty_tier
    BEFORE UPDATE OF lifetime_points ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_loyalty_tier();

-- =============================================
-- FUNCTION: ADD LOYALTY POINTS
-- =============================================
CREATE OR REPLACE FUNCTION add_loyalty_points(
    p_customer_id UUID,
    p_order_id UUID,
    p_order_amount NUMERIC(12,2),
    p_created_by UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_category_id UUID;
    v_points_per_amount NUMERIC(10,2);
    v_points_multiplier NUMERIC(5,2);
    v_tier_multiplier NUMERIC(5,2);
    v_loyalty_enabled BOOLEAN;
    v_current_points INTEGER;
    v_lifetime_points INTEGER;
    v_earned_points INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get customer info
    SELECT
        c.category_id,
        c.loyalty_points,
        c.lifetime_points,
        COALESCE(cc.loyalty_enabled, false),
        COALESCE(cc.points_per_amount, 1000),
        COALESCE(cc.points_multiplier, 1.0)
    INTO
        v_category_id,
        v_current_points,
        v_lifetime_points,
        v_loyalty_enabled,
        v_points_per_amount,
        v_points_multiplier
    FROM public.customers c
    LEFT JOIN public.customer_categories cc ON c.category_id = cc.id
    WHERE c.id = p_customer_id;

    -- Check if loyalty is enabled for this category
    IF NOT v_loyalty_enabled THEN
        RETURN 0;
    END IF;

    -- Get tier multiplier
    SELECT COALESCE(points_multiplier, 1.0) INTO v_tier_multiplier
    FROM public.loyalty_tiers
    WHERE slug = (SELECT loyalty_tier FROM public.customers WHERE id = p_customer_id)
    AND is_active = true;

    -- Calculate points
    v_earned_points := FLOOR(p_order_amount / v_points_per_amount * v_points_multiplier * COALESCE(v_tier_multiplier, 1.0));

    IF v_earned_points <= 0 THEN
        RETURN 0;
    END IF;

    v_new_balance := v_current_points + v_earned_points;

    -- Update customer points
    UPDATE public.customers
    SET
        loyalty_points = v_new_balance,
        lifetime_points = COALESCE(lifetime_points, 0) + v_earned_points,
        total_spent = COALESCE(total_spent, 0) + p_order_amount,
        total_visits = COALESCE(total_visits, 0) + 1,
        last_visit_at = now()
    WHERE id = p_customer_id;

    -- Log transaction
    INSERT INTO public.loyalty_transactions (
        customer_id, order_id, transaction_type, points, points_balance_after,
        order_amount, points_rate, multiplier, description, created_by
    ) VALUES (
        p_customer_id, p_order_id, 'earn', v_earned_points, v_new_balance,
        p_order_amount, v_points_per_amount, v_points_multiplier * COALESCE(v_tier_multiplier, 1.0),
        'Points gagnés sur commande', p_created_by
    );

    RETURN v_earned_points;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: REDEEM LOYALTY POINTS
-- =============================================
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
    p_customer_id UUID,
    p_points INTEGER,
    p_order_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT 'Utilisation de points',
    p_created_by UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_points INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current points
    SELECT loyalty_points INTO v_current_points
    FROM public.customers
    WHERE id = p_customer_id;

    -- Check if customer has enough points
    IF v_current_points < p_points THEN
        RAISE EXCEPTION 'Insufficient loyalty points. Available: %, Requested: %', v_current_points, p_points;
    END IF;

    v_new_balance := v_current_points - p_points;

    -- Update customer points
    UPDATE public.customers
    SET loyalty_points = v_new_balance
    WHERE id = p_customer_id;

    -- Log transaction
    INSERT INTO public.loyalty_transactions (
        customer_id, order_id, transaction_type, points, points_balance_after,
        description, created_by
    ) VALUES (
        p_customer_id, p_order_id, 'redeem', -p_points, v_new_balance,
        p_description, p_created_by
    );

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: GET CUSTOMER PRICE FOR PRODUCT
-- =============================================
CREATE OR REPLACE FUNCTION get_customer_price(
    p_customer_id UUID,
    p_product_id UUID
)
RETURNS NUMERIC(12,2) AS $$
DECLARE
    v_category_id UUID;
    v_price_modifier_type TEXT;
    v_discount_percentage NUMERIC(5,2);
    v_custom_price NUMERIC(12,2);
    v_retail_price NUMERIC(12,2);
    v_wholesale_price NUMERIC(12,2);
    v_final_price NUMERIC(12,2);
BEGIN
    -- Get customer category info
    SELECT
        c.category_id,
        cc.price_modifier_type,
        cc.discount_percentage
    INTO
        v_category_id,
        v_price_modifier_type,
        v_discount_percentage
    FROM public.customers c
    LEFT JOIN public.customer_categories cc ON c.category_id = cc.id
    WHERE c.id = p_customer_id;

    -- Get product prices
    SELECT retail_price, wholesale_price
    INTO v_retail_price, v_wholesale_price
    FROM public.products
    WHERE id = p_product_id;

    -- If no category, return retail price
    IF v_category_id IS NULL OR v_price_modifier_type IS NULL THEN
        RETURN COALESCE(v_retail_price, 0);
    END IF;

    -- Determine price based on modifier type
    CASE v_price_modifier_type
        WHEN 'retail' THEN
            v_final_price := COALESCE(v_retail_price, 0);
        WHEN 'wholesale' THEN
            v_final_price := COALESCE(v_wholesale_price, v_retail_price, 0);
        WHEN 'custom' THEN
            -- Check for custom price
            SELECT custom_price INTO v_custom_price
            FROM public.customer_category_prices
            WHERE category_id = v_category_id AND product_id = p_product_id AND is_active = true;

            v_final_price := COALESCE(v_custom_price, v_retail_price, 0);
        WHEN 'discount_percentage' THEN
            v_final_price := COALESCE(v_retail_price, 0) * (1 - COALESCE(v_discount_percentage, 0) / 100);
        ELSE
            v_final_price := COALESCE(v_retail_price, 0);
    END CASE;

    RETURN v_final_price;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DEFAULT DATA
-- =============================================

-- Default loyalty tiers
INSERT INTO public.loyalty_tiers (name, slug, min_lifetime_points, color, points_multiplier, discount_percentage, birthday_bonus_points, sort_order) VALUES
    ('Bronze', 'bronze', 0, '#CD7F32', 1.0, 0, 50, 1),
    ('Silver', 'silver', 500, '#C0C0C0', 1.25, 2, 100, 2),
    ('Gold', 'gold', 2000, '#FFD700', 1.5, 5, 200, 3),
    ('Platinum', 'platinum', 5000, '#E5E4E2', 2.0, 10, 500, 4)
ON CONFLICT (slug) DO NOTHING;

-- Default customer categories
INSERT INTO public.customer_categories (name, slug, description, color, price_modifier_type, loyalty_enabled, points_per_amount, is_default, sort_order) VALUES
    ('Client Standard', 'retail', 'Clients particuliers avec programme fidélité', '#6B8E6B', 'retail', true, 1000, true, 1),
    ('B2B / Wholesale', 'wholesale', 'Clients professionnels avec tarifs wholesale', '#7BA3B5', 'wholesale', false, 0, false, 2),
    ('Membre VIP', 'vip', 'Membres premium avec réductions spéciales', '#BA90A2', 'discount_percentage', true, 500, false, 3),
    ('Staff', 'staff', 'Employés avec remise staff', '#EAC086', 'discount_percentage', false, 0, false, 4)
ON CONFLICT (slug) DO NOTHING;

-- Set discount for VIP and Staff categories
UPDATE public.customer_categories SET discount_percentage = 15 WHERE slug = 'vip';
UPDATE public.customer_categories SET discount_percentage = 25 WHERE slug = 'staff';

-- Set points multiplier for VIP
UPDATE public.customer_categories SET points_multiplier = 2.0 WHERE slug = 'vip';

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.customer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_category_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated
DROP POLICY IF EXISTS "Allow authenticated to manage customer_categories" ON public.customer_categories;
CREATE POLICY "Allow authenticated to manage customer_categories" ON public.customer_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated to manage customer_category_prices" ON public.customer_category_prices;
CREATE POLICY "Allow authenticated to manage customer_category_prices" ON public.customer_category_prices FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated to manage loyalty_transactions" ON public.loyalty_transactions;
CREATE POLICY "Allow authenticated to manage loyalty_transactions" ON public.loyalty_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated to manage loyalty_tiers" ON public.loyalty_tiers;
CREATE POLICY "Allow authenticated to manage loyalty_tiers" ON public.loyalty_tiers FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated to manage loyalty_rewards" ON public.loyalty_rewards;
CREATE POLICY "Allow authenticated to manage loyalty_rewards" ON public.loyalty_rewards FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow authenticated to manage loyalty_redemptions" ON public.loyalty_redemptions;
CREATE POLICY "Allow authenticated to manage loyalty_redemptions" ON public.loyalty_redemptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for anon (development)
DROP POLICY IF EXISTS "Allow anon to manage customer_categories" ON public.customer_categories;
CREATE POLICY "Allow anon to manage customer_categories" ON public.customer_categories FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to manage customer_category_prices" ON public.customer_category_prices;
CREATE POLICY "Allow anon to manage customer_category_prices" ON public.customer_category_prices FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to manage loyalty_transactions" ON public.loyalty_transactions;
CREATE POLICY "Allow anon to manage loyalty_transactions" ON public.loyalty_transactions FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to manage loyalty_tiers" ON public.loyalty_tiers;
CREATE POLICY "Allow anon to manage loyalty_tiers" ON public.loyalty_tiers FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to manage loyalty_rewards" ON public.loyalty_rewards;
CREATE POLICY "Allow anon to manage loyalty_rewards" ON public.loyalty_rewards FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon to manage loyalty_redemptions" ON public.loyalty_redemptions;
CREATE POLICY "Allow anon to manage loyalty_redemptions" ON public.loyalty_redemptions FOR ALL TO anon USING (true) WITH CHECK (true);

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.customer_categories IS 'Customer segments with different pricing and loyalty rules';
COMMENT ON TABLE public.customer_category_prices IS 'Custom prices per product for specific customer categories';
COMMENT ON TABLE public.loyalty_transactions IS 'Audit trail of all loyalty point transactions';
COMMENT ON TABLE public.loyalty_tiers IS 'Loyalty program tiers with associated benefits';
COMMENT ON TABLE public.loyalty_rewards IS 'Redeemable rewards in the loyalty program';
COMMENT ON TABLE public.loyalty_redemptions IS 'Record of reward redemptions by customers';

COMMENT ON FUNCTION add_loyalty_points IS 'Add loyalty points to a customer based on order amount';
COMMENT ON FUNCTION redeem_loyalty_points IS 'Redeem loyalty points from a customer account';
COMMENT ON FUNCTION get_customer_price IS 'Get the appropriate price for a product based on customer category';
