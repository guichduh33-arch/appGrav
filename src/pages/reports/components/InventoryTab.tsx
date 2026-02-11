import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Search, ArrowUpDown, Package, DollarSign, Boxes } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { formatCurrency } from '@/utils/helpers';
import { useInventoryConfigSettings } from '@/hooks/settings/useModuleConfigSettings';
import type { InventoryValuation, StockWaste } from '@/types/reporting';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4444'];

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

  // Filter and sort stock items
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

  // Totals
  const totals = useMemo(() => {
    return {
      totalItems: filteredItems.reduce((sum, item) => sum + item.current_stock, 0),
      totalValueCost: filteredItems.reduce((sum, item) => sum + item.stock_value, 0),
      totalValueRetail: filteredItems.reduce(
        (sum, item) => sum + item.current_stock * item.retail_price,
        0
      ),
    };
  }, [filteredItems]);

  // Export config
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

  // Waste data for chart
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

  const SortableHeader = ({
    field,
    children,
    align = 'left',
  }: {
    field: SortField;
    children: React.ReactNode;
    align?: 'left' | 'right';
  }) => (
    <th
      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {children}
        <ArrowUpDown
          className={`w-3 h-3 ${sortField === field ? 'text-blue-500' : 'text-gray-300'}`}
        />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Inventory Valuation</h3>
        <ExportButtons config={exportConfig} />
      </div>

      {/* Valuation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Stock Value (Cost)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? (
              <span className="inline-block w-32 h-7 bg-gray-200 rounded animate-pulse" />
            ) : (
              formatCurrency(valuation?.total_valuation_cost ?? totals.totalValueCost)
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {valuation?.total_skus ?? filteredItems.length} references
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Stock Value (Retail)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? (
              <span className="inline-block w-32 h-7 bg-gray-200 rounded animate-pulse" />
            ) : (
              formatCurrency(valuation?.total_valuation_retail ?? totals.totalValueRetail)
            )}
          </p>
          <p className="text-xs text-green-500 mt-1">
            Potential margin:{' '}
            {formatCurrency(
              (valuation?.total_valuation_retail ?? totals.totalValueRetail) -
                (valuation?.total_valuation_cost ?? totals.totalValueCost)
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Boxes className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Items in Stock</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? (
              <span className="inline-block w-20 h-7 bg-gray-200 rounded animate-pulse" />
            ) : (
              (valuation?.total_items_in_stock ?? totals.totalItems).toLocaleString()
            )}
          </p>
        </div>
      </div>

      {/* Waste Charts */}
      {waste.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-6">Wastage Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wasteByReason}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {wasteByReason.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number | undefined) => formatCurrency(val ?? 0)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Wastage Detail</h3>
            <div className="overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b sticky top-0 bg-white">
                  <tr>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Reason</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {waste.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2">{item.product_name}</td>
                      <td className="py-2 text-gray-500">{item.reason}</td>
                      <td className="py-2 text-right font-medium">{item.waste_quantity}</td>
                      <td className="py-2 text-right text-red-500">
                        {formatCurrency(item.loss_value_at_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Stock Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Stock by Product</h3>
          <div className="relative min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product, SKU, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader field="product_name">Product</SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <SortableHeader field="current_stock" align="right">
                  Stock
                </SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unit
                </th>
                <SortableHeader field="cost_price" align="right">
                  Cost
                </SortableHeader>
                <SortableHeader field="stock_value" align="right">
                  Value
                </SortableHeader>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        {item.product_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {item.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {item.current_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      {formatCurrency(item.cost_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(item.stock_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${
                            item.status === 'ok'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'low'
                                ? 'bg-yellow-100 text-yellow-800'
                                : item.status === 'critical'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {item.status === 'out' ? 'Out of Stock' : item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Totals Row */}
            {!isLoading && filteredItems.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-sm font-bold text-gray-900">
                    Total ({filteredItems.length} products)
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-bold text-gray-900">
                    {totals.totalItems.toLocaleString()}
                  </td>
                  <td className="px-6 py-3" />
                  <td className="px-6 py-3 text-sm text-right font-bold text-gray-500">
                    (Cost)
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-bold text-gray-900">
                    {formatCurrency(totals.totalValueCost)}
                  </td>
                  <td className="px-6 py-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
