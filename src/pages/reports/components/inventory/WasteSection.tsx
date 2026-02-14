import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/utils/helpers';
import type { StockWaste } from '@/types/reporting';

const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#F97316', '#EF4444'];

interface WasteSectionProps {
  waste: StockWaste[];
  wasteByReason: { name: string; value: number }[];
}

export function WasteSection({ waste, wasteByReason }: WasteSectionProps) {
  if (waste.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-6">Wastage Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={wasteByReason}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {wasteByReason.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                formatter={(val: number | undefined) => formatCurrency(val ?? 0)}
              />
              <Legend wrapperStyle={{ color: 'var(--muted-smoke)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-4">Wastage Detail</h3>
        <div className="overflow-auto max-h-64">
          <table className="w-full text-sm">
            <thead className="text-left border-b border-white/5 sticky top-0 bg-[var(--onyx-surface)]">
              <tr>
                <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Product</th>
                <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Reason</th>
                <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Qty</th>
                <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Cost</th>
              </tr>
            </thead>
            <tbody>
              {waste.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="py-2 text-white/80">{item.product_name}</td>
                  <td className="py-2 text-white/50">{item.reason}</td>
                  <td className="py-2 text-right font-medium text-white">{item.waste_quantity}</td>
                  <td className="py-2 text-right text-red-400">
                    {formatCurrency(item.loss_value_at_cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
