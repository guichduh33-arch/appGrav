-- Fix trigger conflicts from migration 028
-- Run this if you get "trigger already exists" errors

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_update_customer_categories_updated_at ON public.customer_categories;
DROP TRIGGER IF EXISTS trigger_update_customer_category_prices_updated_at ON public.customer_category_prices;
DROP TRIGGER IF EXISTS trigger_update_loyalty_tiers_updated_at ON public.loyalty_tiers;
DROP TRIGGER IF EXISTS trigger_update_loyalty_rewards_updated_at ON public.loyalty_rewards;
DROP TRIGGER IF EXISTS trigger_generate_customer_qr_code ON public.customers;
DROP TRIGGER IF EXISTS trigger_generate_membership_number ON public.customers;
DROP TRIGGER IF EXISTS trigger_update_customer_loyalty_tier ON public.customers;

-- Recreate trigger functions (using CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_customer_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_customer_category_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_loyalty_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_loyalty_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_customer_qr_code()
RETURNS TRIGGER AS $$
DECLARE
    qr_prefix TEXT := 'BRK';
    random_part TEXT;
    final_qr TEXT;
BEGIN
    IF NEW.loyalty_qr_code IS NULL THEN
        random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
        final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');

        WHILE EXISTS (SELECT 1 FROM public.customers WHERE loyalty_qr_code = final_qr) LOOP
            random_part := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
            final_qr := qr_prefix || '-' || random_part || '-' || to_char(NEW.created_at, 'YYMM');
        END LOOP;

        NEW.loyalty_qr_code := final_qr;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION update_customer_loyalty_tier()
RETURNS TRIGGER AS $$
DECLARE
    new_tier TEXT;
BEGIN
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

-- Recreate triggers
CREATE TRIGGER trigger_update_customer_categories_updated_at
    BEFORE UPDATE ON public.customer_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_categories_updated_at();

CREATE TRIGGER trigger_update_customer_category_prices_updated_at
    BEFORE UPDATE ON public.customer_category_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_category_prices_updated_at();

CREATE TRIGGER trigger_update_loyalty_tiers_updated_at
    BEFORE UPDATE ON public.loyalty_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_tiers_updated_at();

CREATE TRIGGER trigger_update_loyalty_rewards_updated_at
    BEFORE UPDATE ON public.loyalty_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_rewards_updated_at();

CREATE TRIGGER trigger_generate_customer_qr_code
    BEFORE INSERT ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION generate_customer_qr_code();

CREATE TRIGGER trigger_generate_membership_number
    BEFORE INSERT ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION generate_membership_number();

CREATE TRIGGER trigger_update_customer_loyalty_tier
    BEFORE UPDATE OF lifetime_points ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_loyalty_tier();

-- Verify triggers were created
SELECT
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN (
    'customer_categories',
    'customer_category_prices',
    'loyalty_tiers',
    'loyalty_rewards',
    'customers'
)
ORDER BY event_object_table, trigger_name;
