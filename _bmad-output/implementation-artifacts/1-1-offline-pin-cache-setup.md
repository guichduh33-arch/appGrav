# Story 1.1: Offline PIN Cache Setup

Status: done

## Story

As a **Système**,
I want **stocker les PIN hash des utilisateurs dans IndexedDB**,
so that **les utilisateurs peuvent s'authentifier même sans internet**.

## Acceptance Criteria

### AC1: Cache PIN on Successful Online Login
**Given** l'application démarre avec internet
**When** un utilisateur se connecte avec succès via PIN
**Then** son `pin_hash` et `permissions` sont cachés dans Dexie table `offline_users`
**And** les données sont stockées avec encryption-at-rest via IndexedDB encapsulé

### AC2: Cache Expiration After 24h
**Given** le cache `offline_users` existe pour un utilisateur
**When** 24 heures se sont écoulées depuis le dernier login online (`cached_at` timestamp)
**Then** le cache est considéré invalide
**And** l'application force une reconnexion online avant de permettre l'accès

### AC3: Permissions Included in Cache
**Given** un utilisateur se connecte online
**When** l'authentification réussit
**Then** ses `effective_permissions` (tableau de `EffectivePermission`) sont incluses dans le cache
**And** ses `roles` (tableau de `Role`) sont incluses dans le cache

### AC4: Cache Refresh on Each Online Login
**Given** un utilisateur a déjà un cache `offline_users`
**When** il se reconnecte online avec succès
**Then** le cache est mis à jour avec les nouvelles données
**And** le timestamp `cached_at` est rafraîchi

## Tasks / Subtasks

- [x] **Task 1: Create Dexie Database Instance** (AC: 1,3)
  - [x] 1.1: Create `src/lib/db.ts` with Dexie class extending `Dexie`
  - [x] 1.2: Define `offline_users` table schema with indexes
  - [x] 1.3: Export singleton db instance
  - [x] 1.4: Add version migration structure for future schema changes

- [x] **Task 2: Create Offline Types** (AC: 1,2,3)
  - [x] 2.1: Create `src/types/offline.ts` with `IOfflineUser` interface
  - [x] 2.2: Add `ISyncQueueItem` type (foundation for later stories)
  - [x] 2.3: Add `TSyncEntity`, `TSyncAction`, `TSyncStatus` types
  - [x] 2.4: Add `TOfflineErrorCode` type

- [x] **Task 3: Create Offline Auth Service** (AC: 1,2,3,4)
  - [x] 3.1: Create `src/services/offline/offlineAuthService.ts`
  - [x] 3.2: Implement `cacheUserCredentials(user, roles, permissions)` function
  - [x] 3.3: Implement `getCachedUser(userId)` function
  - [x] 3.4: Implement `isCacheValid(userId)` function with 24h check
  - [x] 3.5: Implement `clearUserCache(userId)` function

- [x] **Task 4: Integrate with authStore** (AC: 1,3,4)
  - [x] 4.1: Import offlineAuthService in authStore
  - [x] 4.2: Call `cacheUserCredentials()` after successful `loginWithPin()`
  - [x] 4.3: Update cache on `refreshSession()` success
  - [x] 4.4: Clear cache on `logout()`

- [x] **Task 5: Add Unit Tests** (AC: 1,2,3,4)
  - [x] 5.1: Test `cacheUserCredentials` stores correct data
  - [x] 5.2: Test `getCachedUser` retrieves data
  - [x] 5.3: Test `isCacheValid` returns false after 24h
  - [x] 5.4: Test integration with authStore

## Dev Notes

### Architecture Compliance (MANDATORY)

From [architecture.md](_bmad-output/planning-artifacts/architecture.md):

**ADR-004: PIN Verification Offline**
- PIN hash already hashed server-side (not plaintext PIN)
- Store in Dexie table `offline_users`
- Expiration: 24h without online reconnection
- Future: Web Crypto API for encryption at-rest (post-MVP)

**ADR-005: Permissions Offline**
- Cache `role_permissions` + `user_permissions` in Dexie
- Sync permissions on each reconnection

### Existing Dependencies (ALREADY INSTALLED)

```json
{
  "dexie": "^4.2.1",
  "dexie-react-hooks": "^4.2.0"
}
```

**NO npm install needed for this story!**

### Naming Conventions (MANDATORY)

| Element | Convention | Example |
|---------|------------|---------|
| Dexie tables | `offline_{entity}` | `offline_users` |
| Interfaces | `I{Name}` | `IOfflineUser` |
| Types | `T{Name}` | `TSyncStatus` |
| Services | `{name}Service.ts` | `offlineAuthService.ts` |
| Files | max 300 lines | Split if larger |

### Project Structure Notes

**Files to Create:**
```
src/
├── lib/
│   └── db.ts                      # NEW: Dexie instance
├── types/
│   └── offline.ts                 # NEW: Offline types
└── services/
    └── offline/                   # NEW: Directory
        └── offlineAuthService.ts  # NEW: Auth cache service
```

**Files to Modify:**
- `src/stores/authStore.ts` - Add cache calls on login/logout

### Existing Code to Integrate With

**authStore.ts** ([src/stores/authStore.ts](src/stores/authStore.ts)):
- `loginWithPin()` - Add cache call after line 75 (success path)
- `refreshSession()` - Add cache call after line 143 (success path)
- `logout()` - Add cache clear after line 111

**authService.ts** ([src/services/authService.ts](src/services/authService.ts)):
- Returns `user`, `roles`, `permissions` on login success
- User has `pin_hash` field from `UserProfileExtended`

**Types to Reuse** from [src/types/auth.ts](src/types/auth.ts):
- `UserProfileExtended` - Has `pin_hash: string | null`
- `Role` - Role data structure
- `EffectivePermission` - Permission with `is_granted` flag

### Implementation Patterns

**Dexie Database Pattern:**
```typescript
// src/lib/db.ts
import Dexie, { type Table } from 'dexie';
import type { IOfflineUser } from '@/types/offline';

export class OfflineDatabase extends Dexie {
  offline_users!: Table<IOfflineUser>;

  constructor() {
    super('appgrav-offline');
    this.version(1).stores({
      offline_users: 'id, cached_at',
    });
  }
}

export const db = new OfflineDatabase();
```

**IOfflineUser Interface Pattern:**
```typescript
// src/types/offline.ts
import type { Role, EffectivePermission } from './auth';

export interface IOfflineUser {
  id: string;                          // User UUID (primary key)
  pin_hash: string;                    // Bcrypt hash from server
  roles: Role[];                       // Cached roles
  permissions: EffectivePermission[];  // Cached permissions
  display_name: string | null;         // For UI display
  preferred_language: 'fr' | 'en' | 'id';
  cached_at: string;                   // ISO 8601 timestamp
}
```

**Cache Service Pattern:**
```typescript
// src/services/offline/offlineAuthService.ts
import { db } from '@/lib/db';
import type { IOfflineUser } from '@/types/offline';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const offlineAuthService = {
  async cacheUserCredentials(
    user: { id: string; pin_hash: string | null; display_name: string | null; preferred_language: string },
    roles: Role[],
    permissions: EffectivePermission[]
  ): Promise<void> {
    if (!user.pin_hash) return; // Can't cache without PIN hash

    const offlineUser: IOfflineUser = {
      id: user.id,
      pin_hash: user.pin_hash,
      roles,
      permissions,
      display_name: user.display_name,
      preferred_language: user.preferred_language as 'fr' | 'en' | 'id',
      cached_at: new Date().toISOString(),
    };

    await db.offline_users.put(offlineUser);
  },

  async isCacheValid(userId: string): Promise<boolean> {
    const cached = await db.offline_users.get(userId);
    if (!cached) return false;

    const cachedTime = new Date(cached.cached_at).getTime();
    return Date.now() - cachedTime < CACHE_TTL_MS;
  },
};
```

### Testing Strategy

**Test File:** `src/services/offline/__tests__/offlineAuthService.test.ts`

**Test Setup:**
```typescript
import { beforeEach, describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import { offlineAuthService } from '../offlineAuthService';
```

**Key Test Cases:**
1. Cache stores all required fields
2. Cache retrieval returns correct data
3. 24h expiration works correctly
4. Cache update overwrites old data
5. Clear removes user from IndexedDB

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-004]
- [Source: _bmad-output/planning-artifacts/architecture.md#ADR-005]
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming-Patterns]
- [Source: src/stores/authStore.ts] - Existing auth flow
- [Source: src/types/auth.ts] - User/Role/Permission types
- [Source: CLAUDE.md#Architecture] - Project conventions

### Security Considerations

1. **PIN hash already bcrypt-hashed** - Server hashes via RPC `set_user_pin`
2. **IndexedDB is same-origin only** - Browser security model
3. **24h expiration** - Limits exposure window
4. **No plaintext PIN stored** - Only bcrypt hash

### What NOT to Do

- ❌ Do NOT store plaintext PIN
- ❌ Do NOT use `offline_auth` table name (use `offline_users`)
- ❌ Do NOT skip the 24h expiration check
- ❌ Do NOT create services outside `src/services/offline/` directory
- ❌ Do NOT exceed 300 lines per file

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

1. **Task 1-4 completed**: Created Dexie database instance, offline types, offline auth service, and integrated with authStore
2. **Task 5 completed**: 20 unit tests all passing using fake-indexeddb for IndexedDB simulation
3. **TypeScript fixes**: Removed unused OfflineError import, fixed type casting in authStore to use Partial<UserProfileExtended> correctly
4. **Pre-existing issues**: TypeScript errors in ModifiersTab.tsx and inventoryAlerts.ts are unrelated to this story

### File List

**Created:**
- `src/lib/db.ts` - Dexie database singleton with offline_users and offline_sync_queue tables
- `src/types/offline.ts` - IOfflineUser, ISyncQueueItem, TOfflineErrorCode, OFFLINE_USER_CACHE_TTL_MS
- `src/services/offline/offlineAuthService.ts` - Offline auth cache service with 24h TTL
- `src/services/offline/index.ts` - Re-exports offlineAuthService
- `src/services/offline/__tests__/offlineAuthService.test.ts` - 20 unit tests

**Modified:**
- `src/stores/authStore.ts` - Added cacheUserCredentials calls in loginWithPin, refreshSession, and clearUserCache in logout

