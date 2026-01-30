import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types/database';
import type { Role, EffectivePermission } from '../types/auth';
import { authService } from '../services/authService';
import { offlineAuthService } from '../services/offline/offlineAuthService';

// Session storage keys
const SESSION_TOKEN_KEY = 'breakery-session-token';

interface AuthState {
  // User data
  user: UserProfile | null;
  roles: Role[];
  permissions: EffectivePermission[];

  // Session state
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
  sessionToken: string | null;

  // Actions
  loginWithPin: (userId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setLoading: (isLoading: boolean) => void;

  // Legacy support
  login: (user: UserProfile) => void;
  setSession: (sessionId: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      sessionId: null,
      sessionToken: null,

      /**
       * Login with PIN using the new auth system
       */
      loginWithPin: async (userId: string, pin: string) => {
        set({ isLoading: true });

        try {
          const response = await authService.loginWithPin(userId, pin);

          if (!response.success) {
            set({ isLoading: false });
            return { success: false, error: response.error };
          }

          // Store session token in sessionStorage (not persisted)
          if (response.session?.token) {
            sessionStorage.setItem(SESSION_TOKEN_KEY, response.session.token);
          }

          // Update state with user data
          set({
            user: response.user as UserProfile,
            roles: response.roles || [],
            permissions: response.permissions || [],
            isAuthenticated: true,
            isLoading: false,
            sessionId: response.session?.id || null,
            sessionToken: response.session?.token || null,
          });

          // Cache user credentials for offline authentication (Story 1.1)
          // This enables PIN login when internet is unavailable
          if (response.user) {
            await offlineAuthService.cacheUserCredentials(
              response.user,
              response.roles || [],
              response.permissions || []
            );
          }

          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return { success: false, error: 'Login failed' };
        }
      },

      /**
       * Logout - end session and clear state
       */
      logout: async () => {
        const { sessionId, user } = get();

        // Call logout API if we have a session
        if (sessionId && user?.id) {
          try {
            await authService.logout(sessionId, user.id);
          } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local logout even if API fails
          }
        }

        // Clear offline cache for security (Story 1.1)
        if (user?.id) {
          await offlineAuthService.clearUserCache(user.id);
        }

        // Clear session token from storage
        sessionStorage.removeItem(SESSION_TOKEN_KEY);

        // Clear state
        set({
          user: null,
          roles: [],
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
          sessionId: null,
          sessionToken: null,
        });
      },

      /**
       * Refresh session - validate and update user data
       */
      refreshSession: async () => {
        const sessionToken = get().sessionToken || sessionStorage.getItem(SESSION_TOKEN_KEY);

        if (!sessionToken) {
          return false;
        }

        set({ isLoading: true });

        try {
          const response = await authService.validateSession(sessionToken);

          if (!response.valid) {
            // Session is invalid - logout
            await get().logout();
            return false;
          }

          // Update state with fresh data
          set({
            user: response.user as UserProfile,
            roles: response.roles || [],
            permissions: response.permissions || [],
            isAuthenticated: true,
            isLoading: false,
            sessionId: response.session?.id || get().sessionId,
          });

          // Refresh offline cache with updated credentials (Story 1.1)
          if (response.user) {
            await offlineAuthService.cacheUserCredentials(
              response.user,
              response.roles || [],
              response.permissions || []
            );
          }

          return true;
        } catch (error) {
          console.error('Session refresh error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading: boolean) => set({ isLoading }),

      // ========================================
      // Legacy support methods
      // ========================================

      /**
       * @deprecated Use loginWithPin instead
       */
      login: (user: UserProfile) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      /**
       * @deprecated Session is now managed automatically
       */
      setSession: (sessionId: string | null) => set({ sessionId }),
    }),
    {
      name: 'breakery-auth',
      // Only persist essential data, not session token (security)
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        sessionId: state.sessionId,
      }),
    }
  )
);

// ========================================
// Session validation on app start
// ========================================

/**
 * Initialize auth state on app load
 * Call this in your App component or root layout
 */
export async function initializeAuth(): Promise<boolean> {
  const store = useAuthStore.getState();

  // If already authenticated, validate the session
  if (store.isAuthenticated && store.sessionId) {
    return store.refreshSession();
  }

  // Check for session token in storage
  const sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (sessionToken) {
    useAuthStore.setState({ sessionToken });
    return store.refreshSession();
  }

  return false;
}

// ========================================
// Selectors for common checks
// ========================================

export const selectIsAdmin = (state: AuthState) =>
  state.roles.some(r => ['SUPER_ADMIN', 'ADMIN'].includes(r.code));

export const selectIsSuperAdmin = (state: AuthState) =>
  state.roles.some(r => r.code === 'SUPER_ADMIN');

export const selectIsManager = (state: AuthState) =>
  state.roles.some(r => ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(r.code));

export const selectPrimaryRole = (state: AuthState) => {
  if (state.roles.length === 0) return null;
  return state.roles.reduce((highest, current) =>
    (current.hierarchy_level || 0) > (highest.hierarchy_level || 0) ? current : highest
  );
};

export const selectHasPermission = (code: string) => (state: AuthState) => {
  const perm = state.permissions.find(p => p.permission_code === code);
  return perm?.is_granted ?? false;
};
