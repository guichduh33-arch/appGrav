# Story 3.2: Cart Persistence Offline

Status: done

## Story

As a **Caissier**,
I want **que mon panier persiste même si l'app se ferme**,
so that **je ne perds pas une commande en cours lors d'un crash**.

## Acceptance Criteria

### AC1: Sauvegarde Automatique du Panier
**Given** j'ajoute des items au panier
**When** le panier change
**Then** il est sauvegardé dans `localStorage` ou Dexie `offline_cart`

### AC2: Restauration au Redémarrage
**Given** l'app redémarre
**When** le POS s'ouvre
**Then** le panier est restauré avec tous les items et modifiers
**And** les items locked restent locked

### AC3: Préservation de l'État Complet
**Given** le panier a des items, un client associé, une remise et une commande active
**When** l'app se ferme puis redémarre
**Then** tous les éléments suivants sont restaurés:
- Items avec leurs modifiers/variants
- Items locked (envoyés en cuisine)
- OrderType (dine_in, takeaway, delivery)
- TableNumber
- Customer (id + name)
- Discount (type, value, reason)
- ActiveOrderId et ActiveOrderNumber

### AC4: Nettoyage après Paiement
**Given** une commande est payée et complétée
**When** le panier est vidé via clearCart()
**Then** le panier persisté est également supprimé du stockage

## Tasks / Subtasks

- [x] **Task 1: Créer le service cartPersistenceService** (AC: 1, 4)
  - [x] 1.1: Créer `src/services/offline/cartPersistenceService.ts`
  - [x] 1.2: Implémenter `saveCart(state: IPersistedCartState)` → localStorage
  - [x] 1.3: Implémenter `loadCart(): IPersistedCartState | null`
  - [x] 1.4: Implémenter `clearPersistedCart()`
  - [x] 1.5: Définir `IPersistedCartState` interface avec tous les champs

- [x] **Task 2: Intégrer la persistence dans cartStore** (AC: 1, 2, 3)
  - [x] 2.1: Ajouter middleware de persistence (subscribe + debounce)
  - [x] 2.2: Appeler `saveCart()` après chaque mutation d'état
  - [x] 2.3: Charger le panier persisté à l'initialisation du store
  - [x] 2.4: Appeler `clearPersistedCart()` dans `clearCart()`

- [x] **Task 3: Gérer les références produits obsolètes** (AC: 2)
  - [x] 3.1: Au chargement, valider que les product_id existent dans `offline_products`
  - [x] 3.2: Filtrer les items dont le produit n'existe plus
  - [x] 3.3: Afficher une notification discrète si des items sont supprimés

- [x] **Task 4: Créer les tests unitaires** (AC: 1, 2, 3, 4)
  - [x] 4.1: Créer `src/services/offline/__tests__/cartPersistenceService.test.ts`
  - [x] 4.2: Tester saveCart/loadCart round-trip
  - [x] 4.3: Tester clearPersistedCart
  - [x] 4.4: Tester filtrage des produits obsolètes
  - [x] 4.5: Tester préservation des locked items

- [x] **Task 5: Ajouter les traductions** (AC: 2)
  - [x] 5.1: Ajouter clés `cart.restored`, `cart.itemsRemoved` dans `fr.json`
  - [x] 5.2: Ajouter clés dans `en.json`
  - [x] 5.3: Ajouter clés dans `id.json`

## Dev Notes

### Architecture Compliance (MANDATORY)

**ADR-001: Entités Synchronisées Offline** [Source: architecture/core-architectural-decisions.md#ADR-001]
- `cart` → Not in sync queue (transient state, not persisted to server)
- Cart persistence is LOCAL ONLY - recovery feature, not sync feature

**ADR-003: Politique de Cache** [Source: architecture/core-architectural-decisions.md#ADR-003]
- Cart: localStorage (simple, no complex queries needed)
- Decision: Use localStorage NOT Dexie (cart is simple JSON, < 50KB typically)

### Naming Conventions (CRITICAL)

**localStorage Key** [Source: architecture/implementation-patterns-consistency-rules.md#Naming-Patterns]
```typescript
// Standard key format
export const CART_PERSISTENCE_KEY = 'appgrav_cart_state';
```

**Types TypeScript** [Source: CLAUDE.md#Coding-Conventions]
```typescript
// Interface: I prefix
interface IPersistedCartState { ... }
```

### CartStore Integration Pattern

```typescript
// src/stores/cartStore.ts - MODIFICATION PATTERN
// The store already has restoreCartState() - USE IT

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  saveCart,
  loadCart,
  clearPersistedCart,
  validateAndFilterCartItems
} from '@/services/offline/cartPersistenceService';

// Wrap store with subscribeWithSelector for granular subscriptions
export const useCartStore = create<CartState>()(
  subscribeWithSelector((set, get) => ({
    // ... existing state and actions ...

    clearCart: () => {
      clearPersistedCart(); // Clear persisted cart on clearCart
      set({
        items: [],
        tableNumber: null,
        // ... rest of clear state
      });
    },
  }))
);

// Setup persistence subscription OUTSIDE the store
// Call this once at app initialization
export function initCartPersistence() {
  // Debounced save (300ms) to avoid excessive writes
  let saveTimeout: NodeJS.Timeout | null = null;

  useCartStore.subscribe(
    (state) => ({
      items: state.items,
      lockedItemIds: state.lockedItemIds,
      activeOrderId: state.activeOrderId,
      activeOrderNumber: state.activeOrderNumber,
      orderType: state.orderType,
      tableNumber: state.tableNumber,
      customerId: state.customerId,
      customerName: state.customerName,
      discountType: state.discountType,
      discountValue: state.discountValue,
      discountReason: state.discountReason,
    }),
    (persistState) => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveCart(persistState);
      }, 300);
    },
    { fireImmediately: false }
  );
}
```

### IPersistedCartState Interface

```typescript
// src/services/offline/cartPersistenceService.ts

import type { CartItem, CartModifier, ComboSelectedItem, SelectedVariant } from '@/stores/cartStore';

/**
 * Persisted cart state structure
 * Stored in localStorage as JSON
 *
 * Note: Does NOT include computed values (subtotal, total, etc.)
 * These are recalculated on load
 */
export interface IPersistedCartState {
  /** Cart items with products, modifiers, variants */
  items: CartItem[];

  /** IDs of items sent to kitchen (locked) */
  lockedItemIds: string[];

  /** Active order ID if cart is linked to an existing order */
  activeOrderId: string | null;

  /** Active order number for display */
  activeOrderNumber: string | null;

  /** Order type */
  orderType: 'dine_in' | 'takeaway' | 'delivery';

  /** Table number for dine_in */
  tableNumber: string | null;

  /** Associated customer ID */
  customerId: string | null;

  /** Customer display name */
  customerName: string | null;

  /** Discount type if applied */
  discountType: 'percent' | 'amount' | null;

  /** Discount value */
  discountValue: number;

  /** Reason for discount */
  discountReason: string | null;

  /** Timestamp when cart was saved (for debugging) */
  savedAt: string;
}
```

### Service Implementation Pattern

```typescript
// src/services/offline/cartPersistenceService.ts

import type { CartItem } from '@/stores/cartStore';
import { db } from '@/lib/db';

export const CART_PERSISTENCE_KEY = 'appgrav_cart_state';

/**
 * Save cart state to localStorage
 * Called on every cart mutation (debounced)
 */
export function saveCart(state: Omit<IPersistedCartState, 'savedAt'>): void {
  try {
    const persistedState: IPersistedCartState = {
      ...state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(CART_PERSISTENCE_KEY, JSON.stringify(persistedState));
  } catch (error) {
    console.error('[CartPersistence] Failed to save cart:', error);
    // Don't throw - persistence failure shouldn't break the app
  }
}

/**
 * Load cart state from localStorage
 * Returns null if no cart found or invalid data
 */
export function loadCart(): IPersistedCartState | null {
  try {
    const stored = localStorage.getItem(CART_PERSISTENCE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as IPersistedCartState;

    // Basic validation
    if (!parsed.items || !Array.isArray(parsed.items)) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('[CartPersistence] Failed to load cart:', error);
    return null;
  }
}

/**
 * Clear persisted cart from localStorage
 * Called when order is completed/paid
 */
export function clearPersistedCart(): void {
  try {
    localStorage.removeItem(CART_PERSISTENCE_KEY);
  } catch (error) {
    console.error('[CartPersistence] Failed to clear cart:', error);
  }
}

/**
 * Validate cart items against current product catalog
 * Removes items whose products no longer exist in offline cache
 *
 * @returns Filtered items and list of removed item names
 */
export async function validateAndFilterCartItems(
  items: CartItem[]
): Promise<{ validItems: CartItem[]; removedNames: string[] }> {
  const validItems: CartItem[] = [];
  const removedNames: string[] = [];

  for (const item of items) {
    if (item.type === 'product' && item.product) {
      // Check if product exists in offline cache
      const product = await db.offline_products.get(item.product.id);
      if (product && product.is_active) {
        validItems.push(item);
      } else {
        removedNames.push(item.product.name);
      }
    } else if (item.type === 'combo' && item.combo) {
      // Combos: for MVP, assume valid if combo object exists
      // TODO: validate combo still exists in offline cache when combos are cached
      validItems.push(item);
    }
  }

  return { validItems, removedNames };
}

/**
 * Check if a persisted cart exists
 */
export function hasPersistedCart(): boolean {
  return localStorage.getItem(CART_PERSISTENCE_KEY) !== null;
}
```

### Previous Story Intelligence

**Story 3.1 Patterns** [Source: 3-1-dexie-schema-for-orders-sync-queue.md]
- Dexie v7 schema already includes `offline_orders` and `offline_order_items`
- `ordersCacheService.ts` pattern: simple async functions, validation, error handling
- Tests use `fake-indexeddb/auto` mock

**Epic 2 Retrospective Learnings** [Source: epic-2-retrospective.md]
1. **Dexie Boolean Gotcha:** IndexedDB stores booleans as 0/1 - use `Boolean()` for coercion
2. **Service pattern établi:** Simple exports, no classes unless needed
3. **localStorage is fine for simple state** (used for production reminders in Story 2.5)

**CartStore Already Has:**
- `restoreCartState(items, lockedItemIds, activeOrderId, activeOrderNumber)` function
- `clearCart()` function that resets all state
- All the state fields we need to persist

### Testing Strategy

**localStorage Mock:**
```typescript
// In test setup
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

**Test Cases:**
1. `saveCart()` - stores valid JSON in localStorage
2. `loadCart()` - returns null for missing/invalid data
3. `loadCart()` - parses and returns valid persisted state
4. `clearPersistedCart()` - removes from localStorage
5. `validateAndFilterCartItems()` - filters out products not in offline cache
6. `validateAndFilterCartItems()` - preserves valid items
7. `hasPersistedCart()` - returns correct boolean

### App Initialization Integration

```typescript
// src/App.tsx or src/main.tsx - ADD TO INITIALIZATION

import { initCartPersistence, loadCart, validateAndFilterCartItems } from '@/services/offline/cartPersistenceService';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

async function restorePersistedCart() {
  const persisted = loadCart();
  if (!persisted) return;

  // Validate items against current product catalog
  const { validItems, removedNames } = await validateAndFilterCartItems(persisted.items);

  // Filter locked items to only include valid item IDs
  const validItemIds = new Set(validItems.map(item => item.id));
  const validLockedIds = persisted.lockedItemIds.filter(id => validItemIds.has(id));

  // Restore cart state
  useCartStore.getState().restoreCartState(
    validItems,
    validLockedIds,
    persisted.activeOrderId,
    persisted.activeOrderNumber
  );

  // Restore other state fields
  if (persisted.orderType) {
    useCartStore.getState().setOrderType(persisted.orderType);
  }
  if (persisted.tableNumber) {
    useCartStore.getState().setTableNumber(persisted.tableNumber);
  }
  if (persisted.customerId || persisted.customerName) {
    useCartStore.getState().setCustomer(persisted.customerId, persisted.customerName);
  }
  if (persisted.discountType) {
    useCartStore.getState().setDiscount(
      persisted.discountType,
      persisted.discountValue,
      persisted.discountReason
    );
  }

  // Notify if items were removed
  if (removedNames.length > 0) {
    const { t } = useTranslation();
    toast.info(t('cart.itemsRemoved', { count: removedNames.length }));
  }
}

// Call at app startup
useEffect(() => {
  initCartPersistence();
  restorePersistedCart();
}, []);
```

### Traductions à Ajouter

```json
// fr.json - section cart
{
  "cart": {
    "restored": "Panier restauré",
    "itemsRemoved": "{{count}} article(s) supprimé(s) (produits indisponibles)"
  }
}
```

```json
// en.json
{
  "cart": {
    "restored": "Cart restored",
    "itemsRemoved": "{{count}} item(s) removed (products unavailable)"
  }
}
```

```json
// id.json
{
  "cart": {
    "restored": "Keranjang dipulihkan",
    "itemsRemoved": "{{count}} item dihapus (produk tidak tersedia)"
  }
}
```

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── services/
│   └── offline/
│       ├── cartPersistenceService.ts          # NEW: Cart persistence service
│       └── __tests__/
│           └── cartPersistenceService.test.ts # NEW: Unit tests
```

**Fichiers à modifier:**
- `src/stores/cartStore.ts` - Ajouter middleware persistence, appeler clearPersistedCart dans clearCart
- `src/services/offline/index.ts` - Exporter cartPersistenceService
- `src/App.tsx` ou `src/main.tsx` - Initialiser persistence et restaurer cart au démarrage
- `src/locales/fr.json`, `en.json`, `id.json` - Ajouter traductions cart.*

### Dependencies on Previous Work

- ✅ `src/stores/cartStore.ts` - Déjà a `restoreCartState()` et toutes les actions nécessaires
- ✅ `src/lib/db.ts` - Dexie v7 avec `offline_products` pour validation
- ✅ `src/services/offline/` - Structure de services établie
- ✅ `zustand/middleware` - `subscribeWithSelector` disponible pour subscription granulaire

### Epic 3 Context

Cette story est la **2ème** de l'Epic 3 (POS & Ventes). Elle prépare le terrain pour:
- 3.3: Offline Order Creation → utilisera le panier persisté
- 3.4: Offline Payment → interagit avec le cycle de vie du panier
- 3.5: Session Management → peut affecter la persistence

### Critical Implementation Notes

1. **Debounce Required:** La persistence doit être debounced (300ms) pour éviter des écritures excessives lors de modifications rapides

2. **Don't Persist Computed Values:** `subtotal`, `total`, `discountAmount`, `itemCount` sont recalculés par calculateTotals() au chargement

3. **Validation at Load:** TOUJOURS valider les items contre `offline_products` au chargement car le catalogue peut avoir changé

4. **Silent Failures:** Les erreurs de persistence ne doivent PAS bloquer l'application - logger et continuer

5. **localStorage vs Dexie:** Utiliser localStorage car:
   - Structure simple (un seul objet JSON)
   - Pas de requêtes complexes
   - Synchrone (plus simple)
   - < 50KB typiquement

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-3.2]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-003]
- [Source: _bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md]
- [Source: _bmad-output/implementation-artifacts/3-1-dexie-schema-for-orders-sync-queue.md]
- [Source: _bmad-output/implementation-artifacts/epic-2-retrospective.md]
- [Source: src/stores/cartStore.ts] - CartStore avec restoreCartState()
- [Source: src/lib/db.ts] - Dexie instance avec offline_products
- [Source: CLAUDE.md#Coding-Conventions] - Conventions de code

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Tests failing with "DatabaseClosedError" was fixed by not closing db in afterEach (use clear() instead)

### Completion Notes List

1. Created `cartPersistenceService.ts` with all required functions
2. Implemented debounced persistence subscription using zustand's `subscribeWithSelector`
3. Cart restoration in App.tsx validates items against offline_products cache
4. All 23 unit tests passing
5. Translations added to fr.json, en.json, id.json

### File List

**Created:**
- `src/services/offline/cartPersistenceService.ts` - Cart persistence service (220 lines)
- `src/services/offline/__tests__/cartPersistenceService.test.ts` - Unit tests (23 tests)

**Modified:**
- `src/services/offline/index.ts` - Added exports for cart persistence
- `src/stores/cartStore.ts` - Added subscribeWithSelector, clearPersistedCart in clearCart, initCartPersistence function
- `src/App.tsx` - Added cart persistence initialization and restoration on startup
- `src/locales/fr.json` - Added cart.restored, cart.itemsRemoved
- `src/locales/en.json` - Added cart.restored, cart.itemsRemoved
- `src/locales/id.json` - Added cart.restored, cart.itemsRemoved

## Senior Developer Review (AI)

**Reviewed by:** Claude Opus 4.5 (Adversarial Code Review)
**Date:** 2026-02-01

### Issues Found and Fixed

| Severity | Issue | Resolution |
|----------|-------|------------|
| HIGH | `cart.restored` translation defined but never used | Added `toast.success(t('cart.restored'))` in App.tsx when cart is restored |
| MEDIUM | No test for `hasPersistedCart` error handling | Added test case for localStorage error scenario |
| MEDIUM | `t` missing from useEffect dependencies | Added `t` to dependency array (safe with ref guard) |
| MEDIUM | Validation only checks `is_active`, not `pos_visible`/`available_for_sale` | Updated `validateAndFilterCartItems` to check all 3 flags |

### Tests After Review

- **Total tests:** 23 (was 20, added 3)
- **New tests:**
  - `hasPersistedCart` error handling
  - `pos_visible` validation
  - `available_for_sale` validation

### Verdict

✅ **APPROVED** - All HIGH and MEDIUM issues fixed, tests passing

