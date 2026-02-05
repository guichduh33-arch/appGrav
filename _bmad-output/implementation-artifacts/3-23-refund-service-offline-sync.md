# Story 3.23: Refund Service Offline Sync

Status: backlog

## Story

As a **Developer**,
I want **implémenter la synchronisation pour les remboursements (refund)**,
so that **les données financières sont exactes même après une période offline**.

## Acceptance Criteria

### AC1: Sync des Remboursements Partiels
**Given** remboursement partiel effectué offline
**When** synchronisation réussie
**Then** les colonnes `refund_amount`, `refund_reason` etc. sont mises à jour sur le serveur
**And** le montant global du shift (`pos_sessions`) est incrémenté dans `total_refunds`

### AC2: Validation de Cohérence Sync
**Given** sync d'un refund
**When** le montant total déjà remboursé sur le serveur dépasse le seuil autorisé
**Then** la sync échoue avec un message d'erreur explicite

## Tasks / Subtasks

- [ ] **Task 1: Logique de queue dans refundService**
  - [ ] 1.1: Implémenter le switch offline/online dans `processRefund`
- [ ] **Task 2: Mise à jour des sessions de shift**
  - [ ] 2.1: Assurer que le calcul de `total_refunds` est géré lors de la sync

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.7: Refund Service + Offline Sync`
