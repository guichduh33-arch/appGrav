# Story 4.4: KDS Order Queue Display

Status: ready-for-dev

## Story

As a **Cuisinier**,
I want **voir les commandes organisées par priorité**,
so that **je traite les plus urgentes en premier**.

## Acceptance Criteria

### AC1: Tri FIFO par Temps d'Attente
**Given** plusieurs commandes sont en attente
**When** je regarde l'écran KDS
**Then** elles sont triées par temps d'attente (plus ancien en premier)
**And** les nouvelles commandes apparaissent en bas de la file

### AC2: Timer de Temps Écoulé
**Given** une commande est affichée
**When** le timer se met à jour chaque seconde
**Then** je vois le temps écoulé depuis la création (MM:SS)
**And** la couleur du timer change selon l'urgence

### AC3: Indicateur Visuel d'Urgence (> 10 min)
**Given** une commande dépasse 10 minutes
**When** le timer atteint le seuil
**Then** la carte devient rouge/urgente visuellement
**And** une animation pulse attire l'attention

### AC4: Section Urgente en Haut (Enhancement)
**Given** plusieurs commandes sont en attente
**When** certaines dépassent 10 minutes
**Then** les commandes urgentes sont regroupées en haut de l'écran
**And** elles sont visuellement distinctes des autres

### AC5: Intégration avec Ordres LAN
**Given** le KDS reçoit des ordres via LAN (Story 4.3)
**When** un ordre est ajouté à l'état local
**Then** il s'insère correctement dans la file triée
**And** le timer démarre immédiatement

## Analysis: État Actuel de l'Implémentation

### ✅ DÉJÀ IMPLÉMENTÉ

**1. Tri FIFO (AC1)**
```typescript
// KDSMainPage.tsx:132
.order('created_at', { ascending: true })
```
Les ordres sont triés par `created_at` croissant (plus ancien en premier).

**2. Timer Temps Écoulé (AC2)**
```typescript
// KDSOrderCard.tsx:54-76
const [elapsedTime, setElapsedTime] = useState(0)

useEffect(() => {
    const startTime = new Date(createdAt).getTime()
    const updateElapsed = () => {
        const now = Date.now()
        setElapsedTime(Math.floor((now - startTime) / 1000))
    }
    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
}, [createdAt])

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

**3. Niveaux d'Urgence (AC3)**
```typescript
// KDSOrderCard.tsx:79-83
const getUrgencyLevel = () => {
    if (elapsedTime > 600) return 'critical' // > 10 min
    if (elapsedTime > 300) return 'warning'  // > 5 min
    return 'normal'
}
```

**4. Styles CSS pour Urgence**
```css
/* KDSOrderCard.css:36-50 */
.kds-order-card--critical {
    box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
    animation: pulse-critical 1s infinite;
}

.kds-order-card__timer--critical {
    color: #EF4444;
    background: rgba(239, 68, 68, 0.2);
}
```

**5. Stats dans le Header**
```typescript
// KDSMainPage.tsx:408-411
<span className="kds-header__stat kds-header__stat--new">{newOrders.length} New</span>
<span className="kds-header__stat kds-header__stat--preparing">{preparingOrders.length} Prep</span>
<span className="kds-header__stat kds-header__stat--ready">{readyOrders.length} Ready</span>
```

### ⚠️ À AMÉLIORER

**1. Intégration LAN (AC5)**
- Actuellement, le KDS reload depuis Supabase quand il reçoit un event LAN
- Story 4.3 ajoute `useKdsOrderReceiver` pour utiliser le payload directement
- Cette story doit s'assurer que les ordres LAN s'intègrent bien dans la file

**2. Section Urgente en Haut (AC4)**
- Amélioration UX: regrouper les ordres critiques (> 10 min) en haut
- Permet de visualiser rapidement les priorités

**3. Compteur d'Ordres Urgents**
- Ajouter un compteur "X Urgent" dans le header
- Notification visuelle pour les ordres critiques

## Tasks / Subtasks

- [ ] **Task 1: Créer le hook useKdsOrderQueue pour gestion état local** (AC: 1, 5)
  - [ ] 1.1: Créer `src/hooks/kds/useKdsOrderQueue.ts`
  - [ ] 1.2: Gérer l'état local des ordres (ajout, mise à jour, suppression)
  - [ ] 1.3: Implémenter tri FIFO automatique à chaque modification
  - [ ] 1.4: Exposer méthodes `addOrder`, `updateOrder`, `removeOrder`
  - [ ] 1.5: Intégrer avec `useKdsOrderReceiver` (Story 4.3)

- [ ] **Task 2: Implémenter la section urgente en haut** (AC: 4)
  - [ ] 2.1: Modifier KDSMainPage pour séparer ordres urgents vs normaux
  - [ ] 2.2: Créer section visuelle distincte pour ordres > 10 min
  - [ ] 2.3: Ajouter un titre "URGENT" avec compteur
  - [ ] 2.4: Style distinct pour la section urgente

- [ ] **Task 3: Ajouter compteur urgent dans le header** (AC: 3, 4)
  - [ ] 3.1: Calculer le nombre d'ordres > 10 min
  - [ ] 3.2: Afficher badge "X Urgent" dans le header
  - [ ] 3.3: Animer le badge si ordres urgents

- [ ] **Task 4: Améliorer la transition des ordres entre sections** (AC: 4)
  - [ ] 4.1: Animation smooth quand un ordre devient urgent
  - [ ] 4.2: Notification sonore optionnelle quand ordre devient urgent
  - [ ] 4.3: Persist section dans localStorage pour éviter layout shift

- [ ] **Task 5: Intégration avec ordres LAN (Story 4.3)** (AC: 5)
  - [ ] 5.1: S'assurer que `handleLanOrder` de Story 4.3 fonctionne avec useKdsOrderQueue
  - [ ] 5.2: Tester l'insertion correcte dans la file triée
  - [ ] 5.3: Vérifier que le timer démarre immédiatement

- [ ] **Task 6: Tests unitaires** (AC: 1, 4, 5)
  - [ ] 6.1: Créer `src/hooks/kds/__tests__/useKdsOrderQueue.test.ts`
  - [ ] 6.2: Tester tri FIFO
  - [ ] 6.3: Tester séparation urgent/normal
  - [ ] 6.4: Tester ajout d'ordre LAN

- [ ] **Task 7: Traductions** (AC: 4)
  - [ ] 7.1: Ajouter clés `kds.urgent.*` dans fr.json
  - [ ] 7.2: Ajouter clés dans en.json
  - [ ] 7.3: Ajouter clés dans id.json

## Dev Notes

### CRITICAL: Code Existant à Préserver

**⚠️ L'implémentation KDS fonctionne déjà !** [Source: src/pages/kds/KDSMainPage.tsx]

Le composant KDSMainPage a déjà:
- Tri FIFO via `order('created_at', { ascending: true })`
- Timer avec urgence (normal/warning/critical)
- Styles CSS pour les niveaux d'urgence
- Stats dans le header

**NE PAS casser le code existant !** Cette story ajoute des améliorations.

### Architecture Proposée

```
┌─────────────────────────────────────────────────────┐
│                  KDSMainPage                         │
│                                                     │
│  useKdsOrderQueue (gestion état local)              │
│         │                                           │
│         ├── useKdsOrderReceiver (Story 4.3)         │
│         │                                           │
│         └── useLanClient (Story 4.2)                │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │        SECTION URGENTE (> 10 min)            │   │
│  │  [Order #42 - 12:34] [Order #39 - 15:02]    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           SECTION NORMALE                     │   │
│  │  [Order #45 - 2:15] [Order #46 - 1:03]      │   │
│  │  [Order #47 - 0:32]                          │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Hook useKdsOrderQueue

```typescript
// src/hooks/kds/useKdsOrderQueue.ts

import { useState, useCallback, useMemo } from 'react';
import type { Order } from '@/pages/kds/KDSMainPage';

interface UseKdsOrderQueueOptions {
  urgentThresholdSeconds?: number; // Default: 600 (10 min)
}

interface UseKdsOrderQueueResult {
  orders: Order[];
  urgentOrders: Order[];
  normalOrders: Order[];
  urgentCount: number;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  setOrders: (orders: Order[]) => void;
}

export function useKdsOrderQueue(
  options: UseKdsOrderQueueOptions = {}
): UseKdsOrderQueueResult {
  const { urgentThresholdSeconds = 600 } = options;

  const [orders, setOrdersState] = useState<Order[]>([]);

  // Sort orders by created_at (FIFO)
  const sortOrders = useCallback((orderList: Order[]): Order[] => {
    return [...orderList].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, []);

  const setOrders = useCallback((newOrders: Order[]) => {
    setOrdersState(sortOrders(newOrders));
  }, [sortOrders]);

  const addOrder = useCallback((order: Order) => {
    setOrdersState(prev => {
      // Check for duplicates
      if (prev.some(o => o.id === order.id)) {
        return prev;
      }
      return sortOrders([...prev, order]);
    });
  }, [sortOrders]);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrdersState(prev =>
      prev.map(o => o.id === orderId ? { ...o, ...updates } : o)
    );
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrdersState(prev => prev.filter(o => o.id !== orderId));
  }, []);

  // Separate urgent vs normal orders
  const { urgentOrders, normalOrders } = useMemo(() => {
    const now = Date.now();
    const urgent: Order[] = [];
    const normal: Order[] = [];

    for (const order of orders) {
      const elapsed = (now - new Date(order.created_at).getTime()) / 1000;
      if (elapsed > urgentThresholdSeconds) {
        urgent.push(order);
      } else {
        normal.push(order);
      }
    }

    return { urgentOrders: urgent, normalOrders: normal };
  }, [orders, urgentThresholdSeconds]);

  return {
    orders,
    urgentOrders,
    normalOrders,
    urgentCount: urgentOrders.length,
    addOrder,
    updateOrder,
    removeOrder,
    setOrders,
  };
}
```

### Section Urgente dans KDSMainPage

```typescript
// Modification de KDSMainPage.tsx

import { useKdsOrderQueue } from '@/hooks/kds/useKdsOrderQueue';

export default function KDSMainPage() {
  // ... existing code ...

  const {
    orders,
    urgentOrders,
    normalOrders,
    urgentCount,
    setOrders,
    addOrder,
  } = useKdsOrderQueue({ urgentThresholdSeconds: 600 });

  // Fetch orders and set via hook
  const fetchOrders = useCallback(async () => {
    // ... fetch logic ...
    setOrders(transformedOrders);
  }, [setOrders, ...]);

  // Handle LAN order (from Story 4.3)
  const handleLanOrder = useCallback((payload: IKdsNewOrderPayload) => {
    const newOrder = convertPayloadToOrder(payload);
    addOrder(newOrder);
  }, [addOrder]);

  return (
    <div className="kds-app">
      {/* Header with urgent count */}
      <header className="kds-header">
        {/* ... */}
        <div className="kds-header__stats">
          {urgentCount > 0 && (
            <span className="kds-header__stat kds-header__stat--urgent">
              ⚠️ {urgentCount} Urgent
            </span>
          )}
          {/* ... other stats ... */}
        </div>
      </header>

      <main className="kds-main">
        {/* Urgent Section */}
        {urgentOrders.length > 0 && (
          <div className="kds-section kds-section--urgent">
            <h2 className="kds-section__title">
              <AlertTriangle size={20} />
              URGENT ({urgentOrders.length})
            </h2>
            <div className="kds-orders-grid">
              {urgentOrders.map(order => (
                <KDSOrderCard key={order.id} {...orderProps} />
              ))}
            </div>
          </div>
        )}

        {/* Normal Section */}
        <div className="kds-section kds-section--normal">
          <h2 className="kds-section__title">
            En Attente ({normalOrders.length})
          </h2>
          <div className="kds-orders-grid">
            {normalOrders.map(order => (
              <KDSOrderCard key={order.id} {...orderProps} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Styles pour Section Urgente

```css
/* Ajouter dans KDSMainPage.css */

.kds-section {
  margin-bottom: 24px;
}

.kds-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  padding: 8px 16px;
  border-radius: 8px;
}

.kds-section--urgent {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid #EF4444;
  border-radius: 12px;
  padding: 16px;
}

.kds-section--urgent .kds-section__title {
  color: #EF4444;
  background: rgba(239, 68, 68, 0.2);
}

.kds-header__stat--urgent {
  background: #EF4444;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
  animation: pulse-urgent 1s infinite;
}

@keyframes pulse-urgent {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Fichiers à Créer

```
src/
├── hooks/
│   └── kds/
│       ├── useKdsOrderQueue.ts           # NEW: Gestion état local ordres
│       ├── index.ts                      # UPDATE: Export
│       └── __tests__/
│           └── useKdsOrderQueue.test.ts  # NEW: Tests
```

### Fichiers à Modifier

- `src/pages/kds/KDSMainPage.tsx` - Intégrer useKdsOrderQueue, ajouter section urgente
- `src/pages/kds/KDSMainPage.css` - Styles section urgente
- `src/locales/fr.json` - Traductions urgent
- `src/locales/en.json` - Traductions
- `src/locales/id.json` - Traductions

### Traductions à Ajouter

```json
// fr.json
{
  "kds": {
    "urgent": {
      "title": "URGENT",
      "count": "{{count}} commande(s) urgente(s)",
      "threshold": "Temps critique atteint"
    },
    "waiting": {
      "title": "En Attente",
      "count": "{{count}} commande(s)"
    },
    "empty": {
      "title": "Aucune commande",
      "subtitle": "En attente de nouvelles commandes..."
    }
  }
}
```

```json
// en.json
{
  "kds": {
    "urgent": {
      "title": "URGENT",
      "count": "{{count}} urgent order(s)",
      "threshold": "Critical time reached"
    },
    "waiting": {
      "title": "Waiting",
      "count": "{{count}} order(s)"
    },
    "empty": {
      "title": "No Orders",
      "subtitle": "Waiting for new orders..."
    }
  }
}
```

```json
// id.json
{
  "kds": {
    "urgent": {
      "title": "MENDESAK",
      "count": "{{count}} pesanan mendesak",
      "threshold": "Waktu kritis tercapai"
    },
    "waiting": {
      "title": "Menunggu",
      "count": "{{count}} pesanan"
    },
    "empty": {
      "title": "Tidak Ada Pesanan",
      "subtitle": "Menunggu pesanan baru..."
    }
  }
}
```

### Business Rules (CRITICAL)

**Seuils de Temps** [Source: epic-list.md#Story-4.4]
- Normal: < 5 minutes (vert)
- Warning: 5-10 minutes (jaune)
- Critical/Urgent: > 10 minutes (rouge)

**Tri FIFO**
- Les ordres sont TOUJOURS triés par `created_at` croissant
- Le plus ancien est en premier (plus prioritaire)
- Les nouveaux ordres arrivent en bas

**Section Urgente**
- Commandes > 10 min regroupées en haut
- Section visible uniquement si au moins 1 ordre urgent
- Animation pulse pour attirer l'attention

### Previous Story Intelligence

**Story 4.3 (Order Dispatch to KDS via LAN):**
- Crée `useKdsOrderReceiver` pour recevoir ordres LAN
- Callback `onNewOrder` qui appelle `addOrder`
- Cette story doit s'assurer que `addOrder` insère correctement

**Story 4.2 (KDS Client Connection):**
- `useLanClient` pour connexion au hub
- Connexion doit être établie avant réception

### Testing Strategy

**Test Cases pour useKdsOrderQueue:**
1. `setOrders` - trie correctement par created_at
2. `addOrder` - insère au bon endroit dans la file
3. `addOrder` - détecte les doublons
4. `removeOrder` - supprime correctement
5. `urgentOrders` - filtre les > 10 min
6. `normalOrders` - filtre les < 10 min
7. Mise à jour dynamique quand ordre devient urgent

### Anti-Patterns to AVOID

| ❌ Éviter | ✅ Faire |
|-----------|----------|
| Re-trier à chaque render | Trier seulement quand orders change |
| Calculer urgence dans le render | Memoiser avec useMemo |
| Recharger depuis Supabase pour ordres LAN | Utiliser état local |
| Ignorer les doublons | Vérifier avant ajout |
| Casser le code existant | Améliorer progressivement |

### Dependency on Previous Work

- ✅ `src/pages/kds/KDSMainPage.tsx` - Page KDS existante
- ✅ `src/components/kds/KDSOrderCard.tsx` - Carte ordre avec timer
- ✅ `src/components/kds/KDSOrderCard.css` - Styles urgence
- ⏳ Story 4.3 - Order Dispatch to KDS via LAN → fournit les ordres LAN

### Epic 4 Context

Cette story est la **4ème** de l'Epic 4 (Cuisine & Dispatch - Kitchen Display System).

**Dépend de:**
- Story 4.1: Socket.IO Server on POS (LAN Hub) - done
- Story 4.2: KDS Socket.IO Client Connection - ready-for-dev
- Story 4.3: Order Dispatch to KDS via LAN - ready-for-dev

**Stories qui dépendent de celle-ci:**
- Story 4.5: KDS Item Status Update → modifie les ordres dans la queue
- Story 4.6: Order Completion & Auto-Remove → retire les ordres de la queue

### Critical Implementation Notes

1. **Le timer existe déjà** - KDSOrderCard calcule elapsedTime chaque seconde
2. **L'urgence existe déjà** - getUrgencyLevel() avec seuils 5/10 min
3. **Cette story ajoute** - Section urgente séparée + hook gestion état
4. **NE PAS casser** - Le code existant fonctionne, améliorer seulement
5. **Intégrer avec 4.3** - Le hook useKdsOrderReceiver appelle addOrder

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-4.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-006]
- [Source: _bmad-output/implementation-artifacts/4-3-order-dispatch-to-kds-via-lan.md]
- [Source: src/pages/kds/KDSMainPage.tsx]
- [Source: src/components/kds/KDSOrderCard.tsx]
- [Source: src/components/kds/KDSOrderCard.css]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
