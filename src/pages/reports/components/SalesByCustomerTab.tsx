import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, DollarSign, ShoppingCart, Calendar, Loader2 } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { ISalesByCustomerReport } from '@/types/reporting';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function SalesByCustomerTab() {
  const { t } = useTranslation();
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-by-customer', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getSalesByCustomer(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  // Calculate totals
  const totals = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalCustomers: 0, totalRevenue: 0, totalOrders: 0, avgBasket: 0 };
    }

    const totalCustomers = data.length;
    const totalRevenue = data.reduce((sum, d) => sum + (d.total_spent || 0), 0);
    const totalOrders = data.reduce((sum, d) => sum + (d.order_count || 0), 0);
    const avgBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalCustomers, totalRevenue, totalOrders, avgBasket };
  }, [data]);

  // Top 8 customers for pie chart
  const pieData = useMemo(() => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0));
    const top8 = sorted.slice(0, 8);
    return top8.map((c) => ({
      name: c.customer_name || 'Client inconnu',
      value: c.total_spent || 0,
    }));
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<ISalesByCustomerReport> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'customer_name', header: 'Client' },
      { key: 'company_name', header: 'Société' },
      { key: 'phone', header: 'Téléphone' },
      { key: 'customer_type', header: 'Type' },
      { key: 'order_count', header: 'Commandes', align: 'right' as const },
      { key: 'total_spent', header: 'CA Total', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
      { key: 'avg_basket', header: 'Panier Moyen', align: 'right' as const, format: (v) => formatCurrencyPdf(v) },
      { key: 'last_order_at', header: 'Dernière Commande', format: (v) => v ? new Date(v as string).toLocaleDateString('fr-FR') : '-' },
      { key: 'days_since_last_order', header: 'Jours depuis', align: 'right' as const },
    ],
    filename: 'ventes_par_client',
    title: 'Ventes par Client',
    dateRange,
    summaries: [
      { label: 'Clients actifs', value: totals.totalCustomers },
      { label: 'CA Total', value: formatCurrencyPdf(totals.totalRevenue) },
      { label: 'Commandes', value: totals.totalOrders },
    ],
  }), [data, dateRange, totals]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {t('common.error', 'Erreur lors du chargement des données')}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Clients actifs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totals.totalCustomers}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">CA Total</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(totals.totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Total commandes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : totals.totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Panier moyen</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(totals.avgBasket)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 8 Clients</h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Aucune donnée
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${(name || '').slice(0, 10)}${(name || '').length > 10 ? '...' : ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Data Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Détail par client</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CA Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Panier moy.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Inactif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    </td>
                  </tr>
                ) : data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Aucun client
                    </td>
                  </tr>
                ) : (
                  data?.slice(0, 20).map((row) => (
                    <tr key={row.customer_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{row.customer_name || 'Client inconnu'}</div>
                        {row.company_name && <div className="text-xs text-gray-500">{row.company_name}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          row.customer_type === 'b2b' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {row.customer_type === 'b2b' ? 'B2B' : 'Retail'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{row.order_count}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(row.total_spent)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(row.avg_basket)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`${
                          row.days_since_last_order > 30 ? 'text-red-600' :
                          row.days_since_last_order > 14 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {row.days_since_last_order}j
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
