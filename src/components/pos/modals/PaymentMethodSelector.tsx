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
    <div className="pb-4 border-b border-[var(--theme-border)]">
      <label className="section-label">{label}</label>
      <div className="grid grid-cols-3 gap-4">
        {methods.map((method) => {
          const Icon = method.icon
          const isActive = currentMethod === method.id
          return (
            <button
              key={method.id}
              type="button"
              className={cn(
                'flex flex-col items-center justify-center gap-3 h-32 rounded-lg border text-sm font-semibold tracking-widest uppercase transition-all duration-200 cursor-pointer',
                isActive
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 ring-1 ring-[var(--color-gold)]/50 text-white'
                  : 'border-[var(--color-gold)]/20 bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)] hover:border-[var(--color-gold)]/40 hover:text-white'
              )}
              onClick={() => onSelectMethod(method.id)}
            >
              <Icon size={22} />
              <span>{method.name}</span>
              {isActive && <div className="w-12 h-px bg-[var(--color-gold)]" />}
              {!isOnline && method.id !== 'cash' && (
                <span className="text-[10px] text-amber-400 flex items-center gap-0.5 normal-case tracking-normal">
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
