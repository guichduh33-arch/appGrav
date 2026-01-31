# Contexte Module Reports

### État Actuel
Le module Reports existe partiellement avec 11 composants sur 26 rapports définis dans la configuration.

| Catégorie | Implémenté | À implémenter |
|-----------|------------|---------------|
| **Overview** | Dashboard KPIs | - |
| **Sales** | Daily Sales, Product Performance, Sales by Category, Payment Methods | Sales by Customer, Sales by Hour, Profit/Loss, Cancellations |
| **Inventory** | Stock Movement, Inventory Valuation | Stock Balance, Stock Warning, Expired Stock |
| **Purchases** | Purchase Details, Purchase by Supplier | Purchase Returns, Outstanding Payments |
| **Finance** | - | Cash Balance, Receivables, Expenses |
| **Audit** | General Audit Log | Price Changes, Deleted Products |

### Infrastructure Existante
- **ReportingService** : 15+ méthodes de récupération de données
- **Système d'alertes** : Détection d'anomalies (voids, stock négatif, changements de prix)
- **Export CSV** : Sales, Inventory, Customers, Stock Movements, Purchase Orders
- **Vues SQL** : view_daily_kpis, view_payment_method_stats, view_inventory_valuation, view_stock_waste

### Objectifs
1. Compléter tous les rapports manquants (15+ rapports)
2. Ajouter Date Range Picker personnalisable
3. Implémenter filtres avancés (produit, catégorie, employé, méthode paiement)
4. Activer drill-down (catégorie → produits → transactions)
5. Ajouter export PDF professionnel
6. Configurer permissions par rôle

---
