# Story 8.6: Report Export — Couverture complète CSV & PDF

Status: ready-for-dev

## Story

As a **Manager**,
I want **pouvoir exporter tous les rapports en CSV et PDF**,
So that **je peux partager les données avec le comptable ou les archiver**.

## Context (Audit Findings)

**Infrastructure existante (production-ready)** :
- `ExportButtons` component avec CSV + PDF, permissions, loading states
- `csvExport.ts` avec helpers (formatCurrency, formatDate, BOM UTF-8)
- `pdfExport.ts` avec jsPDF + autoTable, watermark user+date, page footers
- Permission check : `reports.export`

**Couverture actuelle** : 13/25 tabs ont l'export (52%)

**Tabs SANS export (12)** :
- OverviewTab, SalesTab, SalesByCategoryTab, ProductPerformanceTab, PaymentMethodTab (→ traités en Story 8.1)
- InventoryTab, StockMovementTab (→ traités en Story 8.3)
- PurchaseBySupplierTab, PurchaseDetailsTab (→ traités en Story 8.4)
- AuditTab (→ traité en Story 8.9)
- DailySalesTab (a CSV mais pas PDF)
- SalesTab (ni CSV ni PDF)

**Note** : Les stories 8.1, 8.3, 8.4, 8.9 ajoutent déjà l'export aux tabs concernés. Cette story couvre les aspects transversaux restants.

## Acceptance Criteria

### AC1: 100% des tabs ont l'export
**Given** les 25+ tabs de rapports
**When** un tab affiche des données
**Then** les boutons CSV et PDF sont visibles (si l'utilisateur a la permission `reports.export`)
**And** le bouton est disabled si le tableau est vide

### AC2: Export gros volumes
**Given** un rapport avec > 5000 lignes
**When** je lance un export CSV
**Then** l'export se termine en < 5 secondes
**And** un indicateur de progression s'affiche si > 2 secondes

### AC3: Export gros volumes PDF
**Given** un rapport avec > 5000 lignes
**When** je lance un export PDF
**Then** l'export se termine en < 10 secondes
**And** le PDF est paginé correctement (30-50 lignes/page)
**And** le watermark (user + date) est sur chaque page

### AC4: Nommage des fichiers cohérent
**Given** un export est généré
**When** le fichier est téléchargé
**Then** le nom suit le format : `{report_name}_{from_date}_{to_date}.{csv|pdf}`
**And** les dates sont au format `YYYY-MM-DD`

## Tasks

- [ ] **Task 1: Audit final de couverture export**
  - [ ] 1.1: Après stories 8.1, 8.3, 8.4 — vérifier que tous les tabs ont ExportButtons
  - [ ] 1.2: Lister les tabs éventuellement oubliés

- [ ] **Task 2: Indicateur de progression pour gros exports**
  - [ ] 2.1: Modifier `ExportButtons` pour afficher une barre de progression si export > 2s
  - [ ] 2.2: Pour CSV : utiliser chunked processing avec requestAnimationFrame
  - [ ] 2.3: Pour PDF : utiliser progress callback de jsPDF autoTable

- [ ] **Task 3: Standardiser le nommage des fichiers**
  - [ ] 3.1: Vérifier que tous les ExportConfig.filename utilisent le même pattern
  - [ ] 3.2: Créer une fonction utilitaire `buildExportFilename(reportName, dateRange)`

- [ ] **Task 4: Test de performance**
  - [ ] 4.1: Tester l'export CSV avec 10 000 lignes (< 5s)
  - [ ] 4.2: Tester l'export PDF avec 5 000 lignes (< 10s)
  - [ ] 4.3: Vérifier que le thread UI ne freeze pas pendant l'export

## Dev Notes

### Fichiers à modifier
- `src/components/reports/ExportButtons/ExportButtons.tsx` — progression indicator
- `src/services/reports/csvExport.ts` — chunked processing si besoin
- `src/services/reports/pdfExport.ts` — progress callback

### Fichiers à créer
- `src/lib/exportFilename.ts` — utilitaire de nommage

### Dépendances
- **Requiert Stories 8.1, 8.3, 8.4** (ajout d'export aux tabs restants)
- Cette story est principalement un **polish pass** transversal
