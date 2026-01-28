import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Trash2, Calendar, Loader2, User, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';

interface DeletedProduct {
  id: string;
  product_name: string;
  sku: string | null;
  category_name: string | null;
  retail_price: number;
  cost_price: number;
  deleted_by: string;
  deleted_at: string;
  reason: string | null;
}

async function getDeletedProducts(from: Date, to: Date): Promise<DeletedProduct[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      old_value,
      user_id,
      created_at,
      reason
    `)
    .eq('entity_type', 'product')
    .eq('action_type', 'delete')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Fetch user names
  const userIds = [...new Set(data?.map(d => d.user_id) || [])];
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id, name')
    .in('id', userIds);

  const userMap = new Map(users?.map(u => [u.id, u.name]) || []);

  return (data || []).map(d => {
    const oldVal = d.old_value || {};
    return {
      id: d.id,
      product_name: oldVal.name || 'Produit inconnu',
      sku: oldVal.sku || null,
      category_name: oldVal.category_name || null,
      retail_price: oldVal.retail_price || 0,
      cost_price: oldVal.cost_price || 0,
      deleted_by: userMap.get(d.user_id) || 'Inconnu',
      deleted_at: d.created_at,
      reason: d.reason,
    };
  });
}

export function DeletedProductsTab() {
  const { t } = useTranslation();
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['deleted-products', dateRange.from, dateRange.to],
    queryFn: () => getDeletedProducts(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  // Summary stats
  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalDeleted: 0, totalValue: 0 };
    }

    return {
      totalDeleted: data.length,
      totalValue: data.reduce((sum, d) => sum + d.retail_price, 0),
    };
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<DeletedProduct> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'product_name', header: 'Produit' },
      { key: 'sku', header: 'SKU', format: (v) => (v as string) || '-' },
      { key: 'category_name', header: 'Catégorie', format: (v) => (v as string) || '-' },
      { key: 'retail_price', header: 'Prix vente', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'deleted_by', header: 'Supprimé par' },
      { key: 'deleted_at', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('fr-FR') },
      { key: 'reason', header: 'Raison', format: (v) => (v as string) || '-' },
    ],
    filename: 'produits_supprimes',
    title: 'Produits Supprimés',
    dateRange,
    summaries: [
      { label: 'Total supprimés', value: summary.totalDeleted.toString() },
    ],
  }), [data, dateRange, summary]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Produits supprimés</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : summary.totalDeleted}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Valeur cumulée</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(summary.totalValue)}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Liste des produits supprimés</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prix vente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supprimé par</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison</th>
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
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <Package className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{row.product_name}</p>
                          {row.sku && <p className="text-xs text-gray-500">{row.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.category_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(row.retail_price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-3 h-3" />
                        {row.deleted_by}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(row.deleted_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {row.reason ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {row.reason}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun produit supprimé sur cette période
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
