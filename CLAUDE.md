# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppGrav is an ERP/POS system for "The Breakery," a French bakery in Lombok, Indonesia. The system handles ~200 transactions/day with 10% tax (included in prices) and supports three languages (French default, English, Indonesian).

## Development Commands

```bash
npm run dev              # Start development server
npm run build            # TypeScript check + Vite build
npm run lint             # ESLint check
npx vitest run           # Run all tests
npx vitest run src/path/to/test.test.ts  # Run single test
npx vitest               # Tests in watch mode
npm run test:claude      # Test Claude API integration
```

**Path Alias**: Use `@/` to import from `src/`

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **State**: Zustand (cartStore, authStore, orderStore, settingsStore)
- **Styling**: Tailwind CSS + Lucide React icons
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Data Fetching**: @tanstack/react-query
- **i18n**: i18next (fr.json, en.json, id.json)
- **Mobile**: Capacitor (iOS/Android)

### Key Directory Structure
```
src/
├── components/       # By feature (pos/, inventory/, ui/)
├── pages/           # Route-based pages
├── stores/          # Zustand: cartStore, authStore, orderStore, settingsStore
├── hooks/           # useInventory, useOrders, useProducts, useStock, usePermissions, useSettings, useShift
├── services/        # External APIs (Claude AI, promotionService)
├── types/           # database.ts = full schema
├── lib/             # supabase.ts client
└── locales/         # Translation files
supabase/
├── migrations/      # SQL migrations
└── functions/       # Edge Functions (Deno)
```

### State Management

**cartStore** - Shopping cart with:
- Items of type `'product'` (with modifiers) or `'combo'` (with comboSelections)
- **Locked items**: Items sent to kitchen require PIN verification to modify/remove
- Order context: tableNumber, customerId, discountType/Value

**authStore** - User session and authentication

**orderStore** - Order lifecycle management

**settingsStore** - Application preferences

### Database Schema (Supabase PostgreSQL)

**Core**: `products` (finished/semi_finished/raw_material types), `categories` (dispatch_station: barista/kitchen/display/none), `suppliers`

**Sales**: `orders`, `order_items`, `pos_sessions`, `floor_plan_items`

**Customers**: `customers`, `customer_categories` (slug, price_modifier_type), `product_category_prices`, `loyalty_tiers`, `loyalty_transactions`

**Inventory**: `stock_movements`, `production_records`, `recipes`, `product_modifiers`

**Combos/Promotions**: `product_combos`, `product_combo_groups`, `product_combo_group_items`, `promotions`, `promotion_products`, `promotion_free_products`, `promotion_usage`

**B2B**: `b2b_orders`, `b2b_order_items`, `b2b_payments`

**Purchasing**: `purchase_orders`, `po_items`

**System**: `user_profiles` (roles: admin, cashier, barista, kitchen, etc.)

**Key Views**: `view_daily_kpis`, `view_inventory_valuation`, `view_payment_method_stats`

### Database Functions
```sql
user_has_permission(p_user_id UUID, p_permission_code VARCHAR) → BOOLEAN
is_admin(p_user_id UUID) → BOOLEAN
get_customer_product_price(p_product_id UUID, p_customer_category_slug VARCHAR) → DECIMAL
add_loyalty_points(p_customer_id UUID, p_points INTEGER, p_order_id UUID) → VOID
redeem_loyalty_points(p_customer_id UUID, p_points INTEGER) → BOOLEAN
```

### RLS Pattern (REQUIRED for new tables)
```sql
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read" ON public.{table_name}
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Permission-based write" ON public.{table_name}
    FOR INSERT WITH CHECK (public.user_has_permission(auth.uid(), '{module}.create'));
```

## Coding Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Functions/Variables | camelCase | `handleSubmit` |
| Interfaces | PascalCase + `I` prefix | `IProduct` |
| Types | PascalCase + `T` prefix | `TOrderStatus` |
| DB columns | snake_case | `created_at` |
| Primary keys | UUID named `id` | |
| Foreign keys | `{table}_id` | `category_id` |
| Max file length | 300 lines | |

## Business Rules

- **Currency**: IDR, rounded to nearest 100
- **Tax**: 10% **included** in prices (tax = total × 10/110)
- **Loyalty**: 1 point = 1,000 IDR spent
- **Loyalty Tiers**: Bronze (0%), Silver 500pts (5%), Gold 2000pts (8%), Platinum 5000pts (10%)
- **Customer Category Pricing**:
  - `retail`: Standard price
  - `wholesale`: Uses `wholesale_price` from products
  - `discount_percentage`: Applies X% discount
  - `custom`: Uses `product_category_prices` table
- **Stock Alerts**: <10 warning, <5 critical
- **Order Types**: dine_in, takeaway, delivery, b2b

## Permission Codes

Used with `usePermissions` hook and `PermissionGuard` component:
- **Sales**: `sales.view`, `sales.create`, `sales.void`, `sales.discount`, `sales.refund`
- **Inventory**: `inventory.view`, `inventory.create`, `inventory.update`, `inventory.delete`, `inventory.adjust`
- **Products**: `products.view`, `products.create`, `products.update`, `products.pricing`
- **Customers**: `customers.view`, `customers.create`, `customers.update`, `customers.loyalty`
- **Reports**: `reports.sales`, `reports.inventory`, `reports.financial`
- **Admin**: `users.view`, `users.create`, `users.roles`, `settings.view`, `settings.update`

## Key Routes

- `/pos` - Main POS (fullscreen, touch-optimized)
- `/kds/:station` - Kitchen Display System
- `/products` - Products management
- `/products/combos` - Combo deals
- `/products/promotions` - Promotions (time-based rules)
- `/inventory` - Stock management
- `/customers` - Customer management with loyalty
- `/b2b` - B2B wholesale module
- `/purchasing/purchase-orders` - Purchase orders
- `/reports` - Analytics

## Environment Variables

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-claude-api-key
```

## New Feature Workflow

1. **Database**: Create migration in `supabase/migrations/` with RLS policies
2. **Types**: Update `src/types/database.ts`
3. **Hook**: Create `src/hooks/useFeatureName.ts` with react-query
4. **Components**: Add to `src/components/feature/` and `src/pages/feature/`
5. **Translations**: Add keys to ALL 3 locale files (fr.json, en.json, id.json)
6. **Route**: Register in router

## Common Pitfalls

- **Async data**: Always use optional chaining (`data?.map(...)`)
- **RLS forgotten**: Every new table MUST have RLS enabled + policies
- **Types out of sync**: After SQL changes, update `src/types/database.ts`
- **Missing translations**: Must add to ALL 3 locale files
- **Locked cart items**: Items sent to kitchen are locked and require PIN to modify (see `cartStore.ts`)

## Mobile (Capacitor)

```bash
npx cap sync          # Sync web assets to native
npx cap open ios      # Open in Xcode
npx cap open android  # Open in Android Studio
```

## Documentation

- `DEVELOPMENT_INSTRUCTIONS.md` - Detailed patterns and workflow (French)
- `docs/COMBOS_AND_PROMOTIONS.md` - Combos & promotions spec
- `docs/COMBO_CHOICE_GROUPS.md` - Choice groups with price adjustments
- `docs/COMBO_POS_INTEGRATION.md` - POS integration
- `docs/STOCK_MOVEMENTS_MODULE.md` - Stock module spec
