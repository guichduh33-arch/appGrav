/**
 * Tests for Auth Service
 * Sprint 4 - TEST-004
 *
 * Covers:
 * 1. loginWithPin: Successful login returns user data
 * 2. loginWithPin - invalid PIN: Returns error
 * 3. logout: Clears session
 * 4. validateSession: Valid session returns true
 * 5. changePin: Successfully changes PIN
 * 6. Error handling: Network errors, invalid responses
 * 7. Permission checks: hasPermission, hasAnyPermission, hasAllPermissions
 *
 * Mocks: global fetch and @/lib/supabase
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../authService';
import type { EffectivePermission } from '@/types/auth';

// =====================================================
// Mocks
// =====================================================

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      verifyOtp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key-123');

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// =====================================================
// Test Helpers
// =====================================================

function createFetchResponse(status: number, body: Record<string, unknown>) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

function createMockUserData() {
  return {
    id: 'user-123',
    name: 'Test User',
    display_name: 'Test',
    first_name: 'Test',
    last_name: 'User',
    is_active: true,
    preferred_language: 'en',
  };
}

function createMockSessionData() {
  return {
    id: 'session-456',
    token: 'session-token-abc',
    device_type: 'desktop',
    started_at: '2026-02-10T10:00:00Z',
  };
}

function createPermission(
  code: string,
  isGranted: boolean
): EffectivePermission {
  const [module, action] = code.split('.');
  return {
    permission_code: code,
    permission_module: module,
    permission_action: action,
    is_granted: isGranted,
    source: 'role',
    is_sensitive: false,
  };
}

// =====================================================
// Tests
// =====================================================

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================================================
  // 1. loginWithPin - Success
  // =====================================================

  describe('loginWithPin', () => {
    it('should return success with user data on valid PIN', async () => {
      const mockUser = createMockUserData();
      const mockSession = createMockSessionData();

      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, {
          user: mockUser,
          session: mockSession,
          roles: [{ id: 'role-1', code: 'CASHIER', name_en: 'Cashier' }],
          permissions: [
            { permission_code: 'sales.view', is_granted: true },
          ],
          auth: { token: 'magic-link-token', email: 'test@example.com' },
        })
      );

      const result = await authService.loginWithPin('user-123', '1234');

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe('user-123');
      expect(result.session).toBeDefined();
      expect(result.session?.id).toBe('session-456');
      expect(result.roles).toBeDefined();
      expect(result.permissions).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should call the correct edge function URL', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, {
          user: createMockUserData(),
          session: createMockSessionData(),
          roles: [],
          permissions: [],
        })
      );

      await authService.loginWithPin('user-123', '9999');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/functions/v1/auth-verify-pin');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('should send user_id and pin in request body', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, {
          user: createMockUserData(),
          session: createMockSessionData(),
          roles: [],
          permissions: [],
        })
      );

      await authService.loginWithPin('user-123', '4567');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.user_id).toBe('user-123');
      expect(body.pin).toBe('4567');
      expect(body.device_type).toBeDefined();
      expect(body.device_name).toBeDefined();
    });

    // =====================================================
    // 2. loginWithPin - Invalid PIN
    // =====================================================

    it('should return error on invalid PIN (401)', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(401, {
          error: 'Invalid PIN',
        })
      );

      const result = await authService.loginWithPin('user-123', '0000');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid PIN');
      expect(result.user).toBeUndefined();
      expect(result.session).toBeUndefined();
    });

    it('should return error message from server response', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(403, {
          message: 'Account is locked',
        })
      );

      const result = await authService.loginWithPin('user-123', '1111');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account is locked');
    });

    it('should return default error when no error message provided', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(500, {})
      );

      const result = await authService.loginWithPin('user-123', '1111');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Login failed');
    });

    // =====================================================
    // 6. Error handling - Network errors
    // =====================================================

    it('should handle network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.loginWithPin('user-123', '1234');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please try again.');
    });

    it('should handle fetch timeout gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('AbortError'));

      const result = await authService.loginWithPin('user-123', '1234');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please try again.');
    });

    it('should still succeed when Supabase Auth session creation fails', async () => {
      // Import the mock to modify it
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.verifyOtp as any).mockResolvedValueOnce({
        error: { message: 'Token expired' },
      });

      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, {
          user: createMockUserData(),
          session: createMockSessionData(),
          roles: [],
          permissions: [],
          auth: { token: 'expired-token', email: 'test@example.com' },
        })
      );

      const result = await authService.loginWithPin('user-123', '1234');

      // Should still succeed - auth session is non-blocking
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });
  });

  // =====================================================
  // 3. logout
  // =====================================================

  describe('logout', () => {
    it('should return success on successful logout', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, { success: true })
      );

      const result = await authService.logout('session-456', 'user-123');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should call Supabase auth signOut', async () => {
      const { supabase } = await import('@/lib/supabase');

      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, { success: true })
      );

      await authService.logout('session-456', 'user-123');

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should call the logout edge function', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, { success: true })
      );

      await authService.logout('session-456', 'user-123');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/functions/v1/auth-logout');
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.session_id).toBe('session-456');
      expect(body.user_id).toBe('user-123');
      expect(body.reason).toBe('logout');
    });

    it('should still succeed when edge function is unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not Found'));

      const result = await authService.logout('session-456', 'user-123');

      // Should succeed even if edge function fails
      expect(result.success).toBe(true);
    });

    it('should handle error from logout edge function', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(500, { error: 'Server error' })
      );

      const result = await authService.logout('session-456', 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('should handle Supabase auth signOut failure gracefully', async () => {
      const { supabase } = await import('@/lib/supabase');
      (supabase.auth.signOut as any).mockRejectedValueOnce(new Error('Auth error'));

      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, { success: true })
      );

      // Should not throw despite signOut failure
      const result = await authService.logout('session-456', 'user-123');
      expect(result.success).toBe(true);
    });
  });

  // =====================================================
  // 4. validateSession
  // =====================================================

  describe('validateSession', () => {
    it('should return valid=true for a valid session', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, {
          valid: true,
          user: createMockUserData(),
          session: createMockSessionData(),
          roles: [{ id: 'role-1', code: 'CASHIER' }],
          permissions: [
            { permission_code: 'sales.view', is_granted: true },
          ],
        })
      );

      const result = await authService.validateSession('session-token-abc');

      expect(result.valid).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.roles).toBeDefined();
      expect(result.permissions).toBeDefined();
    });

    it('should call the correct edge function URL', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, {
          valid: true,
          user: createMockUserData(),
          session: createMockSessionData(),
          roles: [],
          permissions: [],
        })
      );

      await authService.validateSession('session-token-abc');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/functions/v1/auth-get-session');
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.session_token).toBe('session-token-abc');
    });

    it('should return valid=false for invalid session (server returns invalid)', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, {
          valid: false,
          error: 'Session expired',
        })
      );

      const result = await authService.validateSession('expired-token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Session expired');
    });

    it('should return valid=false on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(401, {
          error: 'Unauthorized',
        })
      );

      const result = await authService.validateSession('bad-token');

      expect(result.valid).toBe(false);
    });

    it('should return valid=false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.validateSession('token');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  // =====================================================
  // 5. changePin
  // =====================================================

  describe('changePin', () => {
    it('should return success on valid PIN change', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, { success: true })
      );

      const result = await authService.changePin('user-123', '5678', '1234');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should call the correct edge function with correct params', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, { success: true })
      );

      await authService.changePin('user-123', '5678', '1234', false, 'admin-999');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/functions/v1/auth-change-pin');
      expect(options.method).toBe('POST');
      expect(options.headers['x-session-token']).toBeDefined();

      const body = JSON.parse(options.body);
      expect(body.user_id).toBe('user-123');
      expect(body.new_pin).toBe('5678');
      expect(body.current_pin).toBe('1234');
    });

    it('should support admin override', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(200, { success: true })
      );

      await authService.changePin('user-123', '9999', undefined, true, 'admin-001');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.admin_override).toBe(true);
      expect(body.current_pin).toBeUndefined();
    });

    it('should return error when current PIN is wrong', async () => {
      mockFetch.mockResolvedValueOnce(
        createFetchResponse(401, { error: 'Current PIN is incorrect' })
      );

      const result = await authService.changePin('user-123', '5678', '0000');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Current PIN is incorrect');
    });

    it('should handle network error on PIN change', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await authService.changePin('user-123', '5678', '1234');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  // =====================================================
  // 7. Permission checks (synchronous helpers)
  // =====================================================

  describe('hasPermission', () => {
    it('should return true when permission is granted', () => {
      const permissions = [
        createPermission('sales.view', true),
        createPermission('sales.create', true),
        createPermission('inventory.view', false),
      ];
      expect(authService.hasPermission(permissions, 'sales.view')).toBe(true);
    });

    it('should return false when permission is not granted', () => {
      const permissions = [
        createPermission('sales.view', true),
        createPermission('inventory.view', false),
      ];
      expect(authService.hasPermission(permissions, 'inventory.view')).toBe(false);
    });

    it('should return false when permission does not exist', () => {
      const permissions = [
        createPermission('sales.view', true),
      ];
      expect(authService.hasPermission(permissions, 'reports.sales')).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      expect(authService.hasPermission([], 'sales.view')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when at least one permission is granted', () => {
      const permissions = [
        createPermission('sales.view', true),
        createPermission('inventory.view', false),
      ];
      expect(
        authService.hasAnyPermission(permissions, ['sales.view', 'inventory.view'])
      ).toBe(true);
    });

    it('should return false when none of the permissions are granted', () => {
      const permissions = [
        createPermission('sales.view', false),
        createPermission('inventory.view', false),
      ];
      expect(
        authService.hasAnyPermission(permissions, ['sales.view', 'inventory.view'])
      ).toBe(false);
    });

    it('should return false for empty codes array', () => {
      const permissions = [
        createPermission('sales.view', true),
      ];
      expect(authService.hasAnyPermission(permissions, [])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when all permissions are granted', () => {
      const permissions = [
        createPermission('sales.view', true),
        createPermission('sales.create', true),
        createPermission('inventory.view', true),
      ];
      expect(
        authService.hasAllPermissions(permissions, ['sales.view', 'sales.create'])
      ).toBe(true);
    });

    it('should return false when any permission is not granted', () => {
      const permissions = [
        createPermission('sales.view', true),
        createPermission('sales.create', false),
      ];
      expect(
        authService.hasAllPermissions(permissions, ['sales.view', 'sales.create'])
      ).toBe(false);
    });

    it('should return true for empty codes array (vacuous truth)', () => {
      const permissions = [
        createPermission('sales.view', true),
      ];
      expect(authService.hasAllPermissions(permissions, [])).toBe(true);
    });
  });
});
