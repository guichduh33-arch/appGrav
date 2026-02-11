import { describe, it, expect } from 'vitest'
import { validateJournalEntry } from '../journalEntryValidation'
import type { IJournalLineInput, IFiscalPeriod } from '@/types/accounting'

describe('validateJournalEntry', () => {
  const validLines: IJournalLineInput[] = [
    { account_id: 'acc-1', debit: 100000, credit: 0 },
    { account_id: 'acc-2', debit: 0, credit: 100000 },
  ]

  it('returns no errors for a valid entry', () => {
    const errors = validateJournalEntry('2026-02-01', 'Test entry', validLines)
    expect(errors).toHaveLength(0)
  })

  it('requires entry date', () => {
    const errors = validateJournalEntry('', 'Test entry', validLines)
    expect(errors.some(e => e.field === 'entry_date')).toBe(true)
  })

  it('requires description', () => {
    const errors = validateJournalEntry('2026-02-01', '', validLines)
    expect(errors.some(e => e.field === 'description')).toBe(true)
  })

  it('requires at least 2 lines', () => {
    const errors = validateJournalEntry('2026-02-01', 'Test', [validLines[0]])
    expect(errors.some(e => e.field === 'lines')).toBe(true)
  })

  it('requires each line to have an account', () => {
    const lines: IJournalLineInput[] = [
      { account_id: '', debit: 100000, credit: 0 },
      { account_id: 'acc-2', debit: 0, credit: 100000 },
    ]
    const errors = validateJournalEntry('2026-02-01', 'Test', lines)
    expect(errors.some(e => e.field.includes('account_id'))).toBe(true)
  })

  it('rejects lines with both debit and credit > 0', () => {
    const lines: IJournalLineInput[] = [
      { account_id: 'acc-1', debit: 50000, credit: 50000 },
      { account_id: 'acc-2', debit: 0, credit: 100000 },
    ]
    const errors = validateJournalEntry('2026-02-01', 'Test', lines)
    expect(errors.some(e => e.message.includes('Cannot have both'))).toBe(true)
  })

  it('rejects unbalanced entries', () => {
    const lines: IJournalLineInput[] = [
      { account_id: 'acc-1', debit: 100000, credit: 0 },
      { account_id: 'acc-2', debit: 0, credit: 50000 },
    ]
    const errors = validateJournalEntry('2026-02-01', 'Test', lines)
    expect(errors.some(e => e.field === 'balance')).toBe(true)
  })

  it('rejects entries in locked fiscal periods', () => {
    const periods: IFiscalPeriod[] = [{
      id: 'fp-1',
      year: 2026,
      month: 1,
      start_date: '2026-01-01',
      end_date: '2026-01-31',
      status: 'locked',
      vat_declaration_date: null,
      vat_declaration_ref: null,
      vat_payable: null,
      created_at: '',
      updated_at: '',
    }]
    const errors = validateJournalEntry('2026-01-15', 'Test', validLines, periods)
    expect(errors.some(e => e.message.includes('locked'))).toBe(true)
  })

  it('allows entries in open fiscal periods', () => {
    const periods: IFiscalPeriod[] = [{
      id: 'fp-1',
      year: 2026,
      month: 2,
      start_date: '2026-02-01',
      end_date: '2026-02-28',
      status: 'open',
      vat_declaration_date: null,
      vat_declaration_ref: null,
      vat_payable: null,
      created_at: '',
      updated_at: '',
    }]
    const errors = validateJournalEntry('2026-02-15', 'Test', validLines, periods)
    expect(errors).toHaveLength(0)
  })
})
