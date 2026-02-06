import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    allocatePaymentFIFO,
    exportOutstandingCSV,
    type IOutstandingOrder,
} from '../arService'

// Mock supabase for the async functions
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockIn = vi.fn()
const mockNeq = vi.fn()
const mockOrder = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()

vi.mock('../../../lib/supabase', () => ({
    supabase: {
        from: (table: string) => {
            mockFrom(table)
            return {
                select: (...args: any[]) => {
                    mockSelect(...args)
                    return {
                        in: (...inArgs: any[]) => {
                            mockIn(...inArgs)
                            return {
                                neq: (...neqArgs: any[]) => {
                                    mockNeq(...neqArgs)
                                    return {
                                        order: (...orderArgs: any[]) => {
                                            mockOrder(...orderArgs)
                                            return { data: [], error: null }
                                        },
                                    }
                                },
                            }
                        },
                        eq: (...eqArgs: any[]) => {
                            mockEq(...eqArgs)
                            return {
                                single: () => mockSingle(),
                            }
                        },
                    }
                },
                update: (data: any) => {
                    mockUpdate(data)
                    return {
                        eq: () => ({ error: null }),
                    }
                },
                insert: (data: any) => {
                    mockInsert(data)
                    return { error: null }
                },
            }
        },
    },
}))

describe('arService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('allocatePaymentFIFO', () => {
        const baseOrders: IOutstandingOrder[] = [
            {
                id: 'order-1',
                order_number: 'B2B-001',
                customer_id: 'cust-1',
                customer_name: 'John',
                company_name: 'Acme Corp',
                total: 500000,
                paid_amount: 0,
                amount_due: 500000,
                due_date: '2026-01-01',
                order_date: '2025-12-15',
                payment_status: 'unpaid',
                days_overdue: 36,
            },
            {
                id: 'order-2',
                order_number: 'B2B-002',
                customer_id: 'cust-1',
                customer_name: 'John',
                company_name: 'Acme Corp',
                total: 300000,
                paid_amount: 100000,
                amount_due: 200000,
                due_date: '2026-01-15',
                order_date: '2026-01-01',
                payment_status: 'partial',
                days_overdue: 22,
            },
            {
                id: 'order-3',
                order_number: 'B2B-003',
                customer_id: 'cust-1',
                customer_name: 'John',
                company_name: 'Acme Corp',
                total: 400000,
                paid_amount: 0,
                amount_due: 400000,
                due_date: '2026-02-01',
                order_date: '2026-01-10',
                payment_status: 'unpaid',
                days_overdue: 5,
            },
        ]

        it('allocates to oldest order first', () => {
            const result = allocatePaymentFIFO(baseOrders, 300000)

            expect(result.allocations).toHaveLength(1)
            expect(result.allocations[0].orderId).toBe('order-1')
            expect(result.allocations[0].allocatedAmount).toBe(300000)
            expect(result.allocations[0].isFullyPaid).toBe(false)
            expect(result.totalAllocated).toBe(300000)
            expect(result.remainingAmount).toBe(0)
        })

        it('fully pays oldest then allocates remainder to next', () => {
            const result = allocatePaymentFIFO(baseOrders, 600000)

            expect(result.allocations).toHaveLength(2)
            // First order fully paid
            expect(result.allocations[0].orderId).toBe('order-1')
            expect(result.allocations[0].allocatedAmount).toBe(500000)
            expect(result.allocations[0].isFullyPaid).toBe(true)
            // Remainder to second order
            expect(result.allocations[1].orderId).toBe('order-2')
            expect(result.allocations[1].allocatedAmount).toBe(100000)
            expect(result.allocations[1].isFullyPaid).toBe(false)
            expect(result.totalAllocated).toBe(600000)
            expect(result.remainingAmount).toBe(0)
        })

        it('pays all orders and returns remaining', () => {
            const totalDue = 500000 + 200000 + 400000 // 1,100,000
            const result = allocatePaymentFIFO(baseOrders, 1500000)

            expect(result.allocations).toHaveLength(3)
            expect(result.totalAllocated).toBe(totalDue)
            expect(result.remainingAmount).toBe(400000) // 1,500,000 - 1,100,000
            expect(result.allocations[0].isFullyPaid).toBe(true)
            expect(result.allocations[1].isFullyPaid).toBe(true)
            expect(result.allocations[2].isFullyPaid).toBe(true)
        })

        it('handles zero payment amount', () => {
            const result = allocatePaymentFIFO(baseOrders, 0)

            expect(result.allocations).toHaveLength(0)
            expect(result.totalAllocated).toBe(0)
            expect(result.remainingAmount).toBe(0)
        })

        it('handles empty orders array', () => {
            const result = allocatePaymentFIFO([], 100000)

            expect(result.allocations).toHaveLength(0)
            expect(result.totalAllocated).toBe(0)
            expect(result.remainingAmount).toBe(100000)
        })

        it('sorts by order date regardless of input order', () => {
            // Reversed input order
            const reversedOrders = [...baseOrders].reverse()
            const result = allocatePaymentFIFO(reversedOrders, 500000)

            // Should still allocate to order-1 (oldest) first
            expect(result.allocations[0].orderId).toBe('order-1')
            expect(result.allocations[0].allocatedAmount).toBe(500000)
        })

        it('updates newPaidAmount correctly for partial orders', () => {
            const result = allocatePaymentFIFO(baseOrders, 700000)

            // order-2 had paid_amount: 100000, gets 200000 allocated
            const order2Allocation = result.allocations.find(a => a.orderId === 'order-2')
            expect(order2Allocation).toBeDefined()
            expect(order2Allocation!.newPaidAmount).toBe(300000) // 100000 + 200000
            expect(order2Allocation!.isFullyPaid).toBe(true)
        })

        it('exactly matches amount_due for full payment', () => {
            const result = allocatePaymentFIFO(baseOrders, 500000)

            expect(result.allocations[0].allocatedAmount).toBe(500000)
            expect(result.allocations[0].isFullyPaid).toBe(true)
            expect(result.allocations[0].newPaidAmount).toBe(500000) // 0 + 500000
            expect(result.remainingAmount).toBe(0)
        })
    })

    describe('exportOutstandingCSV', () => {
        it('generates valid CSV headers', () => {
            const csv = exportOutstandingCSV([])
            const lines = csv.split('\n')

            expect(lines[0]).toBe(
                'Order Number,Customer,Company,Order Date,Due Date,Total,Paid,Amount Due,Days Overdue,Status'
            )
        })

        it('generates CSV rows with quoted fields', () => {
            const orders: IOutstandingOrder[] = [
                {
                    id: '1',
                    order_number: 'B2B-001',
                    customer_id: 'c1',
                    customer_name: 'Test Customer',
                    company_name: 'Test Corp',
                    total: 500000,
                    paid_amount: 200000,
                    amount_due: 300000,
                    due_date: '2026-01-15',
                    order_date: '2026-01-01',
                    payment_status: 'partial',
                    days_overdue: 22,
                },
            ]

            const csv = exportOutstandingCSV(orders)
            const lines = csv.split('\n')

            expect(lines).toHaveLength(2) // header + 1 row
            expect(lines[1]).toContain('"B2B-001"')
            expect(lines[1]).toContain('"Test Customer"')
            expect(lines[1]).toContain('"Test Corp"')
            expect(lines[1]).toContain('"300000"')
            expect(lines[1]).toContain('"partial"')
        })

        it('handles null company name', () => {
            const orders: IOutstandingOrder[] = [
                {
                    id: '1',
                    order_number: 'B2B-001',
                    customer_id: 'c1',
                    customer_name: 'Solo',
                    company_name: null,
                    total: 100000,
                    paid_amount: 0,
                    amount_due: 100000,
                    due_date: null,
                    order_date: '2026-01-01',
                    payment_status: 'unpaid',
                    days_overdue: 0,
                },
            ]

            const csv = exportOutstandingCSV(orders)
            const lines = csv.split('\n')

            // Company field should be empty string quoted
            expect(lines[1]).toContain('""')
        })

        it('handles multiple orders', () => {
            const orders: IOutstandingOrder[] = [
                {
                    id: '1',
                    order_number: 'B2B-001',
                    customer_id: 'c1',
                    customer_name: 'A',
                    company_name: null,
                    total: 100000,
                    paid_amount: 0,
                    amount_due: 100000,
                    due_date: null,
                    order_date: '2026-01-01',
                    payment_status: 'unpaid',
                    days_overdue: 0,
                },
                {
                    id: '2',
                    order_number: 'B2B-002',
                    customer_id: 'c2',
                    customer_name: 'B',
                    company_name: 'Corp B',
                    total: 200000,
                    paid_amount: 50000,
                    amount_due: 150000,
                    due_date: '2026-01-15',
                    order_date: '2026-01-05',
                    payment_status: 'partial',
                    days_overdue: 22,
                },
            ]

            const csv = exportOutstandingCSV(orders)
            const lines = csv.split('\n')

            expect(lines).toHaveLength(3) // header + 2 rows
        })
    })

    describe('module exports', () => {
        it('exports all expected functions', async () => {
            const mod = await import('../arService')
            expect(typeof mod.getOutstandingOrders).toBe('function')
            expect(typeof mod.generateAgingReport).toBe('function')
            expect(typeof mod.allocatePaymentFIFO).toBe('function')
            expect(typeof mod.applyFIFOPayment).toBe('function')
            expect(typeof mod.exportOutstandingCSV).toBe('function')
            expect(typeof mod.downloadCSV).toBe('function')
        })
    })
})
