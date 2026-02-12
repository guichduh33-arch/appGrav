# Phase 0 : Dashboard Executif (1 semaine)

## Objectif
Remplacer la redirection `/` -> `/pos` par un dashboard executif minimaliste montrant les KPIs cles via graphiques et tableaux.

## Nouveaux fichiers (2)

| Fichier | Lignes | Role |
|---------|--------|------|
| `src/hooks/useDashboardData.ts` | ~120 | Hook aggregeant 5 queries react-query |
| `src/pages/dashboard/DashboardPage.tsx` | ~280 | Page dashboard avec 4 sections |

## Fichiers a modifier (2)

| Fichier | Modification |
|---------|-------------|
| `src/App.tsx` | Lazy import `DashboardPage`, route `index` dans BackOfficeLayout, supprimer `Navigate to="/pos"` |
| `src/layouts/BackOfficeLayout.tsx` | Ajouter NavLink "Dashboard" avec icone `LayoutDashboard` en 1er item sidebar |

## Layout du Dashboard

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

## Sources de donnees (existantes, aucun backend nouveau)

| Section | Source | Query Key | Stale/Refresh |
|---------|--------|-----------|---------------|
| KPI Cards | `view_daily_kpis` direct (today+yesterday) | `['dashboard','kpis-today']` | 5min / 5min |
| Revenue Trend | `ReportingService.getDailySales()` | `['dashboard','revenue-trend']` | 10min / - |
| Top Produits | `ReportingService.getProductPerformance()` | `['dashboard','top-products']` | 10min / - |
| Paiements | `ReportingService.getPaymentMethodStats()` | `['dashboard','payment-methods']` | 10min / - |
| Stock Alerts | `useLowStockItems()` (hook existant) | `['inventory-alerts','low-stock']` | 5min / 5min |

## Composants reutilises
- `ComparisonKpiCard` de `@/components/reports/ComparisonKpiCard.tsx`
- `formatCurrency` de `@/utils/helpers`
- `Recharts` v3.6.0 : `AreaChart`, `PieChart`, `ResponsiveContainer`
- `cn()` de `@/lib/utils`
- Lucide: `DollarSign`, `ShoppingBag`, `TrendingUp`, `Users`, `AlertTriangle`, `LayoutDashboard`

---
