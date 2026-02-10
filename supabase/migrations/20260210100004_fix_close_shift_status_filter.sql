-- DB-004: Fix close_shift() to use payment_status = 'paid' instead of status = 'completed'
-- The current function filters orders by status = 'completed' which misses paid orders
-- that might be in a different workflow status. payment_status = 'paid' is the correct filter.

CREATE OR REPLACE FUNCTION public.close_shift(
    p_session_id UUID,
    p_actual_cash DECIMAL,
    p_actual_qris DECIMAL,
    p_actual_edc DECIMAL,
    p_closed_by VARCHAR,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_cash_diff DECIMAL;
    v_qris_diff DECIMAL;
    v_edc_diff DECIMAL;
    v_total_sales DECIMAL;
    v_transaction_count INTEGER;
    v_closed_by_uuid UUID;
BEGIN
    -- Get current session
    SELECT id, opening_cash, expected_cash, expected_qris, expected_edc, status
    INTO v_session
    FROM public.pos_sessions
    WHERE id = p_session_id AND status = 'open';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found or already closed';
    END IF;

    -- Calculate totals from orders - FIX: use payment_status = 'paid' instead of status = 'completed'
    SELECT
        COALESCE(SUM(total), 0),
        COUNT(*)
    INTO v_total_sales, v_transaction_count
    FROM public.orders
    WHERE (session_id = p_session_id OR pos_session_id = p_session_id)
      AND payment_status = 'paid';

    -- Calculate differences
    v_cash_diff := p_actual_cash - COALESCE(v_session.expected_cash, v_session.opening_cash);
    v_qris_diff := p_actual_qris - COALESCE(v_session.expected_qris, 0);
    v_edc_diff := p_actual_edc - COALESCE(v_session.expected_edc, 0);

    -- Try to get UUID for closed_by (in case it's passed as UUID string)
    BEGIN
        v_closed_by_uuid := p_closed_by::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_closed_by_uuid := NULL;
    END;

    -- Update session
    UPDATE public.pos_sessions
    SET
        status = 'closed',
        closed_at = NOW(),
        actual_cash = p_actual_cash,
        actual_qris = p_actual_qris,
        actual_edc = p_actual_edc,
        cash_difference = v_cash_diff,
        qris_difference = v_qris_diff,
        edc_difference = v_edc_diff,
        total_sales = v_total_sales,
        transaction_count = v_transaction_count,
        closed_by = v_closed_by_uuid,
        closed_by_name = p_closed_by,
        notes = COALESCE(p_notes, notes),
        updated_at = NOW()
    WHERE id = p_session_id;

    RETURN jsonb_build_object(
        'session_id', p_session_id,
        'status', 'closed',
        'total_sales', v_total_sales,
        'transaction_count', v_transaction_count,
        'reconciliation', jsonb_build_object(
            'cash', jsonb_build_object(
                'expected', COALESCE(v_session.expected_cash, v_session.opening_cash),
                'actual', p_actual_cash,
                'difference', v_cash_diff
            ),
            'qris', jsonb_build_object(
                'expected', COALESCE(v_session.expected_qris, 0),
                'actual', p_actual_qris,
                'difference', v_qris_diff
            ),
            'edc', jsonb_build_object(
                'expected', COALESCE(v_session.expected_edc, 0),
                'actual', p_actual_edc,
                'difference', v_edc_diff
            )
        )
    );
END;
$$;
