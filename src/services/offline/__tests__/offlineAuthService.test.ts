/**
 * Unit Tests for Offline Auth Service
 *
 * Tests credential caching, retrieval, expiration, and cache clearing.
 * Uses fake-indexeddb for IndexedDB simulation.
 *
 * @see Story 1.1: Offline PIN Cache Setup
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';
import { offlineAuthService } from '../offlineAuthService';
import type { Role, EffectivePermission } from '@/types/auth';
import { OFFLINE_USER_CACHE_TTL_MS } from '@/types/offline';

// Mock user data
const mockUser = {
  id: 'user-123-uuid',
  pin_hash: '$2b$10$hashed.pin.value.here',
  display_name: 'Test User',
  preferred_language: 'fr' as const,
};

const mockRoles: Role[] = [
  {
    id: 'role-1',
    code: 'CASHIER',
    name_fr: 'Caissier',
    name_en: 'Cashier',
    name_id: 'Kasir',
    description: null,
    is_system: false,
    is_active: true,
    hierarchy_level: 10,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockPermissions: EffectivePermission[] = [
  {
    permission_code: 'sales.create',
    permission_module: 'sales',
    permission_action: 'create',
    is_granted: true,
    source: 'role',
    is_sensitive: false,
  },
  {
    permission_code: 'sales.view',
    permission_module: 'sales',
    permission_action: 'view',
    is_granted: true,
    source: 'role',
    is_sensitive: false,
  },
];

describe('offlineAuthService', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.offline_users.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('cacheUserCredentials', () => {
    it('should store user credentials in IndexedDB', async () => {
      // Act
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      // Assert
      const cached = await db.offline_users.get(mockUser.id);
      expect(cached).not.toBeNull();
      expect(cached?.id).toBe(mockUser.id);
      expect(cached?.pin_hash).toBe(mockUser.pin_hash);
      expect(cached?.display_name).toBe(mockUser.display_name);
      expect(cached?.preferred_language).toBe(mockUser.preferred_language);
    });

    it('should store roles correctly', async () => {
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      const cached = await db.offline_users.get(mockUser.id);
      expect(cached?.roles).toHaveLength(1);
      expect(cached?.roles[0].code).toBe('CASHIER');
    });

    it('should store permissions correctly', async () => {
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      const cached = await db.offline_users.get(mockUser.id);
      expect(cached?.permissions).toHaveLength(2);
      expect(cached?.permissions.some(p => p.permission_code === 'sales.create')).toBe(true);
    });

    it('should set cached_at timestamp', async () => {
      const before = Date.now();
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);
      const after = Date.now();

      const cached = await db.offline_users.get(mockUser.id);
      const cachedTime = new Date(cached!.cached_at).getTime();

      expect(cachedTime).toBeGreaterThanOrEqual(before);
      expect(cachedTime).toBeLessThanOrEqual(after);
    });

    it('should skip caching if no pin_hash', async () => {
      const userWithoutPin = { ...mockUser, pin_hash: null };

      await offlineAuthService.cacheUserCredentials(userWithoutPin, mockRoles, mockPermissions);

      const cached = await db.offline_users.get(mockUser.id);
      expect(cached).toBeUndefined();
    });

    it('should update existing cache (upsert)', async () => {
      // First cache
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      // Update with new roles
      const newRoles: Role[] = [
        ...mockRoles,
        {
          id: 'role-2',
          code: 'MANAGER',
          name_fr: 'Manager',
          name_en: 'Manager',
          name_id: 'Manajer',
          description: null,
          is_system: false,
          is_active: true,
          hierarchy_level: 20,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      await offlineAuthService.cacheUserCredentials(mockUser, newRoles, mockPermissions);

      const cached = await db.offline_users.get(mockUser.id);
      expect(cached?.roles).toHaveLength(2);
    });
  });

  describe('getCachedUser', () => {
    it('should retrieve cached user by ID', async () => {
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      const cached = await offlineAuthService.getCachedUser(mockUser.id);

      expect(cached).not.toBeNull();
      expect(cached?.id).toBe(mockUser.id);
    });

    it('should return null for non-existent user', async () => {
      const cached = await offlineAuthService.getCachedUser('non-existent-id');

      expect(cached).toBeNull();
    });
  });

  describe('isCacheValid', () => {
    it('should return true for fresh cache', async () => {
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      const isValid = await offlineAuthService.isCacheValid(mockUser.id);

      expect(isValid).toBe(true);
    });

    it('should return false for non-existent user', async () => {
      const isValid = await offlineAuthService.isCacheValid('non-existent-id');

      expect(isValid).toBe(false);
    });

    it('should return false for expired cache (24h)', async () => {
      // Cache the user
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      // Mock Date.now to simulate 25 hours later
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + OFFLINE_USER_CACHE_TTL_MS + 3600000);

      const isValid = await offlineAuthService.isCacheValid(mockUser.id);

      expect(isValid).toBe(false);
    });

    it('should return true for cache just before expiration', async () => {
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      // Mock Date.now to simulate 23 hours later (still valid)
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + OFFLINE_USER_CACHE_TTL_MS - 3600000);

      const isValid = await offlineAuthService.isCacheValid(mockUser.id);

      expect(isValid).toBe(true);
    });
  });

  describe('clearUserCache', () => {
    it('should remove user from cache', async () => {
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      // Verify user is cached
      let cached = await db.offline_users.get(mockUser.id);
      expect(cached).not.toBeUndefined();

      // Clear cache
      await offlineAuthService.clearUserCache(mockUser.id);

      // Verify user is removed
      cached = await db.offline_users.get(mockUser.id);
      expect(cached).toBeUndefined();
    });

    it('should not throw for non-existent user', async () => {
      // Should not throw
      await expect(offlineAuthService.clearUserCache('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('clearAllCache', () => {
    it('should remove all cached users', async () => {
      // Cache multiple users
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);
      await offlineAuthService.cacheUserCredentials(
        { ...mockUser, id: 'user-456' },
        mockRoles,
        mockPermissions
      );

      // Verify users are cached
      expect(await db.offline_users.count()).toBe(2);

      // Clear all
      await offlineAuthService.clearAllCache();

      // Verify all removed
      expect(await db.offline_users.count()).toBe(0);
    });
  });

  describe('getCacheAge', () => {
    it('should return cache age in milliseconds', async () => {
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const age = await offlineAuthService.getCacheAge(mockUser.id);

      expect(age).toBeGreaterThanOrEqual(10);
      expect(age).toBeLessThan(1000); // Should be less than 1 second
    });

    it('should return -1 for non-existent user', async () => {
      const age = await offlineAuthService.getCacheAge('non-existent-id');

      expect(age).toBe(-1);
    });
  });

  describe('isOfflineAuthAvailable', () => {
    it('should return true when cache is valid', async () => {
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      const available = await offlineAuthService.isOfflineAuthAvailable(mockUser.id);

      expect(available).toBe(true);
    });

    it('should return false when user not cached', async () => {
      const available = await offlineAuthService.isOfflineAuthAvailable('non-existent-id');

      expect(available).toBe(false);
    });

    it('should return false when cache expired', async () => {
      await offlineAuthService.cacheUserCredentials(mockUser, mockRoles, mockPermissions);

      // Mock Date.now to simulate 25 hours later
      const originalNow = Date.now;
      vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + OFFLINE_USER_CACHE_TTL_MS + 3600000);

      const available = await offlineAuthService.isOfflineAuthAvailable(mockUser.id);

      expect(available).toBe(false);
    });
  });
});
