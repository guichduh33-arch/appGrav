# Story 4.5: KDS Item Status Update

Status: done

## Story

As a **Cuisinier**,
I want **marquer les items comme "en préparation" puis "prêt"**,
so that **le POS et les serveurs connaissent l'avancement**.

## Acceptance Criteria

### AC1: Marquer Item "En Préparation"
**Given** je vois un item à préparer (statut 'new')
**When** je tape sur le bouton "Start"
**Then** l'item passe en statut "preparing" (couleur jaune)
**And** l'event `KDS_ITEM_PREPARING` est envoyé au POS via LAN

### AC2: Marquer Item "Prêt"
**Given** l'item est en préparation (statut 'preparing')
**When** je tape le bouton "Ready"
**Then** il passe en statut "ready" (couleur verte)
**And** l'event `KDS_ITEM_READY` est envoyé au POS via LAN

### AC3: Mise à Jour Supabase Persistée
**Given** je change le statut d'un item
**When** l'action est effectuée
**Then** le statut est mis à jour dans Supabase (order_items.item_status)
**And** le timestamp est enregistré (prepared_at pour ready)

### AC4: POS Reçoit les Updates via LAN
**Given** le POS est connecté au hub LAN
**When** le KDS envoie un event de statut
**Then** le POS met à jour l'état local de la commande
**And** l'UI reflète le changement (si visible)

### AC5: Feedback Visuel Instantané
**Given** je change le statut d'un item
**When** l'action est déclenchée
**Then** l'UI se met à jour immédiatement (optimistic update)
**And** si l'envoi échoue, un message d'erreur s'affiche

## Analysis: État Actuel de l'Implémentation

### ✅ DÉJÀ IMPLÉMENTÉ

**1. Handlers de Mise à Jour (Supabase)**
```typescript
// KDSMainPage.tsx:274-299
const handleStartPreparing = async (orderId: string, itemIds: string[]) => {
    await supabase
        .from('order_items')
        .update({ item_status: 'preparing' })
        .in('id', itemIds)
    // ...update order status if all items preparing
    fetchOrders()
}

// KDSMainPage.tsx:301-327
const handleMarkReady = async (orderId: string, itemIds: string[]) => {
    await supabase
        .from('order_items')
        .update({
            item_status: 'ready',
            prepared_at: new Date().toISOString()
        })
        .in('id', itemIds)
    // ...broadcast to display if all ready
    fetchOrders()
}
```

**2. UI Boutons dans KDSOrderCard**
```typescript
// KDSOrderCard.tsx:102-121
const handleStartPreparing = () => {
    const itemIds = stationItems.filter(i => i.item_status === 'new').map(i => i.id)
    if (itemIds.length > 0) {
        onStartPreparing(orderId, itemIds)
    }
}

const handleMarkReady = () => {
    const itemIds = stationItems.filter(i => i.item_status === 'preparing').map(i => i.id)
    if (itemIds.length > 0) {
        onMarkReady(orderId, itemIds)
    }
}
```

**3. Styles CSS pour les statuts**
```css
/* KDSOrderCard.css:168-188 */
.kds-order-card__item--new { border-left-color: #3B82F6; }
.kds-order-card__item--preparing { border-left-color: #F59E0B; background: rgba(245, 158, 11, 0.1); }
.kds-order-card__item--ready { border-left-color: #10B981; background: rgba(16, 185, 129, 0.1); }
```

### ❌ MANQUANT

**1. Events LAN pour notifier le POS**
- `KDS_ITEM_PREPARING` n'existe pas dans lanProtocol.ts
- `KDS_ITEM_READY` n'existe pas dans lanProtocol.ts
- Les handlers n'envoient PAS via LAN

**2. POS n'écoute pas les events de statut**
- Le POS ne sait pas quand un item passe en preparing/ready
- Pas de mise à jour de l'état local côté POS

**3. Optimistic Updates**
- Les handlers attendent le fetchOrders() après Supabase
- Pas de mise à jour immédiate de l'UI

## Tasks / Subtasks

- [x] **Task 1: Ajouter les types de messages LAN** (AC: 1, 2)
  - [x] 1.1: Ajouter `KDS_ITEM_PREPARING` dans LAN_MESSAGE_TYPES
  - [x] 1.2: Ajouter `KDS_ITEM_READY` dans LAN_MESSAGE_TYPES
  - [x] 1.3: Créer interfaces `IKdsItemPreparingPayload` et `IKdsItemReadyPayload`

- [x] **Task 2: Créer le service kdsStatusService** (AC: 1, 2, 3)
  - [x] 2.1: Créer `src/services/kds/kdsStatusService.ts`
  - [x] 2.2: Implémenter `markItemsPreparing(orderId, orderNumber, itemIds, station)`
  - [x] 2.3: Implémenter `markItemsReady(orderId, orderNumber, itemIds, station)`
  - [x] 2.4: Gérer la persistance Supabase + envoi LAN

- [x] **Task 3: Modifier les handlers dans KDSMainPage** (AC: 1, 2, 3, 5)
  - [x] 3.1: Importer kdsStatusService
  - [x] 3.2: Modifier handleStartPreparing pour envoyer via LAN
  - [x] 3.3: Modifier handleMarkReady pour envoyer via LAN
  - [x] 3.4: Ajouter optimistic update avant Supabase

- [x] **Task 4: POS écoute les events de statut** (AC: 4) - Hook créé, intégration POS différée
  - [x] 4.1: Créer hook `useKdsStatusListener` pour le POS
  - [x] 4.2: Écouter `KDS_ITEM_PREPARING` et `KDS_ITEM_READY`
  - [x] 4.3: Mettre à jour l'état local des commandes (via callback)
  - [x] 4.4: Optionnel: Notification toast ou sonore (callback provided)
  - [x] 4.5: Intégration POS différée → Story 4.7 créée

- [x] **Task 5: Tests unitaires** (AC: 1, 2, 3, 4)
  - [x] 5.1: Créer `src/services/kds/__tests__/kdsStatusService.test.ts`
  - [x] 5.2: Tester envoi de KDS_ITEM_PREPARING
  - [x] 5.3: Tester envoi de KDS_ITEM_READY
  - [x] 5.4: Tester réception côté POS (mocked via lanClient.on)

- [x] **Task 6: Traductions** (AC: 5)
  - [x] 6.1: Ajouter clés `kds.status.*` dans fr.json
  - [x] 6.2: Ajouter clés dans en.json
  - [x] 6.3: Ajouter clés dans id.json

## Dev Notes

### CRITICAL: Types de Messages à Ajouter

**⚠️ Ces types manquent dans lanProtocol.ts !** [Source: epic-3-retrospective.md]

```typescript
// Ajouter dans src/services/lan/lanProtocol.ts

export const LAN_MESSAGE_TYPES = {
  // ... existing types ...

  // KDS Item Status (NEW)
  KDS_ITEM_PREPARING: 'kds_item_preparing',
  KDS_ITEM_READY: 'kds_item_ready',
} as const;
```

### Payloads pour les Events

```typescript
// Ajouter dans src/services/lan/lanProtocol.ts ou src/types/offline.ts

/**
 * Payload when KDS marks items as preparing
 */
export interface IKdsItemPreparingPayload {
  order_id: string;
  order_number: string;
  item_ids: string[];
  station: TKitchenStation;
  timestamp: string;
}

/**
 * Payload when KDS marks items as ready
 */
export interface IKdsItemReadyPayload {
  order_id: string;
  order_number: string;
  item_ids: string[];
  station: TKitchenStation;
  prepared_at: string;
  timestamp: string;
}
```

### Service kdsStatusService

```typescript
// src/services/kds/kdsStatusService.ts

import { supabase } from '@/lib/supabase';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import type { TKitchenStation } from '@/types/offline';

interface IItemStatusResult {
  success: boolean;
  lanSent: boolean;
  error?: string;
}

/**
 * Mark items as preparing and notify via LAN
 */
export async function markItemsPreparing(
  orderId: string,
  orderNumber: string,
  itemIds: string[],
  station: TKitchenStation
): Promise<IItemStatusResult> {
  const timestamp = new Date().toISOString();

  try {
    // 1. Update Supabase
    const { error } = await supabase
      .from('order_items')
      .update({ item_status: 'preparing' })
      .in('id', itemIds);

    if (error) {
      return { success: false, lanSent: false, error: error.message };
    }

    // 2. Check if all items in order are preparing → update order status
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('id, item_status')
      .eq('order_id', orderId);

    const allPreparing = orderItems?.every(
      item => itemIds.includes(item.id) || item.item_status !== 'new'
    );

    if (allPreparing) {
      await supabase
        .from('orders')
        .update({ status: 'preparing' })
        .eq('id', orderId);
    }

    // 3. Send via LAN
    let lanSent = false;
    if (lanClient.isActive()) {
      await lanClient.send(LAN_MESSAGE_TYPES.KDS_ITEM_PREPARING, {
        order_id: orderId,
        order_number: orderNumber,
        item_ids: itemIds,
        station,
        timestamp,
      });
      lanSent = true;
    }

    return { success: true, lanSent };
  } catch (err) {
    return {
      success: false,
      lanSent: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Mark items as ready and notify via LAN
 */
export async function markItemsReady(
  orderId: string,
  orderNumber: string,
  itemIds: string[],
  station: TKitchenStation
): Promise<IItemStatusResult> {
  const timestamp = new Date().toISOString();

  try {
    // 1. Update Supabase with prepared_at timestamp
    const { error } = await supabase
      .from('order_items')
      .update({
        item_status: 'ready',
        prepared_at: timestamp,
      })
      .in('id', itemIds);

    if (error) {
      return { success: false, lanSent: false, error: error.message };
    }

    // 2. Send via LAN
    let lanSent = false;
    if (lanClient.isActive()) {
      await lanClient.send(LAN_MESSAGE_TYPES.KDS_ITEM_READY, {
        order_id: orderId,
        order_number: orderNumber,
        item_ids: itemIds,
        station,
        prepared_at: timestamp,
        timestamp,
      });
      lanSent = true;
    }

    return { success: true, lanSent };
  } catch (err) {
    return {
      success: false,
      lanSent: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
```

### Modification KDSMainPage

```typescript
// Modifier dans KDSMainPage.tsx

import { markItemsPreparing, markItemsReady } from '@/services/kds/kdsStatusService';

const handleStartPreparing = async (orderId: string, itemIds: string[]) => {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  // Optimistic update
  setOrders(prev => prev.map(o => {
    if (o.id !== orderId) return o;
    return {
      ...o,
      items: o.items.map(item =>
        itemIds.includes(item.id)
          ? { ...item, item_status: 'preparing' as const }
          : item
      ),
    };
  }));

  // Send to Supabase + LAN
  const result = await markItemsPreparing(
    orderId,
    order.order_number,
    itemIds,
    stationConfig?.dbStation as TKitchenStation || 'kitchen'
  );

  if (!result.success) {
    console.error('Error updating item status:', result.error);
    // Rollback optimistic update
    fetchOrders();
  }
};

const handleMarkReady = async (orderId: string, itemIds: string[]) => {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  // Optimistic update
  setOrders(prev => prev.map(o => {
    if (o.id !== orderId) return o;
    return {
      ...o,
      items: o.items.map(item =>
        itemIds.includes(item.id)
          ? { ...item, item_status: 'ready' as const }
          : item
      ),
    };
  }));

  // Send to Supabase + LAN
  const result = await markItemsReady(
    orderId,
    order.order_number,
    itemIds,
    stationConfig?.dbStation as TKitchenStation || 'kitchen'
  );

  if (!result.success) {
    console.error('Error updating item status:', result.error);
    fetchOrders();
  } else {
    // Broadcast to customer display if all items ready
    const allReady = order.items.every(item =>
      itemIds.includes(item.id) || item.item_status === 'ready' || item.item_status === 'served'
    );
    if (allReady) {
      broadcastOrderStatus(orderId, order.order_number, 'ready');
    }
  }
};
```

### Hook useKdsStatusListener pour le POS

```typescript
// src/hooks/pos/useKdsStatusListener.ts

import { useEffect, useCallback } from 'react';
import { lanHub } from '@/services/lan/lanHub';
import { LAN_MESSAGE_TYPES, ILanMessage } from '@/services/lan/lanProtocol';
import type { IKdsItemPreparingPayload, IKdsItemReadyPayload } from '@/services/lan/lanProtocol';

interface UseKdsStatusListenerOptions {
  onItemPreparing?: (orderId: string, itemIds: string[]) => void;
  onItemReady?: (orderId: string, itemIds: string[]) => void;
}

export function useKdsStatusListener(options: UseKdsStatusListenerOptions = {}) {
  const { onItemPreparing, onItemReady } = options;

  const handlePreparing = useCallback((message: ILanMessage<IKdsItemPreparingPayload>) => {
    const { order_id, item_ids, station } = message.payload;
    console.log(`[POS] Items preparing for order ${order_id} from ${station}`);
    onItemPreparing?.(order_id, item_ids);
  }, [onItemPreparing]);

  const handleReady = useCallback((message: ILanMessage<IKdsItemReadyPayload>) => {
    const { order_id, item_ids, station } = message.payload;
    console.log(`[POS] Items ready for order ${order_id} from ${station}`);
    onItemReady?.(order_id, item_ids);
  }, [onItemReady]);

  useEffect(() => {
    if (!lanHub.isActive()) return;

    // Note: lanHub doesn't have .on() method, need to extend or use different approach
    // For now, this is a placeholder - actual implementation may vary

    // If using lanClient-style handlers on hub, implement here
    // Otherwise, hub can broadcast updates to all connected devices
  }, [handlePreparing, handleReady]);
}
```

### Fichiers à Créer

```
src/
├── services/
│   └── kds/
│       ├── kdsStatusService.ts           # NEW: Service mise à jour statut
│       ├── index.ts                      # NEW: Export
│       └── __tests__/
│           └── kdsStatusService.test.ts  # NEW: Tests
├── hooks/
│   └── pos/
│       └── useKdsStatusListener.ts       # NEW: Hook écoute POS (optionnel)
```

### Fichiers à Modifier

- `src/services/lan/lanProtocol.ts` - Ajouter KDS_ITEM_PREPARING, KDS_ITEM_READY
- `src/pages/kds/KDSMainPage.tsx` - Utiliser kdsStatusService, optimistic updates
- `src/locales/fr.json` - Traductions status
- `src/locales/en.json` - Traductions
- `src/locales/id.json` - Traductions

### Traductions à Ajouter

```json
// fr.json
{
  "kds": {
    "status": {
      "preparing": "En préparation",
      "ready": "Prêt",
      "served": "Servi",
      "updateSuccess": "Statut mis à jour",
      "updateError": "Erreur de mise à jour du statut",
      "lanSent": "Notification envoyée",
      "lanFailed": "Notification LAN échouée"
    }
  }
}
```

```json
// en.json
{
  "kds": {
    "status": {
      "preparing": "Preparing",
      "ready": "Ready",
      "served": "Served",
      "updateSuccess": "Status updated",
      "updateError": "Failed to update status",
      "lanSent": "Notification sent",
      "lanFailed": "LAN notification failed"
    }
  }
}
```

```json
// id.json
{
  "kds": {
    "status": {
      "preparing": "Sedang disiapkan",
      "ready": "Siap",
      "served": "Disajikan",
      "updateSuccess": "Status diperbarui",
      "updateError": "Gagal memperbarui status",
      "lanSent": "Notifikasi terkirim",
      "lanFailed": "Notifikasi LAN gagal"
    }
  }
}
```

### Business Rules (CRITICAL)

**Statuts d'Item** [Source: src/components/kds/KDSOrderCard.tsx]
- `new` → Bleu, en attente de préparation
- `preparing` → Jaune, en cours de préparation
- `ready` → Vert, prêt à servir
- `served` → Gris, servi au client

**Transitions Autorisées**
```
new → preparing → ready → served
```

**Persistance**
- `item_status` mis à jour dans `order_items`
- `prepared_at` timestamp quand ready
- `served_at` timestamp quand served

**Events LAN**
```
KDS_ITEM_PREPARING: {
  order_id, order_number, item_ids[], station, timestamp
}

KDS_ITEM_READY: {
  order_id, order_number, item_ids[], station, prepared_at, timestamp
}
```

### Flow de Communication

```
┌─────────────────────────────────────────────────────┐
│                        KDS                           │
│                                                     │
│  User clicks "Start" → handleStartPreparing()      │
│              │                                       │
│              ▼                                       │
│  1. Optimistic update UI (instant feedback)        │
│  2. markItemsPreparing() → Supabase                │
│  3. lanClient.send(KDS_ITEM_PREPARING)             │
│                                                     │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                   POS (Hub)                          │
│                                                     │
│  Receives KDS_ITEM_PREPARING via Realtime          │
│              │                                       │
│              ▼                                       │
│  useKdsStatusListener → onItemPreparing()          │
│              │                                       │
│              ▼                                       │
│  Update local order state (optional)               │
│  Show notification (optional)                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Previous Story Intelligence

**Story 4.3 (Order Dispatch to KDS via LAN):**
- Utilise `lanClient.on()` pour écouter les messages
- Pattern à réutiliser pour envoyer les status updates

**Story 4.4 (KDS Order Queue Display):**
- `useKdsOrderQueue` gère l'état local des ordres
- Les optimistic updates doivent s'intégrer

**Story 3.7 (Kitchen Dispatch via LAN):**
- `kitchenDispatchService` est un bon modèle pour `kdsStatusService`
- Pattern Supabase + LAN déjà établi

### Testing Strategy

**Test Cases pour kdsStatusService:**
1. `markItemsPreparing` - met à jour Supabase
2. `markItemsPreparing` - envoie via LAN si connecté
3. `markItemsPreparing` - retourne lanSent=false si déconnecté
4. `markItemsReady` - met à jour avec prepared_at
5. `markItemsReady` - envoie via LAN
6. Gestion des erreurs Supabase
7. Mise à jour order.status quand tous items preparing

### Anti-Patterns to AVOID

| ❌ Éviter | ✅ Faire |
|-----------|----------|
| Attendre Supabase avant update UI | Optimistic update immédiat |
| Ignorer l'envoi LAN | Toujours tenter d'envoyer via LAN |
| Bloquer si LAN échoue | LAN est best-effort, Supabase est la source de vérité |
| Hardcoder les stations | Utiliser stationConfig.dbStation |
| Oublier le timestamp | Toujours inclure prepared_at |

### Dependency on Previous Work

- ✅ `src/pages/kds/KDSMainPage.tsx` - Handlers existants
- ✅ `src/components/kds/KDSOrderCard.tsx` - UI boutons
- ✅ `src/services/lan/lanClient.ts` - Client LAN avec send()
- ✅ `src/services/lan/lanProtocol.ts` - À étendre
- ⏳ Story 4.2 - KDS Client Connection
- ⏳ Story 4.3 - Order Dispatch (pattern de messages)
- ⏳ Story 4.4 - Order Queue (état local)

### Epic 4 Context

Cette story est la **5ème** de l'Epic 4 (Cuisine & Dispatch - Kitchen Display System).

**Dépend de:**
- Story 4.1: Socket.IO Server on POS (LAN Hub) - done
- Story 4.2: KDS Socket.IO Client Connection - ready-for-dev
- Story 4.3: Order Dispatch to KDS via LAN - ready-for-dev
- Story 4.4: KDS Order Queue Display - ready-for-dev

**Stories qui dépendent de celle-ci:**
- Story 4.6: Order Completion & Auto-Remove → utilise les statuts ready

### Critical Implementation Notes

1. **Les handlers existent** - Ne pas recréer, les modifier
2. **Ajouter les types LAN** - KDS_ITEM_PREPARING, KDS_ITEM_READY
3. **Optimistic updates** - UI instantanée, rollback si erreur
4. **Supabase = source de vérité** - LAN est notification secondaire
5. **Ne pas bloquer sur LAN** - Si déconnecté, continuer avec Supabase

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-4.5]
- [Source: _bmad-output/implementation-artifacts/epic-3-retrospective.md]
- [Source: src/pages/kds/KDSMainPage.tsx:274-327]
- [Source: src/components/kds/KDSOrderCard.tsx:102-121]
- [Source: src/services/lan/lanClient.ts:180-204]
- [Source: src/services/lan/lanProtocol.ts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 9 tests pass for kdsStatusService
- TypeScript compilation passes for new code
- Pre-existing test failures in useLanClient.test.ts and useOfflinePayment.test.ts are unrelated

### Completion Notes List

- ✅ Added KDS_ITEM_PREPARING and KDS_ITEM_READY message types to lanProtocol.ts
- ✅ Created IKdsItemPreparingPayload and IKdsItemReadyPayload interfaces
- ✅ Implemented kdsStatusService with markItemsPreparing and markItemsReady functions
- ✅ Modified KDSMainPage handlers to use optimistic updates + LAN notification
- ✅ Created useKdsStatusListener hook for POS to receive status updates
- ✅ Added translations for kds.status.* keys in all 3 locale files (fr, en, id)
- ✅ Wrote comprehensive unit tests with 9 test cases all passing

### File List

**New Files:**
- src/services/kds/kdsStatusService.ts
- src/services/kds/index.ts
- src/services/kds/__tests__/kdsStatusService.test.ts
- src/hooks/pos/useKdsStatusListener.ts
- src/hooks/pos/index.ts

**Modified Files:**
- src/services/lan/lanProtocol.ts (added KDS_ITEM_PREPARING, KDS_ITEM_READY types + payload interfaces, TKitchenStation type usage)
- src/pages/kds/KDSMainPage.tsx (updated handlers with optimistic updates, surgical rollback, toast notifications, service usage)
- src/hooks/kds/index.ts (re-exported useKdsOrderQueue)
- src/locales/fr.json (added kds.status.* translations)
- src/locales/en.json (added kds.status.* translations)
- src/locales/id.json (added kds.status.* translations)

**Note on AC4 (POS Receives Updates):**
- The `useKdsStatusListener` hook is fully implemented and ready for integration
- Integration into a specific POS component is deferred to a future story that defines the UX for real-time order status display on POS
- The hook provides callbacks `onItemPreparing` and `onItemReady` that any POS component can consume

### Change Log

- 2026-02-02: Story 4.5 implementation complete - KDS item status updates with LAN notification
- 2026-02-02: Code review fixes applied:
  - Added toast notifications for error feedback (AC5 compliance)
  - Used hook's `updateOrderItem` for proper optimistic updates and surgical rollback
  - Fixed type consistency: `station` parameter now uses `TKitchenStation` throughout
  - Added test for order status update when all items become preparing
  - Fixed test file type casting with `as unknown as` pattern
  - Documented that `useKdsStatusListener` integration is deferred to future story
- 2026-02-02: Adversarial code review (Claude Opus 4.5):
  - [FIXED] M1: Error messages now show specific error detail instead of generic message
  - [FIXED] M2: Extracted urgentThresholdSeconds to KDS_URGENT_THRESHOLD_SECONDS constant
  - [ADDED] Task 4.5: Follow-up action item for POS integration of useKdsStatusListener
- 2026-02-02: Story 4.7 créée pour intégration POS → Story 4-5 marquée done
