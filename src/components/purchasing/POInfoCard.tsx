import type { IPOInfoCardProps } from './types'

export function POInfoCard({ purchaseOrder }: IPOInfoCardProps) {
  return (
    <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-gold)] mb-6 pb-4 border-b border-white/5 flex items-center gap-2">
        Order Information
      </h2>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-lg">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Supplier
          </label>
          <div className="text-sm font-semibold text-white">
            {purchaseOrder.supplier?.name}
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-lg">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Order Date
          </label>
          <div className="text-sm text-[var(--stone-text)]">
            {new Date(purchaseOrder.order_date).toLocaleDateString('fr-FR')}
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-lg">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Expected Delivery
          </label>
          <div className="text-sm text-[var(--stone-text)]">
            {purchaseOrder.expected_delivery_date
              ? new Date(purchaseOrder.expected_delivery_date).toLocaleDateString('fr-FR')
              : '-'}
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-lg">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            Actual Delivery
          </label>
          <div className="text-sm text-[var(--stone-text)]">
            {purchaseOrder.actual_delivery_date
              ? new Date(purchaseOrder.actual_delivery_date).toLocaleDateString('fr-FR')
              : '-'}
          </div>
        </div>

        {purchaseOrder.notes && (
          <div className="flex flex-col gap-1 p-3 bg-black/20 rounded-lg col-span-full">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
              Notes
            </label>
            <div className="text-sm text-[var(--stone-text)]">{purchaseOrder.notes}</div>
          </div>
        )}
      </div>
    </div>
  )
}
