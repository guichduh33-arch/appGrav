-- Migration: 058_sync_infrastructure_tables.sql
-- Story: 1.4 - Sync Infrastructure Tables
-- Description: Creates tables for sync queue, offline versions tracking, and device sync management

-- ============================================
-- Enable required extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Table: sync_queue
-- Purpose: Queue offline transactions for synchronization
-- ============================================
CREATE TABLE IF NOT EXISTS public.sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ,
    error_message TEXT,

    CONSTRAINT sync_queue_retry_count_positive CHECK (retry_count >= 0)
);

-- Indexes for sync_queue
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON public.sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_device_id ON public.sync_queue(device_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_type ON public.sync_queue(type);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON public.sync_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_pending ON public.sync_queue(status, created_at) WHERE status = 'pending';

-- RLS for sync_queue
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sync_queue"
    ON public.sync_queue
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert sync_queue"
    ON public.sync_queue
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their sync_queue"
    ON public.sync_queue
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete sync_queue"
    ON public.sync_queue
    FOR DELETE
    USING (public.is_admin(auth.uid()));

-- ============================================
-- Table: offline_versions
-- Purpose: Track version and sync state of cached tables
-- ============================================
CREATE TABLE IF NOT EXISTS public.offline_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    version INTEGER DEFAULT 1,
    last_sync TIMESTAMPTZ DEFAULT NOW(),
    checksum VARCHAR(64),
    row_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT offline_versions_table_name_unique UNIQUE (table_name),
    CONSTRAINT offline_versions_version_positive CHECK (version > 0)
);

-- Indexes for offline_versions
CREATE INDEX IF NOT EXISTS idx_offline_versions_table_name ON public.offline_versions(table_name);
CREATE INDEX IF NOT EXISTS idx_offline_versions_last_sync ON public.offline_versions(last_sync);

-- RLS for offline_versions
ALTER TABLE public.offline_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read offline_versions"
    ON public.offline_versions
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert offline_versions"
    ON public.offline_versions
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update offline_versions"
    ON public.offline_versions
    FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete offline_versions"
    ON public.offline_versions
    FOR DELETE
    USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_offline_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_offline_versions_updated_at ON public.offline_versions;
CREATE TRIGGER trigger_offline_versions_updated_at
    BEFORE UPDATE ON public.offline_versions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_offline_versions_updated_at();

-- ============================================
-- Table: sync_devices
-- Purpose: Track devices registered for sync with authentication tokens
-- ============================================
CREATE TABLE IF NOT EXISTS public.sync_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('pos', 'mobile', 'display', 'kds')),
    device_name VARCHAR(100),
    user_id UUID REFERENCES auth.users(id),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    token_hash VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT sync_devices_device_id_unique UNIQUE (device_id)
);

-- Indexes for sync_devices
CREATE INDEX IF NOT EXISTS idx_sync_devices_device_id ON public.sync_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_sync_devices_device_type ON public.sync_devices(device_type);
CREATE INDEX IF NOT EXISTS idx_sync_devices_last_seen ON public.sync_devices(last_seen);
CREATE INDEX IF NOT EXISTS idx_sync_devices_active ON public.sync_devices(is_active) WHERE is_active = TRUE;

-- RLS for sync_devices
ALTER TABLE public.sync_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sync_devices"
    ON public.sync_devices
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can register their devices"
    ON public.sync_devices
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own devices"
    ON public.sync_devices
    FOR UPDATE
    USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete sync_devices"
    ON public.sync_devices
    FOR DELETE
    USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_sync_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_devices_updated_at ON public.sync_devices;
CREATE TRIGGER trigger_sync_devices_updated_at
    BEFORE UPDATE ON public.sync_devices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sync_devices_updated_at();

-- ============================================
-- Function: Generate device token hash
-- Purpose: Create a secure hash for device authentication
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_device_token_hash(p_device_id VARCHAR, p_secret VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN encode(
        digest(p_device_id || ':' || p_secret || ':' || extract(epoch from now())::text, 'sha256'),
        'hex'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Verify device token
-- Purpose: Verify a device's token hash matches
-- ============================================
CREATE OR REPLACE FUNCTION public.verify_device_token(p_device_id VARCHAR, p_token_hash VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_stored_hash VARCHAR;
BEGIN
    SELECT token_hash INTO v_stored_hash
    FROM public.sync_devices
    WHERE device_id = p_device_id AND is_active = TRUE;

    IF v_stored_hash IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN v_stored_hash = p_token_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Update device last seen
-- Purpose: Update the last_seen timestamp for a device
-- ============================================
CREATE OR REPLACE FUNCTION public.update_device_last_seen(p_device_id VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE public.sync_devices
    SET last_seen = NOW()
    WHERE device_id = p_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Initialize offline_versions with tracked tables
-- ============================================
INSERT INTO public.offline_versions (table_name, version, checksum)
VALUES
    ('products', 1, NULL),
    ('categories', 1, NULL),
    ('customers', 1, NULL),
    ('product_modifiers', 1, NULL),
    ('floor_plan_items', 1, NULL)
ON CONFLICT (table_name) DO NOTHING;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE public.sync_queue IS 'Queue for offline transactions pending synchronization';
COMMENT ON TABLE public.offline_versions IS 'Tracks version and sync state of offline-cached tables';
COMMENT ON TABLE public.sync_devices IS 'Registry of devices authorized for sync operations';

COMMENT ON COLUMN public.sync_queue.type IS 'Type of operation: order, payment, stock_movement, customer, etc.';
COMMENT ON COLUMN public.sync_queue.status IS 'pending: waiting to sync, syncing: in progress, synced: completed, failed: error';
COMMENT ON COLUMN public.offline_versions.checksum IS 'SHA-256 hash of table data for integrity verification';
COMMENT ON COLUMN public.sync_devices.token_hash IS 'SHA-256 hash of device authentication token';
