# Story 8.2: Sales Reports Suite — KPIs manquants & ameliorations

Status: ready-for-dev

## Story

As a **Manager**,
I want **des KPIs de ventes complets incluant la taxe, un vrai heatmap horaire et un top 10 produits**,
So that **je comprends la performance commerciale avec toutes les metriques necessaires**.

## Context (Audit Revision 2026-02-07)

Les tabs de ventes sont **deja Pattern B Modern** avec DateRangePicker, ExportButtons, useQuery et recharts. Les gaps restants sont des enrichissements fonctionnels :

- **Tax KPI absent** : view_daily_kpis a la colonne `total_tax` mais elle n'est pas affichee dans OverviewTab
- **Top produits** : ProductPerformanceTab (153 lignes) — verifier si top 5 ou top 10, ajouter margin
- **Heatmap 2D absent** : SalesByHourTab (263 lignes) a un BarChart colore mais pas un vrai heatmap jour x heure
- **Filtrage avance** : ReportFilters existe mais pas integre dans tous les tabs de ventes

**Note** : Pas besoin de migration Pattern A vers B (deja fait).

## Acceptance Criteria

### AC1: Tax KPI affiche
**Given** le rapport Sales Overview (OverviewTab)
**When** je consulte les KPIs
**Then** je vois **Total Tax** en plus de Total Revenue, Order Count, ATV
**And** le calcul est : tax = total_revenue x 10/110
**And** le Net Revenue (HT) = total_revenue - tax est aussi affiche

### AC2: Top 10 produits avec margin
**Given** le rapport Product Performance
**When** les donnees s'affichent
**Then** le graphique montre les **10** meilleures ventes
**And** le tableau montre tous les produits tries par revenue desc
**And** les colonnes incluent : Product, Category, Qty Sold, Revenue, Avg Price, Margin %

### AC3: Heatmap horaire (jour x heure)
**Given** le rapport Sales by Hour
**When** les donnees s'affichent
**Then** en plus du bar chart existant, un **heatmap grid** (7 jours x 24 heures) montre l'intensite des ventes
**And** les cellules sont colorees par intensite (vert fonce = peak, blanc = zero)
**And** le heatmap est cliquable (voir AC drill-down story 8.5)

### AC4: Filtres avances sur les rapports de ventes
**Given** les tabs de ventes
**When** je regarde les options de filtre
**Then** je peux filtrer par :
- Categorie de produit
- Shift/Session de caisse
- Type de commande (dine_in, takeaway, delivery, b2b)
**And** les filtres utilisent le composant `ReportFilters` existant

## Tasks

- [ ] **Task 1: Ajouter Tax KPI a OverviewTab**
  - [ ] 1.1: Ajouter KPI card "Total Tax" (extraire de view_daily_kpis.total_tax)
  - [ ] 1.2: Ajouter KPI card "Net Revenue (HT)" = revenue - tax
  - [ ] 1.3: Formater en IDR arrondi a 100

- [ ] **Task 2: Etendre ProductPerformanceTab a Top 10 + Margin**
  - [ ] 2.1: Modifier le slice de donnees vers top 10
  - [ ] 2.2: Ajouter colonne Margin % = (revenue - qty*cost_price) / revenue * 100
  - [ ] 2.3: Ajouter colonne Category

- [ ] **Task 3: Heatmap horaire dans SalesByHourTab**
  - [ ] 3.1: Modifier la requete pour recuperer les donnees par jour x heure (pas juste heure agregee)
  - [ ] 3.2: Creer composant `HourlyHeatmap` avec grid CSS 7x24
  - [ ] 3.3: Implementer l'echelle de couleur (interpolation blanc -> vert fonce)
  - [ ] 3.4: Ajouter tooltip au hover avec details (jour, heure, revenue, orders)

- [ ] **Task 4: Filtres avances**
  - [ ] 4.1: Integrer `ReportFilters` dans OverviewTab, DailySalesTab, SalesTab
  - [ ] 4.2: Passer les filtres selectionnes aux requetes ReportingService
  - [ ] 4.3: Ajouter filtre "Order Type" (dine_in, takeaway, delivery, b2b) au composant ReportFilters

## Dev Notes

### Fichiers a modifier
- `src/pages/reports/components/OverviewTab.tsx` (205 lignes) — ajouter Tax + Net Revenue KPIs + filtres
- `src/pages/reports/components/ProductPerformanceTab.tsx` (153 lignes) — top 10 + margin + category
- `src/pages/reports/components/SalesByHourTab.tsx` (263 lignes) — ajouter heatmap grid
- `src/components/reports/ReportFilters/ReportFilters.tsx` — ajouter filtre order_type

### Fichiers a creer
- `src/components/reports/HourlyHeatmap.tsx` — composant heatmap reutilisable

### Dependencies
- **Requiert Story 8.0** (done) — RPCs get_sales_comparison, get_reporting_dashboard_summary
- **Pas de dependance sur 8.1** — les tabs sont deja Pattern B
