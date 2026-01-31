# Dépendances Techniques - Module Reports

### Nouvelles Vues SQL Requises

```sql
-- Vue Profit/Loss
CREATE VIEW view_profit_loss AS ...

-- Vue Sales by Customer
CREATE VIEW view_sales_by_customer AS ...

-- Vue Stock Warning
CREATE VIEW view_stock_warning AS ...

-- Vue Expired Stock
CREATE VIEW view_expired_stock AS ...

-- Vue Cash Balance par session
CREATE VIEW view_session_cash_balance AS ...
```

### Nouveaux Types TypeScript

```typescript
// src/types/reporting.ts - Extensions
interface ProfitLossReport { ... }
interface SalesByCustomerReport { ... }
interface StockWarningReport { ... }
interface ExpiredStockReport { ... }
```

### Composants UI Requis

- `DateRangePicker.tsx` - Sélecteur de période
- `ReportFilters.tsx` - Panneau de filtres avancés
- `DrilldownTable.tsx` - Table avec navigation drill-down
- `PdfExporter.tsx` - Générateur PDF (jspdf ou react-pdf)

---

*Extension PRD générée avec le workflow BMAD v1.0 - 2026-01-28*

