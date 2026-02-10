-- ============================================
-- Fix: Stock Deduction Trigger Conditions
-- ============================================
-- PROBLEM: The trigger fires when orders.status = 'completed', but the app
-- workflow is: new → preparing → ready → served. Orders NEVER reach 'completed'.
-- Payment is already confirmed at order creation (payment_status = 'paid').
--
-- FIX: Fire stock deduction when:
-- 1. INSERT: payment_status = 'paid' (POS creates orders as paid)
-- 2. UPDATE: payment_status changes TO 'paid' (for deferred payment scenarios)
-- 3. UPDATE: status changes TO 'completed' (backward compatibility)
-- ============================================

-- Drop old triggers
DROP TRIGGER IF EXISTS tr_deduct_stock_on_sale ON orders;
DROP TRIGGER IF EXISTS tr_deduct_stock_on_sale_insert ON orders;

-- Trigger 1: INSERT with payment confirmed
-- Covers: Normal POS flow where orders are inserted with payment_status='paid'
CREATE TRIGGER tr_deduct_stock_on_sale_insert
AFTER INSERT ON orders
FOR EACH ROW
WHEN (NEW.payment_status = 'paid')
EXECUTE FUNCTION deduct_stock_on_sale_items();

-- Trigger 2: UPDATE when payment status changes to paid
-- Covers: Deferred payment (e.g., dine-in pay later, B2B)
CREATE TRIGGER tr_deduct_stock_on_sale_payment
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (
    NEW.payment_status = 'paid'
    AND OLD.payment_status IS DISTINCT FROM 'paid'
)
EXECUTE FUNCTION deduct_stock_on_sale_items();

-- Trigger 3: UPDATE when status changes to completed (backward compat)
CREATE TRIGGER tr_deduct_stock_on_sale_completed
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (
    NEW.status = 'completed'
    AND OLD.status <> 'completed'
    AND OLD.payment_status IS DISTINCT FROM 'paid'  -- Avoid double-deduction
)
EXECUTE FUNCTION deduct_stock_on_sale_items();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TRIGGER tr_deduct_stock_on_sale_insert ON orders IS 'Deducts stock when a paid order is inserted (normal POS flow)';
COMMENT ON TRIGGER tr_deduct_stock_on_sale_payment ON orders IS 'Deducts stock when an existing order is marked as paid';
COMMENT ON TRIGGER tr_deduct_stock_on_sale_completed ON orders IS 'Deducts stock when order status changes to completed (backward compat)';
