-- ============================================
-- Fix: Stock Deduction on Direct Insert
-- ============================================
-- The existing tr_deduct_stock_on_sale trigger only fires on UPDATE
-- when status changes to 'completed'. However, when orders are synced
-- from offline, they may be inserted directly with status='completed'.
--
-- This additional trigger handles INSERT with completed status.
-- ============================================

-- Drop if exists (for idempotency)
DROP TRIGGER IF EXISTS tr_deduct_stock_on_sale_insert ON orders;

-- Create INSERT trigger
CREATE TRIGGER tr_deduct_stock_on_sale_insert
AFTER INSERT ON orders
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION deduct_stock_on_sale_items();

COMMENT ON TRIGGER tr_deduct_stock_on_sale_insert ON orders IS 'Triggers stock deduction when order is inserted with completed status (offline sync scenario).';
