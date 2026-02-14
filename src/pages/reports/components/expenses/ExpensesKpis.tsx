import { TrendingDown, Receipt, DollarSign } from 'lucide-react';

interface ExpensesKpisProps {
  totalAmount: number;
  totalExpenses: number;
  avgExpense: number;
  formatCurrency: (value: number) => string;
}

export function ExpensesKpis({
  totalAmount,
  totalExpenses,
  avgExpense,
  formatCurrency,
}: ExpensesKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Total Expenses
          </span>
        </div>
        <p className="text-2xl font-bold text-red-400">
          {formatCurrency(totalAmount)}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Receipt className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Number of Expenses
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {totalExpenses}
        </p>
      </div>

      <div className="bg-[var(--onyx-surface)] rounded-xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Average per Expense
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(avgExpense)}
        </p>
      </div>
    </div>
  );
}
