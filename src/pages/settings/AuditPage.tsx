import { useState } from 'react';
import {
  FileText, Search, RefreshCw, Calendar, User,
  ChevronLeft, ChevronRight, Eye, X, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useAuditLogs, useAuditUsers, type IAuditLogWithUser } from '@/hooks/useAuditLogs';

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-100 text-green-700',
  logout: 'bg-gray-100 text-gray-700',
  create: 'bg-blue-100 text-blue-700',
  update: 'bg-amber-100 text-amber-700',
  delete: 'bg-red-100 text-red-700',
  view: 'bg-purple-100 text-purple-700',
  export: 'bg-cyan-100 text-cyan-700',
  default: 'bg-gray-100 text-gray-700',
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

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<IAuditLogWithUser | null>(null);

  // Filters
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 50;

  // Use English locale for date formatting
  const getLocale = () => enUS;

  // Data via hooks
  const { data: usersData = [] } = useAuditUsers();
  const { data: logsData, isLoading, refetch: refetchLogs } = useAuditLogs({
    page,
    perPage,
    filterAction,
    filterTable: '',
    filterUser,
    dateRange,
    customStart,
    customEnd,
  });

  const logs = logsData?.logs ?? [];
  const totalCount = logsData?.totalCount ?? 0;
  const users = usersData;

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Action', 'Table', 'Record ID', 'IP'];
    const rows = logs.map(log => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.user_profiles?.display_name || log.user_profiles?.name || '-',
      log.action,
      log.table_name || '-',
      log.record_id || '-',
      log.ip_address || '-',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || ACTION_COLORS.default;
  };

  const getTableLabel = (table: string) => {
    return TABLE_LABELS[table] || table;
  };

  const totalPages = Math.ceil(totalCount / perPage);

  const filteredLogs = searchQuery
    ? logs.filter(log =>
      (log.user_profiles?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.table_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.record_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    : logs;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Audit Log
          </h1>
          <p className="text-gray-500 mt-1">
            User action history
          </p>
        </div>

        <button
          type="button"
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Search"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as 'today' | '7days' | '30days' | 'custom')}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              title="Date Range"
              aria-label="Date Range"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="Start Date"
                aria-label="Start Date"
              />
              <span className="text-gray-400">→</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="End Date"
                aria-label="End Date"
              />
            </>
          )}

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            title="Filter by action"
            aria-label="Filter by action"
          >
            <option value="">All actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
          </select>

          {/* User Filter */}
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            <select
              value={filterUser}
              onChange={(e) => { setFilterUser(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              title="Filter by user"
              aria-label="Filter by user"
            >
              <option value="">All users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => refetchLogs()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-600">Logins</p>
          <p className="text-2xl font-bold text-green-700">
            {logs.filter(l => l.action === 'login').length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-600">Creates</p>
          <p className="text-2xl font-bold text-blue-700">
            {logs.filter(l => l.action === 'create').length}
          </p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-600">Updates</p>
          <p className="text-2xl font-bold text-amber-700">
            {logs.filter(l => l.action === 'update').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Module
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Record ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  IP
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: getLocale() })}
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
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {(log.user_profiles?.name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-gray-900">
                          {log.user_profiles?.display_name || log.user_profiles?.name || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.table_name ? getTableLabel(log.table_name) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {log.record_id ? log.record_id.slice(0, 8) + '...' : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Details"
                        aria-label="Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
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
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Log Details
              </h2>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Date</label>
                    <p className="font-medium">
                      {format(new Date(selectedLog.created_at), 'PPpp', { locale: getLocale() })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">User</label>
                    <p className="font-medium">
                      {selectedLog.user_profiles?.display_name || selectedLog.user_profiles?.name || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Action</label>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Module</label>
                    <p className="font-medium">{selectedLog.table_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Record ID</label>
                    <p className="font-mono text-sm">{selectedLog.record_id || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">IP Address</label>
                    <p className="font-mono text-sm">{selectedLog.ip_address || '-'}</p>
                  </div>
                </div>

                {selectedLog.user_agent && (
                  <div>
                    <label className="text-sm text-gray-500">User Agent</label>
                    <p className="text-sm text-gray-600 break-all">{selectedLog.user_agent}</p>
                  </div>
                )}

                {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">
                      Old Values
                    </label>
                    <pre className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">
                      New Values
                    </label>
                    <pre className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
