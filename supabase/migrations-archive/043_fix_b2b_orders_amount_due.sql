-- Migration: Fix B2B Orders - Add all missing columns
-- This adds missing columns to b2b_orders table
-- Date: 2026-01-20

-- Add all missing columns to b2b_orders
DO $$
BEGIN
    -- Add total_amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN total_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added total_amount column';
    END IF;

    -- Add subtotal if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN subtotal NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added subtotal column';
    END IF;

    -- Add discount_type if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'discount_type'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', NULL));
        RAISE NOTICE 'Added discount_type column';
    END IF;

    -- Add discount_value if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'discount_value'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN discount_value NUMERIC(10,2) DEFAULT 0;
        RAISE NOTICE 'Added discount_value column';
    END IF;

    -- Add discount_amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added discount_amount column';
    END IF;

    -- Add tax_rate if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'tax_rate'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN tax_rate NUMERIC(5,2) NOT NULL DEFAULT 10;
        RAISE NOTICE 'Added tax_rate column';
    END IF;

    -- Add tax_amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added tax_amount column';
    END IF;

    -- Add payment_status if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue'));
        RAISE NOTICE 'Added payment_status column';
    END IF;

    -- Add payment_terms if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'payment_terms'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN payment_terms TEXT CHECK (payment_terms IN ('cod', 'net15', 'net30', 'net60', NULL));
        RAISE NOTICE 'Added payment_terms column';
    END IF;

    -- Add due_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'due_date'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN due_date DATE;
        RAISE NOTICE 'Added due_date column';
    END IF;

    -- Add amount_paid if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'amount_paid'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added amount_paid column';
    END IF;

    -- Add amount_due if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'amount_due'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN amount_due NUMERIC(12,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added amount_due column';
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column';
    END IF;

    -- Add internal_notes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'internal_notes'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN internal_notes TEXT;
        RAISE NOTICE 'Added internal_notes column';
    END IF;

    -- Add delivery_address if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'delivery_address'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN delivery_address TEXT;
        RAISE NOTICE 'Added delivery_address column';
    END IF;

    -- Add delivery_notes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'delivery_notes'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN delivery_notes TEXT;
        RAISE NOTICE 'Added delivery_notes column';
    END IF;

    -- Add requested_delivery_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'b2b_orders' AND column_name = 'requested_delivery_date'
    ) THEN
        ALTER TABLE public.b2b_orders ADD COLUMN requested_delivery_date TIMESTAMPTZ;
        RAISE NOTICE 'Added requested_delivery_date column';
    END IF;
END $$;

-- Update existing rows to calculate amount_due
UPDATE public.b2b_orders
SET amount_due = COALESCE(total_amount, 0) - COALESCE(amount_paid, 0)
WHERE amount_due = 0 AND total_amount > 0;

-- Ensure RLS policies for public access (development mode)
DROP POLICY IF EXISTS "Allow public to select b2b_orders" ON public.b2b_orders;
DROP POLICY IF EXISTS "Allow public to insert b2b_orders" ON public.b2b_orders;
DROP POLICY IF EXISTS "Allow public to update b2b_orders" ON public.b2b_orders;
DROP POLICY IF EXISTS "Allow public to delete b2b_orders" ON public.b2b_orders;

CREATE POLICY "Allow public to select b2b_orders"
    ON public.b2b_orders FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public to insert b2b_orders"
    ON public.b2b_orders FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Allow public to update b2b_orders"
    ON public.b2b_orders FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public to delete b2b_orders"
    ON public.b2b_orders FOR DELETE
    TO public
    USING (true);

-- Same for b2b_order_items
DROP POLICY IF EXISTS "Allow public to select b2b_order_items" ON public.b2b_order_items;
DROP POLICY IF EXISTS "Allow public to insert b2b_order_items" ON public.b2b_order_items;
DROP POLICY IF EXISTS "Allow public to update b2b_order_items" ON public.b2b_order_items;
DROP POLICY IF EXISTS "Allow public to delete b2b_order_items" ON public.b2b_order_items;

CREATE POLICY "Allow public to select b2b_order_items"
    ON public.b2b_order_items FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public to insert b2b_order_items"
    ON public.b2b_order_items FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Allow public to update b2b_order_items"
    ON public.b2b_order_items FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public to delete b2b_order_items"
    ON public.b2b_order_items FOR DELETE
    TO public
    USING (true);

-- Grant permissions (only for tables that exist)
GRANT ALL ON public.b2b_orders TO public;
GRANT ALL ON public.b2b_order_items TO public;

-- Create b2b_payments if it doesn't exist
CREATE TABLE IF NOT EXISTS public.b2b_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number TEXT,
    order_id UUID NOT NULL REFERENCES public.b2b_orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'check', 'card', 'qris', 'credit')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    reference_number TEXT,
    bank_name TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    notes TEXT,
    received_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create b2b_deliveries if it doesn't exist
CREATE TABLE IF NOT EXISTS public.b2b_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_number TEXT,
    order_id UUID NOT NULL REFERENCES public.b2b_orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'partial', 'failed', 'returned')),
    scheduled_date TIMESTAMPTZ,
    actual_date TIMESTAMPTZ,
    delivery_address TEXT,
    driver_name TEXT,
    vehicle_info TEXT,
    received_by TEXT,
    signature_url TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create b2b_delivery_items if it doesn't exist
CREATE TABLE IF NOT EXISTS public.b2b_delivery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES public.b2b_deliveries(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.b2b_order_items(id) ON DELETE CASCADE,
    quantity_delivered NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create b2b_order_history if it doesn't exist
CREATE TABLE IF NOT EXISTS public.b2b_order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.b2b_orders(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    description TEXT NOT NULL,
    metadata JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.b2b_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_order_history ENABLE ROW LEVEL SECURITY;

-- Create public policies for these tables
DROP POLICY IF EXISTS "Allow public b2b_payments" ON public.b2b_payments;
CREATE POLICY "Allow public b2b_payments" ON public.b2b_payments FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public b2b_deliveries" ON public.b2b_deliveries;
CREATE POLICY "Allow public b2b_deliveries" ON public.b2b_deliveries FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public b2b_delivery_items" ON public.b2b_delivery_items;
CREATE POLICY "Allow public b2b_delivery_items" ON public.b2b_delivery_items FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public b2b_order_history" ON public.b2b_order_history;
CREATE POLICY "Allow public b2b_order_history" ON public.b2b_order_history FOR ALL TO public USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.b2b_payments TO public;
GRANT ALL ON public.b2b_deliveries TO public;
GRANT ALL ON public.b2b_delivery_items TO public;
GRANT ALL ON public.b2b_order_history TO public;

-- Verify setup
SELECT 'Migration complete' as status;
