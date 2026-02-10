import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Calendar, User, Package, DollarSign } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
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

// Types for Supabase query results
interface AuditLogDeleteQueryResult {
  id: string;
  old_values: Record<string, unknown> | null;
  user_id: string | null;
  created_at: string;
}

interface UserProfileQueryResult {
  id: string;
  name: string;
}

async function getDeletedProducts(from: Date, to: Date): Promise<DeletedProduct[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      old_values,
      user_id,
      created_at
    `)
    .eq('entity_type', 'product')
    .eq('action', 'delete')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  const auditLogs = (data || []) as AuditLogDeleteQueryResult[];

  // Fetch user names
  const userIds = [...new Set(auditLogs.map((d) => d.user_id).filter(Boolean))] as string[];
  const { data: users } = userIds.length > 0
    ? await supabase.from('user_profiles').select('id, name').in('id', userIds)
    : { data: [] };

  const userMap = new Map((users as UserProfileQueryResult[] || []).map(u => [u.id, u.name]));

  return auditLogs.map((d) => {
    const oldVal = d.old_values || {};
    return {
      id: d.id,
      product_name: (oldVal.name as string) || 'Unknown Product',
      sku: (oldVal.sku as string) || null,
      category_name: (oldVal.category_name as string) || null,
      retail_price: (oldVal.retail_price as number) || 0,
      cost_price: (oldVal.cost_price as number) || 0,
      deleted_by: userMap.get(d.user_id || '') || 'Unknown',
      deleted_at: d.created_at,
      reason: null,
    };
  });
}

export function DeletedProductsTab() {
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
      { key: 'product_name', header: 'Product' },
      { key: 'sku', header: 'SKU', format: (v) => (v as string) || '-' },
      { key: 'category_name', header: 'Category', format: (v) => (v as string) || '-' },
      { key: 'retail_price', header: 'Retail Price', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'deleted_by', header: 'Deleted By' },
      { key: 'deleted_at', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'reason', header: 'Reason', format: (v) => (v as string) || '-' },
    ],
    filename: 'deleted-products',
    title: 'Deleted Products',
    dateRange,
    summaries: [
      { label: 'Total Deleted', value: summary.totalDeleted.toString() },
    ],
  }), [data, dateRange, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
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
            <span className="text-sm text-gray-600">Deleted Products</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {summary.totalDeleted}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Cumulative Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.totalValue)}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Deleted Products List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Retail Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data && data.length > 0 ? (
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
                        {new Date(row.deleted_at).toLocaleDateString('en-US', {
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
                    No products deleted in this period
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
