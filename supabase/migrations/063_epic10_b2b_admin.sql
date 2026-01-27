-- Migration: 063_epic10_b2b_admin
-- Epic 10: B2B, Purchasing & Administration
-- Stories: 10.1-10.6, 10.8

-- Story 10.1: Customer Credit Terms
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_balance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_status VARCHAR(20) DEFAULT 'none'; -- none, approved, suspended

-- Story 10.2: Late Payment Alerts - Invoice tracking
CREATE TABLE IF NOT EXISTS public.customer_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    order_id UUID REFERENCES public.orders(id),
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, partial, paid, overdue
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customer_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read invoices" ON public.customer_invoices
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based write invoices" ON public.customer_invoices
    FOR ALL USING (public.user_has_permission(auth.uid(), 'customers.update'));

-- Function to get overdue invoices
CREATE OR REPLACE FUNCTION public.get_overdue_invoices()
RETURNS TABLE (
    invoice_id UUID,
    customer_id UUID,
    customer_name VARCHAR,
    invoice_number VARCHAR,
    due_date TIMESTAMPTZ,
    days_overdue INTEGER,
    amount DECIMAL,
    paid_amount DECIMAL,
    balance_due DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ci.id as invoice_id,
        ci.customer_id,
        c.name as customer_name,
        ci.invoice_number,
        ci.due_date,
        EXTRACT(DAY FROM (NOW() - ci.due_date))::INTEGER as days_overdue,
        ci.amount,
        ci.paid_amount,
        (ci.amount - ci.paid_amount) as balance_due
    FROM public.customer_invoices ci
    JOIN public.customers c ON c.id = ci.customer_id
    WHERE ci.due_date < NOW()
      AND ci.status NOT IN ('paid')
      AND (ci.amount - ci.paid_amount) > 0
    ORDER BY ci.due_date ASC;
END;
$$;

-- Story 10.3: Reserved Stock for B2B
CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    order_id UUID REFERENCES public.orders(id),
    b2b_order_id UUID REFERENCES public.b2b_orders(id),
    quantity DECIMAL(10,3) NOT NULL,
    reserved_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, fulfilled, cancelled, expired
    notes TEXT,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read reservations" ON public.stock_reservations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based write reservations" ON public.stock_reservations
    FOR ALL USING (public.user_has_permission(auth.uid(), 'inventory.update'));

-- Function to get available stock (minus reservations)
CREATE OR REPLACE FUNCTION public.get_available_stock(p_product_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stock DECIMAL;
    v_reserved DECIMAL;
BEGIN
    SELECT stock_quantity INTO v_stock
    FROM public.products
    WHERE id = p_product_id;

    SELECT COALESCE(SUM(quantity), 0) INTO v_reserved
    FROM public.stock_reservations
    WHERE product_id = p_product_id
      AND status = 'active'
      AND reserved_until > NOW();

    RETURN COALESCE(v_stock, 0) - v_reserved;
END;
$$;

-- Story 10.6: Anomaly Alerts
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL, -- price_change, high_void, stock_anomaly, unusual_discount, etc.
    severity VARCHAR(20) DEFAULT 'warning', -- info, warning, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES public.user_profiles(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read alerts" ON public.system_alerts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based write alerts" ON public.system_alerts
    FOR ALL USING (public.user_has_permission(auth.uid(), 'reports.view'));

-- Function to create anomaly alert
CREATE OR REPLACE FUNCTION public.create_anomaly_alert(
    p_alert_type VARCHAR,
    p_severity VARCHAR,
    p_title VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_reference_type VARCHAR DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_alert_id UUID;
BEGIN
    INSERT INTO public.system_alerts (
        alert_type,
        severity,
        title,
        description,
        reference_type,
        reference_id
    )
    VALUES (
        p_alert_type,
        p_severity,
        p_title,
        p_description,
        p_reference_type,
        p_reference_id
    )
    RETURNING id INTO v_alert_id;

    RETURN v_alert_id;
END;
$$;

-- Trigger to detect high discount anomalies
CREATE OR REPLACE FUNCTION public.check_discount_anomaly()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Alert if discount > 20%
    IF NEW.discount_type = 'percentage' AND NEW.discount_value > 20 THEN
        PERFORM public.create_anomaly_alert(
            'high_discount',
            'warning',
            'Remise élevée détectée',
            format('Commande %s avec remise de %s%%', NEW.order_number, NEW.discount_value::TEXT),
            'order',
            NEW.id
        );
    END IF;

    -- Alert if discount > 50%
    IF NEW.discount_type = 'percentage' AND NEW.discount_value > 50 THEN
        PERFORM public.create_anomaly_alert(
            'excessive_discount',
            'critical',
            'Remise excessive détectée',
            format('Commande %s avec remise de %s%%', NEW.order_number, NEW.discount_value::TEXT),
            'order',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_discount_anomaly ON public.orders;
CREATE TRIGGER trg_check_discount_anomaly
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    WHEN (NEW.discount_value IS NOT NULL AND NEW.discount_value > 0)
    EXECUTE FUNCTION public.check_discount_anomaly();

-- Story 10.8: Granular Permissions - Add more permission codes
INSERT INTO public.permissions (code, module, action, name_fr, name_en, name_id, description)
VALUES
    ('customers.credit', 'customers', 'credit', 'Gérer crédit client', 'Manage customer credit', 'Kelola kredit pelanggan', 'Can manage customer credit limits'),
    ('inventory.reserve', 'inventory', 'reserve', 'Réserver stock', 'Reserve stock', 'Reservasi stok', 'Can create stock reservations'),
    ('reports.export', 'reports', 'export', 'Exporter rapports', 'Export reports', 'Ekspor laporan', 'Can export reports to CSV'),
    ('products.import', 'products', 'import', 'Importer produits', 'Import products', 'Impor produk', 'Can import products from CSV')
ON CONFLICT (code) DO NOTHING;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_overdue_invoices() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_stock(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_anomaly_alert(VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, UUID) TO authenticated;
