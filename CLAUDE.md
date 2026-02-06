# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppGrav is an ERP/POS system for "The Breakery," a French bakery in Lombok, Indonesia. The system handles ~200 transactions/day with 10% tax (included in prices).

**Language**: English only (multilingual module suspended - i18next infrastructure exists but is not actively used).

**Key Feature**: Offline-first architecture with automatic synchronization for reliable operation in areas with unstable connectivity.

## Development Commands

```bash
npm run dev              # Start development server (port 3000)
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
- **State**: Zustand (10 stores) + @tanstack/react-query
- **Styling**: Tailwind CSS + shadcn/ui + Lucide React icons
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Offline**: Dexie (IndexedDB) + vite-plugin-pwa
- **i18n**: ~~i18next~~ SUSPENDED - English hardcoded (locale files exist but unused)
- **Mobile**: Capacitor (iOS/Android)

### Key Directory Structure
```
src/
├── components/       # By feature
│   ├── auth/        # Authentication components
│   ├── inventory/   # Stock management UI
│   ├── kds/         # Kitchen Display System
│   ├── lan/         # LAN device management UI
│   ├── mobile/      # Mobile-specific components
│   ├── orders/      # Order management components
│   ├── pos/         # Point of Sale UI (Cart, ProductGrid, etc.)
│   ├── products/    # Product management
│   ├── reports/     # Analytics & reports
│   ├── settings/    # Configuration UI
│   ├── sync/        # Offline/sync indicators
│   └── ui/          # Shared UI components (shadcn/ui)
├── pages/           # Route-based pages (95+ pages)
├── stores/          # Zustand stores (see State Management)
├── hooks/           # Custom hooks by module
│   ├── products/    # useProducts, useProductSearch, useCategories, useProductModifiers...
│   ├── inventory/   # useInventoryItems, useStockMovements, useStockAdjustment, useProductRecipe...
│   ├── offline/     # useNetworkStatus, useOfflineAuth, useOfflinePermissions
│   ├── reports/     # useDateRange, useReportFilters, useReportPermissions
│   ├── settings/    # useSettingsCore, useBusinessSettings, useTaxSettings, usePaymentSettings
│   ├── shift/       # Shift management hooks
│   └── ...          # useOrders, useShift, usePermissions, useSyncQueue, useSyncReport, useTerminal, useOfflineOrder, usePWAInstall
├── services/        # Business logic & external APIs
│   ├── offline/     # offlineAuthService, rateLimitService
│   ├── sync/        # syncEngine, syncQueue, orderSync, productSync, customerSync, offlineDb, offlinePeriod, syncDeviceService
│   ├── payment/     # paymentService (split payment, validation, change calculation)
│   ├── financial/   # voidService, refundService, financialOperationService, auditService
│   ├── print/       # printService (receipt, kitchen, barista tickets, cash drawer)
│   ├── inventory/   # Stock management
│   ├── products/    # Product import/export
│   ├── b2b/         # B2B credit system
│   ├── lan/         # LAN device discovery (lanClient, lanHub, lanProtocol)
│   ├── display/     # Customer display broadcast
│   └── ...          # ClaudeService, anthropicService, promotionService, ReportingService

├── types/           # TypeScript definitions
│   ├── database.ts  # Full Supabase schema
│   ├── database.generated.ts  # Auto-generated Supabase types
│   ├── offline.ts   # Offline types (sync queue, cached data)
│   └── auth.ts      # Auth types
├── lib/
│   ├── supabase.ts  # Supabase client
│   └── db.ts        # Dexie IndexedDB client
└── locales/         # [SUSPENDED] Translation files exist but i18n is disabled

supabase/
├── migrations/      # SQL migrations (21)
└── functions/       # Edge Functions (Deno)
```

### State Management (Zustand)

| Store | Purpose |
|-------|---------|
| **cartStore** | Shopping cart, locked items, modifiers, combos, order context |
| **authStore** | User session, roles, permissions, offline auth state |
| **orderStore** | Order lifecycle management |
| **settingsStore** | Application preferences |
| **networkStore** | Online/offline connectivity state |
| **syncStore** | Sync queue status, pending items count |
| **displayStore** | Customer display content |
| **mobileStore** | Mobile UI state |
| **lanStore** | LAN device discovery |
| **terminalStore** | Terminal identification |

**cartStore specifics**:
- Items of type `'product'` (with modifiers) or `'combo'` (with comboSelections)
- **Locked items**: Items sent to kitchen require PIN verification to modify/remove
- Order context: tableNumber, customerId, discountType/Value

### Offline-First Architecture

#### Overview
```
Online Mode:
  Component → Hook (useQuery) → Supabase → Store

Offline Mode:
  Component → Hook → offlineService → IndexedDB (Dexie)
  ↓
  Sync Queue (pending operations)
  ↓
  Auto-sync when online (5s delay, then every 30s)
  ↓
  Reconciliation with server
```

#### IndexedDB Tables (Dexie)
- `offlineUsers` - Cached user profiles + PIN hash (24h TTL)
- `offlineProducts` - Product catalog cache
- `offlineCategories` - Categories cache
- `offlineOrders` - Orders created offline
- `offlineSyncQueue` - Operations pending sync
- `offlinePermissions` - Cached user permissions

#### Offline Authentication
- **PIN-based**: Users set a 4-6 digit PIN for offline access
- **Hashing**: bcrypt for secure PIN storage
- **Rate limiting**: 3 attempts per 15 minutes (prevents brute force)
- **TTL**: Cached credentials expire after 24 hours

#### Sync Engine
- **Auto-start**: 5 seconds after network reconnection
- **Polling**: Every 30 seconds when online with pending items
- **Retry strategy**: Exponential backoff (5s → 10s → 20s → 40s, max 4 retries)
- **Queue**: FIFO processing with conflict resolution

#### UI Components
- `NetworkIndicator` - Shows online/offline status
- `OfflineSessionIndicator` - Indicates offline session active
- `SyncIndicator` - Shows sync progress and pending items

### Database Schema (Supabase PostgreSQL)

**Core**: `products` (finished/semi_finished/raw_material types), `categories` (dispatch_station: barista/kitchen/display/none), `suppliers`

**Sales**: `orders`, `order_items`, `pos_sessions`, `floor_plan_items`

**Customers**: `customers`, `customer_categories` (slug, price_modifier_type), `product_category_prices`, `loyalty_tiers`, `loyalty_transactions`

**Inventory**: `stock_movements`, `production_records`, `recipes`, `product_modifiers`, `product_uoms`, `inventory_counts`

**Combos/Promotions**: `product_combos`, `product_combo_groups`, `product_combo_group_items`, `promotions`, `promotion_products`, `promotion_free_products`, `promotion_usage`

**B2B**: `b2b_orders`, `b2b_order_items`, `b2b_payments`

**Purchasing**: `purchase_orders`, `po_items`

**System**: `user_profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_permissions`, `audit_logs`, `settings`, `printer_configurations`

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
- **Offline Orders**: Marked with `is_offline: true`, synced when online

## Permission Codes

Used with `usePermissions` hook and `PermissionGuard` component:
- **Sales**: `sales.view`, `sales.create`, `sales.void`, `sales.discount`, `sales.refund`
- **Inventory**: `inventory.view`, `inventory.create`, `inventory.update`, `inventory.delete`, `inventory.adjust`
- **Products**: `products.view`, `products.create`, `products.update`, `products.pricing`
- **Customers**: `customers.view`, `customers.create`, `customers.update`, `customers.loyalty`
- **Reports**: `reports.sales`, `reports.inventory`, `reports.financial`
- **Admin**: `users.view`, `users.create`, `users.roles`, `settings.view`, `settings.update`

## Key Routes

### Main Application
- `/pos` - Main POS (fullscreen, touch-optimized)
- `/kds` - Kitchen Display System station selector
- `/kds/:station` - KDS by station (barista/kitchen/display)
- `/display/customers` - Customer-facing display
- `/orders` - Order history
- `/production` - Production management

### Products & Inventory
- `/products` - Products management
- `/products/new` - Create new product
- `/products/:id` - Edit product
- `/products/combos` - Combo deals
- `/products/combos/new` - Create combo
- `/products/promotions` - Promotions (time-based rules)
- `/products/promotions/new` - Create promotion
- `/products/category-pricing` - Category-based pricing
- `/inventory` - Stock management (tabs: general, stock, recipe, modifiers, units, prices, costing, variants)
- `/inventory/movements` - Stock movements history
- `/inventory/transfers` - Internal transfers
- `/inventory/transfers/new` - Create transfer
- `/inventory/opname` - Stock opname list
- `/inventory/opname/new` - New stock count
- `/inventory/incoming` - Incoming stock
- `/inventory/production` - Stock production
- `/inventory/wasted` - Waste tracking
- `/inventory/by-location` - Stock by location

### Customers & B2B
- `/customers` - Customer management with loyalty
- `/customers/new` - Create customer
- `/customers/:id` - Customer detail
- `/customers/categories` - Customer categories
- `/b2b` - B2B wholesale module
- `/b2b/orders` - B2B orders
- `/b2b/orders/new` - Create B2B order
- `/b2b/orders/:id` - B2B order detail
- `/b2b/payments` - B2B payments

### Purchasing & Reports
- `/purchasing/purchase-orders` - Purchase orders
- `/purchasing/purchase-orders/new` - Create PO
- `/purchasing/purchase-orders/:id` - PO detail
- `/purchasing/suppliers` - Supplier management
- `/reports` - Analytics dashboard (20+ report tabs)
- `/profile` - User profile

### Settings & Admin
- `/settings` - General settings
- `/settings/company` - Company info (name, NPWP, logo, address)
- `/settings/printing` - Printer configuration (receipt, kitchen, barista)
- `/settings/notifications` - Email/SMTP notification settings
- `/settings/sync-status` - Sync queue status and management
- `/settings/history` - Settings change history
- `/settings/audit` - Audit log viewer with filters and CSV export
- `/settings/business-hours` - Business hours
- `/settings/categories` - Category settings
- `/settings/payment-methods` - Payment methods
- `/settings/tax` - Tax settings
- `/settings/roles` - Role management
- `/users` - User management
- `/users/permissions` - Permissions management

### Mobile (Capacitor)
- `/mobile/login` - Mobile login
- `/mobile/home` - Mobile home
- `/mobile/catalog` - Product catalog
- `/mobile/cart` - Shopping cart
- `/mobile/orders` - Order history

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
5. **Route**: Register in router
6. **Offline support** (if needed): Add to sync services and IndexedDB schema

> **Note**: i18n/translations step removed - use English strings directly (multilingual module suspended).

## Common Pitfalls

- **Async data**: Always use optional chaining (`data?.map(...)`)
- **RLS forgotten**: Every new table MUST have RLS enabled + policies
- **Types out of sync**: After SQL changes, update `src/types/database.ts`
- **Locked cart items**: Items sent to kitchen are locked and require PIN to modify (see `cartStore.ts`)
- **Offline sync**: New entities that need offline support must be added to sync services
- **Network state**: Use `useNetworkStatus` hook to check connectivity before online-only operations
- **Language**: Use English strings directly - do NOT use `t()` or i18next (module suspended)

## Print Server (Local)

The print server is a separate Node.js/Express application running on the POS PC for thermal printing.

**Port**: 3001 (localhost + LAN accessible)

**Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server status check |
| `/print/receipt` | POST | Print receipt (ESC/POS, 80mm) |
| `/print/kitchen` | POST | Print kitchen ticket |
| `/print/barista` | POST | Print barista ticket |
| `/drawer/open` | POST | Open cash drawer |

**Configuration**: Via `/settings/printing` UI (table `printer_configurations`)

**Note**: Print server is optional - system works without it (no printing).

## Payment & Financial Services

### Payment Service (`src/services/payment/paymentService.ts`)

Unified payment processing with split payment support:

| Function | Purpose |
|----------|---------|
| `validatePayment()` | Validate single payment (amount, method, cash received) |
| `validateSplitPayments()` | Validate multiple payments total matches order |
| `calculateChange()` | Calculate change rounded to 100 IDR |
| `processPayment()` | Process single payment (online/offline) |
| `processSplitPayment()` | Process multiple payments for one order |
| `createSplitPaymentState()` | Initialize split payment state machine |

### Financial Operations (`src/services/financial/`)

Void and refund operations with audit trail:

| Service | Purpose |
|---------|---------|
| `voidService.ts` | Cancel orders, queue for offline sync, conflict resolution |
| `refundService.ts` | Process full/partial refunds, multiple payment methods |
| `financialOperationService.ts` | Validation, conflict detection (`shouldRejectForConflict`) |
| `auditService.ts` | Log critical operations (severity='critical') |

**Conflict Resolution**: Offline voids/refunds check `order.updated_at < operation.created_at`. If server is newer, operation is rejected and user notified.

**PIN Required**: All void/refund operations require manager PIN verification.

## Mobile (Capacitor)


```bash
npx cap sync          # Sync web assets to native
npx cap open ios      # Open in Xcode
npx cap open android  # Open in Android Studio
```

## Testing

```bash
npx vitest run                    # Run all tests
npx vitest run --coverage         # With coverage report
npx vitest run src/services/offline  # Test offline services
npx vitest run src/services/sync     # Test sync engine
```

Key test files:
- `src/services/offline/__tests__/offlineAuthService.test.ts` - Offline authentication
- `src/services/offline/__tests__/rateLimitService.test.ts` - Rate limiting
- `src/services/sync/syncQueue.test.ts` - Sync queue operations
- `src/services/sync/orderSync.test.ts` - Order synchronization
- `src/services/sync/productSync.test.ts` - Product synchronization
- `src/services/sync/syncDeviceService.test.ts` - Device sync
- `src/services/sync/offlineDb.test.ts` - IndexedDB operations
- `src/services/lan/lanProtocol.test.ts` - LAN protocol
- `src/stores/networkStore.test.ts` - Network state
- `src/stores/terminalStore.test.ts` - Terminal state
- `src/hooks/useNetworkStatus.test.ts` - Network hook
- `src/hooks/useOfflineData.test.ts` - Offline data hook

## Documentation

- `DEVELOPMENT_INSTRUCTIONS.md` - Detailed patterns and workflow (French)
- `CURRENT_STATE.md` - Current project state
- `DATABASE_SCHEMA.md` - Database schema reference
- `docs/COMBOS_AND_PROMOTIONS.md` - Combos & promotions spec
- `docs/COMBO_CHOICE_GROUPS.md` - Choice groups with price adjustments
- `docs/COMBO_POS_INTEGRATION.md` - POS integration
- `docs/STOCK_MOVEMENTS_MODULE.md` - Stock module spec
- `_bmad-output/` - Planning artifacts (architecture, epics, PRD)

## Project Statistics

- **Components**: 78 React components across 12 feature directories
- **Pages**: 95 route-based pages
- **Hooks**: 69 custom hooks
- **Services**: 55 business logic services
- **Stores**: 10 Zustand stores
- **Migrations**: 21 SQL migrations
- **Codebase**: ~114,750 lines of TypeScript/React
