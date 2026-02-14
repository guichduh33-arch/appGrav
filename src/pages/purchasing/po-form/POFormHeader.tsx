import type { ISupplier } from '@/hooks/purchasing/useSuppliers'

interface IPOFormHeaderProps {
  formData: {
    supplier_id: string
    expected_delivery_date: string
    notes: string
  }
  suppliers: ISupplier[]
  isOnline: boolean
  onFormChange: (data: Partial<IPOFormHeaderProps['formData']>) => void
}

export function POFormHeader({ formData, suppliers, isOnline, onFormChange }: IPOFormHeaderProps) {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-6 flex items-center gap-2">
        Order Metadata
      </h2>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Supplier *
          </label>
          <select
            required
            value={formData.supplier_id}
            onChange={e => onFormChange({ supplier_id: e.target.value })}
            disabled={!isOnline}
            aria-label="Select supplier"
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white appearance-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all disabled:opacity-50"
          >
            <option value="">Choose a supplier...</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Expected Delivery
          </label>
          <input
            type="date"
            value={formData.expected_delivery_date}
            onChange={e => onFormChange({ expected_delivery_date: e.target.value })}
            disabled={!isOnline}
            aria-label="Expected delivery date"
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all [color-scheme:dark] disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-1.5 col-span-full">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Special Instructions
          </label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={e => onFormChange({ notes: e.target.value })}
            placeholder="Add specific delivery requirements, substitutions, or notes..."
            disabled={!isOnline}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[var(--theme-text-muted)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20 focus:outline-none transition-all resize-none disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  )
}
