-- =====================================================
-- DB-010: Add 'voided' to order_status enum
-- =====================================================
-- The voidService marks orders as voided but the enum didn't include this value.
-- This adds 'voided' to the order_status enum if not already present.
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'voided'
          AND enumtypid = 'order_status'::regtype
    ) THEN
        ALTER TYPE order_status ADD VALUE 'voided';
    END IF;
END$$;
