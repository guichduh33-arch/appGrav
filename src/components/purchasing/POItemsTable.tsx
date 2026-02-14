import { RotateCcw } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import { canReceiveItems, type TPOStatus } from '@/hooks/purchasing'
import type { IPOItemsTableProps } from './types'

export function POItemsTable({
  items,
  purchaseOrder,
  isOnline,
  isReceiving,
  onReceiveItem,
  onOpenReturnModal,
}: IPOItemsTableProps) {
  const canReceive = canReceiveItems(purchaseOrder.status as TPOStatus)

  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)] flex items-center gap-2">
          Ordered Items
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/20">
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Product</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Quantity</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Unit Price</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Discount</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Tax</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Total</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Received</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Returned</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[var(--color-gold)]/5 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="text-sm font-semibold text-white">{item.product_name}</span>
                  {item.description && <div className="text-xs text-[var(--muted-smoke)] mt-0.5">{item.description}</div>}
                </td>
                <td className="py-3.5 px-5 text-sm text-[var(--stone-text)]">{parseFloat(item.quantity.toString()).toFixed(2)}</td>
                <td className="py-3.5 px-5 text-sm text-[var(--stone-text)]">{formatCurrency(parseFloat(item.unit_price.toString()))}</td>
                <td className="py-3.5 px-5 text-sm text-[var(--stone-text)]">{formatCurrency(parseFloat(item.discount_amount.toString()))}</td>
                <td className="py-3.5 px-5 text-sm text-[var(--stone-text)]">{parseFloat(item.tax_rate.toString())}%</td>
                <td className="py-3.5 px-5 text-sm font-bold text-white">
                  {formatCurrency(parseFloat(item.line_total.toString()))}
                </td>
                <td className="py-3.5 px-5">
                  <input
                    type="number"
                    min="0"
                    max={parseFloat(item.quantity.toString())}
                    step="0.01"
                    key={`receive-${item.id}-${item.quantity_received}`}
                    defaultValue={parseFloat(item.quantity_received.toString())}
                    onBlur={(e) => {
                      const newValue = parseFloat(e.target.value) || 0
                      const currentValue = parseFloat(item.quantity_received.toString())
                      if (newValue !== currentValue) {
                        onReceiveItem(item.id, newValue)
                      }
                    }}
                    className="w-[70px] py-2 px-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white text-center focus:outline-none focus:border-[var(--color-gold)] disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={!isOnline || !canReceive || isReceiving}
                  />
                </td>
                <td className="py-3.5 px-5 text-sm text-[var(--stone-text)]">{parseFloat(item.quantity_returned.toString()).toFixed(2)}</td>
                <td className="py-3.5 px-5">
                  <button
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-transparent border border-white/10 rounded-lg text-xs text-[var(--muted-smoke)] transition-all hover:border-[var(--color-gold)]/30 hover:text-[var(--color-gold)] disabled:opacity-30"
                    onClick={() => onOpenReturnModal(item)}
                    disabled={parseFloat(item.quantity_received.toString()) === 0 || !isOnline}
                  >
                    <RotateCcw size={12} />
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
