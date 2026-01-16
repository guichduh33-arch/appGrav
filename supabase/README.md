# The Breakery - Supabase Backend

Complete Supabase backend configuration for The Breakery POS & Mini-ERP system.

## 📁 Structure

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql      # Tables, ENUMs, indexes, RLS enable
│   ├── 002_seed_data.sql           # Sample data for development
│   ├── 003_functions_triggers.sql  # Functions and triggers
│   ├── 004_rls_policies.sql        # Row Level Security policies
│   └── 005_storage_views.sql       # Storage buckets and database views
├── functions/
│   ├── _shared/
│   │   ├── cors.ts                 # CORS headers utility
│   │   └── supabase-client.ts      # Supabase client factory
│   ├── generate-invoice/           # B2B invoice generation
│   ├── send-to-printer/            # Thermal printer integration
│   └── calculate-daily-report/     # Daily sales report
└── types/
    └── database.ts                 # TypeScript type definitions
```

## 🚀 Deployment

### Option 1: Supabase Dashboard

1. Go to your Supabase project's SQL Editor
2. Run migrations in order: `001` → `002` → `003` → `004` → `005`
3. Deploy Edge Functions via Dashboard or CLI

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy generate-invoice
supabase functions deploy send-to-printer
supabase functions deploy calculate-daily-report
```

### Option 3: Local Development

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Local functions development
supabase functions serve
```

## 📊 Database Schema

### Tables (18)

| Table | Description | RLS |
|-------|-------------|-----|
| `categories` | Product categories | ✅ |
| `products` | Product catalog | ✅ |
| `product_modifiers` | Product customization options | ✅ |
| `customers` | Retail and B2B customers | ✅ |
| `user_profiles` | Staff profiles | ✅ |
| `pos_sessions` | Cash register sessions | ✅ |
| `orders` | POS orders | ✅ |
| `order_items` | Order line items | ✅ |
| `stock_movements` | Stock movement history | ✅ |
| `recipes` | Bill of Materials | ✅ |
| `production_records` | Production tracking | ✅ |
| `suppliers` | Supplier management | ✅ |
| `purchase_orders` | Purchase orders | ✅ |
| `po_items` | PO line items | ✅ |
| `b2b_orders` | B2B/wholesale orders | ✅ |
| `b2b_order_items` | B2B order line items | ✅ |
| `audit_log` | Audit trail | ✅ |
| `app_settings` | Application settings | ✅ |

### Views

- `pos_products` - Active products for POS display
- `kds_queue` - Kitchen Display System queue
- `low_stock_products` - Products below minimum stock
- `daily_sales_summary` - Daily sales aggregations
- `todays_orders` - Today's orders with details

### Key Functions

| Function | Purpose |
|----------|---------|
| `generate_order_number()` | Auto-generates POS-YYYYMMDD-XXXX |
| `update_product_stock()` | Updates stock on movements |
| `calculate_loyalty_points()` | Calculates customer points |
| `process_production()` | Processes production with BOM |
| `verify_manager_pin()` | Validates manager PIN |

## 🔐 Security

### User Roles

| Role | POS | KDS | Backoffice | Reports | Admin |
|------|-----|-----|------------|---------|-------|
| `admin` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manager` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `cashier` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `server` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `barista` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `kitchen` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `backoffice` | ❌ | ❌ | ✅ | ✅ | ❌ |

### RLS Helper Functions

```sql
get_user_role()           -- Returns current user's role
is_admin_or_manager()     -- Check admin/manager access
can_access_pos()          -- Check POS access
can_access_backoffice()   -- Check backoffice access
can_access_kds()          -- Check KDS access
```

## ⚡ Realtime

Enabled for:
- `orders` - New order notifications
- `order_items` - KDS updates
- `pos_sessions` - Session status
- `products` - Stock changes
- `stock_movements` - Stock alerts

## 📦 Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `product-images` | ✅ | Product photos |
| `receipts` | ❌ | POS receipts |
| `invoices` | ❌ | B2B invoices |

## 🔧 Edge Functions

### generate-invoice

Generates HTML invoice for B2B orders.

```typescript
// Request
POST /functions/v1/generate-invoice
{ "order_id": "uuid" }

// Response: HTML invoice
```

### send-to-printer

Sends print jobs to local thermal printer.

```typescript
// Request
POST /functions/v1/send-to-printer
{
  "type": "receipt" | "kitchen",
  "data": { ... }
}
```

### calculate-daily-report

Generates comprehensive daily report.

```typescript
// Request
POST /functions/v1/calculate-daily-report
{ "date": "2025-01-13" }

// Response: DailyReport object
```

## 🔗 TypeScript Integration

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Fully typed queries
const { data: products } = await supabase
  .from('products')
  .select('*, category:categories(name)')
  .eq('pos_visible', true);
```

## 📋 Environment Variables

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Edge Functions
PRINT_SERVER_URL=http://192.168.1.50:3001
```

---

*Version 2.0.0 | The Breakery | January 2025*
