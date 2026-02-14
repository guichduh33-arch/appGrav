import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Filter, Search } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { supabase } from '@/lib/supabase';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import type { AuditLogEntry } from '@/types/reporting';
import { AuditLogRow } from './audit/AuditLogRow';

const ACTION_TYPES = ['all', 'void', 'refund', 'price_change', 'delete', 'create', 'update'] as const;
const SEVERITIES = ['all', 'info', 'warning', 'critical'] as const;
const PAGE_SIZE = 50;

async function getAuditLogs(
  from: Date,
  to: Date,
  actionType: string,
  severity: string
): Promise<AuditLogEntry[]> {
  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];

  let query = supabase
    .from('audit_logs')
    .select('*')
    .gte('created_at', fromStr)
    .lte('created_at', toStr + 'T23:59:59')
    .order('created_at', { ascending: false });

  if (actionType !== 'all') {
    query = query.eq('action_type', actionType);
  }

  if (severity !== 'all') {
    query = query.eq('severity', severity);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export const AuditTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last7days' });
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['auditLogs', dateRange.from, dateRange.to, actionFilter, severityFilter],
    queryFn: () => getAuditLogs(dateRange.from, dateRange.to, actionFilter, severityFilter),
    staleTime: 60 * 1000,
  });

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter(
      (log) =>
        log.action_type.toLowerCase().includes(term) ||
        log.entity_type.toLowerCase().includes(term) ||
        log.reason?.toLowerCase().includes(term) ||
        log.entity_id?.toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const kpis = useMemo(() => ({
    total: filteredLogs.length,
    critical: filteredLogs.filter((l) => l.severity === 'critical').length,
    warning: filteredLogs.filter((l) => l.severity === 'warning').length,
    info: filteredLogs.filter((l) => l.severity === 'info').length,
  }), [filteredLogs]);

  const exportConfig: ExportConfig<AuditLogEntry> = useMemo(() => ({
    data: filteredLogs,
    columns: [
      { key: 'created_at', header: 'Date', format: (v) => new Date(v as string).toLocaleString() },
      { key: 'action_type', header: 'Action' },
      { key: 'entity_type', header: 'Entity' },
      { key: 'severity', header: 'Severity' },
      { key: 'reason', header: 'Reason' },
    ],
    filename: 'audit-log',
    title: 'Audit Log Report',
    dateRange,
    summaries: [
      { label: 'Total Entries', value: kpis.total.toString() },
      { label: 'Critical', value: kpis.critical.toString() },
      { label: 'Warning', value: kpis.warning.toString() },
    ],
  }), [filteredLogs, dateRange, kpis]);

  const toggleRowExpand = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading audit logs. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last7days" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Entries</span>
          </div>
          <p className="text-2xl font-bold text-white">{kpis.total}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{kpis.critical}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Warning</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{kpis.warning}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Info</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{kpis.info}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            placeholder="Search action, entity, reason..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--theme-text-muted)]" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          >
            {ACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Actions' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
        >
          {SEVERITIES.map((sev) => (
            <option key={sev} value={sev}>
              {sev === 'all' ? 'All Severities' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Audit Logs */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
          <span className="text-sm text-[var(--theme-text-muted)]">
            Showing {paginatedLogs.length} of {filteredLogs.length} entries
          </span>
        </div>

        <div>
          {paginatedLogs.length === 0 ? (
            <div className="p-8 text-center text-[var(--theme-text-muted)]">
              No audit entries found for this period.
            </div>
          ) : (
            paginatedLogs.map((log) => (
              <AuditLogRow
                key={log.id}
                log={log}
                isExpanded={expandedRows.has(log.id)}
                onToggle={() => toggleRowExpand(log.id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium bg-transparent border border-white/10 text-white hover:border-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--theme-text-muted)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium bg-transparent border border-white/10 text-white hover:border-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
