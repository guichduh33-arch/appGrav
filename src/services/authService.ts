// Authentication Service
// Handles communication with auth Edge Functions

import { supabase } from '@/lib/supabase';
import type {
  Role,
  EffectivePermission,
  UserProfileExtended,
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
   * Creates a real Supabase Auth session for RLS to work properly
   */
  async loginWithPin(userId: string, pin: string): Promise<AuthResponse> {
    try {
      // 1. Call edge function to verify PIN and get auth token
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

      // 2. Use the magic link token to create a real Supabase Auth session
      if (data.auth?.token && data.auth?.email) {
        try {
          const { data: authData, error: authError } = await supabase.auth.verifyOtp({
            token_hash: data.auth.token,
            type: 'magiclink',
          });

          if (authError) {
            console.error('Supabase Auth session creation failed:', authError);
            // Continue anyway - the app will work but RLS might not
          } else {
            console.log('[Auth] Supabase Auth session created successfully');
          }
        } catch (authErr) {
          console.error('Error creating Supabase Auth session:', authErr);
          // Non-blocking - continue with the login
        }
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
   * Logout - end the current session and Supabase Auth session
   */
  async logout(sessionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Sign out from Supabase Auth
      try {
        await supabase.auth.signOut();
        console.log('[Auth] Supabase Auth session ended');
      } catch (authErr) {
        console.error('Supabase Auth signOut error:', authErr);
        // Continue anyway
      }

      // 2. Call the logout edge function if available
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
          error: response.ok ? undefined : (data.error || data.message || 'Unknown error'),
        };
      } catch {
        // Edge function might not exist, that's OK
        return { success: true };
      }
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
        error: response.ok ? undefined : (data.error || data.message || 'Unknown error'),
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
        error: response.ok ? undefined : (data.error || data.message || 'Unknown error'),
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
        error: response.ok ? undefined : (data.error || data.message || 'Unknown error'),
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
        error: response.ok ? undefined : (data.error || data.message || 'Unknown error'),
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
        error: response.ok ? undefined : (data.error || data.message || 'Unknown error'),
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
   * Create user directly via Supabase (fallback when Edge Functions unavailable)
   */
  async createUserDirect(
    userData: {
      first_name: string;
      last_name: string;
      display_name?: string;
      employee_code?: string;
      phone?: string;
      preferred_language?: 'fr' | 'en' | 'id';
      pin?: string;
      role_ids: string[];
      primary_role_id: string;
    }
  ): Promise<{ success: boolean; user?: UserProfileExtended; error?: string }> {
    try {
      const name = `${userData.first_name} ${userData.last_name}`.trim();
      const displayName = userData.display_name || name;

      // Create user profile (SECURITY: Don't store plaintext PIN here)
      const { data: newUser, error: userError } = await supabase
        .from('user_profiles')
        .insert({
          name,
          first_name: userData.first_name,
          last_name: userData.last_name,
          display_name: displayName,
          employee_code: userData.employee_code || null,
          phone: userData.phone || null,
          preferred_language: userData.preferred_language || 'id',
          role: 'cashier', // Default legacy role
          is_active: true,
        })
        .select()
        .single();

      if (userError) {
        console.error('Create user error:', userError);
        return { success: false, error: userError.message };
      }

      // SECURITY: Set PIN securely via RPC (uses bcrypt hashing)
      if (userData.pin) {
        const { error: pinError } = await supabase.rpc('set_user_pin', {
          p_user_id: newUser.id,
          p_pin: userData.pin,
        });

        if (pinError) {
          console.error('Set PIN error:', pinError);
          // User created but PIN failed - not critical, can be set later
        }
      }

      // Assign roles
      const roleAssignments = userData.role_ids.map(roleId => ({
        user_id: newUser.id,
        role_id: roleId,
        is_primary: roleId === userData.primary_role_id,
      }));

      if (roleAssignments.length > 0) {
        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(roleAssignments);

        if (rolesError) {
          console.error('Assign roles error:', rolesError);
          // User created but roles failed - not critical
        }
      }

      return { success: true, user: newUser as UserProfileExtended };
    } catch (error) {
      console.error('Create user direct error:', error);
      return { success: false, error: 'Erreur lors de la création' };
    }
  },

  /**
   * Update user directly via Supabase (fallback when Edge Functions unavailable)
   */
  async updateUserDirect(
    userId: string,
    updates: {
      first_name?: string;
      last_name?: string;
      display_name?: string;
      employee_code?: string;
      phone?: string;
      role_ids?: string[];
      primary_role_id?: string;
    }
  ): Promise<{ success: boolean; user?: UserProfileExtended; error?: string }> {
    try {
      // Build update object
      const profileUpdates: Record<string, unknown> = {};

      if (updates.first_name) profileUpdates.first_name = updates.first_name;
      if (updates.last_name) profileUpdates.last_name = updates.last_name;
      if (updates.first_name || updates.last_name) {
        profileUpdates.name = `${updates.first_name || ''} ${updates.last_name || ''}`.trim();
      }
      if (updates.display_name !== undefined) profileUpdates.display_name = updates.display_name || null;
      if (updates.employee_code !== undefined) profileUpdates.employee_code = updates.employee_code || null;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone || null;

      // Update user profile
      if (Object.keys(profileUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (updateError) {
          console.error('Update user error:', updateError);
          return { success: false, error: updateError.message };
        }
      }

      // Update roles if provided
      if (updates.role_ids && updates.role_ids.length > 0) {
        // Delete existing roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        // Insert new roles
        const roleAssignments = updates.role_ids.map(roleId => ({
          user_id: userId,
          role_id: roleId,
          is_primary: roleId === updates.primary_role_id,
        }));

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(roleAssignments);

        if (rolesError) {
          console.error('Update roles error:', rolesError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Update user direct error:', error);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  },

  /**
   * Delete (deactivate) user directly via Supabase
   */
  async deleteUserDirect(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete user direct error:', error);
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  },

  /**
   * Toggle user active status directly via Supabase
   */
  async toggleUserActiveDirect(
    userId: string,
    isActive: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Toggle user active error:', error);
      return { success: false, error: 'Erreur' };
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

    return (data || []) as UserProfileExtended[];
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

    return (data || []) as Role[];
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
        is_sensitive: perm.is_sensitive ?? false,
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
