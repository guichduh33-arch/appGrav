-- Migration: Fix B2B Orders status column
-- Convert ENUM type to TEXT with CHECK constraint
-- Date: 2026-01-20

-- First, check if there's an ENUM type and convert the column to TEXT
DO $$
DECLARE
    col_type TEXT;
BEGIN
    -- Get the current data type of status column
    SELECT data_type INTO col_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'b2b_orders'
    AND column_name = 'status';

    IF col_type IS NOT NULL AND col_type != 'text' THEN
        -- Column exists but is not TEXT (probably ENUM)
        -- Convert to TEXT
        ALTER TABLE public.b2b_orders
        ALTER COLUMN status TYPE TEXT USING status::TEXT;
        RAISE NOTICE 'Converted status column from % to TEXT', col_type;
    ELSIF col_type IS NULL THEN
        -- Column doesn't exist, add it
        ALTER TABLE public.b2b_orders ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
        RAISE NOTICE 'Added status column as TEXT';
    END IF;
END $$;

-- Drop any existing CHECK constraint on status column
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
        AND rel.relname = 'b2b_orders'
        AND con.contype = 'c'
        AND pg_get_constraintdef(con.oid) LIKE '%status%'
    LOOP
        EXECUTE format('ALTER TABLE public.b2b_orders DROP CONSTRAINT IF EXISTS %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- Update any NULL status values to 'draft'
UPDATE public.b2b_orders SET status = 'draft' WHERE status IS NULL;

-- Set default value
ALTER TABLE public.b2b_orders ALTER COLUMN status SET DEFAULT 'draft';

-- Add the correct CHECK constraint
ALTER TABLE public.b2b_orders
DROP CONSTRAINT IF EXISTS b2b_orders_status_check;

ALTER TABLE public.b2b_orders
ADD CONSTRAINT b2b_orders_status_check
CHECK (status IN ('draft', 'confirmed', 'processing', 'ready', 'partially_delivered', 'delivered', 'cancelled'));

-- Also ensure order_number column exists and has auto-generation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'order_number'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN order_number TEXT;
        RAISE NOTICE 'Added order_number column';
    END IF;
END $$;

-- Create order number generator function if not exists
CREATE OR REPLACE FUNCTION generate_b2b_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    sequence_num INT;
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        year_month := to_char(NOW(), 'YYMM');

        SELECT COALESCE(MAX(
            CASE
                WHEN order_number ~ ('^B2B-' || year_month || '-\d+$')
                THEN CAST(SUBSTRING(order_number FROM 'B2B-' || year_month || '-(\d+)') AS INT)
                ELSE 0
            END
        ), 0) + 1
        INTO sequence_num
        FROM public.b2b_orders
        WHERE order_number LIKE 'B2B-' || year_month || '-%';

        NEW.order_number := 'B2B-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating order number
DROP TRIGGER IF EXISTS trigger_generate_b2b_order_number ON public.b2b_orders;
CREATE TRIGGER trigger_generate_b2b_order_number
    BEFORE INSERT ON public.b2b_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_b2b_order_number();

-- Verify
SELECT 'B2B orders status fix complete' as status;
