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

import { db } from '@/lib/db';
import type { IOfflineUser } from '@/types/offline';
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
};

export default offlineAuthService;
