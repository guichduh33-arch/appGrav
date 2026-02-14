import { Plus, Trash2 } from 'lucide-react'

interface TransferItemForm {
  id?: string
  product_id: string
  product_name: string
  quantity_requested: number
  unit: string
  unit_cost: number
  line_total: number
}

interface ProductOption {
  id: string
  name: string
  sku?: string | null
  cost_price?: number | null
  unit?: string | null
}

interface TransferFormItemsProps {
  items: TransferItemForm[]
  products: ProductOption[]
  isOnline: boolean
  onAddItem: () => void
  onUpdateItem: (index: number, field: keyof TransferItemForm, value: string | number | null) => void
  onRemoveItem: (index: number) => void
  totalValue: number
}

export function TransferFormItems({
  items,
  products,
  isOnline,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  totalValue,
}: TransferFormItemsProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-[var(--onyx-surface)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Items</h2>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-transparent border border-white/10 text-white rounded-lg hover:border-white/20 transition-all disabled:opacity-40"
          onClick={onAddItem}
          disabled={!isOnline}
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--theme-text-muted)]">
          <p>No items added yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-white/5 bg-black/20 p-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]">Product</th>
                <th className="border-b border-white/5 bg-black/20 p-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]" style={{ width: '120px' }}>Quantity</th>
                <th className="border-b border-white/5 bg-black/20 p-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]" style={{ width: '80px' }}>Unit</th>
                <th className="border-b border-white/5 bg-black/20 p-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]" style={{ width: '120px' }}>Unit Cost</th>
                <th className="border-b border-white/5 bg-black/20 p-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--muted-smoke)]" style={{ width: '120px' }}>Line Total</th>
                <th className="border-b border-white/5 bg-black/20 p-3" style={{ width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    <select
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                      value={item.product_id}
                      onChange={(e) => onUpdateItem(index, 'product_id', e.target.value)}
                      disabled={!isOnline}
                    >
                      <option value="">Select product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.sku && `(${p.sku})`}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity_requested}
                      onChange={(e) => onUpdateItem(index, 'quantity_requested', Number(e.target.value))}
                      disabled={!isOnline}
                    />
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-[var(--theme-text-muted)]">{item.unit || '-'}</span>
                  </td>
                  <td className="p-3">
                    <input
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_cost}
                      onChange={(e) => onUpdateItem(index, 'unit_cost', Number(e.target.value))}
                      disabled={!isOnline}
                    />
                  </td>
                  <td className="p-3 text-sm font-semibold text-white">Rp{item.line_total.toLocaleString('id-ID')}</td>
                  <td className="p-3">
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                      onClick={() => onRemoveItem(index)}
                      disabled={!isOnline}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 rounded-lg bg-black/20 p-4">
          <div className="flex justify-between py-2">
            <span className="text-sm text-[var(--theme-text-muted)]">Total Items:</span>
            <span className="text-sm font-semibold text-white">{items.length}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-white/5 pt-3">
            <span className="text-sm text-[var(--theme-text-muted)]">Total Value:</span>
            <span className="text-base font-bold text-[var(--color-gold)]">Rp{totalValue.toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
