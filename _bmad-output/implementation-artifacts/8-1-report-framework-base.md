# Story 8.1: Report Framework Base

Status: ready-for-dev

## Story

As a **Manager**,
I want **un framework de reporting unifié**,
So that **tous les rapports ont une expérience utilisateur cohérente et fluide**.

## Acceptance Criteria

### AC1: Sélecteur de Période Universel
**Given** n'importe quel écran de rapport
**When** je regarde le header
**Then** je vois un "Date Range Picker" avec des raccourcis: Today, Yesterday, Last 7 Days, This Month, Custom.

### AC2: Visualisations Standardisées
**Given** des données de rapport
**When** elles s'affichent
**Then** le framework supporte nativement des graphiques Barres, Lignes, et des Tableaux triables
**And** les couleurs des graphiques respectent le thème de l'application.

### AC3: Performance de Chargement
**Given** un volume de données standard (~10,000 lignes)
**When** je change de période
**Then** le rapport se met à jour en moins de 2 secondes
**And** un skeleton screen s'affiche pendant le chargement.

## Tasks

- [ ] **Task 1: Base de l'Interface de Reporting**
  - [ ] 1.1: Créer le layout de base `src/components/admin/reports/ReportLayout.tsx`
  - [ ] 1.2: Intégrer `react-day-picker` pour le Date Range Picker.

- [ ] **Task 2: Librairie de Graphiques**
  - [ ] 2.1: Configurer `recharts` ou `chart.js` avec des wrappers réutilisables.

- [ ] **Task 3: Optimisation Data Fetching**
  - [ ] 3.1: Utiliser React Query avec mise en cache (staleTime) pour les rapports consultés fréquemment.

## Dev Notes

### Architecture
- Utilisation de CSS Grid pour les tableaux de bord (Dashboards).
- Responsive: les graphiques doivent s'adapter aux écrans mobiles/tablettes.
