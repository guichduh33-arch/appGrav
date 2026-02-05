# Story 8.3: Inventory Reports Suite

Status: ready-for-dev

## Story

As a **Manager**,
I want **consulter les rapports d'inventaire**,
So that **je gère le stock efficacement et évite les ruptures ou les pertes**.

## Acceptance Criteria

### AC1: État du Stock Valentisé
**Given** le rapport "Stock Balance"
**When** je lance la consultation
**Then** je vois la quantité en main pour chaque produit et sa valeur financière (bases: Last Purchase Price).

### AC2: Alertes de Stock Bas
**Given** le rapport "Low Stock Alert"
**When** un produit est sous son seuil de sécurité
**Then** il apparaît en rouge dans la liste avec une suggestion de quantité à commander.

### AC3: Mouvements de Stock (Audit)
**Given** une période donnée
**When** je consulte "Stock Movements"
**Then** je vois toutes les entrées, sorties, et transferts avec leurs raisons (Vente, Perte, Ajustement).

## Tasks

- [ ] **Task 1: Logique de Valorisation**
  - [ ] 1.1: Implémenter le calcul de la valeur du stock basée sur le dernier prix d'achat enregistré.

- [ ] **Task 2: UI Inventaire Reporting**
  - [ ] 2.1: Créer `src/pages/admin/reports/InventoryStatus.tsx`
  - [ ] 2.2: Créer `src/pages/admin/reports/StockMovementAudit.tsx`

## Dev Notes

### Accuracy
- Les données de stock doivent être synchronisées avec les ventes POS en temps réel.
- Support du multi-location (comptoir vs réserve).
