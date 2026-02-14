import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency } from '@/utils/helpers';
import type { PaymentMethodStat } from '@/types/reporting';

const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#818CF8', '#F472B6', '#FB923C'];

export const PaymentMethodTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['paymentMethodStats'],
    queryFn: () => ReportingService.getPaymentMethodStats(),
    staleTime: 5 * 60 * 1000,
  });

  const totalRevenue = useMemo(
    () => data.reduce((acc, curr) => acc + curr.total_revenue, 0),
    [data],
  );

  const exportConfig: ExportConfig<PaymentMethodStat> = useMemo(
    () => ({
      data,
      columns: [
        { key: 'payment_method', header: 'Payment Method' },
        { key: 'transaction_count', header: 'Transactions' },
        { key: 'total_revenue', header: 'Revenue', align: 'right' as const, format: (v: unknown) => formatCurrency(v as number) },
        {
          key: 'total_revenue' as keyof PaymentMethodStat,
          header: '% Total',
          align: 'right' as const,
          format: (v: unknown) => totalRevenue > 0 ? (((v as number) / totalRevenue) * 100).toFixed(1) + '%' : '0%',
        },
      ],
      filename: 'payment-methods',
      title: 'Payment Method Statistics',
      dateRange: { from: dateRange.from, to: dateRange.to },
    }),
    [data, dateRange, totalRevenue],
  );

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading payment method data. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BarChart */}
        <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5 h-80">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[var(--muted-smoke)]">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'var(--muted-smoke)', fontSize: 11 }} />
                <YAxis dataKey="payment_method" type="category" width={100} stroke="rgba(255,255,255,0.3)" tick={{ fill: '#fff', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend wrapperStyle={{ color: 'var(--muted-smoke)' }} />
                <Bar dataKey="total_revenue" name="Total Revenue" fill="var(--color-gold)">
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Revenue</p>
            <p className="text-2xl font-bold text-white mt-2">
              {formatCurrency(totalRevenue)}
            </p>
          </div>
          <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Top Payment Method</p>
            <p className="text-lg font-bold text-white mt-2">
              {data.length > 0 ? data[0].payment_method : '-'}
            </p>
            <p className="text-xs text-[var(--muted-smoke)]">
              {data.length > 0 ? formatCurrency(data[0].total_revenue) : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Payment Method</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Transactions</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Revenue</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">% Total</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[var(--muted-smoke)]">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.payment_method} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {row.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 text-right">
                    {row.transaction_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white text-right">
                    {formatCurrency(row.total_revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 text-right">
                    {totalRevenue > 0
                      ? ((row.total_revenue / totalRevenue) * 100).toFixed(1) + '%'
                      : '0%'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
