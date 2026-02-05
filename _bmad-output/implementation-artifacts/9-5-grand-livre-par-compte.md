# Story 9.5: Grand Livre par Compte

Status: ready-for-dev

## Story

As a **Comptable**,
I want **consulter le grand livre d'un compte (General Ledger)**,
So that **je vois tout l'historique des mouvements pour un compte spécifique**.

## Acceptance Criteria

### AC1: Drill-down depuis le Plan Comptable
**Given** le plan comptable
**When** je clique sur un compte
**Then** je suis redirigé vers le Grand Livre filtré sur ce compte.

### AC2: Détail Exhaustif
**Given** une ligne du Grand Livre
**When** je la regarde
**Then** je vois: Date, Référence (Pièce), Libellé, Débit, Crédit, et le Solde cumulé.

### AC3: Exportation de Fiche Compte
**Given** le Grand Livre d'un compte
**When** je demande un export
**Then** je reçois un PDF propre prêt à être audité.

## Tasks

- [ ] **Task 1: Page Grand Livre**
  - [ ] 1.1: Créer `src/pages/admin/accounting/GeneralLedger.tsx` avec filtres par date et par compte.

- [ ] **Task 2: Calcul de Solde Progressif**
  - [ ] 2.1: Optimiser la requête SQL pour calculer les soldes glissants sans impact de performance.

## Dev Notes

### Performance
- Indispensable de pouvoir filtrer par période pour éviter de charger 10 ans de données.
