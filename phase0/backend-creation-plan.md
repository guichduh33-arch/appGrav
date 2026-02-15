# Backend Creation Plan -- Phase 0 -> Phase 1

> Generated: 2026-02-15 | Project: AppGrav (The Breakery) | Supabase: `ekkrzngauxqruvhhstjw`

## Execution Strategy

Migrations are ordered by **dependency** and **priority**:
1. **Sprint 1A**: Schema verification (check existing columns before altering)
2. **Sprint 1B**: Core table modifications (orders, user_profiles) -- HIGH priority
3. **Sprint 1C**: New tables -- HIGH/MEDIUM priority
4. **Sprint 1D**: Views and functions -- enhance existing
5. **Sprint 1E**: Settings seed data -- bulk INSERT
6. **Sprint 1F**: Low-priority additions and OUT OF SCOPE items (deferred)

---

## Pre-Flight: Schema Verification Queries

Before applying any migration, run these verification queries to confirm current state:

```sql
-- Q1: Check products.track_inventory
SELECT column_name FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'track_inventory';

-- Q2: Check products.sku
SELECT column_name FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'sku';

-- Q3-Q4: Check promotions time fields
SELECT column_name FROM information_schema.columns
WHERE table_name = 'promotions' AND column_name IN ('start_time', 'end_time', 'active_days');

-- Q5: Check promotions max_uses_per_customer
SELECT column_name FROM information_schema.columns
WHERE table_name = 'promotions' AND column_name = 'max_uses_per_customer';

-- Q6: Check product_combos time fields
SELECT column_name FROM information_schema.columns
WHERE table_name = 'product_combos' AND column_name IN ('available_from', 'available_to');

-- Q7: Check product_combo_groups.sort_order
SELECT column_name FROM information_schema.columns
WHERE table_name = 'product_combo_groups' AND column_name = 'sort_order';

-- Q8: Check purchase_order_items.qc_passed
SELECT column_name FROM information_schema.columns
WHERE table_name = 'purchase_order_items' AND column_name = 'qc_passed';

-- Q9: Check inventory_count_items.reason
SELECT column_name FROM information_schema.columns
WHERE table_name = 'inventory_count_items' AND column_name = 'reason';

-- Q10: Check inventory_counts location
SELECT column_name FROM information_schema.columns
WHERE table_name = 'inventory_counts' AND column_name LIKE '%location%';

-- Q11-Q12: Check production_records fields
SELECT column_name FROM information_schema.columns
WHERE table_name = 'production_records'
AND column_name IN ('estimated_completion', 'status', 'progress_percent');

-- Q13: Check stock_movements.reason
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'stock_movements' AND column_name = 'reason';

-- Check permissions
SELECT code FROM permissions WHERE code IN (
  'promotions.create', 'promotions.update', 'promotions.delete', 'products.delete'
);
```

---

## Sprint 1A: Schema Verification & Conditional Fixes

> Run after pre-flight queries. Apply only the migrations for columns that are MISSING.

### Migration 1A-01: Add missing columns to promotions (IF NOT EXISTS)
```sql
-- Only if Q3/Q4/Q5 confirm missing columns
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS active_days INTEGER[] DEFAULT '{}';
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS max_uses_per_customer INTEGER;
```

### Migration 1A-02: Add missing columns to combos (IF NOT EXISTS)
```sql
ALTER TABLE product_combos ADD COLUMN IF NOT EXISTS available_from TIME;
ALTER TABLE product_combos ADD COLUMN IF NOT EXISTS available_to TIME;
ALTER TABLE product_combo_groups ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
```

### Migration 1A-03: Add missing columns to PO/inventory (IF NOT EXISTS)
```sql
ALTER TABLE purchase_order_items ADD COLUMN IF NOT EXISTS qc_passed BOOLEAN;
ALTER TABLE inventory_count_items ADD COLUMN IF NOT EXISTS reason VARCHAR(50);
ALTER TABLE inventory_counts ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES stock_locations(id);
```

### Migration 1A-04: Add missing production_records fields (IF NOT EXISTS)
```sql
ALTER TABLE production_records ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMPTZ;
ALTER TABLE production_records ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;
-- Verify status enum supports: proofing, baking, cooling, done
```

### Migration 1A-05: Add missing permissions (IF NOT EXISTS)
```sql
INSERT INTO permissions (code, module, action, name_en, description)
VALUES
  ('promotions.create', 'promotions', 'create', 'Create Promotions', 'Create new promotions'),
  ('promotions.update', 'promotions', 'update', 'Update Promotions', 'Edit existing promotions'),
  ('promotions.delete', 'promotions', 'delete', 'Delete Promotions', 'Delete promotions'),
  ('products.delete', 'products', 'delete', 'Delete Products', 'Delete products from catalog')
ON CONFLICT (code) DO NOTHING;

-- Assign to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'admin'
AND p.code IN ('promotions.create', 'promotions.update', 'promotions.delete', 'products.delete')
ON CONFLICT DO NOTHING;
```

---

## Sprint 1B: Core Table Modifications (HIGH Priority)

### Migration 1B-01: orders -- guest_count + service_charge
```sql
-- Gap items: C1, C2, C3
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_count INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_charge_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_charge_amount DECIMAL(12,2) DEFAULT 0;

COMMENT ON COLUMN orders.guest_count IS 'Number of guests for dine-in orders';
COMMENT ON COLUMN orders.service_charge_rate IS 'Service charge percentage (e.g., 5.00 for 5%)';
COMMENT ON COLUMN orders.service_charge_amount IS 'Calculated service charge amount in IDR';
```

### Migration 1B-02: user_profiles -- title + default_module + mfa
```sql
-- Gap items: C4, C5, C6
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS default_module VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_profiles.title IS 'Staff title/position (e.g., Head Baker, Manager)';
COMMENT ON COLUMN user_profiles.default_module IS 'Default landing page after login (e.g., pos, dashboard)';
```

### Migration 1B-03: suppliers -- category + bank_account_holder
```sql
-- Gap items: C7, C8
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(255);

COMMENT ON COLUMN suppliers.category IS 'Supplier category (Flour & Grains, Dairy, Packaging, etc.)';
```

### Migration 1B-04: Other column additions
```sql
-- Gap items: C9, C10, C11, C12
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(12,2) DEFAULT 0;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE loyalty_tiers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

COMMENT ON COLUMN journal_entries.source IS 'Entry source: manual, auto_sale, auto_purchase, auto_void';
```

---

## Sprint 1C: New Tables (HIGH/MEDIUM Priority)

### Migration 1C-01: product_price_history
```sql
-- Gap item: T1
CREATE TABLE IF NOT EXISTS product_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price DECIMAL(12,2),
  new_price DECIMAL(12,2) NOT NULL,
  old_cost_price DECIMAL(12,2),
  new_cost_price DECIMAL(12,2),
  old_wholesale_price DECIMAL(12,2),
  new_wholesale_price DECIMAL(12,2),
  changed_by UUID REFERENCES user_profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_price_history_product ON product_price_history(product_id);
CREATE INDEX idx_price_history_date ON product_price_history(created_at DESC);

-- RLS
ALTER TABLE product_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON product_price_history
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based write" ON product_price_history
  FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'products.pricing'));

-- Auto-track trigger
CREATE OR REPLACE FUNCTION track_product_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price
     OR OLD.cost_price IS DISTINCT FROM NEW.cost_price
     OR OLD.wholesale_price IS DISTINCT FROM NEW.wholesale_price THEN
    INSERT INTO product_price_history (
      product_id, old_price, new_price,
      old_cost_price, new_cost_price,
      old_wholesale_price, new_wholesale_price,
      changed_by
    ) VALUES (
      NEW.id, OLD.price, NEW.price,
      OLD.cost_price, NEW.cost_price,
      OLD.wholesale_price, NEW.wholesale_price,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_track_price_change
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION track_product_price_change();
```

### Migration 1C-02: vat_filings
```sql
-- Gap item: T5
CREATE TABLE IF NOT EXISTS vat_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  status VARCHAR(20) DEFAULT 'not_filed' CHECK (status IN ('not_filed', 'filed', 'amended')),
  vat_collected DECIMAL(12,2),
  vat_deductible DECIMAL(12,2),
  vat_payable DECIMAL(12,2),
  filed_at TIMESTAMPTZ,
  filed_by UUID REFERENCES user_profiles(id),
  djp_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(period_year, period_month)
);

-- RLS
ALTER TABLE vat_filings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON vat_filings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based write" ON vat_filings
  FOR ALL USING (public.user_has_permission(auth.uid(), 'accounting.vat.manage'));
```

### Migration 1C-03: business_holidays
```sql
-- Gap item: T2
CREATE TABLE IF NOT EXISTS business_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_closed BOOLEAN DEFAULT true,
  open_time TIME,
  close_time TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_holidays_date ON business_holidays(date);

-- RLS
ALTER TABLE business_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON business_holidays
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based write" ON business_holidays
  FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));
```

### Migration 1C-04: notification_events + notification_preferences
```sql
-- Gap items: T3, T4
CREATE TABLE IF NOT EXISTS notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_code VARCHAR(100) NOT NULL REFERENCES notification_events(code),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'email', 'push')),
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_code, channel)
);

CREATE INDEX idx_notif_prefs_user ON notification_preferences(user_id);

-- RLS
ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON notification_events
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin write" ON notification_events
  FOR ALL USING (public.user_has_permission(auth.uid(), 'settings.update'));

CREATE POLICY "Own preferences read" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Own preferences write" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Seed notification events
INSERT INTO notification_events (code, name, description, category, is_locked) VALUES
  ('low_stock_alert', 'Low Stock Alert', 'Triggered when product stock falls below minimum threshold', 'inventory', false),
  ('new_online_order', 'New Online Order', 'Triggered when a new online/delivery order is received', 'orders', false),
  ('large_discount_voided', 'Large Discount Voided', 'Triggered when a large discount or void exceeds threshold', 'financial', false),
  ('shift_ended', 'Shift Ended', 'Triggered when a POS shift is closed', 'pos', false),
  ('po_overdue', 'Purchase Order Overdue', 'Triggered when PO passes expected delivery date', 'purchasing', false),
  ('system_backup_failure', 'System Backup Failure', 'Triggered on backup failure -- cannot be disabled', 'system', true),
  ('sync_failure', 'Sync Failure', 'Triggered when offline sync fails repeatedly', 'system', false),
  ('b2b_payment_received', 'B2B Payment Received', 'Triggered when a B2B payment is recorded', 'b2b', false)
ON CONFLICT (code) DO NOTHING;
```

### Migration 1C-05: po_activity_log
```sql
-- Gap item: T6
CREATE TABLE IF NOT EXISTS po_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT,
  notes TEXT,
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_po_activity_po ON po_activity_log(purchase_order_id, created_at DESC);

-- RLS
ALTER TABLE po_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON po_activity_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based write" ON po_activity_log
  FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), 'inventory.create'));

-- Auto-log trigger for PO status changes
CREATE OR REPLACE FUNCTION log_po_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO po_activity_log (purchase_order_id, event_type, description, user_id)
    VALUES (
      NEW.id,
      'status_change',
      format('Status changed from %s to %s', OLD.status, NEW.status),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_po_status_log
  AFTER UPDATE ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_po_status_change();
```

---

## Sprint 1D: Views & Functions

### Migration 1D-01: Enhance view_daily_kpis
```sql
-- Gap items: V1, V2
-- NOTE: This requires knowing the current view definition.
-- Run this to get current definition first:
-- SELECT pg_get_viewdef('view_daily_kpis', true);
-- Then recreate with added columns:

-- Completion rate:
-- ROUND(COUNT(*) FILTER (WHERE status = 'completed')::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS completion_rate

-- Items sold:
-- (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi
--  JOIN orders o ON o.id = oi.order_id
--  WHERE o.created_at::date = CURRENT_DATE) AS items_sold
```

### Migration 1D-02: Create view_ar_aging
```sql
-- Gap item: V3
CREATE OR REPLACE VIEW view_ar_aging AS
SELECT
  c.id AS customer_id,
  c.name AS customer_name,
  b.id AS order_id,
  b.order_number,
  b.order_date,
  b.total,
  COALESCE(b.amount_due, b.total - COALESCE(
    (SELECT SUM(amount) FROM b2b_payments WHERE b2b_order_id = b.id), 0
  )) AS amount_due,
  b.payment_status,
  CURRENT_DATE - b.order_date::date AS days_outstanding,
  CASE
    WHEN CURRENT_DATE - b.order_date::date <= 0 THEN 'current'
    WHEN CURRENT_DATE - b.order_date::date <= 30 THEN '1_30'
    WHEN CURRENT_DATE - b.order_date::date <= 60 THEN '31_60'
    WHEN CURRENT_DATE - b.order_date::date <= 90 THEN '61_90'
    ELSE '90_plus'
  END AS aging_bucket
FROM b2b_orders b
JOIN customers c ON c.id = b.customer_id
WHERE b.payment_status != 'paid';
```

---

## Sprint 1E: Settings Seed Data

### Migration 1E-01: Insert all new setting rows
```sql
-- ~49 setting rows across all categories
-- Uses ON CONFLICT to be idempotent

INSERT INTO settings (key, value, category, description) VALUES
  -- POS Config (S1-S14)
  ('pos_config.auto_print_receipt', 'false', 'pos_config', 'Auto-print receipt after checkout'),
  ('pos_config.send_to_kds', 'true', 'pos_config', 'Auto-send items to KDS after order'),
  ('pos_config.require_shift_opening', 'true', 'pos_config', 'Require opening a shift before POS use'),
  ('pos_config.default_opening_balance', '0', 'pos_config', 'Default opening cash balance'),
  ('pos_config.skip_reconciliation', 'false', 'pos_config', 'Allow closing shift without cash reconciliation'),
  ('pos_config.allow_manual_discounts', 'true', 'pos_config', 'Allow manual discount entry'),
  ('pos_config.manager_pin_discount_threshold', '20', 'pos_config', 'Discount % threshold requiring manager PIN'),
  ('pos_config.cart_timeout_minutes', '30', 'pos_config', 'Cart auto-clear timeout in minutes'),
  ('pos_config.allow_split_payment', 'true', 'pos_config', 'Allow split payment across methods'),
  ('pos_config.max_split_count', '3', 'pos_config', 'Maximum number of payment splits'),
  ('pos_config.peak_pricing_enabled', 'false', 'pos_config', 'Enable peak-hour pricing markup'),
  ('pos_config.peak_pricing_markup_percent', '0', 'pos_config', 'Peak pricing markup percentage'),
  ('pos_config.peak_time_start', '11:00', 'pos_config', 'Peak pricing start time'),
  ('pos_config.peak_time_end', '14:00', 'pos_config', 'Peak pricing end time'),

  -- KDS & Display (S15-S16)
  ('kds_config.audio_alerts_enabled', 'true', 'kds_config', 'Enable audio alerts on KDS stations'),
  ('display.enabled', 'false', 'display', 'Enable customer-facing display'),

  -- Inventory Config (S17-S25)
  ('inventory_config.stock_tracking_enabled', 'true', 'inventory_config', 'Master toggle for stock tracking'),
  ('inventory_config.auto_deduct_on_sale', 'true', 'inventory_config', 'Auto-deduct stock when order completes'),
  ('inventory_config.deduct_by_bom', 'false', 'inventory_config', 'Deduct raw materials based on BOM/recipe'),
  ('inventory_config.allow_negative_stock', 'false', 'inventory_config', 'Allow selling when stock is negative'),
  ('inventory_config.auto_generate_po', 'false', 'inventory_config', 'Auto-generate PO when stock below minimum'),
  ('inventory_config.opname_frequency', 'monthly', 'inventory_config', 'Stock opname audit frequency'),
  ('inventory_config.opname_manager_approval', 'true', 'inventory_config', 'Require manager approval for opname results'),
  ('inventory_config.waste_photo_required', 'false', 'inventory_config', 'Require photo evidence for waste logging'),
  ('inventory_config.waste_reason_required', 'true', 'inventory_config', 'Require reason when logging waste'),

  -- Security (S26-S32)
  ('security.offline_pin_enabled', 'true', 'security', 'Enable offline PIN authentication'),
  ('security.pin_complexity_required', 'false', 'security', 'Require non-sequential PIN digits'),
  ('security.auto_logout_minutes', '30', 'security', 'Global auto-logout timeout'),
  ('security.max_concurrent_sessions', '1', 'security', 'Maximum concurrent sessions per user'),
  ('security.pii_masking_enabled', 'false', 'security', 'Mask PII in non-admin views'),
  ('security.local_db_encryption', 'false', 'security', 'Enable IndexedDB encryption'),
  ('security.pin_required_actions', '["void","refund","discount_over_threshold"]', 'security', 'Actions requiring manager PIN'),

  -- Notifications (S33-S35)
  ('notifications.quiet_hours_enabled', 'false', 'notifications', 'Enable quiet hours for notifications'),
  ('notifications.quiet_start', '22:00', 'notifications', 'Quiet hours start time'),
  ('notifications.quiet_end', '07:00', 'notifications', 'Quiet hours end time'),

  -- Sync Advanced (S36-S40)
  ('sync_advanced.background_sync_enabled', 'true', 'sync_advanced', 'Enable background sync'),
  ('sync_advanced.priority_orders_over_stock', 'true', 'sync_advanced', 'Prioritize orders over stock in sync queue'),
  ('sync_advanced.cache_ttl_images_hours', '24', 'sync_advanced', 'Image cache TTL in hours'),
  ('sync_advanced.cache_ttl_inventory_minutes', '5', 'sync_advanced', 'Inventory cache TTL in minutes'),
  ('sync_advanced.lan_mesh_enabled', 'false', 'sync_advanced', 'Enable LAN mesh sync'),

  -- Company (S41-S44)
  ('company.website', '', 'company', 'Company website URL'),
  ('company.currency', 'IDR', 'company', 'Default currency'),
  ('company.timezone', 'Asia/Makassar', 'company', 'Business timezone'),
  ('company.brand_color', '#C9A55C', 'company', 'Brand primary color'),

  -- Loyalty (S45-S46)
  ('loyalty.points_rate', '1000', 'loyalty', 'IDR spent per loyalty point earned'),
  ('loyalty.program_enabled', 'true', 'loyalty', 'Enable loyalty program'),

  -- Tax & Receipts (S47-S49)
  ('tax.show_on_receipt', 'true', 'tax', 'Show tax breakdown on receipts'),
  ('tax.rounding_amount', '100', 'tax', 'Cash rounding increment (IDR)'),
  ('tax.rounding_method', 'nearest', 'tax', 'Rounding method: nearest, up, down')
ON CONFLICT (key) DO NOTHING;
```

---

## Sprint 1F: Deferred / Low Priority

These items can be addressed during assembly (Phase 2-4) or deferred to post-MVP:

### Deferred Migrations

| Item | Description | When to Address |
|------|-------------|----------------|
| Enum: `order_status` + `dispatched` | Add delivery tracking status | During Order assembly (Phase 2) |
| Enum: `session_status` + `recounting` | RE-COUNT workflow | During Session assembly (Phase 2) |
| Floor plan item types extension | Wall, bar, counter, divider | During Floor Plan assembly (Phase 2) |
| Named discount presets migration | Change `quick_discount_percentages` from numeric array to named objects | During POS Settings assembly (Phase 2) |
| `kds_stations.connection_status` | Real-time hardware status column | During KDS assembly (Phase 2) |
| `b2b_orders.due_date` | Computed or stored due date for AR aging | During B2B assembly (Phase 2) |
| `customers.contract_type` | Standing Order/On-Demand classification | During B2B assembly (Phase 2) |

### Out of Scope

| Item | Reason |
|------|--------|
| Staff hours/time tracking | Not part of current ERP scope |
| Delivery routes/zones with fees | B2B delivery routing -- too complex for initial build |
| Auto-markdown system | Requires pricing AI/rules engine |
| Loyalty card customization (logo/font) | Cosmetic, low ROI |
| System health metrics table | Can use client-side monitoring initially |
| Warehouse map / logistics efficiency | Cosmetic visualization |

---

## Migration Execution Order (Recommended)

```
1A-01  Schema verification: promotions columns
1A-02  Schema verification: combos columns
1A-03  Schema verification: PO/inventory columns
1A-04  Schema verification: production_records
1A-05  Permissions seed
       ↓
1B-01  orders: guest_count + service_charge  ★ HIGH
1B-02  user_profiles: title + default_module + mfa
1B-03  suppliers: category + bank_account_holder
1B-04  Other column additions
       ↓
1C-01  product_price_history + trigger  ★ MEDIUM
1C-02  vat_filings  ★ HIGH
1C-03  business_holidays
1C-04  notification_events + preferences + seed
1C-05  po_activity_log + trigger
       ↓
1D-01  Enhance view_daily_kpis (completion_rate + items_sold)
1D-02  Create view_ar_aging
       ↓
1E-01  Settings bulk INSERT (~49 rows)
```

**Estimated total: 14 migrations** (can be consolidated into fewer if preferred)

---

## Post-Migration Checklist

- [ ] Run pre-flight verification queries
- [ ] Apply migrations 1A-01 through 1A-05 (conditional)
- [ ] Apply migrations 1B-01 through 1B-04
- [ ] Apply migrations 1C-01 through 1C-05
- [ ] Apply migrations 1D-01 through 1D-02
- [ ] Apply migration 1E-01
- [ ] Regenerate TypeScript types (`generate_typescript_types`)
- [ ] Update `src/types/database.ts` to match
- [ ] Run security advisors check
- [ ] Run performance advisors check
- [ ] Verify RLS on all new tables
- [ ] Run existing test suite to confirm no regressions

---

## TypeScript Type Updates Required

After migrations, regenerate types and update:
- `src/types/database.ts` -- new tables and columns
- `src/types/database.generated.ts` -- auto-generated via Supabase
- `src/types/settings.ts` -- new setting keys and categories
- `src/types/accounting.ts` -- `vat_filings` interface

New interfaces needed:
```typescript
interface IProductPriceHistory {
  id: string;
  product_id: string;
  old_price: number | null;
  new_price: number;
  old_cost_price: number | null;
  new_cost_price: number | null;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

interface IVatFiling {
  id: string;
  period_year: number;
  period_month: number;
  status: 'not_filed' | 'filed' | 'amended';
  vat_collected: number | null;
  vat_deductible: number | null;
  vat_payable: number | null;
  filed_at: string | null;
  filed_by: string | null;
  djp_reference: string | null;
  notes: string | null;
}

interface IBusinessHoliday {
  id: string;
  date: string;
  name: string;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
  notes: string | null;
}

interface INotificationEvent {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  is_locked: boolean;
}

interface INotificationPreference {
  id: string;
  user_id: string;
  event_code: string;
  channel: 'in_app' | 'email' | 'push';
  is_enabled: boolean;
}

interface IPOActivityLog {
  id: string;
  purchase_order_id: string;
  event_type: string;
  description: string | null;
  notes: string | null;
  user_id: string | null;
  created_at: string;
}
```
