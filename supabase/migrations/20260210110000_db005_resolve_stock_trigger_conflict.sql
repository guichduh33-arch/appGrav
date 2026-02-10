-- =====================================================
-- DB-005: Resolve stock trigger conflict
-- =====================================================
-- Problem: Two triggers both update products.current_stock:
--   1. tr_update_product_stock (AFTER INSERT on stock_movements) -> sets current_stock via movement calc
--   2. trg_sync_product_stock (AFTER INSERT/UPDATE/DELETE on section_stock) -> sets current_stock = SUM(section_stock.quantity)
--
-- Solution: Keep sync_product_total_stock() as the single source of truth (section_stock is more granular).
-- Disable the update_product_stock trigger on stock_movements.
-- Keep the function definition in case it's needed for rollback.
-- =====================================================

-- Drop the conflicting trigger (idempotent)
DROP TRIGGER IF EXISTS tr_update_product_stock ON public.stock_movements;

-- Also drop the old name variant if it exists
DROP TRIGGER IF EXISTS trigger_update_product_stock ON public.stock_movements;

-- Add a comment to the function explaining it's no longer triggered
COMMENT ON FUNCTION update_product_stock() IS 'DEPRECATED: Trigger disabled by DB-005. Use sync_product_total_stock() via section_stock instead. Function kept for potential rollback.';
