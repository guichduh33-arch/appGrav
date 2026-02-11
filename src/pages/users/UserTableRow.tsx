import {
  Edit2,
  Trash2,
  XCircle,
  Power,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { PermissionGuard } from '../../components/auth/PermissionGuard';
import type { IUserWithRoles } from '@/hooks/useUsers';
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
    <tr className={!user.is_active ? 'row-inactive' : ''}>
      <td>
        <div className="user-cell">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="user-cell__avatar"
            />
          ) : (
            <div className="user-cell__avatar-placeholder">
              {getInitials(user)}
            </div>
          )}
          <div className="user-cell__info">
            <div className="user-cell__name">
              {user.display_name || user.name}
              {isSelf && (
                <span className="user-cell__badge">
                  You
                </span>
              )}
            </div>
            {user.phone && (
              <div className="user-cell__phone">{user.phone}</div>
            )}
          </div>
        </div>
      </td>
      <td>
        <span className="employee-code">
          {user.employee_code || '-'}
        </span>
      </td>
      <td>
        <Badge variant={getRoleBadgeVariant(primaryRole?.code)}>
          {getRoleName(primaryRole)}
        </Badge>
        {user.user_roles && user.user_roles.length > 1 && (
          <span className="extra-roles">
            +{user.user_roles.length - 1}
          </span>
        )}
      </td>
      <td>
        <div className="status-cell">
          <span className={`status-cell__dot ${user.is_active ? 'status-cell__dot--active' : 'status-cell__dot--inactive'}`} />
          <span className="status-cell__text">
            {user.is_active
              ? 'Active'
              : 'Inactive'}
          </span>
        </div>
      </td>
      <td className="last-login">
        {formatLastActive(user.last_login_at)}
      </td>
      <td>
        <div className="actions-cell">
          <PermissionGuard permission="users.update">
            <button
              type="button"
              className="action-btn"
              onClick={() => onEdit(user)}
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
          </PermissionGuard>

          <PermissionGuard permission="users.update">
            <button
              type="button"
              className={`action-btn ${user.is_active ? 'action-btn--deactivate' : 'action-btn--activate'}`}
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
              className="action-btn action-btn--danger"
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
