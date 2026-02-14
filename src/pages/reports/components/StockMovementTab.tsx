import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
import { ReportingService } from '@/services/ReportingService';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { MovementKpis } from './stock-movement/MovementKpis';
import { MovementTable } from './stock-movement/MovementTable';

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

  const exportConfig: ExportConfig<StockMovementWithProduct> = useMemo(
    () => ({
      data: filteredData,
      columns: [
        { key: 'created_at', header: 'Date', format: (v) => v ? new Date(v as string).toLocaleString() : '-' },
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
      <div className="p-8 text-center text-red-400">
        Error loading stock movements. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="last30days" />
        <ExportButtons config={exportConfig} />
      </div>

      <MovementKpis
        isLoading={isLoading}
        totalIn={kpis.totalIn}
        totalOut={kpis.totalOut}
        netMovement={kpis.netMovement}
        movementCount={kpis.movementCount}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search product or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/30" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          >
            {MOVEMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <MovementTable filteredData={filteredData} isLoading={isLoading} />
    </div>
  );
};
