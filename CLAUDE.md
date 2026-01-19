# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppGrav is a full-stack ERP/POS system for "The Breakery," a French bakery in Lombok, Indonesia. The system handles ~200 transactions/day with 10% tax calculation and supports three languages (French, English, Indonesian).

## Development Commands

```bash
# Start development server (port 3000)
npm run dev

# Build for production (TypeScript check + Vite build)
npm run build

# Lint codebase
npm run lint

# Preview production build
npm run preview

# Test Claude API integration
npm run test:claude

# Run tests (Vitest)
npx vitest
```

## Tech Stack

- **Frontend**: React 18.2 + TypeScript 5.2 + Vite 5.x
- **State Management**: Zustand (cart, auth, orders stores)
- **Styling**: Tailwind CSS + Lucide React icons
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Routing**: React Router DOM 6.x
- **Data Fetching**: @tanstack/react-query
- **i18n**: i18next (French default, English, Indonesian)
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library + jsdom
- **AI Integration**: Anthropic Claude SDK

## Architecture

### Directory Structure

```
src/
├── components/       # React components by feature
│   ├── pos/         # POS components (Cart, PaymentModal, ModifierModal, etc.)
│   ├── inventory/   # Inventory components (InventoryTable, StockAdjustmentModal)
│   ├── kds/         # Kitchen Display System components
│   ├── settings/    # Settings components (FloorPlanEditor)
│   └── ui/          # Reusable UI components (Button, Card, Input, Badge)
├── pages/           # Route-based page components
│   ├── pos/         # POS main page
│   ├── kds/         # Kitchen Display System pages
│   ├── customers/   # Customer management module
│   ├── products/    # Products management module (includes Combos & Promotions)
│   ├── inventory/   # Stock & inventory module
│   ├── purchasing/  # Purchase order module pages
│   ├── production/  # Production workflow pages
│   ├── reports/     # Analytics and reporting pages
│   ├── orders/      # Live orders page
│   ├── settings/    # Application settings
│   └── b2b/         # B2B wholesale module
├── stores/          # Zustand stores (cartStore, authStore, orderStore)
├── hooks/           # Custom React hooks
│   ├── useInventory.ts
│   ├── useOrders.ts
│   ├── useProducts.ts
│   ├── useStock.ts
│   ├── useShift.ts
│   └── useRLSValidation.ts
├── services/        # External API integrations
│   ├── ClaudeService.ts
│   ├── anthropicService.ts
│   ├── promotionService.ts
│   └── ReportingService.ts
├── agents/          # Python AI agents (Swarm-based development tools)
├── types/           # TypeScript types (database.ts, reporting.ts)
├── lib/             # Utilities (supabase.ts client init)
├── layouts/         # Page layouts (BackOfficeLayout)
├── locales/         # i18n translation files (en.json, fr.json, id.json)
└── styles/          # CSS files

supabase/
├── migrations/      # SQL migrations (001-031)
└── functions/       # Edge Functions (Deno/TypeScript)
    ├── calculate-daily-report/
    ├── generate-invoice/
    ├── purchase_order_module/
    ├── intersection_stock_movements/
    └── send-to-printer/
```

### State Management Pattern

Three Zustand stores manage application state:
- **cartStore**: Shopping cart with modifiers, locked items (sent to kitchen requiring PIN to modify), discounts, customer selection
- **authStore**: User authentication and session
- **orderStore**: Order lifecycle management

### Database Schema

Core tables in Supabase PostgreSQL:

**Products & Inventory:**
- `products` (finished, semi_finished, raw_material types)
- `categories` (with dispatch_station: barista, kitchen, display, none)
- `product_modifiers` (variant groups and options)
- `recipes` / `recipe_items`
- `stock_movements` (inventory audit trail)
- `sections` (bakery sections: Kitchen, Bar, Display)
- `product_sections` (multi-section product availability)
- `product_combos` / `product_combo_groups` / `product_combo_group_items` (combo deals with choice groups and price adjustments)
- `promotions` / `promotion_products` / `promotion_free_products` / `promotion_usage` (promotion system)

**Sales & Orders:**
- `orders` / `order_items`
- `customers` (loyalty_points, loyalty_tier, customer_type: retail/wholesale)
- `customer_categories` (slug, price_modifier_type: retail/wholesale/discount_percentage/custom)
- `product_category_prices` (custom prices per customer category)
- `loyalty_transactions` / `loyalty_tiers` (loyalty program)
- `pos_sessions` (shift management with anti-fraud reconciliation)
- `b2b_orders` / `b2b_order_items` / `b2b_payments` (B2B module)

**Purchasing:**
- `suppliers`
- `purchase_orders` / `po_items`
- `purchase_order_history`
- `purchase_order_returns`

**Production:**
- `production_records`
- `production_stock_movements`

**Settings:**
- `user_profiles` (roles: admin, cashier, barista, kitchen, etc.)
- `tables` / `floor_plan_items` (table management & floor plan)
- `units_of_measure` / `product_uom_contexts`

Key views: `view_daily_kpis`, `view_inventory_valuation`, `view_payment_method_stats`

### Key Routes

**Fullscreen (No Sidebar):**
- `/pos` - Main POS interface (touch-optimized)
- `/kds` - Kitchen Display System station selector
- `/kds/:station` - KDS by station (barista, kitchen, display, none)
- `/display` - Customer-facing display

**Back Office (With Sidebar):**
- `/products` - Products management (dedicated module with tabs)
- `/products/combos` - Combo deals management
- `/products/promotions` - Promotions management (time-based, flexible rules)
- `/products/:id/pricing` - Product pricing by customer category
- `/inventory` - Stock management
- `/inventory/product/:id` - Product detail with tabs (General, Prices, Recipe, Stock, Costing, Units)
- `/inventory/stock-opname` - Physical inventory counts
- `/orders` - Live orders with real-time updates
- `/production` - Production orders and workflow
- `/purchases` - Purchase order module
- `/internal-moves` - Inter-section stock movements
- `/purchasing/suppliers` - Supplier management
- `/purchasing/purchase-orders` - Purchase order list
- `/purchasing/purchase-orders/new` - Create new PO
- `/purchasing/purchase-orders/:id` - PO detail view
- `/customers` - Customer management with loyalty
- `/customers/categories` - Customer categories (B2B, VIP, Staff, etc.)
- `/b2b` - B2B ordering module
- `/reports` - Analytics dashboard
- `/reports/sales` - Sales reports
- `/users` - User management
- `/settings` - Application settings (sections, floor plan, etc.)

## Coding Conventions

- **Components**: PascalCase
- **Functions/variables**: camelCase
- **Interfaces**: PascalCase with `I` prefix (e.g., `IProduct`)
- **Types**: PascalCase with `T` prefix (e.g., `TOrderStatus`)
- **Database columns**: snake_case
- **Primary keys**: UUID (`id`)
- **Timestamps**: `created_at`, `updated_at`
- **Foreign keys**: `table_name_id`
- **Max file length**: 300 lines
- **Prefer**: Functional components with hooks
- **Path alias**: Use `@/` for src imports (e.g., `@/components/ui/Button`)

## Business Rules

- Currency: IDR (Indonesian Rupiah)
- Tax rate: 10% (automatic calculation)
- Loyalty: 1 point = 1,000 IDR spent
- Loyalty tiers: Bronze (0pts), Silver (500pts), Gold (2000pts), Platinum (5000pts)
- Customer categories with pricing:
  - `retail`: Standard retail price
  - `wholesale`: Uses wholesale_price from products
  - `discount_percentage`: Applies X% discount on retail price
  - `custom`: Uses product_category_prices table for specific pricing
- Low stock alert threshold: <10 units
- Order types: dine_in, takeaway, delivery, b2b
- Payment methods: cash, card (EDC), QRIS
- Dispatch stations: barista, kitchen, display, none

## Key Features

### POS System
- Touch-optimized product grid with categories
- Cart with modifiers and variants
- Split payment support (cash, card, QRIS)
- Table selection for dine-in orders
- Held orders functionality
- Transaction history (manager/admin only)

### Shift Management
- PIN-based authentication for shift open/close
- Opening cash count with denomination breakdown
- Anti-fraud reconciliation at shift close
- Expected vs actual cash/card/QRIS tracking
- Discrepancy reporting

### Kitchen Display System (KDS)
- 4 stations: Barista, Kitchen, Display, None
- Real-time order updates via Supabase Realtime
- Order card status management
- Station-specific filtering

### Purchase Orders
- Full PO lifecycle: draft → sent → confirmed → received
- Partial receiving support
- Discount and tax calculations
- Return tracking
- Supplier management with payment terms

### Inter-Section Stock Movements
- Transfer stock between sections (Kitchen, Bar, Display)
- Movement history and audit trail
- Production stock movements

### Floor Plan Editor
- Visual table layout editor
- Drag-and-drop positioning
- Multiple shapes (square, circle, rectangle)

## Customer & Loyalty System

### Customer Categories (customer_categories table)
- **slug**: Unique identifier (e.g., 'standard', 'wholesale', 'vip', 'staff')
- **price_modifier_type**: How pricing is calculated
- **discount_percentage**: Used when price_modifier_type = 'discount_percentage'

### Pricing Logic (get_customer_product_price function)
1. Check for custom price in `product_category_prices` → use if exists
2. If category is 'wholesale' → use `products.wholesale_price`
3. If category has discount_percentage → apply % reduction on retail
4. Default → use `products.retail_price`

### Loyalty Program
- QR code per customer for identification at POS
- Points accumulation via `add_loyalty_points()` function
- Points redemption via `redeem_loyalty_points()` function
- Automatic tier upgrades based on lifetime_points

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-claude-api-key
```

## Database Migrations

Migrations are in `supabase/migrations/` numbered 001-031. Apply via Supabase dashboard or CLI.

Key migrations:
- 001: Initial schema
- 003: Stock triggers (auto-update on movements)
- 004: RLS policies
- 011: Reporting module with views
- 012: Multi-UOM support
- 015: Inter-section stock movements
- 019: POS sessions (shifts) with anti-fraud
- 020: Product multiple sections
- 023-024: Tables and floor plan
- 025-026: Purchase orders module
- 027: B2B sales module
- 028: Customer loyalty system (customer_categories, loyalty_tiers, loyalty_transactions)
- 029: Product category prices (product_category_prices, get_customer_product_price function)
- 030: Combos and Promotions (product_combos, promotions with time-based rules, buy X get Y, free products)
- 031: Combo Choice Groups (product_combo_groups, product_combo_group_items with price adjustments - allows customer to choose options within combo)

## Testing

Tests are located in `src/__tests__/`. Run with:
```bash
npx vitest           # Run tests
npx vitest --watch   # Watch mode
```

Test files follow the pattern `*.test.tsx`.

## AI Agents (Python)

The `src/agents/` directory contains Python-based AI agents for development assistance:
- `audit_agent.py` - Code auditing
- `erp_design_agent.py` - ERP module design
- `ui_design_agent.py` - UI/UX design system
- `frontend_agent.py` - Frontend development
- `backend_agent.py` - Backend development
- `database_agent.py` - Database design
- `documentation_agent.py` - Documentation generation
- `testing_agent.py` - Test generation
- `refactoring_agent.py` - Code refactoring
- `appgrav_swarm_updated.py` - Agent orchestration

## Common Development Tasks

### Adding a new page
1. Create component in `src/pages/[module]/`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/layouts/BackOfficeLayout.tsx` if needed
4. Add translations in `src/locales/en.json` and `src/locales/fr.json`

### Adding a new database table
1. Create migration in `supabase/migrations/`
2. Add TypeScript types in `src/types/database.ts`
3. Add RLS policies in migration
4. Create corresponding hook in `src/hooks/`

### Adding a new Zustand store
1. Create store file in `src/stores/`
2. Follow pattern: `create<StoreInterface>((set, get) => ({...}))`
3. Use `persist` middleware for localStorage persistence if needed

## Troubleshooting

- **RLS errors**: Check `useRLSValidation.ts` hook and migration RLS policies
- **Auth issues**: Demo users may have invalid IDs; force logout in `App.tsx` handles this
- **Build errors**: Run `npm run build` to check TypeScript errors
- **Shift not opening**: Check localStorage for persisted shift state
