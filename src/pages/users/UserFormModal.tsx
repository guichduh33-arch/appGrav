import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import { toast } from 'sonner';
import type { IUserWithRoles } from '@/hooks/useUsers';
import type { Role } from '../../types/auth';

interface IUserFormModalProps {
  user: IUserWithRoles | null;
  roles: Role[];
  onClose: () => void;
  onSave: () => void;
}

function getRoleNameLocal(role: Role): string {
  return role.name_en;
}

export function UserFormModal({ user, roles, onClose, onSave }: IUserFormModalProps) {
  const { user: currentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Safely extract role_ids with error handling
  let initialRoleIds: string[] = [];
  let initialPrimaryRoleId = '';
  if (user?.user_roles && Array.isArray(user.user_roles)) {
    initialRoleIds = user.user_roles
      .map(ur => ur.role?.id)
      .filter((id): id is string => Boolean(id));
    const primaryRole = user.user_roles.find(ur => ur.is_primary);
    initialPrimaryRoleId = primaryRole?.role?.id || '';
  }

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || '',
    employee_code: user?.employee_code || '',
    phone: user?.phone || '',
    preferred_language: 'id' as 'fr' | 'en' | 'id',
    pin: '',
    role_ids: initialRoleIds,
    primary_role_id: initialPrimaryRoleId,
  });

  // Safety check - if roles is not available, show loading state
  if (!roles || roles.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Loading roles...</h2>
          <p className="text-gray-600 mb-4">Roles are not yet available. Please wait or refresh the page.</p>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.id) {
      toast.error('User not logged in');
      return;
    }

    setIsLoading(true);

    try {
      if (user) {
        // Update existing user
        const result = await authService.updateUserDirect(
          user.id,
          {
            first_name: formData.first_name,
            last_name: formData.last_name,
            display_name: formData.display_name || undefined,
            employee_code: formData.employee_code || undefined,
            phone: formData.phone || undefined,
            role_ids: formData.role_ids,
            primary_role_id: formData.primary_role_id,
          }
        );

        if (result.success) {
          toast.success('Saved');
          onSave();
        } else {
          toast.error(result.error || 'Error');
        }
      } else {
        // Create new user
        if (!formData.first_name || !formData.last_name || !formData.primary_role_id) {
          toast.error('Missing required fields');
          setIsLoading(false);
          return;
        }

        const result = await authService.createUserDirect({
          first_name: formData.first_name,
          last_name: formData.last_name,
          display_name: formData.display_name || undefined,
          employee_code: formData.employee_code || undefined,
          phone: formData.phone || undefined,
          preferred_language: formData.preferred_language,
          pin: formData.pin || undefined,
          role_ids: formData.role_ids.length > 0 ? formData.role_ids : [formData.primary_role_id],
          primary_role_id: formData.primary_role_id,
        });

        if (result.success) {
          toast.success('User created');
          onSave();
        } else {
          toast.error(result.error || 'Error');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => {
      const newRoleIds = prev.role_ids.includes(roleId)
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId];

      // If removing primary role, reset it
      if (!newRoleIds.includes(prev.primary_role_id)) {
        return { ...prev, role_ids: newRoleIds, primary_role_id: newRoleIds[0] || '' };
      }

      return { ...prev, role_ids: newRoleIds };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Edit user' : 'New user'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display name
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder={`${formData.first_name} ${formData.last_name}`.trim() || 'Auto'}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Employee code & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Code
              </label>
              <input
                type="text"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value.toUpperCase() })}
                placeholder="EMP-001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
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
                placeholder="+62..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* PIN (only for new users) */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN Code (4-6 digits)
              </label>
              <input
                type="password"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="****"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
              />
            </div>
          )}

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role(s) *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {roles.map(role => (
                <label
                  key={role.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.role_ids.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex-1">{getRoleNameLocal(role)}</span>
                  {formData.role_ids.includes(role.id) && (
                    <label className="flex items-center gap-1 text-xs text-gray-500">
                      <input
                        type="radio"
                        name="primary_role"
                        checked={formData.primary_role_id === role.id}
                        onChange={() => setFormData({ ...formData, primary_role_id: role.id })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      Primary
                    </label>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
