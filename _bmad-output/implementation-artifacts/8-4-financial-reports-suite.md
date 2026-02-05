# Story 8.4: Financial Reports Suite

Status: ready-for-dev

## Story

As a **Comptable**,
I want **consulter les rapports financiers (P&L, Cash Flow)**,
So that **je peux piloter la rentabilité de la boulangerie**.

## Acceptance Criteria

### AC1: Profit & Loss (P&L) Simplifié
**Given** une période mensuelle
**When** je génère le P&L
**Then** je vois: Revenus (Sales) - Coûts des Marchandises Vendues (COGS) = Marge Brute.

### AC2: Récapitulatif des Paiements
**Given** le rapport "Payment Methods"
**When** je consulte la fin de journée
**Then** je vois la répartition des encaissements par Cash, Card, QRIS, EDC.

### AC3: Suivi des Remises et Pertes
**Given** l'analyse financière
**When** je regarde les "Discounts & Voids"
**Then** je vois le montant total des pertes de revenus dues aux annulations ou promotions.

## Tasks

- [ ] **Task 1: Calcul du COGS**
  - [ ] 1.1: Calculer automatiquement le coût des marchandises basés sur les recettes (fiches techniques) et les prix d'achat.

- [ ] **Task 2: Pages Financières**
  - [ ] 2.1: Créer `src/pages/admin/reports/ProfitAndLoss.tsx`
  - [ ] 2.2: Créer `src/pages/admin/reports/PaymentReconciliation.tsx`

## Dev Notes

### Formulas
- Gross Margin % = (Gross Profit / Net Sales) * 100.
- Les données doivent être exportables pour le comptable externe.
