# Gap Analysis -- Phase 0 Cross-Reference Table

> Generated: 2026-02-15 | Project: AppGrav (The Breakery) | Supabase: `ekkrzngauxqruvhhstjw`

## Summary Statistics

| Status | Count | Description |
|--------|-------|-------------|
| :red_circle: **RED** | ~42 | Does not exist -- new tables, columns, views, or services required |
| :yellow_circle: **YELLOW** | ~58 | Exists but incomplete -- schema modifications, verifications, or enhancements |
| :green_circle: **GREEN** | ~350+ | Fully covered by existing backend |

**Coverage Rate**: ~87% of data needs are fully covered by the existing backend.

---

## 1. NEW TABLES REQUIRED

| # | Table | Purpose | Pages Affected | Priority |
|---|-------|---------|---------------|----------|
| T1 | `product_price_history` | Track product price changes over time | D3, O1 | MEDIUM |
| T2 | `business_holidays` | Holiday/special event dates with modified hours | K7 | MEDIUM |
| T3 | `notification_events` | Registry of system events for notification config | L1 | LOW |
| T4 | `notification_preferences` | Per-user per-event channel preferences | L1 | LOW |
| T5 | `vat_filings` | VAT filing status tracking (period, status, filed_at, filed_by) | H7 | HIGH |
| T6 | `po_activity_log` | Purchase order timeline events and notes | I4 | LOW |

### Table Schemas

**T1: `product_price_history`**
```sql
CREATE TABLE product_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  old_price DECIMAL(12,2),
  new_price DECIMAL(12,2) NOT NULL,
  old_cost_price DECIMAL(12,2),
  new_cost_price DECIMAL(12,2),
  changed_by UUID REFERENCES user_profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Trigger: auto-insert on products.price UPDATE
```

**T2: `business_holidays`**
```sql
CREATE TABLE business_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_closed BOOLEAN DEFAULT true,
  open_time TIME,
  close_time TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**T3+T4: Notification system**
```sql
CREATE TABLE notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  event_code VARCHAR(100) REFERENCES notification_events(code),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'email', 'push')),
  is_enabled BOOLEAN DEFAULT true,
  UNIQUE(user_id, event_code, channel)
);
```

**T5: `vat_filings`**
```sql
CREATE TABLE vat_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  status VARCHAR(20) DEFAULT 'not_filed' CHECK (status IN ('not_filed', 'filed', 'amended')),
  filed_at TIMESTAMPTZ,
  filed_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(period_year, period_month)
);
```

**T6: `po_activity_log`**
```sql
CREATE TABLE po_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  event_type VARCHAR(50) NOT NULL,
  description TEXT,
  notes TEXT,
  user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 2. NEW COLUMNS REQUIRED

| # | Table | Column | Type | Default | Pages | Priority |
|---|-------|--------|------|---------|-------|----------|
| C1 | `orders` | `guest_count` | INTEGER | NULL | B3 | HIGH |
| C2 | `orders` | `service_charge_rate` | DECIMAL(5,2) | NULL | C3 | HIGH |
| C3 | `orders` | `service_charge_amount` | DECIMAL(12,2) | NULL | C3 | HIGH |
| C4 | `user_profiles` | `title` | VARCHAR(100) | NULL | M2, M3 | MEDIUM |
| C5 | `user_profiles` | `default_module` | VARCHAR(50) | NULL | M3 | LOW |
| C6 | `user_profiles` | `mfa_enabled` | BOOLEAN | FALSE | M3 | LOW |
| C7 | `suppliers` | `category` | VARCHAR(100) | NULL | I1 | MEDIUM |
| C8 | `suppliers` | `bank_account_holder` | VARCHAR(255) | NULL | I1 | LOW |
| C9 | `purchase_orders` | `shipping_cost` | DECIMAL(12,2) | 0 | I4 | LOW |
| C10 | `stock_movements` | `photo_url` | TEXT | NULL | E8 | LOW |
| C11 | `loyalty_tiers` | `description` | TEXT | NULL | F3 | LOW |
| C12 | `journal_entries` | `source` | VARCHAR(20) | 'manual' | H2 | LOW |

---

## 3. NEW SETTING ROWS REQUIRED (~40 rows)

All settings go into the existing `settings` table as key-value pairs.

### 3a. POS Configuration (`pos_config.*`)

| # | Key | Type | Default | Page | Priority |
|---|-----|------|---------|------|----------|
| S1 | `pos_config.auto_print_receipt` | boolean | false | K6 | MEDIUM |
| S2 | `pos_config.send_to_kds` | boolean | true | K6 | MEDIUM |
| S3 | `pos_config.require_shift_opening` | boolean | true | K6 | MEDIUM |
| S4 | `pos_config.default_opening_balance` | number | 0 | K6 | LOW |
| S5 | `pos_config.skip_reconciliation` | boolean | false | K6 | LOW |
| S6 | `pos_config.allow_manual_discounts` | boolean | true | K6 | MEDIUM |
| S7 | `pos_config.manager_pin_discount_threshold` | number | 20 | K6 | MEDIUM |
| S8 | `pos_config.cart_timeout_minutes` | number | 30 | K6 | LOW |
| S9 | `pos_config.allow_split_payment` | boolean | true | K9 | HIGH |
| S10 | `pos_config.max_split_count` | number | 3 | K9 | HIGH |
| S11 | `pos_config.peak_pricing_enabled` | boolean | false | K7 | LOW |
| S12 | `pos_config.peak_pricing_markup_percent` | number | 0 | K7 | LOW |
| S13 | `pos_config.peak_time_start` | string | '11:00' | K7 | LOW |
| S14 | `pos_config.peak_time_end` | string | '14:00' | K7 | LOW |

### 3b. KDS & Display (`kds_config.*`, `display.*`)

| # | Key | Type | Default | Page | Priority |
|---|-----|------|---------|------|----------|
| S15 | `kds_config.audio_alerts_enabled` | boolean | true | K5 | MEDIUM |
| S16 | `display.enabled` | boolean | false | K5 | MEDIUM |

### 3c. Inventory Configuration (`inventory_config.*`)

| # | Key | Type | Default | Page | Priority |
|---|-----|------|---------|------|----------|
| S17 | `inventory_config.stock_tracking_enabled` | boolean | true | K11 | MEDIUM |
| S18 | `inventory_config.auto_deduct_on_sale` | boolean | true | K11 | MEDIUM |
| S19 | `inventory_config.deduct_by_bom` | boolean | false | K11 | MEDIUM |
| S20 | `inventory_config.allow_negative_stock` | boolean | false | K11 | MEDIUM |
| S21 | `inventory_config.auto_generate_po` | boolean | false | K11 | LOW |
| S22 | `inventory_config.opname_frequency` | string | 'monthly' | K11 | LOW |
| S23 | `inventory_config.opname_manager_approval` | boolean | true | K11 | LOW |
| S24 | `inventory_config.waste_photo_required` | boolean | false | K11 | LOW |
| S25 | `inventory_config.waste_reason_required` | boolean | true | K11 | LOW |

### 3d. Security (`security.*`)

| # | Key | Type | Default | Page | Priority |
|---|-----|------|---------|------|----------|
| S26 | `security.offline_pin_enabled` | boolean | true | M1 | MEDIUM |
| S27 | `security.pin_complexity_required` | boolean | false | M1 | LOW |
| S28 | `security.auto_logout_minutes` | number | 30 | M1 | MEDIUM |
| S29 | `security.max_concurrent_sessions` | number | 1 | M1 | LOW |
| S30 | `security.pii_masking_enabled` | boolean | false | M1 | LOW |
| S31 | `security.local_db_encryption` | boolean | false | M1 | LOW |
| S32 | `security.pin_required_actions` | json | '["void","refund","discount"]' | M1 | MEDIUM |

### 3e. Notifications (`notifications.*`)

| # | Key | Type | Default | Page | Priority |
|---|-----|------|---------|------|----------|
| S33 | `notifications.quiet_hours_enabled` | boolean | false | L1 | LOW |
| S34 | `notifications.quiet_start` | string | '22:00' | L1 | LOW |
| S35 | `notifications.quiet_end` | string | '07:00' | L1 | LOW |

### 3f. Sync Advanced (`sync_advanced.*`)

| # | Key | Type | Default | Page | Priority |
|---|-----|------|---------|------|----------|
| S36 | `sync_advanced.background_sync_enabled` | boolean | true | L2 | MEDIUM |
| S37 | `sync_advanced.priority_orders_over_stock` | boolean | true | L2 | LOW |
| S38 | `sync_advanced.cache_ttl_images_hours` | number | 24 | L2 | LOW |
| S39 | `sync_advanced.cache_ttl_inventory_minutes` | number | 5 | L2 | LOW |
| S40 | `sync_advanced.lan_mesh_enabled` | boolean | false | L2 | LOW |

### 3g. Company (`company.*`)

| # | Key | Type | Default | Page | Priority |
|---|-----|------|---------|------|----------|
| S41 | `company.website` | string | '' | K3 | LOW |
| S42 | `company.currency` | string | 'IDR' | K3 | LOW |
| S43 | `company.timezone` | string | 'Asia/Makassar' | K3 | LOW |
| S44 | `company.brand_color` | string | '#C9A55C' | K3 | LOW |

### 3h. Loyalty (`loyalty.*`)

| # | Key | Type | Default | Page | Priority |
|---|-----|------|---------|------|----------|
| S45 | `loyalty.points_rate` | number | 1000 | F3 | MEDIUM |
| S46 | `loyalty.program_enabled` | boolean | true | F3 | MEDIUM |

### 3i. Tax & Receipts

| # | Key | Type | Default | Page | Priority |
|---|-----|------|---------|------|----------|
| S47 | `tax.show_on_receipt` | boolean | true | H6 | MEDIUM |
| S48 | `tax.rounding_amount` | number | 100 | H6 | MEDIUM |
| S49 | `tax.rounding_method` | string | 'nearest' | H6 | MEDIUM |

---

## 4. VIEW ENHANCEMENTS REQUIRED

| # | View | Enhancement | Pages | Priority |
|---|------|-------------|-------|----------|
| V1 | `view_daily_kpis` | Add `completion_rate` (completed/total %) | C2 | HIGH |
| V2 | `view_daily_kpis` | Add `items_sold` (SUM order_items.quantity) | K1, N2 | MEDIUM |
| V3 | New: `view_ar_aging` | AR aging buckets (current, 1-30, 31-60, 61-90, 90+) | J1 | HIGH |

### View SQL

**V1: Completion rate in view_daily_kpis**
```sql
-- Add to view_daily_kpis definition:
ROUND(
  COUNT(*) FILTER (WHERE status = 'completed')::numeric /
  NULLIF(COUNT(*), 0) * 100, 1
) AS completion_rate
```

**V3: AR Aging view**
```sql
CREATE OR REPLACE VIEW view_ar_aging AS
SELECT
  c.id AS customer_id,
  c.name AS customer_name,
  b.id AS order_id,
  b.order_number,
  b.order_date,
  b.total,
  b.amount_due,
  b.payment_status,
  CURRENT_DATE - b.order_date::date AS days_outstanding,
  CASE
    WHEN CURRENT_DATE - b.order_date::date <= 0 THEN 'current'
    WHEN CURRENT_DATE - b.order_date::date <= 30 THEN '1-30'
    WHEN CURRENT_DATE - b.order_date::date <= 60 THEN '31-60'
    WHEN CURRENT_DATE - b.order_date::date <= 90 THEN '61-90'
    ELSE '90+'
  END AS aging_bucket
FROM b2b_orders b
JOIN customers c ON c.id = b.customer_id
WHERE b.payment_status != 'paid' AND b.amount_due > 0;
```

---

## 5. SCHEMA MODIFICATIONS (YELLOW items requiring verification/update)

### 5a. Column Verifications Needed

| # | Table | Column | Question | Pages |
|---|-------|--------|----------|-------|
| Q1 | `products` | `track_inventory` | Does this boolean column exist? | D2 |
| Q2 | `products` | `sku` | Does this column exist? (products use `id` as UUID) | I2, D1 |
| Q3 | `promotions` | `start_time`, `end_time` | Do time-of-day fields exist (not just date range)? | D6, D7 |
| Q4 | `promotions` | `active_days` | Does day-of-week scheduling array/bitmask exist? | D6, D7 |
| Q5 | `promotions` | `max_uses_per_customer` | Does per-customer usage limit column exist? | D7 |
| Q6 | `product_combos` | `available_from`, `available_to` | Do time-based availability fields exist? | D5 |
| Q7 | `product_combo_groups` | `sort_order` | Does sort order column exist for drag-reorder? | D5 |
| Q8 | `purchase_order_items` | `qc_passed` | Does QC check boolean column exist? | E5 |
| Q9 | `inventory_count_items` | `reason` | Does reason column exist for count discrepancies? | E4 |
| Q10 | `inventory_counts` | `location_id` | Is location linked to counts? | E4 |
| Q11 | `production_records` | `estimated_completion` | Does estimated completion timestamp exist? | E7 |
| Q12 | `production_records` | Status lifecycle | Supports proofing/baking/cooling/done? | E7 |
| Q13 | `stock_movements` | `reason` enum | Supports Expired, Damaged, Spoiled, Quality, Overproduction? | E8 |

### 5b. Enum/Type Modifications

| # | Type/Enum | Modification | Pages | Priority |
|---|-----------|-------------|-------|----------|
| E1 | `order_status` | Consider adding `dispatched` or `in_delivery` for delivery tracking | B1 | LOW |
| E2 | `session_status` | Consider adding `recounting` state for RE-COUNT workflow | C5 | LOW |
| E3 | `floor_plan_item_type` | Extend to support 'wall', 'bar', 'counter', 'divider' | K4 | LOW |

### 5c. Data Structure Changes

| # | Setting Key | Current | Needed | Pages | Priority |
|---|------------|---------|--------|-------|----------|
| D1 | `pos_config.quick_discount_percentages` | Array of numbers `[5,10,15,20]` | Array of objects `[{name:"Early Bird",pct:15},{name:"Staff Meal",pct:50}]` | K6 | MEDIUM |

---

## 6. SERVICES & FEATURES NOT YET BUILT

| # | Service | Purpose | Pages | Priority |
|---|---------|---------|-------|----------|
| F1 | CSV import for customers | Parse and import customer data from CSV | F1 | LOW |
| F2 | PDF export service | Generate PDFs for statements, reports, PPN filing | H5, H7, J1, G1 | MEDIUM |
| F3 | Vendor email notification | Send PO to supplier via email (Edge Function) | I2 | LOW |
| F4 | Auto-apply payment allocation | Apply B2B payment to oldest invoices first | J1 | LOW |
| F5 | Staff hours/time tracking | Track staff working hours | H4 | OUT OF SCOPE |
| F6 | Delivery routes/zones | B2B delivery routing with fees and ETA | G1, G2 | OUT OF SCOPE |
| F7 | Auto-markdown system | Generate automatic markdowns for unsold inventory | O1 | OUT OF SCOPE |

---

## 7. DESIGN INCONSISTENCIES TO RESOLVE

| # | Issue | Details | Decision Needed |
|---|-------|---------|-----------------|
| DI1 | **Tax rate**: Design shows 8.5% (POS) vs 10% (business rule) | POS terminal design shows "Tax (8.5%)" but CLAUDE.md specifies 10% included | Use 10% per business rules; treat 8.5% as mockup placeholder |
| DI2 | **Color tokens vary across pages** | Login: `#c8a45b`, Dashboard: `#f9a806`, POS: `#cab06d` | Standardize on `#C9A55C` (Artisan Gold) from DESIGN.md |
| DI3 | **Font inconsistency** | Dashboard uses Work Sans instead of Inter | Standardize on Inter (body) + Playfair Display (serif) per DESIGN.md |
| DI4 | **Service charge vs tax** | Some designs show separate "Service Charge (5%)" + "PB1 Tax (10%)" | Implement as separate line items (columns C2 + C3 in orders table) |
| DI5 | **"Voided" vs "Cancelled"** | Design uses "Voided", DB enum uses `cancelled` | UI label mapping only; no backend change needed |
| DI6 | **i18n**: Prompt requests FR/ID/EN | CLAUDE.md says i18n is SUSPENDED, English only | Follow CLAUDE.md: English only. Multilingual remains suspended |

---

## 8. REALTIME SUBSCRIPTIONS MAP

| Page | Table(s) | Event | Purpose |
|------|----------|-------|---------|
| B1, B4, C2 | `orders` | INSERT, UPDATE | Live order count, status updates |
| C1 | `products` | UPDATE | Product availability, price changes |
| K1 | `orders`, `stock_movements` | INSERT | Live dashboard KPIs |
| K4 | `floor_plan_items` | UPDATE | Collaborative floor plan editing |
| K5, L3 | `lan_nodes` | UPDATE | Station/device connection status |
| L2, L3 | `sync_queue` | INSERT, UPDATE | Sync queue status |

---

## 9. PERMISSIONS MAP (New codes potentially needed)

| # | Permission Code | Module | Pages | Exists? |
|---|----------------|--------|-------|---------|
| P1 | `promotions.create` | promotions | D6, D7 | VERIFY |
| P2 | `promotions.update` | promotions | D6, D7 | VERIFY |
| P3 | `promotions.delete` | promotions | D6 | VERIFY |
| P4 | `products.delete` | products | D3 | VERIFY |
| P5 | `audit.view` | admin | M4 | VERIFY (currently uses `settings.view`) |

---

## 10. PAGE-LEVEL STATUS SUMMARY

| Module | Pages | All Green | Has Yellow | Has Red |
|--------|-------|-----------|------------|---------|
| A: Auth | 4 | 4 | 0 | 0 |
| B: Mobile | 4 | 1 | 2 | 1 |
| C: POS & Orders | 5 | 0 | 4 | 2 |
| D: Products | 9 | 3 | 5 | 1 |
| E: Inventory | 8 | 3 | 5 | 0 |
| F: Customers | 3 | 1 | 1 | 1 |
| G: B2B | 2 | 0 | 1 | 2 |
| H: Accounting | 7 | 1 | 4 | 3 |
| I: Purchasing | 4 | 1 | 1 | 2 |
| J: AR | 1 | 0 | 0 | 1 |
| K: Settings | 11 | 3 | 2 | 6 |
| L: Notifications & Sync | 3 | 0 | 1 | 3 |
| M: Security & Admin | 4 | 1 | 1 | 2 |
| N: Reports | 2 | 0 | 2 | 0 |
| O: Analytics | 1 | 0 | 1 | 1 |
| **TOTAL** | **68** | **18** | **30** | **25** |

> 18 pages are fully GREEN (27%), 30 have YELLOW items (44%), 25 have RED items (37%).
> Note: Some pages have both YELLOW and RED items.
