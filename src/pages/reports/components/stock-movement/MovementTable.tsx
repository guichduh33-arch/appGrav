interface StockMovementWithProduct {
  id: string;
  created_at: string | null;
  movement_type: string;
  quantity: number;
  reason: string | null;
  product?: {
    name?: string;
    sku?: string;
    unit?: string;
  };
}

interface MovementTableProps {
  filteredData: StockMovementWithProduct[];
  isLoading: boolean;
}

export function MovementTable({ filteredData, isLoading }: MovementTableProps) {
  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      sale: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      waste: 'bg-red-500/10 text-red-400 border border-red-500/20',
      purchase: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      transfer: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    };
    const matchedKey = Object.keys(styles).find((k) => type.includes(k));
    const style = matchedKey ? styles[matchedKey] : 'bg-white/5 text-white/60 border border-white/10';
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Date</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Product</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Type</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Quantity</th>
            <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Reason/Ref</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded animate-pulse" /></td>
                <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded animate-pulse" /></td>
                <td className="px-6 py-4 text-right"><div className="h-4 w-12 bg-white/5 rounded animate-pulse ml-auto" /></td>
                <td className="px-6 py-4"><div className="h-4 w-20 bg-white/5 rounded animate-pulse" /></td>
              </tr>
            ))
          ) : filteredData.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-[var(--muted-smoke)]">
                No stock movements found.
              </td>
            </tr>
          ) : (
            filteredData.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                  {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
                  {row.created_at && (
                    <div className="text-xs text-white/30">
                      {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {row.product?.name || 'Unknown Product'}
                  <div className="text-xs text-white/30 font-mono">{row.product?.sku}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getTypeBadge(row.movement_type)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                  row.quantity > 0 ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  {row.quantity > 0 ? '+' : ''}{row.quantity} {row.product?.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">
                  {row.reason ? (
                    <div className="max-w-xs truncate" title={row.reason}>{row.reason}</div>
                  ) : (
                    <span className="text-white/20">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
