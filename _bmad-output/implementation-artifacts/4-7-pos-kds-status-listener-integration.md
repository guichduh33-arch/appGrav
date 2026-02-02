# Story 4.7: POS KDS Status Listener Integration

Status: in-progress

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

- [ ] **Task 1: Intégrer useKdsStatusListener dans OrdersPage** (AC: 1, 2)
  - [ ] 1.1: Importer useKdsStatusListener dans src/pages/orders/OrdersPage.tsx
  - [ ] 1.2: Connecter les callbacks onItemPreparing et onItemReady
  - [ ] 1.3: Mettre à jour l'état local des commandes affichées
  - [ ] 1.4: Forcer le re-render des lignes affectées

- [ ] **Task 2: Ajouter indicateurs visuels de statut** (AC: 2)
  - [ ] 2.1: Créer composant OrderItemStatusBadge
  - [ ] 2.2: Afficher badge coloré selon item_status
  - [ ] 2.3: Ajouter animation de transition pour les changements

- [ ] **Task 3: Notification commande prête** (AC: 3)
  - [ ] 3.1: Détecter quand tous les items d'une commande sont "ready"
  - [ ] 3.2: Afficher toast "Commande #X prête!"
  - [ ] 3.3: Jouer son de notification (si activé dans settings)

- [ ] **Task 4: Tests unitaires** (AC: 1, 2, 3)
  - [ ] 4.1: Tester mise à jour d'état sur réception KDS_ITEM_PREPARING
  - [ ] 4.2: Tester mise à jour d'état sur réception KDS_ITEM_READY
  - [ ] 4.3: Tester notification toast quand commande complète

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

(À remplir lors de l'implémentation)

### Completion Notes List

(À remplir lors de l'implémentation)

### File List

**Fichiers à modifier:**
- src/pages/orders/OrdersPage.tsx
- (autres selon implémentation)

**Fichiers à créer:**
- src/components/orders/OrderItemStatusBadge.tsx (optionnel)

## Change Log

| Date | Changement | Fichiers |
|------|------------|----------|
| 2026-02-02 | Story créée suite à code review 4-5 (extraction AC4 partiel) | - |
