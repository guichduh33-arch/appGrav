# Plan Final d'Amelioration AppGrav - Pre-Production

**Date**: 12 fevrier 2026
**Statut**: Approuve
**Duree estimee**: 24 semaines (4 phases)

## Contexte

AppGrav est un ERP/POS pour boulangerie avec 10 epics completes, ~118K LOC, 1,650 tests, 62 migrations. Le systeme est fonctionnel mais necessite un dernier passage d'amelioration avant mise en production. Ce plan couvre : un dashboard executif (page d'accueil), les corrections de securite/qualite, et le roadmap complet des fonctionnalites manquantes.

---

## Phase 0 : Dashboard Executif (1 semaine)

### Objectif
Remplacer la redirection `/` -> `/pos` par un dashboard executif minimaliste montrant les KPIs cles via graphiques et tableaux.

### Nouveaux fichiers (2)

| Fichier | Lignes | Role |
|---------|--------|------|
| `src/hooks/useDashboardData.ts` | ~120 | Hook aggregeant 5 queries react-query |
| `src/pages/dashboard/DashboardPage.tsx` | ~280 | Page dashboard avec 4 sections |

### Fichiers a modifier (2)

| Fichier | Modification |
|---------|-------------|
| `src/App.tsx` | Lazy import `DashboardPage`, route `index` dans BackOfficeLayout, supprimer `Navigate to="/pos"` |
| `src/layouts/BackOfficeLayout.tsx` | Ajouter NavLink "Dashboard" avec icone `LayoutDashboard` en 1er item sidebar |

### Layout du Dashboard

```
+------------------------------------------------------------------+
| Good morning, [User]                              12 Feb 2026    |
+------------------------------------------------------------------+
| [Revenue Rp4.2M] [Orders 198] [Avg Rp21,200] [Customers 45]    |
|   +12.5% ^          +5.2% ^     +7.1% ^         -2% v           |
+------------------------------------------------------------------+
| Revenue Trend (30 jours)                                         |
| AreaChart avec gradient bleu, axe Y en millions IDR              |
+------------------------------------------------------------------+
| Top 5 Produits (barres)    |  Methodes de Paiement (donut)      |
| 1. Croissant ███████  45   |       Cash 62%                     |
| 2. Baguette  █████    38   |       QRIS 25%                     |
| 3. Pain Choc ████     25   |       Card 13%                     |
+------------------------------------------------------------------+
| Alertes Inventaire (max 10 lignes)               View all ->     |
| Produit       Stock  Min   Status                                |
| Butter        2 kg   5     [critical]                            |
| Flour         8 kg   10    [warning]                             |
+------------------------------------------------------------------+
```

### Sources de donnees (existantes, aucun backend nouveau)

| Section | Source | Query Key | Stale/Refresh |
|---------|--------|-----------|---------------|
| KPI Cards | `view_daily_kpis` direct (today+yesterday) | `['dashboard','kpis-today']` | 5min / 5min |
| Revenue Trend | `ReportingService.getDailySales()` | `['dashboard','revenue-trend']` | 10min / - |
| Top Produits | `ReportingService.getProductPerformance()` | `['dashboard','top-products']` | 10min / - |
| Paiements | `ReportingService.getPaymentMethodStats()` | `['dashboard','payment-methods']` | 10min / - |
| Stock Alerts | `useLowStockItems()` (hook existant) | `['inventory-alerts','low-stock']` | 5min / 5min |

### Composants reutilises
- `ComparisonKpiCard` de `@/components/reports/ComparisonKpiCard.tsx`
- `formatCurrency` de `@/utils/helpers`
- `Recharts` v3.6.0 : `AreaChart`, `PieChart`, `ResponsiveContainer`
- `cn()` de `@/lib/utils`
- Lucide: `DollarSign`, `ShoppingBag`, `TrendingUp`, `Users`, `AlertTriangle`, `LayoutDashboard`

---

## Phase 1 : Stabilisation & Qualite (Semaines 1-4)

### 1.1 Securite Critique
- [ ] **Supprimer `.env` du depot git** et ajouter a `.gitignore`
- [ ] **Rotation des cles** Supabase (anon key + service key exposees)
- [ ] Creer `.env.example` avec placeholders (existe deja mais verifier completude)

### 1.2 CI/CD Pipeline (GitHub Actions)
Creer `.github/workflows/ci.yml` :
- [ ] TypeScript check (`tsc -b`)
- [ ] ESLint (`npm run lint`)
- [ ] Tests (`npx vitest run`)
- [ ] Build (`vite build`)
- [ ] Bundle size check (fail si > 1MB gzipped)

### 1.3 Nettoyage Code
- [ ] Migrer `console.*` restants vers `@/utils/logger` (12 fichiers identifies)
  - `StockProductionPage.tsx` (7 instances)
  - `authStore.ts`, `coreSettingsStore.ts`
  - Services/hooks offline
- [ ] Resoudre les 10 TODO/FIXME restants ou les documenter comme "post-launch"
- [ ] Finaliser migration CSS -> Tailwind (18 fichiers CSS restants)

### 1.4 Bundle Optimization
- [ ] Ajouter `rollup-plugin-visualizer` pour analyser le bundle
- [ ] Verifier que le code splitting fonctionne (vendor-react, vendor-query, vendor-supabase deja configures)
- [ ] Lazy load `recharts` et `jspdf` (uniquement charges sur /reports et /dashboard)
- [ ] Cible : < 500KB initial bundle (hors lazy chunks)

### 1.5 Tests Critiques Manquants
- [ ] Test E2E du flux POS complet (add -> modify -> pay -> receipt)
- [ ] Test du dashboard (nouveau)
- [ ] Verifier les 2 tests flaky documentes

---

## Phase 2 : Fonctionnalites Manquantes P1 (Semaines 5-8)

### 2.1 Email Notifications (P1 - Impact High)
- [ ] Implementer edge function `send-email` avec SMTP (Resend/SendGrid)
- [ ] Templates : `order_confirmation`, `daily_summary`, `low_stock_alert`
- [ ] Tables : `email_templates`, `email_log` (avec RLS)
- [ ] UI : Activer le settings SMTP existant (`/settings/notifications`)

### 2.2 Integration QRIS/Midtrans (P1 - Impact High)
- [ ] Edge function `payment-webhook` pour notifications Midtrans
- [ ] Service `paymentGatewayService.ts` (QR generation, status check)
- [ ] Tables : `payment_transactions`, `payment_reconciliation`
- [ ] UI : QR code dans PaymentModal pour paiements QRIS
- [ ] Rapprochement quotidien automatique

### 2.3 KDS Ameliore (P2 - Impact Medium)
- [ ] Ticket aging avec couleurs (vert 0-5min, jaune 5-10min, rouge 10min+)
- [ ] Seuils configurables par station (deja dans settings Epic 10)
- [ ] Alertes audio pour tickets en retard
- [ ] Dashboard vitesse de service (avg prep time par station)
- [ ] Vue "all-day count" (compteur par produit en preparation)

---

## Phase 3 : Fonctionnalites Manquantes P2 (Semaines 9-16)

### 3.1 Module Depenses (P2)
- [ ] Tables : `expense_categories`, `expenses`
- [ ] Pages : `/expenses`, `/expenses/new`, `/expenses/categories`
- [ ] Integration dans rapport Profit & Loss existant
- [ ] Activer `ExpensesTab` (actuellement desactive par feature flag)

### 3.2 Split Bill / Check Model (P2)
- [ ] Table `order_checks` (par invite)
- [ ] Modifier `order_items` avec `check_id`
- [ ] Table `check_payments` (paiement par check)
- [ ] UI : Bouton "Split Bill" dans POS avec drag-drop items entre checks

### 3.3 Integration e-Faktur (P2)
- [ ] Edge function `generate-efaktur` (CSV/XML pour DJP)
- [ ] Table `tax_invoices` avec numerotation conforme
- [ ] Validation NPWP
- [ ] Export compatible DJP

### 3.4 Rapports Programmes (P3)
- [ ] Tables : `report_schedules`, `report_history`
- [ ] Edge function pour generation automatique (cron Supabase)
- [ ] UI : Configuration des rapports automatiques dans Settings

---

## Phase 4 : Scale & Observabilite (Semaines 17-24)

### 4.1 Multi-Location (P3 - Effort Very High)
- [ ] Table `locations` + `location_transfers` + `location_transfer_items`
- [ ] Ajouter `location_id` sur `orders`, `stock_movements`, `pos_sessions`, `inventory_counts`
- [ ] Catalogue produit centralise, pricing par location
- [ ] Dashboard multi-location avec comparaison
- [ ] Transferts inter-locations

### 4.2 Monitoring & Observabilite
- [ ] Integration Sentry (error tracking + performance)
- [ ] Source maps pour production debugging
- [ ] Web Vitals (LCP, FID, CLS)
- [ ] Metriques business : sync failure rate, offline duration, checkout time

### 4.3 Tests E2E (Playwright)
- [ ] Setup Playwright avec fixtures
- [ ] 5 parcours critiques : POS checkout, offline order, void/refund, stock adjustment, shift management
- [ ] Integration CI/CD
- [ ] Tests de regression visuelle

### 4.4 Architecture Avancee (si necessaire)
- [ ] Evaluer SQLite via OPFS pour remplacer IndexedDB (meilleure performance offline)
- [ ] Delta sync avec `updated_at` tracking (remplacer full refresh)
- [ ] Parallelisation du sync engine (batch processing)
- [ ] API publique versionee (si besoin d'integrations tierces)

---

## Ordre d'Execution Recommande

| Priorite | Tache | Duree | Pre-requis |
|----------|-------|-------|------------|
| **Immediat** | Phase 0 : Dashboard | 3-4 jours | - |
| **Immediat** | 1.1 Securite `.env` | 1 heure | - |
| **Semaine 1** | 1.2 CI/CD Pipeline | 1 jour | - |
| **Semaine 1-2** | 1.3 Nettoyage code | 2 jours | - |
| **Semaine 2** | 1.4 Bundle optimization | 1 jour | - |
| **Semaine 3-4** | 1.5 Tests critiques | 3 jours | CI/CD |
| **Semaine 5-6** | 2.1 Email | 5 jours | - |
| **Semaine 5-8** | 2.2 QRIS/Midtrans | 10 jours | - |
| **Semaine 7-8** | 2.3 KDS ameliore | 5 jours | - |
| **Semaine 9-10** | 3.1 Depenses | 5 jours | - |
| **Semaine 11-12** | 3.2 Split Bill | 8 jours | - |
| **Semaine 11-12** | 3.3 e-Faktur | 5 jours | - |
| **Semaine 13-14** | 3.4 Rapports programmes | 4 jours | Email |
| **Semaine 15-20** | 4.1 Multi-Location | 20 jours | - |
| **Semaine 17-20** | 4.2 Monitoring | 3 jours | - |
| **Semaine 21-24** | 4.3 E2E Tests | 5 jours | CI/CD |

---

## Verification

### Dashboard
1. `npm run dev` -> naviguer vers `/` -> verifier que le dashboard s'affiche
2. Verifier les 4 KPI cards avec donnees du jour
3. Verifier le graphe de tendance 30 jours
4. Verifier le donut des paiements
5. Verifier les alertes inventaire
6. Sidebar : icone Dashboard en premier, active quand sur `/`
7. `npx vitest run src/pages/dashboard` -> tests passent
8. `npm run build` -> pas d'erreur TypeScript

### Securite
1. Verifier que `.env` est dans `.gitignore`
2. Verifier que les cles Supabase sont rotees dans le dashboard Supabase

### CI/CD
1. Push sur une branche -> GitHub Actions se declenchent
2. Lint + TypeScript + Tests + Build passent

### Bundle
1. `npm run build` -> verifier la taille du bundle dans la sortie Vite
2. Cible : chunk initial < 500KB gzipped
