import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types/database';
import type { Role, EffectivePermission } from '../types/auth';
import { authService } from '../services/authService';
import { offlineAuthService } from '../services/offline/offlineAuthService';

// Session storage keys
const SESSION_TOKEN_KEY = 'breakery-session-token';

/**
 * Minimal user data for offline session
 * Used when full UserProfile is not available
 */
interface IOfflineUserData {
  id: string;
  display_name: string | null;
  preferred_language: 'fr' | 'en' | 'id';
}

interface IAuthState {
  // User data
  user: UserProfile | null;
  roles: Role[];
  permissions: EffectivePermission[];

  // Session state
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
  sessionToken: string | null;

  // Offline session state (Story 1.2)
  isOfflineSession: boolean;

  // Actions
  loginWithPin: (userId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  setLoading: (isLoading: boolean) => void;

  // Offline session actions (Story 1.2)
  setOfflineSession: (
    userData: IOfflineUserData,
    roles: Role[],
    permissions: EffectivePermission[]
  ) => void;

  // Legacy support
  login: (user: UserProfile) => void;
  setSession: (sessionId: string | null) => void;
}

export const useAuthStore = create<IAuthState>()(
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
      isOfflineSession: false,

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
          console.debug('[auth] Login successful:', {
            userId: response.user?.id,
            roles: response.roles?.map(r => r.code),
            permissionsCount: response.permissions?.length
          });

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

        // Clear state including offline session flag (Story 1.2)
        set({
          user: null,
          roles: [],
          permissions: [],
          isAuthenticated: false,
          isLoading: false,
          sessionId: null,
          sessionToken: null,
          isOfflineSession: false,
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
          console.debug('[auth] Session refreshed:', {
            userId: response.user?.id,
            roles: response.roles?.map(r => r.code),
            permissionsCount: response.permissions?.length
          });

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

      /**
       * Set offline session (Story 1.2)
       *
       * Called when user authenticates offline using cached credentials.
       * Creates a local session without server validation.
       */
      setOfflineSession: (
        userData: IOfflineUserData,
        roles: Role[],
        permissions: EffectivePermission[]
      ) => {
        // Build a minimal UserProfile from cached data
        // Using 'as UserProfile' since we're constructing from offline cache
        // with only the essential fields needed for the UI
        const offlineUser = {
          id: userData.id,
          name: userData.display_name || 'User', // Required field
          display_name: userData.display_name,
          preferred_language: userData.preferred_language,
          // Required fields with defaults
          role: 'cashier' as const, // Default role for offline - actual roles are in the roles array
          is_active: true,
          can_apply_discount: false,
          can_cancel_order: false,
          can_access_reports: false,
          // Nullable fields
          auth_user_id: null,
          phone: null,
          pin_hash: null, // Never expose PIN hash in session
          pin_code: null,
          avatar_url: null,
          employee_code: null,
          first_name: null,
          last_name: null,
          timezone: 'Asia/Makassar',
          last_login_at: null,
          failed_login_attempts: 0,
          locked_until: null,
          password_changed_at: null,
          must_change_password: false,
          created_by: null,
          updated_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserProfile;

        set({
          user: offlineUser,
          roles,
          permissions,
          isAuthenticated: true,
          isOfflineSession: true,
          isLoading: false,
          // No server session in offline mode
          sessionId: null,
          sessionToken: null,
        });

        console.debug('[authStore] Offline session created for user:', userData.id);
      },

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
        isOfflineSession: state.isOfflineSession,
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

export const selectIsAdmin = (state: IAuthState) =>
  state.roles.some(r => ['SUPER_ADMIN', 'ADMIN'].includes(r.code));

export const selectIsSuperAdmin = (state: IAuthState) =>
  state.roles.some(r => r.code === 'SUPER_ADMIN');

export const selectIsManager = (state: IAuthState) =>
  state.roles.some(r => ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(r.code));

export const selectPrimaryRole = (state: IAuthState) => {
  if (state.roles.length === 0) return null;
  return state.roles.reduce((highest, current) =>
    (current.hierarchy_level || 0) > (highest.hierarchy_level || 0) ? current : highest
  );
};

export const selectHasPermission = (code: string) => (state: IAuthState) => {
  const perm = state.permissions.find(p => p.permission_code === code);
  return perm?.is_granted ?? false;
};
