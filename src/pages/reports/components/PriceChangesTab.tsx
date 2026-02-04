import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Loader2, User, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';

interface PriceChange {
  id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  old_retail_price: number;
  new_retail_price: number;
  old_cost_price: number;
  new_cost_price: number;
  changed_by: string;
  changed_at: string;
  reason: string | null;
}

// Types for Supabase query results
interface AuditLogQueryResult {
  id: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user_id: string | null;
  created_at: string;
}

interface ProductQueryResult {
  id: string;
  name: string;
  sku: string | null;
}

interface UserQueryResult {
  id: string;
  name: string;
}

async function getPriceChanges(from: Date, to: Date): Promise<PriceChange[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      entity_id,
      old_values,
      new_values,
      user_id,
      created_at
    `)
    .eq('entity_type', 'product')
    .eq('action', 'price_change')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  const auditLogs = (data || []) as AuditLogQueryResult[];

  // Fetch product names
  const productIds = [...new Set(auditLogs.map((d) => d.entity_id).filter(Boolean))];
  const { data: products } = productIds.length > 0
    ? await supabase.from('products').select('id, name, sku').in('id', productIds)
    : { data: [] };

  const productMap = new Map((products as ProductQueryResult[] || []).map(p => [p.id, p]));

  // Fetch user names
  const userIds = [...new Set(auditLogs.map((d) => d.user_id).filter(Boolean))] as string[];
  const { data: users } = userIds.length > 0
    ? await supabase.from('user_profiles').select('id, name').in('id', userIds)
    : { data: [] };

  const userMap = new Map((users as UserQueryResult[] || []).map(u => [u.id, u.name]));

  return auditLogs.map((d) => {
    const product = productMap.get(d.entity_id);
    const oldVal = d.old_values || {};
    const newVal = d.new_values || {};
    return {
      id: d.id,
      product_id: d.entity_id,
      product_name: product?.name || 'Produit inconnu',
      sku: product?.sku || null,
      old_retail_price: (oldVal.retail_price as number) || 0,
      new_retail_price: (newVal.retail_price as number) || 0,
      old_cost_price: (oldVal.cost_price as number) || 0,
      new_cost_price: (newVal.cost_price as number) || 0,
      changed_by: userMap.get(d.user_id || '') || 'Inconnu',
      changed_at: d.created_at,
      reason: null,
    };
  });
}

export function PriceChangesTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['price-changes', dateRange.from, dateRange.to],
    queryFn: () => getPriceChanges(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  // Summary stats
  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalChanges: 0, priceIncreases: 0, priceDecreases: 0 };
    }

    let increases = 0;
    let decreases = 0;

    data.forEach((d) => {
      if (d.new_retail_price > d.old_retail_price) increases++;
      else if (d.new_retail_price < d.old_retail_price) decreases++;
    });

    return {
      totalChanges: data.length,
      priceIncreases: increases,
      priceDecreases: decreases,
    };
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<PriceChange> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'product_name', header: 'Produit' },
      { key: 'sku', header: 'SKU', format: (v) => (v as string) || '-' },
      { key: 'old_retail_price', header: 'Ancien prix', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'new_retail_price', header: 'Nouveau prix', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'changed_by', header: 'Modifié par' },
      { key: 'changed_at', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('fr-FR') },
      { key: 'reason', header: 'Raison', format: (v) => (v as string) || '-' },
    ],
    filename: 'changements_prix',
    title: 'Historique des Changements de Prix',
    dateRange,
    summaries: [
      { label: 'Total changements', value: summary.totalChanges.toString() },
      { label: 'Augmentations', value: summary.priceIncreases.toString() },
      { label: 'Diminutions', value: summary.priceDecreases.toString() },
    ],
  }), [data, dateRange, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  const getPriceChangeBadge = (oldPrice: number, newPrice: number) => {
    const diff = newPrice - oldPrice;
    const pct = oldPrice > 0 ? ((diff / oldPrice) * 100).toFixed(1) : '0';

    if (diff > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          <TrendingUp className="w-3 h-3" />
          +{pct}%
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          <TrendingDown className="w-3 h-3" />
          {pct}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
        0%
      </span>
    );
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total changements</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : summary.totalChanges}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Augmentations</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : summary.priceIncreases}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Diminutions</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : summary.priceDecreases}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique des changements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ancien prix</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nouveau prix</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Variation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modifié par</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
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
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{row.product_name}</p>
                          {row.sku && <p className="text-xs text-gray-500">{row.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {formatCurrency(row.old_retail_price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(row.new_retail_price)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getPriceChangeBadge(row.old_retail_price, row.new_retail_price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-3 h-3" />
                        {row.changed_by}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(row.changed_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun changement de prix sur cette période
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
