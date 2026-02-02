/**
 * useStockLevelsOffline Hook Tests
 * Story 5.1 - Offline Stock Levels Cache
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { db } from '@/lib/db';
import {
  useStockLevelsOffline,
  useProductStockOffline,
} from '../useStockLevelsOffline';
import type { IOfflineStockLevel } from '@/types/offline';

// Mock network status
vi.mock('../useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: false })),
}));

// Sample stock data
const mockStockLevels: IOfflineStockLevel[] = [
  {
    id: 'prod-1',
    product_id: 'prod-1',
    location_id: null,
    quantity: 50,
    min_stock_level: 10,
    last_updated: '2026-02-02T10:00:00Z',
  },
  {
    id: 'prod-2',
    product_id: 'prod-2',
    location_id: null,
    quantity: 5,
    min_stock_level: 10,
    last_updated: '2026-02-02T09:00:00Z',
  },
  {
    id: 'prod-3',
    product_id: 'prod-3',
    location_id: null,
    quantity: 3,
    min_stock_level: 20,
    last_updated: '2026-02-02T08:00:00Z',
  },
  {
    id: 'prod-4',
    product_id: 'prod-4',
    location_id: null,
    quantity: 0,
    min_stock_level: 5,
    last_updated: '2026-02-02T07:00:00Z',
  },
];

describe('useStockLevelsOffline', () => {
  beforeEach(async () => {
    // Clear IndexedDB before each test
    await db.offline_stock_levels.clear();
    await db.offline_sync_meta.clear();
    localStorage.removeItem('appgrav_stock_levels_last_sync');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return empty array when no cache exists', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stockLevels).toEqual([]);
      expect(result.current.hasData).toBe(false);
      expect(result.current.cacheCount).toBe(0);
    });

    it('should indicate offline mode', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isOffline).toBe(true);
    });
  });

  describe('with cached data', () => {
    beforeEach(async () => {
      await db.offline_stock_levels.bulkPut(mockStockLevels);
      // Store sync meta in IndexedDB (new approach for useLiveQuery reactivity)
      await db.offline_sync_meta.put({
        entity: 'stock_levels',
        lastSyncAt: '2026-02-02T10:00:00Z',
        recordCount: mockStockLevels.length,
      });
    });

    it('should return all stock levels', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.stockLevels).toHaveLength(4);
      });

      expect(result.current.hasData).toBe(true);
      expect(result.current.cacheCount).toBe(4);
    });

    it('should filter by product IDs', async () => {
      const { result } = renderHook(() =>
        useStockLevelsOffline(['prod-1', 'prod-3'])
      );

      await waitFor(() => {
        expect(result.current.stockLevels).toHaveLength(2);
      });

      const ids = result.current.stockLevels.map((s) => s.product_id);
      expect(ids).toContain('prod-1');
      expect(ids).toContain('prod-3');
    });

    it('should return last sync timestamp', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.lastSyncAt).toBe('2026-02-02T10:00:00Z');
      });
    });
  });

  describe('getStockStatus', () => {
    beforeEach(async () => {
      await db.offline_stock_levels.bulkPut(mockStockLevels);
    });

    it('should return "ok" for adequate stock', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.stockLevels).toHaveLength(4);
      });

      const status = result.current.getStockStatus('prod-1'); // qty: 50, min: 10
      expect(status).toBe('ok');
    });

    it('should return "warning" for low stock', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.stockLevels).toHaveLength(4);
      });

      const status = result.current.getStockStatus('prod-2'); // qty: 5, min: 10
      expect(status).toBe('warning');
    });

    it('should return "critical" for very low stock', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.stockLevels).toHaveLength(4);
      });

      const status = result.current.getStockStatus('prod-3'); // qty: 3, min: 20
      expect(status).toBe('critical');
    });

    it('should return "out_of_stock" for zero stock', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.stockLevels).toHaveLength(4);
      });

      const status = result.current.getStockStatus('prod-4'); // qty: 0
      expect(status).toBe('out_of_stock');
    });

    it('should return null for unknown product', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.stockLevels).toHaveLength(4);
      });

      const status = result.current.getStockStatus('unknown-product');
      expect(status).toBeNull();
    });
  });

  describe('getProductStock', () => {
    beforeEach(async () => {
      await db.offline_stock_levels.bulkPut(mockStockLevels);
    });

    it('should return stock for existing product', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.stockLevels).toHaveLength(4);
      });

      const stock = await result.current.getProductStock('prod-1');
      expect(stock).toBeDefined();
      expect(stock?.quantity).toBe(50);
    });

    it('should return undefined for non-existent product', async () => {
      const { result } = renderHook(() => useStockLevelsOffline());

      await waitFor(() => {
        expect(result.current.stockLevels).toHaveLength(4);
      });

      const stock = await result.current.getProductStock('non-existent');
      expect(stock).toBeUndefined();
    });
  });
});

describe('useProductStockOffline', () => {
  beforeEach(async () => {
    await db.offline_stock_levels.clear();
    await db.offline_sync_meta.clear();
    await db.offline_stock_levels.bulkPut(mockStockLevels);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return stock and status for product', async () => {
    const { result } = renderHook(() => useProductStockOffline('prod-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stock).toBeDefined();
    expect(result.current.stock?.quantity).toBe(50);
    expect(result.current.status).toBe('ok');
  });

  it('should return null for non-existent product', async () => {
    const { result } = renderHook(() => useProductStockOffline('non-existent'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stock).toBeNull();
    expect(result.current.status).toBeNull();
  });

  it('should return null when productId is null', async () => {
    const { result } = renderHook(() => useProductStockOffline(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stock).toBeNull();
    expect(result.current.status).toBeNull();
  });
});
