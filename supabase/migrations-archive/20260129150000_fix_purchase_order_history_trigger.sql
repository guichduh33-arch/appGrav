-- Migration: Fix purchase order history trigger
-- Description: Fix the trigger function to properly map status changes to valid action_types
-- The original trigger used LOWER(NEW.status) which fails for 'draft' status as it's not a valid action_type
-- Date: 2026-01-29

-- Recreate the trigger function with proper action_type mapping
CREATE OR REPLACE FUNCTION log_purchase_order_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action_type TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- On insert, always log as 'created'
        INSERT INTO public.purchase_order_history (purchase_order_id, action_type, new_status, description, changed_by)
        VALUES (NEW.id, 'created', NEW.status, 'Bon de commande créé', NEW.created_by);
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        -- Map status to valid action_type
        CASE NEW.status
            WHEN 'draft' THEN v_action_type := 'modified';
            WHEN 'sent' THEN v_action_type := 'sent';
            WHEN 'confirmed' THEN v_action_type := 'confirmed';
            WHEN 'partially_received' THEN v_action_type := 'partially_received';
            WHEN 'received' THEN v_action_type := 'received';
            WHEN 'cancelled' THEN v_action_type := 'cancelled';
            WHEN 'modified' THEN v_action_type := 'modified';
            ELSE v_action_type := 'modified';
        END CASE;

        INSERT INTO public.purchase_order_history (purchase_order_id, action_type, previous_status, new_status, description, changed_by)
        VALUES (
            NEW.id,
            v_action_type,
            OLD.status,
            NEW.status,
            'Statut modifié de ' || COALESCE(OLD.status, 'aucun') || ' à ' || NEW.status,
            NEW.created_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS trigger_log_purchase_order_changes ON public.purchase_orders;
CREATE TRIGGER trigger_log_purchase_order_changes
    AFTER INSERT OR UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION log_purchase_order_changes();

-- Backfill history for existing purchase orders that have no history entries
INSERT INTO public.purchase_order_history (purchase_order_id, action_type, new_status, description, created_at)
SELECT
    po.id,
    'created',
    po.status,
    'Bon de commande créé (entrée rétroactive)',
    po.created_at
FROM public.purchase_orders po
WHERE NOT EXISTS (
    SELECT 1 FROM public.purchase_order_history poh
    WHERE poh.purchase_order_id = po.id
);

-- Add comment
COMMENT ON FUNCTION log_purchase_order_changes() IS 'Logs purchase order status changes to history table with proper action_type mapping';
