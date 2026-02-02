-- Migration: Fix B2B Order Items numeric precision
-- Increase numeric column precision to handle larger values
-- Date: 2026-01-20

-- First, drop the generated column that depends on quantity
ALTER TABLE public.b2b_order_items DROP COLUMN IF EXISTS quantity_remaining;

-- Fix b2b_order_items columns precision
DO $$
BEGIN
    -- Fix unit_price - increase precision
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_order_items' AND column_name = 'unit_price'
    ) THEN
        ALTER TABLE public.b2b_order_items ALTER COLUMN unit_price TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated unit_price precision';
    END IF;

    -- Fix line_total - increase precision
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_order_items' AND column_name = 'line_total'
    ) THEN
        ALTER TABLE public.b2b_order_items ALTER COLUMN line_total TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated line_total precision';
    END IF;

    -- Fix discount_amount - increase precision
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_order_items' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE public.b2b_order_items ALTER COLUMN discount_amount TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated discount_amount precision';
    END IF;

    -- Fix quantity - increase precision
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_order_items' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE public.b2b_order_items ALTER COLUMN quantity TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated quantity precision';
    END IF;

    -- Fix quantity_delivered - increase precision
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_order_items' AND column_name = 'quantity_delivered'
    ) THEN
        ALTER TABLE public.b2b_order_items ALTER COLUMN quantity_delivered TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated quantity_delivered precision';
    END IF;

    -- Fix discount_percentage - increase precision
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_order_items' AND column_name = 'discount_percentage'
    ) THEN
        ALTER TABLE public.b2b_order_items ALTER COLUMN discount_percentage TYPE NUMERIC(10,2);
        RAISE NOTICE 'Updated discount_percentage precision';
    END IF;
END $$;

-- Re-add the generated column with proper precision (only if quantity_delivered exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_order_items' AND column_name = 'quantity_delivered'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_order_items' AND column_name = 'quantity_remaining'
    ) THEN
        ALTER TABLE public.b2b_order_items
        ADD COLUMN quantity_remaining NUMERIC(15,2) GENERATED ALWAYS AS (quantity - quantity_delivered) STORED;
        RAISE NOTICE 'Added quantity_remaining generated column';
    END IF;
END $$;

-- Also fix b2b_orders columns if needed
DO $$
BEGIN
    -- Fix subtotal
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE public.b2b_orders ALTER COLUMN subtotal TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated b2b_orders.subtotal precision';
    END IF;

    -- Fix total_amount
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE public.b2b_orders ALTER COLUMN total_amount TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated b2b_orders.total_amount precision';
    END IF;

    -- Fix discount_amount
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE public.b2b_orders ALTER COLUMN discount_amount TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated b2b_orders.discount_amount precision';
    END IF;

    -- Fix tax_amount
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE public.b2b_orders ALTER COLUMN tax_amount TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated b2b_orders.tax_amount precision';
    END IF;

    -- Fix amount_paid
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'amount_paid'
    ) THEN
        ALTER TABLE public.b2b_orders ALTER COLUMN amount_paid TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated b2b_orders.amount_paid precision';
    END IF;

    -- Fix amount_due
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'amount_due'
    ) THEN
        ALTER TABLE public.b2b_orders ALTER COLUMN amount_due TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated b2b_orders.amount_due precision';
    END IF;

    -- Fix discount_value
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'discount_value'
    ) THEN
        ALTER TABLE public.b2b_orders ALTER COLUMN discount_value TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated b2b_orders.discount_value precision';
    END IF;
END $$;

-- Also fix b2b_payments amount column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_payments' AND column_name = 'amount'
    ) THEN
        ALTER TABLE public.b2b_payments ALTER COLUMN amount TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated b2b_payments.amount precision';
    END IF;
END $$;

-- Also fix b2b_delivery_items quantity_delivered column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_delivery_items' AND column_name = 'quantity_delivered'
    ) THEN
        ALTER TABLE public.b2b_delivery_items ALTER COLUMN quantity_delivered TYPE NUMERIC(15,2);
        RAISE NOTICE 'Updated b2b_delivery_items.quantity_delivered precision';
    END IF;
END $$;

-- Verify
SELECT 'Numeric precision fix complete' as status;
