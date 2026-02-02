/**
 * useLocations Hook Tests (Story 5.4)
 *
 * Tests for stock locations hooks including:
 * - useLocations: fetching and filtering locations
 * - useLocation: fetching single location
 * - useLocationsByType: grouping locations by type
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data
const mockLocations = [
  {
    id: 'loc-1',
    code: 'MW',
    name: 'Main Warehouse',
    location_type: 'main_warehouse',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'loc-2',
    code: 'KIT',
    name: 'Kitchen',
    location_type: 'section',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'loc-3',
    code: 'DSP',
    name: 'Display Area',
    location_type: 'section',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'loc-4',
    code: 'STR',
    name: 'Cold Storage',
    location_type: 'storage',
    is_active: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// Mock Supabase
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'stock_locations') {
        return {
          select: mockSelect.mockReturnValue({
            order: mockOrder.mockReturnValue({
              eq: mockEq,
            }),
            eq: mockEq,
            single: mockSingle,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
    }),
  },
}));

// Import after mocks
import { useLocations, useLocation, useLocationsByType } from '../useLocations';

// Create wrapper with QueryClient
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

describe('useLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: return active locations
    mockOrder.mockReturnValue({
      eq: mockEq.mockResolvedValue({
        data: mockLocations.filter((l) => l.is_active),
        error: null,
      }),
    });
  });

  it('should start in loading state', async () => {
    const { result } = renderHook(() => useLocations(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return active locations by default', async () => {
    const { result } = renderHook(() => useLocations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data?.every((l) => l.is_active)).toBe(true);
  });

  it('should filter by location type', async () => {
    mockOrder.mockReturnValue({
      eq: mockEq.mockImplementation((field: string, value: unknown) => {
        if (field === 'location_type' && value === 'section') {
          return {
            eq: vi.fn().mockResolvedValue({
              data: mockLocations.filter(
                (l) => l.location_type === 'section' && l.is_active
              ),
              error: null,
            }),
          };
        }
        return {
          eq: vi.fn().mockResolvedValue({
            data: mockLocations.filter((l) => l.is_active),
            error: null,
          }),
        };
      }),
    });

    const { result } = renderHook(
      () => useLocations({ locationType: 'section' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSelect).toHaveBeenCalled();
  });

  it('should return empty array when no data', async () => {
    mockOrder.mockReturnValue({
      eq: mockEq.mockResolvedValue({ data: [], error: null }),
    });

    const { result } = renderHook(() => useLocations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should handle errors', async () => {
    mockOrder.mockReturnValue({
      eq: mockEq.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      }),
    });

    const { result } = renderHook(() => useLocations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});

describe('useLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch when locationId is null', async () => {
    const { result } = renderHook(() => useLocation(null), {
      wrapper: createWrapper(),
    });

    // Should not be loading since query is disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should be enabled when locationId is provided', async () => {
    // Setup mock for single location fetch
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockLocations[0],
          error: null,
        }),
      }),
      order: mockOrder,
    });

    const { result } = renderHook(() => useLocation('loc-1'), {
      wrapper: createWrapper(),
    });

    // Query should be enabled (isLoading or fetching)
    expect(result.current.fetchStatus).not.toBe('idle');
  });
});

describe('useLocationsByType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrder.mockReturnValue({
      eq: mockEq.mockResolvedValue({
        data: mockLocations.filter((l) => l.is_active),
        error: null,
      }),
    });
  });

  it('should group locations by type', async () => {
    const { result } = renderHook(() => useLocationsByType(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.warehouses).toHaveLength(1);
    expect(result.current.sections).toHaveLength(2);
    expect(result.current.warehouses[0].name).toBe('Main Warehouse');
  });

  it('should return empty arrays when no locations', async () => {
    mockOrder.mockReturnValue({
      eq: mockEq.mockResolvedValue({ data: [], error: null }),
    });

    const { result } = renderHook(() => useLocationsByType(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.warehouses).toEqual([]);
    expect(result.current.sections).toEqual([]);
    expect(result.current.kitchens).toEqual([]);
    expect(result.current.storageAreas).toEqual([]);
  });
});
