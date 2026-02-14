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

  const reasonData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const reasonMap = new Map<string, { count: number; value: number }>();
    data.forEach((d) => {
      const reason = d.cancel_reason || 'Not Specified';
      const existing = reasonMap.get(reason) || { count: 0, value: 0 };
      reasonMap.set(reason, { count: existing.count + 1, value: existing.value + (d.order_total || 0) });
    });
    return Array.from(reasonMap.entries()).map(([reason, stats]) => ({ reason, count: stats.count, value: stats.value })).sort((a, b) => b.value - a.value);
  }, [data]);

  const summary = useMemo(() => {
    if (!data || data.length === 0) return { totalCancelled: 0, totalValue: 0, avgValue: 0 };
    const totalValue = data.reduce((sum, d) => sum + (d.order_total || 0), 0);
    return { totalCancelled: data.length, totalValue, avgValue: totalValue / data.length };
  }, [data]);

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

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';

  if (error) return <div className="p-8 text-center text-red-400">Error loading data</div>;
  if (isLoading) return <ReportSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last7days" />
        <ExportButtons config={exportConfig} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-red-500/10 rounded-lg"><XCircle className="w-5 h-5 text-red-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Cancellations</span></div>
          <p className="text-2xl font-bold text-red-400">{summary.totalCancelled}</p>
        </div>
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-amber-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-amber-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Cancelled Value</span></div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalValue)}</p>
        </div>
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-yellow-500/10 rounded-lg"><AlertTriangle className="w-5 h-5 text-yellow-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Avg / Cancellation</span></div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.avgValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Cancellations by Reason</h3>
          {reasonData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[var(--theme-text-muted)]">No cancellations in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={reasonData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" nameKey="reason" label={({ name, percent }) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {reasonData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Value']} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5"><h3 className="text-lg font-semibold text-white">Breakdown by Reason</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Reason</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Count</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reasonData.map((row, idx) => (
                  <tr key={row.reason} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-sm font-medium text-white">{row.reason}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.count}</td>
                    <td className="px-6 py-4 text-sm text-white text-right font-medium">{formatCurrency(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5"><h3 className="text-lg font-semibold text-white">Cancellation List</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Order #</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Cashier</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Items</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Amount</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.order_id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-sm font-medium text-white">{row.order_number}</td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/30" />
                        {new Date(row.cancelled_at).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">{row.cashier_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.items_count}</td>
                    <td className="px-6 py-4 text-sm text-red-400 text-right font-medium">{formatCurrency(row.order_total)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-white/5 text-white/70 rounded-full">
                        {row.cancel_reason || 'Not Specified'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">No cancellations in this period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
