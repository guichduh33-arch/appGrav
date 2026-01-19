-- Migration: B2B Sales Module
-- Description: Complete B2B sales system with orders, payments, deliveries, and tracking
-- Date: 2026-01-19

-- =============================================
-- B2B ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.b2b_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'processing', 'ready', 'partially_delivered', 'delivered', 'cancelled')),
    order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    requested_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    delivery_address TEXT,
    delivery_notes TEXT,

    -- Financials
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', NULL)),
    discount_value NUMERIC(10,2) DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 10,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Payment tracking
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue')),
    payment_terms TEXT CHECK (payment_terms IN ('cod', 'net15', 'net30', 'net60', NULL)),
    due_date DATE,
    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_due NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Meta
    notes TEXT,
    internal_notes TEXT,
    created_by UUID,
    assigned_to UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT b2b_orders_order_number_unique UNIQUE (order_number),
    CONSTRAINT b2b_orders_subtotal_check CHECK (subtotal >= 0),
    CONSTRAINT b2b_orders_total_check CHECK (total_amount >= 0)
);

-- =============================================
-- B2B ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.b2b_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.b2b_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    description TEXT,
    quantity NUMERIC(10,2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'pcs',
    unit_price NUMERIC(10,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    line_total NUMERIC(12,2) NOT NULL,

    -- Delivery tracking per item
    quantity_delivered NUMERIC(10,2) NOT NULL DEFAULT 0,
    quantity_remaining NUMERIC(10,2) GENERATED ALWAYS AS (quantity - quantity_delivered) STORED,

    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT b2b_order_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT b2b_order_items_unit_price_check CHECK (unit_price >= 0),
    CONSTRAINT b2b_order_items_quantity_delivered_check CHECK (quantity_delivered >= 0 AND quantity_delivered <= quantity)
);

-- =============================================
-- B2B PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.b2b_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number TEXT NOT NULL,
    order_id UUID NOT NULL REFERENCES public.b2b_orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,

    amount NUMERIC(12,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'check', 'card', 'qris', 'credit')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- For transfers/checks
    reference_number TEXT,
    bank_name TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

    notes TEXT,
    received_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT b2b_payments_payment_number_unique UNIQUE (payment_number),
    CONSTRAINT b2b_payments_amount_check CHECK (amount > 0)
);

-- =============================================
-- B2B DELIVERIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.b2b_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_number TEXT NOT NULL,
    order_id UUID NOT NULL REFERENCES public.b2b_orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,

    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'partial', 'failed', 'returned')),
    scheduled_date TIMESTAMPTZ,
    actual_date TIMESTAMPTZ,

    -- Delivery details
    delivery_address TEXT,
    driver_name TEXT,
    vehicle_info TEXT,

    -- Recipient
    received_by TEXT,
    signature_url TEXT,

    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT b2b_deliveries_delivery_number_unique UNIQUE (delivery_number)
);

-- =============================================
-- B2B DELIVERY ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.b2b_delivery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES public.b2b_deliveries(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES public.b2b_order_items(id) ON DELETE CASCADE,
    quantity_delivered NUMERIC(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT b2b_delivery_items_quantity_check CHECK (quantity_delivered > 0)
);

-- =============================================
-- B2B ORDER HISTORY / ACTIVITY LOG
-- =============================================
CREATE TABLE IF NOT EXISTS public.b2b_order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.b2b_orders(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'created', 'confirmed', 'processing', 'ready',
        'delivery_scheduled', 'delivery_partial', 'delivered',
        'payment_received', 'payment_partial',
        'modified', 'cancelled', 'note_added'
    )),
    previous_status TEXT,
    new_status TEXT,
    description TEXT NOT NULL,
    metadata JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_b2b_orders_customer_id ON public.b2b_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_status ON public.b2b_orders(status);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_payment_status ON public.b2b_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_order_date ON public.b2b_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_due_date ON public.b2b_orders(due_date);
CREATE INDEX IF NOT EXISTS idx_b2b_orders_order_number ON public.b2b_orders(order_number);

CREATE INDEX IF NOT EXISTS idx_b2b_order_items_order_id ON public.b2b_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_b2b_order_items_product_id ON public.b2b_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_b2b_payments_order_id ON public.b2b_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_b2b_payments_customer_id ON public.b2b_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_b2b_payments_payment_date ON public.b2b_payments(payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_b2b_deliveries_order_id ON public.b2b_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_b2b_deliveries_customer_id ON public.b2b_deliveries(customer_id);
CREATE INDEX IF NOT EXISTS idx_b2b_deliveries_status ON public.b2b_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_b2b_deliveries_scheduled_date ON public.b2b_deliveries(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_b2b_order_history_order_id ON public.b2b_order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_b2b_order_history_created_at ON public.b2b_order_history(created_at DESC);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_b2b_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_b2b_orders_updated_at
    BEFORE UPDATE ON public.b2b_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_orders_updated_at();

CREATE OR REPLACE FUNCTION update_b2b_order_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_b2b_order_items_updated_at
    BEFORE UPDATE ON public.b2b_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_order_items_updated_at();

CREATE OR REPLACE FUNCTION update_b2b_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_b2b_payments_updated_at
    BEFORE UPDATE ON public.b2b_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_payments_updated_at();

CREATE OR REPLACE FUNCTION update_b2b_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_b2b_deliveries_updated_at
    BEFORE UPDATE ON public.b2b_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_deliveries_updated_at();

-- =============================================
-- AUTO-GENERATE ORDER NUMBER
-- =============================================
CREATE OR REPLACE FUNCTION generate_b2b_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    sequence_num INT;
BEGIN
    year_month := to_char(NOW(), 'YYMM');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 'B2B-' || year_month || '-(\d+)') AS INT)
    ), 0) + 1
    INTO sequence_num
    FROM public.b2b_orders
    WHERE order_number LIKE 'B2B-' || year_month || '-%';

    NEW.order_number := 'B2B-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_b2b_order_number
    BEFORE INSERT ON public.b2b_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION generate_b2b_order_number();

-- =============================================
-- AUTO-GENERATE PAYMENT NUMBER
-- =============================================
CREATE OR REPLACE FUNCTION generate_b2b_payment_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    sequence_num INT;
BEGIN
    year_month := to_char(NOW(), 'YYMM');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(payment_number FROM 'PAY-' || year_month || '-(\d+)') AS INT)
    ), 0) + 1
    INTO sequence_num
    FROM public.b2b_payments
    WHERE payment_number LIKE 'PAY-' || year_month || '-%';

    NEW.payment_number := 'PAY-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_b2b_payment_number
    BEFORE INSERT ON public.b2b_payments
    FOR EACH ROW
    WHEN (NEW.payment_number IS NULL OR NEW.payment_number = '')
    EXECUTE FUNCTION generate_b2b_payment_number();

-- =============================================
-- AUTO-GENERATE DELIVERY NUMBER
-- =============================================
CREATE OR REPLACE FUNCTION generate_b2b_delivery_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    sequence_num INT;
BEGIN
    year_month := to_char(NOW(), 'YYMM');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(delivery_number FROM 'DEL-' || year_month || '-(\d+)') AS INT)
    ), 0) + 1
    INTO sequence_num
    FROM public.b2b_deliveries
    WHERE delivery_number LIKE 'DEL-' || year_month || '-%';

    NEW.delivery_number := 'DEL-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_b2b_delivery_number
    BEFORE INSERT ON public.b2b_deliveries
    FOR EACH ROW
    WHEN (NEW.delivery_number IS NULL OR NEW.delivery_number = '')
    EXECUTE FUNCTION generate_b2b_delivery_number();

-- =============================================
-- UPDATE ORDER TOTALS WHEN ITEMS CHANGE
-- =============================================
CREATE OR REPLACE FUNCTION update_b2b_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    order_uuid UUID;
    new_subtotal NUMERIC(12,2);
    order_discount_type TEXT;
    order_discount_value NUMERIC(10,2);
    new_discount_amount NUMERIC(12,2);
    order_tax_rate NUMERIC(5,2);
    new_tax_amount NUMERIC(12,2);
    new_total NUMERIC(12,2);
    paid_amount NUMERIC(12,2);
BEGIN
    order_uuid := COALESCE(NEW.order_id, OLD.order_id);

    -- Calculate subtotal from items
    SELECT COALESCE(SUM(line_total), 0)
    INTO new_subtotal
    FROM public.b2b_order_items
    WHERE order_id = order_uuid;

    -- Get order discount info
    SELECT discount_type, discount_value, tax_rate, amount_paid
    INTO order_discount_type, order_discount_value, order_tax_rate, paid_amount
    FROM public.b2b_orders
    WHERE id = order_uuid;

    -- Calculate discount
    IF order_discount_type = 'percentage' THEN
        new_discount_amount := new_subtotal * (COALESCE(order_discount_value, 0) / 100);
    ELSE
        new_discount_amount := COALESCE(order_discount_value, 0);
    END IF;

    -- Calculate tax and total
    new_tax_amount := (new_subtotal - new_discount_amount) * (COALESCE(order_tax_rate, 10) / 100);
    new_total := new_subtotal - new_discount_amount + new_tax_amount;

    -- Update order
    UPDATE public.b2b_orders
    SET
        subtotal = new_subtotal,
        discount_amount = new_discount_amount,
        tax_amount = new_tax_amount,
        total_amount = new_total,
        amount_due = new_total - COALESCE(paid_amount, 0)
    WHERE id = order_uuid;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_b2b_order_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.b2b_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_order_totals();

-- =============================================
-- UPDATE ORDER PAYMENT STATUS WHEN PAYMENT ADDED
-- =============================================
CREATE OR REPLACE FUNCTION update_b2b_order_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    order_uuid UUID;
    total_paid NUMERIC(12,2);
    order_total NUMERIC(12,2);
    new_payment_status TEXT;
BEGIN
    order_uuid := COALESCE(NEW.order_id, OLD.order_id);

    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0)
    INTO total_paid
    FROM public.b2b_payments
    WHERE order_id = order_uuid AND status = 'completed';

    -- Get order total
    SELECT total_amount
    INTO order_total
    FROM public.b2b_orders
    WHERE id = order_uuid;

    -- Determine payment status
    IF total_paid >= order_total THEN
        new_payment_status := 'paid';
    ELSIF total_paid > 0 THEN
        new_payment_status := 'partial';
    ELSE
        new_payment_status := 'unpaid';
    END IF;

    -- Update order
    UPDATE public.b2b_orders
    SET
        amount_paid = total_paid,
        amount_due = order_total - total_paid,
        payment_status = new_payment_status
    WHERE id = order_uuid;

    -- Log payment in history
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        INSERT INTO public.b2b_order_history (order_id, action_type, description, metadata, created_by)
        VALUES (
            order_uuid,
            CASE WHEN new_payment_status = 'paid' THEN 'payment_received' ELSE 'payment_partial' END,
            'Paiement reçu: ' || NEW.amount || ' IDR via ' || NEW.payment_method,
            jsonb_build_object('payment_id', NEW.id, 'amount', NEW.amount, 'method', NEW.payment_method),
            NEW.received_by
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_b2b_order_payment_status
    AFTER INSERT OR UPDATE OR DELETE ON public.b2b_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_order_payment_status();

-- =============================================
-- UPDATE ORDER ITEM DELIVERED QTY WHEN DELIVERY ADDED
-- =============================================
CREATE OR REPLACE FUNCTION update_b2b_delivery_quantities()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.b2b_order_items
        SET quantity_delivered = (
            SELECT COALESCE(SUM(di.quantity_delivered), 0)
            FROM public.b2b_delivery_items di
            JOIN public.b2b_deliveries d ON d.id = di.delivery_id
            WHERE di.order_item_id = NEW.order_item_id
            AND d.status IN ('delivered', 'partial')
        )
        WHERE id = NEW.order_item_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE public.b2b_order_items
        SET quantity_delivered = (
            SELECT COALESCE(SUM(di.quantity_delivered), 0)
            FROM public.b2b_delivery_items di
            JOIN public.b2b_deliveries d ON d.id = di.delivery_id
            WHERE di.order_item_id = OLD.order_item_id
            AND d.status IN ('delivered', 'partial')
        )
        WHERE id = OLD.order_item_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_b2b_delivery_quantities
    AFTER INSERT OR UPDATE OR DELETE ON public.b2b_delivery_items
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_delivery_quantities();

-- =============================================
-- LOG ORDER STATUS CHANGES
-- =============================================
CREATE OR REPLACE FUNCTION log_b2b_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.b2b_order_history (order_id, action_type, new_status, description, created_by)
        VALUES (NEW.id, 'created', NEW.status, 'Commande B2B créée', NEW.created_by);
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO public.b2b_order_history (order_id, action_type, previous_status, new_status, description)
        VALUES (
            NEW.id,
            NEW.status,
            OLD.status,
            NEW.status,
            'Statut modifié: ' || OLD.status || ' → ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_b2b_order_status_change
    AFTER INSERT OR UPDATE ON public.b2b_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_b2b_order_status_change();

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.b2b_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_order_history ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Allow authenticated to manage b2b_orders" ON public.b2b_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to manage b2b_order_items" ON public.b2b_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to manage b2b_payments" ON public.b2b_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to manage b2b_deliveries" ON public.b2b_deliveries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to manage b2b_delivery_items" ON public.b2b_delivery_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated to manage b2b_order_history" ON public.b2b_order_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for anon users (development)
CREATE POLICY "Allow anon to manage b2b_orders" ON public.b2b_orders FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to manage b2b_order_items" ON public.b2b_order_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to manage b2b_payments" ON public.b2b_payments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to manage b2b_deliveries" ON public.b2b_deliveries FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to manage b2b_delivery_items" ON public.b2b_delivery_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon to manage b2b_order_history" ON public.b2b_order_history FOR ALL TO anon USING (true) WITH CHECK (true);

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.b2b_orders IS 'B2B sales orders for wholesale customers';
COMMENT ON TABLE public.b2b_order_items IS 'Line items for B2B orders';
COMMENT ON TABLE public.b2b_payments IS 'Payment records for B2B orders';
COMMENT ON TABLE public.b2b_deliveries IS 'Delivery records for B2B orders';
COMMENT ON TABLE public.b2b_delivery_items IS 'Items included in each delivery';
COMMENT ON TABLE public.b2b_order_history IS 'Activity log and audit trail for B2B orders';
