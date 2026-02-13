import { memo } from 'react'
import { cn } from '@/lib/utils'

interface PaymentNumpadProps {
  onKey: (key: string) => void
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace']

export const PaymentNumpad = memo(function PaymentNumpad({ onKey }: PaymentNumpadProps) {
  return (
    <div className="grid grid-cols-3 gap-px bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/10 rounded-xl overflow-hidden w-full">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={cn(
            'flex items-center justify-center cursor-pointer select-none transition-colors duration-150 h-20',
            key === 'clear' && 'bg-[var(--theme-bg-secondary)] text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-black',
            key === 'backspace' && 'bg-[var(--theme-bg-secondary)] text-[var(--color-gold)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-black',
            key !== 'clear' && key !== 'backspace' && 'bg-[var(--theme-bg-secondary)] text-2xl font-light text-[var(--theme-text-primary)] hover:bg-[var(--color-gold)] hover:text-black',
            'active:scale-[0.97]'
          )}
          onClick={() => onKey(key)}
        >
          {key === 'clear' ? 'CLEAR' : key === 'backspace' ? 'DEL' : key}
        </button>
      ))}
    </div>
  )
})
