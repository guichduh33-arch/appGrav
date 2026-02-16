/**
 * Expenses Module Types
 * Operational expense tracking with categories and approval workflow
 */

// ============================================================================
// ENUM TYPES
// ============================================================================

export type TExpenseStatus = 'pending' | 'approved' | 'rejected'

export const EXPENSE_STATUS_OPTIONS: { value: TExpenseStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'amber' },
  { value: 'approved', label: 'Approved', color: 'emerald' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
]

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'card', label: 'Card' },
  { value: 'qris', label: 'QRIS' },
  { value: 'edc', label: 'EDC' },
] as const

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export interface IExpenseCategory {
  id: string
  name: string
  code: string
  parent_id: string | null
  account_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface IExpense {
  id: string
  expense_number: string
  category_id: string
  description: string
  amount: number
  expense_date: string
  payment_method: string
  receipt_url: string | null
  supplier_id: string | null
  notes: string | null
  status: TExpenseStatus
  approved_by: string | null
  approved_at: string | null
  rejected_reason: string | null
  journal_entry_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

// ============================================================================
// INSERT/UPDATE TYPES
// ============================================================================

export interface IExpenseCategoryInsert {
  name: string
  code: string
  parent_id?: string | null
  account_id?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface IExpenseCategoryUpdate {
  name?: string
  code?: string
  parent_id?: string | null
  account_id?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface IExpenseInsert {
  category_id: string
  description: string
  amount: number
  expense_date: string
  payment_method: string
  supplier_id?: string | null
  notes?: string | null
}

export interface IExpenseUpdate {
  category_id?: string
  description?: string
  amount?: number
  expense_date?: string
  payment_method?: string
  supplier_id?: string | null
  notes?: string | null
}

// ============================================================================
// EXTENDED TYPES
// ============================================================================

export interface IExpenseWithRelations extends IExpense {
  category_name: string
  category_code: string
  supplier_name: string | null
  creator_name: string | null
  approver_name: string | null
}

export interface IExpenseCategoryWithChildren extends IExpenseCategory {
  children: IExpenseCategoryWithChildren[]
  depth?: number
}

export interface IExpenseFilters {
  status?: TExpenseStatus
  category_id?: string
  payment_method?: string
  from?: Date
  to?: Date
  search?: string
}

export interface IExpenseSummary {
  total: number
  count: number
  avg: number
  pending_count: number
  by_category: { name: string; total: number; count: number }[]
  by_day: { date: string; amount: number }[]
}
