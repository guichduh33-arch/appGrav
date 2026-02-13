import { memo } from 'react'
import { cn } from '@/lib/utils'

interface PaymentNumpadProps {
  onKey: (key: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace']

export const PaymentNumpad = memo(function PaymentNumpad({ onKey }: PaymentNumpadProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={cn(
            'flex items-center justify-center rounded-lg text-xl font-semibold cursor-pointer select-none transition-all duration-150 h-14',
            key === 'clear' && 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)]',
            key === 'backspace' && 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]',
            key !== 'clear' && key !== 'backspace' && 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-primary)] border border-[var(--theme-border)] hover:bg-[#2a2a2e] hover:text-gold',
            'active:scale-[0.97]'
          )}
          onClick={() => onKey(key)}
        >
          {key === 'clear' ? 'C' : key === 'backspace' ? '\u232B' : key}
        </button>
      ))}
    </div>
  )
})
