-- =====================================================
-- Create b2b_order_history table
-- Activity log for B2B order lifecycle events
-- =====================================================

CREATE TABLE IF NOT EXISTS public.b2b_order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.b2b_orders(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'created', 'confirmed', 'processing', 'ready',
        'delivery_scheduled', 'delivery_partial', 'delivered',
        'payment_received', 'payment_partial',
        'modified', 'cancelled', 'note_added'
    )),
    previous_status TEXT,
    new_status TEXT,
    description TEXT NOT NULL,
    metadata JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_b2b_order_history_order_id ON public.b2b_order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_b2b_order_history_created_at ON public.b2b_order_history(created_at DESC);

-- RLS
ALTER TABLE public.b2b_order_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON public.b2b_order_history
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated insert" ON public.b2b_order_history
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
