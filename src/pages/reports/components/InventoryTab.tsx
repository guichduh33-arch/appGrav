import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportingService } from '@/services/ReportingService';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency } from '@/utils/helpers';
import { useInventoryConfigSettings } from '@/hooks/settings/useModuleConfigSettings';
import type { InventoryValuation, StockWaste } from '@/types/reporting';
import { ValuationCards } from './inventory/ValuationCards';
import { WasteSection } from './inventory/WasteSection';
import { StockTable } from './inventory/StockTable';

type SortField = 'product_name' | 'current_stock' | 'cost_price' | 'stock_value';
type SortDir = 'asc' | 'desc';

interface ProductStock {
  product_id: string;
  product_name: string;
  sku: string;
  category_name: string;
  current_stock: number;
  unit: string;
  cost_price: number;
  retail_price: number;
  stock_value: number;
  status: 'ok' | 'low' | 'critical' | 'out';
}

export const InventoryTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('product_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const invConfig = useInventoryConfigSettings();

  const { data: valuation, isLoading: loadingValuation } = useQuery<InventoryValuation>({
    queryKey: ['inventoryValuation'],
    queryFn: () => ReportingService.getInventoryValuation(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: waste = [], isLoading: loadingWaste } = useQuery<StockWaste[]>({
    queryKey: ['stockWaste'],
    queryFn: () => ReportingService.getStockWasteReport(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: stockItems = [], isLoading: loadingStock } = useQuery<ProductStock[]>({
    queryKey: ['stockItems', invConfig.stockCriticalThreshold, invConfig.stockWarningThreshold],
    queryFn: async () => {
      const items = await ReportingService.getInventoryItems();
      return items.map((item: any) => ({
        product_id: item.id,
        product_name: item.name,
        sku: item.sku || '',
        category_name: item.category?.name || 'Uncategorized',
        current_stock: item.current_stock || 0,
        unit: item.unit || 'pcs',
        cost_price: item.cost_price || 0,
        retail_price: item.price || 0,
        stock_value: (item.current_stock || 0) * (item.cost_price || 0),
        status:
          item.current_stock <= 0
            ? 'out'
            : item.current_stock < invConfig.stockCriticalThreshold
              ? 'critical'
              : item.current_stock < invConfig.stockWarningThreshold
                ? 'low'
                : 'ok',
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingValuation || loadingWaste || loadingStock;

  const filteredItems = useMemo(() => {
    let result = [...stockItems];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.product_name.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term) ||
          item.category_name.toLowerCase().includes(term)
      );
    }
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return result;
  }, [stockItems, searchTerm, sortField, sortDir]);

  const totals = useMemo(() => ({
    totalItems: filteredItems.reduce((sum, item) => sum + item.current_stock, 0),
    totalValueCost: filteredItems.reduce((sum, item) => sum + item.stock_value, 0),
    totalValueRetail: filteredItems.reduce((sum, item) => sum + item.current_stock * item.retail_price, 0),
  }), [filteredItems]);

  const exportConfig: ExportConfig<ProductStock> = useMemo(
    () => ({
      data: filteredItems,
      columns: [
        { key: 'product_name', header: 'Product' },
        { key: 'sku', header: 'SKU' },
        { key: 'category_name', header: 'Category' },
        { key: 'current_stock', header: 'Stock', align: 'right' as const },
        { key: 'unit', header: 'Unit' },
        { key: 'cost_price', header: 'Cost', align: 'right' as const, format: (v) => formatCurrency(v as number) },
        { key: 'stock_value', header: 'Value', align: 'right' as const, format: (v) => formatCurrency(v as number) },
        { key: 'status', header: 'Status' },
      ],
      filename: 'inventory-valuation',
      title: 'Inventory Valuation Report',
      summaries: [
        { label: 'Total Items', value: totals.totalItems.toLocaleString() },
        { label: 'Value at Cost', value: formatCurrency(totals.totalValueCost) },
        { label: 'Value at Retail', value: formatCurrency(totals.totalValueRetail) },
      ],
    }),
    [filteredItems, totals]
  );

  const wasteByReason = useMemo(() => {
    return waste.reduce(
      (acc, curr) => {
        const existing = acc.find((x) => x.name === curr.reason);
        if (existing) {
          existing.value += curr.loss_value_at_cost;
        } else {
          acc.push({ name: curr.reason, value: curr.loss_value_at_cost });
        }
        return acc;
      },
      [] as { name: string; value: number }[]
    );
  }, [waste]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-white">Inventory Valuation</h3>
        <ExportButtons config={exportConfig} />
      </div>

      <ValuationCards
        isLoading={isLoading}
        valuationCost={valuation?.total_valuation_cost ?? totals.totalValueCost}
        valuationRetail={valuation?.total_valuation_retail ?? totals.totalValueRetail}
        totalItems={valuation?.total_items_in_stock ?? totals.totalItems}
        skuCount={valuation?.total_skus ?? filteredItems.length}
      />

      <WasteSection waste={waste} wasteByReason={wasteByReason} />

      <StockTable
        filteredItems={filteredItems}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortField={sortField}
        onSort={handleSort}
        totals={totals}
      />
    </div>
  );
};
