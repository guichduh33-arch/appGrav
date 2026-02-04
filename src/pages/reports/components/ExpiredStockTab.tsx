import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, XCircle, Package, Loader2, DollarSign } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { IExpiredStockReport } from '@/types/reporting';

export function ExpiredStockTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['expired-stock'],
    queryFn: () => ReportingService.getExpiredStock(),
    staleTime: 5 * 60 * 1000,
  });

  // Group by expiry status
  const expiryStats = useMemo(() => {
    if (!data) return { expired: 0, expiringSoon: 0, expiring: 0, totalLoss: 0 };

    const stats = {
      expired: 0,
      expiringSoon: 0,
      expiring: 0,
      totalLoss: 0,
    };

    data.forEach((item) => {
      if (item.expiry_status === 'expired') {
        stats.expired++;
        stats.totalLoss += item.potential_loss || 0;
      } else if (item.expiry_status === 'expiring_soon') {
        stats.expiringSoon++;
      } else if (item.expiry_status === 'expiring') {
        stats.expiring++;
      }
    });

    return stats;
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<IExpiredStockReport> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'sku', header: 'SKU', format: (v) => (v as string) || '-' },
      { key: 'product_name', header: 'Produit' },
      { key: 'category_name', header: 'Catégorie', format: (v) => (v as string) || '-' },
      { key: 'current_stock', header: 'Stock', align: 'right' as const },
      { key: 'expiry_date', header: 'Date d\'expiration', format: (v) => new Date(v as string).toLocaleDateString('fr-FR') },
      { key: 'days_until_expiry', header: 'Jours', align: 'right' as const },
      { key: 'expiry_status', header: 'Statut', format: (v) => getStatusLabel(v as string) },
      { key: 'potential_loss', header: 'Perte potentielle', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
    ],
    filename: 'stock_expire',
    title: 'Rapport Stock Expiré',
    summaries: [
      { label: 'Produits expirés', value: expiryStats.expired.toString() },
      { label: 'Expire bientôt (7j)', value: expiryStats.expiringSoon.toString() },
      { label: 'Perte potentielle', value: formatCurrencyPdf(expiryStats.totalLoss) },
    ],
  }), [data, expiryStats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getStatusBadge = (status: string, daysUntil: number) => {
    switch (status) {
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            <XCircle className="w-3 h-3" />
            Expiré
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
            <Clock className="w-3 h-3" />
            {daysUntil}j restants
          </span>
        );
      case 'expiring':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {daysUntil}j restants
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            OK
          </span>
        );
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
        <h2 className="text-lg font-semibold text-gray-900">Stock Expiré / À Expirer</h2>
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-red-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Expirés</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : expiryStats.expired}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Expire dans 7 jours</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : expiryStats.expiringSoon}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-yellow-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Expire dans 30 jours</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : expiryStats.expiring}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Perte potentielle</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(expiryStats.totalLoss)}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Produits à surveiller</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Perte potentielle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.product_id} className={`hover:bg-gray-50 ${row.expiry_status === 'expired' ? 'bg-red-50' : ''}`}>
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
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {row.current_stock} {row.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(row.expiry_date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(row.expiry_status, row.days_until_expiry)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium">
                      <span className={row.expiry_status === 'expired' ? 'text-red-600' : 'text-gray-900'}>
                        {formatCurrency(row.potential_loss)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun produit expiré ou à expirer
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

function getStatusLabel(status: string): string {
  switch (status) {
    case 'expired': return 'Expiré';
    case 'expiring_soon': return 'Expire bientôt';
    case 'expiring': return 'À surveiller';
    default: return status;
  }
}
