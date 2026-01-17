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

## Architecture

### Directory Structure

```
src/
├── components/       # React components by feature (pos/, inventory/, ui/)
├── pages/           # Route-based page components
├── stores/          # Zustand stores (cartStore, authStore, orderStore)
├── hooks/           # Custom React hooks (useInventory, useOrders, useProducts, useStock)
├── services/        # External API integrations (Claude AI, Anthropic)
├── types/           # TypeScript types (database.ts contains full schema)
├── lib/             # Utilities (supabase.ts client init)
├── locales/         # i18n translation files
└── styles/          # CSS files
supabase/
├── migrations/      # SQL migrations (001-017)
└── functions/       # Edge Functions (Deno/TypeScript)
```

### State Management Pattern

Three Zustand stores manage application state:
- **cartStore**: Shopping cart with modifiers, locked items (sent to kitchen requiring PIN to modify), discounts
- **authStore**: User authentication and session
- **orderStore**: Order lifecycle management

### Database Schema

Core tables in Supabase PostgreSQL:
- `products` (finished, semi_finished, raw_material types)
- `categories` (with dispatch_station: barista, kitchen, display, none)
- `orders` / `order_items`
- `customers` (loyalty_points, customer_type: retail/wholesale)
- `pos_sessions` (drawer open/close tracking)
- `stock_movements` (inventory audit trail)
- `production_records` / `recipes`
- `product_modifiers` (variant groups and options)
- `user_profiles` (roles: admin, cashier, barista, kitchen, etc.)

Key views: `view_daily_kpis`, `view_inventory_valuation`, `view_payment_method_stats`

### Key Routes

- `/pos` - Main POS interface (fullscreen, touch-optimized)
- `/kds/:station` - Kitchen Display System by station
- `/inventory` - Stock management
- `/inventory/stock-opname` - Physical inventory counts
- `/production` - Production orders and workflow
- `/reports` - Analytics dashboard
- `/b2b` - B2B ordering module

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

## Business Rules

- Currency: IDR (Indonesian Rupiah)
- Tax rate: 10% (automatic calculation)
- Loyalty: 1 point = 1,000 IDR spent
- Auto-discount: 10% when customer has >100 points
- Low stock alert threshold: <10 units
- Order types: dine_in, takeaway, delivery, b2b

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-claude-api-key
```

## Database Migrations

Migrations are in `supabase/migrations/` numbered 001-017. Apply via Supabase dashboard or CLI. Key migrations:
- 001: Initial schema
- 003: Stock triggers (auto-update on movements)
- 004: RLS policies
- 011: Reporting module with views
- 012: Multi-UOM support
- 015: Inter-section stock movements
