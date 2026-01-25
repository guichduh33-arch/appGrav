# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppGrav is a full-stack ERP/POS system for "The Breakery," a French bakery in Lombok, Indonesia. The system handles ~200 transactions/day with 10% tax calculation and supports three languages (French, English, Indonesian).

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Lint codebase
npm run lint

# Run all tests
npx vitest run

# Run a single test file
npx vitest run src/path/to/test.test.ts

# Run tests in watch mode
npx vitest

# Test Claude API integration
npm run test:claude
```

**Path Alias**: Use `@/` to import from `src/` (configured in `vite.config.ts` and `tsconfig.json`)

## Tech Stack

- **Frontend**: React 18.2 + TypeScript 5.2 + Vite 5.x
- **State Management**: Zustand (cart, auth, orders stores)
- **Styling**: Tailwind CSS + Lucide React icons
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Routing**: React Router DOM 6.x
- **Data Fetching**: @tanstack/react-query
- **i18n**: i18next (French default, English, Indonesian)
- **Charts**: Recharts

## Architecture

### Directory Structure

```
src/
├── components/       # React components by feature (pos/, inventory/, ui/)
├── pages/           # Route-based page components
│   ├── customers/   # Customer management module
│   ├── products/    # Products management module (includes Combos & Promotions)
│   ├── inventory/   # Stock & inventory module
│   ├── b2b/         # B2B wholesale module
│   ├── purchasing/  # Purchase orders module
│   └── ...
├── stores/          # Zustand stores (cartStore, authStore, orderStore)
├── hooks/           # Custom React hooks (useInventory, useOrders, useProducts, useStock, usePermissions, useSettings, useShift)
├── services/        # External API integrations (Claude AI, Anthropic, promotionService)
├── types/           # TypeScript types (database.ts contains full schema)
├── lib/             # Utilities (supabase.ts client init)
├── locales/         # i18n translation files
└── styles/          # CSS files
supabase/
├── migrations/      # SQL migrations (001-047)
└── functions/       # Edge Functions (Deno/TypeScript)
```

### State Management Pattern

Four Zustand stores manage application state:
- **cartStore**: Shopping cart with modifiers, locked items (sent to kitchen requiring PIN to modify), discounts, customer selection, combo selections
- **authStore**: User authentication and session
- **orderStore**: Order lifecycle management
- **settingsStore**: Application settings and preferences

Cart items can be of type `'product'` (regular products with modifiers) or `'combo'` (combo deals with `comboSelections`). Locked items cannot be modified or removed without PIN verification.

### Database Schema

Core tables in Supabase PostgreSQL:
- `products` (finished, semi_finished, raw_material types)
- `categories` (with dispatch_station: barista, kitchen, display, none)
- `orders` / `order_items`
- `customers` (loyalty_points, loyalty_tier, customer_type: retail/wholesale)
- `customer_categories` (slug, price_modifier_type: retail/wholesale/discount_percentage/custom)
- `product_category_prices` (custom prices per customer category)
- `loyalty_transactions` / `loyalty_tiers` (loyalty program)
- `pos_sessions` (drawer open/close tracking)
- `stock_movements` (inventory audit trail)
- `production_records` / `recipes`
- `product_modifiers` (variant groups and options)
- `user_profiles` (roles: admin, cashier, barista, kitchen, etc.)
- `b2b_orders` / `b2b_order_items` / `b2b_payments` (B2B module)
- `purchase_orders` / `po_items` / `suppliers` (purchasing module)
- `floor_plan_items` (table layout for POS)
- `product_combos` / `product_combo_groups` / `product_combo_group_items` (combo deals with choice groups and price adjustments)
- `promotions` / `promotion_products` / `promotion_free_products` / `promotion_usage` (promotion system)

Key views: `view_daily_kpis`, `view_inventory_valuation`, `view_payment_method_stats`

### Database Utility Functions

```sql
-- Permission checking
user_has_permission(p_user_id UUID, p_permission_code VARCHAR) → BOOLEAN
is_admin(p_user_id UUID) → BOOLEAN

-- Customer pricing
get_customer_product_price(p_product_id UUID, p_customer_category_slug VARCHAR) → DECIMAL

-- Loyalty management
add_loyalty_points(p_customer_id UUID, p_points INTEGER, p_order_id UUID) → VOID
redeem_loyalty_points(p_customer_id UUID, p_points INTEGER) → BOOLEAN
```

### RLS Pattern (Always enable for new tables)

```sql
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON public.{table_name}
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based write" ON public.{table_name}
    FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), '{module}.create'));
```

### Key Routes

- `/pos` - Main POS interface (fullscreen, touch-optimized)
- `/kds/:station` - Kitchen Display System by station
- `/products` - Products management (dedicated module with tabs)
- `/products/combos` - Combo deals management
- `/products/promotions` - Promotions management (time-based, flexible rules)
- `/products/:id/pricing` - Product pricing by customer category
- `/inventory` - Stock & inventory management
- `/inventory/stock-opname` - Physical inventory counts
- `/production` - Production orders and workflow
- `/customers` - Customer management with loyalty
- `/customers/categories` - Customer categories (B2B, VIP, Staff, etc.)
- `/b2b` - B2B ordering module
- `/purchasing/purchase-orders` - Purchase orders
- `/purchasing/suppliers` - Supplier management
- `/reports` - Analytics dashboard

## Coding Conventions

- **Components**: PascalCase
- **Functions/variables**: camelCase
- **Interfaces**: PascalCase with `I` prefix (e.g., `IProduct`)
- **Types**: PascalCase with `T` prefix (e.g., `TOrderStatus`)
- **Database columns**: snake_case
- **Primary keys**: UUID (`id`)
- **Timestamps**: `created_at`, `updated_at`
- **Foreign keys**: `table_name_id`
- **Max file length**: 300 lines
- **Prefer**: Functional components with hooks

## Business Rules

- Currency: IDR (Indonesian Rupiah), rounded to nearest 100 IDR
- Tax rate: 10% **included** in prices (tax = total × 10/110)
- Loyalty: 1 point = 1,000 IDR spent
- Loyalty tiers with discounts:
  - Bronze: 0pts (0% discount)
  - Silver: 500pts (5% discount)
  - Gold: 2,000pts (8% discount)
  - Platinum: 5,000pts (10% discount)
- Customer categories with pricing:
  - `retail`: Standard retail price
  - `wholesale`: Uses wholesale_price from products
  - `discount_percentage`: Applies X% discount on retail price
  - `custom`: Uses product_category_prices table for specific pricing
- Stock alerts: <10 units (warning), <5 units (critical)
- Order types: dine_in, takeaway, delivery, b2b

## Customer & Loyalty System

### Customer Categories (customer_categories table)
- **slug**: Unique identifier (e.g., 'standard', 'wholesale', 'vip', 'staff')
- **price_modifier_type**: How pricing is calculated
- **discount_percentage**: Used when price_modifier_type = 'discount_percentage'

### Pricing Logic (get_customer_product_price function)
1. Check for custom price in `product_category_prices` → use if exists
2. If category is 'wholesale' → use `products.wholesale_price`
3. If category has discount_percentage → apply % reduction on retail
4. Default → use `products.retail_price`

### Loyalty Program
- QR code per customer for identification at POS
- Points accumulation via `add_loyalty_points()` function
- Points redemption via `redeem_loyalty_points()` function
- Automatic tier upgrades based on lifetime_points

## Permission Codes

Key permissions used in `usePermissions` hook and `PermissionGuard` component:
- **Sales**: `sales.view`, `sales.create`, `sales.void`, `sales.discount`, `sales.refund`
- **Inventory**: `inventory.view`, `inventory.create`, `inventory.update`, `inventory.delete`, `inventory.adjust`
- **Products**: `products.view`, `products.create`, `products.update`, `products.pricing`
- **Customers**: `customers.view`, `customers.create`, `customers.update`, `customers.loyalty`
- **Reports**: `reports.sales`, `reports.inventory`, `reports.financial`
- **Admin**: `users.view`, `users.create`, `users.roles`, `settings.view`, `settings.update`

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-claude-api-key
```

## Database Migrations

Migrations are in `supabase/migrations/`. Apply via Supabase dashboard or CLI. Notable migrations:
- Stock triggers (auto-update on movements)
- RLS policies (required on all tables)
- Floor plan / table layout
- Purchase orders & B2B sales modules
- Customer loyalty system (customer_categories, loyalty_tiers, loyalty_transactions)
- Product category prices (get_customer_product_price function)
- Combos and Promotions (product_combos, promotions with time-based rules)
- Combo Choice Groups (product_combo_groups with price adjustments)
- Stock movements and transfers
- Users & permissions module
- Settings module

## Mobile (Capacitor)

The project includes Capacitor for iOS/Android builds. Key commands:
```bash
# Sync web assets to native projects
npx cap sync

# Open iOS project in Xcode
npx cap open ios

# Open Android project in Android Studio
npx cap open android
```

## Common Pitfalls

- **Async data**: Always use optional chaining (`data?.map(...)`) for data that may be undefined
- **RLS forgotten**: Every new table MUST have RLS enabled + policies
- **Types out of sync**: After SQL schema changes, update `src/types/database.ts`
- **Missing translations**: Add to ALL 3 locale files (`fr.json`, `en.json`, `id.json`)
- **Locked cart items**: Items sent to kitchen are locked and require PIN to modify (see `cartStore.ts`)

## New Feature Workflow

1. **Database**: Create migration in `supabase/migrations/` with table + RLS policies
2. **Types**: Add TypeScript types to `src/types/database.ts`
3. **Hook**: Create `src/hooks/useFeatureName.ts` with react-query
4. **Components**: Add to `src/components/feature/` and `src/pages/feature/`
5. **Translations**: Add keys to all 3 locale files (`fr.json`, `en.json`, `id.json`)
6. **Route**: Register in router configuration

## Additional Documentation

- `DEVELOPMENT_INSTRUCTIONS.md` - Detailed development guide (French) with code patterns, feature workflow, and common pitfalls
- `docs/COMBOS_AND_PROMOTIONS.md` - Combos & promotions module spec
- `docs/COMBO_CHOICE_GROUPS.md` - Combo choice groups with price adjustments
- `docs/COMBO_POS_INTEGRATION.md` - POS integration for combos
- `docs/STOCK_MOVEMENTS_MODULE.md` - Stock movements module spec
- `docs/prompt-module-settings-erp.md` - Settings module spec
- `docs/prompt-module-utilisateur-erp.md` - Users module spec
