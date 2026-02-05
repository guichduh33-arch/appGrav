# Story 3.21: Refund Modal Component

Status: backlog

## Story

As a **Manager**,
I want **pouvoir rembourser une commande partiellement ou totalement**,
so that **je peux gérer les retours clients et les erreurs de facturation après paiement**.

## Acceptance Criteria

### AC1: Support Remboursement Partiel
**Given** commande payée
**When** j'ouvre le `RefundModal`
**Then** je peux basculer entre "Full Refund" et "Partial Refund"
**And** si partiel, je peux saisir le montant souhaité

### AC2: Validation des Montants
**Given** saisie d'un montant de remboursement
**When** le montant dépasse le total payé de la commande
**Then** une erreur de validation bloque la confirmation

### AC3: Sélection de Méthode de Remboursement
**Given** processus de remboursement
**When** je confirme
**Then** je peux choisir la méthode de remboursement (souvent la même que l'originale, mais peut différer)

## Tasks / Subtasks

- [ ] **Task 1: Créer le composant RefundModal**
  - [ ] 1.1: Créer `src/components/pos/modals/RefundModal.tsx`
- [ ] **Task 2: Implémenter la logique Full/Partial**
  - [ ] 2.1: Ajouter le switch de type de remboursement
  - [ ] 2.2: Ajouter le champ de saisie de montant avec validation
- [ ] **Task 3: Intégrer le flux de sécurité**
  - [ ] 3.1: Intégrer la validation par PIN
  - [ ] 3.2: Appeler `refundService.processRefund()`

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.5: RefundModal Component`
