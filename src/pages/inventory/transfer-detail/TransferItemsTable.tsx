import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransferItem {
  id: string
  product_id: string
  quantity_requested: number
  quantity_received?: number | null
  product?: { name?: string; sku?: string } | null
}

interface TransferItemsTableProps {
  items: TransferItem[]
  isReceived: boolean
  canReceive: boolean
  itemQuantities: Map<string, number>
  validationErrors: Map<string, string>
  onQuantityChange: (itemId: string, value: string) => void
  getVariance: (itemId: string, quantityRequested: number) => number
}

export function TransferItemsTable({
  items,
  isReceived,
  canReceive,
  itemQuantities,
  validationErrors,
  onQuantityChange,
  getVariance,
}: TransferItemsTableProps) {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl mb-4 overflow-hidden">
      <h2 className="flex items-center gap-2 text-base font-bold text-white p-4 m-0 border-b border-white/5">
        <Package size={18} className="text-[var(--color-gold)]" />
        Items ({items.length})
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] bg-black/20 border-b border-white/5">Product</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] bg-black/20 border-b border-white/5">Qty Requested</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] bg-black/20 border-b border-white/5">Qty Received</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)] bg-black/20 border-b border-white/5">Variance</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const quantityReceived = isReceived
                ? item.quantity_received
                : (itemQuantities.get(item.id) ?? item.quantity_requested)
              const variance = isReceived
                ? (item.quantity_received ?? 0) - item.quantity_requested
                : getVariance(item.id, item.quantity_requested)
              const hasError = validationErrors.has(item.id)

              return (
                <tr key={item.id} className={cn('border-b border-white/5 hover:bg-white/[0.02] transition-colors', hasError && 'bg-red-500/5')}>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white">{item.product?.name ?? 'Unknown'}</span>
                      {item.product?.sku && (
                        <span className="text-[10px] text-[var(--theme-text-muted)]">{item.product.sku}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-center">
                    <span className="text-sm text-[var(--theme-text-secondary)]">{item.quantity_requested}</span>
                  </td>
                  <td className="px-4 py-3 align-middle text-center">
                    {isReceived ? (
                      <span className="text-sm text-white font-semibold">{item.quantity_received ?? 0}</span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="number"
                          className={cn(
                            'w-20 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm text-center',
                            'focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            hasError && 'border-red-500'
                          )}
                          value={quantityReceived ?? ''}
                          onChange={(e) => onQuantityChange(item.id, e.target.value)}
                          min="0"
                          step="0.01"
                          disabled={!canReceive}
                        />
                        {hasError && (
                          <span className="text-[10px] text-red-400">{validationErrors.get(item.id)}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-center">
                    <span className={cn(
                      'text-sm font-semibold text-[var(--theme-text-muted)]',
                      variance > 0 && 'text-emerald-400',
                      variance < 0 && 'text-red-400'
                    )}>
                      {variance > 0 ? '+' : ''}{variance}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
