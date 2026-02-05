/**
 * useCustomersOffline Hook Tests
 * Story 6.1 - Customers Offline Cache
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db with hoisted mock
vi.mock('@/lib/db', () => ({
  db: {
    offline_customers: {
      orderBy: vi.fn(() => ({
        limit: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([]),
        })),
      })),
      toArray: vi.fn().mockResolvedValue([]),
      get: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    offline_sync_meta: {
      get: vi.fn(),
    },
  },
}));

// Mock useNetworkStatus with hoisted mock
vi.mock('@/hooks/offline/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isOffline: false,
    checkNetwork: vi.fn(),
  }),
}));

// Mock useLiveQuery to return data synchronously for tests
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => {
    // Return undefined initially (loading state)
    return undefined;
  }),
}));

// Import after mocks
import { useLiveQuery } from 'dexie-react-hooks';
import {
  useSearchCustomersOffline,
  useCustomerByIdOffline,
  useCustomersLastSync,
  useOfflineCustomerCount,
} from '../useCustomersOffline';
import { renderHook } from '@testing-library/react';

describe('useCustomersOffline hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSearchCustomersOffline', () => {
    it('should return loading state initially', () => {
      vi.mocked(useLiveQuery).mockReturnValue(undefined);

      const { result } = renderHook(() => useSearchCustomersOffline(''));

      expect(result.current.customers).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isOffline).toBe(false);
    });

    it('should return customers when loaded', () => {
      const mockCustomers = [
        {
          id: '1',
          name: 'John Doe',
          phone: '+62812345',
          email: 'john@test.com',
          category_slug: null,
          loyalty_tier: 'Bronze',
          points_balance: 100,
          updated_at: '2026-02-05T10:00:00Z',
        },
      ];

      vi.mocked(useLiveQuery).mockReturnValue(mockCustomers);

      const { result } = renderHook(() => useSearchCustomersOffline('john'));

      expect(result.current.customers).toEqual(mockCustomers);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return empty array when no matches', () => {
      vi.mocked(useLiveQuery).mockReturnValue([]);

      const { result } = renderHook(() => useSearchCustomersOffline('xyz'));

      expect(result.current.customers).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCustomerByIdOffline', () => {
    it('should return loading false when no customerId', () => {
      vi.mocked(useLiveQuery).mockReturnValue(undefined);

      const { result } = renderHook(() => useCustomerByIdOffline(null));

      expect(result.current.customer).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should return customer when found', () => {
      const mockCustomer = {
        id: 'cust-123',
        name: 'Test Customer',
        phone: '+62812345',
        email: null,
        category_slug: 'retail',
        loyalty_tier: 'Silver',
        points_balance: 750,
        updated_at: '2026-02-05T10:00:00Z',
      };

      vi.mocked(useLiveQuery).mockReturnValue(mockCustomer);

      const { result } = renderHook(() => useCustomerByIdOffline('cust-123'));

      expect(result.current.customer).toEqual(mockCustomer);
      expect(result.current.isLoading).toBe(false);
    });

    it('should show loading when customerId provided but data loading', () => {
      vi.mocked(useLiveQuery).mockReturnValue(undefined);

      const { result } = renderHook(() => useCustomerByIdOffline('cust-123'));

      expect(result.current.customer).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCustomersLastSync', () => {
    it('should return null lastSyncAt when never synced', () => {
      vi.mocked(useLiveQuery).mockReturnValue(undefined);

      const { result } = renderHook(() => useCustomersLastSync());

      expect(result.current.lastSyncAt).toBeNull();
      expect(result.current.recordCount).toBe(0);
      expect(result.current.isStale).toBe(false);
      expect(result.current.ageDisplay).toBeNull();
    });

    it('should return sync metadata when available', () => {
      const syncMeta = {
        entity: 'customers',
        lastSyncAt: '2026-02-05T10:00:00Z',
        recordCount: 50,
      };

      vi.mocked(useLiveQuery).mockReturnValue(syncMeta);

      const { result } = renderHook(() => useCustomersLastSync());

      expect(result.current.lastSyncAt).toBe('2026-02-05T10:00:00Z');
      expect(result.current.recordCount).toBe(50);
    });

    it('should detect stale data (older than 24h)', () => {
      // Mock data from 25 hours ago (stale)
      const staleDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();

      const syncMeta = {
        entity: 'customers',
        lastSyncAt: staleDate,
        recordCount: 10,
      };

      vi.mocked(useLiveQuery).mockReturnValue(syncMeta);

      const { result } = renderHook(() => useCustomersLastSync());

      expect(result.current.isStale).toBe(true);
      expect(result.current.ageDisplay).not.toBeNull();
    });

    it('should not be stale when data is recent', () => {
      // Mock data from 1 hour ago (fresh)
      const freshDate = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();

      const syncMeta = {
        entity: 'customers',
        lastSyncAt: freshDate,
        recordCount: 10,
      };

      vi.mocked(useLiveQuery).mockReturnValue(syncMeta);

      const { result } = renderHook(() => useCustomersLastSync());

      expect(result.current.isStale).toBe(false);
    });
  });

  describe('useOfflineCustomerCount', () => {
    it('should return 0 when loading', () => {
      vi.mocked(useLiveQuery).mockReturnValue(undefined);

      const { result } = renderHook(() => useOfflineCustomerCount());

      expect(result.current.count).toBe(0);
      expect(result.current.isLoading).toBe(true);
    });

    it('should return customer count when loaded', () => {
      vi.mocked(useLiveQuery).mockReturnValue(25);

      const { result } = renderHook(() => useOfflineCustomerCount());

      expect(result.current.count).toBe(25);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
