# Current State

Last updated: 2026-02-15

## Sprint Status

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 0 | Core System - Auth, Permissions, Config (Epic 1) | **Complete** |
| Sprint 1 | Catalogue & Costing (Epic 2), POS & Sales (Epic 3), KDS (Epic 4) | **Complete** |
| Sprint 2 | Stock & Purchasing (Epic 5), Clients & Marketing (Epic 6) | **Complete** |
| Sprint 3 | Multi-Device (Epic 7) - Customer Display, Mobile, Print Server, LAN Hub | **Complete** |
| Sprint 4 | Security hardening, DB fixes, Report foundation (Epic 8 partial) | **Complete** |
| Sprint 5 | Analytics & Reports (Epic 8 complete), French→English migration | **Complete** |
| Phase 2 Sprint 3 | Offline Improvements - Priority sync, idempotency, conflict resolution | **Complete** |
| Epic 9 | Accounting & Tax Compliance - Chart of accounts, journals, financial statements, VAT | **Complete** |
| Epic 10 Phase 1 | Settings Expansion Foundation - Categories, settings rows, typed hooks | **Complete** |
| Epic 10 Phase 2 | Custom Settings UI Pages - 9 specialized pages with rich editors | **Complete** |
| Epic 10 Phase 3 | Migrate hardcoded constants to settings store - 17 files, ~40 constants | **Complete** |

## Epics Overview

- **Epic 1** (Core System): Done - Offline auth, PIN cache, permissions, settings UI, printer config, audit log
- **Epic 2** (Catalogue): Done - Products/categories/modifiers/recipes offline cache
- **Epic 3** (POS & Sales): Done - Full POS revision with split payments, voids, refunds, EDC, print integration
- **Epic 4** (KDS): Done - LAN-based kitchen display with order dispatch and status updates
- **Epic 5** (Stock): Done - Stock levels, alerts, adjustments, transfers, purchase orders, sale deduction triggers
- **Epic 6** (Clients & Marketing): Done - Customer pricing, loyalty display, promotions engine, combos, B2B orders/payments
- **Epic 7** (Multi-Device): Done - Customer display, mobile app (Capacitor), print server, LAN monitoring
- **Epic 8** (Analytics): Done - All 10 stories (8.0-8.9) complete: report framework, 27 report tabs, period comparison, offline cache, audit trail, alerts dashboard
- **Epic 9** (Accounting): Done - Chart of accounts (30 Indonesian SME accounts), auto-generated journals from sales/purchases, general ledger, trial balance, balance sheet, income statement, VAT (PPN 10%) management with DJP export, fiscal periods
- **Epic 10** (Settings Expansion): Phase 1+2+3 Done - 8 new categories, 65 configurable settings, 10 typed hooks, 9 custom UI pages, ~40 hardcoded constants migrated across 17 files

## Security Improvements (Sprint 4)

- Removed plaintext PIN storage from `user_profiles` (migration `20260210100000`)
- Removed anonymous insert RLS policies (migration `20260210100001`)
- Reimplemented critical RLS policies with proper auth checks (migration `20260210100002`)
- `open_shift()` now uses `auth.uid()` instead of client-provided `p_user_id` (migration `20260210110003`)
- Print server requires `PRINT_API_KEY` for all POST endpoints
- Edge Functions require JWT authentication
- Production-safe logger utility (`src/utils/logger.ts`) suppresses debug/info in production

## Database Changes (Sprint 4)

- `order_payments` table recreated with proper indexes and RLS (migration `20260210100005`)
- `system_alerts` table recreated for anomaly detection (migration `20260210100005`)
- `order_items.quantity` changed from INTEGER to DECIMAL(10,3) (migration `20260210110006`)
- `stock_movements` CHECK constraint enforces positive quantities (migration `20260210110002`)
- `order_status` enum now includes `'voided'` value (migration `20260210110005`)
- `b2b_orders.tax_rate` default changed to 0.10 (migration `20260210120000`)
- Added missing indexes on high-traffic columns (migration `20260210110004`)
- Fixed `finalize_inventory_count` function (migration `20260210110001`)
- Resolved stock trigger conflicts (migration `20260210110000`)

## Test Coverage

- **98 test files**, approximately **1,650 tests**
- Key additions in Sprint 4: `cartStore.test.ts`, `checkoutIntegration.test.ts`, `promotionEngine.test.ts`, `authService.test.ts`
- Coverage configuration: V8 provider, thresholds at 60/50/60/60 (statements/branches/functions/lines)
- Run with: `npm run test:coverage`

## Sprint 5 Accomplishments (Epic 8)

- **Story 8.0**: DB Foundation - 8 views, 2 RPCs, system_alerts table
- **Story 8.1**: Report framework - ReportSkeleton, ReportPlaceholder, SalesReportsPage removed
- **Story 8.2**: Sales reports - Tax KPI card, top 10 + margin, heatmap, order_type filter
- **Story 8.3**: Inventory reports - StockMovementTab + InventoryTab enriched (DatePicker, exports, KPIs, search, sort)
- **Story 8.4**: Financial reports - ProfitLoss, DiscountsVoids, PurchaseBySupplier, PurchaseDetails, OutstandingPayment migrated to English
- **Story 8.5**: Drill-down - ReportBreadcrumb + useDrillDown in ProductPerformance, SalesByCategory, StockMovement
- **Story 8.6**: Export polish - 26/27 tabs with ExportButtons, all filenames kebab-case
- **Story 8.7**: Period comparison - ComparisonToggle + ComparisonKpiCard in OverviewTab, DailySalesTab, SalesByHourTab, ProfitLossTab
- **Story 8.8**: Offline cache - Dexie offline_reports_cache table, useOfflineReports hook, OfflineReportBanner in ReportsPage
- **Story 8.9**: Audit & alerts - AuditTab (pagination, filters, expandable rows) + AlertsDashboardTab (KPI counts, resolve, anomaly detection)
- **French→English migration**: All 27 report tabs + useDateRange + 4 comparison components migrated from French to English

## Phase 2 Sprint 3: Offline Improvements (2026-02-11)

Priority-based sync, idempotency protection, and conflict resolution UI for the offline sync engine.

### New Services
| Service | Lines | Purpose |
|---------|-------|---------|
| `syncPriority.ts` | 90 | Maps entity types to priority levels (critical/high/normal/low), sorts queue |
| `idempotencyService.ts` | 95 | Generates deterministic keys, checks/registers in Supabase `idempotency_keys` table |
| `syncConflictService.ts` | 120 | Detects conflicts from errors, stores in IndexedDB, applies resolution strategies |

### Key Changes
- **syncEngine.ts**: Refactored to sort items by priority before processing, wrap with idempotency, detect+store conflicts instead of silent failures
- **syncQueue.ts**: `addToSyncQueue()` auto-assigns priority based on entity type, accepts optional `idempotency_key`
- **syncStore.ts**: Added `conflictCount` and `syncProgress` state for UI feedback
- **Dexie v19**: Added `priority` index on legacy sync queue, new `offline_sync_conflicts` table
- **Supabase migration**: `idempotency_keys` table with RLS and expiration index

### UI Components
- `SyncConflictDialog`: Modal with side-by-side diff, Keep Local / Keep Server / Skip actions
- `SyncConflictDiff`: Color-coded field comparison (local vs server data)
- `PendingSyncPanel`: Now shows conflicts section with resolve buttons
- `PendingSyncCounter`: Orange alert icon when unresolved conflicts exist

### Priority Mapping
| Priority | Entity Types |
|----------|-------------|
| Critical | void, refund, payment, session_close |
| High | order, order_update |
| Normal | product, stock_movement, category, customer |
| Low | audit_log, settings |

### Tests
- 40 new tests across 4 new test files + 3 added to existing `syncQueue.test.ts`
- All 242 sync-related tests pass, build compiles cleanly

## Architecture Improvements

### settingsStore Split (2026-02-11)

Monolithic `settingsStore.ts` (691 lines) split into 5 focused domain stores under `src/stores/settings/`:

| Store | Lines | Responsibility |
|-------|-------|----------------|
| `coreSettingsStore.ts` | 280 | Categories, settings, appearance, localization, initialization orchestration |
| `taxStore.ts` | 92 | Tax rates CRUD |
| `paymentMethodStore.ts` | 92 | Payment methods CRUD |
| `printerStore.ts` | 82 | Printer configurations CRUD |
| `businessHoursStore.ts` | 45 | Business hours |
| `index.ts` | 5 | Barrel re-export |
| `settingsStore.ts` (facade) | 17 | Backward-compatible re-export |

- All files under 300-line convention limit
- 6 consumers updated to import from domain stores directly
- Backward-compatible facade preserves `useSettingsStore` for any indirect consumers
- 61 settings-related tests pass, build compiles cleanly

## Epic 9: Accounting & Tax Compliance (2026-02-12)

Full double-entry accounting module, online-only (no offline sync).

### Database (3 migrations)
| Table | Purpose |
|-------|---------|
| `accounts` | Chart of accounts with hierarchy, 30 Indonesian SME seed accounts |
| `journal_entries` | Journal header with balanced debit=credit constraint |
| `journal_entry_lines` | Journal lines with exactly one of debit/credit > 0 |
| `fiscal_periods` | Monthly fiscal periods with open/closed/locked status |

### Auto-Generation Triggers
- **Sales**: `orders.status = 'completed'` → Debit Cash/Bank, Credit Sales + VAT Collected
- **Purchases**: `purchase_orders.status = 'received'` → Debit Purchases + VAT Input, Credit AP
- **Voids**: `orders.status = 'voided'` → Reversal entry created automatically

### Functions
- `get_account_balance(account_id, end_date)` → DECIMAL (respects balance_type)
- `calculate_vat_payable(year, month)` → TABLE(collected, deductible, payable)

### Frontend (35 new files, ~3,600 lines)
| Category | Files |
|----------|-------|
| Types | `accounting.ts` (enums, interfaces, constants) |
| Hooks (9) | `useAccounts`, `useJournalEntries`, `useGeneralLedger`, `useTrialBalance`, `useBalanceSheet`, `useIncomeStatement`, `useVATManagement`, `useFiscalPeriods` |
| Services (3) | `accountingService` (tree builder, formatIDR), `journalEntryValidation`, `vatService` (PPN calc, DJP export) |
| Components (8) | `AccountModal`, `AccountTree`, `AccountPicker`, `JournalEntryForm`, `JournalLineTable`, `FinancialStatementTable`, `VATSummaryCard`, `FiscalPeriodModal` |
| Pages (8) | `AccountingLayout`, `ChartOfAccounts`, `JournalEntries`, `GeneralLedger`, `TrialBalance`, `BalanceSheet`, `IncomeStatement`, `VATManagement` |
| Tests (3) | 29 tests (accountingService, journalEntryValidation, vatService) |

### Routes
`/accounting/*` with 7 sub-routes, accessible via Calculator icon in sidebar Admin section.

### Permissions
`accounting.view`, `accounting.manage`, `accounting.journal.create`, `accounting.journal.update`, `accounting.vat.manage`

## Epic 10 Phase 1: Settings Expansion Foundation (2026-02-12)

Transforms ~65 hardcoded operational parameters into configurable settings via the Settings UI.

### Bug Fix
- `CategorySettingsPage.tsx:183`: `is_system` no longer disables editing (only `is_readonly` does). `is_system` now only prevents deletion (correct semantics).

### Database (1 migration)
| Change | Detail |
|--------|--------|
| 8 new categories | `pos_config`, `financial`, `inventory_config`, `loyalty`, `b2b`, `kds_config`, `display`, `sync_advanced` |
| 65 settings rows | Across 10 categories (8 new + 2 existing: `security`, `printing`) |
| All `is_system: true` | Editable but not deletable, `value = default_value` on insert |

### Settings Breakdown
| Category | Count | Examples |
|----------|-------|---------|
| `pos_config` | 9 | Quick payment amounts, discount percentages, void/refund required roles |
| `financial` | 4 | Max payment amount, currency rounding unit, reference required methods |
| `inventory_config` | 13 | Stock thresholds, reorder lookback, production priority thresholds |
| `loyalty` | 5 | Tier discounts/thresholds/colors, points per IDR |
| `b2b` | 4 | Payment terms, aging buckets, overdue threshold |
| `kds_config` | 5 | Urgency thresholds, poll interval, auto-remove delay |
| `display` | 4 | Idle timeout, promo rotation, broadcast debounce |
| `security` | 4 | PIN min/max length, max attempts, cooldown |
| `sync_advanced` | 14 | Startup delay, retry backoff, cache TTL, LAN heartbeat/reconnect |
| `printing` | 3 | Server URL, request/health check timeouts |

### Frontend
| Category | Files |
|----------|-------|
| Types | `settingsModuleConfig.ts` (10 interfaces), `settings.ts` updated |
| Hooks (10) | `usePOSConfigSettings`, `useFinancialSettings`, `useInventoryConfigSettings`, `useLoyaltySettings`, `useB2BSettings`, `useKDSConfigSettings`, `useDisplaySettings`, `useSyncAdvancedSettings`, `useSecurityPinSettings`, `usePrintingServerSettings` |
| Routes | 8 new `CategorySettingsPage` routes in `App.tsx` |
| Navigation | 6 new Lucide icons in `SettingsLayout.tsx` (`Banknote`, `PackageSearch`, `Heart`, `Building`, `Monitor`, `RefreshCw`) |
| Tests | 20 tests (2 per hook: defaults + stored values) |

### Verification
- 93 test files, 1,650 tests pass
- TypeScript compiles cleanly
- ESLint: 0 errors, 122 warnings (unchanged)

## Epic 10 Phase 2: Custom Settings UI Pages (2026-02-12)

Replaces generic `CategorySettingsPage` with 9 specialized pages featuring rich editors.

### New Files (10 files, ~2,170 lines)
| File | Story | Lines | Features |
|------|-------|-------|----------|
| `ArrayAmountEditor.tsx` | Shared | 119 | Reusable add/remove/reorder list editor for IDR amounts and percentages |
| `POSConfigSettingsPage.tsx` | 10.3 | 173 | Quick payment amounts, shift presets, discount percentages, role multi-select |
| `FinancialSettingsPage.tsx` | 10.4 | 183 | Max payment (IDR), rounding unit select, reference required methods |
| `InventoryConfigSettingsPage.tsx` | 10.5 | 173 | Stock alert thresholds, analysis periods, supply parameters, query limits |
| `LoyaltySettingsPage.tsx` | 10.6 | 226 | Editable tier table, color inputs with badge preview, points conversion |
| `B2BSettingsPage.tsx` | 10.7 | 261 | Payment terms select, aging bucket editor with gap/overlap validation |
| `KDSConfigSettingsPage.tsx` | 10.8 | ~200 | Urgency thresholds, live KDS card preview (normal/warning/critical colors) |
| `DisplaySettingsPage.tsx` | 10.9 | ~200 | Customer display settings, print server config + test connection button |
| `SecurityPinSettingsPage.tsx` | 10.10 | 184 | PIN policy (min/max length, attempts, cooldown) with coherence validation |
| `SyncAdvancedSettingsPage.tsx` | 10.11 | ~250 | Warning banner, 3 presets (Stable/Unstable/Battery), 5 config sections |

### Route Changes
- `App.tsx`: 9 lazy imports added, 8 routes updated from generic `CategorySettingsPage` to custom pages, `security` route added

### Verification
- 0 new TypeScript errors (only pre-existing casing/mockProducts issues)
- 20 settings hooks tests pass
- All routes configured and functional

## Epic 10 Phase 3: Migrate Hardcoded Constants (2026-02-12)

Replaces ~40 hardcoded operational constants across 17 files with configurable settings from the settings store.

### Story 10.12 - POS Constants (6 files)
| File | Constants Migrated | Hook/Pattern |
|------|--------------------|-------------|
| `OpenShiftModal.tsx` | QUICK_AMOUNTS | `usePOSConfigSettings().shiftOpeningCashPresets` |
| `PaymentModal.tsx` | QUICK_AMOUNTS | `usePOSConfigSettings().quickPaymentAmounts` |
| `DiscountModal.tsx` | quickPercentages, max 100%, allowedRoles | `usePOSConfigSettings()` |
| `VoidModal.tsx` | allowedRoles `['manager','admin']` | `usePOSConfigSettings().voidRequiredRoles` |
| `RefundModal.tsx` | allowedRoles `['manager','admin']` | `usePOSConfigSettings().refundRequiredRoles` |
| `paymentService.ts` | MAX_PAYMENT_AMOUNT, IDR_ROUNDING, REFERENCE_REQUIRED_METHODS | `getFinancialConfig()` via `useCoreSettingsStore.getState()` |

### Story 10.13 - Inventory Constants (3 files)
| File | Constants Migrated | Hook/Pattern |
|------|--------------------|-------------|
| `StockByLocationPage.tsx` | threshold 10 | `useInventoryConfigSettings().stockWarningThreshold` |
| `InventoryTab.tsx` | thresholds 5/10 | `useInventoryConfigSettings().stockCriticalThreshold/stockWarningThreshold` |
| `inventoryAlerts.ts` | lookback 30d, multiplier 2x, production 7d, priority 20/50% | `useCoreSettingsStore.getState()` + `INVENTORY_CONFIG_DEFAULTS` |

### Story 10.14 - Loyalty/B2B Constants (2 files)
| File | Constants Migrated | Hook/Pattern |
|------|--------------------|-------------|
| `b2bPosOrderService.ts` | payment_terms 30 days | `useCoreSettingsStore.getState().getSetting('b2b.default_payment_terms_days')` |
| `constants/loyalty.ts` | Documented as fallback defaults | Comment added |

### Story 10.15 - KDS/Display/Sync/Security (6 files)
| File | Constants Migrated | Hook/Pattern |
|------|--------------------|-------------|
| `KDSOrderCard.tsx` | 300/600s thresholds, 5000ms autoRemove | `useKDSConfigSettings()` |
| `KDSMainPage.tsx` | poll interval, urgent threshold | `useKDSConfigSettings()` |
| `CustomerDisplayPage.tsx` | idle timeout, promo rotation | `useDisplaySettings()` |
| `printService.ts` | localhost:3001, 5000ms/2000ms timeouts | `getPrintConfig()` via `useCoreSettingsStore.getState()` |
| `rateLimitService.ts` | MAX_ATTEMPTS=3, COOLDOWN=15min | `getSecurityConfig()` via `useCoreSettingsStore.getState()` |
| `PrintingSettingsPage.tsx` | Test connection integration | Updated |

### Pattern Used
- **React components**: Typed hooks (`usePOSConfigSettings()`, `useKDSConfigSettings()`, etc.)
- **Non-React services**: `useCoreSettingsStore.getState().getSetting<T>('key') ?? DEFAULT_VALUE`
- **Tax rates**: Intentionally NOT migrated (10% PPN is business-critical/legal, kept as constants)

### Verification
- 0 new TypeScript errors
- 93 test files, 1,650 tests pass
- 17 files changed, +168/-84 lines

## CSS to Tailwind Migration (2026-02-12) -- PARTIALLY COMPLETE

Migrated majority of standalone CSS files to Tailwind utility classes. Migration is **partially complete** -- 18 CSS files remain with 19 active imports in TSX files.

### Scope
- **55 CSS files deleted** out of ~79 standalone CSS files (~18,000 lines removed)
- **18 CSS files remain** requiring further migration
- **19 active CSS imports** in TSX files (18 local + 1 external `react-day-picker/dist/style.css`)
- **86 TSX files updated** with inline Tailwind classes
- **tailwind.config.js** extended with custom utilities (animations, colors, component patterns)
- **Net change**: -18,125 lines (22,569 deleted, 4,444 added)

### Remaining CSS Files
- `src/styles/index.css` (global styles, likely permanent)
- `src/pages/pos/POSMainPage.css`
- `src/pages/settings/SettingsPage.css`, `LanMonitoringPage.css`
- `src/pages/inventory/` -- `IncomingStockPage.css`, `WastedPage.css`, `StockMovementsPage.css`, `TransferDetailPage.css`, `StockProductionPage.css`, `tabs/ModifiersTab.css`
- `src/pages/products/` -- `ComboFormPage.css`, `CombosPage.css`, `ProductCategoryPricingPage.css`, `ProductsPage.css`
- `src/pages/purchasing/PurchaseOrderDetailPage.css`
- `src/components/pos/modals/` -- `CashierAnalyticsModal.css`, `PaymentModal.css`
- `src/components/settings/FloorPlanEditor.css`

### Modules Covered
POS (menu, grids, modals, shift), KDS, inventory, B2B, customers, orders, purchasing, mobile, reports, auth/login, settings, layouts, and display.

### Custom Tailwind Extensions
- Animations: `fade-in`, `slide-up`, `shimmer`, `countdown`, `pulse-urgent`, `bounce-in`
- Colors: `bakery-*` (amber/warm palette), `kds-*`, `pos-*`, semantic status colors
- Utilities: `scrollbar-hide`, `line-clamp-*`, `text-shadow-*`

## Security Audit Cycle 3: RLS Policy Always True (2026-02-12)

Fixed 156 "RLS Policy Always True" warnings reported by Supabase security advisors across 47 tables.

### Problem
INSERT/UPDATE/DELETE policies used `USING (true)` or `WITH CHECK (true)`, allowing any request (including unauthenticated via anon key) to write. Additionally, 8 tables had duplicate policies for the same operation.

### Migration (`20260212180000_fix_rls_always_true.sql`)

**Part 1 -- Drop 20 duplicate policies** on 8 tables:
| Table | Duplicates Dropped |
|-------|--------------------|
| `kds_order_queue`, `lan_messages`, `lan_nodes`, `sync_conflicts`, `sync_devices`, `sync_queue` | 3 each (INSERT/UPDATE/DELETE) |
| `settings_history` | 1 (INSERT) |
| `user_sessions` | 1 (INSERT) |

**Part 2 -- Tighten 136 remaining policies** by replacing `true` with `(auth.uid() IS NOT NULL)`:
| Policy Type | Count | ALTER Clause |
|-------------|-------|-------------|
| DELETE | 44 | `USING (auth.uid() IS NOT NULL)` |
| INSERT | 47 | `WITH CHECK (auth.uid() IS NOT NULL)` |
| UPDATE (both qual+check) | 37 | `USING (...) WITH CHECK (...)` |
| UPDATE (qual only) | 8 | `USING (...)` |

### Result
- Supabase security advisors: **156 to 0** "RLS Policy Always True" warnings
- Only remaining warning: `auth_leaked_password_protection` (Auth config, not RLS)
- No test regressions: 93 files, 1,650 tests pass

## Phase 0: Stitch Gap Analysis (2026-02-15)

Comprehensive gap analysis of 67 Stitch HTML designs against the existing codebase. Identified RED/YELLOW/GREEN gaps across 15 modules.

- **Tracking document**: `docs/phase0/stitch-pages-inventory.md`
- **Gap analysis**: `docs/phase0/gap-analysis.md`
- **Backend plan**: `docs/phase0/backend-creation-plan.md`

## Phase 1: Backend Execution (2026-02-15)

13 migrations applied to Supabase to fill database gaps identified in Phase 0.

### New Tables
| Table | Purpose |
|-------|---------|
| `product_price_history` | Price change audit trail (D3/O1) |
| `vat_filings` | VAT filing records with status tracking (H7) |
| `business_holidays` | Holiday calendar for business hours (K7) |
| `notification_events` | Notification event definitions (L1) |
| `notification_preferences` | Per-user notification preferences (L1) |
| `po_activity_log` | Purchase order activity timeline (I4) |

### Column Additions
| Table | Column(s) | Purpose |
|-------|-----------|---------|
| `orders` | `service_charge`, `guest_count` | Service charge tracking (C3), guest count (B3) |
| `journal_entries` | `attachment_url` | Journal entry file attachments (H3) |
| `user_profiles` | `title`, `default_module`, `mfa_enabled` | User admin features (M2/M3) |
| `suppliers` | `category` | Supplier classification (I1) |

### Other Changes
- Schema verification fixes (missing columns, constraints)
- Permissions seed (new permission codes)
- Enhanced views (`view_daily_kpis` with completion rate, `view_stock_alerts` with section stock)
- 65+ settings rows across 10 categories (POS, KDS, inventory, security, sync, etc.)
- Security definer views + search path fixes

## Phase 2: Frontend-Driven Assembly (2026-02-15)

Page-by-page assembly connecting Stitch HTML designs to functional React components. Resolved 41 out of 46 RED gaps.

### Summary
- **RED gaps resolved**: 41/46 (89%)
- **Remaining**: 5 RED gaps deferred (require significant infrastructure: B2B delivery maps, staff hours tracking, vendor email notifications, concurrent sessions, local DB encryption)
- **New files created**: ~20 (components, hooks, services, pages)
- **Files modified**: ~40 (connecting existing components to new data/features)

### Key Deliverables
| Category | Items |
|----------|-------|
| **Auth** | Password reset page (`/login/reset`) |
| **Orders** | Completion rate KPI, voided row styling |
| **Products** | Price history tracking, product performance card (conversion rate) |
| **Customers** | CSV import service + UI |
| **Accounting** | Journal attachments (file upload), VAT PDF export |
| **Purchasing** | Supplier category display, PO activity log |
| **Settings** | Peak pricing UI, business holidays, notification preferences |
| **B2B** | Batch PDF statements per customer |
| **System** | System health cards (latency, storage, service worker) |
| **Visual** | TrendBadge, StockStatusBadge, various UI enhancements |

### Production Build
- Build time: 15.16s
- Precache entries: 171
- Index bundle: 430kB

## Phase 3: Luxe Dark Design System (2026-02-15)

Applied the Luxe Dark design system across all modules (waves 7A-8D). Standardized visual language:
- **Artisan Gold** (#C9A55C) for primary accents, CTAs, and active states
- **Deep Onyx** (#0D0D0F) background with surface hierarchy via `var(--onyx-surface)`
- Consistent spacing, rounded corners (xl), border-white/5 dividers
- All modules updated: POS, KDS, inventory, B2B, customers, orders, purchasing, reports, settings, accounting

## Phase 4: Yellow Gap Resolution (2026-02-15)

Resolved all remaining YELLOW gaps from the Stitch gap analysis.

### Batch 1: 18 BACKEND_ONLY Gaps (313eb8b)
Connected backend features (already in DB) to frontend UI across products, inventory, purchasing, customers, and settings modules.

### Batch 2: 19 TODO Gaps (90d9205)
| Gap | Feature | Files Changed |
|-----|---------|---------------|
| H3 | Journal entry memo field | `accounting.ts`, `useJournalEntries.ts`, `JournalEntryForm.tsx` |
| L3 | Sync queue throughput metric | `SystemHealthCards.tsx` |
| N3 | Top waste reason KPI | `WastedPage.tsx` |
| N1 | Daily sales trend badges | `DailySalesTab.tsx` |
| N2 | Unique customers count | `OverviewTab.tsx`, `ReportingService.ts` |

### Batch 3: 3 Complex Gaps (5da3c67)
| Gap | Feature | Implementation |
|-----|---------|---------------|
| H7 | VAT category breakdown | New SQL function `get_vat_by_category` + table in `VATManagementPage.tsx` |
| H5 | Waste cost in P&L | `ProfitLossTab.tsx` queries `stock_movements` for waste, shows % of revenue |
| B1/B2 | Notification bell | New `NotificationBell.tsx` component (low stock + overdue B2B) in `BackOfficeLayout.tsx` |

### Build Fixes (e3782dd)
- Fixed `SecurityPinSettingsPage.tsx` premature `</div>` syntax error
- Propagated `track_inventory` field to all `IOfflineProduct` usages (16 files)
- Added missing `tierDescriptions` to `useLoyaltySettings` hook
- Fixed unused variable in `pdfExportService.ts`

### Database Migrations (Phase 4)
| Migration | Purpose |
|-----------|---------|
| `add_journal_entry_memo` | `journal_entries.memo` TEXT column |
| `add_vat_by_category_function` | `get_vat_by_category(year, month)` RPC |

### Production Build
- Build time: 15.46s
- Precache entries: 174
- Index bundle: 435kB
- **0 TypeScript errors**, build passes cleanly

## Known Issues

- `StockAlerts.test.tsx > StaleDataWarning > renders nothing when data is fresh` is flaky (timing issue in full suite, passes alone)
- `useLanClient.test.ts > should handle localStorage not available` is flaky (pre-existing)
- ExpensesTab disabled (feature flag false, `expenses` table does not exist)
