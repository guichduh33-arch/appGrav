# Story 3.1: Dexie Schema for Orders & Sync Queue

Status: done

## Story

As a **Système**,
I want **une structure IndexedDB pour les commandes et la sync queue**,
so that **les transactions peuvent être stockées et synchronisées**.

## Acceptance Criteria

### AC1: Création des Tables Dexie au Démarrage
**Given** l'application s'initialise
**When** Dexie est configuré
**Then** les tables `offline_orders`, `offline_order_items`, `sync_queue` sont créées
**And** `sync_queue` suit le format `ISyncQueueItem` (entity, action, payload, created_at, attempts)

### AC2: Génération UUID Local et Entrée Sync Queue
**Given** une commande est créée offline
**When** elle est sauvegardée
**Then** un UUID local est généré (préfixé `LOCAL-`)
**And** une entrée est ajoutée à `sync_queue` avec action `create`

### AC3: Structure Complète des Tables Orders
**Given** une commande offline est créée
**When** elle est stockée dans Dexie
**Then** `offline_orders` contient tous les champs essentiels: id, order_number, status, order_type, subtotal, tax_amount, discount_amount, total, customer_id, table_number, notes, created_at, user_id
**And** `offline_order_items` contient: id, order_id, product_id, product_name, quantity, unit_price, subtotal, modifiers, notes

### AC4: Index Optimisés pour Requêtes
**Given** les tables offline sont créées
**When** des requêtes sont effectuées
**Then** les index permettent des recherches rapides par: order_number, status, created_at, customer_id
**And** les items sont accessibles par order_id

## Tasks / Subtasks

- [x] **Task 1: Définir les interfaces TypeScript** (AC: 3, 4)
  - [x] 1.1: Créer `IOfflineOrder` dans `src/types/offline.ts` avec tous les champs
  - [x] 1.2: Créer `IOfflineOrderItem` dans `src/types/offline.ts`
  - [x] 1.3: Ajouter `TOrderStatus` et `TOrderType` types
  - [x] 1.4: Documenter les champs avec JSDoc

- [x] **Task 2: Étendre le schéma Dexie à v7** (AC: 1, 4)
  - [x] 2.1: Ajouter table `offline_orders` avec index dans `src/lib/db.ts`
  - [x] 2.2: Ajouter table `offline_order_items` avec index
  - [x] 2.3: Mettre à jour la classe `OfflineDatabase` avec les nouvelles tables
  - [x] 2.4: Importer les nouveaux types dans db.ts

- [x] **Task 3: Créer le service ordersCacheService** (AC: 2, 3)
  - [x] 3.1: Créer `src/services/offline/ordersCacheService.ts`
  - [x] 3.2: Implémenter `generateLocalOrderId()` avec préfixe `LOCAL-`
  - [x] 3.3: Implémenter `generateOfflineOrderNumber()` format `OFFLINE-YYYYMMDD-XXX`
  - [x] 3.4: Implémenter `saveOfflineOrder(order, items)`
  - [x] 3.5: Implémenter `getOfflineOrders()` et `getOfflineOrderById(id)`
  - [x] 3.6: Implémenter `getOfflineOrderItems(orderId)`
  - [x] 3.7: Implémenter `updateOfflineOrderStatus(id, status)`

- [x] **Task 4: Enrichir le syncQueueService** (AC: 2)
  - [x] 4.1: Intégrer sync queue dans ordersCacheService (utilise db.ts offline_sync_queue)
  - [x] 4.2: Ajouter fonction `addOrderToSyncQueue()` private dans ordersCacheService
  - [x] 4.3: Vérifier que `ISyncQueueItem` est compatible (TSyncEntity inclut 'orders')

- [x] **Task 5: Créer les tests unitaires** (AC: 1, 2, 3, 4)
  - [x] 5.1: Créer `src/services/offline/__tests__/ordersCacheService.test.ts`
  - [x] 5.2: Tester génération UUID local avec préfixe
  - [x] 5.3: Tester sauvegarde/lecture orders et items
  - [x] 5.4: Tester ajout automatique à sync queue
  - [x] 5.5: Tester les index et requêtes
  - [x] 5.6: Mock fake-indexeddb pour isolation

- [x] **Task 6: Ajouter les traductions** (AC: 2)
  - [x] 6.1: Ajouter clés `sync.queue.*` dans `fr.json`
  - [x] 6.2: Ajouter clés dans `en.json`
  - [x] 6.3: Ajouter clés dans `id.json`

## Dev Notes

### Architecture Compliance (MANDATORY)

**ADR-001: Entités Synchronisées Offline** [Source: architecture/core-architectural-decisions.md#ADR-001]
- `orders` + `order_items` → **Read-write sync** (Coeur du POS)
- `pos_sessions` → **Read-write sync** (Session caisse)
- Ces entités requièrent une sync queue pour les opérations offline

**ADR-002: Stratégie de Synchronisation** [Source: architecture/core-architectural-decisions.md#ADR-002]
```typescript
// Sync Queue Structure
{
  id: number,           // Auto-increment Dexie
  entity: 'orders',
  action: 'create',
  entityId: 'LOCAL-uuid',
  payload: { /* order data */ },
  created_at: '2026-02-01T...',
  status: 'pending',
  retries: 0,
  lastError?: string
}
```

- **Conflict Resolution:** Last-Write-Wins + Audit Trail
- **Retry:** 3 tentatives avec backoff exponentiel
- **Purge:** Après confirmation serveur

### Naming Conventions (CRITICAL)

**Tables Dexie** [Source: architecture/implementation-patterns-consistency-rules.md#Naming-Patterns]
```typescript
// TOUTES les tables Dexie doivent être préfixées `offline_`
offline_orders        // ✅ Correct
offline_order_items   // ✅ Correct
orders               // ❌ INTERDIT
```

**Types TypeScript** [Source: CLAUDE.md#Coding-Conventions]
```typescript
// Interfaces: I prefix
interface IOfflineOrder { ... }
interface IOfflineOrderItem { ... }

// Types: T prefix
type TOrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type TOrderType = 'dine_in' | 'takeaway' | 'delivery' | 'b2b';
```

### Schema Design - IOfflineOrder

```typescript
// src/types/offline.ts - À ajouter

/**
 * Cached order for offline POS operations
 *
 * Stored in Dexie table: offline_orders
 * Synced to server when online via sync_queue
 *
 * @see ADR-001: Entités Synchronisées Offline
 * @see ADR-002: Stratégie de Synchronisation
 */
export interface IOfflineOrder {
  /** Order UUID - préfixé LOCAL- si créé offline */
  id: string;

  /** Order number for display: OFFLINE-YYYYMMDD-XXX */
  order_number: string;

  /** Order status */
  status: TOrderStatus;

  /** Order type */
  order_type: TOrderType;

  /** Subtotal before tax and discounts */
  subtotal: number;

  /** Tax amount (10% included) */
  tax_amount: number;

  /** Discount amount applied */
  discount_amount: number;

  /** Discount type if applied */
  discount_type: 'percentage' | 'amount' | null;

  /** Discount value (percentage or amount) */
  discount_value: number | null;

  /** Final total */
  total: number;

  /** FK to customers.id (nullable) */
  customer_id: string | null;

  /** Table number for dine_in */
  table_number: string | null;

  /** Order notes */
  notes: string | null;

  /** FK to user_profiles.id - who created the order */
  user_id: string;

  /** FK to pos_sessions.id */
  session_id: string | null;

  /** ISO 8601 timestamp of creation */
  created_at: string;

  /** ISO 8601 timestamp of last update */
  updated_at: string;

  /** Sync status for offline tracking */
  sync_status: 'local' | 'pending_sync' | 'synced' | 'conflict';

  /** Server ID after sync (replaces LOCAL- id) */
  server_id?: string;
}

/**
 * Order status enum
 */
export type TOrderStatus =
  | 'pending'     // Just created, not yet sent
  | 'preparing'   // Sent to kitchen
  | 'ready'       // Ready for pickup/serve
  | 'completed'   // Paid and done
  | 'cancelled'   // Cancelled
  | 'refunded';   // Refunded

/**
 * Order type enum
 */
export type TOrderType =
  | 'dine_in'     // Table service
  | 'takeaway'    // Take away
  | 'delivery'    // Delivery order
  | 'b2b';        // B2B wholesale
```

### Schema Design - IOfflineOrderItem

```typescript
// src/types/offline.ts - À ajouter

/**
 * Cached order item for offline POS operations
 *
 * Stored in Dexie table: offline_order_items
 * Linked to orders via order_id
 */
export interface IOfflineOrderItem {
  /** Item UUID (auto-generated) */
  id: string;

  /** FK to offline_orders.id */
  order_id: string;

  /** FK to products.id */
  product_id: string;

  /** Product name at time of order (denormalized) */
  product_name: string;

  /** Product SKU at time of order */
  product_sku: string | null;

  /** Quantity ordered */
  quantity: number;

  /** Unit price at time of order */
  unit_price: number;

  /** Line subtotal (quantity * unit_price + modifiers) */
  subtotal: number;

  /** Applied modifiers as JSON */
  modifiers: IOfflineOrderItemModifier[];

  /** Item notes */
  notes: string | null;

  /** Dispatch station for KDS routing */
  dispatch_station: TDispatchStation | null;

  /** Item status for KDS */
  item_status: 'pending' | 'preparing' | 'ready';

  /** ISO 8601 timestamp */
  created_at: string;
}

/**
 * Modifier applied to an order item
 */
export interface IOfflineOrderItemModifier {
  /** Modifier option ID */
  option_id: string;

  /** Group name */
  group_name: string;

  /** Option label */
  option_label: string;

  /** Price adjustment */
  price_adjustment: number;
}
```

### Dexie Schema v7 Design

```typescript
// src/lib/db.ts - Version 7 à ajouter

// Version 7: Orders cache (Story 3.1)
this.version(7).stores({
  // Preserve all existing tables from v6
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

  // NEW: Orders cache (Story 3.1)
  // Indexes: id (primary), order_number, status, order_type, customer_id, session_id, created_at, sync_status
  // Compound index for common queries
  offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, [status+created_at]',

  // NEW: Order items cache (Story 3.1)
  // Indexes: id (primary), order_id, product_id, item_status
  offline_order_items: 'id, order_id, product_id, item_status',
});
```

### ordersCacheService Pattern

```typescript
// src/services/offline/ordersCacheService.ts

import { db } from '@/lib/db';
import type {
  IOfflineOrder,
  IOfflineOrderItem,
  TOrderStatus,
  TOrderType
} from '@/types/offline';
import { addToSyncQueue } from '@/services/sync/syncQueue';

/**
 * Generate a local UUID with LOCAL- prefix
 * Prefix is used to identify orders created offline
 * Will be replaced by server UUID after sync
 */
export function generateLocalOrderId(): string {
  return `LOCAL-${crypto.randomUUID()}`;
}

/**
 * Generate offline order number: OFFLINE-YYYYMMDD-XXX
 * XXX is a sequential number for the day
 */
export async function generateOfflineOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const prefix = `OFFLINE-${dateStr}-`;

  // Count existing orders with same prefix today
  const existingCount = await db.offline_orders
    .where('order_number')
    .startsWith(prefix)
    .count();

  const sequence = (existingCount + 1).toString().padStart(3, '0');
  return `${prefix}${sequence}`;
}

/**
 * Save an order with items to IndexedDB
 * Automatically adds to sync queue for later processing
 */
export async function saveOfflineOrder(
  order: Omit<IOfflineOrder, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'sync_status'>,
  items: Omit<IOfflineOrderItem, 'id' | 'order_id' | 'created_at'>[]
): Promise<{ order: IOfflineOrder; items: IOfflineOrderItem[] }> {
  const orderId = generateLocalOrderId();
  const orderNumber = await generateOfflineOrderNumber();
  const now = new Date().toISOString();

  const fullOrder: IOfflineOrder = {
    ...order,
    id: orderId,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
    sync_status: 'pending_sync',
  };

  const fullItems: IOfflineOrderItem[] = items.map(item => ({
    ...item,
    id: crypto.randomUUID(),
    order_id: orderId,
    created_at: now,
  }));

  // Transaction: save order, items, and add to sync queue
  await db.transaction('rw', [db.offline_orders, db.offline_order_items, db.offline_sync_queue], async () => {
    await db.offline_orders.add(fullOrder);
    await db.offline_order_items.bulkAdd(fullItems);

    // Add to sync queue
    await addToSyncQueue('orders', 'create', orderId, {
      order: fullOrder,
      items: fullItems,
    });
  });

  return { order: fullOrder, items: fullItems };
}

/**
 * Get all offline orders, sorted by created_at descending
 */
export async function getOfflineOrders(): Promise<IOfflineOrder[]> {
  return db.offline_orders
    .orderBy('created_at')
    .reverse()
    .toArray();
}

/**
 * Get a specific order by ID
 */
export async function getOfflineOrderById(id: string): Promise<IOfflineOrder | undefined> {
  return db.offline_orders.get(id);
}

/**
 * Get items for a specific order
 */
export async function getOfflineOrderItems(orderId: string): Promise<IOfflineOrderItem[]> {
  return db.offline_order_items
    .where('order_id')
    .equals(orderId)
    .toArray();
}

/**
 * Update order status
 */
export async function updateOfflineOrderStatus(
  id: string,
  status: TOrderStatus
): Promise<void> {
  const now = new Date().toISOString();

  await db.transaction('rw', [db.offline_orders, db.offline_sync_queue], async () => {
    await db.offline_orders.update(id, {
      status,
      updated_at: now
    });

    // Add update to sync queue
    await addToSyncQueue('orders', 'update', id, { status });
  });
}

/**
 * Get orders by status
 */
export async function getOfflineOrdersByStatus(status: TOrderStatus): Promise<IOfflineOrder[]> {
  return db.offline_orders
    .where('status')
    .equals(status)
    .toArray();
}

/**
 * Get pending sync orders (for sync indicator)
 */
export async function getPendingSyncOrdersCount(): Promise<number> {
  return db.offline_orders
    .where('sync_status')
    .equals('pending_sync')
    .count();
}
```

### Previous Story Intelligence

**Epic 2 Retrospective Learnings** [Source: epic-2-retrospective.md]
1. **Dexie Boolean Gotcha:** IndexedDB stores booleans as 0/1 - use `Boolean()` for coercion
2. **Index composés + fake-indexeddb:** Ne fonctionnent pas correctement - filtrage mémoire requis
3. **Pattern service établi:** `cacheAll()`, `getCached()`, `shouldRefresh()`, `getLastSyncAt()`
4. **Sync metadata:** Utiliser `offline_sync_meta` pour tracking freshness

**Story 2.5 Pattern: Offline Modes** [Source: 2-5-production-records-online-only.md]
- Online-only avec mode dégradé → rappels localStorage
- Orders différent: full read-write sync, pas juste rappels

### Testing Strategy

**Mock fake-indexeddb:**
```typescript
// Dans setup test
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  // Clear all tables before each test
  await db.offline_orders.clear();
  await db.offline_order_items.clear();
  await db.offline_sync_queue.clear();
});

afterEach(async () => {
  await db.close();
});
```

**Test Cases:**
1. `generateLocalOrderId()` - retourne UUID avec préfixe LOCAL-
2. `generateOfflineOrderNumber()` - format OFFLINE-YYYYMMDD-XXX, incrémente
3. `saveOfflineOrder()` - crée order + items + entrée sync queue en transaction
4. `getOfflineOrders()` - retourne triés par date décroissante
5. `getOfflineOrderById()` - retourne undefined si pas trouvé
6. `getOfflineOrderItems()` - filtre par order_id
7. `updateOfflineOrderStatus()` - met à jour status + sync queue

### Traductions à Ajouter

```json
// fr.json
{
  "sync": {
    "queue": {
      "orderCreated": "Commande créée hors ligne",
      "orderPending": "En attente de synchronisation",
      "orderSynced": "Synchronisé avec le serveur",
      "orderConflict": "Conflit de synchronisation"
    }
  }
}
```

```json
// en.json
{
  "sync": {
    "queue": {
      "orderCreated": "Order created offline",
      "orderPending": "Pending synchronization",
      "orderSynced": "Synced with server",
      "orderConflict": "Sync conflict"
    }
  }
}
```

```json
// id.json
{
  "sync": {
    "queue": {
      "orderCreated": "Pesanan dibuat secara offline",
      "orderPending": "Menunggu sinkronisasi",
      "orderSynced": "Disinkronkan dengan server",
      "orderConflict": "Konflik sinkronisasi"
    }
  }
}
```

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── services/
│   └── offline/
│       ├── ordersCacheService.ts          # NEW: Orders offline service
│       └── __tests__/
│           └── ordersCacheService.test.ts # NEW: Unit tests
```

**Fichiers à modifier:**
- `src/types/offline.ts` - Ajouter IOfflineOrder, IOfflineOrderItem, TOrderStatus, TOrderType
- `src/lib/db.ts` - Ajouter schéma v7 avec offline_orders et offline_order_items
- `src/services/sync/syncQueue.ts` - Vérifier compatibilité addToSyncQueue
- `src/services/offline/index.ts` - Exporter ordersCacheService
- `src/locales/fr.json`, `en.json`, `id.json` - Ajouter traductions sync.queue.*

### Dependencies on Previous Work

- ✅ `src/lib/db.ts` - Dexie instance configurée (v6 existante)
- ✅ `src/types/offline.ts` - Types offline existants
- ✅ `src/services/sync/syncQueue.ts` - Service sync queue existant
- ✅ `useNetworkStatus` hook disponible

### Epic 3 Context

Cette story est la **fondation** de l'Epic 3 (POS & Ventes). Les stories suivantes dépendent de ce schéma:
- 3.2: Cart Persistence → utilise offline_orders partiellement
- 3.3: Offline Order Creation → utilise saveOfflineOrder()
- 3.4: Offline Payment → étend les tables
- 3.5: Session Management → ajoute offline_pos_sessions
- 3.6: Sync Queue Processing → process offline_sync_queue

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-3.1]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-002]
- [Source: _bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md]
- [Source: _bmad-output/implementation-artifacts/epic-2-retrospective.md]
- [Source: src/lib/db.ts] - Dexie instance existante
- [Source: src/types/offline.ts] - Types offline existants
- [Source: src/services/sync/syncQueue.ts] - Sync queue service
- [Source: CLAUDE.md#Coding-Conventions] - Conventions de code

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5 (claude-opus-4-5-20251101)
**Date:** 2026-02-01
**Outcome:** ✅ APPROVED

### Issues Found & Fixed

| Severity | Issue | Resolution |
|----------|-------|------------|
| MEDIUM | M1: ISyncQueueItem uses `retries` instead of `attempts` per AC1 | Documented - `retries` is semantically equivalent, no code change needed |
| MEDIUM | M3: 8 console.log statements in production code | ✅ FIXED - Removed all console.log from ordersCacheService.ts |
| MEDIUM | M4: No input validation on saveOfflineOrder() | ✅ FIXED - Added validation for user_id, total, item quantity, product_id |
| LOW | L1: No error/edge case tests | ✅ FIXED - Added 4 validation tests |

### Acceptance Criteria Validation

| AC | Status | Evidence |
|----|--------|----------|
| AC1: Tables Dexie créées | ✅ PASS | db.ts:182-205 - v7 schema |
| AC2: UUID LOCAL- et sync queue | ✅ PASS | ordersCacheService.ts:42-44, 177-190 |
| AC3: Champs complets | ✅ PASS | offline.ts:685-742, 770-809 |
| AC4: Index optimisés | ✅ PASS | db.ts:200-204 |

### Test Results Post-Review

- **42 tests passing** (38 original + 4 new validation tests)
- All acceptance criteria verified against implementation

### Notes

- AC1 mentions `attempts` field but implementation uses `retries` - functionally equivalent
- Table naming uses `offline_sync_queue` (correct per ADR-001) not `sync_queue` as written in AC1

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None

### Completion Notes List

- Implemented Dexie schema v7 with `offline_orders` and `offline_order_items` tables following Epic 2 pattern
- Created comprehensive TypeScript types: `IOfflineOrder`, `IOfflineOrderItem`, `IOfflineOrderItemModifier`, `TOrderStatus`, `TOrderType`, `TOfflineOrderSyncStatus`, `TOrderItemStatus`
- Added constants `LOCAL_ORDER_ID_PREFIX` and `OFFLINE_ORDER_NUMBER_PREFIX` for consistent order identification
- Created `ordersCacheService.ts` with 20+ functions for order CRUD operations, sync queue integration, and status management
- Integrated sync queue functionality directly into ordersCacheService using `db.offline_sync_queue` (consistent with Epic 2 architecture using db.ts, not legacy offlineDb.ts)
- All 42 unit tests passing with fake-indexeddb mock - covers ID generation, order number sequencing, CRUD operations, sync queue integration, cleanup, and input validation
- No regressions: 273 tests passing across all 10 offline service test files
- Added 4 translation keys in all 3 locales (fr/en/id) for sync queue status messages
- Exported all new functions and types from `services/offline/index.ts`

### Change Log

- 2026-02-01: Code review completed - removed console.log statements, added input validation, 4 new tests
- 2026-02-01: Story 3.1 implementation completed - Dexie schema v7 for orders and sync queue

### File List

**Created:**
- `src/services/offline/ordersCacheService.ts` - Orders offline service (280 lines)
- `src/services/offline/__tests__/ordersCacheService.test.ts` - Unit tests (42 tests)

**Modified:**
- `src/types/offline.ts` - Added IOfflineOrder, IOfflineOrderItem, IOfflineOrderItemModifier, TOrderStatus, TOrderType, TOfflineOrderSyncStatus, TOrderItemStatus types and constants
- `src/lib/db.ts` - Added Dexie schema v7 with offline_orders and offline_order_items tables, imported new types
- `src/services/offline/index.ts` - Exported ordersCacheService functions and types
- `src/locales/fr.json` - Added sync.queue.* translations
- `src/locales/en.json` - Added sync.queue.* translations
- `src/locales/id.json` - Added sync.queue.* translations

