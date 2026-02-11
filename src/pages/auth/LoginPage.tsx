import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import './LoginPage.css';
import type { Role } from '../../types/auth';
// Offline authentication imports (Story 1.2)
import { useNetworkStatus, useOfflineAuth } from '../../hooks/offline';
import { useActiveUsers } from '@/hooks/useActiveUsers';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithPin, isLoading: authLoading, isAuthenticated } = useAuthStore();

  // Offline authentication hooks (Story 1.2)
  const { isOffline } = useNetworkStatus();
  const {
    loginOffline,
    isRateLimited,
    cooldownSeconds,
    clearError: clearOfflineError,
  } = useOfflineAuth();

  const { data: users = [] } = useActiveUsers();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/pos');
    }
  }, [isAuthenticated, navigate]);

  const handleNumpadKey = (key: string) => {
    setError('');
    setAttemptsRemaining(null);

    if (key === 'clear') {
      setPin('');
    } else if (key === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 6) {
      setPin(prev => prev + key);
    }
  };

  const handleLogin = async () => {
    if (!selectedUser) {
      setError('Select a user');
      return;
    }
    if (pin.length < 4) {
      setError('PIN too short');
      return;
    }

    // Check rate limiting for offline auth (Story 1.2)
    if (isRateLimited) {
      setError(`Too many attempts. Please wait ${cooldownSeconds} seconds`);
      return;
    }

    setIsLoading(true);
    setError('');
    clearOfflineError();
    setAttemptsRemaining(null);
    setLockedUntil(null);

    // OFFLINE MODE: Use offline authentication (Story 1.2)
    if (isOffline) {
      try {
        await loginOffline(selectedUser, pin);
        const user = users.find(u => u.id === selectedUser);
        toast.success(`Welcome, ${user?.display_name || user?.name}! (Offline Mode)`);
        navigate('/pos');
        return;
      } catch (offlineErr) {
        const errCode = (offlineErr as Error).message;
        if (errCode === 'CACHE_EXPIRED') {
          setError('Session expired. Online login required.');
        } else if (errCode === 'RATE_LIMITED') {
          setError(`Too many attempts. Please wait ${cooldownSeconds} seconds`);
        } else {
          // Generic error for security (don't reveal cache state)
          setError('Incorrect PIN');
        }
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // ONLINE MODE: Standard authentication flow
    try {
      // Try the new auth system first
      const result = await loginWithPin(selectedUser, pin);

      if (result.success) {
        const user = users.find(u => u.id === selectedUser);
        toast.success(`Welcome, ${user?.display_name || user?.name}!`);
        navigate('/pos');
        return;
      }

      // Handle specific errors
      if (result.error === 'account_locked') {
        setLockedUntil(result.error);
        setError('Account locked. Try again in 15 minutes.');
      } else {
        // Fallback to legacy login for all other errors (demo mode)
        await handleLegacyLogin();
      }
    } catch (err) {
      console.error('Login error:', err);
      // Fallback to legacy login
      await handleLegacyLogin();
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy login - when Edge Functions are unavailable, use RPC
  const handleLegacyLogin = async () => {
    const user = users.find(u => u.id === selectedUser);

    if (!user) {
      setError('User not found');
      return;
    }

    // Use secure bcrypt verification via RPC
    try {
      const { data: isValid, error: verifyError } = await supabase.rpc('verify_user_pin', {
        p_user_id: selectedUser,
        p_pin: pin
      });

      if (verifyError) {
        console.error('PIN verification error:', verifyError);
        setError('Authentication service unavailable');
        return;
      }

      if (!isValid) {
        setError('Invalid PIN');
        return;
      }
    } catch (rpcError) {
      console.error('RPC error:', rpcError);
      setError('Authentication service unavailable');
      return;
    }

    // Load roles and permissions from database for legacy login
    try {
      // Get user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select(`
          id,
          is_primary,
          role:roles (id, code, name_fr, name_en, name_id, hierarchy_level)
        `)
        .eq('user_id', user.id) as { data: Array<{ id: string; is_primary: boolean; role: { id: string; code: string; name_fr: string; name_en: string; name_id: string; hierarchy_level: number } | null }> | null };

      const roles: Role[] = (userRoles?.map(ur => ur.role).filter((r): r is NonNullable<typeof r> => r !== null) || []).map(r => ({
        id: r.id,
        code: r.code,
        name_fr: r.name_fr,
        name_en: r.name_en,
        name_id: r.name_id,
        description: null,
        is_system: false,
        is_active: true,
        hierarchy_level: r.hierarchy_level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Get permissions from role_permissions
      const roleIds = roles.map((r) => (r as { id: string }).id);
      let permissions: { permission_code: string; permission_module: string; permission_action: string; is_granted: boolean; is_sensitive: boolean; source: 'direct' | 'role' }[] = [];

      if (roleIds.length > 0) {
        const { data: rolePerms } = await supabase
          .from('role_permissions')
          .select(`
            permission:permissions (code, module, action, is_sensitive)
          `)
          .in('role_id', roleIds) as { data: Array<{ permission: { code: string; module: string; action: string; is_sensitive: boolean } | null }> | null };

        permissions = rolePerms?.map(rp => ({
          permission_code: rp.permission?.code || '',
          permission_module: rp.permission?.module || '',
          permission_action: rp.permission?.action || '',
          is_granted: true,
          is_sensitive: rp.permission?.is_sensitive || false,
          source: 'role' as const,
        })).filter(p => p.permission_code) || [];
      }

      // Update auth store with roles and permissions
      useAuthStore.setState({
        user,
        roles,
        permissions,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success(`Welcome, ${user.display_name || user.name}!`);
      navigate('/pos');
    } catch (err) {
      console.error('Error loading permissions:', err);
      // Fallback to basic login without permissions
      const { login } = useAuthStore.getState();
      login(user);
      toast.success(`Welcome, ${user.display_name || user.name}!`);
      navigate('/pos');
    }
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo__icon">🥐</span>
          <h1 className="login-logo__text">The Breakery</h1>
          <p className="login-logo__subtitle">Login</p>
        </div>

        {/* Offline Mode Indicator (Story 1.2) */}
        {isOffline && (
          <div className="login-offline-indicator">
            <span>📶</span>
            <span>Offline Mode</span>
          </div>
        )}

        {/* Rate Limit Cooldown Display (Story 1.2) */}
        {isRateLimited && (
          <div className="login-cooldown">
            <span>Please wait...</span>
            <span className="login-cooldown__timer">{cooldownSeconds}s</span>
          </div>
        )}

        {/* User Selection */}
        <div className="login-section">
          <label className="login-label">
            Select a user
          </label>
          <select
            className="login-select"
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setPin('');
              setError('');
              setAttemptsRemaining(null);
              setLockedUntil(null);
            }}
            title="Select a user"
            aria-label="User profile selection"
          >
            <option value="">-- Choose --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.display_name || user.name}
                {user.employee_code ? ` (${user.employee_code})` : ` (${user.role})`}
              </option>
            ))}
          </select>
        </div>

        {/* Selected User Avatar */}
        {selectedUserData && (
          <div className="login-avatar">
            {selectedUserData.avatar_url ? (
              <img
                src={selectedUserData.avatar_url}
                alt={selectedUserData.name}
                className="login-avatar__img"
              />
            ) : (
              <div className="login-avatar__placeholder">
                {(selectedUserData.display_name || selectedUserData.name).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="login-avatar__name">
              {selectedUserData.display_name || selectedUserData.name}
            </span>
          </div>
        )}

        {/* PIN Entry */}
        {selectedUser && (
          <div className="login-section">
            <label className="login-label">
              PIN Code
            </label>
            <div className="pin-display">
              {[...Array(6)].map((_, i) => (
                <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
              ))}
            </div>

            {/* Numpad */}
            <div className="numpad login-numpad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map(key => (
                <button
                  key={key}
                  className={`numpad__key ${key === 'clear' ? 'clear' : ''} ${key === 'backspace' ? 'backspace' : ''}`}
                  onClick={() => handleNumpadKey(key)}
                  disabled={isLoading || authLoading}
                >
                  {key === 'clear' ? 'C' : key === 'backspace' ? '⌫' : key}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="login-error">
            {error}
            {attemptsRemaining !== null && attemptsRemaining > 0 && (
              <span className="login-error__attempts">
                {' '}({attemptsRemaining} attempts remaining)
              </span>
            )}
          </div>
        )}

        {/* Locked Message */}
        {lockedUntil && (
          <div className="login-locked">
            Account temporarily locked
          </div>
        )}

        {/* Login Button */}
        <button
          type="button"
          className="btn btn-primary btn-block login-btn"
          onClick={handleLogin}
          disabled={!selectedUser || pin.length < 4 || isLoading || authLoading}
        >
          {isLoading || authLoading ? 'Loading...' : 'Sign in'}
        </button>

      </div>
    </div>
  );
}
