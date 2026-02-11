/**
 * Journal Entry Validation (Epic 9)
 * Validates journal entries before submission
 */

import type { IJournalLineInput, IFiscalPeriod } from '@/types/accounting'

export interface IValidationError {
  field: string
  message: string
}

/**
 * Validate a journal entry before submission
 */
export function validateJournalEntry(
  entryDate: string,
  description: string,
  lines: IJournalLineInput[],
  fiscalPeriods?: IFiscalPeriod[]
): IValidationError[] {
  const errors: IValidationError[] = []

  // Entry date required
  if (!entryDate) {
    errors.push({ field: 'entry_date', message: 'Entry date is required' })
  }

  // Description required
  if (!description?.trim()) {
    errors.push({ field: 'description', message: 'Description is required' })
  }

  // Minimum 2 lines
  if (lines.length < 2) {
    errors.push({ field: 'lines', message: 'At least 2 lines are required' })
  }

  // Each line must have an account
  lines.forEach((line, i) => {
    if (!line.account_id) {
      errors.push({ field: `lines[${i}].account_id`, message: `Line ${i + 1}: Account is required` })
    }
    if (line.debit === 0 && line.credit === 0) {
      errors.push({ field: `lines[${i}]`, message: `Line ${i + 1}: Debit or credit must be > 0` })
    }
    if (line.debit > 0 && line.credit > 0) {
      errors.push({ field: `lines[${i}]`, message: `Line ${i + 1}: Cannot have both debit and credit` })
    }
  })

  // Debit must equal credit
  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0)
  if (Math.abs(totalDebit - totalCredit) >= 0.01) {
    errors.push({
      field: 'balance',
      message: `Entry is not balanced: Debit ${totalDebit.toFixed(2)} != Credit ${totalCredit.toFixed(2)}`,
    })
  }

  // Check if period is locked
  if (entryDate && fiscalPeriods) {
    const date = new Date(entryDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const period = fiscalPeriods.find(p => p.year === year && p.month === month)
    if (period && (period.status === 'closed' || period.status === 'locked')) {
      errors.push({
        field: 'entry_date',
        message: `Fiscal period ${year}-${String(month).padStart(2, '0')} is ${period.status}`,
      })
    }
  }

  return errors
}
