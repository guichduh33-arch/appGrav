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
          <div key={classNum} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700 border-b">
              Class {classNum}: {ACCOUNT_CLASS_LABELS[classNum] || 'Other'}
            </div>
            <div className="divide-y">
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
        className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${
          !node.is_active ? 'opacity-50' : ''
        }`}
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span className="font-mono text-sm text-gray-500 w-16">{node.code}</span>
        <span className="flex-1 text-sm">{node.name}</span>

        <span className={`text-xs px-2 py-0.5 rounded-full ${
          node.balance_type === 'debit'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-green-50 text-green-700'
        }`}>
          {node.balance_type}
        </span>

        {node.is_system && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            System
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(node)}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          {!node.is_system && (
            <button
              onClick={() => onToggleActive(node.id, !node.is_active)}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
              title={node.is_active ? 'Deactivate' : 'Activate'}
            >
              {node.is_active ? <ToggleRight size={14} className="text-green-600" /> : <ToggleLeft size={14} />}
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
