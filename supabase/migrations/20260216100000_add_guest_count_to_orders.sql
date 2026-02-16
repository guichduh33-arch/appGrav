-- ============================================================================
-- Migration: Add guest_count column to orders table
-- Description: Track number of guests per order for per-head revenue analytics
-- Author: Claude Code
-- Date: 2026-02-16
-- ============================================================================

-- =============================================================================
-- UP MIGRATION
-- =============================================================================

-- Add guest_count column with safe DEFAULT
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1;

-- Add constraint to ensure positive guest count
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_orders_guest_count_positive'
    ) THEN
        ALTER TABLE public.orders
        ADD CONSTRAINT chk_orders_guest_count_positive
        CHECK (guest_count >= 1);
    END IF;
END $$;

-- Add index for reporting queries (orders with multiple guests)
CREATE INDEX IF NOT EXISTS idx_orders_guest_count_multiple
ON public.orders(guest_count)
WHERE guest_count > 1;

-- Add documentation
COMMENT ON COLUMN public.orders.guest_count IS
'Number of guests for the order. Used for per-head revenue calculations. Minimum 1.';

-- =============================================================================
-- DOWN MIGRATION (Rollback)
-- =============================================================================
-- To rollback, run:
--
-- DROP INDEX IF EXISTS idx_orders_guest_count_multiple;
-- ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_orders_guest_count_positive;
-- ALTER TABLE public.orders DROP COLUMN IF EXISTS guest_count;
--
-- =============================================================================

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- Run after migration to verify:
--
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'orders' AND column_name = 'guest_count';
--
-- Expected: guest_count | integer | 1
-- =============================================================================
