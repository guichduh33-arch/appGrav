# Story 3.29: Customer Display Broadcast

Status: backlog

## Story

As a **Customer**,
I want **voir le contenu de mon panier sur un écran secondaire**,
so that **je peux vérifier les articles et le prix total pendant la saisie**.

## Acceptance Criteria

### AC1: Diffusion des Mises à Jour du Panier
**Given** modification du panier (ajout item, changement quantité)
**When** le `cartStore` change
**Then** un message est envoyé sur le `BroadcastChannel` local (ex: 'appgrav-pos-broadcast')

### AC2: Réception sur l'Écran Client
**Given** onglet "Customer Display" ouvert
**When** un message de broadcast est reçu
**Then** l'écran client se met à jour instantanément avec le nouveau total et la liste des items

## Tasks / Subtasks

- [ ] **Task 1: Implémenter le Provider de Broadcast**
  - [ ] 1.1: Ajouter un middleware ou un listener de store pour diffuser les changements
- [ ] **Task 2: Créer la page Customer Display simplifiée**
  - [ ] 2.1: Créer une route `/pos/customer-display`
  - [ ] 2.2: Implémenter le récepteur de messages de broadcast

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F3.2: Customer Display broadcast (BroadcastChannel)`
