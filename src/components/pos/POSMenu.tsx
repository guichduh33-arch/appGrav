import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Settings, LogOut, FileText, History, Receipt,
    LayoutGrid, Monitor, Clock, Lock, X, BarChart3,
    ChevronDown, ChevronUp, Calendar, PieChart
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '@/lib/utils'

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
            console.error('Logout error:', error)
        } finally {
            // Always navigate to login, even if logout fails
            navigate('/login')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] z-[100] flex justify-start">
            <div
                className="w-[300px] h-full bg-[var(--color-gray-800)] border-r border-[var(--color-gray-700)] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.3)] animate-slideInFromLeft"
                ref={menuRef}
            >
                <div className="p-xl border-b border-[var(--color-gray-700)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="avatar w-12 h-12 text-xl bg-primary text-white">{user?.name?.[0] || 'U'}</div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-base">{user?.name || 'User'}</span>
                            <span className="text-xs text-[var(--color-gray-400)] uppercase">{user?.role || 'Staff'}</span>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={onClose} aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-md flex flex-col gap-1">
                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--color-gray-200)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-white"
                        onClick={() => navigate('/inventory')}
                    >
                        <LayoutGrid size={20} />
                        <span>Back Office</span>
                    </button>

                    <div className="px-3 pt-4 pb-2 text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">Operations</div>

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--color-gray-200)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-white"
                        onClick={() => { onClose(); onShowHeldOrders(); }}
                    >
                        <History size={20} />
                        <span>Held Orders</span>
                    </button>

                    {/* Transaction history - Manager/Admin only */}
                    {(user?.role === 'manager' || user?.role === 'admin') && (
                        <button
                            className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--color-gray-200)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-gray-200)]"
                            onClick={() => { onClose(); onShowTransactionHistory(); }}
                            disabled={!hasOpenShift}
                        >
                            <Receipt size={20} />
                            <span>Transaction History</span>
                        </button>
                    )}

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--color-gray-200)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-white"
                        onClick={() => navigate('/reports')}
                    >
                        <FileText size={20} />
                        <span>Reports</span>
                    </button>

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--color-gray-200)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-white"
                        onClick={() => { onClose(); onShowAnalytics(); }}
                    >
                        <BarChart3 size={20} />
                        <span>Today</span>
                    </button>

                    {/* Shift Section - Collapsible */}
                    <div
                        className="flex items-center justify-between cursor-pointer transition-all duration-200 rounded-md my-1 p-3 bg-white/[0.02] hover:bg-[var(--color-gray-700)] hover:text-[var(--color-gray-300)] text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider [&_svg]:opacity-60 [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-[cubic-bezier(0.16,1,0.3,1)]"
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
                                    className="flex items-center gap-3 pl-6 pr-4 py-3 border-none bg-transparent text-[#F59E0B] rounded-md cursor-pointer text-left font-medium transition-all duration-200 text-sm relative before:content-[''] before:absolute before:left-3 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-[#F59E0B] before:transition-colors before:duration-200 hover:bg-[rgba(245,158,11,0.1)]"
                                    onClick={() => { onClose(); onCloseShift(); }}
                                >
                                    <Lock size={18} />
                                    <span>Close Shift</span>
                                </button>
                            ) : (
                                <button
                                    className="flex items-center gap-3 pl-6 pr-4 py-3 border-none bg-transparent text-[#10B981] rounded-md cursor-pointer text-left font-medium transition-all duration-200 text-sm relative before:content-[''] before:absolute before:left-3 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-[#10B981] before:transition-colors before:duration-200 hover:bg-[rgba(16,185,129,0.1)]"
                                    onClick={() => { onClose(); onOpenShift(); }}
                                >
                                    <Clock size={18} />
                                    <span>Open a Shift</span>
                                </button>
                            )}

                            {/* Shift Statistics - only when shift is open */}
                            <button
                                className="flex items-center gap-3 pl-6 pr-4 py-3 border-none bg-transparent text-[var(--color-gray-200)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 text-sm relative before:content-[''] before:absolute before:left-3 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-[var(--color-gray-600)] before:transition-colors before:duration-200 hover:bg-[var(--color-gray-700)] hover:text-white hover:before:bg-[var(--color-gray-400)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--color-gray-200)]"
                                onClick={() => { onClose(); onShowShiftStats(); }}
                                disabled={!hasOpenShift}
                            >
                                <PieChart size={18} />
                                <span>Statistics</span>
                            </button>

                            {/* Shift History */}
                            <button
                                className="flex items-center gap-3 pl-6 pr-4 py-3 border-none bg-transparent text-[var(--color-gray-200)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 text-sm relative before:content-[''] before:absolute before:left-3 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-[var(--color-gray-600)] before:transition-colors before:duration-200 hover:bg-[var(--color-gray-700)] hover:text-white hover:before:bg-[var(--color-gray-400)]"
                                onClick={() => { onClose(); onShowShiftHistory(); }}
                            >
                                <Calendar size={18} />
                                <span>History</span>
                            </button>
                        </div>
                    </div>

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--color-gray-200)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-white"
                        onClick={() => window.open('/kds', '_blank')}
                    >
                        <Monitor size={20} />
                        <span>KDS</span>
                    </button>

                    <div className="px-3 pt-4 pb-2 text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">System</div>

                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-[var(--color-gray-200)] rounded-md cursor-pointer text-left font-medium transition-all duration-200 hover:bg-[var(--color-gray-700)] hover:text-white"
                        onClick={() => navigate('/settings')}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                </div>

                <div className="p-md border-t border-[var(--color-gray-700)]">
                    <button
                        className="flex items-center gap-3 px-4 py-3 border-none bg-transparent text-danger rounded-md cursor-pointer text-left font-medium transition-all duration-200 mt-auto hover:bg-[rgba(239,68,68,0.1)]"
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
