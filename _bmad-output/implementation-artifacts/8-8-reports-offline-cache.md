# Story 8.8: Reports Offline Cache (7 Days)

Status: ready-for-dev

## Story

As a **Manager**,
I want **consulter les rapports des 7 derniers jours même sans internet**,
So that **je peux analyser les performances de la semaine lors de coupures réseau**.

## Context (Audit Findings)

**Infrastructure offline existante** : 26 tables Dexie, sync engine complet pour orders/products/stock. **Aucune infrastructure pour les reports.**

- Pas de table `offline_reports_cache` dans Dexie
- Pas de report data dans le sync engine
- React Query staleTime = 5 minutes (trop court pour offline)
- Pas de hook `useOfflineReports`
- Pas de bandeau "Mode Offline" dans les reports
- ReportingService fait des appels Supabase directs (online-only)

**Vues DB existantes** : 14 vues dans migration 013 + 8 vues ajoutées en Story 8.0. Les données agrégées par jour sont idéales pour le cache (pas besoin de stocker chaque transaction).

## Acceptance Criteria

### AC1: Table Dexie pour cache reports
**Given** l'application synchronise les données
**When** les rapports sont consultés en ligne
**Then** les données agrégées des 7 derniers jours sont stockées dans Dexie `offline_reports_cache`
**And** chaque entrée contient : report_type, report_date, data (JSON), cached_at
**And** les entrées > 7 jours sont automatiquement purgées

### AC2: Disponibilité hors-ligne
**Given** l'application est offline
**When** j'ouvre un rapport
**Then** les données des 7 derniers jours s'affichent normalement depuis le cache
**And** un bandeau jaune en haut indique "Offline Mode — Data as of {last_sync_date}"
**And** les rapports nécessitant des données > 7 jours affichent "Online connection required for this date range"

### AC3: Types de données cachées
**Given** le cache offline
**When** je consulte les rapports suivants
**Then** ils sont disponibles offline :
- Daily KPIs (view_daily_kpis) — 7 jours
- Sales by Hour (view_hourly_sales) — 7 jours
- Payment Method stats (view_payment_method_stats) — 7 jours
- Category Sales (view_category_sales) — snapshot dernière sync
- Stock Alerts (view_stock_alerts) — snapshot dernière sync
- Inventory Valuation (view_inventory_valuation) — snapshot dernière sync

### AC4: Invalidation et mise à jour
**Given** l'application revient en ligne
**When** les données serveur ont changé
**Then** le cache est automatiquement rafraîchi en arrière-plan
**And** les données affichées sont mises à jour sans rechargement de page
**And** un indicateur discret "Syncing reports..." s'affiche pendant la mise à jour

## Tasks

- [ ] **Task 1: Schéma Dexie pour reports cache**
  - [ ] 1.1: Ajouter version Dexie avec table `offline_reports_cache`
  - [ ] 1.2: Schema : `++id, report_type, report_date, [report_type+report_date]`
  - [ ] 1.3: Interface TypeScript `IOfflineReportCache` dans `src/types/offline.ts`

- [ ] **Task 2: Service de cache reports**
  - [ ] 2.1: Créer `src/services/reports/offlineReportCache.ts`
  - [ ] 2.2: Méthodes : `cacheReportData(type, date, data)`, `getCachedReport(type, dateRange)`, `purgeExpired()`
  - [ ] 2.3: Purge automatique des données > 7 jours
  - [ ] 2.4: Timestamp de dernière sync par type de rapport

- [ ] **Task 3: Intégration sync engine**
  - [ ] 3.1: Ajouter routine `syncReports()` dans syncEngine.ts
  - [ ] 3.2: Après chaque sync réussie, appeler les vues DB et cacher les résultats
  - [ ] 3.3: Ne sync que les données daily_kpis, hourly_sales, payment_stats (pas les snapshots)
  - [ ] 3.4: Les snapshots (stock_alerts, inventory_valuation) sont cachés uniquement quand consultés

- [ ] **Task 4: Hook useOfflineReports**
  - [ ] 4.1: Créer `src/hooks/reports/useOfflineReports.ts`
  - [ ] 4.2: Si online : appeler ReportingService normalement + cacher le résultat
  - [ ] 4.3: Si offline : retourner les données depuis Dexie cache
  - [ ] 4.4: Retourner `isOffline`, `lastSyncDate`, `isCacheStale`

- [ ] **Task 5: Bandeau "Offline Mode"**
  - [ ] 5.1: Créer `src/components/reports/OfflineReportBanner.tsx`
  - [ ] 5.2: Afficher si offline avec date de dernière sync
  - [ ] 5.3: Afficher si date range dépasse le cache (> 7 jours)
  - [ ] 5.4: Intégrer dans ReportsPage.tsx (au-dessus du contenu)

- [ ] **Task 6: Intégrer dans les tabs principaux**
  - [ ] 6.1: Modifier DailySalesTab pour utiliser useOfflineReports
  - [ ] 6.2: Modifier SalesByHourTab pour utiliser useOfflineReports
  - [ ] 6.3: Modifier OverviewTab pour utiliser useOfflineReports
  - [ ] 6.4: Modifier StockWarningTab pour utiliser useOfflineReports (snapshot)

## Dev Notes

### Fichiers à créer
- `src/services/reports/offlineReportCache.ts`
- `src/hooks/reports/useOfflineReports.ts`
- `src/components/reports/OfflineReportBanner.tsx`

### Fichiers à modifier
- `src/lib/db.ts` — ajouter table offline_reports_cache (nouvelle version Dexie)
- `src/types/offline.ts` — ajouter IOfflineReportCache
- `src/services/sync/syncEngine.ts` — ajouter syncReports()
- `src/pages/reports/ReportsPage.tsx` — ajouter OfflineReportBanner
- Tabs cibles : DailySalesTab, SalesByHourTab, OverviewTab, StockWarningTab

### Architecture cache
```
Online: Component → useOfflineReports(type) → ReportingService → Supabase
                                             ↓ (side effect)
                                   offlineReportCache.cacheReportData()
                                             ↓
                                          Dexie DB

Offline: Component → useOfflineReports(type) → offlineReportCache.getCachedReport()
                                             ↓
                                          Dexie DB
```

### Estimation taille cache
- Daily KPIs : ~1 KB/jour × 7 = ~7 KB
- Hourly sales : ~2 KB/jour × 7 = ~14 KB
- Payment stats : ~0.5 KB/jour × 7 = ~3.5 KB
- Snapshots : ~10-50 KB chacun
- **Total estimé : < 200 KB** (très léger)

### Dependencies
- **Requiert Story 8.0** (done) — vues SQL existent
- Les tabs cibles sont deja Pattern B avec useQuery — pas de dependance sur 8.1
- Dexie est deja configure dans le projet (src/lib/db.ts)
