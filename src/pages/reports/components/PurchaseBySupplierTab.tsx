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
import { Building2, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
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

  // KPIs
  const kpis = useMemo(() => {
    const totalValue = data.reduce((acc, curr) => acc + curr.total_value, 0);
    const totalTransactions = data.reduce((acc, curr) => acc + curr.transaction_count, 0);
    const topSupplier = data.length > 0 ? data[0] : null;

    return { totalValue, totalTransactions, topSupplier, supplierCount: data.length };
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<SupplierData> = useMemo(() => ({
    data,
    columns: [
      { key: 'supplier_name', header: 'Fournisseur' },
      { key: 'transaction_count', header: 'Transactions', align: 'right' as const },
      { key: 'total_quantity', header: 'Quantité Totale', align: 'right' as const },
      { key: 'total_value', header: 'Valeur Totale', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      {
        key: 'total_value',
        header: '% Total',
        align: 'right' as const,
        format: (v) => kpis.totalValue > 0 ? `${((v as number / kpis.totalValue) * 100).toFixed(1)}%` : '0%',
      },
    ],
    filename: 'achats_par_fournisseur',
    title: 'Achats par Fournisseur',
    dateRange,
    summaries: [
      { label: 'Total Achats', value: formatCurrencyPdf(kpis.totalValue) },
      { label: 'Transactions', value: kpis.totalTransactions.toString() },
      { label: 'Top Fournisseur', value: kpis.topSupplier?.supplier_name || '-' },
    ],
  }), [data, dateRange, kpis]);

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
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total Achats</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(kpis.totalValue)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Transactions</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.totalTransactions}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Fournisseurs Actifs</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.supplierCount}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Top Fournisseur</span>
          </div>
          <p className="text-lg font-bold text-gray-900 truncate">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.topSupplier?.supplier_name || '-'}
          </p>
          {kpis.topSupplier && (
            <p className="text-xs text-gray-500">{formatCurrency(kpis.topSupplier.total_value)}</p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achats par Fournisseur</h3>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Aucune donnée pour cette période
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
              <YAxis dataKey="supplier_name" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="total_value" name="Valeur Totale" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détail par fournisseur</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transactions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valeur Totale</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr key={row.supplier_name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {row.supplier_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.transaction_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{row.total_quantity.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(row.total_value)}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
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
