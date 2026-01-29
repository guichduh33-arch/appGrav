# Architecture - Main App (React/TypeScript)

*Généré le 2026-01-26 - Scan Exhaustif*

## Vue d'Ensemble

Application Point de Vente (POS) et ERP pour boulangerie artisanale. Architecture React moderne avec backend Supabase.

## Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework UI | React | 18.2 |
| Langage | TypeScript | 5.2 |
| Build Tool | Vite | 5.x |
| État Global | Zustand | 4.4.7 |
| État Serveur | React Query | 5.x |
| Routing | React Router | 6.x |
| Styles | Tailwind CSS | 3.x |
| Backend | Supabase | Latest |
| i18n | i18next | 23.x |
| Mobile | Capacitor | 8.0 |

## Architecture en Couches

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │  Pages  │  │Components│  │ Modals  │  │ Layouts │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
└───────┼────────────┼────────────┼────────────┼─────────┘
        │            │            │            │
┌───────┴────────────┴────────────┴────────────┴─────────┐
│                    STATE MANAGEMENT                      │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │   Zustand Stores    │  │    React Query Cache    │  │
│  │ (cart,auth,orders)  │  │   (products,inventory)  │  │
│  └──────────┬──────────┘  └────────────┬────────────┘  │
└─────────────┼──────────────────────────┼───────────────┘
              │                          │
┌─────────────┴──────────────────────────┴───────────────┐
│                    DATA ACCESS                          │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │    Custom Hooks     │  │      Services           │  │
│  │  (useProducts...)   │  │  (authService...)       │  │
│  └──────────┬──────────┘  └────────────┬────────────┘  │
└─────────────┼──────────────────────────┼───────────────┘
              │                          │
              └──────────┬───────────────┘
                         │
┌────────────────────────┴───────────────────────────────┐
│                    SUPABASE CLIENT                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │               src/lib/supabase.ts                │   │
│  │  • Direct queries (tables, views)                │   │
│  │  • RPC calls (PostgreSQL functions)              │   │
│  │  • Edge Functions (HTTP endpoints)               │   │
│  │  • Realtime subscriptions                        │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

## Stores Zustand

### cartStore (src/stores/cartStore.ts)

État du panier POS avec gestion des items verrouillés.

```typescript
interface CartState {
  items: CartItem[]           // Produits et combos
  lockedItems: Set<string>    // Items envoyés en cuisine (PIN requis)
  discount: Discount | null   // Remise globale
  customer: Customer | null   // Client sélectionné
  orderType: OrderType        // dine_in, takeaway, delivery
  tableId: string | null      // Table sélectionnée
}

// Actions principales
addItem(product, modifiers?, comboSelections?)
removeItem(itemId)           // Bloqué si locked
updateQuantity(itemId, qty)  // Bloqué si locked
lockItem(itemId)             // Après envoi cuisine
clearCart()
setCustomer(customer)
applyDiscount(discount)
```

**Pattern Locked Items** : Les items envoyés en cuisine sont "verrouillés" et nécessitent un PIN manager pour modification/suppression.

### authStore (src/stores/authStore.ts)

Gestion de session et permissions utilisateur.

```typescript
interface AuthState {
  user: User | null
  session: Session | null
  permissions: string[]       // ['sales.create', 'inventory.view', ...]
  isAuthenticated: boolean
}

// Vérification permission
hasPermission(code: string): boolean
```

### orderStore (src/stores/orderStore.ts)

Lifecycle des commandes en cours.

```typescript
interface OrderState {
  currentOrder: Order | null
  heldOrders: Order[]         // Commandes en attente
}
```

### settingsStore (src/stores/settingsStore.ts)

Paramètres application et préférences.

```typescript
interface SettingsState {
  settings: Record<string, any>
  isLoading: boolean
}
```

## Hooks React Query

### Pattern Standard

```typescript
// src/hooks/products/useProductList.ts
export function useProductList(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .match(filters)
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000  // 5 minutes
  })
}
```

### Hooks Principaux

| Hook | Usage | Cache Key |
|------|-------|-----------|
| `useProductList` | Liste produits avec filtres | `['products', filters]` |
| `useCategories` | Catégories produits | `['categories']` |
| `useInventory` | Stock et mouvements | `['inventory', locationId]` |
| `useOrders` | Commandes avec mutations | `['orders', filters]` |
| `useCustomers` | Clients et fidélité | `['customers', filters]` |
| `useShift` | Session caisse | `['shift', terminalId]` |
| `useSettings` | Paramètres app | `['settings', group]` |

## Services

### authService.ts

```typescript
// Authentification PIN (Edge Function)
loginWithPin(pin: string): Promise<AuthResponse>
logout(): Promise<void>
changePin(oldPin: string, newPin: string): Promise<void>
verifyPin(pin: string): Promise<boolean>
```

### promotionService.ts

```typescript
// Calcul promotions applicables
getApplicablePromotions(cart: CartItem[]): Promotion[]
calculateDiscount(promotion: Promotion, cart: CartItem[]): number
validateTimeRestrictions(promotion: Promotion): boolean
```

### ReportingService.ts

```typescript
// Agrégation rapports (Edge Function)
getDashboardSummary(dateRange): Promise<DashboardData>
getSalesByProduct(dateRange): Promise<ProductSales[]>
getPaymentMethodStats(dateRange): Promise<PaymentStats[]>
```

## Routing

### Structure des Routes

```typescript
// App.tsx - Routes principales
<Routes>
  {/* Auth */}
  <Route path="/login" element={<LoginPage />} />

  {/* POS (fullscreen) */}
  <Route path="/pos" element={<POSMainPage />} />
  <Route path="/kds/:station" element={<KDSMainPage />} />
  <Route path="/display" element={<CustomerDisplayPage />} />

  {/* Back-Office (avec layout) */}
  <Route element={<BackOfficeLayout />}>
    <Route path="/products" element={<ProductsLayout />}>
      <Route index element={<ProductsPage />} />
      <Route path="combos" element={<CombosPage />} />
      <Route path="promotions" element={<PromotionsPage />} />
    </Route>

    <Route path="/inventory" element={<InventoryLayout />}>
      <Route index element={<InventoryPage />} />
      <Route path="stock" element={<StockPage />} />
      <Route path="stock-opname" element={<StockOpnameList />} />
      {/* ... autres routes inventaire */}
    </Route>

    {/* B2B, Purchasing, Customers, Reports, Settings */}
  </Route>
</Routes>
```

### Guards de Permission

```tsx
// PermissionGuard component
<PermissionGuard permission="sales.void">
  <VoidOrderButton />
</PermissionGuard>

// Raccourcis
<AdminOnly>Admin content</AdminOnly>
<ManagerOnly>Manager+ content</ManagerOnly>
```

## Patterns de Composants

### Modal Pattern

```tsx
// Structure standard
function ExampleModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{t('modal.title')}</h2>
          <button onClick={onClose}><X /></button>
        </header>

        <main className="modal-body">
          {/* Content */}
        </main>

        <footer className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm}>
            {t('common.confirm')}
          </Button>
        </footer>
      </div>
    </div>
  )
}
```

### Page Pattern

```tsx
// Structure standard
function ExamplePage() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useExampleData()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{t('page.title')}</h1>
        <div className="page-actions">
          <Button onClick={handleAction}>{t('action')}</Button>
        </div>
      </header>

      <main className="page-content">
        {/* Content */}
      </main>
    </div>
  )
}
```

## Internationalisation

### Configuration (src/i18n.ts)

```typescript
i18n
  .use(initReactI18next)
  .init({
    resources: { fr, en, id },
    lng: 'fr',           // Français par défaut
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })
```

### Usage

```tsx
const { t } = useTranslation()

// Simple
<span>{t('common.save')}</span>

// Avec interpolation
<span>{t('orders.total', { amount: formatCurrency(total) })}</span>

// Pluralisation
<span>{t('cart.items', { count: items.length })}</span>
```

## Build et Déploiement

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser'
  }
})
```

### Commandes

```bash
npm run dev      # Dev server (port 3000)
npm run build    # Production build
npm run preview  # Preview production build
```

### Mobile (Capacitor)

```bash
npx cap sync           # Sync web → native
npx cap open ios       # Ouvrir Xcode
npx cap open android   # Ouvrir Android Studio
npx cap run ios        # Build & run iOS
```

## Tests

### Configuration Vitest

```typescript
// vite.config.ts
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/setupTests.ts',
  css: true
}
```

### Exécution

```bash
npx vitest run              # Tous les tests
npx vitest run path/file    # Un fichier
npx vitest                  # Mode watch
```
