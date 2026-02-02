-- Migration: Add EDC to payment_method enum
-- Description: Add 'edc' (Electronic Data Capture / card terminal) as a valid payment method
-- Date: 2026-01-29

-- Add 'edc' to the payment_method enum
-- EDC is commonly used in Indonesia for card terminal payments
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'edc';

-- Add comment for documentation
COMMENT ON TYPE payment_method IS 'Payment methods: cash, card, qris, split, transfer, edc (Electronic Data Capture)';
