/**
 * AuthStore Tests
 *
 * Comprehensive tests for the Zustand auth store covering:
 * - Initial state values
 * - loginWithPin (success, failure, error handling, offline caching)
 * - logout (with/without session, API failure, offline cache clear)
 * - refreshSession (valid, invalid, no token, error handling)
 * - setLoading
 * - setOfflineSession (offline auth state transitions)
 * - Legacy support: login, setSession
 * - Selectors: selectIsAdmin, selectIsSuperAdmin, selectIsManager, selectPrimaryRole, selectHasPermission
 * - initializeAuth (session validation on app start)
 * - Persistence (partialize behavior)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useAuthStore,
  initializeAuth,
  selectIsAdmin,
  selectIsSuperAdmin,
  selectIsManager,
  selectPrimaryRole,
  selectHasPermission,
} from '@/stores/authStore';
import type { UserProfile } from '@/types/database';
import type { Role, EffectivePermission } from '@/types/auth';

// =====================================================
// Mocks
// =====================================================

const mockLoginWithPin = vi.fn();
const mockLogout = vi.fn();
const mockValidateSession = vi.fn();

vi.mock('@/services/authService', () => ({
  authService: {
    loginWithPin: (...args: unknown[]) => mockLoginWithPin(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
    validateSession: (...args: unknown[]) => mockValidateSession(...args),
  },
}));

const mockCacheUserCredentials = vi.fn();
const mockClearUserCache = vi.fn();

vi.mock('@/services/offline/offlineAuthService', () => ({
  offlineAuthService: {
    cacheUserCredentials: (...args: unknown[]) => mockCacheUserCredentials(...args),
    clearUserCache: (...args: unknown[]) => mockClearUserCache(...args),
  },
}));

// =====================================================
// Test Fixtures
// =====================================================

function makeUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user-001',
    name: 'Test User',
    display_name: 'Test',
    role: 'cashier',
    is_active: true,
    can_apply_discount: false,
    can_cancel_order: false,
    can_access_reports: false,
    auth_user_id: null,
    phone: null,
    pin_hash: null,
    pin_code: null,
    avatar_url: null,
    employee_code: 'EMP001',
    first_name: 'Test',
    last_name: 'User',
    email: null,
    preferred_language: 'en',
    timezone: 'Asia/Makassar',
    last_login_at: null,
    failed_login_attempts: 0,
    locked_until: null,
    password_changed_at: null,
    must_change_password: false,
    created_by: null,
    updated_by: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as UserProfile;
}

function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: 'role-001',
    code: 'CASHIER',
    name_fr: 'Caissier',
    name_en: 'Cashier',
    name_id: 'Kasir',
    description: null,
    is_system: true,
    is_active: true,
    hierarchy_level: 10,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makePermission(overrides: Partial<EffectivePermission> = {}): EffectivePermission {
  return {
    permission_code: 'sales.view',
    permission_module: 'sales',
    permission_action: 'view',
    is_granted: true,
    source: 'role',
    is_sensitive: false,
    ...overrides,
  };
}

// =====================================================
// Reset Helpers
// =====================================================

const initialState = {
  user: null,
  roles: [],
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  sessionId: null,
  sessionToken: null,
  isOfflineSession: false,
};

// =====================================================
// Tests
// =====================================================

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState(initialState);

    // Clear mocks
    vi.clearAllMocks();

    // Clear sessionStorage
    sessionStorage.clear();
  });

  // ===========================================
  // Initial state
  // ===========================================
  describe('initial state', () => {
    it('should have null user', () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should have empty roles array', () => {
      expect(useAuthStore.getState().roles).toEqual([]);
    });

    it('should have empty permissions array', () => {
      expect(useAuthStore.getState().permissions).toEqual([]);
    });

    it('should not be authenticated', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should not be loading', () => {
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should have null sessionId', () => {
      expect(useAuthStore.getState().sessionId).toBeNull();
    });

    it('should have null sessionToken', () => {
      expect(useAuthStore.getState().sessionToken).toBeNull();
    });

    it('should not be an offline session', () => {
      expect(useAuthStore.getState().isOfflineSession).toBe(false);
    });
  });

  // ===========================================
  // loginWithPin
  // ===========================================
  describe('loginWithPin', () => {
    it('should set isLoading to true during login', async () => {
      // Use a deferred promise to control timing
      let resolveLogin!: (value: unknown) => void;
      mockLoginWithPin.mockReturnValue(
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
      );

      const loginPromise = useAuthStore.getState().loginWithPin('user-001', '1234');

      // While waiting, isLoading should be true
      expect(useAuthStore.getState().isLoading).toBe(true);

      // Resolve and clean up
      resolveLogin({ success: false, error: 'test' });
      await loginPromise;
    });

    it('should authenticate user on successful login', async () => {
      const user = makeUserProfile();
      const roles = [makeRole()];
      const permissions = [makePermission()];

      mockLoginWithPin.mockResolvedValue({
        success: true,
        user,
        session: { id: 'sess-001', token: 'token-abc' },
        roles,
        permissions,
      });

      const result = await useAuthStore.getState().loginWithPin('user-001', '1234');

      expect(result).toEqual({ success: true });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.roles).toEqual(roles);
      expect(state.permissions).toEqual(permissions);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.sessionId).toBe('sess-001');
      expect(state.sessionToken).toBe('token-abc');
    });

    it('should store session token in sessionStorage', async () => {
      mockLoginWithPin.mockResolvedValue({
        success: true,
        user: makeUserProfile(),
        session: { id: 'sess-001', token: 'token-xyz' },
        roles: [],
        permissions: [],
      });

      await useAuthStore.getState().loginWithPin('user-001', '1234');

      expect(sessionStorage.getItem('breakery-session-token')).toBe('token-xyz');
    });

    it('should cache user credentials for offline auth on success', async () => {
      const user = makeUserProfile();
      const roles = [makeRole()];
      const permissions = [makePermission()];

      mockLoginWithPin.mockResolvedValue({
        success: true,
        user,
        session: { id: 'sess-001', token: 'token-abc' },
        roles,
        permissions,
      });

      await useAuthStore.getState().loginWithPin('user-001', '1234');

      expect(mockCacheUserCredentials).toHaveBeenCalledWith(user, roles, permissions);
    });

    it('should not cache credentials when user is null on success', async () => {
      mockLoginWithPin.mockResolvedValue({
        success: true,
        user: null,
        session: { id: 'sess-001', token: 'token-abc' },
        roles: [],
        permissions: [],
      });

      await useAuthStore.getState().loginWithPin('user-001', '1234');

      expect(mockCacheUserCredentials).not.toHaveBeenCalled();
    });

    it('should return error on failed login', async () => {
      mockLoginWithPin.mockResolvedValue({
        success: false,
        error: 'Invalid PIN',
      });

      const result = await useAuthStore.getState().loginWithPin('user-001', '9999');

      expect(result).toEqual({ success: false, error: 'Invalid PIN' });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
    });

    it('should handle network errors during login', async () => {
      mockLoginWithPin.mockRejectedValue(new Error('Network error'));

      const result = await useAuthStore.getState().loginWithPin('user-001', '1234');

      expect(result).toEqual({ success: false, error: 'Login failed' });
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should handle missing session in response', async () => {
      mockLoginWithPin.mockResolvedValue({
        success: true,
        user: makeUserProfile(),
        roles: [],
        permissions: [],
        // session is undefined
      });

      await useAuthStore.getState().loginWithPin('user-001', '1234');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.sessionId).toBeNull();
      expect(state.sessionToken).toBeNull();
    });

    it('should handle missing roles and permissions in response', async () => {
      mockLoginWithPin.mockResolvedValue({
        success: true,
        user: makeUserProfile(),
        session: { id: 'sess-001', token: 'token-abc' },
        // roles and permissions are undefined
      });

      await useAuthStore.getState().loginWithPin('user-001', '1234');

      const state = useAuthStore.getState();
      expect(state.roles).toEqual([]);
      expect(state.permissions).toEqual([]);
    });
  });

  // ===========================================
  // logout
  // ===========================================
  describe('logout', () => {
    beforeEach(async () => {
      // Pre-populate with an authenticated session
      useAuthStore.setState({
        user: makeUserProfile(),
        roles: [makeRole()],
        permissions: [makePermission()],
        isAuthenticated: true,
        sessionId: 'sess-001',
        sessionToken: 'token-abc',
        isOfflineSession: false,
      });
      sessionStorage.setItem('breakery-session-token', 'token-abc');
      mockLogout.mockResolvedValue({ success: true });
      mockClearUserCache.mockResolvedValue(undefined);
    });

    it('should clear all auth state', async () => {
      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.roles).toEqual([]);
      expect(state.permissions).toEqual([]);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.sessionId).toBeNull();
      expect(state.sessionToken).toBeNull();
      expect(state.isOfflineSession).toBe(false);
    });

    it('should call authService.logout with session and user', async () => {
      await useAuthStore.getState().logout();

      expect(mockLogout).toHaveBeenCalledWith('sess-001', 'user-001');
    });

    it('should clear offline cache for the user', async () => {
      await useAuthStore.getState().logout();

      expect(mockClearUserCache).toHaveBeenCalledWith('user-001');
    });

    it('should remove session token from sessionStorage', async () => {
      await useAuthStore.getState().logout();

      expect(sessionStorage.getItem('breakery-session-token')).toBeNull();
    });

    it('should still clear state if API logout fails', async () => {
      mockLogout.mockRejectedValue(new Error('API Error'));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('should skip API logout if no sessionId', async () => {
      useAuthStore.setState({ sessionId: null });

      await useAuthStore.getState().logout();

      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should skip API logout if no user', async () => {
      useAuthStore.setState({ user: null });

      await useAuthStore.getState().logout();

      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should skip clearing offline cache if no user', async () => {
      useAuthStore.setState({ user: null });

      await useAuthStore.getState().logout();

      expect(mockClearUserCache).not.toHaveBeenCalled();
    });

    it('should clear isOfflineSession flag on logout', async () => {
      useAuthStore.setState({ isOfflineSession: true });

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().isOfflineSession).toBe(false);
    });
  });

  // ===========================================
  // refreshSession
  // ===========================================
  describe('refreshSession', () => {
    it('should return false when no session token exists', async () => {
      useAuthStore.setState({ sessionToken: null });
      sessionStorage.removeItem('breakery-session-token');

      const result = await useAuthStore.getState().refreshSession();

      expect(result).toBe(false);
      expect(mockValidateSession).not.toHaveBeenCalled();
    });

    it('should use sessionToken from state', async () => {
      useAuthStore.setState({ sessionToken: 'state-token' });
      mockValidateSession.mockResolvedValue({ valid: true, user: makeUserProfile(), roles: [], permissions: [] });

      await useAuthStore.getState().refreshSession();

      expect(mockValidateSession).toHaveBeenCalledWith('state-token');
    });

    it('should fall back to sessionStorage token', async () => {
      useAuthStore.setState({ sessionToken: null });
      sessionStorage.setItem('breakery-session-token', 'storage-token');
      mockValidateSession.mockResolvedValue({ valid: true, user: makeUserProfile(), roles: [], permissions: [] });

      await useAuthStore.getState().refreshSession();

      expect(mockValidateSession).toHaveBeenCalledWith('storage-token');
    });

    it('should update state on valid session', async () => {
      const user = makeUserProfile({ id: 'user-refreshed' });
      const roles = [makeRole({ code: 'ADMIN', hierarchy_level: 90 })];
      const permissions = [makePermission({ permission_code: 'admin.roles' })];

      useAuthStore.setState({ sessionToken: 'valid-token', sessionId: 'old-sess' });

      mockValidateSession.mockResolvedValue({
        valid: true,
        user,
        session: { id: 'new-sess' },
        roles,
        permissions,
      });

      const result = await useAuthStore.getState().refreshSession();

      expect(result).toBe(true);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.roles).toEqual(roles);
      expect(state.permissions).toEqual(permissions);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.sessionId).toBe('new-sess');
    });

    it('should keep existing sessionId if response has no session', async () => {
      useAuthStore.setState({ sessionToken: 'valid-token', sessionId: 'existing-sess' });

      mockValidateSession.mockResolvedValue({
        valid: true,
        user: makeUserProfile(),
        roles: [],
        permissions: [],
        // no session in response
      });

      await useAuthStore.getState().refreshSession();

      expect(useAuthStore.getState().sessionId).toBe('existing-sess');
    });

    it('should cache updated credentials for offline auth', async () => {
      const user = makeUserProfile();
      const roles = [makeRole()];
      const permissions = [makePermission()];

      useAuthStore.setState({ sessionToken: 'valid-token' });
      mockValidateSession.mockResolvedValue({ valid: true, user, roles, permissions });

      await useAuthStore.getState().refreshSession();

      expect(mockCacheUserCredentials).toHaveBeenCalledWith(user, roles, permissions);
    });

    it('should not cache when user is missing from response', async () => {
      useAuthStore.setState({ sessionToken: 'valid-token' });
      mockValidateSession.mockResolvedValue({ valid: true, roles: [], permissions: [] });

      await useAuthStore.getState().refreshSession();

      expect(mockCacheUserCredentials).not.toHaveBeenCalled();
    });

    it('should logout on invalid session', async () => {
      useAuthStore.setState({
        sessionToken: 'expired-token',
        user: makeUserProfile(),
        isAuthenticated: true,
        sessionId: 'sess-001',
      });

      mockValidateSession.mockResolvedValue({ valid: false });
      mockLogout.mockResolvedValue({ success: true });
      mockClearUserCache.mockResolvedValue(undefined);

      const result = await useAuthStore.getState().refreshSession();

      expect(result).toBe(false);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('should return false on network error', async () => {
      useAuthStore.setState({ sessionToken: 'some-token' });
      mockValidateSession.mockRejectedValue(new Error('Network error'));

      const result = await useAuthStore.getState().refreshSession();

      expect(result).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set isLoading to true during refresh', async () => {
      let resolveValidation!: (value: unknown) => void;
      mockValidateSession.mockReturnValue(
        new Promise((resolve) => {
          resolveValidation = resolve;
        })
      );

      useAuthStore.setState({ sessionToken: 'some-token' });
      const refreshPromise = useAuthStore.getState().refreshSession();

      expect(useAuthStore.getState().isLoading).toBe(true);

      resolveValidation({ valid: false });
      // Need to mock logout for the invalid session path
      mockLogout.mockResolvedValue({ success: true });
      mockClearUserCache.mockResolvedValue(undefined);
      await refreshPromise;
    });
  });

  // ===========================================
  // setLoading
  // ===========================================
  describe('setLoading', () => {
    it('should set isLoading to true', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('should set isLoading to false', () => {
      useAuthStore.setState({ isLoading: true });
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  // ===========================================
  // setOfflineSession
  // ===========================================
  describe('setOfflineSession', () => {
    it('should create an offline session with user data', () => {
      const roles = [makeRole({ code: 'CASHIER' })];
      const permissions = [makePermission({ permission_code: 'sales.create' })];

      useAuthStore.getState().setOfflineSession(
        { id: 'offline-user-001', display_name: 'Offline User', preferred_language: 'en' },
        roles,
        permissions
      );

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isOfflineSession).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.roles).toEqual(roles);
      expect(state.permissions).toEqual(permissions);
    });

    it('should build a UserProfile from offline data', () => {
      useAuthStore.getState().setOfflineSession(
        { id: 'offline-user-001', display_name: 'Baker Bob', preferred_language: 'id' },
        [],
        []
      );

      const user = useAuthStore.getState().user!;
      expect(user.id).toBe('offline-user-001');
      expect(user.name).toBe('Baker Bob');
      expect(user.display_name).toBe('Baker Bob');
      expect(user.preferred_language).toBe('id');
      expect(user.is_active).toBe(true);
      expect(user.timezone).toBe('Asia/Makassar');
    });

    it('should use "User" as fallback when display_name is null', () => {
      useAuthStore.getState().setOfflineSession(
        { id: 'offline-user-002', display_name: null, preferred_language: 'en' },
        [],
        []
      );

      const user = useAuthStore.getState().user!;
      expect(user.name).toBe('User');
    });

    it('should not set sessionId or sessionToken for offline sessions', () => {
      useAuthStore.getState().setOfflineSession(
        { id: 'offline-user-001', display_name: 'Test', preferred_language: 'en' },
        [],
        []
      );

      const state = useAuthStore.getState();
      expect(state.sessionId).toBeNull();
      expect(state.sessionToken).toBeNull();
    });

    it('should set pin_hash to null for security', () => {
      useAuthStore.getState().setOfflineSession(
        { id: 'offline-user-001', display_name: 'Test', preferred_language: 'en' },
        [],
        []
      );

      const user = useAuthStore.getState().user!;
      expect(user.pin_hash).toBeNull();
    });

    it('should set default role to cashier', () => {
      useAuthStore.getState().setOfflineSession(
        { id: 'offline-user-001', display_name: 'Test', preferred_language: 'en' },
        [],
        []
      );

      const user = useAuthStore.getState().user!;
      expect(user.role).toBe('cashier');
    });
  });

  // ===========================================
  // Legacy: login
  // ===========================================
  describe('login (legacy)', () => {
    it('should set user and isAuthenticated', () => {
      const user = makeUserProfile({ id: 'legacy-user' });

      useAuthStore.getState().login(user);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should not modify other state fields', () => {
      const user = makeUserProfile();

      useAuthStore.setState({ roles: [makeRole()], sessionId: 'sess-existing' });
      useAuthStore.getState().login(user);

      const state = useAuthStore.getState();
      expect(state.roles).toEqual([makeRole()]);
      expect(state.sessionId).toBe('sess-existing');
    });
  });

  // ===========================================
  // Legacy: setSession
  // ===========================================
  describe('setSession (legacy)', () => {
    it('should set sessionId', () => {
      useAuthStore.getState().setSession('sess-legacy');
      expect(useAuthStore.getState().sessionId).toBe('sess-legacy');
    });

    it('should allow setting sessionId to null', () => {
      useAuthStore.setState({ sessionId: 'sess-existing' });
      useAuthStore.getState().setSession(null);
      expect(useAuthStore.getState().sessionId).toBeNull();
    });
  });

  // ===========================================
  // initializeAuth
  // ===========================================
  describe('initializeAuth', () => {
    it('should refresh session when already authenticated', async () => {
      const user = makeUserProfile();
      useAuthStore.setState({
        isAuthenticated: true,
        sessionId: 'sess-001',
        sessionToken: 'token-abc',
        user,
      });

      mockValidateSession.mockResolvedValue({
        valid: true,
        user,
        roles: [],
        permissions: [],
      });

      const result = await initializeAuth();

      expect(result).toBe(true);
      expect(mockValidateSession).toHaveBeenCalled();
    });

    it('should check sessionStorage token when not authenticated', async () => {
      sessionStorage.setItem('breakery-session-token', 'stored-token');

      mockValidateSession.mockResolvedValue({
        valid: true,
        user: makeUserProfile(),
        roles: [],
        permissions: [],
      });

      const result = await initializeAuth();

      expect(result).toBe(true);
      expect(mockValidateSession).toHaveBeenCalledWith('stored-token');
    });

    it('should return false when no session exists', async () => {
      useAuthStore.setState({
        isAuthenticated: false,
        sessionId: null,
        sessionToken: null,
      });
      sessionStorage.removeItem('breakery-session-token');

      const result = await initializeAuth();

      expect(result).toBe(false);
      expect(mockValidateSession).not.toHaveBeenCalled();
    });

    it('should set sessionToken from storage before refreshing', async () => {
      sessionStorage.setItem('breakery-session-token', 'from-storage');

      mockValidateSession.mockResolvedValue({
        valid: true,
        user: makeUserProfile(),
        roles: [],
        permissions: [],
      });

      await initializeAuth();

      // The sessionToken should have been set in state
      // (it gets set before refreshSession is called)
      expect(mockValidateSession).toHaveBeenCalledWith('from-storage');
    });
  });

  // ===========================================
  // Selectors
  // ===========================================
  describe('selectors', () => {
    describe('selectIsAdmin', () => {
      it('should return true for SUPER_ADMIN role', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [makeRole({ code: 'SUPER_ADMIN', hierarchy_level: 100 })],
        };
        expect(selectIsAdmin(state)).toBe(true);
      });

      it('should return true for ADMIN role', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [makeRole({ code: 'ADMIN', hierarchy_level: 90 })],
        };
        expect(selectIsAdmin(state)).toBe(true);
      });

      it('should return false for non-admin roles', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [makeRole({ code: 'CASHIER', hierarchy_level: 10 })],
        };
        expect(selectIsAdmin(state)).toBe(false);
      });

      it('should return false for empty roles', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [],
        };
        expect(selectIsAdmin(state)).toBe(false);
      });

      it('should return true when one of multiple roles is admin', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [
            makeRole({ code: 'CASHIER', hierarchy_level: 10 }),
            makeRole({ code: 'ADMIN', hierarchy_level: 90 }),
          ],
        };
        expect(selectIsAdmin(state)).toBe(true);
      });
    });

    describe('selectIsSuperAdmin', () => {
      it('should return true for SUPER_ADMIN', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [makeRole({ code: 'SUPER_ADMIN', hierarchy_level: 100 })],
        };
        expect(selectIsSuperAdmin(state)).toBe(true);
      });

      it('should return false for ADMIN (only SUPER_ADMIN qualifies)', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [makeRole({ code: 'ADMIN', hierarchy_level: 90 })],
        };
        expect(selectIsSuperAdmin(state)).toBe(false);
      });

      it('should return false for empty roles', () => {
        const state = { ...useAuthStore.getState(), roles: [] };
        expect(selectIsSuperAdmin(state)).toBe(false);
      });
    });

    describe('selectIsManager', () => {
      it('should return true for MANAGER role', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [makeRole({ code: 'MANAGER', hierarchy_level: 50 })],
        };
        expect(selectIsManager(state)).toBe(true);
      });

      it('should return true for ADMIN role', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [makeRole({ code: 'ADMIN', hierarchy_level: 90 })],
        };
        expect(selectIsManager(state)).toBe(true);
      });

      it('should return true for SUPER_ADMIN role', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [makeRole({ code: 'SUPER_ADMIN', hierarchy_level: 100 })],
        };
        expect(selectIsManager(state)).toBe(true);
      });

      it('should return false for CASHIER role', () => {
        const state = {
          ...useAuthStore.getState(),
          roles: [makeRole({ code: 'CASHIER', hierarchy_level: 10 })],
        };
        expect(selectIsManager(state)).toBe(false);
      });
    });

    describe('selectPrimaryRole', () => {
      it('should return null for empty roles', () => {
        const state = { ...useAuthStore.getState(), roles: [] };
        expect(selectPrimaryRole(state)).toBeNull();
      });

      it('should return the single role when only one exists', () => {
        const role = makeRole({ code: 'CASHIER', hierarchy_level: 10 });
        const state = { ...useAuthStore.getState(), roles: [role] };
        expect(selectPrimaryRole(state)).toEqual(role);
      });

      it('should return the role with the highest hierarchy_level', () => {
        const cashier = makeRole({ id: 'r1', code: 'CASHIER', hierarchy_level: 10 });
        const manager = makeRole({ id: 'r2', code: 'MANAGER', hierarchy_level: 50 });
        const admin = makeRole({ id: 'r3', code: 'ADMIN', hierarchy_level: 90 });

        const state = { ...useAuthStore.getState(), roles: [cashier, admin, manager] };
        expect(selectPrimaryRole(state)).toEqual(admin);
      });

      it('should handle roles with undefined hierarchy_level', () => {
        const role1 = makeRole({ id: 'r1', code: 'A', hierarchy_level: 0 });
        const role2 = makeRole({ id: 'r2', code: 'B', hierarchy_level: undefined as unknown as number });

        const state = { ...useAuthStore.getState(), roles: [role1, role2] };
        // Both should be treated as 0, so the first (reduce initial) should win
        const result = selectPrimaryRole(state);
        expect(result).not.toBeNull();
      });
    });

    describe('selectHasPermission', () => {
      it('should return true for a granted permission', () => {
        const state = {
          ...useAuthStore.getState(),
          permissions: [
            makePermission({ permission_code: 'sales.view', is_granted: true }),
            makePermission({ permission_code: 'sales.create', is_granted: true }),
          ],
        };
        expect(selectHasPermission('sales.view')(state)).toBe(true);
      });

      it('should return false for a denied permission', () => {
        const state = {
          ...useAuthStore.getState(),
          permissions: [
            makePermission({ permission_code: 'sales.void', is_granted: false }),
          ],
        };
        expect(selectHasPermission('sales.void')(state)).toBe(false);
      });

      it('should return false for a non-existent permission', () => {
        const state = {
          ...useAuthStore.getState(),
          permissions: [
            makePermission({ permission_code: 'sales.view', is_granted: true }),
          ],
        };
        expect(selectHasPermission('admin.roles')(state)).toBe(false);
      });

      it('should return false for empty permissions', () => {
        const state = { ...useAuthStore.getState(), permissions: [] };
        expect(selectHasPermission('sales.view')(state)).toBe(false);
      });
    });
  });

  // ===========================================
  // Persistence
  // ===========================================
  describe('persistence', () => {
    it('should persist to sessionStorage under breakery-auth key', () => {
      useAuthStore.setState({
        user: makeUserProfile(),
        isAuthenticated: true,
        roles: [makeRole()],
        permissions: [makePermission()],
        sessionId: 'sess-persist',
        isOfflineSession: false,
      });

      const stored = sessionStorage.getItem('breakery-auth');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.user).toBeDefined();
      expect(parsed.state.isAuthenticated).toBe(true);
      expect(parsed.state.sessionId).toBe('sess-persist');
    });

    it('should not persist sessionToken (security)', () => {
      useAuthStore.setState({
        user: makeUserProfile(),
        isAuthenticated: true,
        sessionToken: 'secret-token-should-not-persist',
      });

      const stored = sessionStorage.getItem('breakery-auth');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      // sessionToken should be excluded by partialize
      expect(parsed.state.sessionToken).toBeUndefined();
    });

    it('should not persist isLoading', () => {
      useAuthStore.setState({
        isLoading: true,
      });

      const stored = sessionStorage.getItem('breakery-auth');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.state.isLoading).toBeUndefined();
    });

    it('should persist isOfflineSession', () => {
      useAuthStore.setState({
        isOfflineSession: true,
        isAuthenticated: true,
        user: makeUserProfile(),
      });

      const stored = sessionStorage.getItem('breakery-auth');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.isOfflineSession).toBe(true);
    });
  });
});
