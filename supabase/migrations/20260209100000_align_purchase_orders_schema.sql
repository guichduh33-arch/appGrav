-- Migration: Align purchase_orders and purchase_order_items schema with application code
-- The application expects columns that don't exist yet in the database.
-- This migration adds missing columns and renames existing ones to match.

-- ============================================================================
-- PART 1: purchase_orders - Rename columns
-- ============================================================================

-- Rename expected_date → expected_delivery_date
ALTER TABLE public.purchase_orders
  RENAME COLUMN expected_date TO expected_delivery_date;

-- Rename received_date → actual_delivery_date
ALTER TABLE public.purchase_orders
  RENAME COLUMN received_date TO actual_delivery_date;

-- Rename total → total_amount
ALTER TABLE public.purchase_orders
  RENAME COLUMN total TO total_amount;

-- ============================================================================
-- PART 2: purchase_orders - Add missing columns
-- ============================================================================

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15,2) DEFAULT 0;

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT NULL;

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid';

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS payment_date DATE DEFAULT NULL;

-- Add CHECK constraint for payment_status
ALTER TABLE public.purchase_orders
  ADD CONSTRAINT chk_po_payment_status
  CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid'));

-- ============================================================================
-- PART 3: purchase_order_items - Rename columns
-- ============================================================================

-- Rename total → line_total
ALTER TABLE public.purchase_order_items
  RENAME COLUMN total TO line_total;

-- ============================================================================
-- PART 4: purchase_order_items - Add missing columns
-- ============================================================================

ALTER TABLE public.purchase_order_items
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

ALTER TABLE public.purchase_order_items
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;

ALTER TABLE public.purchase_order_items
  ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT NULL;

ALTER TABLE public.purchase_order_items
  ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 10;

-- ============================================================================
-- PART 5: Update trigger functions that reference old column names
-- These functions were created for the old po_items view mapping.
-- Since po_items no longer exists (replaced by purchase_order_items table),
-- drop the obsolete trigger functions.
-- ============================================================================

DROP FUNCTION IF EXISTS public.purchase_order_items_insert_fn() CASCADE;
DROP FUNCTION IF EXISTS public.purchase_order_items_update_fn() CASCADE;
DROP FUNCTION IF EXISTS public.purchase_order_items_delete_fn() CASCADE;

-- Also drop the old view-era functions if they still exist
DROP FUNCTION IF EXISTS public.purchase_order_items_insert() CASCADE;
DROP FUNCTION IF EXISTS public.purchase_order_items_update() CASCADE;
DROP FUNCTION IF EXISTS public.purchase_order_items_delete() CASCADE;

-- ============================================================================
-- PART 6: Add indexes for new filterable columns
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_po_payment_status ON public.purchase_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_po_expected_delivery ON public.purchase_orders(expected_delivery_date);

-- ============================================================================
-- PART 7: Comments
-- ============================================================================

COMMENT ON COLUMN public.purchase_orders.discount_amount IS 'Global discount amount applied to the PO';
COMMENT ON COLUMN public.purchase_orders.discount_percentage IS 'Global discount percentage applied to the PO';
COMMENT ON COLUMN public.purchase_orders.payment_status IS 'Payment status: unpaid, partially_paid, paid';
COMMENT ON COLUMN public.purchase_orders.payment_date IS 'Date when payment was made';
COMMENT ON COLUMN public.purchase_orders.expected_delivery_date IS 'Expected delivery date from supplier';
COMMENT ON COLUMN public.purchase_orders.actual_delivery_date IS 'Actual delivery/reception date';
COMMENT ON COLUMN public.purchase_orders.total_amount IS 'Total order amount after discounts and tax';

COMMENT ON COLUMN public.purchase_order_items.line_total IS 'Line total for this item after discounts';
COMMENT ON COLUMN public.purchase_order_items.description IS 'Optional description/notes for this line item';
COMMENT ON COLUMN public.purchase_order_items.discount_amount IS 'Discount amount for this line item';
COMMENT ON COLUMN public.purchase_order_items.discount_percentage IS 'Discount percentage for this line item';
COMMENT ON COLUMN public.purchase_order_items.tax_rate IS 'Tax rate percentage for this line item (default 10%)';
