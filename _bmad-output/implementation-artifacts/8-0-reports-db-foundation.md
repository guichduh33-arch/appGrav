# Story 8.0: Reports Database Foundation

Status: ready-for-dev

## Story

As a **Developer**,
I want **créer les migrations SQL manquantes pour les vues, RPCs et tables requises par le module reporting**,
So that **les 25 tabs de rapports existants fonctionnent correctement et le module alertes peut être activé**.

## Context (Audit Findings)

L'audit a révélé que le `ReportingService.ts` référence 8 vues SQL, 2 RPCs et 1 table qui n'existent pas dans les migrations. Cela cause des erreurs silencieuses dans les tabs existants (ProfitLossTab, SalesByCustomerTab, etc.) et bloque complètement la Story 8.9 (Alerts).

**Migration 013 existante** : 14 vues déjà définies (view_daily_kpis, view_inventory_valuation, view_payment_method_stats, view_product_sales, view_staff_performance, view_hourly_sales, view_category_sales, view_customer_insights, view_stock_alerts, view_session_summary, view_b2b_performance, view_production_summary, view_kds_queue_status, view_order_type_distribution).

## Acceptance Criteria

### AC1: Vues SQL manquantes créées
**Given** le ReportingService référence des vues inexistantes
**When** la migration est appliquée
**Then** les 8 vues suivantes existent et retournent des données correctes :
- `view_profit_loss` (revenue, cogs, gross_profit, margin_pct par jour)
- `view_sales_by_customer` (customer_name, company, type, orders, revenue, avg_basket, last_order)
- `view_sales_by_hour` (hour, order_count, total_sales, avg_order)
- `view_session_cash_balance` (cashier, open/close time, orders, revenue, cash_received, expected, counted, difference)
- `view_b2b_receivables` (customer, credit_limit, outstanding, unpaid_orders, days_overdue)
- `view_stock_warning` (product, sku, category, current_stock, min_stock, alert_level, suggested_reorder, value_at_risk)
- `view_expired_stock` (product, sku, stock, expiry_date, days_until_expiry, status, potential_loss)
- `view_unsold_products` (product, category, stock, last_sale, days_since_sale, total_sold, stock_value)

### AC2: RPCs manquantes créées
**Given** OverviewTab et SalesTab appellent des RPCs inexistantes
**When** la migration est appliquée
**Then** les fonctions suivantes existent :
- `get_sales_comparison(p_days INTEGER)` retourne current_period vs previous_period (revenue, orders, atv)
- `get_reporting_dashboard_summary()` retourne KPIs globaux (today_revenue, today_orders, pending_orders, low_stock_count)

### AC3: Table system_alerts créée
**Given** `anomalyAlerts.ts` référence la table `system_alerts` qui n'existe pas
**When** la migration est appliquée
**Then** la table `system_alerts` existe avec :
- `id` UUID PK
- `alert_type` VARCHAR (high_discount, excessive_discount, high_void, stock_anomaly, price_change, unusual_activity, late_payment, low_stock, negative_stock)
- `severity` VARCHAR (info, warning, critical)
- `title` TEXT NOT NULL
- `description` TEXT
- `reference_id` UUID (nullable, lien vers order/product/user)
- `reference_type` VARCHAR (order, product, user, stock_movement)
- `is_read` BOOLEAN DEFAULT false
- `is_resolved` BOOLEAN DEFAULT false
- `resolved_by` UUID FK user_profiles
- `resolved_at` TIMESTAMPTZ
- `resolved_notes` TEXT
- `created_at` TIMESTAMPTZ DEFAULT now()
**And** RLS est activé avec policies Authenticated read + Permission-based write (reports.configure)
**And** DELETE/UPDATE restreint (audit trail immuable sauf is_read, is_resolved, resolved_*)

### AC4: Vérification intégrité
**Given** les migrations sont appliquées
**When** je lance les tabs existants
**Then** ProfitLossTab, SalesByCustomerTab, SalesByHourTab, SessionCashBalanceTab, B2BReceivablesTab, StockWarningTab, ExpiredStockTab, UnsoldProductsTab retournent des données sans erreur

## Tasks

- [ ] **Task 1: Migration vues manquantes**
  - [ ] 1.1: Créer `supabase/migrations/YYYYMMDD_create_missing_report_views.sql`
  - [ ] 1.2: Implémenter view_profit_loss (JOIN orders + order_items + products pour COGS, groupé par jour, fenêtre paramétrable)
  - [ ] 1.3: Implémenter view_sales_by_customer (JOIN orders + customers + customer_categories)
  - [ ] 1.4: Implémenter view_sales_by_hour (basé sur orders, groupé par heure, fenêtre paramétrable)
  - [ ] 1.5: Implémenter view_session_cash_balance (basé sur pos_sessions + user_profiles)
  - [ ] 1.6: Implémenter view_b2b_receivables (JOIN b2b_orders + customers)
  - [ ] 1.7: Implémenter view_stock_warning (basé sur products avec seuils min_stock_level)
  - [ ] 1.8: Implémenter view_expired_stock (basé sur products avec batch_expiry_date)
  - [ ] 1.9: Implémenter view_unsold_products (LEFT JOIN products + order_items pour détecter invendus)

- [ ] **Task 2: Migration RPCs**
  - [ ] 2.1: Créer fonction `get_sales_comparison(p_days INTEGER DEFAULT 7)`
  - [ ] 2.2: Créer fonction `get_reporting_dashboard_summary()`

- [ ] **Task 3: Migration table system_alerts**
  - [ ] 3.1: Créer table `system_alerts` avec colonnes et contraintes
  - [ ] 3.2: Activer RLS + policies (read authenticated, write reports.configure)
  - [ ] 3.3: Ajouter policy restrictive : UPDATE limité aux colonnes is_read, is_resolved, resolved_*
  - [ ] 3.4: Ajouter index sur (is_resolved, severity, created_at) pour requêtes dashboard

- [ ] **Task 4: Vérification**
  - [ ] 4.1: Appliquer migration via `supabase db push` ou Supabase dashboard
  - [ ] 4.2: Vérifier que ReportingService.ts fonctionne pour les 8 vues
  - [ ] 4.3: Vérifier que anomalyAlerts.ts peut créer/lire des alertes

## Dev Notes

### Dépendances
- Cette story est un **prérequis bloquant** pour les stories 8.1 à 8.9
- Les 14 vues existantes (migration 013) ne doivent PAS être modifiées

### Conventions
- Utiliser `CREATE OR REPLACE VIEW` pour être idempotent
- Fenêtre temporelle par défaut : 90 jours pour les vues (cohérent avec view_daily_kpis)
- COGS = SUM(order_items.quantity * products.cost_price)
- Tax calculation : tax = total * 10/110 (10% incluse dans prix)
