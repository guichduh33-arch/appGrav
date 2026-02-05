import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

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
    total: number
    payment_method: string
    status: string
    created_at: string
    staff_id?: string
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

    // Fetch current user's open session using RPC (bypasses RLS)
    const {
        data: currentSession,
        isLoading: isLoadingSession,
        refetch: refetchSession
    } = useQuery({
        queryKey: ['current-shift', activeShiftUserId || user?.id],
        queryFn: async () => {
            const userId = activeShiftUserId || user?.id
            if (!userId) return null

            // Use RPC to bypass RLS
            const { data, error } = await supabase.rpc('get_user_open_shift', {
                p_user_id: userId
            })

            if (error) {
                console.error('Error fetching session:', error)
                return null
            }

            // RPC returns an array, get first element
            const session = Array.isArray(data) ? data[0] : data
            return session as unknown as PosSession | null
        },
        enabled: !!(activeShiftUserId || user?.id)
    })

    // Fetch ALL open sessions on this terminal (multi-user support) using RPC
    const {
        data: terminalSessions = [],
        isLoading: isLoadingTerminalSessions,
        refetch: refetchTerminalSessions
    } = useQuery({
        queryKey: ['terminal-shifts', terminalId],
        queryFn: async () => {
            // Use RPC to bypass RLS
            const { data, error } = await supabase.rpc('get_terminal_open_shifts', {
                p_terminal_id: terminalId
            })

            if (error) {
                console.error('Error fetching terminal sessions:', error)
                return []
            }

            return (data || []) as unknown as PosSession[]
        }
    })

    // Auto-recover shift: check for open sessions on terminal OR for the logged-in user
    useEffect(() => {
        async function autoRecoverShift() {
            const storedUserId = getStoredActiveShiftUserId()

            // If we have terminal sessions, check those first
            if (!isLoadingTerminalSessions && terminalSessions.length > 0) {
                const storedUserHasShift = storedUserId && terminalSessions.some(s => s.user_id === storedUserId)
                if (!storedUserHasShift) {
                    // Auto-select the first open shift on this terminal
                    setActiveShiftUserId(terminalSessions[0].user_id)
                    return
                }
            }

            // If no terminal sessions but we have a logged-in user, check for their shifts using RPC
            if (user?.id && !storedUserId) {
                const { data, error } = await supabase.rpc('get_user_open_shift', {
                    p_user_id: user.id
                })

                if (!error && data) {
                    const userShift = Array.isArray(data) ? data[0] : data
                    if (userShift) {
                        console.log('Auto-recovered shift for logged-in user:', userShift.id)
                        setActiveShiftUserId(user.id)
                    }
                }
            }
        }

        autoRecoverShift()
    }, [terminalSessions, isLoadingTerminalSessions, user?.id])

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
                .select('id, order_number, total, payment_method, status, created_at, staff_id')
                .eq('pos_session_id', currentSession.id)
                .eq('status', 'completed')
                .order('created_at', { ascending: false })

            if (error) {
                // Fallback: query by time range if pos_session_id doesn't exist yet
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('orders')
                    .select('id, order_number, total, payment_method, status, created_at')
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
        totalSales: sessionTransactions.reduce((sum, t) => sum + t.total, 0),
        transactionCount: sessionTransactions.length,
        cashTotal: sessionTransactions.filter(t => t.payment_method === 'cash').reduce((sum, t) => sum + t.total, 0),
        qrisTotal: sessionTransactions.filter(t => t.payment_method === 'qris').reduce((sum, t) => sum + t.total, 0),
        edcTotal: sessionTransactions.filter(t => ['card', 'edc'].includes(t.payment_method)).reduce((sum, t) => sum + t.total, 0),
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
            // FIRST: Check if this user already has an open shift using RPC (bypasses RLS)
            const { data: existingData, error: checkError } = await supabase.rpc('get_user_open_shift', {
                p_user_id: userId
            })

            const existingShift = Array.isArray(existingData) ? existingData[0] : existingData

            if (!checkError && existingShift) {
                // User already has an open shift - recover it
                console.log('Found existing shift for user, recovering:', existingShift.id)
                setActiveShiftUserId(userId)
                return { recovered: true, userName, session: existingShift }
            }

            // No existing shift found, try to open a new one
            const { data, error } = await supabase.rpc('open_shift', {
                p_user_id: userId,
                p_opening_cash: openingCash,
                p_terminal_id: terminalId,
                p_notes: notes ?? undefined
            })

            if (error) {
                console.error('Error opening shift:', error.message)
                // If RPC fails for any reason, try one more time to find existing shift using RPC
                const { data: retryData } = await supabase.rpc('get_user_open_shift', {
                    p_user_id: userId
                })

                const retryShift = Array.isArray(retryData) ? retryData[0] : retryData

                if (retryShift) {
                    console.log('Found existing shift on retry:', retryShift.id)
                    setActiveShiftUserId(userId)
                    return { recovered: true, userName, session: retryShift }
                }
                throw error
            }

            // Set the active shift user
            setActiveShiftUserId(userId)

            return { ...(data as unknown as Record<string, unknown>), userName, recovered: false }
        },
        onSuccess: (data) => {
            if (data.recovered) {
                toast.success(`Shift récupéré pour ${data.userName}`)
            } else {
                toast.success(`Shift ouvert pour ${data.userName}`)
            }
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
                .eq('terminal_id_str', terminalId)
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

    // Manual recovery: find and activate any open shift for a user using RPC (bypasses RLS)
    const recoverShift = useCallback(async (userId: string) => {
        console.log('Attempting to recover shift for user:', userId)

        const { data, error } = await supabase.rpc('get_user_open_shift', {
            p_user_id: userId
        })

        console.log('Recovery RPC result:', { data, error })

        if (error) {
            console.error('Error recovering shift:', error)
            // Show more specific error message
            if (error.message?.includes('function') || error.code === '42883') {
                toast.error('Fonction RPC manquante - appliquez la migration SQL')
            } else {
                toast.error(`Erreur: ${error.message || 'Récupération impossible'}`)
            }
            return null
        }

        const existingShift = Array.isArray(data) ? data[0] : data

        if (existingShift) {
            setActiveShiftUserId(userId)
            queryClient.invalidateQueries({ queryKey: ['current-shift'] })
            queryClient.invalidateQueries({ queryKey: ['terminal-shifts'] })
            toast.success('Shift récupéré')
            return existingShift
        }

        // No shift found - show info message
        toast.error('Aucun shift ouvert trouvé pour cet utilisateur')
        return null
    }, [queryClient])

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
        recoverShift,
        clearReconciliation,
        refetchSession,
        refetchTransactions,
        refetchTerminalSessions,

        // Mutation states
        isOpeningShift: openShiftMutation.isPending,
        isClosingShift: closeShiftMutation.isPending
    }
}
