/**
 * AccountTree - Hierarchical tree view by class (Epic 9 - Story 9.1)
 */

import { useState } from 'react'
import { ChevronRight, ChevronDown, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { IAccount, IAccountWithChildren } from '@/types/accounting'
import { ACCOUNT_CLASS_LABELS } from '@/types/accounting'
import { useAccounts } from '@/hooks/accounting'
import { groupAccountsByClass, buildAccountTree } from '@/services/accounting/accountingService'

interface AccountTreeProps {
  onEdit: (account: IAccount) => void
  showInactive?: boolean
}

export function AccountTree({ onEdit, showInactive = false }: AccountTreeProps) {
  const { accounts, toggleActive } = useAccounts()

  const filtered = showInactive ? accounts : accounts.filter(a => a.is_active)
  const grouped = groupAccountsByClass(filtered)

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries())
        .sort(([a], [b]) => a - b)
        .map(([classNum, classAccounts]) => (
          <div key={classNum} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-2 font-medium text-sm text-[var(--color-gold)] border-b border-white/5">
              Class {classNum}: {ACCOUNT_CLASS_LABELS[classNum] || 'Other'}
            </div>
            <div>
              {buildAccountTree(classAccounts).map(node => (
                <AccountNode
                  key={node.id}
                  node={node}
                  depth={0}
                  onEdit={onEdit}
                  onToggleActive={(id, active) => toggleActive.mutate({ id, is_active: active })}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

interface AccountNodeProps {
  node: IAccountWithChildren
  depth: number
  onEdit: (account: IAccount) => void
  onToggleActive: (id: string, active: boolean) => void
}

function AccountNode({ node, depth, onEdit, onToggleActive }: AccountNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0

  return (
    <>
      <div
        className={`flex items-center gap-2 px-4 py-2 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
          !node.is_active ? 'opacity-50' : ''
        }`}
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        {/* Gold connector line for hierarchy */}
        {depth > 0 && (
          <span className="w-0.5 h-full bg-[var(--color-gold)]/20 absolute" style={{ left: `${4 + depth * 24}px` }} />
        )}

        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 hover:bg-white/5 rounded text-[var(--color-gold)]"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span className="font-mono text-sm text-[var(--theme-text-muted)] w-16">{node.code}</span>
        <span className="flex-1 text-sm text-white/80">{node.name}</span>

        <span className={`text-xs px-2 py-0.5 rounded-full ${
          node.balance_type === 'debit'
            ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
            : 'bg-red-400/10 text-red-400 border border-red-400/20'
        }`}>
          {node.balance_type}
        </span>

        {node.is_system && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
            System
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(node)}
            className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          {!node.is_system && (
            <button
              onClick={() => onToggleActive(node.id, !node.is_active)}
              className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors"
              title={node.is_active ? 'Deactivate' : 'Activate'}
            >
              {node.is_active ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} />}
            </button>
          )}
        </div>
      </div>

      {hasChildren && expanded && node.children
        .sort((a, b) => a.code.localeCompare(b.code))
        .map(child => (
          <AccountNode
            key={child.id}
            node={child}
            depth={depth + 1}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
          />
        ))}
    </>
  )
}
