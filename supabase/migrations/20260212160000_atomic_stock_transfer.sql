-- =====================================================
-- THE BREAKERY POS & MINI-ERP
-- Migration: Atomic Stock Transfer Function
-- Description: Replaces TOCTOU read-then-write pattern in
--              intersection_stock_movements Edge Function with
--              an atomic SQL function using row-level locking.
-- =====================================================

-- Atomic stock transfer function to prevent race conditions.
-- Handles three transfer scenarios:
--   1. Warehouse (products.current_stock) -> Section (section_stock)
--   2. Section (section_stock) -> Warehouse (products.current_stock)
--   3. Section -> Section (section_stock to section_stock)
--
-- Uses SELECT ... FOR UPDATE to lock source rows and prevent
-- concurrent modifications during the transfer.

CREATE OR REPLACE FUNCTION public.transfer_stock(
  p_product_id UUID,
  p_from_section_id UUID,  -- NULL means warehouse
  p_to_section_id UUID,    -- NULL means warehouse
  p_quantity DECIMAL,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_stock DECIMAL;
  v_new_source_stock DECIMAL;
  v_movement_id_out TEXT;
  v_movement_id_in TEXT;
  v_result JSONB;
BEGIN
  -- Validate inputs
  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'product_id is required';
  END IF;

  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'quantity must be greater than 0';
  END IF;

  IF p_from_section_id IS NULL AND p_to_section_id IS NULL THEN
    RAISE EXCEPTION 'At least one of from_section_id or to_section_id must be provided';
  END IF;

  -- Generate movement IDs
  v_movement_id_out := 'SM-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS') || '-' || SUBSTR(gen_random_uuid()::TEXT, 1, 8);
  v_movement_id_in := 'SM-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS') || '-' || SUBSTR(gen_random_uuid()::TEXT, 1, 8);

  -- ============================================
  -- STEP 1: Deduct from source (with row lock)
  -- ============================================

  IF p_from_section_id IS NULL THEN
    -- Source is warehouse: lock and deduct from products.current_stock
    SELECT current_stock INTO v_current_stock
    FROM public.products
    WHERE id = p_product_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', p_product_id;
    END IF;

    IF v_current_stock < p_quantity THEN
      RAISE EXCEPTION 'Insufficient warehouse stock: available %, requested %', v_current_stock, p_quantity;
    END IF;

    v_new_source_stock := v_current_stock - p_quantity;

    UPDATE public.products
    SET current_stock = v_new_source_stock
    WHERE id = p_product_id;

  ELSE
    -- Source is a section: lock and deduct from section_stock
    SELECT quantity INTO v_current_stock
    FROM public.section_stock
    WHERE product_id = p_product_id AND section_id = p_from_section_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
      RAISE EXCEPTION 'Product not found in source section';
    END IF;

    IF v_current_stock < p_quantity THEN
      RAISE EXCEPTION 'Insufficient section stock: available %, requested %', v_current_stock, p_quantity;
    END IF;

    v_new_source_stock := v_current_stock - p_quantity;

    UPDATE public.section_stock
    SET quantity = v_new_source_stock,
        updated_at = NOW()
    WHERE product_id = p_product_id AND section_id = p_from_section_id;

  END IF;

  -- ============================================
  -- STEP 2: Add to destination (upsert)
  -- ============================================

  IF p_to_section_id IS NULL THEN
    -- Destination is warehouse: add to products.current_stock
    UPDATE public.products
    SET current_stock = current_stock + p_quantity
    WHERE id = p_product_id;

  ELSE
    -- Destination is a section: upsert into section_stock
    INSERT INTO public.section_stock (product_id, section_id, quantity)
    VALUES (p_product_id, p_to_section_id, p_quantity)
    ON CONFLICT (section_id, product_id)
    DO UPDATE SET
      quantity = public.section_stock.quantity + p_quantity,
      updated_at = NOW();

  END IF;

  -- ============================================
  -- STEP 3: Record stock movements for audit
  -- ============================================

  INSERT INTO public.stock_movements (
    movement_id, product_id, movement_type, quantity,
    stock_before, stock_after, reason, staff_id,
    reference_type
  )
  VALUES (
    v_movement_id_out,
    p_product_id,
    'transfer_out'::public.movement_type,
    p_quantity,
    v_current_stock,
    v_new_source_stock,
    CASE
      WHEN p_to_section_id IS NOT NULL THEN 'Transfer out to section ' || p_to_section_id::TEXT
      ELSE 'Transfer out to warehouse'
    END,
    p_user_id,
    'section_transfer'
  );

  INSERT INTO public.stock_movements (
    movement_id, product_id, movement_type, quantity,
    stock_before, stock_after, reason, staff_id,
    reference_type
  )
  VALUES (
    v_movement_id_in,
    p_product_id,
    'transfer_in'::public.movement_type,
    p_quantity,
    COALESCE(
      CASE
        WHEN p_to_section_id IS NULL THEN (SELECT current_stock - p_quantity FROM public.products WHERE id = p_product_id)
        ELSE (SELECT quantity - p_quantity FROM public.section_stock WHERE product_id = p_product_id AND section_id = p_to_section_id)
      END,
      0
    ),
    COALESCE(
      CASE
        WHEN p_to_section_id IS NULL THEN (SELECT current_stock FROM public.products WHERE id = p_product_id)
        ELSE (SELECT quantity FROM public.section_stock WHERE product_id = p_product_id AND section_id = p_to_section_id)
      END,
      p_quantity
    ),
    CASE
      WHEN p_from_section_id IS NOT NULL THEN 'Transfer in from section ' || p_from_section_id::TEXT
      ELSE 'Transfer in from warehouse'
    END,
    p_user_id,
    'section_transfer'
  );

  -- ============================================
  -- STEP 4: Return result
  -- ============================================

  v_result := jsonb_build_object(
    'success', true,
    'remaining_source_stock', v_new_source_stock,
    'quantity_transferred', p_quantity
  );

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users (RLS on underlying tables still applies for reads)
GRANT EXECUTE ON FUNCTION public.transfer_stock TO authenticated;

COMMENT ON FUNCTION public.transfer_stock IS
  'Atomic stock transfer between warehouse and sections. Uses row-level locking (FOR UPDATE) to prevent race conditions.';
