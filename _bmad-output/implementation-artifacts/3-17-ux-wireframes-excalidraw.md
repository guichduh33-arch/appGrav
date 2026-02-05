# Story 3.17: UX Wireframes Excalidraw

Status: backlog

## Story

As a **UX Designer**,
I want **concevoir les wireframes pour le split payment et les modales void/refund**,
so that **les développeurs ont un guide visuel clair avant l'implémentation**.

## Acceptance Criteria

### AC1: Fichier Excalidraw Créé
**Given** besoin de conception UI
**When** je cherche les ressources de design
**Then** je trouve `docs/wireframes/pos-revision-wireframes.excalidraw`

### AC2: Split Payment Modal Design
**Given** le fichier wireframe
**When** j'examine la modale de paiement
**Then** je vois une barre de progression de paiement
**And** un bouton "Add Payment Method"
**And** une liste des paiements déjà ajoutés avec bouton de suppression

### AC3: Modales Void et Refund Design
**Given** le fichier wireframe
**When** j'examine les modales de correction
**Then** je vois pour Void : thème rouge, dropdown de raison
**And** pour Refund : toggle full/partial, sélection de méthode de remboursement

## Tasks / Subtasks

- [ ] **Task 1: Préparer le fichier de design**
  - [ ] 1.1: Créer le dossier `docs/wireframes` si inexistant
  - [ ] 1.2: Initialiser `docs/wireframes/pos-revision-wireframes.excalidraw`
- [ ] **Task 2: Designer le Split Payment Flow**
  - [ ] 2.1: Créer le layout de la modale de paiement multi-méthodes
  - [ ] 2.2: Inclure la progress bar et le calcul du montant restant
- [ ] **Task 3: Designer les modales de gestion critique**
  - [ ] 3.1: Créer le Void Order Modal (thème alerte)
  - [ ] 3.2: Créer le Refund Modal (partial refund support)

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.1: UX Wireframes (Excalidraw)`
