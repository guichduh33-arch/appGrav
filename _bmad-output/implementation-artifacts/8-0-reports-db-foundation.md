# Story 8.0: Reports Database Foundation

Status: done

## Story

As a **Developer**,
I want **creer les migrations SQL manquantes pour les vues, RPCs et tables requises par le module reporting**,
So that **les 25 tabs de rapports existants fonctionnent correctement et le module alertes peut etre active**.

## Resolution

Migration `20260206120000_create_missing_report_views.sql` deployee avec succes.

### Vues creees (8)
- `view_profit_loss` — revenue, cogs, gross_profit, margin_pct par jour
- `view_sales_by_customer` — customer_name, company, type, orders, revenue, avg_basket, last_order
- `view_sales_by_hour` — hour, order_count, total_sales, avg_order
- `view_session_cash_balance` — cashier, open/close time, orders, revenue, cash_received, expected, counted, difference
- `view_b2b_receivables` — customer, credit_limit, outstanding, unpaid_orders, days_overdue
- `view_stock_warning` — product, sku, category, current_stock, min_stock, alert_level, suggested_reorder, value_at_risk
- `view_expired_stock` — product, sku, stock, expiry_date, days_until_expiry, status, potential_loss
- `view_unsold_products` — product, category, stock, last_sale, days_since_sale, total_sold, stock_value

### RPCs creees (2)
- `get_sales_comparison(p_days INTEGER)` — current_period vs previous_period
- `get_reporting_dashboard_summary()` — KPIs globaux

### Table creee (1)
- `system_alerts` — avec RLS, policies, index sur (is_resolved, severity, created_at)

### Verification
- Les 14 vues existantes (migration 013) non modifiees
- ReportingService.ts compatible avec toutes les vues
- anomalyAlerts.ts peut creer/lire des alertes via system_alerts
