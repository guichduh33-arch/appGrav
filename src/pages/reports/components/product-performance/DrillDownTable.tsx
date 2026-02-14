import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

interface ProductDailySales {
  date: string;
  quantity: number;
  revenue: number;
  order_count: number;
}

interface DrillDownTableProps {
  productName: string;
  history: ProductDailySales[];
  isLoading: boolean;
}

export function DrillDownTable({ productName, history, isLoading }: DrillDownTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Daily Sales: {productName}</h3>
      </div>
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Qty Sold</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-white/20" />
              </td>
            </tr>
          ) : history.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center text-[var(--muted-smoke)]">
                No sales data.
              </td>
            </tr>
          ) : (
            history.map((row) => (
              <tr key={row.date} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-sm text-white/70">
                  {new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}
                </td>
                <td className="px-6 py-4 text-sm text-white/60 text-right">{row.quantity}</td>
                <td className="px-6 py-4 text-sm font-bold text-white text-right">{formatCurrency(row.revenue)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
