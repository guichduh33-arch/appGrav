# Story 3.7: Kitchen Dispatch via LAN (Offline)

Status: done

## Story

As a **Caissier**,
I want **envoyer les commandes en cuisine même sans internet**,
so that **la production continue normalement lors des coupures**.

## Acceptance Criteria

### AC1: Dispatch via LAN en Mode Offline
**Given** l'application est offline mais le LAN fonctionne
**When** j'envoie une commande au KDS
**Then** elle est transmise via le hub LAN (BroadcastChannel + Supabase Realtime)
**And** le KDS reçoit la commande en < 1 seconde

### AC2: Filtrage par Station de Dispatch
**Given** la commande a des items de différentes catégories
**When** la commande est dispatchée
**Then** chaque KDS reçoit uniquement ses items filtrés par `dispatch_station`
**And** les stations possibles sont: `kitchen`, `barista`, `display`, `none`

### AC3: Queue Locale si LAN Indisponible
**Given** le KDS n'est pas atteignable (LAN down)
**When** j'envoie la commande
**Then** elle est marquée `dispatch_pending` dans IndexedDB
**And** sera envoyée automatiquement quand le LAN revient

### AC4: Retry Automatique sur Reconnexion LAN
**Given** des commandes sont en `dispatch_pending`
**When** la connexion LAN est rétablie
**Then** les commandes pending sont envoyées automatiquement (FIFO)
**And** leur statut passe à `dispatched`

### AC5: Confirmation de Réception KDS
**Given** une commande est envoyée au KDS
**When** le KDS confirme la réception
**Then** le statut de dispatch est mis à jour à `dispatched`
**And** l'heure de confirmation est enregistrée

### AC6: Indicateur Visuel de Dispatch
**Given** une commande a été envoyée en cuisine
**When** je consulte la commande dans l'historique
**Then** je vois l'indicateur de dispatch (pending, dispatched, failed)
**And** l'heure d'envoi/réception

## Tasks / Subtasks

- [x] **Task 1: Étendre le schéma pour le dispatch status** (AC: 3, 5)
  - [x] 1.1: Ajouter `TDispatchStatus` type (`pending`, `dispatched`, `failed`) dans `src/types/offline.ts`
  - [x] 1.2: Ajouter `dispatch_status`, `dispatched_at`, `dispatch_error` à `IOfflineOrder`
  - [x] 1.3: Créer table `offline_dispatch_queue` dans Dexie (version 10)
  - [x] 1.4: Ajouter interface `IDispatchQueueItem` pour la queue locale

- [x] **Task 2: Créer le service kitchenDispatchService** (AC: 1, 2, 3, 4)
  - [x] 2.1: Créer `src/services/offline/kitchenDispatchService.ts`
  - [x] 2.2: Implémenter `dispatchOrderToKitchen(order, items)` avec filtrage par station
  - [x] 2.3: Implémenter `filterItemsByStation(items, station)` basé sur `dispatch_station` des catégories
  - [x] 2.4: Implémenter `addToDispatchQueue(order, station)` pour queue locale
  - [x] 2.5: Implémenter `processDispatchQueue()` pour retry automatique
  - [x] 2.6: Implémenter `markOrderDispatched(orderId, station)` pour mise à jour statut

- [x] **Task 3: Intégrer avec lanHub et lanClient** (AC: 1, 5)
  - [x] 3.1: Utiliser `LAN_MESSAGE_TYPES.KDS_NEW_ORDER` pour l'envoi
  - [x] 3.2: Implémenter handler pour `KDS_ORDER_ACK` (confirmation réception)
  - [x] 3.3: Ajouter payload structure `IKdsOrderPayload` dans `lanProtocol.ts` (types dans offline.ts)
  - [x] 3.4: Gérer le broadcast aux bonnes stations via `targetDeviceId`

- [x] **Task 4: Créer le hook useKitchenDispatch** (AC: 1, 3, 4, 6)
  - [x] 4.1: Créer `src/hooks/offline/useKitchenDispatch.ts`
  - [x] 4.2: Implémenter `dispatchOrder(orderId)` avec online/offline routing
  - [x] 4.3: Exposer `dispatchStatus`, `pendingDispatchCount`
  - [x] 4.4: Écouter les événements LAN pour mises à jour en temps réel
  - [x] 4.5: Implémenter retry logic avec exponential backoff

- [x] **Task 5: Modifier offlineOrderService pour intégrer dispatch** (AC: 1, 2)
  - [x] 5.1: Appeler `dispatchOrderToKitchen()` après création de commande (dans useOfflinePayment)
  - [x] 5.2: Charger les catégories pour le mapping `dispatch_station`
  - [x] 5.3: Retourner le dispatch status dans la réponse

- [x] **Task 6: Créer les tests unitaires** (AC: 1, 2, 3, 4, 5)
  - [x] 6.1: Créer `src/services/offline/__tests__/kitchenDispatchService.test.ts`
  - [x] 6.2: Tester filtrage items par station
  - [x] 6.3: Tester ajout à dispatch queue quand LAN down
  - [x] 6.4: Tester processing de la queue sur reconnexion
  - [x] 6.5: Tester mise à jour statut sur ACK
  - [x] 6.6: Tester timeout et retry logic

- [x] **Task 7: Ajouter les traductions** (AC: 6)
  - [x] 7.1: Ajouter section `dispatch` dans `fr.json`
  - [x] 7.2: Ajouter clés dans `en.json`
  - [x] 7.3: Ajouter clés dans `id.json`

## Dev Notes

### Architecture Compliance (MANDATORY)

**ADR-006: Architecture Socket.IO LAN** [Source: architecture.md#ADR-006]
```
┌─────────────────────────────────────────────────────────────┐
│                    POS Principal (HUB)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ React App   │  │ LAN Hub     │  │ Dexie.js    │          │
│  │ (frontend)  │  │ (realtime)  │  │ (IndexedDB) │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
         ▲                ▲                ▲
    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
    │ Mobile  │     │   KDS   │     │ Display │
    │ Serveur │     │ Kitchen │     │ Client  │
    └─────────┘     └─────────┘     └─────────┘
```

**ADR-007: Socket.IO Events Protocol** [Source: architecture.md#ADR-007]
```typescript
// Events utilisés pour cette story
'order:created'    // Trigger initial
'kds_new_order'    // Envoi vers KDS
'kds_order_ack'    // Confirmation KDS (nouveau)
```

### Existing Services to REUSE (CRITICAL)

**LAN Services déjà implémentés** [Source: src/services/lan/]
```typescript
// lanHub.ts - Hub POS
import { lanHub } from '@/services/lan/lanHub';
lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, payload);
lanHub.sendTo(deviceId, type, payload);

// lanClient.ts - Client KDS/Display/Mobile
import { lanClient } from '@/services/lan/lanClient';
lanClient.on(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, handler);
lanClient.send(LAN_MESSAGE_TYPES.KDS_ORDER_ACK, payload);

// lanProtocol.ts - Types et constantes
import { LAN_MESSAGE_TYPES, ILanMessage, createMessage } from '@/services/lan/lanProtocol';
```

**Story 3.3 Foundation - offlineOrderService.ts** [Source: src/services/offline/offlineOrderService.ts]
```typescript
// ALREADY IMPLEMENTED - L'ordre de création est:
// 1. createOfflineOrder() crée order + items
// 2. saveOfflinePayment() enregistre le paiement
// 3. dispatchOrderToKitchen() doit être appelé ICI
```

**Categories avec dispatch_station** [Source: src/lib/db.ts]
```typescript
// offline_categories inclut dispatch_station
// Valeurs: 'kitchen' | 'barista' | 'display' | 'none'
const categories = await db.offline_categories
  .where('is_active').equals(1)
  .toArray();
```

### Type Definitions (NEW)

**Types à ajouter dans `src/types/offline.ts`**
```typescript
/**
 * Dispatch status for kitchen orders
 */
export type TDispatchStatus =
  | 'pending'     // En attente d'envoi (LAN down ou pas encore envoyé)
  | 'dispatched'  // Envoyé et confirmé par KDS
  | 'failed';     // Échec après max retries

/**
 * Dispatch queue item for offline kitchen dispatch
 */
export interface IDispatchQueueItem {
  /** Auto-increment ID */
  id?: number;

  /** Order ID to dispatch */
  order_id: string;

  /** Target station (kitchen, barista, display) */
  station: TKitchenStation;

  /** Items filtered for this station */
  items: IKdsOrderItem[];

  /** ISO 8601 timestamp of queue add */
  created_at: string;

  /** Number of dispatch attempts */
  attempts: number;

  /** Last error message */
  last_error: string | null;

  /** Queue status */
  status: 'pending' | 'sending' | 'failed';
}

/**
 * Kitchen station types
 */
export type TKitchenStation = 'kitchen' | 'barista' | 'display' | 'none';

/**
 * KDS order item payload
 */
export interface IKdsOrderItem {
  /** Order item ID */
  id: string;
  /** Product ID */
  product_id: string;
  /** Product name */
  name: string;
  /** Quantity */
  quantity: number;
  /** Modifiers applied */
  modifiers: string[];
  /** Special notes */
  notes: string | null;
  /** Category ID for station filtering */
  category_id: string;
}

/**
 * KDS new order payload (extends lanProtocol)
 */
export interface IKdsNewOrderPayload {
  /** Order ID */
  order_id: string;
  /** Order number for display */
  order_number: string;
  /** Table number if dine-in */
  table_number: number | null;
  /** Order type */
  order_type: TOrderType;
  /** Items for this specific station */
  items: IKdsOrderItem[];
  /** Station this payload is for */
  station: TKitchenStation;
  /** ISO 8601 timestamp */
  timestamp: string;
}

/**
 * KDS order ACK payload
 */
export interface IKdsOrderAckPayload {
  /** Order ID being acknowledged */
  order_id: string;
  /** Station acknowledging */
  station: TKitchenStation;
  /** Device ID of KDS */
  device_id: string;
  /** ISO 8601 timestamp of ACK */
  timestamp: string;
}
```

**Extension IOfflineOrder**
```typescript
// Ajouter à IOfflineOrder existant:
export interface IOfflineOrder {
  // ... champs existants ...

  /** Dispatch status for kitchen */
  dispatch_status: TDispatchStatus;

  /** ISO 8601 timestamp of successful dispatch */
  dispatched_at: string | null;

  /** Error message if dispatch failed */
  dispatch_error: string | null;
}
```

### Dexie Schema Update (Version 10)

```typescript
// Version 10: Kitchen Dispatch Queue (Story 3.7)
this.version(10).stores({
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
  offline_orders: 'id, order_number, status, order_type, customer_id, session_id, created_at, sync_status, dispatch_status, [status+created_at]',
  offline_order_items: 'id, order_id, product_id, item_status',
  offline_payments: 'id, order_id, method, sync_status, created_at',
  offline_sessions: 'id, user_id, status, opened_at, sync_status',

  // NEW: Kitchen Dispatch Queue (Story 3.7)
  offline_dispatch_queue: '++id, order_id, station, status, created_at, attempts',
});
```

### lanProtocol Extension

```typescript
// Ajouter à lanProtocol.ts - LAN_MESSAGE_TYPES
export const LAN_MESSAGE_TYPES = {
  // ... existing types ...

  // KDS Sync - déjà présents mais documenter usage:
  KDS_NEW_ORDER: 'kds_new_order',     // POS → KDS: nouvelle commande
  KDS_ORDER_READY: 'kds_order_ready', // KDS → POS: item prêt
  KDS_ORDER_BUMP: 'kds_order_bump',   // KDS → POS: commande complète
  KDS_ORDER_ACK: 'kds_order_ack',     // KDS → POS: confirmation réception (NOUVEAU)
} as const;
```

### kitchenDispatchService Implementation Pattern

```typescript
// src/services/offline/kitchenDispatchService.ts

import { db } from '@/lib/db';
import { lanHub } from '@/services/lan/lanHub';
import { useLanStore } from '@/stores/lanStore';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import type {
  IOfflineOrder,
  IOfflineOrderItem,
  IDispatchQueueItem,
  IKdsNewOrderPayload,
  IKdsOrderItem,
  TKitchenStation,
  TDispatchStatus,
} from '@/types/offline';

// Max retry attempts before marking failed
const MAX_DISPATCH_ATTEMPTS = 3;

// Retry backoff base (ms)
const RETRY_BACKOFF_MS = 2000;

/**
 * Get dispatch station for a category
 */
export async function getCategoryDispatchStation(
  categoryId: string
): Promise<TKitchenStation> {
  const category = await db.offline_categories.get(categoryId);
  return (category?.dispatch_station as TKitchenStation) || 'none';
}

/**
 * Filter order items by dispatch station
 */
export async function filterItemsByStation(
  items: IOfflineOrderItem[],
  station: TKitchenStation
): Promise<IOfflineOrderItem[]> {
  const result: IOfflineOrderItem[] = [];

  for (const item of items) {
    const itemStation = await getCategoryDispatchStation(item.category_id);
    if (itemStation === station) {
      result.push(item);
    }
  }

  return result;
}

/**
 * Convert order items to KDS payload format
 */
function toKdsOrderItems(items: IOfflineOrderItem[]): IKdsOrderItem[] {
  return items.map(item => ({
    id: item.id,
    product_id: item.product_id,
    name: item.name,
    quantity: item.quantity,
    modifiers: item.modifiers?.map(m => m.name) || [],
    notes: item.notes || null,
    category_id: item.category_id,
  }));
}

/**
 * Add order to dispatch queue (when LAN unavailable)
 */
export async function addToDispatchQueue(
  order: IOfflineOrder,
  station: TKitchenStation,
  items: IOfflineOrderItem[]
): Promise<IDispatchQueueItem> {
  const now = new Date().toISOString();

  const queueItem: Omit<IDispatchQueueItem, 'id'> = {
    order_id: order.id,
    station,
    items: toKdsOrderItems(items),
    created_at: now,
    attempts: 0,
    last_error: null,
    status: 'pending',
  };

  const id = await db.offline_dispatch_queue.add(queueItem as IDispatchQueueItem);
  return { ...queueItem, id } as IDispatchQueueItem;
}

/**
 * Check if LAN hub is connected
 */
function isLanConnected(): boolean {
  return lanHub.isActive() || useLanStore.getState().connectionStatus === 'connected';
}

/**
 * Dispatch order to kitchen stations
 * Returns stations that were successfully dispatched
 */
export async function dispatchOrderToKitchen(
  order: IOfflineOrder,
  items: IOfflineOrderItem[]
): Promise<{
  dispatched: TKitchenStation[];
  queued: TKitchenStation[];
}> {
  const stations: TKitchenStation[] = ['kitchen', 'barista'];
  const dispatched: TKitchenStation[] = [];
  const queued: TKitchenStation[] = [];

  for (const station of stations) {
    const stationItems = await filterItemsByStation(items, station);

    // Skip if no items for this station
    if (stationItems.length === 0) {
      continue;
    }

    const payload: IKdsNewOrderPayload = {
      order_id: order.id,
      order_number: order.order_number,
      table_number: order.table_number ?? null,
      order_type: order.order_type,
      items: toKdsOrderItems(stationItems),
      station,
      timestamp: new Date().toISOString(),
    };

    if (isLanConnected()) {
      try {
        await lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, payload);
        dispatched.push(station);
      } catch (error) {
        console.error(`[kitchenDispatch] Failed to dispatch to ${station}:`, error);
        await addToDispatchQueue(order, station, stationItems);
        queued.push(station);
      }
    } else {
      // LAN not connected, queue for later
      await addToDispatchQueue(order, station, stationItems);
      queued.push(station);
    }
  }

  // Update order dispatch status
  const status: TDispatchStatus = queued.length > 0 ? 'pending' : 'dispatched';
  await updateOrderDispatchStatus(order.id, status, queued.length > 0 ? null : new Date().toISOString());

  return { dispatched, queued };
}

/**
 * Update order dispatch status
 */
export async function updateOrderDispatchStatus(
  orderId: string,
  status: TDispatchStatus,
  dispatchedAt: string | null,
  error?: string
): Promise<void> {
  await db.offline_orders.update(orderId, {
    dispatch_status: status,
    dispatched_at: dispatchedAt,
    dispatch_error: error || null,
  });
}

/**
 * Mark order as dispatched for a station (called on ACK)
 */
export async function markStationDispatched(
  orderId: string,
  station: TKitchenStation
): Promise<void> {
  // Remove from queue if present
  await db.offline_dispatch_queue
    .where({ order_id: orderId, station })
    .delete();

  // Check if all stations are done
  const remaining = await db.offline_dispatch_queue
    .where('order_id')
    .equals(orderId)
    .count();

  if (remaining === 0) {
    await updateOrderDispatchStatus(orderId, 'dispatched', new Date().toISOString());
  }
}

/**
 * Process pending dispatch queue
 * Called when LAN connection is restored
 */
export async function processDispatchQueue(): Promise<{
  processed: number;
  failed: number;
}> {
  if (!isLanConnected()) {
    return { processed: 0, failed: 0 };
  }

  const pending = await db.offline_dispatch_queue
    .where('status')
    .equals('pending')
    .sortBy('created_at');

  let processed = 0;
  let failed = 0;

  for (const item of pending) {
    // Update status to sending
    await db.offline_dispatch_queue.update(item.id!, { status: 'sending' });

    try {
      const order = await db.offline_orders.get(item.order_id);
      if (!order) {
        // Order no longer exists, remove from queue
        await db.offline_dispatch_queue.delete(item.id!);
        continue;
      }

      const payload: IKdsNewOrderPayload = {
        order_id: item.order_id,
        order_number: order.order_number,
        table_number: order.table_number ?? null,
        order_type: order.order_type,
        items: item.items,
        station: item.station,
        timestamp: new Date().toISOString(),
      };

      await lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, payload);

      // Mark as sent (will be marked dispatched on ACK)
      await db.offline_dispatch_queue.delete(item.id!);
      processed++;

    } catch (error) {
      const attempts = item.attempts + 1;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';

      if (attempts >= MAX_DISPATCH_ATTEMPTS) {
        // Mark as failed
        await db.offline_dispatch_queue.update(item.id!, {
          status: 'failed',
          attempts,
          last_error: errorMsg,
        });

        // Update order status
        await updateOrderDispatchStatus(item.order_id, 'failed', null, errorMsg);
        failed++;
      } else {
        // Retry later
        await db.offline_dispatch_queue.update(item.id!, {
          status: 'pending',
          attempts,
          last_error: errorMsg,
        });
      }
    }
  }

  return { processed, failed };
}

/**
 * Get pending dispatch count
 */
export async function getPendingDispatchCount(): Promise<number> {
  return db.offline_dispatch_queue
    .where('status')
    .equals('pending')
    .count();
}

/**
 * Get dispatch queue items for an order
 */
export async function getOrderDispatchQueue(
  orderId: string
): Promise<IDispatchQueueItem[]> {
  return db.offline_dispatch_queue
    .where('order_id')
    .equals(orderId)
    .toArray();
}
```

### useKitchenDispatch Hook Pattern

```typescript
// src/hooks/offline/useKitchenDispatch.ts

import { useCallback, useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useLanStore } from '@/stores/lanStore';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import {
  dispatchOrderToKitchen,
  processDispatchQueue,
  markStationDispatched,
  getPendingDispatchCount,
} from '@/services/offline/kitchenDispatchService';
import type { IKdsOrderAckPayload, TDispatchStatus } from '@/types/offline';

interface UseKitchenDispatchResult {
  /** Dispatch a specific order */
  dispatchOrder: (orderId: string) => Promise<boolean>;
  /** Process the entire dispatch queue */
  processQueue: () => Promise<{ processed: number; failed: number }>;
  /** Number of orders pending dispatch */
  pendingCount: number;
  /** Whether currently dispatching */
  isDispatching: boolean;
  /** Last dispatch error */
  lastError: string | null;
}

export function useKitchenDispatch(): UseKitchenDispatchResult {
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const { connectionStatus } = useLanStore();

  // Live query for pending count
  const pendingCount = useLiveQuery(
    () => getPendingDispatchCount(),
    [],
    0
  );

  // Listen for KDS ACK messages
  useEffect(() => {
    const unsubscribe = lanClient.on<IKdsOrderAckPayload>(
      LAN_MESSAGE_TYPES.KDS_ORDER_ACK as any,
      async (message) => {
        const { order_id, station } = message.payload;
        await markStationDispatched(order_id, station);
        console.log(`[useKitchenDispatch] Order ${order_id} acknowledged by ${station}`);
      }
    );

    return unsubscribe;
  }, []);

  // Process queue when LAN reconnects
  useEffect(() => {
    if (connectionStatus === 'connected' && pendingCount > 0) {
      processDispatchQueue().then(({ processed, failed }) => {
        if (processed > 0) {
          console.log(`[useKitchenDispatch] Processed ${processed} pending dispatches`);
        }
        if (failed > 0) {
          console.warn(`[useKitchenDispatch] ${failed} dispatches failed`);
        }
      });
    }
  }, [connectionStatus, pendingCount]);

  const dispatchOrder = useCallback(async (orderId: string): Promise<boolean> => {
    setIsDispatching(true);
    setLastError(null);

    try {
      const order = await db.offline_orders.get(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const items = await db.offline_order_items
        .where('order_id')
        .equals(orderId)
        .toArray();

      const { dispatched, queued } = await dispatchOrderToKitchen(order, items);

      if (queued.length > 0) {
        console.log(`[useKitchenDispatch] Queued ${queued.length} stations for later`);
      }

      return dispatched.length > 0 || queued.length > 0;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Dispatch failed';
      setLastError(msg);
      console.error('[useKitchenDispatch] Error:', error);
      return false;
    } finally {
      setIsDispatching(false);
    }
  }, []);

  const processQueue = useCallback(async () => {
    setIsDispatching(true);
    setLastError(null);

    try {
      return await processDispatchQueue();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Queue processing failed';
      setLastError(msg);
      return { processed: 0, failed: 0 };
    } finally {
      setIsDispatching(false);
    }
  }, []);

  return {
    dispatchOrder,
    processQueue,
    pendingCount,
    isDispatching,
    lastError,
  };
}
```

### Business Rules (CRITICAL)

**Dispatch Stations** [Source: database schema]
- `kitchen`: Préparation cuisine (plats chauds, sandwiches)
- `barista`: Préparation boissons (cafés, thés)
- `display`: Vitrine self-service (viennoiseries prêtes)
- `none`: Pas de dispatch KDS nécessaire

**Timing Requirements** [Source: NFR-PERF-04]
- Dispatch vers KDS: < 1 seconde latence
- Retry backoff: 2s → 4s → 8s (max 3 tentatives)
- Timeout par tentative: 5 secondes

**Order Flow avec Dispatch**
```
Cart → Order → Payment → Dispatch → KDS
  ↓
Si LAN down:
  → Queue locale → Retry on reconnect → KDS
```

### Previous Story Intelligence

**Story 3.5 Patterns** [Source: 3-5-pos-session-management-offline.md]
- Pattern de queue locale avec retry
- useLiveQuery pour compteurs réactifs
- Transaction safety avec db.transaction()

**Story 3.3 Foundation** [Source: 3-3-offline-order-creation.md]
- createOfflineOrder() est le point d'intégration
- Les items sont créés avec category_id pour le filtrage

**LAN Services Existants** [Source: src/services/lan/]
- lanHub.broadcast() pour envoi broadcast
- lanClient.on() pour écoute des ACK
- LAN_MESSAGE_TYPES.KDS_NEW_ORDER déjà défini

### Testing Strategy

**Test Cases for kitchenDispatchService:**
1. `filterItemsByStation()` - filtre correctement par station
2. `filterItemsByStation()` - retourne vide si aucun item pour station
3. `dispatchOrderToKitchen()` - envoie aux bonnes stations
4. `dispatchOrderToKitchen()` - queue si LAN down
5. `addToDispatchQueue()` - crée entrée correcte
6. `processDispatchQueue()` - traite items en FIFO
7. `processDispatchQueue()` - skip si LAN pas connecté
8. `markStationDispatched()` - supprime de la queue
9. `markStationDispatched()` - update order status quand queue vide
10. Retry logic avec backoff

**Test Cases for useKitchenDispatch:**
1. `dispatchOrder()` - dispatch une commande existante
2. `dispatchOrder()` - error si commande inexistante
3. `processQueue()` - process queue complète
4. Auto-process on LAN reconnect
5. ACK handler updates status

### Traductions à Ajouter

```json
// fr.json - section dispatch
{
  "dispatch": {
    "status": {
      "pending": "En attente d'envoi",
      "dispatched": "Envoyé en cuisine",
      "failed": "Échec d'envoi"
    },
    "sentToKitchen": "Commande envoyée en cuisine",
    "sentToBarista": "Commande envoyée au bar",
    "queuedForLater": "En attente de connexion LAN",
    "dispatchFailed": "Échec de l'envoi vers la cuisine",
    "pendingCount": "{{count}} en attente",
    "retrying": "Nouvel essai en cours...",
    "allDispatched": "Tous les envois effectués"
  }
}
```

```json
// en.json
{
  "dispatch": {
    "status": {
      "pending": "Pending dispatch",
      "dispatched": "Sent to kitchen",
      "failed": "Dispatch failed"
    },
    "sentToKitchen": "Order sent to kitchen",
    "sentToBarista": "Order sent to bar",
    "queuedForLater": "Queued for LAN connection",
    "dispatchFailed": "Failed to send to kitchen",
    "pendingCount": "{{count}} pending",
    "retrying": "Retrying...",
    "allDispatched": "All dispatches completed"
  }
}
```

```json
// id.json
{
  "dispatch": {
    "status": {
      "pending": "Menunggu pengiriman",
      "dispatched": "Dikirim ke dapur",
      "failed": "Gagal mengirim"
    },
    "sentToKitchen": "Pesanan dikirim ke dapur",
    "sentToBarista": "Pesanan dikirim ke bar",
    "queuedForLater": "Menunggu koneksi LAN",
    "dispatchFailed": "Gagal mengirim ke dapur",
    "pendingCount": "{{count}} tertunda",
    "retrying": "Mencoba lagi...",
    "allDispatched": "Semua pengiriman selesai"
  }
}
```

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── services/
│   └── offline/
│       ├── kitchenDispatchService.ts          # NEW: Kitchen dispatch service
│       └── __tests__/
│           └── kitchenDispatchService.test.ts # NEW: Unit tests
├── hooks/
│   └── offline/
│       └── useKitchenDispatch.ts              # NEW: Kitchen dispatch hook
```

**Fichiers à modifier:**
- `src/types/offline.ts` - Ajouter `TDispatchStatus`, `IDispatchQueueItem`, `IKdsNewOrderPayload`, `IKdsOrderAckPayload`
- `src/lib/db.ts` - Version 10 avec `offline_dispatch_queue` + extension `offline_orders`
- `src/services/lan/lanProtocol.ts` - Ajouter `KDS_ORDER_ACK` si pas présent
- `src/services/offline/index.ts` - Exporter kitchenDispatchService
- `src/hooks/offline/index.ts` - Exporter useKitchenDispatch
- `src/services/offline/offlineOrderService.ts` - Intégrer dispatchOrderToKitchen après création
- `src/locales/fr.json`, `en.json`, `id.json` - Ajouter traductions

### Dependencies on Previous Work

- ✅ `src/lib/db.ts` - Dexie v9 avec `offline_sessions` (Story 3.5)
- ✅ `src/types/offline.ts` - Types IOfflineOrder, IOfflineOrderItem (Story 3.1, 3.3)
- ✅ `src/services/offline/offlineOrderService.ts` - createOfflineOrder() (Story 3.3)
- ✅ `src/services/lan/lanHub.ts` - LAN hub service (existant)
- ✅ `src/services/lan/lanClient.ts` - LAN client service (existant)
- ✅ `src/services/lan/lanProtocol.ts` - LAN_MESSAGE_TYPES.KDS_NEW_ORDER (existant)
- ✅ `src/stores/lanStore.ts` - connectionStatus (existant)
- ✅ `offline_categories.dispatch_station` - Station mapping (existant)

### Epic 3 Context

Cette story est la **7ème** de l'Epic 3 (POS & Ventes). Elle dépend de:
- ✅ Story 3.1: Dexie Schema (DONE)
- ✅ Story 3.2: Cart Persistence (DONE)
- ✅ Story 3.3: Offline Order Creation (DONE)
- ✅ Story 3.4: Offline Payment Processing (DONE)
- ✅ Story 3.5: POS Session Management (DONE)
- ⏸️ Story 3.6: Sync Queue Processing (ready-for-dev) - peut être parallélisé

Les stories suivantes dépendent de celle-ci:
- Epic 4: Cuisine & Dispatch - Toutes les stories KDS utilisent ce dispatch

### Critical Implementation Notes

1. **Filtrage par dispatch_station** - Utiliser `offline_categories.dispatch_station` pas un mapping hardcodé
2. **Queue FIFO** - Toujours traiter les dispatches dans l'ordre chronologique
3. **ACK handling** - Le KDS doit renvoyer un ACK, sinon la commande reste "pending"
4. **Retry limit** - Max 3 tentatives avec exponential backoff (2s → 4s → 8s)
5. **Integration point** - dispatchOrderToKitchen() appelé APRÈS createOfflineOrder() + saveOfflinePayment()
6. **LAN Status** - Utiliser lanHub.isActive() ET lanStore.connectionStatus pour déterminer si envoi possible

### Anti-Patterns to AVOID

| ❌ Éviter | ✅ Faire |
|-----------|----------|
| Hardcoder les stations | Lire dispatch_station depuis categories |
| Bloquer si LAN down | Queue localement et retry on reconnect |
| Envoyer tous les items à tous les KDS | Filtrer par station avant envoi |
| Ignorer les ACK | Écouter les ACK et mettre à jour le statut |
| Retry infini | Max 3 tentatives puis marquer `failed` |
| Dispatch avant paiement | Dispatch APRÈS order + payment confirmés |

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-3.7]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-006]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-007]
- [Source: _bmad-output/implementation-artifacts/3-3-offline-order-creation.md]
- [Source: _bmad-output/implementation-artifacts/3-5-pos-session-management-offline.md]
- [Source: src/services/lan/lanHub.ts]
- [Source: src/services/lan/lanClient.ts]
- [Source: src/services/lan/lanProtocol.ts]
- [Source: src/lib/db.ts] - offline_categories avec dispatch_station

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- All 7 tasks completed successfully
- Kitchen dispatch service implements station filtering via category dispatch_station
- Dispatch queue for offline/LAN-unavailable scenarios with retry logic (max 3 attempts, exponential backoff)
- Integration with useOfflinePayment hook - dispatch happens AFTER payment confirmation
- 24 unit tests passing for kitchenDispatchService
- Translations added for fr, en, id locales
- TypeScript compilation successful for all new files

### File List

**New Files:**
- `src/services/offline/kitchenDispatchService.ts` - Core dispatch service
- `src/services/offline/__tests__/kitchenDispatchService.test.ts` - Unit tests
- `src/hooks/offline/useKitchenDispatch.ts` - React hook for dispatch

**Modified Files:**
- `src/types/offline.ts` - Added kitchen dispatch types (TDispatchStatus, TKitchenStation, IDispatchQueueItem, IKdsNewOrderPayload, IKdsOrderAckPayload) and extended IOfflineOrder
- `src/lib/db.ts` - Added Dexie version 10 with offline_dispatch_queue table
- `src/services/lan/lanProtocol.ts` - Added KDS_ORDER_ACK message type
- `src/services/offline/index.ts` - Exported kitchenDispatchService functions
- `src/hooks/offline/index.ts` - Exported useKitchenDispatch hook
- `src/hooks/offline/useOfflinePayment.ts` - Integrated dispatch after payment
- `src/locales/fr.json` - Added dispatch translations
- `src/locales/en.json` - Added dispatch translations
- `src/locales/id.json` - Added dispatch translations

