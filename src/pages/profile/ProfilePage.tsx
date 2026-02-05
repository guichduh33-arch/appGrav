import { useState, useEffect } from 'react';
import {
  User, Key, Shield, Clock, LogOut, Save,
  RefreshCw, Check, X, Camera, Smartphone, Monitor
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { usePermissions } from '../../hooks/usePermissions';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';

interface UserSession {
  id: string;
  device_type: string;
  device_name: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export default function ProfilePage() {
  const { user, roles, permissions, logout, sessionId } = useAuthStore();
  const { primaryRole, isAdmin, isSuperAdmin } = usePermissions();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
  });

  // PIN change state
  const [pinForm, setPinForm] = useState({
    current_pin: '',
    new_pin: '',
    confirm_pin: '',
  });
  const [changingPin, setChangingPin] = useState(false);

  const getLocale = () => enUS;

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        phone: user.phone || '',
      });
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('ended_at', null)
        .order('started_at', { ascending: false });

      if (error) throw error;
      // Map the database fields to our interface
      type SessionRow = {
        id: string;
        device_info?: { type?: string; name?: string } | null;
        ip_address?: string | null;
        started_at: string;
        ended_at?: string | null;
      };
      const rawData = data as unknown as SessionRow[];
      const mapped = rawData.map((s) => ({
        id: s.id,
        device_type: (s.device_info as { type?: string })?.type || 'unknown',
        device_name: (s.device_info as { name?: string })?.name || 'Unknown Device',
        ip_address: s.ip_address || '',
        created_at: s.started_at,
        expires_at: s.ended_at || '',
        is_active: !s.ended_at,
      }));
      setSessions(mapped);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: formData.display_name,
          phone: formData.phone,
        } as never)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePin = async () => {
    if (!user) return;

    if (pinForm.new_pin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    if (pinForm.new_pin !== pinForm.confirm_pin) {
      toast.error('PINs do not match');
      return;
    }

    setChangingPin(true);
    try {
      const result = await authService.changePin(user.id, pinForm.current_pin, pinForm.new_pin);

      if (result.success) {
        toast.success('PIN changed');
        setShowPinModal(false);
        setPinForm({ current_pin: '', new_pin: '', confirm_pin: '' });
      } else {
        toast.error(result.error || 'Error');
      }
    } catch (error) {
      console.error('Error changing PIN:', error);
      toast.error(error instanceof Error ? error.message : 'Error');
    } finally {
      setChangingPin(false);
    }
  };

  const handleTerminateSession = async (sessionIdToTerminate: string) => {
    if (!user) return;
    if (sessionIdToTerminate === sessionId) {
      toast.error('Cannot terminate current session');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ ended_at: new Date().toISOString() } as never)
        .eq('id', sessionIdToTerminate);

      if (error) throw error;

      toast.success('Session terminated');
      loadSessions();
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error(error instanceof Error ? error.message : 'Error');
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const getRoleName = () => {
    if (!primaryRole) return '-';
    const role = primaryRole as { name_fr?: string; name_en?: string; name_id?: string; code: string };
    return role.name_en || role.name_fr || role.code;
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType?.toLowerCase().includes('mobile')) return <Smartphone className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-7 h-7 text-blue-600" />
            My Profile
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your personal information
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h2>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="p-6">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name || 'User'}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow">
                      {(user.display_name || user.first_name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    title="Change avatar"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'}
                  </h3>
                  <p className="text-gray-500">{(user as any).employee_code || '-'}</p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+62..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Name</label>
                      <p className="font-medium">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Display Name</label>
                      <p className="font-medium">{user.display_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone</label>
                      <p className="font-medium">{user.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-400" />
                Security
              </h2>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">PIN Code</p>
                  <p className="text-sm text-gray-500">
                    Used to log in to the POS
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPinModal(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Change PIN
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Active Sessions
              </h2>
              <button
                type="button"
                onClick={loadSessions}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loadingSessions ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No active sessions
                </div>
              ) : (
                sessions.map(session => (
                  <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getDeviceIcon(session.device_type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {session.device_name || session.device_type || 'Unknown'}
                          {session.id === sessionId && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                              Current session
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.ip_address} • {format(new Date(session.created_at), 'Pp', { locale: getLocale() })}
                        </p>
                      </div>
                    </div>
                    {session.id !== sessionId && (
                      <button
                        type="button"
                        onClick={() => handleTerminateSession(session.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Terminate this session"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Role Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Role and Permissions
            </h3>

            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                <Shield className="w-4 h-4" />
                {getRoleName()}
              </span>
            </div>

            {roles.length > 1 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">All roles</p>
                <div className="flex flex-wrap gap-2">
                  {roles.map(role => {
                    const r = role as { id: string; name_fr?: string; name_en?: string; name_id?: string; code: string };
                    return (
                      <span
                        key={r.id}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {r.name_en || r.name_fr || r.code}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-2">
                {permissions.length} permissions
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {isAdmin && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <Check className="w-4 h-4" />
                    Admin
                  </span>
                )}
                {isSuperAdmin && (
                  <span className="flex items-center gap-1 text-red-600">
                    <Check className="w-4 h-4" />
                    Super Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Account Information
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Employee Code</span>
                <span className="font-mono">{(user as any).employee_code || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{user.created_at ? format(new Date(user.created_at), 'P', { locale: getLocale() }) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`flex items-center gap-1 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {user.is_active ? (
                    <>
                      <Check className="w-4 h-4" />
                      Active
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Inactive
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PIN Change Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Change PIN
              </h2>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current PIN
                </label>
                <input
                  type="password"
                  value={pinForm.current_pin}
                  onChange={(e) => setPinForm({ ...pinForm, current_pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-center text-2xl"
                  placeholder="••••"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New PIN
                </label>
                <input
                  type="password"
                  value={pinForm.new_pin}
                  onChange={(e) => setPinForm({ ...pinForm, new_pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-center text-2xl"
                  placeholder="••••"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  value={pinForm.confirm_pin}
                  onChange={(e) => setPinForm({ ...pinForm, confirm_pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tracking-widest text-center text-2xl"
                  placeholder="••••"
                  maxLength={6}
                />
                {pinForm.new_pin && pinForm.confirm_pin && pinForm.new_pin !== pinForm.confirm_pin && (
                  <p className="text-sm text-red-600 mt-1">
                    PINs do not match
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePin}
                disabled={changingPin || !pinForm.current_pin || pinForm.new_pin.length < 4 || pinForm.new_pin !== pinForm.confirm_pin}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {changingPin ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                Change PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
