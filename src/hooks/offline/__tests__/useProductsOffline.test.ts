/**
 * useProductsOffline Hook Tests (Story 2.1)
 *
 * Tests for the offline products hook with online/offline switching.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';

// Mock Supabase BEFORE any imports that use it
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  },
}));

import { db } from '@/lib/db';
import type { IOfflineProduct } from '@/types/offline';

// Mock useNetworkStatus
const mockIsOnline = vi.fn(() => true);
vi.mock('../useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: mockIsOnline(),
    networkMode: mockIsOnline() ? 'online' : 'offline',
  }),
}));

// Mock useProducts (online hook)
const mockOnlineProducts = vi.fn();
const mockOnlineLoading = vi.fn(() => false);
const mockOnlineError = vi.fn((): Error | null => null);
vi.mock('../../products/useProductList', () => ({
  useProducts: () => ({
    data: mockOnlineProducts(),
    isLoading: mockOnlineLoading(),
    error: mockOnlineError(),
  }),
}));

// Import after mocks
import { useProductsOffline, useOfflineProductsRaw } from '../useProductsOffline';

// Sample product data for offline cache
const mockOfflineProducts: IOfflineProduct[] = [
  {
    id: 'offline-prod-1',
    category_id: 'cat-1',
    sku: 'OFF001',
    name: 'Offline Croissant',
    product_type: 'finished',
    retail_price: 15000,
    wholesale_price: 12000,
    cost_price: 8000,
    current_stock: null,
    image_url: null,
    is_active: true,
    pos_visible: true,
    available_for_sale: true,
    updated_at: '2026-01-30T10:00:00Z',
  },
  {
    id: 'offline-prod-2',
    category_id: 'cat-2',
    sku: 'OFF002',
    name: 'Offline Baguette',
    product_type: 'finished',
    retail_price: 12000,
    wholesale_price: 10000,
    cost_price: 6000,
    current_stock: null,
    image_url: null,
    is_active: true,
    pos_visible: true,
    available_for_sale: true,
    updated_at: '2026-01-30T10:00:00Z',
  },
];

// Sample product data for online mode
const mockOnlineProductsData = [
  {
    id: 'online-prod-1',
    category_id: 'cat-1',
    sku: 'ON001',
    name: 'Online Croissant',
    product_type: 'finished',
    retail_price: 15000,
    category: { id: 'cat-1', name: 'Viennoiseries' },
  },
];

describe('useProductsOffline', () => {
  beforeEach(async () => {
    // Clear Dexie tables
    await db.offline_products.clear();
    await db.offline_sync_meta.clear();

    // Reset mocks
    mockIsOnline.mockReturnValue(true);
    mockOnlineProducts.mockReturnValue(mockOnlineProductsData);
    mockOnlineLoading.mockReturnValue(false);
    mockOnlineError.mockReturnValue(null);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // =====================================================
  // Online Mode Tests
  // =====================================================

  describe('online mode', () => {
    it('should return online data when connected', () => {
      mockIsOnline.mockReturnValue(true);

      const { result } = renderHook(() => useProductsOffline());

      expect(result.current.isOffline).toBe(false);
      expect(result.current.data).toEqual(mockOnlineProductsData);
    });

    it('should reflect loading state from online hook', () => {
      mockIsOnline.mockReturnValue(true);
      mockOnlineLoading.mockReturnValue(true);

      const { result } = renderHook(() => useProductsOffline());

      expect(result.current.isLoading).toBe(true);
    });

    it('should reflect error from online hook', () => {
      mockIsOnline.mockReturnValue(true);
      const testError = new Error('Test error');
      mockOnlineError.mockReturnValue(testError);

      const { result } = renderHook(() => useProductsOffline());

      expect(result.current.error).toBe(testError);
    });

    it('should return empty array when online data is undefined', () => {
      mockIsOnline.mockReturnValue(true);
      mockOnlineProducts.mockReturnValue(undefined);

      const { result } = renderHook(() => useProductsOffline());

      expect(result.current.data).toEqual([]);
    });
  });

  // =====================================================
  // Offline Mode Tests
  // =====================================================

  describe('offline mode', () => {
    beforeEach(async () => {
      // Populate offline cache
      await db.offline_products.bulkAdd(mockOfflineProducts);
      await db.offline_sync_meta.put({
        entity: 'products',
        lastSyncAt: '2026-01-30T10:00:00Z',
        recordCount: mockOfflineProducts.length,
      });
    });

    it('should return cached data when offline', async () => {
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useProductsOffline());

      await waitFor(() => {
        expect(result.current.isOffline).toBe(true);
        expect(result.current.data.length).toBeGreaterThan(0);
      });
    });

    it('should return isOffline true when disconnected', () => {
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useProductsOffline());

      expect(result.current.isOffline).toBe(true);
    });

    it('should return lastSyncAt when offline', async () => {
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useProductsOffline());

      await waitFor(() => {
        expect(result.current.lastSyncAt).toBe('2026-01-30T10:00:00Z');
      });
    });

    it('should return sync metadata when offline', async () => {
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useProductsOffline());

      await waitFor(() => {
        expect(result.current.syncMeta).toBeDefined();
        expect(result.current.syncMeta?.entity).toBe('products');
      });
    });

    it('should return null error when offline', () => {
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useProductsOffline());

      expect(result.current.error).toBeNull();
    });

    it('should provide searchProducts function', async () => {
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useProductsOffline());

      const searchResults = await result.current.searchProducts('Croissant');

      expect(searchResults).toBeDefined();
      expect(Array.isArray(searchResults)).toBe(true);
    });
  });

  // =====================================================
  // Category Filtering Tests
  // =====================================================

  describe('category filtering', () => {
    beforeEach(async () => {
      await db.offline_products.bulkAdd(mockOfflineProducts);
    });

    it('should filter by category when offline', async () => {
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useProductsOffline('cat-1'));

      await waitFor(() => {
        expect(result.current.data.length).toBe(1);
        expect(result.current.data[0].category_id).toBe('cat-1');
      });
    });

    it('should return all products when category is null', async () => {
      mockIsOnline.mockReturnValue(false);

      const { result } = renderHook(() => useProductsOffline(null));

      await waitFor(() => {
        expect(result.current.data.length).toBe(mockOfflineProducts.length);
      });
    });
  });

  // =====================================================
  // Online/Offline Transition Tests
  // =====================================================

  describe('online/offline transitions', () => {
    beforeEach(async () => {
      await db.offline_products.bulkAdd(mockOfflineProducts);
    });

    it('should switch from online to offline data when connection lost', async () => {
      // Start online
      mockIsOnline.mockReturnValue(true);
      const { result, rerender } = renderHook(() => useProductsOffline());

      expect(result.current.isOffline).toBe(false);
      expect(result.current.data).toEqual(mockOnlineProductsData);

      // Go offline
      mockIsOnline.mockReturnValue(false);
      rerender();

      await waitFor(() => {
        expect(result.current.isOffline).toBe(true);
      });
    });

    it('should switch from offline to online data when connection restored', async () => {
      // Start offline
      mockIsOnline.mockReturnValue(false);
      const { result, rerender } = renderHook(() => useProductsOffline());

      await waitFor(() => {
        expect(result.current.isOffline).toBe(true);
      });

      // Go online
      mockIsOnline.mockReturnValue(true);
      rerender();

      expect(result.current.isOffline).toBe(false);
      expect(result.current.data).toEqual(mockOnlineProductsData);
    });
  });
});

// =====================================================
// useOfflineProductsRaw Tests
// =====================================================

describe('useOfflineProductsRaw', () => {
  beforeEach(async () => {
    await db.offline_products.clear();
    await db.offline_sync_meta.clear();
    await db.offline_products.bulkAdd(mockOfflineProducts);
    vi.clearAllMocks();
  });

  it('should return raw IOfflineProduct data', async () => {
    const { result } = renderHook(() => useOfflineProductsRaw());

    await waitFor(() => {
      expect(result.current.products.length).toBe(mockOfflineProducts.length);
      expect(result.current.products[0]).toHaveProperty('retail_price');
    });
  });

  it('should filter by category', async () => {
    const { result } = renderHook(() => useOfflineProductsRaw('cat-1'));

    await waitFor(() => {
      expect(result.current.products.length).toBe(1);
      expect(result.current.products[0].category_id).toBe('cat-1');
    });
  });

  it('should return sync metadata', async () => {
    await db.offline_sync_meta.put({
      entity: 'products',
      lastSyncAt: '2026-01-30T10:00:00Z',
      recordCount: mockOfflineProducts.length,
    });

    const { result } = renderHook(() => useOfflineProductsRaw());

    await waitFor(() => {
      expect(result.current.syncMeta).toBeDefined();
      expect(result.current.syncMeta?.entity).toBe('products');
    });
  });

  it('should indicate loading state initially', () => {
    const { result } = renderHook(() => useOfflineProductsRaw());

    // Initial state before Dexie query resolves
    expect(result.current.isLoading).toBeDefined();
  });
});
