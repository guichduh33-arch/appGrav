/**
 * Accounting Service (Epic 9)
 * Account hierarchy, balance calculations, utilities
 */

import type { IAccount, IAccountWithChildren } from '@/types/accounting'

/**
 * Build a hierarchical tree from flat accounts list
 */
export function buildAccountTree(accounts: IAccount[]): IAccountWithChildren[] {
  const map = new Map<string, IAccountWithChildren>()
  const roots: IAccountWithChildren[] = []

  // Initialize all nodes
  for (const account of accounts) {
    map.set(account.id, { ...account, children: [] })
  }

  // Build parent-child relationships
  for (const account of accounts) {
    const node = map.get(account.id)!
    if (account.parent_id && map.has(account.parent_id)) {
      map.get(account.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

/**
 * Group accounts by class number
 */
export function groupAccountsByClass(accounts: IAccount[]): Map<number, IAccount[]> {
  const grouped = new Map<number, IAccount[]>()
  for (const account of accounts) {
    const list = grouped.get(account.account_class) || []
    list.push(account)
    grouped.set(account.account_class, list)
  }
  return grouped
}

/**
 * Flatten tree to sorted list (depth-first, code order)
 */
export function flattenAccountTree(tree: IAccountWithChildren[], depth = 0): (IAccountWithChildren & { depth: number })[] {
  const result: (IAccountWithChildren & { depth: number })[] = []
  const sorted = [...tree].sort((a, b) => a.code.localeCompare(b.code))
  for (const node of sorted) {
    result.push({ ...node, depth })
    if (node.children.length > 0) {
      result.push(...flattenAccountTree(node.children, depth + 1))
    }
  }
  return result
}

/**
 * Format IDR amount
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount / 100) * 100)
}

/**
 * Generate next account code suggestion based on class
 */
export function suggestNextCode(accounts: IAccount[], accountClass: number): string {
  const classAccounts = accounts
    .filter(a => a.account_class === accountClass)
    .map(a => parseInt(a.code))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b)

  if (classAccounts.length === 0) {
    return `${accountClass}100`
  }

  const last = classAccounts[classAccounts.length - 1]
  return String(last + 10)
}

/**
 * Validate that debit total equals credit total
 */
export function isBalanced(lines: { debit: number; credit: number }[]): boolean {
  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0)
  return Math.abs(totalDebit - totalCredit) < 0.01
}

/**
 * Calculate totals from journal lines
 */
export function calculateLineTotals(lines: { debit: number; credit: number }[]): {
  totalDebit: number
  totalCredit: number
  difference: number
} {
  const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0)
  return { totalDebit, totalCredit, difference: totalDebit - totalCredit }
}
