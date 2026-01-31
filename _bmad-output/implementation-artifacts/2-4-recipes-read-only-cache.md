# Story 2.4: Recipes Read-Only Cache (Costing Display)

## Status: COMPLETED

## Summary
Implemented offline caching for recipes to enable costing display when offline, allowing managers to consult product costs and margins even without internet connectivity.

## User Story
**As a** Manager
**I want** consulter les coûts produits même offline
**So that** je peux vérifier les marges sans internet

## Acceptance Criteria

| AC | Requirement | Status |
|---|---|---|
| AC1 | Recipes Sync to Cache: cost_price and margin fields from products included in cache | ✅ |
| AC2 | Read-Only Access Offline: See cost_price and calculated margin offline | ✅ |
| AC3 | Recipe Ingredients List: List visible (read-only) in costing display | ✅ |

## Implementation Details

### Files Created

1. **`src/types/offline.ts`** - Added types:
   - `IOfflineRecipe` - Cached recipe interface
   - `IOfflineRecipeWithMaterial` - Recipe with joined material data
   - `RECIPES_CACHE_TTL_MS` - 24h TTL constant
   - `RECIPES_REFRESH_INTERVAL_MS` - 1h refresh interval

2. **`src/lib/db.ts`** - Added:
   - `offline_recipes` table declaration
   - Version 6 schema with indexes: `id, product_id, material_id, is_active, [is_active+product_id]`
   - Export of `IOfflineRecipe` type

3. **`src/services/offline/recipesCacheService.ts`** - Cache service with:
   - `cacheAllRecipes()` - Fetch from Supabase, store in Dexie
   - `getCachedRecipesForProduct(productId)` - Get recipes by product
   - `getCachedRecipesWithMaterials(productId)` - Join with offline_products for costing
   - `getLastRecipesSyncAt()` / `getRecipesSyncMeta()` - Metadata
   - `shouldRefreshRecipes()` / `shouldRefreshRecipesHourly()` - TTL checks
   - `clearRecipesCache()` - Cache cleanup

4. **`src/hooks/offline/useRecipesOffline.ts`** - React hook:
   - `useRecipesOffline(productId)` - Main hook with online/offline switching
   - `useOfflineRecipesRaw(productId)` - Raw data access
   - Returns: `data`, `isLoading`, `isOffline`, `lastSyncAt`, `syncMeta`

5. **`src/hooks/offline/index.ts`** - Added exports for new hook

6. **`src/services/offline/productsCacheInit.ts`** - Updated to include:
   - `cacheAllRecipes()` in init flow
   - `shouldRefreshRecipesHourly()` in hourly refresh

### Files Modified

- **Translations** (`fr.json`, `en.json`, `id.json`):
  - Added `product_detail.costing.offlineCache.*` keys

### Tests Created

- **`src/services/offline/__tests__/recipesCacheService.test.ts`** - 28 tests covering:
  - Cache operations (fetch, clear, replace)
  - Read operations (by product, by ID, with materials join)
  - Sync metadata operations
  - TTL and refresh logic
  - Costing calculations (margin, percentage per ingredient)

- **`src/services/offline/__tests__/productsCacheInit.test.ts`** - Updated with:
  - Mocks for modifiers and recipes
  - Tests for all 4 entities (products, categories, modifiers, recipes)

## Architecture Pattern

Follows the established offline cache pattern from Stories 2.1-2.3:

```
Online Mode:
  Component → useRecipesOffline() → useProductRecipe() → Supabase

Offline Mode:
  Component → useRecipesOffline() → getCachedRecipesWithMaterials() → Dexie
```

### Cache Policy (ADR-003)
- **TTL**: 24 hours maximum
- **Refresh**: At startup + every hour when online
- **Storage**: IndexedDB via Dexie

### Key Design Decisions

1. **Separate recipes table**: Rather than embedding in products, recipes are stored separately because:
   - M:N relationship (one product → many ingredients)
   - Allows independent updates
   - Better query performance for costing display

2. **Join with offline_products**: Material cost_price comes from the products cache (Story 2.1), enabling costing calculations without additional network calls.

3. **Boolean coercion**: Dexie stores booleans as 0/1, so all reads use `Boolean()` coercion.

## Usage Example

```tsx
import { useRecipesOffline } from '@/hooks/offline';

function CostingDisplay({ productId, product }: Props) {
  const { data: recipeItems, isOffline, lastSyncAt } = useRecipesOffline(productId);

  // Calculate cost per kg
  const costPerKg = recipeItems.reduce((sum, item) => {
    const materialCost = item.material?.cost_price || 0;
    return sum + (materialCost * item.quantity);
  }, 0);

  // Calculate margin
  const margin = product?.retail_price
    ? ((product.retail_price - costPerKg) / product.retail_price) * 100
    : 0;

  return (
    <>
      {isOffline && lastSyncAt && (
        <div>{t('product_detail.costing.offlineCache.dataFrom', { timestamp: lastSyncAt })}</div>
      )}
      <CostingTab product={product} recipeItems={recipeItems} />
    </>
  );
}
```

## Test Results

```
Test Files: 8 passed (8)
Tests: 216 passed (216)
```

All offline service tests pass including the new recipes cache tests.
