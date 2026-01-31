# Story 1.3: Offline Permissions Cache

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Système**,
I want **cacher les permissions utilisateur localement et fournir une fonction hasPermissionOffline(code)**,
so that **les contrôles d'accès fonctionnent offline sans dépendre de Supabase**.

## Acceptance Criteria

### AC1: Permissions Already Cached (Foundation from Story 1.1)

**Given** un utilisateur se connecte online avec succès
**When** l'authentification réussit
**Then** ses `role_permissions` sont DÉJÀ stockées dans Dexie table `offline_users.permissions`
**And** ses `roles` sont DÉJÀ stockées dans `offline_users.roles`

> **Note:** Cette fonctionnalité existe déjà dans Story 1.1. AC1 confirme l'intégration.

### AC2: Fonction hasPermissionOffline Disponible

**Given** un utilisateur a des permissions cachées dans IndexedDB
**When** le code vérifie une permission via `hasPermissionOffline(userId, code)`
**Then** la fonction retourne `true` si la permission est accordée (`is_granted: true`)
**And** retourne `false` si la permission est refusée ou n'existe pas
**And** retourne `false` si l'utilisateur n'est pas en cache

### AC3: Hook usePermissions Fonctionne Offline

**Given** l'application est en mode offline (`isOfflineSession: true`)
**When** un composant utilise le hook `usePermissions()`
**Then** les vérifications `hasPermission(code)`, `hasRole(roleCode)`, `isAdmin` fonctionnent identiquement
**And** les données proviennent du cache IndexedDB via `authStore.permissions` et `authStore.roles`

### AC4: Actions Sensibles Requièrent PIN Manager Offline

**Given** l'application est offline avec une session active
**When** une action sensible est tentée (void, refund, discount > 20%)
**Then** le système vérifie `isSensitivePermission(code)`
**And** demande un PIN manager pour confirmation
**And** le PIN manager est vérifié contre le cache offline

### AC5: Fonction hasRoleOffline Disponible

**Given** un utilisateur a des rôles cachés dans IndexedDB
**When** le code vérifie un rôle via `hasRoleOffline(userId, roleCode)`
**Then** la fonction retourne `true` si l'utilisateur a ce rôle
**And** retourne `false` si le rôle n'existe pas ou utilisateur non caché

## Tasks / Subtasks

- [x] **Task 1: Ajouter Fonctions Permission/Role à offlineAuthService** (AC: 2,5)
  - [x] 1.1: Ajouter `hasPermissionOffline(userId: string, code: string): Promise<boolean>`
  - [x] 1.2: Ajouter `hasRoleOffline(userId: string, roleCode: string): Promise<boolean>`
  - [x] 1.3: Ajouter `getOfflinePermissions(userId: string): Promise<EffectivePermission[]>`
  - [x] 1.4: Ajouter `getOfflineRoles(userId: string): Promise<Role[]>`
  - [x] 1.5: Ajouter `isManagerOrAboveOffline(userId: string): Promise<boolean>`

- [x] **Task 2: Créer Constantes Permissions Sensibles** (AC: 4)
  - [x] 2.1: Créer `src/constants/sensitivePermissions.ts`
  - [x] 2.2: Définir `SENSITIVE_PERMISSION_CODES` array
  - [x] 2.3: Exporter fonction `isSensitivePermissionCode(code: string): boolean`

- [x] **Task 3: Créer useOfflinePermissions Hook** (AC: 2,3,4,5)
  - [x] 3.1: Créer `src/hooks/offline/useOfflinePermissions.ts`
  - [x] 3.2: Implémenter même API que `usePermissions` mais pour offline
  - [x] 3.3: Intégrer vérification `isSensitivePermission`
  - [x] 3.4: Exporter depuis `src/hooks/offline/index.ts`

- [x] **Task 4: Créer usePermissionsUnified Hook** (AC: 3)
  - [x] 4.1: Créer `src/hooks/usePermissionsUnified.ts` qui wrap usePermissions
  - [x] 4.2: Détecter `isOfflineSession` depuis authStore
  - [x] 4.3: Si offline, utiliser permissions depuis authStore (déjà chargées par setOfflineSession)
  - [x] 4.4: Assurer API identique pour composants existants

- [x] **Task 5: Ajouter Tests Unitaires** (AC: 1,2,3,4,5)
  - [x] 5.1: Tester `hasPermissionOffline` avec permission accordée
  - [x] 5.2: Tester `hasPermissionOffline` avec permission refusée
  - [x] 5.3: Tester `hasPermissionOffline` avec utilisateur non caché
  - [x] 5.4: Tester `hasRoleOffline` avec rôle présent/absent
  - [x] 5.5: Tester `isManagerOrAboveOffline` avec différents rôles
  - [x] 5.6: Tester `isSensitivePermissionCode` avec différents codes

## Dev Notes

### Architecture Compliance (MANDATORY)

From [architecture.md](_bmad-output/planning-artifacts/architecture.md):

**ADR-005: Permissions Offline**
- Cache `role_permissions` + `user_permissions` in Dexie (DÉJÀ FAIT en 1.1)
- Fonction `hasPermissionOffline(code)` miroir du hook existant
- Sync permissions on each reconnection (DÉJÀ FAIT en 1.1)

**Restrictions Offline:**
- Actions sensibles (void, refund): PIN manager requis
- Création utilisateur: Online only

### Previous Story Intelligence (Stories 1.1 & 1.2)

#### From Story 1.1 (Completed):

**Files Already Created:**
- `src/lib/db.ts` - Dexie singleton with `offline_users` table
- `src/types/offline.ts` - `IOfflineUser`, includes `roles: Role[]` and `permissions: EffectivePermission[]`
- `src/services/offline/offlineAuthService.ts` - Cache management functions
- `src/services/offline/index.ts` - Re-exports

**IOfflineUser Structure (ALREADY stores permissions):**
```typescript
interface IOfflineUser {
  id: string;
  pin_hash: string;
  roles: Role[];                       // ✅ ALREADY CACHED
  permissions: EffectivePermission[];  // ✅ ALREADY CACHED
  display_name: string | null;
  preferred_language: 'fr' | 'en' | 'id';
  cached_at: string;
}
```

**Existing Functions to Reuse:**
```typescript
offlineAuthService.getCachedUser(userId): Promise<IOfflineUser | null>
offlineAuthService.isCacheValid(userId): Promise<boolean>
offlineAuthService.isOfflineAuthAvailable(userId): Promise<boolean>
```

#### From Story 1.2 (In Review):

**Files Created:**
- `src/services/offline/rateLimitService.ts` - Rate limiting for offline auth
- `src/hooks/offline/useOfflineAuth.ts` - Hook for offline auth flow

**authStore Updates:**
- `isOfflineSession: boolean` - Flag for offline session mode
- `setOfflineSession(userData, roles, permissions)` - Sets user data from cache

**Key Pattern:** When offline session is active:
```typescript
authStore.isOfflineSession === true
authStore.roles === cached roles
authStore.permissions === cached permissions
```

### Implementation Patterns

#### Pattern 1: Add Functions to offlineAuthService

```typescript
// src/services/offline/offlineAuthService.ts (EXTEND)

/**
 * Check if a user has a specific permission offline
 *
 * @param userId - User UUID
 * @param code - Permission code (e.g., 'sales.void')
 * @returns true if permission is granted, false otherwise
 */
async hasPermissionOffline(userId: string, code: string): Promise<boolean> {
  const cached = await this.getCachedUser(userId);
  if (!cached || !cached.permissions) {
    return false;
  }

  const perm = cached.permissions.find(p => p.permission_code === code);
  return perm?.is_granted ?? false;
},

/**
 * Check if a user has a specific role offline
 */
async hasRoleOffline(userId: string, roleCode: string): Promise<boolean> {
  const cached = await this.getCachedUser(userId);
  if (!cached || !cached.roles) {
    return false;
  }

  return cached.roles.some(r => r.code === roleCode);
},

/**
 * Check if user is manager or above (for sensitive actions)
 */
async isManagerOrAboveOffline(userId: string): Promise<boolean> {
  const cached = await this.getCachedUser(userId);
  if (!cached || !cached.roles) {
    return false;
  }

  return cached.roles.some(r =>
    ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(r.code)
  );
},

/**
 * Get all cached permissions for a user
 */
async getOfflinePermissions(userId: string): Promise<EffectivePermission[]> {
  const cached = await this.getCachedUser(userId);
  return cached?.permissions ?? [];
},

/**
 * Get all cached roles for a user
 */
async getOfflineRoles(userId: string): Promise<Role[]> {
  const cached = await this.getCachedUser(userId);
  return cached?.roles ?? [];
},
```

#### Pattern 2: Sensitive Permissions Constants

```typescript
// src/constants/sensitivePermissions.ts (NEW FILE)

import type { PermissionCode } from '@/types/auth';

/**
 * Permission codes that require additional verification (manager PIN)
 * when executed offline.
 *
 * These actions have significant business impact and require
 * human oversight even when the system is offline.
 */
export const SENSITIVE_PERMISSION_CODES: PermissionCode[] = [
  // Sales sensitive actions
  'sales.void',        // Void an order
  'sales.refund',      // Process refund
  'sales.discount',    // Apply discount (especially > 20%)

  // Inventory sensitive actions
  'inventory.adjust',  // Adjust stock levels
  'inventory.delete',  // Delete stock records

  // Admin sensitive actions
  'users.roles',       // Modify user roles
  'settings.update',   // Modify system settings
];

/**
 * Check if a permission code is considered sensitive
 * Sensitive permissions require manager PIN confirmation offline
 */
export function isSensitivePermissionCode(code: string): boolean {
  return SENSITIVE_PERMISSION_CODES.includes(code as PermissionCode);
}

/**
 * Discount threshold that requires manager approval
 * Discounts above this percentage require sensitive permission check
 */
export const DISCOUNT_MANAGER_THRESHOLD = 20; // percent
```

#### Pattern 3: useOfflinePermissions Hook

```typescript
// src/hooks/offline/useOfflinePermissions.ts (NEW FILE)

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { isSensitivePermissionCode } from '@/constants/sensitivePermissions';
import type { PermissionCode, PermissionModule, RoleCode } from '@/types/auth';

/**
 * Hook for checking permissions in offline mode
 *
 * Uses cached permissions from authStore when in offline session.
 * Mirrors the API of usePermissions for consistency.
 *
 * @see src/hooks/usePermissions.ts for online version
 */
export function useOfflinePermissions() {
  const { permissions, roles, user, isOfflineSession } = useAuthStore();

  /**
   * Check if user has a specific permission (from cache)
   */
  const hasPermission = useCallback(
    (code: PermissionCode): boolean => {
      const perm = permissions.find(p => p.permission_code === code);
      return perm?.is_granted ?? false;
    },
    [permissions]
  );

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (codes: PermissionCode[]): boolean => {
      return codes.some(code => hasPermission(code));
    },
    [hasPermission]
  );

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (codes: PermissionCode[]): boolean => {
      return codes.every(code => hasPermission(code));
    },
    [hasPermission]
  );

  /**
   * Check if a permission is sensitive (requires manager PIN offline)
   */
  const isSensitivePermission = useCallback(
    (code: PermissionCode): boolean => {
      return isSensitivePermissionCode(code);
    },
    []
  );

  /**
   * Check if permission requires manager confirmation offline
   * Returns true if offline AND permission is sensitive
   */
  const requiresManagerConfirmation = useCallback(
    (code: PermissionCode): boolean => {
      return isOfflineSession && isSensitivePermissionCode(code);
    },
    [isOfflineSession]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (roleCode: RoleCode): boolean => {
      return roles.some(r => r.code === roleCode);
    },
    [roles]
  );

  /**
   * Check if user is an admin
   */
  const isAdmin = useMemo(() => {
    return roles.some(r => ['SUPER_ADMIN', 'ADMIN'].includes(r.code));
  }, [roles]);

  /**
   * Check if user is manager or above
   */
  const isManagerOrAbove = useMemo(() => {
    return roles.some(r => ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(r.code));
  }, [roles]);

  /**
   * Check if user can access a specific module
   */
  const canAccessModule = useCallback(
    (module: PermissionModule): boolean => {
      return permissions.some(
        p => p.permission_module === module && p.is_granted
      );
    },
    [permissions]
  );

  return {
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSensitivePermission,
    requiresManagerConfirmation,
    canAccessModule,

    // Role checks
    hasRole,
    isAdmin,
    isManagerOrAbove,

    // Data access
    permissions,
    roles,
    user,
    isOfflineSession,
  };
}

export default useOfflinePermissions;
```

#### Pattern 4: usePermissionsUnified Hook (Optional Enhancement)

```typescript
// src/hooks/usePermissionsUnified.ts (NEW FILE)

import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from './usePermissions';
import { useOfflinePermissions } from './offline/useOfflinePermissions';

/**
 * Unified hook that automatically uses the correct permission source
 * based on session mode (online/offline).
 *
 * This hook provides the same API as usePermissions but automatically
 * handles offline mode detection.
 *
 * Usage: Replace usePermissions with usePermissionsUnified in components
 * that need to work both online and offline.
 */
export function usePermissionsUnified() {
  const { isOfflineSession } = useAuthStore();

  // Since authStore already contains permissions from cache when offline,
  // usePermissions already works correctly in both modes!
  // This wrapper adds offline-specific utilities.

  const basePermissions = usePermissions();
  const offlinePermissions = useOfflinePermissions();

  return {
    ...basePermissions,
    // Add offline-specific utilities
    isOfflineSession,
    requiresManagerConfirmation: offlinePermissions.requiresManagerConfirmation,
  };
}

export default usePermissionsUnified;
```

### Project Structure Notes

**Files to Create:**
```
src/
├── constants/
│   └── sensitivePermissions.ts    # NEW: Sensitive permission codes
└── hooks/
    └── offline/
        ├── index.ts                # MODIFY: Add exports
        └── useOfflinePermissions.ts  # NEW: Offline permissions hook
```

**Files to Modify:**
```
src/
└── services/
    └── offline/
        └── offlineAuthService.ts   # ADD: hasPermissionOffline, hasRoleOffline, etc.
```

### Existing Code Integration

**usePermissions.ts** ([src/hooks/usePermissions.ts](src/hooks/usePermissions.ts)):
- Already uses `authStore.permissions` and `authStore.roles`
- When `setOfflineSession()` is called (Story 1.2), these are populated from cache
- **Therefore, usePermissions ALREADY WORKS OFFLINE!**
- This story adds explicit offline utility functions and sensitive permission handling

**authStore.ts** ([src/stores/authStore.ts](src/stores/authStore.ts)):
- `setOfflineSession(userData, roles, permissions)` populates store from cache
- `isOfflineSession: boolean` flag indicates offline mode
- Permissions array is available in both online and offline modes

### i18n Keys to Add

Add to ALL 3 locale files (fr.json, en.json, id.json):

```json
{
  "permissions": {
    "manager_pin_required": "PIN Manager requis",
    "sensitive_action_offline": "Cette action nécessite une confirmation manager car vous êtes hors ligne",
    "action_void": "Annuler une commande",
    "action_refund": "Effectuer un remboursement",
    "action_discount": "Appliquer une remise importante"
  }
}
```

### Security Considerations

1. **Permissions from cache are read-only** - Cached at login, cannot be modified locally
2. **Sensitive actions require double verification** - Even with permission, manager PIN required offline
3. **24h cache expiration** - Permissions expire with user cache (Story 1.1)
4. **No permission escalation offline** - Can only use permissions cached at last online login
5. **Audit trail** - All offline actions should be logged for later sync review

### What NOT to Do

- Do NOT query Supabase for permissions when offline (use cache only)
- Do NOT allow sensitive actions without manager PIN verification offline
- Do NOT trust client-side permission checks alone (server will re-verify on sync)
- Do NOT create a separate Dexie table for permissions (already in `offline_users`)
- Do NOT bypass `isSensitivePermission` checks for convenience
- Do NOT cache more permissions than the user actually has

### Testing Strategy

**Test File:** `src/services/offline/__tests__/offlineAuthService.test.ts` (extend existing)
**Test File:** `src/constants/__tests__/sensitivePermissions.test.ts` (new)
**Test File:** `src/hooks/offline/__tests__/useOfflinePermissions.test.ts` (new)

**Mocking:**
- Use `fake-indexeddb/auto` for IndexedDB (already used in 1.1 tests)
- Mock authStore for hook tests

**Key Test Cases:**
1. `hasPermissionOffline` returns true for granted permission
2. `hasPermissionOffline` returns false for denied permission
3. `hasPermissionOffline` returns false for non-existent permission
4. `hasPermissionOffline` returns false for non-cached user
5. `hasRoleOffline` correctly identifies user roles
6. `isManagerOrAboveOffline` returns true for ADMIN, MANAGER
7. `isSensitivePermissionCode` identifies sensitive permissions
8. `requiresManagerConfirmation` returns true only when offline AND sensitive

### Git Intelligence (Recent Commits)

Latest commit: `82dbbdd feat: introduce offline-first types and services for user authentication and data synchronization`
- Confirms offline infrastructure is in place
- Patterns established in previous commits should be followed

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-005]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.3]
- [Source: _bmad-output/implementation-artifacts/1-1-offline-pin-cache-setup.md]
- [Source: _bmad-output/implementation-artifacts/1-2-offline-pin-authentication.md]
- [Source: src/services/offline/offlineAuthService.ts] - Base service to extend
- [Source: src/hooks/usePermissions.ts] - API pattern to mirror
- [Source: src/stores/authStore.ts] - State management
- [Source: src/types/auth.ts] - Role, EffectivePermission types
- [Source: CLAUDE.md#Architecture] - Project conventions

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None - all tests passed on first run (71 tests, 3.93s)

### Completion Notes List

1. **Task 1**: Added 5 functions to `offlineAuthService.ts` for offline permission/role checking. Functions leverage existing `getCachedUser()` to query cached permissions from IndexedDB.

2. **Task 2**: Created `sensitivePermissions.ts` defining 7 sensitive permission codes (sales.void, sales.refund, sales.discount, inventory.adjust, inventory.delete, users.roles, settings.update) plus helper functions `isSensitivePermissionCode()` and `getSensitivePermissionsForModule()`.

3. **Task 3**: Created `useOfflinePermissions` hook with same API as `usePermissions` plus offline-specific utilities like `requiresManagerConfirmation(code)` which returns true when offline AND permission is sensitive.

4. **Task 4**: Created `usePermissionsUnified` hook as a wrapper that extends `usePermissions` with offline utilities. Note: Discovered that `usePermissions` already works offline because `authStore.permissions` is populated by `setOfflineSession()` from Story 1.2.

5. **Task 5**: Added 17 new tests to `offlineAuthService.test.ts` and created 28 tests in `sensitivePermissions.test.ts`. All 71 tests pass.

### Key Implementation Insight

Permissions were ALREADY cached in Story 1.1 (IOfflineUser contains `roles[]` and `permissions[]`). Story 1.3 focus was providing utility functions to query these cached permissions, not implementing new caching logic.

### File List

**Created:**
- `src/constants/sensitivePermissions.ts` - Sensitive permission codes and helper functions
- `src/constants/__tests__/sensitivePermissions.test.ts` - 28 unit tests
- `src/hooks/offline/useOfflinePermissions.ts` - Offline permissions hook
- `src/hooks/usePermissionsUnified.ts` - Unified permissions hook wrapper

**Modified:**
- `src/services/offline/offlineAuthService.ts` - Added 5 functions (lines 264-386)
- `src/services/offline/__tests__/offlineAuthService.test.ts` - Added 17 tests
- `src/hooks/offline/index.ts` - Added useOfflinePermissions export
- `src/hooks/index.ts` - Added usePermissionsUnified export (Code Review Fix)
- `src/locales/fr.json` - Added offline permission i18n keys (Code Review Fix)
- `src/locales/en.json` - Added offline permission i18n keys (Code Review Fix)
- `src/locales/id.json` - Added offline permission i18n keys (Code Review Fix)

### Code Review Fixes Applied

**Reviewer:** Claude Opus 4.5 (code-review workflow)

1. **[HIGH] TypeScript Error Fixed** - `useOfflinePermissions.ts` interface was using incorrect `ReturnType<typeof useAuthStore>` syntax. Fixed to use explicit types: `EffectivePermission[]`, `Role[]`, `UserProfile | null`.

2. **[HIGH] Missing i18n Keys Added** - Added 5 translation keys to all 3 locale files:
   - `permissions.manager_pin_required`
   - `permissions.sensitive_action_offline`
   - `permissions.action_void`
   - `permissions.action_refund`
   - `permissions.action_discount`

3. **[MEDIUM] Missing Barrel Export Fixed** - Added `usePermissionsUnified` export to `src/hooks/index.ts` for consistent imports.
