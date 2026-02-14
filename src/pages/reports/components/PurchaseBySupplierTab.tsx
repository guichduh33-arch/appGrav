import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Building2, DollarSign, TrendingUp } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface SupplierData {
  supplier_name: string;
  transaction_count: number;
  total_quantity: number;
  total_value: number;
}

export const PurchaseBySupplierTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data = [], isLoading, error } = useQuery<SupplierData[]>({
    queryKey: ['purchase-by-supplier', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getPurchaseBySupplier(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const kpis = useMemo(() => {
    const totalValue = data.reduce((acc, curr) => acc + curr.total_value, 0);
    const totalTransactions = data.reduce((acc, curr) => acc + curr.transaction_count, 0);
    const topSupplier = data.length > 0 ? data[0] : null;

    return { totalValue, totalTransactions, topSupplier, supplierCount: data.length };
  }, [data]);

  const exportConfig: ExportConfig<SupplierData> = useMemo(() => ({
    data,
    columns: [
      { key: 'supplier_name', header: 'Supplier' },
      { key: 'transaction_count', header: 'Transactions', align: 'right' as const },
      { key: 'total_quantity', header: 'Total Quantity', align: 'right' as const },
      { key: 'total_value', header: 'Total Value', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      {
        key: 'total_value',
        header: '% of Total',
        align: 'right' as const,
        format: (v) => kpis.totalValue > 0 ? `${((v as number / kpis.totalValue) * 100).toFixed(1)}%` : '0%',
      },
    ],
    filename: 'purchases-by-supplier',
    title: 'Purchases by Supplier',
    dateRange,
    summaries: [
      { label: 'Total Purchases', value: formatCurrencyPdf(kpis.totalValue) },
      { label: 'Transactions', value: kpis.totalTransactions.toString() },
      { label: 'Top Supplier', value: kpis.topSupplier?.supplier_name || '-' },
    ],
  }), [data, dateRange, kpis]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
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
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Purchases</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(kpis.totalValue)}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Transactions</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{kpis.totalTransactions}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Active Suppliers</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{kpis.supplierCount}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--color-gold)]/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[var(--color-gold)]" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Top Supplier</span>
          </div>
          <p className="text-lg font-bold text-white truncate">
            {kpis.topSupplier?.supplier_name || '-'}
          </p>
          {kpis.topSupplier && (
            <p className="text-xs text-[var(--theme-text-muted)]">{formatCurrency(kpis.topSupplier.total_value)}</p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Purchases by Supplier</h3>
        {data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-[var(--theme-text-muted)]">
            No data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} />
              <YAxis dataKey="supplier_name" type="category" width={120} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.6)' }} />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              />
              <Bar dataKey="total_value" name="Total Value" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Supplier Detail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Supplier</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Transactions</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Quantity</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Total Value</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                    No data
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.supplier_name} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {row.supplier_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.transaction_count}</td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.total_quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-white text-right">{formatCurrency(row.total_value)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {kpis.totalValue > 0 ? ((row.total_value / kpis.totalValue) * 100).toFixed(1) : 0}%
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
  );
};
