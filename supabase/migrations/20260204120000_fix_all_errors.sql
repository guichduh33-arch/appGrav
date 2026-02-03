-- =====================================================
-- Migration: Fix All Current Errors
-- Date: 2024-02-04
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: Add missing columns to pos_sessions
-- =====================================================
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS counted_cash DECIMAL(12,2);

-- =====================================================
-- PART 2: Add missing columns to stock_movements
-- =====================================================
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100);
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12,2);

-- =====================================================
-- PART 3: Create shift-related RPC functions
-- =====================================================
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

GRANT EXECUTE ON FUNCTION public.get_terminal_open_shifts(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_open_shift(UUID) TO authenticated;

-- =====================================================
-- PART 4: Create LAN node registration function
-- =====================================================
-- First ensure lan_nodes table exists with correct schema
CREATE TABLE IF NOT EXISTS public.lan_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    device_name VARCHAR(100),
    ip_address INET,
    port INTEGER DEFAULT 3001,
    is_hub BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'offline',
    last_heartbeat TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on lan_nodes
ALTER TABLE public.lan_nodes ENABLE ROW LEVEL SECURITY;

-- RLS policies for lan_nodes
DROP POLICY IF EXISTS "lan_nodes_select" ON public.lan_nodes;
DROP POLICY IF EXISTS "lan_nodes_insert" ON public.lan_nodes;
DROP POLICY IF EXISTS "lan_nodes_update" ON public.lan_nodes;
DROP POLICY IF EXISTS "lan_nodes_delete" ON public.lan_nodes;

CREATE POLICY "lan_nodes_select" ON public.lan_nodes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "lan_nodes_insert" ON public.lan_nodes FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "lan_nodes_update" ON public.lan_nodes FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "lan_nodes_delete" ON public.lan_nodes FOR DELETE TO authenticated USING (TRUE);

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
        device_id, device_type, device_name, ip_address, port, is_hub, status, last_heartbeat
    )
    VALUES (
        p_device_id, p_device_type, p_device_name, p_ip_address, p_port, p_is_hub, 'online', NOW()
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

GRANT EXECUTE ON FUNCTION public.register_lan_node(VARCHAR, VARCHAR, VARCHAR, INET, BOOLEAN, INTEGER) TO authenticated;

-- =====================================================
-- PART 5: Fix RLS policies on internal_transfers
-- =====================================================
-- Ensure tables exist
CREATE TABLE IF NOT EXISTS public.internal_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50),
    from_location_id UUID,
    to_location_id UUID,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id UUID REFERENCES public.internal_transfers(id) ON DELETE CASCADE,
    product_id UUID,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
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
