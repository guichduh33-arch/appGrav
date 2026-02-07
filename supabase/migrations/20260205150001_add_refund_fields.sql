-- Migration: Add refund tracking fields to orders table
-- Created: 2026-02-05
-- ADR: ADR-001-payment-system-refactor.md

-- Add refund tracking fields to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_method payment_method;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_by UUID REFERENCES auth.users(id);

-- Add 'voided' to order_status enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'voided'
        AND enumtypid = 'order_status'::regtype
    ) THEN
        ALTER TYPE order_status ADD VALUE 'voided' AFTER 'cancelled';
    END IF;
END$$;

-- Index for refund queries (partial index for efficiency)
CREATE INDEX IF NOT EXISTS idx_orders_refunded
    ON public.orders(refunded_at)
    WHERE refund_amount IS NOT NULL;

-- Index for voided orders (deferred - new enum value needs commit first)
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_orders_voided
        ON public.orders(status)
        WHERE status = 'voided';
EXCEPTION WHEN others THEN NULL;
END $$;

-- Comments for documentation
COMMENT ON COLUMN public.orders.refund_amount IS 'Amount refunded (partial or full)';
COMMENT ON COLUMN public.orders.refund_reason IS 'Reason for refund (free text or from reason code)';
COMMENT ON COLUMN public.orders.refund_method IS 'Payment method used for refund';
COMMENT ON COLUMN public.orders.refunded_at IS 'Timestamp when refund was processed';
COMMENT ON COLUMN public.orders.refunded_by IS 'User who processed the refund';
