import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export interface PosSession {
    id: string
    session_number: string
    user_id: string
    user_name?: string
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
    cashier_id?: string
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

export interface ShiftUser {
    id: string
    name: string
    role: string
}

// Get or generate a terminal ID for this browser/device
function getTerminalId(): string {
    let terminalId = localStorage.getItem('pos_terminal_id')
    if (!terminalId) {
        terminalId = `TERM-${Date.now().toString(36).toUpperCase()}`
        localStorage.setItem('pos_terminal_id', terminalId)
    }
    return terminalId
}

// Get or set active shift user ID from localStorage
function getStoredActiveShiftUserId(): string | null {
    return localStorage.getItem('pos_active_shift_user_id')
}

function setStoredActiveShiftUserId(userId: string | null) {
    if (userId) {
        localStorage.setItem('pos_active_shift_user_id', userId)
    } else {
        localStorage.removeItem('pos_active_shift_user_id')
    }
}

export function useShift() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()
    const [reconciliationData, setReconciliationData] = useState<ReconciliationData | null>(null)
    const [activeShiftUserId, setActiveShiftUserIdState] = useState<string | null>(getStoredActiveShiftUserId())

    // Wrapper to persist activeShiftUserId
    const setActiveShiftUserId = (userId: string | null) => {
        setActiveShiftUserIdState(userId)
        setStoredActiveShiftUserId(userId)
    }

    const terminalId = getTerminalId()

    // Fetch current user's open session
    const {
        data: currentSession,
        isLoading: isLoadingSession,
        refetch: refetchSession
    } = useQuery({
        queryKey: ['current-shift', activeShiftUserId || user?.id],
        queryFn: async () => {
            const userId = activeShiftUserId || user?.id
            if (!userId) return null

            const { data, error } = await supabase
                .from('pos_sessions')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'open')
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching session:', error)
                return null
            }

            return data as PosSession | null
        },
        enabled: !!(activeShiftUserId || user?.id)
    })

    // Fetch ALL open sessions on this terminal (multi-user support)
    const {
        data: terminalSessions = [],
        isLoading: isLoadingTerminalSessions,
        refetch: refetchTerminalSessions
    } = useQuery({
        queryKey: ['terminal-shifts', terminalId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pos_sessions')
                .select('*')
                .eq('terminal_id', terminalId)
                .eq('status', 'open')
                .order('opened_at', { ascending: false })

            if (error) {
                console.error('Error fetching terminal sessions:', error)
                return []
            }

            return data as unknown as PosSession[]
        }
    })

    // Auto-recover shift: if no active shift but there are open sessions on terminal, select the first one
    useEffect(() => {
        if (!isLoadingTerminalSessions && terminalSessions.length > 0) {
            const storedUserId = getStoredActiveShiftUserId()

            // Check if stored user has an open shift
            const storedUserHasShift = storedUserId && terminalSessions.some(s => s.user_id === storedUserId)

            if (!storedUserHasShift) {
                // Auto-select the first open shift on this terminal
                setActiveShiftUserId(terminalSessions[0].user_id)
            }
        }
    }, [terminalSessions, isLoadingTerminalSessions])

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
                .select('id, order_number, total_amount, payment_method, status, created_at, cashier_id')
                .eq('pos_session_id', currentSession.id)
                .eq('status', 'completed')
                .order('created_at', { ascending: false })

            if (error) {
                // Fallback: query by time range if pos_session_id doesn't exist yet
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('orders')
                    .select('id, order_number, total_amount, payment_method, status, created_at')
                    .gte('created_at', currentSession.opened_at)
                    .eq('status', 'completed')
                    .order('created_at', { ascending: false })

                if (fallbackError) {
                    console.error('Error fetching transactions:', fallbackError)
                    return []
                }
                return fallbackData as unknown as ShiftTransaction[]
            }

            return data as unknown as ShiftTransaction[]
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

    // Open shift mutation - now accepts a specific user
    const openShiftMutation = useMutation({
        mutationFn: async ({ openingCash, userId, userName, notes }: {
            openingCash: number
            userId: string
            userName: string
            notes?: string
        }) => {
            // Check if this user already has an open shift
            const { data: existingShift } = await supabase
                .from('pos_sessions')
                .select('id')
                .eq('user_id', userId)
                .eq('status', 'open')
                .single()

            if (existingShift) {
                throw new Error(`${userName} a déjà un shift ouvert`)
            }

            const { data, error } = await supabase.rpc('open_shift', {
                p_user_id: userId,
                p_opening_cash: openingCash,
                p_terminal_id: terminalId,
                p_notes: notes ?? undefined
            })

            if (error) throw error

            // Set the active shift user
            setActiveShiftUserId(userId)

            return { ...(data as object), userName }
        },
        onSuccess: (data) => {
            toast.success(`Shift ouvert pour ${data.userName}`)
            queryClient.invalidateQueries({ queryKey: ['current-shift'] })
            queryClient.invalidateQueries({ queryKey: ['terminal-shifts'] })
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erreur lors de l\'ouverture du shift')
        }
    })

    // Close shift mutation
    const closeShiftMutation = useMutation({
        mutationFn: async ({ sessionId, actualCash, actualQris, actualEdc, closedBy, notes }: {
            sessionId: string
            actualCash: number
            actualQris: number
            actualEdc: number
            closedBy: string
            notes?: string
        }) => {
            const { data, error } = await supabase.rpc('close_shift', {
                p_session_id: sessionId,
                p_actual_cash: actualCash,
                p_actual_qris: actualQris,
                p_actual_edc: actualEdc,
                p_closed_by: closedBy,
                p_notes: notes ?? undefined
            })

            if (error) throw error
            return data as unknown as CloseShiftResult
        },
        onSuccess: (data) => {
            toast.success('Shift fermé avec succès')
            setReconciliationData(data.reconciliation)
            setActiveShiftUserId(null)
            queryClient.invalidateQueries({ queryKey: ['current-shift'] })
            queryClient.invalidateQueries({ queryKey: ['terminal-shifts'] })
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
        queryKey: ['shift-history', terminalId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pos_sessions')
                .select('*')
                .eq('terminal_id', terminalId)
                .neq('status', 'open')
                .order('closed_at', { ascending: false })
                .limit(10)

            if (error) {
                console.error('Error fetching history:', error)
                return []
            }

            return data as unknown as PosSession[]
        }
    })

    // Open shift for a specific user (after PIN verification)
    const openShift = useCallback((openingCash: number, userId: string, userName: string, notes?: string) => {
        return openShiftMutation.mutateAsync({ openingCash, userId, userName, notes })
    }, [openShiftMutation])

    // Close shift
    const closeShift = useCallback((actualCash: number, actualQris: number, actualEdc: number, closedBy: string, notes?: string) => {
        if (!currentSession?.id) throw new Error('No active session')
        return closeShiftMutation.mutateAsync({
            sessionId: currentSession.id,
            actualCash,
            actualQris,
            actualEdc,
            closedBy,
            notes
        })
    }, [closeShiftMutation, currentSession])

    // Switch to a different user's shift on this terminal
    const switchToShift = useCallback((userId: string) => {
        setActiveShiftUserId(userId)
    }, [])

    const clearReconciliation = useCallback(() => {
        setReconciliationData(null)
    }, [])

    return {
        // State
        currentSession,
        hasOpenShift: !!currentSession,
        isLoadingSession,
        terminalSessions,
        isLoadingTerminalSessions,
        terminalId,
        activeShiftUserId,
        sessionTransactions,
        isLoadingTransactions,
        sessionStats,
        recentSessions,
        isLoadingHistory,
        reconciliationData,

        // Actions
        openShift,
        closeShift,
        switchToShift,
        clearReconciliation,
        refetchSession,
        refetchTransactions,
        refetchTerminalSessions,

        // Mutation states
        isOpeningShift: openShiftMutation.isPending,
        isClosingShift: closeShiftMutation.isPending
    }
}
