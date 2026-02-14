import { Package } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import type { ProductPerformanceStat } from '@/types/reporting';

interface ProductTableProps {
  products: ProductPerformanceStat[];
  onProductClick: (productId: string, productName: string) => void;
}

export function ProductTable({ products, onProductClick }: ProductTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">All Products</h3>
        <p className="text-xs text-[var(--muted-smoke)] mt-0.5">Click a row to see sales history</p>
      </div>
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Product</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Category</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Qty Sold</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Revenue</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Avg Price</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Margin %</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-[var(--muted-smoke)]">
                No data available.
              </td>
            </tr>
          ) : (
            products.map((row) => (
              <tr
                key={row.product_id}
                className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                onClick={() => onProductClick(row.product_id, row.product_name)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-gold)]">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-white/30" />
                    {row.product_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                  {row.category_name || 'Uncategorized'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 text-right">
                  {row.quantity_sold}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white text-right">
                  {formatCurrency(row.total_revenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50 text-right">
                  {formatCurrency(row.avg_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={`font-medium ${(row.margin_percentage || 0) >= 30 ? 'text-emerald-400' : (row.margin_percentage || 0) >= 15 ? 'text-amber-400' : 'text-red-400'}`}>
                    {(row.margin_percentage || 0).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
