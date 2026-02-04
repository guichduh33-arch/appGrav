import { useRef, useEffect, useState } from 'react'
import { X, Calendar, Clock, Banknote, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { formatCurrency, formatDateTime } from '../../../utils/helpers'
import './ShiftHistoryModal.css'

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
            console.error('Error loading shift history:', error)
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
        <div className="shift-history-overlay">
            <div className="shift-history-modal" ref={modalRef}>
                {/* Header */}
                <header className="shift-history__header">
                    <div className="shift-history__title-group">
                        <Calendar className="shift-history__icon" />
                        <h2>Shift History</h2>
                    </div>
                    <button className="shift-history__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                {/* Content */}
                <div className="shift-history__content">
                    {loading ? (
                        <div className="shift-history__loading">
                            <div className="shift-history__spinner" />
                            <span>Loading...</span>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="shift-history__empty">
                            <Calendar size={48} />
                            <p>No shift history</p>
                        </div>
                    ) : (
                        <div className="shift-history__list">
                            {sessions.map((session) => {
                                const totalDiff = getTotalDifference(session)
                                const diffStatus = getDifferenceStatus(totalDiff)
                                const isExpanded = selectedSession?.id === session.id

                                return (
                                    <div
                                        key={session.id}
                                        className={`shift-history__card ${isExpanded ? 'is-expanded' : ''}`}
                                        onClick={() => setSelectedSession(isExpanded ? null : session)}
                                    >
                                        {/* Card Header */}
                                        <div className="shift-history__card-header">
                                            <div className="shift-history__card-main">
                                                <span className="shift-history__session-number">
                                                    #{session.session_number}
                                                </span>
                                                <span className="shift-history__user">
                                                    {session.user_name}
                                                </span>
                                            </div>
                                            <div className="shift-history__card-meta">
                                                <span className="shift-history__date">
                                                    {formatDateTime(session.closed_at || session.opened_at)}
                                                </span>
                                                <span className={`shift-history__status shift-history__status--${diffStatus}`}>
                                                    {diffStatus === 'perfect' && <CheckCircle size={14} />}
                                                    {diffStatus === 'minor' && <TrendingUp size={14} />}
                                                    {diffStatus === 'significant' && <AlertCircle size={14} />}
                                                    {totalDiff === 0 ? 'OK' : formatCurrency(totalDiff)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Card Summary */}
                                        <div className="shift-history__card-summary">
                                            <div className="shift-history__stat">
                                                <Banknote size={16} />
                                                <span>{formatCurrency(session.total_sales)}</span>
                                            </div>
                                            <div className="shift-history__stat">
                                                <TrendingUp size={16} />
                                                <span>{session.transaction_count} trans.</span>
                                            </div>
                                            <div className="shift-history__stat">
                                                <Clock size={16} />
                                                <span>{getDuration(session.opened_at, session.closed_at)}</span>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="shift-history__details">
                                                <div className="shift-history__detail-grid">
                                                    <div className="shift-history__detail-item">
                                                        <span className="shift-history__detail-label">
                                                            Opening cash
                                                        </span>
                                                        <span className="shift-history__detail-value">
                                                            {formatCurrency(session.opening_cash)}
                                                        </span>
                                                    </div>

                                                    <div className="shift-history__detail-item">
                                                        <span className="shift-history__detail-label">
                                                            Cash collected
                                                        </span>
                                                        <span className="shift-history__detail-value">
                                                            {formatCurrency(session.actual_cash || 0)}
                                                            {session.cash_difference !== 0 && session.cash_difference !== null && (
                                                                <span className={`shift-history__diff ${session.cash_difference > 0 ? 'positive' : 'negative'}`}>
                                                                    ({session.cash_difference > 0 ? '+' : ''}{formatCurrency(session.cash_difference)})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="shift-history__detail-item">
                                                        <span className="shift-history__detail-label">QRIS</span>
                                                        <span className="shift-history__detail-value">
                                                            {formatCurrency(session.actual_qris || 0)}
                                                            {session.qris_difference !== 0 && session.qris_difference !== null && (
                                                                <span className={`shift-history__diff ${session.qris_difference > 0 ? 'positive' : 'negative'}`}>
                                                                    ({session.qris_difference > 0 ? '+' : ''}{formatCurrency(session.qris_difference)})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="shift-history__detail-item">
                                                        <span className="shift-history__detail-label">EDC/Carte</span>
                                                        <span className="shift-history__detail-value">
                                                            {formatCurrency(session.actual_edc || 0)}
                                                            {session.edc_difference !== 0 && session.edc_difference !== null && (
                                                                <span className={`shift-history__diff ${session.edc_difference > 0 ? 'positive' : 'negative'}`}>
                                                                    ({session.edc_difference > 0 ? '+' : ''}{formatCurrency(session.edc_difference)})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {session.notes && (
                                                    <div className="shift-history__notes">
                                                        <strong>Notes:</strong> {session.notes}
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
