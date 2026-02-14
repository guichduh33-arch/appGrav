interface DiscountVoidEntry {
  id: string;
  created_at: string;
  order_number: string;
  type: 'discount' | 'void' | 'refund';
  amount: number;
  reason: string | null;
  staff_name: string | null;
}

interface DiscountsVoidsTableProps {
  data: DiscountVoidEntry[];
  formatCurrency: (value: number) => string;
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'discount':
      return (
        <span className="px-2 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full">
          Discount
        </span>
      );
    case 'void':
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded-full">
          Void
        </span>
      );
    case 'refund':
      return (
        <span className="px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-400 rounded-full">
          Refund
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium bg-white/5 text-[var(--theme-text-muted)] rounded-full">
          {type}
        </span>
      );
  }
}

export function DiscountsVoidsTable({ data, formatCurrency }: DiscountsVoidsTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">Loss Details</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Order</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Type</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Amount</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Reason</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Staff</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                  No data
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                    {new Date(row.created_at).toLocaleDateString('en-US')}
                    <div className="text-xs text-[var(--theme-text-muted)]/60">
                      {new Date(row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{row.order_number}</td>
                  <td className="px-6 py-4">{getTypeBadge(row.type)}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-red-400">
                    -{formatCurrency(row.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">{row.reason || '-'}</td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">{row.staff_name || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
