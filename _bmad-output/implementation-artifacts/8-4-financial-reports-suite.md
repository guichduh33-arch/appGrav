# Story 8.4: Financial Reports Suite — Discounts & Voids + Normalisation achats

Status: ready-for-dev

## Story

As a **Comptable**,
I want **un rapport dedie Discounts & Voids et des tabs achat normalises**,
So that **je peux piloter la rentabilite et identifier les pertes de revenus**.

## Context (Audit Revision 2026-02-07)

Etat reel des tabs financiers :
- **ProfitLossTab** (287 lignes) : **DEJA Pattern B** (DatePicker, export, recharts BarChart+LineChart). Fonctionne maintenant que view_profit_loss existe (Story 8.0 done).
- **PaymentMethodTab** (197 lignes) : **DEJA Pattern B** (DatePicker, export, recharts BarChart).
- **SessionCashBalanceTab** (263 lignes) : **DEJA Pattern B** (DatePicker, export). Fonctionne avec view_session_cash_balance.
- **B2BReceivablesTab** (256 lignes) : **DEJA Pattern B** (export). Fonctionne avec view_b2b_receivables.
- **ExpensesTab** (335 lignes) : Feature desactive — gere par Story 8.1.
- **OutstandingPurchasePaymentTab** (298 lignes) : **DEJA Pattern B** (export), mais montants payes estimes a 50%.
- **PurchaseBySupplierTab** (141 lignes) : **Pattern A Legacy** — pas d'export, 30j hardcode, recharts BarChart present.
- **PurchaseDetailsTab** (142 lignes) : **Pattern A Legacy** — pas d'export, 30j hardcode.
- **PurchaseByDateTab** (274 lignes) : **DEJA Pattern B** (DatePicker, export, recharts BarChart).

**Gaps restants** :
1. Pas de tab dedie "Discounts & Voids" (placeholder "Coming soon" dans ReportsConfig)
2. PurchaseBySupplierTab et PurchaseDetailsTab sont Pattern A Legacy
3. OutstandingPurchasePaymentTab a des estimations non fiables

## Acceptance Criteria

### AC1: ProfitLossTab verifie post-migration
**Given** la Story 8.0 a cree view_profit_loss
**When** j'ouvre le P&L
**Then** les donnees sont correctes : Revenue, COGS, Gross Profit, Margin %
**And** la taxe collectee (10%) est affichee separement
**Note** : Pas de refactoring — juste verification et ajout ligne Tax si manquante.

### AC2: Tab Discounts & Voids cree
**Given** il n'existe pas de rapport dedie aux remises et annulations
**When** j'ouvre le nouveau tab "Discounts & Voids"
**Then** je vois :
- KPI cards : Total Discounts, Total Voids, Void Rate (%), Discount Rate (%)
- Bar chart recharts : Discounts + Voids par jour (stacked)
- Table detaillee : Date, Order #, Type (discount/void/refund), Amount, Reason, Staff
**And** je peux filtrer par DateRangePicker et exporter en CSV/PDF

### AC3: PurchaseBySupplierTab normalise
**Given** PurchaseBySupplierTab est en Pattern A Legacy (141 lignes)
**When** il est mis a jour
**Then** il utilise : useDateRange + DateRangePicker, useQuery, ExportButtons, Loader2 spinner
**And** le recharts BarChart existant est conserve

### AC4: PurchaseDetailsTab normalise
**Given** PurchaseDetailsTab est en Pattern A Legacy (142 lignes)
**When** il est mis a jour
**Then** il utilise : useDateRange + DateRangePicker, useQuery, ExportButtons, Loader2 spinner

### AC5: OutstandingPurchasePaymentTab ameliore
**Given** les montants payes sont estimes a 50%
**When** les donnees sont calculees
**Then** le montant paye utilise les paiements reels si disponibles
**Or** si pas de table de paiement, le badge "~" (estime) est clairement visible avec tooltip explicatif

## Tasks

- [ ] **Task 1: Verifier ProfitLossTab**
  - [ ] 1.1: Confirmer que view_profit_loss retourne des donnees correctes
  - [ ] 1.2: Ajouter la ligne "Tax Collected" dans le tableau de detail si absente
  - [ ] 1.3: Verifier le calcul COGS vs les recettes produits

- [ ] **Task 2: Creer tab Discounts & Voids**
  - [ ] 2.1: Creer `src/pages/reports/components/DiscountsVoidsTab.tsx`
  - [ ] 2.2: Requete : orders avec discount_amount > 0 OU status = 'cancelled' OU refund_amount > 0
  - [ ] 2.3: KPI cards (Total Discounts, Total Voids, Total Refunds, Loss Rate)
  - [ ] 2.4: Bar chart recharts (stacked: discounts + voids + refunds par jour)
  - [ ] 2.5: Table detaillee avec ExportButtons
  - [ ] 2.6: Ajouter le case dans ReportsPage.tsx switch (remplacer le placeholder)

- [ ] **Task 3: Normaliser PurchaseBySupplierTab**
  - [ ] 3.1: Remplacer useState/useEffect par useQuery + useDateRange
  - [ ] 3.2: Ajouter DateRangePicker + ExportButtons
  - [ ] 3.3: Conserver le recharts BarChart existant

- [ ] **Task 4: Normaliser PurchaseDetailsTab**
  - [ ] 4.1: Remplacer useState/useEffect par useQuery + useDateRange
  - [ ] 4.2: Ajouter DateRangePicker + ExportButtons

- [ ] **Task 5: Ameliorer OutstandingPurchasePaymentTab**
  - [ ] 5.1: Verifier si une table po_payments existe
  - [ ] 5.2: Si oui, remplacer l'estimation 50% par les vrais montants
  - [ ] 5.3: Si non, ameliorer l'UX du badge "estime" avec tooltip explicatif

## Dev Notes

### Fichiers a modifier
- `src/pages/reports/components/ProfitLossTab.tsx` (287 lignes) — verification + Tax line
- `src/pages/reports/components/PurchaseBySupplierTab.tsx` (141 lignes) — migration Pattern B
- `src/pages/reports/components/PurchaseDetailsTab.tsx` (142 lignes) — migration Pattern B
- `src/pages/reports/components/OutstandingPurchasePaymentTab.tsx` (298 lignes) — fix estimation
- `src/pages/reports/ReportsPage.tsx` — remplacer placeholder discounts_voids

### Fichiers a creer
- `src/pages/reports/components/DiscountsVoidsTab.tsx`

### Pattern de reference
Utiliser PurchaseByDateTab.tsx (274 lignes) comme modele — c'est le tab achat Pattern B le plus complet.

### Dependencies
- **Requiert Story 8.0** (done) — view_profit_loss, view_session_cash_balance, view_b2b_receivables
- **Pas de dependance sur 8.1** — les tabs cibles sont soit deja Pattern B, soit migres ici
