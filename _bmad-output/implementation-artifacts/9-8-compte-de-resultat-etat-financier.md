# Story 9.8: Compte de Résultat (État Financier)

Status: ready-for-dev

## Story

As a **Manager**,
I want **générer le compte de résultat (Profit & Loss Statement)**,
So that **je vois si la boulangerie gagne de l'argent sur une période**.

## Acceptance Criteria

### AC1: Rapport Produits - Charges
**Given** un intervalle de dates
**When** je génère le compte de résultat
**Then** je vois les Produits (7xxx) moins les Charges (6xxx) pour arriver au Résultat Net de la période.

### AC2: Comparaison MoM
**Given** le rapport actif
**When** j'active la comparaison
**Then** je vois l'évolution de la rentabilité par rapport au mois précédent.

## Tasks

- [ ] **Task 1: Logique de Résultat**
  - [ ] 1.1: Mapper les classes 6 et 7 vers le template de rapport.

- [ ] **Task 2: UI P&L**
  - [ ] 2.1: Créer `src/pages/admin/accounting/ProfitLossStatement.tsx`.

## Dev Notes

### Detail
- Pouvoir expandre une catégorie (ex: "Charges fixes") pour voir les détails par compte.
