-- Migration: 060_display_tables.sql
-- Story 5.1: Display Configuration Tables
-- Epic 5: Customer Display

-- =====================================================
-- Display Configurations Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.display_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(100) NOT NULL,
    pos_terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,

    -- Layout configuration (JSON)
    layout_config JSONB DEFAULT '{
        "showCart": true,
        "showQueue": true,
        "showReadyOrders": true,
        "showPromos": true,
        "cartFontSize": 18,
        "priceFontSize": 24,
        "totalFontSize": 32
    }'::jsonb,

    -- Promo rotation settings
    promo_rotation_interval INTEGER DEFAULT 10, -- seconds
    idle_timeout INTEGER DEFAULT 30, -- seconds before showing promos

    -- Audio settings
    audio_enabled BOOLEAN DEFAULT true,
    audio_volume DECIMAL(3,2) DEFAULT 0.7, -- 0.0 to 1.0

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Display Promotions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.display_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_id UUID REFERENCES public.display_configurations(id) ON DELETE CASCADE,

    -- Content
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(500),
    image_url TEXT,
    background_color VARCHAR(20) DEFAULT '#BA90A2',
    text_color VARCHAR(20) DEFAULT '#FFFFFF',

    -- Link to existing promotion (optional)
    promotion_id UUID REFERENCES public.promotions(id) ON DELETE SET NULL,

    -- Display settings
    priority INTEGER DEFAULT 0, -- Higher = shown first
    duration INTEGER DEFAULT 10, -- seconds to display

    -- Schedule
    start_date DATE,
    end_date DATE,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Display Order Queue Table (for tracking orders on display)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.display_order_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_id UUID REFERENCES public.display_configurations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    order_number VARCHAR(20) NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'preparing' CHECK (status IN ('preparing', 'ready', 'called', 'completed')),

    -- Timestamps
    received_at TIMESTAMPTZ DEFAULT NOW(),
    ready_at TIMESTAMPTZ,
    called_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Auto-clear after X minutes
    expires_at TIMESTAMPTZ,

    UNIQUE(display_id, order_id)
);

-- =====================================================
-- Indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_display_configurations_terminal
    ON public.display_configurations(pos_terminal_id);

CREATE INDEX IF NOT EXISTS idx_display_promotions_display
    ON public.display_promotions(display_id);

CREATE INDEX IF NOT EXISTS idx_display_promotions_active
    ON public.display_promotions(is_active, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_display_order_queue_display
    ON public.display_order_queue(display_id, status);

CREATE INDEX IF NOT EXISTS idx_display_order_queue_status
    ON public.display_order_queue(status, expires_at);

-- =====================================================
-- RLS Policies
-- =====================================================
ALTER TABLE public.display_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.display_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.display_order_queue ENABLE ROW LEVEL SECURITY;

-- Display Configurations
CREATE POLICY "Authenticated users can view display configurations"
    ON public.display_configurations FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage display configurations"
    ON public.display_configurations FOR ALL
    USING (public.is_admin(auth.uid()));

-- Display Promotions
CREATE POLICY "Authenticated users can view display promotions"
    ON public.display_promotions FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage display promotions"
    ON public.display_promotions FOR ALL
    USING (public.is_admin(auth.uid()));

-- Display Order Queue
CREATE POLICY "Authenticated users can view order queue"
    ON public.display_order_queue FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage order queue"
    ON public.display_order_queue FOR ALL
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- Updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_display_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_display_configurations_updated_at
    BEFORE UPDATE ON public.display_configurations
    FOR EACH ROW EXECUTE FUNCTION update_display_updated_at();

CREATE TRIGGER trigger_display_promotions_updated_at
    BEFORE UPDATE ON public.display_promotions
    FOR EACH ROW EXECUTE FUNCTION update_display_updated_at();

-- =====================================================
-- Insert default display configuration
-- =====================================================
INSERT INTO public.display_configurations (
    display_name,
    layout_config,
    promo_rotation_interval,
    idle_timeout
) VALUES (
    'Main Customer Display',
    '{
        "showCart": true,
        "showQueue": true,
        "showReadyOrders": true,
        "showPromos": true,
        "cartFontSize": 18,
        "priceFontSize": 24,
        "totalFontSize": 32
    }'::jsonb,
    10,
    30
) ON CONFLICT DO NOTHING;
