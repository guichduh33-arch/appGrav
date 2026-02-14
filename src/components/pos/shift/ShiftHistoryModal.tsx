import { useRef, useEffect, useState } from 'react'
import { X, Calendar, Clock, Banknote, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { formatCurrency, formatDateTime } from '../../../utils/helpers'
import { cn } from '../../../lib/utils'
import { logError } from '@/utils/logger'

interface ShiftSession {
    id: string
    session_number: string
    user_id: string
    user_name?: string
    status: 'open' | 'closed' | 'reconciled'
    opened_at: string
    closed_at: string | null
    opening_cash: number
    total_sales: number
    transaction_count: number
    actual_cash: number | null
    actual_qris: number | null
    actual_edc: number | null
    cash_difference: number | null
    qris_difference: number | null
    edc_difference: number | null
    notes: string | null
}

interface ShiftHistoryModalProps {
    onClose: () => void
}

export default function ShiftHistoryModal({ onClose }: ShiftHistoryModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)
    const [sessions, setSessions] = useState<ShiftSession[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSession, setSelectedSession] = useState<ShiftSession | null>(null)

    useEffect(() => {
        loadHistory()
    }, [])

    // Close on backdrop click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [onClose])

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [onClose])

    const loadHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('pos_sessions')
                .select(`
                    *,
                    user:user_profiles(name)
                `)
                .neq('status', 'open')
                .order('closed_at', { ascending: false })
                .limit(20)

            if (error) throw error

            const formatted = (data || []).map((s: any) => ({
                ...s,
                user_name: s.user?.name || 'Inconnu'
            }))

            setSessions(formatted)
        } catch (error) {
            logError('Error loading shift history:', error)
        } finally {
            setLoading(false)
        }
    }

    const getDuration = (opened: string, closed: string | null) => {
        if (!closed) return '-'
        const start = new Date(opened)
        const end = new Date(closed)
        const minutes = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}m`
    }

    const getTotalDifference = (session: ShiftSession) => {
        const cash = session.cash_difference || 0
        const qris = session.qris_difference || 0
        const edc = session.edc_difference || 0
        return cash + qris + edc
    }

    const getDifferenceStatus = (diff: number) => {
        if (diff === 0) return 'perfect'
        if (Math.abs(diff) <= 5000) return 'minor'
        return 'significant'
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-sh-fade-in">
            <div
                className="w-full max-w-[600px] max-h-[85vh] bg-[var(--theme-bg-primary)] rounded-xl border border-white/5 overflow-hidden flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] animate-sh-slide-up max-[480px]:max-h-screen max-[480px]:rounded-none text-white"
                ref={modalRef}
            >
                {/* Header */}
                <header className="flex items-center justify-between py-5 px-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-display italic font-bold text-[var(--color-gold)]">B</span>
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">Shift History</span>
                    </div>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-transparent text-[var(--theme-text-muted)] hover:text-white hover:border-white/20 cursor-pointer transition-colors"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-12 text-[var(--theme-text-muted)]">
                            <div className="w-9 h-9 border-3 border-[var(--theme-bg-tertiary)] border-t-[var(--color-gold)] rounded-full animate-sh-spin" />
                            <span>Loading...</span>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-12 text-[var(--theme-text-muted)] text-center">
                            <Calendar size={48} className="opacity-40" />
                            <p>No shift history</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {sessions.map((session, index) => {
                                const totalDiff = getTotalDifference(session)
                                const diffStatus = getDifferenceStatus(totalDiff)
                                const isExpanded = selectedSession?.id === session.id

                                return (
                                    <div
                                        key={session.id}
                                        className={cn(
                                            'bg-[var(--theme-bg-secondary)] border border-white/5 rounded-lg p-4 cursor-pointer transition-all duration-200 animate-sh-card-in hover:border-[var(--color-gold)]/30 hover:bg-[var(--theme-bg-tertiary)]',
                                            isExpanded && 'border-[var(--color-gold)]/40'
                                        )}
                                        style={{ animationDelay: `${Math.min(index, 4) * 50}ms` }}
                                        onClick={() => setSelectedSession(isExpanded ? null : session)}
                                    >
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[1.1rem] font-semibold text-white">
                                                    #{session.session_number}
                                                </span>
                                                <span className="text-[0.85rem] text-[var(--theme-text-secondary)]">
                                                    {session.user_name}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[0.8rem] text-[var(--theme-text-muted)]">
                                                    {formatDateTime(session.closed_at || session.opened_at)}
                                                </span>
                                                <span className={cn(
                                                    'inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-medium',
                                                    diffStatus === 'perfect' && 'bg-emerald-400/15 text-emerald-400',
                                                    diffStatus === 'minor' && 'bg-amber-400/15 text-amber-400',
                                                    diffStatus === 'significant' && 'bg-red-400/15 text-red-400'
                                                )}>
                                                    {diffStatus === 'perfect' && <CheckCircle size={14} />}
                                                    {diffStatus === 'minor' && <TrendingUp size={14} />}
                                                    {diffStatus === 'significant' && <AlertCircle size={14} />}
                                                    {totalDiff === 0 ? 'OK' : formatCurrency(totalDiff)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Summary */}
                                        <div className="flex gap-5 pt-3 border-t border-white/5 max-[480px]:flex-wrap max-[480px]:gap-3">
                                            <div className="flex items-center gap-1.5 text-[0.85rem] text-[var(--theme-text-secondary)] [&_svg]:text-[var(--color-gold)] [&_svg]:opacity-70">
                                                <Banknote size={16} />
                                                <span>{formatCurrency(session.total_sales)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[0.85rem] text-[var(--theme-text-secondary)] [&_svg]:text-[var(--color-gold)] [&_svg]:opacity-70">
                                                <TrendingUp size={16} />
                                                <span>{session.transaction_count} trans.</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[0.85rem] text-[var(--theme-text-secondary)] [&_svg]:text-[var(--color-gold)] [&_svg]:opacity-70">
                                                <Clock size={16} />
                                                <span>{getDuration(session.opened_at, session.closed_at)}</span>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-white/5 animate-sh-expand-in">
                                                <div className="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
                                                    <div className="flex flex-col gap-0.5 p-3 bg-[var(--theme-bg-primary)] rounded-lg border border-white/5">
                                                        <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase">
                                                            Opening cash
                                                        </span>
                                                        <span className="text-base font-medium text-white flex items-baseline gap-2 flex-wrap">
                                                            {formatCurrency(session.opening_cash)}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col gap-0.5 p-3 bg-[var(--theme-bg-primary)] rounded-lg border border-white/5">
                                                        <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase">
                                                            Cash collected
                                                        </span>
                                                        <span className="text-base font-medium text-white flex items-baseline gap-2 flex-wrap">
                                                            {formatCurrency(session.actual_cash || 0)}
                                                            {session.cash_difference !== 0 && session.cash_difference !== null && (
                                                                <span className={cn(
                                                                    'text-[0.8rem]',
                                                                    session.cash_difference > 0 ? 'text-emerald-400' : 'text-red-400'
                                                                )}>
                                                                    ({session.cash_difference > 0 ? '+' : ''}{formatCurrency(session.cash_difference)})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col gap-0.5 p-3 bg-[var(--theme-bg-primary)] rounded-lg border border-white/5">
                                                        <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase">QRIS</span>
                                                        <span className="text-base font-medium text-white flex items-baseline gap-2 flex-wrap">
                                                            {formatCurrency(session.actual_qris || 0)}
                                                            {session.qris_difference !== 0 && session.qris_difference !== null && (
                                                                <span className={cn(
                                                                    'text-[0.8rem]',
                                                                    session.qris_difference > 0 ? 'text-emerald-400' : 'text-red-400'
                                                                )}>
                                                                    ({session.qris_difference > 0 ? '+' : ''}{formatCurrency(session.qris_difference)})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col gap-0.5 p-3 bg-[var(--theme-bg-primary)] rounded-lg border border-white/5">
                                                        <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--theme-text-muted)] uppercase">EDC/Card</span>
                                                        <span className="text-base font-medium text-white flex items-baseline gap-2 flex-wrap">
                                                            {formatCurrency(session.actual_edc || 0)}
                                                            {session.edc_difference !== 0 && session.edc_difference !== null && (
                                                                <span className={cn(
                                                                    'text-[0.8rem]',
                                                                    session.edc_difference > 0 ? 'text-emerald-400' : 'text-red-400'
                                                                )}>
                                                                    ({session.edc_difference > 0 ? '+' : ''}{formatCurrency(session.edc_difference)})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {session.notes && (
                                                    <div className="mt-3 p-3 bg-[var(--theme-bg-primary)] rounded-lg border border-white/5 text-[0.85rem] text-[var(--theme-text-secondary)]">
                                                        <strong className="text-white">Notes:</strong> {session.notes}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
