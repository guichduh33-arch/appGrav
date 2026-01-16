import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '../types/database'

interface AuthState {
    user: UserProfile | null
    isAuthenticated: boolean
    sessionId: string | null

    // Actions
    login: (user: UserProfile) => void
    logout: () => void
    setSession: (sessionId: string | null) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            sessionId: null,

            login: (user) => set({
                user,
                isAuthenticated: true
            }),

            logout: () => set({
                user: null,
                isAuthenticated: false,
                sessionId: null
            }),

            setSession: (sessionId) => set({ sessionId }),
        }),
        {
            name: 'breakery-auth',
        }
    )
)
