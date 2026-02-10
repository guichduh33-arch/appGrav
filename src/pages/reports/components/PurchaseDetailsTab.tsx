import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, DollarSign, TrendingUp } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';

interface PurchaseDetail {
  id: string;
  created_at: string;
  quantity: number;
  reference_id: string | null;
  product?: {
    name?: string;
    sku?: string;
    unit?: string;
    cost_price?: number;
  };
  supplier?: {
    name?: string;
  };
  staff?: {
    name?: string;
  };
}

export const PurchaseDetailsTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });
  const [searchTerm, setSearchTerm] = useState('');

  const { data = [], isLoading, error } = useQuery<PurchaseDetail[]>({
    queryKey: ['purchase-details', dateRange.from, dateRange.to],
    queryFn: () => ReportingService.getPurchaseDetails(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
  });

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(
      (item) =>
        item.product?.name?.toLowerCase().includes(term) ||
        item.product?.sku?.toLowerCase().includes(term) ||
        item.reference_id?.toLowerCase().includes(term) ||
        item.supplier?.name?.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  // KPIs
  const kpis = useMemo(() => {
    const totalCost = filteredData.reduce((acc, curr) => {
      const cost = curr.product?.cost_price || 0;
      return acc + cost * curr.quantity;
    }, 0);

    const totalQuantity = filteredData.reduce((acc, curr) => acc + curr.quantity, 0);
    const uniqueProducts = new Set(filteredData.map((d) => d.product?.sku)).size;

    return { totalCost, totalQuantity, itemCount: filteredData.length, uniqueProducts };
  }, [filteredData]);

  // Export config
  const exportConfig: ExportConfig<PurchaseDetail> = useMemo(() => ({
    data: filteredData,
    columns: [
      { key: 'created_at', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'product', header: 'Product', format: (v) => (v as { name?: string })?.name || 'Unknown' },
      { key: 'product', header: 'SKU', format: (v) => (v as { sku?: string })?.sku || '-' },
      { key: 'supplier', header: 'Supplier', format: (v) => (v as { name?: string })?.name || '-' },
      { key: 'reference_id', header: 'Reference (PO#)' },
      { key: 'quantity', header: 'Quantity', align: 'right' as const },
      { key: 'product', header: 'Unit Cost', align: 'right' as const, format: (v) => formatCurrencyPdf((v as { cost_price?: number })?.cost_price || 0) },
    ],
    filename: 'purchase-details',
    title: 'Purchase Details',
    dateRange,
    summaries: [
      { label: 'Total Purchases', value: formatCurrencyPdf(kpis.totalCost) },
      { label: 'Items', value: kpis.itemCount.toString() },
      { label: 'Unique Products', value: kpis.uniqueProducts.toString() },
    ],
  }), [filteredData, dateRange, kpis]);

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total Value (Est.)</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(kpis.totalCost)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Total Quantity</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {kpis.totalQuantity.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Items</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {kpis.itemCount}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Unique Products</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {kpis.uniqueProducts}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search product, SKU, supplier, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Incoming Purchase History</h3>
          <p className="text-sm text-gray-500">Stock movements marked as purchase</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference (PO#)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost (Est.)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No data
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const unitCost = row.product?.cost_price || 0;
                  const totalValue = unitCost * row.quantity;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(row.created_at).toLocaleDateString('en-US')}
                        <div className="text-xs text-gray-400">
                          {new Date(row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {row.product?.name || 'Unknown Product'}
                        <div className="text-xs text-gray-400 font-mono">{row.product?.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.supplier?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {row.reference_id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {row.reference_id}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                        {row.quantity} {row.product?.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{formatCurrency(unitCost)}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">{formatCurrency(totalValue)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.staff?.name || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
