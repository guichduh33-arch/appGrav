# Phase 3 : Fonctionnalites Manquantes P2 (Semaines 9-16)

## 3.1 Module Depenses (P2)
- [ ] Tables : `expense_categories`, `expenses`
- [ ] Pages : `/expenses`, `/expenses/new`, `/expenses/categories`
- [ ] Integration dans rapport Profit & Loss existant
- [ ] Activer `ExpensesTab` (actuellement desactive par feature flag)

## 3.2 Split Bill / Check Model (P2)
- [ ] Table `order_checks` (par invite)
- [ ] Modifier `order_items` avec `check_id`
- [ ] Table `check_payments` (paiement par check)
- [ ] UI : Bouton "Split Bill" dans POS avec drag-drop items entre checks

## 3.3 Integration e-Faktur (P2)
- [ ] Edge function `generate-efaktur` (CSV/XML pour DJP)
- [ ] Table `tax_invoices` avec numerotation conforme
- [ ] Validation NPWP
- [ ] Export compatible DJP

## 3.4 Rapports Programmes (P3)
- [ ] Tables : `report_schedules`, `report_history`
- [ ] Edge function pour generation automatique (cron Supabase)
- [ ] UI : Configuration des rapports automatiques dans Settings

---
