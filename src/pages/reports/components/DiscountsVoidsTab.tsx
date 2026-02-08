import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Percent, XCircle, RotateCcw, TrendingDown, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';

interface DiscountVoidEntry {
  id: string;
  created_at: string;
  order_number: string;
  type: 'discount' | 'void' | 'refund';
  amount: number;
  reason: string | null;
  staff_name: string | null;
}

interface DailyData {
  date: string;
  discounts: number;
  voids: number;
  refunds: number;
}

async function getDiscountsVoids(from: Date, to: Date): Promise<DiscountVoidEntry[]> {
  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];

  // Query orders with discounts, cancelled, or refunds
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      order_number,
      status,
      discount_amount,
      refund_amount,
      total,
      user_profiles:user_id(full_name)
    `)
    .gte('created_at', fromStr)
    .lte('created_at', toStr + 'T23:59:59')
    .or('discount_amount.gt.0,status.eq.cancelled,refund_amount.gt.0')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform to entries
  const entries: DiscountVoidEntry[] = [];

  for (const order of data || []) {
    const staffName = Array.isArray(order.user_profiles)
      ? order.user_profiles[0]?.full_name
      : (order.user_profiles as { full_name: string } | null)?.full_name;

    // Add discount entry if discount > 0
    if (order.discount_amount && order.discount_amount > 0) {
      entries.push({
        id: `${order.id}-discount`,
        created_at: order.created_at,
        order_number: order.order_number || order.id.slice(0, 8),
        type: 'discount',
        amount: order.discount_amount,
        reason: 'Discount applied',
        staff_name: staffName || null,
      });
    }

    // Add void entry if cancelled
    if (order.status === 'cancelled') {
      entries.push({
        id: `${order.id}-void`,
        created_at: order.created_at,
        order_number: order.order_number || order.id.slice(0, 8),
        type: 'void',
        amount: order.total || 0,
        reason: 'Order cancelled',
        staff_name: staffName || null,
      });
    }

    // Add refund entry if refund > 0
    if (order.refund_amount && order.refund_amount > 0) {
      entries.push({
        id: `${order.id}-refund`,
        created_at: order.created_at,
        order_number: order.order_number || order.id.slice(0, 8),
        type: 'refund',
        amount: order.refund_amount,
        reason: 'Refund processed',
        staff_name: staffName || null,
      });
    }
  }

  return entries;
}

export function DiscountsVoidsTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['discounts-voids', dateRange.from, dateRange.to],
    queryFn: () => getDiscountsVoids(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return entries;
    const term = searchTerm.toLowerCase();
    return entries.filter(
      (e) =>
        e.order_number.toLowerCase().includes(term) ||
        e.staff_name?.toLowerCase().includes(term) ||
        e.reason?.toLowerCase().includes(term)
    );
  }, [entries, searchTerm]);

  // KPIs
  const kpis = useMemo(() => {
    const totalDiscounts = filteredData
      .filter((e) => e.type === 'discount')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalVoids = filteredData
      .filter((e) => e.type === 'void')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalRefunds = filteredData
      .filter((e) => e.type === 'refund')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalLoss = totalDiscounts + totalVoids + totalRefunds;

    return {
      totalDiscounts,
      totalVoids,
      totalRefunds,
      totalLoss,
      discountCount: filteredData.filter((e) => e.type === 'discount').length,
      voidCount: filteredData.filter((e) => e.type === 'void').length,
      refundCount: filteredData.filter((e) => e.type === 'refund').length,
    };
  }, [filteredData]);

  // Chart data - group by day
  const chartData = useMemo(() => {
    const dayMap: Record<string, DailyData> = {};

    for (const entry of entries) {
      const date = new Date(entry.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      });

      if (!dayMap[date]) {
        dayMap[date] = { date, discounts: 0, voids: 0, refunds: 0 };
      }

      if (entry.type === 'discount') {
        dayMap[date].discounts += entry.amount;
      } else if (entry.type === 'void') {
        dayMap[date].voids += entry.amount;
      } else if (entry.type === 'refund') {
        dayMap[date].refunds += entry.amount;
      }
    }

    return Object.values(dayMap).sort((a, b) => {
      const dateA = new Date(a.date.split(' ').reverse().join(' '));
      const dateB = new Date(b.date.split(' ').reverse().join(' '));
      return dateA.getTime() - dateB.getTime();
    });
  }, [entries]);

  // Export config
  const exportConfig: ExportConfig<DiscountVoidEntry> = useMemo(() => ({
    data: filteredData,
    columns: [
      { key: 'created_at', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('fr-FR') },
      { key: 'order_number', header: 'Commande' },
      { key: 'type', header: 'Type', format: (v) => v === 'discount' ? 'Remise' : v === 'void' ? 'Annulation' : 'Remboursement' },
      { key: 'amount', header: 'Montant', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'reason', header: 'Raison' },
      { key: 'staff_name', header: 'Staff' },
    ],
    filename: 'discounts_voids',
    title: 'Rapport Remises & Annulations',
    dateRange,
    summaries: [
      { label: 'Total Remises', value: formatCurrencyPdf(kpis.totalDiscounts) },
      { label: 'Total Annulations', value: formatCurrencyPdf(kpis.totalVoids) },
      { label: 'Total Remboursements', value: formatCurrencyPdf(kpis.totalRefunds) },
    ],
  }), [filteredData, dateRange, kpis]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'discount':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Remise</span>;
      case 'void':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Annulation</span>;
      case 'refund':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Remboursement</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{type}</span>;
    }
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
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Percent className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Total Remises</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(kpis.totalDiscounts)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{kpis.discountCount} remises</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Total Annulations</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(kpis.totalVoids)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{kpis.voidCount} annulations</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <RotateCcw className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Total Remboursements</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(kpis.totalRefunds)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{kpis.refundCount} remboursements</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-600">Perte Totale</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(kpis.totalLoss)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pertes par jour</h3>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Aucune donnée pour cette période
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  name === 'discounts' ? 'Remises' : name === 'voids' ? 'Annulations' : 'Remboursements'
                ]}
              />
              <Legend />
              <Bar dataKey="discounts" name="Remises" stackId="a" fill="#EAB308" />
              <Bar dataKey="voids" name="Annulations" stackId="a" fill="#EF4444" />
              <Bar dataKey="refunds" name="Remboursements" stackId="a" fill="#A855F7" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher commande, staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détail des pertes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(row.created_at).toLocaleDateString('fr-FR')}
                      <div className="text-xs text-gray-400">
                        {new Date(row.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.order_number}</td>
                    <td className="px-6 py-4">{getTypeBadge(row.type)}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-red-600">
                      -{formatCurrency(row.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.reason || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.staff_name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
