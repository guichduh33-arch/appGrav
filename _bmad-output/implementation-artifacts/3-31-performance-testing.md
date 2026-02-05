# Story 3.31: Performance Testing

Status: backlog

## Story

As a **Developer**,
I want **mesurer et optimiser les performances de l'interface POS révisée**,
so that **l'application reste fluide même avec un grand volume de données**.

## Acceptance Criteria

### AC1: Cibles de Temps de Réponse UI
**Given** utilisation intense du POS
**When** actions utilisateur (clic, switch d'onglet)
**Then** le temps de réponse UI est inférieur à 100ms

### AC2: Cibles de Temps de Réponse Opérations
**Given** finalisation de commande
**When** passage du panier au paiement
**Then** le traitement local et l'enregistrement dans IndexedDB se font en moins de 500ms

## Tasks / Subtasks

- [ ] **Task 1: Mesurer les temps de rendu**
  - [ ] 1.1: Utiliser React Profiler pour identifier les re-rendus inutiles dans `PaymentModal`
- [ ] **Task 2: Optimiser l'accès Dexie/IndexedDB**
  - [ ] 2.1: Vérifier l'utilisation des index pour les requêtes de queue de sync

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F3.4: Performance Testing`
