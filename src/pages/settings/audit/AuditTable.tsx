import { RefreshCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { IAuditLogWithUser } from '@/hooks/useAuditLogs';

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-emerald-500/20 text-emerald-400',
  logout: 'bg-white/10 text-[var(--theme-text-secondary)]',
  create: 'bg-blue-500/20 text-blue-400',
  update: 'bg-amber-500/20 text-amber-400',
  delete: 'bg-red-500/20 text-red-400',
  view: 'bg-purple-500/20 text-purple-400',
  export: 'bg-cyan-500/20 text-cyan-400',
  default: 'bg-white/10 text-[var(--theme-text-secondary)]',
};

const TABLE_LABELS: Record<string, string> = {
  user_profiles: 'Users',
  roles: 'Roles',
  permissions: 'Permissions',
  user_roles: 'User Roles',
  user_permissions: 'User Permissions',
  user_sessions: 'Sessions',
  products: 'Products',
  orders: 'Orders',
  customers: 'Customers',
  stock_movements: 'Stock Movements',
  pos_sessions: 'POS Sessions',
};

interface AuditTableProps {
  logs: IAuditLogWithUser[];
  isLoading: boolean;
  page: number;
  totalCount: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onSelectLog: (log: IAuditLogWithUser) => void;
}

export function AuditTable({
  logs, isLoading, page, totalCount, totalPages, perPage,
  onPageChange, onSelectLog,
}: AuditTableProps) {
  const getActionColor = (action: string) => ACTION_COLORS[action] || ACTION_COLORS.default;
  const getTableLabel = (table: string) => TABLE_LABELS[table] || table;

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              {['Date', 'User', 'Action', 'Module', 'Record ID', 'IP', 'Actions'].map((h) => (
                <th key={h} className={`px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] ${h === 'Actions' ? 'text-center' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-[var(--theme-text-secondary)]">
                    {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: enUS })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {log.user_profiles?.avatar_url ? (
                        <img
                          src={log.user_profiles.avatar_url}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-[var(--theme-text-secondary)]">
                          {(log.user_profiles?.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-white">
                        {log.user_profiles?.display_name || log.user_profiles?.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--theme-text-secondary)]">
                    {log.table_name ? getTableLabel(log.table_name) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--theme-text-muted)] font-mono">
                    {log.record_id ? log.record_id.slice(0, 8) + '...' : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--theme-text-muted)] font-mono">
                    {log.ip_address || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectLog(log)}
                      className="p-1 hover:bg-white/[0.04] rounded-lg transition-colors"
                      title="Details"
                      aria-label="Details"
                    >
                      <Eye className="w-4 h-4 text-[var(--theme-text-secondary)]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
          <p className="text-sm text-[var(--theme-text-muted)]">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 hover:bg-white/[0.04] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--theme-text-secondary)]" />
            </button>
            <span className="text-sm text-[var(--theme-text-secondary)]">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 hover:bg-white/[0.04] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-5 h-5 text-[var(--theme-text-secondary)]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
