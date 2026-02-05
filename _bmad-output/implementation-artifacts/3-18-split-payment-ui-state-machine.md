# Story 3.18: Split Payment UI + State Machine

Status: backlog

## Story

As a **Cashier**,
I want **pouvoir diviser un paiement entre plusieurs méthodes (ex: Cash + Card)**,
so that **je peux satisfaire les demandes de paiement complexes des clients**.

## Acceptance Criteria

### AC1: Refactorisation du PaymentModal
**Given** panier avec un total à payer
**When** j'ouvre le `PaymentModal`
**Then** je peux ajouter plusieurs types de paiements
**And** je vois la progression vers le total (Rp) via une progress bar

### AC2: State Machine de Paiement
**Given** le processus de paiement en cours
**When** j'ajoute un paiement
**Then** l'état passe de `idle` -> `adding` -> `validating`
**And** je ne peux pas compléter la commande tant que le total n'est pas atteint

### AC3: Validation en Temps Réel
**Given** paiement en cours
**When** je tente d'ajouter un montant supérieur au reste à payer
**Then** une erreur de validation s'affiche
**And** le bouton "Complete" est verrouillé

## Tasks / Subtasks

- [ ] **Task 1: Créer le store de paiement**
  - [ ] 1.1: Créer `src/stores/paymentStore.ts` (Zustand)
  - [ ] 1.2: Implémenter les types d'état (`idle`, `adding`, `validating`, `complete`)
- [ ] **Task 2: Refactoriser PaymentModal.tsx**
  - [ ] 2.1: Migrer la logique locale vers le `paymentStore`
  - [ ] 2.2: Implémenter l'UI pour la liste des paiements ajoutés
  - [ ] 2.3: Ajouter la progress bar de complétion
- [ ] **Task 3: Intégrer les services**
  - [ ] 3.1: Connecter le store au `paymentService` (créé en Story 3.13)

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.2: Split Payment UI + State Machine`
