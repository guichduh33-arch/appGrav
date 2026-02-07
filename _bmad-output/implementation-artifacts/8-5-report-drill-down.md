# Story 8.5: Report Drill-Down — Navigation détaillée

Status: ready-for-dev

## Story

As a **Manager**,
I want **cliquer sur une ligne agrégée pour voir le détail des transactions**,
So that **je peux investiguer une anomalie ou un chiffre spécifique rapidement**.

## Context (Audit Findings)

Sur 25 tabs de rapports, **seul SalesCancellationTab** (287 lignes) implémente le drill-down :
- Pie chart par raison → table de détail par raison → liste des commandes

Les 24 autres tabs affichent des données "plates" sans interaction de navigation.

**Aucun composant Breadcrumb** n'existe pour la navigation drill-down.

## Acceptance Criteria

### AC1: Drill-down sur DailySalesTab
**Given** le tableau des ventes quotidiennes
**When** je clique sur une ligne (ex: "Lundi 3 Feb")
**Then** je vois la liste des transactions de ce jour avec : Order #, Time, Items, Total, Payment Method, Staff
**And** un breadcrumb "Sales > Daily Sales > Mon 3 Feb" permet de remonter

### AC2: Drill-down sur SalesByCategoryTab
**Given** le pie chart ou tableau des ventes par catégorie
**When** je clique sur une catégorie (ex: "Viennoiseries")
**Then** je vois les produits de cette catégorie avec : Product, Qty Sold, Revenue, Avg Price
**And** un breadcrumb "Sales > By Category > Viennoiseries" permet de remonter

### AC3: Drill-down sur ProductPerformanceTab
**Given** le classement des produits
**When** je clique sur un produit (ex: "Croissant")
**Then** je vois l'historique des ventes de ce produit : Date, Qty, Revenue, Order Count
**And** un graphique montre la tendance de vente sur la période sélectionnée

### AC4: Composant Breadcrumb réutilisable
**Given** une vue drill-down
**When** le breadcrumb s'affiche
**Then** chaque niveau est cliquable pour remonter
**And** le dernier élément (niveau actuel) n'est pas cliquable
**And** la transition entre niveaux est fluide (< 500ms)

### AC5: URL reflète le drill-down
**Given** je suis dans un drill-down (ex: Daily Sales > Mon 3 Feb)
**When** je regarde l'URL
**Then** les paramètres de drill-down sont dans l'URL (ex: `?drillDate=2026-02-03`)
**And** je peux partager le lien et la vue s'ouvre au bon niveau

## Tasks

- [ ] **Task 1: Composant ReportBreadcrumb**
  - [ ] 1.1: Créer `src/components/reports/ReportBreadcrumb.tsx`
  - [ ] 1.2: Props : `levels: { label: string, onClick?: () => void }[]`
  - [ ] 1.3: Styling : chevrons entre niveaux, dernier élément en bold non-cliquable
  - [ ] 1.4: Animation de transition entre niveaux

- [ ] **Task 2: Hook useDrillDown**
  - [ ] 2.1: Créer `src/hooks/reports/useDrillDown.ts`
  - [ ] 2.2: State : `drillStack: { level: string, params: Record<string, string> }[]`
  - [ ] 2.3: Actions : `drillInto(level, params)`, `drillBack()`, `drillReset()`
  - [ ] 2.4: Sync avec URL search params

- [ ] **Task 3: Drill-down DailySalesTab**
  - [ ] 3.1: Rendre les lignes du tableau cliquables (cursor pointer, hover effect)
  - [ ] 3.2: Vue détaillée : requête orders filtrée par date
  - [ ] 3.3: Intégrer ReportBreadcrumb + useDrillDown

- [ ] **Task 4: Drill-down SalesByCategoryTab**
  - [ ] 4.1: Rendre le pie chart et les lignes cliquables
  - [ ] 4.2: Vue détaillée : requête order_items filtrée par category_id
  - [ ] 4.3: Intégrer ReportBreadcrumb + useDrillDown

- [ ] **Task 5: Drill-down ProductPerformanceTab**
  - [ ] 5.1: Rendre les lignes cliquables
  - [ ] 5.2: Vue détaillée : historique ventes du produit (par jour, avec mini LineChart)
  - [ ] 5.3: Intégrer ReportBreadcrumb + useDrillDown

## Dev Notes

### Fichiers à créer
- `src/components/reports/ReportBreadcrumb.tsx`
- `src/hooks/reports/useDrillDown.ts`

### Fichiers à modifier
- `src/pages/reports/components/DailySalesTab.tsx`
- `src/pages/reports/components/SalesByCategoryTab.tsx`
- `src/pages/reports/components/ProductPerformanceTab.tsx`

### Pattern de référence
Utiliser SalesCancellationTab.tsx comme modèle de drill-down (pie → reason breakdown → detail list).

### Dependencies
- **Requiert Story 8.2** (top 10 produits dans ProductPerformanceTab)
- Les tabs cibles (DailySalesTab, SalesByCategoryTab, ProductPerformanceTab) sont deja Pattern B Modern avec useQuery — pas de dependance sur 8.1
