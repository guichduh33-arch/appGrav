# Story 8.4: Financial Reports Suite — COGS, Discounts & Voids

Status: ready-for-dev

## Story

As a **Comptable**,
I want **des rapports financiers complets avec COGS automatique et analyse des remises/annulations**,
So that **je peux piloter la rentabilité et identifier les pertes de revenus**.

## Context (Audit Findings)

Tabs financiers existants :
- **ProfitLossTab** (288 lignes) : Production-ready, DatePicker, export, charts. **MAIS** appelle `view_profit_loss` qui n'est pas migrée → crash silencieux.
- **PaymentMethodTab** (135 lignes) : Legacy, pas d'export ni DatePicker.
- **SessionCashBalanceTab** (264 lignes) : Modern, export, DatePicker. Appelle `view_session_cash_balance` non migrée.
- **B2BReceivablesTab** (257 lignes) : Production-ready, export. Appelle `view_b2b_receivables` non migrée.
- **ExpensesTab** (335 lignes) : **Placeholder** — feature flag `false`, table expenses n'existe pas.
- **OutstandingPurchasePaymentTab** (298 lignes) : Export, **MAIS** montants payés estimés à 50% (TODO ligne 53).
- **PurchaseBySupplierTab** (142 lignes) : Legacy, pas d'export, 30j hardcodé.
- **PurchaseDetailsTab** (143 lignes) : Legacy, pas d'export, 30j hardcodé.

**Gaps critiques** :
- Pas de tab dédié "Discounts & Voids" analysis
- COGS dans ProfitLossTab dépend de view_profit_loss non migrée
- OutstandingPurchasePaymentTab a des données estimées (pas fiables)

## Acceptance Criteria

### AC1: ProfitLossTab fonctionnel après migration
**Given** la Story 8.0 a créé view_profit_loss
**When** j'ouvre le P&L
**Then** les données sont correctes : Revenue, COGS (basé sur recettes), Gross Profit, Margin %
**And** COGS = SUM(order_items.quantity × products.cost_price) pour les commandes payées
**And** la taxe collectée (10%) est affichée séparément

### AC2: Tab Discounts & Voids créé
**Given** il n'existe pas de rapport dédié aux remises et annulations
**When** j'ouvre le nouveau tab "Discounts & Voids"
**Then** je vois :
- KPI cards : Total Discounts, Total Voids, Void Rate (%), Discount Rate (%)
- Bar chart : Discounts + Voids par jour
- Table détaillée : Date, Order #, Type (discount/void/refund), Amount, Reason, Staff
**And** je peux filtrer par DateRangePicker et exporter en CSV/PDF

### AC3: Tabs achat normalisés
**Given** PurchaseBySupplierTab et PurchaseDetailsTab sont en Legacy
**When** ils sont mis à jour
**Then** chacun a : DateRangePicker, ExportButtons, Loader2 spinners

### AC4: OutstandingPurchasePaymentTab corrigé
**Given** les montants payés sont estimés à 50%
**When** les données sont disponibles
**Then** le montant payé est calculé depuis les paiements réels (b2b_payments ou po_payments si table existe)
**Or** si la table n'existe pas, le badge "~" (estimé) est clairement visible avec tooltip explicatif

## Tasks

- [ ] **Task 1: Vérifier ProfitLossTab après Story 8.0**
  - [ ] 1.1: Confirmer que view_profit_loss retourne des données correctes
  - [ ] 1.2: Ajouter la ligne "Tax Collected" dans le tableau de détail
  - [ ] 1.3: Vérifier le calcul COGS vs les recettes produits

- [ ] **Task 2: Créer tab Discounts & Voids**
  - [ ] 2.1: Créer `src/pages/reports/components/DiscountsVoidsTab.tsx`
  - [ ] 2.2: Requête : orders avec discount_amount > 0 OU status = 'cancelled' OU refund_amount > 0
  - [ ] 2.3: KPI cards (Total Discounts, Total Voids, Total Refunds, Loss Rate)
  - [ ] 2.4: Bar chart recharts (stacked: discounts + voids + refunds par jour)
  - [ ] 2.5: Table détaillée avec ExportButtons
  - [ ] 2.6: Ajouter au ReportsConfig + ReportsPage switch

- [ ] **Task 3: Normaliser PurchaseBySupplierTab**
  - [ ] 3.1: Ajouter DateRangePicker + ExportButtons
  - [ ] 3.2: Migrer vers useQuery pattern

- [ ] **Task 4: Normaliser PurchaseDetailsTab**
  - [ ] 4.1: Ajouter DateRangePicker + ExportButtons
  - [ ] 4.2: Migrer vers useQuery pattern

- [ ] **Task 5: Améliorer OutstandingPurchasePaymentTab**
  - [ ] 5.1: Vérifier si une table po_payments existe ou peut être créée
  - [ ] 5.2: Si oui, remplacer l'estimation 50% par les vrais montants
  - [ ] 5.3: Si non, améliorer l'UX du badge "estimé" avec tooltip explicatif

## Dev Notes

### Fichiers à modifier
- `src/pages/reports/components/ProfitLossTab.tsx` (288 lignes)
- `src/pages/reports/components/PurchaseBySupplierTab.tsx` (142 lignes)
- `src/pages/reports/components/PurchaseDetailsTab.tsx` (143 lignes)
- `src/pages/reports/components/OutstandingPurchasePaymentTab.tsx` (298 lignes)
- `src/pages/reports/ReportsConfig.tsx` — ajouter entrée Discounts & Voids
- `src/pages/reports/ReportsPage.tsx` — ajouter case dans le switch

### Fichiers à créer
- `src/pages/reports/components/DiscountsVoidsTab.tsx`

### Dépendances
- **Requiert Story 8.0** (view_profit_loss, view_session_cash_balance, view_b2b_receivables)
- **Requiert Story 8.1** (migration Pattern A → B pour PurchaseBySupplierTab, PurchaseDetailsTab)
