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

  // Demo users fallback (used when RLS blocks anonymous access or Edge Functions unavailable)
  const DEMO_USERS: UserProfile[] = [
    { id: 'a1110000-0000-0000-0000-000000000001', name: 'Apni', role: 'cashier', pin_code: '1234', is_active: true } as UserProfile,
    { id: 'a1110000-0000-0000-0000-000000000002', name: 'Dani', role: 'manager', pin_code: '0000', is_active: true } as UserProfile,
    { id: 'a1110000-0000-0000-0000-000000000004', name: 'Bayu', role: 'barista', pin_code: '2222', is_active: true } as UserProfile,
    { id: 'a1110000-0000-0000-0000-000000000005', name: 'Admin', role: 'admin', pin_code: '9999', is_active: true } as UserProfile,
  ];

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

  // Legacy login for demo mode or when Edge Functions are unavailable
  const handleLegacyLogin = async () => {
    // First check if we have PIN in current users list
    let user = users.find(u => u.id === selectedUser);

    if (!user) {
      setError(t('auth.errors.userNotFound') || 'Utilisateur non trouvé');
      return;
    }

    // If user doesn't have pin_code locally, fetch it from database
    if (!user.pin_code) {
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('pin_code')
        .eq('id', selectedUser)
        .single();

      if (userData?.pin_code) {
        user = { ...user, pin_code: userData.pin_code } as UserProfile;
      } else {
        // Try demo users as last resort
        const demoUser = DEMO_USERS.find(u =>
          u.name.toLowerCase() === user?.name?.toLowerCase() ||
          u.id === selectedUser
        );
        if (demoUser?.pin_code) {
          user = { ...user, pin_code: demoUser.pin_code } as UserProfile;
        }
      }
    }

    // Check PIN against pin_code field (legacy)
    if (!user.pin_code) {
      setError(t('auth.errors.noPinSet') || 'Aucun code PIN défini pour cet utilisateur');
      return;
    }

    if (user.pin_code !== pin) {
      setError(t('auth.errors.invalidPin') || 'Code PIN incorrect');
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
        .eq('user_id', user.id);

      const roles = userRoles?.map(ur => ur.role).filter(Boolean) || [];

      // Get permissions from role_permissions
      const roleIds = roles.map((r: { id: string }) => r.id);
      let permissions: { permission_code: string; permission_module: string; is_granted: boolean; is_sensitive: boolean }[] = [];

      if (roleIds.length > 0) {
        const { data: rolePerms } = await supabase
          .from('role_permissions')
          .select(`
            permission:permissions (code, module, action, is_sensitive)
          `)
          .in('role_id', roleIds);

        permissions = rolePerms?.map(rp => ({
          permission_code: rp.permission?.code,
          permission_module: rp.permission?.module,
          is_granted: true,
          is_sensitive: rp.permission?.is_sensitive || false,
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

        {/* Demo hint */}
        <p className="login-hint">
          💡 Demo: Admin=9999, Manager=0000, Cashier=1234
        </p>
      </div>
    </div>
  );
}
