import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react';

interface ProfitLossKpisProps {
  grossRevenue: number;
  cogs: number;
  grossProfit: number;
  marginPercentage: number;
  formatCurrency: (value: number) => string;
}

export function ProfitLossKpis({
  grossRevenue,
  cogs,
  grossProfit,
  marginPercentage,
  formatCurrency,
}: ProfitLossKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Gross Revenue
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(grossRevenue)}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Cost of Sales
          </span>
        </div>
        <p className="text-2xl font-bold text-red-400">
          {formatCurrency(cogs)}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Gross Profit
          </span>
        </div>
        <p className="text-2xl font-bold text-emerald-400">
          {formatCurrency(grossProfit)}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Percent className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Margin %
          </span>
        </div>
        <p className="text-2xl font-bold text-purple-400">
          {`${marginPercentage.toFixed(1)}%`}
        </p>
      </div>
    </div>
  );
}
