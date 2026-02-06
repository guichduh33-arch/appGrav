# Story 8.2: Sales Reports Suite — KPIs manquants & améliorations

Status: ready-for-dev

## Story

As a **Manager**,
I want **des KPIs de ventes complets incluant la taxe, un vrai heatmap horaire et un top 10 produits**,
So that **je comprends la performance commerciale avec toutes les métriques nécessaires**.

## Context (Audit Findings)

Les tabs de ventes existants couvrent ~60% des besoins. Gaps identifiés :
- **Tax KPI absent** : Aucun tab n'isole la taxe (10% incluse dans les prix). `view_daily_kpis` a la colonne `total_tax` mais elle n'est pas affichée.
- **Top 10 → Top 5** : ProductPerformanceTab montre seulement top 5
- **Heatmap 2D absent** : SalesByHourTab a un bar chart coloré mais pas un vrai heatmap jour × heure
- **Filtrage avancé absent** : Pas de filtre par catégorie ou shift sur les tabs legacy

**Tabs existants (ventes)** : OverviewTab, DailySalesTab, SalesTab, SalesByHourTab, SalesByCategoryTab, SalesByCustomerTab, ProductPerformanceTab, PaymentMethodTab, SalesCancellationTab, SessionCashBalanceTab

## Acceptance Criteria

### AC1: Tax KPI affiché
**Given** le rapport Sales Overview (OverviewTab)
**When** je consulte les KPIs
**Then** je vois **Total Tax** en plus de Total Revenue, Order Count, ATV
**And** le calcul est : tax = total_revenue × 10/110
**And** le Net Revenue (HT) = total_revenue - tax est aussi affiché

### AC2: Top 10 produits
**Given** le rapport Product Performance
**When** les données s'affichent
**Then** le graphique montre les **10** meilleures ventes (pas 5)
**And** le tableau montre tous les produits triés par revenue desc
**And** les colonnes incluent : Product, Category, Qty Sold, Revenue, Avg Price, Margin %

### AC3: Heatmap horaire (jour × heure)
**Given** le rapport Sales by Hour
**When** les données s'affichent
**Then** en plus du bar chart existant, un **heatmap grid** (7 jours × 24 heures) montre l'intensité des ventes
**And** les cellules sont colorées par intensité (vert foncé = peak, blanc = zero)
**And** le heatmap est cliquable (voir AC drill-down story 8.5)

### AC4: Filtres avancés sur les rapports de ventes
**Given** les tabs de ventes
**When** je regarde les options de filtre
**Then** je peux filtrer par :
- Catégorie de produit
- Shift/Session de caisse
- Type de commande (dine_in, takeaway, delivery, b2b)
**And** les filtres utilisent le composant `ReportFilters` existant

## Tasks

- [ ] **Task 1: Ajouter Tax KPI à OverviewTab**
  - [ ] 1.1: Ajouter KPI card "Total Tax" (extraire de view_daily_kpis.total_tax)
  - [ ] 1.2: Ajouter KPI card "Net Revenue (HT)" = revenue - tax
  - [ ] 1.3: Formater en IDR arrondi à 100

- [ ] **Task 2: Étendre ProductPerformanceTab à Top 10**
  - [ ] 2.1: Modifier le slice de données de .slice(0, 5) → .slice(0, 10)
  - [ ] 2.2: Ajouter colonne Margin % = (revenue - qty*cost_price) / revenue * 100
  - [ ] 2.3: Ajouter colonne Category

- [ ] **Task 3: Heatmap horaire dans SalesByHourTab**
  - [ ] 3.1: Modifier la requête pour récupérer les données par jour × heure (pas juste heure agrégée)
  - [ ] 3.2: Créer composant `HourlyHeatmap` avec grid CSS 7×24
  - [ ] 3.3: Implémenter l'échelle de couleur (interpolation blanc → vert foncé)
  - [ ] 3.4: Ajouter tooltip au hover avec détails (jour, heure, revenue, orders)

- [ ] **Task 4: Filtres avancés**
  - [ ] 4.1: Intégrer `ReportFilters` dans OverviewTab, DailySalesTab, SalesTab
  - [ ] 4.2: Passer les filtres sélectionnés aux requêtes ReportingService
  - [ ] 4.3: Ajouter filtre "Order Type" (dine_in, takeaway, delivery, b2b) au composant ReportFilters

## Dev Notes

### Fichiers à modifier
- `src/pages/reports/components/OverviewTab.tsx` — ajouter Tax + Net Revenue KPIs
- `src/pages/reports/components/ProductPerformanceTab.tsx` — top 10 + margin + category
- `src/pages/reports/components/SalesByHourTab.tsx` — ajouter heatmap grid
- `src/components/reports/ReportFilters/ReportFilters.tsx` — ajouter filtre order_type

### Fichiers à créer
- `src/components/reports/HourlyHeatmap.tsx` — composant heatmap réutilisable

### Dépendances
- **Requiert Story 8.0** (RPC get_sales_comparison pour OverviewTab)
- **Requiert Story 8.1** (migration Pattern A → B pour les tabs legacy)
