-- Migration: 059_lan_nodes_tables.sql
-- Story: 1.5 - LAN Node Registry Tables
-- Description: Creates tables for LAN node registration and message logging

-- ============================================
-- Table: lan_nodes
-- Purpose: Registry of devices on the local network for P2P communication
-- ============================================
CREATE TABLE IF NOT EXISTS public.lan_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('pos', 'mobile', 'display', 'kds')),
    device_name VARCHAR(100),
    ip_address INET NOT NULL,
    port INTEGER NOT NULL CHECK (port > 0 AND port <= 65535),
    is_hub BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'unknown')),
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT lan_nodes_device_id_unique UNIQUE (device_id)
);

-- Indexes for lan_nodes
CREATE INDEX IF NOT EXISTS idx_lan_nodes_device_id ON public.lan_nodes(device_id);
CREATE INDEX IF NOT EXISTS idx_lan_nodes_device_type ON public.lan_nodes(device_type);
CREATE INDEX IF NOT EXISTS idx_lan_nodes_status ON public.lan_nodes(status);
CREATE INDEX IF NOT EXISTS idx_lan_nodes_last_heartbeat ON public.lan_nodes(last_heartbeat);
CREATE INDEX IF NOT EXISTS idx_lan_nodes_online ON public.lan_nodes(status) WHERE status = 'online';
CREATE INDEX IF NOT EXISTS idx_lan_nodes_hub ON public.lan_nodes(is_hub) WHERE is_hub = TRUE;

-- RLS for lan_nodes
ALTER TABLE public.lan_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lan_nodes"
    ON public.lan_nodes
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can register lan_nodes"
    ON public.lan_nodes
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update lan_nodes"
    ON public.lan_nodes
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete lan_nodes"
    ON public.lan_nodes
    FOR DELETE
    USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_lan_nodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lan_nodes_updated_at ON public.lan_nodes;
CREATE TRIGGER trigger_lan_nodes_updated_at
    BEFORE UPDATE ON public.lan_nodes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_lan_nodes_updated_at();

-- ============================================
-- Table: lan_messages_log
-- Purpose: Audit log of LAN messages for debugging and monitoring
-- ============================================
CREATE TABLE IF NOT EXISTS public.lan_messages_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_type VARCHAR(50) NOT NULL,
    from_device VARCHAR(100) NOT NULL,
    to_device VARCHAR(100),
    payload_hash VARCHAR(64),
    payload_size INTEGER,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'timeout')),
    error_message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lan_messages_log
CREATE INDEX IF NOT EXISTS idx_lan_messages_log_message_type ON public.lan_messages_log(message_type);
CREATE INDEX IF NOT EXISTS idx_lan_messages_log_from_device ON public.lan_messages_log(from_device);
CREATE INDEX IF NOT EXISTS idx_lan_messages_log_to_device ON public.lan_messages_log(to_device);
CREATE INDEX IF NOT EXISTS idx_lan_messages_log_timestamp ON public.lan_messages_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_lan_messages_log_status ON public.lan_messages_log(status);

-- RLS for lan_messages_log
ALTER TABLE public.lan_messages_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read lan_messages_log"
    ON public.lan_messages_log
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert lan_messages_log"
    ON public.lan_messages_log
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update/delete logs (audit trail protection)
CREATE POLICY "Admins can update lan_messages_log"
    ON public.lan_messages_log
    FOR UPDATE
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete lan_messages_log"
    ON public.lan_messages_log
    FOR DELETE
    USING (public.is_admin(auth.uid()));

-- ============================================
-- Function: Register or update LAN node
-- Purpose: Upsert a node with heartbeat update
-- ============================================
CREATE OR REPLACE FUNCTION public.register_lan_node(
    p_device_id VARCHAR,
    p_device_type VARCHAR,
    p_device_name VARCHAR,
    p_ip_address INET,
    p_port INTEGER,
    p_is_hub BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
    v_node_id UUID;
BEGIN
    INSERT INTO public.lan_nodes (device_id, device_type, device_name, ip_address, port, is_hub, status, last_heartbeat)
    VALUES (p_device_id, p_device_type, p_device_name, p_ip_address, p_port, p_is_hub, 'online', NOW())
    ON CONFLICT (device_id) DO UPDATE SET
        ip_address = EXCLUDED.ip_address,
        port = EXCLUDED.port,
        device_name = EXCLUDED.device_name,
        is_hub = EXCLUDED.is_hub,
        status = 'online',
        last_heartbeat = NOW()
    RETURNING id INTO v_node_id;

    RETURN v_node_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Update node heartbeat
-- Purpose: Quick heartbeat update without full registration
-- ============================================
CREATE OR REPLACE FUNCTION public.update_lan_node_heartbeat(p_device_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE public.lan_nodes
    SET last_heartbeat = NOW(), status = 'online'
    WHERE device_id = p_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Mark stale nodes as offline
-- Purpose: Automatic cleanup of nodes that haven't sent heartbeat
-- ============================================
CREATE OR REPLACE FUNCTION public.mark_stale_lan_nodes_offline(p_timeout_seconds INTEGER DEFAULT 60)
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE public.lan_nodes
    SET status = 'offline'
    WHERE status = 'online'
      AND last_heartbeat < NOW() - (p_timeout_seconds || ' seconds')::INTERVAL;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get online nodes
-- Purpose: List all currently online nodes
-- ============================================
CREATE OR REPLACE FUNCTION public.get_online_lan_nodes()
RETURNS TABLE (
    id UUID,
    device_id VARCHAR,
    device_type VARCHAR,
    device_name VARCHAR,
    ip_address INET,
    port INTEGER,
    is_hub BOOLEAN,
    last_heartbeat TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.device_id, n.device_type, n.device_name, n.ip_address, n.port, n.is_hub, n.last_heartbeat
    FROM public.lan_nodes n
    WHERE n.status = 'online'
    ORDER BY n.is_hub DESC, n.last_heartbeat DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get hub node
-- Purpose: Find the designated hub for LAN communication
-- ============================================
CREATE OR REPLACE FUNCTION public.get_lan_hub_node()
RETURNS TABLE (
    id UUID,
    device_id VARCHAR,
    device_name VARCHAR,
    ip_address INET,
    port INTEGER,
    last_heartbeat TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT n.id, n.device_id, n.device_name, n.ip_address, n.port, n.last_heartbeat
    FROM public.lan_nodes n
    WHERE n.is_hub = TRUE AND n.status = 'online'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE public.lan_nodes IS 'Registry of devices on the local network for P2P communication';
COMMENT ON TABLE public.lan_messages_log IS 'Audit log of LAN messages for debugging and monitoring';

COMMENT ON COLUMN public.lan_nodes.device_id IS 'Unique device identifier (from terminal registration)';
COMMENT ON COLUMN public.lan_nodes.ip_address IS 'Current LAN IP address of the device';
COMMENT ON COLUMN public.lan_nodes.port IS 'WebSocket port the device is listening on';
COMMENT ON COLUMN public.lan_nodes.is_hub IS 'Whether this device acts as the LAN hub/coordinator';
COMMENT ON COLUMN public.lan_nodes.last_heartbeat IS 'Timestamp of last heartbeat received';

COMMENT ON COLUMN public.lan_messages_log.message_type IS 'Type of LAN message (heartbeat, cart_update, order_sync, etc.)';
COMMENT ON COLUMN public.lan_messages_log.payload_hash IS 'SHA-256 hash of message payload for integrity verification';
