/**
 * Tests for useModifiersOffline hook
 *
 * @see Story 2.3: Product Modifiers Offline Cache
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { db } from '@/lib/db';
import type { IOfflineModifier } from '@/types/offline';

// Mock useNetworkStatus - state controlled by mockNetworkState
let mockNetworkState = { isOnline: true };
vi.mock('../useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: mockNetworkState.isOnline,
    isOffline: !mockNetworkState.isOnline,
  }),
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      }),
    }),
  },
}));

// Mock useProductModifiersForPOS
const mockOnlineModifiers = vi.fn();
vi.mock('../../products/useProductModifiers', () => ({
  useProductModifiersForPOS: () => ({
    data: mockOnlineModifiers(),
    isLoading: false,
    isFetching: false,
    error: null,
  }),
}));

import {
  useModifiersOffline,
  useOfflineModifiersRaw,
  useProductModifiersOffline,
  useCategoryModifiersOffline,
} from '../useModifiersOffline';

// =====================================================
// Test Data
// =====================================================

const mockProductModifiers: IOfflineModifier[] = [
  {
    id: 'mod-1',
    product_id: 'product-1',
    category_id: null,
    group_name: 'Size',
    group_type: 'single',
    group_required: true,
    group_sort_order: 0,
    option_id: 'small',
    option_label: 'Small',
    option_icon: null,
    price_adjustment: 0,
    is_default: true,
    option_sort_order: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mod-2',
    product_id: 'product-1',
    category_id: null,
    group_name: 'Size',
    group_type: 'single',
    group_required: true,
    group_sort_order: 0,
    option_id: 'large',
    option_label: 'Large',
    option_icon: null,
    price_adjustment: 5000,
    is_default: false,
    option_sort_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockCategoryModifiers: IOfflineModifier[] = [
  {
    id: 'mod-3',
    product_id: null,
    category_id: 'category-1',
    group_name: 'Temperature',
    group_type: 'single',
    group_required: false,
    group_sort_order: 1,
    option_id: 'hot',
    option_label: 'Hot',
    option_icon: '🔥',
    price_adjustment: 0,
    is_default: true,
    option_sort_order: 0,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockOnlineModifierGroups = [
  {
    name: 'Size',
    type: 'single' as const,
    required: true,
    sortOrder: 0,
    options: [
      { id: 'small', label: 'Small', priceAdjustment: 0, isDefault: true, sortOrder: 0 },
      { id: 'large', label: 'Large', priceAdjustment: 5000, isDefault: false, sortOrder: 1 },
    ],
  },
];

// =====================================================
// Test Setup
// =====================================================

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

beforeEach(async () => {
  // Clear database
  await db.offline_modifiers.clear();
  await db.offline_sync_meta.clear();

  // Reset mocks
  vi.clearAllMocks();
  mockNetworkState = { isOnline: true };
  mockOnlineModifiers.mockReturnValue(mockOnlineModifierGroups);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// =====================================================
// Tests: useModifiersOffline
// =====================================================

describe('useModifiersOffline', () => {
  describe('when online', () => {
    beforeEach(() => {
      mockNetworkState = { isOnline: true };
    });

    it('should use online hook data', async () => {
      const { result } = renderHook(
        () => useModifiersOffline('product-1', 'category-1'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.modifierGroups).toEqual(mockOnlineModifierGroups);
      expect(result.current.isOffline).toBe(false);
    });

    it('should indicate online mode', () => {
      const { result } = renderHook(
        () => useModifiersOffline('product-1', null),
        { wrapper: createWrapper() }
      );

      expect(result.current.isOffline).toBe(false);
    });
  });

  // Note: Offline mode tests are covered by:
  // 1. modifiersCacheService.test.ts - tests the cache service directly
  // 2. The hooks below (useOfflineModifiersRaw, useProductModifiersOffline, useCategoryModifiersOffline)
  //    which test the direct Dexie access without the online/offline switch
  //
  // Testing the online/offline switch behavior requires complex mock setup that can be fragile.
  // The key offline functionality is tested through the service and raw hooks.
});

// =====================================================
// Tests: useOfflineModifiersRaw
// =====================================================

describe('useOfflineModifiersRaw', () => {
  it('should return all cached modifiers', async () => {
    await db.offline_modifiers.bulkAdd(mockProductModifiers);

    const { result } = renderHook(() => useOfflineModifiersRaw(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.modifiers).toHaveLength(2);
    expect(result.current.count).toBe(2);
  });

  it('should return sync metadata', async () => {
    await db.offline_modifiers.bulkAdd(mockProductModifiers);
    await db.offline_sync_meta.put({
      entity: 'modifiers',
      lastSyncAt: '2024-01-15T10:00:00Z',
      recordCount: 2,
    });

    const { result } = renderHook(() => useOfflineModifiersRaw(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.syncMeta).not.toBeNull();
    });

    expect(result.current.syncMeta?.recordCount).toBe(2);
  });

  it('should return empty array when cache is empty', async () => {
    const { result } = renderHook(() => useOfflineModifiersRaw(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.modifiers).toHaveLength(0);
    expect(result.current.count).toBe(0);
  });
});

// =====================================================
// Tests: useProductModifiersOffline
// =====================================================

describe('useProductModifiersOffline', () => {
  beforeEach(async () => {
    await db.offline_modifiers.bulkAdd([
      ...mockProductModifiers,
      ...mockCategoryModifiers,
    ]);
  });

  it('should return only product-specific modifiers', async () => {
    const { result } = renderHook(
      () => useProductModifiersOffline('product-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.modifierGroups).toHaveLength(1);
    expect(result.current.modifierGroups[0].name).toBe('Size');
  });

  it('should return empty array for undefined productId', async () => {
    const { result } = renderHook(
      () => useProductModifiersOffline(undefined),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.modifierGroups).toHaveLength(0);
  });
});

// =====================================================
// Tests: useCategoryModifiersOffline
// =====================================================

describe('useCategoryModifiersOffline', () => {
  beforeEach(async () => {
    await db.offline_modifiers.bulkAdd([
      ...mockProductModifiers,
      ...mockCategoryModifiers,
    ]);
  });

  it('should return only category modifiers', async () => {
    const { result } = renderHook(
      () => useCategoryModifiersOffline('category-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.modifierGroups).toHaveLength(1);
    expect(result.current.modifierGroups[0].name).toBe('Temperature');
    expect(result.current.modifierGroups[0].isInherited).toBe(true);
  });

  it('should return empty array for undefined categoryId', async () => {
    const { result } = renderHook(
      () => useCategoryModifiersOffline(undefined),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.modifierGroups).toHaveLength(0);
  });
});
