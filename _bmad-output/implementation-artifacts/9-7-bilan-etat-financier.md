# Story 9.7: Bilan (État Financier)

Status: ready-for-dev

## Story

As a **Manager**,
I want **générer le bilan (Balance Sheet)**,
So that **je connais la valeur de l'entreprise (Actif vs Passif)**.

## Acceptance Criteria

### AC1: Structure de Bilan Standard
**Given** une date donnée
**When** je consulte le Bilan
**Then** je vois l'Actif (Immos, Stocks, Créances, Cash) à gauche et le Passif + Capitaux Propres à droite.

### AC2: Intégrité comptable
**Given** le Bilan généré
**When** je vérifie les totaux
**Then** Total Actif = Total Passif + Capitaux Propres.

## Tasks

- [ ] **Task 1: Logique de Bilan**
  - [ ] 1.1: Mapper les classes de comptes (1, 2, 3, 4, 5) vers les rubriques du bilan.

- [ ] **Task 2: UI Bilan**
  - [ ] 2.1: Créer `src/pages/admin/accounting/BalanceSheet.tsx` avec un design bi-colonne classique.

## Dev Notes

### Frequency
- Généré généralement mensuellement ou trimestriellement.
