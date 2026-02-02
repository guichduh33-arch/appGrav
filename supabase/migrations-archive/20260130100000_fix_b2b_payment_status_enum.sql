-- =============================================
-- Fix B2B Order Payment Status Trigger
-- The trigger was using TEXT but the column is payment_status ENUM
-- =============================================

-- First, check if payment_status column is an enum and convert if necessary
DO $$
BEGIN
    -- Check if payment_status is using the enum type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'b2b_orders'
        AND column_name = 'payment_status'
        AND udt_name = 'payment_status'
    ) THEN
        -- Column uses enum type, we need to fix the trigger
        RAISE NOTICE 'payment_status uses enum type, updating trigger...';
    ELSE
        RAISE NOTICE 'payment_status is TEXT type, checking if needs enum conversion...';
    END IF;
END $$;

-- Recreate the trigger function with proper enum casting
CREATE OR REPLACE FUNCTION update_b2b_order_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    order_uuid UUID;
    total_paid NUMERIC(12,2);
    order_total NUMERIC(12,2);
    new_payment_status TEXT;
BEGIN
    order_uuid := COALESCE(NEW.order_id, OLD.order_id);

    -- Calculate total paid
    SELECT COALESCE(SUM(amount), 0)
    INTO total_paid
    FROM public.b2b_payments
    WHERE order_id = order_uuid AND status = 'completed';

    -- Get order total (using total or total_amount depending on schema)
    SELECT COALESCE(total, total_amount, 0)
    INTO order_total
    FROM public.b2b_orders
    WHERE id = order_uuid;

    -- Determine payment status
    IF total_paid >= order_total AND order_total > 0 THEN
        new_payment_status := 'paid';
    ELSIF total_paid > 0 THEN
        new_payment_status := 'partial';
    ELSE
        new_payment_status := 'unpaid';
    END IF;

    -- Update order - cast to payment_status enum if that's the column type
    -- This handles both TEXT and ENUM column types
    BEGIN
        -- Try direct update (works if column is TEXT)
        UPDATE public.b2b_orders
        SET
            paid_amount = total_paid,
            payment_status = new_payment_status::payment_status
        WHERE id = order_uuid;
    EXCEPTION WHEN OTHERS THEN
        -- If enum cast fails, try as TEXT
        UPDATE public.b2b_orders
        SET
            paid_amount = total_paid,
            payment_status = new_payment_status
        WHERE id = order_uuid;
    END;

    -- Log payment in history (only if table exists)
    IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
        BEGIN
            INSERT INTO public.b2b_order_history (order_id, action_type, description, metadata, created_by)
            VALUES (
                order_uuid,
                CASE WHEN new_payment_status = 'paid' THEN 'payment_received' ELSE 'payment_partial' END,
                'Paiement reçu: ' || NEW.amount || ' IDR via ' || NEW.payment_method,
                jsonb_build_object('payment_id', NEW.id, 'amount', NEW.amount, 'method', NEW.payment_method),
                NEW.received_by
            );
        EXCEPTION WHEN OTHERS THEN
            -- History table might not exist, ignore error
            NULL;
        END;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS trigger_update_b2b_order_payment_status ON public.b2b_payments;
CREATE TRIGGER trigger_update_b2b_order_payment_status
    AFTER INSERT OR UPDATE OR DELETE ON public.b2b_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_b2b_order_payment_status();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_b2b_order_payment_status() TO authenticated;
GRANT EXECUTE ON FUNCTION update_b2b_order_payment_status() TO anon;
