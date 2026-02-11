import { describe, it, expect } from 'vitest'
import {
  buildAccountTree,
  groupAccountsByClass,
  flattenAccountTree,
  isBalanced,
  calculateLineTotals,
  suggestNextCode,
  formatIDR,
} from '../accountingService'
import type { IAccount } from '@/types/accounting'

const makeAccount = (overrides: Partial<IAccount>): IAccount => ({
  id: overrides.id || 'test-id',
  code: overrides.code || '1100',
  name: overrides.name || 'Test Account',
  account_type: overrides.account_type || 'asset',
  account_class: overrides.account_class || 1,
  parent_id: overrides.parent_id ?? null,
  balance_type: overrides.balance_type || 'debit',
  is_active: overrides.is_active ?? true,
  is_system: overrides.is_system ?? false,
  created_at: '',
  updated_at: '',
})

describe('buildAccountTree', () => {
  it('builds a flat list into a tree', () => {
    const accounts: IAccount[] = [
      makeAccount({ id: '1', code: '1000', parent_id: null }),
      makeAccount({ id: '2', code: '1100', parent_id: '1' }),
      makeAccount({ id: '3', code: '1200', parent_id: '1' }),
    ]
    const tree = buildAccountTree(accounts)
    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(2)
  })

  it('handles multiple roots', () => {
    const accounts: IAccount[] = [
      makeAccount({ id: '1', code: '1000', parent_id: null }),
      makeAccount({ id: '2', code: '2000', parent_id: null }),
    ]
    const tree = buildAccountTree(accounts)
    expect(tree).toHaveLength(2)
  })

  it('handles orphans (parent not in list)', () => {
    const accounts: IAccount[] = [
      makeAccount({ id: '1', code: '1100', parent_id: 'nonexistent' }),
    ]
    const tree = buildAccountTree(accounts)
    expect(tree).toHaveLength(1)
  })
})

describe('groupAccountsByClass', () => {
  it('groups accounts by their class number', () => {
    const accounts: IAccount[] = [
      makeAccount({ id: '1', account_class: 1 }),
      makeAccount({ id: '2', account_class: 1 }),
      makeAccount({ id: '3', account_class: 2 }),
    ]
    const grouped = groupAccountsByClass(accounts)
    expect(grouped.get(1)?.length).toBe(2)
    expect(grouped.get(2)?.length).toBe(1)
  })
})

describe('flattenAccountTree', () => {
  it('flattens tree into sorted list with depth', () => {
    const accounts: IAccount[] = [
      makeAccount({ id: '1', code: '1000', parent_id: null }),
      makeAccount({ id: '2', code: '1100', parent_id: '1' }),
    ]
    const tree = buildAccountTree(accounts)
    const flat = flattenAccountTree(tree)
    expect(flat).toHaveLength(2)
    expect(flat[0].depth).toBe(0)
    expect(flat[1].depth).toBe(1)
  })
})

describe('isBalanced', () => {
  it('returns true when debits equal credits', () => {
    expect(isBalanced([
      { debit: 100, credit: 0 },
      { debit: 0, credit: 100 },
    ])).toBe(true)
  })

  it('returns false when not balanced', () => {
    expect(isBalanced([
      { debit: 100, credit: 0 },
      { debit: 0, credit: 50 },
    ])).toBe(false)
  })
})

describe('calculateLineTotals', () => {
  it('calculates totals and difference', () => {
    const result = calculateLineTotals([
      { debit: 100, credit: 0 },
      { debit: 0, credit: 100 },
    ])
    expect(result.totalDebit).toBe(100)
    expect(result.totalCredit).toBe(100)
    expect(result.difference).toBe(0)
  })
})

describe('suggestNextCode', () => {
  it('suggests next code based on existing accounts', () => {
    const accounts: IAccount[] = [
      makeAccount({ code: '1100', account_class: 1 }),
      makeAccount({ code: '1200', account_class: 1 }),
    ]
    expect(suggestNextCode(accounts, 1)).toBe('1210')
  })

  it('returns base code when no accounts exist for class', () => {
    expect(suggestNextCode([], 3)).toBe('3100')
  })
})

describe('formatIDR', () => {
  it('formats amounts in IDR', () => {
    const result = formatIDR(150000)
    expect(result).toContain('150')
  })

  it('rounds to nearest 100', () => {
    const result = formatIDR(150050)
    expect(result).toContain('150')
  })
})
