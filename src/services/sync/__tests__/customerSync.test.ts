/**
 * Customer Sync Service Tests
 * Story 6.1 - Customers Offline Cache
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock types for test data
interface MockCustomer {
  id: string;
  phone: string | null;
  name: string;
  email: string | null;
  loyalty_points: number;
  updated_at: string;
  customer_categories: { slug: string } | null;
}

// Mock Supabase client with hoisted mock
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock db with hoisted mock
vi.mock('@/lib/db', () => ({
  db: {
    offline_customers: {
      bulkPut: vi.fn().mockResolvedValue(undefined),
      bulkDelete: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(),
        })),
      })),
      orderBy: vi.fn(() => ({
        limit: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue([]),
        })),
      })),
      toArray: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    offline_sync_meta: {
      get: vi.fn(),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

// Import after mocks are set up
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import {
  syncCustomersToOffline,
  // getAllCustomersFromOffline - available but not used in these tests
  searchCustomersOffline,
  getCustomerByIdOffline,
  getCustomerByPhoneOffline,
  hasOfflineCustomerData,
  getOfflineCustomerCount,
  getCustomersSyncMeta,
  clearOfflineCustomerData,
} from '../customerSync';

describe('customerSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.offline_sync_meta.get).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('syncCustomersToOffline', () => {
    it('should sync customers with category_slug and loyalty_tier', async () => {
      const mockCustomers: MockCustomer[] = [
        {
          id: 'cust-1',
          phone: '+6281234567890',
          name: 'John Doe',
          email: 'john@example.com',
          loyalty_points: 2500,
          updated_at: '2026-02-05T10:00:00Z',
          customer_categories: { slug: 'wholesale' },
        },
        {
          id: 'cust-2',
          phone: '+6281234567891',
          name: 'Jane Smith',
          email: 'jane@example.com',
          loyalty_points: 100,
          updated_at: '2026-02-05T09:00:00Z',
          customer_categories: null,
        },
      ];

      const mockLoyaltyTiers = [
        { name: 'Platinum', min_points: 5000 },
        { name: 'Gold', min_points: 2000 },
        { name: 'Silver', min_points: 500 },
        { name: 'Bronze', min_points: 0 },
      ];

      // Mock customers query chain
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gt: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockCustomers, error: null }),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'loyalty_tiers') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockLoyaltyTiers, error: null }),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gt: vi.fn().mockResolvedValue({ data: [], error: null }),
        } as unknown as ReturnType<typeof supabase.from>;
      });

      const count = await syncCustomersToOffline();

      expect(count).toBe(2);
      expect(db.offline_customers.bulkPut).toHaveBeenCalledTimes(1);

      // Verify the transformed data
      const putCall = vi.mocked(db.offline_customers.bulkPut).mock.calls[0];
      const putData = putCall[0] as Array<{
        id: string;
        phone: string | null;
        name: string;
        email: string | null;
        category_slug: string | null;
        loyalty_tier: string | null;
        points_balance: number;
        updated_at: string;
      }>;
      expect(putData).toHaveLength(2);

      // Check first customer (Gold tier, wholesale category)
      expect(putData[0]).toEqual({
        id: 'cust-1',
        phone: '+6281234567890',
        name: 'John Doe',
        email: 'john@example.com',
        category_slug: 'wholesale',
        loyalty_tier: 'Gold',
        points_balance: 2500,
        updated_at: '2026-02-05T10:00:00Z',
      });

      // Check second customer (Bronze tier, no category)
      expect(putData[1]).toEqual({
        id: 'cust-2',
        phone: '+6281234567891',
        name: 'Jane Smith',
        email: 'jane@example.com',
        category_slug: null,
        loyalty_tier: 'Bronze',
        points_balance: 100,
        updated_at: '2026-02-05T09:00:00Z',
      });
    });

    it('should return 0 when no new customers to sync', async () => {
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'customers') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gt: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        if (table === 'loyalty_tiers') {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          } as unknown as ReturnType<typeof supabase.from>;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gt: vi.fn().mockResolvedValue({ data: [], error: null }),
        } as unknown as ReturnType<typeof supabase.from>;
      });

      const count = await syncCustomersToOffline();

      expect(count).toBe(0);
      expect(db.offline_customers.bulkPut).not.toHaveBeenCalled();
    });
  });

  describe('searchCustomersOffline', () => {
    it('should return recent customers when no search term', async () => {
      const mockCustomers = [
        { id: '1', name: 'Alice', phone: null, email: null },
        { id: '2', name: 'Bob', phone: null, email: null },
      ];

      vi.mocked(db.offline_customers.orderBy).mockReturnValue({
        limit: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockCustomers),
        }),
      } as unknown as ReturnType<typeof db.offline_customers.orderBy>);

      const results = await searchCustomersOffline('');

      expect(db.offline_customers.orderBy).toHaveBeenCalledWith('name');
      expect(results).toHaveLength(2);
    });

    it('should filter by name', async () => {
      const mockCustomers = [
        { id: '1', name: 'John Doe', phone: '+62812345', email: 'john@test.com' },
        { id: '2', name: 'Jane Smith', phone: '+62812346', email: 'jane@test.com' },
      ];

      vi.mocked(db.offline_customers.toArray).mockResolvedValue(mockCustomers as never);

      const results = await searchCustomersOffline('john');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John Doe');
    });

    it('should filter by phone', async () => {
      const mockCustomers = [
        { id: '1', name: 'Customer A', phone: '+62812345678', email: null },
        { id: '2', name: 'Customer B', phone: '+62899999999', email: null },
      ];

      vi.mocked(db.offline_customers.toArray).mockResolvedValue(mockCustomers as never);

      const results = await searchCustomersOffline('812345');

      expect(results).toHaveLength(1);
      expect(results[0].phone).toBe('+62812345678');
    });

    it('should filter by email', async () => {
      const mockCustomers = [
        { id: '1', name: 'Customer A', phone: null, email: 'alice@example.com' },
        { id: '2', name: 'Customer B', phone: null, email: 'bob@test.com' },
      ];

      vi.mocked(db.offline_customers.toArray).mockResolvedValue(mockCustomers as never);

      const results = await searchCustomersOffline('alice');

      expect(results).toHaveLength(1);
      expect(results[0].email).toBe('alice@example.com');
    });
  });

  describe('getCustomerByIdOffline', () => {
    it('should return customer by ID', async () => {
      const mockCustomer = {
        id: 'cust-123',
        name: 'Test Customer',
        phone: '+62812345',
      };

      vi.mocked(db.offline_customers.get).mockResolvedValue(mockCustomer as never);

      const result = await getCustomerByIdOffline('cust-123');

      expect(db.offline_customers.get).toHaveBeenCalledWith('cust-123');
      expect(result).toEqual(mockCustomer);
    });

    it('should return undefined for non-existent customer', async () => {
      vi.mocked(db.offline_customers.get).mockResolvedValue(undefined);

      const result = await getCustomerByIdOffline('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('getCustomerByPhoneOffline', () => {
    it('should return customer by phone', async () => {
      const mockCustomer = {
        id: 'cust-123',
        name: 'Test Customer',
        phone: '+62812345678',
      };

      const mockFirst = vi.fn().mockResolvedValue(mockCustomer);
      const mockEquals = vi.fn().mockReturnValue({ first: mockFirst });
      vi.mocked(db.offline_customers.where).mockReturnValue({ equals: mockEquals } as never);

      const result = await getCustomerByPhoneOffline('+62812345678');

      expect(db.offline_customers.where).toHaveBeenCalledWith('phone');
      expect(mockEquals).toHaveBeenCalledWith('+62812345678');
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('hasOfflineCustomerData', () => {
    it('should return true when customers exist', async () => {
      vi.mocked(db.offline_customers.count).mockResolvedValue(15);

      const result = await hasOfflineCustomerData();

      expect(result).toBe(true);
    });

    it('should return false when no customers', async () => {
      vi.mocked(db.offline_customers.count).mockResolvedValue(0);

      const result = await hasOfflineCustomerData();

      expect(result).toBe(false);
    });
  });

  describe('getOfflineCustomerCount', () => {
    it('should return customer count', async () => {
      vi.mocked(db.offline_customers.count).mockResolvedValue(42);

      const count = await getOfflineCustomerCount();

      expect(count).toBe(42);
    });
  });

  describe('getCustomersSyncMeta', () => {
    it('should return sync metadata', async () => {
      vi.mocked(db.offline_sync_meta.get).mockResolvedValue({
        entity: 'customers',
        lastSyncAt: '2026-02-05T10:00:00Z',
        recordCount: 100,
      });

      const meta = await getCustomersSyncMeta();

      expect(meta).toEqual({
        lastSyncAt: '2026-02-05T10:00:00Z',
        recordCount: 100,
      });
    });

    it('should return null when never synced', async () => {
      vi.mocked(db.offline_sync_meta.get).mockResolvedValue(undefined);

      const meta = await getCustomersSyncMeta();

      expect(meta).toBeNull();
    });
  });

  describe('clearOfflineCustomerData', () => {
    it('should clear all customer data and sync meta', async () => {
      await clearOfflineCustomerData();

      expect(db.offline_customers.clear).toHaveBeenCalled();
      expect(db.offline_sync_meta.delete).toHaveBeenCalledWith('customers');
    });
  });
});
