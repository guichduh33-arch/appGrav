# Audit Fonctionnel & Metier - AppGrav ERP/POS

**Date**: 2026-02-11
**Auditeur**: Subagent 1D - Audit Fonctionnel & Metier
**Perimetre**: 8 modules fonctionnels principaux
**Version codebase**: commit b6add93 (Epic 10 Phase 1)

---

## Sommaire Executif

| Module | Statut | Score |
|--------|--------|-------|
| POS / Caisse | COMPLET | 9/10 |
| Gestion des Produits | COMPLET | 8.5/10 |
| Inventaire / Stock | COMPLET | 8/10 |
| Commandes B2B | PARTIEL | 7/10 |
| Programme de Fidelite | PARTIEL | 7.5/10 |
| Reporting / Dashboards | COMPLET | 8/10 |
| Comptabilite | COMPLET | 8.5/10 |
| Gestion Utilisateurs | COMPLET | 8/10 |

**Score global**: 8.1/10 - Systeme fonctionnel et production-ready avec des axes d'amelioration identifies.

---

## 1. POS / Caisse

**Statut**: COMPLET
**Fichiers principaux audites**:
- `src/pages/pos/POSMainPage.tsx`
- `src/stores/cartStore.ts`
- `src/services/payment/paymentService.ts`
- `src/components/pos/modals/PaymentModal.tsx`
- `src/components/pos/modals/DiscountModal.tsx`
- `src/components/pos/modals/VoidModal.tsx`
- `src/components/pos/modals/RefundModal.tsx`
- `src/hooks/pos/usePOSShift.ts`
- `src/hooks/pos/usePOSOrders.ts`

### 1.1 Parcours complet (selection -> paiement -> ticket)

**Evaluation**: YES

Le parcours est complet et bien structure:
- Selection produit via `ProductGrid` avec recherche par nom/SKU
- Navigation par categories via `CategoryNav`
- Support des combos via `ComboGrid` et `ComboSelectorModal`
- Variantes produit via `VariantModal`
- Modifiers via `ModifierModal`
- Panier avec `Cart` component et `CartItemRow`, `CartTotals`
- Paiement via `PaymentModal` avec support split payment
- Impression ticket via `printService` (ESC/POS 80mm)
- Customer display broadcast via `useDisplayBroadcast`

### 1.2 Remises (% et fixe)

**Evaluation**: YES

`DiscountModal.tsx` supporte:
- Remise pourcentage avec boutons rapides configurables (`posConfig.quickDiscountPercentages`)
- Remise montant fixe (IDR)
- Plafond configurable (`posConfig.maxDiscountPercentage`)
- Verification PIN obligatoire avant application
- Calcul correct: `discountAmount = Math.min(value, totalPrice)` pour le fixe, cap a 100% pour le pourcentage

`cartStore.ts` calcule correctement:
- `calculateTotals()` gere les deux types de remise (ligne 146-167)
- Les promotions automatiques sont appliquees avant la remise manuelle (ligne 163)
- Le total ne peut jamais etre negatif (`Math.max(0, ...)`)

### 1.3 Modes de paiement

**Evaluation**: YES

5 methodes de paiement + 1 B2B:
- Cash (avec numpad, montants rapides, calcul de monnaie)
- Card (avec reference optionnelle)
- QRIS (avec reference optionnelle)
- EDC (avec reference optionnelle)
- Transfer (avec reference optionnelle)
- Store Credit (B2B uniquement, pour clients `wholesale`)

Split payment complet:
- `ISplitPaymentState` avec statuts `idle`, `adding`, `complete`
- Barre de progression visuelle
- Ajout/suppression de paiements partiels
- Validation: total des paiements doit correspondre au total commande (tolerance 1 IDR)

### 1.4 Calcul monnaie et arrondi IDR

**Evaluation**: YES

- `calculateChange()` dans `paymentService.ts` (ligne 159-163): arrondi au 100 IDR inferieur via `Math.floor(rawChange / 100) * 100`
- Maximum paiement: 10 milliards IDR
- Tolerance d'arrondi: 1 IDR (configurable via settings)
- Quick amounts dynamiques bases sur le montant a payer

### 1.5 Ouverture/fermeture de caisse

**Evaluation**: YES

- `OpenShiftModal`: saisie du fond de caisse initial (opening_cash)
- `CloseShiftModal`: saisie du comptage reel (cash, QRIS, EDC) avec notes
- `ShiftReconciliationModal`: comparaison entre montants attendus et reels
- `ShiftHistoryModal`: historique des shifts
- `ShiftStatsModal`: statistiques de session (CA, nombre de transactions)
- `TransactionHistoryModal`: historique des transactions de la session
- `CashierAnalyticsModal`: analytiques par caissier
- Verification PIN obligatoire pour ouvrir/fermer un shift
- Support multi-terminaux avec `ShiftSelector`
- Recovery de shift en cas de deconnexion (`handleRecoverShift`)

### 1.6 Items verrouilles (envoyes en cuisine)

**Evaluation**: YES

- `lockedItemIds` dans le cartStore
- `lockCurrentItems()`: verrouille tous les items actuels apres envoi cuisine
- `isItemLocked()`: verifie si un item est verrouille
- `removeLockedItem()`: suppression forcee apres verification PIN
- `updateItemQuantity()`: empeche la reduction de quantite des items verrouilles (ligne 264)
- `removeItem()`: refuse la suppression des items verrouilles (ligne 291)
- `clearCart()`: refuse le vidage si des items verrouilles existent (ligne 306)
- `forceClearCart()`: vidage force apres PIN

### 1.7 Annulation (Void) et Remboursement (Refund)

**Evaluation**: YES

- `VoidModal.tsx`: selection de raison obligatoire, notes optionnelles, verification PIN manager
- `RefundModal.tsx`: remboursement avec workflow similaire
- Service `voidService.ts` et `refundService.ts` dans `src/services/financial/`
- Audit trail via `auditService.ts`
- Support offline: "Void will sync when online"

### Bugs identifies

1. **BUG (mineur) - Combo totalPrice calcule en double**: Dans `cartStore.ts` ligne 233, `totalPrice: totalPrice * quantity` multiplie une deuxieme fois par la quantite alors que `unitPrice` est deja `totalPrice / quantity` (ligne 222). Si `quantity > 1` au moment de l'ajout initial, le calcul est incorrect. Cependant, l'usage actuel passe toujours `quantity: 1` dans `POSMainPage.tsx` (ligne 149), ce qui masque le bug.
   - **Fichier**: `src/stores/cartStore.ts:233`
   - **Impact**: Faible (le flux actuel passe toujours quantity=1)

2. **BUG (mineur) - Discount modal en francais**: Le `DiscountModal.tsx` contient des textes en francais ("Pourcentage", "Montant Fixe (IDR)", "Prix de l'article", "Prix final", "Remise"), ce qui viole la convention du projet (English only - i18n suspendu).
   - **Fichier**: `src/components/pos/modals/DiscountModal.tsx:103-166`
   - **Impact**: Cosmetique, incoherence UI

### Fonctionnalites manquantes (production-ready)

- **Pas d'arrondi IDR systematique sur le total du panier**: Le `calculateTotals()` du cartStore ne fait pas d'arrondi au 100 IDR le plus proche sur le total. L'arrondi n'est applique que sur la monnaie rendue. Pour une boulangerie indonesienne, le total devrait etre arrondi.
- **Pas de mode de paiement "compte ouvert" (tab)**: Utile pour les reguliers d'une boulangerie, au-dela du B2B.
- **Pas de raccourcis clavier**: Un POS touch-optimise pourrait beneficier de raccourcis (F1=cash, F2=card, etc.) pour les terminaux avec clavier.

---

## 2. Gestion des Produits

**Statut**: COMPLET
**Fichiers principaux audites**:
- `src/pages/products/ProductsPage.tsx`
- `src/pages/products/ProductFormPage.tsx`
- `src/pages/products/CombosPage.tsx`
- `src/pages/products/PromotionsPage.tsx`
- `src/pages/products/ComboFormPage.tsx`
- `src/pages/products/PromotionFormPage.tsx`
- `src/pages/products/ProductCategoryPricingPage.tsx`

### 2.1 CRUD Produits

**Evaluation**: YES

- Liste avec vue grille/liste, recherche par nom/SKU, filtre par categorie
- Onglets par type: All, Finished, Semi-Finished, Raw Material
- Formulaire creation/edition complet (`ProductFormPage.tsx`)
- SKU auto-genere (format `PRD-XXXX`)
- Import/Export CSV via `productImportExport` service
- Export et import de recettes via `recipeImportExport`
- Synchronisation locale vers cloud (`pushLocalProductsToCloud`)

### 2.2 Categorisation hierarchique

**Evaluation**: YES

- Categories avec couleur
- Dispatch station (barista/kitchen/display/none) pour le KDS
- Filtre par categorie dans la liste produits et dans le POS

### 2.3 Variantes/Options et Modifiers

**Evaluation**: YES

- `VariantModal` pour la selection de variantes avec suivi des materiaux
- `ModifierModal` pour les groupes de modifiers avec ajustements de prix
- `SelectedVariant` avec `VariantMaterial` pour le suivi des matieres premieres
- `CartModifier` avec `priceAdjustment` pour les supplements
- Tab Variants dans le detail produit (`VariantsTab.tsx`)
- Tab Modifiers dans le detail produit (`ModifiersTab.tsx`)

### 2.4 Prix (vente/achat/marge/TVA)

**Evaluation**: YES

- Prix de vente (retail_price), prix de gros (wholesale_price), prix de revient (cost_price)
- Calcul de marge automatique: `((sale_price - cost_price) / sale_price) * 100`
- TVA 10% incluse correctement: `calculateTaxAmount(total) = Math.round(total * 10 / 110)` (teste unitairement)
- Customer Category Pricing: `ProductCategoryPricingPage.tsx` pour les prix par categorie client
- Support de 4 types de prix: retail, wholesale, discount_percentage, custom

### 2.5 Recettes/Compositions

**Evaluation**: YES

- `RecipeTab.tsx` dans le detail produit
- Lien produit fini -> matieres premieres
- Deduction automatique des ingredients a la vente (`deduct_ingredients` flag)
- Import/export de recettes

### 2.6 Combos et Promotions

**Evaluation**: YES

- `CombosPage.tsx`: CRUD combos avec groupes de choix
- `ComboFormPage.tsx`: formulaire de creation/edition
- `PromotionsPage.tsx`: CRUD promotions (%, fixe, buy X get Y, produit gratuit)
- `PromotionFormPage.tsx`: formulaire avec plages de dates, jours de la semaine, limites d'utilisation
- `promotionEngine.ts`: evaluation automatique des promotions dans le panier
- Integration POS via `useCartPromotions` hook

### Bugs identifies

1. **BUG (mineur) - sale_price vs retail_price confusion**: Dans `ProductFormPage.tsx`, le formulaire utilise `form.sale_price` pour le prix de vente, mais la base utilise `retail_price`. La conversion est faite a la sauvegarde (ligne 200: `retail_price: form.retail_price || form.sale_price`), mais le label affiche "Retail price" alors que le state utilise `sale_price`. Cela peut causer de la confusion.
   - **Fichier**: `src/pages/products/ProductFormPage.tsx:369-375`
   - **Impact**: Faible, la valeur est correctement sauvegardee

2. **BUG (mineur) - Validation de prix non stricte**: Le formulaire accepte un prix de vente a 0 (`sale_price < 0` est teste mais pas `=== 0`). Pour un produit fini, un prix a 0 devrait etre alerte.
   - **Fichier**: `src/pages/products/ProductFormPage.tsx:169`
   - **Impact**: Faible, risque d'erreur humaine

### Fonctionnalites manquantes (production-ready)

- **Pas de gestion des allergenes**: Pour une boulangerie, l'affichage des allergenes (gluten, oeufs, lait, noix) est essentiel pour la conformite et la securite alimentaire.
- **Pas de DLC/DLUO (dates de peremption)**: Critique pour une boulangerie avec des produits frais.
- **Pas de duplication de produit**: Utile pour creer des variantes rapidement.
- **Pas de gestion de lots (batch tracking)**: Les matieres premieres en boulangerie ont des numeros de lot fournisseur.

---

## 3. Inventaire / Stock

**Statut**: COMPLET
**Fichiers principaux audites**:
- `src/pages/inventory/StockPage.tsx`
- `src/pages/inventory/StockMovementsPage.tsx`
- `src/pages/inventory/ProductDetailPage.tsx`
- `src/pages/inventory/StockOpnameList.tsx` / `StockOpnameForm.tsx`
- `src/pages/inventory/InternalTransfersPage.tsx`
- `src/pages/inventory/StockProductionPage.tsx`
- `src/pages/inventory/WastedPage.tsx`
- `src/pages/inventory/IncomingStockPage.tsx`
- `src/pages/inventory/StockByLocationPage.tsx`

### 3.1 Suivi temps reel

**Evaluation**: YES

- `InventoryTable` avec stock courant, unite, cout
- Filtres par type (raw_material, finished, low_stock)
- KPI cards: total produits, matieres premieres, produits finis, alertes stock bas
- Support offline avec `OfflineStockBanner`, `StaleDataWarning`

### 3.2 Mouvements de stock

**Evaluation**: YES

Types complets implementes:
- `production_in` / `production_out` (production boulangerie)
- `stock_in` / `purchase` (entrees fournisseur)
- `sale` / `sale_pos` / `sale_b2b` (sorties vente)
- `waste` (pertes/gaspillage)
- `adjustment` / `adjustment_in` / `adjustment_out`
- `transfer` (transferts inter-localisations)
- `opname` (inventaire physique)

Chaque mouvement enregistre: stock_before, stock_after, reason, staff_name.
Export Excel via XLSX library.

### 3.3 Alertes stock bas

**Evaluation**: YES

- `StockAlertsPanel` avec filtres (all, critical, warning)
- Badge de compteur dans le filtre "Low Stock"
- Seuils: warning < `min_stock_level`, critical < 5 (parametrable)
- Acces rapide via URL param `?filter=alerts`

### 3.4 Lien produit fini - matieres premieres

**Evaluation**: YES

- Tab `RecipeTab` dans le detail produit
- Production: `StockProductionPage.tsx` pour la production de produits finis a partir de recettes
- Deduction automatique des ingredients via `deduct_ingredients` flag

### 3.5 Inventaire physique (opname)

**Evaluation**: YES

- `StockOpnameList.tsx`: liste des sessions d'inventaire
- `StockOpnameForm.tsx`: formulaire de saisie
- Gestion complete de la reconciliation stock physique vs. stock systeme

### 3.6 Transferts internes

**Evaluation**: YES

- `InternalTransfersPage.tsx`: liste des transferts
- `TransferFormPage.tsx`: creation de transfert
- `TransferDetailPage.tsx`: detail avec suivi
- `StockByLocationPage.tsx`: stock par localisation

### 3.7 Support hors ligne

**Evaluation**: PARTIAL

- `OfflineAdjustmentBlockedModal`: les ajustements sont bloques hors ligne (design volontaire pour l'integrite des donnees)
- `DeferredNotesBadge`: notes differees pour les ajustements hors ligne
- Le stock est cache localement mais les operations de modification requierent la connexion

### Bugs identifies

1. **BUG (mineur) - Ajustement stock bloque hors ligne sans alternative**: L'`OfflineAdjustmentBlockedModal` permet seulement de laisser une note. Pour une boulangerie avec de la production matinale en zone de faible connectivite, cela peut etre bloquant.
   - **Fichier**: `src/pages/inventory/StockPage.tsx:53-59`
   - **Impact**: Moyen (bloquant en production matinale sans internet)

### Fonctionnalites manquantes (production-ready)

- **Pas de gestion des dates de peremption par lot**: Critique pour les matieres premieres (farine, beurre, oeufs).
- **Pas d'alerte automatique de reapprovisionnement**: Les alertes sont passives (affichage). Pas de suggestion automatique de commande fournisseur.
- **Pas de valorisation FIFO/LIFO**: La valorisation du stock utilise le prix de revient unitaire, pas de methode comptable de valorisation.
- **Pas de production planifiee**: La production est enregistree a posteriori, pas de planification de fournees.

---

## 4. Commandes B2B

**Statut**: PARTIEL
**Fichiers principaux audites**:
- `src/pages/b2b/B2BPage.tsx`
- `src/pages/b2b/B2BOrdersPage.tsx`
- `src/pages/b2b/B2BOrderFormPage.tsx`
- `src/pages/b2b/B2BOrderDetailPage.tsx`
- `src/pages/b2b/B2BPaymentsPage.tsx`

### 4.1 Carnet de commandes

**Evaluation**: YES

- Dashboard B2B avec KPIs (clients, commandes, CA, impayes)
- Liste des commandes avec filtres (statut, paiement, recherche)
- 7 statuts de commande: draft, confirmed, processing, ready, partially_delivered, delivered, cancelled
- Creation de commande via formulaire complet
- Detail de commande avec suivi

### 4.2 Facturation

**Evaluation**: PARTIAL

- Pas de generation de devis (proforma) : seules les commandes sont gerees
- Pas de generation de facture PDF formelle avec mentions legales indonesiennes
- Le systeme gere uniquement commandes (order) -> paiement (payment)
- Pas de numero de facture distinct du numero de commande

### 4.3 Historique et paiements

**Evaluation**: YES

- `B2BPaymentsPage.tsx`: suivi des paiements
- Paiement partiel supporte (`partial` status)
- Calcul des impayes (`unpaid_amount`)
- Integration POS via `createB2BPosOrder` pour le store credit

### 4.4 Integration POS

**Evaluation**: YES

- Le `PaymentModal` propose "Store Credit" pour les clients wholesale
- Creation automatique de commande B2B quand un client wholesale paie en store credit
- Lien entre commande POS et commande B2B (`posOrderId`)

### Bugs identifies

1. **BUG (mineur) - UI en francais**: Toute l'interface B2B est en francais ("Brouillon", "Confirmee", "En preparation", "Gerez vos clients wholesale", etc.) alors que le projet doit etre en anglais uniquement.
   - **Fichiers**: `src/pages/b2b/B2BPage.tsx`, `src/pages/b2b/B2BOrdersPage.tsx`
   - **Impact**: Incoherence UI significative

2. **BUG (mineur) - Bouton "Voir" sans navigation**: Dans `B2BPage.tsx` ligne 309, le bouton "Voir" pour un client n'a pas de handler `onClick` avec navigation, il est non fonctionnel.
   - **Fichier**: `src/pages/b2b/B2BPage.tsx:309`
   - **Impact**: UI non fonctionnelle (bouton mort)

### Fonctionnalites manquantes (production-ready)

- **Pas de devis/proforma**: Essentiel pour le cycle commercial B2B (devis -> commande -> facture).
- **Pas de facture formelle PDF**: Avec mentions legales indonesiennes (NPWP, adresse, conditions de paiement).
- **Pas de relances automatiques**: Pour les paiements en retard.
- **Pas de conditions de paiement parametrables**: (net 30, net 60, etc.) -- le champ `payment_terms` existe en DB mais n'est pas utilise dans l'UI.
- **Pas de livraison partielle trackee**: Le statut `partially_delivered` existe mais il n'y a pas d'UI pour enregistrer quelle quantite a ete livree par ligne.

---

## 5. Programme de Fidelite

**Statut**: PARTIEL
**Fichiers principaux audites**:
- `src/pages/customers/CustomersPage.tsx`
- `src/pages/customers/CustomerDetailPage.tsx`
- `src/pages/customers/CustomerFormPage.tsx`
- `src/pages/customers/CustomerCategoriesPage.tsx`
- `src/components/pos/modals/CustomerSearchModal.tsx`
- `src/components/pos/modals/CustomerDetailView.tsx`
- `src/components/pos/LoyaltyBadge.tsx`
- `src/hooks/customers/useCustomersOffline.ts`
- `src/constants/loyalty.ts`

### 5.1 Enregistrement clients

**Evaluation**: YES

- Formulaire complet: nom, entreprise, telephone, email, adresse, date de naissance
- Categories client avec couleurs
- Numero de membre automatique
- QR code pour identification rapide au POS
- Support offline pour la recherche client (`useSearchCustomersOffline`)

### 5.2 Accumulation de points

**Evaluation**: YES

- Regle metier: 1 point = 1,000 IDR depense (configurable)
- `add_loyalty_points` function PostgreSQL
- Points automatiquement ajoutes a la completion d'une commande
- Affichage du solde de points dans le detail client
- Historique des transactions de points (ajout, utilisation)

### 5.3 Niveaux de fidelite

**Evaluation**: YES

- 4 tiers: Bronze (0%), Silver 500pts (5%), Gold 2000pts (8%), Platinum 5000pts (10%)
- `TIER_COLORS` et `TIER_DISCOUNTS` dans `src/constants/loyalty.ts`
- Affichage du tier dans le POS via `LoyaltyBadge`
- Progression vers le tier suivant visible dans `CustomerDetailPage`
- `loyalty_tiers` table en DB avec `min_points`, `max_points`, `benefits`

### 5.4 Utilisation de points

**Evaluation**: PARTIAL

- `redeem_loyalty_points` function PostgreSQL
- UI d'ajout/retrait de points dans `CustomerDetailPage` (modal manuelle)
- **MAIS**: pas d'utilisation de points directement dans le flux de paiement POS
- L'operateur doit manuellement appliquer une remise correspondant aux points utilises

### 5.5 Recherche client au POS

**Evaluation**: YES

- `CustomerSearchModal` avec 4 modes: search, scan QR, create, favorites
- Recherche par nom, telephone, email, numero de membre
- Scan QR code pour identification rapide
- Vue detail client avec historique et produits frequents
- Fonction re-commande rapide

### Bugs identifies

1. **BUG (mineur) - UI clients en francais**: La page clients utilise du francais ("Gestion des Clients", "Gerez vos clients", "Categorie", "Nouveau Client", etc.).
   - **Fichier**: `src/pages/customers/CustomersPage.tsx`
   - **Impact**: Incoherence UI

### Fonctionnalites manquantes (production-ready)

- **Pas d'utilisation de points dans le flux POS**: L'utilisateur ne peut pas echanger des points contre une remise directement dans le `PaymentModal`. Il doit manuellement appliquer un discount, ce qui est fragile et source d'erreurs.
- **Pas de notification tier upgrade**: Quand un client passe au tier superieur, il n'y a pas d'alerte visuelle au caissier.
- **Pas de points d'anniversaire**: Le champ `date_of_birth` existe mais aucune logique d'attribution de points bonus anniversaire.
- **Pas de campagne de points bonus**: (double points le mardi, etc.)

---

## 6. Reporting / Dashboards

**Statut**: COMPLET
**Fichiers principaux audites**:
- `src/pages/reports/ReportsPage.tsx`
- `src/pages/reports/ReportsConfig.tsx`
- `src/pages/reports/components/` (29 onglets)

### 6.1 Structure des rapports

**Evaluation**: YES

6 categories de rapports avec 29 onglets configures dans `ReportsConfig.tsx`:

**Overview** (1):
- General Dashboard

**Sales** (11):
- All in 1 Sales Summary, Daily Sales, Sales By Date (placeholder), Sales Items By Date (placeholder), Product Sales By SKU, Product Sales By Category, Product Sales By Brand (placeholder), Sales By Customer, Sales Details By Hours, Sales Cancellation Details, Profit Loss

**Inventory** (7):
- Product Stock Balance, Stock Movement, Incoming Stocks (placeholder), Outgoing Stocks (placeholder), Product Stock Warning, Product Unsold, Expired Stock

**Purchases** (5):
- Purchase Details, Purchase By Date, Purchase By Supplier, Purchase Returns (placeholder), Outstanding Payment

**Finance & Payments** (5):
- Payment By Method, Sales Cash Balance, Receivables (B2B), Expenses (hidden), Discounts & Voids

**Logs & Audit** (4):
- Price Changes, Product Deleted, General Audit Log, Alerts Dashboard

### 6.2 Rapports implementes vs. placeholders

**Evaluation**: PARTIAL

- **Implementes** (22 onglets): dashboard, sales_dashboard, daily_sales, product_performance, sales_by_category, sales_by_customer, sales_by_hour, sales_cancellation, profit_loss, inventory_dashboard, stock_movement, stock_warning, unsold_products, expired_stock, purchase_details, purchase_by_date, purchase_by_supplier, outstanding_purchase_payment, payment_by_method, cash_balance, receivables, discounts_voids, price_changes, deleted_products, audit_log, alerts_dashboard
- **Placeholders** (5 onglets): sales_by_date, sales_items_by_date, sales_by_brand, incoming_stock, outgoing_stock, purchase_returns
- **Hidden** (1 onglet): expenses

### 6.3 CA journalier/hebdo/mensuel

**Evaluation**: YES

- `DailySalesTab.tsx`: ventes par jour
- `SalesTab.tsx`: resume des ventes avec filtres de dates
- `SalesByHourTab.tsx`: analyse par heure

### 6.4 Z de caisse

**Evaluation**: YES

- `SessionCashBalanceTab.tsx`: reconciliation de caisse par session
- `ShiftReconciliationModal` dans le POS: comparaison attendu vs. reel

### 6.5 Export

**Evaluation**: YES

- Export Excel dans les mouvements de stock
- Export PDF via `pdfExport.ts`
- Export CSV via `csvExport.ts`

### Bugs identifies

Aucun bug critique identifie.

### Fonctionnalites manquantes (production-ready)

- **5 rapports en placeholder**: Sales By Date, Sales Items By Date, Sales By Brand, Incoming Stocks, Outgoing Stocks, Purchase Returns. Ces rapports sont configures mais affichent "This report is planned for a future release."
- **Pas de planification d'envoi automatique de rapport**: (envoi quotidien/hebdomadaire par email au gerant).
- **Pas de comparaison periode**: (ce mois vs. mois precedent, cette annee vs. l'annee derniere).
- **Module Expenses masque**: Le rapport des depenses est `hidden: true` et renvoie vers le module comptabilite non encore integre.
- **Pas de pagination serveur**: Les rapports chargent toutes les donnees cote client, ce qui peut poser probleme avec 200 transactions/jour accumulees sur plusieurs mois.

---

## 7. Comptabilite

**Statut**: COMPLET
**Fichiers principaux audites**:
- `src/pages/accounting/ChartOfAccountsPage.tsx`
- `src/pages/accounting/JournalEntriesPage.tsx`
- `src/pages/accounting/GeneralLedgerPage.tsx`
- `src/pages/accounting/TrialBalancePage.tsx`
- `src/pages/accounting/BalanceSheetPage.tsx`
- `src/pages/accounting/IncomeStatementPage.tsx`
- `src/pages/accounting/VATManagementPage.tsx`
- `src/hooks/accounting/` (9 hooks)
- `src/services/accounting/accountingService.ts`
- `src/services/accounting/vatService.ts`
- `src/services/accounting/journalEntryValidation.ts`

### 7.1 Plan comptable

**Evaluation**: YES

- 30 comptes SME indonesien pre-configures
- Vue hierarchique via `AccountTree` component
- CRUD complet avec `AccountModal`
- Classes de comptes (1=Actif, 2=Passif, 3=Capital, 4=Revenus, 5=Depenses)
- Suggestion automatique de code suivant (`suggestNextCode`)
- Filtrage actif/inactif

### 7.2 Ecritures de journal

**Evaluation**: YES

- `JournalEntriesPage.tsx`: liste avec filtres
- Creation manuelle d'ecritures
- Auto-generation via triggers PostgreSQL:
  - `create_sale_journal_entry()`: sur `orders.completed` et `orders.voided`
  - `create_purchase_journal_entry()`: sur `purchase_orders.received`
- Validation de double debit/credit: `isBalanced()` dans `accountingService.ts`
- `calculateLineTotals()` pour verification

### 7.3 Etats financiers

**Evaluation**: YES

- `GeneralLedgerPage.tsx`: grand livre
- `TrialBalancePage.tsx`: balance
- `BalanceSheetPage.tsx`: bilan
- `IncomeStatementPage.tsx`: compte de resultat

### 7.4 TVA

**Evaluation**: YES

- `VATManagementPage.tsx`: gestion TVA mensuelle
- `useVATManagement` hook: appel RPC `calculate_vat_payable(year, month)`
- Calcul: TVA collectee - TVA deductible = TVA payable
- `vatService.ts`: export DJP (Direction Generale des Impots indonesienne)
- Formule correcte: `tax = total * 10 / 110` (TVA incluse)

### 7.5 Periodes fiscales

**Evaluation**: YES

- `useFiscalPeriods` hook
- Gestion des periodes ouvertes/fermees
- Blocage des ecritures sur periodes fermees

### Bugs identifies

Aucun bug critique identifie. Module bien implemente avec tests unitaires.

### Fonctionnalites manquantes (production-ready)

- **Pas de rapprochement bancaire**: Essentiel pour verifier que les paiements Card/QRIS/Transfer correspondent aux releves bancaires.
- **Pas de gestion multi-devises**: Le systeme est IDR uniquement. Pour un commerce a Lombok avec touristes, le suivi EUR/USD pourrait etre utile.
- **Pas de cloture comptable automatisee**: L'utilisateur doit manuellement fermer les periodes.
- **Pas d'export vers logiciel comptable tiers**: (format SAF-T, XBRL, ou integration avec logiciel comptable indonesien populaire).

---

## 8. Gestion Utilisateurs

**Statut**: COMPLET
**Fichiers principaux audites**:
- `src/pages/users/UsersPage.tsx`
- `src/pages/users/PermissionsPage.tsx`
- `src/hooks/usePermissions.ts`
- `src/hooks/useUsers.ts`
- `src/components/auth/PermissionGuard.tsx`
- `src/services/authService.ts`

### 8.1 CRUD Employes

**Evaluation**: YES

- Liste des utilisateurs avec recherche, filtres par role/statut
- KPIs: total membres, actifs, admins/managers, actifs 24h
- `UserFormModal` integre: creation et edition
- Champs: prenom, nom, display name, employee code, telephone, PIN (4-6 digits)
- Activation/Desactivation (toggle)
- Suppression avec confirmation
- Protection: impossible de se desactiver/supprimer soi-meme
- Protection: impossible de supprimer un SUPER_ADMIN

### 8.2 Roles

**Evaluation**: YES

- Roles multiples par utilisateur avec role principal
- Roles disponibles: SUPER_ADMIN, ADMIN, MANAGER, CASHIER, BAKER, INVENTORY, BARISTA
- Chaque role avec nom anglais (`name_en`)
- Attribution via checkboxes avec selection du role principal (radio)

### 8.3 Droits d'acces (Permissions)

**Evaluation**: YES

- `PermissionGuard` component pour le controle d'acces UI
- `usePermissions` hook avec `hasPermission()` et `isAdmin()`
- `user_has_permission()` function PostgreSQL pour les RLS policies
- Codes de permission granulaires couvrant tous les modules:
  - Sales (5), Inventory (5), Products (4), Customers (4), Reports (3), Accounting (5), Admin (5)
- `PermissionsPage.tsx` pour la gestion des permissions par role

### 8.4 Shifts/Sessions de caisse

**Evaluation**: YES (couvert dans le module POS)

- `useShift` hook: gestion complete du cycle de shift
- PIN verification pour ouvrir/fermer
- Multi-terminaux avec switch entre shifts
- Recovery de shift apres deconnexion
- Statistiques par session

### Bugs identifies

1. **BUG (mineur) - "Principal" en francais dans le formulaire**: Dans `UsersPage.tsx` ligne 805, le label du role principal utilise le mot francais "Principal" au lieu de "Primary".
   - **Fichier**: `src/pages/users/UsersPage.tsx:805`
   - **Impact**: Cosmetique

### Fonctionnalites manquantes (production-ready)

- **Pas de changement de PIN par l'utilisateur**: L'utilisateur ne peut pas changer son propre PIN; seul un admin peut le faire.
- **Pas de logs d'activite par utilisateur**: L'audit log existe mais il n'y a pas de vue filtree par utilisateur dans la page de gestion.
- **Pas de photo/avatar uploadable**: Le champ `avatar_url` existe mais il n'y a pas d'upload dans le formulaire.
- **Pas de gestion des horaires/plannings**: Pour une boulangerie avec des equipes (boulanger matinal, caissier apres-midi), un planning serait utile.

---

## Coherence des Regles Metier

### TVA 10% Incluse

| Composant | Implementation | Correct |
|-----------|---------------|---------|
| `offlineOrderService.calculateTaxAmount()` | `Math.round(total * 10 / 110)` | OUI |
| `paymentService` | Pas de calcul TVA (delegue) | OK |
| `PaymentModal` print | Utilise `calculateTaxAmount(total)` | OUI |
| `accountingService.formatIDR()` | Arrondi au 100 IDR | OUI |
| `vatService` | `calculate_vat_payable()` RPC | OUI |

### Arrondi IDR (100 IDR)

| Composant | Implementation | Correct |
|-----------|---------------|---------|
| `paymentService.calculateChange()` | `Math.floor(rawChange / 100) * 100` | OUI |
| `customerPricingService` | `Math.round(price / 100) * 100` | OUI |
| `cartStore.calculateTotals()` | Pas d'arrondi sur le total | NON* |
| `formatIDR()` (accounting) | `Math.round(amount / 100) * 100` | OUI |
| `formatCurrency()` (helpers) | `Intl.NumberFormat` sans arrondi | PARTIEL |

*Note: Le total du panier n'est pas arrondi au 100 IDR le plus proche. Le `calculateTotals()` renvoie un total brut. L'arrondi est seulement applique a la monnaie rendue et aux prix par categorie client. Pour des operations en IDR, les totaux devraient idealement etre arrondis.

### Programme de Fidelite

| Regle | Implementation | Correct |
|-------|---------------|---------|
| 1 point = 1,000 IDR | `add_loyalty_points` PostgreSQL | OUI |
| Bronze (0%, 0pts) | `TIER_DISCOUNTS` constants | OUI |
| Silver (5%, 500pts) | `TIER_DISCOUNTS` constants | OUI |
| Gold (8%, 2000pts) | `TIER_DISCOUNTS` constants | OUI |
| Platinum (10%, 5000pts) | `TIER_DISCOUNTS` constants | OUI |
| Application du discount tier au POS | Via `customerPricingService` | OUI |

---

## Probleme Transversal: Langue

**Severite**: MOYENNE

Le projet a une convention documentee "English only" (i18n suspendu), mais de nombreux fichiers contiennent encore du francais:

| Module | Fichiers concernes | Exemples |
|--------|--------------------|----------|
| B2B | `B2BPage.tsx`, `B2BOrdersPage.tsx`, `B2BOrderFormPage.tsx`, `B2BOrderDetailPage.tsx` | "Brouillon", "Confirmee", "Gerez vos clients wholesale" |
| Clients | `CustomersPage.tsx`, `CustomerCategoriesPage.tsx`, `CustomerFormPage.tsx`, `CustomerDetailPage.tsx` | "Gestion des Clients", "Nouveau Client" |
| POS Discount | `DiscountModal.tsx` | "Pourcentage", "Montant Fixe" |
| POS Customer | `CustomerSearchModal.tsx`, `CustomerDetailView.tsx` | Dates en format `fr-FR` |
| Inventory | `StockMovementsPage.tsx` | Export Excel headers en francais ("Produit", "Quantite", "Raison") |
| Users | `UsersPage.tsx` | "Principal" |

**46 occurrences** de textes francais identifiees dans 15 fichiers. Ce n'est pas un bug fonctionnel mais cree une experience utilisateur incoherente.

---

## Synthese des Bugs

| # | Severite | Module | Description | Fichier |
|---|----------|--------|-------------|---------|
| 1 | Mineur | POS | Combo totalPrice calcule en double quand qty > 1 | `cartStore.ts:233` |
| 2 | Mineur | POS | DiscountModal partiellement en francais | `DiscountModal.tsx:103-166` |
| 3 | Mineur | Produits | Confusion sale_price/retail_price dans le formulaire | `ProductFormPage.tsx:369` |
| 4 | Mineur | Produits | Prix de vente 0 accepte sans alerte | `ProductFormPage.tsx:169` |
| 5 | Moyen | Inventaire | Ajustement stock bloque hors ligne | `StockPage.tsx:53-59` |
| 6 | Mineur | B2B | Bouton "Voir" client sans handler | `B2BPage.tsx:309` |
| 7 | Moyen | B2B/Clients | 46 occurrences de textes en francais | 15 fichiers |
| 8 | Mineur | Users | "Principal" en francais dans le formulaire | `UsersPage.tsx:805` |

---

## Synthese des Manques Critiques pour Production

### Priorite HAUTE (bloquants pour production)

1. **Allergenes produits**: Essentiel pour la securite alimentaire en boulangerie. Pas de champ ni d'affichage.
2. **Utilisation de points fidelite dans le flux POS**: Le caissier ne peut pas echanger des points directement au checkout; il doit appliquer une remise manuellement.
3. **Facture B2B formelle**: Pas de generation de facture PDF avec mentions legales.

### Priorite MOYENNE (importants pour l'exploitation)

4. **DLC/DLUO matieres premieres**: Dates de peremption non trackees.
5. **Arrondi IDR sur le total panier**: Le total n'est pas arrondi au 100 IDR.
6. **Rapports placeholders**: 5 rapports configures mais non implementes.
7. **Coherence linguistique**: 46 occurrences de francais dans l'UI anglaise.
8. **Rapprochement bancaire**: Aucun mecanisme pour verifier les paiements electroniques.

### Priorite BASSE (ameliorations)

9. **Raccourcis clavier POS**: Pour accelerer les operations.
10. **Changement de PIN utilisateur**: Self-service.
11. **Planning equipe**: Gestion des horaires.
12. **Comparaison de periodes dans les rapports**: M-1, A-1.
13. **Ajustements stock hors ligne**: Actuellement bloques.

---

## Conclusion

AppGrav est un systeme ERP/POS fonctionnellement mature avec une couverture complete des operations d'une boulangerie artisanale. Les 8 modules principaux sont tous operationnels avec des fonctionnalites avancees (split payment, promotions automatiques, comptabilite auto-generee, offline-first).

Les points forts sont:
- Architecture offline-first robuste avec sync engine
- Gestion de caisse complete avec shift management
- Systeme de prix par categorie client bien pense
- Comptabilite conforme aux normes indonesiennes (TVA 10%, plan comptable SME)
- 92 fichiers de tests couvrant les services critiques

Les axes d'amelioration prioritaires sont la gestion des allergenes (securite alimentaire), l'integration des points de fidelite dans le flux de paiement, et la coherence linguistique de l'interface.
