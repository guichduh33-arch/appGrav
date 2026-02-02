-- Migration: 062_inventory_production_enhancements
-- Epic 9: Inventaire & Production
-- Stories: 9.3 (Production Stock Deduction), 9.5 (PO Receipt Stock Update)

-- Story 9.3: Function to deduct recipe ingredients when production is recorded
CREATE OR REPLACE FUNCTION public.deduct_production_ingredients(
    p_production_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product_id UUID;
    v_quantity DECIMAL;
    v_recipe RECORD;
BEGIN
    -- Get production record details
    SELECT product_id, quantity_produced
    INTO v_product_id, v_quantity
    FROM public.production_records
    WHERE id = p_production_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Production record not found';
    END IF;

    -- Deduct each ingredient based on recipe
    FOR v_recipe IN
        SELECT r.ingredient_id, r.quantity_needed, p.name as ingredient_name
        FROM public.recipes r
        JOIN public.products p ON p.id = r.ingredient_id
        WHERE r.product_id = v_product_id
    LOOP
        -- Create stock movement for deduction
        INSERT INTO public.stock_movements (
            product_id,
            movement_type,
            quantity,
            reference_type,
            reference_id,
            notes,
            created_by
        )
        VALUES (
            v_recipe.ingredient_id,
            'production_use',
            -(v_recipe.quantity_needed * v_quantity),
            'production',
            p_production_id,
            'Déduction automatique pour production',
            auth.uid()
        );

        -- Update product stock
        UPDATE public.products
        SET stock_quantity = COALESCE(stock_quantity, 0) - (v_recipe.quantity_needed * v_quantity),
            updated_at = NOW()
        WHERE id = v_recipe.ingredient_id;
    END LOOP;

    -- Also increase stock of produced item
    INSERT INTO public.stock_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes,
        created_by
    )
    VALUES (
        v_product_id,
        'production',
        v_quantity,
        'production',
        p_production_id,
        'Production enregistrée',
        auth.uid()
    );

    UPDATE public.products
    SET stock_quantity = COALESCE(stock_quantity, 0) + v_quantity,
        updated_at = NOW()
    WHERE id = v_product_id;

    RETURN TRUE;
END;
$$;

-- Story 9.5: Function to receive PO items and update stock
CREATE OR REPLACE FUNCTION public.receive_po_items(
    p_po_id UUID,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item RECORD;
    v_received_count INT := 0;
    v_po_status VARCHAR;
BEGIN
    -- Check PO exists
    SELECT status INTO v_po_status
    FROM public.purchase_orders
    WHERE id = p_po_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Purchase order not found';
    END IF;

    -- Process each item
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        po_item_id UUID,
        quantity_received DECIMAL
    )
    LOOP
        -- Update PO item received quantity
        UPDATE public.po_items
        SET received_quantity = COALESCE(received_quantity, 0) + v_item.quantity_received,
            updated_at = NOW()
        WHERE id = v_item.po_item_id
          AND po_id = p_po_id;

        IF FOUND THEN
            -- Get product_id for this PO item
            DECLARE
                v_product_id UUID;
                v_unit_price DECIMAL;
            BEGIN
                SELECT product_id, unit_price
                INTO v_product_id, v_unit_price
                FROM public.po_items
                WHERE id = v_item.po_item_id;

                -- Create stock movement
                INSERT INTO public.stock_movements (
                    product_id,
                    movement_type,
                    quantity,
                    unit_cost,
                    reference_type,
                    reference_id,
                    notes,
                    created_by
                )
                VALUES (
                    v_product_id,
                    'purchase',
                    v_item.quantity_received,
                    v_unit_price,
                    'purchase_order',
                    p_po_id,
                    'Réception bon de commande',
                    auth.uid()
                );

                -- Update product stock
                UPDATE public.products
                SET stock_quantity = COALESCE(stock_quantity, 0) + v_item.quantity_received,
                    updated_at = NOW()
                WHERE id = v_product_id;

                v_received_count := v_received_count + 1;
            END;
        END IF;
    END LOOP;

    -- Check if PO is fully received
    IF NOT EXISTS (
        SELECT 1
        FROM public.po_items
        WHERE po_id = p_po_id
          AND COALESCE(received_quantity, 0) < ordered_quantity
    ) THEN
        UPDATE public.purchase_orders
        SET status = 'received',
            received_at = NOW(),
            updated_at = NOW()
        WHERE id = p_po_id;
    ELSE
        -- Partial receive
        UPDATE public.purchase_orders
        SET status = 'partial',
            updated_at = NOW()
        WHERE id = p_po_id
          AND status != 'partial';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'items_received', v_received_count
    );
END;
$$;

-- Trigger to auto-deduct ingredients on production record insert
CREATE OR REPLACE FUNCTION public.trigger_production_stock_deduction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only deduct if status indicates completion
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        PERFORM public.deduct_production_ingredients(NEW.id);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_production_stock_deduction ON public.production_records;
CREATE TRIGGER trg_production_stock_deduction
    AFTER INSERT OR UPDATE ON public.production_records
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_production_stock_deduction();

-- Add status column to production_records if not exists
ALTER TABLE public.production_records
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.deduct_production_ingredients(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.receive_po_items(UUID, JSONB) TO authenticated;
