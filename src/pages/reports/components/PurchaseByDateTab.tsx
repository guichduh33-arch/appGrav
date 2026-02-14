import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingCart, Calendar, DollarSign, Package } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { supabase } from '@/lib/supabase';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';

interface PurchaseByDate {
  date: string;
  order_count: number;
  total_amount: number;
  items_count: number;
}

interface PurchaseOrderQueryResult {
  id: string;
  order_date: string;
  total_amount: number | null;
}

interface POItemQueryResult {
  purchase_order_id: string;
  quantity: number;
}

async function getPurchasesByDate(from: Date, to: Date): Promise<PurchaseByDate[]> {
  const { data: orders, error: ordersError } = await supabase
    .from('purchase_orders')
    .select('id, order_date, total_amount')
    .gte('order_date', from.toISOString().split('T')[0])
    .lte('order_date', to.toISOString().split('T')[0])
    .in('status', ['received', 'partial'])
    .order('order_date', { ascending: true });

  if (ordersError) throw ordersError;

  const purchaseOrders = (orders || []) as PurchaseOrderQueryResult[];
  const poIds = purchaseOrders.map((po) => po.id);

  const itemsByPo = new Map<string, number>();
  if (poIds.length > 0) {
    const { data: items } = await supabase
      .from('purchase_order_items')
      .select('purchase_order_id, quantity')
      .in('purchase_order_id', poIds);

    ((items || []) as POItemQueryResult[]).forEach((item) => {
      const current = itemsByPo.get(item.purchase_order_id) || 0;
      itemsByPo.set(item.purchase_order_id, current + (item.quantity || 0));
    });
  }

  const dateMap = new Map<string, { orders: number; amount: number; items: number }>();

  purchaseOrders.forEach((po) => {
    const date = po.order_date;
    const existing = dateMap.get(date) || { orders: 0, amount: 0, items: 0 };
    const poItemsCount = itemsByPo.get(po.id) || 0;

    dateMap.set(date, {
      orders: existing.orders + 1,
      amount: existing.amount + (po.total_amount || 0),
      items: existing.items + poItemsCount,
    });
  });

  return Array.from(dateMap.entries()).map(([date, stats]) => ({
    date,
    order_count: stats.orders,
    total_amount: stats.amount,
    items_count: stats.items,
  }));
}

export function PurchaseByDateTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'thisMonth' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchases-by-date', dateRange.from, dateRange.to],
    queryFn: () => getPurchasesByDate(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
      amount: d.total_amount,
      orders: d.order_count,
    }));
  }, [data]);

  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalOrders: 0, totalAmount: 0, totalItems: 0 };
    }

    return {
      totalOrders: data.reduce((sum, d) => sum + d.order_count, 0),
      totalAmount: data.reduce((sum, d) => sum + d.total_amount, 0),
      totalItems: data.reduce((sum, d) => sum + d.items_count, 0),
    };
  }, [data]);

  const exportConfig: ExportConfig<PurchaseByDate> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'date', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'order_count', header: 'Orders', align: 'right' as const },
      { key: 'items_count', header: 'Items', align: 'right' as const },
      { key: 'total_amount', header: 'Amount', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
    ],
    filename: 'purchases-by-date',
    title: 'Purchases by Date',
    dateRange,
    summaries: [
      { label: 'Total Orders', value: summary.totalOrders.toString() },
      { label: 'Total Purchases', value: formatCurrencyPdf(summary.totalAmount) },
    ],
  }), [data, dateRange, summary]);

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
        <DateRangePicker defaultPreset="thisMonth" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalOrders}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Purchases</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalAmount)}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Items</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalItems}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Purchase Trends</h3>

        {chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-[var(--theme-text-muted)]">
            No purchases in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} />
              <Tooltip
                formatter={(value) => [formatCurrency(value as number), 'Purchases']}
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
              />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Details by Date</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Orders</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Items</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.date} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--theme-text-muted)]" />
                        {new Date(row.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.order_count}</td>
                    <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.items_count}</td>
                    <td className="px-6 py-4 text-sm text-white text-right font-medium">
                      {formatCurrency(row.total_amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                    No purchases in this period
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
