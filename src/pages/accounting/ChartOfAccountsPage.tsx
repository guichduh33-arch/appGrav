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
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-48 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Manage your chart of accounts with hierarchical organization
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            {showInactive ? <EyeOff size={14} /> : <Eye size={14} />}
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </button>
          <button
            onClick={() => { setEditAccount(null); setShowModal(true) }}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
