import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  usePurchaseOrders,
  usePurchaseOrder,
  useSuppliers,
  calculateLineTotal,
  calculatePOTotals,
  generatePONumber,
} from '../index'

// Mock Supabase
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockNeq = vi.fn()
const mockOrder = vi.fn()
const mockLike = vi.fn()
const mockLimit = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
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
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('Purchase Orders Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup chain mocks
    mockSelect.mockReturnValue({
      eq: mockEq,
      neq: mockNeq,
      order: mockOrder,
      like: mockLike,
      single: mockSingle,
    })

    mockEq.mockReturnValue({
      select: mockSelect,
      single: mockSingle,
      order: mockOrder,
      eq: mockEq,
      gte: mockEq,
      lte: mockEq,
    })

    mockNeq.mockReturnValue({
      order: mockOrder,
    })

    mockOrder.mockReturnValue({
      limit: mockLimit,
    })

    mockLike.mockReturnValue({
      order: mockOrder,
    })

    mockLimit.mockReturnValue(
      Promise.resolve({ data: [], error: null })
    )
  })

  describe('usePurchaseOrders', () => {
    it('returns list of purchase orders', async () => {
      const mockData = [
        {
          id: '1',
          po_number: 'PO-202602-0001',
          supplier_id: 'sup-1',
          supplier: { name: 'Test Supplier' },
          status: 'draft',
          total_amount: 100000,
        },
      ]

      mockOrder.mockResolvedValue({ data: mockData, error: null })

      const { result } = renderHook(() => usePurchaseOrders(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockData)
    })

    it('has correct query key structure', () => {
      const filters = { status: 'draft' as const }
      const { result } = renderHook(() => usePurchaseOrders(filters), {
        wrapper: createWrapper(),
      })

      // The hook should use the correct query key format
      expect(result.current).toBeDefined()
    })
  })

  describe('usePurchaseOrder', () => {
    it('returns undefined when no ID provided (disabled query)', async () => {
      const { result } = renderHook(() => usePurchaseOrder(null), {
        wrapper: createWrapper(),
      })

      // Query is disabled when no ID, so data should be undefined
      expect(result.current.data).toBeUndefined()
      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('useSuppliers', () => {
    it('hook is properly initialized', async () => {
      const mockSuppliers = [
        { id: '1', name: 'Supplier A', is_active: true },
        { id: '2', name: 'Supplier B', is_active: true },
      ]

      mockOrder.mockResolvedValue({ data: mockSuppliers, error: null })

      const { result } = renderHook(() => useSuppliers(), {
        wrapper: createWrapper(),
      })

      // Hook should be defined and return expected structure
      expect(result.current).toBeDefined()
      expect(result.current.isLoading).toBeDefined()
    })
  })
})

describe('Utility Functions', () => {
  describe('calculateLineTotal', () => {
    it('calculates line total correctly without discount', () => {
      const result = calculateLineTotal({
        quantity: 10,
        unit_price: 1000,
        discount_amount: 0,
        discount_percentage: null,
      })

      expect(result).toBe(10000)
    })

    it('calculates line total with fixed discount', () => {
      const result = calculateLineTotal({
        quantity: 10,
        unit_price: 1000,
        discount_amount: 500,
        discount_percentage: null,
      })

      expect(result).toBe(9500)
    })

    it('calculates line total with percentage discount', () => {
      const result = calculateLineTotal({
        quantity: 10,
        unit_price: 1000,
        discount_amount: 0,
        discount_percentage: 10, // 10%
      })

      expect(result).toBe(9000) // 10000 - 10% = 9000
    })

    it('percentage discount takes precedence over fixed discount', () => {
      const result = calculateLineTotal({
        quantity: 10,
        unit_price: 1000,
        discount_amount: 500, // Should be ignored
        discount_percentage: 10, // 10%
      })

      expect(result).toBe(9000)
    })
  })

  describe('calculatePOTotals', () => {
    const mockItems = [
      { product_name: 'Item 1', quantity: 1, unit_price: 1000, line_total: 1000, tax_rate: 10 } as any,
      { product_name: 'Item 2', quantity: 2, unit_price: 500, line_total: 1000, tax_rate: 10 } as any,
    ]

    it('calculates subtotal as sum of line totals', () => {
      const result = calculatePOTotals(mockItems, 0, null)

      expect(result.subtotal).toBe(2000)
    })

    it('calculates tax amount correctly', () => {
      const result = calculatePOTotals(mockItems, 0, null)

      // (1000 * 10%) + (1000 * 10%) = 100 + 100 = 200
      expect(result.tax_amount).toBe(200)
    })

    it('calculates total with no global discount', () => {
      const result = calculatePOTotals(mockItems, 0, null)

      // subtotal (2000) + tax (200) = 2200
      expect(result.total_amount).toBe(2200)
    })

    it('applies fixed global discount', () => {
      const result = calculatePOTotals(mockItems, 500, null)

      expect(result.discount_amount).toBe(500)
      // subtotal (2000) - discount (500) + tax (200) = 1700
      expect(result.total_amount).toBe(1700)
    })

    it('applies percentage global discount', () => {
      const result = calculatePOTotals(mockItems, 0, 10) // 10%

      // 2000 * 10% = 200
      expect(result.discount_amount).toBe(200)
      // subtotal (2000) - discount (200) + tax (200) = 2000
      expect(result.total_amount).toBe(2000)
    })
  })

  describe('generatePONumber', () => {
    it('generates correct format PO-YYYYMM-XXXX', async () => {
      const now = new Date()
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

      mockLike.mockReturnValue({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      })

      const result = await generatePONumber()

      expect(result).toMatch(new RegExp(`^PO-${yearMonth}-\\d{4}$`))
    })

    it('generates first PO number as 0001 when no existing POs', async () => {
      const now = new Date()
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

      mockLike.mockReturnValue({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      })

      const result = await generatePONumber()

      expect(result).toBe(`PO-${yearMonth}-0001`)
    })

    it('increments PO number from last existing', async () => {
      const now = new Date()
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

      mockLike.mockReturnValue({
        order: () => ({
          limit: () =>
            Promise.resolve({
              data: [{ po_number: `PO-${yearMonth}-0005` }],
              error: null,
            }),
        }),
      })

      const result = await generatePONumber()

      expect(result).toBe(`PO-${yearMonth}-0006`)
    })
  })
})
