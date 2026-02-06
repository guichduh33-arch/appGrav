# Story 8.1: Report Framework Base — Normalisation & Charts

Status: ready-for-dev

## Story

As a **Manager**,
I want **que tous les rapports utilisent un framework cohérent avec graphiques, filtres et exports**,
So that **l'expérience utilisateur est uniforme et professionnelle sur les 25 tabs de reporting**.

## Context (Audit Findings)

Le codebase a **2 patterns coexistants** dans les 25 tabs :
- **Pattern A (Legacy)** : 6 tabs avec useState, dates hardcodées, pas d'export, pas de DatePicker (OverviewTab, DailySalesTab, SalesTab, SalesByCategoryTab, ProductPerformanceTab, PaymentMethodTab)
- **Pattern B (Modern)** : 7 tabs avec useQuery, DateRangePicker, ExportButtons, Loader2 spinners

**Framework existant (production-ready)** :
- `DateRangePicker` (10 presets, calendrier custom, sync URL) — src/components/reports/DateRangePicker/
- `ExportButtons` (CSV + PDF, watermark, permissions) — src/components/reports/ExportButtons/
- `ReportFilters` (5 types de filtres) — src/components/reports/ReportFilters/
- `useDateRange`, `useReportFilters`, `useReportPermissions` — src/hooks/reports/
- **recharts 3.6.0** installé mais utilisé dans **0 tabs** actuellement

**Incohérences** :
- `ReportsConfig.tsx` a des IDs qui ne matchent pas le switch de `ReportsPage.tsx`
- `SalesReportsPage.tsx` est un mockup avec données hardcodées

## Acceptance Criteria

### AC1: Tabs Legacy migrés vers Pattern Modern
**Given** les 6 tabs Legacy (OverviewTab, DailySalesTab, SalesTab, SalesByCategoryTab, ProductPerformanceTab, PaymentMethodTab)
**When** ils sont refactorisés
**Then** chacun utilise :
- `useDateRange` hook avec `DateRangePicker`
- `useQuery` pour le data fetching (pas useState + useEffect)
- `ExportButtons` avec config CSV + PDF
- `Loader2` spinner pendant le chargement
- Message d'erreur en cas d'échec de requête

### AC2: Recharts intégré dans les tabs avec graphiques
**Given** recharts 3.6.0 est installé mais non utilisé
**When** les tabs affichent des graphiques
**Then** ils utilisent des composants recharts (`BarChart`, `LineChart`, `PieChart`, `AreaChart`) au lieu de divs custom
**And** les couleurs respectent le thème Tailwind de l'app
**And** les tooltips sont formatés (currency IDR, pourcentages)

### AC3: ReportsConfig réconcilié
**Given** ReportsConfig.tsx a des IDs incohérents
**When** la config est corrigée
**Then** chaque rapport dans ReportsConfig a un ID qui correspond exactement au switch dans ReportsPage.tsx
**And** les clés i18n sont remplacées par des strings English directes (i18n suspendu)
**And** SalesReportsPage.tsx mockup est supprimé ou intégré

### AC4: Skeleton screens
**Given** un rapport charge ses données
**When** la requête est en cours
**Then** un skeleton screen (pas juste un spinner) s'affiche pour les KPI cards et les tableaux
**And** la transition vers les données réelles est fluide (pas de "jump")

## Tasks

- [ ] **Task 1: Migrer OverviewTab vers Pattern Modern**
  - [ ] 1.1: Remplacer useState/useEffect par useQuery + useDateRange
  - [ ] 1.2: Remplacer `getSalesComparison()` hardcodé par appel avec date range dynamique
  - [ ] 1.3: Ajouter ExportButtons, Loader2 spinner, error state

- [ ] **Task 2: Migrer DailySalesTab**
  - [ ] 2.1: Ajouter DateRangePicker (remplacer le 30j hardcodé)
  - [ ] 2.2: Remplacer le bar chart custom par recharts BarChart
  - [ ] 2.3: Ajouter ExportButtons PDF (CSV existe déjà)

- [ ] **Task 3: Migrer SalesTab**
  - [ ] 3.1: Ajouter DateRangePicker
  - [ ] 3.2: Remplacer pie/bar charts customs par recharts PieChart/BarChart
  - [ ] 3.3: Ajouter ExportButtons

- [ ] **Task 4: Migrer SalesByCategoryTab**
  - [ ] 4.1: Ajouter DateRangePicker + ExportButtons
  - [ ] 4.2: Remplacer pie chart custom par recharts PieChart

- [ ] **Task 5: Migrer ProductPerformanceTab**
  - [ ] 5.1: Ajouter DateRangePicker + ExportButtons
  - [ ] 5.2: Étendre top 5 → top 10 produits
  - [ ] 5.3: Remplacer bar chart par recharts BarChart horizontal

- [ ] **Task 6: Migrer PaymentMethodTab**
  - [ ] 6.1: Ajouter DateRangePicker + ExportButtons
  - [ ] 6.2: Remplacer bar chart par recharts BarChart

- [ ] **Task 7: Réconcilier ReportsConfig**
  - [ ] 7.1: Aligner les IDs de ReportsConfig avec le switch de ReportsPage.tsx
  - [ ] 7.2: Remplacer les clés i18n par des strings English
  - [ ] 7.3: Supprimer ou nettoyer SalesReportsPage.tsx

- [ ] **Task 8: Composant Skeleton Screen réutilisable**
  - [ ] 8.1: Créer `src/components/reports/ReportSkeleton.tsx` (KPI cards skeleton + table skeleton)
  - [ ] 8.2: Intégrer dans les 6 tabs migrés

## Dev Notes

### Fichiers à modifier
- `src/pages/reports/components/OverviewTab.tsx` (97 lignes → ~200)
- `src/pages/reports/components/DailySalesTab.tsx` (160 lignes)
- `src/pages/reports/components/SalesTab.tsx` (119 lignes)
- `src/pages/reports/components/SalesByCategoryTab.tsx` (135 lignes)
- `src/pages/reports/components/ProductPerformanceTab.tsx` (117 lignes)
- `src/pages/reports/components/PaymentMethodTab.tsx` (135 lignes)
- `src/pages/reports/ReportsConfig.tsx`
- `src/pages/reports/ReportsPage.tsx`

### Pattern à suivre (modèle)
Utiliser `SalesByHourTab.tsx` (264 lignes) ou `SalesCancellationTab.tsx` (287 lignes) comme référence — ce sont les meilleures implémentations Pattern B.

### Dépendances
- **Requiert Story 8.0** (vues SQL) pour que getSalesComparison() et getDashboardSummary() fonctionnent
- recharts est déjà dans package.json, pas besoin de `npm install`
