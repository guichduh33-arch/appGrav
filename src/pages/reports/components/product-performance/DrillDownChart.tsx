import { Loader2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/utils/helpers';

interface ProductDailySales {
  date: string;
  quantity: number;
  revenue: number;
  order_count: number;
}

interface DrillDownChartProps {
  productName: string;
  history: ProductDailySales[];
  isLoading: boolean;
}

export function DrillDownChart({ productName, history, isLoading }: DrillDownChartProps) {
  return (
    <div className="bg-[var(--onyx-surface)] p-6 rounded-xl border border-white/5">
      <h3 className="text-sm font-semibold text-white mb-4">Sales Trend: {productName}</h3>
      {isLoading ? (
        <div className="h-80 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/20" />
        </div>
      ) : history.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-[var(--muted-smoke)]">
          No sales data for this period.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={history} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'var(--muted-smoke)', fontSize: 11 }}
            />
            <YAxis yAxisId="left" orientation="left" stroke="rgba(255,255,255,0.3)" tick={{ fill: '#60A5FA', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" tick={{ fill: '#34D399', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
              formatter={(value, name) => [
                name === 'Revenue' ? formatCurrency(value as number) : value,
                name,
              ]}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
            <Line yAxisId="right" type="monotone" dataKey="quantity" name="Quantity" stroke="#34D399" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
