-- ============================================================================
-- Migration: Create trigger to auto-generate purchase journal entries
-- Description: Attaches create_purchase_journal_entry function to purchase_orders
-- Author: Claude Code
-- Date: 2026-02-16
-- ============================================================================

-- =============================================================================
-- UP MIGRATION
-- =============================================================================

-- Drop existing trigger if any (idempotent)
DROP TRIGGER IF EXISTS trg_create_purchase_journal_entry ON public.purchase_orders;

-- Create trigger that fires AFTER UPDATE on purchase_orders
-- When status changes to 'received'
CREATE TRIGGER trg_create_purchase_journal_entry
  AFTER UPDATE OF status ON public.purchase_orders
  FOR EACH ROW
  WHEN (NEW.status = 'received' AND OLD.status IS DISTINCT FROM 'received')
  EXECUTE FUNCTION public.create_purchase_journal_entry();

-- Add comment for documentation
COMMENT ON TRIGGER trg_create_purchase_journal_entry ON public.purchase_orders IS
'Auto-creates double-entry journal entries when a purchase order status changes to received.
Created by migration 20260216100500.';

-- =============================================================================
-- DOWN MIGRATION (Rollback)
-- =============================================================================
-- To rollback, run:
--
-- DROP TRIGGER IF EXISTS trg_create_purchase_journal_entry ON public.purchase_orders;
--
-- =============================================================================

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- Run after migration to verify:
--
-- SELECT tgname, tgrelid::regclass, tgenabled
-- FROM pg_trigger
-- WHERE tgname = 'trg_create_purchase_journal_entry';
--
-- Expected: trigger exists on public.purchase_orders
-- =============================================================================
