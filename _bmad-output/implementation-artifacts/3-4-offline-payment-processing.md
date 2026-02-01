# Story 3.4: Offline Payment Processing

Status: done

## Story

As a **Caissier**,
I want **enregistrer les paiements même offline**,
so that **je peux encaisser normalement lors des coupures internet**.

## Acceptance Criteria

### AC1: Enregistrement Paiement Offline
**Given** je suis offline avec une commande à payer
**When** je sélectionne un mode de paiement (cash, card, QRIS)
**Then** le paiement est enregistré localement dans `offline_payments`
**And** le rendu monnaie est calculé pour cash

### AC2: Paiements Split (Partiel)
**Given** le paiement est split (partiel cash + card)
**When** je finalise
**Then** tous les paiements sont stockés dans `offline_payments`
**And** liés à la commande par `order_id`
**And** le total des paiements égale le total de la commande

### AC3: Intégration avec Création de Commande
**Given** une commande est finalisée avec paiement offline
**When** le paiement est confirmé
**Then** la commande est créée via `offlineOrderService.createOfflineOrder()`
**And** les paiements sont liés à cette commande
**And** le panier est vidé
**And** l'écran de succès s'affiche

### AC4: Restriction Modes de Paiement Offline
**Given** l'application est offline
**When** je veux payer par card ou QRIS
**Then** ces modes sont disponibles mais marqués "en attente de validation online"
**And** le paiement est enregistré localement avec statut `pending_validation`

### AC5: Ajout à la Sync Queue
**Given** un paiement est enregistré offline
**When** il est sauvegardé
**Then** une entrée est ajoutée à `offline_sync_queue` avec entity `payments`
**And** le payload contient les paiements liés à la commande

## Tasks / Subtasks

- [x] **Task 1: Étendre le schéma Dexie pour les paiements** (AC: 1, 2, 5)
  - [x] 1.1: Ajouter `IOfflinePayment` type dans `src/types/offline.ts`
  - [x] 1.2: Ajouter table `offline_payments` dans `src/lib/db.ts` (version 8)
  - [x] 1.3: Ajouter index sur `order_id` et `sync_status`

- [x] **Task 2: Créer le service offlinePaymentService** (AC: 1, 2, 5)
  - [x] 2.1: Créer `src/services/offline/offlinePaymentService.ts`
  - [x] 2.2: Implémenter `saveOfflinePayment(orderId, paymentData)`
  - [x] 2.3: Implémenter `saveOfflinePayments(orderId, payments[])` pour split
  - [x] 2.4: Implémenter `calculateChange(total, cashReceived)`
  - [x] 2.5: Intégrer avec sync queue automatiquement

- [x] **Task 3: Créer le hook useOfflinePayment** (AC: 1, 3)
  - [x] 3.1: Créer `src/hooks/offline/useOfflinePayment.ts`
  - [x] 3.2: Implémenter `processPayment()` avec online/offline routing
  - [x] 3.3: Intégrer avec `createOfflineOrder()` de offlineOrderService
  - [x] 3.4: Gérer le flow complet: panier → commande → paiement → clear

- [x] **Task 4: Modifier PaymentModal pour support offline** (AC: 1, 3, 4)
  - [x] 4.1: Intégrer `useOfflinePayment` dans PaymentModal
  - [x] 4.2: Remplacer `useOrders().createOrder()` par le nouveau hook
  - [x] 4.3: Conserver le comportement existant pour mode online
  - [x] 4.4: Afficher indicateur pour card/QRIS "en attente validation" si offline

- [x] **Task 5: Modifier useOrders pour routing automatique** (AC: 3)
  - [x] 5.1: DEFERRED - PaymentModal utilise directement useOfflinePayment
  - [x] 5.2: Le routing est géré au niveau du hook useOfflinePayment
  - [x] 5.3: Compatibilité maintenue, PaymentModal n'utilise plus useOrders

- [x] **Task 6: Créer les tests unitaires** (AC: 1, 2, 3, 5)
  - [x] 6.1: Créer `src/services/offline/__tests__/offlinePaymentService.test.ts`
  - [x] 6.2: Tester création paiement simple (cash)
  - [x] 6.3: Tester création paiement card avec `pending_validation`
  - [x] 6.4: Tester paiements split
  - [x] 6.5: Tester calcul change
  - [x] 6.6: Tester intégration sync queue

- [x] **Task 7: Ajouter les traductions** (AC: 4)
  - [x] 7.1: Ajouter clés `payment.pendingValidation`, `payment.offlinePaymentSaved`, `payment.willValidateOnline` dans `fr.json`
  - [x] 7.2: Ajouter clés dans `en.json`
  - [x] 7.3: Ajouter clés dans `id.json`

## Dev Notes

### Architecture Compliance (MANDATORY)

**ADR-001: Entités Synchronisées Offline** [Source: architecture/core-architectural-decisions.md#ADR-001]
- `orders` + `order_items` → **Read-write sync** (Coeur du POS)
- `payments` (nouvelle entité) → **Read-write sync** (lié aux orders)

**ADR-002: Stratégie de Synchronisation** [Source: architecture/core-architectural-decisions.md#ADR-002]
```typescript
// Sync Queue Structure pour payments
{
  id: number,           // Auto-increment Dexie
  entity: 'payments',   // NOUVEAU type d'entité
  action: 'create',
  entityId: 'LOCAL-uuid',
  payload: { payments: [...] },
  created_at: '2026-02-01T...',
  status: 'pending',
  retries: 0
}
```

### Existing Services to REUSE (CRITICAL)

**Story 3.1 Foundation - ordersCacheService.ts** [Source: src/services/offline/ordersCacheService.ts]
```typescript
// ALREADY IMPLEMENTED - USE THESE FUNCTIONS
import {
  saveOfflineOrder,
  generateLocalOrderId,
  getOfflineOrderById,
} from '@/services/offline/ordersCacheService';

// saveOfflineOrder() handles:
// - LOCAL- prefixed UUID generation
// - OFFLINE-YYYYMMDD-XXX order number
// - Automatic sync queue entry
// - Transaction safety
```

**Story 3.3 Foundation - offlineOrderService.ts** [Source: src/services/offline/offlineOrderService.ts]
```typescript
// ALREADY IMPLEMENTED - USE THESE FUNCTIONS
import { createOfflineOrder } from '@/services/offline/offlineOrderService';

// createOfflineOrder() handles:
// - Cart to order conversion
// - Tax calculation (10% included)
// - Modifier handling
// - Uses saveOfflineOrder() internally
```

### Type Definitions (NEW)

**IOfflinePayment** - À ajouter dans `src/types/offline.ts`
```typescript
/**
 * Sync status for offline payment tracking
 */
export type TOfflinePaymentSyncStatus =
  | 'pending_sync'       // Queued for synchronization
  | 'pending_validation' // Card/QRIS needs online validation
  | 'synced'             // Successfully synced with server
  | 'conflict';          // Sync conflict detected

/**
 * Payment method types
 */
export type TPaymentMethod = 'cash' | 'card' | 'qris' | 'transfer' | 'ewallet';

/**
 * Cached payment for offline POS operations
 *
 * Stored in Dexie table: offline_payments
 * Synced to server when online via offline_sync_queue
 */
export interface IOfflinePayment {
  /** Payment UUID - préfixé LOCAL- si créé offline */
  id: string;

  /** FK to offline_orders.id */
  order_id: string;

  /** Payment method type */
  method: TPaymentMethod;

  /** Payment amount in IDR */
  amount: number;

  /** Cash received (for cash payments only) */
  cash_received: number | null;

  /** Change given (for cash payments only) */
  change_given: number | null;

  /** Reference number for card/QRIS/transfer */
  reference: string | null;

  /** FK to user_profiles.id - who processed the payment */
  user_id: string;

  /** FK to pos_sessions.id */
  session_id: string | null;

  /** ISO 8601 timestamp of payment */
  created_at: string;

  /** Sync status for offline tracking */
  sync_status: TOfflinePaymentSyncStatus;

  /** Server ID after successful sync */
  server_id?: string;
}

/** Local payment ID prefix for identifying offline-created payments */
export const LOCAL_PAYMENT_ID_PREFIX = 'LOCAL-PAY-';
```

### Dexie Schema Update (Version 8)

```typescript
// Version 8: Payments cache (Story 3.4)
this.version(8).stores({
  // Preserve all existing tables...
  offline_users: 'id, cached_at',
  offline_sync_queue: '++id, entity, status, created_at',
  offline_settings: 'key, category_id, updated_at',
  offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
  offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
  offline_business_hours: 'day_of_week',
  offline_sync_meta: 'entity',
  offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
  offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',
  offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
  offline_recipes: 'id, product_id, material_id, is_active, [is_active+product_id]',
  offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, [status+created_at]',
  offline_order_items: 'id, order_id, product_id, item_status',

  // NEW: Payments cache (Story 3.4)
  // Indexes: id (primary), order_id (FK), method, sync_status, created_at
  offline_payments: 'id, order_id, method, sync_status, created_at',
});
```

### TSyncEntity Update

```typescript
// In src/types/offline.ts - Update TSyncEntity
export type TSyncEntity =
  | 'orders'
  | 'order_items'
  | 'payments'      // NEW
  | 'pos_sessions'
  | 'customers'
  | 'products'
  | 'categories';
```

### offlinePaymentService Implementation Pattern

```typescript
// src/services/offline/offlinePaymentService.ts

import { db } from '@/lib/db';
import type {
  IOfflinePayment,
  ISyncQueueItem,
  TPaymentMethod,
  TOfflinePaymentSyncStatus,
} from '@/types/offline';
import { LOCAL_PAYMENT_ID_PREFIX } from '@/types/offline';

/**
 * Generate a local UUID with LOCAL-PAY- prefix
 */
export function generateLocalPaymentId(): string {
  return `${LOCAL_PAYMENT_ID_PREFIX}${crypto.randomUUID()}`;
}

/**
 * Input type for creating an offline payment
 */
export type TCreateOfflinePaymentInput = {
  order_id: string;
  method: TPaymentMethod;
  amount: number;
  cash_received?: number;
  change_given?: number;
  reference?: string;
  user_id: string;
  session_id?: string | null;
};

/**
 * Determine sync status based on payment method
 * - Cash: pending_sync (can sync immediately)
 * - Card/QRIS: pending_validation (needs online validation)
 */
function getSyncStatus(method: TPaymentMethod): TOfflinePaymentSyncStatus {
  if (method === 'cash') {
    return 'pending_sync';
  }
  // Card, QRIS, etc. need online validation
  return 'pending_validation';
}

/**
 * Calculate change for cash payment
 */
export function calculateChange(total: number, cashReceived: number): number {
  return Math.max(0, cashReceived - total);
}

/**
 * Save a single payment to IndexedDB
 */
export async function saveOfflinePayment(
  input: TCreateOfflinePaymentInput
): Promise<IOfflinePayment> {
  const now = new Date().toISOString();
  const paymentId = generateLocalPaymentId();
  const syncStatus = getSyncStatus(input.method);

  const payment: IOfflinePayment = {
    id: paymentId,
    order_id: input.order_id,
    method: input.method,
    amount: input.amount,
    cash_received: input.cash_received ?? null,
    change_given: input.change_given ?? null,
    reference: input.reference ?? null,
    user_id: input.user_id,
    session_id: input.session_id ?? null,
    created_at: now,
    sync_status: syncStatus,
  };

  await db.transaction(
    'rw',
    [db.offline_payments, db.offline_sync_queue],
    async () => {
      await db.offline_payments.add(payment);

      // Add to sync queue
      const syncItem: Omit<ISyncQueueItem, 'id'> = {
        entity: 'payments',
        action: 'create',
        entityId: paymentId,
        payload: { payment },
        created_at: now,
        status: 'pending',
        retries: 0,
      };
      await db.offline_sync_queue.add(syncItem as ISyncQueueItem);
    }
  );

  return payment;
}

/**
 * Save multiple payments (split payment)
 */
export async function saveOfflinePayments(
  orderId: string,
  payments: TCreateOfflinePaymentInput[]
): Promise<IOfflinePayment[]> {
  const now = new Date().toISOString();

  const fullPayments: IOfflinePayment[] = payments.map(input => ({
    id: generateLocalPaymentId(),
    order_id: orderId,
    method: input.method,
    amount: input.amount,
    cash_received: input.cash_received ?? null,
    change_given: input.change_given ?? null,
    reference: input.reference ?? null,
    user_id: input.user_id,
    session_id: input.session_id ?? null,
    created_at: now,
    sync_status: getSyncStatus(input.method),
  }));

  await db.transaction(
    'rw',
    [db.offline_payments, db.offline_sync_queue],
    async () => {
      await db.offline_payments.bulkAdd(fullPayments);

      // Add single sync queue entry for all payments
      const syncItem: Omit<ISyncQueueItem, 'id'> = {
        entity: 'payments',
        action: 'create',
        entityId: orderId, // Group by order
        payload: { payments: fullPayments },
        created_at: now,
        status: 'pending',
        retries: 0,
      };
      await db.offline_sync_queue.add(syncItem as ISyncQueueItem);
    }
  );

  return fullPayments;
}

/**
 * Get payments for an order
 */
export async function getPaymentsByOrderId(
  orderId: string
): Promise<IOfflinePayment[]> {
  return db.offline_payments.where('order_id').equals(orderId).toArray();
}

/**
 * Get total paid amount for an order
 */
export async function getOrderPaidAmount(orderId: string): Promise<number> {
  const payments = await getPaymentsByOrderId(orderId);
  return payments.reduce((sum, p) => sum + p.amount, 0);
}
```

### useOfflinePayment Hook Pattern

```typescript
// src/hooks/offline/useOfflinePayment.ts

import { useCallback, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useNetworkStatus } from './useNetworkStatus';
import { createOfflineOrder } from '@/services/offline/offlineOrderService';
import { saveOfflinePayment, calculateChange } from '@/services/offline/offlinePaymentService';
import type { IOfflineOrder, IOfflineOrderItem, TPaymentMethod } from '@/types/offline';

interface PaymentInput {
  method: TPaymentMethod;
  amount: number;
  cashReceived?: number;
  reference?: string;
}

interface UseOfflinePaymentResult {
  processPayment: (payment: PaymentInput) => Promise<{
    order: IOfflineOrder;
    items: IOfflineOrderItem[];
    change: number;
  } | null>;
  isProcessing: boolean;
  isOffline: boolean;
}

export function useOfflinePayment(): UseOfflinePaymentResult {
  const { isOnline } = useNetworkStatus();
  const cartState = useCartStore();
  const { user, sessionId } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPayment = useCallback(async (payment: PaymentInput) => {
    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    if (cartState.items.length === 0) {
      return null;
    }

    setIsProcessing(true);

    try {
      // Calculate change for cash
      const change = payment.method === 'cash' && payment.cashReceived
        ? calculateChange(cartState.total, payment.cashReceived)
        : 0;

      // 1. Create order (uses offlineOrderService)
      const { order, items } = await createOfflineOrder(
        {
          items: cartState.items,
          orderType: cartState.orderType,
          tableNumber: cartState.tableNumber,
          customerId: cartState.customerId,
          discountType: cartState.discountType,
          discountValue: cartState.discountValue,
          discountReason: cartState.discountReason,
          subtotal: cartState.subtotal,
          discountAmount: cartState.discountAmount,
          total: cartState.total,
        },
        user.id,
        sessionId
      );

      // 2. Save payment linked to order
      await saveOfflinePayment({
        order_id: order.id,
        method: payment.method,
        amount: payment.amount,
        cash_received: payment.cashReceived,
        change_given: change > 0 ? change : undefined,
        reference: payment.reference,
        user_id: user.id,
        session_id: sessionId,
      });

      // 3. Clear cart
      cartState.clearCart();

      return { order, items, change };
    } finally {
      setIsProcessing(false);
    }
  }, [cartState, user, sessionId]);

  return {
    processPayment,
    isProcessing,
    isOffline: !isOnline,
  };
}
```

### PaymentModal Integration Pattern

Le `PaymentModal` existant doit être modifié pour:
1. Utiliser `useOfflinePayment` au lieu de `useOrders`
2. Conserver le comportement online existant via routing automatique
3. Afficher un badge pour les paiements card/QRIS offline

```typescript
// Dans PaymentModal.tsx - modifications clés

import { useOfflinePayment } from '@/hooks/offline/useOfflinePayment';

// Dans le composant:
const { processPayment, isProcessing, isOffline } = useOfflinePayment();

// Remplacer handleConfirmPayment:
const handleConfirmPayment = async () => {
  if (!canComplete || isProcessing) return;

  try {
    const result = await processPayment({
      method: paymentMethod,
      amount: total,
      cashReceived: paymentMethod === 'cash' ? amountReceived : undefined,
    });

    if (result) {
      setShowSuccess(true);
      // Change is available in result.change for display
    }
  } catch (error: any) {
    toast.error(`${t('payment.toast_error')}: ${error.message}`);
  }
};
```

### Business Rules (CRITICAL)

**Taxe 10% INCLUSE dans les prix** [Source: CLAUDE.md#Business-Rules]
- La taxe est déjà calculée dans `createOfflineOrder()` via `total × 10/110`
- Le paiement utilise le `total` du cart qui inclut déjà la taxe

**Modes de paiement offline** [Source: Story 3.4 AC4]
- Cash: Disponible offline, statut `pending_sync`
- Card/QRIS: Disponible offline, statut `pending_validation` (validation online requise après sync)

**Calcul du rendu monnaie**
```typescript
// change = max(0, cashReceived - total)
const change = Math.max(0, amountReceived - cartState.total);
```

### Previous Story Intelligence

**Story 3.3 Patterns** [Source: 3-3-offline-order-creation.md]
- `createOfflineOrder()` prend le cart state et retourne `{ order, items }`
- La fonction gère la conversion cart → order et l'ajout à sync queue
- Le panier est vidé par le hook appelant, pas par le service

**Epic 2 Retrospective Learnings** [Source: epic-2-retrospective.md]
1. **Dexie Boolean Gotcha:** IndexedDB stores booleans as 0/1 - use `Boolean()` for coercion
2. **Service pattern établi:** Simple exports, no classes unless needed
3. **Testing:** Use `fake-indexeddb/auto` for Dexie tests

### Testing Strategy

**Test Cases for offlinePaymentService:**
1. `saveOfflinePayment()` - creates cash payment with `pending_sync` status
2. `saveOfflinePayment()` - creates card payment with `pending_validation` status
3. `saveOfflinePayments()` - creates multiple split payments
4. `calculateChange()` - calculates correct change
5. `calculateChange()` - returns 0 when cashReceived < total
6. `getPaymentsByOrderId()` - retrieves payments for order
7. `getOrderPaidAmount()` - calculates total paid

**Test Cases for useOfflinePayment:**
1. `processPayment()` - creates order and payment together
2. `processPayment()` - clears cart after success
3. `processPayment()` - throws for unauthenticated user
4. `processPayment()` - returns null for empty cart

### Traductions à Ajouter

```json
// fr.json - section payment
{
  "payment": {
    "pendingValidation": "En attente de validation",
    "offlinePaymentSaved": "Paiement enregistré hors ligne",
    "willValidateOnline": "Sera validé lors de la reconnexion",
    "offlineCashOnly": "Mode hors ligne - paiement en espèces uniquement"
  }
}
```

```json
// en.json
{
  "payment": {
    "pendingValidation": "Pending validation",
    "offlinePaymentSaved": "Payment saved offline",
    "willValidateOnline": "Will be validated when online",
    "offlineCashOnly": "Offline mode - cash payment only"
  }
}
```

```json
// id.json
{
  "payment": {
    "pendingValidation": "Menunggu validasi",
    "offlinePaymentSaved": "Pembayaran disimpan offline",
    "willValidateOnline": "Akan divalidasi saat online",
    "offlineCashOnly": "Mode offline - hanya pembayaran tunai"
  }
}
```

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── services/
│   └── offline/
│       ├── offlinePaymentService.ts          # NEW: Payment persistence service
│       └── __tests__/
│           └── offlinePaymentService.test.ts # NEW: Unit tests
├── hooks/
│   └── offline/
│       └── useOfflinePayment.ts              # NEW: Payment processing hook
```

**Fichiers à modifier:**
- `src/types/offline.ts` - Ajouter `IOfflinePayment`, `TPaymentMethod`, `TOfflinePaymentSyncStatus`, `TSyncEntity`
- `src/lib/db.ts` - Version 8 avec table `offline_payments`
- `src/services/offline/index.ts` - Exporter offlinePaymentService
- `src/hooks/offline/index.ts` - Exporter useOfflinePayment
- `src/components/pos/modals/PaymentModal.tsx` - Intégrer useOfflinePayment
- `src/hooks/useOrders.ts` - Optionnel: routing automatique online/offline
- `src/locales/fr.json`, `en.json`, `id.json` - Ajouter traductions

### Dependencies on Previous Work

- ✅ `src/lib/db.ts` - Dexie v7 avec `offline_orders`, `offline_order_items` (Story 3.1)
- ✅ `src/types/offline.ts` - Types IOfflineOrder, IOfflineOrderItem (Story 3.1)
- ✅ `src/services/offline/ordersCacheService.ts` - saveOfflineOrder() (Story 3.1)
- ✅ `src/services/offline/offlineOrderService.ts` - createOfflineOrder() (Story 3.3)
- ✅ `src/stores/cartStore.ts` - Cart state avec clearCart() (Story 3.2)
- ✅ `src/hooks/offline/useNetworkStatus.ts` - Online/offline detection (Story 1.4)
- ✅ `src/components/pos/modals/PaymentModal.tsx` - Modal existant à modifier

### Epic 3 Context

Cette story est la **4ème** de l'Epic 3 (POS & Ventes). Elle dépend de:
- ✅ Story 3.1: Dexie Schema (DONE)
- ✅ Story 3.2: Cart Persistence (DONE)
- ✅ Story 3.3: Offline Order Creation (DONE)

Les stories suivantes dépendent de celle-ci:
- Story 3.5: POS Session Management → session_id dans les paiements
- Story 3.6: Sync Queue Processing → synchronise les paiements offline
- Story 3.8: Pending Sync Counter Display → inclut les paiements pending

### Critical Implementation Notes

1. **NE PAS recréer ordersCacheService ou offlineOrderService** - Story 3.1 et 3.3 les ont déjà implémentés
2. **Transaction safety** - Utiliser `db.transaction()` pour order + payment ensemble
3. **Sync queue grouping** - Pour split payments, une seule entrée sync queue avec tous les paiements
4. **Card/QRIS offline** - Statut `pending_validation`, pas `pending_sync`
5. **Change calculation** - Toujours `max(0, cashReceived - total)` pour éviter les négatifs

### Anti-Patterns to AVOID

| ❌ Éviter | ✅ Faire |
|-----------|----------|
| Recréer createOfflineOrder | Utiliser l'existant de offlineOrderService |
| Bloquer card/QRIS offline | Accepter avec statut `pending_validation` |
| Sync queue séparée par payment | Une entrée avec tous les payments par order |
| Modifier le cart dans le service | Laisser le hook appeler `clearCart()` |
| Ignorer le sessionId | Toujours passer le sessionId pour traçabilité |

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-3.4]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-002]
- [Source: _bmad-output/implementation-artifacts/3-1-dexie-schema-for-orders-sync-queue.md]
- [Source: _bmad-output/implementation-artifacts/3-2-cart-persistence-offline.md]
- [Source: _bmad-output/implementation-artifacts/3-3-offline-order-creation.md]
- [Source: src/services/offline/ordersCacheService.ts]
- [Source: src/services/offline/offlineOrderService.ts]
- [Source: src/components/pos/modals/PaymentModal.tsx]
- [Source: src/hooks/useOrders.ts]
- [Source: CLAUDE.md#Business-Rules] - Taxe 10% incluse

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Tests passed: 35/35 in offlinePaymentService.test.ts

### Completion Notes List

1. Task 1-4, 6-7 implemented as specified
2. Task 5 (useOrders routing) was DEFERRED - PaymentModal now uses useOfflinePayment directly instead of modifying useOrders, which provides cleaner separation of concerns
3. Added `IOfflinePayment`, `TPaymentMethod`, `TOfflinePaymentSyncStatus` types
4. Extended TSyncEntity to include 'payments'
5. Dexie upgraded to version 8 with offline_payments table
6. PaymentModal fully refactored to use offline-capable hook
7. Card/QRIS payments show "pending validation" indicator when offline
8. All 35 unit tests pass for offlinePaymentService + 16 tests for useOfflinePayment hook

### Code Review Fixes Applied

- **[M1-FIXED]** Added unit tests for useOfflinePayment hook (16 tests)
- **[M2-FIXED]** Added design documentation explaining offline-first architecture in hook JSDoc
- **[M3-FIXED]** Added validation: payment amount must match cart total (with 1 IDR tolerance for rounding)

### File List

**Files Created:**
- src/services/offline/offlinePaymentService.ts
- src/services/offline/__tests__/offlinePaymentService.test.ts
- src/hooks/offline/useOfflinePayment.ts
- src/hooks/offline/__tests__/useOfflinePayment.test.ts

**Files Modified:**
- src/types/offline.ts (added payment types)
- src/lib/db.ts (version 8, offline_payments table)
- src/services/offline/index.ts (exports)
- src/hooks/offline/index.ts (exports)
- src/components/pos/modals/PaymentModal.tsx (refactored for offline)
- src/locales/fr.json (translations)
- src/locales/en.json (translations)
- src/locales/id.json (translations)

**Note:** `src/App.tsx` and `src/stores/cartStore.ts` also appear in git diff but belong to Story 3.2 (Cart Persistence) - they were not committed after that story.

