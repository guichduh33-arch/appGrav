-- =====================================================
-- Migration: Thread-safe invoice number generation (S9)
-- Creates a database function that atomically generates
-- invoice numbers using pg_advisory_xact_lock to prevent
-- duplicate numbers under concurrent requests.
-- Also adds a unique index on invoice_number for safety.
-- =====================================================

-- Add unique index on invoice_number (allows NULLs, prevents duplicate non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_b2b_orders_invoice_number_unique
  ON public.b2b_orders (invoice_number)
  WHERE invoice_number IS NOT NULL;

-- Function: generate_next_invoice_number
-- Atomically assigns an invoice number to a b2b_order.
-- Uses pg_advisory_xact_lock to serialize concurrent callers.
-- Returns the existing invoice_number if one is already set.
-- Format: INV-YYYYMMDD-NNN (zero-padded 3-digit sequence per day)
CREATE OR REPLACE FUNCTION public.generate_next_invoice_number(p_order_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing TEXT;
  v_date_str TEXT;
  v_prefix TEXT;
  v_count INT;
  v_invoice_number TEXT;
BEGIN
  -- Check if order already has an invoice number (no lock needed for read)
  SELECT invoice_number INTO v_existing
    FROM public.b2b_orders
   WHERE id = p_order_id;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  -- Acquire an advisory lock scoped to invoice generation.
  -- Lock ID 7283946 is an arbitrary constant chosen for this purpose.
  -- pg_advisory_xact_lock is automatically released at end of transaction.
  PERFORM pg_advisory_xact_lock(7283946);

  -- Re-check after acquiring lock (another transaction may have set it)
  SELECT invoice_number INTO v_existing
    FROM public.b2b_orders
   WHERE id = p_order_id;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  -- Build the date prefix
  v_date_str := to_char(CURRENT_DATE, 'YYYYMMDD');
  v_prefix := 'INV-' || v_date_str || '-';

  -- Count existing invoice numbers with this prefix (serialized by advisory lock)
  SELECT COUNT(*) INTO v_count
    FROM public.b2b_orders
   WHERE invoice_number LIKE v_prefix || '%';

  v_invoice_number := v_prefix || lpad((v_count + 1)::TEXT, 3, '0');

  -- Atomically update the order
  UPDATE public.b2b_orders
     SET invoice_number = v_invoice_number,
         invoice_generated_at = NOW()
   WHERE id = p_order_id
     AND invoice_number IS NULL;

  -- Verify the update succeeded (handles edge case where order doesn't exist)
  IF NOT FOUND THEN
    -- Order may not exist or was updated between our check and update
    SELECT invoice_number INTO v_existing
      FROM public.b2b_orders
     WHERE id = p_order_id;

    IF v_existing IS NOT NULL THEN
      RETURN v_existing;
    END IF;

    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  RETURN v_invoice_number;
END;
$$;

-- Grant execute to authenticated users (Edge Functions use service role,
-- but this ensures the function is callable via RPC as well)
GRANT EXECUTE ON FUNCTION public.generate_next_invoice_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_next_invoice_number(UUID) TO service_role;
