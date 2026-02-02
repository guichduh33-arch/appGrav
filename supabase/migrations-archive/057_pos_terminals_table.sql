-- Migration: 057_pos_terminals_table.sql
-- Description: Create pos_terminals table for device registration and LAN communication
-- Story: 1.3 - POS Terminal Registration
-- Date: 2026-01-27

-- =============================================================================
-- Table: pos_terminals
-- Purpose: Track registered POS terminals for LAN communication and sync
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pos_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_name VARCHAR(100) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    is_hub BOOLEAN DEFAULT FALSE,
    location VARCHAR(200),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT pos_terminals_device_id_unique UNIQUE (device_id),
    CONSTRAINT pos_terminals_status_check CHECK (status IN ('active', 'inactive', 'maintenance'))
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_pos_terminals_device_id ON public.pos_terminals(device_id);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_status ON public.pos_terminals(status);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_is_hub ON public.pos_terminals(is_hub) WHERE is_hub = TRUE;

-- =============================================================================
-- Updated_at Trigger
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_pos_terminals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pos_terminals_updated_at ON public.pos_terminals;
CREATE TRIGGER trigger_pos_terminals_updated_at
    BEFORE UPDATE ON public.pos_terminals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_pos_terminals_updated_at();

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE public.pos_terminals ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all terminals
CREATE POLICY "pos_terminals_select_authenticated"
    ON public.pos_terminals
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Policy: Users with settings.update permission can insert
CREATE POLICY "pos_terminals_insert_permission"
    ON public.pos_terminals
    FOR INSERT
    WITH CHECK (
        public.user_has_permission(auth.uid(), 'settings.update')
        OR public.is_admin(auth.uid())
    );

-- Policy: Users with settings.update permission can update
CREATE POLICY "pos_terminals_update_permission"
    ON public.pos_terminals
    FOR UPDATE
    USING (
        public.user_has_permission(auth.uid(), 'settings.update')
        OR public.is_admin(auth.uid())
    );

-- Policy: Only admins can delete terminals
CREATE POLICY "pos_terminals_delete_admin"
    ON public.pos_terminals
    FOR DELETE
    USING (public.is_admin(auth.uid()));

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE public.pos_terminals IS 'Registered POS terminals for LAN communication and sync tracking';
COMMENT ON COLUMN public.pos_terminals.device_id IS 'Unique identifier generated client-side (UUID)';
COMMENT ON COLUMN public.pos_terminals.is_hub IS 'Whether this terminal acts as the WebSocket hub for LAN communication';
COMMENT ON COLUMN public.pos_terminals.status IS 'Terminal status: active, inactive, or maintenance';
