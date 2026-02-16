-- ============================================================================
-- Migration: Create trigger to auto-generate sale journal entries
-- Description: Attaches create_sale_journal_entry function to orders table
-- Author: Claude Code
-- Date: 2026-02-16
-- ============================================================================

-- =============================================================================
-- UP MIGRATION
-- =============================================================================

-- Drop existing trigger if any (idempotent)
DROP TRIGGER IF EXISTS trg_create_sale_journal_entry ON public.orders;

-- Create trigger that fires AFTER UPDATE on orders
-- When status changes to 'completed' or 'voided'
CREATE TRIGGER trg_create_sale_journal_entry
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (
    (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed')
    OR
    (NEW.status = 'voided' AND OLD.status IS DISTINCT FROM 'voided')
  )
  EXECUTE FUNCTION public.create_sale_journal_entry();

-- Add comment for documentation
COMMENT ON TRIGGER trg_create_sale_journal_entry ON public.orders IS
'Auto-creates double-entry journal entries when an order status changes to completed or voided.
Created by migration 20260216100300.';

-- =============================================================================
-- DOWN MIGRATION (Rollback)
-- =============================================================================
-- To rollback, run:
--
-- DROP TRIGGER IF EXISTS trg_create_sale_journal_entry ON public.orders;
--
-- =============================================================================

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- Run after migration to verify:
--
-- SELECT tgname, tgrelid::regclass, tgenabled
-- FROM pg_trigger
-- WHERE tgname = 'trg_create_sale_journal_entry';
--
-- Expected: trigger exists on public.orders
-- =============================================================================
