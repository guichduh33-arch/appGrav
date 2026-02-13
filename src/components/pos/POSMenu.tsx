import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Settings, LogOut, FileText, History, Receipt,
    LayoutGrid, Monitor, Clock, Lock, X, BarChart3,
    ChevronDown, ChevronUp, Calendar, PieChart
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '@/lib/utils'
import { logError } from '@/utils/logger'

interface POSMenuProps {
    isOpen: boolean
    onClose: () => void
    onShowHeldOrders: () => void
    onShowTransactionHistory: () => void
    onShowAnalytics: () => void
    onShowShiftHistory: () => void
    onShowShiftStats: () => void
    hasOpenShift: boolean
    onOpenShift: () => void
    onCloseShift: () => void
}

export default function POSMenu({
    isOpen,
    onClose,
    onShowHeldOrders,
    onShowTransactionHistory,
    onShowAnalytics,
    onShowShiftHistory,
    onShowShiftStats,
    hasOpenShift,
    onOpenShift,
    onCloseShift
}: POSMenuProps) {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const menuRef = useRef<HTMLDivElement>(null)
    const [shiftExpanded, setShiftExpanded] = useState(false)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    // Reset expansion when menu closes
    useEffect(() => {
        if (!isOpen) {
            setShiftExpanded(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            logError('Logout error:', error)
        } finally {
            // Always navigate to login, even if logout fails
            navigate('/login')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex justify-start">
            <div
                className="w-[300px] h-full bg-[var(--theme-bg-secondary)] border-r border-[var(--theme-border-strong)] flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.6)] animate-slideInFromLeft"
                ref={menuRef}
            >
                <div className="p-xl border-b border-[var(--theme-border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="avatar w-12 h-12 text-xl bg-gold text-black font-bold">{user?.name?.[0] || 'U'}</div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[var(--theme-text-primary)] text-base">{user?.name || 'User'}</span>
                            <span className="text-xs text-[var(--theme-text-secondary)] uppercase tracking-wider">{user?.role || 'Staff'}</span>
                        </div>
                    </div>
                    <button className="btn-icon text-[var(--theme-text-secondary)] hover:text-white" onClick={onClose} aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-md flex flex-col gap-1">
                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--theme-text-primary)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:text-gold"
                        onClick={() => navigate('/inventory')}
                    >
                        <LayoutGrid size={20} />
                        <span>Back Office</span>
                    </button>

                    <div className="px-3 pt-4 pb-2 text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Operations</div>

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--theme-text-primary)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:text-gold"
                        onClick={() => { onClose(); onShowHeldOrders(); }}
                    >
                        <History size={20} />
                        <span>Held Orders</span>
                    </button>

                    {/* Transaction history - Manager/Admin only */}
                    {(user?.role === 'manager' || user?.role === 'admin') && (
                        <button
                            className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--theme-text-primary)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--theme-text-primary)]"
                            onClick={() => { onClose(); onShowTransactionHistory(); }}
                            disabled={!hasOpenShift}
                        >
                            <Receipt size={20} />
                            <span>Transaction History</span>
                        </button>
                    )}

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--theme-text-primary)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:text-gold"
                        onClick={() => navigate('/reports')}
                    >
                        <FileText size={20} />
                        <span>Reports</span>
                    </button>

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--theme-text-primary)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:text-gold"
                        onClick={() => { onClose(); onShowAnalytics(); }}
                    >
                        <BarChart3 size={20} />
                        <span>Today</span>
                    </button>

                    {/* Shift Section - Collapsible */}
                    <div
                        className="flex items-center justify-between cursor-pointer transition-all duration-200 rounded-md my-1 p-3 bg-white/[0.02] hover:bg-[var(--theme-bg-tertiary)] hover:text-gold text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider [&_svg]:opacity-60 [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-[cubic-bezier(0.16,1,0.3,1)]"
                        onClick={() => setShiftExpanded(!shiftExpanded)}
                    >
                        <span>Shift</span>
                        {shiftExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    <div
                        className={cn(
                            'grid overflow-hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [&>*]:min-h-0',
                            shiftExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        )}
                    >
                        <div>
                            {/* Open/Close Shift */}
                            {hasOpenShift ? (
                                <button
                                    className="flex items-center gap-3 pl-6 pr-4 py-3 border-none bg-transparent text-warning-text rounded-md cursor-pointer text-left font-medium transition-all duration-200 text-sm relative before:content-[''] before:absolute before:left-3 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-warning before:transition-colors before:duration-200 hover:bg-warning-bg"
                                    onClick={() => { onClose(); onCloseShift(); }}
                                >
                                    <Lock size={18} />
                                    <span>Close Shift</span>
                                </button>
                            ) : (
                                <button
                                    className="flex items-center gap-3 pl-6 pr-4 py-3 border-none bg-transparent text-success-text rounded-md cursor-pointer text-left font-medium transition-all duration-200 text-sm relative before:content-[''] before:absolute before:left-3 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-success before:transition-colors before:duration-200 hover:bg-success-bg"
                                    onClick={() => { onClose(); onOpenShift(); }}
                                >
                                    <Clock size={18} />
                                    <span>Open a Shift</span>
                                </button>
                            )}

                            {/* Shift Statistics - only when shift is open */}
                            <button
                                className="flex items-center gap-3 pl-6 pr-4 py-3 border-none bg-transparent text-[var(--theme-text-primary)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 text-sm relative before:content-[''] before:absolute before:left-3 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-[var(--theme-border)] before:transition-colors before:duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:text-gold hover:before:bg-gold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--theme-text-primary)]"
                                onClick={() => { onClose(); onShowShiftStats(); }}
                                disabled={!hasOpenShift}
                            >
                                <PieChart size={18} />
                                <span>Statistics</span>
                            </button>

                            {/* Shift History */}
                            <button
                                className="flex items-center gap-3 pl-6 pr-4 py-3 border-none bg-transparent text-[var(--theme-text-primary)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 text-sm relative before:content-[''] before:absolute before:left-3 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-[var(--theme-border)] before:transition-colors before:duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:text-gold hover:before:bg-gold"
                                onClick={() => { onClose(); onShowShiftHistory(); }}
                            >
                                <Calendar size={18} />
                                <span>History</span>
                            </button>
                        </div>
                    </div>

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--theme-text-primary)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:text-gold"
                        onClick={() => window.open('/kds', '_blank')}
                    >
                        <Monitor size={20} />
                        <span>KDS</span>
                    </button>

                    <div className="px-3 pt-4 pb-2 text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">System</div>

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--theme-text-primary)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--theme-bg-tertiary)] hover:text-gold"
                        onClick={() => navigate('/settings')}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                </div>

                <div className="p-md border-t border-[var(--theme-border)]">
                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-destructive rounded-md cursor-pointer text-left font-medium transition-all duration-200 mt-auto hover:bg-destructive/10"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
