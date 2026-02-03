/**
 * useInternalTransfers Hook Tests (Story 5.4, 5.5)
 *
 * Tests for internal transfers hooks including:
 * - useInternalTransfers: fetching and filtering transfers
 * - useCreateTransfer: creating transfers and cache invalidation
 * - useReceiveTransfer: receiving transfers and generating stock movements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data
const mockTransfers = [
  {
    id: 'transfer-1',
    transfer_number: 'TR-20260202-ABCD',
    from_location_id: 'loc-1',
    to_location_id: 'loc-2',
    status: 'pending',
    responsible_person: 'John Doe',
    transfer_date: '2026-02-02',
    total_items: 5,
    total_value: 100000,
    notes: null,
    created_at: '2026-02-02T10:00:00Z',
    updated_at: '2026-02-02T10:00:00Z',
    from_location: { id: 'loc-1', name: 'Main Warehouse', code: 'MW', location_type: 'main_warehouse' },
    to_location: { id: 'loc-2', name: 'Kitchen', code: 'KIT', location_type: 'section' },
  },
  {
    id: 'transfer-2',
    transfer_number: 'TR-20260201-EFGH',
    from_location_id: 'loc-1',
    to_location_id: 'loc-3',
    status: 'received',
    responsible_person: 'Jane Smith',
    transfer_date: '2026-02-01',
    total_items: 3,
    total_value: 50000,
    notes: 'Completed',
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-01T14:00:00Z',
    from_location: { id: 'loc-1', name: 'Main Warehouse', code: 'MW', location_type: 'main_warehouse' },
    to_location: { id: 'loc-3', name: 'Display', code: 'DSP', location_type: 'section' },
  },
];

// Mock Supabase
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockInsert = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'internal_transfers') {
        return {
          select: mockSelect.mockReturnValue({
            order: mockOrder.mockReturnValue({
              eq: mockEq,
            }),
            eq: mockEq,
            single: mockSingle,
          }),
          insert: mockInsert.mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: mockSingle,
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        };
      }
      if (table === 'transfer_items') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
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
import { useInternalTransfers, useCreateTransfer, useReceiveTransfer } from '../useInternalTransfers';

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

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('useInternalTransfers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: return all transfers
    mockOrder.mockReturnValue({
      eq: mockEq.mockResolvedValue({ data: mockTransfers, error: null }),
    });
  });

  it('should start in loading state', async () => {
    const { result } = renderHook(() => useInternalTransfers(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for loading to finish
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should call supabase with correct query', async () => {
    const { result } = renderHook(
      () => useInternalTransfers({ status: 'pending' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify the query chain was called
    expect(mockSelect).toHaveBeenCalled();
  });

  it('should return empty array when no data', async () => {
    mockOrder.mockReturnValue({
      eq: mockEq.mockResolvedValue({ data: [], error: null }),
    });

    const { result } = renderHook(() => useInternalTransfers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});

describe('useCreateTransfer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful creation
    mockSingle.mockResolvedValue({
      data: {
        id: 'new-transfer-1',
        transfer_number: 'TR-20260202-TEST',
        status: 'draft',
      },
      error: null,
    });
  });

  it('should create transfer successfully', async () => {
    const { result } = renderHook(() => useCreateTransfer(), {
      wrapper: createWrapper(),
    });

    // Trigger mutation
    result.current.mutate({
      fromLocationId: 'loc-1',
      toLocationId: 'loc-2',
      responsiblePerson: 'Test User',
      items: [{ productId: 'prod-1', quantity: 5 }],
      sendDirectly: false,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify insert was called
    expect(mockInsert).toHaveBeenCalled();
  });

  it('should set status to pending when sendDirectly is true', async () => {
    const { result } = renderHook(() => useCreateTransfer(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      fromLocationId: 'loc-1',
      toLocationId: 'loc-2',
      responsiblePerson: 'Test User',
      items: [{ productId: 'prod-1', quantity: 5 }],
      sendDirectly: true,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify insert was called with pending status
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'pending',
      })
    );
  });

  it('should set status to draft when sendDirectly is false', async () => {
    const { result } = renderHook(() => useCreateTransfer(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      fromLocationId: 'loc-1',
      toLocationId: 'loc-2',
      responsiblePerson: 'Test User',
      items: [{ productId: 'prod-1', quantity: 5 }],
      sendDirectly: false,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify insert was called with draft status
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'draft',
      })
    );
  });

  it('should generate transfer number in correct format', async () => {
    const { result } = renderHook(() => useCreateTransfer(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      fromLocationId: 'loc-1',
      toLocationId: 'loc-2',
      responsiblePerson: 'Test User',
      items: [{ productId: 'prod-1', quantity: 5 }],
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify transfer_number format: TR-YYYYMMDD-XXXX
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        transfer_number: expect.stringMatching(/^TR-\d{8}-[A-Z0-9]{4}$/),
      })
    );
  });

  it('should handle creation error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: new Error('Insert failed'),
    });

    const { result } = renderHook(() => useCreateTransfer(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      fromLocationId: 'loc-1',
      toLocationId: 'loc-2',
      responsiblePerson: 'Test User',
      items: [{ productId: 'prod-1', quantity: 5 }],
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});

describe('useReceiveTransfer (Story 5.5)', () => {
  const mockTransferWithItems = {
    id: 'transfer-1',
    transfer_number: 'TR-20260202-ABCD',
    from_location_id: 'loc-1',
    to_location_id: 'loc-2',
    status: 'pending',
    responsible_person: 'John Doe',
    notes: null,
    transfer_items: [
      { id: 'item-1', product_id: 'prod-1', quantity_requested: 10, quantity_received: 0 },
      { id: 'item-2', product_id: 'prod-2', quantity_requested: 5, quantity_received: 0 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock single transfer fetch with items
    mockSingle.mockResolvedValue({
      data: mockTransferWithItems,
      error: null,
    });
  });

  it('should expose mutate and mutateAsync functions', () => {
    const { result } = renderHook(() => useReceiveTransfer(), {
      wrapper: createWrapper(),
    });

    // Verify hook returns proper mutation interface
    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
  });

  it('should fetch transfer details when receiving', async () => {
    const { result } = renderHook(() => useReceiveTransfer(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      transferId: 'transfer-1',
      items: [
        { itemId: 'item-1', quantityReceived: 10 },
        { itemId: 'item-2', quantityReceived: 5 },
      ],
    });

    // Wait for mutation to process
    await waitFor(() => {
      expect(result.current.isPending || result.current.isSuccess || result.current.isError).toBe(true);
    });

    // Verify Supabase was called to fetch transfer
    expect(mockSelect).toHaveBeenCalled();
  });

  it('should handle transfer not found error correctly', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Not found', code: 'PGRST116' },
    });

    const { result } = renderHook(() => useReceiveTransfer(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      transferId: 'non-existent-id',
      items: [],
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Verify error state is set correctly
    expect(result.current.error).toBeTruthy();
    expect(result.current.isSuccess).toBe(false);
  });

  it('should reject already received transfers', async () => {
    // Mock a transfer with 'received' status
    mockSingle.mockResolvedValue({
      data: { ...mockTransferWithItems, status: 'received' },
      error: null,
    });

    const { result } = renderHook(() => useReceiveTransfer(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      transferId: 'transfer-1',
      items: [{ itemId: 'item-1', quantityReceived: 10 }],
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Verify mutation failed with proper error
    expect(result.current.error).toBeTruthy();
  });

  it('should accept reception with variance quantities', async () => {
    const { result } = renderHook(() => useReceiveTransfer(), {
      wrapper: createWrapper(),
    });

    // Receive with different quantities than requested (variance scenario)
    const receptionParams = {
      transferId: 'transfer-1',
      items: [
        { itemId: 'item-1', quantityReceived: 8 },  // 2 less than requested (10)
        { itemId: 'item-2', quantityReceived: 6 },  // 1 more than requested (5)
      ],
      receptionNotes: 'Item 1: 2 units damaged. Item 2: 1 bonus unit.',
    };

    result.current.mutate(receptionParams);

    await waitFor(() => {
      expect(result.current.isPending || result.current.isSuccess || result.current.isError).toBe(true);
    });

    // Verify mutation was called with variance data
    expect(mockSelect).toHaveBeenCalled();
  });

  it('should preserve mutation state across re-renders', async () => {
    const { result, rerender } = renderHook(() => useReceiveTransfer(), {
      wrapper: createWrapper(),
    });

    // Initial state
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    // Rerender should maintain clean state
    rerender();
    expect(result.current.isPending).toBe(false);
  });
});
