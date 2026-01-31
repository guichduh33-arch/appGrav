# Story 2.3: Product Modifiers Offline Cache

Status: done

## Story

As a **Caissier**,
I want **appliquer des modifiers aux produits même offline**,
so that **les personnalisations (taille, options) fonctionnent toujours**.

## Acceptance Criteria

### AC1: Cache Modifiers au Démarrage
**Given** les modifiers sont chargés online
**When** les données sont synchronisées
**Then** ils sont stockés dans Dexie table `offline_modifiers`
**And** les champs incluent: id, product_id, category_id, group_name, group_type, group_required, group_sort_order, option_id, option_label, option_icon, price_adjustment, is_default, option_sort_order, is_active

### AC2: Préservation des Relations product_id/category_id
**Given** les modifiers sont cachés
**When** le cache est lu pour un produit
**Then** les modifiers liés au `product_id` sont retournés
**And** si aucun modifier produit, les modifiers de la `category_id` du produit sont retournés
**And** l'héritage produit > catégorie est préservé

### AC3: Lecture Modifiers Offline pour POS
**Given** j'ajoute un produit au panier offline
**When** je choisis un modifier
**Then** les modifiers s'affichent groupés par `group_name`
**And** les groupes `single` utilisent des radio buttons
**And** les groupes `multiple` utilisent des checkboxes
**And** seuls les modifiers actifs (`is_active: true`) sont affichés

### AC4: Calcul du Prix avec Modifiers Offline
**Given** je sélectionne un modifier offline
**When** le modifier a un `price_adjustment`
**Then** le prix s'ajuste correctement
**And** le total est affiché sur le ticket
**And** le modifier apparaît dans les détails de l'item

### AC5: Sync Metadata Tracking
**Given** les modifiers sont cachés
**When** l'application est offline
**Then** un timestamp `last_modifiers_sync_at` est disponible via `offline_sync_meta`
**And** les composants peuvent afficher "Données au {timestamp}"

### AC6: Refresh Policy (même que Products/Categories)
**Given** le cache modifiers a plus de 24h
**When** l'application démarre avec internet
**Then** le cache est rafraîchi automatiquement
**And** le cache horaire se déclenche si online depuis > 1h

## Tasks / Subtasks

- [x] **Task 1: Étendre le schéma Dexie** (AC: 1, 2)
  - [x] 1.1: Ajouter table `offline_modifiers` dans `src/lib/db.ts` version 5
  - [x] 1.2: Indexes: `id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]`
  - [x] 1.3: Ajouter type `IOfflineModifier` dans `src/types/offline.ts`

- [x] **Task 2: Créer le service modifiersCacheService** (AC: 1, 2, 5, 6)
  - [x] 2.1: Créer `src/services/offline/modifiersCacheService.ts`
  - [x] 2.2: Implémenter `cacheAllModifiers()` - sync depuis Supabase vers Dexie
  - [x] 2.3: Implémenter `getCachedModifiersForProduct(productId)` - modifiers spécifiques au produit
  - [x] 2.4: Implémenter `getCachedModifiersForCategory(categoryId)` - modifiers de catégorie
  - [x] 2.5: Implémenter `resolveOfflineModifiers(productId, categoryId)` - résolution héritage
  - [x] 2.6: Implémenter `groupOfflineModifiers(rawModifiers)` - grouper les modifiers
  - [x] 2.7: Implémenter `getLastModifiersSyncAt()` - retourne timestamp dernière sync
  - [x] 2.8: Implémenter `shouldRefreshModifiers()` - vérifie si refresh nécessaire (24h)

- [x] **Task 3: Créer le hook useModifiersOffline** (AC: 3, 4)
  - [x] 3.1: Créer `src/hooks/offline/useModifiersOffline.ts`
  - [x] 3.2: Utiliser `useNetworkStatus` pour détecter online/offline
  - [x] 3.3: En mode online: utiliser hook `useProductModifiersForPOS` existant
  - [x] 3.4: En mode offline: utiliser `useLiveQuery` avec Dexie
  - [x] 3.5: Exposer interface: `modifierGroups`, `isLoading`, `isOffline`, `lastSyncAt`
  - [x] 3.6: Retourner `ModifierGroup[]` (même format que hook online)

- [x] **Task 4: Intégrer la synchronisation** (AC: 1, 6)
  - [x] 4.1: Ajouter export dans `src/services/offline/index.ts`
  - [x] 4.2: Modifier `productsCacheInit.ts` pour inclure modifiers sync
  - [x] 4.3: Appeler `cacheAllModifiers()` au même moment que products/categories (démarrage + horaire)

- [x] **Task 5: Ajouter les traductions** (AC: 5)
  - [x] 5.1: Ajouter clés dans `fr.json`: `pos.modifiersCache.*`
  - [x] 5.2: Ajouter clés dans `en.json`
  - [x] 5.3: Ajouter clés dans `id.json`

- [x] **Task 6: Écrire les tests** (AC: 1, 2, 3, 4, 5, 6)
  - [x] 6.1: Créer `src/services/offline/__tests__/modifiersCacheService.test.ts`
  - [x] 6.2: Tester `cacheAllModifiers()` popule Dexie correctement
  - [x] 6.3: Tester `getCachedModifiersForProduct()` retourne les modifiers produit
  - [x] 6.4: Tester `getCachedModifiersForCategory()` retourne les modifiers catégorie
  - [x] 6.5: Tester `resolveOfflineModifiers()` avec héritage produit > catégorie
  - [x] 6.6: Tester `groupOfflineModifiers()` groupe correctement par group_name
  - [x] 6.7: Tester filtrage is_active
  - [x] 6.8: Créer `src/hooks/offline/__tests__/useModifiersOffline.test.ts`
  - [x] 6.9: Tester switch automatique online/offline

## Dev Notes

### Architecture Compliance (MANDATORY)

**ADR-001: Entités Synchronisées Offline** [Source: architecture/core-architectural-decisions.md#ADR-001]
- `product_modifiers` → Read-only cache (avec products/categories)
- Refresh: Au démarrage + chaque heure si online
- TTL: 24h max

**ADR-003: Politique de Cache** [Source: architecture/core-architectural-decisions.md#ADR-003]
| Donnée | Refresh Strategy | TTL |
|--------|-----------------|-----|
| `modifiers` | Au démarrage + chaque heure si online | 24h max |

**Implementation Patterns** [Source: architecture/implementation-patterns-consistency-rules.md]
- Table naming: `offline_modifiers` (avec prefix)
- Interface naming: `IOfflineModifier`
- Service location: `src/services/offline/modifiersCacheService.ts`
- Hook location: `src/hooks/offline/useModifiersOffline.ts`

### Existing Code to Reuse

**Hook existant** [Source: src/hooks/products/useProductModifiers.ts]
```typescript
// Fonctions utilitaires à réutiliser:
export function groupModifiers(rawModifiers: ProductModifier[]): ModifierGroup[]
export function resolveModifiers(productModifiers, categoryModifiers): ModifierGroup[]

// Hook POS existant - pattern à wrapper:
export function useProductModifiersForPOS(productId?: string, categoryId?: string)
```
- Le hook existant gère déjà l'héritage produit > catégorie
- Réutiliser `groupModifiers()` pour la logique de groupement
- Réutiliser `ModifierGroup` et `ModifierOption` interfaces

**Types existants** [Source: src/types/database.generated.ts]
```typescript
product_modifiers: {
  Row: {
    id: string
    product_id: string | null
    category_id: string | null
    group_name: string
    group_type: "single" | "multiple" | null
    group_required: boolean | null
    group_sort_order: number | null
    option_id: string
    option_label: string
    option_icon: string | null
    price_adjustment: number | null
    is_default: boolean | null
    option_sort_order: number | null
    is_active: boolean | null
    // material_id, material_quantity, materials - pour variantes
  }
}
```

**Type ModifierGroup existant** [Source: src/hooks/products/useProductModifiers.ts]
```typescript
export interface ModifierGroup {
    name: string
    type: 'single' | 'multiple'
    required: boolean
    sortOrder: number
    options: ModifierOption[]
    isInherited?: boolean  // True si de catégorie, false si spécifique produit
}

export interface ModifierOption {
    id: string           // option_id
    dbId?: string        // UUID pour updates
    label: string        // option_label
    icon?: string        // option_icon (emoji)
    priceAdjustment: number
    isDefault: boolean
    sortOrder: number
}
```

### Previous Story Intelligence

**Story 2.1 & 2.2 Patterns à Suivre** [Source: 2-1-products-offline-cache.md, 2-2-categories-offline-cache.md]
1. Schema Dexie: incrémenter version (4 → 5), préserver tables existantes
2. Service pattern: `cacheAll{Entity}()`, `getCached{Entity}()`, `getLast{Entity}SyncAt()`
3. Hook pattern: `use{Entity}Offline()` avec switch transparent online/offline
4. Dexie boolean: stocké comme 0/1, utiliser `Boolean()` pour coercion
5. Tests: mock Supabase + fake-indexeddb
6. Traductions: TOUJOURS 3 fichiers (fr, en, id) sous `pos.{entity}.offlineCache.*`

**Corrections Code Review 2.1/2.2:**
- Utiliser `Boolean()` pour coercer les booléens Dexie dans les getters
- Ajouter try/catch dans tous les `useLiveQuery`
- Ne pas compter sur les index composés pour fake-indexeddb (filtrage mémoire)

### Schema Dexie v5

```typescript
// src/lib/db.ts - Ajouter à version 5:
this.version(5).stores({
  // Existing v4 tables...
  offline_users: 'id, cached_at',
  offline_sync_queue: '++id, entity, status, created_at',
  offline_settings: 'key, category_id, updated_at',
  offline_tax_rates: 'id, is_active, is_default, [is_active+is_default]',
  offline_payment_methods: 'id, is_active, is_default, sort_order, [is_active+is_default]',
  offline_business_hours: 'day_of_week',
  offline_sync_meta: 'entity',
  offline_products: 'id, category_id, sku, name, is_active, pos_visible, [is_active+pos_visible+available_for_sale]',
  offline_categories: 'id, name, sort_order, is_active, dispatch_station, [is_active+is_raw_material]',

  // NEW: Modifiers cache (Story 2.3)
  offline_modifiers: 'id, product_id, category_id, group_name, is_active, [is_active+product_id], [is_active+category_id]',
});
```

### IOfflineModifier Interface

```typescript
// src/types/offline.ts - Ajouter:

/** Product modifier group type (single selection or multiple) */
export type TModifierGroupType = 'single' | 'multiple';

export interface IOfflineModifier {
  /** Modifier UUID (primary key) */
  id: string;

  /** FK to products.id (null if category-level modifier) */
  product_id: string | null;

  /** FK to categories.id (null if product-level modifier) */
  category_id: string | null;

  /** Group name for grouping options (e.g., "Size", "Temperature") */
  group_name: string;

  /** Group type: single (radio) or multiple (checkbox) */
  group_type: TModifierGroupType;

  /** Whether selection in this group is required */
  group_required: boolean;

  /** Sort order for the group */
  group_sort_order: number;

  /** Option identifier within the group */
  option_id: string;

  /** Display label for the option */
  option_label: string;

  /** Emoji icon for the option */
  option_icon: string | null;

  /** Price adjustment in IDR (can be negative) */
  price_adjustment: number;

  /** Whether this option is selected by default */
  is_default: boolean;

  /** Sort order for the option within the group */
  option_sort_order: number;

  /** Whether modifier is active */
  is_active: boolean;

  /** ISO 8601 timestamp of last update */
  updated_at: string | null;
}
```

### modifiersCacheService Pattern

```typescript
// src/services/offline/modifiersCacheService.ts
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import type { IOfflineModifier, ISyncMeta } from '@/types/offline';
import type { ModifierGroup, ModifierOption } from '@/hooks/products/useProductModifiers';

export async function cacheAllModifiers(): Promise<void> {
  const { data, error } = await supabase
    .from('product_modifiers')
    .select(`
      id, product_id, category_id, group_name, group_type, group_required,
      group_sort_order, option_id, option_label, option_icon,
      price_adjustment, is_default, option_sort_order, is_active, updated_at
    `)
    .eq('is_active', true);

  if (error) throw error;

  // Transform to IOfflineModifier format with defaults
  const modifiers: IOfflineModifier[] = (data || []).map(m => ({
    ...m,
    group_type: m.group_type || 'single',
    group_required: Boolean(m.group_required),
    group_sort_order: m.group_sort_order ?? 0,
    price_adjustment: m.price_adjustment ?? 0,
    is_default: Boolean(m.is_default),
    option_sort_order: m.option_sort_order ?? 0,
    is_active: Boolean(m.is_active),
  }));

  await db.offline_modifiers.clear();
  await db.offline_modifiers.bulkAdd(modifiers);

  await db.offline_sync_meta.put({
    entity: 'modifiers',
    lastSyncAt: new Date().toISOString(),
    recordCount: modifiers.length,
  });
}

export async function getCachedModifiersForProduct(productId: string): Promise<IOfflineModifier[]> {
  const modifiers = await db.offline_modifiers
    .where('product_id')
    .equals(productId)
    .toArray();

  return modifiers.filter(m => Boolean(m.is_active));
}

export async function getCachedModifiersForCategory(categoryId: string): Promise<IOfflineModifier[]> {
  const modifiers = await db.offline_modifiers
    .where('category_id')
    .equals(categoryId)
    .toArray();

  return modifiers.filter(m => Boolean(m.is_active));
}

export async function resolveOfflineModifiers(
  productId: string | undefined,
  categoryId: string | undefined
): Promise<ModifierGroup[]> {
  const productModifiers = productId
    ? await getCachedModifiersForProduct(productId)
    : [];
  const categoryModifiers = categoryId
    ? await getCachedModifiersForCategory(categoryId)
    : [];

  // Product modifiers take precedence
  const productGroups = groupOfflineModifiers(productModifiers, false);
  const categoryGroups = groupOfflineModifiers(categoryModifiers, true);

  // Merge: product groups override category groups with same name
  const productGroupNames = new Set(productGroups.map(g => g.name));
  const mergedGroups = [
    ...productGroups,
    ...categoryGroups.filter(g => !productGroupNames.has(g.name)),
  ];

  return mergedGroups.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function groupOfflineModifiers(
  modifiers: IOfflineModifier[],
  isInherited: boolean = false
): ModifierGroup[] {
  const groupMap = new Map<string, ModifierGroup>();

  for (const mod of modifiers) {
    if (!groupMap.has(mod.group_name)) {
      groupMap.set(mod.group_name, {
        name: mod.group_name,
        type: mod.group_type,
        required: mod.group_required,
        sortOrder: mod.group_sort_order,
        options: [],
        isInherited,
      });
    }

    const group = groupMap.get(mod.group_name)!;
    group.options.push({
      id: mod.option_id,
      dbId: mod.id,
      label: mod.option_label,
      icon: mod.option_icon || undefined,
      priceAdjustment: mod.price_adjustment,
      isDefault: mod.is_default,
      sortOrder: mod.option_sort_order,
    });
  }

  // Sort options within each group
  for (const group of groupMap.values()) {
    group.options.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return Array.from(groupMap.values());
}
```

### useModifiersOffline Hook Pattern

```typescript
// src/hooks/offline/useModifiersOffline.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { useNetworkStatus } from '../useNetworkStatus';
import { useProductModifiersForPOS } from '../products/useProductModifiers';
import { resolveOfflineModifiers, getLastModifiersSyncAt } from '@/services/offline/modifiersCacheService';
import type { ModifierGroup } from '../products/useProductModifiers';

export function useModifiersOffline(productId?: string, categoryId?: string) {
  const { isOnline } = useNetworkStatus();
  const onlineResult = useProductModifiersForPOS(productId, categoryId);

  // Offline: use Dexie with live updates
  const offlineModifiers = useLiveQuery(
    async () => {
      if (isOnline) return null;
      try {
        return await resolveOfflineModifiers(productId, categoryId);
      } catch (error) {
        console.error('Error loading offline modifiers:', error);
        return [];
      }
    },
    [isOnline, productId, categoryId]
  );

  const lastSyncAt = useLiveQuery(
    async () => {
      if (isOnline) return null;
      return await getLastModifiersSyncAt();
    },
    [isOnline]
  );

  return {
    modifierGroups: isOnline
      ? onlineResult.data ?? []
      : offlineModifiers ?? [],
    isLoading: isOnline ? onlineResult.isLoading : offlineModifiers === undefined,
    isOffline: !isOnline,
    error: isOnline ? onlineResult.error : null,
    lastSyncAt,
  };
}
```

### Testing Strategy

**Mock Supabase:**
```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
      }),
    }),
  },
}));
```

**Fake IndexedDB:**
```typescript
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  await db.offline_modifiers.clear();
  await db.offline_sync_meta.clear();
});
```

**Test Cases:**
1. `cacheAllModifiers()` - vérifie que Dexie est populé
2. `getCachedModifiersForProduct()` - retourne modifiers produit uniquement
3. `getCachedModifiersForCategory()` - retourne modifiers catégorie uniquement
4. `resolveOfflineModifiers()` - teste l'héritage produit > catégorie
5. `groupOfflineModifiers()` - groupe par group_name, trie par sortOrder
6. Filtrage is_active
7. price_adjustment calcul correct
8. Hook switch online/offline

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── services/
│   └── offline/
│       ├── modifiersCacheService.ts      # NEW: Modifiers cache service
│       └── __tests__/
│           └── modifiersCacheService.test.ts  # NEW: Service tests
├── hooks/
│   └── offline/
│       ├── useModifiersOffline.ts        # NEW: Offline modifiers hook
│       └── __tests__/
│           └── useModifiersOffline.test.ts   # NEW: Hook tests
├── types/
│   └── offline.ts                         # MODIFY: Add IOfflineModifier
└── lib/
    └── db.ts                              # MODIFY: Add offline_modifiers table, v5
```

**Fichiers à modifier:**
- `src/lib/db.ts` - Ajouter table offline_modifiers, version 5
- `src/types/offline.ts` - Ajouter IOfflineModifier, TModifierGroupType
- `src/services/offline/index.ts` - Exporter modifiersCacheService
- `src/hooks/offline/index.ts` - Exporter useModifiersOffline
- `src/services/offline/productsCacheInit.ts` - Ajouter cacheAllModifiers()
- `src/locales/fr.json`, `en.json`, `id.json` - Ajouter traductions

### Traductions à Ajouter

```json
// fr.json
{
  "pos": {
    "modifiers": {
      "offlineCache": {
        "dataFrom": "Modificateurs au {timestamp}",
        "syncing": "Synchronisation des modificateurs...",
        "syncSuccess": "{count} modificateurs synchronisés",
        "syncError": "Erreur de synchronisation des modificateurs",
        "staleWarning": "Modificateurs potentiellement obsolètes"
      }
    }
  }
}
```

```json
// en.json
{
  "pos": {
    "modifiers": {
      "offlineCache": {
        "dataFrom": "Modifiers as of {timestamp}",
        "syncing": "Syncing modifiers...",
        "syncSuccess": "{count} modifiers synced",
        "syncError": "Error syncing modifiers",
        "staleWarning": "Modifiers may be outdated"
      }
    }
  }
}
```

```json
// id.json
{
  "pos": {
    "modifiers": {
      "offlineCache": {
        "dataFrom": "Pengubah per {timestamp}",
        "syncing": "Menyinkronkan pengubah...",
        "syncSuccess": "{count} pengubah disinkronkan",
        "syncError": "Kesalahan sinkronisasi pengubah",
        "staleWarning": "Pengubah mungkin sudah usang"
      }
    }
  }
}
```

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-2.3]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-003]
- [Source: _bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md]
- [Source: _bmad-output/implementation-artifacts/2-1-products-offline-cache.md] - Previous story patterns
- [Source: _bmad-output/implementation-artifacts/2-2-categories-offline-cache.md] - Previous story patterns
- [Source: src/hooks/products/useProductModifiers.ts] - Existing modifiers hook
- [Source: src/types/database.generated.ts] - Modifier type definitions
- [Source: src/lib/db.ts] - Dexie database schema v4
- [Source: src/types/offline.ts] - Offline type definitions
- [Source: CLAUDE.md#Architecture] - Project conventions

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

1. **Task 1**: Extended Dexie schema to version 5 with `offline_modifiers` table. Added `IOfflineModifier` interface with `TModifierGroupType` type.

2. **Task 2**: Created comprehensive `modifiersCacheService.ts` with:
   - `cacheAllModifiers()` - Fetches from Supabase and stores in Dexie
   - `getCachedModifiersForProduct()` - Returns product-specific modifiers
   - `getCachedModifiersForCategory()` - Returns category modifiers
   - `getCachedModifierById()` - Single modifier lookup
   - `getCachedModifiersCount()` - Count of cached modifiers
   - `resolveOfflineModifiers()` - Resolves product > category inheritance
   - `groupOfflineModifiers()` - Groups flat rows into ModifierGroup[]
   - `getLastModifiersSyncAt()` / `getModifiersSyncMeta()` - Sync metadata
   - `shouldRefreshModifiers()` / `shouldRefreshModifiersHourly()` - TTL checks
   - `refreshModifiersCacheIfNeeded()` / `clearModifiersCache()` - Cache management

3. **Task 3**: Created `useModifiersOffline` hook with:
   - `useModifiersOffline()` - Main hook with transparent online/offline switching
   - `useOfflineModifiersRaw()` - Direct access to `IOfflineModifier[]`
   - `useProductModifiersOffline()` - Product-specific modifiers
   - `useCategoryModifiersOffline()` - Category-specific modifiers

4. **Task 4**: Integrated modifiers sync into `productsCacheInit.ts`:
   - Products, categories and modifiers now sync in parallel at startup
   - Hourly refresh includes all three entities

5. **Task 5**: Added translations to all 3 locale files (`fr.json`, `en.json`, `id.json`) under `pos.modifiersCache.*`

6. **Task 6**: Created comprehensive test suites:
   - `modifiersCacheService.test.ts`: 41 tests covering all service functions
   - `useModifiersOffline.test.ts`: 9 tests covering hook behavior

7. **Schema Correction**: The `product_modifiers` table has `created_at` but not `updated_at`. Updated interface and service to use `created_at`.

### Test Results

- `modifiersCacheService.test.ts`: **41 passed**
- `useModifiersOffline.test.ts`: **9 passed**
- **Total: 50 tests passed**

### File List

**Files Created:**
- `src/services/offline/modifiersCacheService.ts` - Modifiers cache service
- `src/hooks/offline/useModifiersOffline.ts` - Offline modifiers hooks
- `src/services/offline/__tests__/modifiersCacheService.test.ts` - Service tests (41)
- `src/hooks/offline/__tests__/useModifiersOffline.test.ts` - Hook tests (9)

**Files Modified:**
- `src/lib/db.ts` - Added version 5 with `offline_modifiers` table
- `src/types/offline.ts` - Added `IOfflineModifier`, `TModifierGroupType`, constants
- `src/services/offline/index.ts` - Added exports for modifiersCacheService
- `src/hooks/offline/index.ts` - Added exports for useModifiersOffline hooks
- `src/services/offline/productsCacheInit.ts` - Integrated modifiers sync
- `src/locales/fr.json` - Added `pos.modifiersCache` section
- `src/locales/en.json` - Added `pos.modifiersCache` section
- `src/locales/id.json` - Added `pos.modifiersCache` section
