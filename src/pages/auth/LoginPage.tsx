import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './LoginPage.css';
import { UserProfile } from '../../types/database';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { loginWithPin, isLoading: authLoading, isAuthenticated } = useAuthStore();

  const [users, setUsers] = useState<UserProfile[]>([]);
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

  // Demo users fallback - ONLY enabled in development mode
  // In production, this should be empty to prevent credential exposure
  const isDevelopment = import.meta.env.DEV;
  const DEMO_USERS: UserProfile[] = isDevelopment ? [
    { id: 'a1110000-0000-0000-0000-000000000001', name: 'Apni', role: 'cashier', pin_code: import.meta.env.VITE_DEMO_PIN_CASHIER || '', is_active: true } as UserProfile,
    { id: 'a1110000-0000-0000-0000-000000000002', name: 'Dani', role: 'manager', pin_code: import.meta.env.VITE_DEMO_PIN_MANAGER || '', is_active: true } as UserProfile,
    { id: 'a1110000-0000-0000-0000-000000000004', name: 'Bayu', role: 'barista', pin_code: import.meta.env.VITE_DEMO_PIN_BARISTA || '', is_active: true } as UserProfile,
    { id: 'a1110000-0000-0000-0000-000000000005', name: 'Admin', role: 'admin', pin_code: import.meta.env.VITE_DEMO_PIN_ADMIN || '', is_active: true } as UserProfile,
  ] : [];

  // Load real users from Supabase (with demo fallback)
  useEffect(() => {
    async function loadUsers() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, name, display_name, role, is_active, avatar_url, employee_code, pin_code')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        // If Supabase returns empty (RLS blocking), use demo users
        if (data && data.length > 0) {
          setUsers(data as UserProfile[]);
        } else {
          console.warn('No users from Supabase, using demo fallback');
          setUsers(DEMO_USERS);
        }
      } catch (err) {
        console.error('Error loading users:', err);
        // Fallback to demo users on error
        setUsers(DEMO_USERS);
        toast.error(t('auth.errors.demoMode') || 'Mode demo activ (base de donnes inaccessible)');
      }
    }
    loadUsers();
  }, [t]);

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
      setError(t('auth.login.selectUser') || 'Veuillez slectionner un utilisateur');
      return;
    }
    if (pin.length < 4) {
      setError(t('auth.errors.pinTooShort') || 'Code PIN trop court');
      return;
    }

    setIsLoading(true);
    setError('');
    setAttemptsRemaining(null);
    setLockedUntil(null);

    try {
      // Try the new auth system first
      const result = await loginWithPin(selectedUser, pin);

      if (result.success) {
        const user = users.find(u => u.id === selectedUser);
        toast.success(`${t('common.welcome') || 'Bienvenue'}, ${user?.display_name || user?.name}!`);
        navigate('/pos');
        return;
      }

      // Handle specific errors
      if (result.error === 'account_locked') {
        setLockedUntil(result.error);
        setError(t('auth.errors.accountLocked', { minutes: 15 }) || 'Compte verrouill. Ressayez dans 15 minutes.');
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

  // Demo login fallback - only for when bcrypt RPC is unavailable
  const handleDemoLogin = async (user: UserProfile) => {
    // Try to get plaintext PIN from demo users
    const demoUser = DEMO_USERS.find(u =>
      u.name.toLowerCase() === user?.name?.toLowerCase() ||
      u.id === user.id
    );

    if (!demoUser?.pin_code) {
      setError(t('auth.errors.noPinSet') || 'Aucun code PIN défini (mode demo)');
      return;
    }

    if (demoUser.pin_code !== pin) {
      setError(t('auth.errors.invalidPin') || 'Code PIN incorrect');
      return;
    }

    // Demo login successful - load basic permissions
    const { login } = useAuthStore.getState();
    login(user);
    toast.success(`${t('common.welcome') || 'Bienvenue'}, ${user.display_name || user.name}! (Demo)`);
    navigate('/pos');
  };

  // Legacy login for demo mode or when Edge Functions are unavailable
  const handleLegacyLogin = async () => {
    // First check if we have PIN in current users list
    let user = users.find(u => u.id === selectedUser);

    if (!user) {
      setError(t('auth.errors.userNotFound') || 'Utilisateur non trouvé');
      return;
    }

    // Use secure bcrypt verification via RPC (preferred method)
    try {
      const { data: isValid, error: verifyError } = await supabase.rpc('verify_user_pin', {
        p_user_id: selectedUser,
        p_pin: pin
      });

      if (verifyError) {
        console.error('PIN verification error:', verifyError);
        // Fall back to plaintext check for demo mode
        await handleDemoLogin(user);
        return;
      }

      if (!isValid) {
        setError(t('auth.errors.invalidPin') || 'Code PIN incorrect');
        return;
      }
    } catch (rpcError) {
      console.error('RPC error, falling back to demo:', rpcError);
      await handleDemoLogin(user);
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

      const roles = (userRoles?.map(ur => ur.role).filter((r): r is NonNullable<typeof r> => r !== null) || []) as Role[];

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

      toast.success(`${t('common.welcome') || 'Bienvenue'}, ${user.display_name || user.name}!`);
      navigate('/pos');
    } catch (err) {
      console.error('Error loading permissions:', err);
      // Fallback to basic login without permissions
      const { login } = useAuthStore.getState();
      login(user);
      toast.success(`${t('common.welcome') || 'Bienvenue'}, ${user.display_name || user.name}!`);
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
          <p className="login-logo__subtitle">{t('auth.login.title') || 'Point de Vente'}</p>
        </div>

        {/* Language selector */}
        <div className="login-language">
          <button
            type="button"
            className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('fr')}
          >
            FR
          </button>
          <button
            type="button"
            className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={`lang-btn ${i18n.language === 'id' ? 'active' : ''}`}
            onClick={() => i18n.changeLanguage('id')}
          >
            ID
          </button>
        </div>

        {/* User Selection */}
        <div className="login-section">
          <label className="login-label">
            {t('auth.login.selectUser') || 'Slectionnez votre profil'}
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
            title={t('auth.login.selectUser') || 'Slectionnez votre profil'}
            aria-label={t('auth.login.selectUser') || 'Slection du profil utilisateur'}
          >
            <option value="">-- {t('common.choose') || 'Choisir'} --</option>
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
              {t('auth.login.pin') || 'Code PIN'}
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
                {' '}({attemptsRemaining} {t('auth.errors.attemptsRemaining') || 'tentatives restantes'})
              </span>
            )}
          </div>
        )}

        {/* Locked Message */}
        {lockedUntil && (
          <div className="login-locked">
            🔒 {t('auth.errors.accountLocked', { minutes: 15 }) || 'Compte verrouill temporairement'}
          </div>
        )}

        {/* Login Button */}
        <button
          type="button"
          className="btn btn-primary btn-block login-btn"
          onClick={handleLogin}
          disabled={!selectedUser || pin.length < 4 || isLoading || authLoading}
        >
          {isLoading || authLoading
            ? (t('common.loading') || 'Connexion...')
            : (t('auth.login.submit') || 'Se connecter')}
        </button>

        {/* Demo hint - only shown in development */}
        {isDevelopment && import.meta.env.VITE_SHOW_DEMO_HINT === 'true' && (
          <p className="login-hint">
            💡 {t('auth.login.demoMode') || 'Demo mode - check .env for PINs'}
          </p>
        )}
      </div>
    </div>
  );
}
