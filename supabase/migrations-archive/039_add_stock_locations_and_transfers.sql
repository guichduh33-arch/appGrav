-- Migration: Add Stock Locations and Internal Transfers
-- Description: Extends existing stock_movements table with location tracking
-- Date: 2026-01-20

-- =============================================
-- STOCK LOCATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.stock_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    location_type TEXT NOT NULL CHECK (location_type IN ('main_warehouse', 'section', 'production', 'waste')),
    description TEXT,
    responsible_person TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ADD LOCATION COLUMNS TO EXISTING STOCK_MOVEMENTS
-- =============================================
-- Add location tracking columns to existing stock_movements table
ALTER TABLE public.stock_movements
    ADD COLUMN IF NOT EXISTS from_location_id UUID REFERENCES public.stock_locations(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS to_location_id UUID REFERENCES public.stock_locations(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS total_cost NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'unit',
    ADD COLUMN IF NOT EXISTS reference_number TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS created_by_name TEXT;

-- =============================================
-- INTERNAL TRANSFERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.internal_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number TEXT NOT NULL UNIQUE,

    -- Transfer route
    from_location_id UUID NOT NULL REFERENCES public.stock_locations(id) ON DELETE RESTRICT,
    to_location_id UUID NOT NULL REFERENCES public.stock_locations(id) ON DELETE RESTRICT,

    -- Status tracking
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'in_transit', 'received', 'cancelled')),

    -- People involved
    requested_by UUID,
    requested_by_name TEXT,
    approved_by UUID,
    approved_by_name TEXT,
    received_by UUID,
    received_by_name TEXT,
    responsible_person TEXT NOT NULL, -- Person from section who picked up items

    -- Dates
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    requested_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,

    -- Total value
    total_items INTEGER DEFAULT 0,
    total_value NUMERIC(12,2) DEFAULT 0,

    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- TRANSFER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID NOT NULL REFERENCES public.internal_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,

    quantity_requested NUMERIC(10,3) NOT NULL,
    quantity_shipped NUMERIC(10,3) DEFAULT 0,
    quantity_received NUMERIC(10,3) DEFAULT 0,

    unit TEXT NOT NULL DEFAULT 'unit',
    unit_cost NUMERIC(12,2),
    line_total NUMERIC(12,2),

    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT transfer_items_unique UNIQUE (transfer_id, product_id)
);

-- =============================================
-- STOCK BALANCES VIEW (Real-time stock per location)
-- =============================================
CREATE OR REPLACE VIEW stock_balances AS
SELECT
    p.id as product_id,
    p.name as product_name,
    p.sku,
    p.unit as stock_unit,
    sl.id as location_id,
    sl.name as location_name,
    sl.code as location_code,
    sl.location_type,
    COALESCE(
        SUM(CASE
            WHEN sm.to_location_id = sl.id THEN sm.quantity
            WHEN sm.from_location_id = sl.id THEN -sm.quantity
            ELSE 0
        END),
        0
    ) as current_stock,
    p.cost_price,
    COALESCE(
        SUM(CASE
            WHEN sm.to_location_id = sl.id THEN sm.quantity
            WHEN sm.from_location_id = sl.id THEN -sm.quantity
            ELSE 0
        END),
        0
    ) * COALESCE(p.cost_price, 0) as stock_value
FROM public.products p
CROSS JOIN public.stock_locations sl
LEFT JOIN public.stock_movements sm ON sm.product_id = p.id
    AND (sm.from_location_id = sl.id OR sm.to_location_id = sl.id)
WHERE p.is_active = true AND sl.is_active = true
GROUP BY p.id, p.name, p.sku, p.unit, sl.id, sl.name, sl.code, sl.location_type, p.cost_price;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_stock_locations_type ON public.stock_locations(location_type);
CREATE INDEX IF NOT EXISTS idx_stock_locations_active ON public.stock_locations(is_active);

CREATE INDEX IF NOT EXISTS idx_stock_movements_from_location ON public.stock_movements(from_location_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_to_location ON public.stock_movements(to_location_id);

CREATE INDEX IF NOT EXISTS idx_internal_transfers_number ON public.internal_transfers(transfer_number);
CREATE INDEX IF NOT EXISTS idx_internal_transfers_from ON public.internal_transfers(from_location_id);
CREATE INDEX IF NOT EXISTS idx_internal_transfers_to ON public.internal_transfers(to_location_id);
CREATE INDEX IF NOT EXISTS idx_internal_transfers_status ON public.internal_transfers(status);
CREATE INDEX IF NOT EXISTS idx_internal_transfers_date ON public.internal_transfers(transfer_date DESC);

CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer ON public.transfer_items(transfer_id);
CREATE INDEX IF NOT EXISTS idx_transfer_items_product ON public.transfer_items(product_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps for stock_locations
CREATE OR REPLACE FUNCTION update_stock_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stock_locations_updated_at ON public.stock_locations;
CREATE TRIGGER trigger_update_stock_locations_updated_at
    BEFORE UPDATE ON public.stock_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_locations_updated_at();

-- Update timestamps for internal_transfers
CREATE OR REPLACE FUNCTION update_internal_transfers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_internal_transfers_updated_at ON public.internal_transfers;
CREATE TRIGGER trigger_update_internal_transfers_updated_at
    BEFORE UPDATE ON public.internal_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_internal_transfers_updated_at();

-- Generate transfer number
CREATE OR REPLACE FUNCTION generate_transfer_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    sequence_num INT;
    final_number TEXT;
BEGIN
    IF NEW.transfer_number IS NULL THEN
        year_month := to_char(NEW.transfer_date, 'YYMM');

        SELECT COALESCE(MAX(
            CAST(SUBSTRING(transfer_number FROM 'TR' || year_month || '-(\\d+)') AS INT)
        ), 0) + 1
        INTO sequence_num
        FROM public.internal_transfers
        WHERE transfer_number LIKE 'TR' || year_month || '-%';

        final_number := 'TR' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
        NEW.transfer_number := final_number;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_transfer_number ON public.internal_transfers;
CREATE TRIGGER trigger_generate_transfer_number
    BEFORE INSERT ON public.internal_transfers
    FOR EACH ROW
    EXECUTE FUNCTION generate_transfer_number();

-- Update transfer totals when items change
CREATE OR REPLACE FUNCTION update_transfer_totals()
RETURNS TRIGGER AS $$
DECLARE
    total_items_count INTEGER;
    total_value_sum NUMERIC(12,2);
BEGIN
    SELECT
        COUNT(*),
        COALESCE(SUM(line_total), 0)
    INTO
        total_items_count,
        total_value_sum
    FROM public.transfer_items
    WHERE transfer_id = COALESCE(NEW.transfer_id, OLD.transfer_id);

    UPDATE public.internal_transfers
    SET
        total_items = total_items_count,
        total_value = total_value_sum
    WHERE id = COALESCE(NEW.transfer_id, OLD.transfer_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_transfer_totals ON public.transfer_items;
CREATE TRIGGER trigger_update_transfer_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.transfer_items
    FOR EACH ROW
    EXECUTE FUNCTION update_transfer_totals();

-- Create stock movements when transfer is received
CREATE OR REPLACE FUNCTION create_stock_movements_on_receive()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create movements when status changes to 'received'
    IF NEW.status = 'received' AND (OLD.status IS NULL OR OLD.status != 'received') THEN
        -- Create stock movements for each item
        INSERT INTO public.stock_movements (
            movement_id,
            product_id,
            movement_type,
            quantity,
            unit_cost,
            stock_before,
            stock_after,
            from_location_id,
            to_location_id,
            unit,
            total_cost,
            reference_type,
            reference_id,
            reference_number,
            notes,
            created_by,
            created_by_name
        )
        SELECT
            'TRF-' || NEW.transfer_number || '-' || ti.product_id::text,
            ti.product_id,
            'transfer'::movement_type,
            ti.quantity_received,
            ti.unit_cost,
            COALESCE((SELECT current_stock FROM products WHERE id = ti.product_id), 0),
            COALESCE((SELECT current_stock FROM products WHERE id = ti.product_id), 0) + ti.quantity_received,
            NEW.from_location_id,
            NEW.to_location_id,
            ti.unit,
            ti.line_total,
            'transfer',
            NEW.id,
            NEW.transfer_number,
            'Transfert interne: ' ||
                (SELECT name FROM public.stock_locations WHERE id = NEW.from_location_id) ||
                ' → ' ||
                (SELECT name FROM public.stock_locations WHERE id = NEW.to_location_id),
            NEW.received_by,
            NEW.received_by_name
        FROM public.transfer_items ti
        WHERE ti.transfer_id = NEW.id
        AND ti.quantity_received > 0
        ON CONFLICT (movement_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_stock_movements_on_receive ON public.internal_transfers;
CREATE TRIGGER trigger_create_stock_movements_on_receive
    AFTER UPDATE ON public.internal_transfers
    FOR EACH ROW
    EXECUTE FUNCTION create_stock_movements_on_receive();

-- =============================================
-- SEED DEFAULT LOCATIONS
-- =============================================
INSERT INTO public.stock_locations (name, code, location_type, description, is_active) VALUES
    ('Dépôt Principal', 'MAIN-WH', 'main_warehouse', 'Entrepôt principal pour le stockage', true),
    ('Section POS', 'POS-01', 'section', 'Section point de vente', true),
    ('Section Production', 'PROD-01', 'section', 'Section de production', true),
    ('Zone Déchet', 'WASTE-01', 'waste', 'Zone pour produits endommagés/périmés', true)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_items ENABLE ROW LEVEL SECURITY;

-- Public access policies for stock_locations
DROP POLICY IF EXISTS "Allow public to select stock_locations" ON public.stock_locations;
CREATE POLICY "Allow public to select stock_locations"
    ON public.stock_locations FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public to insert stock_locations" ON public.stock_locations;
CREATE POLICY "Allow public to insert stock_locations"
    ON public.stock_locations FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to update stock_locations" ON public.stock_locations;
CREATE POLICY "Allow public to update stock_locations"
    ON public.stock_locations FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to delete stock_locations" ON public.stock_locations;
CREATE POLICY "Allow public to delete stock_locations"
    ON public.stock_locations FOR DELETE TO public USING (true);

-- Public access policies for internal_transfers
DROP POLICY IF EXISTS "Allow public to select internal_transfers" ON public.internal_transfers;
CREATE POLICY "Allow public to select internal_transfers"
    ON public.internal_transfers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public to insert internal_transfers" ON public.internal_transfers;
CREATE POLICY "Allow public to insert internal_transfers"
    ON public.internal_transfers FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to update internal_transfers" ON public.internal_transfers;
CREATE POLICY "Allow public to update internal_transfers"
    ON public.internal_transfers FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to delete internal_transfers" ON public.internal_transfers;
CREATE POLICY "Allow public to delete internal_transfers"
    ON public.internal_transfers FOR DELETE TO public USING (true);

-- Public access policies for transfer_items
DROP POLICY IF EXISTS "Allow public to select transfer_items" ON public.transfer_items;
CREATE POLICY "Allow public to select transfer_items"
    ON public.transfer_items FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow public to insert transfer_items" ON public.transfer_items;
CREATE POLICY "Allow public to insert transfer_items"
    ON public.transfer_items FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to update transfer_items" ON public.transfer_items;
CREATE POLICY "Allow public to update transfer_items"
    ON public.transfer_items FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public to delete transfer_items" ON public.transfer_items;
CREATE POLICY "Allow public to delete transfer_items"
    ON public.transfer_items FOR DELETE TO public USING (true);

-- Grant permissions
GRANT ALL ON public.stock_locations TO public;
GRANT ALL ON public.internal_transfers TO public;
GRANT ALL ON public.transfer_items TO public;
GRANT SELECT ON stock_balances TO public;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE public.stock_locations IS 'Physical locations for stock storage (warehouse, sections, etc.)';
COMMENT ON TABLE public.internal_transfers IS 'Internal transfer requests between locations';
COMMENT ON TABLE public.transfer_items IS 'Line items for each internal transfer';
COMMENT ON VIEW stock_balances IS 'Real-time stock balance per product per location';
