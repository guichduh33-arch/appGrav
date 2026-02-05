-- Migration: Create order_payments table for split payment support
-- Created: 2026-02-05
-- ADR: ADR-001-payment-system-refactor.md

-- Order payments table stores individual payments for split payment support
CREATE TABLE IF NOT EXISTS public.order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    cash_received DECIMAL(12, 2),
    change_given DECIMAL(12, 2),
    reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed',
    is_offline BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Composite index for reconciliation queries (Winston recommendation)
CREATE INDEX idx_order_payments_order_status ON public.order_payments(order_id, status);

-- Index for date-based queries
CREATE INDEX idx_order_payments_created ON public.order_payments(created_at);

-- Index for sync status queries
CREATE INDEX idx_order_payments_sync ON public.order_payments(is_offline, synced_at)
    WHERE is_offline = true;

-- Enable Row Level Security
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can read order payments"
    ON public.order_payments
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert order payments"
    ON public.order_payments
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update order payments"
    ON public.order_payments
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Comment for documentation
COMMENT ON TABLE public.order_payments IS 'Individual payment records for orders, supporting split payments';
COMMENT ON COLUMN public.order_payments.status IS 'Payment status: completed, pending, failed, refunded';
COMMENT ON COLUMN public.order_payments.is_offline IS 'Whether payment was created while offline';
COMMENT ON COLUMN public.order_payments.synced_at IS 'Timestamp when offline payment was synced to server';
