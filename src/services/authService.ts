// Authentication Service
// Handles communication with auth Edge Functions

import { supabase } from '@/lib/supabase';
import type {
  Role,
  EffectivePermission,
  UserProfileExtended,
  UserSession,
  PermissionCode,
} from '@/types/auth';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface AuthResponse {
  success: boolean;
  error?: string;
  user?: Partial<UserProfileExtended>;
  session?: {
    id: string;
    token: string;
    device_type: string;
    started_at: string;
  };
  roles?: Role[];
  permissions?: EffectivePermission[];
}

interface SessionValidationResponse {
  valid: boolean;
  error?: string;
  user?: Partial<UserProfileExtended>;
  session?: {
    id: string;
    started_at: string;
    device_type: string;
  };
  roles?: Role[];
  permissions?: EffectivePermission[];
}

// Detect device type
function getDeviceType(): 'desktop' | 'tablet' | 'pos' {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|tablet/.test(userAgent);
  const isTablet = /ipad|tablet|android(?!.*mobile)/.test(userAgent);

  if (isTablet) return 'tablet';
  if (isMobile) return 'tablet'; // Treat mobile as tablet for POS
  return 'desktop';
}

// Get device name
function getDeviceName(): string {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform || 'Unknown';

  // Try to extract browser and OS info
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  return `${browser} on ${platform}`;
}

export const authService = {
  /**
   * Login with PIN
   * Returns user data, session, roles and permissions on success
   */
  async loginWithPin(userId: string, pin: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          user_id: userId,
          pin,
          device_type: getDeviceType(),
          device_name: getDeviceName(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Login failed',
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        roles: data.roles,
        permissions: data.permissions,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  },

  /**
   * Logout - end the current session
   */
  async logout(sessionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: userId,
          reason: 'logout',
        }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Network error during logout',
      };
    }
  },

  /**
   * Validate session and get current user data
   */
  async validateSession(sessionToken: string): Promise<SessionValidationResponse> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-get-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          session_token: sessionToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        return {
          valid: false,
          error: data.error || 'Session invalid',
        };
      }

      return {
        valid: true,
        user: data.user,
        session: data.session,
        roles: data.roles,
        permissions: data.permissions,
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return {
        valid: false,
        error: 'Network error',
      };
    }
  },

  /**
   * Change PIN (self or admin)
   */
  async changePin(
    userId: string,
    newPin: string,
    currentPin?: string,
    adminOverride?: boolean,
    requestingUserId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-change-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-user-id': requestingUserId || userId,
        },
        body: JSON.stringify({
          user_id: userId,
          current_pin: currentPin,
          new_pin: newPin,
          admin_override: adminOverride,
        }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      console.error('Change PIN error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  },

  /**
   * Create a new user (requires users.create permission)
   */
  async createUser(
    userData: {
      first_name: string;
      last_name: string;
      display_name?: string;
      employee_code?: string;
      phone?: string;
      avatar_url?: string;
      preferred_language?: 'fr' | 'en' | 'id';
      pin?: string;
      role_ids: string[];
      primary_role_id: string;
    },
    requestingUserId: string
  ): Promise<{ success: boolean; user?: UserProfileExtended; error?: string }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-user-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-user-id': requestingUserId,
        },
        body: JSON.stringify({
          action: 'create',
          ...userData,
        }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        user: response.ok ? data.user : undefined,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  },

  /**
   * Update a user (requires users.update permission)
   */
  async updateUser(
    userId: string,
    updates: {
      first_name?: string;
      last_name?: string;
      display_name?: string;
      employee_code?: string;
      phone?: string;
      avatar_url?: string;
      preferred_language?: 'fr' | 'en' | 'id';
      role_ids?: string[];
      primary_role_id?: string;
    },
    requestingUserId: string
  ): Promise<{ success: boolean; user?: UserProfileExtended; error?: string }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-user-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-user-id': requestingUserId,
        },
        body: JSON.stringify({
          action: 'update',
          user_id: userId,
          ...updates,
        }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        user: response.ok ? data.user : undefined,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  },

  /**
   * Delete (deactivate) a user (requires users.delete permission)
   */
  async deleteUser(
    userId: string,
    requestingUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-user-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-user-id': requestingUserId,
        },
        body: JSON.stringify({
          action: 'delete',
          user_id: userId,
        }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  },

  /**
   * Toggle user active status
   */
  async toggleUserActive(
    userId: string,
    isActive: boolean,
    requestingUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-user-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-user-id': requestingUserId,
        },
        body: JSON.stringify({
          action: 'toggle_active',
          user_id: userId,
          is_active: isActive,
        }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      console.error('Toggle user active error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  },

  /**
   * Get all users (direct Supabase query)
   */
  async getUsers(includeInactive = false): Promise<UserProfileExtended[]> {
    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles (
          id,
          is_primary,
          role:roles (id, code, name_fr, name_en, name_id, hierarchy_level)
        )
      `)
      .order('name');

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get users error:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all roles
   */
  async getRoles(includeInactive = false): Promise<Role[]> {
    let query = supabase
      .from('roles')
      .select('*')
      .order('hierarchy_level', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get roles error:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get all permissions grouped by module
   */
  async getPermissions(): Promise<Record<string, EffectivePermission[]>> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module')
      .order('action');

    if (error) {
      console.error('Get permissions error:', error);
      return {};
    }

    // Group by module
    const grouped: Record<string, EffectivePermission[]> = {};
    for (const perm of data || []) {
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      grouped[perm.module].push({
        permission_code: perm.code,
        permission_module: perm.module,
        permission_action: perm.action,
        is_granted: false,
        source: 'role',
        is_sensitive: perm.is_sensitive,
      });
    }

    return grouped;
  },

  /**
   * Check if user has a specific permission (client-side check from cached permissions)
   */
  hasPermission(permissions: EffectivePermission[], code: PermissionCode): boolean {
    const perm = permissions.find(p => p.permission_code === code);
    return perm?.is_granted ?? false;
  },

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: EffectivePermission[], codes: PermissionCode[]): boolean {
    return codes.some(code => this.hasPermission(permissions, code));
  },

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: EffectivePermission[], codes: PermissionCode[]): boolean {
    return codes.every(code => this.hasPermission(permissions, code));
  },

  /**
   * Get audit logs (requires admin)
   */
  async getAuditLogs(
    options: {
      userId?: string;
      module?: string;
      action?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: unknown[]; count: number }> {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:user_profiles (id, name, display_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }
    if (options.module) {
      query = query.eq('module', options.module);
    }
    if (options.action) {
      query = query.eq('action', options.action);
    }

    query = query.range(
      options.offset || 0,
      (options.offset || 0) + (options.limit || 50) - 1
    );

    const { data, error, count } = await query;

    if (error) {
      console.error('Get audit logs error:', error);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  },
};

export default authService;
