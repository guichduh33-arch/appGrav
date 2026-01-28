import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Receipt, Calendar, Loader2, DollarSign, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

interface ExpenseByCategory {
  category: string;
  total: number;
  count: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6'];

async function getExpenses(from: Date, to: Date): Promise<Expense[]> {
  // Try to fetch from expenses table if it exists
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      expense_date,
      category,
      description,
      amount,
      payment_method,
      user_id
    `)
    .gte('expense_date', from.toISOString().split('T')[0])
    .lte('expense_date', to.toISOString().split('T')[0])
    .order('expense_date', { ascending: false });

  if (error) {
    // Table might not exist, return empty array
    console.warn('Expenses table not found:', error);
    return [];
  }

  // Fetch user names
  const userIds = [...new Set(data?.map(d => d.user_id).filter(Boolean) || [])];
  let userMap = new Map<string, string>();

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, name')
      .in('id', userIds);
    userMap = new Map(users?.map(u => [u.id, u.name]) || []);
  }

  return (data || []).map(d => ({
    id: d.id,
    expense_date: d.expense_date,
    category: d.category || 'Autre',
    description: d.description || '',
    amount: d.amount || 0,
    payment_method: d.payment_method || 'cash',
    created_by: userMap.get(d.user_id) || 'Inconnu',
  }));
}

export function ExpensesTab() {
  const { t } = useTranslation();
  const { dateRange } = useDateRange({ defaultPreset: 'thisMonth' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', dateRange.from, dateRange.to],
    queryFn: () => getExpenses(dateRange.from, dateRange.to),
    staleTime: 5 * 60 * 1000,
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
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        amount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
      { key: 'expense_date', header: 'Date', format: (v) => new Date(v as string).toLocaleDateString('fr-FR') },
      { key: 'category', header: 'Catégorie' },
      { key: 'description', header: 'Description' },
      { key: 'amount', header: 'Montant', align: 'right' as const, format: (v) => formatCurrencyPdf(v as number) },
      { key: 'payment_method', header: 'Mode paiement' },
      { key: 'created_by', header: 'Créé par' },
    ],
    filename: 'depenses',
    title: 'Rapport des Dépenses',
    dateRange,
    summaries: [
      { label: 'Total dépenses', value: formatCurrencyPdf(summary.totalAmount) },
      { label: 'Nombre de dépenses', value: summary.totalExpenses.toString() },
    ],
  }), [data, dateRange, summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' IDR';
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {t('common.error', 'Erreur lors du chargement des données')}
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
            <span className="text-sm text-gray-600">Total dépenses</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(summary.totalAmount)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Nombre de dépenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : summary.totalExpenses}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-600">Moyenne / dépense</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(summary.avgExpense)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Dépenses par jour</h3>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : dailyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Aucune dépense sur cette période
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Dépenses']} />
                <Bar dataKey="amount" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par catégorie</h3>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Aucune dépense sur cette période
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
                  label={({ category, percent }) => `${category}: ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Montant']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détail des dépenses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : data && data.length > 0 ? (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(row.expense_date).toLocaleDateString('fr-FR')}
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
                    Aucune dépense sur cette période
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
