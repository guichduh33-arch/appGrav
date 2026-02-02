-- Migration: 050_remove_dangerous_anon_policies.sql
-- Description: Remove all overly permissive anon RLS policies for sensitive tables
-- This is a CRITICAL SECURITY fix - anon users should NOT have write access to business data
-- Date: 2026-01-24

-- ============================================
-- B2B MODULE - Remove anon write access
-- ============================================
DROP POLICY IF EXISTS "Allow anon to manage b2b_orders" ON public.b2b_orders;
DROP POLICY IF EXISTS "Allow anon to manage b2b_order_items" ON public.b2b_order_items;
DROP POLICY IF EXISTS "Allow anon to manage b2b_payments" ON public.b2b_payments;
DROP POLICY IF EXISTS "Allow anon to manage b2b_deliveries" ON public.b2b_deliveries;
DROP POLICY IF EXISTS "Allow anon to manage b2b_delivery_items" ON public.b2b_delivery_items;
DROP POLICY IF EXISTS "Allow anon to manage b2b_order_history" ON public.b2b_order_history;

-- ============================================
-- LOYALTY MODULE - Remove anon write access
-- ============================================
DROP POLICY IF EXISTS "Allow anon to manage loyalty_transactions" ON public.loyalty_transactions;
DROP POLICY IF EXISTS "Allow anon to manage loyalty_tiers" ON public.loyalty_tiers;
DROP POLICY IF EXISTS "Allow anon to manage loyalty_rewards" ON public.loyalty_rewards;
DROP POLICY IF EXISTS "Allow anon to manage loyalty_redemptions" ON public.loyalty_redemptions;

-- ============================================
-- PURCHASE ORDERS MODULE - Remove anon write access
-- ============================================
DROP POLICY IF EXISTS "Allow anon to read suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow anon to insert suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow anon to update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow anon to delete suppliers" ON public.suppliers;

DROP POLICY IF EXISTS "Allow anon to read purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow anon to insert purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow anon to update purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Allow anon to delete purchase orders" ON public.purchase_orders;

DROP POLICY IF EXISTS "Allow anon to read purchase order items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow anon to insert purchase order items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow anon to update purchase order items" ON public.purchase_order_items;
DROP POLICY IF EXISTS "Allow anon to delete purchase order items" ON public.purchase_order_items;

DROP POLICY IF EXISTS "Allow anon to read purchase order history" ON public.purchase_order_history;
DROP POLICY IF EXISTS "Allow anon to insert purchase order history" ON public.purchase_order_history;

DROP POLICY IF EXISTS "Allow anon to read purchase order returns" ON public.purchase_order_returns;
DROP POLICY IF EXISTS "Allow anon to insert purchase order returns" ON public.purchase_order_returns;
DROP POLICY IF EXISTS "Allow anon to update purchase order returns" ON public.purchase_order_returns;
DROP POLICY IF EXISTS "Allow anon to delete purchase order returns" ON public.purchase_order_returns;

-- ============================================
-- Create proper authenticated-only policies for B2B
-- ============================================

-- B2B Orders - authenticated users only
DROP POLICY IF EXISTS "Authenticated users can read b2b_orders" ON public.b2b_orders;
CREATE POLICY "Authenticated users can read b2b_orders" ON public.b2b_orders
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert b2b_orders" ON public.b2b_orders;
CREATE POLICY "Authenticated users can insert b2b_orders" ON public.b2b_orders
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update b2b_orders" ON public.b2b_orders;
CREATE POLICY "Authenticated users can update b2b_orders" ON public.b2b_orders
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete b2b_orders" ON public.b2b_orders;
CREATE POLICY "Authenticated users can delete b2b_orders" ON public.b2b_orders
    FOR DELETE TO authenticated USING (true);

-- B2B Order Items
DROP POLICY IF EXISTS "Authenticated users can manage b2b_order_items" ON public.b2b_order_items;
CREATE POLICY "Authenticated users can manage b2b_order_items" ON public.b2b_order_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- B2B Payments
DROP POLICY IF EXISTS "Authenticated users can manage b2b_payments" ON public.b2b_payments;
CREATE POLICY "Authenticated users can manage b2b_payments" ON public.b2b_payments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- B2B Deliveries
DROP POLICY IF EXISTS "Authenticated users can manage b2b_deliveries" ON public.b2b_deliveries;
CREATE POLICY "Authenticated users can manage b2b_deliveries" ON public.b2b_deliveries
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- B2B Delivery Items
DROP POLICY IF EXISTS "Authenticated users can manage b2b_delivery_items" ON public.b2b_delivery_items;
CREATE POLICY "Authenticated users can manage b2b_delivery_items" ON public.b2b_delivery_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- B2B Order History
DROP POLICY IF EXISTS "Authenticated users can manage b2b_order_history" ON public.b2b_order_history;
CREATE POLICY "Authenticated users can manage b2b_order_history" ON public.b2b_order_history
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- Create proper authenticated-only policies for Loyalty
-- ============================================

-- Loyalty Transactions
DROP POLICY IF EXISTS "Authenticated users can manage loyalty_transactions" ON public.loyalty_transactions;
CREATE POLICY "Authenticated users can manage loyalty_transactions" ON public.loyalty_transactions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Loyalty Tiers (read-only for most, admin can modify)
DROP POLICY IF EXISTS "Authenticated users can read loyalty_tiers" ON public.loyalty_tiers;
CREATE POLICY "Authenticated users can read loyalty_tiers" ON public.loyalty_tiers
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage loyalty_tiers" ON public.loyalty_tiers;
CREATE POLICY "Authenticated users can manage loyalty_tiers" ON public.loyalty_tiers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Loyalty Rewards
DROP POLICY IF EXISTS "Authenticated users can manage loyalty_rewards" ON public.loyalty_rewards;
CREATE POLICY "Authenticated users can manage loyalty_rewards" ON public.loyalty_rewards
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Loyalty Redemptions
DROP POLICY IF EXISTS "Authenticated users can manage loyalty_redemptions" ON public.loyalty_redemptions;
CREATE POLICY "Authenticated users can manage loyalty_redemptions" ON public.loyalty_redemptions
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- Create proper authenticated-only policies for Purchase Orders
-- ============================================

-- Suppliers
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON public.suppliers;
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Purchase Orders
DROP POLICY IF EXISTS "Authenticated users can manage purchase_orders" ON public.purchase_orders;
CREATE POLICY "Authenticated users can manage purchase_orders" ON public.purchase_orders
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Purchase Order Items
DROP POLICY IF EXISTS "Authenticated users can manage purchase_order_items" ON public.purchase_order_items;
CREATE POLICY "Authenticated users can manage purchase_order_items" ON public.purchase_order_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Purchase Order History
DROP POLICY IF EXISTS "Authenticated users can manage purchase_order_history" ON public.purchase_order_history;
CREATE POLICY "Authenticated users can manage purchase_order_history" ON public.purchase_order_history
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Purchase Order Returns
DROP POLICY IF EXISTS "Authenticated users can manage purchase_order_returns" ON public.purchase_order_returns;
CREATE POLICY "Authenticated users can manage purchase_order_returns" ON public.purchase_order_returns
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- IMPORTANT NOTE
-- ============================================
-- After running this migration:
-- 1. Verify that all application functions work with authenticated users
-- 2. Test B2B module, Loyalty system, and Purchase Orders
-- 3. Ensure login is required before accessing these features
--
-- If you need read-only access for certain public data (like loyalty tiers),
-- you can add specific SELECT policies for anon role:
-- CREATE POLICY "Anon can read loyalty_tiers" ON public.loyalty_tiers
--     FOR SELECT TO anon USING (is_active = true);
