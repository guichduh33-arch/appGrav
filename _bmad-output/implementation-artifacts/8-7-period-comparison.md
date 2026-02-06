# Story 8.7: Period Comparison — Comparaison de périodes

Status: ready-for-dev

## Story

As a **Manager**,
I want **comparer deux périodes côte à côte (MoM, YoY)**,
So that **je vois l'évolution du chiffre d'affaires et identifie les tendances**.

## Context (Audit Findings)

**Comparaison existante** : Seuls OverviewTab et SalesTab ont une comparaison, **hardcodée** à 7 jours vs 7 jours précédents. Pas de sélection flexible.

**DateRangePicker actuel** : Ne supporte pas de sélection de période de comparaison. Il gère une seule plage de dates.

**recharts** : Supporte nativement les dual-series (2 lignes sur le même graphique).

## Acceptance Criteria

### AC1: Sélecteur de comparaison dans DateRangePicker
**Given** le DateRangePicker
**When** j'active le toggle "Compare to"
**Then** un sélecteur secondaire apparaît avec les options :
- Previous period (même durée, juste avant)
- Same period last year
- Custom period
**And** le sélecteur est optionnel (désactivé par défaut)

### AC2: Indicateurs de variation
**Given** deux périodes sont comparées
**When** les KPI cards s'affichent
**Then** chaque KPI montre :
- Valeur période actuelle (grande)
- Valeur période de référence (petite, grisée)
- Variation en % avec flèche (vert = hausse revenue/orders, rouge = baisse)
- Variation en valeur absolue

### AC3: Graphique superposé (dual-series)
**Given** la comparaison est activée
**When** un graphique linéaire s'affiche
**Then** deux lignes sont superposées :
- Ligne solide : période actuelle
- Ligne pointillée : période de référence
**And** la légende distingue les deux périodes
**And** les tooltips montrent les deux valeurs au hover

### AC4: Comparaison sur les tabs principaux
**Given** la fonctionnalité de comparaison
**When** elle est disponible
**Then** les tabs suivants la supportent :
- OverviewTab (KPIs avec variation)
- DailySalesTab (graphique dual-series)
- SalesByHourTab (bar chart groupé : current vs previous)
- ProfitLossTab (P&L avec colonnes current vs previous)

## Tasks

- [ ] **Task 1: Étendre DateRangePicker avec mode comparaison**
  - [ ] 1.1: Ajouter toggle "Compare to" dans `DateRangePicker.tsx`
  - [ ] 1.2: Ajouter sélecteur secondaire (Previous period, Same period last year, Custom)
  - [ ] 1.3: Étendre `useDateRange` pour retourner `comparisonRange: { from, to } | null`
  - [ ] 1.4: Sync comparisonRange avec URL params (`compareFrom`, `compareTo`)

- [ ] **Task 2: Composant KPI Card avec variation**
  - [ ] 2.1: Créer `src/components/reports/ComparisonKpiCard.tsx`
  - [ ] 2.2: Props : currentValue, previousValue, label, format (currency/number/percent)
  - [ ] 2.3: Calcul variation % = (current - previous) / previous × 100
  - [ ] 2.4: Flèche vert/rouge + badge variation
  - [ ] 2.5: Gestion edge case : previous = 0 (afficher "New" au lieu de +∞%)

- [ ] **Task 3: Graphique dual-series**
  - [ ] 3.1: Créer wrapper recharts `DualSeriesLineChart` component
  - [ ] 3.2: Aligner les axes X (jour 1 vs jour 1, pas date vs date)
  - [ ] 3.3: Ligne solide (actuelle) + ligne pointillée (référence)
  - [ ] 3.4: Légende avec labels "This period" / "Previous period"
  - [ ] 3.5: Tooltip avec les 2 valeurs

- [ ] **Task 4: Intégrer dans OverviewTab**
  - [ ] 4.1: Requête double période (2 appels parallèles à ReportingService)
  - [ ] 4.2: Remplacer KPI cards par ComparisonKpiCard
  - [ ] 4.3: Gestion état loading pour les 2 requêtes

- [ ] **Task 5: Intégrer dans DailySalesTab**
  - [ ] 5.1: Requête double période
  - [ ] 5.2: Graphique DualSeriesLineChart (revenue current vs previous)

- [ ] **Task 6: Intégrer dans ProfitLossTab**
  - [ ] 6.1: Requête double période
  - [ ] 6.2: Tableau avec colonnes Current | Previous | Variation pour chaque métrique

## Dev Notes

### Fichiers à modifier
- `src/components/reports/DateRangePicker/DateRangePicker.tsx`
- `src/hooks/reports/useDateRange.ts`
- `src/pages/reports/components/OverviewTab.tsx`
- `src/pages/reports/components/DailySalesTab.tsx`
- `src/pages/reports/components/SalesByHourTab.tsx`
- `src/pages/reports/components/ProfitLossTab.tsx`

### Fichiers à créer
- `src/components/reports/ComparisonKpiCard.tsx`
- `src/components/reports/DualSeriesLineChart.tsx`

### Calcul des périodes
```typescript
// Previous period : même durée, juste avant
const days = differenceInDays(to, from);
const prevTo = subDays(from, 1);
const prevFrom = subDays(prevTo, days);

// Same period last year
const prevFrom = subYears(from, 1);
const prevTo = subYears(to, 1);
```

### Dépendances
- **Requiert Story 8.1** (tabs migrés vers Pattern Modern avec DateRangePicker)
- **Requiert Story 8.0** (RPC get_sales_comparison pour OverviewTab)
- date-fns est déjà installé (differenceInDays, subDays, subYears)
