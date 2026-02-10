import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { XCircle, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { ICancellationsReport } from '@/types/reporting';

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

export function SalesCancellationTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last7days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['cancellations', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getCancellations(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  // Group by reason for pie chart
  const reasonData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const reasonMap = new Map<string, { count: number; value: number }>();

    data.forEach((d) => {
      const reason = d.cancel_reason || 'Not Specified';
      const existing = reasonMap.get(reason) || { count: 0, value: 0 };
      reasonMap.set(reason, {
        count: existing.count + 1,
        value: existing.value + (d.order_total || 0),
      });
    });

    return Array.from(reasonMap.entries())
      .map(([reason, stats]) => ({
        reason,
        count: stats.count,
        value: stats.value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Summary stats
  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalCancelled: 0, totalValue: 0, avgValue: 0 };
    }

    const totalValue = data.reduce((sum, d) => sum + (d.order_total || 0), 0);

    return {
      totalCancelled: data.length,
      totalValue,
      avgValue: totalValue / data.length,
    };
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<ICancellationsReport> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'order_number', header: 'Order #' },
      { key: 'cancelled_at', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'cashier_name', header: 'Cashier', format: (v) => (v as string) || '-' },
      { key: 'order_total', header: 'Amount', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'cancel_reason', header: 'Reason', format: (v) => (v as string) || 'Not Specified' },
      { key: 'items_count', header: 'Items', align: 'right' as const },
    ],
    filename: 'cancellations',
    title: 'Cancellation Report',
    dateRange,
    summaries: [
      { label: 'Total Cancelled', value: formatCurrencyPdf(summary.totalValue) },
      { label: 'Number of Cancellations', value: summary.totalCancelled.toString() },
    ],
  }), [data, dateRange, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Cancellations</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {summary.totalCancelled}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Cancelled Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalValue)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Avg / Cancellation</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.avgValue)}
          </p>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart by Reason */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Cancellations by Reason</h3>

          {reasonData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No cancellations in this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={reasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="reason"
                  label={({ name, percent }) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {reasonData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), 'Value']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Reason Breakdown Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Breakdown by Reason</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reasonData.map((row, idx) => (
                  <tr key={row.reason} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-900">{row.reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.count}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Cancellations Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cancellation List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.order_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.order_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(row.cancelled_at).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.cashier_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.items_count}</td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right font-medium">
                      {formatCurrency(row.order_total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {row.cancel_reason || 'Not Specified'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No cancellations in this period
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
