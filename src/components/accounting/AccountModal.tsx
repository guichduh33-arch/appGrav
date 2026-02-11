/**
 * AccountModal - Create/edit account form (Epic 9 - Story 9.1)
 */

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useAccounts } from '@/hooks/accounting'
import type { IAccount, IAccountInsert, TAccountType, TBalanceType } from '@/types/accounting'
import { ACCOUNT_TYPE_OPTIONS, ACCOUNT_TYPE_TO_CLASS } from '@/types/accounting'
import { suggestNextCode } from '@/services/accounting/accountingService'

interface AccountModalProps {
  account?: IAccount | null
  onClose: () => void
}

export function AccountModal({ account, onClose }: AccountModalProps) {
  const { accounts, createAccount, updateAccount } = useAccounts()
  const isEdit = !!account

  const [code, setCode] = useState(account?.code ?? '')
  const [name, setName] = useState(account?.name ?? '')
  const [accountType, setAccountType] = useState<TAccountType>(account?.account_type ?? 'asset')
  const [accountClass, setAccountClass] = useState(account?.account_class ?? 1)
  const [balanceType, setBalanceType] = useState<TBalanceType>(account?.balance_type ?? 'debit')
  const [parentId, setParentId] = useState(account?.parent_id ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-suggest code for new accounts
  useEffect(() => {
    if (!isEdit && accountClass) {
      setCode(suggestNextCode(accounts, accountClass))
    }
  }, [accountClass, isEdit, accounts])

  // Update class and balance type when account type changes
  useEffect(() => {
    if (!isEdit) {
      const classes = ACCOUNT_TYPE_TO_CLASS[accountType]
      setAccountClass(classes[0])
      setBalanceType(
        accountType === 'asset' || accountType === 'expense' ? 'debit' : 'credit'
      )
    }
  }, [accountType, isEdit])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!code.trim()) errs.code = 'Code is required'
    if (!name.trim()) errs.name = 'Name is required'
    if (code && accounts.some(a => a.code === code && a.id !== account?.id)) {
      errs.code = 'Code already exists'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (isEdit) {
      updateAccount.mutate({
        id: account!.id,
        name,
        parent_id: parentId || null,
      })
    } else {
      const input: IAccountInsert = {
        code,
        name,
        account_type: accountType,
        account_class: accountClass,
        balance_type: balanceType,
        parent_id: parentId || null,
      }
      createAccount.mutate(input)
    }
    onClose()
  }

  const parentOptions = accounts.filter(
    a => a.account_class === accountClass && a.id !== account?.id
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Account' : 'New Account'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">Account Type</label>
              <select
                value={accountType}
                onChange={e => setAccountType(e.target.value as TAccountType)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {ACCOUNT_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                disabled={isEdit}
                className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                placeholder="e.g. 1100"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <input
                type="number"
                value={accountClass}
                onChange={e => setAccountClass(Number(e.target.value))}
                disabled={isEdit}
                min={1}
                max={7}
                className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Account name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {parentOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Parent Account (optional)</label>
              <select
                value={parentId}
                onChange={e => setParentId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">None</option>
                {parentOptions.map(a => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAccount.isPending || updateAccount.isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
