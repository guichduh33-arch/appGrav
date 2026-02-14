/**
 * ChartOfAccountsPage - CRUD + hierarchy view (Epic 9 - Story 9.1)
 */

import { useState } from 'react'
import { Plus, Eye, EyeOff } from 'lucide-react'
import { useAccounts } from '@/hooks/accounting'
import { AccountTree } from '@/components/accounting/AccountTree'
import { AccountModal } from '@/components/accounting/AccountModal'
import type { IAccount } from '@/types/accounting'

export default function ChartOfAccountsPage() {
  const { isLoading } = useAccounts()
  const [showModal, setShowModal] = useState(false)
  const [editAccount, setEditAccount] = useState<IAccount | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const handleEdit = (account: IAccount) => {
    setEditAccount(account)
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditAccount(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-48 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded w-full" />
              <div className="h-3 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--theme-text-muted)]">
          Manage your chart of accounts with hierarchical organization
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-white/10 rounded-xl text-white hover:border-white/20 transition-colors"
          >
            {showInactive ? <EyeOff size={14} /> : <Eye size={14} />}
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </button>
          <button
            onClick={() => { setEditAccount(null); setShowModal(true) }}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-[var(--color-gold)] text-black font-bold rounded-xl hover:brightness-110 transition-all"
          >
            <Plus size={16} /> New Account
          </button>
        </div>
      </div>

      <AccountTree onEdit={handleEdit} showInactive={showInactive} />

      {showModal && (
        <AccountModal account={editAccount} onClose={handleClose} />
      )}
    </div>
  )
}
