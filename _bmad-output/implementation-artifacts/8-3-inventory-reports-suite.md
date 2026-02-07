# Story 8.3: Inventory Reports Suite — Gaps & Améliorations

Status: ready-for-dev

## Story

As a **Manager**,
I want **des rapports d'inventaire complets avec exports et date ranges dynamiques**,
So that **je gère le stock efficacement avec des données à jour et exportables**.

## Context (Audit Findings)

4 tabs inventaire existent, couverture ~80% :
- **StockWarningTab** (240 lignes) : Production-ready, export CSV+PDF, 3 niveaux d'alerte. Pas de DatePicker.
- **ExpiredStockTab** (248 lignes) : Production-ready, export CSV+PDF. Pas de DatePicker.
- **InventoryTab** (126 lignes) : MVP, pas d'export, pas de recherche, pas de DatePicker.
- **StockMovementTab** (94 lignes) : MVP, pas d'export, date hardcodée 30j, pas de recherche.

**Gaps principaux** :
- StockMovementTab n'a pas d'export ni de DatePicker
- InventoryTab n'a pas d'export ni de recherche
- Suggestion qté à commander existe dans StockWarningTab mais pas dans InventoryTab

## Acceptance Criteria

### AC1: StockMovementTab enrichi
**Given** le rapport Stock Movements
**When** je consulte les mouvements
**Then** je vois un DateRangePicker (preset: last30days)
**And** je peux exporter en CSV et PDF
**And** je peux filtrer par type de mouvement (sale, waste, purchase, adjustment, transfer)
**And** je peux rechercher par nom de produit ou SKU
**And** des KPI cards résument : Total In, Total Out, Net Movement, Movement Count

### AC2: InventoryTab enrichi
**Given** le rapport Inventory Valuation
**When** je consulte le stock
**Then** je peux exporter en CSV et PDF
**And** je peux rechercher par nom, SKU ou catégorie
**And** les colonnes incluent : Product, SKU, Category, Stock, Unit, Cost Price, Stock Value, Status
**And** le tri est possible sur chaque colonne

### AC3: Données de valorisation précises
**Given** les données d'inventaire
**When** je consulte la valorisation
**Then** Stock Value = current_stock × cost_price (basé sur dernier prix d'achat)
**And** les totaux en bas du tableau montrent : Total Items, Total Value at Cost, Total Value at Retail

## Tasks

- [ ] **Task 1: Enrichir StockMovementTab**
  - [ ] 1.1: Ajouter useDateRange + DateRangePicker (remplacer 30j hardcodé)
  - [ ] 1.2: Ajouter ExportButtons (CSV + PDF)
  - [ ] 1.3: Ajouter 4 KPI cards (Total In, Total Out, Net, Count)
  - [ ] 1.4: Ajouter filtre par movement_type (dropdown)
  - [ ] 1.5: Ajouter recherche produit/SKU
  - [ ] 1.6: Migrer vers useQuery pattern

- [ ] **Task 2: Enrichir InventoryTab**
  - [ ] 2.1: Ajouter ExportButtons (CSV + PDF)
  - [ ] 2.2: Ajouter recherche (nom, SKU, catégorie)
  - [ ] 2.3: Ajouter tri par colonne (click header)
  - [ ] 2.4: Ajouter ligne de totaux en bas du tableau

## Dev Notes

### Fichiers à modifier
- `src/pages/reports/components/StockMovementTab.tsx` (94 → ~250 lignes)
- `src/pages/reports/components/InventoryTab.tsx` (126 → ~200 lignes)

### Modèle à suivre
- StockWarningTab.tsx et ExpiredStockTab.tsx sont les références (Pattern B, export, spinners)

### Dependencies
- **Requiert Story 8.0** (done) — view_stock_warning, view_expired_stock existent
