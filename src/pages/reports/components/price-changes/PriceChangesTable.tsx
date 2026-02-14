import { TrendingUp, TrendingDown, User, Calendar, Package } from 'lucide-react';

interface PriceChange {
  id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  old_retail_price: number;
  new_retail_price: number;
  old_cost_price: number;
  new_cost_price: number;
  changed_by: string;
  changed_at: string;
  reason: string | null;
}

interface PriceChangesTableProps {
  data: PriceChange[] | undefined;
  formatCurrency: (value: number) => string;
}

function getPriceChangeBadge(oldPrice: number, newPrice: number) {
  const diff = newPrice - oldPrice;
  const pct = oldPrice > 0 ? ((diff / oldPrice) * 100).toFixed(1) : '0';

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full">
        <TrendingUp className="w-3 h-3" />
        +{pct}%
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-500/10 text-red-400 rounded-full">
        <TrendingDown className="w-3 h-3" />
        {pct}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/5 text-[var(--theme-text-muted)] rounded-full">
      0%
    </span>
  );
}

export function PriceChangesTable({ data, formatCurrency }: PriceChangesTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">Change History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Product</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Old Price</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">New Price</th>
              <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Change</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Modified By</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <Package className="w-4 h-4 text-[var(--theme-text-muted)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{row.product_name}</p>
                        {row.sku && <p className="text-xs text-[var(--theme-text-muted)]">{row.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">
                    {formatCurrency(row.old_retail_price)}
                  </td>
                  <td className="px-6 py-4 text-sm text-white text-right font-medium">
                    {formatCurrency(row.new_retail_price)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getPriceChangeBadge(row.old_retail_price, row.new_retail_price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--theme-text-muted)]">
                      <User className="w-3 h-3" />
                      {row.changed_by}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(row.changed_at).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[var(--theme-text-muted)]">
                  No price changes in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
