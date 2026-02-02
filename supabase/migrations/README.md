# The Breakery POS - Database Migrations (Consolidated)

## Overview

This directory contains the **consolidated database schema** for The Breakery POS & Mini-ERP system.

**Previous state:** 113 migration files with accumulated technical debt
**Current state:** 14 clean, domain-organized migrations

## Migration Files

| # | File | Domain | Description |
|---|------|--------|-------------|
| 001 | `001_extensions_enums.sql` | Core | PostgreSQL extensions (uuid-ossp, pg_trgm) and all enum types |
| 002 | `002_core_products.sql` | Products | Categories, sections, products, suppliers, modifiers, UOMs, recipes |
| 003 | `003_customers_loyalty.sql` | Customers | Customer categories, loyalty tiers, customers, loyalty transactions |
| 004 | `004_sales_orders.sql` | Sales | POS terminals, sessions, orders, order items, floor plan |
| 005 | `005_inventory_stock.sql` | Inventory | Stock locations, movements, production records, transfers, purchase orders |
| 006 | `006_combos_promotions.sql` | Marketing | Product combos, combo groups, promotions, promotion usage |
| 007 | `007_b2b_wholesale.sql` | B2B | B2B orders, payments, deliveries, price lists |
| 008 | `008_users_permissions.sql` | Auth | Roles, permissions, user profiles, user sessions, audit logs |
| 009 | `009_system_settings.sql` | Settings | Settings categories, settings, printers, tax rates, payment methods |
| 010 | `010_lan_sync_display.sql` | Network | LAN nodes, sync devices, sync queue, KDS stations, display content |
| 011 | `011_functions_triggers.sql` | Logic | All database functions and triggers |
| 012 | `012_rls_policies.sql` | Security | Row Level Security policies for all tables |
| 013 | `013_views_reporting.sql` | Reporting | All reporting views (KPIs, inventory valuation, sales, etc.) |
| 014 | `014_seed_data.sql` | Data | Initial seed data (roles, permissions, categories, etc.) |

## Execution Order

Migrations must be executed **in numerical order** (001 → 014) due to dependencies:

```
001 Extensions/Enums
 ↓
002-010 Schema Tables (domain-organized)
 ↓
011 Functions & Triggers (references tables)
 ↓
012 RLS Policies (references tables & functions)
 ↓
013 Views (references tables)
 ↓
014 Seed Data (references all above)
```

## Deploying to a Fresh Database

### Option 1: Supabase CLI (Recommended)

```bash
# Reset and apply all migrations
supabase db reset

# Or apply incrementally
supabase db push
```

### Option 2: Manual SQL Execution

```bash
# Connect to your database and execute each file in order
psql -h <host> -U postgres -d postgres -f migrations/001_extensions_enums.sql
psql -h <host> -U postgres -d postgres -f migrations/002_core_products.sql
# ... continue for all files
```

### Option 3: Single Combined File

For deployment convenience, concatenate all files:

```bash
cat migrations/*.sql > combined_schema.sql
psql -h <host> -U postgres -d postgres -f combined_schema.sql
```

## Key Design Decisions

### 1. Domain-Based Organization
Each migration file represents a functional domain, making it easier to:
- Understand the system architecture
- Find and modify specific functionality
- Onboard new developers

### 2. Explicit Dependencies
Foreign key constraints use explicit references with ON DELETE behaviors:
- `CASCADE` for child records (order_items → orders)
- `SET NULL` for optional references (products → suppliers)
- `RESTRICT` for critical references (user_roles → roles)

### 3. Consistent Indexing Strategy
- Primary keys: UUID with `gen_random_uuid()`
- Foreign keys: Always indexed
- Composite indexes for common query patterns
- Partial indexes for filtered queries (e.g., `WHERE is_active = TRUE`)

### 4. Row Level Security (RLS)
All tables have RLS enabled with policies based on:
- Authentication state (`auth.uid()`)
- Permission checks via `user_has_permission()` function
- Role-based access for sensitive operations

### 5. Audit Trail
Critical tables include:
- `created_at` / `updated_at` timestamps
- Audit triggers for change tracking
- `audit_logs` table for detailed history

## Enum Types Reference

| Enum | Values |
|------|--------|
| `product_type` | finished, semi_finished, raw_material |
| `order_status` | pending, preparing, ready, completed, cancelled |
| `order_type` | dine_in, takeaway, delivery, b2b |
| `payment_status` | pending, partial, paid, refunded |
| `payment_method` | cash, card, qris, edc, transfer, credit |
| `movement_type` | purchase, sale, adjustment, transfer_in, transfer_out, production, waste, return |
| `discount_type` | percentage, fixed |
| `dispatch_station` | barista, kitchen, display, none |
| `b2b_order_status` | draft, confirmed, preparing, ready, delivered, completed, cancelled |
| `po_status` | draft, ordered, partial, received, cancelled |
| `loyalty_tier` | bronze, silver, gold, platinum |
| `user_role` | owner, manager, cashier, barista, kitchen, warehouse, admin |
| `sync_device_type` | pos, kds, display, mobile, tablet |

## Archived Migrations

The original 113 migration files are preserved in `../migrations-archive/` for reference.
These should NOT be executed on new databases.

## Adding New Migrations

When adding new functionality:

1. **Small changes**: Add to the appropriate domain file if not yet deployed
2. **After deployment**: Create new migration file with next number (e.g., `015_new_feature.sql`)
3. **Always include**:
   - Table creation with indexes
   - RLS policies
   - Required functions/triggers
   - Seed data if needed

## Troubleshooting

### Common Issues

1. **Extension not available**: Ensure you have superuser access or use Supabase dashboard
2. **RLS blocking access**: Check user permissions and auth state
3. **Foreign key violations**: Ensure seed data is applied in correct order
4. **Function not found**: Verify `011_functions_triggers.sql` was applied

### Useful Queries

```sql
-- Check all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies on a table
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Check enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'product_type'::regtype;
```

---

*Consolidated on 2026-02-03 from 113 migration files*
*For The Breakery POS & Mini-ERP System*
