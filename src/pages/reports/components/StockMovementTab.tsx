import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownCircle, ArrowUpCircle, Package, Hash, Search, Filter } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';

// Extended type for stock movements with joined product data
interface StockMovementWithProduct {
  id: string;
  created_at: string | null;
  movement_type: string;
  quantity: number;
  reason: string | null;
  product?: {
    name?: string;
    sku?: string;
    unit?: string;
  };
}

const MOVEMENT_TYPES = ['all', 'waste', 'purchase', 'adjustment', 'transfer', 'sale_pos', 'sale_b2b'] as const;

export const StockMovementTab = () => {
  const { dateRange } = useDateRange({ defaultPreset: 'last30days' });
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: movements = [], isLoading, error } = useQuery<StockMovementWithProduct[]>({
    queryKey: ['stockMovements', dateRange.from, dateRange.to],
    queryFn: async () => {
      const data = await ReportingService.getStockMovements(dateRange.from, dateRange.to);
      return data as StockMovementWithProduct[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filter data
  const filteredData = useMemo(() => {
    let result = movements;

    if (typeFilter !== 'all') {
      result = result.filter((m) => m.movement_type.includes(typeFilter));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.product?.name?.toLowerCase().includes(term) ||
          m.product?.sku?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [movements, typeFilter, searchTerm]);

  // KPIs
  const kpis = useMemo(() => {
    const totalIn = filteredData
      .filter((m) => m.quantity > 0)
      .reduce((sum, m) => sum + m.quantity, 0);

    const totalOut = filteredData
      .filter((m) => m.quantity < 0)
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

    return {
      totalIn,
      totalOut,
      netMovement: totalIn - totalOut,
      movementCount: filteredData.length,
    };
  }, [filteredData]);

  // Export config
  const exportConfig: ExportConfig<StockMovementWithProduct> = useMemo(
    () => ({
      data: filteredData,
      columns: [
        {
          key: 'created_at',
          header: 'Date',
          format: (v) => v ? new Date(v as string).toLocaleString() : '-',
        },
        { key: 'product', header: 'Product', format: (v: unknown) => (v as { name?: string })?.name || 'Unknown' },
        { key: 'movement_type', header: 'Type' },
        { key: 'quantity', header: 'Quantity', align: 'right' as const },
        { key: 'reason', header: 'Reason' },
      ],
      filename: 'stock-movements',
      title: 'Stock Movement Report',
      dateRange: { from: dateRange.from, to: dateRange.to },
      summaries: [
        { label: 'Total In', value: kpis.totalIn.toString() },
        { label: 'Total Out', value: kpis.totalOut.toString() },
        { label: 'Net Movement', value: kpis.netMovement.toString() },
      ],
    }),
    [filteredData, dateRange, kpis]
  );

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading stock movements. Please try again.
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
              <ArrowDownCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total In</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {isLoading ? (
              <span className="inline-block w-20 h-6 bg-gray-200 rounded animate-pulse" />
            ) : (
              `+${kpis.totalIn.toLocaleString()}`
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-600">Total Out</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {isLoading ? (
              <span className="inline-block w-20 h-6 bg-gray-200 rounded animate-pulse" />
            ) : (
              `-${kpis.totalOut.toLocaleString()}`
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Net Movement</span>
          </div>
          <p className={`text-2xl font-bold ${kpis.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {isLoading ? (
              <span className="inline-block w-20 h-6 bg-gray-200 rounded animate-pulse" />
            ) : (
              `${kpis.netMovement >= 0 ? '+' : ''}${kpis.netMovement.toLocaleString()}`
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Hash className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Movement Count</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? (
              <span className="inline-block w-20 h-6 bg-gray-200 rounded animate-pulse" />
            ) : (
              kpis.movementCount.toLocaleString()
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search product or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MOVEMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason/Ref
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse ml-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  No stock movements found.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
                    {row.created_at && (
                      <div className="text-xs text-gray-400">
                        {new Date(row.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.product?.name || 'Unknown Product'}
                    <div className="text-xs text-gray-400 font-mono">{row.product?.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          row.movement_type.includes('sale')
                            ? 'bg-green-100 text-green-800'
                            : row.movement_type === 'waste'
                              ? 'bg-red-100 text-red-800'
                              : row.movement_type === 'purchase'
                                ? 'bg-blue-100 text-blue-800'
                                : row.movement_type.includes('transfer')
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {row.movement_type}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                      row.quantity > 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}
                  >
                    {row.quantity > 0 ? '+' : ''}
                    {row.quantity} {row.product?.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.reason ? (
                      <div className="max-w-xs truncate" title={row.reason}>
                        {row.reason}
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
