# Stitch Pages Inventory -- Phase 0

> Generated: 2026-02-15 | Updated: 2026-02-15 (Phase 2 complete) | Project: AppGrav (The Breakery) | Supabase: `ekkrzngauxqruvhhstjw`

## Overview

- **Total Stitch directories**: 71 (includes 5 duplicate pairs with `___` vs `_` naming)
- **Unique pages**: 67 (66 from `Stitch_page/` + 1 POS Terminal from `queue/`)
- **Design system**: Luxe Dark (Artisan Gold #C9A55C, Deep Onyx #0D0D0F)
- **Fonts**: Inter (body) + Playfair Display (display/serif)
- **Format**: TSX files wrapping full HTML via `dangerouslySetInnerHTML` -- NOT real React components

## Duplicate Directories (5 pairs -- use `___` version as canonical)

| Canonical (with `___`) | Duplicate (without) |
|------------------------|---------------------|
| `AR___Aging_Management` | `AR_Aging_Management` |
| `Audit_Trail___Logs` | `Audit_Trail_Logs` |
| `Production___Batching_Logs` | `Production_Batching_Logs` |
| `Security___PIN_Settings` | `Security_PIN_Settings` |
| `System_Health___Sync_Monitor` | `System_Health_Sync_Monitor` |

---

## Module A: Authentication & Onboarding (4 pages)

### A1. Login Screen
- **File**: `Stitch_page/Login_Screen/Login_Screen.tsx`
- **Route**: `/login`
- **Module**: auth
- **Data sources**: Supabase Auth
- **Key features**: Email/password, remember me, forgot password link, offline PIN link, version display
- **Gap status**: ALL GREEN -- fully covered

### A2. Offline PIN Login
- **File**: `Stitch_page/Offline_PIN_Login/Offline_PIN_Login.tsx`
- **Route**: `/login/pin`
- **Module**: auth/offline
- **Data sources**: Dexie `offlineUsers`, `offlineAuthService`, `rateLimitService`
- **Key features**: PIN pad, cached user greeting, rate limiting (3/15min), switch to email
- **Gap status**: ALL GREEN -- fully covered

### A3. Password Reset Request
- **File**: `Stitch_page/Password_Reset_Request/Password_Reset_Request.tsx`
- **Route**: `/login/reset`
- **Module**: auth
- **Data sources**: Supabase Auth `resetPasswordForEmail`
- **Key features**: Email input, success state with masked email, resend, open email app
- **Gap status**: ALL GREEN -- fully covered
- **Phase 2**: Page created (`src/pages/auth/PasswordResetPage.tsx`), route added, "Forgot password?" link on LoginPage

### A4. Mobile Login
- **File**: `Stitch_page/Mobile_Login/Mobile_Login.tsx`
- **Route**: `/mobile/login`
- **Module**: mobile/auth
- **Data sources**: Supabase Auth, Capacitor
- **Key features**: Mobile-optimized login, PIN access link, safe area
- **Gap status**: ALL GREEN -- fully covered

---

## Module B: Mobile Experience (4 pages)

### B1. Staff Home Mobile
- **File**: `Stitch_page/Staff_Home_Mobile/Staff_Home_Mobile.tsx`
- **Route**: `/mobile/home`
- **Module**: mobile
- **Data sources**: `user_profiles`, `view_daily_kpis`, `orders`, `cartStore`
- **Key features**: Time-based greeting, quick actions (New Order, Stock Check, Today's Sales, My Orders), today's snapshot KPIs, recent orders, bottom nav
- **Realtime**: Yes (live order count/revenue)
- **Gap status**: 2 YELLOW -- notification unread tracking, "Sent" order status mapping

### B2. Mobile Catalog
- **File**: `Stitch_page/Mobile_Catalog/Mobile_Catalog.tsx`
- **Route**: `/mobile/catalog`
- **Module**: mobile/products
- **Data sources**: `products`, `categories`, `view_stock_alerts`, `cartStore`
- **Key features**: Product grid, category scroll, stock badges, search, floating cart button
- **Gap status**: 1 YELLOW -- notification bell (same as B1)

### B3. Mobile Checkout
- **File**: `Stitch_page/Mobile_Checkout/Mobile_Checkout.tsx`
- **Route**: `/mobile/checkout`
- **Module**: mobile/pos
- **Data sources**: `cartStore`, `orders`, `order_items`, `customers`, `product_modifiers`
- **Key features**: Cart items with qty controls, swipe-to-delete, order type selector, table/guest count, customer search, discount, tax & service, place order
- **Gap status**: ~~1 RED~~ RESOLVED (`guest_count` added to cartStore + offline order service), 1 YELLOW (service charge separate from tax)

### B4. Mobile Orders History
- **File**: `Stitch_page/Mobile_Orders_History/Mobile_Orders_History.tsx`
- **Route**: `/mobile/orders`
- **Module**: mobile/orders
- **Data sources**: `orders`
- **Key features**: Order list with status badges, date filter pills, pull-to-refresh
- **Realtime**: Yes (live order status)
- **Gap status**: ALL GREEN

---

## Module C: POS & Order Management (5 pages)

### C1. POS Terminal (CRITICAL)
- **File**: `queue/pos-terminal.html`
- **Route**: `/pos`
- **Module**: pos
- **Data sources**: `products`, `categories`, `cartStore`, `orders`, `order_items`, `product_modifiers`, `promotions`, `paymentService`, `printService`
- **Key features**: 3-column layout (category nav | product grid | active order), search, modifiers, subtotal/tax/total, receipt/promo/checkout buttons
- **Realtime**: Yes (product availability)
- **Gap status**: 1 YELLOW (tax rate 8.5% in design vs 10% business rule)

### C2. Order Management Dashboard
- **File**: `Stitch_page/Order_Management_Dashboard/Order_Management_Dashboard.tsx`
- **Route**: `/orders`
- **Module**: orders
- **Data sources**: `orders`, `order_items`, `view_daily_kpis`
- **Key features**: 5 KPIs (orders, revenue, completion rate, paid, unpaid), order table with filters/search, status tabs, export CSV, pagination
- **Realtime**: Yes (live order status)
- **Gap status**: ~~1 RED~~ RESOLVED (completion rate KPI added), ~~1 YELLOW~~ RESOLVED (voided row styling), 1 YELLOW (period comparison)

### C3. Order Detail View
- **File**: `Stitch_page/Order_Detail_View/Order_Detail_View.tsx`
- **Route**: `/orders/:id`
- **Module**: orders
- **Data sources**: `orders`, `order_items`, `products`, `customers`, `kds_order_queue`, `printService`, `voidService`, `refundService`
- **Key features**: Full order details, items with modifiers, subtotal/discount/service charge/tax/total, payment info, customer info, loyalty points, KDS status, print/refund/void buttons
- **Gap status**: ~~1 RED~~ RESOLVED -- `service_charge` + `service_charge_type` added (Phase 1 migration + Phase 2 page integration)

### C4. Void Confirmation Modal
- **File**: `Stitch_page/Void_Confirmation_Modal/Void_Confirmation_Modal.tsx`
- **Route**: Modal overlay
- **Module**: orders/financial
- **Data sources**: `orders`, `voidService`, `offlineAuthService`, `audit_logs`
- **Key features**: Order summary, void reason dropdown, additional notes, manager PIN (6-digit), attempt tracking, audit trail
- **Gap status**: 2 YELLOW (structured void reason codes, separate void notes)

### C5. Session Cash & Shift Report
- **File**: `Stitch_page/Session_Cash___Shift_Report/Session_Cash___Shift_Report.tsx`
- **Route**: `/sessions`
- **Module**: pos/sessions
- **Data sources**: `pos_sessions`, `view_session_summary`, `user_profiles`
- **Key features**: Shift list, variance badges, cash variance trend chart, denomination breakdown, reconciliation, RE-COUNT, APPROVE SESSION
- **Gap status**: 1 YELLOW (RE-COUNT workflow -- no `recounting` session status)

---

## Module D: Products & Combos (9 pages)

### D1. Product Catalog Management
- **File**: `Stitch_page/Product_Catalog_Management/Product_Catalog_Management.tsx`
- **Route**: `/products`
- **Module**: products
- **Data sources**: `products`, `categories`, `view_stock_alerts`
- **Key features**: KPIs, product grid/list, search, category/type/stock filters, edit/duplicate hover buttons, pagination
- **Gap status**: 2 YELLOW (product type filter mapping, cost_price population)

### D2. Product Creator
- **File**: `Stitch_page/Product_Creator/Product_Creator.tsx`
- **Route**: `/products/new`
- **Module**: products
- **Data sources**: `products`, `categories`, `product_uoms`, `recipes`
- **Key features**: Name, SKU auto-gen, category, prices, recipe/BOM builder, display rules, live POS preview, save draft/publish
- **Gap status**: 2 YELLOW (SKU auto-generation, track_inventory boolean)

### D3. Product Details & Insights
- **File**: `Stitch_page/Product_Details___Insights/Product_Details___Insights.tsx`
- **Route**: `/products/:id`
- **Module**: products
- **Data sources**: `products`, `categories`, `recipes`, `suppliers`, `stock_movements`, `view_product_sales`
- **Key features**: Full product detail, pricing table (retail/wholesale/cost), recipe & ingredients, stock status, performance sparkline, recent movements, price history
- **Gap status**: ~~1 RED~~ RESOLVED (`product_price_history` table + hook + PricesTab integration), ~~1 RED~~ RESOLVED (conversion rate via `useProductPerformance` hook + `ProductPerformanceCard` on GeneralTab), 2 YELLOW (recipe-supplier link, products.delete permission)

### D4. Combo Creator
- **File**: `Stitch_page/Combo_Creator/Combo_Creator.tsx`
- **Route**: `/products/combos/new`
- **Module**: products/combos
- **Data sources**: `product_combos`, `product_combo_groups`, `product_combo_group_items`
- **Key features**: Name, description, base price, savings %, choice groups with min/max, live POS preview
- **Gap status**: ALL GREEN

### D5. Combo Management
- **File**: `Stitch_page/Combo_Management/Combo_Management.tsx`
- **Route**: `/products/combos`
- **Module**: products/combos
- **Data sources**: `product_combos`, `product_combo_groups`, `product_combo_group_items`, `order_items`
- **Key features**: Combo cards with stats, availability schedule, edit modal with drag-reorder, archive
- **Gap status**: 2 YELLOW (time-based availability fields, sort_order column)

### D6. Promotions Management
- **File**: `Stitch_page/Promotions_Management/Promotions_Management.tsx`
- **Route**: `/products/promotions`
- **Module**: products/promotions
- **Data sources**: `promotions`, `promotion_products`, `promotion_usage`
- **Key features**: Promotion cards, status badges, usage progress, time ranges, day-of-week, new promotion modal
- **Gap status**: 3 YELLOW (hourly scheduling, day-of-week fields, promotion permission codes)

### D7. Promotions List & Editor
- **File**: `Stitch_page/Promotions_List___Editor/Promotions_List___Editor.tsx`
- **Route**: `/products/promotions` (alternate view)
- **Module**: products/promotions
- **Data sources**: `promotions`, `promotion_products`, `promotion_usage`
- **Key features**: KPIs (active count, redemption rate, total savings), edit modal with time/day scheduling, per-customer usage limit
- **Gap status**: 4 YELLOW (hourly scheduling, day-of-week, redemption rate view, max_uses_per_customer)

### D8. Pricing Matrix
- **File**: `Stitch_page/Pricing_Matrix/Pricing_Matrix.tsx`
- **Route**: `/products/pricing`
- **Module**: products/pricing
- **Data sources**: `products`, `customer_categories`, `product_category_prices`
- **Key features**: Matrix grid (products x categories), auto-calculated vs manual override, bulk discount, export, save all
- **Gap status**: ALL GREEN

### D9. Category Management (Customer Categories)
- **File**: `Stitch_page/Category_Management/Category_Management.tsx`
- **Route**: `/customers/categories`
- **Module**: customers/categories
- **Data sources**: `customer_categories`, `customers`
- **Key features**: Category cards, CRUD, price modifier types
- **Gap status**: ALL GREEN

---

## Module E: Inventory & Stock (8 pages)

### E1. Stock & Inventory Overview
- **File**: `Stitch_page/Stock___Inventory_Overview/Stock___Inventory_Overview.tsx`
- **Route**: `/inventory`
- **Module**: inventory
- **Data sources**: `products`, `view_stock_alerts`, `stock_movements`, `product_uoms`
- **Key features**: Alert cards, inventory table with progress bars, quick stock adjust modal, add new item, export CSV
- **Gap status**: ALL GREEN

### E2. Stock Movements & Transfers
- **File**: `Stitch_page/Stock_Movements___Transfers/Stock_Movements___Transfers.tsx`
- **Route**: `/inventory/movements`
- **Module**: inventory/movements
- **Data sources**: `stock_movements`, `internal_transfers`, `transfer_items`, `stock_locations`
- **Key features**: Movement table, type/direction filters, date range, internal transfer form, tabs (Movements/Transfers/By Location)
- **Gap status**: ALL GREEN

### E3. Stock Opname Count
- **File**: `Stitch_page/Stock_Opname_Count/Stock_Opname_Count.tsx`
- **Route**: `/inventory/opname`
- **Module**: inventory/opname
- **Data sources**: `inventory_counts`, `inventory_count_items`, `products`
- **Key features**: Session list, count table with variance, category filter tabs, manager PIN approval, save draft/finalize
- **Gap status**: ALL GREEN

### E4. Stock Opname Form
- **File**: `Stitch_page/Stock_Opname_Form/Stock_Opname_Form.tsx`
- **Route**: `/inventory/opname/:id`
- **Module**: inventory/opname
- **Data sources**: `inventory_count_items`, `products`
- **Key features**: Entry table with reason codes, discrepancy summary, high-discrepancy items, pause/export/finalize
- **Gap status**: 2 YELLOW (reason column on inventory_count_items, location on inventory_counts)

### E5. Incoming Stock / Goods Receipt
- **File**: `Stitch_page/Incoming_Stock___Goods_Receipt/Incoming_Stock___Goods_Receipt.tsx`
- **Route**: `/inventory/incoming`
- **Module**: inventory/purchasing
- **Data sources**: `purchase_orders`, `purchase_order_items`, `suppliers`, `stock_movements`
- **Key features**: KPIs, PO table, expanded receipt form with QC check, confirm receipt
- **Gap status**: 1 YELLOW (QC check field on PO items)

### E6. Internal Stock Transfers
- **File**: `Stitch_page/Internal_Stock_Transfers/Internal_Stock_Transfers.tsx`
- **Route**: `/inventory/transfers`
- **Module**: inventory/transfers
- **Data sources**: `internal_transfers`, `transfer_items`, `stock_locations`, `production_records`
- **Key features**: KPIs, transfer history, new transfer sidebar, production batch selector
- **Gap status**: 2 YELLOW (transfer loss tracking, batch linkage to transfers)

### E7. Production & Batching Logs
- **File**: `Stitch_page/Production___Batching_Logs/Production___Batching_Logs.tsx`
- **Route**: `/inventory/production`
- **Module**: inventory/production
- **Data sources**: `production_records`, `recipes`, `products`, `view_production_summary`
- **Key features**: Ongoing batch cards, start new batch, daily yield chart, recipe requirements, baker's note
- **Gap status**: 2 YELLOW (production batch status lifecycle granularity, batch-specific quantity adjustments)

### E8. Waste & Spoilage Log
- **File**: `Stitch_page/Waste___Spoilage_Log/Waste___Spoilage_Log.tsx`
- **Route**: `/inventory/waste`
- **Module**: inventory/waste
- **Data sources**: `stock_movements` (type=waste), `products`
- **Key features**: KPIs (today/month waste, waste rate), waste log table, reason badges, log waste modal with photo evidence
- **Gap status**: 3 YELLOW (waste reason enum values, waste photo_url, waste rate view)

---

## Module F: Customers & Loyalty (3 pages)

### F1. Customer Management CRM
- **File**: `Stitch_page/Customer_Management_CRM/Customer_Management_CRM.tsx`
- **Route**: `/customers`
- **Module**: customers
- **Data sources**: `customers`, `customer_categories`, `loyalty_tiers`, `orders`
- **Key features**: Customer table, search, category/tier/status filters, add customer modal, CSV import
- **Gap status**: ~~1 RED~~ RESOLVED (CSV import service created + Import button in CustomersHeader)

### F2. Customer Detail & CRM
- **File**: `Stitch_page/Customer_Detail___CRM/Customer_Detail___CRM.tsx`
- **Route**: `/customers/:id`
- **Module**: customers
- **Data sources**: `customers`, `orders`, `order_items`, `loyalty_transactions`, `customer_categories`
- **Key features**: Profile card, lifetime stats, order history, favorite items, loyalty transaction log, notes
- **Gap status**: 1 YELLOW (per-customer product pricing, favorite items aggregation)

### F3. Loyalty Tiers Config
- **File**: `Stitch_page/Loyalty_Tiers_Config/Loyalty_Tiers_Config.tsx`
- **Route**: `/settings/loyalty`
- **Module**: settings/loyalty
- **Data sources**: `loyalty_tiers`, `customers`, `settings`
- **Key features**: Tier config table, earning rate, program status toggle, distribution chart, live card preview
- **Gap status**: 3 YELLOW (points earning rate setting, program enabled setting, tier description field)

---

## Module G: B2B & Wholesale (2 pages)

### G1. Wholesale Management Overview
- **File**: `Stitch_page/Wholesale_Management_Overview/Wholesale_Management_Overview.tsx`
- **Route**: `/b2b`
- **Module**: b2b
- **Data sources**: `customers`, `b2b_orders`, `b2b_deliveries`, `purchase_orders`, `production_records`
- **Key features**: KPIs, top wholesale clients, B2B sales trend, recent deliveries, create order/generate statement/CRM buttons
- **Gap status**: 3 RED (delivery map, route performance, statement generation), 4 YELLOW (overdue computation, contract_type, delivery route/ETD, production queue)

### G2. Advanced B2B Order Form
- **File**: `Stitch_page/Advanced_B2B_Order_Form/Advanced_B2B_Order_Form.tsx`
- **Route**: `/b2b/orders/new`
- **Module**: b2b
- **Data sources**: `customers`, `b2b_orders`, `b2b_order_items`, `products`, `b2b_price_lists`
- **Key features**: Client search, route selection, order items table, delivery date, multi-step form (items, customization, discounts, payment terms), save draft
- **Gap status**: 2 RED (delivery zones/routes, delivery fee), 1 YELLOW (ETA)

---

## Module H: Accounting & Finance (7 pages)

### H1. Chart of Accounts
- **File**: `Stitch_page/Chart_of_Accounts/Chart_of_Accounts.tsx`
- **Route**: `/accounting/accounts`
- **Module**: accounting
- **Data sources**: `accounts`, `get_account_balance()`, `get_balance_sheet_data()`
- **Key features**: Hierarchical tree, search, new account, balance summary
- **Gap status**: ALL GREEN

### H2. General Ledger View
- **File**: `Stitch_page/General_Ledger_View/General_Ledger_View.tsx`
- **Route**: `/accounting/ledger`
- **Module**: accounting
- **Data sources**: `accounts`, `journal_entries`, `journal_entry_lines`
- **Key features**: Account selector, date range, ledger table with running balance, totals
- **Gap status**: 1 YELLOW (no `is_auto`/method flag on journal_entries)

### H3. New Journal Entry
- **File**: `Stitch_page/New_Journal_Entry/New_Journal_Entry.tsx`
- **Route**: `/accounting/journal/new`
- **Module**: accounting
- **Data sources**: `journal_entries`, `journal_entry_lines`, `accounts`
- **Key features**: Auto reference ID, date, description, lines table, balance check, save draft/post
- **Gap status**: ~~1 RED~~ RESOLVED (journal entry attachments: file upload UI + Supabase Storage + `attachment_url` column), 1 YELLOW (internal memo field)

### H4. Manager Financial Dashboard
- **File**: `Stitch_page/Manager_Financial_Dashboard/Manager_Financial_Dashboard.tsx`
- **Route**: `/accounting/dashboard`
- **Module**: accounting/reports
- **Data sources**: `view_daily_kpis`, `get_income_statement_data()`, `view_hourly_sales`, `view_payment_method_stats`, `view_staff_performance`, `view_stock_alerts`
- **Key features**: KPIs (revenue, net profit, COGS, customers, staff hours), revenue vs COGS chart, hourly heatmap, payment mix, staff performance, alerts
- **Gap status**: 1 RED (staff hours tracking), 2 YELLOW (staff rating, PPN filing alert)

### H5. Profit & Loss Statement
- **File**: `Stitch_page/Profit___Loss_Statement/Profit___Loss_Statement.tsx`
- **Route**: `/accounting/pnl`
- **Module**: accounting
- **Data sources**: `get_income_statement_data()`
- **Key features**: P&L by account, period comparison, variance %, performance snapshot, expense distribution
- **Gap status**: 2 YELLOW (waste % aggregation, PDF export)

### H6. Tax & Financial Settings
- **File**: `Stitch_page/Tax___Financial_Settings/Tax___Financial_Settings.tsx`
- **Route**: `/settings/tax`
- **Module**: settings/tax
- **Data sources**: `tax_rates`, `settings`, `fiscal_periods`
- **Key features**: Tax name/rate/method, show on receipts toggle, currency, fiscal year, cash rounding
- **Gap status**: 3 YELLOW (show_tax_on_receipt setting, rounding_amount, rounding_method)

### H7. PPN Tax Management
- **File**: `Stitch_page/PPN_Tax_Management/PPN_Tax_Management.tsx`
- **Route**: `/accounting/vat`
- **Module**: accounting/vat
- **Data sources**: `calculate_vat_payable()`, `journal_entries`, `journal_entry_lines`
- **Key features**: Year/month selector, VAT collected/deductible/payable KPIs, breakdown table, filing status, export DJP/PDF
- **Gap status**: ~~2 RED~~ RESOLVED (`vat_filings` table + filing status UI + mark as filed modal), ~~1 RED~~ RESOLVED (Export PDF button using `pdfExport` service), 2 YELLOW (VAT category breakdown)

---

## Module I: Purchasing & Suppliers (4 pages)

### I1. Supplier Management
- **File**: `Stitch_page/Supplier_Management/Supplier_Management.tsx`
- **Route**: `/purchasing/suppliers`
- **Module**: purchasing
- **Data sources**: `suppliers`, `purchase_orders`
- **Key features**: Supplier cards, search, new supplier slide panel, contact/address/tax ID/payment terms/bank details
- **Gap status**: ~~1 RED~~ RESOLVED (supplier `category` column already in DB, exposed in SupplierCard badge + SupplierFormModal dropdown), 1 YELLOW (bank_account_holder)

### I2. New Purchase Order Form
- **File**: `Stitch_page/New_Purchase_Order_Form/New_Purchase_Order_Form.tsx`
- **Route**: `/purchasing/orders/new`
- **Module**: purchasing
- **Data sources**: `purchase_orders`, `purchase_order_items`, `products`, `suppliers`, `sequence_tracker`
- **Key features**: Auto PO reference, supplier search, order items table, subtotal/PPN/grand total, delivery instructions, save draft/send
- **Gap status**: 1 RED (vendor email notification), 2 YELLOW (products.sku, auto-approval threshold)

### I3. Purchase Orders List
- **File**: `Stitch_page/Purchase_Orders_List/Purchase_Orders_List.tsx`
- **Route**: `/purchasing/orders`
- **Module**: purchasing
- **Data sources**: `purchase_orders`, `purchase_order_items`, `suppliers`
- **Key features**: KPIs, PO table, search, filter by supplier/status/date, new PO button, pagination
- **Gap status**: ALL GREEN

### I4. Purchase Order Details
- **File**: `Stitch_page/Purchase_Order_Details/Purchase_Order_Details.tsx`
- **Route**: `/purchasing/orders/:id`
- **Module**: purchasing
- **Data sources**: `purchase_orders`, `purchase_order_items`, `suppliers`, `audit_logs`
- **Key features**: PO header, supplier info, items with receive status, totals, edit/print/cancel/receive, PO timeline
- **Gap status**: ~~1 RED~~ RESOLVED (`po_activity_log` table + hook + Activity Log section), 2 YELLOW (shipping_cost, warehouse_location link)

---

## Module J: AR & Aging (1 page)

### J1. AR & Aging Management
- **File**: `Stitch_page/AR___Aging_Management/AR___Aging_Management.tsx`
- **Route**: `/accounting/ar`
- **Module**: accounting/ar
- **Data sources**: `b2b_orders`, `b2b_payments`, `customers`
- **Key features**: Aging buckets, unpaid invoices table, apply payment modal, export aging report, batch statements
- **Gap status**: ~~2 RED~~ RESOLVED (FIFO payment allocation already implemented + batch PDF statements via `handleBatchStatements`), 2 YELLOW (aging view, days_overdue computation)

---

## Module K: Settings & Configuration (11 pages)

### K1. Main Dashboard
- **File**: `Stitch_page/Main_Dashboard/Main_Dashboard.tsx`
- **Route**: `/`
- **Module**: dashboard
- **Data sources**: `view_daily_kpis`, `orders`, `view_stock_alerts`, `view_staff_performance`
- **Key features**: Revenue/orders/avg ticket/items sold KPIs, hourly sales chart, top products, category breakdown, recent orders, alerts
- **Realtime**: Yes
- **Gap status**: 2 YELLOW (items_sold in view_daily_kpis, delta/% change)

### K2. Main Settings
- **File**: `Stitch_page/Main_Settings/Main_Settings.tsx`
- **Route**: `/settings`
- **Module**: settings
- **Data sources**: `settings`, navigation
- **Key features**: Settings navigation hub with cards for each settings section
- **Gap status**: ALL GREEN

### K3. Company Settings
- **File**: `Stitch_page/Company_Settings/Company_Settings.tsx`
- **Route**: `/settings/company`
- **Module**: settings
- **Data sources**: `settings`
- **Key features**: Company name, address, phone, email, tax ID, logo upload, website, currency, timezone, brand color
- **Gap status**: 3 YELLOW (company.website, company.currency, company.timezone settings)

### K4. Floor Plan Editor
- **File**: `Stitch_page/Floor_Plan_Editor/Floor_Plan_Editor.tsx`
- **Route**: `/settings/floorplan`
- **Module**: settings/floorplan
- **Data sources**: `floor_plan_items`
- **Key features**: Drag-drop canvas, item types (tables/walls/bar/counter/divider), capacity, status
- **Realtime**: Yes (collaborative editing)
- **Gap status**: 1 YELLOW (floor_plan_items.status column, extended item types)

### K5. KDS & Display Settings
- **File**: `Stitch_page/KDS___Display_Settings/KDS___Display_Settings.tsx`
- **Route**: `/settings/kds`
- **Module**: settings/kds
- **Data sources**: `kds_stations`, `settings`, `display_promotions`
- **Key features**: Station management, order routing, urgency thresholds, audio alerts, customer display config
- **Gap status**: ~~2 RED~~ RESOLVED (KDS + Display settings created via Phase 1 `epic10_settings_expansion` + dedicated pages), 1 YELLOW (connection_status on kds_stations)

### K6. POS Terminal Settings
- **File**: `Stitch_page/POS_Terminal_Settings/POS_Terminal_Settings.tsx`
- **Route**: `/settings/pos`
- **Module**: settings/pos
- **Data sources**: `settings`, `pos_terminals`
- **Key features**: Default order type, auto-print, send to KDS, shift requirements, discount settings (named presets), cart timeout
- **Gap status**: ~~6 RED~~ RESOLVED (all POS settings created via Phase 1 `epic10_settings_expansion` migration + `POSConfigSettingsPage`), 3 YELLOW (auto-print, send-to-kds, named discount presets)

### K7. Business Hours & Peak Settings
- **File**: `Stitch_page/Business_Hours___Peak_Settings/Business_Hours___Peak_Settings.tsx`
- **Route**: `/settings/hours`
- **Module**: settings
- **Data sources**: `business_hours`, `settings`
- **Key features**: Weekly schedule, holidays & special events, peak pricing config
- **Gap status**: ~~1 RED~~ RESOLVED (`business_holidays` table + hook + Holidays section on BusinessHoursPage), ~~4 RED~~ RESOLVED (peak pricing settings: UI connected to existing `pos_config.peak_*` settings — enable toggle, start/end time, markup %)

### K8. Printing & Receipt Settings
- **File**: `Stitch_page/Printing___Receipt_Settings/Printing___Receipt_Settings.tsx`
- **Route**: `/settings/printing`
- **Module**: settings/printing
- **Data sources**: `printer_configurations`, `receipt_templates`, `settings`
- **Key features**: Print server URL, test connection, device assignments, receipt template preview
- **Gap status**: ALL GREEN

### K9. Payment Methods Config
- **File**: `Stitch_page/Payment_Methods_Config/Payment_Methods_Config.tsx`
- **Route**: `/settings/payments`
- **Module**: settings/payments
- **Data sources**: `payment_methods`
- **Key features**: Payment method cards with enable/disable, cash rounding, card brands, EDC config, QRIS config, split payment settings
- **Gap status**: ~~2 RED~~ RESOLVED (split payment settings created via Phase 1 migration)

### K10. Permissions Config
- **File**: `Stitch_page/Permissions_Config/Permissions_Config.tsx`
- **Route**: `/settings/permissions`
- **Module**: settings/security
- **Data sources**: `roles`, `permissions`, `role_permissions`
- **Key features**: Roles sidebar, permission matrix with grouped checkboxes, save/reset
- **Gap status**: ALL GREEN (minor: "reset to default" needs seed data reference)

### K11. Inventory Settings
- **File**: `Stitch_page/Inventory_Settings/Inventory_Settings.tsx`
- **Route**: `/settings/inventory`
- **Module**: settings/inventory
- **Data sources**: `settings`, `stock_locations`
- **Key features**: Stock tracking toggle, auto-deduct, BOM deduct, negative stock, low stock threshold, auto-generate PO, storage locations, audit frequency, manager approval, waste requirements
- **Gap status**: ~~6 RED~~ RESOLVED (all inventory settings created via Phase 1 `epic10_settings_expansion` + `InventoryConfigSettingsPage`), 2 YELLOW (auto_deduct_on_sale, deduct_by_bom)

---

## Module L: Notifications & Sync (3 pages)

### L1. Notification Control Center
- **File**: `Stitch_page/Notification_Control_Center/Notification_Control_Center.tsx`
- **Route**: `/settings/notifications`
- **Module**: settings/notifications
- **Data sources**: (NEW tables needed)
- **Key features**: Event matrix with per-event channel toggles (in-app/email/push), quiet hours
- **Gap status**: ~~ALL RED~~ RESOLVED (`notification_events` + `notification_preferences` tables created, hooks + `EventPreferencesSection` component integrated into NotificationSettingsPage)

### L2. Sync & Offline Settings
- **File**: `Stitch_page/Sync___Offline_Settings/Sync___Offline_Settings.tsx`
- **Route**: `/settings/sync`
- **Module**: settings/sync
- **Data sources**: `settings`, `settings_profiles`, `sync_queue`, `sync_devices`
- **Key features**: Connection presets, auto-sync interval, max retries, priority overriding, cache TTLs, LAN mesh, debug tools
- **Gap status**: ~~4 RED~~ RESOLVED (sync settings created via Phase 1 `epic10_settings_expansion` + `SyncAdvancedSettingsPage`), 1 YELLOW (cache_ttl_images)

### L3. System Health & Sync Monitor
- **File**: `Stitch_page/System_Health___Sync_Monitor/System_Health___Sync_Monitor.tsx`
- **Route**: `/settings/health`
- **Module**: settings/system
- **Data sources**: `sync_queue`, `lan_nodes`, client-side metrics
- **Key features**: Connectivity status, LAN mesh status, sync throughput, offline queue table, database latency chart
- **Gap status**: ~~1 RED~~ RESOLVED (`SystemHealthCards` component — client-side latency, storage usage, service worker status), 2 YELLOW (sync throughput, payload_size)

---

## Module M: Security & Admin (4 pages)

### M1. Security & PIN Settings
- **File**: `Stitch_page/Security___PIN_Settings/Security___PIN_Settings.tsx`
- **Route**: `/settings/security`
- **Module**: settings/security
- **Data sources**: `settings`, `pos_terminals`
- **Key features**: Offline PIN enable, complexity, PIN length, failed attempts, auto-logout, concurrent sessions, PII masking, local DB encryption, action verification
- **Gap status**: ~~3 RED~~ RESOLVED (pin settings via Phase 1 + `SecurityPinSettingsPage`), 2 RED (concurrent_sessions, local_db_encryption -- app-level features), 2 YELLOW (auto-logout global, pin_required_actions)

### M2. Team Management
- **File**: `Stitch_page/Team_Management/Team_Management.tsx`
- **Route**: `/users`
- **Module**: admin/users
- **Data sources**: `user_profiles`, `user_roles`, `roles`, `user_sessions`
- **Key features**: Staff grid with online status, edit/deactivate/PIN reset, invite user modal
- **Gap status**: ~~1 RED~~ RESOLVED (`title` column added via Phase 1 migration)

### M3. User Profile Settings
- **File**: `Stitch_page/User_Profile_Settings/User_Profile_Settings.tsx`
- **Route**: `/profile`
- **Module**: admin/profile
- **Data sources**: `user_profiles`, Supabase Auth
- **Key features**: Avatar, display name, staff title, email, phone, change PIN, update password, 2FA toggle, language pref, default module
- **Gap status**: ~~2 RED~~ RESOLVED (`title`, `default_module`, `mfa_enabled` columns added via Phase 1 migration), 1 YELLOW (2FA UI flow)

### M4. Audit Trail & Logs
- **File**: `Stitch_page/Audit_Trail___Logs/Audit_Trail___Logs.tsx`
- **Route**: `/settings/audit`
- **Module**: admin/audit
- **Data sources**: `audit_logs`, `user_profiles`
- **Key features**: Search, date range, user filter, category tabs, timeline with severity, expandable details (IP, user agent, change log)
- **Gap status**: ALL GREEN

---

## Module N: Reports (2 pages)

### N1. Daily Sales Report
- **File**: `Stitch_page/Daily_Sales_Report/Daily_Sales_Report.tsx`
- **Route**: `/reports/daily`
- **Module**: reports
- **Data sources**: `view_daily_kpis`, `orders`, `view_hourly_sales`, `view_payment_method_stats`, `view_staff_performance`
- **Key features**: Revenue/orders/avg ticket KPIs with % change, revenue trends chart, daily performance table, drill-down (hourly, payment, staff)
- **Gap status**: 1 YELLOW (delta/% change computation)

### N2. Reports Hub Overview
- **File**: `Stitch_page/Reports_Hub_Overview/Reports_Hub_Overview.tsx`
- **Route**: `/reports`
- **Module**: reports
- **Data sources**: `view_daily_kpis`, `view_product_sales`, `view_category_sales`, `view_hourly_sales`, `orders`
- **Key features**: Tab navigation, 5 KPIs, revenue trend, top 10 products, category donut, hourly distribution
- **Gap status**: 2 YELLOW (unique customers count, items_sold KPI)

---

## Module O: Product Analytics (1 page)

### O1. Product Performance Analytics
- **File**: `Stitch_page/Product_Performance_Analytics/Product_Performance_Analytics.tsx`
- **Route**: `/reports/products`
- **Module**: reports/products
- **Data sources**: `view_product_sales`, `view_category_sales`, `order_items`, `products`
- **Key features**: Top performers table, top 10 by revenue chart, category breakdown, growth comparison, unsold inventory alert, price adjustments log
- **Gap status**: ~~1 RED~~ RESOLVED (`product_price_history` -- same as D3), 1 YELLOW (auto-markdown system)

---

## Phase 2 Summary (2026-02-15)

### RED Gaps Resolved: 41 total

| Count | Category | Details |
|-------|----------|---------|
| 6 | Settings (K6 POS) | All POS config settings created |
| 6 | Settings (K11 Inventory) | All inventory config settings created |
| 5 | Settings (M1 Security) | PIN settings + security config (3 of 5) |
| 4 | Settings (L2 Sync) | All sync advanced settings created |
| 4 | Settings (K7 Peak) | Peak pricing UI connected to existing `pos_config.peak_*` settings |
| 3 | Accounting (H7 VAT) | `vat_filings` table + filing UI + mark filed (export PDF remains) |
| 2 | Settings (K5 KDS) | KDS + Display settings + pages |
| 2 | Settings (K9 Payments) | Split payment settings |
| 2 | Admin (M2/M3 Users) | `title`, `default_module`, `mfa_enabled` columns |
| 1 | Auth (A3 Reset) | Password reset page created |
| 1 | Orders (C2 Stats) | Completion rate KPI added |
| 1 | Orders (C3 Detail) | `service_charge` columns + UI |
| 1 | Mobile (B3 Checkout) | `guest_count` in cartStore + offline order service |
| 1 | Products (D3 Details) | `product_price_history` table + hook + UI |
| 1 | Customers (F1 CRM) | CSV import service + Import button in CustomersHeader |
| 1 | Accounting (H3 Journal) | Journal entry attachments: file upload + Supabase Storage + `attachment_url` |
| 1 | Purchasing (I1 Suppliers) | Supplier `category` exposed in card badge + form dropdown |
| 1 | Purchasing (I4 PO) | `po_activity_log` table + hook + UI |
| 1 | Settings (K7 Hours) | `business_holidays` table + hook + UI |
| 1 | Notifications (L1) | `notification_events` + `notification_preferences` tables + UI |
| 1 | Reports (O1 Analytics) | Same `product_price_history` as D3 |
| 1 | Products (D3 Details) | Conversion rate via `useProductPerformance` + `ProductPerformanceCard` |
| 1 | Accounting (H7 VAT) | PDF export button using `pdfExport` service |
| 1 | System (L3 Health) | `SystemHealthCards` — latency, storage, service worker |
| 2 | AR (J1 Aging) | FIFO auto-allocation already done + batch PDF statements |

### Visual Enhancements Added
- `TrendBadge` component → Dashboard KPIs (today vs yesterday %)
- `StockStatusBadge` component → Inventory Table + Reports Stock Table
- Completion Rate KPI → OrdersStats (5th KPI card)
- Voided/cancelled row styling → OrdersTable (opacity + red tint + line-through)
- Supplier category badge → SupplierCard (gold chip)
- Peak pricing section → BusinessHoursPage (toggle + times + markup)
- CSV import button → CustomersHeader
- Journal attachment upload → JournalEntryForm (file picker + storage)
- Guest count support → cartStore + offline pipeline
- `database.generated.ts` fixed (encoding corruption)
- VAT Export PDF button → VATManagementPage (via pdfExport service)
- System Health cards → SyncStatusPage (latency + storage + SW)
- Product Performance card → GeneralTab (conversion %, units sold, revenue)
- Batch Statements button → B2BPaymentsPage (PDF per customer)

### Remaining RED Gaps (5 items across 4 modules)
- G1/G2: B2B delivery map, route performance, statement generation, delivery zones (5) — deferred (requires significant infrastructure)
- H4: Staff hours tracking (1) — deferred (requires clock_in/clock_out feature)
- I2: Vendor email notification (1) — deferred (requires Edge Function + email service)
- M1: concurrent_sessions, local_db_encryption (2) — app-level features, not DB-backed
