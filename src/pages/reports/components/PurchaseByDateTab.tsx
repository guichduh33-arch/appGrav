import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingCart, Calendar, Loader2, DollarSign, Package } from 'lucide-react';
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

// Types for Supabase query results
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
  // Fetch purchase orders
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

  // Fetch items count for these POs
  let itemsByPo = new Map<string, number>();
  if (poIds.length > 0) {
    const { data: items } = await supabase
      .from('purchase_order_items')
      .select('purchase_order_id, quantity')
      .in('purchase_order_id', poIds);

    // Group items by PO
    ((items || []) as POItemQueryResult[]).forEach((item) => {
      const current = itemsByPo.get(item.purchase_order_id) || 0;
      itemsByPo.set(item.purchase_order_id, current + (item.quantity || 0));
    });
  }

  // Group by date
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

  // Chart data
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((d) => ({
      date: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      amount: d.total_amount,
      orders: d.order_count,
    }));
  }, [data]);

  // Summary stats
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

  // Export config
  const exportConfig: ExportConfig<PurchaseByDate> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'date', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('fr-FR') },
      { key: 'order_count', header: 'Commandes', align: 'right' as const },
      { key: 'items_count', header: 'Articles', align: 'right' as const },
      { key: 'total_amount', header: 'Montant', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
    ],
    filename: 'achats_par_date',
    title: 'Achats par Date',
    dateRange,
    summaries: [
      { label: 'Total commandes', value: summary.totalOrders.toString() },
      { label: 'Total achats', value: formatCurrencyPdf(summary.totalAmount) },
    ],
  }), [data, dateRange, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading data
      </div>
    );
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
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total commandes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : summary.totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Total achats</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(summary.totalAmount)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Total articles</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : summary.totalItems}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution des achats</h3>

        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Aucun achat sur cette période
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [formatCurrency(value as number), 'Achats']} />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détail par date</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Articles</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(row.date).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.order_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.items_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(row.total_amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Aucun achat sur cette période
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
