import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  calculateReceptionStatus,
  canReceiveItems,
  useReceivePOItem,
  useUpdatePOReceptionStatus,
} from '../usePurchaseOrderReception'

// Mock Supabase
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    })),
  },
}))

// Create wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ============================================================================
// calculateReceptionStatus Tests
// ============================================================================

describe('calculateReceptionStatus', () => {
  it('returns "received" when all items are fully received', () => {
    const items = [
      { quantity: 10, quantity_received: 10 },
      { quantity: 5, quantity_received: 5 },
      { quantity: 3, quantity_received: 3 },
    ]
    expect(calculateReceptionStatus(items)).toBe('received')
  })

  it('returns "received" when items are over-received', () => {
    const items = [
      { quantity: 10, quantity_received: 12 },
      { quantity: 5, quantity_received: 5 },
    ]
    expect(calculateReceptionStatus(items)).toBe('received')
  })

  it('returns "partially_received" when some items are not fully received', () => {
    const items = [
      { quantity: 10, quantity_received: 10 },
      { quantity: 5, quantity_received: 3 },
    ]
    expect(calculateReceptionStatus(items)).toBe('partially_received')
  })

  it('returns "partially_received" when no items are received', () => {
    const items = [
      { quantity: 10, quantity_received: 0 },
      { quantity: 5, quantity_received: 0 },
    ]
    expect(calculateReceptionStatus(items)).toBe('partially_received')
  })

  it('handles empty array and returns "received"', () => {
    const items: Array<{ quantity: number; quantity_received: number }> = []
    expect(calculateReceptionStatus(items)).toBe('received')
  })

  it('handles undefined quantity_received as 0', () => {
    const items = [
      { quantity: 10, quantity_received: 0 },
    ]
    expect(calculateReceptionStatus(items)).toBe('partially_received')
  })
})

// ============================================================================
// canReceiveItems Tests
// ============================================================================

describe('canReceiveItems', () => {
  it('returns true for "confirmed" status', () => {
    expect(canReceiveItems('confirmed')).toBe(true)
  })

  it('returns true for "partially_received" status', () => {
    expect(canReceiveItems('partially_received')).toBe(true)
  })

  it('returns false for "draft" status', () => {
    expect(canReceiveItems('draft')).toBe(false)
  })

  it('returns false for "sent" status', () => {
    expect(canReceiveItems('sent')).toBe(false)
  })

  it('returns false for "received" status', () => {
    expect(canReceiveItems('received')).toBe(false)
  })

  it('returns false for "cancelled" status', () => {
    expect(canReceiveItems('cancelled')).toBe(false)
  })
})

// ============================================================================
// useReceivePOItem Tests
// ============================================================================

describe('useReceivePOItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockSelect.mockReturnValue({
      eq: mockEq,
    })

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockInsert.mockResolvedValue({ data: null, error: null })
  })

  it('throws INVALID_PO_STATUS when PO is in draft status', async () => {
    // Mock PO status fetch
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: { status: 'draft', po_number: 'PO-001' },
        error: null,
      }),
    })

    const { result } = renderHook(() => useReceivePOItem(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          purchaseOrderId: 'po-1',
          itemId: 'item-1',
          quantityReceived: 5,
        })
      })
    ).rejects.toThrow('INVALID_PO_STATUS')
  })

  it('throws INVALID_PO_STATUS when PO is in sent status', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: { status: 'sent', po_number: 'PO-001' },
        error: null,
      }),
    })

    const { result } = renderHook(() => useReceivePOItem(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          purchaseOrderId: 'po-1',
          itemId: 'item-1',
          quantityReceived: 5,
        })
      })
    ).rejects.toThrow('INVALID_PO_STATUS')
  })

  it('throws INVALID_PO_STATUS when PO is in received status', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: { status: 'received', po_number: 'PO-001' },
        error: null,
      }),
    })

    const { result } = renderHook(() => useReceivePOItem(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          purchaseOrderId: 'po-1',
          itemId: 'item-1',
          quantityReceived: 5,
        })
      })
    ).rejects.toThrow('INVALID_PO_STATUS')
  })

  it('throws INVALID_PO_STATUS when PO is in cancelled status', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: { status: 'cancelled', po_number: 'PO-001' },
        error: null,
      }),
    })

    const { result } = renderHook(() => useReceivePOItem(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync({
          purchaseOrderId: 'po-1',
          itemId: 'item-1',
          quantityReceived: 5,
        })
      })
    ).rejects.toThrow('INVALID_PO_STATUS')
  })

  it('successfully receives item when PO is confirmed', async () => {
    // Mock PO fetch - confirmed status
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: { status: 'confirmed', po_number: 'PO-001' },
        error: null,
      }),
    })

    // Mock item fetch
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: {
          id: 'item-1',
          product_id: 'prod-1',
          product_name: 'Test Product',
          quantity: 10,
          quantity_received: 0,
          unit_price: 1000,
        },
        error: null,
      }),
    })

    // Mock product fetch
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: { current_stock: 50 },
        error: null,
      }),
    })

    // Mock stock movement insert (returns via mockInsert)
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    // Mock product update
    mockEq.mockReturnValueOnce(
      Promise.resolve({ data: null, error: null })
    )

    // Mock item update
    mockEq.mockReturnValueOnce(
      Promise.resolve({ data: null, error: null })
    )

    // Mock history insert
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    // Mock all items fetch for status calculation
    mockEq.mockReturnValueOnce(
      Promise.resolve({
        data: [
          { quantity: 10, quantity_received: 5 },
        ],
        error: null,
      })
    )

    // Mock PO status update
    mockEq.mockReturnValueOnce(
      Promise.resolve({ data: null, error: null })
    )

    const { result } = renderHook(() => useReceivePOItem(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      const res = await result.current.mutateAsync({
        purchaseOrderId: 'po-1',
        itemId: 'item-1',
        quantityReceived: 5,
      })

      expect(res.itemId).toBe('item-1')
      expect(res.quantityReceived).toBe(5)
      expect(res.delta).toBe(5)
    })
  })

  it('successfully receives item when PO is partially_received', async () => {
    // Mock PO fetch - partially_received status
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: { status: 'partially_received', po_number: 'PO-001' },
        error: null,
      }),
    })

    // Mock item fetch
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: {
          id: 'item-1',
          product_id: 'prod-1',
          product_name: 'Test Product',
          quantity: 10,
          quantity_received: 5,
          unit_price: 1000,
        },
        error: null,
      }),
    })

    // Mock product fetch
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({
        data: { current_stock: 55 },
        error: null,
      }),
    })

    // Mock stock movement insert
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    // Mock product update
    mockEq.mockReturnValueOnce(
      Promise.resolve({ data: null, error: null })
    )

    // Mock item update
    mockEq.mockReturnValueOnce(
      Promise.resolve({ data: null, error: null })
    )

    // Mock history insert
    mockInsert.mockResolvedValueOnce({ data: null, error: null })

    // Mock all items fetch - all fully received now
    mockEq.mockReturnValueOnce(
      Promise.resolve({
        data: [
          { quantity: 10, quantity_received: 10 },
        ],
        error: null,
      })
    )

    // Mock PO status update
    mockEq.mockReturnValueOnce(
      Promise.resolve({ data: null, error: null })
    )

    const { result } = renderHook(() => useReceivePOItem(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      const res = await result.current.mutateAsync({
        purchaseOrderId: 'po-1',
        itemId: 'item-1',
        quantityReceived: 10,
      })

      expect(res.itemId).toBe('item-1')
      expect(res.quantityReceived).toBe(10)
      expect(res.delta).toBe(5)
      expect(res.newPOStatus).toBe('received')
    })
  })
})

// ============================================================================
// useUpdatePOReceptionStatus Tests
// ============================================================================

describe('useUpdatePOReceptionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockSelect.mockReturnValue({
      eq: mockEq,
    })

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })
  })

  it('updates status to "received" when all items are complete', async () => {
    // Mock items fetch - all received
    mockEq.mockReturnValueOnce(
      Promise.resolve({
        data: [
          { quantity: 10, quantity_received: 10 },
          { quantity: 5, quantity_received: 5 },
        ],
        error: null,
      })
    )

    // Mock PO status update
    mockEq.mockReturnValueOnce(
      Promise.resolve({ data: null, error: null })
    )

    const { result } = renderHook(() => useUpdatePOReceptionStatus(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      const newStatus = await result.current.mutateAsync('po-1')
      expect(newStatus).toBe('received')
    })
  })

  it('updates status to "partially_received" when not all items are complete', async () => {
    // Mock items fetch - not all received
    mockEq.mockReturnValueOnce(
      Promise.resolve({
        data: [
          { quantity: 10, quantity_received: 10 },
          { quantity: 5, quantity_received: 2 },
        ],
        error: null,
      })
    )

    // Mock PO status update
    mockEq.mockReturnValueOnce(
      Promise.resolve({ data: null, error: null })
    )

    const { result } = renderHook(() => useUpdatePOReceptionStatus(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      const newStatus = await result.current.mutateAsync('po-1')
      expect(newStatus).toBe('partially_received')
    })
  })
})
