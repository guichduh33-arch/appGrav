import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'];

interface DailyRow {
  date: string;
  amount: number;
}

interface CategoryRow {
  category: string;
  total: number;
  count: number;
  [key: string]: unknown;
}

interface ExpensesChartsProps {
  dailyData: DailyRow[];
  categoryData: CategoryRow[];
  formatCurrency: (value: number) => string;
}

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--onyx-surface)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.75rem',
  color: '#fff',
};

export function ExpensesCharts({ dailyData, categoryData, formatCurrency }: ExpensesChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Bar Chart */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Daily Expenses</h3>
        {dailyData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-[var(--theme-text-muted)]">
            No expenses in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--theme-text-muted)' }} stroke="rgba(255,255,255,0.1)" />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: 'var(--theme-text-muted)' }} stroke="rgba(255,255,255,0.1)" />
              <Tooltip formatter={(value) => [formatCurrency(value as number), 'Expenses']} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="amount" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Pie Chart */}
      <div className="bg-[var(--onyx-surface)] rounded-xl border border-white/5 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Distribution by Category</h3>
        {categoryData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-[var(--theme-text-muted)]">
            No expenses in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="total"
                nameKey="category"
                label={({ name, percent }) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
