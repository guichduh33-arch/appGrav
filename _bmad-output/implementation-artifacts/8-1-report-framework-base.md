# Story 8.1: Report Framework Base — Cleanup & Skeleton Screens

Status: ready-for-dev

## Story

As a **Manager**,
I want **que le module rapports soit propre, sans placeholders orphelins, avec des skeleton screens pendant le chargement**,
So that **l'experience utilisateur est professionnelle et coherente sur tous les tabs**.

## Context (Audit Revision 2026-02-07)

L'audit a revele que les 6 tabs cibles de la version precedente de cette story (OverviewTab, DailySalesTab, SalesTab, SalesByCategoryTab, ProductPerformanceTab, PaymentMethodTab) sont **deja migres vers Pattern B Modern** avec DateRangePicker, ExportButtons, useQuery et recharts.

**Etat reel du codebase** :
- **20/25 tabs** sont Pattern B (Modern) — 80%
- **5 tabs Legacy** restants : InventoryTab, StockMovementTab, PurchaseDetailsTab, PurchaseBySupplierTab, AuditTab
  - InventoryTab et StockMovementTab sont traites par **Story 8.3**
  - PurchaseDetailsTab et PurchaseBySupplierTab sont traites par **Story 8.4**
  - AuditTab est traite par **Story 8.9**

**Ce qui reste a faire dans cette story** :
1. SalesReportsPage.tsx est un **mockup avec donnees hardcodees** (218 lignes, mock €) — a supprimer
2. ReportsConfig a **6 placeholders non implementes** (sales_by_date, sales_items_by_date, sales_by_brand, incoming_stock, outgoing_stock, purchase_returns) — a nettoyer
3. **Aucun skeleton screen** n'existe — a creer
4. ExpensesTab est desactive (feature flag false, table expenses inexistante) — a documenter ou masquer

## Acceptance Criteria

### AC1: SalesReportsPage mockup supprime
**Given** SalesReportsPage.tsx contient des donnees mockees (€, dates 2023)
**When** le cleanup est effectue
**Then** le fichier est supprime
**And** toute reference dans le router est nettoyee

### AC2: Placeholders marques "Coming Soon" proprement
**Given** 6 rapports dans ReportsConfig n'ont pas d'implementation
**When** je consulte ces rapports
**Then** chacun affiche un placeholder propre avec icone et message "This report is planned for a future release"
**And** le placeholder est un composant reutilisable `ReportPlaceholder.tsx`

### AC3: Skeleton screens
**Given** un rapport charge ses donnees
**When** la requete est en cours
**Then** un skeleton screen (pas juste un spinner) s'affiche pour les KPI cards et les tableaux
**And** la transition vers les donnees reelles est fluide (pas de "jump")

### AC4: ExpensesTab gere proprement
**Given** ExpensesTab est desactive car la table expenses n'existe pas
**When** je consulte le rapport Expenses
**Then** un message clair indique "Expenses tracking will be available when the Accounting module (Epic 9) is implemented"
**And** le tab n'apparait pas dans la navigation principale (cache de ReportsConfig)

## Tasks

- [ ] **Task 1: Supprimer SalesReportsPage mockup**
  - [ ] 1.1: Supprimer `src/pages/reports/SalesReportsPage.tsx`
  - [ ] 1.2: Verifier et nettoyer les references dans le router

- [ ] **Task 2: Composant ReportPlaceholder**
  - [ ] 2.1: Creer `src/components/reports/ReportPlaceholder.tsx`
  - [ ] 2.2: Props : `title: string, description?: string`
  - [ ] 2.3: Design : icone Construction/Wrench + message + suggestion de rapport alternatif
  - [ ] 2.4: Utiliser dans ReportsPage.tsx pour les 6 IDs non implementes

- [ ] **Task 3: Composant ReportSkeleton**
  - [ ] 3.1: Creer `src/components/reports/ReportSkeleton.tsx`
  - [ ] 3.2: Variante KPI : 4 cards skeleton (pulse animation)
  - [ ] 3.3: Variante Table : header + 10 lignes skeleton
  - [ ] 3.4: Variante Chart : rectangle skeleton avec dimensions du chart
  - [ ] 3.5: Integrer dans les tabs Pattern B existants (remplacer Loader2 spinners)

- [ ] **Task 4: Masquer ExpensesTab**
  - [ ] 4.1: Ajouter `hidden: true` ou `disabled: true` au rapport expenses dans ReportsConfig
  - [ ] 4.2: Filtrer les rapports hidden de la navigation sidebar

## Dev Notes

### Fichiers a supprimer
- `src/pages/reports/SalesReportsPage.tsx` (218 lignes, mockup pur)

### Fichiers a creer
- `src/components/reports/ReportPlaceholder.tsx`
- `src/components/reports/ReportSkeleton.tsx`

### Fichiers a modifier
- `src/pages/reports/ReportsPage.tsx` — utiliser ReportPlaceholder pour les cases non implementes
- `src/pages/reports/ReportsConfig.tsx` — ajouter flag hidden pour ExpensesTab

### Dependencies
- **Aucune dependance bloquante** — cette story peut demarrer immediatement
- Les tabs Legacy seront migres par les stories 8.3, 8.4 et 8.9
