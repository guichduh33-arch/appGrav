import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase
const mockFrom = vi.fn()
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockUpdate = vi.fn()

vi.mock('../../../lib/supabase', () => ({
    supabase: {
        from: (table: string) => {
            mockFrom(table)
            return {
                select: (...args: any[]) => {
                    mockSelect(...args)
                    return {
                        eq: (...eqArgs: any[]) => {
                            mockEq(...eqArgs)
                            return {
                                single: () => mockSingle(),
                            }
                        },
                        order: (...orderArgs: any[]) => {
                            mockOrder(...orderArgs)
                            return {
                                limit: (...limitArgs: any[]) => {
                                    mockLimit(...limitArgs)
                                    return {
                                        single: () => mockSingle(),
                                    }
                                },
                            }
                        },
                    }
                },
                insert: (data: any) => {
                    mockInsert(data)
                    return {
                        select: () => ({
                            single: () => mockSingle(),
                        }),
                    }
                },
                update: (data: any) => {
                    mockUpdate(data)
                    return {
                        eq: () => ({ error: null }),
                    }
                },
            }
        },
    },
}))

import { checkCustomerCredit } from '../b2bPosOrderService'

describe('b2bPosOrderService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('checkCustomerCredit', () => {
        it('returns no credit when customer not found', async () => {
            mockSingle.mockResolvedValueOnce({ data: null, error: null })

            const result = await checkCustomerCredit('cust-1', 50000)
            expect(result.hasCredit).toBe(false)
            expect(result.availableCredit).toBe(0)
            expect(result.creditStatus).toBe('none')
        })

        it('returns credit info for approved customer', async () => {
            mockSingle.mockResolvedValueOnce({
                data: {
                    credit_limit: 1000000,
                    credit_balance: 200000,
                    credit_status: 'approved',
                },
                error: null,
            })

            const result = await checkCustomerCredit('cust-1', 50000)
            expect(result.hasCredit).toBe(true)
            expect(result.availableCredit).toBe(800000)
            expect(result.creditStatus).toBe('approved')
        })

        it('returns false when credit insufficient', async () => {
            mockSingle.mockResolvedValueOnce({
                data: {
                    credit_limit: 100000,
                    credit_balance: 80000,
                    credit_status: 'approved',
                },
                error: null,
            })

            const result = await checkCustomerCredit('cust-1', 50000)
            expect(result.hasCredit).toBe(false)
            expect(result.availableCredit).toBe(20000)
        })

        it('returns false when credit suspended', async () => {
            mockSingle.mockResolvedValueOnce({
                data: {
                    credit_limit: 1000000,
                    credit_balance: 0,
                    credit_status: 'suspended',
                },
                error: null,
            })

            const result = await checkCustomerCredit('cust-1', 50000)
            expect(result.hasCredit).toBe(false)
            expect(result.creditStatus).toBe('suspended')
        })

        it('handles null credit fields', async () => {
            mockSingle.mockResolvedValueOnce({
                data: {
                    credit_limit: null,
                    credit_balance: null,
                    credit_status: null,
                },
                error: null,
            })

            const result = await checkCustomerCredit('cust-1', 50000)
            expect(result.hasCredit).toBe(false)
            expect(result.availableCredit).toBe(0)
            expect(result.creditStatus).toBe('none')
        })
    })
})

describe('b2bPosOrderService module', () => {
    it('exports createB2BPosOrder', async () => {
        const mod = await import('../b2bPosOrderService')
        expect(typeof mod.createB2BPosOrder).toBe('function')
    })

    it('exports checkCustomerCredit', async () => {
        const mod = await import('../b2bPosOrderService')
        expect(typeof mod.checkCustomerCredit).toBe('function')
    })

    it('exports IB2BPosOrderInput type', async () => {
        // Type-only check - module loads without error
        const mod = await import('../b2bPosOrderService')
        expect(mod).toBeDefined()
    })
})
