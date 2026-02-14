import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { ISessionCashBalanceReport } from '@/types/reporting';

export function SessionCashBalanceTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last7days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['session-cash-balance', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSessionCashBalance(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalSessions: 0, totalRevenue: 0, totalDifference: 0, sessionsWithDiff: 0 };
    }
    return {
      totalSessions: data.length,
      totalRevenue: data.reduce((sum, s) => sum + (s.total_revenue || 0), 0),
      totalDifference: data.reduce((sum, s) => sum + Math.abs(s.cash_difference || 0), 0),
      sessionsWithDiff: data.filter((s) => Math.abs(s.cash_difference || 0) > 1000).length,
    };
  }, [data]);

  const exportConfig: ExportConfig<ISessionCashBalanceReport> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'terminal_id', header: 'Terminal', format: (v) => (v as string) || 'Main' },
      { key: 'cashier_name', header: 'Cashier' },
      { key: 'started_at', header: 'Opened', format: (v) => new Date(v as string).toLocaleString('en-US') },
      { key: 'ended_at', header: 'Closed', format: (v) => v ? new Date(v as string).toLocaleString('en-US') : 'In Progress' },
      { key: 'opening_cash', header: 'Opening Cash', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'cash_received', header: 'Cash Received', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'expected_cash', header: 'Expected', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'closing_cash', header: 'Counted', align: 'right' as const, format: (v) => v ? formatCurrencyPdf(v as number) : '-' },
      { key: 'cash_difference', header: 'Variance', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
    ],
    filename: 'cash-balance',
    title: 'Cash Balance',
    dateRange,
    summaries: [
      { label: 'Sessions', value: summary.totalSessions.toString() },
      { label: 'Total Revenue', value: formatCurrencyPdf(summary.totalRevenue) },
      { label: 'Sessions with Variance', value: summary.sessionsWithDiff.toString() },
    ],
  }), [data, dateRange, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getDifferenceBadge = (diff: number) => {
    const absDiff = Math.abs(diff);
    if (absDiff <= 1000) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full">
          <CheckCircle className="w-3 h-3" />
          OK
        </span>
      );
    }
    if (absDiff <= 10000) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          {diff > 0 ? '+' : ''}{formatCurrency(diff)}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded-full">
        <AlertTriangle className="w-3 h-3" />
        {diff > 0 ? '+' : ''}{formatCurrency(diff)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'open') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/5 text-[var(--theme-text-muted)] rounded-full">
        Closed
      </span>
    );
  };

  if (error) {
    return <div className="p-8 text-center text-red-400">Error loading data</div>;
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Sessions</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalSessions}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalRevenue)}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Variance</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(summary.totalDifference)}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Sessions with Variance</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{summary.sessionsWithDiff}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Cash Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Cashier</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Opened</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Closed</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Orders</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Revenue</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Cash</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Expected</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Counted</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Variance</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.session_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--theme-text-muted)]" />
                        <span className="text-sm font-medium text-white">{row.cashier_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                      {new Date(row.started_at).toLocaleString('en-US', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                      {row.ended_at
                        ? new Date(row.ended_at).toLocaleString('en-US', {
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                          })
                        : <span className="text-blue-400 italic">In Progress</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-white text-right">{row.order_count}</td>
                    <td className="px-6 py-4 text-sm text-white text-right font-medium">
                      {formatCurrency(row.total_revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">
                      {formatCurrency(row.cash_received)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white text-right font-medium">
                      {formatCurrency(row.expected_cash)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">
                      {row.closing_cash !== null ? formatCurrency(row.closing_cash) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getDifferenceBadge(row.cash_difference)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(row.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                    No sessions in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
