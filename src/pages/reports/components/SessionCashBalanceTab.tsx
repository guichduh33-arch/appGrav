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

  // Summary stats
  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalSessions: 0, totalRevenue: 0, totalDifference: 0, sessionsWithDiff: 0 };
    }

    const stats = {
      totalSessions: data.length,
      totalRevenue: data.reduce((sum, s) => sum + (s.total_revenue || 0), 0),
      totalDifference: data.reduce((sum, s) => sum + Math.abs(s.cash_difference || 0), 0),
      sessionsWithDiff: data.filter((s) => Math.abs(s.cash_difference || 0) > 1000).length,
    };

    return stats;
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<ISessionCashBalanceReport> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'terminal_id', header: 'Terminal', format: (v) => (v as string) || 'Principal' },
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
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          <CheckCircle className="w-3 h-3" />
          OK
        </span>
      );
    }
    if (absDiff <= 10000) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          {diff > 0 ? '+' : ''}{formatCurrency(diff)}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
        <AlertTriangle className="w-3 h-3" />
        {diff > 0 ? '+' : ''}{formatCurrency(diff)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'open') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
        Closed
      </span>
    );
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading data
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Sessions</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalSessions}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Total Variance</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(summary.totalDifference)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Sessions with Variance</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {summary.sessionsWithDiff}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cash Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opened</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closed</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cash</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expected</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Counted</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.session_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{row.cashier_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(row.started_at).toLocaleString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.ended_at
                        ? new Date(row.ended_at).toLocaleString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : <span className="text-blue-600 italic">In Progress</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{row.order_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(row.total_revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {formatCurrency(row.cash_received)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(row.expected_cash)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
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
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
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
