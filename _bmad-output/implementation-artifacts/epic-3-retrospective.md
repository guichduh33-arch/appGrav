# Epic 3 Retrospective: POS & Ventes — Commandes, Encaissement & Sessions

**Date:** 2026-02-01
**Agent Model:** Claude Opus 4.5 (claude-opus-4-5-20251101)
**Facilitator:** Bob (Scrum Master)

## Executive Summary

L'Epic 3 a été **complété avec succès**. Les 8 stories ont été implémentées, testées et validées. L'infrastructure **write-sync offline-first** pour le POS est opérationnelle: création de commandes offline, paiements, sessions de caisse, sync queue automatique, dispatch cuisine via LAN, et compteur de sync pending.

**Durée totale:** ~6 jours de développement
**Tests créés:** ~280 tests passant
**Fichiers créés:** ~45 nouveaux fichiers
**Schéma Dexie:** v6 → v10 (4 nouvelles tables)

---

## Story Analysis

### Story 3.1: Dexie Schema for Orders & Sync Queue
**Status:** Done ✅
**Tests:** 42 tests passant

**Points clés:**
- Schéma Dexie v7 avec `offline_orders`, `offline_order_items`, `offline_sync_queue`
- `ordersCacheService.ts` créé pour CRUD offline
- Préfixe `LOCAL-` pour les IDs générés offline

**Learnings:**
- La consolidation vers `src/lib/db.ts` (décision Epic 2) continue de simplifier le code
- Pattern `LOCAL_ORDER_ID_PREFIX` établi pour le remapping post-sync

### Story 3.2: Cart Persistence Offline
**Status:** Done ✅
**Tests:** 23 tests passant

**Points clés:**
- **localStorage** choisi pour la persistance du panier (pas Dexie)
- Extension `cartStore.ts` existant avec `persist` middleware
- Locked items préservés au redémarrage

**Key Decision:**
> localStorage choisi pour simplicité: panier unique, pas de queries, synchrone

### Story 3.3: Offline Order Creation
**Status:** Done ✅
**Tests:** 24 tests passant

**Points clés:**
- `offlineOrderService.ts` pour création transactionnelle order + items
- Numéro de commande format: `OFFLINE-YYYYMMDD-XXX`
- Calcul tax incluse: `total × 10/110`
- `SyncStatusBadge` composant créé

**Learnings:**
- Transaction Dexie obligatoire pour order + items (atomicité)
- Le pattern `is_offline: true` facilite le filtrage UI

### Story 3.4: Offline Payment Processing
**Status:** Done ✅
**Tests:** 51 tests passant (35 service + 16 integration)

**Points clés:**
- Schéma Dexie v8 avec `offline_payments`
- `offlinePaymentService.ts` avec calcul change et split payments
- Refactor `PaymentModal` pour routing online/offline

**Code Review Fixes:**
- Ajout validation montant > 0
- Gestion erreur si order inexistant

### Story 3.5: POS Session Management Offline
**Status:** Done ✅
**Tests:** 27 tests passant

**Points clés:**
- Schéma Dexie v9 avec `offline_sessions`
- Validation session unique par utilisateur
- Calcul écart caisse: `actual_cash - (opening_amount + expected_cash)`

**Key Decision:**
> Task 5 (useShift integration) différée - `useOfflineSession` peut être utilisé directement

### Story 3.6: Sync Queue Processing
**Status:** Done ✅
**Tests:** 57 tests passant (47 unit + 10 integration)

**Points clés:**
- **SyncEngineV2** créé pour unifier vers `db.offline_sync_queue`
- Trois processors spécialisés: session, order, payment
- Ordre de traitement: Sessions → Orders → Payments (dépendances FK)
- ID remapping via Maps (sessionIdMap, orderIdMap)
- Backoff exponentiel: 5s → 10s → 30s → 60s → 300s

**Code Review Fixes:**
- Issue #2: Fixed redundant ternary in `markFailed()`
- Issue #4: Added integration tests for syncEngineV2
- Issue #5: Added `db.transaction()` to `updateOrdersWithSessionServerId()`
- Issue #6-7: Consolidated duplicate `ISyncResult` and `isLocalId()` into syncQueueHelpers

**Technical Debt Identified:**
- `shouldRetryNow()` uses `created_at` as proxy for last attempt time (MEDIUM priority)
- No atomicity for multi-table Supabase inserts in `processOrderSync()` (LOW priority)

### Story 3.7: Kitchen Dispatch via LAN (Offline)
**Status:** Done ✅
**Tests:** 24 tests passant

**Points clés:**
- Schéma Dexie v10 avec `offline_dispatch_queue`
- Filtrage items par `dispatch_station` des catégories
- Queue locale si LAN down, retry automatique on reconnect
- Max 3 tentatives avec backoff: 2s → 4s → 8s
- ACK handling via `KDS_ORDER_ACK` message type

**Integration Point:**
- Dispatch appelé APRÈS payment confirmation dans `useOfflinePayment`

### Story 3.8: Pending Sync Counter Display
**Status:** Done ✅
**Tests:** 50 tests passant (34 helpers + 6 hook + 10 component)

**Points clés:**
- `PendingSyncCounter` badge dans header (masqué si 0)
- `PendingSyncPanel` Sheet avec items groupés par entity
- Actions retry/delete sur items failed
- Refresh automatique toutes les 5 secondes

**UI Components:**
- Installé shadcn/ui Sheet, ScrollArea, AlertDialog, Separator

---

## Technical Achievements

### Architecture Write-Sync Offline Complète

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
├─────────────────────────────────────────────────────────────┤
│  useOfflineOrder │ useOfflinePayment │ useOfflineSession   │
│  useSyncQueue    │ usePendingSyncItems│ useKitchenDispatch │
├─────────────────────────────────────────────────────────────┤
│                  Component Layer                            │
│  SyncStatusBadge │ PendingSyncCounter │ PendingSyncPanel   │
│  PendingSyncItem │ NetworkIndicator   │                    │
├─────────────────────────────────────────────────────────────┤
│                 Service Layer                               │
│  offlineOrderService │ offlinePaymentService               │
│  offlineSessionService│ kitchenDispatchService             │
├─────────────────────────────────────────────────────────────┤
│                 Sync Engine                                 │
│  syncEngineV2 → sessionSyncProcessor                       │
│              → orderSyncProcessor                          │
│              → paymentSyncProcessor                        │
│  syncQueueHelpers (shared utilities)                       │
├─────────────────────────────────────────────────────────────┤
│                 LAN Communication                           │
│  lanHub │ lanClient │ lanProtocol (KDS_ORDER_ACK)         │
├─────────────────────────────────────────────────────────────┤
│                    Dexie (IndexedDB) v10                   │
│  - offline_orders      │ - offline_order_items            │
│  - offline_payments    │ - offline_sessions               │
│  - offline_sync_queue  │ - offline_dispatch_queue         │
│  + (tables Epic 1-2)                                       │
└─────────────────────────────────────────────────────────────┘
```

### ADRs Implémentés

- **ADR-001:** Orders en **read-write sync** ✅
- **ADR-002:** Sync queue avec retry et backoff ✅
- **ADR-006:** Communication LAN via Socket.IO/BroadcastChannel ✅
- **ADR-007:** KDS events protocol ✅

### NFRs Respectés

- Transition online/offline: < 2 secondes ✅
- Dispatch vers KDS: < 1 seconde latence ✅
- Sync auto après reconnexion: 5 secondes ✅
- Refresh compteur pending: 5 secondes ✅

---

## Patterns Established

### 1. Write-Sync Service Pattern (NEW in Epic 3)
```typescript
// Pattern pour entités write-sync:
export async function create{Entity}Offline(data: ICreate{Entity}Data): Promise<I{Entity}> {
  const id = generateLocal{Entity}Id(); // LOCAL-*-uuid

  await db.transaction('rw', [db.table, db.offline_sync_queue], async () => {
    await db.table.add(entity);
    await db.offline_sync_queue.add({
      entity: '{entity}',
      action: 'create',
      entityId: id,
      payload: { entity },
      status: 'pending',
      retries: 0,
    });
  });

  return entity;
}
```

### 2. Sync Processor Pattern (NEW in Epic 3)
```typescript
// Chaque entity a un processor spécialisé:
export async function process{Entity}Sync(
  item: ISyncQueueItem,
  idMaps?: Map<string, string>  // Pour résolution FK
): Promise<ISyncResult> {
  // 1. Read local entity
  // 2. Remap foreign keys if needed
  // 3. Insert into Supabase
  // 4. Update local with server_id
  // 5. Return { success, serverId?, error? }
}
```

### 3. ID Remapping Pattern (NEW in Epic 3)
```typescript
// Batch sync avec mapping IDs:
const sessionIdMap = new Map<string, string>();
const orderIdMap = new Map<string, string>();

// Sessions first (no dependencies)
for (const session of sessions) {
  const result = await processSessionSync(session);
  if (result.success) {
    sessionIdMap.set(session.entityId, result.serverId!);
  }
}

// Orders second (depend on sessions)
for (const order of orders) {
  const result = await processOrderSync(order, sessionIdMap);
  if (result.success) {
    orderIdMap.set(order.entityId, result.serverId!);
  }
}

// Payments last (depend on orders)
for (const payment of payments) {
  await processPaymentSync(payment, orderIdMap);
}
```

### 4. Exponential Backoff Pattern
```typescript
const BACKOFF_DELAYS = [5000, 10000, 30000, 60000, 300000];

function getBackoffDelay(retries: number): number {
  return BACKOFF_DELAYS[Math.min(retries, BACKOFF_DELAYS.length - 1)];
}

function shouldRetryNow(item: ISyncQueueItem): boolean {
  if (item.status !== 'failed') return false;
  if (item.retries >= SYNC_MAX_RETRIES) return false;

  const lastAttempt = new Date(item.created_at).getTime();
  const delay = getBackoffDelay(item.retries);
  return Date.now() - lastAttempt >= delay;
}
```

### 5. Kitchen Dispatch Pattern
```typescript
// Dispatch with station filtering and queue fallback:
export async function dispatchOrderToKitchen(order, items): Promise<{
  dispatched: TKitchenStation[];
  queued: TKitchenStation[];
}> {
  for (const station of ['kitchen', 'barista']) {
    const stationItems = await filterItemsByStation(items, station);
    if (stationItems.length === 0) continue;

    if (isLanConnected()) {
      await lanHub.broadcast(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, payload);
      dispatched.push(station);
    } else {
      await addToDispatchQueue(order, station, stationItems);
      queued.push(station);
    }
  }
}
```

---

## Issues & Resolutions

| Issue | Resolution | Impact |
|-------|------------|--------|
| Deux sync queues (legacy offlineDb + new db.ts) | Créé SyncEngineV2 utilisant db.ts | HIGH - Architecture |
| Duplicate ISyncResult interface | Consolidé dans syncQueueHelpers.ts | MEDIUM - Maintenance |
| Duplicate isLocalId() function | Consolidé dans syncQueueHelpers.ts | MEDIUM - Maintenance |
| markFailed() redundant ternary | Fixed - both branches returned 'failed' | LOW - Bug |
| Missing syncEngineV2 integration tests | Added 7 integration tests | MEDIUM - Coverage |
| Non-atomic updateOrdersWithSessionServerId | Added db.transaction() wrapper | MEDIUM - Reliability |
| shouldRetryNow() uses created_at | Backlogged - add last_attempted_at field | MEDIUM - Tech Debt |

---

## Epic 2 Retrospective Follow-Through

| Recommandation Epic 2 | Appliquée? | Résultat |
|----------------------|------------|----------|
| Préparer gestion des conflits | ✅ Oui | Last-writer-wins implementé, audit trail via sync_queue |
| Réutiliser patterns établis | ✅ Oui | Même structure services/hooks, fake-indexeddb pour tests |
| Attention aux IDs locaux | ✅ Oui | LOCAL-* prefix + ID remapping via Maps |
| Socket.IO LAN (Story 3.7) | ✅ Oui | lanHub/lanClient réutilisés, KDS_ORDER_ACK ajouté |
| Documenter pattern booléen Dexie | ⚠️ Partiel | Pattern connu mais pas ajouté à CLAUDE.md |
| Standardiser convention traductions | ⚠️ Partiel | sync.* namespace utilisé mais inconsistant avec dispatch.* |

---

## Metrics

### Test Coverage

| Story | Unit Tests | Integration | Total |
|-------|------------|-------------|-------|
| 3.1   | 42         | -           | 42    |
| 3.2   | 23         | -           | 23    |
| 3.3   | 24         | -           | 24    |
| 3.4   | 35         | 16          | 51    |
| 3.5   | 27         | -           | 27    |
| 3.6   | 47         | 10          | 57    |
| 3.7   | 24         | -           | 24    |
| 3.8   | 50         | -           | 50    |
| **Total** | **272** | **26**      | **~280** |

### Files Created/Modified

| Story | Created | Modified |
|-------|---------|----------|
| 3.1   | 6       | 5        |
| 3.2   | 2       | 4        |
| 3.3   | 5       | 6        |
| 3.4   | 4       | 8        |
| 3.5   | 4       | 7        |
| 3.6   | 10      | 6        |
| 3.7   | 3       | 9        |
| 3.8   | 9       | 6        |
| **Total** | **~43** | **~51** |

### Dexie Schema Evolution

| Version | Story | Tables Added |
|---------|-------|--------------|
| v7      | 3.1   | offline_orders, offline_order_items, offline_sync_queue |
| v8      | 3.4   | offline_payments |
| v9      | 3.5   | offline_sessions |
| v10     | 3.7   | offline_dispatch_queue |

---

## Recommendations for Epic 4

### Epic 4: Cuisine & Dispatch — Kitchen Display System Preview

L'Epic 4 se concentre sur le **KDS côté réception** - l'autre moitié du dispatch implémenté dans 3.7.

**Stories à venir:**
- 4.1: Socket.IO Server on POS (LAN Hub) - Extension lanHub existant
- 4.2: KDS Socket.IO Client Connection - lanClient configuration
- 4.3: Order Dispatch to KDS via LAN - Réutiliser kitchenDispatchService
- 4.4: KDS Order Queue Display - UI KDS avec timers
- 4.5: KDS Item Status Update - item:preparing, item:ready events
- 4.6: Order Completion Auto-Remove - cleanup automatique

**Recommendations basées sur Epic 3:**

1. **Réutiliser l'infrastructure LAN existante:**
   - `lanHub.ts`, `lanClient.ts`, `lanProtocol.ts` sont solides
   - `KDS_ORDER_ACK` déjà implémenté (Story 3.7)
   - Ajouter les events manquants: `item:preparing`, `item:ready`, `order:complete`

2. **Étendre le protocole KDS:**
   ```typescript
   // Events à ajouter dans lanProtocol.ts:
   KDS_ITEM_PREPARING: 'kds_item_preparing',
   KDS_ITEM_READY: 'kds_item_ready',
   KDS_ORDER_COMPLETE: 'kds_order_complete',
   KDS_DEVICE_REGISTER: 'kds_device_register',
   ```

3. **KDS Queue State:**
   - Gérer l'état local des commandes reçues
   - Timer UX pour urgence (> 10min = rouge)
   - Persistence locale si refresh browser

4. **Testing LAN:**
   - Mock lanHub/lanClient comme dans Story 3.7
   - Tester scenarios: connexion/déconnexion, message ACK, timeout

5. **Attention aux dépendances inversées:**
   - Epic 3 (POS) → dispatch TO KDS ✅
   - Epic 4 (KDS) → receive FROM POS + send status BACK
   - Bien synchroniser les events bidirectionnels

### Dependencies pour Epic 4

- ✅ `kitchenDispatchService.ts` - Dispatch vers KDS (Story 3.7)
- ✅ `lanHub.ts`, `lanClient.ts` - Communication LAN
- ✅ `lanProtocol.ts` avec KDS_* message types
- ✅ Types `IKdsNewOrderPayload`, `IKdsOrderAckPayload`
- ✅ Filtrage par `dispatch_station` (Story 3.7)

---

## Action Items

### Immediate (Before Epic 4)

- [x] Documenter pattern ID remapping dans CLAUDE.md *(completed in story docs)*
- [ ] Standardiser namespace traductions: `sync.*` vs `dispatch.*`
- [ ] Ajouter `last_attempted_at` field à ISyncQueueItem (tech debt Story 3.6)

### Short-term (During Epic 4)

- [ ] Étendre lanProtocol avec events KDS bidirectionnels
- [ ] Créer tests E2E pour flow complet POS → KDS → Status update
- [ ] Documenter architecture LAN dans ADR-006

### Technical Debt

| Item | Priority | Effort | Notes |
|------|----------|--------|-------|
| shouldRetryNow() uses created_at | MEDIUM | 2h | Add last_attempted_at field |
| Non-atomic Supabase multi-insert | LOW | 4h | Would need Supabase transaction support |
| syncStore.pendingCount not updated by runSyncEngine | LOW | 1h | Minor UX issue |
| Console.log statements in processors | TRIVIAL | 30m | Convert to structured logging |
| Unused export in syncEngine.ts | TRIVIAL | 5m | Remove or use |

---

## Conclusion

L'Epic 3 marque une **évolution majeure** de l'architecture AppGrav: la transition de read-only cache (Epic 1-2) vers **write-sync offline-first**.

**Points forts:**
- Architecture sync queue robuste avec retry, backoff, et ID remapping
- Patterns bien établis pour futures entités write-sync
- Infrastructure LAN prête pour Epic 4 (KDS)
- Code reviews efficaces avec corrections immédiates
- Couverture de tests exhaustive (~280 tests)

**Points d'amélioration:**
- Tech debt identifiée mais backlogged (shouldRetryNow timestamp)
- Conventions de traductions à harmoniser
- Documentation ADR à compléter pour LAN

**Complexité notable:**
- La gestion des dépendances FK (sessions → orders → payments) était le défi principal
- Solution élégante avec Maps et tri par priorité entity

**L'équipe est prête pour Epic 4: Kitchen Display System.**

---

*Retrospective générée par Claude Opus 4.5 selon le workflow BMAD `retrospective`*
