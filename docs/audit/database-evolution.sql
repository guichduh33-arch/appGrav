-- ============================================================
-- AppGrav Database Evolution Plan
-- Based on: Comprehensive audit (February 9, 2026)
-- Purpose: SQL migrations for identified gaps and improvements
-- ============================================================
-- IMPORTANT: Apply these migrations incrementally, not all at once.
-- Each section corresponds to a feature from the improvement roadmap.
-- ============================================================

-- ============================================================
-- PHASE 1: Immediate Fixes & Improvements
-- ============================================================

-- 1.1 Idempotency Keys (Prevent duplicate sync operations)
-- Priority: P1 | Roadmap: Phase 1, Sprint 2
-- ============================================================

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key VARCHAR(255) PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);

CREATE INDEX idx_idempotency_keys_expires ON public.idempotency_keys(expires_at);

-- Cleanup function (run daily via pg_cron or scheduled edge function)
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM public.idempotency_keys WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.idempotency_keys
  USING (auth.uid() IS NOT NULL);


-- 1.2 Sync Conflicts Table (Track offline conflicts)
-- Priority: P1 | Roadmap: Phase 2, Sprint 3
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  local_version JSONB NOT NULL,
  server_version JSONB NOT NULL,
  resolution VARCHAR(20) DEFAULT 'pending',
  resolved_by UUID REFERENCES public.user_profiles(id),
  resolved_at TIMESTAMPTZ,
  device_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_resolution CHECK (
    resolution IN ('pending', 'local_wins', 'server_wins', 'merged', 'dismissed')
  )
);

CREATE INDEX idx_sync_conflicts_status ON public.sync_conflicts(resolution) WHERE resolution = 'pending';
CREATE INDEX idx_sync_conflicts_entity ON public.sync_conflicts(entity_type, entity_id);

ALTER TABLE public.sync_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read" ON public.sync_conflicts
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated insert" ON public.sync_conflicts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based update" ON public.sync_conflicts
  FOR UPDATE USING (public.user_has_permission(auth.uid(), 'settings.update'));


-- ============================================================
-- PHASE 2: Feature Additions
-- ============================================================

-- 2.1 Payment Gateway Integration
-- Priority: P1 | Roadmap: Phase 2, Sprint 4
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  gateway VARCHAR(50) NOT NULL,
  gateway_transaction_id VARCHAR(255),
  payment_type VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  status VARCHAR(20) DEFAULT 'pending',
  gateway_response JSONB,
  idempotency_key VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_gateway CHECK (gateway IN ('midtrans', 'xendit', 'manual')),
  CONSTRAINT valid_payment_status CHECK (
    status IN ('pending', 'processing', 'settled', 'failed', 'cancelled', 'refunded')
  ),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_payment_transactions_order ON public.payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_gateway ON public.payment_transactions(gateway, status);
CREATE INDEX idx_payment_transactions_idempotency ON public.payment_transactions(idempotency_key);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read" ON public.payment_transactions
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based insert" ON public.payment_transactions
  FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'sales.create'));


-- Payment Reconciliation
CREATE TABLE IF NOT EXISTS public.payment_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  expected_total DECIMAL(15,2),
  actual_total DECIMAL(15,2),
  discrepancy DECIMAL(15,2) GENERATED ALWAYS AS (actual_total - expected_total) STORED,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  reconciled_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_reconciliation_status CHECK (
    status IN ('pending', 'matched', 'discrepancy', 'resolved')
  ),
  UNIQUE(date, gateway)
);

ALTER TABLE public.payment_reconciliation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read" ON public.payment_reconciliation
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based write" ON public.payment_reconciliation
  FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'reports.financial'));


-- 2.2 KDS Enhancement (Preparation Tracking)
-- Priority: P2 | Roadmap: Phase 2, Sprint 5
-- ============================================================

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS preparation_started_at TIMESTAMPTZ;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS preparation_completed_at TIMESTAMPTZ;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS preparation_station VARCHAR(50);

-- Speed of service view
CREATE OR REPLACE VIEW public.view_kds_performance AS
SELECT
  preparation_station AS station,
  DATE(preparation_started_at) AS date,
  COUNT(*) AS items_completed,
  AVG(EXTRACT(EPOCH FROM (preparation_completed_at - preparation_started_at))) AS avg_prep_seconds,
  MAX(EXTRACT(EPOCH FROM (preparation_completed_at - preparation_started_at))) AS max_prep_seconds,
  MIN(EXTRACT(EPOCH FROM (preparation_completed_at - preparation_started_at))) AS min_prep_seconds
FROM public.order_items
WHERE preparation_started_at IS NOT NULL
  AND preparation_completed_at IS NOT NULL
GROUP BY preparation_station, DATE(preparation_started_at);


-- 2.3 Email System
-- Priority: P1 | Roadmap: Phase 2, Sprint 6
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  html_body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_email_status CHECK (
    status IN ('pending', 'sending', 'sent', 'failed')
  )
);

CREATE INDEX idx_email_log_status ON public.email_log(status) WHERE status IN ('pending', 'failed');

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read templates" ON public.email_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin write templates" ON public.email_templates
  FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

CREATE POLICY "Authenticated read log" ON public.email_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Default templates
INSERT INTO public.email_templates (name, subject, html_body, variables) VALUES
('order_confirmation', 'Order Confirmation - {{order_number}}',
 '<h1>Order Confirmed</h1><p>Order: {{order_number}}</p><p>Total: Rp {{total}}</p>',
 '["order_number", "total", "items", "payment_method"]'),
('daily_summary', 'Daily Sales Summary - {{date}}',
 '<h1>Sales Summary for {{date}}</h1><p>Total Orders: {{total_orders}}</p><p>Revenue: Rp {{total_revenue}}</p>',
 '["date", "total_orders", "total_revenue", "top_products"]'),
('low_stock_alert', 'Low Stock Alert - {{product_count}} Products',
 '<h1>Low Stock Alert</h1><p>{{product_count}} products below threshold.</p>',
 '["product_count", "products"]')
ON CONFLICT (name) DO NOTHING;


-- 2.4 Split Bill / Check Model
-- Priority: P2 | Roadmap: Phase 2
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  check_number INTEGER NOT NULL,
  guest_name VARCHAR(100),
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_check_status CHECK (status IN ('open', 'paid', 'voided')),
  UNIQUE(order_id, check_number)
);

-- Link order_items to checks (nullable for backward compatibility)
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS check_id UUID REFERENCES public.order_checks(id);

CREATE TABLE IF NOT EXISTS public.check_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id UUID NOT NULL REFERENCES public.order_checks(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT positive_payment CHECK (amount > 0)
);

CREATE INDEX idx_order_checks_order ON public.order_checks(order_id);
CREATE INDEX idx_check_payments_check ON public.check_payments(check_id);

ALTER TABLE public.order_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read checks" ON public.order_checks
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based write checks" ON public.order_checks
  FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'sales.create'));

CREATE POLICY "Authenticated read check_payments" ON public.check_payments
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based write check_payments" ON public.check_payments
  FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'sales.create'));


-- ============================================================
-- PHASE 3: Scale & Compliance
-- ============================================================

-- 3.1 Multi-Location Support
-- Priority: P3 | Roadmap: Phase 3, Sprint 7
-- ============================================================

CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  tax_id VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add location_id to core tables (nullable for backward compatibility)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);
ALTER TABLE public.pos_sessions ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);
ALTER TABLE public.inventory_counts ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id);

-- Cross-location transfers
CREATE TABLE IF NOT EXISTS public.location_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id UUID NOT NULL REFERENCES public.locations(id),
  to_location_id UUID NOT NULL REFERENCES public.locations(id),
  transfer_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  received_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  received_at TIMESTAMPTZ,

  CONSTRAINT valid_transfer_status CHECK (
    status IN ('pending', 'in_transit', 'received', 'cancelled')
  ),
  CONSTRAINT different_locations CHECK (from_location_id != to_location_id)
);

CREATE TABLE IF NOT EXISTS public.location_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES public.location_transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity_sent DECIMAL(10,3) NOT NULL,
  quantity_received DECIMAL(10,3),
  unit VARCHAR(20) DEFAULT 'pcs',

  CONSTRAINT positive_qty CHECK (quantity_sent > 0)
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_transfer_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read locations" ON public.locations
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin write locations" ON public.locations
  FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

CREATE POLICY "Authenticated read transfers" ON public.location_transfers
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based write transfers" ON public.location_transfers
  FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'inventory.create'));

CREATE POLICY "Authenticated read transfer items" ON public.location_transfer_items
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based write transfer items" ON public.location_transfer_items
  FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'inventory.create'));


-- 3.2 e-Faktur (Indonesian Tax Invoice)
-- Priority: P2 | Roadmap: Phase 3, Sprint 9
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tax_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id),
  invoice_number VARCHAR(50),
  customer_npwp VARCHAR(20),
  customer_name VARCHAR(255),
  dpp DECIMAL(15,2) NOT NULL,
  ppn DECIMAL(15,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  efaktur_csv TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_invoice_status CHECK (
    status IN ('draft', 'submitted', 'approved', 'rejected', 'cancelled')
  )
);

CREATE INDEX idx_tax_invoices_order ON public.tax_invoices(order_id);
CREATE INDEX idx_tax_invoices_status ON public.tax_invoices(status);

ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read invoices" ON public.tax_invoices
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based write invoices" ON public.tax_invoices
  FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'reports.financial'));


-- 3.3 Expense Tracking
-- Priority: P2 | Roadmap: Phase 3
-- ============================================================

CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  parent_id UUID REFERENCES public.expense_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.expense_categories(id),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  payment_method VARCHAR(50),
  receipt_url VARCHAR(500),
  supplier_id UUID REFERENCES public.suppliers(id),
  approved_by UUID REFERENCES public.user_profiles(id),
  status VARCHAR(20) DEFAULT 'pending',
  location_id UUID REFERENCES public.locations(id),
  created_by UUID NOT NULL REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_expense_status CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  CONSTRAINT positive_expense CHECK (amount > 0)
);

CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_category ON public.expenses(category_id);
CREATE INDEX idx_expenses_status ON public.expenses(status);

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read categories" ON public.expense_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin write categories" ON public.expense_categories
  FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

CREATE POLICY "Authenticated read expenses" ON public.expenses
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based create expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based approve expenses" ON public.expenses
  FOR UPDATE USING (public.user_has_permission(auth.uid(), 'reports.financial'));

-- Default expense categories
INSERT INTO public.expense_categories (name, code) VALUES
('Raw Materials', 'RAW'),
('Packaging', 'PKG'),
('Utilities', 'UTL'),
('Rent', 'RENT'),
('Staff', 'STAFF'),
('Equipment', 'EQUIP'),
('Marketing', 'MKT'),
('Maintenance', 'MAINT'),
('Transportation', 'TRANS'),
('Other', 'OTHER')
ON CONFLICT (code) DO NOTHING;


-- 3.4 Scheduled Reports
-- Priority: P3 | Roadmap: Phase 3
-- ============================================================

CREATE TABLE IF NOT EXISTS public.report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  day_of_week INTEGER,
  day_of_month INTEGER,
  time_of_day TIME NOT NULL,
  format VARCHAR(10) DEFAULT 'pdf',
  recipients JSONB NOT NULL DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  CONSTRAINT valid_format CHECK (format IN ('pdf', 'csv', 'excel')),
  CONSTRAINT valid_day_of_week CHECK (day_of_week IS NULL OR day_of_week BETWEEN 0 AND 6),
  CONSTRAINT valid_day_of_month CHECK (day_of_month IS NULL OR day_of_month BETWEEN 1 AND 31)
);

CREATE TABLE IF NOT EXISTS public.report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.report_schedules(id),
  report_type VARCHAR(50) NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  file_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'generated',
  error_message TEXT,

  CONSTRAINT valid_report_status CHECK (
    status IN ('generating', 'generated', 'sent', 'failed')
  )
);

ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read schedules" ON public.report_schedules
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permission-based write schedules" ON public.report_schedules
  FOR ALL USING (public.user_has_permission(auth.uid(), 'reports.sales'));

CREATE POLICY "Authenticated read history" ON public.report_history
  FOR SELECT USING (auth.uid() IS NOT NULL);


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to check if payment gateway transaction is duplicate
CREATE OR REPLACE FUNCTION public.check_idempotency(
  p_key VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT response INTO v_result
  FROM public.idempotency_keys
  WHERE key = p_key AND expires_at > now();

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record idempotency key
CREATE OR REPLACE FUNCTION public.record_idempotency(
  p_key VARCHAR,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_response JSONB
) RETURNS void AS $$
BEGIN
  INSERT INTO public.idempotency_keys (key, entity_type, entity_id, response)
  VALUES (p_key, p_entity_type, p_entity_id, p_response)
  ON CONFLICT (key) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate e-Faktur DPP from total (11% PPN inclusive)
CREATE OR REPLACE FUNCTION public.calculate_dpp(
  p_total DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  -- DPP = Total / 1.11 (for 11% PPN)
  RETURN ROUND(p_total / 1.11, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate transfer number
CREATE OR REPLACE FUNCTION public.generate_transfer_number()
RETURNS VARCHAR AS $$
DECLARE
  v_date VARCHAR;
  v_seq INTEGER;
BEGIN
  v_date := to_char(now(), 'YYYYMMDD');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(transfer_number FROM 13) AS INTEGER)
  ), 0) + 1 INTO v_seq
  FROM public.location_transfers
  WHERE transfer_number LIKE 'TRF-' || v_date || '-%';

  RETURN 'TRF-' || v_date || '-' || LPAD(v_seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
