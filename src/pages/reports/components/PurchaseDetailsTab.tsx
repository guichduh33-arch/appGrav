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

  const kpis = useMemo(() => {
    const totalCost = filteredData.reduce((acc, curr) => {
      const cost = curr.product?.cost_price || 0;
      return acc + cost * curr.quantity;
    }, 0);

    const totalQuantity = filteredData.reduce((acc, curr) => acc + curr.quantity, 0);
    const uniqueProducts = new Set(filteredData.map((d) => d.product?.sku)).size;

    return { totalCost, totalQuantity, itemCount: filteredData.length, uniqueProducts };
  }, [filteredData]);

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
      <div className="p-8 text-center text-red-400">
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
        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Value (Est.)</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(kpis.totalCost)}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Total Quantity</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{kpis.totalQuantity.toLocaleString()}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Items</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{kpis.itemCount}</p>
        </div>

        <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">Unique Products</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{kpis.uniqueProducts}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            placeholder="Search product, SKU, supplier, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Incoming Purchase History</h3>
          <p className="text-sm text-[var(--theme-text-muted)]">Stock movements marked as purchase</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Product</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Supplier</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Reference (PO#)</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Quantity</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Unit Cost (Est.)</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Total Value</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Staff</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                    No data
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const unitCost = row.product?.cost_price || 0;
                  const totalValue = unitCost * row.quantity;
                  return (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                        {new Date(row.created_at).toLocaleDateString('en-US')}
                        <div className="text-xs text-[var(--theme-text-muted)]">
                          {new Date(row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {row.product?.name || 'Unknown Product'}
                        <div className="text-xs text-[var(--theme-text-muted)] font-mono">{row.product?.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">{row.supplier?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                        {row.reference_id ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {row.reference_id}
                          </span>
                        ) : (
                          <span className="text-white/20">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-white">
                        {row.quantity} {row.product?.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-[var(--theme-text-muted)]">{formatCurrency(unitCost)}</td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-white">{formatCurrency(totalValue)}</td>
                      <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">{row.staff?.name || '-'}</td>
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
