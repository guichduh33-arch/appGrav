# Story 4.7: POS KDS Status Listener Integration

Status: done

## Story

As a **Caissier/Manager**,
I want **voir en temps réel l'avancement des commandes en cuisine**,
so that **je peux informer les clients et anticiper les commandes prêtes**.

## Acceptance Criteria

### AC1: Affichage du Statut Item en Temps Réel
**Given** une commande est affichée sur l'écran POS (OrderDetails ou OrdersList)
**When** le KDS marque un item comme "preparing" ou "ready"
**Then** l'UI du POS se met à jour automatiquement sans refresh manuel
**And** le changement est visible en < 1 seconde

### AC2: Indicateur Visuel de Progression
**Given** je consulte les détails d'une commande
**When** des items changent de statut
**Then** je vois un indicateur visuel (couleur, badge, icône) reflétant le statut
**And** les statuts sont: new (bleu), preparing (jaune), ready (vert), served (gris)

### AC3: Notification Optionnelle
**Given** le POS est connecté au hub LAN
**When** tous les items d'une commande passent en "ready"
**Then** une notification toast s'affiche (optionnel, configurable)
**And** un son de notification peut être joué (si activé)

## Tasks / Subtasks

- [x] **Task 1: Intégrer useKdsStatusListener dans OrdersPage** (AC: 1, 2)
  - [x] 1.1: Importer useKdsStatusListener dans src/pages/orders/OrdersPage.tsx
  - [x] 1.2: Connecter les callbacks onItemPreparing et onItemReady
  - [x] 1.3: Mettre à jour l'état local des commandes affichées
  - [x] 1.4: Forcer le re-render des lignes affectées

- [x] **Task 2: Ajouter indicateurs visuels de statut** (AC: 2)
  - [x] 2.1: Créer composant OrderItemStatusBadge
  - [x] 2.2: Afficher badge coloré selon item_status
  - [x] 2.3: Ajouter animation de transition pour les changements

- [x] **Task 3: Notification commande prête** (AC: 3)
  - [x] 3.1: Détecter quand tous les items d'une commande sont "ready"
  - [x] 3.2: Afficher toast "Commande #X prête!"
  - [x] 3.3: Jouer son de notification (si activé dans settings)

- [x] **Task 4: Tests unitaires** (AC: 1, 2, 3)
  - [x] 4.1: Tester mise à jour d'état sur réception KDS_ITEM_PREPARING
  - [x] 4.2: Tester mise à jour d'état sur réception KDS_ITEM_READY
  - [x] 4.3: Tester notification toast quand commande complète

## Dev Notes

### Hook Existant à Utiliser

Le hook `useKdsStatusListener` est déjà implémenté (Story 4.5):

```typescript
// src/hooks/pos/useKdsStatusListener.ts
import { useKdsStatusListener } from '@/hooks/pos/useKdsStatusListener';

// Usage dans un composant POS:
useKdsStatusListener({
  onItemPreparing: (orderId, itemIds, station) => {
    // Mettre à jour l'état local
  },
  onItemReady: (orderId, itemIds, station, preparedAt) => {
    // Mettre à jour l'état local
    // Vérifier si tous les items sont ready
  },
  enabled: true,
});
```

### Composants Candidats pour l'Intégration

1. **OrdersPage** (`src/pages/orders/OrdersPage.tsx`) - Liste des commandes
2. **OrderDetailsModal** - Détails d'une commande spécifique
3. **POSPage** - Si affichage des commandes en cours

### Styles Existants à Réutiliser

Les styles de statut existent déjà dans KDSOrderCard.css:
- `.kds-order-card__item--new` → bleu
- `.kds-order-card__item--preparing` → jaune
- `.kds-order-card__item--ready` → vert

### Dependency

- ✅ Story 4.5: KDS Item Status Update (useKdsStatusListener créé)
- ✅ Story 4.2: KDS Socket.IO Client Connection (lanClient)

### References

- [Source: src/hooks/pos/useKdsStatusListener.ts]
- [Source: src/services/lan/lanProtocol.ts - IKdsItemPreparingPayload, IKdsItemReadyPayload]
- [Source: _bmad-output/implementation-artifacts/4-5-kds-item-status-update.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- ✅ useKdsStatusListener intégré dans OrdersPage.tsx avec callbacks onItemPreparing et onItemReady
- ✅ recentlyUpdatedItemsRef.current tracks recently updated items for animation feedback
- ✅ QueryClient invalidation déclenche refetch automatique des commandes
- ✅ OrderItemStatusBadge composant créé avec 4 statuts colorés (new/bleu, preparing/jaune, ready/vert, served/gris)
- ✅ Animations CSS pour status changes (pulse-preparing, pulse-ready)
- ✅ handleItemReady détecte quand tous les items sont "ready" et affiche toast notification
- ✅ Son de notification via Web Audio API (oscillator 880Hz)
- ✅ 7 tests unitaires pour useKdsStatusListener couvrent tous les cas
- ✅ Traductions kds.posNotification.orderReady dans les 3 langues

### File List

**Créés:**
- src/components/orders/OrderItemStatusBadge.tsx
- src/components/orders/OrderItemStatusBadge.css
- src/hooks/pos/__tests__/useKdsStatusListener.test.ts

**Modifiés:**
- src/pages/orders/OrdersPage.tsx (intégration useKdsStatusListener, OrderItemStatusBadge, notifications)
- src/locales/fr.json (kds.posNotification.orderReady)
- src/locales/en.json (kds.posNotification.orderReady)
- src/locales/id.json (kds.posNotification.orderReady)

## Change Log

| Date | Changement | Fichiers |
|------|------------|----------|
| 2026-02-02 | Story créée suite à code review 4-5 (extraction AC4 partiel) | - |
| 2026-02-02 | Implémentation complète - intégration useKdsStatusListener, OrderItemStatusBadge, notifications toast + son | OrdersPage.tsx, OrderItemStatusBadge.tsx/.css, locales/*.json |
| 2026-02-02 | Code review fixes - memory leak, son configurable, isActive dynamique | OrdersPage.tsx, useKdsStatusListener.ts, OrderItemStatusBadge.tsx |

## Code Review Fixes (2026-02-02)

### Issues Fixed

| Issue | Sévérité | Fix |
|-------|----------|-----|
| Memory leak setTimeout dans OrdersPage | HIGH | Ajouté animationTimeoutsRef + cleanup useEffect |
| Son non configurable (AC3) | MEDIUM | Utilise moduleSettings.kds.sound_new_order |
| useKdsStatusListener.isActive statique | LOW | Ajouté state + interval pour update dynamique |
| OrderItemStatusBadge fallback silencieux | LOW | Ajouté console.warn pour status invalide |
| Code audio dupliqué | LOW | Utilise playOrderReadySound de utils/audio.ts |

### Files Modified in Code Review

- `src/pages/orders/OrdersPage.tsx`:
  - Import playOrderReadySound et useModuleSettings
  - animationTimeoutsRef pour tracker les timeouts
  - Cleanup useEffect pour nettoyer les timeouts au démontage
  - Vérification moduleSettings.kds.sound_new_order avant de jouer le son
- `src/hooks/pos/useKdsStatusListener.ts`:
  - Ajout useState pour isActive
  - useEffect avec interval pour check connexion toutes les 2s
- `src/components/orders/OrderItemStatusBadge.tsx`:
  - console.warn si status invalide reçu
