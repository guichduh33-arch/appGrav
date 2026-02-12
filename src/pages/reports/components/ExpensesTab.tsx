import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Receipt, Calendar, DollarSign, TrendingDown } from 'lucide-react';
import { ReportSkeleton } from '@/components/reports/ReportSkeleton';
// POST-LAUNCH: Enable supabase import when expenses table is created
// import { supabase } from '@/lib/supabase';
import { DateRangePicker } from '@/components/reports/DateRangePicker';
import { ExportButtons, ExportConfig } from '@/components/reports/ExportButtons';
import { useDateRange } from '@/hooks/reports/useDateRange';
import { formatCurrency as formatCurrencyPdf } from '@/services/reports/pdfExport';

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  created_by: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'];

// Note: expenses table doesn't exist yet - this is a placeholder
async function getExpenses(_from: Date, _to: Date): Promise<Expense[]> {
  // Table doesn't exist yet, return empty array
  // When expenses table is created, uncomment and use this:
  /*
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('expense_date', from.toISOString().split('T')[0])
    .lte('expense_date', to.toISOString().split('T')[0])
    .order('expense_date', { ascending: false });

  if (error) return [];
  return data || [];
  */
  return [];
}

export function ExpensesTab() {
  const { dateRange } = useDateRange({ defaultPreset: 'thisMonth' });

  // Feature not yet available - expenses table doesn't exist
  const isFeatureAvailable = false;

  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', dateRange.from, dateRange.to],
    queryFn: () => getExpenses(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
    enabled: isFeatureAvailable, // Don't run query if feature not available
  });

  // Group by category
  const categoryData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const categoryMap = new Map<string, { total: number; count: number }>();

    data.forEach((d) => {
      const existing = categoryMap.get(d.category) || { total: 0, count: 0 };
      categoryMap.set(d.category, {
        total: existing.total + d.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        total: stats.total,
        count: stats.count,
      }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  // Daily chart data
  const dailyData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const dayMap = new Map<string, number>();

    data.forEach((d) => {
      const date = d.expense_date.split('T')[0];
      dayMap.set(date, (dayMap.get(date) || 0) + d.amount);
    });

    return Array.from(dayMap.entries())
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()) // Sort by ISO date first
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        amount,
      }));
  }, [data]);

  // Summary stats
  const summary = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalExpenses: 0, totalAmount: 0, avgExpense: 0 };
    }

    const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);

    return {
      totalExpenses: data.length,
      totalAmount,
      avgExpense: totalAmount / data.length,
    };
  }, [data]);

  // Export config
  const exportConfig: ExportConfig<Expense> = useMemo(() => ({
    data: data || [],
    columns: [
      { key: 'expense_date', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('en-US') },
      { key: 'category', header: 'Category' },
      { key: 'description', header: 'Description' },
      { key: 'amount', header: 'Amount', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'payment_method', header: 'Payment Method' },
      { key: 'created_by', header: 'Created By' },
    ],
    filename: 'expenses',
    title: 'Expenses Report',
    dateRange,
    summaries: [
      { label: 'Total Expenses', value: formatCurrencyPdf(summary.totalAmount) },
      { label: 'Number of Expenses', value: summary.totalExpenses.toString() },
    ],
  }), [data, dateRange, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading data
      </div>
    );
  }

  if (isLoading) {
    return <ReportSkeleton />;
  }

  // Show feature not available message
  if (!isFeatureAvailable) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <Receipt className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            Expenses Module - Coming Soon
          </h3>
          <p className="text-amber-700">
            Expense tracking will be available in an upcoming version. This feature will allow you to manage and track all operational expenses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker defaultPreset="thisMonth" />
        <ExportButtons config={exportConfig} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalAmount)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Number of Expenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalExpenses}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Average per Expense</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.avgExpense)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Expenses</h3>

          {dailyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No expenses in this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Expenses']} />
                <Bar dataKey="amount" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribution by Category</h3>

          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
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
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Expense Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(row.expense_date).toLocaleDateString('en-US')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{row.description || '-'}</td>
                    <td className="px-6 py-4 text-sm text-red-600 text-right font-medium">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.payment_method}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No expenses in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
