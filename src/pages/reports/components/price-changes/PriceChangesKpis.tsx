import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceChangesKpisProps {
  totalChanges: number;
  priceIncreases: number;
  priceDecreases: number;
}

export function PriceChangesKpis({
  totalChanges,
  priceIncreases,
  priceDecreases,
}: PriceChangesKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Total Changes
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {totalChanges}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Increases
          </span>
        </div>
        <p className="text-2xl font-bold text-emerald-400">
          {priceIncreases}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Decreases
          </span>
        </div>
        <p className="text-2xl font-bold text-red-400">
          {priceDecreases}
        </p>
      </div>
    </div>
  );
}
