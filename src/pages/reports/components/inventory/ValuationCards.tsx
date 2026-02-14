import { DollarSign, Boxes } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

interface ValuationCardsProps {
  isLoading: boolean;
  valuationCost: number;
  valuationRetail: number;
  totalItems: number;
  skuCount: number;
}

export function ValuationCards({ isLoading, valuationCost, valuationRetail, totalItems, skuCount }: ValuationCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Stock Value (Cost)
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {isLoading ? (
            <span className="inline-block w-32 h-7 bg-white/5 rounded animate-pulse" />
          ) : (
            formatCurrency(valuationCost)
          )}
        </p>
        <p className="text-xs text-[var(--muted-smoke)] mt-1">{skuCount} references</p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Stock Value (Retail)
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {isLoading ? (
            <span className="inline-block w-32 h-7 bg-white/5 rounded animate-pulse" />
          ) : (
            formatCurrency(valuationRetail)
          )}
        </p>
        <p className="text-xs text-emerald-400/70 mt-1">
          Potential margin: {formatCurrency(valuationRetail - valuationCost)}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Boxes className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Items in Stock
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {isLoading ? (
            <span className="inline-block w-20 h-7 bg-white/5 rounded animate-pulse" />
          ) : (
            totalItems.toLocaleString()
          )}
        </p>
      </div>
    </div>
  );
}
