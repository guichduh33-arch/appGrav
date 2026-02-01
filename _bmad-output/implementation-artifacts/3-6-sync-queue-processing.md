# Story 3.6: Sync Queue Processing

Status: done

## Story

As a **Système**,
I want **synchroniser automatiquement les transactions quand internet revient**,
so that **les données sont cohérentes avec le serveur**.

## Acceptance Criteria

### AC1: Détection du Retour en Ligne et Traitement FIFO
**Given** internet revient après une période offline
**When** la connexion est détectée
**Then** la sync queue est traitée en FIFO (First In, First Out)
**And** chaque item est envoyé à Supabase
**And** le traitement commence automatiquement dans les 5 secondes

### AC2: Succès de Synchronisation
**Given** une transaction sync avec succès
**When** le serveur répond OK
**Then** l'item est supprimé de la queue (marqué `synced` puis purgé)
**And** l'ID local (LOCAL-*) est remplacé par l'ID serveur dans les tables locales
**And** le `sync_status` de l'entité passe à `synced`

### AC3: Gestion des Échecs avec Retry
**Given** une transaction échoue
**When** le serveur retourne une erreur
**Then** le compteur `retries` est incrémenté
**And** l'erreur est stockée dans `lastError`
**And** après 3 échecs, l'item est marqué `failed` définitivement
**And** un backoff exponentiel est appliqué entre les tentatives (5s → 10s → 30s)

### AC4: Sync des Orders avec Items et Payments
**Given** une commande offline est dans la sync queue
**When** elle est synchronisée
**Then** l'order est créé dans Supabase `orders`
**And** les order_items sont créés avec les bons `order_id`
**And** les payments associés sont créés avec les bons `order_id`
**And** la session_id est mise à jour si la session a aussi été synchronisée

### AC5: Sync des Sessions POS
**Given** une session POS offline est dans la sync queue
**When** elle est synchronisée
**Then** la session est créée dans Supabase `pos_sessions`
**And** le `server_id` est stocké localement
**And** les orders avec cette `session_id` locale sont mis à jour avec le nouveau `server_id`

### AC6: Sync Continue en Arrière-Plan
**Given** l'application est online avec des items en attente
**When** le sync engine est actif
**Then** le polling se fait toutes les 30 secondes
**And** seuls les items `pending` ou `failed` (avec backoff respecté) sont traités
**And** les items `synced` sont purgés périodiquement

## Tasks / Subtasks

- [x] **Task 1: Refactorer syncEngine pour utiliser db.ts (offline_sync_queue)** (AC: 1, 6)
  - [x] 1.1: Modifier `syncEngine.ts` pour importer depuis `@/lib/db` au lieu de `offlineDb`
  - [x] 1.2: Adapter les requêtes pour utiliser `db.offline_sync_queue` (nouveau schéma v7+)
  - [x] 1.3: Adapter les fonctions de marquage (markSyncing, markSynced, markFailed) pour le nouveau schéma
  - [x] 1.4: Vérifier la compatibilité avec le type `ISyncQueueItem` de `@/types/offline.ts`

- [x] **Task 2: Implémenter le sync processor pour les orders** (AC: 2, 4)
  - [x] 2.1: Créer `src/services/sync/orderSyncProcessor.ts`
  - [x] 2.2: Implémenter `processOrderSync(item: ISyncQueueItem)` qui:
    - Lit l'order depuis `offline_orders` via `entityId`
    - Lit les items depuis `offline_order_items`
    - Lit les payments depuis `offline_payments`
    - Insère l'order dans Supabase
    - Insère les order_items avec le nouveau `order_id`
    - Insère les payments avec le nouveau `order_id`
  - [x] 2.3: Implémenter `updateLocalOrderWithServerId(localId, serverId)`
  - [x] 2.4: Mettre à jour `sync_status` à `synced` dans `offline_orders`

- [x] **Task 3: Implémenter le sync processor pour les payments** (AC: 2, 4)
  - [x] 3.1: Créer `src/services/sync/paymentSyncProcessor.ts`
  - [x] 3.2: Implémenter `processPaymentSync(item: ISyncQueueItem)` qui:
    - Lit le payment depuis `offline_payments`
    - Résout le `order_id` (local → serveur si order déjà synced)
    - Insère dans Supabase `order_payments`
  - [x] 3.3: Mettre à jour `sync_status` à `synced` dans `offline_payments`

- [x] **Task 4: Implémenter le sync processor pour les sessions** (AC: 5)
  - [x] 4.1: Créer `src/services/sync/sessionSyncProcessor.ts`
  - [x] 4.2: Implémenter `processSessionSync(item: ISyncQueueItem)` qui:
    - Lit la session depuis `offline_sessions`
    - Insère dans Supabase `pos_sessions`
    - Stocke le `server_id` localement
  - [x] 4.3: Implémenter `updateOrdersWithSessionServerId(localSessionId, serverSessionId)`
  - [x] 4.4: Mettre à jour `sync_status` à `synced` dans `offline_sessions`

- [x] **Task 5: Implémenter la gestion des échecs et retry** (AC: 3)
  - [x] 5.1: Ajouter `incrementRetryCount(itemId)` dans sync helpers
  - [x] 5.2: Implémenter le backoff exponentiel (5s, 10s, 30s, 60s, 300s)
  - [x] 5.3: Marquer `failed` après 3+ tentatives
  - [x] 5.4: Stocker l'erreur dans `lastError`
  - [x] 5.5: Implémenter `shouldRetry(item): boolean` basé sur retries et timestamp

- [x] **Task 6: Intégrer les processors dans syncEngine** (AC: 1, 2, 3, 4, 5)
  - [x] 6.1: Refactorer `processItem()` pour router vers le bon processor selon `entity`
  - [x] 6.2: Gérer les dépendances: sessions avant orders, orders avant payments
  - [x] 6.3: Implémenter `sortQueueByDependency(items)` pour ordre de traitement
  - [x] 6.4: Mettre à jour `runSyncEngine()` pour utiliser le tri

- [x] **Task 7: Créer les tests unitaires** (AC: 1, 2, 3, 4, 5, 6)
  - [x] 7.1: Créer `src/services/sync/__tests__/orderSyncProcessor.test.ts`
  - [x] 7.2: Créer `src/services/sync/__tests__/paymentSyncProcessor.test.ts`
  - [x] 7.3: Créer `src/services/sync/__tests__/sessionSyncProcessor.test.ts`
  - [x] 7.4: Tester le retry avec backoff
  - [x] 7.5: Tester l'ordre de traitement (sessions → orders → payments)
  - [x] 7.6: Tester la mise à jour des IDs locaux vers serveur

- [x] **Task 8: Ajouter les traductions** (AC: 3)
  - [x] 8.1: Ajouter clés `sync.processing.*`, `sync.error.*` dans `fr.json`
  - [x] 8.2: Ajouter clés dans `en.json`
  - [x] 8.3: Ajouter clés dans `id.json`

## Dev Notes

### Architecture Compliance (MANDATORY)

**ADR-002: Stratégie de Synchronisation** [Source: architecture/core-architectural-decisions.md#ADR-002]
```typescript
// Sync Queue Structure (déjà implémenté dans db.ts v7+)
// Table: offline_sync_queue
{
  id: number,           // Auto-increment Dexie
  entity: 'orders' | 'payments' | 'pos_sessions',
  action: 'create' | 'update',
  entityId: 'LOCAL-uuid',  // ID local de l'entité
  payload: { ... },        // Données complètes
  created_at: string,      // ISO 8601
  status: 'pending' | 'syncing' | 'failed' | 'completed',
  retries: number,
  lastError?: string
}
```

**Conflict Resolution:** Last-Write-Wins + Audit Trail
**Retry Strategy:** 3 tentatives max avec backoff exponentiel
**Purge:** Après confirmation serveur (status = 'completed' ou 'synced')

### CRITICAL: Deux Systèmes de Sync Queue

**⚠️ ATTENTION:** Le projet a DEUX implémentations de sync queue qui doivent être UNIFIÉES:

1. **Legacy: `src/services/sync/offlineDb.ts`** (Story 2.5)
   - Utilise `offlineDb.sync_queue`
   - Types: `TSyncQueueType = 'order' | 'payment' | 'stock_movement'`
   - Utilisé par `syncQueue.ts` et `syncEngine.ts`

2. **New: `src/lib/db.ts`** (Story 3.1+)
   - Utilise `db.offline_sync_queue`
   - Types: `TSyncEntity = 'orders' | 'order_items' | 'payments' | 'pos_sessions' | ...`
   - Utilisé par `ordersCacheService.ts`, `offlinePaymentService.ts`, `offlineSessionService.ts`

**DÉCISION:** Cette story DOIT unifier vers le nouveau système `db.ts` qui est plus complet et cohérent avec les stories 3.1-3.5.

### Existing Services to REUSE (CRITICAL)

**Story 3.1 - ordersCacheService.ts** [Source: src/services/offline/ordersCacheService.ts]
```typescript
// Fonctions de lecture pour sync
import {
  getOfflineOrderById,
  getOfflineOrderItems,
  updateOrderSyncStatus,
  LOCAL_ORDER_ID_PREFIX,
} from '@/services/offline/ordersCacheService';

// Format des IDs locaux
const isLocalId = (id: string) => id.startsWith('LOCAL-');
```

**Story 3.4 - offlinePaymentService.ts** [Source: src/services/offline/offlinePaymentService.ts]
```typescript
// Fonctions de lecture pour sync
import {
  getPaymentsByOrderId,
  updatePaymentSyncStatus,
  LOCAL_PAYMENT_ID_PREFIX,
} from '@/services/offline/offlinePaymentService';
```

**Story 3.5 - offlineSessionService.ts** [Source: src/services/offline/offlineSessionService.ts]
```typescript
// Fonctions de lecture pour sync
import {
  getSessionById,
  updateSessionSyncStatus,
  LOCAL_SESSION_ID_PREFIX,
} from '@/services/offline/offlineSessionService';
```

**Existing syncEngine.ts** [Source: src/services/sync/syncEngine.ts]
```typescript
// Structure existante à ADAPTER (pas recréer)
// - runSyncEngine(): Boucle principale
// - startSyncWithDelay(): Démarrage après reconnexion
// - startBackgroundSync(): Polling 30s
// - processItem(): À refactorer pour router vers processors
```

### Type Definitions (Existing)

**ISyncQueueItem** [Source: src/types/offline.ts]
```typescript
export interface ISyncQueueItem {
  id?: number;              // Auto-increment Dexie
  entity: TSyncEntity;      // 'orders' | 'payments' | 'pos_sessions'
  action: TSyncAction;      // 'create' | 'update' | 'delete'
  entityId: string;         // LOCAL-uuid
  payload: Record<string, unknown>;
  created_at: string;
  status: TSyncStatus;      // 'pending' | 'syncing' | 'failed' | 'completed'
  retries: number;
  lastError?: string;
}
```

**Constants** [Source: src/types/offline.ts]
```typescript
export const SYNC_MAX_RETRIES = 3;
```

### Sync Processing Order (CRITICAL)

L'ordre de traitement est IMPORTANT pour les dépendances FK:

```
1. Sessions (pos_sessions)
   ↓ server_id obtenu
2. Orders (orders)
   ↓ server_id obtenu, session_id remappé
3. Payments (order_payments)
   ↓ order_id remappé vers server_id
```

```typescript
// Tri des items par dépendance
function sortQueueByDependency(items: ISyncQueueItem[]): ISyncQueueItem[] {
  const priority: Record<TSyncEntity, number> = {
    'pos_sessions': 1,
    'orders': 2,
    'order_items': 3,  // Géré avec orders
    'payments': 4,
    'customers': 0,    // Pas de dépendance
    'products': 0,
    'categories': 0,
  };

  return items.sort((a, b) =>
    (priority[a.entity] ?? 99) - (priority[b.entity] ?? 99)
  );
}
```

### ID Remapping Pattern

```typescript
// Map local IDs to server IDs after sync
interface IIdMapping {
  localId: string;      // LOCAL-uuid
  serverId: string;     // Server UUID
  entity: TSyncEntity;
}

// Stocké temporairement pendant le batch sync
const idMappings: IIdMapping[] = [];

// Utilisation pour remapper les FK
function resolveId(localId: string, entity: TSyncEntity): string {
  if (!localId.startsWith('LOCAL-')) return localId;

  const mapping = idMappings.find(
    m => m.localId === localId && m.entity === entity
  );
  return mapping?.serverId ?? localId;
}
```

### orderSyncProcessor Pattern

```typescript
// src/services/sync/orderSyncProcessor.ts

import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { ISyncQueueItem, IOfflineOrder, IOfflineOrderItem, IOfflinePayment } from '@/types/offline';

interface ISyncResult {
  success: boolean;
  serverId?: string;
  error?: string;
}

/**
 * Process an order sync queue item
 * Creates order, items, and payments in Supabase
 */
export async function processOrderSync(
  item: ISyncQueueItem,
  sessionIdMap: Map<string, string>  // LOCAL-SESSION-* → server UUID
): Promise<ISyncResult> {
  try {
    // 1. Read local order
    const order = await db.offline_orders.get(item.entityId);
    if (!order) {
      return { success: false, error: 'Order not found in local cache' };
    }

    // 2. Read local order items
    const items = await db.offline_order_items
      .where('order_id')
      .equals(item.entityId)
      .toArray();

    // 3. Read local payments
    const payments = await db.offline_payments
      .where('order_id')
      .equals(item.entityId)
      .toArray();

    // 4. Remap session_id if needed
    let serverSessionId = order.session_id;
    if (order.session_id?.startsWith('LOCAL-SESSION-')) {
      serverSessionId = sessionIdMap.get(order.session_id) ?? null;
    }

    // 5. Insert order into Supabase
    const { data: serverOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: order.order_number,
        status: order.status,
        order_type: order.order_type,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        discount_amount: order.discount_amount,
        discount_type: order.discount_type,
        total: order.total,
        customer_id: order.customer_id,
        table_number: order.table_number,
        notes: order.notes,
        user_id: order.user_id,
        session_id: serverSessionId,
        created_at: order.created_at,
      })
      .select('id')
      .single();

    if (orderError) {
      return { success: false, error: orderError.message };
    }

    const serverId = serverOrder.id;

    // 6. Insert order items with new order_id
    if (items.length > 0) {
      const serverItems = items.map(item => ({
        order_id: serverId,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        modifiers: item.modifiers,
        notes: item.notes,
        dispatch_station: item.dispatch_station,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(serverItems);

      if (itemsError) {
        console.error('[OrderSync] Failed to insert items:', itemsError);
        // Continue - order was created
      }
    }

    // 7. Insert payments with new order_id
    if (payments.length > 0) {
      const serverPayments = payments.map(payment => ({
        order_id: serverId,
        method: payment.method,
        amount: payment.amount,
        amount_tendered: payment.amount_tendered,
        change_amount: payment.change_amount,
        reference: payment.reference,
        created_at: payment.created_at,
      }));

      const { error: paymentsError } = await supabase
        .from('order_payments')
        .insert(serverPayments);

      if (paymentsError) {
        console.error('[OrderSync] Failed to insert payments:', paymentsError);
        // Continue - order was created
      }
    }

    // 8. Update local order with server_id and sync_status
    await db.offline_orders.update(item.entityId, {
      server_id: serverId,
      sync_status: 'synced',
    });

    // 9. Update local payments sync_status
    for (const payment of payments) {
      await db.offline_payments.update(payment.id, {
        sync_status: 'synced',
      });
    }

    return { success: true, serverId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### sessionSyncProcessor Pattern

```typescript
// src/services/sync/sessionSyncProcessor.ts

import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { ISyncQueueItem } from '@/types/offline';

interface ISyncResult {
  success: boolean;
  serverId?: string;
  error?: string;
}

/**
 * Process a POS session sync queue item
 */
export async function processSessionSync(
  item: ISyncQueueItem
): Promise<ISyncResult> {
  try {
    // 1. Read local session
    const session = await db.offline_sessions.get(item.entityId);
    if (!session) {
      return { success: false, error: 'Session not found in local cache' };
    }

    // 2. Insert session into Supabase
    const { data: serverSession, error: sessionError } = await supabase
      .from('pos_sessions')
      .insert({
        user_id: session.user_id,
        opening_amount: session.opening_amount,
        status: session.status,
        expected_totals: session.expected_totals,
        actual_totals: session.actual_totals,
        cash_variance: session.cash_variance,
        notes: session.notes,
        opened_at: session.opened_at,
        closed_at: session.closed_at,
      })
      .select('id')
      .single();

    if (sessionError) {
      return { success: false, error: sessionError.message };
    }

    const serverId = serverSession.id;

    // 3. Update local session with server_id and sync_status
    await db.offline_sessions.update(item.entityId, {
      server_id: serverId,
      sync_status: 'synced',
    });

    return { success: true, serverId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

### Backoff Strategy

```typescript
// Backoff delays per Story 2.5 (already in syncQueue.ts)
const BACKOFF_DELAYS = [
  5000,    // 5 seconds - 1st retry
  10000,   // 10 seconds - 2nd retry
  30000,   // 30 seconds - 3rd retry
  60000,   // 1 minute - beyond max (just in case)
  300000,  // 5 minutes
];

function getBackoffDelay(retries: number): number {
  return BACKOFF_DELAYS[Math.min(retries, BACKOFF_DELAYS.length - 1)];
}

function shouldRetryNow(item: ISyncQueueItem): boolean {
  if (item.status !== 'failed') return false;
  if (item.retries >= SYNC_MAX_RETRIES) return false;

  // Check if enough time has passed since last attempt
  const lastAttempt = new Date(item.created_at).getTime();
  const delay = getBackoffDelay(item.retries);
  return Date.now() - lastAttempt >= delay;
}
```

### Testing Strategy

**Test Cases for orderSyncProcessor:**
1. `processOrderSync()` - creates order in Supabase with correct data
2. `processOrderSync()` - creates order_items with remapped order_id
3. `processOrderSync()` - creates payments with remapped order_id
4. `processOrderSync()` - remaps session_id from local to server
5. `processOrderSync()` - updates local order with server_id
6. `processOrderSync()` - handles missing order gracefully
7. `processOrderSync()` - handles Supabase error gracefully

**Test Cases for sessionSyncProcessor:**
1. `processSessionSync()` - creates session in Supabase
2. `processSessionSync()` - returns serverId for ID mapping
3. `processSessionSync()` - updates local session sync_status

**Test Cases for sync ordering:**
1. Sessions processed before orders
2. Orders processed before standalone payments
3. Items within same entity processed in FIFO order

**Mock Strategy:**
```typescript
// Mock Supabase for isolated tests
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'server-uuid' },
            error: null,
          })),
        })),
      })),
    })),
  },
}));
```

### Previous Story Intelligence

**Story 3.1 Patterns** [Source: 3-1-dexie-schema-for-orders-sync-queue.md]
- `saveOfflineOrder()` adds to sync queue automatically
- `LOCAL_ORDER_ID_PREFIX = 'LOCAL-'`
- Order + items saved in transaction

**Story 3.4 Patterns** [Source: 3-4-offline-payment-processing.md]
- `saveOfflinePayment()` adds to sync queue automatically
- `LOCAL_PAYMENT_ID_PREFIX = 'LOCAL-PAYMENT-'`
- Payments linked by `order_id`

**Story 3.5 Patterns** [Source: 3-5-pos-session-management-offline.md]
- `openSession()` and `closeSession()` add to sync queue
- `LOCAL_SESSION_ID_PREFIX = 'LOCAL-SESSION-'`
- Sessions linked to orders by `session_id`

**Epic 2 Retrospective Learnings** [Source: epic-2-retrospective.md]
1. **Dexie transaction safety:** Always use `db.transaction()` for multi-table operations
2. **Service pattern:** Simple exports, no classes
3. **fake-indexeddb:** Pour tests Dexie isolés

### Traductions à Ajouter

```json
// fr.json
{
  "sync": {
    "processing": {
      "starting": "Synchronisation en cours...",
      "orderSynced": "Commande synchronisée",
      "paymentSynced": "Paiement synchronisé",
      "sessionSynced": "Session synchronisée",
      "complete": "Synchronisation terminée",
      "itemsRemaining": "{count} éléments restants"
    },
    "error": {
      "retrying": "Nouvelle tentative dans {seconds}s",
      "maxRetriesReached": "Échec après {count} tentatives",
      "orderFailed": "Échec sync commande",
      "paymentFailed": "Échec sync paiement",
      "sessionFailed": "Échec sync session"
    }
  }
}
```

```json
// en.json
{
  "sync": {
    "processing": {
      "starting": "Synchronizing...",
      "orderSynced": "Order synchronized",
      "paymentSynced": "Payment synchronized",
      "sessionSynced": "Session synchronized",
      "complete": "Synchronization complete",
      "itemsRemaining": "{count} items remaining"
    },
    "error": {
      "retrying": "Retrying in {seconds}s",
      "maxRetriesReached": "Failed after {count} attempts",
      "orderFailed": "Order sync failed",
      "paymentFailed": "Payment sync failed",
      "sessionFailed": "Session sync failed"
    }
  }
}
```

```json
// id.json
{
  "sync": {
    "processing": {
      "starting": "Menyinkronkan...",
      "orderSynced": "Pesanan tersinkronisasi",
      "paymentSynced": "Pembayaran tersinkronisasi",
      "sessionSynced": "Sesi tersinkronisasi",
      "complete": "Sinkronisasi selesai",
      "itemsRemaining": "{count} item tersisa"
    },
    "error": {
      "retrying": "Mencoba lagi dalam {seconds} detik",
      "maxRetriesReached": "Gagal setelah {count} percobaan",
      "orderFailed": "Gagal sinkronisasi pesanan",
      "paymentFailed": "Gagal sinkronisasi pembayaran",
      "sessionFailed": "Gagal sinkronisasi sesi"
    }
  }
}
```

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── services/
│   └── sync/
│       ├── orderSyncProcessor.ts       # NEW: Order sync processor
│       ├── paymentSyncProcessor.ts     # NEW: Payment sync processor
│       ├── sessionSyncProcessor.ts     # NEW: Session sync processor
│       └── __tests__/
│           ├── orderSyncProcessor.test.ts
│           ├── paymentSyncProcessor.test.ts
│           └── sessionSyncProcessor.test.ts
```

**Fichiers à modifier:**
- `src/services/sync/syncEngine.ts` - Refactorer pour utiliser db.ts et nouveaux processors
- `src/services/sync/syncQueue.ts` - Migrer vers db.ts (si nécessaire)
- `src/locales/fr.json`, `en.json`, `id.json` - Ajouter traductions

**Fichiers potentiellement à supprimer/déprécier:**
- `src/services/sync/offlineDb.ts` - Legacy sync queue (à analyser si encore utilisé ailleurs)

### Dependencies on Previous Work

- ✅ `src/lib/db.ts` - Dexie v9 avec `offline_sync_queue`, `offline_orders`, `offline_payments`, `offline_sessions`
- ✅ `src/types/offline.ts` - Types ISyncQueueItem, TSyncEntity, TSyncAction
- ✅ `src/services/offline/ordersCacheService.ts` - Order CRUD (Story 3.1)
- ✅ `src/services/offline/offlinePaymentService.ts` - Payment CRUD (Story 3.4)
- ✅ `src/services/offline/offlineSessionService.ts` - Session CRUD (Story 3.5)
- ✅ `src/stores/syncStore.ts` - Sync state management
- ✅ `src/stores/networkStore.ts` - Network status tracking

### Epic 3 Context

Cette story est la **6ème** de l'Epic 3 (POS & Ventes). Elle dépend de:
- ✅ Story 3.1: Dexie Schema (DONE) - Schéma orders/sync_queue
- ✅ Story 3.3: Offline Order Creation (DONE) - Orders dans sync queue
- ✅ Story 3.4: Offline Payment Processing (DONE) - Payments dans sync queue
- ✅ Story 3.5: POS Session Management (DONE) - Sessions dans sync queue
- ⏩ Story 3.7: Kitchen Dispatch LAN (DONE) - Indépendant

La story suivante dépend de celle-ci:
- Story 3.8: Pending Sync Counter Display → utilise getPendingSyncCount()

### Critical Implementation Notes

1. **Unifier les sync queues** - Migrer tout vers `db.offline_sync_queue` (pas `offlineDb.sync_queue`)
2. **Ordre de traitement** - Sessions AVANT orders AVANT payments (dépendances FK)
3. **ID remapping** - Stocker le mapping local→serveur pendant le batch sync
4. **Transaction safety** - Ne pas laisser d'états incohérents si le sync échoue partiellement
5. **Backoff exponentiel** - Respecter les délais (5s → 10s → 30s)
6. **Max retries = 3** - Après 3 échecs, l'item reste `failed` et nécessite intervention manuelle

### Anti-Patterns to AVOID

| ❌ Éviter | ✅ Faire |
|-----------|----------|
| Utiliser `offlineDb.sync_queue` | Utiliser `db.offline_sync_queue` |
| Sync payments avant orders | Ordre: sessions → orders → payments |
| Ignorer les erreurs Supabase | Logger et marquer `failed` avec erreur |
| Hardcoder les backoff delays | Utiliser `BACKOFF_DELAYS` constante |
| Sync sans vérifier isOnline | Toujours vérifier `useNetworkStore.isOnline` |
| Laisser items `syncing` après crash | Implémenter recovery des `syncing` orphelins |

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-3.6]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-002]
- [Source: _bmad-output/implementation-artifacts/3-1-dexie-schema-for-orders-sync-queue.md]
- [Source: _bmad-output/implementation-artifacts/3-4-offline-payment-processing.md]
- [Source: _bmad-output/implementation-artifacts/3-5-pos-session-management-offline.md]
- [Source: src/services/sync/syncEngine.ts]
- [Source: src/services/sync/syncQueue.ts]
- [Source: src/lib/db.ts]
- [Source: src/types/offline.ts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All sync tests pass: 47/47 tests passing in `src/services/sync/__tests__/`

### Completion Notes List

1. Created new SyncEngineV2 (`syncEngineV2.ts`) that uses `db.offline_sync_queue` from `@/lib/db` instead of legacy `offlineDb`
2. Created three specialized sync processors: `sessionSyncProcessor.ts`, `orderSyncProcessor.ts`, `paymentSyncProcessor.ts`
3. Created `syncQueueHelpers.ts` with all helper functions for the new schema
4. Implemented dependency-ordered processing: Sessions → Orders → Payments
5. Implemented ID remapping using Maps during batch sync (sessionIdMap, orderIdMap)
6. Implemented exponential backoff: 5s → 10s → 30s → 60s → 300s
7. Added comprehensive tests: 47 tests across 5 test files
8. Added translations in all 3 locales (fr, en, id)

### Code Review Fixes Applied

1. **Issue #2 (HIGH)**: Fixed redundant ternary in `markFailed()` in `syncQueueHelpers.ts` - both branches returned 'failed'
2. **Issue #4 (HIGH)**: Added integration tests for `syncEngineV2.ts` - 7 new tests covering main sync flows
3. **Issue #5 (MEDIUM)**: Added `db.transaction()` wrapper to `updateOrdersWithSessionServerId()` for atomicity per Epic 2 retrospective
4. **Issue #6 (MEDIUM)**: Consolidated duplicate `ISyncResult` interface into `syncQueueHelpers.ts`, all processors now import from shared location
5. **Issue #7 (MEDIUM)**: Consolidated duplicate `isLocalId()` function into `syncQueueHelpers.ts`, exported for reuse

### File List

**Created:**
- `src/services/sync/syncEngineV2.ts` - Refactored sync engine using db.ts
- `src/services/sync/syncQueueHelpers.ts` - Helper functions for new sync queue (includes shared ISyncResult interface and isLocalId function)
- `src/services/sync/sessionSyncProcessor.ts` - POS session sync processor
- `src/services/sync/orderSyncProcessor.ts` - Order sync processor (with items/payments)
- `src/services/sync/paymentSyncProcessor.ts` - Standalone payment sync processor
- `src/services/sync/__tests__/sessionSyncProcessor.test.ts` - Session processor tests (4 tests)
- `src/services/sync/__tests__/orderSyncProcessor.test.ts` - Order processor tests (4 tests)
- `src/services/sync/__tests__/paymentSyncProcessor.test.ts` - Payment processor tests (7 tests)
- `src/services/sync/__tests__/syncQueueHelpers.test.ts` - Helper function tests (25 tests)
- `src/services/sync/__tests__/syncEngineV2.test.ts` - Integration tests for sync engine (7 tests)

**Modified:**
- `src/locales/fr.json` - Added sync.processing.* and sync.errorMessages.* keys
- `src/locales/en.json` - Added sync.processing.* and sync.errorMessages.* keys
- `src/locales/id.json` - Added sync.processing.* and sync.errorMessages.* keys

**Modified (Code Review Fixes):**
- `src/services/sync/syncQueueHelpers.ts` - Added shared ISyncResult interface and isLocalId function, fixed markFailed() redundant ternary
- `src/services/sync/sessionSyncProcessor.ts` - Import ISyncResult from syncQueueHelpers, added db.transaction() to updateOrdersWithSessionServerId
- `src/services/sync/orderSyncProcessor.ts` - Import ISyncResult and isLocalId from syncQueueHelpers
- `src/services/sync/paymentSyncProcessor.ts` - Import ISyncResult and isLocalId from syncQueueHelpers

