# Story 2.2: Categories Offline Cache

Status: done

## Story

As a **Caissier**,
I want **voir les catégories de produits même offline**,
so that **la navigation par catégorie fonctionne sans internet**.

## Acceptance Criteria

### AC1: Cache Categories au Démarrage
**Given** l'application charge les catégories online
**When** les données sont reçues
**Then** elles sont stockées dans Dexie table `offline_categories`
**And** les champs incluent: id, name, icon, color, sort_order, dispatch_station, is_active, is_raw_material

### AC2: Préservation de l'Ordre de Tri
**Given** les catégories sont cachées
**When** le cache est lu
**Then** l'ordre de tri (`sort_order`) est préservé
**And** les catégories sont retournées triées

### AC3: Lecture Categories Offline
**Given** l'application est offline
**When** je navigue dans le POS
**Then** les catégories s'affichent avec leurs icônes et couleurs
**And** seules les catégories actives (`is_active: true`) sont affichées
**And** les catégories raw_material (`is_raw_material: true`) sont exclues

### AC4: Dispatch Station pour KDS Routing
**Given** les catégories sont cachées
**When** une commande est envoyée au KDS
**Then** la station de dispatch (`dispatch_station`) est disponible pour le routing
**And** les valeurs possibles sont: barista, kitchen, display, none

### AC5: Sync Metadata Tracking
**Given** les catégories sont cachées
**When** l'application est offline
**Then** un timestamp `last_categories_sync_at` est disponible via `offline_sync_meta`
**And** les composants peuvent afficher "Données au {timestamp}"

### AC6: Refresh Policy (même que Products)
**Given** le cache categories a plus de 24h
**When** l'application démarre avec internet
**Then** le cache est rafraîchi automatiquement
**And** le cache horaire se déclenche si online depuis > 1h

## Tasks / Subtasks

- [x] **Task 1: Étendre le schéma Dexie** (AC: 1, 2)
  - [x] 1.1: Ajouter table `offline_categories` dans `src/lib/db.ts` version 4
  - [x] 1.2: Indexes: `id, name, sort_order, is_active, dispatch_station`
  - [x] 1.3: Ajouter type `IOfflineCategory` dans `src/types/offline.ts`

- [x] **Task 2: Créer le service categoriesCacheService** (AC: 1, 2, 5, 6)
  - [x] 2.1: Créer `src/services/offline/categoriesCacheService.ts`
  - [x] 2.2: Implémenter `cacheAllCategories()` - sync depuis Supabase vers Dexie
  - [x] 2.3: Implémenter `getCachedCategories()` - retourne les catégories filtrées et triées
  - [x] 2.4: Implémenter `getCachedCategoryById(id)` - retourne une catégorie par ID
  - [x] 2.5: Implémenter `getLastCategoriesSyncAt()` - retourne timestamp dernière sync
  - [x] 2.6: Implémenter `shouldRefreshCategories()` - vérifie si refresh nécessaire (24h)
  - [x] 2.7: Implémenter `shouldRefreshCategoriesHourly()` - vérifie interval 1h

- [x] **Task 3: Créer le hook useCategoriesOffline** (AC: 3, 4)
  - [x] 3.1: Créer `src/hooks/offline/useCategoriesOffline.ts`
  - [x] 3.2: Utiliser `useNetworkStatus` pour détecter online/offline
  - [x] 3.3: En mode online: utiliser hook `useCategories` existant
  - [x] 3.4: En mode offline: utiliser `useLiveQuery` avec Dexie
  - [x] 3.5: Exposer interface: `categories`, `isLoading`, `isOffline`, `lastSyncAt`
  - [x] 3.6: Implémenter filtrage is_active et is_raw_material automatique

- [x] **Task 4: Intégrer la synchronisation** (AC: 1, 6)
  - [x] 4.1: Ajouter export dans `src/services/offline/index.ts`
  - [x] 4.2: Modifier `productsCacheInit.ts` pour inclure categories sync
  - [x] 4.3: Appeler `cacheAllCategories()` au même moment que products (démarrage + horaire)

- [x] **Task 5: Ajouter les traductions** (AC: 5)
  - [x] 5.1: Ajouter clés dans `fr.json`: `pos.categories.offlineCache.*`
  - [x] 5.2: Ajouter clés dans `en.json`
  - [x] 5.3: Ajouter clés dans `id.json`

- [x] **Task 6: Écrire les tests** (AC: 1, 2, 3, 4, 5, 6)
  - [x] 6.1: Créer `src/services/offline/__tests__/categoriesCacheService.test.ts`
  - [x] 6.2: Tester `cacheAllCategories()` popule Dexie correctement
  - [x] 6.3: Tester `getCachedCategories()` retourne trié par sort_order
  - [x] 6.4: Tester filtrage is_active et is_raw_material
  - [x] 6.5: Tester `getCachedCategoryById()` retourne la bonne catégorie
  - [x] 6.6: Créer `src/hooks/offline/__tests__/useCategoriesOffline.test.ts`
  - [x] 6.7: Tester switch automatique online/offline

## Dev Notes

### Architecture Compliance (MANDATORY)

**ADR-001: Entités Synchronisées Offline** [Source: architecture/core-architectural-decisions.md#ADR-001]
- `categories` → Read-only cache (avec products)
- Refresh: Au démarrage + chaque heure si online
- TTL: 24h max

**ADR-003: Politique de Cache** [Source: architecture/core-architectural-decisions.md#ADR-003]
| Donnée | Refresh Strategy | TTL |
|--------|-----------------|-----|
| `categories` | Au démarrage + chaque heure si online | 24h max |

**Implementation Patterns** [Source: architecture/implementation-patterns-consistency-rules.md]
- Table naming: `offline_categories` (avec prefix)
- Interface naming: `IOfflineCategory`
- Service location: `src/services/offline/categoriesCacheService.ts`
- Hook location: `src/hooks/offline/useCategoriesOffline.ts`

### Existing Code to Reuse

**Hook existant** [Source: src/hooks/products/useCategories.ts]
```typescript
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async (): Promise<Category[]> => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_raw_material', false)
                .eq('is_active', true)
                .order('sort_order')
```
- Le hook existant filtre déjà `is_raw_material: false` et `is_active: true`
- Le hook offline doit reproduire ces filtres
- Fallback vers MOCK_CATEGORIES existe (à ignorer pour offline)

**Type Category existant** [Source: src/types/database.generated.ts]
```typescript
categories: {
  Row: {
    color: string | null
    created_at: string | null
    dispatch_station: Database["public"]["Enums"]["dispatch_station"] | null
    icon: string | null
    id: string
    is_active: boolean | null
    is_raw_material: boolean | null
    name: string
    sort_order: number | null
    updated_at: string | null
  }
}
```

### Previous Story Intelligence

**Story 2.1 Patterns à Suivre** [Source: 2-1-products-offline-cache.md]
1. Schema Dexie: incrémenter version (3 → 4), préserver tables existantes
2. Service pattern: `cacheAll{Entity}()`, `getCached{Entity}()`, `getLast{Entity}SyncAt()`
3. Hook pattern: `use{Entity}Offline()` avec switch transparent online/offline
4. Dexie boolean: stocké comme 0/1, utiliser `.equals(1)` pour queries
5. Tests: mock Supabase + fake-indexeddb
6. Traductions: TOUJOURS 3 fichiers (fr, en, id) sous `pos.{entity}.offlineCache.*`

**Corrections Code Review 2.1:**
- Utiliser `Boolean()` pour coercer les booléens Dexie dans les getters
- Ajouter try/catch dans tous les `useLiveQuery`
- Column `type` → `product_type` (suivre la base de données)

### Schema Dexie v4

```typescript
// src/lib/db.ts - Ajouter à version 4:
this.version(4).stores({
  // Existing v3 tables...
  offline_users: 'id, cached_at',
  offline_sync_queue: '++id, entity, status, created_at',
  offline_settings: 'key, category_id, updated_at',
  offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
  offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
  offline_business_hours: 'day_of_week',
  offline_sync_meta: 'entity',
  offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',

  // NEW: Categories cache (Story 2.2)
  offline_categories: 'id, name, sort_order, is_active, dispatch_station',
});
```

### IOfflineCategory Interface

```typescript
// src/types/offline.ts - Ajouter:
export interface IOfflineCategory {
  /** Category UUID (primary key) */
  id: string;

  /** Category name */
  name: string;

  /** Icon identifier (Lucide icon name) */
  icon: string | null;

  /** Color for UI display (hex or named color) */
  color: string | null;

  /** Sort order for display */
  sort_order: number | null;

  /** Dispatch station: barista, kitchen, display, none */
  dispatch_station: 'barista' | 'kitchen' | 'display' | 'none' | null;

  /** Whether category is active */
  is_active: boolean;

  /** Whether category is for raw materials (excluded from POS) */
  is_raw_material: boolean;

  /** ISO 8601 timestamp of last update */
  updated_at: string | null;
}
```

### categoriesCacheService Pattern

```typescript
// src/services/offline/categoriesCacheService.ts
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type { IOfflineCategory, ISyncMeta } from '@/types/offline';

export async function cacheAllCategories(): Promise<void> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, icon, color, sort_order, dispatch_station, is_active, is_raw_material, updated_at');

  if (error) throw error;

  await db.offline_categories.clear();
  await db.offline_categories.bulkAdd(data as IOfflineCategory[]);

  await db.offline_sync_meta.put({
    entity: 'categories',
    lastSyncAt: new Date().toISOString(),
    recordCount: data.length,
  });
}

export async function getCachedCategories(): Promise<IOfflineCategory[]> {
  const categories = await db.offline_categories.toArray();

  // Filter active non-raw-material categories
  return categories
    .filter(c => Boolean(c.is_active) && !Boolean(c.is_raw_material))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}
```

### useCategoriesOffline Hook Pattern

```typescript
// src/hooks/offline/useCategoriesOffline.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { useNetworkStatus } from './useNetworkStatus';
import { useCategories } from '../products/useCategories';
import { getCachedCategories } from '@/services/offline/categoriesCacheService';
import type { IOfflineCategory } from '@/types/offline';
import type { Category } from '@/types/database';

export function useCategoriesOffline() {
  const { isOnline } = useNetworkStatus();
  const onlineResult = useCategories();

  const offlineCategories = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await getCachedCategories();
      } catch (error) {
        console.error('Error loading offline categories:', error);
        return [];
      }
    },
    [isOnline]
  );

  // Convert offline categories to match online type
  const mapToCategory = (c: IOfflineCategory): Category => ({
    ...c,
    created_at: null,
  } as Category);

  return {
    data: isOnline
      ? onlineResult.data
      : offlineCategories?.map(mapToCategory) ?? [],
    isLoading: isOnline ? onlineResult.isLoading : offlineCategories === undefined,
    isOffline: !isOnline,
    error: isOnline ? onlineResult.error : null,
  };
}
```

### Intégration avec productsCacheInit

La Story 2.1 a créé `productsCacheInit.ts` qui gère l'init et le refresh horaire. Cette story doit:
1. Modifier `productsCacheInit.ts` → `dataCacheInit.ts` (renommage optionnel) OU
2. Ajouter `cacheAllCategories()` dans les mêmes fonctions d'init

**Recommandation:** Ajouter dans la même fonction pour garantir la cohérence products/categories:
```typescript
export async function initDataCache(): Promise<void> {
  await Promise.all([
    cacheAllProducts(),
    cacheAllCategories(),
  ]);
}
```

### Testing Strategy

**Mock Supabase:**
```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
    }),
  },
}));
```

**Fake IndexedDB:**
```typescript
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  await db.offline_categories.clear();
  await db.offline_sync_meta.clear();
});
```

**Test Cases:**
1. `cacheAllCategories()` - vérifie que Dexie est populé
2. `getCachedCategories()` - retourne trié par sort_order
3. Filtrage is_active/is_raw_material
4. `getCachedCategoryById()` - retourne null si non trouvé
5. Hook switch online/offline
6. dispatch_station est préservé

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── services/
│   └── offline/
│       ├── categoriesCacheService.ts      # NEW: Categories cache service
│       └── __tests__/
│           └── categoriesCacheService.test.ts  # NEW: Service tests
├── hooks/
│   └── offline/
│       ├── useCategoriesOffline.ts        # NEW: Offline categories hook
│       └── __tests__/
│           └── useCategoriesOffline.test.ts   # NEW: Hook tests
├── types/
│   └── offline.ts                         # MODIFY: Add IOfflineCategory
└── lib/
    └── db.ts                              # MODIFY: Add offline_categories table, v4
```

**Fichiers à modifier:**
- `src/lib/db.ts` - Ajouter table offline_categories, version 4
- `src/types/offline.ts` - Ajouter IOfflineCategory interface et constantes
- `src/services/offline/index.ts` - Exporter categoriesCacheService
- `src/hooks/offline/index.ts` - Exporter useCategoriesOffline
- `src/services/offline/productsCacheInit.ts` - Ajouter cacheAllCategories()
- `src/locales/fr.json`, `en.json`, `id.json` - Ajouter traductions

### Traductions à Ajouter

```json
// fr.json
{
  "pos": {
    "categories": {
      "offlineCache": {
        "dataFrom": "Catégories au {timestamp}",
        "syncing": "Synchronisation des catégories...",
        "syncSuccess": "{count} catégories synchronisées",
        "syncError": "Erreur de synchronisation des catégories",
        "staleWarning": "Catégories potentiellement obsolètes"
      }
    }
  }
}
```

```json
// en.json
{
  "pos": {
    "categories": {
      "offlineCache": {
        "dataFrom": "Categories as of {timestamp}",
        "syncing": "Syncing categories...",
        "syncSuccess": "{count} categories synced",
        "syncError": "Error syncing categories",
        "staleWarning": "Categories may be outdated"
      }
    }
  }
}
```

```json
// id.json
{
  "pos": {
    "categories": {
      "offlineCache": {
        "dataFrom": "Kategori per {timestamp}",
        "syncing": "Menyinkronkan kategori...",
        "syncSuccess": "{count} kategori disinkronkan",
        "syncError": "Kesalahan sinkronisasi kategori",
        "staleWarning": "Kategori mungkin sudah usang"
      }
    }
  }
}
```

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-2.2]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-003]
- [Source: _bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md]
- [Source: _bmad-output/implementation-artifacts/2-1-products-offline-cache.md] - Previous story patterns
- [Source: src/hooks/products/useCategories.ts] - Existing categories hook
- [Source: src/types/database.generated.ts] - Category type definitions
- [Source: src/lib/db.ts] - Dexie database schema v3
- [Source: src/types/offline.ts] - Offline type definitions
- [Source: CLAUDE.md#Architecture] - Project conventions

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

1. **Task 1**: Extended Dexie schema to version 4 with `offline_categories` table. Added `IOfflineCategory` interface with `TDispatchStation` type.

2. **Task 2**: Created comprehensive `categoriesCacheService.ts` with:
   - `cacheAllCategories()` - Fetches from Supabase and stores in Dexie
   - `getCachedCategories()` - Returns filtered (active, non-raw-material) and sorted categories
   - `getAllCachedCategories()` - Returns all categories without filtering
   - `getCachedCategoryById()` - Single category lookup
   - `getLastCategoriesSyncAt()` / `getCategoriesSyncMeta()` - Sync metadata
   - `shouldRefreshCategories()` / `shouldRefreshCategoriesHourly()` - TTL checks
   - `refreshCategoriesCacheIfNeeded()` / `clearCategoriesCache()` - Cache management

3. **Task 3**: Created `useCategoriesOffline` hook with:
   - `useCategoriesOffline()` - Main hook with transparent online/offline switching
   - `useOfflineCategoriesRaw()` - Direct access to `IOfflineCategory[]`
   - `useCategoryOffline()` - Single category lookup with offline support

4. **Task 4**: Integrated categories sync into `productsCacheInit.ts`:
   - Products and categories now sync in parallel at startup
   - Hourly refresh includes both entities
   - Renamed log messages to `[DataCache]` for clarity

5. **Task 5**: Added translations to all 3 locale files (`fr.json`, `en.json`, `id.json`) under `pos.categories.offlineCache.*`

6. **Task 6**: Created comprehensive test suites:
   - `categoriesCacheService.test.ts`: 30 tests covering all service functions
   - `useCategoriesOffline.test.ts`: 11 tests covering hook behavior

### Test Results

- `categoriesCacheService.test.ts`: **30 passed**
- `useCategoriesOffline.test.ts`: **11 passed**
- `productsCacheInit.test.ts`: **11 passed** (added during code review)
- **Total: 52 tests passed**

### File List

**Files Created:**
- `src/services/offline/categoriesCacheService.ts` - Categories cache service
- `src/hooks/offline/useCategoriesOffline.ts` - Offline categories hook
- `src/services/offline/__tests__/categoriesCacheService.test.ts` - Service tests (30)
- `src/hooks/offline/__tests__/useCategoriesOffline.test.ts` - Hook tests (11)
- `src/services/offline/__tests__/productsCacheInit.test.ts` - Init tests (11) - added during code review

**Files Modified:**
- `src/lib/db.ts` - Added version 4 with `offline_categories` table + compound index
- `src/types/offline.ts` - Added `IOfflineCategory`, `TDispatchStation` (from DB enum), constants
- `src/services/offline/index.ts` - Added exports for categoriesCacheService
- `src/hooks/offline/index.ts` - Added exports for useCategoriesOffline hooks
- `src/services/offline/productsCacheInit.ts` - Integrated categories sync
- `src/locales/fr.json` - Added `pos.categories.offlineCache` section
- `src/locales/en.json` - Added `pos.categories.offlineCache` section
- `src/locales/id.json` - Added `pos.categories.offlineCache` section

## Code Review Record

### Review Date
2026-02-01

### Reviewer Model
Claude Opus 4.5 (claude-opus-4-5-20251101)

### Issues Found and Fixed

| # | Issue | Severity | Fix Applied |
|---|-------|----------|-------------|
| 1 | `TDispatchStation` type manually duplicated instead of using DB enum | MOYENNE | Now imports from `database.generated.ts` |
| 2 | `useCategoryOffline` always returned `undefined` in online mode | HAUTE | Now uses `useCategories` and filters client-side |
| 3 | Missing compound index `[is_active+is_raw_material]` for POS queries | BASSE | Added to Dexie schema |
| 4 | No tests for `productsCacheInit.ts` integration | MOYENNE | Created 11 tests covering init and hourly refresh |
| 5 | `mapToCategory` function duplicated in hook file | BASSE | Extracted as `mapOfflineToCategory` at module level |

### Verification
All 52 tests pass after fixes.

