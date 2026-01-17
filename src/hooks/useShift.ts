import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export interface PosSession {
    id: string
    session_number: string
    user_id: string
    terminal_id: string | null
    status: 'open' | 'closed' | 'reconciled'
    opened_at: string
    closed_at: string | null
    opening_cash: number
    expected_cash: number
    expected_qris: number
    expected_edc: number
    actual_cash: number | null
    actual_qris: number | null
    actual_edc: number | null
    cash_difference: number | null
    qris_difference: number | null
    edc_difference: number | null
    total_sales: number
    transaction_count: number
    notes: string | null
    closed_by: string | null
    created_at: string
    updated_at: string
}

export interface ShiftTransaction {
    id: string
    order_number: string
    total_amount: number
    payment_method: string
    status: string
    created_at: string
}

export interface ReconciliationData {
    cash: { expected: number; actual: number; difference: number }
    qris: { expected: number; actual: number; difference: number }
    edc: { expected: number; actual: number; difference: number }
}

export interface CloseShiftResult {
    session_id: string
    status: string
    total_sales: number
    transaction_count: number
    reconciliation: ReconciliationData
}

export function useShift() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()
    const [reconciliationData, setReconciliationData] = useState<ReconciliationData | null>(null)

    // Fetch current open session for the user
    const {
        data: currentSession,
        isLoading: isLoadingSession,
        refetch: refetchSession
    } = useQuery({
        queryKey: ['current-shift', user?.id],
        queryFn: async () => {
            if (!user?.id) return null

            const { data, error } = await supabase
                .from('pos_sessions')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'open')
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching session:', error)
                return null
            }

            return data as PosSession | null
        },
        enabled: !!user?.id
    })

    // Fetch transactions for current session
    const {
        data: sessionTransactions = [],
        isLoading: isLoadingTransactions,
        refetch: refetchTransactions
    } = useQuery({
        queryKey: ['shift-transactions', currentSession?.id],
        queryFn: async () => {
            if (!currentSession?.id) return []

            const { data, error } = await supabase
                .from('orders')
                .select('id, order_number, total_amount, payment_method, status, created_at')
                .gte('created_at', currentSession.opened_at)
                .eq('status', 'completed')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching transactions:', error)
                return []
            }

            return data as ShiftTransaction[]
        },
        enabled: !!currentSession?.id
    })

    // Calculate session statistics
    const sessionStats = {
        totalSales: sessionTransactions.reduce((sum, t) => sum + t.total_amount, 0),
        transactionCount: sessionTransactions.length,
        cashTotal: sessionTransactions.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + t.total_amount, 0),
        qrisTotal: sessionTransactions.filter(t => t.payment_method === 'qris').reduce((sum, t) => sum + t.total_amount, 0),
        edcTotal: sessionTransactions.filter(t => ['card', 'edc'].includes(t.payment_method)).reduce((sum, t) => sum + t.total_amount, 0),
        duration: currentSession ? Math.floor((Date.now() - new Date(currentSession.opened_at).getTime()) / 1000 / 60) : 0
    }

    // Open shift mutation
    const openShiftMutation = useMutation({
        mutationFn: async ({ openingCash, terminalId, notes }: {
            openingCash: number
            terminalId?: string
            notes?: string
        }) => {
            if (!user?.id) throw new Error('User not authenticated')

            const { data, error } = await (supabase.rpc as any)('open_shift', {
                p_user_id: user.id,
                p_opening_cash: openingCash,
                p_terminal_id: terminalId || null,
                p_notes: notes || null
            })

            if (error) throw error
            return data
        },
        onSuccess: () => {
            toast.success('Shift ouvert avec succès')
            queryClient.invalidateQueries({ queryKey: ['current-shift'] })
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de l\'ouverture du shift')
        }
    })

    // Close shift mutation
    const closeShiftMutation = useMutation({
        mutationFn: async ({ actualCash, actualQris, actualEdc, notes }: {
            actualCash: number
            actualQris: number
            actualEdc: number
            notes?: string
        }) => {
            if (!currentSession?.id || !user?.id) throw new Error('No active session')

            const { data, error } = await (supabase.rpc as any)('close_shift', {
                p_session_id: currentSession.id,
                p_actual_cash: actualCash,
                p_actual_qris: actualQris,
                p_actual_edc: actualEdc,
                p_closed_by: user.id,
                p_notes: notes || null
            })

            if (error) throw error
            return data as CloseShiftResult
        },
        onSuccess: (data) => {
            toast.success('Shift fermé avec succès')
            setReconciliationData(data.reconciliation)
            queryClient.invalidateQueries({ queryKey: ['current-shift'] })
            queryClient.invalidateQueries({ queryKey: ['shift-transactions'] })
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de la fermeture du shift')
        }
    })

    // Fetch recent closed sessions
    const {
        data: recentSessions = [],
        isLoading: isLoadingHistory
    } = useQuery({
        queryKey: ['shift-history', user?.id],
        queryFn: async () => {
            if (!user?.id) return []

            const { data, error } = await supabase
                .from('pos_sessions')
                .select('*')
                .eq('user_id', user.id)
                .neq('status', 'open')
                .order('closed_at', { ascending: false })
                .limit(10)

            if (error) {
                console.error('Error fetching history:', error)
                return []
            }

            return data as PosSession[]
        },
        enabled: !!user?.id
    })

    const openShift = useCallback((openingCash: number, terminalId?: string, notes?: string) => {
        return openShiftMutation.mutateAsync({ openingCash, terminalId, notes })
    }, [openShiftMutation])

    const closeShift = useCallback((actualCash: number, actualQris: number, actualEdc: number, notes?: string) => {
        return closeShiftMutation.mutateAsync({ actualCash, actualQris, actualEdc, notes })
    }, [closeShiftMutation])

    const clearReconciliation = useCallback(() => {
        setReconciliationData(null)
    }, [])

    return {
        // State
        currentSession,
        hasOpenShift: !!currentSession,
        isLoadingSession,
        sessionTransactions,
        isLoadingTransactions,
        sessionStats,
        recentSessions,
        isLoadingHistory,
        reconciliationData,

        // Actions
        openShift,
        closeShift,
        clearReconciliation,
        refetchSession,
        refetchTransactions,

        // Mutation states
        isOpeningShift: openShiftMutation.isPending,
        isClosingShift: closeShiftMutation.isPending
    }
}
