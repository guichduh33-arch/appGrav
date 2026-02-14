import type { IProfitLossReport } from '@/types/reporting';

interface ProfitLossTableProps {
  data: IProfitLossReport[] | undefined;
  formatCurrency: (value: number) => string;
}

export function ProfitLossTable({ data, formatCurrency }: ProfitLossTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">Daily Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Orders</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Gross Revenue</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Cost</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Gross Profit</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Margin %</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Tax Collected</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                  No data
                </td>
              </tr>
            ) : (
              data?.map((row) => (
                <tr key={row.report_date} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-sm text-white">
                    {new Date(row.report_date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.order_count}</td>
                  <td className="px-6 py-4 text-sm text-white text-right font-medium">{formatCurrency(row.gross_revenue)}</td>
                  <td className="px-6 py-4 text-sm text-red-400 text-right">{formatCurrency(row.cogs)}</td>
                  <td className="px-6 py-4 text-sm text-emerald-400 text-right font-medium">{formatCurrency(row.gross_profit)}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      row.margin_percentage >= 30 ? 'bg-emerald-500/10 text-emerald-400' :
                      row.margin_percentage >= 15 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {row.margin_percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{formatCurrency(row.tax_collected || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
