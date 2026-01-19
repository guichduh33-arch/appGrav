# Order of Migration Execution

To fix the customer registration error, execute these migrations in order:

## 1. Customer Categories First (028)
**File:** `028_customer_loyalty_system.sql`

This creates:
- `customer_categories` table (required by customers table)
- `customer_category_prices` table
- `loyalty_transactions` table
- `loyalty_tiers` table
- `loyalty_rewards` table
- `loyalty_redemptions` table

**Why first?** The `customers` table has a foreign key to `customer_categories`, so categories must exist first.

## 2. Fix Customer Categories RLS (032)
**File:** `032_customer_categories_rls_simple.sql`

This fixes permissions for:
- `customer_categories` table
- `customer_category_prices` table

## 3. Fix or Create Customers Table (035)
**File:** `035_create_or_fix_customers_table.sql`

This:
- Creates `customers` table if missing
- Adds missing columns to existing table
- Sets up RLS policies
- Creates indexes and triggers

## 4. Fix All Customer System RLS (033)
**File:** `033_fix_customers_rls.sql`

This fixes permissions for:
- `customers` table
- All loyalty tables

## After Running All Migrations

Test by creating a customer category first:
```sql
INSERT INTO public.customer_categories (name, slug, color, price_modifier_type, is_active)
VALUES ('Standard', 'standard', '#6366f1', 'retail', true);
```

Then try creating a customer from the UI.

## Common Issues

### Error: "relation customer_categories does not exist"
**Solution:** Run migration 028 first

### Error: "permission denied" or "new row violates row-level security policy"
**Solution:** Run migrations 032 and 033 to fix RLS policies

### Error: "insert or update on table customers violates foreign key constraint"
**Solution:** Create at least one customer category first (see test SQL above)
