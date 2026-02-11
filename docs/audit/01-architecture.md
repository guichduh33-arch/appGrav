# AppGrav Architecture & Code Quality Audit

**Date**: 2026-02-11
**Auditor**: Subagent 1A - Architecture & Code Quality
**Scope**: 590 TypeScript files, ~149,000 lines, full src/ directory

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [File Structure & Organization](#2-file-structure--organization)
3. [Dead Code Analysis](#3-dead-code-analysis)
4. [Files Exceeding Size Convention](#4-files-exceeding-size-convention)
5. [Architectural Pattern Violations](#5-architectural-pattern-violations)
6. [TypeScript Quality](#6-typescript-quality)
7. [Error Handling](#7-error-handling)
8. [Frontend Performance](#8-frontend-performance)
9. [Styling Consistency](#9-styling-consistency)
10. [Summary of Findings](#10-summary-of-findings)

---

## 1. Executive Summary

The AppGrav codebase demonstrates a well-organized modular architecture with clear separation by feature domain. The project follows consistent naming conventions and leverages modern React patterns (hooks, Zustand stores, React Query). However, the audit reveals several areas requiring attention:

| Severity | Count |
|----------|-------|
| CRITIQUE | 8 |
| MAJEUR | 19 |
| MINEUR | 14 |
| **Total** | **41** |

**Top 3 priorities**:
1. **TypeScript safety** -- 55+ `as any` casts, 40+ `as unknown as X` assertions, and 19 compile errors create runtime risk
2. **N+1 query patterns** -- Sequential database calls in loops (inventoryAlerts, accounting hooks) cause performance degradation
3. **Missing React.memo** -- Zero uses of `React.memo` across 100+ components; critical for POS performance

---

## 2. File Structure & Organization

### 2.1 Directory Structure Assessment

The project follows a well-defined modular structure:

```
src/
  components/    14 feature directories + ui/ -- GOOD
  pages/         17 route-based modules -- GOOD
  hooks/         15 feature subdirectories + root hooks -- MIXED (see below)
  services/      16 service directories -- GOOD
  stores/        11 stores + settings/ subdirectory -- GOOD
  types/         12 type files + offline/ subdirectory -- GOOD
  utils/         3 utility files -- GOOD (lean)
  data/          2 mock data files -- ISSUE (see dead code)
  constants/     Present -- GOOD
```

**[MINEUR]** `src/hooks/` root level contains 18 standalone hook files alongside 15 feature subdirectories. This creates inconsistency -- some hooks are organized by feature (e.g., `hooks/accounting/`), while others sit at root level (e.g., `useShift.ts`, `useProduction.ts`, `useOrders.ts`).

**Recommendation**: Move root-level hooks into appropriate feature subdirectories:
- `useShift.ts` -> `hooks/pos/useShift.ts`
- `useProduction.ts` -> `hooks/inventory/useProduction.ts`
- `useOrders.ts` -> `hooks/orders/useOrders.ts`
- `useProducts.ts` -> `hooks/products/useProducts.ts` (consolidate with existing)

### 2.2 Import Path Consistency

**[MINEUR]** Mixed import path styles detected:
- Most files use `@/` alias: `import { supabase } from '@/lib/supabase'`
- Some files use relative paths: `import { supabase } from '../../../lib/supabase'` (e.g., `src/components/pos/modals/ComboSelectorModal.tsx:3`, `PinVerificationModal.tsx:3`)
- Some use `../../` relative: `import { Button } from '../../components/ui/button'` (e.g., `src/pages/users/UsersPage.tsx:15`)

**Recommendation**: Enforce `@/` alias for all imports via ESLint rule `no-restricted-imports`.

---

## 3. Dead Code Analysis

### 3.1 Missing Module: mockProducts

**[CRITIQUE]** `src/data/mockProducts.ts` -- File referenced but does NOT exist on disk. This causes 3 TypeScript compile errors:
- `src/data/index.ts:3` -- `export { MOCK_PRODUCTS } from './mockProducts'` -- module not found
- `src/hooks/products/index.ts:20` -- re-exports from missing module
- `src/hooks/useProducts.ts:15` -- imports from missing module

The `src/data/` directory only contains `mockCategories.ts` and `index.ts`. The `mockProducts.ts` file was apparently deleted but references remain.

**Recommendation**: Either restore `mockProducts.ts` or remove all references and update `useProducts.ts` / `useProductList.ts` to handle the Supabase-empty case without mock data.

### 3.2 Dead Page: ProductionPage

**[MAJEUR]** `src/pages/production/ProductionPage.tsx` (697 lines) -- This file is never imported by any other file. The App.tsx router only uses `StockProductionPage` from `src/pages/inventory/StockProductionPage.tsx`. The `/production` route redirects to `/inventory/production`.

**Recommendation**: Delete `src/pages/production/ProductionPage.tsx` and its parent directory.

### 3.3 Duplicate Product Hooks

**[MAJEUR]** Two overlapping `useProducts` implementations exist:
1. `src/hooks/useProducts.ts` -- Root-level, 159 lines. Includes offline support via `productSync`, mock data fallback, and `useCategories`.
2. `src/hooks/products/useProductList.ts` -- Feature-level, exports its own `useProducts` function. References `MOCK_PRODUCTS` from the root hook.

Both are used in different files. `POSMainPage.tsx` imports from root `useProducts`, while `useProductsOffline.ts` imports from `products/useProductList.ts`.

**Recommendation**: Consolidate into a single `src/hooks/products/useProducts.ts` with offline support, removing the root-level duplicate.

### 3.4 Suspended i18n Remnants

**[MINEUR]** While locale files have been properly removed, three source files still contain i18n-related artifacts:
- `src/constants/inventory.ts:32,38` -- Properties named `labelKey` and `descriptionKey` with "i18n key" comments
- `src/hooks/purchasing/usePurchaseOrders.ts:458` -- Comment referencing "i18n handling"
- `src/pages/settings/SettingsLayout.tsx:86` -- Comment about "i18n suspended"

**Recommendation**: Clean up i18n references in constants; convert `labelKey`/`descriptionKey` to `label`/`description` with direct English strings.

### 3.5 ClaudeService / anthropicService

**[MINEUR]** Referenced in CLAUDE.md documentation (`src/services/` listing mentions `ClaudeService, anthropicService`) but no matching files found in the codebase. These may have been removed or were planned but never implemented.

**Recommendation**: Update CLAUDE.md to remove these references.

---

## 4. Files Exceeding Size Convention

The project convention is max 300 lines per file. The following non-test, non-generated files exceed 400 lines and are candidates for refactoring:

### Pages (28 files > 400 lines)

| File | Lines | Severity | Recommendation |
|------|-------|----------|----------------|
| `pages/b2b/B2BOrderDetailPage.tsx` | 1027 | **CRITIQUE** | Split into sub-components: OrderHeader, OrderItems, PaymentSection, StatusActions |
| `pages/products/PromotionFormPage.tsx` | 862 | **CRITIQUE** | Extract form sections into PromotionBasicInfo, PromotionProducts, PromotionConditions |
| `pages/users/UsersPage.tsx` | 831 | **MAJEUR** | Extract UserTable, UserFormModal, UserFilters |
| `pages/orders/OrdersPage.tsx` | 819 | **MAJEUR** | Extract OrderTable, OrderFilters, OrderDetails |
| `pages/inventory/StockProductionPage.tsx` | 819 | **MAJEUR** | Extract ProductionForm, ProductionHistory, RecipePanel |
| `pages/b2b/B2BPaymentsPage.tsx` | 803 | **MAJEUR** | Extract PaymentTable, PaymentFormModal, PaymentFilters |
| `pages/products/ComboFormPage.tsx` | 788 | **MAJEUR** | Extract ComboGroupEditor, ComboItemSelector |
| `pages/inventory/tabs/VariantsTab.tsx` | 759 | **MAJEUR** | Extract VariantForm, VariantList, MaterialEditor |
| `pages/settings/SettingsPage.tsx` | 751 | **MAJEUR** | Already being superseded by modular settings pages (Epic 10) |
| `pages/settings/NotificationSettingsPage.tsx` | 726 | MAJEUR | Extract notification channel sections |
| `pages/b2b/B2BOrderFormPage.tsx` | 721 | MAJEUR | Extract OrderItemsEditor, CustomerSelector |
| `pages/production/ProductionPage.tsx` | 697 | N/A | Dead code -- delete entirely |
| `pages/settings/SyncStatusPage.tsx` | 633 | MAJEUR | Extract SyncQueueTable, SyncStatsPanel |
| `pages/profile/ProfilePage.tsx` | 623 | MAJEUR | Extract ProfileForm, SecuritySettings, SessionInfo |
| `pages/customers/CustomerDetailPage.tsx` | 615 | MINEUR | Moderate; extract LoyaltySection, OrderHistorySection |
| `pages/kds/KDSMainPage.tsx` | 589 | MINEUR | Already uses callbacks well; extract KDSHeader, KDSGrid |
| `pages/customers/CustomerFormPage.tsx` | 566 | MINEUR | Extract address/contact sub-forms |
| `pages/products/ProductsPage.tsx` | 564 | MINEUR | Extract ProductTable, ImportExportActions |
| `pages/inventory/StockMovementsPage.tsx` | 550 | MINEUR | Extract MovementsTable, MovementFilters |
| `pages/purchasing/PurchaseOrderFormPage.tsx` | 549 | MINEUR | Extract POLineItems, SupplierSelector |
| `pages/inventory/tabs/ModifiersTab.tsx` | 534 | MINEUR | Extract ModifierForm, ModifierList |
| `pages/products/ProductFormPage.tsx` | 527 | MINEUR | Extract ProductBasicInfo, PricingSection |
| `pages/settings/CompanySettingsPage.tsx` | 502 | MINEUR | Extract CompanyInfoForm, AddressForm |
| `pages/settings/AuditPage.tsx` | 482 | MINEUR | Extract AuditTable, AuditFilters |
| `pages/settings/LanMonitoringPage.tsx` | 471 | MINEUR | Extract NodeList, NetworkGraph |
| `pages/inventory/tabs/UnitsTab.tsx` | 460 | MINEUR | Extract UnitForm, UnitList |
| `pages/reports/components/InventoryTab.tsx` | 453 | MINEUR | Extract InventoryTable, InventoryCharts |
| `pages/settings/PaymentMethodsPage.tsx` | 452 | MINEUR | Extract PaymentMethodForm, PaymentMethodList |

### Components (3 files > 400 lines)

| File | Lines | Severity | Recommendation |
|------|-------|----------|----------------|
| `components/pos/modals/CustomerSearchModal.tsx` | 941 | **CRITIQUE** | Split into CustomerSearchInput, CustomerList, CustomerDetail, CustomerCreation |
| `components/settings/FloorPlanEditor.tsx` | 703 | **MAJEUR** | Extract FloorCanvas, TableEditor, SectionPanel |
| `components/pos/modals/PaymentModal.tsx` | 699 | **MAJEUR** | Extract PaymentMethodSelector, SplitPaymentPanel, ChangeCalculator |

### Services (5 files > 400 lines)

| File | Lines | Severity | Recommendation |
|------|-------|----------|----------------|
| `services/authService.ts` | 794 | **MAJEUR** | Split into authCore (login/logout), userManagement, pinService |
| `services/ReportingService.ts` | 554 | MINEUR | Split by report type |
| `services/inventory/inventoryAlerts.ts` | 526 | MINEUR | Extract reorderSuggestions into separate service |
| `services/reports/csvExport.ts` | 514 | MINEUR | Split by export domain |
| `services/products/productImportExport.ts` | 482 | MINEUR | Split import and export |

### Other (4 files > 400 lines)

| File | Lines | Severity | Recommendation |
|------|-------|----------|----------------|
| `lib/db.ts` | 690 | **MAJEUR** | Split Dexie schema into per-module table definitions |
| `stores/cartStore.ts` | 573 | MINEUR | Extract cart calculation logic into a pure utility |
| `types/offline/orders.ts` | 620 | MINEUR | Acceptable for type definition files |
| `types/database.ts` | 454 | MINEUR | Acceptable; serves as manual Supabase types |
| `hooks/purchasing/usePurchaseOrders.ts` | 607 | **MAJEUR** | Extract into usePOList, usePODetail, usePOMutations |
| `hooks/useShift.ts` | 452 | MINEUR | Extract closeShift/openShift into separate hooks |

---

## 5. Architectural Pattern Violations

### 5.1 Direct Supabase Calls in UI Layer

**[CRITIQUE]** 17 direct Supabase calls found in pages/ and components/ instead of going through hooks/services:

**Components (1 file, critical -- POS path):**
- `src/components/pos/modals/PinVerificationModal.tsx:160` -- `supabase.rpc('verify_user_pin', ...)`

**Pages (10 files):**
- `src/pages/auth/LoginPage.tsx:167` -- `supabase.rpc('verify_user_pin', ...)`
- `src/pages/customers/CustomerDetailPage.tsx:168,182` -- `supabase.rpc('add_loyalty_points')`, `supabase.rpc('redeem_loyalty_points')`
- `src/pages/inventory/ProductDetailPage.tsx:112,256` -- `supabase.from('categories')`, `supabase.from('product_uoms').delete()`
- `src/pages/mobile/MobileLoginPage.tsx:118` -- `supabase.rpc('verify_user_pin', ...)`
- `src/pages/products/PromotionFormPage.tsx:288-312` -- 4 direct calls (delete + insert promotion_products/free_products)
- `src/pages/purchasing/PurchaseOrderDetailPage.tsx:128,193,203` -- 3 direct inserts to history/returns
- `src/pages/reports/components/DeletedProductsTab.tsx:58` -- `supabase.from('user_profiles')`
- `src/pages/reports/components/PriceChangesTab.tsx:70,78` -- 2 direct queries

**Recommendation**: Create dedicated service functions or custom hooks for each of these operations. For example:
- `services/auth/pinVerificationService.ts` for PIN verification
- `hooks/customers/useCustomerLoyalty.ts` for loyalty operations
- `hooks/products/usePromotionMutations.ts` for promotion CRUD

### 5.2 Supabase Calls in Zustand Stores

**[MAJEUR]** 5 settings stores contain direct Supabase calls:
- `src/stores/settings/coreSettingsStore.ts:172,204,218,230` -- `supabase.rpc()` calls for update/reset settings
- `src/stores/settings/businessHoursStore.ts` -- Supabase import
- `src/stores/settings/paymentMethodStore.ts` -- Supabase import
- `src/stores/settings/printerStore.ts` -- Supabase import
- `src/stores/settings/taxStore.ts` -- Supabase import

Per the architecture convention, stores should hold client-side state only while data access goes through services/hooks. These stores break the separation by embedding data fetching logic.

**Recommendation**: Extract all Supabase calls from stores into `services/settings/settingsDataService.ts`. Stores should call service functions, not Supabase directly.

### 5.3 Service Layer Importing Zustand Stores

**[MAJEUR]** Multiple services import and directly read Zustand stores, creating tight coupling:

- `src/services/display/displayBroadcast.ts` -- imports `useCartStore`, `useLanStore`
- `src/services/lan/lanHub.ts`, `lanClient.ts` -- imports `useLanStore`
- `src/services/print/printService.ts` -- imports `useCoreSettingsStore`
- `src/services/payment/paymentService.ts` -- imports `useCoreSettingsStore`
- `src/services/b2b/b2bPosOrderService.ts` -- imports `useCoreSettingsStore`
- `src/services/inventory/inventoryAlerts.ts` -- imports `useCoreSettingsStore`
- `src/services/offline/rateLimitService.ts` -- imports `useCoreSettingsStore`
- `src/services/offline/kitchenDispatchService.ts` -- imports `useLanStore`
- `src/services/sync/syncEngine.ts` -- imports `useSyncStore`, `useNetworkStore`

While importing types from stores is acceptable, directly calling `getState()` in services creates a bidirectional dependency. Services should receive configuration as parameters.

**Recommendation**: Refactor services to accept configuration via parameters. For example:
```typescript
// Before
export function calculatePayment() {
  const taxRate = useCoreSettingsStore.getState().getSetting('tax_rate');
  // ...
}

// After
export function calculatePayment(config: { taxRate: number }) {
  // ...
}
```

### 5.4 Missing Route Protection

**[MINEUR]** Routes in `App.tsx` use `isAuthenticated` from `useAuthStore` for authentication checks, but only 6 pages actually verify specific permissions via `usePermissions()`:
- `PrintingSettingsPage`, `UsersPage`, `RolesPage`, `NotificationSettingsPage`, `CompanySettingsPage`, `ProfilePage`

Most admin pages (Settings, Reports, Accounting, Purchasing) do not check permissions, relying only on authentication. The `PermissionGuard` component exists but is only imported in 2 files.

**Recommendation**: Add permission checks to all admin routes, either via route-level guards or by wrapping pages with `PermissionGuard`.

---

## 6. TypeScript Quality

### 6.1 Compile Errors (19 total)

**[CRITIQUE]** The codebase has 19 TypeScript compile errors:

**File casing conflicts (2 errors):**
- `Badge.tsx` file is PascalCase but imports use lowercase `@/components/ui/badge`. With `forceConsistentCasingInFileNames: true` in tsconfig, this creates errors.
- `Button.tsx` file is PascalCase but imports use lowercase `@/components/ui/button`.
- Affected files: `PendingSyncCounter.tsx`, `PendingSyncPanel.tsx`, `SyncConflictDialog.tsx`, `UsersPage.tsx`, `LoyaltySettingsPage.tsx`, `alert-dialog.tsx`, `PendingSyncItem.tsx`, `ReportPlaceholder.tsx`

**Recommendation**: Rename `Badge.tsx` -> `badge.tsx` and `Button.tsx` -> `button.tsx` to match shadcn/ui lowercase convention used by other UI files (`dialog.tsx`, `select.tsx`, `tabs.tsx`, etc.).

**Missing module (3 errors):**
- `src/data/mockProducts` -- module does not exist (see Section 3.1)

**Missing type declarations (3 errors):**
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` -- Used in `src/pages/settings/CategoriesPage.tsx:21,28,29`

**Recommendation**: Install types: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` or add type stubs.

**Implicit `any` parameters (11 errors):**
- `src/hooks/products/useProductList.ts:34,40` -- parameter `p`
- `src/hooks/useProducts.ts:106,141,147` -- parameter `p`
- `src/pages/inventory/ProductDetailPage.tsx:61,63,88` -- parameters `p`, `_`, `i`
- `src/pages/settings/CategoriesPage.tsx:259` -- parameter `c`

**Recommendation**: Add explicit types to all callback parameters.

### 6.2 Explicit `as any` Assertions (55+ occurrences)

**[CRITIQUE]** Widespread use of `as any` bypasses TypeScript safety:

**Systemic patterns:**
- **`(supabase as any)`** -- 13 occurrences in `hooks/useTerminal.ts` and `services/lan/lanProtocol.ts`. These bypass Supabase's typed client because `pos_terminals` and LAN-related tables are not in generated types.
- **`(section as any).section_type`** -- 12 occurrences in `pages/inventory/tabs/GeneralTab.tsx:65-334`. The `section` type doesn't include newer fields.
- **`record as any`** -- 4 occurrences in `pages/inventory/StockProductionPage.tsx`. Production records not typed.
- **`data as any`** -- `pages/products/PromotionFormPage.tsx:125,307,317`. Promotion data not matching expected types.

**One-off casts:**
- `services/promotionService.ts:69,131,171,285,299` -- 5 casts due to incomplete promotion types
- `services/b2b/arService.ts:79` -- customer relation type mismatch
- `pages/b2b/B2BOrderDetailPage.tsx:275` -- updateData typed as `any`
- `pages/settings/PrintingSettingsPage.tsx:111` -- form data cast
- `pages/settings/SettingsPage.tsx:92` -- dispatch_station cast
- `pages/products/ProductCategoryPricingPage.tsx:208` -- price data cast
- `pages/products/ProductFormPage.tsx:210` -- product data cast
- `pages/reports/components/AlertsDashboardTab.tsx:58,59` -- filter casts

**Recommendation**:
1. **Priority 1**: Update `database.generated.ts` to include `pos_terminals` and LAN tables, eliminating 13 `supabase as any` casts.
2. **Priority 2**: Add proper interfaces for `GeneralTab` sections and production records.
3. **Priority 3**: Strengthen promotion-related types.

### 6.3 Unsafe `as unknown as X` Assertions (40+ occurrences)

**[MAJEUR]** Heavy use of double-cast `as unknown as X` to convert Supabase response types:

**Most frequent pattern** -- Supabase query results cast to domain types:
- `hooks/inventory/useInventoryItems.ts:41` -- `as unknown as TInventoryItem[]`
- `hooks/inventory/useIncomingStock.ts:55` -- `as unknown as IIncomingPurchaseOrder[]`
- `hooks/inventory/useProductRecipe.ts:42` -- `as unknown as IRecipeIngredient[]`
- `hooks/inventory/useStockAdjustment.ts:40` -- `as unknown as ISupplier[]`
- `hooks/inventory/useStockByLocation.ts:56` -- `as unknown as IStockBalance[]`
- `hooks/inventory/useWasteRecords.ts:84` -- `as unknown as RawWaste[]`
- `hooks/settings/useRoles.ts:71` -- `as unknown as RoleRow[]`
- `hooks/settings/useSettingsProfiles.ts:19,37,54` -- `as unknown as ISettingsProfile`
- `hooks/settings/useSoundAssets.ts:21` -- `as unknown as ISoundAsset[]`
- `hooks/settings/useTerminalSettings.ts:26,66` -- `as unknown as TerminalSettings`
- `hooks/useShift.ts:125,148,216,219,284,320` -- 6 different casts for shift data
- `hooks/useOrders.ts:64` -- `as unknown as Insertable<'order_items'>[]`
- `hooks/reports/useOfflineReports.ts:106,109,128,193,201` -- 5 casts for cached report data
- `components/pos/modals/CustomerSearchModal.tsx:243,284,319,452,525` -- 5 casts for customer data
- `components/pos/modals/TransactionHistoryModal.tsx:104` -- `as unknown as RawOrder[]`
- `hooks/offline/useProductsOffline.ts:78` -- `as unknown as ProductWithCategory`
- `hooks/offline/useRecipesOffline.ts:72,80,185,193` -- 4 casts for recipe products

**Root cause**: The `database.generated.ts` Supabase types do not match the actual query shapes (especially with `.select('*, relation(*)')` joins). Hand-written domain types in `types/database.ts` diverge from generated types.

**Recommendation**:
1. Regenerate Supabase types with `supabase gen types typescript` and update `database.generated.ts`.
2. Create proper branded utility types that map Supabase responses to domain types via type-safe transformation functions instead of casts.
3. Example pattern:
```typescript
function toInventoryItem(raw: Tables<'products'>): TInventoryItem {
  return { id: raw.id, name: raw.name, /* ... */ };
}
```

### 6.4 `error: any` Anti-Pattern (13 occurrences)

**[MAJEUR]** Catch blocks use `error: any` instead of proper error narrowing:

- `src/pages/b2b/B2BOrderFormPage.tsx:356`
- `src/pages/b2b/B2BOrderDetailPage.tsx:290,337`
- `src/hooks/useShift.ts:295,330`
- `src/hooks/useProduction.ts:336,384`
- `src/pages/inventory/ProductDetailPage.tsx:219,248,259`
- `src/pages/purchasing/SuppliersPage.tsx:105`
- `src/pages/purchasing/PurchaseOrderFormPage.tsx:191`
- `src/pages/inventory/tabs/UnitsTab.tsx:89`

**Recommendation**: Replace with proper error handling:
```typescript
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  toast.error(message);
}
```

### 6.5 `eslint-disable` Suppressions (46 occurrences)

**[MAJEUR]** 46 `eslint-disable-next-line @typescript-eslint/no-explicit-any` comments found across the codebase. The heaviest files:
- `src/services/sync/syncDeviceService.ts` -- 9 suppressions
- `src/services/lan/lanProtocol.ts` -- 9 suppressions
- `src/hooks/useTerminal.ts` -- 6 suppressions
- `src/components/reports/ExportButtons/ExportButtons.tsx` -- 6 suppressions
- `src/services/reports/offlineReportCache.ts` -- 4 suppressions

These indicate systematic typing issues in the sync/LAN/terminal modules.

**Recommendation**: Address root causes per section 6.2 (update generated types) rather than suppressing lint errors.

### 6.6 Untyped Function Parameters

**[MINEUR]** Several callback parameters lack explicit types:

- `src/pages/b2b/B2BOrderFormPage.tsx:205` -- `value: any` parameter in handleItemChange
- `src/pages/inventory/tabs/VariantsTab.tsx:225` -- `value: any` parameter in handleUpdateOption
- `src/pages/pos/POSMainPage.tsx:146` -- `_combo: any, selectedItems: any[]` in handleComboConfirm
- `src/pages/reports/ReportsConfig.tsx:24,36` -- `icon: any` in config types
- `src/types/reporting.ts:88,89` -- `old_value: any`, `new_value: any` in audit types
- `src/components/reports/DualSeriesLineChart.tsx:48` -- `payload?: any[]`

**Recommendation**: Add specific types for each parameter. For icons, use `LucideIcon` type from `lucide-react`.

---

## 7. Error Handling

### 7.1 ErrorBoundary Coverage

**[MAJEUR]** Only ONE `ErrorBoundary` exists at the application root (`App.tsx:240`). No module-level or route-level error boundaries exist. A single crash in any page (e.g., reports) brings down the entire app including the POS.

**Recommendation**: Add nested `ErrorBoundary` components around:
1. The POS route (critical -- must stay operational)
2. Each back-office module group (reports, inventory, settings)
3. Complex components like `FloorPlanEditor`, `PaymentModal`

### 7.2 Silent Error Suppression

**[MINEUR]** Several catch blocks silently swallow errors with only console logging:
- `src/services/offline/cartPersistenceService.ts:105,150,166` -- "Silent failure" comments with console.error
- `src/services/sync/idempotencyService.ts:60` -- "Non-fatal: log and continue"
- `src/stores/networkStore.ts:96` -- localStorage corruption handled silently

While these are intentionally graceful degradation patterns (appropriate for offline-first), they should be tracked via a monitoring service.

**Recommendation**: Replace `console.error` with a centralized error logger that can be wired to Sentry/similar in production. The TODO in `ErrorBoundary.tsx:27` ("Send to monitoring service (Sentry)") confirms this is planned but not implemented.

### 7.3 French String in Error Path

**[MINEUR]** `src/App.tsx:152` -- `toast.success('Session mise a jour pour compatibilite base de donnees. Veuillez vous reconnecter.')` -- French text in an English-only codebase.

**Recommendation**: Change to English: `toast.success('Session updated for database compatibility. Please log in again.')`

---

## 8. Frontend Performance

### 8.1 Zero React.memo Usage

**[CRITIQUE]** The codebase has **zero** uses of `React.memo` across all 100+ components. This is particularly concerning for:

- **POS ProductGrid** (`src/components/pos/ProductGrid.tsx`) -- Renders product cards that re-render on every cart update
- **POS Cart items** (`src/components/pos/Cart.tsx`, `cart-components/CartItemRow.tsx`) -- Re-render on any cart state change
- **KDS Order Cards** (`src/components/kds/KDSOrderCard.tsx`) -- Re-render on any KDS state update
- **Report tabs** (20+ tabs in `pages/reports/components/`) -- Complex data tables
- **Settings sections** -- Multiple setting field components

**useCallback**: Found in only 30 files (108 occurrences)
**useMemo**: Found in 52 files (172 occurrences)

While `useMemo` and `useCallback` are used moderately, without `React.memo` on child components, they provide no benefit for preventing re-renders.

**Recommendation**: Add `React.memo` to:
1. **Priority 1 (POS performance)**: `ProductGrid`, `ProductCard`, `CartItemRow`, `CartTotals`, `CategoryNav`
2. **Priority 2 (KDS performance)**: `KDSOrderCard`, `KDSCountdownBar`
3. **Priority 3 (Data tables)**: All report tab components, `InventoryTable`

### 8.2 N+1 Query Patterns

**[CRITIQUE]** Sequential database calls inside loops cause performance degradation:

1. **`src/hooks/accounting/useBalanceSheet.ts:34-41`** -- Calls `supabase.rpc('get_account_balance')` for EACH account in a `Promise.all` loop. With 30+ accounts, this fires 30+ database queries.

2. **`src/hooks/accounting/useIncomeStatement.ts:33`** -- Same pattern as useBalanceSheet.

3. **`src/services/inventory/inventoryAlerts.ts:171-194`** -- For each low-stock product, makes 2 Supabase queries (stock_movements + purchase_order_items) sequentially inside a `for` loop. With 50 low-stock items, this fires 100 queries.

4. **`src/pages/products/CombosPage.tsx:52-64`** -- Nested `Promise.all` with `map(async ...)`: fetches groups for each combo, then items for each group. This can generate dozens of queries.

5. **`src/pages/products/ComboFormPage.tsx:110-119`** -- Same nested async pattern for loading combo form data.

6. **`src/components/pos/modals/ComboSelectorModal.tsx:76`** -- Fetches items per group in a `Promise.all(groups.map(async ...))`.

7. **`src/pages/inventory/StockProductionPage.tsx:146`** -- Fetches recipes per product in `Promise.all`.

**Recommendation**:
1. For accounting: Create a database function `get_multiple_account_balances(account_ids UUID[], end_date DATE)` that returns all balances in one query.
2. For inventory alerts: Use joins or a single RPC function that returns enriched low-stock data.
3. For combos: Use Supabase's nested select: `.select('*, groups(*, items(*))'))`.

### 8.3 Lazy Loading

**[POSITIF]** Route-level code splitting is well implemented. `App.tsx` uses `React.lazy()` with `Suspense` for all non-critical routes (100+ lazy-loaded pages). Only `LoginPage` and `POSMainPage` are eagerly loaded as critical paths. This is excellent.

**[MINEUR]** No vendor chunk splitting configured in `vite.config.js`. All vendor code (React, Zustand, Supabase, Tailwind, Lucide icons) ships in a single bundle.

**Recommendation**: Add `build.rollupOptions.output.manualChunks` to split vendor code:
```javascript
manualChunks: {
  vendor: ['react', 'react-dom', 'react-router-dom'],
  supabase: ['@supabase/supabase-js'],
  ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
}
```

### 8.4 Inline Styles vs Tailwind

**[MINEUR]** 413 uses of `style={{...}}` inline styles across components (101 in components/, 312 in pages/). While some are necessary for dynamic values (colors from data, positions for floor plans), many could be replaced with Tailwind classes.

Heavy offenders:
- `pages/inventory/tabs/UnitsTab.tsx` -- 53 inline styles
- `pages/inventory/tabs/VariantsTab.tsx` -- 51 inline styles
- `pages/inventory/tabs/CostingTab.tsx` -- 29 inline styles
- `pages/settings/LoyaltySettingsPage.tsx` -- 23 inline styles
- `pages/inventory/tabs/GeneralTab.tsx` -- 18 inline styles

**Recommendation**: Replace static inline styles with Tailwind utilities. Keep inline styles only for truly dynamic values (e.g., `style={{ backgroundColor: category.color }}`).

---

## 9. Styling Consistency

### 9.1 CSS Files Alongside Tailwind

**[MINEUR]** The project has 84 `.css` files alongside Tailwind CSS usage. This creates a dual styling system:
- Some components use pure Tailwind (`className="flex items-center gap-2"`)
- Others import companion CSS files (`import './Component.css'`)
- Some use both Tailwind + CSS file + inline styles

This makes the styling system unpredictable and harder to maintain.

**Recommendation**: Gradually migrate CSS files to Tailwind-only. Prioritize removing CSS files that contain only utility-like classes. Keep CSS files only for complex animations, pseudo-element styling, or third-party component overrides.

### 9.2 UI Component Casing Mismatch

**[CRITIQUE]** (Already covered in 6.1) The shadcn/ui components have inconsistent file naming:
- PascalCase: `Badge.tsx`, `Button.tsx`, `Card.tsx`, `Input.tsx`, `Breadcrumbs.tsx`
- lowercase: `dialog.tsx`, `select.tsx`, `tabs.tsx`, `tooltip.tsx`, `sheet.tsx`, `separator.tsx`, `scroll-area.tsx`, `toast.tsx`, `sonner.tsx`

This causes TypeScript compile errors when `forceConsistentCasingInFileNames` is enabled.

**Recommendation**: Standardize ALL shadcn/ui files to lowercase (the shadcn default convention): rename `Badge.tsx` -> `badge.tsx`, `Button.tsx` -> `button.tsx`, `Card.tsx` -> `card.tsx`, `Input.tsx` -> `input.tsx`, `Breadcrumbs.tsx` -> `breadcrumbs.tsx`, and update all imports.

---

## 10. Summary of Findings

### Critical Issues (8)

| # | Issue | Section | Impact |
|---|-------|---------|--------|
| C1 | Missing `mockProducts.ts` causes 3 compile errors | 3.1 | Build breaks on strict check |
| C2 | 19 TypeScript compile errors total | 6.1 | CI/CD pipeline failures |
| C3 | 55+ `as any` casts bypass type safety | 6.2 | Runtime errors, silent bugs |
| C4 | Zero `React.memo` across 100+ components | 8.1 | POS/KDS performance degradation |
| C5 | N+1 queries in accounting hooks & inventory alerts | 8.2 | Database overload, slow page loads |
| C6 | 17 direct Supabase calls in pages/components | 5.1 | Architecture violation, untestable code |
| C7 | `B2BOrderDetailPage.tsx` at 1027 lines | 4 | Unmaintainable, high complexity |
| C8 | `CustomerSearchModal.tsx` at 941 lines | 4 | Unmaintainable, POS critical path |

### Major Issues (19)

| # | Issue | Section |
|---|-------|---------|
| M1 | Dead `ProductionPage.tsx` (697 lines) | 3.2 |
| M2 | Duplicate `useProducts` hooks | 3.3 |
| M3 | 40+ `as unknown as X` unsafe casts | 6.3 |
| M4 | 13 `error: any` in catch blocks | 6.4 |
| M5 | 46 eslint-disable suppressions | 6.5 |
| M6 | Only 1 ErrorBoundary at app root | 7.1 |
| M7 | Supabase calls in Zustand stores | 5.2 |
| M8 | Services importing Zustand stores directly | 5.3 |
| M9 | 10 pages > 700 lines | 4 |
| M10 | `authService.ts` at 794 lines | 4 |
| M11 | `lib/db.ts` at 690 lines | 4 |
| M12 | `FloorPlanEditor.tsx` at 703 lines | 4 |
| M13 | `PaymentModal.tsx` at 699 lines | 4 |
| M14 | `usePurchaseOrders.ts` at 607 lines | 4 |
| M15 | `PromotionFormPage.tsx` at 862 lines | 4 |
| M16 | `UsersPage.tsx` at 831 lines | 4 |
| M17 | `OrdersPage.tsx` at 819 lines | 4 |
| M18 | `StockProductionPage.tsx` at 819 lines | 4 |
| M19 | No vendor chunk splitting in build | 8.3 |

### Minor Issues (14)

| # | Issue | Section |
|---|-------|---------|
| m1 | Root-level hooks not in feature directories | 2.1 |
| m2 | Mixed import path styles (@/ vs relative) | 2.2 |
| m3 | Suspended i18n remnants in 3 files | 3.4 |
| m4 | CLAUDE.md references non-existent services | 3.5 |
| m5 | Untyped function parameters in 6 files | 6.6 |
| m6 | Silent error suppression without monitoring | 7.2 |
| m7 | French string in error toast | 7.3 |
| m8 | Missing route-level permission checks | 5.4 |
| m9 | 413 inline styles alongside Tailwind | 8.4 |
| m10 | 84 CSS files alongside Tailwind | 9.1 |
| m11 | UI component casing mismatch | 9.2 |
| m12 | No vendor chunk splitting | 8.3 |
| m13 | 15+ pages between 400-600 lines | 4 |
| m14 | `cartStore.ts` calculation logic could be extracted | 4 |

### Recommended Prioritization

**Sprint 1 (Quick Wins)**:
1. Fix 19 TypeScript compile errors (rename Badge.tsx/Button.tsx, install @dnd-kit, remove mockProducts refs)
2. Delete dead `ProductionPage.tsx`
3. Fix French string in App.tsx
4. Add `React.memo` to POS critical components

**Sprint 2 (Architecture)**:
1. Extract Supabase calls from stores into services
2. Move direct Supabase calls from pages into hooks
3. Consolidate duplicate useProducts hooks
4. Add nested ErrorBoundaries

**Sprint 3 (TypeScript)**:
1. Regenerate Supabase types and update database.generated.ts
2. Replace top 20 `as any` casts with proper types
3. Replace `error: any` with proper error handling
4. Add typed transformation functions for Supabase responses

**Sprint 4 (Performance)**:
1. Fix N+1 queries in accounting hooks (create batch RPC)
2. Fix N+1 in inventoryAlerts (use joins)
3. Add vendor chunk splitting to Vite config
4. Add `React.memo` to remaining list/table components

**Sprint 5 (File Size)**:
1. Split B2BOrderDetailPage (1027 lines)
2. Split CustomerSearchModal (941 lines)
3. Split PromotionFormPage (862 lines)
4. Split authService (794 lines)
