# Analyse de l'Arbre Source - AppGrav

*Généré le 2026-01-26 - Scan Exhaustif*

## Statistiques

| Métrique | Valeur |
|----------|--------|
| Fichiers TypeScript/TSX | 152 |
| Edge Functions (Deno) | 14 |
| Migrations SQL | 47 |
| Fichiers CSS | 30+ |
| Fichiers de traduction | 3 |

## Structure Racine

```
AppGrav/
├── 📁 src/                    # Code source React/TypeScript
├── 📁 supabase/               # Backend Supabase (migrations, functions)
├── 📁 print-server/           # Serveur d'impression Node.js
├── 📁 public/                 # Assets statiques
├── 📁 docs/                   # Documentation générée
├── 📁 ios/                    # Build natif iOS (Capacitor)
├── 📁 android/                # Build natif Android (Capacitor)
├── 📁 dist/                   # Build de production
├── 📄 package.json            # Dépendances & scripts
├── 📄 vite.config.ts          # Configuration Vite
├── 📄 tsconfig.json           # Configuration TypeScript
├── 📄 capacitor.config.ts     # Configuration mobile
├── 📄 CLAUDE.md               # Guide IA
├── 📄 README.md               # Documentation principale
└── 📄 index.html              # Point d'entrée HTML
```

## Partie Main (src/)

```
src/
├── 📄 main.tsx                # ⭐ Point d'entrée React
├── 📄 App.tsx                 # ⭐ Routeur principal (60+ routes)
├── 📄 i18n.ts                 # Configuration i18next (FR, EN, ID)
├── 📄 vite-env.d.ts           # Types Vite
├── 📄 setupTests.ts           # Configuration Vitest
│
├── 📁 components/             # Composants réutilisables (33 fichiers)
│   ├── 📁 auth/               # 🔐 Guards de permission
│   │   ├── PermissionGuard.tsx    # HOC contrôle accès
│   │   └── index.ts
│   ├── 📁 inventory/          # 📦 Composants inventaire
│   │   ├── InventoryTable.tsx     # Table avec alertes stock
│   │   ├── StockAdjustmentModal.tsx
│   │   └── RecipeViewerModal.tsx
│   ├── 📁 kds/                # 🍳 Kitchen Display System
│   │   ├── KDSOrderCard.tsx       # Carte commande avec timer
│   │   └── KDSOrderCard.css
│   ├── 📁 pos/                # 💳 Point de vente
│   │   ├── Cart.tsx               # ⭐ Panier principal
│   │   ├── CategoryNav.tsx        # Navigation catégories
│   │   ├── POSMenu.tsx            # Menu hamburger
│   │   ├── ProductGrid.tsx        # Grille produits
│   │   ├── 📁 modals/             # 7 modals POS
│   │   │   ├── PaymentModal.tsx       # ⭐ Checkout
│   │   │   ├── PinVerificationModal.tsx
│   │   │   ├── ComboSelectorModal.tsx
│   │   │   ├── ModifierModal.tsx
│   │   │   ├── DiscountModal.tsx
│   │   │   ├── HeldOrdersModal.tsx
│   │   │   ├── CustomerSearchModal.tsx
│   │   │   ├── TableSelectionModal.tsx
│   │   │   └── index.ts
│   │   ├── 📁 shift/              # Gestion shifts
│   │   │   ├── OpenShiftModal.tsx
│   │   │   ├── CloseShiftModal.tsx
│   │   │   ├── ShiftReconciliationModal.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── 📁 settings/           # ⚙️ Paramètres
│   │   ├── SettingField.tsx       # Champ dynamique (7 types)
│   │   └── FloorPlanEditor.tsx    # Éditeur plan de salle
│   └── 📁 ui/                 # 🎨 Primitives UI
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Input.tsx
│       └── ErrorBoundary.tsx
│
├── 📁 pages/                  # Pages par route (60+ fichiers)
│   ├── 📁 auth/               # Authentification
│   │   └── LoginPage.tsx          # ⭐ Page connexion PIN
│   ├── 📁 pos/                # POS fullscreen
│   │   └── POSMainPage.tsx        # ⭐ Interface POS principale
│   ├── 📁 kds/                # Kitchen Display
│   │   ├── KDSMainPage.tsx
│   │   └── KDSStationSelector.tsx
│   ├── 📁 display/            # Affichage client
│   │   └── CustomerDisplayPage.tsx
│   ├── 📁 products/           # Gestion produits
│   │   ├── ProductsLayout.tsx     # Layout avec tabs
│   │   ├── ProductsPage.tsx
│   │   ├── CombosPage.tsx
│   │   ├── ComboFormPage.tsx
│   │   ├── PromotionsPage.tsx
│   │   ├── PromotionFormPage.tsx
│   │   └── ProductCategoryPricingPage.tsx
│   ├── 📁 inventory/          # Gestion stock
│   │   ├── InventoryLayout.tsx    # Layout avec tabs
│   │   ├── InventoryPage.tsx
│   │   ├── StockPage.tsx
│   │   ├── IncomingStockPage.tsx
│   │   ├── WastedPage.tsx
│   │   ├── StockProductionPage.tsx
│   │   ├── StockOpnameList.tsx
│   │   ├── StockOpnameForm.tsx
│   │   ├── StockMovementsPage.tsx
│   │   ├── InternalTransfersPage.tsx
│   │   ├── TransferFormPage.tsx
│   │   ├── TransferDetailPage.tsx
│   │   ├── StockByLocationPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   └── 📁 tabs/               # Onglets détail produit
│   │       ├── GeneralTab.tsx
│   │       ├── StockTab.tsx
│   │       ├── UnitsTab.tsx
│   │       ├── PricesTab.tsx
│   │       ├── RecipeTab.tsx
│   │       ├── CostingTab.tsx
│   │       └── ModifiersTab.tsx
│   ├── 📁 b2b/                # Ventes B2B
│   │   ├── B2BPage.tsx
│   │   ├── B2BOrdersPage.tsx
│   │   ├── B2BOrderFormPage.tsx
│   │   ├── B2BOrderDetailPage.tsx
│   │   └── B2BPaymentsPage.tsx
│   ├── 📁 purchasing/         # Achats
│   │   ├── SuppliersPage.tsx
│   │   ├── PurchaseOrdersPage.tsx
│   │   ├── PurchaseOrderFormPage.tsx
│   │   └── PurchaseOrderDetailPage.tsx
│   ├── 📁 customers/          # Gestion clients
│   │   ├── CustomersPage.tsx
│   │   ├── CustomerFormPage.tsx
│   │   ├── CustomerDetailPage.tsx
│   │   └── CustomerCategoriesPage.tsx
│   ├── 📁 reports/            # Rapports
│   │   ├── ReportsPage.tsx        # Dashboard principal
│   │   ├── SalesReportsPage.tsx
│   │   ├── ReportsConfig.tsx
│   │   └── 📁 components/         # Tabs rapports
│   │       ├── OverviewTab.tsx
│   │       ├── SalesTab.tsx
│   │       ├── DailySalesTab.tsx
│   │       ├── ProductPerformanceTab.tsx
│   │       ├── SalesByCategoryTab.tsx
│   │       ├── PaymentMethodTab.tsx
│   │       ├── StockMovementTab.tsx
│   │       ├── InventoryTab.tsx
│   │       ├── PurchaseDetailsTab.tsx
│   │       ├── PurchaseBySupplierTab.tsx
│   │       └── AuditTab.tsx
│   ├── 📁 settings/           # Paramètres
│   │   ├── SettingsLayout.tsx     # Layout avec sidebar
│   │   ├── SettingsPage.tsx
│   │   ├── CategorySettingsPage.tsx
│   │   ├── TaxSettingsPage.tsx
│   │   ├── PaymentMethodsPage.tsx
│   │   ├── BusinessHoursPage.tsx
│   │   ├── SettingsHistoryPage.tsx
│   │   ├── RolesPage.tsx
│   │   └── AuditPage.tsx
│   ├── 📁 users/              # Gestion utilisateurs
│   │   └── UsersPage.tsx
│   ├── 📁 orders/             # Historique commandes
│   │   └── OrdersPage.tsx
│   ├── 📁 production/         # Production
│   │   └── ProductionPage.tsx
│   └── 📁 profile/            # Profil utilisateur
│       └── ProfilePage.tsx
│
├── 📁 stores/                 # Zustand stores (4 fichiers)
│   ├── cartStore.ts               # ⭐ Panier (items, locked, discount)
│   ├── authStore.ts               # ⭐ Auth (user, session, permissions)
│   ├── orderStore.ts              # Lifecycle commandes
│   └── settingsStore.ts           # Paramètres application
│
├── 📁 hooks/                  # Hooks React personnalisés
│   ├── index.ts
│   ├── useInventory.ts
│   ├── useOrders.ts
│   ├── usePermissions.ts
│   ├── useStock.ts
│   ├── 📁 products/               # Hooks produits
│   │   ├── useProductList.ts
│   │   ├── useProductDetail.ts
│   │   ├── useProductSearch.ts
│   │   ├── useCategories.ts
│   │   ├── useProductModifiers.ts
│   │   └── index.ts
│   ├── 📁 settings/               # Hooks paramètres
│   │   ├── useSettingsCore.ts
│   │   ├── useTaxSettings.ts
│   │   ├── usePaymentSettings.ts
│   │   ├── useBusinessSettings.ts
│   │   ├── settingsKeys.ts
│   │   └── index.ts
│   └── 📁 shift/                  # Hooks shift
│       ├── useShift.ts
│       └── index.ts
│
├── 📁 services/               # Services API (6 fichiers)
│   ├── index.ts
│   ├── authService.ts             # ⭐ Auth & user management
│   ├── promotionService.ts        # Validation promotions
│   ├── ReportingService.ts        # Agrégation rapports
│   ├── ClaudeService.ts           # Intégration Claude AI
│   └── anthropicService.ts
│
├── 📁 types/                  # Types TypeScript
│   ├── database.ts                # ⭐ Types Supabase (exports)
│   ├── database.generated.ts      # Types auto-générés
│   └── reporting.ts               # Types rapports
│
├── 📁 lib/                    # Bibliothèques
│   └── supabase.ts                # ⭐ Client Supabase
│
├── 📁 locales/                # Traductions i18n
│   ├── fr.json                    # Français (principal)
│   ├── en.json                    # Anglais
│   └── id.json                    # Indonésien
│
├── 📁 styles/                 # Styles globaux
│   └── index.css                  # Tailwind + custom CSS
│
├── 📁 data/                   # Données mock
│   ├── index.ts
│   └── mockCategories.ts
│
└── 📁 utils/                  # Utilitaires
    └── helpers.ts
```

## Partie Backend Supabase (supabase/)

```
supabase/
├── 📄 README.md               # Documentation Supabase
├── 📄 MIGRATION_ORDER.md      # Ordre des migrations
│
├── 📁 migrations/             # 47 fichiers SQL
│   ├── 001_initial_schema.sql     # Schéma initial
│   ├── 002_products.sql
│   ├── ...
│   ├── 040_users_permissions.sql  # Système permissions
│   ├── 041_settings_module.sql    # Module paramètres
│   ├── ...
│   └── 047_*.sql                  # Dernière migration
│
├── 📁 functions/              # 11 Edge Functions (Deno)
│   ├── 📁 _shared/                # Code partagé
│   │   └── cors.ts
│   ├── 📁 auth-verify-pin/
│   │   └── index.ts               # ⭐ Vérification PIN
│   ├── 📁 auth-logout/
│   │   └── index.ts
│   ├── 📁 auth-change-pin/
│   │   └── index.ts
│   ├── 📁 auth-get-session/
│   │   └── index.ts
│   ├── 📁 auth-user-management/
│   │   └── index.ts               # ⭐ CRUD utilisateurs
│   ├── 📁 generate-invoice/
│   │   └── index.ts               # Génération factures B2B
│   ├── 📁 calculate-daily-report/
│   │   └── index.ts               # Rapport journalier
│   ├── 📁 send-to-printer/
│   │   └── index.ts               # Envoi impression
│   ├── 📁 purchase_order_module/
│   │   └── index.ts               # API bons commande
│   └── 📁 intersection_stock_movements/
│       └── index.ts
│
└── 📁 types/                  # Types générés
```

## Partie Print-Server (print-server/)

```
print-server/
├── 📄 package.json            # Dépendances Node.js
├── 📄 README.md               # Documentation
├── 📄 .env.example            # Variables d'environnement
├── 📄 print-server.service    # Fichier systemd
│
└── 📁 src/
    ├── 📄 index.js            # ⭐ Point d'entrée Express
    ├── 📄 test-print.js       # Script de test
    ├── 📁 routes/
    │   ├── print.js               # Routes /print/*
    │   ├── status.js              # Route /status
    │   └── drawer.js              # Route /drawer
    ├── 📁 services/
    │   └── PrinterService.js      # Gestion imprimantes
    └── 📁 utils/
        └── logger.js              # Winston logger
```

## Points d'Intégration

### Frontend ↔ Backend
- `src/lib/supabase.ts` → Supabase Cloud
- `src/services/authService.ts` → Edge Functions auth-*
- `src/hooks/useShift.ts` → RPC open_shift/close_shift

### Frontend ↔ Print-Server
- `src/services/*` → POST http://localhost:3001/print/*

### Multi-part Communication
- Main App envoie jobs impression via HTTP au Print-Server local
- Print-Server communique avec imprimantes thermiques USB/réseau

## Légende

- ⭐ = Fichier critique / point d'entrée
- 🔐 = Sécurité / authentification
- 📦 = Inventaire / stock
- 🍳 = Cuisine / KDS
- 💳 = Point de vente
- ⚙️ = Configuration
- 🎨 = UI / Design
