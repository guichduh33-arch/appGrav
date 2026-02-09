# AppGrav - Missing Modules Specifications

**Date**: February 9, 2026
**Purpose**: Detailed specifications for modules identified as missing or incomplete during audit.

---

## 1. Email Notification Service

### Current State
- `send-test-email` edge function exists but is a STUB (no actual sending)
- SMTP settings UI exists at `/settings/notifications`
- No transactional email templates

### Required Implementation

#### Edge Function: `send-email`
```typescript
// Input
{
  template: 'order_confirmation' | 'daily_summary' | 'low_stock_alert' | 'pin_reset' | 'invoice',
  to: string,
  data: Record<string, unknown>
}

// Templates
order_confirmation: { order_number, items, total, payment_method }
daily_summary: { date, total_orders, total_revenue, top_products }
low_stock_alert: { products: { name, current_stock, threshold }[] }
pin_reset: { user_name, reset_link, expiry }
invoice: { invoice_number, customer, items, total, due_date }
```

#### Database Changes
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  subject VARCHAR NOT NULL,
  html_body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR NOT NULL,
  recipient VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 2. Payment Gateway Integration (QRIS/Midtrans)

### Current State
- Payment methods defined: cash, card, qris, edc, transfer
- QRIS is manual entry only (no QR generation)
- No webhook handler for payment confirmations

### Required Implementation

#### Edge Function: `payment-webhook`
```typescript
// Midtrans webhook notification
{
  transaction_type: 'on-us' | 'off-us',
  transaction_time: string,
  transaction_status: 'capture' | 'settlement' | 'pending' | 'deny' | 'cancel' | 'expire',
  transaction_id: string,
  status_message: string,
  status_code: string,
  payment_type: 'qris' | 'bank_transfer' | 'credit_card',
  order_id: string,
  gross_amount: string,
  currency: 'IDR'
}
```

#### Database Changes
```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  gateway VARCHAR NOT NULL, -- 'midtrans', 'xendit'
  gateway_transaction_id VARCHAR,
  payment_type VARCHAR NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payment_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  gateway VARCHAR NOT NULL,
  expected_total DECIMAL(15,2),
  actual_total DECIMAL(15,2),
  discrepancy DECIMAL(15,2),
  status VARCHAR DEFAULT 'pending', -- pending, matched, discrepancy
  notes TEXT,
  reconciled_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Service: `paymentGatewayService.ts`
```typescript
interface IPaymentGatewayService {
  createQRISPayment(orderId: string, amount: number): Promise<{ qr_url: string, transaction_id: string }>;
  checkPaymentStatus(transactionId: string): Promise<IPaymentStatus>;
  handleWebhook(notification: IMidtransNotification): Promise<void>;
  reconcileDay(date: string): Promise<IReconciliationResult>;
}
```

---

## 3. Conflict Resolution UI

### Current State
- `financialOperationService.ts` detects conflicts via `shouldRejectForConflict()`
- Conflicts result in rejected operations with error message
- No UI for viewing or resolving conflicts

### Required Implementation

#### Component: `ConflictResolutionDialog`
```
+----------------------------------------+
| Sync Conflict Detected                  |
|                                         |
| Order #OFF-20260209-00042               |
|                                         |
| Your Version    |  Server Version       |
| Total: 150,000  |  Total: 145,000       |
| Items: 5        |  Items: 4             |
| Status: paid    |  Status: paid         |
| Modified: 14:30 |  Modified: 14:25      |
|                                         |
| [Keep Mine] [Keep Server] [View Diff]   |
+----------------------------------------+
```

#### Database Changes
```sql
CREATE TABLE sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR NOT NULL, -- 'order', 'product', 'customer'
  entity_id UUID NOT NULL,
  local_version JSONB NOT NULL,
  server_version JSONB NOT NULL,
  resolution VARCHAR, -- 'local_wins', 'server_wins', 'merged', 'pending'
  resolved_by UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMPTZ,
  device_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Advanced KDS Features

### Current State
- Basic station routing (barista/kitchen/display/none)
- KDSOrderCard and KDSCountdownBar components
- kdsStatusService with status progression
- No ticket aging, no speed metrics, no all-day view

### Required Implementation

#### 4.1 Ticket Aging System
```typescript
// src/services/kds/ticketAgingService.ts
interface ITicketAgingConfig {
  greenThresholdMinutes: number;   // default: 5
  yellowThresholdMinutes: number;  // default: 10
  redThresholdMinutes: number;     // default: 15
  audioAlertEnabled: boolean;
  audioAlertThresholdMinutes: number;
}

function getTicketColor(createdAt: Date, config: ITicketAgingConfig): 'green' | 'yellow' | 'red';
```

#### 4.2 Speed of Service Dashboard
```
+------------------------------------------+
| Kitchen Performance                       |
|                                           |
| Avg Prep Time: 8.5 min                   |
| Orders Completed: 47                      |
| Orders Pending: 12                        |
|                                           |
| By Station:                               |
| Kitchen  | Avg: 12.3 min | Pending: 8    |
| Barista  | Avg: 4.2 min  | Pending: 4    |
|                                           |
| Hourly Trend: [chart]                     |
+------------------------------------------+
```

#### Database Changes
```sql
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS
  preparation_started_at TIMESTAMPTZ,
  preparation_completed_at TIMESTAMPTZ,
  preparation_station VARCHAR;
```

---

## 5. Split Bill / Check Model

### Current State
- Orders have a flat structure: order -> order_items
- Split payment exists (multiple payment methods per order)
- No per-guest billing capability

### Required Implementation

#### Database Changes
```sql
CREATE TABLE order_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  check_number INTEGER NOT NULL,
  guest_name VARCHAR,
  subtotal DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  status VARCHAR DEFAULT 'open', -- open, paid, voided
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add check_id to order_items
ALTER TABLE order_items ADD COLUMN
  check_id UUID REFERENCES order_checks(id);

-- Payments link to checks, not orders
CREATE TABLE check_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id UUID NOT NULL REFERENCES order_checks(id),
  payment_method VARCHAR NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Multi-Location Support

### Current State
- Single-location architecture
- No location_id on core tables
- LAN services exist for multi-terminal (same location)

### Required Implementation

#### Database Changes
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  code VARCHAR UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR,
  tax_id VARCHAR,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add location_id to core tables
ALTER TABLE orders ADD COLUMN location_id UUID REFERENCES locations(id);
ALTER TABLE stock_movements ADD COLUMN location_id UUID REFERENCES locations(id);
ALTER TABLE pos_sessions ADD COLUMN location_id UUID REFERENCES locations(id);
ALTER TABLE inventory_counts ADD COLUMN location_id UUID REFERENCES locations(id);

-- Cross-location transfers
CREATE TABLE location_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id UUID NOT NULL REFERENCES locations(id),
  to_location_id UUID NOT NULL REFERENCES locations(id),
  status VARCHAR DEFAULT 'pending', -- pending, in_transit, received, cancelled
  transfer_number VARCHAR UNIQUE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id),
  received_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  received_at TIMESTAMPTZ
);

CREATE TABLE location_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID NOT NULL REFERENCES location_transfers(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_sent DECIMAL(10,3) NOT NULL,
  quantity_received DECIMAL(10,3),
  unit VARCHAR DEFAULT 'pcs'
);
```

---

## 7. e-Faktur Integration

### Current State
- Company NPWP field exists in settings
- Tax calculation at 10% (should be configurable for 11% PPN)
- No e-Faktur XML generation

### Required Implementation

#### Edge Function: `generate-efaktur`
```typescript
// Input
{
  invoice_ids: string[],
  format: 'csv' | 'xml'
}

// Output: CSV/XML file for DJP e-Faktur import
// Fields required by DJP:
// - NPWP Penjual, NPWP Pembeli
// - Nomor Faktur, Tanggal Faktur
// - DPP (Dasar Pengenaan Pajak), PPN, PPnBM
// - Nama Barang, Harga, Jumlah, Diskon
```

#### Database Changes
```sql
CREATE TABLE tax_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  invoice_number VARCHAR UNIQUE, -- Nomor Faktur from DJP
  customer_npwp VARCHAR,
  dpp DECIMAL(15,2) NOT NULL, -- DPP = total / 1.11
  ppn DECIMAL(15,2) NOT NULL, -- PPN = DPP * 0.11
  total DECIMAL(15,2) NOT NULL,
  status VARCHAR DEFAULT 'draft', -- draft, submitted, approved, rejected
  efaktur_xml TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. Expense Tracking Module

### Current State
- No expense tracking functionality
- Profit/loss report exists but lacks expense data
- No expense categories or vendor payments

### Required Implementation

#### Database Changes
```sql
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  code VARCHAR UNIQUE,
  parent_id UUID REFERENCES expense_categories(id),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES expense_categories(id),
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  payment_method VARCHAR,
  receipt_url VARCHAR,
  supplier_id UUID REFERENCES suppliers(id),
  approved_by UUID REFERENCES user_profiles(id),
  status VARCHAR DEFAULT 'pending', -- pending, approved, rejected
  location_id UUID REFERENCES locations(id),
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Pages
- `/expenses` - Expense list with filters
- `/expenses/new` - Create expense
- `/expenses/categories` - Manage categories
- `/reports` - Add expense tab to existing reports

---

## 9. Scheduled Reports & Auto-Exports

### Current State
- 20+ manual report types
- CSV and PDF export available
- No scheduling or automatic delivery

### Required Implementation

#### Database Changes
```sql
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR NOT NULL,
  frequency VARCHAR NOT NULL, -- daily, weekly, monthly
  day_of_week INTEGER, -- 0-6 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  time_of_day TIME NOT NULL,
  format VARCHAR DEFAULT 'pdf', -- pdf, csv, excel
  recipients JSONB NOT NULL, -- [{email, name}]
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES report_schedules(id),
  report_type VARCHAR NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  file_url VARCHAR,
  status VARCHAR DEFAULT 'generated', -- generated, sent, failed
  error_message TEXT
);
```

---

## Implementation Priority Matrix

| Module | Business Impact | Dev Effort | Priority |
|--------|----------------|-----------|----------|
| Email Notifications | High | Medium | P1 |
| QRIS Payment | High | High | P1 |
| Conflict Resolution UI | High | Medium | P1 |
| KDS Enhancement | Medium | Medium | P2 |
| Split Bill | Medium | High | P2 |
| e-Faktur | Medium | Medium | P2 |
| Expense Tracking | Medium | Medium | P2 |
| Multi-Location | Low (currently) | Very High | P3 |
| Scheduled Reports | Low | Medium | P3 |
