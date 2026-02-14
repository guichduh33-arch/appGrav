import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { ISalesByCustomerReport } from '@/types/reporting';

const COLORS = ['#D4A843', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function SalesByCustomerTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-by-customer', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSalesByCustomer(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const totals = useMemo(() => {
    if (!data || data.length === 0) return { totalCustomers: 0, totalRevenue: 0, totalOrders: 0, avgBasket: 0 };
    const totalCustomers = data.length;
    const totalRevenue = data.reduce((sum, d) => sum + (d.total_spent || 0), 0);
    const totalOrders = data.reduce((sum, d) => sum + (d.order_count || 0), 0);
    return { totalCustomers, totalRevenue, totalOrders, avgBasket: totalOrders > 0 ? totalRevenue / totalOrders : 0 };
  }, [data]);

  const pieData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
    return sorted.slice(0, 8).map((c) => ({ name: c.customer_name || 'Unknown Customer', value: c.total_spent || 0 }));
  }, [data]);

  const exportConfig: ExportConfig<ISalesByCustomerReport> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'customer_name', header: 'Customer' },
      { key: 'company_name', header: 'Company' },
      { key: 'phone', header: 'Phone' },
      { key: 'customer_type', header: 'Type' },
      { key: 'order_count', header: 'Orders', align: 'right' as const },
      { key: 'total_spent', header: 'Total Revenue', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
      { key: 'avg_basket', header: 'Avg Basket', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
      { key: 'last_order_at', header: 'Last Order', format: (v) => v ? new Date(v as string).toLocaleDateString('en-US') : '-' },
      { key: 'days_since_last_order', header: 'Days Since', align: 'right' as const },
    ],
    filename: 'sales-by-customer',
    title: 'Sales by Customer',
    dateRange,
    summaries: [
      { label: 'Active Customers', value: totals.totalCustomers },
      { label: 'Total Revenue', value: formatCurrencyPdf(totals.totalRevenue) },
      { label: 'Orders', value: totals.totalOrders },
    ],
  }), [data, dateRange, totals]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';

  if (error) return <div className="p-8 text-center text-red-400">Error loading data</div>;
  if (isLoading) return <ReportSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-500/10 rounded-lg"><Users className="w-5 h-5 text-blue-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Active Customers</span></div>
          <p className="text-2xl font-bold text-white">{totals.totalCustomers}</p>
        </div>
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-emerald-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Total Revenue</span></div>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totals.totalRevenue)}</p>
        </div>
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-purple-500/10 rounded-lg"><ShoppingCart className="w-5 h-5 text-purple-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Total Orders</span></div>
          <p className="text-2xl font-bold text-white">{totals.totalOrders}</p>
        </div>
        <div className="bg-[var(--onyx-surface)] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-amber-500/10 rounded-lg"><Calendar className="w-5 h-5 text-amber-400" /></div><span className="text-sm text-[var(--theme-text-muted)]">Avg Basket</span></div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totals.avgBasket)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top 8 Customers</h3>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[var(--theme-text-muted)]">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${(name || '').slice(0, 10)}${(name || '').length > 10 ? '...' : ''} (${((percent || 0) * 100).toFixed(0)}%)`} labelLine={false}>
                  {pieData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Customer Detail</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full">
              <thead className="bg-white/[0.02] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Customer</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Type</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Orders</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Total Revenue</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Avg Basket</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Inactive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--theme-text-muted)]">No customers</td></tr>
                ) : (
                  data?.slice(0, 20).map((row) => (
                    <tr key={row.customer_id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-white">{row.customer_name || 'Unknown Customer'}</div>
                        {row.company_name && <div className="text-xs text-[var(--theme-text-muted)]">{row.company_name}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${row.customer_type === 'b2b' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {row.customer_type === 'b2b' ? 'B2B' : 'Retail'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--theme-text-muted)] text-right">{row.order_count}</td>
                      <td className="px-4 py-3 text-sm text-white text-right font-medium">{formatCurrency(row.total_spent)}</td>
                      <td className="px-4 py-3 text-sm text-[var(--theme-text-muted)] text-right">{formatCurrency(row.avg_basket)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`${row.days_since_last_order > 30 ? 'text-red-400' : row.days_since_last_order > 14 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {row.days_since_last_order}d
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
