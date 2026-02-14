import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuditLogs, useAuditUsers, type IAuditLogWithUser } from '@/hooks/useAuditLogs';
import { AuditFilters } from './audit/AuditFilters';
import { AuditTable } from './audit/AuditTable';
import { AuditDetailModal } from './audit/AuditDetailModal';

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

  // Data via hooks
  const { data: usersData = [] } = useAuditUsers();
  const { data: logsData, isLoading, refetch: refetchLogs } = useAuditLogs({
    page, perPage, filterAction, filterTable: '',
    filterUser, dateRange, customStart, customEnd,
  });

  const logs = logsData?.logs ?? [];
  const totalCount = logsData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / perPage);

  const filteredLogs = searchQuery
    ? logs.filter(log =>
      (log.user_profiles?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.table_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.record_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    : logs;

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-[var(--color-gold)]" />
            Audit Log
          </h1>
          <p className="text-[var(--theme-text-muted)] mt-1">User action history</p>
        </div>
        <button
          type="button"
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/10 text-white rounded-xl hover:border-white/20 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      <AuditFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        filterAction={filterAction}
        onFilterActionChange={(v) => { setFilterAction(v); setPage(1); }}
        filterUser={filterUser}
        onFilterUserChange={(v) => { setFilterUser(v); setPage(1); }}
        users={usersData}
        isLoading={isLoading}
        onRefresh={() => refetchLogs()}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total</p>
          <p className="text-2xl font-bold text-white">{totalCount}</p>
        </div>
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Logins</p>
          <p className="text-2xl font-bold text-emerald-400">
            {logs.filter(l => l.action === 'login').length}
          </p>
        </div>
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">Creates</p>
          <p className="text-2xl font-bold text-blue-400">
            {logs.filter(l => l.action === 'create').length}
          </p>
        </div>
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Updates</p>
          <p className="text-2xl font-bold text-amber-400">
            {logs.filter(l => l.action === 'update').length}
          </p>
        </div>
      </div>

      <AuditTable
        logs={filteredLogs}
        isLoading={isLoading}
        page={page}
        totalCount={totalCount}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={setPage}
        onSelectLog={setSelectedLog}
      />

      {/* Detail Modal */}
      {selectedLog && (
        <AuditDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
