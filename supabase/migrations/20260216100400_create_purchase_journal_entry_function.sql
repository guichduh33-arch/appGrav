-- ============================================================================
-- Migration: Create function to auto-generate journal entries for purchases
-- Description: Creates double-entry journal entries when POs are received
-- Author: Claude Code
-- Date: 2026-02-16
-- ============================================================================

-- =============================================================================
-- UP MIGRATION
-- =============================================================================

-- Function to create journal entry for a received purchase order
-- Called by trigger on purchase_orders table when status changes to 'received'
CREATE OR REPLACE FUNCTION public.create_purchase_journal_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entry_id UUID;
  v_entry_number VARCHAR;
  v_vat_amount DECIMAL(15,2);
  v_net_amount DECIMAL(15,2);
  v_inventory_account_id UUID;
  v_expense_account_id UUID;
  v_vat_input_account_id UUID;
  v_ap_account_id UUID;
  v_cash_account_id UUID;
  v_description TEXT;
  v_supplier_name TEXT;
  v_debit_account_id UUID;
BEGIN
  -- Only process received purchase orders
  IF NEW.status != 'received' THEN
    RETURN NEW;
  END IF;

  -- Only trigger on transition TO received
  IF OLD.status IS NOT DISTINCT FROM 'received' THEN
    RETURN NEW;
  END IF;

  -- Get supplier name for description
  SELECT name INTO v_supplier_name
  FROM public.suppliers
  WHERE id = NEW.supplier_id;

  -- Get account IDs (by code convention)
  -- Assets: 1xxx
  SELECT id INTO v_inventory_account_id FROM public.accounts WHERE code = '1300' AND is_active = TRUE;
  SELECT id INTO v_cash_account_id FROM public.accounts WHERE code = '1110' AND is_active = TRUE;
  -- Assets: VAT Input (receivable)
  SELECT id INTO v_vat_input_account_id FROM public.accounts WHERE code = '1400' AND is_active = TRUE;
  -- Liabilities: 2xxx
  SELECT id INTO v_ap_account_id FROM public.accounts WHERE code = '2100' AND is_active = TRUE;
  -- Expenses: 5xxx (Cost of Goods) or 6xxx (Operating)
  SELECT id INTO v_expense_account_id FROM public.accounts WHERE code = '5100' AND is_active = TRUE;

  -- Fallback: if specific accounts not found, try by name pattern
  IF v_inventory_account_id IS NULL THEN
    SELECT id INTO v_inventory_account_id FROM public.accounts
    WHERE (name ILIKE '%inventory%' OR name ILIKE '%stock%' OR name ILIKE '%persediaan%')
    AND account_type = 'asset' AND is_active = TRUE
    LIMIT 1;
  END IF;

  IF v_vat_input_account_id IS NULL THEN
    SELECT id INTO v_vat_input_account_id FROM public.accounts
    WHERE (name ILIKE '%vat input%' OR name ILIKE '%ppn masukan%' OR name ILIKE '%tax receivable%')
    AND account_type = 'asset' AND is_active = TRUE
    LIMIT 1;
  END IF;

  IF v_ap_account_id IS NULL THEN
    SELECT id INTO v_ap_account_id FROM public.accounts
    WHERE (name ILIKE '%payable%' OR name ILIKE '%utang%' OR name ILIKE '%hutang%')
    AND account_type = 'liability' AND is_active = TRUE
    LIMIT 1;
  END IF;

  IF v_expense_account_id IS NULL THEN
    SELECT id INTO v_expense_account_id FROM public.accounts
    WHERE (name ILIKE '%cost of goods%' OR name ILIKE '%cogs%' OR name ILIKE '%harga pokok%')
    AND account_type = 'expense' AND is_active = TRUE
    LIMIT 1;
  END IF;

  -- Skip if essential accounts not found
  IF v_ap_account_id IS NULL THEN
    RAISE NOTICE 'create_purchase_journal_entry: Missing required accounts (AP). Skipping journal creation for PO %', NEW.id;
    RETURN NEW;
  END IF;

  -- Determine debit account based on expense_type or use inventory by default
  IF NEW.expense_type IN ('ingredients', 'raw_materials') AND v_inventory_account_id IS NOT NULL THEN
    v_debit_account_id := v_inventory_account_id;
  ELSIF NEW.expense_type IS NOT NULL AND v_expense_account_id IS NOT NULL THEN
    v_debit_account_id := v_expense_account_id;
  ELSIF v_inventory_account_id IS NOT NULL THEN
    v_debit_account_id := v_inventory_account_id;
  ELSIF v_expense_account_id IS NOT NULL THEN
    v_debit_account_id := v_expense_account_id;
  ELSE
    RAISE NOTICE 'create_purchase_journal_entry: No debit account found. Skipping journal for PO %', NEW.id;
    RETURN NEW;
  END IF;

  -- Calculate VAT and net amount
  -- Use tax_amount from PO if available, otherwise calculate (10% inclusive or from tax_rate)
  v_vat_amount := COALESCE(NEW.tax_amount, 0);
  v_net_amount := COALESCE(NEW.total_amount, 0) - v_vat_amount;

  -- If tax_rate is provided and tax_amount is null, calculate
  IF v_vat_amount = 0 AND COALESCE(NEW.tax_rate, 0) > 0 THEN
    v_vat_amount := ROUND(COALESCE(NEW.subtotal, 0) * NEW.tax_rate, 2);
    v_net_amount := COALESCE(NEW.subtotal, 0);
  END IF;

  -- Generate entry number
  SELECT 'JE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
         LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO v_entry_number
  FROM public.journal_entries
  WHERE DATE(entry_date) = CURRENT_DATE;

  -- Set description
  v_description := 'Purchase: PO #' || NEW.po_number || ' from ' || COALESCE(v_supplier_name, 'Unknown');

  -- Create journal entry header
  INSERT INTO public.journal_entries (
    entry_number,
    entry_date,
    description,
    reference_type,
    reference_id,
    status,
    total_debit,
    total_credit,
    created_by
  ) VALUES (
    v_entry_number,
    COALESCE(NEW.actual_delivery_date::DATE, NEW.order_date::DATE, CURRENT_DATE),
    v_description,
    'purchase',
    NEW.id,
    'posted',
    COALESCE(NEW.total_amount, 0),
    COALESCE(NEW.total_amount, 0),
    NEW.received_by
  )
  RETURNING id INTO v_entry_id;

  -- Create journal entry lines
  -- Standard purchase entry:
  -- DEBIT Inventory/Expense (net amount)
  -- DEBIT VAT Input (if applicable)
  -- CREDIT Accounts Payable (total amount)

  -- Debit: Inventory or Expense (net of VAT)
  INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
  VALUES (v_entry_id, v_debit_account_id, v_net_amount, 0, 'Goods received');

  -- Debit: VAT Input (if VAT exists and account available)
  IF v_vat_amount > 0 AND v_vat_input_account_id IS NOT NULL THEN
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
    VALUES (v_entry_id, v_vat_input_account_id, v_vat_amount, 0, 'VAT input (PPN Masukan)');
  END IF;

  -- Credit: Accounts Payable (or Cash if already paid)
  IF NEW.payment_status = 'paid' AND v_cash_account_id IS NOT NULL THEN
    -- Already paid - credit cash
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
    VALUES (v_entry_id, v_cash_account_id, 0, COALESCE(NEW.total_amount, 0), 'Cash payment');
  ELSE
    -- Not yet paid - credit AP
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
    VALUES (v_entry_id, v_ap_account_id, 0, COALESCE(NEW.total_amount, 0), 'Accounts payable');
  END IF;

  -- Handle shipping cost as separate expense if exists
  IF COALESCE(NEW.shipping_cost, 0) > 0 AND v_expense_account_id IS NOT NULL THEN
    -- Note: shipping is typically already included in total_amount
    -- This is for documentation purposes only
    NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.create_purchase_journal_entry() IS
'Trigger function to auto-create double-entry journal entries when purchase orders are received.
DEBIT: Inventory (1300) or Expense (5100) based on expense_type + VAT Input (1400)
CREDIT: Accounts Payable (2100) or Cash (1110) if already paid
Handles both inventory purchases and direct expenses.';

-- =============================================================================
-- DOWN MIGRATION (Rollback)
-- =============================================================================
-- To rollback, run:
--
-- DROP FUNCTION IF EXISTS public.create_purchase_journal_entry() CASCADE;
--
-- =============================================================================

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- Run after migration to verify:
--
-- SELECT proname, prosrc
-- FROM pg_proc
-- WHERE proname = 'create_purchase_journal_entry';
--
-- Expected: Function exists with trigger logic
-- =============================================================================
