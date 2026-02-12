import { useState, useCallback } from 'react'
import { useShift, ShiftUser } from '../useShift'
import { logError } from '@/utils/logger'

export interface IUsePOSShiftReturn {
    // Shift state from useShift
    hasOpenShift: boolean
    currentSession: ReturnType<typeof useShift>['currentSession']
    terminalSessions: ReturnType<typeof useShift>['terminalSessions']
    shiftStats: ReturnType<typeof useShift>['sessionStats']
    sessionTransactions: ReturnType<typeof useShift>['sessionTransactions']
    reconciliationData: ReturnType<typeof useShift>['reconciliationData']
    clearReconciliation: ReturnType<typeof useShift>['clearReconciliation']
    isOpeningShift: boolean
    isClosingShift: boolean
    activeShiftUserId: ReturnType<typeof useShift>['activeShiftUserId']

    // Verified user management
    verifiedUser: ShiftUser | null
    setVerifiedUser: (user: ShiftUser | null) => void

    // PIN modal action state
    pinModalAction: 'open' | 'close'
    setPinModalAction: (action: 'open' | 'close') => void

    // Shift recovery state
    isRecoveringShift: boolean

    // Actions
    handlePinVerified: (
        verified: boolean,
        user?: ShiftUser,
        onOpenPinModal?: () => void,
        onOpenShiftModal?: () => void,
        onCloseShiftModal?: () => void
    ) => void
    handleOpenShift: (openingCash: number, terminalId?: string, notes?: string) => Promise<void>
    handleCloseShift: (actualCash: number, actualQris: number, actualEdc: number, notes?: string) => Promise<void>
    handleSwitchShift: (userId: string, onClose?: () => void) => void
    handleRecoverShift: (userId: string, onSuccess?: () => void) => Promise<void>
}

/**
 * Hook to manage POS shift operations
 * Extracts shift logic from POSMainPage for better separation of concerns
 */
export function usePOSShift(): IUsePOSShiftReturn {
    const {
        hasOpenShift,
        currentSession,
        terminalSessions,
        sessionStats: shiftStats,
        sessionTransactions,
        openShift,
        closeShift,
        switchToShift,
        recoverShift,
        reconciliationData,
        clearReconciliation,
        isOpeningShift,
        isClosingShift,
        activeShiftUserId,
    } = useShift()

    // Verified user for shift operations
    const [verifiedUser, setVerifiedUser] = useState<ShiftUser | null>(null)
    const [pinModalAction, setPinModalAction] = useState<'open' | 'close'>('open')
    const [isRecoveringShift, setIsRecoveringShift] = useState(false)

    // Handle PIN verification result
    const handlePinVerified = useCallback((
        verified: boolean,
        user?: ShiftUser,
        onClosePinModal?: () => void,
        onOpenShiftModal?: () => void,
        onCloseShiftModal?: () => void
    ) => {
        if (verified && user) {
            onClosePinModal?.()
            setVerifiedUser(user)
            if (pinModalAction === 'open') {
                onOpenShiftModal?.()
            } else {
                onCloseShiftModal?.()
            }
        }
    }, [pinModalAction])

    // Handle open shift with verified user
    const handleOpenShift = useCallback(async (
        openingCash: number,
        _terminalId?: string,
        notes?: string
    ) => {
        if (!verifiedUser) return
        try {
            await openShift(openingCash, verifiedUser.id, verifiedUser.name, notes)
            setVerifiedUser(null)
        } catch (error) {
            logError('Error opening shift:', error)
            throw error
        }
    }, [verifiedUser, openShift])

    // Handle close shift with verified user
    const handleCloseShift = useCallback(async (
        actualCash: number,
        actualQris: number,
        actualEdc: number,
        notes?: string
    ) => {
        if (!verifiedUser) return
        try {
            await closeShift(actualCash, actualQris, actualEdc, verifiedUser.id, notes)
            setVerifiedUser(null)
        } catch (error) {
            logError('Error closing shift:', error)
            throw error
        }
    }, [verifiedUser, closeShift])

    // Handle shift switch
    const handleSwitchShift = useCallback((userId: string, onClose?: () => void) => {
        switchToShift(userId)
        onClose?.()
    }, [switchToShift])

    // Handle shift recovery
    const handleRecoverShift = useCallback(async (userId: string, onSuccess?: () => void) => {
        setIsRecoveringShift(true)
        try {
            const recovered = await recoverShift(userId)
            if (recovered) {
                onSuccess?.()
            }
        } finally {
            setIsRecoveringShift(false)
        }
    }, [recoverShift])

    return {
        // Shift state
        hasOpenShift,
        currentSession,
        terminalSessions,
        shiftStats,
        sessionTransactions,
        reconciliationData,
        clearReconciliation,
        isOpeningShift,
        isClosingShift,
        activeShiftUserId,

        // Verified user
        verifiedUser,
        setVerifiedUser,

        // PIN action
        pinModalAction,
        setPinModalAction,

        // Recovery
        isRecoveringShift,

        // Actions
        handlePinVerified,
        handleOpenShift,
        handleCloseShift,
        handleSwitchShift,
        handleRecoverShift,
    }
}
