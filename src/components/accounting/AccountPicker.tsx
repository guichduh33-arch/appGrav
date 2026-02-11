/**
 * AccountPicker - Searchable dropdown for account selection (Epic 9)
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { useActiveAccounts } from '@/hooks/accounting'
import type { IAccount } from '@/types/accounting'

interface AccountPickerProps {
  value: string
  onChange: (accountId: string) => void
  placeholder?: string
  className?: string
}

export function AccountPicker({ value, onChange, placeholder = 'Select account...', className = '' }: AccountPickerProps) {
  const { data: accounts = [] } = useActiveAccounts()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!search) return accounts
    const q = search.toLowerCase()
    return accounts.filter(
      a => a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    )
  }, [accounts, search])

  const selected = accounts.find(a => a.id === value)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white hover:border-gray-400"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? `${selected.code} - ${selected.name}` : placeholder}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search accounts..."
                className="w-full pl-7 pr-3 py-1.5 text-sm border rounded"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.map(account => (
              <AccountOption
                key={account.id}
                account={account}
                isSelected={account.id === value}
                onSelect={() => {
                  onChange(account.id)
                  setIsOpen(false)
                  setSearch('')
                }}
              />
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">No accounts found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AccountOption({
  account,
  isSelected,
  onSelect,
}: {
  account: IAccount
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 ${
        isSelected ? 'bg-blue-50 text-blue-700' : ''
      }`}
    >
      <span className="font-mono text-gray-500 w-12">{account.code}</span>
      <span className="flex-1">{account.name}</span>
    </button>
  )
}
