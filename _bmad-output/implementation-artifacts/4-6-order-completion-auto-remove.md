# Story 4.6: Order Completion & Auto-Remove

Status: done

## Story

As a **Cuisinier**,
I want **que la commande disparaisse quand tous les items sont prêts**,
so that **l'écran reste propre**.

## Acceptance Criteria

### AC1: Détection de Complétion
**Given** tous les items d'une commande sont marqués "prêt" (item_status: 'ready')
**When** le dernier item est complété
**Then** la commande est détectée comme "complétée"
**And** un indicateur visuel de complétion s'affiche

### AC2: Délai de Vérification (5 secondes)
**Given** une commande est détectée comme complétée
**When** la transition se produit
**Then** la commande reste visible 5 secondes (pour vérification)
**And** un countdown visuel indique le temps restant
**And** une action "Annuler" permet de bloquer l'auto-remove

### AC3: Auto-Remove de l'Écran
**Given** le délai de 5 secondes est écoulé
**When** aucune action d'annulation n'a été effectuée
**Then** la commande disparaît automatiquement de l'écran KDS
**And** l'animation de sortie est fluide (fade-out + slide-up)

### AC4: Notification au POS
**Given** une commande est complétée et disparaît
**When** l'auto-remove se produit
**Then** l'event `ORDER_COMPLETE` est envoyé au POS via LAN
**And** le serveur (app mobile) est notifié si applicable

### AC5: Mise à Jour Supabase
**Given** une commande est complétée
**When** l'auto-remove se déclenche
**Then** le statut de la commande passe à 'ready' dans Supabase
**And** tous les items ont item_status: 'ready'
**And** completed_at timestamp est enregistré

### AC6: Station Waiter (Exception)
**Given** le KDS est en mode "waiter" (station: all)
**When** une commande devient ready
**Then** elle reste visible jusqu'à ce que le serveur clique "Served"
**And** l'auto-remove ne s'applique PAS aux stations waiter

## Analysis: État Actuel de l'Implémentation

### DÉJÀ IMPLÉMENTÉ

**1. Filtrage des commandes "ready" dans la query**
```typescript
// KDSMainPage.tsx:194
.in('status', ['new', 'preparing', 'ready'])
```
Les commandes 'served' sont déjà exclues de l'affichage.

**2. Statuts Item Complets**
```typescript
// KDSOrderCard.tsx:11
item_status: 'new' | 'preparing' | 'ready' | 'served'
```

**3. Logique getOverallStatus**
```typescript
// KDSOrderCard.tsx:91-96
const getOverallStatus = () => {
  if (stationItems.every(i => i.item_status === 'served')) return 'served'
  if (stationItems.every(i => ['ready', 'served'].includes(i.item_status))) return 'ready'
  if (stationItems.some(i => i.item_status === 'preparing')) return 'preparing'
  return 'new'
}
```

**4. Event LAN ORDER_COMPLETE Défini**
```typescript
// lanProtocol.ts:34
ORDER_COMPLETE: 'order_complete',
```

**5. Bouton "Served" pour Waiter Station**
```typescript
// KDSOrderCard.tsx:232-240
{overallStatus === 'ready' && stationId === 'waiter' && (
  <button onClick={handleMarkServed}>Served</button>
)}
```

### MANQUANT

**1. Auto-remove timer après complétion**
- Pas de setTimeout/useEffect pour le countdown 5 secondes
- Pas d'animation de sortie quand tous items sont ready

**2. Indicateur visuel de countdown**
- Pas de barre de progression ou timer visible
- Pas de bouton "Annuler l'auto-remove"

**3. Envoi de l'event ORDER_COMPLETE via LAN**
- Le type existe mais n'est jamais envoyé
- Pas de payload IOrderCompletePayload défini

**4. Distinction station waiter**
- L'auto-remove ne doit PAS s'appliquer aux waiter stations
- Le waiter doit manuellement cliquer "Served"

## Tasks / Subtasks

- [x] **Task 1: Créer le hook useOrderAutoRemove** (AC: 1, 2, 3, 6)
  - [x] 1.1: Créer `src/hooks/kds/useOrderAutoRemove.ts`
  - [x] 1.2: Détecter quand tous les items sont 'ready'
  - [x] 1.3: Démarrer countdown de 5 secondes
  - [x] 1.4: Exposer `timeRemaining` et `cancelAutoRemove`
  - [x] 1.5: Ignorer si station === 'waiter'

- [x] **Task 2: Implémenter l'animation de sortie** (AC: 3)
  - [x] 2.1: Ajouter classe CSS `.kds-order-card--exiting`
  - [x] 2.2: Implémenter fade-out + slide-up animation
  - [x] 2.3: Durée animation: 300ms
  - [x] 2.4: Appeler onRemove après animation

- [x] **Task 3: Ajouter l'indicateur de countdown** (AC: 2)
  - [x] 3.1: Créer composant `KDSCountdownBar`
  - [x] 3.2: Afficher barre de progression décroissante (5s → 0s)
  - [x] 3.3: Bouton "Annuler" intégré
  - [x] 3.4: Style distinctif (couleur verte/dorée)

- [x] **Task 4: Intégrer dans KDSOrderCard** (AC: 1, 2, 3)
  - [x] 4.1: Utiliser useOrderAutoRemove dans KDSOrderCard
  - [x] 4.2: Afficher KDSCountdownBar quand countdown actif
  - [x] 4.3: Appliquer classe --exiting à la fin du countdown
  - [x] 4.4: Appeler onOrderComplete après animation

- [x] **Task 5: Créer le service orderCompletionService** (AC: 4, 5)
  - [x] 5.1: Créer `src/services/kds/orderCompletionService.ts`
  - [x] 5.2: Implémenter `completeOrder(orderId, orderNumber)`
  - [x] 5.3: Envoyer `ORDER_COMPLETE` via LAN
  - [x] 5.4: Mettre à jour Supabase (order.status, completed_at)

- [x] **Task 6: Ajouter les types LAN** (AC: 4)
  - [x] 6.1: Créer interface `IOrderCompletePayload` dans lanProtocol.ts
  - [x] 6.2: Ajouter station et completed_at au payload
  - [x] 6.3: Documenter l'event pour les autres devices

- [x] **Task 7: Modifier KDSMainPage** (AC: 1, 2, 3, 6)
  - [x] 7.1: Ajouter callback `handleOrderComplete`
  - [x] 7.2: Retirer l'ordre de l'état local après animation
  - [x] 7.3: Ne pas appliquer auto-remove pour waiter station
  - [x] 7.4: Conserver le bouton "Served" pour waiter

- [x] **Task 8: Tests unitaires** (AC: 1, 2, 3, 4, 5, 6)
  - [x] 8.1: Créer `src/hooks/kds/__tests__/useOrderAutoRemove.test.ts`
  - [x] 8.2: Tester déclenchement countdown quand tous ready
  - [x] 8.3: Tester cancelAutoRemove bloque la suppression
  - [x] 8.4: Tester non-déclenchement pour waiter station
  - [x] 8.5: Créer `src/services/kds/__tests__/orderCompletionService.test.ts`

- [x] **Task 9: Traductions** (AC: 2)
  - [x] 9.1: Ajouter clés `kds.autoRemove.*` dans fr.json
  - [x] 9.2: Ajouter clés dans en.json
  - [x] 9.3: Ajouter clés dans id.json

## Dev Notes

### CRITICAL: Architecture Auto-Remove

**Flow Complet:**
```
KDS Station
│
├── 1. Cuisinier marque dernier item "Ready"
│
├── 2. useOrderAutoRemove détecte: tous items ready
│
├── 3. Countdown 5s démarre (KDSCountdownBar visible)
│       │
│       └── [Annuler?] → Countdown annulé, carte reste
│
├── 4. 5s écoulées → Animation sortie (.kds-order-card--exiting)
│
├── 5. orderCompletionService.completeOrder()
│       ├── Supabase: order.status = 'ready', completed_at
│       └── LAN: ORDER_COMPLETE broadcast
│
└── 6. Ordre retiré de l'état local → Disparition UI
```

### Hook useOrderAutoRemove

```typescript
// src/hooks/kds/useOrderAutoRemove.ts

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOrderAutoRemoveOptions {
  orderId: string;
  allItemsReady: boolean;
  isWaiterStation: boolean;
  autoRemoveDelay?: number; // Default: 5000ms
  onComplete: () => void;
}

interface UseOrderAutoRemoveResult {
  isCountingDown: boolean;
  timeRemaining: number;
  cancelAutoRemove: () => void;
  isExiting: boolean;
}

export function useOrderAutoRemove(
  options: UseOrderAutoRemoveOptions
): UseOrderAutoRemoveResult {
  const {
    orderId,
    allItemsReady,
    isWaiterStation,
    autoRemoveDelay = 5000,
    onComplete
  } = options;

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(autoRemoveDelay / 1000);
  const [isExiting, setIsExiting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const cancelAutoRemove = useCallback(() => {
    setIsCancelled(true);
    setIsCountingDown(false);
    setTimeRemaining(autoRemoveDelay / 1000);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [autoRemoveDelay]);

  useEffect(() => {
    if (isWaiterStation) return;
    if (isCancelled) return;

    if (allItemsReady && !isCountingDown && !isExiting) {
      setIsCountingDown(true);
      setTimeRemaining(autoRemoveDelay / 1000);

      countdownRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);

      timerRef.current = setTimeout(() => {
        setIsCountingDown(false);
        setIsExiting(true);

        setTimeout(() => {
          onComplete();
        }, 300);
      }, autoRemoveDelay);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [allItemsReady, isWaiterStation, isCountingDown, isExiting, isCancelled, autoRemoveDelay, onComplete]);

  useEffect(() => {
    if (!allItemsReady) {
      setIsCancelled(false);
    }
  }, [allItemsReady]);

  return {
    isCountingDown,
    timeRemaining,
    cancelAutoRemove,
    isExiting,
  };
}
```

### Composant KDSCountdownBar

```typescript
// src/components/kds/KDSCountdownBar.tsx

import React from 'react';
import { X, Clock } from 'lucide-react';
import './KDSCountdownBar.css';

interface KDSCountdownBarProps {
  timeRemaining: number;
  totalTime: number;
  onCancel: () => void;
}

export function KDSCountdownBar({
  timeRemaining,
  totalTime,
  onCancel
}: KDSCountdownBarProps) {
  const progressPercent = (timeRemaining / totalTime) * 100;

  return (
    <div className="kds-countdown-bar">
      <div className="kds-countdown-bar__content">
        <Clock size={16} className="kds-countdown-bar__icon" />
        <span className="kds-countdown-bar__text">
          Auto-remove dans {timeRemaining}s
        </span>
        <button
          className="kds-countdown-bar__cancel"
          onClick={onCancel}
          aria-label="Annuler l'auto-remove"
        >
          <X size={16} />
          Garder
        </button>
      </div>
      <div className="kds-countdown-bar__progress">
        <div
          className="kds-countdown-bar__fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
```

### Styles KDSCountdownBar

```css
/* src/components/kds/KDSCountdownBar.css */

.kds-countdown-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(16, 185, 129, 0.95);
  border-radius: 0 0 12px 12px;
  padding: 8px 12px;
  z-index: 10;
}

.kds-countdown-bar__content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.kds-countdown-bar__icon {
  animation: pulse 1s infinite;
}

.kds-countdown-bar__text {
  flex: 1;
}

.kds-countdown-bar__cancel {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.kds-countdown-bar__cancel:hover {
  background: rgba(255, 255, 255, 0.3);
}

.kds-countdown-bar__progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.kds-countdown-bar__fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 1s linear;
}
```

### Animation de Sortie CSS

```css
/* Ajouter dans KDSOrderCard.css */

.kds-order-card--exiting {
  animation: card-exit 300ms ease-out forwards;
}

@keyframes card-exit {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
}

.kds-order-card--countdown {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  border-color: #10B981;
}
```

### Service orderCompletionService

```typescript
// src/services/kds/orderCompletionService.ts

import { supabase } from '@/lib/supabase';
import { lanClient } from '@/services/lan/lanClient';
import { LAN_MESSAGE_TYPES } from '@/services/lan/lanProtocol';
import type { TKitchenStation } from '@/types/offline';

interface IOrderCompleteResult {
  success: boolean;
  lanSent: boolean;
  error?: string;
}

export async function completeOrder(
  orderId: string,
  orderNumber: string,
  station: TKitchenStation
): Promise<IOrderCompleteResult> {
  const completedAt = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'ready',
        completed_at: completedAt
      })
      .eq('id', orderId);

    if (error) {
      return { success: false, lanSent: false, error: error.message };
    }

    let lanSent = false;
    if (lanClient.isActive()) {
      await lanClient.send(LAN_MESSAGE_TYPES.ORDER_COMPLETE, {
        order_id: orderId,
        order_number: orderNumber,
        station,
        completed_at: completedAt,
        timestamp: completedAt,
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

### Payload ORDER_COMPLETE

```typescript
// Ajouter dans src/services/lan/lanProtocol.ts

export interface IOrderCompletePayload {
  order_id: string;
  order_number: string;
  station: TKitchenStation;
  completed_at: string;
  timestamp: string;
}
```

### Modification KDSOrderCard

```typescript
// Modifications dans KDSOrderCard.tsx

import { useOrderAutoRemove } from '@/hooks/kds/useOrderAutoRemove';
import { KDSCountdownBar } from './KDSCountdownBar';

interface KDSOrderCardProps {
  // ... existing props ...
  onOrderComplete: (orderId: string) => void;
  stationId: string;
}

export function KDSOrderCard({
  orderId,
  orderNumber,
  items,
  onOrderComplete,
  stationId,
  // ... other props
}: KDSOrderCardProps) {

  const isWaiterStation = stationId === 'waiter';
  const allItemsReady = stationItems.every(
    item => item.item_status === 'ready' || item.item_status === 'served'
  );

  const {
    isCountingDown,
    timeRemaining,
    cancelAutoRemove,
    isExiting
  } = useOrderAutoRemove({
    orderId,
    allItemsReady,
    isWaiterStation,
    autoRemoveDelay: 5000,
    onComplete: () => onOrderComplete(orderId),
  });

  const cardClasses = [
    'kds-order-card',
    `kds-order-card--${getOverallStatus()}`,
    `kds-order-card--${getUrgencyLevel()}`,
    isCountingDown && 'kds-order-card--countdown',
    isExiting && 'kds-order-card--exiting',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {/* ... existing card content ... */}

      {isCountingDown && (
        <KDSCountdownBar
          timeRemaining={timeRemaining}
          totalTime={5}
          onCancel={cancelAutoRemove}
        />
      )}
    </div>
  );
}
```

### Modification KDSMainPage

```typescript
// Modifications dans KDSMainPage.tsx

import { completeOrder } from '@/services/kds/orderCompletionService';

export default function KDSMainPage() {
  const { station } = useParams<{ station: string }>();
  const stationConfig = station ? STATION_CONFIG[station] : null;

  const handleOrderComplete = useCallback(async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const result = await completeOrder(
      orderId,
      order.order_number,
      stationConfig?.dbStation as TKitchenStation || 'kitchen'
    );

    if (result.success) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } else {
      console.error('Failed to complete order:', result.error);
      fetchOrders();
    }
  }, [orders, stationConfig, fetchOrders]);

  return (
    <div className="kds-app">
      <main className="kds-main">
        <div className="kds-orders-grid">
          {orders.map(order => (
            <KDSOrderCard
              key={order.id}
              orderId={order.id}
              orderNumber={order.order_number}
              items={order.items}
              onOrderComplete={handleOrderComplete}
              stationId={station || 'kitchen'}
              // ... other props
            />
          ))}
        </div>
      </main>
    </div>
  );
}
```

### Project Structure Notes

**Fichiers à Créer:**
```
src/
├── hooks/kds/
│   ├── useOrderAutoRemove.ts
│   └── __tests__/useOrderAutoRemove.test.ts
├── components/kds/
│   ├── KDSCountdownBar.tsx
│   └── KDSCountdownBar.css
├── services/kds/
│   ├── orderCompletionService.ts
│   └── __tests__/orderCompletionService.test.ts
```

**Fichiers à Modifier:**
- `src/services/lan/lanProtocol.ts` - Ajouter IOrderCompletePayload
- `src/pages/kds/KDSMainPage.tsx` - Intégrer handleOrderComplete
- `src/components/kds/KDSOrderCard.tsx` - Intégrer useOrderAutoRemove + countdown
- `src/components/kds/KDSOrderCard.css` - Animations sortie + countdown
- `src/locales/fr.json` - Traductions auto-remove
- `src/locales/en.json` - Traductions
- `src/locales/id.json` - Traductions

### Traductions à Ajouter

**fr.json:**
```json
{
  "kds": {
    "autoRemove": {
      "countdown": "Auto-remove dans {{seconds}}s",
      "cancel": "Garder",
      "cancelled": "Auto-remove annulé",
      "completed": "Commande complétée",
      "notification": "Commande {{orderNumber}} prête"
    }
  }
}
```

**en.json:**
```json
{
  "kds": {
    "autoRemove": {
      "countdown": "Auto-remove in {{seconds}}s",
      "cancel": "Keep",
      "cancelled": "Auto-remove cancelled",
      "completed": "Order completed",
      "notification": "Order {{orderNumber}} ready"
    }
  }
}
```

**id.json:**
```json
{
  "kds": {
    "autoRemove": {
      "countdown": "Hapus otomatis dalam {{seconds}}d",
      "cancel": "Simpan",
      "cancelled": "Penghapusan otomatis dibatalkan",
      "completed": "Pesanan selesai",
      "notification": "Pesanan {{orderNumber}} siap"
    }
  }
}
```

### Business Rules (CRITICAL)

**Délai Auto-Remove** [Source: epic-list.md#Story-4.6]
- 5 secondes après que TOUS les items sont 'ready'
- Permet au cuisinier de vérifier avant disparition
- Annulable à tout moment

**Transitions de Statut:**
```
Order.status: new → preparing → ready → served
Item.item_status: new → preparing → ready → served

Auto-remove triggers when: ALL items have item_status === 'ready'
```

**Exception Waiter Station:**
- Station 'waiter' (station: all) ne déclenche PAS l'auto-remove
- Le serveur doit manuellement cliquer "Served"

### Previous Story Intelligence

**Story 4.5 (KDS Item Status Update):** [Source: 4-5-kds-item-status-update.md]
- Implémente les transitions item_status (new → preparing → ready)
- `markItemsReady()` dans kdsStatusService.ts
- Cette story dépend de 4.5 car l'auto-remove se déclenche quand TOUS items sont 'ready'

**Story 4.4 (KDS Order Queue Display):** [Source: 4-4-kds-order-queue-display.md]
- `useKdsOrderQueue` gère l'état local des ordres
- Méthode `removeOrder(orderId)` à utiliser après auto-remove

**Story 4.3 (Order Dispatch to KDS via LAN):** [Source: 4-3-order-dispatch-to-kds-via-lan.md]
- Pattern LAN: lanClient.send() pour broadcast
- Pattern ACK déjà établi

### Testing Strategy

**Test Cases pour useOrderAutoRemove:**
1. Countdown démarre quand allItemsReady=true
2. Countdown NE démarre PAS si isWaiterStation=true
3. cancelAutoRemove() arrête le countdown
4. isExiting devient true après 5s
5. onComplete appelé après animation (5s + 300ms)
6. Re-trigger possible après cancelAutoRemove si items redeviennent ready

**Test Cases pour orderCompletionService:**
1. completeOrder met à jour Supabase avec status='ready'
2. completeOrder ajoute completed_at timestamp
3. ORDER_COMPLETE envoyé via LAN si lanClient.isActive()
4. lanSent=false si LAN non connecté
5. Gestion erreur Supabase

### Anti-Patterns to AVOID

| Éviter | Faire |
|--------|-------|
| Auto-remove pour station waiter | Vérifier isWaiterStation |
| Timer bloquant | Utiliser setTimeout/useEffect cleanup |
| Ignorer l'animation | Attendre 300ms avant onComplete |
| Supprimer immédiatement | Délai 5s avec possibilité d'annuler |
| Oublier l'envoi LAN | Toujours tenter broadcast ORDER_COMPLETE |

### Dependency on Previous Work

- `src/pages/kds/KDSMainPage.tsx` - Page KDS existante
- `src/components/kds/KDSOrderCard.tsx` - Carte ordre avec statuts
- `src/services/lan/lanClient.ts` - Client LAN avec send()
- `src/services/lan/lanProtocol.ts` - Types LAN (ORDER_COMPLETE existe)
- Story 4.4 - KDS Order Queue Display (hook état local)
- Story 4.5 - KDS Item Status Update (transitions ready)

### Epic 4 Context

Cette story est la **6ème et dernière** de l'Epic 4 (Cuisine & Dispatch - Kitchen Display System).

**Dépend de:**
- Story 4.1: Socket.IO Server on POS (LAN Hub) - done
- Story 4.2: KDS Socket.IO Client Connection - done
- Story 4.3: Order Dispatch to KDS via LAN - review
- Story 4.4: KDS Order Queue Display - ready-for-dev
- Story 4.5: KDS Item Status Update - ready-for-dev

### Critical Implementation Notes

1. **Countdown visible** - L'utilisateur doit voir qu'il a 5s pour annuler
2. **Animation obligatoire** - Ne pas supprimer sans fade-out
3. **Waiter exception** - JAMAIS d'auto-remove pour station waiter
4. **LAN broadcast** - ORDER_COMPLETE doit informer POS et mobiles
5. **Cleanup useEffect** - Nettoyer les timers au démontage
6. **completed_at** - Toujours enregistrer le timestamp de completion

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-4.6]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-006]
- [Source: _bmad-output/implementation-artifacts/4-5-kds-item-status-update.md]
- [Source: _bmad-output/implementation-artifacts/4-4-kds-order-queue-display.md]
- [Source: src/pages/kds/KDSMainPage.tsx]
- [Source: src/components/kds/KDSOrderCard.tsx]
- [Source: src/services/lan/lanProtocol.ts:34]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Tous les tests passent (14/14 tests)
- Build TypeScript OK pour les fichiers Story 4-6

### Completion Notes List

- ✅ Hook useOrderAutoRemove implémenté avec countdown 5s, cancel, et exception waiter station
- ✅ KDSCountdownBar composant avec barre de progression et bouton "Garder"
- ✅ Animations CSS pour countdown glow et exit fade-out/slide-up
- ✅ orderCompletionService met à jour Supabase (status='ready', completed_at) et broadcast ORDER_COMPLETE via LAN
- ✅ IOrderCompletePayload défini dans lanProtocol.ts
- ✅ KDSMainPage intègre handleOrderComplete avec removeOrder
- ✅ KDSOrderCard utilise le hook et affiche la countdown bar
- ✅ 14 tests unitaires couvrent tous les cas (hook + service)
- ✅ Traductions complètes en 3 langues (fr, en, id)

### File List

**Créés:**
- src/hooks/kds/useOrderAutoRemove.ts
- src/hooks/kds/__tests__/useOrderAutoRemove.test.ts
- src/components/kds/KDSCountdownBar.tsx
- src/components/kds/KDSCountdownBar.css
- src/services/kds/orderCompletionService.ts
- src/services/kds/__tests__/orderCompletionService.test.ts
- src/services/kds/index.ts

**Modifiés:**
- src/components/kds/KDSOrderCard.tsx (intégration hook + countdown bar)
- src/components/kds/KDSOrderCard.css (animations --exiting, --countdown)
- src/pages/kds/KDSMainPage.tsx (handleOrderComplete callback)
- src/services/lan/lanProtocol.ts (IOrderCompletePayload interface)
- src/locales/fr.json (kds.autoRemove.*)
- src/locales/en.json (kds.autoRemove.*)
- src/locales/id.json (kds.autoRemove.*)

## Code Review Fixes (2026-02-02)

### Issues Fixed

| Issue | Sévérité | Fix |
|-------|----------|-----|
| lanClient.send() sans try/catch | MEDIUM | Ajouté try/catch dans orderCompletionService.ts:55-66 |
| KDSOrderCard interval timer leak | MEDIUM | Ajouté isMounted flag dans useEffect cleanup |
| KDSCountdownBar manque aria-live | LOW | Ajouté `role="alert" aria-live="polite"` |
| playNotificationSound dupliqué | LOW | Extrait vers src/utils/audio.ts |

### Files Modified in Code Review

- `src/services/kds/orderCompletionService.ts` - try/catch pour LAN send
- `src/components/kds/KDSOrderCard.tsx` - isMounted check pour interval
- `src/components/kds/KDSCountdownBar.tsx` - aria-live pour accessibilité
- `src/pages/kds/KDSMainPage.tsx` - utilise playNewOrderSound de utils/audio
- `src/utils/audio.ts` - **nouveau** utilitaire audio partagé
