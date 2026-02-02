-- Migration: Fix b2b_order_totals trigger
-- Description: Update trigger function to use 'total' column instead of 'line_total'
-- The column was renamed but the trigger function still referenced the old name

CREATE OR REPLACE FUNCTION recalculate_b2b_order_totals()
RETURNS TRIGGER AS $$
DECLARE
    order_uuid UUID;
    new_subtotal NUMERIC(15,2);
    new_discount_amount NUMERIC(15,2);
    new_tax_amount NUMERIC(15,2);
    new_total NUMERIC(15,2);
    order_discount_type TEXT;
    order_discount_value NUMERIC(10,2);
    order_tax_rate NUMERIC(5,4);
    paid_amount NUMERIC(15,2);
BEGIN
    -- Get the order_id from the affected row
    IF TG_OP = 'DELETE' THEN
        order_uuid := OLD.order_id;
    ELSE
        order_uuid := NEW.order_id;
    END IF;

    -- Calculate subtotal from items (using 'total' column, not 'line_total')
    SELECT COALESCE(SUM(total), 0)
    INTO new_subtotal
    FROM public.b2b_order_items
    WHERE order_id = order_uuid;

    -- Get order discount and tax info
    SELECT discount_percent, COALESCE(discount_amount, 0), tax_rate, COALESCE(paid_amount, 0)
    INTO order_discount_value, order_discount_amount, order_tax_rate, paid_amount
    FROM public.b2b_orders
    WHERE id = order_uuid;

    -- Calculate discount (discount_percent is stored as percentage, not decimal)
    IF order_discount_value IS NOT NULL AND order_discount_value > 0 THEN
        new_discount_amount := new_subtotal * (order_discount_value / 100);
    ELSE
        new_discount_amount := 0;
    END IF;

    -- Calculate tax and total (tax_rate is stored as decimal, e.g., 0.10 = 10%)
    new_tax_amount := (new_subtotal - new_discount_amount) * order_tax_rate;
    new_total := new_subtotal - new_discount_amount + new_tax_amount;

    -- Update order totals
    UPDATE public.b2b_orders
    SET
        subtotal = new_subtotal,
        discount_amount = new_discount_amount,
        tax_amount = new_tax_amount,
        total = new_total
    WHERE id = order_uuid;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop the OLD trigger that references 'line_total' (from 027_b2b_sales_module.sql)
DROP TRIGGER IF EXISTS trigger_update_b2b_order_totals ON public.b2b_order_items;

-- Recreate the trigger with the new function
DROP TRIGGER IF EXISTS trigger_recalculate_b2b_order_totals ON public.b2b_order_items;
CREATE TRIGGER trigger_recalculate_b2b_order_totals
    AFTER INSERT OR UPDATE OR DELETE ON public.b2b_order_items
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_b2b_order_totals();
