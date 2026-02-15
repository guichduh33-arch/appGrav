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
npm run lint             # ESLint check (--max-warnings 150)
npm run preview          # Preview production build
npx vitest run           # Run all tests
npx vitest run src/path/to/test.test.ts  # Run single test
npx vitest               # Tests in watch mode
npm run test:claude      # Test Claude API integration
npm run test:smoke       # POS smoke tests
```

**Path Alias**: Use `@/` to import from `src/`

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **State**: Zustand (11 stores) + @tanstack/react-query
- **Styling**: Tailwind CSS + shadcn/ui + Lucide React icons
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Offline**: Dexie (IndexedDB) + vite-plugin-pwa
- **i18n**: ~~i18next~~ SUSPENDED - English hardcoded (locale files exist but unused)
- **Mobile**: Capacitor (iOS/Android)

### Key Directory Structure
```
src/
├── components/       # By feature (14 directories)
│   ├── accounting/  # Chart of accounts, journal entries, financial statements
│   ├── auth/        # Authentication components
│   ├── inventory/   # Stock management UI
│   ├── kds/         # Kitchen Display System
│   ├── lan/         # LAN device management
│   ├── mobile/      # Mobile-specific components
│   ├── orders/      # Order management UI
│   ├── pos/         # Point of Sale UI (Cart, ProductGrid, etc.)
│   ├── products/    # Product management
│   ├── purchasing/  # Purchase orders UI
│   ├── reports/     # Analytics & reports
│   ├── settings/    # Configuration UI
│   ├── sync/        # Offline/sync indicators
│   └── ui/          # Shared UI components (shadcn/ui)
├── pages/           # Route-based pages (~240 pages)
├── stores/          # Zustand stores (see State Management)
├── hooks/           # Custom hooks by module (~130 hooks)
│   ├── accounting/  # useAccounts, useJournalEntries, useGeneralLedger, useTrialBalance, useBalanceSheet, useIncomeStatement, useVATManagement, useFiscalPeriods
│   ├── customers/   # useCustomers, useCustomerCategories
│   ├── inventory/   # useInventoryItems, useStockMovements, useStockAdjustment, useProductRecipe
│   ├── kds/         # Kitchen display hooks
│   ├── lan/         # LAN device hooks
│   ├── offline/     # useNetworkStatus, useOfflineAuth, useOfflinePermissions
│   ├── pos/         # POS-specific hooks
│   ├── pricing/     # Pricing logic hooks
│   ├── products/    # useProducts, useProductSearch, useCategories, useProductModifiers
│   ├── promotions/  # Promotion engine hooks
│   ├── purchasing/  # Purchase order hooks
│   ├── reports/     # useDateRange, useReportFilters, useReportPermissions
│   ├── settings/    # useSettingsCore, useBusinessSettings, useTaxSettings, usePaymentSettings
│   ├── shift/       # Shift management hooks
│   ├── sync/        # Sync status hooks
│   └── ...          # useOrders, usePermissions, useSyncQueue, useTerminal, usePWAInstall
├── services/        # Business logic & external APIs (~78 services)
│   ├── accounting/  # accountingService, journalEntryValidation, vatService
│   ├── b2b/         # B2B credit system
│   ├── display/     # Customer display broadcast
│   ├── financial/   # voidService, refundService, auditService
│   ├── inventory/   # Stock management
│   ├── kds/         # Kitchen display logic
│   ├── lan/         # LAN device discovery (lanClient, lanHub, lanProtocol)
│   ├── offline/     # offlineAuthService, rateLimitService
│   ├── payment/     # paymentService (split payment, validation)
│   ├── pos/         # POS business logic, promotionEngine
│   ├── print/       # printService (receipt, kitchen, barista tickets)
│   ├── products/    # Product import/export
│   ├── reports/     # ReportingService
│   ├── storage/     # File storage service
│   ├── sync/        # syncEngine, syncQueue, orderSync, productSync
│   └── ...          # ClaudeService, anthropicService

├── types/           # TypeScript definitions
│   ├── auth.ts      # Auth types
│   ├── cart.ts      # Cart types
│   ├── accounting.ts # Accounting types (accounts, journals, fiscal periods, VAT)
│   ├── database.ts  # Full Supabase schema
│   ├── database.generated.ts  # Auto-generated Supabase types
│   ├── errors.ts    # Error types
│   ├── offline.ts   # Offline types (sync queue, cached data)
│   ├── offline/     # Detailed offline type modules
│   ├── payment.ts   # Payment types
│   ├── reporting.ts # Report types
│   └── settings.ts  # Settings types
├── lib/
│   ├── supabase.ts  # Supabase client
│   └── db.ts        # Dexie IndexedDB client
└── locales/         # [SUSPENDED] Translation files exist but i18n is disabled

supabase/
├── migrations/      # SQL migrations (74 local + 13 Phase 1 via API)
└── functions/       # Edge Functions (Deno, 13 functions)
```

### State Management (Zustand)

| Store | Purpose |
|-------|---------|
| **cartStore** | Shopping cart, locked items, modifiers, combos, order context |
| **authStore** | User session, roles, permissions, offline auth state |
| **orderStore** | Order lifecycle management |
| **settingsStore** | Application preferences |
| **networkStore** | Online/offline connectivity state |
| **paymentStore** | Payment state, split payments |
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

**Sales**: `orders` (+ `service_charge`, `guest_count`), `order_items`, `pos_sessions`, `floor_plan_items`

**Customers**: `customers`, `customer_categories` (slug, price_modifier_type), `product_category_prices`, `loyalty_tiers`, `loyalty_transactions`

**Inventory**: `stock_movements`, `production_records`, `recipes`, `product_modifiers`, `product_uoms`, `inventory_counts`

**Combos/Promotions**: `product_combos`, `product_combo_groups`, `product_combo_group_items`, `promotions`, `promotion_products`, `promotion_free_products`, `promotion_usage`

**B2B**: `b2b_orders`, `b2b_order_items`, `b2b_payments`

**Purchasing**: `purchase_orders`, `po_items`, `po_activity_log`

**Accounting**: `accounts` (chart of accounts, 30 seed), `journal_entries` (+ `attachment_url`), `journal_entry_lines`, `fiscal_periods`, `vat_filings`, `product_price_history`

**Notifications**: `notification_events`, `notification_preferences`

**Business Hours**: `business_holidays`

**System**: `user_profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_permissions`, `audit_logs`, `settings`, `printer_configurations`

**Key Views**: `view_daily_kpis`, `view_inventory_valuation`, `view_payment_method_stats`

### Database Functions
```sql
user_has_permission(p_user_id UUID, p_permission_code VARCHAR) → BOOLEAN
is_admin(p_user_id UUID) → BOOLEAN
get_customer_product_price(p_product_id UUID, p_customer_category_slug VARCHAR) → DECIMAL
add_loyalty_points(p_customer_id UUID, p_points INTEGER, p_order_id UUID) → VOID
redeem_loyalty_points(p_customer_id UUID, p_points INTEGER) → BOOLEAN
get_account_balance(p_account_id UUID, p_end_date DATE) → DECIMAL
calculate_vat_payable(p_year INT, p_month INT) → TABLE(collected, deductible, payable)
create_sale_journal_entry() → TRIGGER (auto on orders.completed/voided)
create_purchase_journal_entry() → TRIGGER (auto on purchase_orders.received)
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
- **Accounting**: `accounting.view`, `accounting.manage`, `accounting.journal.create`, `accounting.journal.update`, `accounting.vat.manage`
- **Admin**: `users.view`, `users.create`, `users.roles`, `settings.view`, `settings.update`

## Key Routes (~240 pages)

| Module | Base Route | Description |
|--------|-----------|-------------|
| **POS** | `/pos` | Main POS (fullscreen, touch-optimized) |
| **KDS** | `/kds`, `/kds/:station` | Kitchen Display System (barista/kitchen/display) |
| **Display** | `/display/customers` | Customer-facing display |
| **Orders** | `/orders` | Order history |
| **Products** | `/products/*` | CRUD, combos (`/combos`), promotions (`/promotions`), category-pricing |
| **Inventory** | `/inventory/*` | Stock management, movements, transfers, opname, incoming, production, waste |
| **Customers** | `/customers/*` | Customer CRUD, categories, loyalty |
| **B2B** | `/b2b/*` | B2B orders, payments |
| **Purchasing** | `/purchasing/*` | Purchase orders, suppliers |
| **Accounting** | `/accounting/*` | Chart of accounts, journal entries, general ledger, trial balance, balance sheet, income statement, VAT management |
| **Reports** | `/reports` | Analytics dashboard (20+ report tabs) |
| **Settings** | `/settings/*` | Company, printing, notifications, sync, audit, tax, roles, payment methods |
| **Users** | `/users/*` | User management, permissions |
| **Mobile** | `/mobile/*` | Login, home, catalog, cart, orders (Capacitor) |

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

- **Payment**: `src/services/payment/paymentService.ts` - Single & split payments, validation, change calculation (rounded to 100 IDR)
- **Void/Refund**: `src/services/financial/` - `voidService`, `refundService`, `financialOperationService`, `auditService`
- **Conflict Resolution**: Offline voids/refunds compare `order.updated_at < operation.created_at` - rejects if server is newer
- **PIN Required**: All void/refund operations require manager PIN verification

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
- `src/services/accounting/__tests__/accountingService.test.ts` - Account tree, balance utils
- `src/services/accounting/__tests__/journalEntryValidation.test.ts` - Entry validation
- `src/services/accounting/__tests__/vatService.test.ts` - VAT calculations, DJP export

## Documentation

### Root Level
- `CURRENT_STATE.md` - Sprint progress, epic status, known issues
- `DATABASE_SCHEMA.md` - Database tables, views, functions, RLS patterns

### Feature Specs (`docs/`)
- `docs/index.md` - Full documentation index
- `docs/COMBOS_AND_PROMOTIONS.md` - Combos & promotions overview
- `docs/COMBO_CHOICE_GROUPS.md` - Choice groups with price adjustments
- `docs/COMBO_POS_INTEGRATION.md` - POS integration for combos
- `docs/STOCK_MOVEMENTS_MODULE.md` - Stock movements specification
- `docs/PAYMENT_SYSTEM.md` - Payment system (split payments)
- `docs/FINANCIAL_OPERATIONS.md` - Void/refund with audit trail
- `docs/VARIANTS_POS_INTEGRATION.md` - Product variants in POS

### Architecture & Planning
- `docs/architecture-main.md` - Main system architecture
- `docs/adr/ADR-001-payment-system-refactor.md` - Payment ADR
- `docs/audit/` - Strategic audit and improvement roadmap
- `_bmad-output/` - Planning artifacts (architecture, epics, PRD)

### Phase 0: Stitch Gap Analysis
- `docs/phase0/stitch-pages-inventory.md` - Full inventory of 67 Stitch pages with gap status
- `docs/phase0/gap-analysis.md` - Gap analysis summary
- `docs/phase0/backend-creation-plan.md` - Backend migration plan

### Archive
- `docs/_archive/` - Obsolete docs preserved for reference (12 files)

## Project Statistics

- **Components**: ~171 React components across 14 feature directories
- **Pages**: ~240 route-based pages
- **Hooks**: ~130 custom hooks across 15 subdirectories
- **Services**: ~78 business logic services across 16 subdirectories
- **Stores**: 11 Zustand stores
- **Migrations**: 74 local SQL files + 13 Phase 1 migrations (applied via Supabase API)
- **Edge Functions**: 13 Deno functions
- **Test files**: 98 test files, ~1,650 tests
- **Codebase**: ~62,000 lines of TypeScript/React
