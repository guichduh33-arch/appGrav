import { Percent, XCircle, RotateCcw, TrendingDown } from 'lucide-react';

interface DiscountsVoidsKpisProps {
  totalDiscounts: number;
  totalVoids: number;
  totalRefunds: number;
  totalLoss: number;
  discountCount: number;
  voidCount: number;
  refundCount: number;
  formatCurrency: (value: number) => string;
}

export function DiscountsVoidsKpis({
  totalDiscounts,
  totalVoids,
  totalRefunds,
  totalLoss,
  discountCount,
  voidCount,
  refundCount,
  formatCurrency,
}: DiscountsVoidsKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Percent className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Total Discounts
          </span>
        </div>
        <p className="text-2xl font-bold text-amber-400">
          {formatCurrency(totalDiscounts)}
        </p>
        <p className="text-xs text-[var(--theme-text-muted)] mt-1">{discountCount} discounts</p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Total Voids
          </span>
        </div>
        <p className="text-2xl font-bold text-red-400">
          {formatCurrency(totalVoids)}
        </p>
        <p className="text-xs text-[var(--theme-text-muted)] mt-1">{voidCount} voids</p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <RotateCcw className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Total Refunds
          </span>
        </div>
        <p className="text-2xl font-bold text-purple-400">
          {formatCurrency(totalRefunds)}
        </p>
        <p className="text-xs text-[var(--theme-text-muted)] mt-1">{refundCount} refunds</p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/5 rounded-lg">
            <TrendingDown className="w-5 h-5 text-[var(--theme-text-muted)]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Total Loss
          </span>
        </div>
        <p className="text-2xl font-bold text-[var(--color-gold)]">
          {formatCurrency(totalLoss)}
        </p>
      </div>
    </div>
  );
}
