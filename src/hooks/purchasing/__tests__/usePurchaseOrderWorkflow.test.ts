import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  getValidTransitions,
  isValidTransition,
  useSendToSupplier,
  useConfirmOrder,
  useCancelOrder,
  TPOWorkflowAction,
} from '../usePurchaseOrderWorkflow'
import { TPOStatus } from '../usePurchaseOrders'

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
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ============================================================================
// getValidTransitions Tests
// ============================================================================

describe('getValidTransitions', () => {
  it('returns ["send", "cancel"] for draft status', () => {
    const result = getValidTransitions('draft')
    expect(result).toEqual(['send', 'cancel'])
  })

  it('returns ["confirm", "cancel"] for sent status', () => {
    const result = getValidTransitions('sent')
    expect(result).toEqual(['confirm', 'cancel'])
  })

  it('returns ["receive"] for confirmed status', () => {
    const result = getValidTransitions('confirmed')
    expect(result).toEqual(['receive'])
  })

  it('returns ["receive"] for partially_received status', () => {
    const result = getValidTransitions('partially_received')
    expect(result).toEqual(['receive'])
  })

  it('returns empty array for received status', () => {
    const result = getValidTransitions('received')
    expect(result).toEqual([])
  })

  it('returns empty array for cancelled status', () => {
    const result = getValidTransitions('cancelled')
    expect(result).toEqual([])
  })

  it('returns ["send", "cancel"] for modified status', () => {
    const result = getValidTransitions('modified')
    expect(result).toEqual(['send', 'cancel'])
  })
})

describe('isValidTransition', () => {
  it('returns true for valid draft → send transition', () => {
    expect(isValidTransition('draft', 'send')).toBe(true)
  })

  it('returns true for valid draft → cancel transition', () => {
    expect(isValidTransition('draft', 'cancel')).toBe(true)
  })

  it('returns false for invalid draft → confirm transition', () => {
    expect(isValidTransition('draft', 'confirm')).toBe(false)
  })

  it('returns true for valid sent → confirm transition', () => {
    expect(isValidTransition('sent', 'confirm')).toBe(true)
  })

  it('returns true for valid sent → cancel transition', () => {
    expect(isValidTransition('sent', 'cancel')).toBe(true)
  })

  it('returns false for invalid sent → send transition', () => {
    expect(isValidTransition('sent', 'send')).toBe(false)
  })

  it('returns true for receive on confirmed status, false for others', () => {
    expect(isValidTransition('confirmed', 'receive')).toBe(true)
    expect(isValidTransition('confirmed', 'send')).toBe(false)
    expect(isValidTransition('confirmed', 'confirm')).toBe(false)
    expect(isValidTransition('confirmed', 'cancel')).toBe(false)
  })

  it('returns false for any action on received status', () => {
    expect(isValidTransition('received', 'send')).toBe(false)
    expect(isValidTransition('received', 'confirm')).toBe(false)
    expect(isValidTransition('received', 'cancel')).toBe(false)
  })

  it('returns false for any action on cancelled status', () => {
    expect(isValidTransition('cancelled', 'send')).toBe(false)
    expect(isValidTransition('cancelled', 'confirm')).toBe(false)
    expect(isValidTransition('cancelled', 'cancel')).toBe(false)
  })
})

// ============================================================================
// useSendToSupplier Tests
// ============================================================================

describe('useSendToSupplier', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup chain mocks
    mockSelect.mockReturnValue({
      eq: mockEq,
    })

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockInsert.mockResolvedValue({ data: null, error: null })
  })

  it('successfully sends PO from draft status and creates history entry', async () => {
    // Mock fetch current status
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'draft' }, error: null }),
    })

    // Mock update
    mockEq.mockReturnValueOnce({
      select: () => ({
        single: () => Promise.resolve({
          data: { id: 'po-1', status: 'sent' },
          error: null
        }),
      }),
    })

    const { result } = renderHook(() => useSendToSupplier(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('po-1')
    })

    // Verify history was logged
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        purchase_order_id: 'po-1',
        action_type: 'sent',
        previous_status: 'draft',
        new_status: 'sent',
        description: 'Bon de commande envoyé au fournisseur',
      })
    )
  })

  it('throws INVALID_TRANSITION when PO is not in draft status', async () => {
    // Mock fetch current status - PO is 'sent' not 'draft'
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'sent' }, error: null }),
    })

    const { result } = renderHook(() => useSendToSupplier(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync('po-1')
      })
    ).rejects.toThrow('INVALID_TRANSITION')
  })

  it('throws INVALID_TRANSITION when PO is confirmed', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'confirmed' }, error: null }),
    })

    const { result } = renderHook(() => useSendToSupplier(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync('po-1')
      })
    ).rejects.toThrow('INVALID_TRANSITION')
  })
})

// ============================================================================
// useConfirmOrder Tests
// ============================================================================

describe('useConfirmOrder', () => {
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

  it('successfully confirms PO from sent status and creates history entry', async () => {
    // Mock fetch current status
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'sent' }, error: null }),
    })

    // Mock update
    mockEq.mockReturnValueOnce({
      select: () => ({
        single: () => Promise.resolve({
          data: { id: 'po-1', status: 'confirmed' },
          error: null
        }),
      }),
    })

    const { result } = renderHook(() => useConfirmOrder(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('po-1')
    })

    // Verify history was logged
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        purchase_order_id: 'po-1',
        action_type: 'confirmed',
        previous_status: 'sent',
        new_status: 'confirmed',
        description: 'Commande confirmée par le fournisseur',
      })
    )
  })

  it('throws INVALID_TRANSITION when PO is in draft status', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'draft' }, error: null }),
    })

    const { result } = renderHook(() => useConfirmOrder(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync('po-1')
      })
    ).rejects.toThrow('INVALID_TRANSITION')
  })

  it('throws INVALID_TRANSITION when PO is already confirmed', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'confirmed' }, error: null }),
    })

    const { result } = renderHook(() => useConfirmOrder(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync('po-1')
      })
    ).rejects.toThrow('INVALID_TRANSITION')
  })
})

// ============================================================================
// useCancelOrder Tests
// ============================================================================

describe('useCancelOrder', () => {
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

  it('successfully cancels PO from draft status', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'draft' }, error: null }),
    })

    mockEq.mockReturnValueOnce({
      select: () => ({
        single: () => Promise.resolve({
          data: { id: 'po-1', status: 'cancelled' },
          error: null
        }),
      }),
    })

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ purchaseOrderId: 'po-1' })
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        purchase_order_id: 'po-1',
        action_type: 'cancelled',
        previous_status: 'draft',
        new_status: 'cancelled',
        description: 'Bon de commande annulé',
      })
    )
  })

  it('successfully cancels PO from sent status', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'sent' }, error: null }),
    })

    mockEq.mockReturnValueOnce({
      select: () => ({
        single: () => Promise.resolve({
          data: { id: 'po-1', status: 'cancelled' },
          error: null
        }),
      }),
    })

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ purchaseOrderId: 'po-1' })
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        previous_status: 'sent',
        new_status: 'cancelled',
      })
    )
  })

  it('includes cancellation reason in history metadata when provided', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'draft' }, error: null }),
    })

    mockEq.mockReturnValueOnce({
      select: () => ({
        single: () => Promise.resolve({
          data: { id: 'po-1', status: 'cancelled' },
          error: null
        }),
      }),
    })

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        purchaseOrderId: 'po-1',
        reason: 'Supplier out of stock',
      })
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          reason: 'Supplier out of stock',
        }),
      })
    )
  })

  it('throws INVALID_TRANSITION when PO is confirmed', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'confirmed' }, error: null }),
    })

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync({ purchaseOrderId: 'po-1' })
      })
    ).rejects.toThrow('INVALID_TRANSITION')
  })

  it('throws INVALID_TRANSITION when PO is received', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'received' }, error: null }),
    })

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync({ purchaseOrderId: 'po-1' })
      })
    ).rejects.toThrow('INVALID_TRANSITION')
  })

  it('throws INVALID_TRANSITION when PO is already cancelled', async () => {
    mockEq.mockReturnValueOnce({
      single: () => Promise.resolve({ data: { status: 'cancelled' }, error: null }),
    })

    const { result } = renderHook(() => useCancelOrder(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.mutateAsync({ purchaseOrderId: 'po-1' })
      })
    ).rejects.toThrow('INVALID_TRANSITION')
  })
})
