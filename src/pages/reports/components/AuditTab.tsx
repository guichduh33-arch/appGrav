import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ChevronDown, ChevronUp, Filter, Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import type { AuditLogEntry } from '@/types/reporting';

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

  // Filter by search
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

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  // KPIs
  const kpis = useMemo(() => ({
    total: filteredLogs.length,
    critical: filteredLogs.filter((l) => l.severity === 'critical').length,
    warning: filteredLogs.filter((l) => l.severity === 'warning').length,
    info: filteredLogs.filter((l) => l.severity === 'info').length,
  }), [filteredLogs]);

  // Export config
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 text-xs font-bold uppercase bg-red-100 text-red-700 rounded">Critical</span>;
      case 'warning':
        return <span className="px-2 py-0.5 text-xs font-bold uppercase bg-orange-100 text-orange-700 rounded">Warning</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-bold uppercase bg-blue-100 text-blue-700 rounded">Info</span>;
    }
  };

  const renderDiff = (oldVal: unknown, newVal: unknown) => {
    if (!oldVal && !newVal) return <span className="text-gray-400">No changes recorded</span>;

    const oldStr = oldVal ? JSON.stringify(oldVal, null, 2) : null;
    const newStr = newVal ? JSON.stringify(newVal, null, 2) : null;

    return (
      <div className="grid grid-cols-2 gap-4 text-sm font-mono">
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">Old Value</div>
          {oldStr ? (
            <pre className="bg-red-50 p-2 rounded text-red-800 overflow-auto max-h-40">{oldStr}</pre>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">New Value</div>
          {newStr ? (
            <pre className="bg-green-50 p-2 rounded text-green-800 overflow-auto max-h-40">{newStr}</pre>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading audit logs. Please try again.
      </div>
    );
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
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total Entries</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.total}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.critical}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Warning</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.warning}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Info</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.info}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search action, entity, reason..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SEVERITIES.map((sev) => (
            <option key={sev} value={sev}>
              {sev === 'all' ? 'All Severities' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
          <span className="text-sm text-gray-500">
            Showing {paginatedLogs.length} of {filteredLogs.length} entries
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No audit entries found for this period.
            </div>
          ) : (
            paginatedLogs.map((log) => (
              <div key={log.id} className="hover:bg-gray-50 transition-colors">
                <div
                  className="p-4 cursor-pointer flex justify-between items-start"
                  onClick={() => toggleRowExpand(log.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(log.severity)}
                      <span className="font-medium text-gray-900 capitalize">
                        {log.action_type}
                      </span>
                      <span className="text-gray-400">on</span>
                      <span className="text-gray-700">{log.entity_type}</span>
                      {log.entity_id && (
                        <span className="text-xs text-gray-400 font-mono">
                          ({log.entity_id.slice(0, 8)}...)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{log.reason || 'No reason provided'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    {expandedRows.has(log.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedRows.has(log.id) && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="pt-4">
                      {renderDiff(log.old_value, log.new_value)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
