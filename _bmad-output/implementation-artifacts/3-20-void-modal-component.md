# Story 3.20: Void Modal Component

Status: backlog

## Story

As a **Manager**,
I want **une modale dédiée pour annuler (void) une commande**,
so that **je peux arrêter le traitement d'une commande erronée avec une raison documentée**.

## Acceptance Criteria

### AC1: Interface d'Alerte (Void)
**Given** besoin d'annuler une commande
**When** j'ouvre le `VoidModal`
**Then** l'interface utilise un thème d'alerte rouge
**And** affiche un résumé de la commande (numéro, total)

### AC2: Sélection de Raison Obligatoire
**Given** `VoidModal` ouvert
**When** je veux confirmer
**Then** je dois obligatoirement choisir une raison dans le dropdown (ex: 'Customer changed mind', 'Wrong items')

### AC3: Sécurisation par PIN
**Given** raison sélectionnée
**When** je clique sur "Void Order"
**Then** le `PinVerificationModal` s'ouvre
**And** l'opération n'est soumise au `voidService` qu'après validation du PIN manager

## Tasks / Subtasks

- [ ] **Task 1: Créer le composant VoidModal**
  - [ ] 1.1: Créer `src/components/pos/modals/VoidModal.tsx`
  - [ ] 1.2: Implémenter le layout de résumé de commande
- [ ] **Task 2: Implémenter le formulaire de raison**
  - [ ] 2.1: Créer le dropdown avec les `TVoidReasonCode`
  - [ ] 2.2: Ajouter un champ texte optionnel pour les notes
- [ ] **Task 3: Connecter la vérification PIN**
  - [ ] 3.1: Intégrer `PinVerificationModal` dans le flux de confirmation
  - [ ] 3.2: Appeler `voidService.voidOrder()` sur succès

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.4: VoidModal Component`
