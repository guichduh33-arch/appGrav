# Story 8.5: Report Drill-Down

Status: ready-for-dev

## Story

As a **Manager**,
I want **faire du drill-down sur les rapports (cliquer pour voir le détail)**,
So that **je peux investiguer une anomalie ou un chiffre spécifique**.

## Acceptance Criteria

### AC1: Interaction au Clic
**Given** un graphique ou une ligne de tableau agrégée (ex: Ventes de Lundi)
**When** je clique dessus
**Then** le système affiche la liste détaillée des transactions qui composent ce chiffre.

### AC2: Fil d'Ariane (Breadcrumb)
**Given** une vue détaillée (drill-down)
**When** je navigue en profondeur
**Then** un breadcrumb en haut de la page me permet de remonter instantanément au niveau supérieur.

### AC3: Navigation Rapide
**Given** un clic de drill-down
**When** les données chargent
**Then** la transition est fluide (< 500ms) et l'interface ne "saute" pas.

## Tasks

- [ ] **Task 1: Système de Navigation Contextuelle**
  - [ ] 1.1: Définir les routes imbriquées pour les rapports dans `AppRouter.tsx`
  - [ ] 1.2: Passer les paramètres de filtre (date, ID) via l'URL.

- [ ] **Task 2: Component Breadcrumbs**
  - [ ] 2.1: Créer `src/components/ui/ReportBreadcrumbs.tsx` dynamique.

## Dev Notes

### State Management
- Utiliser l'URL comme source unique de vérité pour les filtres lors du drill-down afin de permettre le partage de liens.
