import {
  Edit2,
  Trash2,
  XCircle,
  Power,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import type { IUserWithRoles } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';
import {
  getInitials,
  getPrimaryRole,
  getRoleName,
  getRoleBadgeVariant,
  formatLastActive,
} from './usersPageHelpers';

interface IUserTableRowProps {
  user: IUserWithRoles;
  isSelf: boolean;
  onEdit: (user: IUserWithRoles) => void;
  onToggleActive: (userId: string, currentStatus: boolean) => void;
  onDeleteConfirm: (userId: string) => void;
}

export function UserTableRow({
  user,
  isSelf,
  onEdit,
  onToggleActive,
  onDeleteConfirm,
}: IUserTableRowProps) {
  const primaryRole = getPrimaryRole(user);

  return (
    <tr className={cn('border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50 last:border-b-0', !user.is_active && 'opacity-60')}>
      <td className="px-6 py-4 align-middle">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(user)}
            </div>
          )}
          <div className="flex flex-col">
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {user.display_name || user.name}
              {isSelf && (
                <span className="text-[0.625rem] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                  You
                </span>
              )}
            </div>
            {user.phone && (
              <div className="text-sm text-gray-500">{user.phone}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 align-middle">
        <span className="font-mono text-sm text-gray-600">
          {user.employee_code || '-'}
        </span>
      </td>
      <td className="px-6 py-4 align-middle">
        <Badge variant={getRoleBadgeVariant(primaryRole?.code)}>
          {getRoleName(primaryRole)}
        </Badge>
        {user.user_roles && user.user_roles.length > 1 && (
          <span className="ml-2 text-xs text-gray-400">
            +{user.user_roles.length - 1}
          </span>
        )}
      </td>
      <td className="px-6 py-4 align-middle">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', user.is_active ? 'bg-green-500' : 'bg-gray-300')} />
          <span className="text-sm text-gray-700">
            {user.is_active
              ? 'Active'
              : 'Inactive'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 align-middle text-sm text-gray-500">
        {formatLastActive(user.last_login_at)}
      </td>
      <td className="px-6 py-4 align-middle text-right">
        <div className="flex items-center justify-end gap-1">
          <PermissionGuard permission="users.update">
            <button
              type="button"
              className="p-2 border-none bg-transparent rounded-md cursor-pointer text-gray-500 transition-all duration-150 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900"
              onClick={() => onEdit(user)}
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
          </PermissionGuard>

          <PermissionGuard permission="users.update">
            <button
              type="button"
              className={cn(
                'p-2 border-none bg-transparent rounded-md cursor-pointer transition-all duration-150 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed',
                user.is_active ? 'text-orange-500' : 'text-green-500'
              )}
              onClick={() => onToggleActive(user.id, user.is_active)}
              disabled={isSelf}
              title={user.is_active ? 'Deactivate' : 'Activate'}
            >
              {user.is_active ? (
                <XCircle size={16} />
              ) : (
                <Power size={16} />
              )}
            </button>
          </PermissionGuard>

          <PermissionGuard permission="users.delete">
            <button
              type="button"
              className="p-2 border-none bg-transparent rounded-md cursor-pointer text-gray-500 transition-all duration-150 flex items-center justify-center hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => onDeleteConfirm(user.id)}
              disabled={isSelf || primaryRole?.code === 'SUPER_ADMIN'}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </PermissionGuard>
        </div>
      </td>
    </tr>
  );
}
