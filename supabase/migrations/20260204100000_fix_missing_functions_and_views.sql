-- =====================================================
-- Migration: Fix Missing Functions and Views
-- Date: 2024-02-04
-- Description: Adds missing RPC functions and creates
--              compatibility views for table name mismatches
-- Applied via MCP in 5 parts
-- =====================================================

-- =====================================================
-- PART 1: Add missing columns to pos_sessions
-- =====================================================

-- Add user_id column to pos_sessions
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add counted_cash column
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS counted_cash DECIMAL(12,2);

-- =====================================================
-- PART 2: Create shift-related RPC functions
-- =====================================================

-- Function: get_terminal_open_shifts (accepts VARCHAR, converts to match terminal_id)
CREATE OR REPLACE FUNCTION public.get_terminal_open_shifts(p_terminal_id VARCHAR)
RETURNS SETOF public.pos_sessions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.pos_sessions
    WHERE terminal_id::TEXT = p_terminal_id
      AND status = 'open'
    ORDER BY opened_at DESC;
END;
$$;

-- Function: get_user_open_shift
CREATE OR REPLACE FUNCTION public.get_user_open_shift(p_user_id UUID)
RETURNS SETOF public.pos_sessions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.pos_sessions
    WHERE user_id = p_user_id
      AND status = 'open'
    LIMIT 1;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_terminal_open_shifts(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_open_shift(UUID) TO authenticated;

-- =====================================================
-- PART 3: Create LAN node registration function
-- =====================================================

CREATE OR REPLACE FUNCTION public.register_lan_node(
    p_device_id VARCHAR,
    p_device_name VARCHAR,
    p_device_type VARCHAR,
    p_ip_address INET,
    p_is_hub BOOLEAN DEFAULT FALSE,
    p_port INTEGER DEFAULT 3001
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_node_id UUID;
BEGIN
    INSERT INTO public.lan_nodes (
        device_id,
        device_type,
        device_name,
        ip_address,
        port,
        is_hub,
        status,
        last_heartbeat
    )
    VALUES (
        p_device_id,
        p_device_type,
        p_device_name,
        p_ip_address,
        p_port,
        p_is_hub,
        'online',
        NOW()
    )
    ON CONFLICT (device_id) DO UPDATE SET
        ip_address = EXCLUDED.ip_address,
        port = EXCLUDED.port,
        device_name = EXCLUDED.device_name,
        device_type = EXCLUDED.device_type,
        is_hub = EXCLUDED.is_hub,
        status = 'online',
        last_heartbeat = NOW()
    RETURNING id INTO v_node_id;

    RETURN v_node_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.register_lan_node(VARCHAR, VARCHAR, VARCHAR, INET, BOOLEAN, INTEGER) TO authenticated;

-- =====================================================
-- PART 4: Create purchase_order_items view
-- =====================================================

-- Add missing columns to po_items first
ALTER TABLE public.po_items ADD COLUMN IF NOT EXISTS quantity_returned DECIMAL(10,3) DEFAULT 0;
ALTER TABLE public.po_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(200);

-- Drop view if exists
DROP VIEW IF EXISTS public.purchase_order_items;

-- Create view mapping purchase_order_items to po_items
CREATE VIEW public.purchase_order_items AS
SELECT
    id,
    po_id AS purchase_order_id,
    product_id,
    quantity_ordered AS quantity,
    quantity_received,
    quantity_returned,
    unit,
    unit_price,
    total AS line_total,
    product_name,
    created_at,
    updated_at,
    quantity_ordered,
    total
FROM public.po_items;

-- Grant access to the view
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_order_items TO authenticated;

-- =====================================================
-- PART 5: Create INSTEAD OF triggers for the view
-- =====================================================

-- INSERT trigger function
CREATE OR REPLACE FUNCTION public.purchase_order_items_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_quantity DECIMAL(10,3);
BEGIN
    v_quantity := COALESCE(NEW.quantity, NEW.quantity_ordered, 0);

    INSERT INTO public.po_items (
        id, po_id, product_id, quantity_ordered, quantity_received,
        unit, unit_price, total, created_at, updated_at
    )
    VALUES (
        COALESCE(NEW.id, gen_random_uuid()),
        NEW.purchase_order_id,
        NEW.product_id,
        v_quantity,
        COALESCE(NEW.quantity_received, 0),
        NEW.unit,
        NEW.unit_price,
        COALESCE(NEW.line_total, NEW.total, v_quantity * NEW.unit_price),
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    );
    RETURN NEW;
END;
$$;

-- UPDATE trigger function
CREATE OR REPLACE FUNCTION public.purchase_order_items_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.po_items
    SET
        po_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id),
        product_id = COALESCE(NEW.product_id, OLD.product_id),
        quantity_ordered = COALESCE(NEW.quantity, NEW.quantity_ordered, OLD.quantity),
        quantity_received = COALESCE(NEW.quantity_received, OLD.quantity_received),
        unit = COALESCE(NEW.unit, OLD.unit),
        unit_price = COALESCE(NEW.unit_price, OLD.unit_price),
        total = COALESCE(NEW.line_total, NEW.total, OLD.line_total),
        updated_at = NOW()
    WHERE id = OLD.id;
    RETURN NEW;
END;
$$;

-- DELETE trigger function
CREATE OR REPLACE FUNCTION public.purchase_order_items_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.po_items WHERE id = OLD.id;
    RETURN OLD;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS purchase_order_items_insert_trigger ON public.purchase_order_items;
CREATE TRIGGER purchase_order_items_insert_trigger
    INSTEAD OF INSERT ON public.purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION public.purchase_order_items_insert();

DROP TRIGGER IF EXISTS purchase_order_items_update_trigger ON public.purchase_order_items;
CREATE TRIGGER purchase_order_items_update_trigger
    INSTEAD OF UPDATE ON public.purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION public.purchase_order_items_update();

DROP TRIGGER IF EXISTS purchase_order_items_delete_trigger ON public.purchase_order_items;
CREATE TRIGGER purchase_order_items_delete_trigger
    INSTEAD OF DELETE ON public.purchase_order_items
    FOR EACH ROW EXECUTE FUNCTION public.purchase_order_items_delete();

-- =====================================================
-- PART 6: Fix RLS policies on internal_transfers
-- =====================================================

-- Ensure RLS is enabled
ALTER TABLE public.internal_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_items ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for internal_transfers
DROP POLICY IF EXISTS "internal_transfers_select_auth" ON public.internal_transfers;
DROP POLICY IF EXISTS "internal_transfers_insert_auth" ON public.internal_transfers;
DROP POLICY IF EXISTS "internal_transfers_update_auth" ON public.internal_transfers;
DROP POLICY IF EXISTS "internal_transfers_delete_auth" ON public.internal_transfers;
DROP POLICY IF EXISTS "internal_transfers_manage_auth" ON public.internal_transfers;

CREATE POLICY "internal_transfers_select_auth" ON public.internal_transfers
    FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "internal_transfers_insert_auth" ON public.internal_transfers
    FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "internal_transfers_update_auth" ON public.internal_transfers
    FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "internal_transfers_delete_auth" ON public.internal_transfers
    FOR DELETE TO authenticated USING (TRUE);

-- Same for transfer_items
DROP POLICY IF EXISTS "transfer_items_select_auth" ON public.transfer_items;
DROP POLICY IF EXISTS "transfer_items_insert_auth" ON public.transfer_items;
DROP POLICY IF EXISTS "transfer_items_update_auth" ON public.transfer_items;
DROP POLICY IF EXISTS "transfer_items_delete_auth" ON public.transfer_items;
DROP POLICY IF EXISTS "transfer_items_manage_auth" ON public.transfer_items;

CREATE POLICY "transfer_items_select_auth" ON public.transfer_items
    FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "transfer_items_insert_auth" ON public.transfer_items
    FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "transfer_items_update_auth" ON public.transfer_items
    FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "transfer_items_delete_auth" ON public.transfer_items
    FOR DELETE TO authenticated USING (TRUE);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
