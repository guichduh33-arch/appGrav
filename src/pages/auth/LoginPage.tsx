import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import type { Role } from '../../types/auth';
// Offline authentication imports (Story 1.2)
import { useNetworkStatus, useOfflineAuth } from '../../hooks/offline';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { logError } from '@/utils/logger';
import {
  WifiOff,
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
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

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/pos');
    }
  }, [isAuthenticated, navigate]);

  const handleNumpadKey = (key: string) => {
    setError('');

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

  // VIEW 1: USER SELECTION GRID
  if (!selectedUser) {
    return (
      <div className="bg-[#0D0D0F] min-h-screen flex flex-col items-center justify-center font-sans antialiased text-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-[#c8a45b]/5 rounded-full blur-[100px] pointer-events-none text-[#c8a45b]"></div>
        <div className="fixed -top-24 -right-24 w-96 h-96 bg-[#c8a45b]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <main className="w-full max-w-[800px] bg-[#1A1A1D] border border-[#2A2A30] rounded-xl shadow-2xl p-8 relative z-10">
          <header className="text-center mb-10">
            <div className="inline-block mb-4">
              <BreakeryLogo className="w-16 h-16 text-[#c8a45b]" />
            </div>
            <h1 className="font-serif text-3xl text-[#c8a45b] mb-2">Select Staff Member</h1>
            <p className="text-[#A09B8E] text-sm font-light">Choose your profile to enter PIN</p>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className="flex flex-col items-center p-4 rounded-xl bg-[#1E1E22] border border-[#2A2A30] hover:border-[#c8a45b]/50 hover:bg-[#c8a45b]/5 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-[#c8a45b]/10 flex items-center justify-center mb-3 border border-[#c8a45b]/20 group-hover:scale-105 transition-transform overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#c8a45b] text-xl font-bold">
                      {(user.display_name || user.name).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors text-center line-clamp-1">
                  {user.display_name || user.name}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                  {user.role}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-[#2A2A30] flex justify-center">
            <Link
              to="/login/email"
              className="text-sm text-[#A09B8E] hover:text-[#c8a45b] transition-colors flex items-center gap-2"
            >
              Management Email Login
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // VIEW 2: PIN PAD (STITCH A2)
  return (
    <div className="bg-[#0D0D0F] min-h-screen flex flex-col items-center justify-center font-sans antialiased text-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-[#c8a45b]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-[#c8a45b]/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top-Right Offline Badge */}
      {isOffline && (
        <div className="fixed top-8 right-8 flex items-center gap-2 bg-[#c8a45b]/10 border border-[#c8a45b]/30 px-4 py-2 rounded-full z-20">
          <WifiOff className="text-[#c8a45b] w-4 h-4" />
          <span className="text-[#c8a45b] text-xs font-semibold uppercase tracking-widest">Offline Mode</span>
        </div>
      )}

      <main className="w-full max-w-[400px] bg-[#1A1A1D] border border-[#2A2A30] rounded-xl shadow-2xl p-8 relative z-10">
        {/* Header Section */}
        <header className="text-center mb-8">
          <h1 className="font-serif text-3xl text-[#c8a45b] mb-2">Staff PIN Access</h1>
          <p className="text-[#A09B8E] text-sm font-light">Enter your 4-6 digit PIN</p>
        </header>

        {/* User Greeting */}
        <div className="text-center mb-6">
          <button
            onClick={() => { setSelectedUser(''); setPin(''); setError(''); }}
            className="group flex flex-col items-center mx-auto"
          >
            <div className="w-16 h-16 bg-[#c8a45b]/10 rounded-full flex items-center justify-center mb-3 border border-[#c8a45b]/20 group-hover:border-[#c8a45b]/50 transition-colors overflow-hidden">
              {selectedUserData?.avatar_url ? (
                <img src={selectedUserData.avatar_url} alt={selectedUserData.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#c8a45b] text-2xl font-bold">
                  {(selectedUserData?.display_name || selectedUserData?.name || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-lg font-medium text-[#F5F5F0] group-hover:text-[#c8a45b] transition-colors flex items-center gap-2">
              Welcome, {selectedUserData?.display_name || selectedUserData?.name}
              <span className="text-xs text-[#A09B8E] border border-[#2A2A30] px-2 py-0.5 rounded uppercase tracking-tighter">Switch</span>
            </h2>
          </button>
        </div>

        {/* PIN Visualizer */}
        <div className="flex justify-center gap-4 mb-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-200",
                i < pin.length
                  ? "bg-[#c8a45b] shadow-[0_0_12px_rgba(200,164,91,0.6)]"
                  : "border-2 border-[#2A2A30]"
              )}
            />
          ))}
        </div>

        {/* Numeric Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumpadKey(num.toString())}
              disabled={isLoading || authLoading}
              className="h-[72px] bg-[#1E1E22] border border-[#2A2A30] rounded-lg flex items-center justify-center text-2xl hover:bg-white/5 active:scale-95 transition-all disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <div className="h-[72px]"></div>
          <button
            onClick={() => handleNumpadKey('0')}
            disabled={isLoading || authLoading}
            className="h-[72px] bg-[#1E1E22] border border-[#2A2A30] rounded-lg flex items-center justify-center text-2xl hover:bg-white/5 active:scale-95 transition-all disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={() => handleNumpadKey('backspace')}
            disabled={isLoading || authLoading}
            className="h-[72px] bg-[#1E1E22] border border-[#2A2A30] rounded-lg flex items-center justify-center text-2xl hover:bg-white/5 active:scale-95 transition-all text-[#c8a45b]/80 disabled:opacity-50"
          >
            <span className="material-icons-outlined">backspace</span>
          </button>
        </div>

        {/* Error/Locked Message */}
        {(error || isRateLimited) && (
          <div className="flex items-center justify-center gap-2 mb-8 bg-red-500/10 py-3 px-4 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="text-red-400 w-4 h-4 shrink-0" />
            <p className="text-red-400 text-xs leading-tight">
              {isRateLimited ? `Too many attempts. Try again in ${cooldownSeconds} seconds.` : error}
            </p>
          </div>
        )}

        {/* Footer Action */}
        <div className="text-center">
          <button
            onClick={handleLogin}
            disabled={pin.length < 4 || isLoading || authLoading}
            className="w-full bg-[#c8a45b] hover:bg-[#b8944b] disabled:opacity-50 disabled:cursor-not-allowed text-[#0D0D0F] font-bold py-3.5 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-[#c8a45b]/10 mb-6 flex items-center justify-center gap-2"
          >
            {isLoading || authLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'SIGN IN'
            )}
          </button>

          <Link
            to="/login/email"
            className="text-sm text-[#c8a45b]/70 hover:text-[#c8a45b] transition-colors border-b border-[#c8a45b]/20 pb-0.5"
          >
            Switch to Email Login
          </Link>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1A1A1D;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2A30;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c8a45b/30;
        }
      `}</style>
    </div>
  );
}
