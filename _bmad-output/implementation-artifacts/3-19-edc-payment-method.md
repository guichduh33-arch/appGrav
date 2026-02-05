# Story 3.19: EDC Payment Method

Status: backlog

## Story

As a **Cashier**,
I want **pouvoir sélectionner 'EDC' comme méthode de paiement**,
so that **je peux enregistrer les paiements par carte traités via un terminal externe**.

## Acceptance Criteria

### AC1: Option EDC visible
**Given** `PaymentModal` ouvert
**When** je liste les méthodes de paiement
**Then** l'option `EDC` est visible à côté de Cash, Card et QRIS

### AC2: Indicateur Offline pour EDC
**Given** mode offline
**When** EDC est sélectionné
**Then** un indicateur "Pending validation" s'affiche (car EDC nécessite souvent une validation manuelle post-sync)

### AC3: Alignement Rapports de Shift
**Given** paiement enregistré en EDC
**When** je ferme mon shift (`CloseShiftModal`)
**Then** le montant EDC est listé séparément pour le comptage de caisse

## Tasks / Subtasks

- [ ] **Task 1: Ajouter l'UI EDC dans PaymentModal**
  - [ ] 1.1: Ajouter le bouton radio et label pour EDC
  - [ ] 1.2: Utiliser l'icône `CreditCard` (ou spécifique EDC)
- [ ] **Task 2: Gérer le statut offline**
  - [ ] 2.1: Afficher le badge `Clock` si `!isOnline` pour cette méthode

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.3: EDC Payment Method`
