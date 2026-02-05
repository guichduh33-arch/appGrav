# Story 3.16: Phase 1 Unit Tests

Status: backlog

## Story

As a **Quality Engineer**,
I want **des tests unitaires pour les nouveaux services de paiement et financiers**,
so that **les opérations monétaires sont fiables et sans bugs**.

## Acceptance Criteria

### AC1: Couverture des Services de Paiement
**Given** `paymentService.ts`
**When** exécution des tests
**Then** la couverture (coverage) est d'au moins 95%
**And** les scénarios de calcul de monnaie et validation de montants passent

### AC2: Couverture des Opérations Financières
**Given** `voidService.ts`, `refundService.ts` et `auditService.ts`
**When** exécution des tests
**Then** la couverture est de 100% sur ces fichiers
**And** les logs d'audit sont vérifiés pour chaque opération

### AC3: Pas de Régression
**Given** suite de tests complète
**When** exécution de `npm test`
**Then** tous les tests (nouveaux et existants) passent au vert

## Tasks / Subtasks

- [ ] **Task 1: Créer l'infrastructure de test pour les services**
  - [ ] 1.1: Configurer les mocks pour Dexie et Supabase si nécessaire
- [ ] **Task 2: Écrire les tests pour PaymentService**
  - [ ] 2.1: Créer `src/services/payment/__tests__/paymentService.test.ts`
  - [ ] 2.2: Tester `calculateChange`, `validatePayment`, `processPayment`
- [ ] **Task 3: Écrire les tests pour les services financiers**
  - [ ] 3.1: Créer `src/services/financial/__tests__/voidService.test.ts`
  - [ ] 3.2: Créer `src/services/financial/__tests__/refundService.test.ts`
  - [ ] 3.3: Créer `src/services/financial/__tests__/auditService.test.ts`
- [ ] **Task 4: Valider la couverture**
  - [ ] 4.1: Lancer les tests avec coverage : `npx vitest run --coverage`

## Dev Notes

### Coverage Targeting
- **Payment Service**: 95%+
- **Financial Operations**: 100% (Critical path)

### Reference
`tech_spec_pos_interface_revision.md#F1.8: Unit Tests for New Services`
