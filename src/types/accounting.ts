/**
 * Accounting Module Types (Epic 9)
 * Double-entry accounting, VAT management, financial statements
 */

// ============================================================================
// ENUM TYPES
// ============================================================================

export type TAccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
export type TBalanceType = 'debit' | 'credit'
export type TJournalStatus = 'draft' | 'posted' | 'locked'
export type TJournalReferenceType = 'sale' | 'purchase' | 'manual' | 'void' | 'refund' | 'adjustment' | 'expense'
export type TFiscalPeriodStatus = 'open' | 'closed' | 'locked'

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export interface IAccount {
  id: string
  code: string
  name: string
  account_type: TAccountType
  account_class: number
  parent_id: string | null
  balance_type: TBalanceType
  is_active: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface IJournalEntry {
  id: string
  entry_number: string
  entry_date: string
  description: string
  reference_type: TJournalReferenceType
  reference_id: string | null
  status: TJournalStatus
  total_debit: number
  total_credit: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface IJournalEntryLine {
  id: string
  journal_entry_id: string
  account_id: string
  debit: number
  credit: number
  description: string | null
}

export interface IFiscalPeriod {
  id: string
  year: number
  month: number
  start_date: string
  end_date: string
  status: TFiscalPeriodStatus
  vat_declaration_date: string | null
  vat_declaration_ref: string | null
  vat_payable: number | null
  created_at: string
  updated_at: string
}

// ============================================================================
// INSERT/UPDATE TYPES
// ============================================================================

export interface IAccountInsert {
  code: string
  name: string
  account_type: TAccountType
  account_class: number
  parent_id?: string | null
  balance_type: TBalanceType
  is_active?: boolean
}

export interface IAccountUpdate {
  name?: string
  parent_id?: string | null
  is_active?: boolean
}

export interface IJournalEntryInsert {
  entry_date: string
  description: string
  reference_type?: TJournalReferenceType
  attachment_url?: string | null
  memo?: string | null
  lines: IJournalLineInput[]
}

export interface IJournalLineInput {
  account_id: string
  debit: number
  credit: number
  description?: string
}

export interface IFiscalPeriodInsert {
  year: number
  month: number
  start_date: string
  end_date: string
}

// ============================================================================
// EXTENDED/VIEW TYPES
// ============================================================================

export interface IAccountWithChildren extends IAccount {
  children: IAccountWithChildren[]
  balance?: number
}

export interface IJournalEntryWithLines extends IJournalEntry {
  lines: IJournalEntryLineWithAccount[]
}

export interface IJournalEntryLineWithAccount extends IJournalEntryLine {
  account?: Pick<IAccount, 'id' | 'code' | 'name'>
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface IGeneralLedgerEntry {
  date: string
  entry_number: string
  description: string
  reference_type: TJournalReferenceType | null
  debit: number
  credit: number
  balance: number
}

export interface ITrialBalanceRow {
  account_id: string
  account_code: string
  account_name: string
  account_type: TAccountType
  debit_total: number
  credit_total: number
}

export interface IBalanceSheetSection {
  title: string
  accounts: IFinancialStatementRow[]
  total: number
}

export interface IFinancialStatementRow {
  account_code: string
  account_name: string
  amount: number
}

export interface IIncomeStatementSection {
  title: string
  accounts: IFinancialStatementRow[]
  total: number
}

export interface IVATSummary {
  collected: number
  deductible: number
  payable: number
}

export type TVatFilingStatus = 'not_filed' | 'filed' | 'amended'

export interface IVatFiling {
  id: string
  period_year: number
  period_month: number
  status: TVatFilingStatus
  vat_collected: number | null
  vat_deductible: number | null
  vat_payable: number | null
  filed_at: string | null
  filed_by: string | null
  djp_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// ACCOUNT CLASS LABELS
// ============================================================================

export const ACCOUNT_CLASS_LABELS: Record<number, string> = {
  1: 'Assets',
  2: 'Liabilities',
  3: 'Equity',
  4: 'Revenue',
  5: 'Cost of Goods Sold',
  6: 'Operating Expenses',
  7: 'Other Income/Expenses',
}

export const ACCOUNT_TYPE_OPTIONS: { value: TAccountType; label: string }[] = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' },
]

export const ACCOUNT_TYPE_TO_CLASS: Record<TAccountType, number[]> = {
  asset: [1],
  liability: [2],
  equity: [3],
  revenue: [4, 7],
  expense: [5, 6, 7],
}
