# Story 1.5: Settings Offline Cache

Status: done

## Story

As a **Système**,
I want **cacher les paramètres système localement**,
so that **la configuration est disponible offline**.

## Acceptance Criteria

### AC1: Cache Settings au Démarrage
**Given** l'application démarre avec internet
**When** les settings sont chargés depuis Supabase
**Then** ils sont stockés dans Dexie table `offline_settings`
**And** incluent: key, value, category_id, updated_at

### AC2: Lecture Settings Offline
**Given** l'application est offline
**When** un composant demande un setting
**Then** la valeur est retournée depuis le cache local
**And** le comportement est identique au mode online

### AC3: Cache des Données Associées
**Given** l'application synchronise les settings
**When** le cache est mis à jour
**Then** les `tax_rates`, `payment_methods`, et `business_hours` sont aussi cachés
**And** chaque entité a sa propre table Dexie (`offline_tax_rates`, etc.)

### AC4: Timestamp de Dernière Sync
**Given** les settings sont cachés
**When** l'application est offline
**Then** un timestamp `last_settings_sync_at` est disponible
**And** les composants peuvent afficher "Données au {timestamp}"

### AC5: Fallback Transparent
**Given** le settingsStore est utilisé
**When** l'application bascule online/offline
**Then** le hook `useSettingsOffline` sélectionne automatiquement la source
**And** aucun changement de code n'est nécessaire dans les composants consommateurs

## Tasks / Subtasks

- [x] **Task 1: Étendre le schéma Dexie** (AC: 1, 3) ✅
  - [x] 1.1: Ajouter table `offline_settings` dans `src/lib/db.ts`
  - [x] 1.2: Ajouter table `offline_tax_rates` avec index `id, is_active, is_default`
  - [x] 1.3: Ajouter table `offline_payment_methods` avec index `id, is_active, is_default`
  - [x] 1.4: Ajouter table `offline_business_hours` avec index `day_of_week`
  - [x] 1.5: Incrémenter la version Dexie (1 → 2)
  - [x] 1.6: Ajouter type `IOfflineSetting` dans `src/types/offline.ts`

- [x] **Task 2: Créer le service de cache settings** (AC: 1, 4) ✅
  - [x] 2.1: Créer `src/services/offline/settingsCacheService.ts`
  - [x] 2.2: Implémenter `cacheAllSettings()` - synchronise settings depuis Supabase vers Dexie
  - [x] 2.3: Implémenter `getCachedSettings()` - retourne tous les settings du cache
  - [x] 2.4: Implémenter `getCachedSetting(key)` - retourne un setting par clé
  - [x] 2.5: Implémenter `getLastSettingsSyncAt()` - retourne le timestamp de dernière sync
  - [x] 2.6: Stocker `last_settings_sync_at` dans `offline_sync_meta`

- [x] **Task 3: Créer les services pour entités associées** (AC: 3) ✅
  - [x] 3.1: Implémenter `cacheTaxRates()` dans settingsCacheService
  - [x] 3.2: Implémenter `cachePaymentMethods()` dans settingsCacheService
  - [x] 3.3: Implémenter `cacheBusinessHours()` dans settingsCacheService
  - [x] 3.4: Créer `cacheAllSettingsData()` qui orchestre tout en parallèle

- [x] **Task 4: Créer le hook useSettingsOffline** (AC: 2, 5) ✅
  - [x] 4.1: Créer `src/hooks/offline/useSettingsOffline.ts`
  - [x] 4.2: Utiliser `useNetworkStatus` pour détecter online/offline
  - [x] 4.3: En mode online: utiliser `settingsStore` existant
  - [x] 4.4: En mode offline: utiliser `useLiveQuery` avec Dexie
  - [x] 4.5: Exposer interface identique: `getSetting<T>(key)`, `taxRates`, `paymentMethods`, etc.

- [x] **Task 5: Intégrer la synchronisation au démarrage** (AC: 1, 4) ✅
  - [x] 5.1: Modifier `settingsStore.initialize()` pour appeler `cacheAllSettingsData()` après chargement
  - [x] 5.2: Ajouter try/catch pour ne pas bloquer si cache échoue
  - [x] 5.3: Logger l'heure de dernière sync pour debugging

- [x] **Task 6: Ajouter les traductions** (AC: 4) ✅
  - [x] 6.1: Ajouter clés dans `fr.json`: `settings.offlineCache.dataFrom`, `settings.offlineCache.syncError`, etc.
  - [x] 6.2: Ajouter clés dans `en.json`
  - [x] 6.3: Ajouter clés dans `id.json`

- [x] **Task 7: Écrire les tests** (AC: 1, 2, 3, 4, 5) ✅
  - [x] 7.1: Créer `src/services/offline/__tests__/settingsCacheService.test.ts`
  - [x] 7.2: Tester `cacheAllSettings()` popule Dexie correctement
  - [x] 7.3: Tester `getCachedSetting()` retourne la bonne valeur
  - [x] 7.4: Tester que les entités associées sont cachées
  - [x] 7.5: Créer `src/hooks/offline/__tests__/useSettingsOffline.test.ts`
  - [x] 7.6: Tester le switch automatique online/offline

## Dev Notes

### Architecture Compliance (MANDATORY)

**ADR-001: Entités Synchronisées Offline** [Source: architecture/core-architectural-decisions.md#ADR-001]
- `settings` → Read-only cache (pas de modification offline)
- Refresh: Au démarrage uniquement (stratégie simple)
- TTL: Illimité (settings changent rarement)

**ADR-003: Politique de Cache** [Source: architecture/core-architectural-decisions.md#ADR-003]
- Settings refresh: Au démarrage uniquement
- TTL: Illimité

**Implementation Patterns** [Source: architecture/implementation-patterns-consistency-rules.md]
- Table naming: `offline_settings`, `offline_tax_rates`, etc.
- Interface naming: `IOfflineSetting`, `IOfflineTaxRate`
- Service location: `src/services/offline/settingsCacheService.ts`
- Hook location: `src/hooks/offline/useSettingsOffline.ts`

### Existing Code Analysis

**settingsStore.ts** [Source: src/stores/settingsStore.ts]
- Store Zustand avec persist (localStorage pour appearance/localization)
- Méthode `initialize()` charge toutes les données depuis Supabase
- Données: settings, taxRates, paymentMethods, businessHours, printers
- Getters: `getSetting<T>()`, `getActiveTaxRates()`, `getActivePaymentMethods()`

**Approche recommandée:**
1. NE PAS modifier l'interface publique du settingsStore
2. Ajouter le cache Dexie en parallèle
3. Créer un hook `useSettingsOffline` qui wrap le store avec fallback Dexie
4. Les composants existants continuent d'utiliser `useSettingsStore` → transparence totale

**Types existants** [Source: src/types/settings.ts]
- `Setting` - Row type depuis database.generated.ts
- `TaxRate`, `PaymentMethod`, `BusinessHours` - Tous définis
- Les types offline doivent étendre/miroir ces types

**Dexie actuel** [Source: src/lib/db.ts]
- Version 1 avec `offline_users` et `offline_sync_queue`
- Pattern établi: `offline_{entity}` prefix
- Migration: Incrémenter version à 2

### Previous Story Intelligence

**Story 1.4 learnings** [Source: _bmad-output/implementation-artifacts/1-4-network-status-indicator.md]
- Le hook `useNetworkStatus` est la source de vérité pour online/offline
- Pattern: utiliser `networkMode` de networkStore
- Le composant existait déjà - vérifier avant d'implémenter!

**Story 1.1-1.3 patterns:**
- `IOfflineUser` dans `src/types/offline.ts` - suivre le même format
- `db.ts` utilise des indexes pour les queries fréquentes
- Services dans `src/services/offline/` avec tests unitaires

### Critical Implementation Details

**Schema Dexie v2:**
```typescript
this.version(2).stores({
  // Existing v1 tables
  offline_users: 'id, cached_at',
  offline_sync_queue: '++id, entity, status, created_at',

  // NEW: Settings cache (Story 1.5)
  offline_settings: 'key, category_id, updated_at',
  offline_tax_rates: 'id, is_active, is_default',
  offline_payment_methods: 'id, is_active, is_default, sort_order',
  offline_business_hours: 'day_of_week',
  offline_sync_meta: 'entity', // Pour stocker last_sync timestamps
});
```

**Interface IOfflineSetting:**
```typescript
export interface IOfflineSetting {
  key: string;              // Primary key
  value: unknown;           // JSONB value
  category_id: string;      // FK vers settings_categories
  value_type: string;       // 'string' | 'number' | 'boolean' | 'json'
  updated_at: string;       // ISO 8601
}
```

**settingsCacheService pattern:**
```typescript
export async function cacheAllSettings(): Promise<void> {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value, category_id, value_type, updated_at');

  if (error) throw error;

  await db.offline_settings.clear();
  await db.offline_settings.bulkAdd(data);

  // Update sync meta
  await db.offline_sync_meta.put({
    entity: 'settings',
    lastSyncAt: new Date().toISOString(),
    recordCount: data.length,
  });
}
```

**useSettingsOffline hook:**
```typescript
export function useSettingsOffline() {
  const { isOnline } = useNetworkStatus();
  const store = useSettingsStore();

  // Offline: use Dexie
  const offlineSettings = useLiveQuery(
    () => !isOnline ? db.offline_settings.toArray() : null,
    [isOnline]
  );

  const getSetting = <T>(key: string): T | null => {
    if (isOnline) {
      return store.getSetting<T>(key);
    }
    const setting = offlineSettings?.find(s => s.key === key);
    return setting ? parseValue<T>(setting.value) : null;
  };

  return { getSetting, isOffline: !isOnline };
}
```

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── lib/
│   └── db.ts                            # MODIFY: Add new tables, v2
├── types/
│   └── offline.ts                       # MODIFY: Add IOfflineSetting, etc.
├── services/
│   └── offline/
│       └── settingsCacheService.ts      # NEW: Cache service
├── hooks/
│   └── offline/
│       └── useSettingsOffline.ts        # NEW: Offline settings hook
└── stores/
    └── settingsStore.ts                 # MODIFY: Call cache on init
```

**Fichiers à modifier:**
- `src/lib/db.ts` - Ajouter tables, incrémenter version
- `src/types/offline.ts` - Ajouter types settings
- `src/stores/settingsStore.ts` - Appeler cache dans initialize()

**Fichiers de test:**
- `src/services/offline/__tests__/settingsCacheService.test.ts`
- `src/hooks/offline/__tests__/useSettingsOffline.test.ts`

### Testing Strategy

**Unit Tests - settingsCacheService:**
1. `cacheAllSettings` - vérifie que Dexie est populé
2. `getCachedSettings` - retourne tous les settings
3. `getCachedSetting` - retourne un setting spécifique
4. `getLastSettingsSyncAt` - retourne le bon timestamp
5. Error handling - graceful failure si Supabase down

**Integration Tests - useSettingsOffline:**
1. Mode online: utilise settingsStore
2. Mode offline: utilise Dexie
3. Transition: switch automatique
4. Type safety: generics fonctionnent

**Mocking:**
- Mock Supabase avec `vi.mock('@/lib/supabase')`
- Mock Dexie avec fake-indexeddb
- Mock networkStore pour simuler online/offline

### References

- [Source: _bmad-output/planning-artifacts/epics/epic-list.md#Story-1.5]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-001]
- [Source: _bmad-output/planning-artifacts/architecture/core-architectural-decisions.md#ADR-003]
- [Source: _bmad-output/planning-artifacts/architecture/implementation-patterns-consistency-rules.md]
- [Source: src/stores/settingsStore.ts] - Existing settings state management
- [Source: src/types/settings.ts] - Settings type definitions
- [Source: src/lib/db.ts] - Dexie database schema
- [Source: src/types/offline.ts] - Offline type definitions
- [Source: CLAUDE.md#Architecture] - Project conventions

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 43 tests pass (18 service tests + 25 hook tests)
- Dexie stores booleans as 0/1 in IndexedDB, service uses `.equals(1)` for queries

### Completion Notes List

1. Extended Dexie schema to version 2 with 5 new tables
2. Created comprehensive settingsCacheService with caching for all entities
3. Created useSettingsOffline hook with transparent online/offline switching
4. Integrated cache sync in settingsStore.initialize() (non-blocking)
5. Added translations in all 3 locale files (fr, en, id)
6. Full test coverage with 46 passing tests

### Code Review Fixes (2026-02-01)

**HIGH issues fixed:**
- Fixed dynamic timestamps in `toBusinessHours` - now uses static placeholders
- Added error handling in all `useLiveQuery` calls with try/catch
- Added `Boolean()` coercion for Dexie boolean values (stored as 0/1)

**MEDIUM issues fixed:**
- Added compound indexes `[is_active+is_default]` in db.ts for optimized queries
- Added `getSyncMetaFor()` and `oldestSyncAt` for entity-specific sync metadata access
- Added online/offline transition tests (3 new tests)
- Replaced `as X` type assertions with proper typed variable declarations

**LOW issues fixed:**
- Removed unused `setupMock` helper function from tests
- Added documentation comment explaining Dexie boolean storage behavior

### File List

**Created:**
- `src/services/offline/settingsCacheService.ts` - Cache service (337 lines)
- `src/hooks/offline/useSettingsOffline.ts` - Offline hook (284 lines)
- `src/services/offline/__tests__/settingsCacheService.test.ts` - Service tests (469 lines)
- `src/hooks/offline/__tests__/useSettingsOffline.test.ts` - Hook tests (316 lines)

**Modified:**
- `src/types/offline.ts` - Added IOfflineSetting, IOfflineTaxRate, IOfflinePaymentMethod, IOfflineBusinessHours, ISyncMeta interfaces
- `src/lib/db.ts` - Added 5 new tables, upgraded to version 2
- `src/services/offline/index.ts` - Added exports for settingsCacheService functions
- `src/hooks/offline/index.ts` - Added export for useSettingsOffline
- `src/stores/settingsStore.ts` - Added cacheAllSettingsData() call in initialize()
- `src/locales/fr.json` - Added settings.offlineCache section
- `src/locales/en.json` - Added settings.offlineCache section
- `src/locales/id.json` - Added settings.offlineCache section

