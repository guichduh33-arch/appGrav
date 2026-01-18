import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
    Settings, LogOut, FileText, History, Receipt,
    LayoutGrid, Monitor, Clock, Lock, X
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import './POSMenu.css'

interface POSMenuProps {
    isOpen: boolean
    onClose: () => void
    onShowHeldOrders: () => void
    onShowTransactionHistory: () => void
    hasOpenShift: boolean
    onOpenShift: () => void
    onCloseShift: () => void
}

export default function POSMenu({
    isOpen,
    onClose,
    onShowHeldOrders,
    onShowTransactionHistory,
    hasOpenShift,
    onOpenShift,
    onCloseShift
}: POSMenuProps) {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const menuRef = useRef<HTMLDivElement>(null)

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

    if (!isOpen) return null

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="pos-menu-overlay">
            <div className="pos-menu" ref={menuRef}>
                <div className="pos-menu__header">
                    <div className="pos-menu__user">
                        <div className="avatar">{user?.name?.[0] || 'U'}</div>
                        <div className="pos-menu__user-info">
                            <span className="pos-menu__user-name">{user?.name || 'User'}</span>
                            <span className="pos-menu__user-role">{user?.role || 'Staff'}</span>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={onClose} aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>

                <div className="pos-menu__items">
                    <button className="pos-menu__item" onClick={() => navigate('/inventory')}>
                        <LayoutGrid size={20} />
                        <span>{t('nav.back_office')}</span>
                    </button>

                    <div className="pos-menu__divider">Operations</div>

                    <button className="pos-menu__item" onClick={() => { onClose(); onShowHeldOrders(); }}>
                        <History size={20} />
                        <span>{t('pos.menu.held_orders')}</span>
                    </button>

                    {/* Transaction history - Manager/Admin only */}
                    {(user?.role === 'manager' || user?.role === 'admin') && (
                        <button
                            className="pos-menu__item"
                            onClick={() => { onClose(); onShowTransactionHistory(); }}
                            disabled={!hasOpenShift}
                        >
                            <Receipt size={20} />
                            <span>{t('pos.menu.transactions', 'Historique Transactions')}</span>
                        </button>
                    )}

                    <button className="pos-menu__item" onClick={() => navigate('/reports')}>
                        <FileText size={20} />
                        <span>{t('pos.menu.reports')}</span>
                    </button>

                    {hasOpenShift ? (
                        <button
                            className="pos-menu__item is-warning"
                            onClick={() => { onClose(); onCloseShift(); }}
                        >
                            <Lock size={20} />
                            <span>{t('shift.close_title', 'Fermer le Shift')}</span>
                        </button>
                    ) : (
                        <button
                            className="pos-menu__item is-success"
                            onClick={() => { onClose(); onOpenShift(); }}
                        >
                            <Clock size={20} />
                            <span>{t('shift.open_title', 'Ouvrir un Shift')}</span>
                        </button>
                    )}

                    <button className="pos-menu__item" onClick={() => window.open('/kds', '_blank')}>
                        <Monitor size={20} />
                        <span>{t('pos.footer.kds')}</span>
                    </button>

                    <div className="pos-menu__divider">System</div>

                    <button className="pos-menu__item" onClick={() => navigate('/settings')}>
                        <Settings size={20} />
                        <span>{t('nav.settings')}</span>
                    </button>
                </div>

                <div className="pos-menu__footer">
                    <button className="pos-menu__item is-danger" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>{t('auth.logout')}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
