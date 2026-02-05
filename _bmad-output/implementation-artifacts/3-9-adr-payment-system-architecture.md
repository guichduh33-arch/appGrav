# Story 3.9: ADR Payment System Architecture

Status: backlog

## Story

As a **Developer**,
I want **un document ADR pour la refonte du système de paiement**,
so that **je peux suivre des décisions architecturales cohérentes**.

## Acceptance Criteria

### AC1: Document ADR Créé
**Given** besoin de clarifier la refonte des paiements
**When** je consulte les documents techniques
**Then** je trouve `docs/adr/ADR-001-payment-system-refactor.md`

### AC2: Décisions Architecturales Documentées
**Given** le document ADR est ouvert
**When** je parcours les sections Status, Context, Decision, Consequences
**Then** je vois les décisions sur :
- Création de la table `order_payments`
- Consolidation de `TPaymentMethod`
- Interface unifiée `paymentService.ts`
- Service `financialOperationService.ts` pour void/refund
- State machine pour split payment

## Tasks / Subtasks

- [ ] **Task 1: Créer le dossier et le fichier ADR**
  - [ ] 1.1: Créer le dossier `docs/adr` si inexistant
  - [ ] 1.2: Créer `docs/adr/ADR-001-payment-system-refactor.md`
- [ ] **Task 2: Rédiger le contenu technique**
  - [ ] 2.1: Décrire le contexte (incohérences de types, table manquante)
  - [ ] 2.2: Documenter les décisions de Phase 1, 2 et 3
  - [ ] 2.3: Lister les conséquences (breaking changes hooks, migrations)

## Dev Notes

### Architecture Compliance (MANDATORY)

**Refer to:** `tech-spec-pos-interface-revision.md#D1: Architecture Decision Record (ADR)`

### Content Template

```markdown
# ADR-001: Payment System Refactor

## Status
Proposed

## Context
Le système de paiement actuel a des incohérences de types, une table manquante,
et ne supporte pas le split payment.

## Decision
1. Créer table order_payments pour stocker les paiements multiples
2. Consolider TPaymentMethod sur l'enum DB comme source unique
3. Créer paymentService.ts avec interface unifiée
4. Créer financialOperationService.ts pour void/refund
5. Utiliser state machine pour split payment flow

## Consequences
- Breaking change: useOfflinePayment hook signature change
- Migration required before deployment
- All payment-related code must use new types
```
