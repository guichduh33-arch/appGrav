# Stitch Master Prompt — The Breakery (appGrav)

> **Usage**: Copy-paste the sections below into Stitch as generation prompts. The document is split into **6 batches** by priority to avoid overwhelming Stitch. Generate each batch as a separate set of screens within the same project.

---

## 🔧 Global Context (Include with EVERY batch)

```
You are designing "The Breakery" — a premium bakery management platform (POS + Back Office) for a high-end artisan bakery in Indonesia.

DESIGN SYSTEM — "Luxe Bakery Dark":
- Background: Deep Onyx #0D0D0F
- Cards/Surfaces: Warm Charcoal #1A1A1D
- Primary Accent: Artisan Gold #C9A55C (ALL primary buttons, active tabs, selected states — NEVER use blue)
- Text Primary: #E5E7EB | Text Muted: #9CA3AF
- Borders: #2A2A30
- Success: #22C55E | Warning: #F59E0B | Danger: #EF4444

TYPOGRAPHY:
- Headings: Playfair Display (serif, elegant)
- Body/UI: Inter (sans-serif, clean)

STYLE RULES:
- Premium, minimalist, artisan aesthetic — like a high-end French pâtisserie app
- Gold gradient buttons with uppercase text, border-radius medium
- Cards with subtle shadows and rounded-lg corners
- High whitespace, elegant margins, "premium density"
- Micro-animations on hover/interactions (subtle, not flashy)
- Dark theme ONLY — no light mode
- Currency: IDR (Indonesian Rupiah), format as "Rp 25.000" (dot for thousands, no decimals)
- All text in English

TECH CONTEXT:
- React + TypeScript + Tailwind CSS + Vite
- Supabase backend (PostgreSQL)
- Each screen maps to real database tables — keep data fields realistic
- Target: Desktop 1280×800+ for Back Office, Tablet 1024×768 for POS/KDS
```

---

## 📦 Batch 1 — POS & Login (Priority: Critical)

```
Design the core daily-use screens for The Breakery POS system.

SCREEN 1: LOGIN PAGE (/login)
- Dark premium background with bakery brand logo "The Breakery" in gold Playfair Display
- Grid of user avatars (circular, 80px) with names below — users tap their avatar to select
- PIN pad (4-6 digits) appears after selecting a user: large touch-friendly numpad buttons (min 60px)
- PIN dots indicator showing typed digits
- Subtle gold shimmer animation on the logo
- "Forgot PIN? Contact Admin" link at bottom in muted text
- No email/password — PIN-only authentication

SCREEN 2: POS MAIN PAGE (/pos) — TABLET LANDSCAPE
- FULLSCREEN layout, no sidebar navigation
- LEFT PANEL (65% width): Product browsing area
  - Top bar: "The Breakery" gold logo (left), search bar (center), user avatar + shift info (right)
  - Category tabs row: horizontal scrollable pills (e.g., "All", "Viennoiserie", "Pains", "Pâtisseries", "Boissons", "Snacks"). Active tab = gold background
  - Product grid: 3-4 columns of product cards
    - Each card: product image (square, rounded), product name, price "Rp 25.000"
    - Hover/tap: subtle gold border glow
    - Out of stock: grayed out with "Out of Stock" overlay badge
- RIGHT PANEL (35% width): Cart panel
  - Header: "Current Order" with order type selector (Dine In / Takeaway / Delivery dropdown)
  - Optional: Table number input, Customer name
  - Cart items list: product name, quantity (- / + buttons), modifiers in small text, line total
  - Discount row (if applied): shows amount with gold tag
  - Totals section: Subtotal, Tax (PPN 10%), Discount, TOTAL (large, gold, bold)
  - Bottom action buttons: "Hold" (outline), "Clear" (ghost/danger), "PAY Rp 150.000" (large gold gradient button, full width)

SCREEN 3: PAYMENT MODAL (overlay on POS)
- Dark modal overlay with glassmorphism card (centered, 500px wide)
- Order summary at top: items count, subtotal, tax, total
- Payment method selector: large icon buttons in a row — Cash 💵, Card 💳, Transfer 🏦, EDC
- Selected method = gold border + gold background
- Numpad for amount entry (large buttons, touch-friendly)
- Quick amount buttons: "Rp 50.000", "Rp 100.000", "Rp 200.000", "EXACT" 
- If cash: show "Change: Rp 10.000" in green
- Split Payment option: "Add Another Payment" link
- "COMPLETE PAYMENT" large gold button at bottom
- "Cancel" ghost button

SCREEN 4: MODIFIER MODAL (overlay on POS)
- When tapping a product that has options (e.g., coffee size, milk type)
- Modal showing product name + image at top
- Modifier groups: "Size" (Small/Medium/Large radio), "Milk" (Regular/Oat/Almond radio), "Extras" (Extra Shot +Rp 5.000, checkbox list)
- Quantity selector at bottom
- "Add to Cart — Rp 35.000" gold button showing calculated price
- Clean, touch-optimized layout with large tap targets

SCREEN 5: OPEN SHIFT MODAL
- Modal: "Open New Shift"
- Opening cash amount field with numpad
- Quick amounts: "Rp 500.000", "Rp 1.000.000", "Rp 1.500.000"
- Terminal ID display (auto-detected)
- Notes field (optional)
- "Open Shift" gold button

SCREEN 6: CLOSE SHIFT MODAL
- Modal: "Close Shift — Summary"
- Shift stats: Duration, Total Orders, Total Sales
- Payment breakdown: Cash / Card / Transfer amounts
- Expected cash vs Counted cash input
- Variance display (green if match, red if discrepancy)
- "Close Shift" gold button
```

---

## 📦 Batch 2 — KDS & Customer Display (Priority: Critical)

```
Design the kitchen and customer-facing display screens for The Breakery.

SCREEN 7: KDS STATION SELECTOR (/kds)
- Fullscreen dark page with "The Breakery" logo
- 3 large station cards (200px tall, side by side):
  - ☕ "Barista" — coffee/drink orders
  - 🍳 "Kitchen" — food/pastry orders  
  - 🖥️ "Display" — all orders overview
- Each card: large icon, station name, current pending order count badge
- Gold border on hover, tap to enter station

SCREEN 8: KDS MAIN PAGE (/kds/:station)
- Fullscreen, dark background
- Top bar: Station name (e.g., "Barista Station"), clock, order count, "Back" button
- Order cards grid (3-4 columns):
  - Each card = one order:
    - Header: Order #, Table/Takeaway, elapsed timer "5:23"
    - Items list: product names with quantities and modifiers
    - Timer color coding: Normal (white) → Warning >5min (amber) → Critical >10min (red, pulsing)
    - Status button at bottom:
      - "START" (gold) → "READY" (green) → auto-removes
    - Card border color matches urgency
- Auto-refresh, real-time feel
- Sound/visual alert for new orders (gold flash animation)

SCREEN 9: CUSTOMER DISPLAY (/display)
- Fullscreen, elegant, customer-facing
- Two states:
  STATE A — IDLE (no active order):
    - "The Breakery" large gold logo centered
    - Promotional rotating carousel below: product images with names and prices
    - Elegant bakery atmosphere
  STATE B — ACTIVE ORDER:
    - Left side: Current order items with prices
    - Right side: Large total display "Rp 85.000" in gold
    - Animation when items are added (slide-in from right)
    - "Welcome" / "Thank you" messages
```

---

## 📦 Batch 3 — Dashboard & Orders (Priority: High)

```
Design the management dashboard and order history for The Breakery back office.

All Back Office screens share a LEFT SIDEBAR navigation:
- "The Breakery" gold logo at top
- Icon + label links: Dashboard, POS, Orders, Products, Inventory, Customers, B2B, Purchasing, Reports, Accounting, Users, Settings
- Active link = gold accent + subtle gold background
- User avatar + name at bottom with logout
- Sidebar width: 240px, collapsible to icons only (64px)

SCREEN 10: DASHBOARD (/)
- Header: "Dashboard" title, date range selector, "Open POS" shortcut gold button
- KPI Cards row (4 cards):
  - Today's Sales: "Rp 12.500.000" with trend arrow ↑12%
  - Orders: "47" with comparison
  - Average Order: "Rp 265.000"
  - Active Shift: User name, duration
- Charts section (2 columns):
  - Sales chart (line/bar, 7 days) with gold accent line
  - Payment methods pie chart
- Quick actions: "Low Stock Alerts (3)", "Pending B2B Orders (2)"
- Recent orders table (last 10): Order#, Time, Items, Total, Status badge

SCREEN 11: ORDERS PAGE (/orders)
- Header: "Order History" title, search bar, date range filter, status filter dropdown
- Order table with columns: Order #, Date/Time, Customer, Type (badge), Items, Total, Payment, Status (colored badge)
- Status badges: Pending (yellow), Preparing (blue), Ready (green), Completed (gray), Voided (red strikethrough)
- Click row to expand: full order details, items list, payment info
- Export button (CSV)
- Pagination at bottom
```

---

## 📦 Batch 4 — Products, Inventory & Purchasing (Priority: High)

```
Design the product catalog, inventory management, and purchasing screens.

SCREEN 12: PRODUCTS PAGE (/products)
- Tab bar: "Products" | "Combos" | "Promotions" (gold active tab)
- Products tab:
  - Grid/List toggle, search bar, category filter, "New Product" gold button
  - Product cards or table rows: image thumbnail, name, SKU, category, price, stock level, active toggle
  - Stock level indicator: green (OK), amber (low), red (critical)

SCREEN 13: PRODUCT FORM (/products/new)
- Full-page form with card sections:
  - Basic Info: Name, SKU, Barcode, Description, Type dropdown (Finished/Semi-finished/Raw Material)
  - Pricing: Selling Price, Wholesale Price, Cost Price (IDR inputs)
  - Category: Dropdown selector
  - Image: Upload area with preview
  - Stock: Current Stock, Minimum Stock
  - Modifiers: List of modifier groups attached
  - Recipe: Ingredients list with quantities (for semi-finished/finished products)
- "Save Product" gold button, "Cancel" ghost

SCREEN 14: INVENTORY STOCK PAGE (/inventory)
- Tab bar: "Stock Levels" | "Incoming" | "Wasted" | "Production" | "Stock Count" | "Movements"
- Stock levels tab:
  - Search bar, category filter
  - Table: Product, SKU, Current Stock, Min Stock, Status, Last Movement
  - Status indicators: ✅ OK, ⚠️ Low, 🔴 Critical
  - Click to see movement history

SCREEN 15: PURCHASE ORDERS (/purchasing/purchase-orders)
- Table: PO Number, Supplier, Date, Items Count, Total, Status (Draft/Sent/Partial/Received)
- "New Purchase Order" gold button
- PO Form: Supplier selector, item lines (product, qty, unit price), notes
- Receive flow: mark items received with actual quantities

SCREEN 16: SUPPLIERS PAGE (/purchasing/suppliers)
- Table: Name, Contact Person, Phone, Email
- "Add Supplier" gold button
- Inline edit or modal form
```

---

## 📦 Batch 5 — Customers, B2B & Reports (Priority: Medium)

```
Design customer management, B2B operations, and analytics screens.

SCREEN 17: CUSTOMERS PAGE (/customers)
- Search bar, category filter (Retail/Wholesale/Custom), "New Customer" gold button
- Customer table: Name, Phone, Email, Category, Loyalty Points, Loyalty Tier (badge with tier color)
- Click to see customer detail page with order history, loyalty transactions

SCREEN 18: CUSTOMER DETAIL (/customers/:id)
- Customer info card: Name, contact, category, member since
- Stats cards: Total Orders, Total Spent, Loyalty Points, Current Tier
- Tabs: "Order History" | "Loyalty Transactions" | "Custom Pricing"
- Order history table with date, order#, total, status

SCREEN 19: B2B DASHBOARD (/b2b)
- KPI cards: Active B2B Customers, Outstanding Invoices, Total AR, Overdue Amount
- Recent B2B orders table
- Aging summary (0-30, 31-60, 61-90, 90+ days) with bar chart

SCREEN 20: B2B ORDER FORM (/b2b/orders/new)
- Customer selector (B2B customers only)
- Item table: Product (with wholesale price auto-filled), Qty, Unit Price, Subtotal
- Tax (PPN 10%) auto-calculated
- Payment terms selector (Net 7/15/30/45/60)
- "Create Order" gold button, "Generate Invoice" secondary button

SCREEN 21: REPORTS PAGE (/reports)
- Tab system with gold active indicator:
  - Overview | Daily Sales | Sales by Hour | Sales by Category | Product Performance | Tax Report | Payment Methods | Profit & Loss | Discounts & Voids | Inventory | Stock Movements | Purchase by Supplier | Outstanding Payments | Audit Log | Alerts Dashboard
- Each tab has:
  - Date range selector with presets (Today, This Week, This Month, Custom)
  - KPI cards at top with period comparison toggle (vs previous period, % change)
  - Charts/tables specific to the tab
  - Export buttons (CSV, PDF)
- Overview tab example:
  - 4 KPI cards: Revenue, Orders, Avg Order Value, Top Product
  - Line chart: Daily sales trend
  - Bar chart: Sales by category
```

---

## 📦 Batch 6 — Accounting, Users & Settings (Priority: Lower)

```
Design accounting, user management, and settings screens.

SCREEN 22: ACCOUNTING — CHART OF ACCOUNTS (/accounting)
- Tab bar: "Chart of Accounts" | "Journal Entries" | "General Ledger" | "Trial Balance" | "Balance Sheet" | "Income Statement" | "VAT"
- Account tree: hierarchical list with indent levels
  - Type badges: Asset (blue), Liability (purple), Equity (teal), Revenue (green), Expense (red)
  - Columns: Code, Name, Type, Balance
  - Expandable/collapsible tree nodes
- "New Account" gold button, "New Journal Entry" button

SCREEN 23: BALANCE SHEET (/accounting/balance-sheet)
- Financial statement layout:
  - Date selector
  - Two-column layout: Assets (left) | Liabilities + Equity (right)
  - Hierarchical rows with subtotals in bold
  - Total Assets = Total Liabilities + Equity (highlighted in gold)
  - "Export" button

SCREEN 24: USERS PAGE (/users)
- User cards grid or table: Avatar, Name, Employee Code, Role badges (e.g., "Admin", "Cashier", "Manager"), Active status toggle
- "New User" gold button
- User form: First/Last name, Employee Code, Phone, Language, Role multi-select, PIN setup
- Permissions tab: Role-based permission matrix with checkboxes

SCREEN 25: SETTINGS PAGE (/settings)
- Left sub-navigation within settings layout:
  - Company, POS Config, Financial, Tax, Inventory, Loyalty, B2B, KDS, Display, Security, Sync, Payments, Printing, Business Hours, Categories, Roles, Audit Log
- Each settings page: labeled form fields organized in sections
- Example — POS Config:
  - Quick Payment Amounts: editable list of IDR amounts
  - Discount Percentages: editable list
  - Required roles for Void/Refund: multi-select
- Save button per section, "Reset to Defaults" option
- Settings changes tracked in audit history

SCREEN 26: PROFILE PAGE (/profile)
- User info card: Avatar (large, editable), name, role, employee code
- Actions: "Change PIN", "Language Preference", "Session History"
- Current session info: Device, Started at, Duration
```

---

## ✅ Quality Checklist for All Screens

```
Before finalizing, verify each screen against these criteria:
1. ✅ Dark theme only (#0D0D0F background)
2. ✅ Gold accent (#C9A55C) for ALL primary actions — no blue anywhere
3. ✅ Playfair Display for headings, Inter for body
4. ✅ IDR currency formatted as "Rp XX.XXX" throughout
5. ✅ Realistic bakery data (croissants, pain au chocolat, baguettes, espresso, etc.)
6. ✅ Touch-friendly targets on POS/KDS (min 44px)
7. ✅ Consistent border-radius and shadow treatment
8. ✅ Gold hover effects on interactive elements
9. ✅ Proper status badge colors (pending=yellow, preparing=blue, ready=green, completed=gray, voided=red)
10. ✅ Premium, elegant feel — not a generic admin panel
```
