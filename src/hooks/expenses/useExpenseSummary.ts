import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { IExpenseSummary } from '@/types/expenses'

export function useExpenseSummary(from: Date, to: Date) {
  return useQuery({
    queryKey: ['expense-summary', from.toISOString(), to.toISOString()],
    queryFn: async (): Promise<IExpenseSummary> => {
      const fromStr = from.toISOString().split('T')[0]
      const toStr = to.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id, amount, expense_date, status, payment_method,
          category:expense_categories!category_id(name)
        `)
        .gte('expense_date', fromStr)
        .lte('expense_date', toStr)

      if (error) throw error
      const rows = (data ?? []) as unknown as Array<{
        id: string; amount: number; expense_date: string;
        status: string; payment_method: string;
        category: { name: string } | null;
      }>

      const approved = rows.filter(r => r.status === 'approved')
      const total = approved.reduce((s, r) => s + r.amount, 0)
      const count = approved.length
      const avg = count > 0 ? total / count : 0
      const pending_count = rows.filter(r => r.status === 'pending').length

      // By category
      const catMap = new Map<string, { name: string; total: number; count: number }>()
      for (const r of approved) {
        const name = r.category?.name ?? 'Unknown'
        const existing = catMap.get(name) || { name, total: 0, count: 0 }
        existing.total += r.amount
        existing.count += 1
        catMap.set(name, existing)
      }

      // By day
      const dayMap = new Map<string, number>()
      for (const r of approved) {
        const d = r.expense_date.split('T')[0]
        dayMap.set(d, (dayMap.get(d) || 0) + r.amount)
      }

      return {
        total,
        count,
        avg,
        pending_count,
        by_category: Array.from(catMap.values()).sort((a, b) => b.total - a.total),
        by_day: Array.from(dayMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, amount]) => ({ date, amount })),
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
