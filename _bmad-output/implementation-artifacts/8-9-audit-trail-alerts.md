# Story 8.9: Audit Trail & Smart Alerts

Status: ready-for-dev

## Story

As a **Manager**,
I want **un audit trail complet avec détection automatique d'anomalies et système d'alertes**,
So that **je détecte les fraudes, erreurs et manipulations rapidement**.

## Context (Audit Findings)

**AuditTab existant** (62 lignes) : Minimal — affiche les 50 dernières entrées sans filtre, sans export, sans pagination, sans visualisation des diffs (old/new values).

**anomalyAlerts.ts existant** (src/services/reports/anomalyAlerts.ts) : Bien structuré avec 10+ fonctions :
- `getSystemAlerts()`, `getAlertCounts()`, `markAlertAsRead()`, `resolveAlert()`
- `checkVoidRateAnomaly()` (>10% warning, >25% critical)
- `checkNegativeStockAnomaly()`, `checkPriceChangeAnomaly()` (>30%)
- Types : high_discount, excessive_discount, high_void, stock_anomaly, price_change, unusual_activity, late_payment, low_stock, negative_stock

**BLOCKER** : La table `system_alerts` n'existe pas dans les migrations → toutes les fonctions crashent. Résolu par Story 8.0.

**Settings/AuditPage** (src/pages/settings/SettingsPage.tsx route /settings/audit) : Un viewer audit existe déjà dans Settings avec filtres et export CSV. Le AuditTab dans Reports est un doublon minimal.

## Acceptance Criteria

### AC1: AuditTab enrichi
**Given** le tab Audit dans les rapports
**When** je consulte l'audit trail
**Then** je vois :
- DateRangePicker (pas limité aux 50 dernières entrées)
- Filtres : par action (void, refund, price_change, delete, etc.), par severity, par user
- Pagination (50 items/page avec navigation)
- Export CSV + PDF
- Colonnes : Timestamp, User, Action, Entity, Severity, Details
**And** chaque ligne est expandable pour voir old/new values (diff JSON)

### AC2: Dashboard Alertes
**Given** le système d'alertes est activé (table system_alerts créée en Story 8.0)
**When** j'ouvre le dashboard alertes
**Then** je vois :
- KPI cards : Critical alerts, Warning alerts, Unresolved total, Resolved today
- Liste d'alertes triée par severity puis date (critiques en premier)
- Chaque alerte montre : Type, Severity badge, Title, Description, Timestamp
- Filtres : par type, par severity, par status (unresolved/resolved/all)

### AC3: Résolution d'alertes
**Given** une alerte active
**When** je clique "Resolve"
**Then** un dialogue s'ouvre pour saisir les notes de résolution
**And** l'alerte est marquée resolved avec : resolved_by, resolved_at, resolved_notes
**And** elle disparaît de la vue "unresolved" mais reste visible dans "all"

### AC4: Détection automatique d'anomalies
**Given** le système tourne
**When** une anomalie est détectée
**Then** une alerte est créée automatiquement dans system_alerts pour :
- **Void rate élevé** : > 10% sur une session → warning, > 25% → critical
- **Stock négatif** : Un produit passe en stock < 0 → critical
- **Changement de prix important** : > 30% de variation → warning
**And** les checks s'exécutent :
- Void rate : à la clôture de chaque session POS
- Stock négatif : après chaque stock_movement
- Prix : après chaque modification produit

### AC5: Badge notification
**Given** des alertes non lues existent
**When** je regarde la navigation Reports
**Then** un badge rouge avec le nombre d'alertes critiques non lues est visible
**And** le badge se met à jour en temps réel (Supabase Realtime ou polling 60s)

## Tasks

- [ ] **Task 1: Refonte AuditTab**
  - [ ] 1.1: Remplacer le code actuel (62 lignes) par implémentation complète
  - [ ] 1.2: Ajouter DateRangePicker + useQuery avec pagination
  - [ ] 1.3: Ajouter filtres (action_type, severity, user dropdown)
  - [ ] 1.4: Ajouter ExportButtons CSV + PDF
  - [ ] 1.5: Implémenter l'expansion de ligne pour voir diff JSON (old_values / new_values)
  - [ ] 1.6: Formater le diff : highlight en rouge (removed) et vert (added)

- [ ] **Task 2: Créer AlertsDashboardTab**
  - [ ] 2.1: Créer `src/pages/reports/components/AlertsDashboardTab.tsx`
  - [ ] 2.2: KPI cards avec getAlertCounts() depuis anomalyAlerts.ts
  - [ ] 2.3: Liste d'alertes avec filtres (type, severity, status)
  - [ ] 2.4: Ajouter au ReportsConfig + ReportsPage switch

- [ ] **Task 3: Dialogue de résolution**
  - [ ] 3.1: Créer composant modal `ResolveAlertDialog`
  - [ ] 3.2: Champ textarea pour notes de résolution
  - [ ] 3.3: Appeler resolveAlert() avec user_id et notes
  - [ ] 3.4: Rafraîchir la liste après résolution

- [ ] **Task 4: Triggers de détection automatique**
  - [ ] 4.1: Créer `src/services/reports/anomalyTriggers.ts`
  - [ ] 4.2: `checkSessionAnomalies(sessionId)` — appelé à la clôture de session
  - [ ] 4.3: `checkStockAnomalies(productId)` — appelé après stock_movement
  - [ ] 4.4: `checkPriceAnomalies(productId, oldPrice, newPrice)` — appelé après modification produit
  - [ ] 4.5: Intégrer les appels aux points d'entrée existants (posSessionService, stockService, productService)

- [ ] **Task 5: Badge notification alertes**
  - [ ] 5.1: Créer `src/hooks/reports/useAlertBadge.ts`
  - [ ] 5.2: Polling toutes les 60 secondes pour getAlertCounts()
  - [ ] 5.3: Afficher badge dans la navigation Reports (ReportsPage sidebar)
  - [ ] 5.4: Badge rouge avec count des alertes critical non résolues

## Dev Notes

### Fichiers à modifier
- `src/pages/reports/components/AuditTab.tsx` (62 → ~300 lignes)
- `src/pages/reports/ReportsConfig.tsx` — ajouter Alerts Dashboard
- `src/pages/reports/ReportsPage.tsx` — ajouter case AlertsDashboard + badge

### Fichiers à créer
- `src/pages/reports/components/AlertsDashboardTab.tsx`
- `src/components/reports/ResolveAlertDialog.tsx`
- `src/services/reports/anomalyTriggers.ts`
- `src/hooks/reports/useAlertBadge.ts`

### Service existant à réutiliser
- `src/services/reports/anomalyAlerts.ts` — TOUT est déjà implémenté (getSystemAlerts, resolveAlert, createAlert, checks). Il suffit de :
  1. S'assurer que table system_alerts existe (Story 8.0)
  2. Brancher les triggers aux bons endroits
  3. Construire l'UI

### Dépendances
- **BLOQUANT : Requiert Story 8.0** (table system_alerts + RLS)
- Settings/AuditPage (/settings/audit) reste en place — le AuditTab dans Reports est une vue complémentaire orientée reporting, pas un doublon exact
