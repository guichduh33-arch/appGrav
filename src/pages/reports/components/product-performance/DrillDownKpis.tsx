import { Loader2, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

interface DrillDownKpisProps {
  totals: { revenue: number; quantity: number; avgDaily: number };
  isLoading: boolean;
}

export function DrillDownKpis({ totals, isLoading }: DrillDownKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Total Revenue
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white/40" /> : formatCurrency(totals.revenue)}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Total Qty Sold
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white/40" /> : totals.quantity.toLocaleString()}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Avg Daily Revenue
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white/40" /> : formatCurrency(totals.avgDaily)}
        </p>
      </div>
    </div>
  );
}
