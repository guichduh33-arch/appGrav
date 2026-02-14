import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency } from '@/utils/helpers';
import type { PaymentMethodStat } from '@/types/reporting';

const COLORS = ['#D4A843', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

export const SalesTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last7days' });

  const prevRange = useMemo(() => {
    const duration = dateRange.to.getTime() - dateRange.from.getTime();
    const prevEnd = new Date(dateRange.from.getTime() - 1);
    return { start: new Date(prevEnd.getTime() - duration), end: prevEnd };
  }, [dateRange]);

  const { data: paymentStats = [], isLoading: loadingPayments, error: paymentError } = useQuery({
    queryKey: ['paymentStats'],
    queryFn: () => ReportingService.getPaymentMethodStats(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: comparison = [], isLoading: loadingComparison, error: comparisonError } = useQuery({
    queryKey: ['salesComparison', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSalesComparison(dateRange.from, dateRange.to, prevRange.start, prevRange.end),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingPayments || loadingComparison;
  const error = paymentError || comparisonError;

  const pieData = useMemo(() => {
    return paymentStats.reduce((acc, curr) => {
      const existing = acc.find((x) => x.name === curr.payment_method);
      if (existing) existing.value += curr.total_revenue;
      else acc.push({ name: curr.payment_method, value: curr.total_revenue });
      return acc;
    }, [] as { name: string; value: number }[]);
  }, [paymentStats]);

  const exportConfig: ExportConfig<PaymentMethodStat> = useMemo(() => ({
    data: paymentStats,
    columns: [
      { key: 'payment_method', header: 'Method' },
      { key: 'transaction_count', header: 'Transactions' },
      { key: 'total_revenue', header: 'Total', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
    ],
    filename: 'sales-payment-stats',
    title: 'Sales - Payment Stats',
    dateRange: { from: dateRange.from, to: dateRange.to },
  }), [paymentStats, dateRange]);

  if (error) {
    return <div className="p-8 text-center text-red-400">Error loading sales data. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last7days" />
        <ExportButtons config={exportConfig} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods PieChart */}
        <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6">Payment Methods</h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-white/5 rounded-xl" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number | undefined) => formatCurrency(val || 0)} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Period Comparison BarChart */}
        <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-6">Period Comparison</h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-white/5 rounded-xl" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparison}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="period_label" tickFormatter={(val) => (val === 'current' ? 'This Period' : 'Previous')} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                  <YAxis tickFormatter={(val) => val / 1000 + 'k'} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                  <Tooltip formatter={(val: number | undefined) => formatCurrency(val || 0)} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="total_revenue" fill="var(--color-gold)" name="Revenue" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net_revenue" fill="#10b981" name="Net" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 box-border">
          <h3 className="font-semibold text-white">Payment Method Detail</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Method</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] text-right">Transactions</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-3"><div className="h-4 w-24 bg-white/5 rounded animate-pulse" /></td>
                  <td className="px-6 py-3 text-right"><div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" /></td>
                  <td className="px-6 py-3 text-right"><div className="h-4 w-20 bg-white/5 rounded animate-pulse ml-auto" /></td>
                </tr>
              ))
            ) : paymentStats.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-[var(--theme-text-muted)]">No data available.</td>
              </tr>
            ) : (
              paymentStats.map((stat, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3 font-medium text-white capitalize">{stat.payment_method}</td>
                  <td className="px-6 py-3 text-right text-[var(--theme-text-muted)]">{stat.transaction_count}</td>
                  <td className="px-6 py-3 text-right font-semibold text-[var(--color-gold)]">{formatCurrency(stat.total_revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
