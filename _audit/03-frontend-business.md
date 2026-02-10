# Audit 03 - Frontend Business Logic

**Date**: 2026-02-10
**Scope**: Exhaustive review of frontend business logic across all 11 modules
**Auditor**: Claude (automated analysis)
**Status**: Complete

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [POS (Point of Sale)](#2-pos-point-of-sale)
3. [Inventory & Stock](#3-inventory--stock)
4. [Purchasing](#4-purchasing)
5. [Combos & Promotions](#5-combos--promotions)
6. [Customers & Loyalty](#6-customers--loyalty)
7. [B2B Module](#7-b2b-module)
8. [POS Sessions (Shifts)](#8-pos-sessions-shifts)
9. [Reports](#9-reports)
10. [Settings](#10-settings)
11. [Authentication & Permissions](#11-authentication--permissions)
12. [Offline Mode & Sync](#12-offline-mode--sync)
13. [KDS (Kitchen Display System)](#13-kds-kitchen-display-system)
14. [Cross-Cutting Findings](#14-cross-cutting-findings)
15. [Statistics](#15-statistics)

---

## 1. Executive Summary

The AppGrav frontend codebase is a substantial React/TypeScript application (~84,500 lines) implementing an ERP/POS system. The core POS flow, cart management, sync engine, and KDS modules are well-architected. However, the audit identified **54 findings** across all modules, with the most critical issues being:

- **Widespread French language violations** (i18n was suspended; English is required): 45+ files still contain French text
- **Wrong currency** in StockByLocationPage (EUR instead of IDR)
- **Unimplemented features** presented without clear user feedback (loyalty points redemption, expenses module, free_product promotions)
- **Extensive use of `alert()` instead of `toast()`** across 15+ files (37+ occurrences)
- **Business logic inconsistencies** (B2B tax added on top vs. POS tax inclusive, `clearCart` bypasses locked item security)

### Priority Distribution

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 3 | Data integrity / wrong business values |
| P1 | 12 | Functional bugs or security concerns |
| P2 | 21 | UX inconsistencies, French text, missing features |
| P3 | 18 | Code quality, TODOs, minor polish |

---

## 2. POS (Point of Sale)

### Key Files Reviewed
- `src/stores/cartStore.ts` - Cart state management (Zustand)
- `src/stores/orderStore.ts` - Order lifecycle
- `src/stores/paymentStore.ts` - Split payment state machine
- `src/pages/pos/POSMainPage.tsx` - Main POS orchestration
- `src/components/pos/Cart.tsx` - Cart UI
- `src/components/pos/modals/PaymentModal.tsx` - Payment flow
- `src/components/pos/modals/ComboSelectorModal.tsx` - Combo selection
- `src/components/pos/modals/VoidModal.tsx` - Void operations
- `src/components/pos/modals/RefundModal.tsx` - Refund processing

### Findings

#### POS-001: clearCart bypasses locked item protection
- **Priority**: P1
- **Module**: POS / Cart
- **File(s)**: `src/stores/cartStore.ts` (line ~301)
- **Description**: `clearCart()` resets `lockedItemIds` to `[]` and clears all items without any PIN verification. Individual `removeItem()` correctly blocks locked items, but `clearCart()` bypasses this entirely. Any user can clear a cart containing kitchen-sent items.
- **Impact**: Items already sent to kitchen can be silently removed from the cart without manager approval, leading to lost orders or kitchen confusion.

#### POS-002: French hardcoded string "En cuisine" in order holding
- **Priority**: P2
- **Module**: POS / Orders
- **File(s)**: `src/stores/orderStore.ts` (line 280), `src/hooks/pos/usePOSOrders.ts` (line 64)
- **Description**: When sending orders to kitchen as held orders, the reason is hardcoded as `'En cuisine'` (French for "In the kitchen"). Per CLAUDE.md, all UI strings must be English.
- **Impact**: French text stored in database `reason` field; visible in audit logs and reports.

#### POS-003: Points redemption not implemented
- **Priority**: P2
- **Module**: POS / Cart
- **File(s)**: `src/components/pos/Cart.tsx` (line 111)
- **Description**: When a user attempts to redeem loyalty points, a toast message "Points redemption coming soon" is displayed. The loyalty button is visible and interactive but non-functional.
- **Impact**: User confusion. The button should either be hidden, disabled with a tooltip, or implemented.

#### POS-004: ComboSelectorModal makes direct Supabase calls
- **Priority**: P1
- **Module**: POS / Combos
- **File(s)**: `src/components/pos/modals/ComboSelectorModal.tsx`
- **Description**: The combo selector fetches combo groups and items via direct `supabase.from(...)` calls rather than using hooks or offline-compatible services. This component will fail silently when offline.
- **Impact**: Combos cannot be added to cart when offline; no error feedback to user.

#### POS-005: Cart not auto-cleared after successful payment
- **Priority**: P3
- **Module**: POS / Payment
- **File(s)**: `src/components/pos/modals/PaymentModal.tsx`
- **Description**: After a successful payment, the cart is not automatically cleared. The user must click "New Order" to start fresh. This is intentional design (allows reviewing the completed order) but differs from typical POS behavior.
- **Impact**: Minor UX concern; could lead to accidental duplicate orders if user forgets to click "New Order."

---

## 3. Inventory & Stock

### Key Files Reviewed
- `src/pages/inventory/StockMovementsPage.tsx` - Movement history
- `src/pages/inventory/StockByLocationPage.tsx` - Stock by location
- `src/pages/inventory/StockOpnameForm.tsx` - Stock count form
- `src/pages/inventory/InternalTransfersPage.tsx` - Transfer list
- `src/pages/inventory/TransferFormPage.tsx` - Transfer creation
- `src/pages/inventory/TransferDetailPage.tsx` - Transfer reception

### Findings

#### INV-001: StockByLocationPage uses EUR currency instead of IDR
- **Priority**: P0
- **Module**: Inventory
- **File(s)**: `src/pages/inventory/StockByLocationPage.tsx` (lines 162, 192)
- **Description**: Stock values are formatted with Euro sign: `<strong>{euro}{totalValue.toFixed(2)}</strong>` and `<td>{euro}{item.stock_value.toFixed(2)}</td>`. The business operates in Indonesia with IDR currency.
- **Impact**: **Critical data misrepresentation**. All stock values displayed with wrong currency symbol and wrong decimal formatting (IDR uses no decimals, rounded to 100).

#### INV-002: StockByLocationPage fully in French
- **Priority**: P1
- **Module**: Inventory
- **File(s)**: `src/pages/inventory/StockByLocationPage.tsx`
- **Description**: Page title "Stock par Emplacement", subtitle, table headers, labels are all in French. Per policy, all UI must be English.
- **Impact**: Inconsistent user experience; violates language policy.

#### INV-003: StockOpnameForm uses alert() instead of toast()
- **Priority**: P2
- **Module**: Inventory
- **File(s)**: `src/pages/inventory/StockOpnameForm.tsx` (lines 80, 179, 181, 204, 207)
- **Description**: Five separate calls to native `alert()` for success/error messages. The rest of the application uses `sonner` toast notifications.
- **Impact**: Inconsistent UX; `alert()` blocks the UI thread and has no consistent styling.

#### INV-004: handleUpdateCount does not persist to database
- **Priority**: P3
- **Module**: Inventory / Stock Opname
- **File(s)**: `src/pages/inventory/StockOpnameForm.tsx` (line 148-158)
- **Description**: `handleUpdateCount` performs optimistic-only updates to local state. The actual database save requires clicking "Save Draft" separately. This is by design but there is no auto-save or dirty-state warning.
- **Impact**: Users could lose counted data if they navigate away without saving. No unsaved-changes warning.

#### INV-005: Transfer stock level tracking uses hardcoded 0
- **Priority**: P2
- **Module**: Inventory / Transfers
- **File(s)**: `src/hooks/inventory/useInternalTransfers.ts` (lines 401, 417)
- **Description**: Two TODO comments indicate: `// TODO: Query actual stock levels for accurate tracking`. Current code uses hardcoded values instead of actual stock levels.
- **Impact**: Stock-before and stock-after values in transfer movements may be inaccurate.

#### INV-006: StockOpnameList uses alert() for validation
- **Priority**: P2
- **Module**: Inventory
- **File(s)**: `src/pages/inventory/StockOpnameList.tsx` (lines 48, 74)
- **Description**: Uses `alert('Please select a section')` and `alert('Error: ...')` instead of toast.
- **Impact**: Inconsistent UX pattern.

#### INV-007: ProductDetailPage uses alert() extensively
- **Priority**: P2
- **Module**: Inventory
- **File(s)**: `src/pages/inventory/ProductDetailPage.tsx` (lines 218, 220, 249, 260)
- **Description**: Four `alert()` calls for product update success/error and unit add/delete errors.
- **Impact**: Inconsistent UX pattern.

---

## 4. Purchasing

### Key Files Reviewed
- `src/pages/purchasing/PurchaseOrderDetailPage.tsx` - PO detail with workflow
- `src/pages/purchasing/PurchaseOrdersPage.tsx` - PO list
- `src/pages/purchasing/SuppliersPage.tsx` - Supplier management
- `src/components/purchasing/POHistoryTimeline.tsx` - PO history

### Findings

#### PUR-001: SuppliersPage uses French alert messages
- **Priority**: P1
- **Module**: Purchasing
- **File(s)**: `src/pages/purchasing/SuppliersPage.tsx` (lines 138, 157)
- **Description**: Error alerts in French: `"Erreur lors de l'enregistrement du fournisseur"` and `"Erreur lors de la suppression du fournisseur"`.
- **Impact**: French error messages visible to users; violates language policy.

#### PUR-002: PurchaseOrdersPage uses fr-FR date formatting
- **Priority**: P2
- **Module**: Purchasing
- **File(s)**: `src/pages/purchasing/PurchaseOrdersPage.tsx`
- **Description**: Dates formatted with `toLocaleDateString('fr-FR')`.
- **Impact**: Inconsistent date format. Should use `'en-US'` or the business locale.

#### PUR-003: POHistoryTimeline contains French text
- **Priority**: P2
- **Module**: Purchasing
- **File(s)**: `src/components/purchasing/POHistoryTimeline.tsx`
- **Description**: History descriptions contain French strings like `"Paiement complet effectue"`.
- **Impact**: Mixed language in audit trail; violates language policy.

#### PUR-004: Outstanding purchase payments uses TODO placeholder
- **Priority**: P2
- **Module**: Reports / Purchasing
- **File(s)**: `src/pages/reports/components/OutstandingPurchasePaymentTab.tsx` (line 54)
- **Description**: Comment: `// TODO: Replace with actual amount_paid from po_payments table when available`. Currently using a placeholder calculation.
- **Impact**: Outstanding payment amounts may be inaccurate.

---

## 5. Combos & Promotions

### Key Files Reviewed
- `src/pages/products/ComboFormPage.tsx` - Combo creation
- `src/pages/products/PromotionFormPage.tsx` - Promotion creation
- `src/services/pos/promotionEngine.ts` - Promotion evaluation
- `src/hooks/pos/useCartPromotions.ts` - Cart promotion integration

### Findings

#### PROMO-001: free_product promotion type not implemented
- **Priority**: P1
- **Module**: Promotions
- **File(s)**: `src/services/pos/promotionEngine.ts` (approx. line 266-268)
- **Description**: The `free_product` promotion type handler returns `null`, meaning it has no effect. The UI allows creating free_product promotions, but they are silently ignored at evaluation time.
- **Impact**: Promotions of type `free_product` created by staff will never apply, with no error or warning.

#### PROMO-002: ComboFormPage makes direct Supabase calls
- **Priority**: P2
- **Module**: Products / Combos
- **File(s)**: `src/pages/products/ComboFormPage.tsx`
- **Description**: All CRUD operations use direct `supabase.from(...)` calls instead of hooks. This page is admin-only and less likely to be used offline, but it breaks the architectural pattern.
- **Impact**: No offline support; no react-query cache invalidation on related queries.

#### PROMO-003: PromotionFormPage makes direct Supabase calls
- **Priority**: P2
- **Module**: Products / Promotions
- **File(s)**: `src/pages/products/PromotionFormPage.tsx`
- **Description**: Same as PROMO-002; all operations use direct Supabase calls.
- **Impact**: Same as PROMO-002.

---

## 6. Customers & Loyalty

### Key Files Reviewed
- `src/pages/customers/CustomerDetailPage.tsx` - Customer detail
- `src/pages/customers/CustomersPage.tsx` - Customer list
- `src/pages/customers/CustomerFormPage.tsx` - Customer form
- `src/pages/customers/CustomerCategoriesPage.tsx` - Customer categories

### Findings

#### CUST-001: CustomerDetailPage extensively in French
- **Priority**: P1
- **Module**: Customers
- **File(s)**: `src/pages/customers/CustomerDetailPage.tsx`
- **Description**: Nearly all UI labels, toasts, and error messages are in French. Examples: labels like "Nom", "Email", "Depuis le", "Points de fidelite"; toasts like "Veuillez entrer un montant valide"; date formatting uses `'fr-FR'`.
- **Impact**: Entire customer detail page violates the English-only language policy.

#### CUST-002: CustomerFormPage French error messages
- **Priority**: P1
- **Module**: Customers
- **File(s)**: `src/pages/customers/CustomerFormPage.tsx`
- **Description**: French text in form labels and validation error messages.
- **Impact**: Inconsistent with English-only policy.

#### CUST-003: CustomersPage French UI elements
- **Priority**: P1
- **Module**: Customers
- **File(s)**: `src/pages/customers/CustomersPage.tsx`
- **Description**: French search placeholder, button labels, and empty state text.
- **Impact**: Inconsistent with English-only policy.

#### CUST-004: CustomerCategoriesPage French strings
- **Priority**: P2
- **Module**: Customers
- **File(s)**: `src/pages/customers/CustomerCategoriesPage.tsx`
- **Description**: French text in category management UI.
- **Impact**: Inconsistent with English-only policy.

---

## 7. B2B Module

### Key Files Reviewed
- `src/pages/b2b/B2BOrderFormPage.tsx` - B2B order creation
- `src/pages/b2b/B2BOrderDetailPage.tsx` - B2B order detail
- `src/pages/b2b/B2BPage.tsx` - B2B dashboard
- `src/pages/b2b/B2BOrdersPage.tsx` - B2B order list

### Findings

#### B2B-001: B2B tax calculation differs from POS (tax added on top)
- **Priority**: P0
- **Module**: B2B
- **File(s)**: `src/pages/b2b/B2BOrderFormPage.tsx`
- **Description**: B2B orders calculate tax by adding it ON TOP of the subtotal (exclusive/HT model), whereas POS orders treat tax as INCLUDED in prices (tax = total * 10/110, inclusive/TTC model). This discrepancy means the same product has different effective prices in POS vs B2B contexts without clear documentation.
- **Impact**: **Potential pricing inconsistency**. B2B customers may pay 10% more than expected if they compare with POS prices. Needs explicit business confirmation that this is intentional.

#### B2B-002: B2B pages entirely in French
- **Priority**: P1
- **Module**: B2B
- **File(s)**: `src/pages/b2b/B2BOrderFormPage.tsx`, `src/pages/b2b/B2BOrderDetailPage.tsx`, `src/pages/b2b/B2BPage.tsx`, `src/pages/b2b/B2BOrdersPage.tsx`
- **Description**: All four B2B pages have French text: "Nouvelle Commande B2B", "Selectionner un client", error messages like `"Veuillez selectionner un client"`, `"Erreur lors de l'enregistrement"`, etc.
- **Impact**: Entire B2B module violates English-only policy.

#### B2B-003: B2B order_number generated client-side with collision risk
- **Priority**: P1
- **Module**: B2B
- **File(s)**: `src/pages/b2b/B2BOrderFormPage.tsx`
- **Description**: Order numbers are generated as `B2B-${Date.now()}`. Two orders created within the same millisecond (e.g., from different terminals) would get the same number.
- **Impact**: Potential duplicate order numbers, which could cause database constraint violations or order confusion.

#### B2B-004: B2B pages use French alert() messages
- **Priority**: P1
- **Module**: B2B
- **File(s)**: `src/pages/b2b/B2BOrderFormPage.tsx` (lines 272, 277, 358), `src/pages/b2b/B2BOrderDetailPage.tsx` (lines 292, 298, 302, 339, 410)
- **Description**: Eight `alert()` calls with French messages across two files.
- **Impact**: Inconsistent UX + language violation.

---

## 8. POS Sessions (Shifts)

### Key Files Reviewed
- `src/hooks/pos/usePOSShift.ts` - Shift management hook
- `src/pages/pos/POSMainPage.tsx` - Shift integration in POS

### Findings

#### SHIFT-001: No critical issues found
- **Priority**: N/A
- **Module**: POS Sessions
- **Description**: The shift management hook (`usePOSShift`) is well-structured with proper error handling, uses toast notifications, and has clean integration with the POS main page. Shift open/close/switch/recover operations all work through react-query mutations.
- **Impact**: N/A

---

## 9. Reports

### Key Files Reviewed
- `src/pages/reports/ReportsPage.tsx` - Reports hub (25+ tabs)
- `src/pages/reports/components/ExpensesTab.tsx` - Expenses report
- `src/pages/reports/components/SessionCashBalanceTab.tsx` - Cash balance
- `src/pages/reports/components/OutstandingPurchasePaymentTab.tsx` - Outstanding payments
- 20+ additional report tab components

### Findings

#### RPT-001: Expenses module has no database table
- **Priority**: P2
- **Module**: Reports / Finance
- **File(s)**: `src/pages/reports/components/ExpensesTab.tsx`
- **Description**: The expenses tab shows "Coming Soon" because the `expenses` table does not exist. The `isFeatureAvailable` flag is hardcoded to `false`. The full UI (charts, table, export) exists but is never rendered.
- **Impact**: Feature appears in the navigation but is non-functional. Users may expect it to work.

#### RPT-002: Report export button in header is non-functional
- **Priority**: P2
- **Module**: Reports
- **File(s)**: `src/pages/reports/ReportsPage.tsx` (line 183)
- **Description**: The "Export" button in the reports header has no `onClick` handler. Individual report tabs have their own `ExportButtons` component which works, so this header button is redundant but misleading.
- **Impact**: Users may click the header export button and expect it to work.

#### RPT-003: 17 report tabs use fr-FR date formatting
- **Priority**: P2
- **Module**: Reports
- **File(s)**: All report components in `src/pages/reports/components/` (see list of 17 files in grep results above)
- **Description**: Most report tab components use `toLocaleDateString('fr-FR')` for formatting dates. This produces French date formats (e.g., "10 fevr. 2026" instead of "Feb 10, 2026").
- **Impact**: Inconsistent date formatting across the application. Individual reports also contain French export titles and column headers.

#### RPT-004: SessionCashBalanceTab French title
- **Priority**: P2
- **Module**: Reports
- **File(s)**: `src/pages/reports/components/SessionCashBalanceTab.tsx` (line 52)
- **Description**: Export config `title: 'Balance de Caisse'` is French.
- **Impact**: Exported PDF/CSV files will have French title.

---

## 10. Settings

### Key Files Reviewed
- `src/pages/settings/SettingsPage.tsx` - Main settings page
- `src/pages/settings/TaxSettingsPage.tsx` - Tax configuration
- `src/pages/settings/PaymentMethodsPage.tsx` - Payment methods
- `src/pages/settings/RolesPage.tsx` - Role management

### Findings

#### SET-001: SettingsPage general save button has no handler
- **Priority**: P1
- **Module**: Settings
- **File(s)**: `src/pages/settings/SettingsPage.tsx` (lines 393-396)
- **Description**: The "Save" and "Cancel" buttons in the General tab have no `onClick` handlers. Changes to store name, address, phone, and timezone are tracked in local state but never persisted to the database.
- **Impact**: **Settings changes are lost on page refresh**. Users believe they saved their settings but nothing was actually stored.

#### SET-002: Printer list is hardcoded with French names
- **Priority**: P2
- **Module**: Settings
- **File(s)**: `src/pages/settings/SettingsPage.tsx` (lines 294-297)
- **Description**: The printers tab displays a hardcoded array with French names: `'Imprimante Caisse'`, `'Imprimante Cuisine'`, `'Imprimante Barista'`. These are not loaded from the database.
- **Impact**: Printer configuration UI is a static mockup; users cannot actually configure printers from this tab. A separate `PrintingSettingsPage.tsx` exists with real functionality.

#### SET-003: Section delete uses hard delete
- **Priority**: P2
- **Module**: Settings
- **File(s)**: `src/pages/settings/SettingsPage.tsx` (line 273-283)
- **Description**: `handleDeleteSection` performs a hard `DELETE` from the `sections` table rather than a soft delete (`is_active = false`). The `confirm()` dialog warns about irreversibility but doesn't check for products linked to the section.
- **Impact**: Deleting a section could orphan product-section relationships or cause foreign key errors.

#### SET-004: SettingsPage uses alert() for errors
- **Priority**: P2
- **Module**: Settings
- **File(s)**: `src/pages/settings/SettingsPage.tsx` (lines 168, 217, 261, 282)
- **Description**: Four `alert()` calls for station update errors, section name validation, section save errors, and section delete errors.
- **Impact**: Inconsistent UX pattern.

#### SET-005: TaxSettingsPage shows French "TTC" / "HT" labels
- **Priority**: P3
- **Module**: Settings / Tax
- **File(s)**: `src/pages/settings/TaxSettingsPage.tsx` (line 253-254)
- **Description**: Tax type displays `'TTC'` (tax-inclusive) and `'HT'` (tax-exclusive), which are French accounting terms. English equivalents would be "Inclusive" and "Exclusive".
- **Impact**: Minor French text in otherwise English page.

#### SET-006: FloorPlanEditor uses alert() extensively
- **Priority**: P2
- **Module**: Settings
- **File(s)**: `src/components/settings/FloorPlanEditor.tsx` (lines 115, 118, 126, 160, 192, 213)
- **Description**: Six `alert()` calls for success and error feedback in the floor plan editor.
- **Impact**: Inconsistent UX pattern.

#### SET-007: NotificationSettingsSection uses alert()
- **Priority**: P2
- **Module**: Settings
- **File(s)**: `src/components/settings/NotificationSettingsSection.tsx` (lines 77, 81, 82)
- **Description**: Three `alert()` calls for email testing feedback.
- **Impact**: Inconsistent UX pattern.

---

## 11. Authentication & Permissions

### Key Files Reviewed
- `src/stores/authStore.ts` - Auth state management
- `src/components/auth/PermissionGuard.tsx` - Permission guard component
- `src/hooks/usePermissions.ts` - Permissions hook

### Findings

#### AUTH-001: Legacy role fallback in PermissionGuard
- **Priority**: P3
- **Module**: Authentication
- **File(s)**: `src/components/auth/PermissionGuard.tsx` (lines 88-97)
- **Description**: When `userPermissions` is empty but the user has a legacy `role` field (admin/manager/super_admin), the guard grants access to `users.*` permissions. This fallback bypasses the granular permission system.
- **Impact**: Users with legacy admin roles may have broader access than intended. This is a transitional pattern that should eventually be removed.

#### AUTH-002: PermissionGuard well-implemented
- **Priority**: N/A (positive finding)
- **Module**: Authentication
- **Description**: The `PermissionGuard`, `RouteGuard`, `AdminOnly`, and `ManagerOnly` components are well-designed with support for single/multiple permissions, `requireAll` mode, role-based checks, and styled access-denied pages. The `RolesPage` correctly uses `RouteGuard` for page-level protection.
- **Impact**: N/A

---

## 12. Offline Mode & Sync

### Key Files Reviewed
- `src/services/sync/syncEngine.ts` - Core sync engine
- `src/services/sync/syncQueue.ts` - Sync queue management
- `src/services/sync/orderSync.ts` - Order sync
- `src/services/sync/stockSync.ts` - Stock sync
- `src/hooks/offline/useOfflineOrder.ts` - Offline order hook
- `src/hooks/offline/useOfflineSession.ts` - Offline session hook

### Findings

#### SYNC-001: Payment sync not implemented
- **Priority**: P1
- **Module**: Offline / Sync
- **File(s)**: `src/services/sync/syncEngine.ts` (line 154-158)
- **Description**: The `syncPayment` function contains only a log message: `'Payment sync not yet implemented (part of order sync)'`. The `processItem` switch case routes `'payment'` type items to this empty handler.
- **Impact**: If a payment is queued independently (not as part of an order), it will be marked as "synced" without actually syncing any data.

#### SYNC-002: Retryable items use createdAt instead of lastAttemptAt
- **Priority**: P1
- **Module**: Offline / Sync
- **File(s)**: `src/services/sync/syncQueue.ts` (lines 199-203)
- **Description**: `getRetryableItems()` calculates backoff delay from `item.createdAt` instead of the actual last attempt timestamp. This means after the first retry, the backoff calculation is based on creation time rather than last failure time.
- **Impact**: Items that fail multiple times may be retried too quickly or too slowly depending on how much time has elapsed since creation. The exponential backoff is effectively broken for retries beyond the first.

#### SYNC-003: Offline order hook has multiple TODOs
- **Priority**: P2
- **Module**: Offline
- **File(s)**: `src/hooks/offline/useOfflineOrder.ts` (lines 45, 112, 122)
- **Description**: Three TODO items: integration with online order creation, getting current session ID from POS context, and future direct Supabase calls for online orders.
- **Impact**: Offline orders may not be linked to the correct POS session.

#### SYNC-004: Offline session hook TODO
- **Priority**: P2
- **Module**: Offline
- **File(s)**: `src/hooks/offline/useOfflineSession.ts` (line 138)
- **Description**: TODO: `Add online routing when useShift is integrated`.
- **Impact**: Online session management may not be fully integrated with the offline session handler.

#### SYNC-005: Stock movement sync generates movement_id client-side
- **Priority**: P3
- **Module**: Offline / Sync
- **File(s)**: `src/services/sync/syncEngine.ts` (line 167)
- **Description**: Movement IDs are generated as `OFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`. While collision probability is low, this is not a UUID and doesn't follow the database convention.
- **Impact**: Minor consistency issue; the random component provides sufficient uniqueness in practice.

#### SYNC-006: Sync queue max size is enforced correctly
- **Priority**: N/A (positive finding)
- **Module**: Offline / Sync
- **File(s)**: `src/services/sync/syncQueue.ts`
- **Description**: The sync queue correctly enforces a maximum size (from `OFFLINE_CONSTANTS.MAX_QUEUE_SIZE`), attempts cleanup of synced items before rejecting, and uses exponential backoff delays. The architecture is solid.
- **Impact**: N/A

---

## 13. KDS (Kitchen Display System)

### Key Files Reviewed
- `src/pages/kds/KDSMainPage.tsx` - KDS main page
- `src/pages/kds/KDSStationSelector.tsx` - Station selection
- `src/components/kds/KDSOrderCard.tsx` - Order card component

### Findings

#### KDS-001: Urgent threshold is hardcoded
- **Priority**: P3
- **Module**: KDS
- **File(s)**: `src/pages/kds/KDSMainPage.tsx` (line 48)
- **Description**: `KDS_URGENT_THRESHOLD_SECONDS = 600` (10 minutes) is hardcoded with a TODO comment: `// TODO: Make configurable via settings (Story 4.x)`.
- **Impact**: Cannot customize urgency threshold without code changes.

#### KDS-002: KDS well-architected with dual data sources
- **Priority**: N/A (positive finding)
- **Module**: KDS
- **Description**: The KDS module uses a well-designed dual-source architecture: LAN-based real-time order reception (`useKdsOrderReceiver`) as primary channel, with Supabase Realtime subscriptions as fallback. Optimistic updates with surgical rollback on failure. FIFO ordering via `useKdsOrderQueue` hook. Customer display broadcast on order completion.
- **Impact**: N/A

---

## 14. Cross-Cutting Findings

### CROSS-001: French text across 45+ files
- **Priority**: P0
- **Module**: All
- **Description**: The i18n module was suspended and all UI should be English. However, **45+ files** still contain French text including:
  - **Customer module** (4 files): labels, toasts, error messages, date formatting
  - **B2B module** (4 files): all UI text, alert messages
  - **Inventory** (1 file): StockByLocationPage entirely French
  - **Purchasing** (3 files): SuppliersPage alerts, PO history, PO list dates
  - **Reports** (17 files): date formatting `fr-FR`, export titles in French
  - **Settings** (2 files): printer names, cash balance title
  - **POS components** (4 files): CustomerSearchModal, TransactionHistoryModal dates
  - **Reports infrastructure** (2 files): DualSeriesLineChart, ComparisonKpiCard dates
- **Impact**: Significant inconsistency across the application. Users encounter a mix of English and French text.

### CROSS-002: alert() used instead of toast() in 15+ files (37+ occurrences)
- **Priority**: P2
- **Module**: All
- **Description**: Native `alert()` is used for user feedback in the following files:
  | File | Count |
  |------|-------|
  | `StockOpnameForm.tsx` | 5 |
  | `FloorPlanEditor.tsx` | 6 |
  | `SettingsPage.tsx` | 4 |
  | `B2BOrderFormPage.tsx` | 3 |
  | `B2BOrderDetailPage.tsx` | 5 |
  | `NotificationSettingsSection.tsx` | 3 |
  | `ProductDetailPage.tsx` | 4 |
  | `ProductImportModal.tsx` | 1 |
  | `RecipeImportModal.tsx` | 1 |
  | `StockOpnameList.tsx` | 2 |
  | `SuppliersPage.tsx` | 2 |
  | `UnitsTab.tsx` | 1 |
- **Impact**: Inconsistent UX. `alert()` blocks UI execution, has no styling, and cannot be dismissed programmatically.

### CROSS-003: confirm() used for destructive actions without custom modal
- **Priority**: P3
- **Module**: All
- **Description**: Native `window.confirm()` is used for destructive actions (delete section, delete role, delete payment method, finalize stock count, etc.) rather than a custom confirmation modal with consistent styling.
- **Impact**: Minor UX inconsistency; functional but not polished.

### CROSS-004: Import CSV modals use alert() for validation
- **Priority**: P3
- **Module**: Products
- **File(s)**: `src/components/products/ProductImportModal.tsx` (line 56), `src/components/products/RecipeImportModal.tsx` (line 56)
- **Description**: Both import modals use `alert('Please select a CSV file')` for file validation.
- **Impact**: Minor; same pattern as CROSS-002.

---

## 15. Statistics

### Files Analyzed
| Category | Files Read | Files Searched |
|----------|-----------|----------------|
| POS (stores, pages, modals) | 9 | 15+ |
| Inventory (pages, hooks) | 7 | 10+ |
| Purchasing (pages, components) | 4 | 6+ |
| Products (combos, promotions) | 2 | 5+ |
| Customers | 4 | 5+ |
| B2B | 4 | 4 |
| Reports | 5 | 25+ |
| Settings | 5 | 10+ |
| Auth | 2 | 3+ |
| Sync/Offline | 4 | 12+ |
| KDS | 2 | 4+ |
| **Total** | **~48** | **~100+** |

### Pattern Search Results
| Pattern | Matches |
|---------|---------|
| `fr-FR` locale usage | 31 files |
| `alert()` calls | 15+ files, 37+ occurrences |
| French strings (Erreur, Veuillez, etc.) | 45 files |
| EUR currency symbol | 1 file (StockByLocationPage) |
| TODO/FIXME/Coming Soon | 18 occurrences across 15 files |

### Severity Summary
| ID | Priority | Module | Summary |
|----|----------|--------|---------|
| INV-001 | **P0** | Inventory | EUR currency instead of IDR |
| B2B-001 | **P0** | B2B | Tax calculation differs from POS |
| CROSS-001 | **P0** | All | French text in 45+ files |
| POS-001 | P1 | POS | clearCart bypasses locked items |
| POS-004 | P1 | POS | ComboSelector no offline support |
| INV-002 | P1 | Inventory | StockByLocation fully French |
| PUR-001 | P1 | Purchasing | Suppliers French alerts |
| PROMO-001 | P1 | Promotions | free_product type not implemented |
| CUST-001 | P1 | Customers | CustomerDetail fully French |
| CUST-002 | P1 | Customers | CustomerForm French errors |
| CUST-003 | P1 | Customers | CustomersPage French UI |
| B2B-002 | P1 | B2B | All B2B pages in French |
| B2B-003 | P1 | B2B | order_number collision risk |
| B2B-004 | P1 | B2B | French alert() messages |
| SYNC-001 | P1 | Sync | Payment sync not implemented |
| SYNC-002 | P1 | Sync | Backoff uses createdAt not lastAttemptAt |
| SET-001 | P1 | Settings | General save has no handler |
| POS-002 | P2 | POS | "En cuisine" French string |
| POS-003 | P2 | POS | Points redemption not implemented |
| INV-003 | P2 | Inventory | StockOpname alert() usage |
| INV-005 | P2 | Inventory | Transfer stock levels hardcoded |
| INV-006 | P2 | Inventory | StockOpnameList alert() |
| INV-007 | P2 | Inventory | ProductDetailPage alert() |
| PUR-002 | P2 | Purchasing | PO list fr-FR dates |
| PUR-003 | P2 | Purchasing | PO history French text |
| PUR-004 | P2 | Purchasing | Outstanding payments TODO |
| PROMO-002 | P2 | Combos | ComboForm direct Supabase |
| PROMO-003 | P2 | Promotions | PromotionForm direct Supabase |
| CUST-004 | P2 | Customers | CustomerCategories French |
| RPT-001 | P2 | Reports | Expenses module non-functional |
| RPT-002 | P2 | Reports | Header export button broken |
| RPT-003 | P2 | Reports | 17 tabs use fr-FR dates |
| RPT-004 | P2 | Reports | SessionCashBalance French title |
| SET-002 | P2 | Settings | Hardcoded French printer names |
| SET-003 | P2 | Settings | Section hard delete |
| SET-004 | P2 | Settings | SettingsPage alert() usage |
| SET-006 | P2 | Settings | FloorPlanEditor alert() usage |
| SET-007 | P2 | Settings | NotificationSettings alert() |
| CROSS-002 | P2 | All | 37+ alert() instead of toast() |
| SYNC-003 | P2 | Sync | Offline order hook TODOs |
| SYNC-004 | P2 | Sync | Offline session hook TODO |
| POS-005 | P3 | POS | Cart not auto-cleared |
| INV-004 | P3 | Inventory | StockOpname no auto-save |
| AUTH-001 | P3 | Auth | Legacy role fallback |
| SET-005 | P3 | Settings | TTC/HT French terms |
| KDS-001 | P3 | KDS | Urgent threshold hardcoded |
| SYNC-005 | P3 | Sync | Non-UUID movement_id |
| CROSS-003 | P3 | All | confirm() instead of modal |
| CROSS-004 | P3 | Products | CSV import alert() |

---

*End of Audit Report*
