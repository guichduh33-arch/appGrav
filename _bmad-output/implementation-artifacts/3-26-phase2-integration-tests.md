# Story 3.16: Phase 2 Integration Tests

Status: backlog

## Story

As a **Quality Engineer**,
I want **des tests d'intégration pour les flux complexes (Split Pay, Void, Refund)**,
so that **je peux garantir que l'UI et les services fonctionnent ensemble sans erreur**.

## Acceptance Criteria

### AC1: Flux Split Payment Complet
**Given** panier de 150k
**When** simulation de 100k cash + 50k card
**Then** l'intégration test valide la création de l'order ET des 2 order_payments associés

### AC2: Flux de Sécurité (PIN)
**Given** tentative de Void ou Refund
**When** test simulant un mauvais PIN puis un bon PIN
**Then** l'opération est bloquée au premier échec et réussit au second avec log d'audit correct

### AC3: Performance des Modales
**Given** interaction avec les nouvelles modales
**When** mesure des temps de réponse
**Then** les ouvertures et transitions de modales se font en < 100ms

## Tasks / Subtasks

- [ ] **Task 1: Créer les fichiers de tests d'intégration**
  - [ ] 1.1: Créer `src/components/pos/modals/__tests__/PaymentModal.integration.test.tsx`
  - [ ] 1.2: Créer les tests pour `VoidModal` et `RefundModal`
- [ ] **Task 2: Tester les scénarios offline/sync**
  - [ ] 2.1: Créer `paymentSync.integration.test.ts`
  - [ ] 2.2: Créer `voidSync.integration.test.ts`
- [ ] **Task 3: Validation 100% financial coverage**
  - [ ] 3.1: Exécuter la suite complète et vérifier les rapports de couverture

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.10: Integration Tests`
