import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DollarSign, Users, AlertTriangle, Clock, Loader2, Building2, Phone } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';
import type { IB2BReceivablesReport } from '@/types/reporting';

export function B2BReceivablesTab() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['b2b-receivables'],
    queryFn: () => ReportingService.getB2BReceivables(),
    staleTime: 5 * 60 * 1000,
  });

  // Summary stats
  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalCustomers: 0, totalOutstanding: 0, overdueCustomers: 0, avgDaysOverdue: 0 };
    }

    const customersWithDebt = data.filter((c) => c.outstanding_amount > 0);
    const overdueCustomers = customersWithDebt.filter((c) => c.days_overdue > 30);

    return {
      totalCustomers: customersWithDebt.length,
      totalOutstanding: customersWithDebt.reduce((sum, c) => sum + c.outstanding_amount, 0),
      overdueCustomers: overdueCustomers.length,
      avgDaysOverdue: customersWithDebt.length > 0
        ? Math.round(customersWithDebt.reduce((sum, c) => sum + c.days_overdue, 0) / customersWithDebt.length)
        : 0,
    };
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<IB2BReceivablesReport> = useMemo(() => ({
    data: data?.filter((c) => c.outstanding_amount > 0) || [],
    columns: [
      { key: 'customer_name', header: 'Client' },
      { key: 'company_name', header: 'Entreprise', format: (v) => (v as string) || '-' },
      { key: 'phone', header: 'Téléphone', format: (v) => (v as string) || '-' },
      { key: 'credit_limit', header: 'Limite crédit', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'outstanding_amount', header: 'Encours', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'unpaid_order_count', header: 'Factures', align: 'right' as const },
      { key: 'days_overdue', header: 'Jours de retard', align: 'right' as const },
    ],
    filename: 'creances_b2b',
    title: 'Créances B2B',
    summaries: [
      { label: 'Clients avec encours', value: summary.totalCustomers.toString() },
      { label: 'Encours total', value: formatCurrencyPdf(summary.totalOutstanding) },
      { label: 'Clients en retard', value: summary.overdueCustomers.toString() },
    ],
  }), [data, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getOverdueBadge = (days: number) => {
    if (days <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          À jour
        </span>
      );
    }
    if (days <= 15) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
          <Clock className="w-3 h-3" />
          {days}j
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          {days}j
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
        <AlertTriangle className="w-3 h-3" />
        {days}j
      </span>
    );
  };

  const getCreditUsage = (outstanding: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min(100, (outstanding / limit) * 100);
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {t('common.error', 'Erreur lors du chargement des données')}
      </div>
    );
  }

  const customersWithDebt = data?.filter((c) => c.outstanding_amount > 0) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Créances B2B</h2>
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Clients avec encours</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : summary.totalCustomers}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Encours total</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(summary.totalOutstanding)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Clients en retard (&gt;30j)</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : summary.overdueCustomers}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Moy. jours de retard</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${summary.avgDaysOverdue}j`}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Clients B2B avec encours</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Limite crédit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Encours</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Utilisation</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Factures</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Retard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : customersWithDebt.length > 0 ? (
                customersWithDebt.map((row) => {
                  const usage = getCreditUsage(row.outstanding_amount, row.credit_limit);
                  return (
                    <tr key={row.customer_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Building2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{row.customer_name}</p>
                            {row.company_name && (
                              <p className="text-xs text-gray-500">{row.company_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {row.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {row.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">
                        {formatCurrency(row.credit_limit)}
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-600 text-right font-medium">
                        {formatCurrency(row.outstanding_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                usage >= 90 ? 'bg-red-500' : usage >= 70 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${usage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-10">{usage.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{row.unpaid_order_count}</td>
                      <td className="px-6 py-4 text-center">
                        {getOverdueBadge(row.days_overdue)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucun encours client B2B
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
