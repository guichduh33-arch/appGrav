# Story 4.3: Order Dispatch to KDS via LAN

Status: done

## Story

As a **Cuisinier**,
I want **recevoir les commandes du POS via le réseau local**,
so that **je peux travailler même sans internet**.

## Acceptance Criteria

### AC1: Réception d'événements `order:dispatch` par le KDS
**Given** le POS envoie une commande en cuisine
**When** l'event `KDS_NEW_ORDER` est émis via le hub LAN
**Then** le KDS reçoit les items filtrés par sa station
**And** la commande s'affiche en < 1 seconde (NFR-PERF-04)

### AC2: Filtrage par Station
**Given** la commande a plusieurs stations (kitchen, barista, display)
**When** elle est dispatchée
**Then** chaque KDS reçoit uniquement ses items correspondants
**And** les items avec `dispatch_station !== ma_station` sont ignorés

### AC3: Son de Notification
**Given** le KDS reçoit une nouvelle commande
**When** l'event `KDS_NEW_ORDER` est traité
**Then** un son de notification est joué (si activé)
**And** le compteur de commandes se met à jour

### AC4: Indicateur de Réception
**Given** une commande est reçue via LAN
**When** elle s'affiche dans la file
**Then** un badge "LAN" indique la source de l'ordre
**And** l'ordre s'insère dans la file par timestamp (FIFO)

### AC5: Fallback vers Supabase Realtime
**Given** le KDS n'est pas connecté au hub LAN
**When** une commande est créée
**Then** le KDS la reçoit via Supabase Realtime (fallback existant)
**And** aucune commande n'est perdue

## Tasks / Subtasks

- [x] **Task 1: Créer le hook useKdsOrderReceiver** (AC: 1, 3, 5)
  - [x] 1.1: Créer `src/hooks/kds/useKdsOrderReceiver.ts`
  - [x] 1.2: Écouter `LAN_MESSAGE_TYPES.KDS_NEW_ORDER` via lanClient.on()
  - [x] 1.3: Parser le payload `IKdsNewOrderPayload` et filtrer par station
  - [x] 1.4: Ajouter la commande à l'état local via callback
  - [x] 1.5: Jouer le son de notification si soundEnabled
  - [x] 1.6: Gérer le fallback Supabase Realtime existant

- [x] **Task 2: Intégrer useKdsOrderReceiver dans KDSMainPage** (AC: 1, 2, 3)
  - [x] 2.1: Importer et utiliser useKdsOrderReceiver
  - [x] 2.2: Connecter le receiver à l'état orders existant
  - [x] 2.3: S'assurer que le son fonctionne avec le toggle existant
  - [x] 2.4: Conserver la logique de fetch Supabase existante pour fallback

- [x] **Task 3: Filtrage des items par station** (AC: 2)
  - [x] 3.1: Implémenter le filtrage dans useKdsOrderReceiver
  - [x] 3.2: Comparer `payload.station` avec la station courante du KDS
  - [x] 3.3: Ignorer les ordres pour d'autres stations

- [x] **Task 4: Indicateur visuel de source LAN** (AC: 4)
  - [x] 4.1: Ajouter propriété `source: 'lan' | 'supabase' | 'pos'` aux ordres
  - [x] 4.2: Modifier KDSOrderCard pour afficher badge de source
  - [x] 4.3: Styler le badge "LAN" (icône Wifi + couleur)

- [x] **Task 5: Envoi d'ACK au hub** (AC: 1)
  - [x] 5.1: Envoyer `KDS_ORDER_ACK` au hub après réception
  - [x] 5.2: Inclure order_id et station dans l'ACK
  - [x] 5.3: Permettre au POS de savoir que le KDS a bien reçu

- [x] **Task 6: Tests unitaires** (AC: 1, 2, 3)
  - [x] 6.1: Créer `src/hooks/kds/__tests__/useKdsOrderReceiver.test.ts`
  - [x] 6.2: Tester réception de KDS_NEW_ORDER
  - [x] 6.3: Tester filtrage par station
  - [x] 6.4: Tester envoi d'ACK
  - [x] 6.5: Tester fallback vers Supabase

- [x] **Task 7: Traductions** (AC: 4)
  - [x] 7.1: Ajouter clés `kds.source.lan`, `kds.source.supabase` dans fr.json
  - [x] 7.2: Ajouter clés dans en.json
  - [x] 7.3: Ajouter clés dans id.json

## Dev Notes

### CRITICAL: Architecture LAN à Comprendre

**⚠️ Le dispatch POS → KDS existe déjà !** [Source: src/services/offline/kitchenDispatchService.ts]

Le POS dispatch les commandes via `dispatchOrderToKitchen()` qui utilise `lanHub.broadcast(KDS_NEW_ORDER, payload)`.

**Cette story concerne la RÉCEPTION côté KDS, PAS l'envoi.**

```
POS (Hub)                                    KDS (Client)
    │                                             │
    │──── KDS_NEW_ORDER (broadcast) ─────────────►│
    │                                             │
    │◄─── KDS_ORDER_ACK (sendTo hub) ────────────│
    │                                             │
```

### Architecture LAN [Source: architecture.md#ADR-006]

```
┌─────────────────────────────────────────────────────┐
│                  POS Principal (HUB)                 │
│                                                     │
│  lanHub.broadcast(KDS_NEW_ORDER, payload)          │
│                      │                              │
│                      ▼                              │
│  BroadcastChannel + Supabase Realtime              │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                  KDS (Client)                        │
│                                                     │
│  lanClient.on(KDS_NEW_ORDER, handler)              │
│                      │                              │
│                      ▼                              │
│  useKdsOrderReceiver → orders state                │
└─────────────────────────────────────────────────────┘
```

### Code Existant (CRITICAL - NE PAS DUPLIQUER)

**KDSMainPage.tsx** écoute déjà KDS_NEW_ORDER [Source: src/pages/kds/KDSMainPage.tsx:259-271]
```typescript
useEffect(() => {
    const unsubscribe = lanClient.on(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, () => {
        if (soundEnabled) playNotificationSound()
        fetchOrders() // Recharge depuis Supabase !
    })
    return () => unsubscribe()
}, [fetchOrders, soundEnabled])
```

**PROBLÈME:** Ce code recharge TOUTES les commandes depuis Supabase au lieu d'utiliser le payload LAN directement.

**SOLUTION:** Modifier pour utiliser le payload du message LAN et ajouter directement à l'état local.

### lanClient API [Source: src/services/lan/lanClient.ts]

```typescript
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES, ILanMessage } from '@/services/lan/lanProtocol';

// Écouter les messages
const unsubscribe = lanClient.on(LAN_MESSAGE_TYPES.KDS_NEW_ORDER, (message: ILanMessage<IKdsNewOrderPayload>) => {
  const payload = message.payload;
  console.log('New order:', payload.order_number, 'for station:', payload.station);
});

// Envoyer un ACK au hub
await lanClient.send(LAN_MESSAGE_TYPES.KDS_ORDER_ACK, {
  order_id: payload.order_id,
  station: currentStation,
  acknowledged_at: new Date().toISOString(),
});
```

### Payload KDS_NEW_ORDER [Source: src/types/offline.ts]

```typescript
interface IKdsNewOrderPayload {
  order_id: string;
  order_number: string;
  table_number: number | null;
  order_type: TOrderType;
  items: IKdsOrderItem[];
  station: TKitchenStation;
  timestamp: string;
}

interface IKdsOrderItem {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  modifiers: string[];
  notes: string | null;
  category_id: string;
}
```

### Hook useKdsOrderReceiver à Créer

```typescript
// src/hooks/kds/useKdsOrderReceiver.ts

import { useEffect, useCallback, useRef } from 'react';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES, ILanMessage } from '@/services/lan/lanProtocol';
import type { IKdsNewOrderPayload, TKitchenStation } from '@/types/offline';

interface UseKdsOrderReceiverOptions {
  station: TKitchenStation;
  soundEnabled: boolean;
  playSound: () => void;
  onNewOrder: (order: IKdsNewOrderPayload) => void;
}

export function useKdsOrderReceiver(options: UseKdsOrderReceiverOptions) {
  const { station, soundEnabled, playSound, onNewOrder } = options;
  const isConnectedRef = useRef(false);

  const handleNewOrder = useCallback((message: ILanMessage<IKdsNewOrderPayload>) => {
    const payload = message.payload;

    // Filtrage par station
    if (payload.station !== station && station !== 'all') {
      console.log(`[KDS] Ignoring order for ${payload.station}, we are ${station}`);
      return;
    }

    console.log(`[KDS] Received order ${payload.order_number} for ${payload.station}`);

    // Jouer le son
    if (soundEnabled) {
      playSound();
    }

    // Ajouter à l'état
    onNewOrder(payload);

    // Envoyer ACK au hub
    lanClient.send(LAN_MESSAGE_TYPES.KDS_ORDER_ACK, {
      order_id: payload.order_id,
      station,
      acknowledged_at: new Date().toISOString(),
    });
  }, [station, soundEnabled, playSound, onNewOrder]);

  useEffect(() => {
    // Subscribe to KDS_NEW_ORDER events
    const unsubscribe = lanClient.on(
      LAN_MESSAGE_TYPES.KDS_NEW_ORDER,
      handleNewOrder as (msg: ILanMessage) => void
    );

    isConnectedRef.current = true;
    console.log(`[KDS] Listening for orders on station: ${station}`);

    return () => {
      unsubscribe();
      isConnectedRef.current = false;
    };
  }, [handleNewOrder, station]);

  return {
    isListening: isConnectedRef.current,
  };
}
```

### Modification KDSMainPage

```typescript
// Ajouter dans KDSMainPage.tsx

import { useKdsOrderReceiver } from '@/hooks/kds/useKdsOrderReceiver';

export default function KDSMainPage() {
  const { station } = useParams<{ station: string }>();
  const stationConfig = station ? STATION_CONFIG[station] : null;

  // Callback pour ajouter un ordre reçu via LAN
  const handleLanOrder = useCallback((payload: IKdsNewOrderPayload) => {
    // Convertir le payload LAN en format Order local
    const newOrder: Order = {
      id: payload.order_id,
      order_number: payload.order_number,
      order_type: payload.order_type,
      table_name: payload.table_number?.toString(),
      items: payload.items.map(item => ({
        id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        modifiers: item.modifiers.join(', '),
        notes: item.notes || undefined,
        item_status: 'new' as const,
        dispatch_station: payload.station,
        is_held: false,
      })),
      created_at: payload.timestamp,
      status: 'preparing',
      source: 'lan', // Marquer la source
    };

    setOrders(prev => {
      // Éviter les doublons
      if (prev.some(o => o.id === newOrder.id)) {
        return prev;
      }
      // Insérer en respectant FIFO (plus ancien en premier)
      return [...prev, newOrder].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, []);

  // Hook pour recevoir les ordres via LAN
  useKdsOrderReceiver({
    station: stationConfig?.dbStation as TKitchenStation || 'kitchen',
    soundEnabled,
    playSound: playNotificationSound,
    onNewOrder: handleLanOrder,
  });

  // ... reste du composant (fetch Supabase maintenu comme fallback)
}
```

### KDSOrderCard avec Badge Source

```typescript
// Modification dans KDSOrderCard.tsx

interface KDSOrderCardProps {
  order: Order;
  // ... autres props
}

// Dans le rendu:
{order.source === 'lan' && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
    <Wifi size={12} />
    LAN
  </span>
)}
{order.source === 'mobile' && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
    <Smartphone size={12} />
    Mobile
  </span>
)}
```

### Fichiers à Créer

```
src/
├── hooks/
│   └── kds/
│       ├── useKdsOrderReceiver.ts      # NEW: Hook réception ordres LAN
│       ├── index.ts                    # NEW: Export
│       └── __tests__/
│           └── useKdsOrderReceiver.test.ts  # NEW: Tests
```

### Fichiers à Modifier

- `src/pages/kds/KDSMainPage.tsx` - Intégrer useKdsOrderReceiver, ajouter source aux ordres
- `src/components/kds/KDSOrderCard.tsx` - Afficher badge source
- `src/locales/fr.json` - Ajouter traductions source
- `src/locales/en.json` - Ajouter traductions
- `src/locales/id.json` - Ajouter traductions

### Traductions à Ajouter

```json
// fr.json
{
  "kds": {
    "source": {
      "lan": "LAN",
      "supabase": "Cloud",
      "pos": "POS",
      "mobile": "Mobile"
    },
    "orderReceived": "Nouvelle commande reçue",
    "ackSent": "Accusé de réception envoyé"
  }
}
```

```json
// en.json
{
  "kds": {
    "source": {
      "lan": "LAN",
      "supabase": "Cloud",
      "pos": "POS",
      "mobile": "Mobile"
    },
    "orderReceived": "New order received",
    "ackSent": "Acknowledgment sent"
  }
}
```

```json
// id.json
{
  "kds": {
    "source": {
      "lan": "LAN",
      "supabase": "Cloud",
      "pos": "POS",
      "mobile": "Mobile"
    },
    "orderReceived": "Pesanan baru diterima",
    "ackSent": "Pengakuan terkirim"
  }
}
```

### Business Rules (CRITICAL)

**Performance** [Source: PRD NFR-PERF-04]
- Latence réception LAN: < 1 seconde
- Le hook doit être optimisé pour ne pas re-render inutilement

**Station Types** [Source: src/pages/kds/KDSMainPage.tsx]
```typescript
const STATION_CONFIG = {
  hot_kitchen: { dbStation: 'kitchen' },
  barista: { dbStation: 'barista' },
  display: { dbStation: 'display' },
  waiter: { dbStation: 'all' }, // Reçoit TOUTES les commandes
};
```

**Filtrage Station**
- `station === payload.station` → Recevoir
- `station === 'all'` (waiter) → Recevoir TOUS les ordres
- `station !== payload.station` → Ignorer

**ACK Flow**
```
KDS reçoit KDS_NEW_ORDER
    │
    ├── Filter by station
    │
    ├── Add to local state
    │
    ├── Play sound (if enabled)
    │
    └── Send KDS_ORDER_ACK to hub
```

### Previous Story Intelligence [Source: 4-2-kds-socket-io-client-connection.md]

**Story 4.2 établit:**
- useLanClient hook pour connexion au hub
- lanClient.connect() automatique au démarrage KDS
- LanConnectionIndicator pour montrer statut

**Cette story dépend de 4.2:**
- Le KDS doit être connecté pour recevoir les ordres
- Si pas connecté, fallback vers Supabase Realtime existant

### Testing Strategy

**Test Cases pour useKdsOrderReceiver:**
1. Réception de KDS_NEW_ORDER avec bonne station → ordre ajouté
2. Réception de KDS_NEW_ORDER avec mauvaise station → ordre ignoré
3. Station "all" reçoit TOUS les ordres
4. ACK envoyé après réception
5. Son joué si soundEnabled=true
6. Doublons détectés et ignorés
7. Ordres triés par timestamp

### Anti-Patterns to AVOID

| ❌ Éviter | ✅ Faire |
|-----------|----------|
| Recharger tous les ordres depuis Supabase sur chaque event LAN | Utiliser le payload directement |
| Ignorer les doublons (même order_id) | Vérifier si ordre existe avant ajout |
| Ne pas envoyer d'ACK | Toujours envoyer KDS_ORDER_ACK |
| Oublier le filtrage par station | Filtrer selon station courante |
| Son bloquant | Son non-bloquant avec Web Audio API |

### Dependency on Previous Work

- ✅ `src/services/lan/lanClient.ts` - Client LAN (Story 3.7)
- ✅ `src/services/lan/lanHub.ts` - Hub LAN (Story 4.1)
- ✅ `src/services/lan/lanProtocol.ts` - Types et messages (Story 1.5)
- ✅ `src/services/offline/kitchenDispatchService.ts` - Dispatch POS→KDS (Story 3.7)
- ⏳ Story 4.2 - KDS Client Connection → DOIT être implémentée d'abord

### Epic 4 Context

Cette story est la **3ème** de l'Epic 4 (Cuisine & Dispatch - Kitchen Display System).

**Dépend de:**
- Story 4.1: Socket.IO Server on POS (LAN Hub) - done
- Story 4.2: KDS Socket.IO Client Connection - ready-for-dev

**Stories qui dépendent de celle-ci:**
- Story 4.4: KDS Order Queue Display → utilise les ordres reçus
- Story 4.5: KDS Item Status Update → modifie les ordres
- Story 4.6: Order Completion & Auto-Remove → complète les ordres

### Critical Implementation Notes

1. **Le dispatch existe déjà** - `kitchenDispatchService.ts` envoie déjà les ordres
2. **Cette story concerne la RÉCEPTION** - Côté KDS, pas côté POS
3. **Utiliser le payload directement** - Ne pas recharger depuis Supabase
4. **Filtrer par station** - Chaque KDS ne reçoit que ses items
5. **Envoyer un ACK** - Le POS doit savoir que le KDS a bien reçu
6. **Conserver le fallback Supabase** - Pour quand LAN est indisponible

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-4.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-006]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-007]
- [Source: _bmad-output/implementation-artifacts/4-1-socket-io-server-on-pos-lan-hub.md]
- [Source: _bmad-output/implementation-artifacts/4-2-kds-socket-io-client-connection.md]
- [Source: _bmad-output/implementation-artifacts/3-7-kitchen-dispatch-via-lan-offline.md]
- [Source: src/services/offline/kitchenDispatchService.ts]
- [Source: src/services/lan/lanClient.ts]
- [Source: src/pages/kds/KDSMainPage.tsx]
- [Source: src/types/offline.ts]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 16 tests unitaires passent (100% de couverture des cas spécifiés)
- Tests de régression: 841/847 tests passent (6 échecs pré-existants non liés à cette story)

### Completion Notes List

1. **Création du hook useKdsOrderReceiver** - Hook React complet avec:
   - Écoute des messages KDS_NEW_ORDER via lanClient.on()
   - Filtrage intelligent par station (supporte 'all' pour waiter)
   - Détection des doublons via existingOrderIds Set
   - Envoi automatique d'ACK au hub après réception
   - Gestion du son de notification selon soundEnabled
   - Utilisation de refs pour éviter les closures stales

2. **Intégration dans KDSMainPage** - Modifications:
   - Suppression de l'ancien useEffect qui utilisait lanClient.on directement
   - Ajout du callback handleLanOrder pour convertir IKdsNewOrderPayload → Order
   - Intégration de useKdsOrderReceiver avec tous les paramètres requis
   - Conservation du fallback Supabase Realtime pour la résilience

3. **Indicateur visuel LAN** - Badge vert avec icône Wifi:
   - Ajout de 'lan' au type source dans Order et KDSOrderCardProps
   - Import de l'icône Wifi de lucide-react
   - Styles CSS pour le badge LAN (.kds-order-card__source--lan)

4. **Traductions complètes** - 3 langues:
   - fr.json: section "kds" avec source.lan, orderReceived, ackSent
   - en.json: mêmes clés en anglais
   - id.json: mêmes clés en indonésien

5. **Tests unitaires complets** - 16 tests couvrant:
   - Subscription et unsubscription
   - Filtrage par station (kitchen, barista, all)
   - Envoi d'ACK avec station correcte
   - Notification sonore conditionnelle
   - Détection des doublons
   - Gestion des payloads invalides
   - Marquage source 'lan'

### File List

**Fichiers créés:**
- src/hooks/kds/useKdsOrderReceiver.ts
- src/hooks/kds/index.ts
- src/hooks/kds/__tests__/useKdsOrderReceiver.test.ts

**Fichiers modifiés:**
- src/pages/kds/KDSMainPage.tsx
- src/components/kds/KDSOrderCard.tsx
- src/components/kds/KDSOrderCard.css
- src/locales/fr.json
- src/locales/en.json
- src/locales/id.json
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

| Date | Changement | Fichiers |
|------|------------|----------|
| 2026-02-01 | Création du hook useKdsOrderReceiver pour réception LAN | src/hooks/kds/*.ts |
| 2026-02-01 | Intégration dans KDSMainPage avec callback handleLanOrder | src/pages/kds/KDSMainPage.tsx |
| 2026-02-01 | Ajout badge LAN dans KDSOrderCard avec icône Wifi | src/components/kds/KDSOrderCard.* |
| 2026-02-01 | Ajout traductions KDS source dans 3 langues | src/locales/*.json |
| 2026-02-01 | Tests unitaires complets (16 tests passants) | src/hooks/kds/__tests__/*.ts |
| 2026-02-02 | Code review passé - Tous ACs validés, 0 issues critiques | - |
