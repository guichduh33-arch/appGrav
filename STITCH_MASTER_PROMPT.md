# 🎨 Stitch Master Prompt — The Breakery (appGrav) — Complete Frontend

> **Stitch Project ID:** `6226570993221239944`
> **Last updated:** 2026-02-15
> **Purpose:** Generate ALL remaining frontend screens for The Breakery ERP/POS system.
> **Strategy:** Copy each batch section below into Stitch as a generation prompt. Generate in order (Batch 1 → 8). Always include the **Global Context** block with every batch.

---

## 🔧 GLOBAL CONTEXT — INCLUDE WITH EVERY BATCH

```
You are designing "The Breakery" — a premium bakery management platform (POS + Back Office) for a high-end artisan bakery in Lombok, Indonesia. The application is a React + TypeScript + Vite SPA running on desktop, tablet, and mobile.

═══════════════════════════════════════════════
DESIGN SYSTEM — "Luxe Bakery Dark"
═══════════════════════════════════════════════

BACKGROUNDS:
- Page background: #0D0D0F (Deep Onyx)
- Card / surface: #1A1A1D (Warm Charcoal)
- Card border: #2A2A30 (subtle, 1px solid)
- Elevated card: #1E1E22
- Hover surface: #222226

ACCENT COLORS:
- Primary Gold: #C9A55C (buttons, highlights, active states)
- Gold hover: #D4B36A
- Gold muted: rgba(201, 165, 92, 0.15) — subtle backgrounds
- Gold text: #E8D5A3 — light gold for labels
- Success: #4ADE80
- Warning: #FBBF24
- Danger: #F87171
- Info: #60A5FA

TEXT:
- Primary text: #F5F0E8 (Warm Cream)
- Secondary text: #A09B8E (Muted Taupe)
- Disabled text: #6B6560
- Label text: #C4BEB4

TYPOGRAPHY:
- Headings: "Playfair Display", serif — elegant, premium feel
- Body / UI: "Inter", sans-serif — clean, readable
- Monospace: "JetBrains Mono" — data tables, codes, amounts
- Page titles: Playfair Display 28-32px, weight 600
- Section headers: Inter 18-20px, weight 600
- Body text: Inter 14px, weight 400
- Small labels: Inter 12px, weight 500, uppercase tracking

LAYOUT:
- Sidebar: 260px fixed left, #111113 background
- Content area: fluid, max-width 1400px centered
- Card border-radius: 12px
- Button border-radius: 8px
- Padding: Cards 24px, Sections 32px
- Gap between cards: 16-24px

COMPONENTS:
- Buttons primary: bg #C9A55C, text #0D0D0F, hover #D4B36A
- Buttons secondary: bg transparent, border 1px #2A2A30, text #F5F0E8
- Buttons danger: bg #F87171/20, border #F87171, text #F87171
- Input fields: bg #111113, border #2A2A30, focus border #C9A55C
- Tables: header bg #111113, rows alternate #1A1A1D / #161618, hover #222226
- Badges: rounded-full, small, color-coded (gold/green/red/blue)
- Tabs: underline style, active = gold border-bottom + gold text
- Modals: bg #1A1A1D, border #2A2A30, backdrop blur, max-width 600px
- Toasts: slide-in from top-right, auto-dismiss 5s

ICONS:
- Use Lucide React icon style (thin, 1.5px stroke, consistent 20px size)
- Gold accent for active/primary actions
- Muted (#A09B8E) for secondary/inactive

ANIMATIONS:
- Page transitions: fade-in 200ms ease
- Card hover: translateY(-2px) + subtle shadow
- Loading: gold shimmer skeleton
- Success: green checkmark pulse

CURRENCY FORMAT:
- Indonesian Rupiah (IDR): "Rp 150.000" — no decimals, dot thousands separator
- Always monospace for amounts

BRANDING:
- Logo: "The Breakery" in Playfair Display, gold on dark
- Tagline: "Artisan Bakery · Lombok"
- Wheat icon motif for decorative elements
```

---

## 📊 EXISTING SCREENS (Already Generated — Do NOT Regenerate)

| Module | Screens Already Done |
|--------|---------------------|
| **POS** | POS Terminal (main view), Checkout & Payment modal, Open Shift Register, Shift Summary & Closing |
| **Products** | High-Density Product Grid, Product Detail Editor, Premium Product Editor, Product Form & Recipe Builder, Product Modifiers (6 variants), Pâtisserie & Modifiers, Recipe & Costing Editor, Recipe & Costing Analysis, Packaging & Label Designer |
| **Inventory** | Stock & Inventory Management, Inventory Stock & Movements (3 variants), Stock Movements Analytics, Physical Inventory Log (2x), Inventory Wastage Log (2x), Stock Receiving Flow, Receiving & Delivery Log (2x), Production Entry (3x), Internal Transfers, Incoming Stock, Stock Order Request Form (2x) |
| **KDS** | Kitchen Display System |
| **Dashboard** | Back-Office Dashboard Redesign, Dashboard mobile |
| **Reports** | Global Reports Hub (2x), Income Statement |
| **Accounting** | Balance Sheet, Tax & PPN Settings |
| **B2B** | B2B Wholesale Dashboard |
| **Purchasing** | Purchase Order Management, Supplier Management & Contact |
| **Settings** | POS & System Settings |
| **Display** | Customer Display Idle (4x), Customer Display Active Order, Customer Facing Display |
| **Users** | User Profile & PIN Security, Staff Clock-In/Out |
| **Orders** | Order History (Rp Format), Order History & Logs |
| **System** | Luxe Loading States |

---

## 🔴 BATCH 1 — Auth & Login (3 screens)

> **Priority:** Critical — First thing users see.

### Screen 1.1: Login Page
```
Design a premium dark login page for "The Breakery" bakery management system.

LAYOUT (centered, 1920×1080):
- Full-screen deep onyx (#0D0D0F) background
- Centered login card (480px wide) on warm charcoal (#1A1A1D) with #2A2A30 border
- Top: The Breakery logo — "The Breakery" in Playfair Display 36px, gold (#C9A55C), with decorative wheat flourish below
- Tagline: "Artisan Bakery · Lombok" in Inter 14px, muted taupe (#A09B8E)

FORM ELEMENTS:
- Email input: bg #111113, border #2A2A30, placeholder "Email address", Lucide Mail icon left
- Password input: same style, Lucide Lock icon left, eye toggle right
- "Remember me" checkbox with gold accent when checked
- Primary button: "Sign In" — full width, bg #C9A55C, text #0D0D0F, 48px height, font-weight 600
- Subtle divider: "──── or ────"
- Secondary link: "Forgot password?" in gold text, subtle hover underline

BOTTOM:
- Offline mode link: "Use Offline Mode (PIN)" — muted text with Lucide WifiOff icon
- Version number: "v2.1.0" small muted text bottom-center

STATES: Show focused input with gold border glow. Show error state below email with #F87171 text "Invalid credentials".
```

### Screen 1.2: PIN Login (Offline Mode)
```
Design an offline PIN login screen for staff quick-access.

LAYOUT (centered, 1920×1080):
- Same dark background as login
- Card 400px wide, centered
- Top: "Staff PIN Access" in Playfair Display 24px, gold
- Subtitle: "Enter your 4-6 digit PIN" — muted taupe, Inter 14px
- Lucide WifiOff badge top-right: "Offline Mode" in amber/warning style

PIN PAD:
- 6 dot indicators (●○○○○○) — filled dots = entered digits
- Staff name display above: "Welcome, Sarah" in cream text (after PIN recognition)
- 3×4 number grid (1-9, 0, backspace) — large touch targets (72px), bg #1E1E22, border #2A2A30
- Number text: Inter 28px, cream white
- Hover: gold border glow
- Backspace button: Lucide Delete icon

BOTTOM:
- "Switch to Email Login" link, muted gold
- Rate limit warning (hidden by default): "Too many attempts. Try again in 15 minutes." — #F87171 text with Lucide AlertTriangle icon

ANIMATION: Dots fill with gold pulse on digit entry. Shake animation on wrong PIN.
```

### Screen 1.3: Password Reset
```
Design a password reset request page.

LAYOUT:
- Same centered card format as login (480px)
- Lucide KeyRound icon large (48px) at top, muted gold
- Title: "Reset Password" — Playfair Display 24px
- Subtitle: "Enter your email and we'll send a reset link"
- Email input field (same style as login)
- Primary button: "Send Reset Link" — gold, full width
- Back link: "← Back to Sign In" with Lucide ArrowLeft icon

SUCCESS STATE: Replace form with:
- Lucide CheckCircle in green (#4ADE80), 64px
- "Check Your Email" heading
- "We've sent a password reset link to s***@bakery.com"
- "Didn't receive it? Resend" link in gold
```

---

## 🟠 BATCH 2 — Customers & Loyalty (4 screens)

### Screen 2.1: Customer List Page
```
Design a customer management page for a bakery CRM.

HEADER:
- Page title: "Customers" — Playfair Display 28px
- Subtitle: "Manage your customer database" — muted taupe
- Right: "+ New Customer" gold button with Lucide UserPlus icon

KPI CARDS (4 across, top):
- Total Customers: "1,247" with Lucide Users icon
- Active This Month: "342" with Lucide UserCheck icon, green badge "+12%"
- Loyalty Members: "856" with Lucide Heart icon, gold badge
- Outstanding B2B: "Rp 4.250.000" with Lucide Banknote icon, amber badge

FILTERS BAR:
- Search: Lucide Search icon, placeholder "Search by name, phone, email..."
- Category dropdown: "All Categories" — options: Retail, Wholesale, Discount, Custom
- Loyalty tier filter: "All Tiers" — options: Bronze, Silver, Gold, Platinum
- Sort: "Recent first" / "Name A-Z" / "Points ↓"

TABLE:
- Columns: Name, Phone, Category (badge), Loyalty Tier (colored badge), Points, Total Spent, Last Visit
- Loyalty tier badges: Bronze=#CD7F32, Silver=#C0C0C0, Gold=#C9A55C, Platinum=#E5E4E2
- Category badges: Retail=blue, Wholesale=purple, Custom=amber
- Row hover: #222226
- Pagination: "Showing 1-25 of 1,247" with prev/next

EMPTY STATE: Lucide UserPlus illustration, "No customers yet. Add your first customer."
```

### Screen 2.2: Customer Detail / Edit Page
```
Design a customer detail page with editing capability.

LAYOUT: Two-column (65% / 35%)

LEFT COLUMN:
- Header card: Avatar (initials circle, gold border), customer name (Playfair 24px), category badge, loyalty tier badge with colored icon
- Contact section: Phone, Email, Address — editable fields with Lucide Edit2 icon toggle
- Notes textarea: "Internal notes about this customer"
- "Save Changes" gold button + "Cancel" secondary button

RIGHT COLUMN:
- Loyalty Card:
  - Tier name + icon (star variations)
  - Current points: "2,450 pts" in large Playfair 32px
  - Progress bar to next tier (Gold → Platinum needs 5000 pts): gold gradient bar
  - "Points History" expandable section
  - "Add/Redeem Points" buttons

- Purchase Stats Card:
  - Total lifetime spent: "Rp 24.500.000"
  - Average order: "Rp 85.000"
  - Visit frequency: "3.2x / month"
  - Last visit: "Feb 12, 2026"
  - Favorite items: top 3 product names with mini images

- Recent Orders List (last 5):
  - Order #, date, total, status badge (completed=green, voided=red)
  - "View All Orders" link

PRICING SECTION (if wholesale/custom):
- "Custom Pricing" card
- Table: Product/Category | Standard Price | Customer Price | Discount %
- "Edit Pricing" button
```

### Screen 2.3: Customer Categories Management
```
Design a customer category management page.

LAYOUT: Grid of category cards

HEADER:
- "Customer Categories" — Playfair 28px
- "+ New Category" gold button

CATEGORY CARDS (2 columns, stacked):
Each card (bg #1A1A1D, border #2A2A30, rounded-12):
- Category name: e.g. "Retail", "Wholesale", "Discount 10%", "Hotel Partners"
- Slug badge: "retail" in monospace, muted
- Pricing rule displayed visually:
  - "Standard Price" for retail
  - "Wholesale Price Column" for wholesale
  - "10% Discount Applied" for discount_percentage
  - "Custom Price Table" for custom
- Customer count: "847 customers" with Lucide Users icon
- Edit/Delete action buttons bottom-right

CREATE/EDIT MODAL:
- Name input
- Slug input (auto-generated from name)
- Price modifier type: Select (standard, wholesale_price, discount_percentage, custom)
- Price modifier value: Number input (shown for discount_percentage)
- Description textarea
- Save/Cancel buttons
```

### Screen 2.4: Loyalty Tiers Configuration
```
Design a loyalty tiers configuration page.

HEADER: "Loyalty Program" — Playfair 28px, with Lucide Heart icon in gold

OVERVIEW CARD:
- "Points Earning Rate: 1 point per Rp 1,000 spent"
- Toggle: "Loyalty Program Active" (gold switch)

TIER TABLE (full width, premium card):
Headers: Tier | Icon | Points Threshold | Discount | Color | Members
- Bronze | ★ (gray) | 0 pts | 0% | #CD7F32 | 391
- Silver | ★★ (silver) | 500 pts | 5% | #C0C0C0 | 265
- Gold | ★★★ (gold) | 2,000 pts | 8% | #C9A55C | 150
- Platinum | ★★★★ (platinum) | 5,000 pts | 10% | #E5E4E2 | 50

Each row shows:
- Color swatch (circle) matching tier color
- Editable threshold and discount fields on edit mode
- Member count with mini bar chart showing percentage of total

TIER PREVIEW:
- Show a mock loyalty card for the selected tier
- Card has gradient background in tier color
- Customer name, points balance, tier badge, QR code placeholder
```

---

## 🟡 BATCH 3 — Orders & Order Detail (3 screens)

### Screen 3.1: Orders List Page (Enhanced)
```
Design an enhanced order management page.

HEADER:
- "Orders" — Playfair Display 28px
- Date range picker (today / yesterday / this week / this month / custom)
- Export button: Lucide Download icon, "Export CSV"

KPI ROW (4 cards):
- Today's Orders: "47" with Lucide ShoppingBag icon
- Revenue: "Rp 4.125.000" with Lucide TrendingUp icon, green badge "+8%"
- Average Ticket: "Rp 87.766" with Lucide Receipt icon
- Completion Rate: "94.5%" with Lucide CheckCircle icon

FILTERS:
- Status tabs: All | Pending | Preparing | Ready | Completed | Voided
- Active tab has gold underline + gold text
- Order type chips: Dine-in | Takeaway | Delivery | B2B (toggleable)
- Search: "Search by order #, customer..."

TABLE:
- Columns: Order # | Time | Type (icon+badge) | Customer | Items | Total (Rp) | Payment | Status | Actions
- Order # clickable (gold text, links to detail)
- Status badges: pending=amber, preparing=blue, ready=green, completed=emerald, voided=red with strikethrough
- Payment icons: Cash=banknote, Card=credit-card, EDC=smartphone, QRIS=qr-code
- Actions: Eye (view), Printer (receipt), MoreVertical (void/refund menu)
- Voided orders: row has red-tinted background rgba(248,113,113,0.05)

PAGINATION: "Showing 1-50 of 234 orders" with page navigation
```

### Screen 3.2: Order Detail Page
```
Design a detailed order view page.

LAYOUT: Two-column (60% / 40%)

LEFT — Order Information:
- Header: "Order #BRK-20260215-047" in Playfair 24px
- Status badge (large): "COMPLETED" green
- Meta row: Type badge (Dine-in), Table #3, Staff: Sarah, Time: 14:23

ITEMS TABLE:
- Product | Qty | Unit Price | Modifiers | Subtotal
- Each row shows product name, quantity (bold), price in Rp format
- Modifier details below product name in muted italic: "+Extra Shot, +Oat Milk"
- Combo items grouped with indented sub-items
- Subtotal column right-aligned, monospace

TOTALS SECTION (card, gold border-top):
- Subtotal: Rp 245.000
- Discount: -Rp 24.500 (10% — Loyalty Gold)
- Tax (PPN 10%): Rp 20.045
- Total: Rp 220.500 (large, bold, gold)

RIGHT — Payment & Actions:
- Payment Card:
  - Method: "Cash" with Lucide Banknote icon
  - Amount Paid: Rp 250.000
  - Change Given: Rp 29.500
  - Reference: — (for EDC/QRIS: show ref number)
  - Timestamp: 14:25:03

- Customer Card (if linked):
  - Name, loyalty tier badge, points earned: "+220 pts"

- KDS Status Card:
  - Kitchen: ✅ Completed 14:28
  - Barista: ✅ Completed 14:25
  - Display: ✅ Ready 14:23

ACTION BUTTONS (bottom):
- "Print Receipt" — Lucide Printer icon, secondary button
- "Void Order" — danger button with Lucide Ban icon (requires PIN)
- "Refund" — warning button with Lucide RotateCcw icon
```

### Screen 3.3: Void / Refund Confirmation Modal
```
Design a void/refund confirmation modal with PIN verification.

MODAL (600px wide, bg #1A1A1D):
- Icon top: Lucide AlertTriangle in amber (48px)
- Title: "Void Order #BRK-047?" or "Refund Order #BRK-047?"
- Warning text: "This action cannot be undone. A reversal journal entry will be created automatically."

ORDER SUMMARY (compact):
- Order #, date, total, payment method — in a subtle card

REASON SELECT:
- Dropdown: "Select void reason" — options: Customer request, Wrong order, Quality issue, Duplicate, Other
- "Additional notes" textarea (optional)

PIN VERIFICATION:
- "Manager PIN Required" label with Lucide Shield icon
- 4-6 dot PIN input (same style as PIN login)
- "Only managers and admins can perform this action"

BUTTONS:
- "Cancel" secondary button (left)
- "Confirm Void" / "Confirm Refund" danger button (right) — disabled until PIN entered

ERROR STATE: "Invalid PIN — 2 attempts remaining" in red
```

---

## 🟢 BATCH 4 — Users & Permissions (3 screens)

### Screen 4.1: User Management Page
```
Design a user management admin page.

HEADER:
- "Team Members" — Playfair 28px
- "+ Invite User" gold button with Lucide UserPlus icon

STATS ROW:
- Total Staff: "12" with Lucide Users
- Active Today: "8" with Lucide UserCheck, green
- Roles: "4 roles configured" with Lucide Shield

USER CARDS (grid, 3 columns):
Each card:
- Avatar (initials circle, colored by role)
- Full name (bold)
- Email (muted)
- Role badge: Owner (gold), Manager (purple), Cashier (blue), Kitchen (green)
- Status: Active (green dot) / Inactive (gray dot)
- Last login: "2 hours ago"
- Actions: Edit, Deactivate, PIN Reset

LIST VIEW TOGGLE:
- Table with columns: Name | Email | Role | Status | Last Login | Actions

INVITE MODAL:
- Email input
- Role select dropdown
- "Send Invitation" gold button
```

### Screen 4.2: Role & Permissions Editor
```
Design a role and permissions configuration page.

LAYOUT: Two-panel (40% roles list / 60% permissions editor)

LEFT PANEL — Roles:
- List of roles as cards: Owner, Manager, Cashier, Kitchen Staff, Custom...
- Active role highlighted with gold left border
- Each shows: role name, user count badge, description
- "+ Create Role" button at bottom

RIGHT PANEL — Permission Matrix:
For the selected role, show permission groups as expandable sections:

Section: "Sales & POS" (Lucide ShoppingBag icon)
- ☑ View orders (sales.view)
- ☑ Create orders (sales.create)
- ☐ Void orders (sales.void)
- ☐ Apply discounts (sales.discount)
- ☐ Process refunds (sales.refund)

Section: "Products & Catalogue" (Lucide Package icon)
- ☑ View products
- ☑ Create/edit products
- ☐ Manage pricing
- ☐ Delete products

Section: "Inventory" (Lucide Warehouse icon)
- Checkboxes for: view, create, update, delete, adjust

Section: "Customers" (Lucide Users icon)
- view, create, update, manage loyalty

Section: "Reports" (Lucide BarChart3 icon)
- sales reports, inventory reports, financial reports

Section: "Accounting" (Lucide Calculator icon)
- view, manage, journal create/update, VAT manage

Section: "Administration" (Lucide Settings icon)
- users.view, users.create, users.roles, settings.view, settings.update

STYLE: Checkboxes with gold accent when checked. Disabled/system permissions show lock icon.
"Save Changes" gold button + "Reset to Default" secondary button.
```

### Screen 4.3: Audit Log Page
```
Design an audit log / activity trail page.

HEADER: "Audit Trail" — Playfair 28px, Lucide ScrollText icon

FILTERS:
- Date range picker
- User filter (multi-select)
- Action type: All | Orders | Products | Inventory | Settings | Auth
- Search: "Search by description..."

TIMELINE VIEW:
Each entry is a timeline card (left time, right content):
- Time: "14:23:05" monospace
- User avatar circle + name
- Action description: "Sarah voided Order #BRK-047"
- Details expandable:
  - Reason: "Customer request"
  - Changes: Before/After diff view
  - IP address, device info (muted)
- Severity badge: Info (blue), Warning (amber), Critical (red)

EXAMPLES:
- 🟢 "Sarah created Order #BRK-048 — Rp 125.000"
- 🟡 "Mike applied 15% discount on Order #BRK-045"
- 🔴 "Admin voided Order #BRK-042 — PIN verified"
- 🔵 "System auto-synced 3 offline orders"

PAGINATION: Infinite scroll with "Load more" button
EXPORT: "Export Audit Log" CSV button top-right
```

---

## 🔵 BATCH 5 — Accounting (4 screens)

### Screen 5.1: Chart of Accounts
```
Design a chart of accounts page for Indonesian SME accounting.

HEADER: "Chart of Accounts" — Playfair 28px, Lucide Calculator icon
Right: "+ New Account" gold button

ACCOUNT TREE (hierarchical, expandable):
Display as an indented tree with expand/collapse arrows:

📁 1000 — Assets (bold section header)
  📁 1100 — Current Assets
    📄 1110 — Cash on Hand          Debit    Rp 12.450.000
    📄 1120 — Bank Account          Debit    Rp 45.200.000
    📄 1130 — Petty Cash            Debit    Rp 500.000
    📄 1140 — Accounts Receivable   Debit    Rp 4.250.000
    📄 1150 — Inventory             Debit    Rp 18.300.000
  📁 1200 — Fixed Assets
    📄 1210 — Equipment             Debit    Rp 35.000.000
    📄 1220 — Accumulated Depreciation  Credit  (Rp 8.750.000)

📁 2000 — Liabilities
  📄 2110 — Accounts Payable       Credit   Rp 6.800.000
  📄 2120 — VAT Payable            Credit   Rp 2.100.000
  📄 2130 — Accrued Expenses       Credit   Rp 1.500.000

📁 3000 — Equity
📁 4000 — Revenue
📁 5000 — Cost of Goods Sold
📁 6000 — Operating Expenses

STYLE:
- Tree lines connecting parent-child (subtle #2A2A30)
- Account code in monospace, muted gold
- Account name in Inter, cream
- Balance right-aligned, monospace, green for debit / gold for credit
- Credit balances shown in parentheses: (Rp 8.750.000)
- Folder icons for groups, document icons for leaf accounts
- Expand/collapse with animation
```

### Screen 5.2: Journal Entry Form
```
Design a manual journal entry creation form.

HEADER: "New Journal Entry" — Playfair 24px
"JE-2026-0234" auto-generated reference number in monospace

FORM:
- Date picker (default: today)
- Description: "Monthly rent payment" text input
- Reference: optional external ref input
- Type badge: "Manual" (vs "Auto-generated" which is read-only)

LINES TABLE:
- Columns: Account (searchable select) | Description | Debit (Rp) | Credit (Rp)
- Line 1: 6110 — Rent Expense | Feb rent | Rp 15.000.000 | —
- Line 2: 1120 — Bank Account | — | — | Rp 15.000.000
- "+ Add Line" button below

BALANCE CHECK (bottom of table):
- Total Debits: Rp 15.000.000
- Total Credits: Rp 15.000.000
- Balance: ✅ Balanced (green checkmark) or ❌ Unbalanced by Rp X (red, blocks save)

BUTTONS:
- "Save as Draft" secondary button
- "Post Entry" gold button (disabled if unbalanced)
- "Cancel" text link

VALIDATION: Show red border on account select if empty. Show warning if posting to closed fiscal period.
```

### Screen 5.3: General Ledger
```
Design a general ledger view page.

HEADER: "General Ledger" — Playfair 28px

FILTERS:
- Account select (searchable, shows code + name)
- Date range: From / To
- "Show Zero Balances" toggle
- "Generate" gold button

LEDGER TABLE (for selected account: 1110 — Cash on Hand):
- Opening Balance: Rp 8.200.000 (right-aligned, muted)

Columns: Date | Reference | Description | Debit | Credit | Running Balance
- Feb 01 | JE-001 | Opening balance | Rp 8.200.000 | — | Rp 8.200.000
- Feb 03 | ORD-123 | Sales revenue | Rp 450.000 | — | Rp 8.650.000
- Feb 05 | JE-015 | Supplier payment | — | Rp 2.300.000 | Rp 6.350.000
...
- Closing Balance: Rp 12.450.000 (bold, gold)

STYLE:
- Auto-generated entries have "AUTO" badge in blue
- Manual entries have "MANUAL" badge in muted
- Running balance uses monospace, colored: positive=cream, negative=red
- Reference is clickable (links to journal entry detail)

EXPORT: "Export to CSV" button
```

### Screen 5.4: VAT Management (PPN)
```
Design a VAT/PPN management and reporting page for Indonesian tax compliance.

HEADER: "PPN Tax Management" — Playfair 28px, Lucide Receipt icon

PERIOD SELECTOR: Year + Month dropdowns (e.g., "2026" + "February")

KPI CARDS (3):
- VAT Collected (Output): Rp 8.450.000 — Lucide TrendingUp, green
- VAT Deductible (Input): Rp 3.200.000 — Lucide TrendingDown, blue
- VAT Payable (Net): Rp 5.250.000 — Lucide Banknote, gold (highlighted, larger)

SUMMARY TABLE:
- Section: "Output VAT (PPN Keluaran)"
  - Sales transactions: Rp 84.500.000
  - PPN 10%: Rp 8.450.000
- Section: "Input VAT (PPN Masukan)"
  - Purchase transactions: Rp 32.000.000
  - PPN 10%: Rp 3.200.000
- Section: "Net Payable"
  - Rp 8.450.000 - Rp 3.200.000 = Rp 5.250.000

EXPORT SECTION:
- "Export DJP Format" gold button — generates CSV for Indonesian tax authority
- "Export PDF Summary" secondary button
- "Mark as Filed" button with date picker for filing date

STATUS: "February 2026: ✅ Filed on Feb 28" or "⏳ Not yet filed — Due Mar 15"
```

---

## 🟣 BATCH 6 — Mobile Screens (5 screens)

> **Device type: MOBILE (390px width)**

### Screen 6.1: Mobile Login
```
Design a mobile login screen (390×844, iPhone style).

FULL SCREEN dark background:
- Top 40%: The Breakery logo centered, Playfair Display 28px gold, wheat icon
- Bottom 60%: White-ish card sliding up from bottom (bg #1A1A1D, rounded-top-24)

CARD CONTENT:
- "Welcome Back" heading Inter 20px
- Email input (full width, 48px height)
- Password input with eye toggle
- "Sign In" gold button full width (56px height, large for mobile thumb)
- "Use PIN Access" link below
- "Forgot Password?" small link

Bottom safe area padding for mobile navigation.
```

### Screen 6.2: Mobile Home Dashboard
```
Design a mobile home screen (390×844) for bakery staff.

TOP BAR:
- Left: Staff avatar + "Hi, Sarah" 
- Right: Notification bell (with red dot for 2 alerts) + Settings gear

QUICK ACTIONS (2×2 grid of large cards):
- 🛒 "New Order" — gold accent card, Lucide ShoppingCart
- 📦 "Stock Check" — charcoal card, Lucide Package
- 📊 "Today's Sales" — charcoal card, Lucide BarChart
- 📋 "My Orders" — charcoal card, Lucide ClipboardList

TODAY'S SNAPSHOT CARD:
- Orders: 23 / Revenue: Rp 2.1M / Avg: Rp 91K
- Mini sparkline chart

RECENT ORDERS (scrollable):
- Last 5 orders as compact cards: Order #, time, total, status dot

BOTTOM NAV BAR (fixed):
- Home (active, gold) | Catalog | Cart (badge: 3) | Orders | Profile
- Icons: Lucide Home, Grid3X3, ShoppingCart, ClipboardList, User
```

### Screen 6.3: Mobile Product Catalog
```
Design a mobile product browsing screen (390×844).

TOP: Search bar (rounded, bg #111113, Lucide Search icon)

CATEGORY PILLS (horizontal scroll):
- All | Pastries | Breads | Drinks | Cakes | Savory
- Active pill: gold bg, dark text
- Inactive: charcoal bg, cream text

PRODUCT GRID (2 columns):
Each card:
- Product image (square, rounded-8)
- Product name (Inter 14px, bold)
- Price: "Rp 45.000" monospace gold
- Stock badge: "In Stock" green or "Low: 3" amber
- "+ Add" round button (gold, bottom-right of card)

FLOATING CART BUTTON (bottom-right, above nav):
- Gold circle, ShoppingCart icon, badge with item count
- "Rp 185.000" text next to it
```

### Screen 6.4: Mobile Cart
```
Design a mobile cart/checkout screen (390×844).

HEADER: "Your Order" — back arrow left, "Clear" link right

ITEMS LIST (scrollable):
Each item:
- Product name + modifiers below (muted, small)
- Quantity stepper: [-] 2 [+] (gold border)
- Price: Rp 90.000 right-aligned
- Swipe-left to delete (red bg reveal)

ORDER OPTIONS:
- Order type: Dine-in | Takeaway | Delivery (tab selector)
- Table number input (if dine-in)
- Customer search (optional, Lucide Search)
- Notes textarea: "Add order notes..."

TOTALS (sticky bottom card):
- Subtotal: Rp 285.000
- Discount: -Rp 28.500
- Tax: Rp 23.318
- Total: Rp 256.500 (large, gold)
- "Place Order — Rp 256.500" full-width gold button (56px)
```

### Screen 6.5: Mobile Order History
```
Design a mobile order history screen (390×844).

TOP: "My Orders" header + filter icon
DATE FILTER: "Today" | "Yesterday" | "This Week" (horizontal pills)

ORDER CARDS (vertical list, full width):
Each card:
- Top row: Order #BRK-047 | 14:23 | Status badge
- Second row: "3 items • Dine-in • Table 5"
- Bottom row: "Rp 125.000" bold | "View Details" gold link
- Divider between cards

STATUS COLORS on badges:
- Pending: amber
- Preparing: blue with pulse dot
- Ready: green
- Completed: emerald with checkmark
- Voided: red with strikethrough

EMPTY STATE: Lucide ClipboardList illustration, "No orders yet today"
PULL-TO-REFRESH indicator at top
```

---

## 🟤 BATCH 7 — Settings & Config (4 screens)

### Screen 7.1: Settings Hub / Layout
```
Design the main settings page with sidebar navigation.

LEFT SIDEBAR (260px, bg #111113):
Section "General":
- 🏢 Company Info
- 💰 Tax & Currency
- 🔔 Notifications

Section "POS & Sales":
- 🛒 POS Configuration
- 💳 Payment Methods
- 🖨️ Printing & Receipts

Section "Operations":
- 📦 Inventory Config
- ❤️ Loyalty Program
- 🏗️ B2B Settings
- 📺 KDS & Display

Section "System":
- 🔐 Security & PIN
- 🔄 Sync & Offline
- 👥 Roles & Permissions
- 📝 Audit Log

Active item: gold left border + gold text + subtle gold bg
Inactive: cream text, hover #1A1A1D

RIGHT CONTENT AREA:
Show "Company Info" as default — form with:
- Business name, address, phone, email, tax ID
- Logo upload area (drag & drop)
- "Save Changes" gold button
```

### Screen 7.2: Payment Methods Configuration
```
Design a payment methods management page.

HEADER: "Payment Methods" — Playfair 24px

PAYMENT METHOD CARDS (grid, 2 columns):
Each card:
- Icon (large, Lucide): Banknote/CreditCard/Smartphone/QrCode
- Method name: "Cash", "Debit/Credit Card", "EDC Terminal", "QRIS"
- Status toggle (active/inactive)
- Settings:
  - Cash: "Change rounding: Rp 100" | "Auto-open drawer: Yes"
  - Card: "Reference required: Yes" | "Min amount: Rp 50.000"
  - EDC: "Terminal ID" input | "Reference required: Yes"
  - QRIS: "Provider" select | "QR display timeout: 120s"
- Edit button

SPLIT PAYMENT SECTION:
- Toggle: "Allow split payments"
- Max splits: number input (default 3)
- "Calculate change on combined total" checkbox

ADD CUSTOM METHOD:
- "+ Add Payment Method" card (dashed border, #2A2A30)
- Opens modal with: Name, Icon select, requires reference toggle
```

### Screen 7.3: Printing & Receipt Config
```
Design a printing and receipt configuration page.

HEADER: "Printing & Receipts" — Playfair 24px, Lucide Printer icon

CONNECTION CARD:
- Print Server URL: "http://localhost:3001" input
- Status indicator: 🟢 "Connected" or 🔴 "Disconnected"
- "Test Connection" button
- Request timeout: number input (ms)

PRINTER ASSIGNMENTS (table):
| Printer Name | Type | Station | Paper Size | Status |
| Main Receipt | Receipt | POS | 80mm | ✅ Active |
| Kitchen Printer | Kitchen | Kitchen | 80mm | ✅ Active |
| Barista Printer | Barista | Barista | 80mm | ✅ Active |
| Label Printer | Label | — | 62mm | ⚠️ Offline |

Each row has Edit/Test buttons.

RECEIPT TEMPLATE PREVIEW:
- Show a mini receipt preview (white card on dark bg, receipt-width):
  - The Breakery logo
  - Order #, date, cashier
  - Items with prices
  - Totals, tax, payment
  - Footer: "Thank you! Come again"
- "Customize Template" button
```

### Screen 7.4: Sync & Offline Advanced Settings
```
Design a sync and offline configuration page.

HEADER: "Sync & Offline" — Playfair 24px, Lucide RefreshCw icon

WARNING BANNER:
> ⚠️ Advanced Settings — Changing these values may affect system stability. Use presets below for recommended configurations.

PRESETS (3 cards, horizontal):
- 🏠 "Stable Connection" — optimized for reliable WiFi
- 📡 "Unstable Connection" — aggressive retry, shorter cache
- 🔋 "Battery Saver" — reduced sync frequency, longer intervals
Active preset highlighted with gold border.

SECTIONS (accordion/expandable):

1. "Sync Timing" — startup delay, poll interval, retry delays
2. "Queue Management" — max queue size, cleanup threshold, batch size
3. "Cache TTL" — product cache, order cache, credential cache (hours)
4. "LAN Settings" — heartbeat interval, reconnect delay, discovery timeout
5. "Debug" — verbose logging toggle, force sync button, clear cache button

Each setting: Label | Description (muted) | Input/Toggle | Default value note

SYNC STATUS PANEL (bottom):
- Current queue: "3 items pending"
- Last sync: "2 minutes ago"
- Conflicts: "0 unresolved"
- "Force Sync Now" button
```

---

## ⚫ BATCH 8 — Combos, Promotions & Floor Plan (4 screens)

### Screen 8.1: Combo Meal Builder
```
Design a combo meal creation/editing page.

HEADER: "Create Combo" — Playfair 24px
Back arrow + "Combos" breadcrumb

FORM:
- Combo name: "Breakfast Special" text input
- Description textarea
- Base price: "Rp 75.000" — with note "vs à la carte: Rp 95.000 (Save 21%)"
- Active toggle
- Image upload area

CHOICE GROUPS (drag-to-reorder cards):

Group 1: "Choose Your Pastry" (required, pick 1)
- Card: group name, min/max selection, required badge
- Items list: Croissant (+Rp 0), Pain au Chocolat (+Rp 5.000), Danish (+Rp 3.000)
- Each item shows: name, price adjustment, remove button
- "+ Add Item" inline button

Group 2: "Choose Your Drink" (required, pick 1)
- Americano (+Rp 0), Latte (+Rp 8.000), Orange Juice (+Rp 5.000)

Group 3: "Add Extra" (optional, pick 0-2)
- Butter (+Rp 3.000), Jam (+Rp 3.000), Extra Shot (+Rp 5.000)

"+ Add Choice Group" dashed card at bottom

PREVIEW COLUMN (right 35%):
- Mock POS card showing how combo appears in POS grid
- Price: Rp 75.000
- "Breakfast Special" with combo badge
```

### Screen 8.2: Promotions Manager
```
Design a promotions management page.

HEADER: "Promotions" — Playfair 28px, Lucide Percent icon
"+ New Promotion" gold button

PROMO CARDS (list view):
Each card:
- Promo name: "Happy Hour 20% Off" — bold
- Type badge: "Percentage" / "Buy X Get Y" / "Fixed Discount" / "Bundle"
- Date range: "Feb 1 — Feb 28, 2026"
- Time restriction: "14:00 — 17:00 only" (if applicable)
- Status: Active (green) / Scheduled (blue) / Expired (gray) / Paused (amber)
- Usage: "47 / 100 uses" progress bar
- Products: "All Drinks" or "Croissant, Danish" with product count badge
- Toggle: Active/Inactive switch
- Edit / Duplicate / Delete actions

CREATE/EDIT MODAL (wide, 800px):
- Name, description
- Discount type: Percentage / Fixed Amount / Buy X Get Y
- Value: "20%" or "Rp 10.000"
- Conditions: Min purchase (Rp), time range, day-of-week checkboxes
- Product scope: All / Selected categories / Selected products (multi-select)
- Usage limit: per customer + total cap
- Date range picker
- Priority: number (for stacking resolution)
```

### Screen 8.3: Floor Plan Editor
```
Design a restaurant floor plan editor for table management.

HEADER: "Floor Plan" — Playfair 24px, Lucide LayoutDashboard icon
"Edit Mode" toggle (gold switch)

CANVAS AREA (central, dark grid background):
- Draggable table elements:
  - Round tables: circles (seats: 2, 4, 6)
  - Rectangular tables: rounded rectangles (seats: 4, 6, 8)
  - Bar stools: small squares along a bar line
- Each table shows:
  - Table number (centered, cream)
  - Seats count (small badge)
  - Status color: Available (green outline), Occupied (gold fill), Reserved (blue outline)

TOOLBAR (left sidebar in edit mode):
- Add round table (2/4/6 seats)
- Add rectangular table (4/6/8 seats)
- Add bar counter
- Add wall/divider
- Add decoration (plant, pillar)
- Delete selected
- Snap to grid toggle

PROPERTIES PANEL (right, 280px, when table selected):
- Table number: editable
- Seats: stepper
- Zone: "Indoor" / "Outdoor" / "VIP" select
- Status: select
- Position: X, Y coordinates

LIVE VIEW (edit mode off):
- Tables show real-time status
- Click table → opens order for that table
- Occupied tables glow with gold pulse
```

### Screen 8.4: Category Pricing Matrix
```
Design a product-category pricing matrix page.

HEADER: "Category Pricing" — Playfair 24px
Subtitle: "Set custom prices per product for each customer category"

PRICING MATRIX TABLE (scrollable):
Row headers: Products (grouped by category)
Column headers: Retail (Standard) | Wholesale | Discount 10% | Hotel Partners

Example:
| Product | Retail | Wholesale | Discount 10% | Hotel |
|---------|--------|-----------|--------------|-------|
| **Pastries** | | | | |
| Croissant | Rp 35.000 | Rp 28.000 | Rp 31.500 | Rp 25.000 |
| Pain au Chocolat | Rp 42.000 | Rp 33.600 | Rp 37.800 | Rp 30.000 |
| **Breads** | | | | |
| Sourdough Loaf | Rp 65.000 | Rp 52.000 | Rp 58.500 | Rp 45.000 |

FEATURES:
- Cells are editable (click to edit, gold border on focus)
- Auto-calculated columns show derived price (muted) vs custom override (bold)
- Override indicator: small gold dot on custom prices
- "Reset to Default" link per cell to remove override
- Bulk actions: "Apply X% discount to selected" dropdown

SAVE: "Save All Changes" gold button (sticky bottom bar with unsaved indicator)
```

---

## � BATCH 9 — Dashboard (2 screens)

> **Priority:** High — Main landing page after login.

### Screen 9.1: Back Office Dashboard
```
Design a premium back-office dashboard for "The Breakery" bakery management system.

LAYOUT: Sidebar left (260px, #111113) + fluid content area (max-width 1400px)

HEADER:
- "Dashboard" — Playfair Display 28px, left-aligned
- Date: "Saturday, February 15, 2026" — muted taupe
- Right: Quick actions row — "New Order" (gold), "Quick Stock Check" (secondary), Lucide RefreshCw sync button

KPI CARDS ROW (4 across):
- Today's Revenue: "Rp 4.125.000" — Lucide TrendingUp icon, green badge "+12% vs yesterday"
- Today's Orders: "47" — Lucide ShoppingBag icon, blue badge
- Average Ticket: "Rp 87.766" — Lucide Receipt icon
- Items Sold: "234" — Lucide Package icon

CHARTS ROW (2 columns, 50%/50%):
- LEFT: "Sales Overview" area chart (7-day trend) — gold gradient fill, cream line, axes in muted taupe
  - Bottom: "Mon Tue Wed Thu Fri Sat Sun" labels
  - Hover tooltip: date + Rp amount
- RIGHT: "Revenue by Category" donut chart
  - Slices: Pastries 35% (gold), Breads 25% (amber), Drinks 20% (teal), Cakes 15% (rose), Other 5% (gray)
  - Center: Total "Rp 4.1M"

BOTTOM ROW (3 columns):

Column 1 — "Top Products" (card):
- Ranked list with mini bar chart:
  1. Croissant — 42 sold — Rp 1.470.000
  2. Sourdough — 28 sold — Rp 1.820.000
  3. Latte — 56 sold — Rp 1.680.000
  4. Pain au Chocolat — 31 sold — Rp 1.302.000
  5. Danish Pastry — 22 sold — Rp 770.000
- "View All Products →" gold link

Column 2 — "Inventory Alerts" (card):
- ⚠️ Low Stock: Butter (2.3 kg remaining) — amber badge
- ⚠️ Low Stock: Vanilla Extract (150 ml) — amber badge
- 🔴 Out of Stock: Almond Flour — red badge
- ✅ Reorder placed: Bread Flour — green badge
- "View Inventory →" gold link

Column 3 — "Recent Activity" (card):
- Timeline: Last 5 actions with time, user avatar, description
- "14:23 — Sarah completed Order #BRK-047"
- "14:15 — Mike received PO-2026-089"
- "13:58 — System sync: 3 orders pushed"
- "13:42 — Sarah voided Order #BRK-043"
- "View Audit Log →" gold link

FOOTER ROW — Quick Stats Bar (subtle bg #111113):
- Active Shift: "Shift #12 — Sarah (started 08:00)" with Lucide Clock
- Register Status: "Rp 500.000 in drawer" with Lucide Wallet
- Sync: "✅ Online — last sync 2 min ago" with Lucide RefreshCw
- Pending: "0 offline orders" with Lucide Cloud
```

### Screen 9.2: Manager Dashboard (Advanced)
```
Design a manager-level dashboard with financial insights.

HEADER: "Manager Dashboard" — Playfair 28px
Subtitle: "Performance overview" — muted taupe
Right: Period selector — "Today" | "This Week" | "This Month" | Custom date range

KPI ROW (5 cards):
- Gross Revenue: "Rp 28.450.000" (this week) — vs last week "+8.5%"
- Net Profit: "Rp 8.535.000" — margin "30%" badge in green
- COGS: "Rp 11.380.000" — Lucide TrendingDown, blue
- Total Customers: "189" — "34 new" green badge
- Staff Hours: "142h" — Lucide Clock

CHARTS (2×2 grid):
- Top Left: "Revenue vs COGS" stacked bar chart (daily) — gold bars (revenue) + dark amber bars (COGS)
- Top Right: "Hourly Heatmap" — 7×24 grid showing busiest hours (color intensity = sales volume)
  - Highlight peak: "Sat 10:00-12:00 — Rp 1.2M"
- Bottom Left: "Payment Mix" horizontal bar chart — Cash 45%, Card 30%, QRIS 20%, EDC 5%
- Bottom Right: "Staff Performance" table — Name | Orders | Revenue | Avg Ticket | Rating

OPERATIONAL ALERTS (full-width card):
- "3 items below reorder point" — amber, link to inventory
- "PO-2026-091 overdue by 2 days" — red, link to purchasing
- "2 B2B invoices unpaid > 30 days" — amber, link to B2B
- "Monthly PPN filing due in 13 days" — blue, link to accounting/vat
```

---

## 📦 BATCH 10 — Stock & Inventory Management (6 screens)

> **Priority:** High — Core operations for daily bakery management.

### Screen 10.1: Stock Overview (Main Inventory Page)
```
Design the main stock overview page for inventory management.

LAYOUT: Back office with sidebar. Content has a TAB BAR at top:
Tabs: Stock | Incoming | Waste | Production | Opname | Movements | Transfers | By Location
Active tab: "Stock" — gold underline + gold text

HEADER:
- "Stock & Inventory" — Playfair 28px, Lucide Warehouse icon
- Right: "Stock Alert Settings" gear icon + "Export" download button

STOCK ALERT SUMMARY (3 cards):
- 🔴 Out of Stock: "3 items" — red card, Lucide AlertCircle
- ⚠️ Below Minimum: "7 items" — amber card, Lucide AlertTriangle
- ✅ Healthy: "124 items" — green card, Lucide CheckCircle

SEARCH & FILTERS:
- Search: "Search products by name, SKU, barcode..."
- Category filter dropdown: All | Raw Materials | Semi-Finished | Finished Goods
- Stock status filter: All | In Stock | Low Stock | Out of Stock
- Location filter: All | Main Kitchen | Storage | Cold Room

STOCK TABLE:
Columns: Product | SKU | Category (badge) | Current Stock | Min Stock | Unit | Status | Last Movement | Actions
- Croissant | BRK-001 | Finished | 45 | 20 | pcs | ✅ OK | Feb 15, 14:23 | 👁️ ↕️
- Bread Flour | RAW-012 | Raw Material | 2.3 | 10 | kg | 🔴 Low | Feb 14, 16:00 | 👁️ ↕️
- Butter | RAW-005 | Raw Material | 0 | 5 | kg | ⛔ Out | Feb 13, 09:00 | 👁️ ↕️

STATUS BADGES:
- ✅ OK: green bg, stock > min_stock
- ⚠️ Low: amber bg, stock <= min_stock && stock > 0
- ⛔ Out: red bg, stock = 0

ACTIONS per row: View detail, Adjust stock (opens quick modal), Order (creates PO)

QUICK ADJUST MODAL:
- Product name display
- Adjustment type: Add / Remove / Set
- Quantity input with unit
- Reason: select (Received, Used, Waste, Correction, Other)
- Notes textarea
- "Confirm" gold button
```

### Screen 10.2: Incoming Stock / Goods Receipt
```
Design an incoming stock / goods receipt page.

TAB: "Incoming" active

HEADER:
- "Incoming Stock" — Playfair 24px, Lucide PackagePlus icon
- Right: "+ New Receipt" gold button

KPI CARDS (3):
- Pending Deliveries: "4" — Lucide Truck, amber
- Received Today: "2" — Lucide PackageCheck, green
- Expected This Week: "6" — Lucide Calendar, blue

INCOMING TABLE:
Columns: PO # | Supplier | Expected Date | Items | Status | Actions
- PO-2026-089 | Flour Mill Co. | Feb 15 | 5 items | ⏳ Expected | Receive
- PO-2026-085 | Dairy Fresh | Feb 14 | 3 items | ✅ Received | View
- PO-2026-082 | Vanilla Import | Feb 13 | 1 item | ⚠️ Partial | Complete

STATUS BADGES:
- ⏳ Expected: blue
- 🚚 In Transit: amber
- ✅ Received: green
- ⚠️ Partial: amber with "2/5 received" text

RECEIVE GOODS FORM (expanded panel or modal when clicking "Receive"):
- PO reference and supplier info header
- Table: Item | Ordered Qty | Received Qty (editable) | Unit | Unit Price | Total
  - Each row has quantity input with +/- steppers
  - Variance column: shows difference if received ≠ ordered (red text)
- Quality check: checkbox per item "Quality OK"
- Delivery note: text input for driver/reference
- "Confirm Receipt" gold button + "Save as Partial" secondary
- Receiving updates stock automatically and creates journal entry
```

### Screen 10.3: Waste & Spoilage Tracking
```
Design a waste/spoilage tracking page.

TAB: "Waste" active

HEADER:
- "Waste & Spoilage" — Playfair 24px, Lucide Trash2 icon
- Right: "+ Log Waste" gold button

KPI CARDS (3):
- Today's Waste: "Rp 125.000" — red badge
- This Month: "Rp 2.340.000" — amber badge
- Waste Rate: "3.2%" — green if <5%, amber if 5-10%, red if >10%

WASTE LOG TABLE:
Columns: Date | Product | Qty | Unit | Cost | Reason | Staff | Actions
- Feb 15 | Croissant | 5 | pcs | Rp 87.500 | Expired | Sarah | Edit/Delete
- Feb 15 | Sourdough | 2 | pcs | Rp 65.000 | Damaged | Mike | Edit/Delete
- Feb 14 | Milk | 1.5 | L | Rp 30.000 | Spoiled | Sarah | Edit/Delete

REASON BADGES (colored):
- Expired: amber
- Damaged: red
- Spoiled: orange
- Quality: purple
- Overproduction: blue
- Other: gray

WASTE ENTRY FORM (modal):
- Product search (autocomplete with stock levels shown)
- Quantity + unit (auto-filled from product)
- Reason dropdown
- Cost (auto-calculated from cost_price × qty, editable)
- Staff (auto-filled current user)
- Photo upload: camera icon to capture evidence (optional)
- Notes textarea
- "Log Waste" danger-styled button (reduces stock + creates journal entry)

WASTE ANALYTICS CARD (bottom):
- Bar chart: waste by category (last 30 days)
- Pie chart: waste by reason
- "Most wasted: Croissant (42 units / Rp 735.000 this month)"
```

### Screen 10.4: Production Entry & Tracking
```
Design a production entry and tracking page.

TAB: "Production" active

HEADER:
- "Production" — Playfair 24px, Lucide Factory icon
- Right: "+ New Production Batch" gold button

TODAY'S PRODUCTION (summary card):
- Batches Completed: 8 — Lucide CheckCircle green
- Items Produced: 234 — Lucide Package
- Ingredients Used: "45 items consumed" — Lucide ChefHat
- Est. Production Cost: "Rp 3.450.000" — monospace

PRODUCTION TABLE:
Columns: Batch # | Product | Qty Produced | Recipe | Ingredients Used | Cost | Staff | Time | Status
- B-0215-01 | Croissant | 48 pcs | Standard | 12 items | Rp 420.000 | Sarah | 06:00 | ✅ Done
- B-0215-02 | Sourdough | 24 pcs | Artisan | 8 items | Rp 360.000 | Mike | 06:30 | ✅ Done
- B-0215-03 | Danish | 36 pcs | Premium | 15 items | Rp 540.000 | Sarah | 07:15 | 🔄 In Progress

PRODUCTION ENTRY FORM (full-page or wide modal):
- Product select (autocomplete, filtered to type=finished or semi_finished)
- Recipe shown auto: ingredient list with required quantities
- Quantity to produce: number input (multiplier applied to recipe)

INGREDIENTS CONSUMPTION TABLE:
- Ingredient | Required | Available | Status
- Bread Flour | 5 kg | 12 kg | ✅ Sufficient
- Butter | 2 kg | 0.5 kg | 🔴 Insufficient — shows red warning
- Eggs | 24 pcs | 48 pcs | ✅ Sufficient

- Batch number: auto-generated "B-MMDD-XX"
- Staff: current user
- Notes: optional
- "Start Production" gold button → deducts ingredients from stock, adds finished product to stock
```

### Screen 10.5: Stock Opname / Physical Count
```
Design a physical inventory count (stock opname) page.

TAB: "Opname" active

HEADER:
- "Physical Inventory Count" — Playfair 24px, Lucide ClipboardCheck icon
- Right: "+ New Count Session" gold button

OPNAME SESSIONS TABLE:
Columns: Session # | Date | Location | Items Counted | Discrepancies | Status | Actions
- OP-2026-015 | Feb 15 | Main Kitchen | 124/124 | 3 items | ✅ Completed | View
- OP-2026-014 | Feb 10 | Cold Room | 45/45 | 1 item | ✅ Completed | View
- OP-2026-013 | Feb 05 | Storage | 0/78 | — | 🔵 Draft | Resume

STATUS FLOW: Draft → In Progress → Review → Completed

COUNT FORM (full page when starting/resuming):
- Session info header: OP number, date, location, staff
- Category filter tabs: All | Raw Materials | Semi-Finished | Finished

COUNT TABLE (main content):
Columns: Product | SKU | System Stock | Counted (editable) | Unit | Variance | Action
- Bread Flour | RAW-012 | 10.0 kg | [___] kg | kg | — | ✓
- Butter | RAW-005 | 5.0 kg | 4.5 kg | kg | -0.5 kg 🔴 | ✓
- Eggs | RAW-008 | 48 pcs | 48 pcs | pcs | 0 ✅ | ✓

"Counted" column: large editable input, gold border on focus
Variance: calculated auto, green if 0, amber if small, red if >10% difference
Checkmark button: marks item as counted

REVIEW PANEL (after all items counted):
- Summary: "124 items counted, 3 discrepancies found"
- Discrepancy list: Product | System | Actual | Variance | Adjustment Value
- Total adjustment: "+Rp 45.000 / -Rp 125.000"
- "Approve & Adjust Stock" gold button (creates adjustment journal entries)
- "Manager PIN required for adjustments > Rp 500.000"
```

### Screen 10.6: Stock Movements & Transfers
```
Design a stock movements history and internal transfers page.

TAB: "Movements" active (also show "Transfers" and "By Location" tabs)

=== MOVEMENTS VIEW ===

HEADER: "Stock Movements" — Playfair 24px, Lucide ArrowLeftRight icon
Right: "Export" button + date range picker

FILTERS:
- Product search
- Movement type: All | Purchase | Sale | Production | Waste | Adjustment | Transfer
- Direction: All | In | Out
- Date range

MOVEMENTS TABLE:
Columns: Date/Time | Product | Type (badge) | Direction | Qty | Unit | Reference | By
- Feb 15 14:23 | Croissant | Sale | ↘ Out | -5 | pcs | ORD-BRK-047 | Sarah
- Feb 15 10:00 | Bread Flour | Purchase | ↗ In | +25 | kg | PO-2026-089 | Mike
- Feb 15 07:15 | Croissant | Production | ↗ In | +48 | pcs | B-0215-01 | Sarah
- Feb 15 07:15 | Bread Flour | Production | ↘ Out | -5 | kg | B-0215-01 | Sarah
- Feb 14 16:00 | Croissant | Waste | ↘ Out | -3 | pcs | WS-0214-02 | Mike

TYPE BADGES: Purchase=green, Sale=blue, Production=purple, Waste=red, Adjustment=amber, Transfer=teal
DIRECTION ARROWS: ↗ In = green, ↘ Out = red

=== TRANSFERS VIEW (separate tab) ===

HEADER: "Internal Transfers" — "+ New Transfer" gold button

TRANSFERS TABLE:
Columns: Transfer # | From | To | Items | Date | Status | Actions
- TRF-028 | Storage → Main Kitchen | 8 items | Feb 15 | ✅ Completed | View
- TRF-027 | Cold Room → Display | 3 items | Feb 15 | ⏳ Pending | Approve

TRANSFER FORM:
- From location: select
- To location: select
- Items table: Product search + Qty + Unit
- "+ Add Item" button
- Notes
- "Submit Transfer" gold button

=== BY LOCATION VIEW (separate tab) ===

LOCATION CARDS (grid):
Each location card:
- Location name: "Main Kitchen" / "Cold Room" / "Storage" / "Display"
- Total items: "124 items"
- Total value: "Rp 18.300.000"
- Low stock count: "3 items" amber badge
- Click to expand → show product list for that location
```

---

## 🧁 BATCH 11 — Product Management (5 screens)

> **Priority:** High — Managing the bakery catalog.

### Screen 11.1: Products List Page
```
Design a high-density product catalog management page.

LAYOUT: Back office with sidebar, content has TAB BAR:
Tabs: Products | Combos | Promotions
Active: "Products" — gold underline

HEADER:
- "Products" — Playfair 28px, Lucide Package icon
- Right: "+ New Product" gold button + "Import/Export" secondary button

KPI CARDS (4):
- Total Products: "156" — Lucide Package
- Active: "142" — green badge
- Low Stock: "7" — amber badge
- Out of Stock: "3" — red badge

FILTERS BAR:
- Search: "Search by name, SKU, barcode..." with Lucide Search
- Category filter: All | Pastries | Breads | Drinks | Cakes | Raw Materials | Semi-Finished
- Type filter: All | Finished Goods | Semi-Finished | Raw Material
- Status filter: All | Active | Inactive
- View toggle: Grid (Lucide Grid3X3) | List (Lucide List) — gold for active

=== GRID VIEW (default, 4 columns) ===
Each product card (bg #1A1A1D, rounded-12, hover translateY(-2px)):
- Product image (16:9, rounded-top, placeholder if none)
- Category badge (top-right overlay): "Pastries" in small pill
- Product name: Inter 14px, bold, cream
- SKU: monospace, muted, small "BRK-001"
- Price: "Rp 35.000" monospace gold
- Cost: "Rp 17.500" small muted (50% margin)
- Stock: "45 pcs" with status dot (green/amber/red)
- Type badge: "Finished" blue | "Raw" gray | "Semi" purple
- Quick actions on hover: Edit (Lucide Pencil), Duplicate, Toggle active

=== LIST VIEW ===
TABLE: Name | SKU | Category | Type | Price | Cost | Margin | Stock | Status | Actions
Sortable columns, row hover #222226

EMPTY STATE: Lucide Package 64px muted, "No products yet. Create your first product."
PAGINATION: "1-50 of 156 products"
```

### Screen 11.2: Product Create/Edit Form
```
Design a comprehensive product creation/editing form.

HEADER: "New Product" or "Edit: Croissant" — Playfair 24px
Breadcrumb: Products > New Product

LAYOUT: Two-column (65% form / 35% preview)

LEFT — Form Sections (accordion/scrollable):

Section 1: "Basic Information"
- Name: text input, "Croissant"
- SKU: auto-generated or manual, "BRK-001"
- Barcode: text input with Lucide ScanLine icon (optional)
- Description: textarea
- Category: searchable select with "+ Create" option
- Type: radio — Finished Good | Semi-Finished | Raw Material
- Active toggle (gold switch)

Section 2: "Pricing"
- Selling price: "Rp 35.000" — large input, gold emphasis
- Cost price: "Rp 17.500" — shows calculated margin "50%"
- Wholesale price: "Rp 28.000" (optional)
- Tax: "PPN 10% included" toggle (default on)
- "Category Pricing →" link to open pricing matrix

Section 3: "Inventory"
- Track stock: toggle (on by default for raw/semi)
- Current stock: number + unit select (pcs, kg, L, g, ml)
- Minimum stock: number (triggers low stock alert)
- Location: select (Main Kitchen, Storage, Cold Room)

Section 4: "Recipe / BOM" (only for finished/semi-finished)
- Ingredient table: Product (search) | Qty | Unit | Cost
  - Bread Flour | 0.15 | kg | Rp 2.250
  - Butter | 0.08 | kg | Rp 4.800
  - Eggs | 2 | pcs | Rp 4.000
- "+ Add Ingredient" button
- Total recipe cost: "Rp 17.500" — vs selling price margin display
- Yield: "12 pieces per batch"

Section 5: "Modifiers" (optional)
- Modifier groups: Size (S/M/L), Extras (cheese, ham)
- Each modifier: Name | Price Adjustment | Active toggle
- "+ Add Modifier Group" button

Section 6: "Image"
- Image upload area (drag & drop or click)
- Preview thumbnail
- "Remove" option

RIGHT — Preview Card:
- Mock POS card showing how product appears in POS grid
- Name, price, image thumbnail, category badge
- "As seen on POS terminal"

BOTTOM BUTTONS (sticky):
- "Cancel" secondary
- "Save Draft" secondary
- "Save & Publish" gold button
```

### Screen 11.3: Product Detail Page (Read-only View)
```
Design a product detail page for viewing product info and analytics.

HEADER: "Croissant" — Playfair 24px + category badge "Pastries"
Right: "Edit" gold button + "Duplicate" + "Delete" (danger) + status toggle

LAYOUT: Two-column (60%/40%)

LEFT:
- Product image (large, 400px, rounded-12)
- Basic info card: SKU, barcode, description, type, category, created date, status

- "Pricing" card:
  | Type | Price |
  | Retail | Rp 35.000 |
  | Wholesale | Rp 28.000 |
  | Cost | Rp 17.500 |
  | Margin | 50% |

- "Recipe" card (expandable):
  - Ingredient list with quantities and costs
  - Total cost per unit
  - "Edit Recipe" link

- "Modifiers" card:
  - List of modifier groups with options and prices

RIGHT:
- "Stock Status" card:
  - Current: 45 pcs (progress bar vs min 20)
  - Location: Main Kitchen
  - Last movement: "Feb 15 14:23 — Sale (-5)"
  - "Recent Movements" mini table (last 5)
  - "Adjust Stock" button

- "Performance" card (charts):
  - Units sold (last 30 days): sparkline chart
  - Revenue: "Rp 12.250.000 this month"
  - Avg daily: "28 units"
  - Rank: "#1 in Pastries"

- "Price History" card:
  - Timeline of price changes with dates and amounts
```

### Screen 11.4: Combo Meals Management
```
Design a combo meals management page.

TAB: "Combos" active

HEADER: "Combo Meals" — Playfair 24px, Lucide Layers icon
Right: "+ New Combo" gold button

COMBO CARDS (2-column grid):
Each card:
- Combo name: "Breakfast Special" — bold
- Image (wide, on top)
- Description text (muted, 2 lines max)
- Prices: "Rp 75.000" (combo) vs "Rp 95.000" (à la carte) — shows savings "Save 21%"
- Choice groups preview: "1 Pastry + 1 Drink + 0-2 Extras"
- Status: Active (green) / Inactive (gray) toggle
- Sales count: "145 sold this month"
- Actions: Edit | Duplicate | Delete

COMBO FORM (full page, linked from 11.4):
- Name, description, image upload
- Base price input (Rp)
- Active toggle

- CHOICE GROUPS (drag-to-reorder):
  Group card:
  - Group name: "Choose Your Pastry" (editable)
  - Selection rule: Required/Optional + Min/Max picks
  - ITEMS table: Product (search) | Price Adjustment | Active
    - Croissant | +Rp 0 | ✅
    - Pain au Chocolat | +Rp 5.000 | ✅
    - Danish | +Rp 3.000 | ✅
  - "+ Add Item" inline button
  - Remove group: trash icon

- "+ Add Choice Group" dashed card at bottom

- PREVIEW (right 35%): POS card mock + price summary
- "Save Combo" gold button
```

### Screen 11.5: Promotions Management
```
Design a promotions management page.

TAB: "Promotions" active

HEADER: "Promotions" — Playfair 24px, Lucide Percent icon
Right: "+ New Promotion" gold button

PROMO CARDS (list view):
Each card:
- Promo name: "Happy Hour 20% Off"
- Type badge: "Percentage" / "Buy X Get Y" / "Fixed Discount" / "Bundle"
- Date range: "Feb 1 — Feb 28, 2026"
- Time restriction: "14:00 — 17:00 only" (if set)
- Status: Active (green) / Scheduled (blue) / Expired (gray) / Paused (amber)
- Usage: "47 / 100 uses" with progress bar
- Products: "All Drinks" or "Croissant, Danish" with count badge
- Toggle: Active/Inactive switch
- Actions: Edit | Duplicate | Delete

PROMOTION FORM (full page):
- Name, description
- Discount type: Percentage | Fixed Amount | Buy X Get Y — radio group
- Value: "20%" number input or "Rp 10.000"
- Conditions section:
  - Min purchase: Rp [___]
  - Time range: HH:MM — HH:MM
  - Days: Mon ☑ Tue ☑ Wed ☑ Thu ☑ Fri ☑ Sat ☑ Sun ☑
- Product scope: All Products | Selected Categories (multi-select) | Selected Products (search + add)
- Usage limits: Max per customer [___] + Total cap [___]
- Date range picker: Start date — End date
- Priority: number (1 = highest, for stacking resolution)
- "Save Promotion" gold button
```

---

## 📊 BATCH 12 — Reports (5 screens)

> **Priority:** High — Business intelligence and analytics.

### Screen 12.1: Reports Hub (Overview Tab)
```
Design the main reports hub page with tabbed navigation.

HEADER: "Reports & Analytics" — Playfair 28px, Lucide BarChart3 icon
Right: "Export All" button + date range picker (default: "This Month")

TAB BAR (scrollable, gold underline active):
Overview | Daily Sales | Sales by Category | Sales by Hour | Product Performance |
Sales by Customer | Payment Methods | Discounts & Voids | Cancellations | Service Speed |
Inventory | Stock Movements | Stock Warnings | Expired Stock | Unsold Products |
Profit & Loss | Expenses | B2B Receivables | Purchase by Supplier | Purchase by Date |
Purchase Details | Outstanding Payments | Session Cash | Alerts | Price Changes | Audit

=== OVERVIEW TAB ===

KEY METRICS ROW (5 cards):
- Total Revenue: "Rp 28.450.000" — trending up 8.5%
- Total Orders: "347"
- Avg Ticket: "Rp 81.987"
- Unique Customers: "189"
- Items Sold: "1,247"

CHARTS:
- Revenue trend (daily, line chart, gold line with area fill)
- Top 10 products (horizontal bar chart)
- Revenue by category (donut chart)
- Hourly distribution (bar chart, shows peak hours)

QUICK LINKS:
- "View detailed sales →" | "View inventory →" | "View P&L →"
```

### Screen 12.2: Daily Sales & Drill-Down
```
Design a daily sales report with drill-down capability.

TAB: "Daily Sales" active

DATE RANGE: Calendar selector with preset buttons (Today, Yesterday, This Week, This Month, Custom)

SUMMARY CARDS:
- Revenue: "Rp 4.125.000" | Orders: "47" | Avg Ticket: "Rp 87.766" | Customers: "34"

DAILY TABLE:
Columns: Date | Orders | Revenue | Avg Ticket | Top Product | ▲ vs Prev Day
- Feb 15 | 47 | Rp 4.125.000 | Rp 87.766 | Croissant | +12%
- Feb 14 | 42 | Rp 3.680.000 | Rp 87.619 | Sourdough | -3%
Rows are clickable (gold text).

DRILL-DOWN PANEL (slides in when clicking a date):
- Date header: "Saturday, February 15, 2026"
- Hourly breakdown: bar chart (06:00 to 22:00)
- Orders list: mini table with Order #, Time, Items, Total, Payment
- Payment split: Cash/Card/QRIS/EDC pie chart
- Staff performance: table with Name, Orders, Revenue
- "Close" or "Back to Overview" button

CHART: Stacked area chart — Revenue trend (7/14/30 day toggle)

EXPORT: "Export CSV" + "Export PDF" buttons
```

### Screen 12.3: Product Performance Report
```
Design a product performance analytics page.

TAB: "Product Performance" active

DATE RANGE: selector with presets

TOP PERFORMERS TABLE:
Columns: Rank | Product | Category | Units Sold | Revenue | Avg Price | Margin % | Trend (sparkline)
- #1 | Croissant | Pastries | 842 | Rp 29.470.000 | Rp 35.000 | 50% | ↗
- #2 | Latte | Drinks | 756 | Rp 22.680.000 | Rp 30.000 | 65% | ↗
- #3 | Sourdough | Breads | 523 | Rp 33.995.000 | Rp 65.000 | 40% | →
...

SORT: By Revenue | By Units | By Margin | By Growth

CHARTS:
- Top 10 by revenue (horizontal bar, gold bars)
- Category breakdown (donut chart, each category colored)
- Growth trend: line chart comparing current vs previous period
- Bottom 10 performers (table, amber/red highlighting)

SPECIAL SECTIONS:
- "Unsold Products" alert: products with 0 sales in period — Lucide AlertTriangle
- "Deleted Products" tab: products removed during period
- "Price Changes" tab: log of price modifications with before/after
```

### Screen 12.4: Session & Cash Balance Report
```
Design a POS shift session and cash balance report.

TAB: "Session Cash" active

SESSION TABLE:
Columns: Shift # | Date | Cashier | Open Time | Close Time | Duration | Opening Balance | Closing Balance | Expected | Variance
- #12 | Feb 15 | Sarah | 08:00 | 16:00 | 8h | Rp 500.000 | Rp 4.625.000 | Rp 4.625.000 | ✅ Rp 0
- #11 | Feb 14 | Mike | 08:00 | 16:00 | 8h | Rp 500.000 | Rp 3.850.000 | Rp 3.900.000 | 🔴 -Rp 50.000

VARIANCE: green if 0, amber if small (<Rp 10.000), red if large (>Rp 10.000)

SESSION DETAIL (expandable or side panel):
- Cashier info, shift times
- Sales breakdown: Cash | Card | QRIS | EDC with amounts
- Denominations counted (if entered at close):
  | Denomination | Count | Subtotal |
  | Rp 100.000 | 40 | Rp 4.000.000 |
  | Rp 50.000 | 10 | Rp 500.000 |
  | Rp 20.000 | 5 | Rp 100.000 |
  | Coins | — | Rp 25.000 |
- Summary: Expected vs Actual with variance highlighted
- "Session Notes" text area (if any notes from cashier)

CHART: Cash variance trend (bar chart, last 30 sessions)
```

### Screen 12.5: Profit & Loss Statement
```
Design a profit & loss (income statement) report.

TAB: "Profit & Loss" active

PERIOD: Month selector (February 2026) + comparison toggle "vs Previous Month"

P&L LAYOUT (financial statement format):

REVENUE SECTION:
  Gross Sales                    Rp 28.450.000
  Less: Discounts                (Rp 1.250.000)
  Less: Voids/Refunds            (Rp 340.000)
  ─────────────────────────────────────────────
  Net Revenue                     Rp 26.860.000     100%

COST OF GOODS SOLD:
  Raw Materials Consumed          Rp 8.200.000
  Packaging                       Rp 650.000
  Waste & Spoilage                Rp 2.340.000
  ─────────────────────────────────────────────
  Total COGS                      Rp 11.190.000      42%
  ─────────────────────────────────────────────
  GROSS PROFIT                    Rp 15.670.000      58%

OPERATING EXPENSES:
  Salaries & Wages                Rp 4.500.000
  Rent                            Rp 2.500.000
  Utilities                       Rp 800.000
  Marketing                       Rp 250.000
  Other Expenses                  Rp 350.000
  ─────────────────────────────────────────────
  Total Expenses                  Rp 8.400.000      31%
  ─────────────────────────────────────────────
  NET PROFIT                      Rp 7.270.000      27%

STYLE:
- Amounts: right-aligned, monospace, JetBrains Mono
- Credits/negatives in parentheses with muted color
- Totals: bold gold text
- Net Profit: large, Playfair 28px, gold if positive, red if negative
- Percentage column: each line as % of Net Revenue
- vs Previous: green arrow up / red arrow down with delta

CHART: Monthly P&L trend (last 6 months, grouped bar: Revenue / COGS / Net Profit)
EXPORT: "Export PDF" + "Export CSV"
```

---

## 🛒 BATCH 13 — Purchasing (4 screens)

> **Priority:** Medium — Supplier and purchase order management.

### Screen 13.1: Supplier Management
```
Design a supplier management page.

HEADER: "Suppliers" — Playfair 28px, Lucide Truck icon
Right: "+ New Supplier" gold button

SEARCH & FILTER:
- Search: "Search by name, phone, email..."
- Category filter: All | Flour & Grains | Dairy | Packaging | Equipment
- Status: Active | Inactive

SUPPLIER CARDS (grid, 3 columns):
Each card (bg #1A1A1D, rounded-12):
- Company name: bold, Inter 16px
- Contact person: muted
- Phone: with Lucide Phone icon
- Email: with Lucide Mail icon
- Category badge: "Flour & Grains" (colored pill)
- Status dot: green (active) / gray (inactive)
- Stats row: "12 POs | Rp 45.2M total | Last order: Feb 12"
- Actions: Edit | View POs | Toggle Status

SUPPLIER FORM (side panel or modal):
- Company name, contact person, phone, email
- Address: textarea
- Category: select
- Tax ID (NPWP): text input
- Payment terms: "Net 30" / "Net 15" / "COD" / "Custom" select
- Bank details: Bank name, account number, account holder
- Notes: textarea
- "Save Supplier" gold button
```

### Screen 13.2: Purchase Orders List
```
Design a purchase order management page.

HEADER: "Purchase Orders" — Playfair 28px, Lucide ClipboardList icon
Right: "+ New PO" gold button

KPI CARDS (4):
- Open POs: "6" — Lucide FileText, blue
- Pending Delivery: "3" — Lucide Truck, amber
- This Month Total: "Rp 15.400.000" — Lucide Banknote, green
- Overdue: "1" — Lucide AlertCircle, red

FILTERS:
- Search: "Search by PO #, supplier..."
- Status: All | Draft | Sent | Partial | Received | Cancelled
- Supplier: dropdown
- Date range

PO TABLE:
Columns: PO # | Supplier | Date | Items | Total (Rp) | Expected Date | Status | Actions
- PO-2026-091 | Flour Mill Co. | Feb 15 | 5 items | Rp 3.200.000 | Feb 18 | 🟡 Sent | View/Edit/Receive
- PO-2026-089 | Dairy Fresh | Feb 13 | 3 items | Rp 1.850.000 | Feb 15 | ✅ Received | View
- PO-2026-088 | Vanilla Import | Feb 12 | 2 items | Rp 950.000 | Feb 14 | 🔴 Overdue | View/Receive

STATUS BADGES:
- Draft: gray
- Sent: blue
- Partial: amber (with "2/5 items" text)
- Received: green
- Cancelled: red with strikethrough
- Overdue: red + pulsing dot

PAGINATION: "1-25 of 89 orders"
```

### Screen 13.3: Purchase Order Form (Create/Edit)
```
Design a purchase order creation form.

HEADER: "New Purchase Order" — Playfair 24px
Auto-generated: "PO-2026-092" monospace

FORM:
- Supplier: searchable select (shows recent suppliers) — required
  - Once selected: show supplier info card (contact, phone, terms)
- PO date: date picker (default today)
- Expected delivery: date picker
- Delivery location: select (Main Kitchen / Storage / Cold Room)
- Reference: optional text

ITEMS TABLE (main section):
Columns: Product (search) | SKU | Current Stock | Qty | Unit | Unit Price | Total
- [Search product...] | — | — | — | — | — | —
- Bread Flour | RAW-012 | 2.3 kg | 25 | kg | Rp 15.000 | Rp 375.000
- Butter | RAW-005 | 0 kg | 10 | kg | Rp 60.000 | Rp 600.000
- Eggs | RAW-008 | 48 pcs | 100 | pcs | Rp 3.000 | Rp 300.000

"+ Add Item" button below table
Product search: autocomplete filtered to raw materials and semi-finished, showing current stock prominently

TOTALS (bottom card, gold border-top):
- Subtotal: Rp 1.275.000
- PPN 10%: Rp 127.500
- Discount: -Rp 0
- Grand Total: Rp 1.402.500 (large, gold, monospace)

NOTES: textarea "Additional notes for supplier..."

BUTTONS (sticky bottom):
- "Cancel" text link
- "Save as Draft" secondary button
- "Send to Supplier" gold button (changes status to Sent, optionally emails)
```

### Screen 13.4: Purchase Order Detail
```
Design a purchase order detail/view page.

HEADER:
- PO #: "PO-2026-091" Playfair 24px + status badge "SENT"
- Right: "Edit" | "Receive Goods" gold button | "Print" | "Cancel PO" danger | More menu

LAYOUT: Two-column (65%/35%)

LEFT:
- PO Info card: PO #, date, expected delivery, location
- Supplier info card: Name, contact, phone, email, payment terms

- ITEMS TABLE:
  Columns: Product | Qty Ordered | Qty Received | Unit | Unit Price | Total | Status
  - Bread Flour | 25 kg | 25 kg | kg | Rp 15.000 | Rp 375.000 | ✅
  - Butter | 10 kg | 8 kg | kg | Rp 60.000 | Rp 600.000 | ⚠️ Partial
  - Eggs | 100 pcs | 0 pcs | pcs | Rp 3.000 | Rp 300.000 | ⏳ Pending

- TOTALS:
  Subtotal + PPN + Total

- Notes section

RIGHT:
- "Timeline" card (vertical timeline):
  - Feb 15 10:00 — PO Created by Sarah
  - Feb 15 10:05 — Sent to Supplier
  - Feb 15 14:00 — Partial delivery received by Mike
  - ⏳ Pending: Full delivery

- "Receiving History" card:
  - Receipt #1: Feb 15 — 2/3 items, Rp 975.000
  - Receipt #2: Pending...

- "Payment Status" card:
  - Total: Rp 1.402.500
  - Paid: Rp 0
  - Due: Rp 1.402.500
  - Terms: "Net 30 — Due Mar 17"
  - "Record Payment" button

STATUS PROGRESSION BAR (top):
Draft → Sent → Partial → Received (with checkmarks on completed steps, gold active)
```

---

## ⚙️ BATCH 14 — Settings (6 screens)

> **Priority:** Medium — System configuration and customization.

### Screen 14.1: Company Settings
```
Design the company information settings page.

LAYOUT: Settings sidebar (260px) left + content right
See Batch 7 Screen 7.1 for sidebar navigation structure.

CONTENT: "Company Information" — Playfair 24px

FORM SECTIONS:

Section: "Business Details"
- Business name: "The Breakery" input
- Legal name: "PT The Breakery Indonesia" input
- Tax ID (NPWP): "12.345.678.9-012.000" formatted input
- Industry: "Bakery / Food & Beverage" (read-only or select)

Section: "Contact Information"
- Phone: "+62 370 XXX XXX" input
- Email: "info@thebreakery.id" input
- Website: "thebreakery.id" input
- Address: textarea — "Jl. Raya Senggigi No. 42, Lombok, NTB 83355"

Section: "Branding"
- Logo upload: drag & drop area (shows current logo preview)
- "Replace" and "Remove" buttons below logo
- Brand colors: Primary color picker (shows current #C9A55C)

Section: "Operating Hours"
- Day-by-day table: Mon-Sun | Open Time | Close Time | Closed toggle
  - Mon | 06:00 | 22:00 | ☐
  - Tue | 06:00 | 22:00 | ☐
  - Sun | 08:00 | 20:00 | ☐
- Special hours: "+ Add Holiday" button

"Save Changes" gold button (sticky bottom, appears on changes)
```

### Screen 14.2: POS Configuration
```
Design the POS terminal configuration page.

CONTENT: "POS Configuration" — Playfair 24px, Lucide ShoppingCart icon

SECTIONS:

Section: "General"
- Default order type: Dine-in | Takeaway | Delivery (radio)
- Auto-print receipt: toggle
- Send to Kitchen (KDS) by default: toggle
- Require customer for B2B orders: toggle

Section: "Shift & Register"
- Require shift opening: toggle
- Default opening balance: "Rp 500.000" input
- Allow shift close without balance reconciliation: toggle (off by default, warning if enabled)
- Auto-close shift after: "12 hours" input

Section: "Discounts"
- Allow manual discounts: toggle
- Max discount %: "50%" input
- Require manager PIN for discounts above: "20%" input
- Predefined discounts: table
  | Name | Type | Value | Active |
  | Staff Discount | Percentage | 15% | ✅ |
  | Loyalty 10% | Percentage | 10% | ✅ |
  | Rp 5K Off | Fixed | Rp 5.000 | ✅ |
  - "+ Add Discount" button

Section: "Cart"
- Hold order timeout: "30 minutes" select
- Max cart items: "50" input
- Allow negative stock sales: toggle (off default, amber warning)

"Save Configuration" gold button
```

### Screen 14.3: Tax & Financial Settings
```
Design tax and financial configuration page.

CONTENT: "Tax & Financial" — Playfair 24px, Lucide Receipt icon

Section: "Tax (PPN)"
- Tax rate: "10%" large input
- Tax name: "PPN" input
- Tax calculation: "Price includes tax" / "Price excludes tax" radio
  - Info box: "Currently: prices include PPN. Rp 110.000 = Rp 100.000 + Rp 10.000 tax"
- Tax registration number: NPWP input
- Show tax on receipts: toggle
- Auto-calculate on all items: toggle

Section: "Currency"
- Currency: "IDR — Indonesian Rupiah" select (locked)
- Format preview: "Rp 1.250.000"
- Decimal places: "0" (read-only for IDR)
- Thousands separator: "." (read-only)

Section: "Fiscal Year"
- Start month: "January" select
- Current fiscal year: "2026" display
- "Close Fiscal Year" button (disabled until year end, with warning modal)

Section: "Rounding"
- Cash rounding: "Rp 100" / "Rp 500" / "Rp 1.000" / "Off" — select
- Rounding method: "Round to nearest" / "Round down" / "Round up"
- Preview: "Rp 87.766 → Rp 87.800" (for Rp 100 rounding)

"Save Tax Settings" gold button
```

### Screen 14.4: Inventory Configuration
```
Design inventory management configuration page.

CONTENT: "Inventory Configuration" — Playfair 24px, Lucide Warehouse icon

Section: "Stock Tracking"
- Track stock levels: toggle (master switch)
- Allow negative stock: toggle (off default, danger warning)
- Auto-deduct on sale: toggle (on default)
- Deduct based on recipe (BOM): toggle (on default)

Section: "Alerts & Reorder"
- Low stock alert threshold: "Default minimum stock" / "Custom %" select
- Email notifications for low stock: toggle
- Auto-generate PO when low: toggle (beta badge)
- Reorder point: "When stock reaches min level" info text

Section: "Locations"
- Location table:
  | Name | Type | Active | Items |
  | Main Kitchen | Kitchen | ✅ | 78 |
  | Cold Room | Storage | ✅ | 45 |
  | Dry Storage | Storage | ✅ | 65 |
  | Display | Display | ✅ | 12 |
- "+ Add Location" button
- Edit/toggle per location

Section: "Stock Count (Opname)"
- Require scheduled counts: toggle
- Count frequency: Weekly / Monthly / Quarterly select
- Next scheduled count: "Feb 20, 2026" display
- Require manager approval for adjustments: toggle
- Adjustment limit without approval: "Rp 500.000" input

Section: "Waste Management"
- Require reason for waste: toggle (on)
- Require photo for waste > Rp 100.000: toggle
- Waste alert threshold: "5% of usage" input

"Save Inventory Settings" gold button
```

### Screen 14.5: KDS & Display Configuration
```
Design KDS and customer display configuration page.

CONTENT: "Kitchen Display & Customer Display" — Playfair 24px

Section: "KDS Stations"
- Station table:
  | Name | Type | URL | Status |
  | Kitchen | Kitchen | /kds/kitchen | 🟢 Connected |
  | Barista | Barista | /kds/barista | 🟢 Connected |
  | Expediter | Display | /kds/display | 🟡 Idle |
- "+ Add Station" button
- Per station: Name, type (Kitchen/Barista/Display), assigned categories, auto-accept timeout

Section: "Order Routing"
- Route by category rules:
  | Category | Station |
  | Pastries, Breads, Cakes | Kitchen |
  | Drinks, Coffee | Barista |
  | All | Display (read-only) |
- "Edit Routing" button opens inline edit

Section: "Alerts & Timing"
- Warning threshold: "5 minutes" — order card turns amber
- Urgent threshold: "10 minutes" — order card turns red with pulse
- Alert sound: toggle + sound select
- Auto-bump completed orders after: "2 minutes" input

Section: "Customer Display"
- Enable customer display: toggle
- Display URL: /display (read-only, with copy button)
- Idle rotation: toggle
  - Promotional images upload (carousel)
  - Rotation interval: "10 seconds" input
- Show order progress: toggle
- Show loyalty points earned: toggle

"Save Display Settings" gold button
```

### Screen 14.6: Security & PIN Settings
```
Design security and PIN configuration page.

CONTENT: "Security & PIN" — Playfair 24px, Lucide Shield icon

Section: "PIN Authentication"
- Enable offline PIN login: toggle
- PIN length: "4" / "5" / "6" digit select
- PIN complexity: "Numbers only" / "Alphanumeric" select
- PIN expiry: "Never" / "30 days" / "60 days" / "90 days"
- Max failed attempts: "5" input
- Lockout duration: "15 minutes" input

Section: "Action Verification (PIN Required)"
Checklist of actions requiring manager PIN:
- ☑ Void orders
- ☑ Apply discount > threshold
- ☑ Process refunds
- ☑ Stock adjustments > limit
- ☐ View financial reports
- ☐ Edit product prices
- ☑ Close shift with variance
- "Select All" / "Deselect All" buttons

Section: "Session Security"
- Auto-logout after inactivity: "30 minutes" input
- Lock screen after: "5 minutes" input (returns to PIN screen)
- Concurrent sessions: "1 device per user" / "Unlimited" select

Section: "Data Protection"
- Export data encryption: toggle
- Mask customer phone in reports: toggle
- Audit log retention: "12 months" / "24 months" / "Indefinite" select

"Save Security Settings" gold button
```

---

## �📐 DESIGN SPECIFICATIONS FOR ALL SCREENS

### Responsive Breakpoints
| Target | Width | Notes |
|--------|-------|-------|
| Desktop | 1920px | Primary — sidebar + content |
| Laptop | 1440px | Sidebar collapses to icons |
| Tablet | 1024px | Stack to single column, keep sidebar as drawer |
| Mobile | 390px | Bottom nav, no sidebar, full-width cards |

### Common Components (Reference)
- **Sidebar**: Fixed left, 260px, #111113, gold active indicator
- **Breadcrumbs**: Home > Module > Page — muted taupe, last item cream
- **Data Tables**: Sortable columns, hover rows, sticky header
- **Empty States**: Centered icon (64px, muted) + message + CTA button
- **Loading**: Gold shimmer skeletons matching content layout
- **Toast Messages**: Top-right, auto-dismiss, color-coded by type
- **Confirmation Dialogs**: Centered modal, icon + message + actions

### Accessibility
- All interactive elements: visible focus ring (2px gold outline, 2px offset)
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Touch targets: minimum 44×44px on mobile
- Screen reader: proper heading hierarchy, ARIA labels on icon-only buttons
