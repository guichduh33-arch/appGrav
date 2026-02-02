-- Migration: 061_kds_enhancements.sql
-- Epic 8: Kitchen Operations (KDS Amélioré)
-- Stories 8.1-8.7

-- =====================================================
-- Add is_held column to order_items (Story 8.4)
-- =====================================================
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS is_held BOOLEAN DEFAULT false;

-- =====================================================
-- Add source column to orders (Story 8.1)
-- =====================================================
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'pos'
CHECK (source IN ('pos', 'mobile', 'web', 'b2b'));

-- =====================================================
-- Add prepared_at column for timing (Story 8.6)
-- =====================================================
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMPTZ;

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS served_at TIMESTAMPTZ;

-- =====================================================
-- Index for KDS queries
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_order_items_station_status
    ON public.order_items(dispatch_station, item_status);

CREATE INDEX IF NOT EXISTS idx_orders_source
    ON public.orders(source) WHERE source != 'pos';

-- =====================================================
-- Function to get KDS orders with timing
-- =====================================================
CREATE OR REPLACE FUNCTION get_kds_orders(p_station VARCHAR DEFAULT NULL)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR,
    order_type VARCHAR,
    table_number VARCHAR,
    customer_name VARCHAR,
    created_at TIMESTAMPTZ,
    status VARCHAR,
    source VARCHAR,
    elapsed_seconds INTEGER,
    items JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id AS order_id,
        o.order_number,
        o.order_type::VARCHAR,
        o.table_number,
        o.customer_name,
        o.created_at,
        o.status::VARCHAR,
        COALESCE(o.source, 'pos')::VARCHAR,
        EXTRACT(EPOCH FROM (NOW() - o.created_at))::INTEGER AS elapsed_seconds,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'product_name', oi.product_name,
                    'quantity', oi.quantity,
                    'modifiers', oi.modifiers,
                    'notes', oi.notes,
                    'item_status', oi.item_status,
                    'dispatch_station', oi.dispatch_station,
                    'is_held', COALESCE(oi.is_held, false),
                    'prepared_at', oi.prepared_at,
                    'served_at', oi.served_at
                )
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id
            AND (p_station IS NULL OR oi.dispatch_station = p_station OR p_station = 'all')
        ) AS items
    FROM public.orders o
    WHERE o.status IN ('new', 'preparing', 'ready')
    ORDER BY o.created_at ASC;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_kds_orders TO authenticated;
