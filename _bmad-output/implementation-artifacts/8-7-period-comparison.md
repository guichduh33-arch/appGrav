# Story 8.7: Period Comparison

Status: ready-for-dev

## Story

As a **Manager**,
I want **comparer deux périodes de temps**,
So that **je vois l'évolution de mon chiffre d'affaires (YoY, MoM)**.

## Acceptance Criteria

### AC1: Mode Comparaison
**Given** le Date Picker
**When** j'active l'option "Compare"
**Then** je peux choisir une période de référence (Période précédente, Même période l'an dernier).

### AC2: Indicateurs de Variation %
**Given** deux périodes comparées
**When** les chiffres s'affichent
**Then** le système calcule la variation en pourcentage.
**And** une flèche verte/rouge indique la tendance.

### AC3: Graphique Superposé
**Given** l'analyse de tendance
**When** je regarde le graphique linéaire
**Then** je vois deux lignes superposées (Période A vs Période B) pour identifier les changements de saisonnalité.

## Tasks

- [ ] **Task 1: Logique de Calcul de Variation**
  - [ ] 1.1: Créer des utilitaires de date (`date-fns`) pour calculer les périodes décalées (offsetting).

- [ ] **Task 2: UI Comparison Overlays**
  - [ ] 2.1: Mettre à jour les composants graphiques pour supporter `dual-series`.

## Dev Notes

### UX
- Important: Gérer les années bissextiles et les jours de la semaine (comparer un Lundi avec un Lundi, pas forcément avec la même date civile).
