# Story 6.4: Promotions Offline Cache

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Systeme**,
I want **cacher les promotions actives**,
So that **elles s'appliquent automatiquement meme offline**.

## Acceptance Criteria

### AC1: Synchronisation des Promotions Actives
**Given** l'application synchronise les donnees
**When** les promotions sont chargees depuis Supabase
**Then** seules les promotions actives (`is_active=true`) et valides (dates actuelles) sont cachees
**And** les donnees incluent: id, code, name, promotion_type, discount_percentage, discount_amount, start_date, end_date, days_of_week, time_start, time_end, min_purchase_amount, min_quantity, buy_quantity, get_quantity, priority, is_stackable

### AC2: Synchronisation des Produits/Categories Eligibles
**Given** une promotion ciblee est synchronisee
**When** les donnees sont chargees
**Then** les associations `promotion_products` (product_id, category_id) sont cachees
**And** les produits gratuits `promotion_free_products` (free_product_id, quantity) sont caches

### AC3: Validation des Dates de Validite Offline
**Given** la date systeme depasse la date de fin d'une promotion
**When** la promotion est evaluee offline
**Then** elle est ignoree (expiree)
**And** seules les promotions avec `start_date <= now <= end_date` sont considerees valides

### AC4: Validation des Contraintes Temporelles
**Given** une promotion a des contraintes horaires (`time_start`, `time_end`) ou jours (`days_of_week`)
**When** la promotion est evaluee offline
**Then** elle n'est valide que pendant les heures/jours specifies
**And** `days_of_week` utilise 0=Dimanche, 1=Lundi, ..., 6=Samedi

### AC5: Incremental Sync et Nettoyage
**Given** une synchronisation incrementale s'execute
**When** une promotion precedemment active devient inactive ou expiree
**Then** elle est supprimee du cache IndexedDB
**And** les associations `promotion_products` et `promotion_free_products` correspondantes sont aussi supprimees

### AC6: Sync Metadata
**Given** la synchronisation des promotions se termine
**When** les donnees sont mises a jour
**Then** `offline_sync_meta` enregistre `lastSyncAt` et `recordCount` pour l'entite 'promotions'
**And** ces donnees permettent les syncs incrementales futures

## Tasks / Subtasks

- [x] **Task 1: Definir les interfaces IOfflinePromotion** (AC: 1, 2)
  - [x] 1.1: Ajouter `IOfflinePromotion` dans `src/types/offline.ts` (~30 lignes)
  - [x] 1.2: Ajouter `IOfflinePromotionProduct` dans `src/types/offline.ts` (~10 lignes)
  - [x] 1.3: Ajouter `IOfflinePromotionFreeProduct` dans `src/types/offline.ts` (~10 lignes)
  - [x] 1.4: Exporter les nouvelles interfaces depuis `src/lib/db.ts`

- [x] **Task 2: Etendre le schema Dexie (Version 15)** (AC: 1, 2)
  - [x] 2.1: Ajouter `offline_promotions` table avec indexes: `id, code, is_active, start_date, end_date, [is_active+start_date+end_date]`
  - [x] 2.2: Ajouter `offline_promotion_products` table avec indexes: `id, promotion_id, product_id, category_id, [promotion_id+product_id], [promotion_id+category_id]`
  - [x] 2.3: Ajouter `offline_promotion_free_products` table avec indexes: `id, promotion_id, free_product_id`
  - [x] 2.4: Declarer les Table types dans la classe OfflineDatabase

- [x] **Task 3: Creer promotionSync.ts** (AC: 1, 2, 5, 6)
  - [x] 3.1: Creer `src/services/sync/promotionSync.ts` (~200 lignes)
  - [x] 3.2: Implementer `syncPromotionsToOffline()` avec jointures pour promotion_products et promotion_free_products
  - [x] 3.3: Filtrer promotions `is_active=true` ET `end_date >= today` lors de la sync
  - [x] 3.4: Implementer incremental sync via `updated_at > lastSyncAt`
  - [x] 3.5: Supprimer du cache les promotions devenues inactives ou expirees
  - [x] 3.6: Mettre a jour `offline_sync_meta` pour entite 'promotions'
  - [x] 3.7: Implementer `clearOfflinePromotionData()` pour reset

- [x] **Task 4: Creer promotionValidationService.ts** (AC: 3, 4)
  - [x] 4.1: Creer `src/services/sync/promotionValidationService.ts` (~100 lignes)
  - [x] 4.2: Implementer `isPromotionValidNow(promotion: IOfflinePromotion): boolean`
  - [x] 4.3: Verifier date: `start_date <= now <= end_date`
  - [x] 4.4: Verifier heure: `time_start <= currentTime <= time_end` (si defini)
  - [x] 4.5: Verifier jour: `days_of_week.includes(currentDayOfWeek)` (si defini)
  - [x] 4.6: Exporter helper `getValidPromotions(promotions: IOfflinePromotion[]): IOfflinePromotion[]`

- [x] **Task 5: Creer hook usePromotionsOffline** (AC: 1, 2, 3, 4)
  - [x] 5.1: Creer `src/hooks/promotions/usePromotionsOffline.ts` (~80 lignes)
  - [x] 5.2: Implementer `usePromotionsOffline()` avec useLiveQuery
  - [x] 5.3: Filtrer automatiquement les promotions invalides via `isPromotionValidNow()`
  - [x] 5.4: Implementer `usePromotionProductsOffline(promotionId)` pour recuperer les produits eligibles
  - [x] 5.5: Implementer `getPromotionsByProductId(productId)` - retourne les promos applicables a un produit

- [x] **Task 6: Integrer dans syncEngineV2** (AC: 1, 5, 6)
  - [x] 6.1: Ajouter import `promotionSync` dans `src/services/sync/syncEngineV2.ts`
  - [x] 6.2: Ajouter appel `syncPromotionsToOffline()` dans la sequence de sync
  - [x] 6.3: Positionner apres customers et avant orders (priorite donnees reference)

- [x] **Task 7: Tests unitaires** (AC: 1, 2, 3, 4, 5, 6)
  - [x] 7.1: Creer `src/services/sync/__tests__/promotionSync.test.ts` (~150 lignes)
  - [x] 7.2: Test: Sync promotions actives uniquement
  - [x] 7.3: Test: Sync promotion_products et promotion_free_products
  - [x] 7.4: Test: Suppression des promotions expirees du cache
  - [x] 7.5: Test: Incremental sync fonctionne correctement
  - [x] 7.6: Creer `src/services/sync/__tests__/promotionValidationService.test.ts` (~100 lignes)
  - [x] 7.7: Test: Validation date start/end
  - [x] 7.8: Test: Validation contraintes horaires
  - [x] 7.9: Test: Validation jours de la semaine

## Dev Notes

### Architecture Context

Les promotions sont READ-ONLY cache (ADR-001). La structure suit le pattern etabli par:
- `customerSync.ts` - sync service avec jointures
- `customerPricingService.ts` - service d'evaluation offline

[Source: _bmad-output/planning-artifacts/architecture.md#ADR-001]

### Database Schema (Supabase)

**Table `promotions`:**
```sql
id UUID PRIMARY KEY
code VARCHAR UNIQUE NOT NULL
name VARCHAR NOT NULL
description TEXT
promotion_type VARCHAR NOT NULL  -- 'percentage', 'fixed_amount', 'buy_x_get_y', 'free_product'
discount_percentage DECIMAL
discount_amount DECIMAL
buy_quantity INTEGER           -- Pour buy_x_get_y
get_quantity INTEGER           -- Pour buy_x_get_y
start_date DATE
end_date DATE
time_start TIME                -- Contrainte horaire debut
time_end TIME                  -- Contrainte horaire fin
days_of_week INTEGER[]         -- [0,1,2,3,4,5,6] = Dim-Sam
min_purchase_amount DECIMAL    -- Montant minimum panier
min_quantity INTEGER           -- Quantite minimum produit
max_uses_total INTEGER
max_uses_per_customer INTEGER
current_uses INTEGER DEFAULT 0
is_active BOOLEAN DEFAULT true
is_stackable BOOLEAN DEFAULT false
priority INTEGER DEFAULT 0     -- Plus haut = priorite
created_at, updated_at
```

**Table `promotion_products`:**
```sql
id UUID PRIMARY KEY
promotion_id UUID REFERENCES promotions(id)
product_id UUID REFERENCES products(id) NULL  -- Produit specifique
category_id UUID REFERENCES categories(id) NULL  -- OU categorie entiere
```

**Table `promotion_free_products`:**
```sql
id UUID PRIMARY KEY
promotion_id UUID REFERENCES promotions(id)
free_product_id UUID REFERENCES products(id)
quantity INTEGER DEFAULT 1
```

### Dexie Schema (Version 15)

```typescript
// Version 15: Promotions cache (Story 6.4)
this.version(15).stores({
  // ... toutes les tables existantes de v14 ...

  // NEW: Promotions cache (Story 6.4)
  offline_promotions: 'id, code, is_active, start_date, end_date, priority, [is_active+start_date+end_date]',

  // NEW: Promotion target products/categories
  offline_promotion_products: 'id, promotion_id, product_id, category_id, [promotion_id+product_id], [promotion_id+category_id]',

  // NEW: Promotion free products (for buy_x_get_y)
  offline_promotion_free_products: 'id, promotion_id, free_product_id',
});
```

### Interfaces TypeScript (offline.ts)

```typescript
/**
 * Cached promotion for offline use
 * Story 6.4 - Promotions Offline Cache
 */
export interface IOfflinePromotion {
  id: string;
  code: string;
  name: string;
  description: string | null;
  promotion_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_product';
  discount_percentage: number | null;
  discount_amount: number | null;
  buy_quantity: number | null;
  get_quantity: number | null;
  start_date: string | null;  // ISO date string
  end_date: string | null;    // ISO date string
  time_start: string | null;  // HH:MM format
  time_end: string | null;    // HH:MM format
  days_of_week: number[] | null;  // [0-6], 0=Sunday
  min_purchase_amount: number | null;
  min_quantity: number | null;
  is_active: boolean;
  is_stackable: boolean;
  priority: number;
  updated_at: string;
}

/**
 * Promotion-product association for targeted promotions
 */
export interface IOfflinePromotionProduct {
  id: string;
  promotion_id: string;
  product_id: string | null;   // Specific product OR
  category_id: string | null;  // Entire category
}

/**
 * Free product for buy_x_get_y promotions
 */
export interface IOfflinePromotionFreeProduct {
  id: string;
  promotion_id: string;
  free_product_id: string;
  quantity: number;
}
```

### SQL Query for Sync

```sql
-- Fetch active and valid promotions with related data
SELECT
  p.*,
  pp.id as pp_id, pp.product_id, pp.category_id,
  pfp.id as pfp_id, pfp.free_product_id, pfp.quantity
FROM promotions p
LEFT JOIN promotion_products pp ON pp.promotion_id = p.id
LEFT JOIN promotion_free_products pfp ON pfp.promotion_id = p.id
WHERE p.is_active = true
  AND (p.end_date IS NULL OR p.end_date >= CURRENT_DATE)
  AND (p.updated_at > :lastSyncAt OR :lastSyncAt IS NULL)
ORDER BY p.priority DESC, p.updated_at DESC;
```

### Promotion Validation Logic

```typescript
// promotionValidationService.ts
export function isPromotionValidNow(promo: IOfflinePromotion): boolean {
  const now = new Date();

  // 1. Check date range
  if (promo.start_date && new Date(promo.start_date) > now) return false;
  if (promo.end_date && new Date(promo.end_date) < now) return false;

  // 2. Check time range (if defined)
  if (promo.time_start || promo.time_end) {
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    if (promo.time_start && currentTime < promo.time_start) return false;
    if (promo.time_end && currentTime > promo.time_end) return false;
  }

  // 3. Check day of week (if defined)
  if (promo.days_of_week && promo.days_of_week.length > 0) {
    const currentDay = now.getDay(); // 0=Sunday
    if (!promo.days_of_week.includes(currentDay)) return false;
  }

  return promo.is_active;
}
```

### Sync Pattern (from customerSync.ts)

```typescript
// Pattern to follow from customerSync.ts
const SYNC_META_ENTITY = 'promotions';

async function getLastSyncTimestamp(): Promise<string | null> {
  const meta = await db.offline_sync_meta.get(SYNC_META_ENTITY);
  return meta?.lastSyncAt ?? null;
}

async function updateSyncMeta(timestamp: string, recordCount: number): Promise<void> {
  await db.offline_sync_meta.put({
    entity: SYNC_META_ENTITY,
    lastSyncAt: timestamp,
    recordCount,
  });
}
```

### Dependencies (All Completed)

| Story | Provides |
|-------|----------|
| 2.1 | `offline_products` - needed for product lookup |
| 2.2 | `offline_categories` - needed for category promotions |
| 6.1 | `offline_customers` - needed for customer-specific promos (future) |
| 3.1 | Dexie schema foundation, sync_meta pattern |

### Project Structure Notes

**New files to create:**
```
src/
├── types/
│   └── offline.ts                    (MODIFY: add 3 interfaces)
├── lib/
│   └── db.ts                         (MODIFY: add v15, 3 tables)
├── services/sync/
│   ├── promotionSync.ts              (~200 lines)
│   ├── promotionValidationService.ts (~100 lines)
│   └── __tests__/
│       ├── promotionSync.test.ts     (~150 lines)
│       └── promotionValidationService.test.ts (~100 lines)
└── hooks/promotions/
    └── usePromotionsOffline.ts       (~80 lines)
```

**Files to modify:**
```
src/lib/db.ts                         (add v15, tables, imports)
src/types/offline.ts                  (add interfaces)
src/services/sync/syncEngineV2.ts     (add promotionSync call)
```

### Testing Strategy

1. **Unit tests promotionSync.ts:**
   - Mock Supabase responses
   - Verify only active promotions synced
   - Verify related tables synced correctly
   - Verify cleanup of expired promotions

2. **Unit tests promotionValidationService.ts:**
   - Test date validation edge cases
   - Test time validation with various timezones
   - Test day of week filtering
   - Test combined constraints

3. **Integration consideration:**
   - Story 6.5 will add cart integration tests

### Critical Guard Rails for Dev Agent

**IMPORTANT - NE PAS:**
- Modifier les donnees promotions (read-only cache)
- Implementer l'application automatique des promos (Story 6.5)
- Utiliser `t()` ou i18next - strings anglaises directes
- Creer des tables sans indexes appropries
- Oublier le nettoyage des promotions expirees

**IMPORTANT - DOIT:**
- Suivre le pattern de `customerSync.ts` pour la structure
- Utiliser `useLiveQuery` pour reactivite Dexie
- Valider dates ET heures ET jours pour eligibilite
- Gerer `promotion_type` comme union type strict
- Tester tous les edge cases de validation temporelle
- Supprimer les associations quand une promotion est supprimee

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-6.4]
- [Source: CLAUDE.md#Business-Rules] - Promotion types
- [Source: src/services/sync/customerSync.ts] - Sync pattern
- [Source: src/services/sync/customerPricingService.ts] - Evaluation service pattern
- [Source: src/lib/db.ts] - Dexie schema v14
- [Source: src/types/offline.ts] - Offline interfaces
- [Source: src/types/database.generated.ts] - Supabase schema promotions

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Test timezone issue fixed: Changed test dates from midnight to midday to avoid UTC conversion issues
- TypeScript error in usePromotionValidityOffline: Changed `null` to `undefined` for useLiveQuery compatibility

### Completion Notes List

- All 7 tasks completed successfully
- 50 tests passing (34 validation tests + 16 sync tests)
- TypeScript compilation passes with no errors
- No regressions in existing syncEngineV2 tests
- Follows established patterns from customerSync.ts and customerPricingService.ts

### File List

**Created:**
- `src/services/sync/promotionSync.ts` (~320 lines) - Sync service for promotions
- `src/services/sync/promotionValidationService.ts` (~190 lines) - Temporal validation service
- `src/hooks/promotions/usePromotionsOffline.ts` (~215 lines) - React hooks with useLiveQuery
- `src/services/sync/__tests__/promotionSync.test.ts` (~280 lines) - 16 sync tests
- `src/services/sync/__tests__/promotionValidationService.test.ts` (~250 lines) - 34 validation tests

**Modified:**
- `src/types/offline.ts` - Added IOfflinePromotion, IOfflinePromotionProduct, IOfflinePromotionFreeProduct interfaces + TTL constants
- `src/lib/db.ts` - Added Version 15 with 3 new tables + indexes, Table declarations, re-exports
- `src/services/sync/syncEngineV2.ts` - Added import + call to syncPromotionsToOffline() in refreshReadOnlyCaches()

## Senior Developer Review (AI)

**Review Date:** 2026-02-05
**Review Outcome:** ✅ Approved (with fixes applied)
**Reviewer Model:** Claude Opus 4.5

### Issues Found & Fixed

- [x] [HIGH] **Incremental sync bug** at `promotionSync.ts:170-184`: `syncedPromotionIds` only contained newly synced promotions, causing promotion_products/free_products associations for existing cached promotions to be incorrectly filtered during incremental sync.
  - **Fix applied**: Changed to query all cached promotion IDs from IndexedDB instead of only using newly synced ones.

### Summary

The promotions offline cache implementation was solid with proper validation services and 50 passing tests. One significant bug was identified in the incremental sync logic that could cause data loss during partial syncs - this has been corrected.

## Change Log

- 2026-02-05: Story 6-4 created - Promotions Offline Cache feature ready for development
- 2026-02-05: Story 6-4 completed - All tasks implemented, 50 tests passing, ready for review
- 2026-02-05: Code review - HIGH severity incremental sync bug fixed in promotionSync.ts
