/**
 * AccountingLayout - Sidebar nav with 7 links (Epic 9)
 */

import { NavLink, Outlet } from 'react-router-dom'
import {
  BookOpen, FileText, ScrollText, Scale,
  BarChart3, Receipt, Calendar,
} from 'lucide-react'

const navItems = [
  { to: '/accounting/chart-of-accounts', label: 'Chart of Accounts', icon: BookOpen },
  { to: '/accounting/journal-entries', label: 'Journal Entries', icon: FileText },
  { to: '/accounting/general-ledger', label: 'General Ledger', icon: ScrollText },
  { to: '/accounting/trial-balance', label: 'Trial Balance', icon: Scale },
  { to: '/accounting/balance-sheet', label: 'Balance Sheet', icon: BarChart3 },
  { to: '/accounting/income-statement', label: 'Income Statement', icon: Receipt },
  { to: '/accounting/vat', label: 'VAT Management', icon: Calendar },
]

export default function AccountingLayout() {
  return (
    <div className="min-h-screen bg-[var(--theme-bg-primary)] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Accounting</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold)]/30'
                  : 'bg-transparent border border-white/10 text-white/70 hover:border-white/20 hover:text-white'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
