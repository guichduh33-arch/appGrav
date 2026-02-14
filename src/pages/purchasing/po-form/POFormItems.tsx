import { Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import type { IPOItem } from '@/hooks/purchasing/usePurchaseOrders'

interface IPOFormItemsProps {
  items: IPOItem[]
  products: Array<{ id: string; name: string; unit?: string | null; cost_price?: number | null }>
  isOnline: boolean
  onItemChange: (index: number, field: keyof IPOItem, value: string | number | null) => void
  onAddItem: () => void
  onRemoveItem: (index: number) => void
}

export function POFormItems({
  items,
  products,
  isOnline,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: IPOFormItemsProps) {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)] flex items-center gap-2">
          Order Line Items
        </h2>
        <button
          className="text-xs flex items-center gap-1.5 text-[var(--theme-text-secondary)] hover:text-[var(--color-gold)] transition-colors disabled:opacity-40"
          onClick={onAddItem}
          disabled={!isOnline}
        >
          <Plus size={14} />
          Add New Row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/20">
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Product</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5">Description</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5 w-24">Qty</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5 w-20">Unit</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5 w-28">Unit Price</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5 w-24">Discount</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5 w-20">Tax %</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5 w-28 text-right">Total</th>
              <th className="py-4 px-5 text-[10px] font-bold text-[var(--muted-smoke)] uppercase tracking-widest border-b border-white/5 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-[var(--color-gold)]/5 transition-colors group">
                <td className="py-3 px-5">
                  <select
                    value={item.product_id || ''}
                    onChange={e => onItemChange(index, 'product_id', e.target.value || null)}
                    disabled={!isOnline}
                    aria-label="Select product"
                    className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 cursor-pointer"
                  >
                    <option value="" className="bg-[var(--onyx-surface)]">Custom product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id} className="bg-[var(--onyx-surface)]">
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {!item.product_id && (
                    <input
                      type="text"
                      placeholder="Product name"
                      value={item.product_name}
                      onChange={e => onItemChange(index, 'product_name', e.target.value)}
                      disabled={!isOnline}
                      className="w-full bg-transparent border-none p-0 mt-1 text-sm text-[var(--muted-smoke)] italic placeholder:text-[var(--theme-text-muted)] focus:ring-0"
                    />
                  )}
                </td>
                <td className="py-3 px-5">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={e => onItemChange(index, 'description', e.target.value)}
                    aria-label="Description"
                    disabled={!isOnline}
                    className="w-full bg-transparent border-none p-0 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:ring-0"
                  />
                </td>
                <td className="py-3 px-5">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={e => onItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    aria-label="Quantity"
                    disabled={!isOnline}
                    className="w-full bg-transparent border-none p-0 text-sm text-white text-right focus:ring-0"
                  />
                </td>
                <td className="py-3 px-5">
                  <select
                    value={item.unit}
                    onChange={e => onItemChange(index, 'unit', e.target.value)}
                    aria-label="Unit"
                    disabled={!isOnline}
                    className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 cursor-pointer"
                  >
                    <option value="kg" className="bg-[var(--onyx-surface)]">kg</option>
                    <option value="g" className="bg-[var(--onyx-surface)]">g</option>
                    <option value="L" className="bg-[var(--onyx-surface)]">L</option>
                    <option value="mL" className="bg-[var(--onyx-surface)]">mL</option>
                    <option value="pcs" className="bg-[var(--onyx-surface)]">pcs</option>
                    <option value="box" className="bg-[var(--onyx-surface)]">box</option>
                    <option value="bag" className="bg-[var(--onyx-surface)]">bag</option>
                  </select>
                </td>
                <td className="py-3 px-5">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={item.unit_price}
                    onChange={e => onItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    aria-label="Unit price"
                    disabled={!isOnline}
                    className="w-full bg-transparent border-none p-0 text-sm text-white text-right focus:ring-0"
                  />
                </td>
                <td className="py-3 px-5">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount_amount}
                    onChange={e => onItemChange(index, 'discount_amount', parseFloat(e.target.value) || 0)}
                    aria-label="Discount"
                    disabled={!isOnline}
                    className="w-full bg-transparent border-none p-0 text-sm text-white text-right focus:ring-0"
                  />
                </td>
                <td className="py-3 px-5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.tax_rate}
                    onChange={e => onItemChange(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                    aria-label="Tax rate"
                    disabled={!isOnline}
                    className="w-full bg-transparent border-none p-0 text-sm text-white text-right focus:ring-0"
                  />
                </td>
                <td className="py-3 px-5 text-right">
                  <span className="text-sm font-bold text-white">{formatCurrency(item.line_total)}</span>
                </td>
                <td className="py-3 px-5 text-right">
                  <button
                    className="text-[var(--muted-smoke)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                    onClick={() => onRemoveItem(index)}
                    disabled={items.length === 1 || !isOnline}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 size={15} />
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
