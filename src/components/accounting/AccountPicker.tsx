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
        className="w-full flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm hover:border-white/20 transition-colors"
      >
        <span className={selected ? 'text-white' : 'text-[var(--theme-text-muted)]'}>
          {selected ? `${selected.code} - ${selected.name}` : placeholder}
        </span>
        <ChevronDown size={16} className="text-[var(--theme-text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[var(--theme-bg-secondary)] border border-white/10 rounded-xl shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-2.5 text-[var(--theme-text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search accounts..."
                className="w-full pl-7 pr-3 py-1.5 text-sm bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
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
              <div className="px-3 py-2 text-sm text-[var(--theme-text-muted)]">No accounts found</div>
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
      className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2 transition-colors ${
        isSelected ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]' : 'text-white/80'
      }`}
    >
      <span className="font-mono text-[var(--theme-text-muted)] w-12">{account.code}</span>
      <span className="flex-1">{account.name}</span>
    </button>
  )
}
