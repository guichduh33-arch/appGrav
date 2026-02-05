# Story 9.6: Balance des Comptes

Status: ready-for-dev

## Story

As a **Comptable**,
I want **générer la balance des comptes (Trial Balance)**,
So that **je vérifie l'équilibre global de la comptabilité avant clôture**.

## Acceptance Criteria

### AC1: Rapport de Balance
**Given** une date d'arrêt
**When** je génère la balance
**Then** le système affiche pour chaque compte: Solde Ouverture, Total Débit Période, Total Crédit Période, Solde Clôture.

### AC2: Vérification d'Équilibre
**Given** le pied de page de la balance
**When** les calculs sont finis
**Then** le Total Débit doit être rigoureusement égal au Total Crédit.
**And** si ce n'est pas le cas, un message d'erreur "Accounting Out of Balance" s'affiche.

## Tasks

- [ ] **Task 1: Agrégation Comptable**
  - [ ] 1.1: Créer un service RPC Postgres `calculate_trial_balance(date_start, date_end)`.

- [ ] **Task 2: Page de Balance**
  - [ ] 2.1: Créer `src/pages/admin/accounting/TrialBalance.tsx`.

## Dev Notes

### Accuracy
- La balance est le socle pour générer le Bilan et le Compte de Résultat.
