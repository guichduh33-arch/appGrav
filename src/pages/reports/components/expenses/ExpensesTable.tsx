import { Calendar } from 'lucide-react';

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  created_by: string;
}

interface ExpensesTableProps {
  data: Expense[] | undefined;
  formatCurrency: (value: number) => string;
}

export function ExpensesTable({ data, formatCurrency }: ExpensesTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">Expense Details</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Category</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Description</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Amount</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Payment</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(row.expense_date).toLocaleDateString('en-US')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-white/5 text-[var(--theme-text-muted)] rounded-full">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{row.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-red-400 text-right font-medium">
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">{row.payment_method}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                  No expenses in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
