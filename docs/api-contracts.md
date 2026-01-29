# Contrats API - AppGrav

*Généré le 2026-01-26 - Scan Exhaustif*

## Résumé

| Catégorie | Nombre |
|-----------|--------|
| Services | 6 |
| Edge Functions | 11 |
| Hooks React | 20+ |
| Tables Supabase | 40+ |
| Fonctions RPC | 10+ |

## Services (src/services/)

### 1. authService
**Fichier** : `src/services/authService.ts`
**Rôle** : Orchestration authentification & gestion utilisateurs

| Méthode | Endpoint | Tables |
|---------|----------|--------|
| `loginWithPin()` | POST `/auth-verify-pin` | user_profiles, user_sessions, user_roles |
| `logout()` | POST `/auth-logout` | user_sessions |
| `validateSession()` | POST `/auth-get-session` | user_sessions, user_profiles |
| `changePin()` | POST `/auth-change-pin` | user_profiles |
| `createUser()` | POST `/auth-user-management` | user_profiles, user_roles |
| `updateUser()` | POST `/auth-user-management` | user_profiles, user_roles |
| `deleteUser()` | POST `/auth-user-management` | user_profiles |
| `getUsers()` | SELECT Supabase | user_profiles, user_roles, roles |

### 2. promotionService
**Fichier** : `src/services/promotionService.ts`
**Rôle** : Validation et calcul des promotions

| Fonction | Description |
|----------|-------------|
| `isPromotionValid()` | Valide par contraintes temps/jour |
| `getApplicablePromotions()` | Récupère promotions actives |
| `calculatePromotionDiscount()` | Calcule réduction (%, fixe, buy_x_get_y) |
| `applyBestPromotions()` | Logique de cumul |
| `recordPromotionUsage()` | RPC `record_promotion_usage` |

### 3. ReportingService
**Fichier** : `src/services/ReportingService.ts`
**Rôle** : Agrégation données analytics

| Méthode | Source |
|---------|--------|
| `getSalesComparison()` | RPC `get_sales_comparison` |
| `getDashboardSummary()` | RPC `get_reporting_dashboard_summary` |
| `getPaymentMethodStats()` | VIEW `view_payment_method_stats` |
| `getDailySales()` | VIEW `view_daily_kpis` |
| `getProductPerformance()` | SELECT order_items |
| `getSalesByCategory()` | SELECT avec jointures |

### 4. ClaudeService
**Fichier** : `src/services/ClaudeService.ts`
**Rôle** : Intégration Claude AI

- Modèle : claude-3-haiku-20240307
- Max Tokens : 2000

## Edge Functions (supabase/functions/)

### Authentification

#### auth-verify-pin
```
POST /functions/v1/auth-verify-pin
Body: { user_id, pin, device_type, device_name }
Response: { success, user, session, roles, permissions }
```

#### auth-logout
```
POST /functions/v1/auth-logout
Body: { session_id, user_id, reason }
```

#### auth-change-pin
```
POST /functions/v1/auth-change-pin
Body: { user_id, current_pin?, new_pin, admin_override? }
```

#### auth-get-session
```
POST /functions/v1/auth-get-session
Body: { session_token }
Response: { user, permissions, roles }
```

#### auth-user-management
```
POST /functions/v1/auth-user-management
Actions: create, update, delete, toggle_active
```

### Rapports

#### generate-invoice
```
POST /functions/v1/generate-invoice
Body: { order_id }
Response: text/html (facture B2B)
```

#### calculate-daily-report
```
POST /functions/v1/calculate-daily-report
Body: { date? }
Response: { summary, payment_breakdown, category_performance, top_products }
```

### Impression

#### send-to-printer
```
POST /functions/v1/send-to-printer
Body: { type: receipt|kitchen|label, printer?, data }
```

### Achats

#### purchase_order_module
```
POST /functions/v1/purchase_order_module?resource=suppliers|orders
Methods: GET, POST, PATCH
```

## Hooks React Personnalisés

### Produits
- `useProductList` - Produits visibles avec catégorie
- `useProductDetail` - Détail produit par ID
- `useProductWithModifiers` - Produit + modificateurs
- `useCategories` - Catégories actives

### Inventaire
- `useInventoryItems` - Produits avec niveaux stock
- `useSuppliers` - Fournisseurs actifs
- `useStockAdjustment` - Création mouvements stock
- `useStock` - Produits + mouvements

### Commandes
- `useOrders` - Création commandes depuis panier

### Paramètres
- `useSettingsCore` - CRUD paramètres
- `useTaxSettings` - Taux de taxe
- `usePaymentSettings` - Méthodes de paiement
- `useBusinessSettings` - Heures d'ouverture

### Sessions
- `useShift` - Cycle de vie shift POS (open/close)

### Permissions
- `usePermissions` - Vérification permissions/rôles

## Patterns d'Intégration

### 1. REST via Edge Functions
Frontend → Edge Function → Supabase Admin → Database

### 2. Requêtes Supabase Directes
Frontend → Supabase JS Client → Database (avec React Query)

### 3. Appels RPC
Frontend → Supabase RPC → Fonctions PostgreSQL

### 4. Realtime
Supabase Subscriptions pour mises à jour temps réel

## Flux de Données Clés

### Authentification
1. Saisie PIN → authService.loginWithPin()
2. Edge Function valide (RPC verify_user_pin)
3. Création user_sessions
4. Retour user + roles + permissions
5. Cache dans authStore

### Création Commande
1. Ajout items dans cartStore
2. Checkout → useOrders.createOrder()
3. Création orders + order_items
4. Vidage panier
5. Workflow KDS déclenché
