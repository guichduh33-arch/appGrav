import { memo } from 'react'
import { Clock, type LucideIcon } from 'lucide-react'
import type { TPaymentMethod } from '@/types/payment'
import { cn } from '@/lib/utils'

interface PaymentMethodConfig {
  id: TPaymentMethod
  name: string
  icon: LucideIcon
  requiresReference?: boolean
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethodConfig[]
  currentMethod: TPaymentMethod | null
  onSelectMethod: (method: TPaymentMethod) => void
  isOnline: boolean
  label: string
}

export const PaymentMethodSelector = memo(function PaymentMethodSelector({
  methods,
  currentMethod,
  onSelectMethod,
  isOnline,
  label,
}: PaymentMethodSelectorProps) {
  return (
    <div className="pb-3 border-b border-[var(--theme-border)]">
      <label className="section-label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {methods.map((method) => {
          const Icon = method.icon
          const isActive = currentMethod === method.id
          return (
            <button
              key={method.id}
              type="button"
              className={cn(
                'flex items-center gap-2 py-2.5 px-4 rounded-full border-2 text-sm font-semibold transition-all duration-200 cursor-pointer',
                isActive
                  ? 'bg-gold text-black border-gold shadow-[0_0_12px_rgba(200,164,91,0.25)]'
                  : 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] border-[var(--theme-border)] hover:border-[var(--theme-border-strong)] hover:text-white'
              )}
              onClick={() => onSelectMethod(method.id)}
            >
              <Icon size={18} />
              <span>{method.name}</span>
              {!isOnline && method.id !== 'cash' && (
                <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                  <Clock size={10} />
                  Pending
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
})
