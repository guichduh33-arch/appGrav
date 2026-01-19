-- Migration: Purchase Orders Module
-- Description: Complete purchase order system with suppliers, POs, history tracking, discounts, and returns
-- Date: 2026-01-18

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.purchase_order_returns CASCADE;
DROP TABLE IF EXISTS public.purchase_order_history CASCADE;
DROP TABLE IF EXISTS public.purchase_order_items CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;

-- Create suppliers table
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    tax_id TEXT,
    payment_terms TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT suppliers_name_unique UNIQUE (name),
    CONSTRAINT suppliers_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'confirmed', 'partially_received', 'received', 'cancelled', 'modified')),
    order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    expected_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_percentage NUMERIC(5,2),
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
    payment_date TIMESTAMPTZ,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT purchase_orders_po_number_unique UNIQUE (po_number),
    CONSTRAINT purchase_orders_subtotal_check CHECK (subtotal >= 0),
    CONSTRAINT purchase_orders_discount_check CHECK (discount_amount >= 0),
    CONSTRAINT purchase_orders_discount_percentage_check CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)),
    CONSTRAINT purchase_orders_total_check CHECK (total_amount >= 0)
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    description TEXT,
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_percentage NUMERIC(5,2),
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    line_total NUMERIC(10,2) NOT NULL,
    quantity_received NUMERIC(10,2) NOT NULL DEFAULT 0,
    quantity_returned NUMERIC(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT purchase_order_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT purchase_order_items_unit_price_check CHECK (unit_price >= 0),
    CONSTRAINT purchase_order_items_discount_check CHECK (discount_amount >= 0),
    CONSTRAINT purchase_order_items_discount_percentage_check CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)),
    CONSTRAINT purchase_order_items_quantity_received_check CHECK (quantity_received >= 0 AND quantity_received <= quantity),
    CONSTRAINT purchase_order_items_quantity_returned_check CHECK (quantity_returned >= 0 AND quantity_returned <= quantity_received)
);

-- Create purchase_order_history table
CREATE TABLE public.purchase_order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('created', 'modified', 'sent', 'confirmed', 'received', 'partially_received', 'cancelled', 'payment_made', 'item_returned')),
    previous_status TEXT,
    new_status TEXT,
    description TEXT NOT NULL,
    changed_by UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create purchase_order_returns table
CREATE TABLE public.purchase_order_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    purchase_order_item_id UUID NOT NULL REFERENCES public.purchase_order_items(id) ON DELETE CASCADE,
    quantity_returned NUMERIC(10,2) NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('damaged', 'wrong_item', 'quality_issue', 'excess_quantity', 'other')),
    reason_details TEXT,
    return_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    refund_amount NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT purchase_order_returns_quantity_check CHECK (quantity_returned > 0),
    CONSTRAINT purchase_order_returns_refund_check CHECK (refund_amount IS NULL OR refund_amount >= 0)
);

-- Add indexes for faster queries
CREATE INDEX idx_suppliers_is_active ON public.suppliers(is_active);
CREATE INDEX idx_suppliers_name ON public.suppliers(name);

CREATE INDEX idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_orders_po_number ON public.purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_order_date ON public.purchase_orders(order_date DESC);
CREATE INDEX idx_purchase_orders_payment_status ON public.purchase_orders(payment_status);

CREATE INDEX idx_purchase_order_items_po_id ON public.purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_product_id ON public.purchase_order_items(product_id);

CREATE INDEX idx_purchase_order_history_po_id ON public.purchase_order_history(purchase_order_id);
CREATE INDEX idx_purchase_order_history_action_type ON public.purchase_order_history(action_type);
CREATE INDEX idx_purchase_order_history_created_at ON public.purchase_order_history(created_at DESC);

CREATE INDEX idx_purchase_order_returns_po_id ON public.purchase_order_returns(purchase_order_id);
CREATE INDEX idx_purchase_order_returns_item_id ON public.purchase_order_returns(purchase_order_item_id);
CREATE INDEX idx_purchase_order_returns_status ON public.purchase_order_returns(status);

-- Add triggers to update updated_at
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_suppliers_updated_at();

CREATE OR REPLACE FUNCTION update_purchase_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_purchase_orders_updated_at();

CREATE OR REPLACE FUNCTION update_purchase_order_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_purchase_order_items_updated_at
    BEFORE UPDATE ON public.purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_purchase_order_items_updated_at();

CREATE OR REPLACE FUNCTION update_purchase_order_returns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_purchase_order_returns_updated_at
    BEFORE UPDATE ON public.purchase_order_returns
    FOR EACH ROW
    EXECUTE FUNCTION update_purchase_order_returns_updated_at();

-- Add trigger to log history on PO changes
CREATE OR REPLACE FUNCTION log_purchase_order_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.purchase_order_history (purchase_order_id, action_type, new_status, description)
        VALUES (NEW.id, 'created', NEW.status, 'Purchase order created');
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO public.purchase_order_history (purchase_order_id, action_type, previous_status, new_status, description)
        VALUES (NEW.id, LOWER(NEW.status), OLD.status, NEW.status, 'Status changed from ' || OLD.status || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_purchase_order_changes
    AFTER INSERT OR UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_purchase_order_changes();

-- Add trigger to update PO totals when items change
CREATE OR REPLACE FUNCTION update_purchase_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    po_subtotal NUMERIC(10,2);
    po_tax NUMERIC(10,2);
    po_total NUMERIC(10,2);
BEGIN
    -- Calculate totals from items
    SELECT
        COALESCE(SUM(line_total), 0),
        COALESCE(SUM(line_total * tax_rate / 100), 0)
    INTO po_subtotal, po_tax
    FROM public.purchase_order_items
    WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

    -- Update purchase order
    UPDATE public.purchase_orders
    SET
        subtotal = po_subtotal,
        tax_amount = po_tax,
        total_amount = po_subtotal - COALESCE(discount_amount, 0) + po_tax
    WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_purchase_order_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_purchase_order_totals();

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_returns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suppliers
CREATE POLICY "Allow authenticated users to read suppliers"
    ON public.suppliers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert suppliers"
    ON public.suppliers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update suppliers"
    ON public.suppliers
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete suppliers"
    ON public.suppliers
    FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for purchase_orders
CREATE POLICY "Allow authenticated users to read purchase orders"
    ON public.purchase_orders
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert purchase orders"
    ON public.purchase_orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update purchase orders"
    ON public.purchase_orders
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete purchase orders"
    ON public.purchase_orders
    FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for purchase_order_items
CREATE POLICY "Allow authenticated users to read purchase order items"
    ON public.purchase_order_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert purchase order items"
    ON public.purchase_order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update purchase order items"
    ON public.purchase_order_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete purchase order items"
    ON public.purchase_order_items
    FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for purchase_order_history
CREATE POLICY "Allow authenticated users to read purchase order history"
    ON public.purchase_order_history
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert purchase order history"
    ON public.purchase_order_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policies for purchase_order_returns
CREATE POLICY "Allow authenticated users to read purchase order returns"
    ON public.purchase_order_returns
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert purchase order returns"
    ON public.purchase_order_returns
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update purchase order returns"
    ON public.purchase_order_returns
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete purchase order returns"
    ON public.purchase_order_returns
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert sample suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address, city, postal_code, payment_terms) VALUES
    ('Metro Cash & Carry', 'Jean Dupont', 'contact@metro.fr', '+33 1 23 45 67 89', '123 Avenue des Champs', 'Paris', '75008', 'Net 30'),
    ('Sysco France', 'Marie Martin', 'info@sysco.fr', '+33 1 98 76 54 32', '456 Rue de la Paix', 'Lyon', '69001', 'Net 45'),
    ('Pomona Foodservice', 'Pierre Leclerc', 'service@pomona.fr', '+33 4 56 78 90 12', '789 Boulevard Haussmann', 'Marseille', '13001', 'Net 30');

-- Add comments
COMMENT ON TABLE public.suppliers IS 'Stores supplier information for purchase orders';
COMMENT ON TABLE public.purchase_orders IS 'Stores purchase order headers with status tracking';
COMMENT ON TABLE public.purchase_order_items IS 'Stores line items for each purchase order';
COMMENT ON TABLE public.purchase_order_history IS 'Audit trail for all purchase order changes';
COMMENT ON TABLE public.purchase_order_returns IS 'Tracks item returns and refunds';

COMMENT ON COLUMN public.purchase_orders.status IS 'Current status: draft, sent, confirmed, partially_received, received, cancelled, modified';
COMMENT ON COLUMN public.purchase_orders.payment_status IS 'Payment status: unpaid, partially_paid, paid';
COMMENT ON COLUMN public.purchase_order_returns.reason IS 'Return reason: damaged, wrong_item, quality_issue, excess_quantity, other';
