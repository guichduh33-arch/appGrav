# AppGrav - Current State Documentation
**Last Updated**: 2026-01-23
**Location**: c:\Users\guich\appGrav\

## Project Overview

AppGrav is a full-stack ERP/POS system for "The Breakery," a French bakery in Lombok, Indonesia. The system handles ~200 transactions/day with 10% tax calculation and supports three languages (French, English, Indonesian).

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 18.2 |
| Language | TypeScript | 5.2 |
| Build | Vite | 5.x |
| State | Zustand | 4.4.7 |
| Styling | Tailwind CSS | 3.x |
| Icons | Lucide React | - |
| Backend | Supabase | 2.39.0 |
| Database | PostgreSQL | (via Supabase) |
| Routing | React Router DOM | 6.x |
| Data Fetching | @tanstack/react-query | - |
| i18n | i18next | FR/EN/ID |
| Charts | Recharts | - |

## Directory Structure

```
c:\Users\guich\appGrav\
├── src/
│   ├── components/       # React components by feature
│   │   ├── pos/          # POS interface components
│   │   ├── inventory/    # Inventory components
│   │   ├── ui/           # Shared UI components
│   │   └── settings/     # Settings components
│   ├── pages/            # Route-based page components
│   │   ├── auth/         # Login, authentication
│   │   ├── customers/    # Customer management
│   │   ├── products/     # Products, combos, promotions
│   │   ├── inventory/    # Stock & inventory
│   │   ├── b2b/          # B2B wholesale
│   │   ├── purchasing/   # Purchase orders
│   │   ├── production/   # Production workflow
│   │   ├── reports/      # Analytics dashboard
│   │   ├── settings/     # Settings, users, roles
│   │   └── kds/          # Kitchen Display System
│   ├── stores/           # Zustand stores
│   │   ├── cartStore.ts  # Shopping cart state
│   │   ├── authStore.ts  # Authentication state
│   │   └── orderStore.ts # Order lifecycle
│   ├── hooks/            # Custom React hooks
│   ├── services/         # External API integrations
│   ├── types/            # TypeScript types
│   │   ├── database.ts   # Manual Supabase types
│   │   └── database.generated.ts # Auto-generated types
│   ├── lib/              # Utilities (supabase client)
│   ├── locales/          # i18n translation files
│   └── styles/           # CSS files
├── supabase/
│   ├── migrations/       # SQL migrations (001-047+)
│   └── functions/        # Edge Functions (Deno/TypeScript)
├── scripts/
│   └── agents/           # Python automation agents
└── .antigravity/
    └── agents/           # AI assistant agent definitions
```

## Key Modules

### 1. POS (Point of Sale)
- **Route**: `/pos`
- **Features**: Product selection, cart management, payment processing
- **Components**: POSMainPage, Cart, ProductGrid, PaymentModal
- **Store**: cartStore (items, modifiers, discounts, locked items)

### 2. KDS (Kitchen Display System)
- **Route**: `/kds/:station`
- **Stations**: barista, kitchen, display
- **Features**: Order display, status updates, audio alerts

### 3. Products Management
- **Route**: `/products`
- **Features**: Product CRUD, categories, modifiers
- **Sub-routes**:
  - `/products/combos` - Combo deals with choice groups
  - `/products/promotions` - Time-based promotions
  - `/products/:id/pricing` - Customer category pricing

### 4. Inventory
- **Route**: `/inventory`
- **Features**: Stock levels, movements, transfers
- **Sub-routes**:
  - `/inventory/stock-opname` - Physical inventory counts

### 5. B2B Module
- **Route**: `/b2b`
- **Features**: Wholesale orders, custom pricing, deliveries

### 6. Purchasing
- **Routes**: `/purchasing/purchase-orders`, `/purchasing/suppliers`
- **Features**: PO creation, supplier management, receiving

### 7. Production
- **Route**: `/production`
- **Features**: Production orders, recipes, batch tracking

### 8. Customers & Loyalty
- **Route**: `/customers`
- **Features**: Customer management, loyalty points, tiers
- **Sub-routes**:
  - `/customers/categories` - Customer categories (B2B, VIP, Staff)

### 9. Settings & Administration
- **Routes**: `/settings/users`, `/settings/roles`, `/settings/payment-methods`
- **Features**: User management, role permissions, payment configuration

### 10. Reports
- **Route**: `/reports`
- **Features**: Sales analytics, inventory reports, KPIs

## Database Migrations

Total migrations: **47+** (in `supabase/migrations/`)

Key migrations:
| Migration | Description |
|-----------|-------------|
| 001 | Initial schema (products, categories, orders) |
| 003 | Stock triggers (auto-update on movements) |
| 004 | RLS policies |
| 011 | Reporting module with views |
| 012 | Multi-UOM support |
| 015 | Inter-section stock movements |
| 023-024 | Floor plan / table layout |
| 025-026 | Purchase orders module |
| 027 | B2B sales module |
| 028 | Customer loyalty system |
| 029 | Product category prices |
| 030 | Combos and Promotions |
| 031 | Combo choice groups |
| 038-039 | Stock transfers |
| 040-041 | Users & permissions, settings |
| 042-047 | Various fixes and enhancements |

## Business Rules

| Rule | Value |
|------|-------|
| Currency | IDR (Indonesian Rupiah) |
| Tax Rate | 10% (automatic) |
| Loyalty Points | 1 point = 1,000 IDR spent |
| Loyalty Tiers | Bronze (0), Silver (500), Gold (2000), Platinum (5000) |
| Low Stock Alert | <10 units |
| Order Types | dine_in, takeaway, delivery, b2b |

## Customer Categories & Pricing

| Category | Price Logic |
|----------|-------------|
| retail | Standard retail_price |
| wholesale | Uses wholesale_price from products |
| discount_percentage | Applies X% discount on retail |
| custom | Uses product_category_prices table |

## Zustand Stores

### cartStore
- `items`: Cart items with modifiers
- `lockedItems`: Items sent to kitchen (PIN required to modify)
- `discounts`: Applied discounts
- `customer`: Selected customer for pricing

### authStore
- `user`: Current authenticated user
- `session`: Supabase session
- `permissions`: User permissions

### orderStore
- `orders`: Active orders
- `sendToKitchen()`: Lock items and send to KDS
- `holdOrder()`: Save order for later
- `restoreOrder()`: Restore held order

## Agent Ecosystem

### Markdown Agents (.antigravity/agents/)
| Agent | Purpose |
|-------|---------|
| system-auditor | Codebase analysis, security audit |
| system-repair | Implementation of audit fixes |
| code-debugger | Error analysis and fixes |
| code-fixer-claude | Complete code fix provider |
| error-debugger | Runtime error diagnosis |
| typescript-fixer | TypeScript compilation fixes |
| database-sync | Types synchronization with DB |
| security-hardener | Security vulnerability fixes |
| refactorer | Code splitting, 300-line limit |
| test-agent | Test suite creation |

### Python Agents (scripts/agents/)
Automation scripts for code generation and project maintenance.

## Known Issues & Technical Debt

1. **Large Files** (>300 lines): useProducts.ts (2,974), UsersPage.tsx (920), SettingsPage.tsx (824)
2. **Missing Tests**: No comprehensive test suite
3. **Type Safety**: Some areas need stronger typing
4. **Documentation**: Inline documentation sparse in some modules

## Development Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # TypeScript check + Vite build
npm run lint     # Lint codebase
npm run preview  # Preview production build
```

## Environment Variables

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ANTHROPIC_API_KEY=your-claude-api-key
VITE_APP_NAME=The Breakery
VITE_APP_VERSION=x.x.x
```
