import { useState, useRef, useEffect } from 'react'
import { Bell, Package, AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface INotificationBellProps {
  compact?: boolean
  className?: string
}

export function NotificationBell({ compact, className }: INotificationBellProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { data: lowStock = [] } = useQuery({
    queryKey: ['notifications', 'low-stock'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, current_stock')
        .lt('current_stock', 10)
        .gt('current_stock', -1)
        .eq('is_active', true)
        .order('current_stock', { ascending: true })
        .limit(20)
      return data ?? []
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })

  const { data: overdueB2B = [] } = useQuery({
    queryKey: ['notifications', 'overdue-b2b'],
    queryFn: async () => {
      const { data } = await supabase
        .from('b2b_orders')
        .select('id, order_number, delivery_date, payment_status, customer_id')
        .neq('payment_status', 'paid')
        .lt('delivery_date', new Date().toISOString())
        .order('delivery_date', { ascending: true })
        .limit(20)
      return data ?? []
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })

  const totalCount = lowStock.length + overdueB2B.length

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label={`Notifications (${totalCount})`}
      >
        <Bell className="h-5 w-5 text-[var(--theme-text-muted)]" />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto bg-[var(--onyx-surface)] border border-white/10 rounded-xl shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
          </div>

          {totalCount === 0 && (
            <p className="px-4 py-6 text-center text-[var(--theme-text-muted)] text-sm">
              No alerts
            </p>
          )}

          {lowStock.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-[var(--color-gold)]" />
                <span className="text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wide">
                  Low Stock ({lowStock.length})
                </span>
              </div>
              {lowStock.map((p) => (
                <div key={p.id} className="px-4 py-2 hover:bg-white/5 transition-colors">
                  <p className="text-white text-sm truncate">{p.name}</p>
                  <p className="text-[var(--theme-text-muted)] text-xs">
                    Stock: <span className={p.current_stock < 5 ? 'text-red-400' : 'text-yellow-400'}>{p.current_stock}</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          {overdueB2B.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center gap-2 border-t border-white/10">
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-gold)]" />
                <span className="text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wide">
                  Overdue B2B ({overdueB2B.length})
                </span>
              </div>
              {overdueB2B.map((o) => (
                <div key={o.id} className="px-4 py-2 hover:bg-white/5 transition-colors">
                  <p className="text-white text-sm">{o.order_number}</p>
                  <p className="text-[var(--theme-text-muted)] text-xs">
                    Due: {o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : 'N/A'}
                    {' '}&middot;{' '}{o.payment_status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
