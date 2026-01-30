/**
 * Offline Authentication Service
 *
 * Manages user credential caching for offline PIN authentication.
 * Implements ADR-004 (PIN Verification Offline) and ADR-005 (Permissions Offline).
 *
 * Security considerations:
 * - PIN hash is already bcrypt-hashed by server (never stored in plaintext)
 * - IndexedDB is same-origin only (browser security model)
 * - 24h expiration limits exposure window
 *
 * @see _bmad-output/planning-artifacts/architecture.md#ADR-004
 * @see _bmad-output/planning-artifacts/architecture.md#ADR-005
 */

import bcryptjs from 'bcryptjs';
import { db } from '@/lib/db';
import type { IOfflineUser, IOfflineAuthResult } from '@/types/offline';
import { OFFLINE_USER_CACHE_TTL_MS } from '@/types/offline';
import type { Role, EffectivePermission, UserProfileExtended } from '@/types/auth';

/**
 * Offline Authentication Service
 *
 * Provides functions for:
 * - Caching user credentials on successful online login
 * - Retrieving cached user data for offline auth
 * - Validating cache expiration (24h TTL)
 * - Clearing user cache on logout
 */
export const offlineAuthService = {
  /**
   * Cache user credentials for offline authentication
   *
   * Called after successful online login to enable offline auth.
   * Stores PIN hash, roles, and permissions in IndexedDB.
   *
   * @param user - User profile with pin_hash (from Supabase)
   * @param roles - User's assigned roles
   * @param permissions - User's effective permissions
   * @returns Promise<void>
   *
   * @example
   * ```ts
   * await offlineAuthService.cacheUserCredentials(
   *   response.user,
   *   response.roles,
   *   response.permissions
   * );
   * ```
   */
  async cacheUserCredentials(
    user: Partial<UserProfileExtended>,
    roles: Role[],
    permissions: EffectivePermission[]
  ): Promise<void> {
    // Can't cache without PIN hash - skip silently
    if (!user.id || !user.pin_hash) {
      console.debug('[offlineAuth] Skipping cache - no PIN hash available');
      return;
    }

    const offlineUser: IOfflineUser = {
      id: user.id,
      pin_hash: user.pin_hash,
      roles,
      permissions,
      display_name: user.display_name ?? null,
      preferred_language: (user.preferred_language as 'fr' | 'en' | 'id') ?? 'id',
      cached_at: new Date().toISOString(),
    };

    try {
      // Use put() to insert or update (upsert)
      await db.offline_users.put(offlineUser);
      console.debug('[offlineAuth] User credentials cached:', user.id);
    } catch (error) {
      console.error('[offlineAuth] Failed to cache user credentials:', error);
      // Don't throw - caching is optional enhancement
    }
  },

  /**
   * Get cached user data by ID
   *
   * Returns null if user not found or cache expired.
   *
   * @param userId - User UUID
   * @returns Cached user data or null
   */
  async getCachedUser(userId: string): Promise<IOfflineUser | null> {
    try {
      const cached = await db.offline_users.get(userId);
      return cached ?? null;
    } catch (error) {
      console.error('[offlineAuth] Failed to get cached user:', error);
      return null;
    }
  },

  /**
   * Check if cached user credentials are still valid
   *
   * Validates:
   * 1. User exists in cache
   * 2. Cache is not expired (< 24h old)
   *
   * @param userId - User UUID
   * @returns true if cache is valid, false otherwise
   */
  async isCacheValid(userId: string): Promise<boolean> {
    try {
      const cached = await db.offline_users.get(userId);
      if (!cached) {
        return false;
      }

      const cachedTime = new Date(cached.cached_at).getTime();
      const now = Date.now();
      const isValid = now - cachedTime < OFFLINE_USER_CACHE_TTL_MS;

      if (!isValid) {
        console.debug('[offlineAuth] Cache expired for user:', userId);
      }

      return isValid;
    } catch (error) {
      console.error('[offlineAuth] Failed to validate cache:', error);
      return false;
    }
  },

  /**
   * Clear user cache (called on logout)
   *
   * Removes user credentials from IndexedDB.
   *
   * @param userId - User UUID to clear
   */
  async clearUserCache(userId: string): Promise<void> {
    try {
      await db.offline_users.delete(userId);
      console.debug('[offlineAuth] User cache cleared:', userId);
    } catch (error) {
      console.error('[offlineAuth] Failed to clear user cache:', error);
      // Don't throw - cleanup is best effort
    }
  },

  /**
   * Clear all cached users
   *
   * Used for full cache reset or security clearing.
   */
  async clearAllCache(): Promise<void> {
    try {
      await db.offline_users.clear();
      console.debug('[offlineAuth] All user cache cleared');
    } catch (error) {
      console.error('[offlineAuth] Failed to clear all cache:', error);
    }
  },

  /**
   * Get cache age in milliseconds
   *
   * @param userId - User UUID
   * @returns Cache age in ms, or -1 if not cached
   */
  async getCacheAge(userId: string): Promise<number> {
    try {
      const cached = await db.offline_users.get(userId);
      if (!cached) {
        return -1;
      }

      const cachedTime = new Date(cached.cached_at).getTime();
      return Date.now() - cachedTime;
    } catch (error) {
      return -1;
    }
  },

  /**
   * Check if offline auth is available for a user
   *
   * Returns true if:
   * 1. User is cached
   * 2. Cache is not expired
   * 3. PIN hash exists
   *
   * @param userId - User UUID
   * @returns true if offline auth is available
   */
  async isOfflineAuthAvailable(userId: string): Promise<boolean> {
    const cached = await this.getCachedUser(userId);
    if (!cached || !cached.pin_hash) {
      return false;
    }

    return this.isCacheValid(userId);
  },

  /**
   * Verify PIN offline using cached bcrypt hash
   *
   * SECURITY: Returns generic INVALID_PIN error for both "wrong PIN" and
   * "user not cached" to prevent cache enumeration attacks.
   *
   * @param userId - User UUID to authenticate
   * @param pinInput - PIN entered by user (plaintext)
   * @returns Authentication result with user data on success
   *
   * @see ADR-004: PIN Verification Offline
   */
  async verifyPinOffline(
    userId: string,
    pinInput: string
  ): Promise<IOfflineAuthResult> {
    try {
      // Check if cache exists and is valid (not expired)
      const cacheValid = await this.isCacheValid(userId);
      if (!cacheValid) {
        // Check if user exists but cache expired vs not cached at all
        const cached = await this.getCachedUser(userId);
        if (cached) {
          // Cache exists but expired - need online reconnection
          console.debug('[offlineAuth] Cache expired for user:', userId);
          return { success: false, error: 'CACHE_EXPIRED' };
        }
        // User not cached - return generic error (security: don't reveal cache state)
        console.debug('[offlineAuth] User not in cache:', userId);
        return { success: false, error: 'INVALID_PIN' };
      }

      // Get cached user data
      const cached = await this.getCachedUser(userId);
      if (!cached) {
        // Should not happen if isCacheValid returned true, but handle gracefully
        return { success: false, error: 'INVALID_PIN' };
      }

      // Verify PIN using bcrypt compare
      const isValid = await bcryptjs.compare(pinInput, cached.pin_hash);
      if (!isValid) {
        console.debug('[offlineAuth] PIN verification failed for user:', userId);
        return { success: false, error: 'INVALID_PIN' };
      }

      // Success - return cached user data
      console.debug('[offlineAuth] PIN verified successfully for user:', userId);
      return { success: true, user: cached };
    } catch (error) {
      console.error('[offlineAuth] PIN verification error:', error);
      // Return generic error on any exception
      return { success: false, error: 'INVALID_PIN' };
    }
  },

  // =====================================================
  // Offline Permission Functions (Story 1.3)
  // =====================================================

  /**
   * Check if a user has a specific permission offline
   *
   * Uses cached permissions from IndexedDB to verify access rights.
   *
   * @param userId - User UUID
   * @param code - Permission code (e.g., 'sales.void', 'inventory.adjust')
   * @returns true if permission is granted, false otherwise
   *
   * @see ADR-005: Permissions Offline
   *
   * @example
   * ```ts
   * const canVoid = await offlineAuthService.hasPermissionOffline(userId, 'sales.void');
   * ```
   */
  async hasPermissionOffline(userId: string, code: string): Promise<boolean> {
    try {
      const cached = await this.getCachedUser(userId);
      if (!cached || !cached.permissions) {
        return false;
      }

      const perm = cached.permissions.find(p => p.permission_code === code);
      return perm?.is_granted ?? false;
    } catch (error) {
      console.error('[offlineAuth] Failed to check permission offline:', error);
      return false;
    }
  },

  /**
   * Check if a user has a specific role offline
   *
   * Uses cached roles from IndexedDB to verify role membership.
   *
   * @param userId - User UUID
   * @param roleCode - Role code (e.g., 'ADMIN', 'MANAGER', 'CASHIER')
   * @returns true if user has the role, false otherwise
   *
   * @example
   * ```ts
   * const isManager = await offlineAuthService.hasRoleOffline(userId, 'MANAGER');
   * ```
   */
  async hasRoleOffline(userId: string, roleCode: string): Promise<boolean> {
    try {
      const cached = await this.getCachedUser(userId);
      if (!cached || !cached.roles) {
        return false;
      }

      return cached.roles.some(r => r.code === roleCode);
    } catch (error) {
      console.error('[offlineAuth] Failed to check role offline:', error);
      return false;
    }
  },

  /**
   * Get all cached permissions for a user
   *
   * @param userId - User UUID
   * @returns Array of EffectivePermission, empty array if not cached
   */
  async getOfflinePermissions(userId: string): Promise<EffectivePermission[]> {
    try {
      const cached = await this.getCachedUser(userId);
      return cached?.permissions ?? [];
    } catch (error) {
      console.error('[offlineAuth] Failed to get offline permissions:', error);
      return [];
    }
  },

  /**
   * Get all cached roles for a user
   *
   * @param userId - User UUID
   * @returns Array of Role, empty array if not cached
   */
  async getOfflineRoles(userId: string): Promise<Role[]> {
    try {
      const cached = await this.getCachedUser(userId);
      return cached?.roles ?? [];
    } catch (error) {
      console.error('[offlineAuth] Failed to get offline roles:', error);
      return [];
    }
  },

  /**
   * Check if user is manager or above (for sensitive actions)
   *
   * Returns true if user has SUPER_ADMIN, ADMIN, or MANAGER role.
   * Used to determine if a user can approve sensitive offline actions.
   *
   * @param userId - User UUID
   * @returns true if user is manager or above, false otherwise
   *
   * @example
   * ```ts
   * const canApprove = await offlineAuthService.isManagerOrAboveOffline(userId);
   * if (canApprove) {
   *   // Allow sensitive action approval
   * }
   * ```
   */
  async isManagerOrAboveOffline(userId: string): Promise<boolean> {
    try {
      const cached = await this.getCachedUser(userId);
      if (!cached || !cached.roles) {
        return false;
      }

      return cached.roles.some(r =>
        ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(r.code)
      );
    } catch (error) {
      console.error('[offlineAuth] Failed to check manager status offline:', error);
      return false;
    }
  },
};

export default offlineAuthService;
