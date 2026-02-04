import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, AlertCircle, XCircle, Package, Loader2, TrendingDown } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { IStockWarningReport } from '@/types/reporting';

export function StockWarningTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stock-warning'],
    queryFn: () => ReportingService.getStockWarning(),
    staleTime: 5 * 60 * 1000,
  });

  // Group by alert level
  const alertStats = useMemo(() => {
    if (!data) return { outOfStock: 0, critical: 0, warning: 0, totalValue: 0 };

    const stats = {
      outOfStock: 0,
      critical: 0,
      warning: 0,
      totalValue: 0,
    };

    data.forEach((item) => {
      if (item.alert_level === 'out_of_stock') stats.outOfStock++;
      else if (item.alert_level === 'critical') stats.critical++;
      else if (item.alert_level === 'warning') stats.warning++;
      stats.totalValue += item.value_at_risk || 0;
    });

    return stats;
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<IStockWarningReport> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'sku', header: 'SKU', format: (v) => (v as string) || '-' },
      { key: 'product_name', header: 'Produit' },
      { key: 'category_name', header: 'Catégorie', format: (v) => (v as string) || '-' },
      { key: 'current_stock', header: 'Stock actuel', align: 'right' as const },
      { key: 'min_stock_level', header: 'Stock min', align: 'right' as const },
      { key: 'alert_level', header: 'Alerte', format: (v) => getAlertLabel(v as string) },
      { key: 'suggested_reorder', header: 'À commander', align: 'right' as const },
      { key: 'value_at_risk', header: 'Valeur à risque', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
    ],
    filename: 'alerte_stock',
    title: 'Rapport d\'Alerte Stock',
    summaries: [
      { label: 'Ruptures', value: alertStats.outOfStock.toString() },
      { label: 'Critiques', value: alertStats.critical.toString() },
      { label: 'Valeur à risque', value: formatCurrencyPdf(alertStats.totalValue) },
    ],
  }), [data, alertStats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            <XCircle className="w-3 h-3" />
            Rupture
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Critique
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Attention
          </span>
        );
      default:
        return null;
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
        <h2 className="text-lg font-semibold text-gray-900">Alertes de Stock</h2>
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Ruptures de stock</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : alertStats.outOfStock}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Niveau critique</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : alertStats.critical}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-yellow-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Stock bas</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : alertStats.warning}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Valeur à risque</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(alertStats.totalValue)}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Produits en alerte</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock Min</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Alerte</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">À commander</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valeur risque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{row.product_name}</p>
                          {row.sku && <p className="text-xs text-gray-500">{row.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.category_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">
                      <span className={row.current_stock <= 0 ? 'text-red-600' : 'text-gray-900'}>
                        {row.current_stock} {row.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {row.min_stock_level} {row.unit}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getAlertBadge(row.alert_level)}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 text-right font-medium">
                      +{row.suggested_reorder} {row.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-purple-600 text-right font-medium">
                      {formatCurrency(row.value_at_risk)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucune alerte de stock
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

function getAlertLabel(level: string): string {
  switch (level) {
    case 'out_of_stock': return 'Rupture';
    case 'critical': return 'Critique';
    case 'warning': return 'Attention';
    default: return level;
  }
}
