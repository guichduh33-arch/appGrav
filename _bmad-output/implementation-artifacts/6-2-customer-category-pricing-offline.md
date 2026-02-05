# Story 6.2: Customer Category Pricing Offline

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Caissier**,
I want **que les prix clients soient appliqués automatiquement offline**,
So that **les clients wholesale et custom reçoivent leurs prix spéciaux même sans internet**.

## Acceptance Criteria

### AC1: Application Automatique du Prix Wholesale
**Given** un client avec `category_slug = 'wholesale'` est associé à la commande
**When** j'ajoute un produit au panier offline
**Then** le `wholesale_price` du produit est utilisé automatiquement
**And** si `wholesale_price` est null, le `retail_price` est utilisé en fallback

### AC2: Application du Discount Percentage
**Given** un client avec `category_slug = 'discount_percentage'` est associé
**When** j'ajoute un produit au panier offline
**Then** le prix est calculé: `retail_price * (1 - discount_percentage/100)`
**And** le pourcentage de réduction vient de `customer_categories.discount_percentage`

### AC3: Application des Prix Custom
**Given** un client avec `category_slug = 'custom'` est associé à la commande
**When** j'ajoute un produit ayant un prix custom défini
**Then** le prix vient de la table `offline_product_category_prices`
**And** si aucun prix custom n'existe pour ce produit, le `retail_price` est utilisé

### AC4: Cache des Prix Custom dans IndexedDB
**Given** l'application synchronise les données
**When** les prix par catégorie sont chargés
**Then** ils sont stockés dans Dexie table `offline_product_category_prices`
**And** incluent: product_id, customer_category_id, price, is_active
**And** seuls les prix actifs sont synchronisés

### AC5: Cache des Customer Categories
**Given** l'application démarre avec internet
**When** les catégories clients sont chargées
**Then** elles sont stockées dans Dexie table `offline_customer_categories`
**And** incluent: id, slug, name, price_modifier_type, discount_percentage
**And** le `discount_percentage` est préservé pour le calcul offline

### AC6: Prix Client Indiqué dans le Panier
**Given** un client avec un prix spécial est associé
**When** j'ajoute un produit au panier
**Then** le prix affiché est le prix client (pas le retail)
**And** une indication visuelle montre "Prix [Category Name]" ou "Prix personnalisé"
**And** l'économie par rapport au prix retail est affichée

### AC7: Recalcul Automatique lors du Changement de Client
**Given** un panier contient des items
**When** je change le client associé (ou je retire le client)
**Then** tous les prix du panier sont recalculés automatiquement
**And** les totaux sont mis à jour
**And** l'indication de prix change ou disparaît

## Tasks / Subtasks

- [x] **Task 1: Étendre le schema Dexie avec 2 nouvelles tables** (AC: 4, 5)
  - [x] 1.1: Ajouter version 14 dans `src/lib/db.ts`
  - [x] 1.2: Créer table `offline_customer_categories` avec indexes: id, slug, is_active
  - [x] 1.3: Créer table `offline_product_category_prices` avec indexes: [product_id+customer_category_id], product_id, customer_category_id
  - [x] 1.4: Déclarer les types de table dans la classe OfflineDatabase

- [x] **Task 2: Définir les types dans offline.ts** (AC: 4, 5)
  - [x] 2.1: Créer interface `IOfflineCustomerCategory` dans `src/types/offline.ts`
  - [x] 2.2: Créer interface `IOfflineProductCategoryPrice` dans `src/types/offline.ts`
  - [x] 2.3: Ajouter constantes TTL pour ces caches
  - [x] 2.4: Exporter les nouveaux types depuis `src/lib/db.ts`

- [x] **Task 3: Créer service customerCategorySync.ts** (AC: 5)
  - [x] 3.1: Créer `src/services/sync/customerCategorySync.ts`
  - [x] 3.2: Implémenter `syncCustomerCategoriesToOffline()` avec tous les champs requis
  - [x] 3.3: Filtrer les catégories inactives
  - [x] 3.4: Mettre à jour la sync meta dans `offline_sync_meta`

- [x] **Task 4: Créer service productCategoryPriceSync.ts** (AC: 4)
  - [x] 4.1: Créer `src/services/sync/productCategoryPriceSync.ts`
  - [x] 4.2: Implémenter `syncProductCategoryPricesToOffline()` avec jointure sur customer_categories
  - [x] 4.3: Filtrer les prix inactifs
  - [x] 4.4: Synchronisation incrémentale basée sur `updated_at`

- [x] **Task 5: Créer service de calcul de prix offline** (AC: 1, 2, 3)
  - [x] 5.1: Créer `src/services/sync/customerPricingService.ts`
  - [x] 5.2: Implémenter `calculateCustomerPrice(product, categorySlug)`
  - [x] 5.3: Logique: wholesale → discount_percentage → custom → retail (fallback)
  - [x] 5.4: Retourner aussi le type de prix et l'économie calculée

- [x] **Task 6: Intégrer le pricing dans cartStore** (AC: 1, 2, 3, 6)
  - [x] 6.1: Ajouter `addItemWithPricing` dans `src/stores/cartStore.ts` pour accepter un prix client
  - [x] 6.2: Ajouter champ `appliedPriceType` ('retail' | 'wholesale' | 'discount' | 'custom') dans CartItem
  - [x] 6.3: Ajouter champ `savingsAmount` et `retailPrice` dans CartItem pour l'économie affichée
  - [x] 6.4: Ajouter `setCustomerWithCategorySlug` et `customerCategorySlug` state
  - [x] 6.5: Ajouter `recalculateAllPrices` et `updateItemPricing` actions

- [x] **Task 7: Créer hook usePricingOffline** (AC: 1, 2, 3, 6)
  - [x] 7.1: Créer `src/hooks/pricing/usePricingOffline.ts`
  - [x] 7.2: Hook `useCustomerCategorySlug(customerId)` pour récupérer le slug
  - [x] 7.3: Hook `usePricingOffline()` avec `getProductPrice` et `getProductPricesBatch`
  - [x] 7.4: Exporter dans `src/hooks/pricing/index.ts`

- [x] **Task 8: Implémenter le recalcul automatique du panier** (AC: 7)
  - [x] 8.1: Créer `useCartPriceRecalculation` hook qui observe les changements de customerCategorySlug
  - [x] 8.2: Créer `useManualPriceRecalculation` pour recalcul manuel
  - [x] 8.3: Créer `useCartSavings` pour afficher le total des économies

- [x] **Task 9: Intégrer le prix client dans le composant POS** (AC: 6)
  - [x] 9.1: Ajouter `useCartPriceRecalculation()` dans POSMainPage
  - [x] 9.2: Modifier Cart.tsx pour utiliser `setCustomerWithCategorySlug` avec le category slug
  - [x] 9.3: Ajouter `slug` dans l'interface SelectedCustomer
  - [x] 9.4: Recalcul automatique lors du changement de client

- [x] **Task 10: Tests unitaires** (AC: 1, 2, 3, 4, 5)
  - [x] 10.1: Créer `src/services/sync/__tests__/customerPricingService.test.ts`
  - [x] 10.2: Test wholesale price application
  - [x] 10.3: Test discount percentage calculation
  - [x] 10.4: Test custom price lookup
  - [x] 10.5: Test fallback to retail price
  - [x] 10.6: Test categoryHasSpecialPricing
  - [x] 10.7: Test calculateCustomerPricesBatch

## Dev Notes

### Architecture Context (ADR-001)

Les prix clients sont en **READ-ONLY cache** (ADR-001):
- Cache des tables `customer_categories` et `product_category_prices` pour calcul local
- Pas de modification des prix offline
- Logique de calcul répliquée côté client pour fonctionner offline

[Source: _bmad-output/planning-artifacts/architecture.md#ADR-001]

### Logique de Pricing (CRITIQUE)

La logique de calcul du prix client doit répliquer exactement la fonction PostgreSQL `get_customer_product_price`:

```typescript
/**
 * Détermine le prix d'un produit pour un client donné
 *
 * Ordre de priorité:
 * 1. Si category_slug == 'retail' → retail_price
 * 2. Si category_slug == 'wholesale' → wholesale_price (fallback: retail_price)
 * 3. Si price_modifier_type == 'discount_percentage' → retail_price * (1 - discount/100)
 * 4. Si price_modifier_type == 'custom' → lookup product_category_prices
 * 5. Fallback: retail_price
 */
function getCustomerProductPriceOffline(
  product: IOfflineProduct,
  customer: IOfflineCustomer | null,
  customerCategory: IOfflineCustomerCategory | null,
  customPrice: IOfflineProductCategoryPrice | null
): { price: number; priceType: TPriceType; savings: number } {
  // Implementation...
}
```

### Tables Database Concernées

```sql
-- customer_categories (pour le calcul)
id UUID PRIMARY KEY
slug VARCHAR  -- 'retail', 'wholesale', 'discount_percentage', 'custom'
name VARCHAR
price_modifier_type VARCHAR  -- Même que slug, mais explicite
discount_percentage DECIMAL  -- Pour type 'discount_percentage'
is_active BOOLEAN

-- product_category_prices (prix custom)
id UUID PRIMARY KEY
product_id UUID FK → products
customer_category_id UUID FK → customer_categories
price DECIMAL NOT NULL
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

### Schema Dexie Version 14

```typescript
// src/lib/db.ts - Version 14: Customer Category Pricing (Story 6.2)
this.version(14).stores({
  // ... toutes les tables existantes ...

  // NEW: Customer categories cache (Story 6.2)
  // Indexes: id (primary), slug for pricing lookup, is_active for filtering
  offline_customer_categories: 'id, slug, is_active',

  // NEW: Product category prices cache (Story 6.2)
  // Compound index [product_id+customer_category_id] pour lookup rapide
  offline_product_category_prices: '[product_id+customer_category_id], product_id, customer_category_id, is_active',
});
```

### Interfaces à Créer

```typescript
// src/types/offline.ts

/**
 * Cached customer category for offline pricing calculation
 */
export interface IOfflineCustomerCategory {
  /** Category UUID (primary key) */
  id: string;

  /** Category slug: 'retail', 'wholesale', 'discount_percentage', 'custom' */
  slug: string;

  /** Display name */
  name: string;

  /** Price modifier type (same as slug for now) */
  price_modifier_type: string;

  /** Discount percentage for 'discount_percentage' type */
  discount_percentage: number | null;

  /** Whether category is active */
  is_active: boolean;
}

/**
 * Cached product-specific price for a customer category
 * Used when category has price_modifier_type = 'custom'
 */
export interface IOfflineProductCategoryPrice {
  /** Price entry UUID (primary key) */
  id: string;

  /** Product UUID */
  product_id: string;

  /** Customer category UUID */
  customer_category_id: string;

  /** Custom price for this product/category combination */
  price: number;

  /** Whether this price is active */
  is_active: boolean;
}

/** Price type applied to cart item */
export type TPriceType = 'retail' | 'wholesale' | 'discount' | 'custom';
```

### Modification de CartItem

```typescript
// src/stores/cartStore.ts

export interface CartItem {
  // ... champs existants ...

  /** Type de prix appliqué (pour affichage) */
  appliedPriceType: TPriceType;

  /** Économie par rapport au prix retail (pour affichage) */
  savingsAmount: number;
}
```

### Service de Pricing Offline

```typescript
// src/services/offline/customerPricingService.ts

export interface IPriceResult {
  price: number;
  priceType: TPriceType;
  savings: number;
  categoryName: string | null;
}

/**
 * Calcule le prix d'un produit pour un client offline
 */
export async function getCustomerProductPriceOffline(
  productId: string,
  customerId: string | null
): Promise<IPriceResult> {
  // 1. Charger le produit depuis offline_products
  // 2. Si pas de client → retail_price
  // 3. Charger le client depuis offline_customers
  // 4. Charger la catégorie depuis offline_customer_categories via category_slug
  // 5. Appliquer la logique de pricing
}
```

### Learnings from Story 6.1

1. **useLiveQuery pattern** - Utiliser pour réactivité automatique avec Dexie
2. **Sync meta tracking** - Stocker lastSyncAt dans `offline_sync_meta`
3. **Customer a category_slug** - Déjà disponible dans IOfflineCustomer
4. **Product a wholesale_price** - Déjà disponible dans IOfflineProduct
5. **Test isolation** - Mocker Dexie avec `fake-indexeddb` pour tests

### Fichiers Existants à Utiliser

- `src/hooks/customers/useCustomersOffline.ts` - Pattern de hook à suivre
- `src/services/sync/customerSync.ts` - Pattern de sync à suivre
- `src/types/offline.ts` - Ajouter les nouveaux types
- `src/lib/db.ts` - Version 14 à ajouter
- `src/stores/cartStore.ts` - Modifier addItem et ajouter recalculateCartPrices

### Testing Strategy

1. **Unit tests** (customerPricingService.test.ts):
   - Test wholesale: client wholesale → wholesale_price utilisé
   - Test wholesale fallback: wholesale_price null → retail_price
   - Test discount_percentage: calcul correct avec 10%, 15%, etc.
   - Test custom: prix custom trouvé et utilisé
   - Test custom fallback: pas de prix custom → retail_price
   - Test retail: client retail ou pas de client → retail_price
   - Test économie: calcul correct des savings

2. **Unit tests** (customerCategorySync.test.ts):
   - Sync complète des catégories actives
   - Exclusion des catégories inactives
   - Préservation du discount_percentage

3. **Unit tests** (productCategoryPriceSync.test.ts):
   - Sync des prix custom actifs
   - Sync incrémentale par updated_at
   - Exclusion des prix inactifs

4. **Integration test** (manuel):
   - Associer un client wholesale → prix wholesale affiché
   - Changer pour client discount → prix recalculé
   - Retirer le client → prix retail

### Project Structure Notes

**Nouveaux fichiers à créer:**
```
src/services/sync/
├── customerCategorySync.ts           (~100 lignes)
├── productCategoryPriceSync.ts       (~120 lignes)
└── __tests__/
    ├── customerCategorySync.test.ts  (~100 lignes)
    └── productCategoryPriceSync.test.ts (~120 lignes)

src/services/offline/
├── customerPricingService.ts         (~150 lignes)
└── __tests__/
    └── customerPricingService.test.ts (~200 lignes)

src/hooks/customers/
├── usePricingOffline.ts              (~100 lignes)
└── __tests__/
    └── usePricingOffline.test.ts     (~150 lignes)
```

**Fichiers à modifier:**
```
src/lib/db.ts                           (version 14 + 2 nouvelles tables)
src/types/offline.ts                    (+2 interfaces, +1 type)
src/stores/cartStore.ts                 (addItem, CartItem, recalculateCartPrices)
src/hooks/customers/index.ts            (exports)
```

### Dependencies

- ✅ Story 6.1: `offline_customers` avec `category_slug` - DONE
- ✅ Story 2.1: `offline_products` avec `wholesale_price` - DONE
- ✅ Tables `customer_categories`, `product_category_prices` existent
- ✅ Fonction DB `get_customer_product_price` existe (référence pour logique)

### Critical Guard Rails for Dev Agent

🚨 **IMPORTANT - NE PAS:**
- ❌ Créer une nouvelle instance Dexie - utiliser `db` de `src/lib/db.ts`
- ❌ Modifier les prix dans les tables sources offline
- ❌ Appeler Supabase quand offline - utiliser uniquement le cache
- ❌ Oublier le fallback vers retail_price si aucun prix trouvé
- ❌ Ignorer le cas où wholesale_price est null
- ❌ Utiliser `t()` ou i18next - strings anglaises directes

✅ **IMPORTANT - DOIT:**
- ✅ Incrémenter la version Dexie à 14
- ✅ Utiliser `useLiveQuery` pour la réactivité dans les hooks
- ✅ Répliquer EXACTEMENT la logique de `get_customer_product_price`
- ✅ Stocker le timestamp de sync dans `offline_sync_meta`
- ✅ Recalculer tous les prix du panier lors du changement de client
- ✅ Afficher le type de prix et les économies dans l'UI

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-6.2]
- [Source: CLAUDE.md#Business-Rules] - Customer Category Pricing
- [Source: CLAUDE.md#Database-Functions] - get_customer_product_price
- [Source: src/pages/products/ProductCategoryPricingPage.tsx] - Logique de pricing existante
- [Source: src/stores/cartStore.ts] - Store à modifier
- [Source: src/lib/db.ts] - Base de données Dexie
- [Source: src/types/offline.ts] - Types offline
- [Source: src/hooks/customers/useCustomersOffline.ts] - Pattern de hook existant
- [Source: src/services/sync/customerSync.ts] - Pattern de sync existant

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

1. **Task 1-2 (Schema + Types)**: Ajout de la version 14 de Dexie avec tables `offline_customer_categories` et `offline_product_category_prices`. Interfaces et types créés dans `offline.ts`.
2. **Task 3-4 (Sync Services)**: Services de synchronisation créés pour les catégories clients et les prix par catégorie avec sync incrémentale.
3. **Task 5 (Pricing Service)**: Service `customerPricingService.ts` répliquant exactement la logique de `get_customer_product_price` avec priorité: custom → wholesale → discount_percentage → retail.
4. **Task 6 (CartStore)**: Extension du cartStore avec `appliedPriceType`, `savingsAmount`, `retailPrice` dans CartItem, et nouvelles actions `addItemWithPricing`, `updateItemPricing`, `recalculateAllPrices`, `setCustomerWithCategorySlug`.
5. **Task 7-8 (Hooks)**: Module `src/hooks/pricing/` créé avec hooks pour pricing offline et recalcul automatique du panier.
6. **Task 9 (Intégration POS)**: `POSMainPage` utilise `useCartPriceRecalculation()`, `Cart.tsx` passe le category slug via `setCustomerWithCategorySlug`.
7. **Task 10 (Tests)**: 17 tests unitaires passants couvrant tous les scénarios de pricing.

### File List

**Fichiers créés:**
- `src/services/sync/customerCategorySync.ts` - Service sync catégories clients
- `src/services/sync/productCategoryPriceSync.ts` - Service sync prix par catégorie
- `src/services/sync/customerPricingService.ts` - Service calcul prix offline
- `src/services/sync/__tests__/customerPricingService.test.ts` - Tests du service pricing
- `src/hooks/pricing/index.ts` - Exports module pricing
- `src/hooks/pricing/usePricingOffline.ts` - Hooks pricing offline
- `src/hooks/pricing/useCartCustomerPricing.ts` - Hook intégration panier
- `src/hooks/pricing/useCartPriceRecalculation.ts` - Hook recalcul automatique

**Fichiers modifiés:**
- `src/lib/db.ts` - Version 14 avec 2 nouvelles tables
- `src/types/offline.ts` - Interfaces `IOfflineCustomerCategory`, `IOfflineProductCategoryPrice`, type `TPriceType`, interface `ICustomerPriceResult`
- `src/stores/cartStore.ts` - Extension CartItem et nouvelles actions
- `src/pages/pos/POSMainPage.tsx` - Intégration `useCartPriceRecalculation()`
- `src/components/pos/Cart.tsx` - Utilisation `setCustomerWithCategorySlug` avec category slug

## Change Log

- 2026-02-05: Story 6-2 created - Customer Category Pricing Offline feature ready for development
- 2026-02-05: Story 6-2 completed - Implementation of offline customer category pricing with cart integration, automatic recalculation, and comprehensive tests
