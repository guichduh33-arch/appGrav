import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DailyData {
  date: string;
  discounts: number;
  voids: number;
  refunds: number;
}

interface DiscountsVoidsChartProps {
  chartData: DailyData[];
  formatCurrency: (value: number) => string;
}

export function DiscountsVoidsChart({ chartData, formatCurrency }: DiscountsVoidsChartProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Losses by Day</h3>
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-[var(--theme-text-muted)]">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} stroke="rgba(255,255,255,0.1)" />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }}
              stroke="rgba(255,255,255,0.1)"
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(value as number),
                name === 'discounts' ? 'Discounts' : name === 'voids' ? 'Voids' : 'Refunds',
              ]}
              contentStyle={{
                backgroundColor: 'var(--onyx-surface)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                color: '#fff',
              }}
            />
            <Legend wrapperStyle={{ color: 'var(--theme-text-muted)' }} />
            <Bar dataKey="discounts" name="Discounts" stackId="a" fill="#F59E0B" />
            <Bar dataKey="voids" name="Voids" stackId="a" fill="#EF4444" />
            <Bar dataKey="refunds" name="Refunds" stackId="a" fill="#A855F7" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
