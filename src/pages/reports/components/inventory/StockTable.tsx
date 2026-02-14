import { Search, ArrowUpDown, Package } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

type SortField = 'product_name' | 'current_stock' | 'cost_price' | 'stock_value';

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

interface StockTableProps {
  filteredItems: ProductStock[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortField: SortField;
  onSort: (field: SortField) => void;
  totals: { totalItems: number; totalValueCost: number };
}

export function StockTable({
  filteredItems, isLoading, searchTerm, onSearchChange,
  sortField, onSort, totals,
}: StockTableProps) {
  const SortableHeader = ({
    field, children, align = 'left',
  }: {
    field: SortField; children: React.ReactNode; align?: 'left' | 'right';
  }) => (
    <th
      className={`px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] cursor-pointer hover:text-white/60 ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {children}
        <ArrowUpDown
          className={`w-3 h-3 ${sortField === field ? 'text-[var(--color-gold)]' : 'text-white/20'}`}
        />
      </div>
    </th>
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ok: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      low: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      critical: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      out: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles.ok}`}>
        {status === 'out' ? 'Out of Stock' : status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-white">Stock by Product</h3>
        <div className="relative min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search product, SKU, category..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/5">
              <SortableHeader field="product_name">Product</SortableHeader>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">SKU</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Category</th>
              <SortableHeader field="current_stock" align="right">Stock</SortableHeader>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Unit</th>
              <SortableHeader field="cost_price" align="right">Cost</SortableHeader>
              <SortableHeader field="stock_value" align="right">Value</SortableHeader>
              <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[var(--muted-smoke)]">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.product_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-white/30" />
                      {item.product_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/40 font-mono">
                    {item.sku || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-white">
                    {item.current_stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-white/50">
                    {formatCurrency(item.cost_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-white">
                    {formatCurrency(item.stock_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {getStatusBadge(item.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {!isLoading && filteredItems.length > 0 && (
            <tfoot className="border-t-2 border-white/10">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-sm font-bold text-white">
                  Total ({filteredItems.length} products)
                </td>
                <td className="px-6 py-3 text-sm text-right font-bold text-white">
                  {totals.totalItems.toLocaleString()}
                </td>
                <td className="px-6 py-3" />
                <td className="px-6 py-3 text-sm text-right font-bold text-[var(--muted-smoke)]">
                  (Cost)
                </td>
                <td className="px-6 py-3 text-sm text-right font-bold text-white">
                  {formatCurrency(totals.totalValueCost)}
                </td>
                <td className="px-6 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
