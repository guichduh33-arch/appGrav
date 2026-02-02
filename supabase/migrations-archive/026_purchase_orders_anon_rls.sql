-- Migration: Add anon RLS policies for purchase orders module
-- Description: Allow anonymous users to access purchase order tables (for development/demo)
-- Date: 2026-01-19
-- RLS Policies for suppliers (anon)
CREATE POLICY "Allow anon to read suppliers" ON public.suppliers FOR
SELECT TO anon USING (true);
CREATE POLICY "Allow anon to insert suppliers" ON public.suppliers FOR
INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon to update suppliers" ON public.suppliers FOR
UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to delete suppliers" ON public.suppliers FOR DELETE TO anon USING (true);
-- RLS Policies for purchase_orders (anon)
CREATE POLICY "Allow anon to read purchase orders" ON public.purchase_orders FOR
SELECT TO anon USING (true);
CREATE POLICY "Allow anon to insert purchase orders" ON public.purchase_orders FOR
INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon to update purchase orders" ON public.purchase_orders FOR
UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to delete purchase orders" ON public.purchase_orders FOR DELETE TO anon USING (true);
-- RLS Policies for purchase_order_items (anon)
CREATE POLICY "Allow anon to read purchase order items" ON public.purchase_order_items FOR
SELECT TO anon USING (true);
CREATE POLICY "Allow anon to insert purchase order items" ON public.purchase_order_items FOR
INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon to update purchase order items" ON public.purchase_order_items FOR
UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to delete purchase order items" ON public.purchase_order_items FOR DELETE TO anon USING (true);
-- RLS Policies for purchase_order_history (anon)
CREATE POLICY "Allow anon to read purchase order history" ON public.purchase_order_history FOR
SELECT TO anon USING (true);
CREATE POLICY "Allow anon to insert purchase order history" ON public.purchase_order_history FOR
INSERT TO anon WITH CHECK (true);
-- RLS Policies for purchase_order_returns (anon)
CREATE POLICY "Allow anon to read purchase order returns" ON public.purchase_order_returns FOR
SELECT TO anon USING (true);
CREATE POLICY "Allow anon to insert purchase order returns" ON public.purchase_order_returns FOR
INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon to update purchase order returns" ON public.purchase_order_returns FOR
UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to delete purchase order returns" ON public.purchase_order_returns FOR DELETE TO anon USING (true);