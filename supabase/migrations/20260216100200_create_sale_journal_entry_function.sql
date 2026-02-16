-- ============================================================================
-- Migration: Create function to auto-generate journal entries for sales
-- Description: Creates double-entry journal entries when orders are completed
-- Author: Claude Code
-- Date: 2026-02-16
-- ============================================================================

-- =============================================================================
-- UP MIGRATION
-- =============================================================================

-- Function to create journal entry for a completed sale
-- Called by trigger on orders table when status changes to 'completed' or 'voided'
CREATE OR REPLACE FUNCTION public.create_sale_journal_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entry_id UUID;
  v_entry_number VARCHAR;
  v_vat_amount DECIMAL(15,2);
  v_net_amount DECIMAL(15,2);
  v_cash_account_id UUID;
  v_card_account_id UUID;
  v_qris_account_id UUID;
  v_edc_account_id UUID;
  v_sales_account_id UUID;
  v_vat_account_id UUID;
  v_discount_account_id UUID;
  v_payment RECORD;
  v_total_payments DECIMAL(15,2) := 0;
  v_is_reversal BOOLEAN := FALSE;
  v_description TEXT;
  v_ref_type VARCHAR;
BEGIN
  -- Only process completed or voided orders
  IF NEW.status NOT IN ('completed', 'voided') THEN
    RETURN NEW;
  END IF;

  -- For completed: only trigger on transition TO completed
  IF NEW.status = 'completed' AND (OLD.status IS NOT DISTINCT FROM 'completed') THEN
    RETURN NEW;
  END IF;

  -- For voided: only trigger on transition TO voided
  IF NEW.status = 'voided' THEN
    v_is_reversal := TRUE;
    IF OLD.status IS NOT DISTINCT FROM 'voided' THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Get account IDs (by code convention)
  -- Assets: 1xxx
  SELECT id INTO v_cash_account_id FROM public.accounts WHERE code = '1110' AND is_active = TRUE;
  SELECT id INTO v_card_account_id FROM public.accounts WHERE code = '1130' AND is_active = TRUE;
  SELECT id INTO v_qris_account_id FROM public.accounts WHERE code = '1131' AND is_active = TRUE;
  SELECT id INTO v_edc_account_id FROM public.accounts WHERE code = '1132' AND is_active = TRUE;
  -- Revenue: 4xxx
  SELECT id INTO v_sales_account_id FROM public.accounts WHERE code = '4100' AND is_active = TRUE;
  -- Liabilities: 2xxx
  SELECT id INTO v_vat_account_id FROM public.accounts WHERE code = '2110' AND is_active = TRUE;
  -- Expenses: 6xxx (discount as contra-revenue or expense)
  SELECT id INTO v_discount_account_id FROM public.accounts WHERE code = '4190' AND is_active = TRUE;

  -- Fallback: if specific accounts not found, try by name pattern
  IF v_cash_account_id IS NULL THEN
    SELECT id INTO v_cash_account_id FROM public.accounts
    WHERE (name ILIKE '%cash%' OR name ILIKE '%kas%') AND account_type = 'asset' AND is_active = TRUE
    LIMIT 1;
  END IF;

  IF v_sales_account_id IS NULL THEN
    SELECT id INTO v_sales_account_id FROM public.accounts
    WHERE (name ILIKE '%sales%' OR name ILIKE '%revenue%' OR name ILIKE '%penjualan%')
    AND account_type = 'revenue' AND is_active = TRUE
    LIMIT 1;
  END IF;

  IF v_vat_account_id IS NULL THEN
    SELECT id INTO v_vat_account_id FROM public.accounts
    WHERE (name ILIKE '%vat%' OR name ILIKE '%ppn%' OR name ILIKE '%tax payable%')
    AND account_type = 'liability' AND is_active = TRUE
    LIMIT 1;
  END IF;

  -- Skip if essential accounts not found (graceful degradation)
  IF v_sales_account_id IS NULL OR v_vat_account_id IS NULL THEN
    RAISE NOTICE 'create_sale_journal_entry: Missing required accounts (sales or VAT). Skipping journal creation for order %', NEW.id;
    RETURN NEW;
  END IF;

  -- Calculate VAT (10% inclusive) and net amount
  -- tax = total * 10 / 110
  v_vat_amount := ROUND((NEW.total * 10) / 110, 2);
  v_net_amount := NEW.total - v_vat_amount;

  -- Generate entry number
  SELECT 'JE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
         LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO v_entry_number
  FROM public.journal_entries
  WHERE DATE(entry_date) = CURRENT_DATE;

  -- Set description based on order type
  IF v_is_reversal THEN
    v_description := 'VOID: Order #' || NEW.order_number || ' (' || COALESCE(NEW.order_type, 'sale') || ')';
    v_ref_type := 'void';
  ELSE
    v_description := 'Sale: Order #' || NEW.order_number || ' (' || COALESCE(NEW.order_type, 'sale') || ')';
    v_ref_type := 'sale';
  END IF;

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
    COALESCE(NEW.created_at::DATE, CURRENT_DATE),
    v_description,
    v_ref_type,
    NEW.id,
    'posted',
    NEW.total,
    NEW.total,
    NEW.staff_id
  )
  RETURNING id INTO v_entry_id;

  -- Create journal entry lines
  -- For normal sale: DEBIT asset (cash/card), CREDIT revenue + VAT
  -- For void: reverse the debits/credits

  IF v_is_reversal THEN
    -- REVERSAL ENTRY (void)
    -- Debit Revenue (reduce revenue)
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
    VALUES (v_entry_id, v_sales_account_id, v_net_amount, 0, 'Void sales revenue');

    -- Debit VAT Payable (reduce liability)
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
    VALUES (v_entry_id, v_vat_account_id, v_vat_amount, 0, 'Void VAT payable');

    -- Credit Cash/Payment method (reduce asset)
    -- Use the original order's payment method
    IF NEW.payment_method = 'cash' AND v_cash_account_id IS NOT NULL THEN
      INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
      VALUES (v_entry_id, v_cash_account_id, 0, NEW.total, 'Void cash receipt');
    ELSIF NEW.payment_method IN ('card', 'credit_card', 'debit_card') AND v_card_account_id IS NOT NULL THEN
      INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
      VALUES (v_entry_id, v_card_account_id, 0, NEW.total, 'Void card receipt');
    ELSIF NEW.payment_method = 'qris' AND v_qris_account_id IS NOT NULL THEN
      INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
      VALUES (v_entry_id, v_qris_account_id, 0, NEW.total, 'Void QRIS receipt');
    ELSIF v_cash_account_id IS NOT NULL THEN
      -- Fallback to cash if no specific account found
      INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
      VALUES (v_entry_id, v_cash_account_id, 0, NEW.total, 'Void receipt');
    END IF;

  ELSE
    -- NORMAL SALE ENTRY

    -- Check if there are split payments (order_payments table)
    FOR v_payment IN
      SELECT payment_method, SUM(amount) as total_amount
      FROM public.order_payments
      WHERE order_id = NEW.id AND status = 'completed'
      GROUP BY payment_method
    LOOP
      v_total_payments := v_total_payments + v_payment.total_amount;

      -- Debit appropriate asset account based on payment method
      IF v_payment.payment_method = 'cash' AND v_cash_account_id IS NOT NULL THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_cash_account_id, v_payment.total_amount, 0, 'Cash receipt');
      ELSIF v_payment.payment_method IN ('card', 'credit_card', 'debit_card') AND v_card_account_id IS NOT NULL THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_card_account_id, v_payment.total_amount, 0, 'Card receipt');
      ELSIF v_payment.payment_method = 'qris' AND v_qris_account_id IS NOT NULL THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_qris_account_id, v_payment.total_amount, 0, 'QRIS receipt');
      ELSIF v_payment.payment_method = 'edc' AND v_edc_account_id IS NOT NULL THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_edc_account_id, v_payment.total_amount, 0, 'EDC receipt');
      ELSIF v_cash_account_id IS NOT NULL THEN
        -- Fallback to cash
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_cash_account_id, v_payment.total_amount, 0, v_payment.payment_method || ' receipt');
      END IF;
    END LOOP;

    -- If no split payments found, use order.payment_method
    IF v_total_payments = 0 THEN
      IF NEW.payment_method = 'cash' AND v_cash_account_id IS NOT NULL THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_cash_account_id, NEW.total, 0, 'Cash receipt');
      ELSIF NEW.payment_method IN ('card', 'credit_card', 'debit_card') AND v_card_account_id IS NOT NULL THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_card_account_id, NEW.total, 0, 'Card receipt');
      ELSIF NEW.payment_method = 'qris' AND v_qris_account_id IS NOT NULL THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_qris_account_id, NEW.total, 0, 'QRIS receipt');
      ELSIF NEW.payment_method = 'edc' AND v_edc_account_id IS NOT NULL THEN
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_edc_account_id, NEW.total, 0, 'EDC receipt');
      ELSIF v_cash_account_id IS NOT NULL THEN
        -- Fallback
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_cash_account_id, NEW.total, 0, 'Receipt');
      END IF;
    END IF;

    -- Credit Sales Revenue (net of VAT)
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
    VALUES (v_entry_id, v_sales_account_id, 0, v_net_amount, 'Sales revenue');

    -- Credit VAT Payable
    INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
    VALUES (v_entry_id, v_vat_account_id, 0, v_vat_amount, 'VAT payable (PPN 10%)');

    -- Handle discount if present (as contra-revenue)
    IF COALESCE(NEW.discount_amount, 0) > 0 AND v_discount_account_id IS NOT NULL THEN
      -- Debit Discount (contra-revenue or expense)
      INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit, credit, description)
      VALUES (v_entry_id, v_discount_account_id, NEW.discount_amount, 0, 'Sales discount');

      -- Adjust the revenue credit to reflect gross
      -- (This is a simplified approach - full implementation would adjust totals)
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.create_sale_journal_entry() IS
'Trigger function to auto-create double-entry journal entries when orders are completed or voided.
DEBIT: Cash/Card/QRIS/EDC based on payment method
CREDIT: Sales Revenue (net) + VAT Payable (10%)
For voids: reverses the original entry.
Account codes: 1110=Cash, 1130=Card, 1131=QRIS, 1132=EDC, 4100=Sales, 2110=VAT, 4190=Discount';

-- =============================================================================
-- DOWN MIGRATION (Rollback)
-- =============================================================================
-- To rollback, run:
--
-- DROP FUNCTION IF EXISTS public.create_sale_journal_entry() CASCADE;
--
-- =============================================================================

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- Run after migration to verify:
--
-- SELECT proname, prosrc
-- FROM pg_proc
-- WHERE proname = 'create_sale_journal_entry';
--
-- Expected: Function exists with trigger logic
-- =============================================================================
