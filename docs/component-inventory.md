# Inventaire des Composants UI - AppGrav

*Généré le 2026-01-26 - Scan Exhaustif*

## Résumé

| Catégorie | Nombre |
|-----------|--------|
| Primitives UI | 5 |
| Composants POS | 4 |
| Modals POS | 7 |
| Composants Shift | 3 |
| KDS | 1 |
| Auth | 1 |
| Inventaire | 3 |
| Paramètres | 2 |
| Layouts | 1 |
| Pages | 60+ |
| **Total** | **87+** |

## Primitives UI (src/components/ui/)

| Composant | Type | Props | Pattern |
|-----------|------|-------|---------|
| **Button** | Primitive | variant (primary/secondary/ghost), size (sm/md/lg), leftIcon, rightIcon | Stateless |
| **Card** | Primitive | title?, action? | Stateless |
| **Badge** | Primitive | variant (success/warning/danger/info/neutral) | Stateless |
| **Input** | Primitive (forwardRef) | label?, error? | Stateless |
| **ErrorBoundary** | Error Handler | children, fallback? | Classe React |

## Module POS

### Composants Core (src/components/pos/)

| Composant | Rôle | Props Clés | Complexité |
|-----------|------|------------|------------|
| **POSMenu** | Menu hamburger | isOpen, onClose, onShowHeldOrders | Moyenne |
| **Cart** | Panier d'achat | onCheckout, onSendToKitchen | Haute (12+ useState) |
| **ProductGrid** | Grille produits | products, onProductClick, isLoading | Basse |
| **CategoryNav** | Navigation catégories | categories, selectedCategory, onSelectCategory | Basse |

### Modals POS (src/components/pos/modals/)

| Modal | Rôle | État Requis |
|-------|------|-------------|
| **PaymentModal** | Checkout & paiement | 5+ useState, méthodes paiement, numpad |
| **PinVerificationModal** | Vérification sécurité | Saisie PIN, erreur, users démo |
| **ComboSelectorModal** | Sélection combo | Fetch async, sélections multi-niveaux |
| **ModifierModal** | Modificateurs produit | Sélections simple/multiple, calcul prix |
| **DiscountModal** | Application remises | Calcul %, PIN verification |
| **HeldOrdersModal** | Commandes suspendues | Liste commandes, suppression PIN |
| **CustomerSearchModal** | Recherche clients | QR scanning, recherche, fidélité |
| **TableSelectionModal** | Sélection table | Floor plan fetch, filtres section |

### Composants Shift (src/components/pos/shift/)

| Composant | Rôle |
|-----------|------|
| **OpenShiftModal** | Ouverture caisse (montants rapides, notes) |
| **CloseShiftModal** | Fermeture avec réconciliation |
| **ShiftReconciliationModal** | Détail écarts paiements |

## Module KDS (src/components/kds/)

| Composant | Rôle | Fonctionnalités |
|-----------|------|-----------------|
| **KDSOrderCard** | Affichage commande cuisine | Timer temps réel, urgence (normal/warning/critical), filtrage station |

## Module Auth (src/components/auth/)

| Composant | Rôle | Usage |
|-----------|------|-------|
| **PermissionGuard** | Contrôle accès | `<PermissionGuard permission="sales.void">` |
| **RouteGuard** | Protection page | Accès full-page |
| **AdminOnly** | Raccourci admin | Contenu admin seulement |
| **ManagerOnly** | Raccourci manager | Contenu manager+ |

## Module Inventaire (src/components/inventory/)

| Composant | Rôle |
|-----------|------|
| **InventoryTable** | Table produits avec recherche, alertes stock bas |
| **StockAdjustmentModal** | Workflow ajustement stock |
| **RecipeViewerModal** | Affichage recettes avec ingrédients |

## Module Paramètres (src/components/settings/)

| Composant | Rôle | Fonctionnalités |
|-----------|------|-----------------|
| **SettingField** | Champ formulaire dynamique | 7 types (boolean, number, string, array, json, file, select) |
| **FloorPlanEditor** | Éditeur plan de salle | Drag-drop, resize, sections, formes |

## Layout (src/layouts/)

| Composant | Structure |
|-----------|-----------|
| **BackOfficeLayout** | Sidebar pliable + contenu principal, 15+ routes nav |

## Pages par Module (src/pages/)

| Module | Pages | Exemples |
|--------|-------|----------|
| POS | 2 | POSMainPage, CustomerDisplayPage |
| Products | 4 | ProductsPage, CombosPage, PromotionsPage |
| Inventory | 12 | InventoryPage, StockPage, StockOpnameList/Form + 7 Tabs |
| B2B | 5 | B2BPage, B2BOrdersPage, B2BOrderDetailPage |
| Purchasing | 4 | PurchaseOrdersPage, PurchaseOrderFormPage, SuppliersPage |
| Customers | 4 | CustomersPage, CustomerDetailPage, CustomerCategoriesPage |
| Reports | 10+ | ReportsPage, SalesReportsPage + tabs rapports |
| Settings | 7 | SettingsPage, RolesPage, AuditPage, PaymentMethodsPage |
| Auth | 1 | LoginPage |
| Users | 1 | UsersPage |
| KDS | 2 | KDSMainPage, KDSStationSelector |

## Patterns de Conception

### Gestion d'État
```
- Zustand stores : cartStore, authStore, orderStore, settingsStore
- React Query : Fetch données produits/inventaire
- useState local : État UI (modals, sélections)
```

### Architecture Modale
- Overlay backdrop avec classe `is-active`
- Handler click-outside pour fermeture
- Modals imbriqués (DiscountModal → PinVerificationModal)
- Structure header/body/footer cohérente

### Pattern Permission
```tsx
<PermissionGuard permission="sales.void">
  <VoidButton />
</PermissionGuard>
```

### Dépendances Communes
1. **react-i18next** - i18n (25+ composants)
2. **lucide-react** - Icônes (20+ composants)
3. **zustand** - État global
4. **@supabase/supabase-js** - Opérations DB
5. **react-hot-toast** - Notifications
6. **@tanstack/react-query** - Fetch données

## Design System

### Couleurs
- Brand : blue-600, green-600 (boutons)
- Statuts : success (vert), warning (ambre), danger (rouge), info (bleu)
- Neutres : grays pour backgrounds

### Typographie
- Hiérarchie headings cohérente
- Français langue principale (fallback anglais)

### Icônes
- Bibliothèque Lucide React
- Tailles : 18-24px UI, 16px inline

### Touch Optimization
- Gros boutons pour POS (finger-friendly)
- Modals plein écran sur mobile
- Numpad UX pour saisie cash
