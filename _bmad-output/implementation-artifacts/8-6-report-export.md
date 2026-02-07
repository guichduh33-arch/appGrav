# Story 8.6: Report Export — Polish Pass & Performance

Status: ready-for-dev

## Story

As a **Manager**,
I want **que tous les exports soient performants, avec indicateur de progression et nommage coherent**,
So that **l'export de gros volumes est fiable et les fichiers sont bien organises**.

## Context (Audit Revision 2026-02-07)

**Couverture reelle** : 20/25 tabs sont Pattern B Modern et la plupart ont deja ExportButtons. Les 5 tabs Legacy restants recoivent l'export via les stories 8.3, 8.4 et 8.9.

Apres completion des stories 8.3, 8.4 et 8.9, la couverture export sera ~100%.

**Ce qui reste a traiter dans cette story** :
1. **Pas d'indicateur de progression** pour les gros exports (> 5000 lignes)
2. **Nommage fichiers non standardise** — chaque tab definit son propre format
3. **Performance non testee** sur gros volumes

**Infrastructure existante** :
- `ExportButtons` component : CSV + PDF, permissions, loading states
- `csvExport.ts` : helpers (formatCurrency, formatDate, BOM UTF-8)
- `pdfExport.ts` : jsPDF + autoTable, watermark user+date, page footers
- Permission check : `reports.export`

## Acceptance Criteria

### AC1: Couverture export 100%
**Given** les stories 8.3, 8.4, 8.9 sont completees
**When** je verifie chaque tab
**Then** tous les tabs avec donnees ont ExportButtons (CSV + PDF)
**And** le bouton est disabled si le tableau est vide

### AC2: Export gros volumes avec progression
**Given** un rapport avec > 5000 lignes
**When** je lance un export CSV ou PDF
**Then** un indicateur de progression s'affiche si l'export prend > 2 secondes
**And** CSV se termine en < 5 secondes
**And** PDF se termine en < 10 secondes avec pagination correcte (30-50 lignes/page)

### AC3: Nommage des fichiers coherent
**Given** un export est genere
**When** le fichier est telecharge
**Then** le nom suit le format : `{report_name}_{from_date}_{to_date}.{csv|pdf}`
**And** les dates sont au format `YYYY-MM-DD`
**And** report_name est en kebab-case (ex: `daily-sales_2026-02-01_2026-02-07.csv`)

## Tasks

- [ ] **Task 1: Audit final couverture export**
  - [ ] 1.1: Apres stories 8.3, 8.4, 8.9 — verifier que tous les tabs ont ExportButtons
  - [ ] 1.2: Lister les tabs eventuellement oublies et corriger

- [ ] **Task 2: Indicateur de progression**
  - [ ] 2.1: Modifier `ExportButtons` pour afficher une barre de progression si export > 2s
  - [ ] 2.2: Pour CSV : utiliser chunked processing avec requestAnimationFrame si > 5000 lignes
  - [ ] 2.3: Pour PDF : utiliser progress callback de jsPDF autoTable

- [ ] **Task 3: Standardiser nommage fichiers**
  - [ ] 3.1: Creer `src/lib/exportFilename.ts` avec `buildExportFilename(reportName, dateRange)`
  - [ ] 3.2: Migrer tous les ExportConfig.filename pour utiliser cette fonction

- [ ] **Task 4: Tests de performance**
  - [ ] 4.1: Tester export CSV avec 10 000 lignes (< 5s)
  - [ ] 4.2: Tester export PDF avec 5 000 lignes (< 10s)
  - [ ] 4.3: Verifier que le thread UI ne freeze pas

## Dev Notes

### Fichiers a modifier
- `src/components/reports/ExportButtons/ExportButtons.tsx` — progression indicator
- `src/services/reports/csvExport.ts` — chunked processing si besoin
- `src/services/reports/pdfExport.ts` — progress callback

### Fichiers a creer
- `src/lib/exportFilename.ts` — utilitaire de nommage

### Dependencies
- **Requiert Stories 8.3, 8.4, 8.9** (ajout d'export aux tabs restants)
- Cette story est un **polish pass** transversal — a executer en dernier dans le groupe {8.5, 8.6, 8.7}
