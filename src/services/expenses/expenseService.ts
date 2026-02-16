/**
 * Expense Service — business logic utilities
 */
import type {
  IExpenseCategory,
  IExpenseCategoryWithChildren,
  IExpenseInsert,
  IExpenseWithRelations,
} from '@/types/expenses'

/** Build hierarchical tree from flat category list */
export function buildCategoryTree(
  categories: IExpenseCategory[],
  parentId: string | null = null
): IExpenseCategoryWithChildren[] {
  return categories
    .filter(c => c.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(c => ({
      ...c,
      children: buildCategoryTree(categories, c.id),
    }))
}

/** Flatten tree into depth-annotated list (for dropdowns) */
export function flattenCategoryTree(
  tree: IExpenseCategoryWithChildren[],
  depth = 0
): (IExpenseCategory & { depth: number })[] {
  const result: (IExpenseCategory & { depth: number })[] = []
  for (const node of tree) {
    const { children, ...rest } = node
    result.push({ ...rest, depth })
    if (children.length > 0) {
      result.push(...flattenCategoryTree(children as IExpenseCategoryWithChildren[], depth + 1))
    }
  }
  return result
}

/** Validate expense input before submission */
export function validateExpense(
  input: Partial<IExpenseInsert>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!input.category_id) errors.push('Category is required')
  if (!input.description?.trim()) errors.push('Description is required')
  if (!input.amount || input.amount <= 0) errors.push('Amount must be greater than 0')
  if (!input.expense_date) errors.push('Date is required')
  if (!input.payment_method) errors.push('Payment method is required')
  return { valid: errors.length === 0, errors }
}

/** Calculate summary totals from expense list */
export function calculateExpenseTotals(expenses: IExpenseWithRelations[]) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const count = expenses.length
  const avg = count > 0 ? total / count : 0

  const byCategoryMap = new Map<string, { name: string; total: number; count: number }>()
  const byPaymentMap = new Map<string, { method: string; total: number; count: number }>()

  for (const e of expenses) {
    const catKey = e.category_name || 'Unknown'
    const cat = byCategoryMap.get(catKey) || { name: catKey, total: 0, count: 0 }
    cat.total += e.amount
    cat.count += 1
    byCategoryMap.set(catKey, cat)

    const pay = byPaymentMap.get(e.payment_method) || { method: e.payment_method, total: 0, count: 0 }
    pay.total += e.amount
    pay.count += 1
    byPaymentMap.set(e.payment_method, pay)
  }

  return {
    total,
    count,
    avg,
    byCategory: Array.from(byCategoryMap.values()).sort((a, b) => b.total - a.total),
    byPaymentMethod: Array.from(byPaymentMap.values()).sort((a, b) => b.total - a.total),
  }
}
