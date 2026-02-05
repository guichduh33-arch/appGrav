# Story 3.25: Shift Indicator Banner

Status: backlog

## Story

As a **Cashier**,
I want **voir les détails de mon shift actuel sur l'écran POS**,
so that **je suis sûr que mes ventes sont enregistrées sur la bonne session**.

## Acceptance Criteria

### AC1: Bannière d'Info visible
**Given** un shift ouvert
**When** je suis sur `POSMainPage`
**Then** je vois une bannière affichant le numéro de shift (ex: Shift #12)
**And** le nom du caissier par défaut

### AC2: Temps écoulé
**Given** bannière de shift visible
**When** je regarde l'heure
**Then** l'heure d'ouverture du shift est affichée (ex: "Since 14:30")

### AC3: Masquage si pas de shift
**Given** aucun shift ouvert
**When** je suis sur le POS
**Then** la bannière n'est pas affichée

## Tasks / Subtasks

- [ ] **Task 1: Implémenter le composant de bannière**
  - [ ] 1.1: Ajouter le JSX dans `POSMainPage.tsx` après la navigation
  - [ ] 1.2: Utiliser les données de `currentSession` depuis le store
- [ ] **Task 2: Appliquer le style**
  - [ ] 2.1: Vérifier l'import des styles CSS existants dans `POSMainPage.css`

## Dev Notes

### reference
`tech_spec_pos_interface_revision.md#F2.9: Shift Indicator Banner`
