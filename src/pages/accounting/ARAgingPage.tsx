/**
 * ARAgingPage - Accounts Receivable & Aging Management (Story J1)
 * Displays aging buckets, outstanding invoices, and payment recording
 */

import { useState, useMemo } from 'react'
import { Download, Receipt, DollarSign, AlertTriangle, Clock, Send } from 'lucide-react'
import { useARManagement, type IARInvoice } from '@/hooks/accounting'
import { formatIDR } from '@/services/accounting/accountingService'
import { cn } from '@/lib/utils'

// Aging bucket configuration
const AGING_BUCKETS = [
  { key: 'current', label: 'Current', range: '0 days', color: 'text-[var(--color-gold)]', bgColor: 'bg-[var(--color-gold)]' },
  { key: 'overdue_30', label: '1-30 Days', range: '1-30 days', color: 'text-[var(--color-gold)]/60', bgColor: 'bg-[var(--color-gold)]/60' },
  { key: 'overdue_60', label: '31-60 Days', range: '31-60 days', color: 'text-[var(--color-gold)]/40', bgColor: 'bg-[var(--color-gold)]/40' },
  { key: 'overdue_90', label: '61-90 Days', range: '61-90 days', color: 'text-orange-500', bgColor: 'bg-orange-500' },
  { key: 'overdue_90_plus', label: '90+ Days', range: '90+ days', color: 'text-red-500', bgColor: 'bg-red-500' },
]

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  current: 'bg-slate-800 text-slate-400',
  partial: 'bg-[var(--color-gold)]/10 text-[var(--color-gold)]',
  unpaid: 'bg-slate-800 text-slate-400',
  critical: 'bg-red-500/10 text-red-500',
}

export default function ARAgingPage() {
  const { invoices, agingBuckets, recordPayment, isLoading, error } = useARManagement()
  const [selectedInvoice, setSelectedInvoice] = useState<IARInvoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('transfer')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Calculate total AR
  const totalAR = useMemo(() => {
    return agingBuckets.reduce((sum, bucket) => sum + bucket.total, 0)
  }, [agingBuckets])

  // Export aging report as CSV
  const handleExportReport = () => {
    if (!invoices.data) return

    const headers = ['Invoice #', 'Date', 'Client', 'Original Amount', 'Remaining Balance', 'Days Overdue', 'Status']
    const rows = invoices.data.map(inv => [
      inv.order_number,
      inv.invoice_date,
      inv.customer_name,
      inv.total,
      inv.balance,
      inv.days_overdue,
      inv.status,
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aging-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Open payment modal
  const handleOpenPayment = (invoice: IARInvoice) => {
    setSelectedInvoice(invoice)
    setPaymentAmount(invoice.balance.toString())
    setPaymentMethod('transfer')
    setPaymentReference('')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setShowPaymentModal(true)
  }

  // Submit payment
  const handleSubmitPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return

    try {
      await recordPayment.mutateAsync({
        orderId: selectedInvoice.id,
        amount: parseFloat(paymentAmount),
        paymentMethod,
        reference: paymentReference || undefined,
      })
      setShowPaymentModal(false)
      setSelectedInvoice(null)
    } catch (err) {
      console.error('Payment failed:', err)
    }
  }

  // Get display status for invoice
  const getDisplayStatus = (invoice: IARInvoice): string => {
    if (invoice.paid_amount > 0 && invoice.balance > 0) return 'partial'
    if (invoice.days_overdue >= 90) return 'critical'
    if (invoice.days_overdue > 0) return 'unpaid'
    return 'current'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for aging buckets */}
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-white/10 rounded w-16 mb-2" />
              <div className="h-7 bg-white/10 rounded w-32 mb-3" />
              <div className="h-1 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
        {/* Skeleton for table */}
        <div className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl p-4 animate-pulse">
          <div className="h-8 bg-white/10 rounded w-full mb-4" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-white/5 rounded w-full mb-2" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <AlertTriangle className="mx-auto mb-2 text-red-500" size={32} />
        <p className="text-red-400">Failed to load AR data</p>
        <p className="text-sm text-red-400/60 mt-1">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--theme-text-muted)]">
          Track outstanding B2B invoices and manage payments
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-sm text-white hover:border-white/20 transition-colors"
          >
            <Download size={14} /> Export Aging Report
          </button>
        </div>
      </div>

      {/* Aging Summary Buckets */}
      <section className="grid grid-cols-5 gap-4">
        {AGING_BUCKETS.map((bucket, idx) => {
          const data = agingBuckets[idx]
          const percentage = totalAR > 0 ? (data?.total ?? 0) / totalAR * 100 : 0

          return (
            <div
              key={bucket.key}
              className="bg-[var(--onyx-surface)] border border-white/5 p-5 rounded-xl hover:border-white/10 transition-colors"
            >
              <p className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] font-bold mb-1">
                {bucket.label}
              </p>
              <h3 className={cn('text-2xl font-bold', bucket.color)}>
                {formatIDR(data?.total ?? 0)}
              </h3>
              <div className="mt-3 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className={cn('h-full transition-all', bucket.bgColor)}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] text-[var(--theme-text-muted)]">
                {percentage.toFixed(0)}% of Total AR ({data?.count ?? 0} invoices)
              </p>
            </div>
          )
        })}
      </section>

      {/* Unpaid Invoices Table */}
      <section className="bg-[var(--onyx-surface)] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--charcoal)] text-[var(--theme-text-muted)] border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Invoice #</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Date</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Client</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Original Amount</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Remaining Balance</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Days Overdue</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Status</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.data?.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-[var(--theme-text-muted)]">
                  <Receipt className="mx-auto mb-2 opacity-40" size={32} />
                  No outstanding invoices
                </td>
              </tr>
            ) : (
              invoices.data?.map((invoice) => {
                const displayStatus = getDisplayStatus(invoice)
                return (
                  <tr
                    key={invoice.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-[var(--color-gold)]">
                      #{invoice.order_number}
                    </td>
                    <td className="px-6 py-4 text-[var(--theme-text-muted)]">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {invoice.customer_name}
                    </td>
                    <td className="px-6 py-4 text-[var(--theme-text-muted)]">
                      {formatIDR(invoice.total)}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatIDR(invoice.balance)}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.days_overdue > 0 ? (
                        <span className={cn(
                          'font-bold',
                          invoice.days_overdue >= 90 ? 'text-red-500 text-lg' :
                            invoice.days_overdue >= 60 ? 'text-red-400' :
                              invoice.days_overdue >= 30 ? 'text-orange-400' : 'text-red-400'
                        )}>
                          {invoice.days_overdue >= 90 ? '90+ Days' : `${invoice.days_overdue} Days`}
                        </span>
                      ) : (
                        <span className="text-[var(--theme-text-muted)] italic">Current</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded text-[10px] font-bold uppercase',
                        STATUS_COLORS[displayStatus]
                      )}>
                        {displayStatus === 'partial' ? 'Partial' :
                          displayStatus === 'critical' ? 'Critical' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenPayment(invoice)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-[var(--color-gold)] text-black font-bold rounded hover:brightness-110 transition-all"
                        >
                          <DollarSign size={12} /> Pay
                        </button>
                        <button
                          className="flex items-center gap-1 px-2 py-1 text-xs border border-white/10 text-white rounded hover:border-white/20 transition-colors"
                          title="Send Reminder"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[var(--charcoal)] w-full max-w-md border border-white/10 rounded-xl shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-serif text-xl text-[var(--color-gold)]">Apply Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-[var(--theme-text-muted)] hover:text-white"
              >
                <Clock size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSubmitPayment() }}
              className="p-6 space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
                  Client
                </label>
                <div className="bg-[var(--onyx-surface)] border border-white/5 p-3 rounded-lg text-white text-sm">
                  {selectedInvoice.customer_name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gold)] font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full bg-[var(--onyx-surface)] border border-white/10 pl-10 pr-3 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] outline-none text-white"
                      max={selectedInvoice.balance}
                      min={0}
                      step={100}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-[var(--onyx-surface)] border border-white/10 px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] outline-none text-white [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[var(--onyx-surface)] border border-white/10 px-3 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] outline-none text-white appearance-none"
                >
                  <option value="transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit Card</option>
                  <option value="qris">QRIS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] font-bold">
                  Reference #
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. TRF-20260216-001"
                  className="w-full bg-[var(--onyx-surface)] border border-white/10 px-3 py-2.5 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-gold)] focus:border-[var(--color-gold)] outline-none text-white placeholder:text-white/30"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordPayment.isPending || !paymentAmount}
                  className="flex-1 px-4 py-3 bg-[var(--color-gold)] text-black rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-[var(--color-gold)]/10 disabled:opacity-50"
                >
                  {recordPayment.isPending ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
