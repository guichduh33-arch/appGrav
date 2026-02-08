import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
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
      { key: 'created_at', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('fr-FR') },
      { key: 'product', header: 'Produit', format: (v) => (v as { name?: string })?.name || 'Inconnu' },
      { key: 'product', header: 'SKU', format: (v) => (v as { sku?: string })?.sku || '-' },
      { key: 'supplier', header: 'Fournisseur', format: (v) => (v as { name?: string })?.name || '-' },
      { key: 'reference_id', header: 'Référence (PO#)' },
      { key: 'quantity', header: 'Quantité', align: 'right' as const },
      { key: 'product', header: 'Coût Unitaire', align: 'right' as const, format: (v) => formatCurrencyPdf((v as { cost_price?: number })?.cost_price || 0) },
    ],
    filename: 'achats_details',
    title: 'Détail des Achats',
    dateRange,
    summaries: [
      { label: 'Total Achats', value: formatCurrencyPdf(kpis.totalCost) },
      { label: 'Articles', value: kpis.itemCount.toString() },
      { label: 'Produits Uniques', value: kpis.uniqueProducts.toString() },
    ],
  }), [filteredData, dateRange, kpis]);

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
            <span className="text-sm text-gray-600">Valeur Totale (Est.)</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(kpis.totalCost)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Quantité Totale</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.totalQuantity.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Articles</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.itemCount}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Produits Uniques</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpis.uniqueProducts}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher produit, SKU, fournisseur ou référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique des achats entrants</h3>
          <p className="text-sm text-gray-500">Mouvements de stock marqués comme achat</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence (PO#)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Coût Unit. (Est.)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valeur Totale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Aucune donnée
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const unitCost = row.product?.cost_price || 0;
                  const totalValue = unitCost * row.quantity;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(row.created_at).toLocaleDateString('fr-FR')}
                        <div className="text-xs text-gray-400">
                          {new Date(row.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {row.product?.name || 'Produit Inconnu'}
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
