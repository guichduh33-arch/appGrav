interface HourlyRow {
  hour: number;
  label: string;
  orders: number;
  revenue: number;
  avgRevenue: number;
}

interface SalesByHourTableProps {
  hourlyData: HourlyRow[];
  totalRevenue: number;
  formatCurrency: (value: number) => string;
}

export function SalesByHourTable({ hourlyData, totalRevenue, formatCurrency }: SalesByHourTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">Hourly Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/[0.02]">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Hour</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Orders</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Revenue</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {hourlyData.filter((h) => h.orders > 0).map((row) => (
              <tr key={row.hour} className="hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-sm font-medium text-white">{row.label}</td>
                <td className="px-6 py-4 text-sm text-[var(--theme-text-muted)] text-right">{row.orders}</td>
                <td className="px-6 py-4 text-sm text-white text-right font-medium">{formatCurrency(row.revenue)}</td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-gold)] rounded-full"
                        style={{ width: `${totalRevenue > 0 ? (row.revenue / totalRevenue) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-[var(--theme-text-muted)] w-12 text-right">
                      {totalRevenue > 0 ? ((row.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
