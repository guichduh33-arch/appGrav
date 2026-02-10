# Current State

Last updated: 2026-02-10

## Sprint Status

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 0 | Core System - Auth, Permissions, Config (Epic 1) | **Complete** |
| Sprint 1 | Catalogue & Costing (Epic 2), POS & Sales (Epic 3), KDS (Epic 4) | **Complete** |
| Sprint 2 | Stock & Purchasing (Epic 5), Clients & Marketing (Epic 6) | **Complete** |
| Sprint 3 | Multi-Device (Epic 7) - Customer Display, Mobile, Print Server, LAN Hub | **Complete** |
| Sprint 4 | Security hardening, DB fixes, Report foundation (Epic 8 partial) | **Complete** |
| Sprint 5 | Analytics & Reports (Epic 8 complete), French→English migration | **Complete** |

## Epics Overview

- **Epic 1** (Core System): Done - Offline auth, PIN cache, permissions, settings UI, printer config, audit log
- **Epic 2** (Catalogue): Done - Products/categories/modifiers/recipes offline cache
- **Epic 3** (POS & Sales): Done - Full POS revision with split payments, voids, refunds, EDC, print integration
- **Epic 4** (KDS): Done - LAN-based kitchen display with order dispatch and status updates
- **Epic 5** (Stock): Done - Stock levels, alerts, adjustments, transfers, purchase orders, sale deduction triggers
- **Epic 6** (Clients & Marketing): Done - Customer pricing, loyalty display, promotions engine, combos, B2B orders/payments
- **Epic 7** (Multi-Device): Done - Customer display, mobile app (Capacitor), print server, LAN monitoring
- **Epic 8** (Analytics): Done - All 10 stories (8.0-8.9) complete: report framework, 27 report tabs, period comparison, offline cache, audit trail, alerts dashboard
- **Epic 9** (Accounting): Ready for dev - Chart of accounts, journals, general ledger, financial statements, VAT

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

- **84 test files**, approximately **1,560 tests**
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

## Known Issues

- `StockAlerts.test.tsx > StaleDataWarning > renders nothing when data is fresh` is flaky (timing issue in full suite, passes alone)
- Epic 9 (Accounting) not yet started
- ExpensesTab disabled (feature flag false, `expenses` table does not exist)
- Pre-existing TS errors in `authService.ts` (unused `requestingUserId` vars) and `authStore.ts` (type mismatch)
