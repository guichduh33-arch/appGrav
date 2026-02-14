import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface ChartRow {
  date: string;
  revenue: number;
  cogs: number;
  profit: number;
  margin: number;
}

interface ProfitLossChartProps {
  chartData: ChartRow[];
  chartView: 'bar' | 'line';
  setChartView: (v: 'bar' | 'line') => void;
  formatCurrency: (value: number) => string;
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--onyx-surface)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.75rem',
  color: '#fff',
};

export function ProfitLossChart({
  chartData,
  chartView,
  setChartView,
  formatCurrency,
}: ProfitLossChartProps) {
  return (
    <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Profit/Loss Trend</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartView('bar')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              chartView === 'bar'
                ? 'bg-[var(--color-gold)] text-black font-bold'
                : 'bg-transparent border border-white/10 text-white hover:border-white/20'
            }`}
          >
            Bars
          </button>
          <button
            onClick={() => setChartView('line')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              chartView === 'line'
                ? 'bg-[var(--color-gold)] text-black font-bold'
                : 'bg-transparent border border-white/10 text-white hover:border-white/20'
            }`}
          >
            Line
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-[var(--theme-text-muted)]">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          {chartView === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} stroke="rgba(255,255,255,0.1)" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} stroke="rgba(255,255,255,0.1)" />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value as number), name === 'revenue' ? 'Revenue' : name === 'cogs' ? 'Cost' : 'Profit']}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ fontWeight: 'bold', color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: 'var(--theme-text-muted)' }} />
              <Bar dataKey="revenue" name="Gross Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cogs" name="Cost" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} stroke="rgba(255,255,255,0.1)" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} stroke="rgba(255,255,255,0.1)" />
              <Tooltip
                formatter={(value, name) => [formatCurrency(value as number), name === 'revenue' ? 'Revenue' : name === 'cogs' ? 'Cost' : 'Profit']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Legend wrapperStyle={{ color: 'var(--theme-text-muted)' }} />
              <Line type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cogs" name="Cost" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}
