import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import type { Role } from '../../types/auth';
// Offline authentication imports (Story 1.2)
import { useNetworkStatus, useOfflineAuth } from '../../hooks/offline';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { logError } from '@/utils/logger';
import { WifiOff } from 'lucide-react';
import { BreakeryLogo } from '@/components/ui/BreakeryLogo';
import { cn } from '@/lib/utils';

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
      logError('Login error:', err);
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
        logError('PIN verification error:', verifyError);
        setError('Authentication service unavailable');
        return;
      }

      if (!isValid) {
        setError('Invalid PIN');
        return;
      }
    } catch (rpcError) {
      logError('RPC error:', rpcError);
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
      logError('Error loading permissions:', err);
      // Fallback to basic login without permissions
      const { login } = useAuthStore.getState();
      login(user);
      toast.success(`Welcome, ${user.display_name || user.name}!`);
      navigate('/pos');
    }
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="login-page min-h-screen flex items-center justify-center p-xl relative max-[480px]:p-lg"
      style={{ background: 'radial-gradient(ellipse at center, #2d2a24 0%, #1a1816 100%)' }}
    >
      <div
        className="login-card relative z-[1] w-full max-w-[420px] rounded-2xl p-2xl max-[480px]:p-xl max-[480px]:rounded-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(61,52,40,0.9) 0%, rgba(45,42,36,0.95) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(201,165,92,0.2)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-2xl">
          <div className="flex justify-center mb-md" style={{ filter: 'drop-shadow(0 4px 12px rgba(201,165,92,0.3))' }}>
            <BreakeryLogo size="xl" variant="gold" showText={false} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-white m-0 tracking-[-0.02em] max-[480px]:text-2xl">
            The Breakery
          </h1>
          <p className="font-display italic text-sm text-gold mt-xs tracking-[0.05em]">
            Login
          </p>
        </div>

        {/* Offline Mode Indicator (Story 1.2) */}
        {isOffline && (
          <div className="bg-gray-500 text-white py-sm px-lg rounded-md mb-lg flex items-center justify-center gap-sm text-sm font-body">
            <WifiOff size={16} />
            <span>Offline Mode</span>
          </div>
        )}

        {/* Rate Limit Cooldown Display (Story 1.2) */}
        {isRateLimited && (
          <div
            className="text-center font-body text-sm mb-lg py-md px-lg rounded-lg"
            style={{
              color: 'var(--color-gold-light)',
              background: 'rgba(201,165,92,0.1)',
              border: '1px solid rgba(201,165,92,0.3)',
            }}
          >
            <span>Please wait...</span>
            <span className="text-xl font-bold block mt-xs">{cooldownSeconds}s</span>
          </div>
        )}

        {/* User Selection */}
        <div className="mb-xl">
          <label
            className="block font-body text-xs font-semibold mb-sm uppercase tracking-[0.08em]"
            style={{ color: 'var(--color-gold-light)' }}
          >
            Select a user
          </label>
          <select
            className="login-select w-full h-14 font-body text-base text-white cursor-pointer rounded-lg transition-all duration-[250ms]"
            style={{
              padding: '0 var(--space-xl) 0 var(--space-lg)',
              background: 'rgba(26,24,22,0.6)',
              border: '2px solid rgba(201,165,92,0.3)',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23c9a55c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right var(--space-lg) center',
            }}
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
          <div className="flex flex-col items-center gap-sm mb-xl">
            {selectedUserData.avatar_url ? (
              <img
                src={selectedUserData.avatar_url}
                alt={selectedUserData.name}
                className="w-[72px] h-[72px] rounded-full object-cover"
                style={{
                  border: '3px solid var(--color-gold)',
                  boxShadow: '0 4px 12px rgba(201,165,92,0.3)',
                }}
              />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-display text-2xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                  boxShadow: '0 4px 12px rgba(201,165,92,0.3)',
                }}
              >
                {(selectedUserData.display_name || selectedUserData.name).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-display text-xl font-semibold text-white">
              {selectedUserData.display_name || selectedUserData.name}
            </span>
          </div>
        )}

        {/* PIN Entry */}
        {selectedUser && (
          <div className="mb-xl">
            <label
              className="block font-body text-xs font-semibold mb-sm uppercase tracking-[0.08em]"
              style={{ color: 'var(--color-gold-light)' }}
            >
              PIN Code
            </label>
            <div className="flex justify-center gap-lg mb-xl">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'w-[18px] h-[18px] rounded-full transition-all duration-200',
                    i < pin.length
                      ? 'bg-gold border-2 border-gold-light shadow-[0_0_12px_rgba(201,165,92,0.5)]'
                      : 'border-2'
                  )}
                  style={i >= pin.length ? {
                    background: 'rgba(45,42,36,0.6)',
                    borderColor: 'rgba(201,165,92,0.4)',
                  } : undefined}
                />
              ))}
            </div>

            {/* Numpad */}
            <div className="max-w-[320px] mx-auto">
              <div className="grid grid-cols-3 gap-md">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map(key => (
                  <button
                    key={key}
                    className={cn(
                      'numpad-key h-[68px] max-[480px]:h-[60px] flex items-center justify-center text-white rounded-lg',
                      'font-display text-[1.75rem] max-[480px]:text-[1.5rem] font-semibold cursor-pointer',
                      'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
                      key === 'clear' && 'numpad-key--clear',
                      key === 'backspace' && 'numpad-key--backspace'
                    )}
                    onClick={() => handleNumpadKey(key)}
                    disabled={isLoading || authLoading}
                  >
                    {key === 'clear' ? 'C' : key === 'backspace' ? '\u232B' : key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="text-center text-sm font-body mb-lg p-md rounded-lg"
            style={{
              color: '#e9827a',
              background: 'rgba(181,68,43,0.15)',
              border: '1px solid rgba(181,68,43,0.3)',
            }}
          >
            {error}
            {attemptsRemaining !== null && attemptsRemaining > 0 && (
              <span className="block mt-xs text-xs opacity-80">
                {' '}({attemptsRemaining} attempts remaining)
              </span>
            )}
          </div>
        )}

        {/* Locked Message */}
        {lockedUntil && (
          <div
            className="text-center font-body text-sm mb-lg py-md px-lg rounded-lg"
            style={{
              color: 'var(--color-gold-light)',
              background: 'rgba(201,165,92,0.1)',
              border: '1px solid rgba(201,165,92,0.3)',
            }}
          >
            Account temporarily locked
          </div>
        )}

        {/* Login Button */}
        <button
          type="button"
          className="btn btn-primary btn-block login-btn mt-lg w-full h-14 max-[480px]:h-[52px] font-body text-lg max-[480px]:text-base font-bold text-white border-none rounded-lg cursor-pointer transition-all duration-[250ms]"
          style={{
            background: 'linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
            boxShadow: '0 4px 12px rgba(201,165,92,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          onClick={handleLogin}
          disabled={!selectedUser || pin.length < 4 || isLoading || authLoading}
        >
          {isLoading || authLoading ? 'Loading...' : 'Sign in'}
        </button>

      </div>

      {/* Scoped styles for pseudo-elements and complex states */}
      <style>{`
        .login-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.04;
          pointer-events: none;
          z-index: 0;
        }
        .login-page::after {
          content: '';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(201,165,92,0.03) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--color-gold), transparent);
          border-radius: 0 0 2px 2px;
        }
        .login-select:focus {
          outline: none;
          border-color: var(--color-gold);
          box-shadow: 0 0 0 3px rgba(201,165,92,0.2);
          background-color: rgba(26,24,22,0.8);
        }
        .login-select option {
          background: #2d2a24;
          color: #FFFFFF;
        }
        .numpad-key {
          background: rgba(26,24,22,0.5);
          border: 1px solid rgba(201,165,92,0.2);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
        }
        .numpad-key:hover {
          background: rgba(201,165,92,0.15);
          border-color: var(--color-gold);
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.3);
        }
        .numpad-key:active {
          transform: translateY(0) scale(0.96);
        }
        .numpad-key--clear {
          background: rgba(181,68,43,0.15);
          color: #e9827a;
          border-color: rgba(181,68,43,0.3);
        }
        .numpad-key--clear:hover {
          background: rgba(181,68,43,0.25);
          border-color: rgba(181,68,43,0.5);
        }
        .numpad-key--backspace {
          background: rgba(201,165,92,0.1);
          color: var(--color-gold-light);
          border-color: rgba(201,165,92,0.3);
        }
        .numpad-key--backspace:hover {
          background: rgba(201,165,92,0.2);
          border-color: var(--color-gold);
        }
        .numpad-key:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }
        .numpad-key:disabled:hover {
          background: rgba(26,24,22,0.5);
          border-color: rgba(201,165,92,0.2);
          transform: none;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(201,165,92,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}
