# 🎨 Stitch Design Brief — The Breakery (appGrav)

## 1. Project Overview

**The Breakery** is a premium bakery management platform (POS + Back Office). It is a **React + Vite + TypeScript** web application backed by **Supabase** (PostgreSQL, Edge Functions, Auth, Realtime). The app runs on **desktop browsers, tablets (iPad),** and **mobile (Capacitor)**.

### Business Context
- **Industry**: Premium bakery / pâtisserie in Indonesia
- **Currency**: IDR (Indonesian Rupiah) — no decimals displayed, use thousands separator
- **Tax**: PPN 10% (Indonesian VAT)
- **Language**: English UI (multi-language ready: en/fr/id)
- **Users**: Owner, Manager, Cashier, Kitchen staff, Waiter

---

## 2. Design System — "Luxe Bakery Dark"

### Color Palette
| Role | Color | CSS Variable |
|------|-------|-------------|
| Primary Background | Deep Onyx `#0D0D0F` | `--theme-bg-primary` |
| Surface / Cards | Warm Charcoal `#1A1A1D` | `--theme-bg-secondary` |
| Accent / Gold | Artisan Gold `#C9A55C` | `--color-gold` |
| Text Primary | Stone Text `#E5E7EB` | `--theme-text-primary` |
| Text Muted | Muted Smoke `#9CA3AF` | `--theme-text-secondary` |
| Borders | Subtle Border `#2A2A30` | `--theme-border` |
| Success | `#22C55E` | — |
| Warning | `#F59E0B` | — |
| Danger/Error | `#EF4444` | — |

### Typography
| Usage | Font |
|-------|------|
| Display / Headings | **Playfair Display** (Serif) |
| Body / UI Elements | **Inter** (Sans-serif) |

### Component Styling Rules
- **Buttons**: `border-radius: md`, Primary = gold gradient + uppercase text
- **Cards/Tabs**: `border-radius: lg`, `shadow: md`, Active tabs = gold accent (never blue)
- **Navigation**: High-contrast links with gold hover effects
- **Layout**: High whitespace, elegant margins, "premium density"

### Tailwind Extensions Available
- **Animations**: `fade-in`, `slide-up`, `shimmer`, `countdown`, `pulse-urgent`, `bounce-in`
- **Colors**: `bakery-*` (amber/warm), `kds-*`, `pos-*`, semantic status colors
- **Utilities**: `scrollbar-hide`, `line-clamp-*`, `text-shadow-*`

---

## 3. Application Modules & Routes

### 🔐 Authentication
| Route | Page | Notes |
|-------|------|-------|
| `/login` | LoginPage | PIN-based login (4-6 digit), user avatar grid |
| `/mobile/login` | MobileLoginPage | Mobile-optimized PIN login |

### 🛒 POS (Point of Sale) — Fullscreen
| Route | Page | Layout |
|-------|------|--------|
| `/pos` | POSMainPage | **Fullscreen** — No sidebar. Split layout: left = product grid with category tabs, right = cart panel |

**POS Sub-Components (47 components in `components/pos/`):**
- `ProductGrid` — Category-filtered product cards with search
- `Cart` — Cart panel with item list, totals, customer info
- `CartItemRow` — Individual cart line (qty, mods, price)
- `CartTotals` — Subtotal, discount, tax, total display
- `CartActions` — Place order, clear, hold buttons
- **Modals**: `PaymentModal` (numpad + split payment), `DiscountModal`, `VoidModal`, `RefundModal`, `ModifierModal`, `OpenShiftModal`, `CloseShiftModal`, `CustomerSelectModal`, `CashierAnalyticsModal`
- `PaymentMethodSelector` — Cash/Card/Transfer/EDC selector
- `PaymentNumpad` — Numeric keypad for amount entry
- `PaymentOrderSummary` — Order review before payment

### 🍳 KDS (Kitchen Display System) — Fullscreen
| Route | Page | Notes |
|-------|------|-------|
| `/kds` | KDSStationSelector | Pick station: barista, kitchen, display |
| `/kds/:station` | KDSMainPage | Order cards with timer, status buttons (preparing → ready → completed) |

### 📺 Customer Display — Fullscreen
| Route | Page | Notes |
|-------|------|-------|
| `/display` | CustomerDisplayPage | Public screen showing current order + promotional rotation |

### 📱 Mobile App
| Route | Page |
|-------|------|
| `/mobile` | MobileHomePage |
| `/mobile/catalog` | MobileCatalogPage |
| `/mobile/cart` | MobileCartPage |
| `/mobile/orders` | MobileOrdersPage |
| `/mobile/profile` | ProfilePage |

### 📊 Back Office — Sidebar Layout (`BackOfficeLayout`)
All these routes share a **persistent left sidebar** with navigation icons.

#### Dashboard
| Route | Page |
|-------|------|
| `/` (index) | DashboardPage — KPI cards, sales charts, quick actions |

#### Inventory Module (Tabbed layout via `InventoryLayout`)
| Route | Page |
|-------|------|
| `/inventory` | StockPage — Stock levels with alerts |
| `/inventory/incoming` | IncomingStockPage — Goods receipt |
| `/inventory/wasted` | WastedPage — Waste tracking |
| `/inventory/production` | StockProductionPage — Production records |
| `/inventory/opname` | StockOpnameList — Physical counts |
| `/inventory/movements` | StockMovementsPage — All stock movements |
| `/inventory/product/:id` | ProductDetailPage |
| `/inventory/stock-opname/:id` | StockOpnameForm |
| `/inventory/transfers` | InternalTransfersPage |
| `/inventory/transfers/new` | TransferFormPage |
| `/inventory/transfers/:id` | TransferDetailPage |
| `/inventory/stock-by-location` | StockByLocationPage |

#### Products Module (Tabbed layout via `ProductsLayout`)
| Route | Page |
|-------|------|
| `/products` | ProductsPage — Product list with categories |
| `/products/combos` | CombosPage — Combo meal definitions |
| `/products/promotions` | PromotionsPage — Promotion rules |
| `/products/new` | ProductFormPage — Create/Edit product |
| `/products/:id` | ProductDetailPage |
| `/products/:id/pricing` | ProductCategoryPricingPage |
| `/products/combos/new` | ComboFormPage |
| `/products/promotions/new` | PromotionFormPage |

#### Orders
| Route | Page |
|-------|------|
| `/orders` | OrdersPage — Order history with filters |

#### Reports (27 tabs in single page)
| Route | Page |
|-------|------|
| `/reports` | ReportsPage — Tab system with overview, sales, inventory, financial, audit tabs |

#### Customers Module
| Route | Page |
|-------|------|
| `/customers` | CustomersPage — Customer list |
| `/customers/new` | CustomerFormPage |
| `/customers/:id` | CustomerDetailPage |
| `/customers/categories` | CustomerCategoriesPage — Pricing tiers |

#### B2B Module
| Route | Page |
|-------|------|
| `/b2b` | B2BPage — B2B dashboard |
| `/b2b/orders` | B2BOrdersPage |
| `/b2b/orders/new` | B2BOrderFormPage |
| `/b2b/orders/:id` | B2BOrderDetailPage |
| `/b2b/payments` | B2BPaymentsPage |

#### Purchasing Module
| Route | Page |
|-------|------|
| `/purchasing/suppliers` | SuppliersPage |
| `/purchasing/purchase-orders` | PurchaseOrdersPage |
| `/purchasing/purchase-orders/new` | PurchaseOrderFormPage |
| `/purchasing/purchase-orders/:id` | PurchaseOrderDetailPage |

#### Accounting Module (Tabbed layout via `AccountingLayout`)
| Route | Page |
|-------|------|
| `/accounting` | ChartOfAccountsPage — Account tree |
| `/accounting/journal-entries` | JournalEntriesPage |
| `/accounting/general-ledger` | GeneralLedgerPage |
| `/accounting/trial-balance` | TrialBalancePage |
| `/accounting/balance-sheet` | BalanceSheetPage |
| `/accounting/income-statement` | IncomeStatementPage |
| `/accounting/vat` | VATManagementPage — PPN 10% management |

#### Users
| Route | Page |
|-------|------|
| `/users` | UsersPage — User management grid |
| `/users/permissions` | PermissionsPage — Role/permission matrix |

#### Settings Module (Tabbed layout via `SettingsLayout`, 25+ sub-routes)
| Route | Page |
|-------|------|
| `/settings` | CompanySettingsPage |
| `/settings/pos_config` | POSConfigSettingsPage |
| `/settings/financial` | FinancialSettingsPage |
| `/settings/tax` | TaxSettingsPage |
| `/settings/inventory_config` | InventoryConfigSettingsPage |
| `/settings/loyalty` | LoyaltySettingsPage |
| `/settings/b2b` | B2BSettingsPage |
| `/settings/kds_config` | KDSConfigSettingsPage |
| `/settings/display` | DisplaySettingsPage |
| `/settings/security` | SecurityPinSettingsPage |
| `/settings/sync_advanced` | SyncAdvancedSettingsPage |
| `/settings/payments` | PaymentMethodsPage |
| `/settings/hours` | BusinessHoursPage |
| `/settings/printing` | PrintingSettingsPage |
| `/settings/categories` | CategoriesPage |
| `/settings/roles` | RolesPage |
| `/settings/audit` | AuditPage |
| `/settings/sync` | SyncStatusPage |
| `/settings/lan` | LanMonitoringPage |

#### Profile
| Route | Page |
|-------|------|
| `/profile` | ProfilePage |

---

## 4. Data Models (Database Schema)

### Core Entities

#### Product
```
id: UUID
name: string
sku: string | null
barcode: string | null
description: string | null
type: "finished" | "semi_finished" | "raw_material"
category_id: UUID → categories
price: number (IDR)
wholesale_price: number (IDR)
cost_price: number (IDR)
current_stock: number
min_stock: number
is_active: boolean
image_url: string | null
```

#### Category
```
id: UUID
name: string
slug: string
description: string | null
dispatch_station: "barista" | "kitchen" | "display" | "none"
show_in_pos: boolean
```

#### Order
```
id: UUID
order_number: string (eg. "SALE-20260116-001")
status: "pending" | "preparing" | "ready" | "completed" | "cancelled" | "voided"
order_type: "dine_in" | "takeaway" | "delivery" | "b2b"
subtotal: number (IDR)
tax_amount: number (IDR)
discount_amount: number (IDR)
total: number (IDR)
payment_method: string
payment_status: string
customer_id: UUID | null → customers
staff_id: UUID → user_profiles
session_id: UUID → pos_sessions
table_number: string | null
notes: string | null
is_offline: boolean
```

#### Order Item
```
id: UUID
order_id: UUID → orders
product_id: UUID → products
quantity: number (DECIMAL 10,3)
unit_price: number (IDR)
subtotal: number (IDR)
discount_amount: number (IDR)
modifiers: JSON | null (array of modifier objects)
notes: string | null
```

#### Customer
```
id: UUID
name: string
email: string | null
phone: string | null
category_id: UUID | null → customer_categories
loyalty_points: number
loyalty_tier: string | null
```

#### Supplier
```
id: UUID
name: string
contact_person: string | null
phone: string | null
email: string | null
address: string | null
```

#### User Profile
```
id: UUID
name: string
first_name: string
last_name: string
display_name: string | null
employee_code: string | null
phone: string | null
avatar_url: string | null
preferred_language: "fr" | "en" | "id"
role: string (legacy)
is_active: boolean
```

#### POS Session (Shift)
```
id: UUID
session_number: string (auto-generated)
user_id: UUID → user_profiles
terminal_id: string
opening_cash: number (IDR)
closing_cash: number (IDR)
status: "open" | "closed"
```

### Financial Entities
- **Order Payments**: Split payments (cash, card, transfer, EDC) with change calculation
- **Stock Movements**: Always positive quantities with types: purchase, production_in, adjustment_in, sale_pos, waste, transfer_out, ingredient...
- **Accounts**: Chart of accounts (30 Indonesian SME accounts, hierarchical)
- **Journal Entries**: Double-entry with balanced debit/credit lines
- **Fiscal Periods**: Monthly open/closed/locked status

### Marketing Entities
- **Customer Categories**: Pricing tiers (retail, wholesale, discount_percentage)
- **Product Combos**: Combo groups with choice items
- **Promotions**: Time-based rules (%, fixed, buy_x_get_y) with usage tracking
- **Loyalty Tiers** / **Loyalty Transactions**

---

## 5. API Contracts (Edge Functions)

All API calls go through Supabase Edge Functions at `{SUPABASE_URL}/functions/v1/...`

### Authentication
| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/auth-verify-pin` | POST | `{ user_id, pin, device_type, device_name }` | `{ success, user, session, roles, permissions }` |
| `/auth-logout` | POST | `{ session_id, user_id, reason }` | `{ success }` |
| `/auth-change-pin` | POST | `{ user_id, current_pin?, new_pin, admin_override? }` | `{ success }` |
| `/auth-get-session` | POST | `{ session_token }` | `{ valid, user, session, roles, permissions }` |
| `/auth-user-management` | POST | `{ action: create|update|delete|toggle_active, ... }` | `{ success, user? }` |

### Reports & Invoices
| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/calculate-daily-report` | POST | `{ date? }` | `{ summary, payment_breakdown, category_performance, top_products }` |
| `/generate-invoice` | POST | `{ order_id }` | `text/html` (B2B invoice) |

### Operations
| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/send-to-printer` | POST | `{ type: receipt|kitchen|label, printer?, data }` | — |
| `/purchase_order_module` | POST | `?resource=suppliers|orders` | CRUD operations |
| `/claude-proxy` | POST | AI prompt | AI response |

### Direct Supabase Queries (React Query)
Most data is fetched via `supabase.from('table').select(...)`:
- Products, categories, modifiers, recipes
- Orders, order items, order payments
- Customers, customer categories
- Stock movements, inventory counts
- Settings, audit logs
- Accounts, journal entries, fiscal periods

### RPC Functions
- `verify_user_pin(user_id, pin)` → boolean
- `set_user_pin(user_id, pin)` → void (bcrypt hashed)
- `get_sales_comparison(...)` → sales comparison data
- `get_reporting_dashboard_summary(...)` → dashboard KPIs
- `record_promotion_usage(...)` → track promo usage
- `get_account_balance(account_id, end_date)` → decimal
- `calculate_vat_payable(year, month)` → collected, deductible, payable
- `open_shift(opening_cash, terminal_id, notes)` → JSONB

---

## 6. State Management (Zustand Stores)

| Store | Purpose |
|-------|---------|
| `authStore` | Current user, session, permissions, roles |
| `cartStore` | Cart items, discounts, customer, order type, table number |
| `orderStore` | Order creation, history, status management |
| `paymentStore` | Payment processing state |
| `displayStore` | Customer display content (current order, promos) |
| `networkStore` | Online/offline status detection |
| `syncStore` | Sync queue progress, conflict count |
| `terminalStore` | Terminal ID, device info |
| `lanStore` | LAN node discovery, connection status |
| `mobileStore` | Mobile-specific UI state |
| `coreSettingsStore` | Settings categories, values, appearance |
| `taxStore` | Tax rates CRUD |
| `paymentMethodStore` | Payment methods CRUD |
| `printerStore` | Printer configurations |
| `businessHoursStore` | Business hours |

---

## 7. Permission System

Screens are protected by `<RouteGuard permission="...">`. Key permission codes:

| Module | Permissions |
|--------|------------|
| Sales | `sales.view`, `sales.create` |
| Products | `products.view`, `products.create`, `products.update`, `products.pricing` |
| Inventory | `inventory.view`, `inventory.create`, `inventory.update` |
| Customers | `customers.view`, `customers.create`, `customers.update` |
| Reports | `reports.sales` |
| Users | `users.view`, `users.roles` |
| Settings | `settings.view` |
| Accounting | `accounting.view`, `accounting.manage`, `accounting.journal.create`, `accounting.journal.update`, `accounting.vat.manage` |

---

## 8. UI Component Library

### Shared UI Components (`components/ui/`, 26 components)
Generic reusable components: buttons, inputs, modals, tables, error boundaries, loading states, toast notifications.

### Key Per-Module Components
| Module | Count | Key Components |
|--------|-------|----------------|
| POS | 47 | ProductGrid, Cart, PaymentModal, ModifierModal, ShiftModals |
| Reports | 18 | ReportSkeleton, ExportButtons, ComparisonToggle, DrillDown |
| Settings | 13 | ArrayAmountEditor, CategorySettingsPage, FloorPlanEditor |
| Inventory | 12 | Stock tables, movement forms, opname forms |
| Purchasing | 10 | PO forms, supplier management |
| KDS | 6 | KDSOrderCard (with urgency timer), station panels |
| Accounting | 8 | AccountTree, AccountPicker, JournalEntryForm, VATSummaryCard |
| Sync | 8 | SyncConflictDialog, PendingSyncPanel, PendingSyncCounter |

---

## 9. Key UX Flows

### POS Sale Flow
1. **Open Shift** → Enter opening cash → Shift starts
2. **Browse Products** → Category tabs → Product grid → Tap to add
3. **Customize** → ModifierModal for options (size, extras, etc.)
4. **Cart Management** → Adjust quantities, add notes, apply discount
5. **Select Customer** (optional) → Loyalty display, custom pricing
6. **Payment** → PaymentModal → Choose method(s) → Numpad entry → Split if needed
7. **Complete** → Receipt print → Order to KDS → Stock deducted
8. **Close Shift** → Count cash → Variance report

### KDS Flow
1. **Order arrives** from POS → Card appears with timer
2. **Staff acknowledges** → Status: preparing (yellow)
3. **Timer counts** → Warning at threshold → Critical = red/pulsing
4. **Mark ready** → Card moves/removed → POS notified
5. **Auto-complete** after configurable delay

### B2B Order Flow
1. **Select customer** (B2B category) → Custom pricing applied
2. **Create order** → Items at wholesale/category prices
3. **Generate invoice** (HTML) → Send/print
4. **Track payment** → Aging, accounts receivable

---

## 10. Offline Capabilities

The app is **offline-first** with IndexedDB (Dexie.js):
- Products, categories, modifiers cached locally
- Cart persisted to localStorage
- Orders created offline, synced when back online
- Sync queue with priority (critical → low)
- Conflict resolution UI (side-by-side diff)
- Idempotency keys prevent duplicate operations

---

## 11. Screen Design Priorities

### Priority 1 — Daily Operations (most used)
1. **POS Main** (`/pos`) — Product grid + cart (tablet-optimized, touch-first)
2. **Login** (`/login`) — PIN pad with user avatars
3. **KDS** (`/kds/:station`) — Kitchen order cards with timers

### Priority 2 — Management
4. **Dashboard** (`/`) — KPI cards, charts, quick actions
5. **Orders** (`/orders`) — Order history table with filters
6. **Inventory** (`/inventory`) — Stock levels with alerts

### Priority 3 — Configuration
7. **Products** (`/products`) — Product catalog management
8. **Customers** (`/customers`) — Customer database
9. **Reports** (`/reports`) — Analytics with 27 tabs
10. **Settings** (`/settings`) — 25+ configuration pages

### Priority 4 — Specialized
11. **Accounting** (`/accounting`) — Financial statements
12. **B2B** (`/b2b`) — Wholesale operations
13. **Purchasing** (`/purchasing`) — Supplier & PO management

---

## 12. Design Constraints for Stitch

> [!IMPORTANT]
> **These constraints ensure designs integrate smoothly with the existing backend.**

1. **Data Fields**: Every form must map to the data models in Section 4. Do not invent fields that don't exist in the schema.
2. **IDR Currency**: Always format as `Rp 25.000` (no decimals, dot thousands separator).
3. **Status Enums**: Use exact status values from the schema (e.g., order status: pending/preparing/ready/completed/cancelled/voided).
4. **Permission Badges**: Some actions are restricted. Show lock/disabled states for unauthorized users.
5. **Responsive**: POS/KDS must work on tablets (1024×768 minimum). Back Office targets 1280×800+.
6. **Dark Theme**: All screens use the Luxe Dark palette from Section 2. No light mode needed.
7. **Touch-First**: POS and KDS are touch-first interfaces. Large tap targets (min 44px), no hover-dependent interactions.
8. **Gold Accents**: Use `#C9A55C` for all primary actions, active tabs, selected states. Never use default blue.
9. **Offline Indicators**: Include sync status and offline banners in critical screens (POS, orders).
10. **No Placeholder Images**: Generate actual bakery product images for mockups.
