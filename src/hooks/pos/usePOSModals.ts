import { useReducer, useCallback } from 'react'

/**
 * Modal names for the POS system
 */
export type TPOSModalName =
    | 'variant'
    | 'modifier'
    | 'payment'
    | 'heldOrders'
    | 'menu'
    | 'openShift'
    | 'closeShift'
    | 'pin'
    | 'shiftSelector'
    | 'transactionHistory'
    | 'analytics'
    | 'shiftHistory'
    | 'shiftStats'
    | 'noShift'
    | 'combo'

type TModalState = Record<TPOSModalName, boolean>

type TModalAction =
    | { type: 'OPEN'; modal: TPOSModalName }
    | { type: 'CLOSE'; modal: TPOSModalName }
    | { type: 'CLOSE_ALL' }
    | { type: 'SET'; modal: TPOSModalName; value: boolean }

const initialState: TModalState = {
    variant: false,
    modifier: false,
    payment: false,
    heldOrders: false,
    menu: false,
    openShift: false,
    closeShift: false,
    pin: false,
    shiftSelector: false,
    transactionHistory: false,
    analytics: false,
    shiftHistory: false,
    shiftStats: false,
    noShift: false,
    combo: false,
}

function modalReducer(state: TModalState, action: TModalAction): TModalState {
    switch (action.type) {
        case 'OPEN':
            return { ...state, [action.modal]: true }
        case 'CLOSE':
            return { ...state, [action.modal]: false }
        case 'SET':
            return { ...state, [action.modal]: action.value }
        case 'CLOSE_ALL':
            return initialState
        default:
            return state
    }
}

export interface IUsePOSModalsReturn {
    modals: TModalState
    openModal: (modal: TPOSModalName) => void
    closeModal: (modal: TPOSModalName) => void
    toggleModal: (modal: TPOSModalName) => void
    closeAllModals: () => void
    isOpen: (modal: TPOSModalName) => boolean
}

/**
 * Hook to manage all POS modal states with useReducer
 * Consolidates 14+ useState calls into a single reducer
 */
export function usePOSModals(): IUsePOSModalsReturn {
    const [modals, dispatch] = useReducer(modalReducer, initialState)

    const openModal = useCallback((modal: TPOSModalName) => {
        dispatch({ type: 'OPEN', modal })
    }, [])

    const closeModal = useCallback((modal: TPOSModalName) => {
        dispatch({ type: 'CLOSE', modal })
    }, [])

    const toggleModal = useCallback((modal: TPOSModalName) => {
        dispatch({ type: 'SET', modal, value: !modals[modal] })
    }, [modals])

    const closeAllModals = useCallback(() => {
        dispatch({ type: 'CLOSE_ALL' })
    }, [])

    const isOpen = useCallback((modal: TPOSModalName) => modals[modal], [modals])

    return {
        modals,
        openModal,
        closeModal,
        toggleModal,
        closeAllModals,
        isOpen,
    }
}
