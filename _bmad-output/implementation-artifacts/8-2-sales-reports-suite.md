# Story 8.2: Sales Reports Suite

Status: ready-for-dev

## Story

As a **Manager**,
I want **consulter les rapports de ventes détaillés**,
So that **je comprends la performance commerciale par heure, produit et client**.

## Acceptance Criteria

### AC1: Sales Overview Dashboard
**Given** le rapport "Sales Overview"
**When** je sélectionne une période
**Then** je vois les KPIs principaux: Total Net Sales, Total Tax, Order Count, Average Transaction Value (ATV).

### AC2: Sales by Hour (Heatmap)
**Given** le rapport "Sales by Hour"
**When** je consulte le graphique
**Then** je vois les pics d'activité journaliers pour optimiser le staffing du personnel.

### AC3: Top Products Ranking
**Given** l'analyse des ventes
**When** je demande le classement des produits
**Then** le système affiche les 10 meilleures ventes en valeur et en volume.

## Tasks

- [ ] **Task 1: Queries de Ventes**
  - [ ] 1.1: Créer des fonctions Supabase RPC pour agréger les ventes par heure/jour afin d'optimiser les performances.

- [ ] **Task 2: Pages de Rapports**
  - [ ] 2.1: Créer `src/pages/admin/reports/SalesOverview.tsx`
  - [ ] 2.2: Créer `src/pages/admin/reports/ProductPerformance.tsx`

- [ ] **Task 3: Filtres Avancés**
  - [ ] 3.1: Permettre le filtrage par catégorie de produit et par session de caisse (shift).

## Dev Notes

### Calculation
- Net Sales = Gross Sales - Discounts.
- ATV = Net Sales / Number of Transactions.
