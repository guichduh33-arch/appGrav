-- Fix RLS policies for customers table
-- Run this if you're getting permission errors when creating/updating customers

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing customer policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated to manage customers" ON public.customers;
DROP POLICY IF EXISTS "Allow anon to manage customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to manage customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to select customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to update customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public to delete customers" ON public.customers;

-- Create comprehensive policies for customers
CREATE POLICY "Allow public to select customers"
    ON public.customers FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public to insert customers"
    ON public.customers FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Allow public to update customers"
    ON public.customers FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public to delete customers"
    ON public.customers FOR DELETE
    TO public
    USING (true);

-- Grant necessary permissions
GRANT ALL ON public.customers TO public;

-- Also fix related tables that might cause issues
-- Loyalty transactions
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to select loyalty_transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "Allow public to insert loyalty_transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "Allow public to update loyalty_transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "Allow public to delete loyalty_transactions" ON public.loyalty_transactions;

CREATE POLICY "Allow public to select loyalty_transactions"
    ON public.loyalty_transactions FOR SELECT TO public USING (true);
CREATE POLICY "Allow public to insert loyalty_transactions"
    ON public.loyalty_transactions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public to update loyalty_transactions"
    ON public.loyalty_transactions FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public to delete loyalty_transactions"
    ON public.loyalty_transactions FOR DELETE TO public USING (true);

GRANT ALL ON public.loyalty_transactions TO public;

-- Loyalty tiers
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to select loyalty_tiers" ON public.loyalty_tiers;
DROP POLICY IF EXISTS "Allow public to insert loyalty_tiers" ON public.loyalty_tiers;
DROP POLICY IF EXISTS "Allow public to update loyalty_tiers" ON public.loyalty_tiers;
DROP POLICY IF EXISTS "Allow public to delete loyalty_tiers" ON public.loyalty_tiers;

CREATE POLICY "Allow public to select loyalty_tiers"
    ON public.loyalty_tiers FOR SELECT TO public USING (true);
CREATE POLICY "Allow public to insert loyalty_tiers"
    ON public.loyalty_tiers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public to update loyalty_tiers"
    ON public.loyalty_tiers FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public to delete loyalty_tiers"
    ON public.loyalty_tiers FOR DELETE TO public USING (true);

GRANT ALL ON public.loyalty_tiers TO public;

-- Loyalty rewards
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to select loyalty_rewards" ON public.loyalty_rewards;
DROP POLICY IF EXISTS "Allow public to insert loyalty_rewards" ON public.loyalty_rewards;
DROP POLICY IF EXISTS "Allow public to update loyalty_rewards" ON public.loyalty_rewards;
DROP POLICY IF EXISTS "Allow public to delete loyalty_rewards" ON public.loyalty_rewards;

CREATE POLICY "Allow public to select loyalty_rewards"
    ON public.loyalty_rewards FOR SELECT TO public USING (true);
CREATE POLICY "Allow public to insert loyalty_rewards"
    ON public.loyalty_rewards FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public to update loyalty_rewards"
    ON public.loyalty_rewards FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public to delete loyalty_rewards"
    ON public.loyalty_rewards FOR DELETE TO public USING (true);

GRANT ALL ON public.loyalty_rewards TO public;

-- Loyalty redemptions
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to select loyalty_redemptions" ON public.loyalty_redemptions;
DROP POLICY IF EXISTS "Allow public to insert loyalty_redemptions" ON public.loyalty_redemptions;
DROP POLICY IF EXISTS "Allow public to update loyalty_redemptions" ON public.loyalty_redemptions;
DROP POLICY IF EXISTS "Allow public to delete loyalty_redemptions" ON public.loyalty_redemptions;

CREATE POLICY "Allow public to select loyalty_redemptions"
    ON public.loyalty_redemptions FOR SELECT TO public USING (true);
CREATE POLICY "Allow public to insert loyalty_redemptions"
    ON public.loyalty_redemptions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public to update loyalty_redemptions"
    ON public.loyalty_redemptions FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public to delete loyalty_redemptions"
    ON public.loyalty_redemptions FOR DELETE TO public USING (true);

GRANT ALL ON public.loyalty_redemptions TO public;

-- Verify policies
SELECT
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN (
    'customers',
    'customer_categories',
    'customer_category_prices',
    'loyalty_transactions',
    'loyalty_tiers',
    'loyalty_rewards',
    'loyalty_redemptions'
)
GROUP BY tablename
ORDER BY tablename;
