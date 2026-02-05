# Story 3.15: French Strings Cleanup

Status: backlog

## Story

As a **User**,
I want **une interface entièrement en anglais**,
so that **l'expérience utilisateur est cohérente et professionnelle**.

## Acceptance Criteria

### AC1: Nettoyage des Composants POS Principaux
**Given** page POS et Cart
**When** je parcours l'interface
**Then** je ne vois plus de chaînes comme "Caisse Principale" ou "Changer"
**And** elles sont remplacées par "Main Terminal" et "Change"

### AC2: Nettoyage des Modales
**Given** modales de sélection de Client ou Table
**When** j'ouvre les modales
**Then** tous les boutons et labels sont en anglais (ex: "Select a Customer" au lieu de "Sélectionner un Client")

### AC3: Audit Complet par Grep
**Given** exécution d'une commande grep sur `src/components/pos`
**When** je cherche des mots clés français communs
**Then** le résultat est vide ou ne contient que des faux positifs

## Tasks / Subtasks

- [ ] **Task 1: Traduire POSMainPage.tsx**
  - [ ] 1.1: 'Caisse Principale' -> 'Main Terminal'
  - [ ] 1.2: 'Sélectionner une caisse' -> 'Select a terminal'
  - [ ] 1.3: 'Caissier' -> 'Cashier'
  - [ ] 1.4: 'Ouvrir un nouveau shift' -> 'Open a new shift'
- [ ] **Task 2: Traduire Cart.tsx et Modales**
  - [ ] 2.1: Cart.tsx : 'Changer' -> 'Change'
  - [ ] 2.2: CustomerSearchModal.tsx : 'Sélectionner' -> 'Select', 'remise' -> 'discount', etc.
  - [ ] 2.3: TableSelectionModal.tsx : 'Sélectionner une Table' -> 'Select a Table'
- [ ] **Task 3: Audit et Validation**
  - [ ] 3.1: Effectuer un grep pour détecter d'autres chaînes françaises
  - [ ] 3.2: Vérifier que toutes les traductions sont appliquées

## Dev Notes

### Summary Table of identified strings

| File | French | English |
|------|--------|---------|
| `POSMainPage.tsx` | `'Caisse Principale'` | `'Main Terminal'` |
| `POSMainPage.tsx` | `'Caissier'` | `'Cashier'` |
| `Cart.tsx` | `'Changer'` | `'Change'` |
| `CustomerSearchModal.tsx` | `'remise'` | `'discount'` |
| `TableSelectionModal.tsx` | `'Toutes'` | `'All'` |

### Reference
`tech_spec_pos_interface_revision.md#F1.7: French Strings Cleanup`
