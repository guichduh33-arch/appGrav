import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
    X, TrendingUp, TrendingDown, ShoppingBag,
    CreditCard, Banknote, Smartphone, Coffee, Award
} from 'lucide-react'
import { ReportingService } from '../../../services/ReportingService'
import { formatCurrency } from '../../../utils/helpers'
import './CashierAnalyticsModal.css'

interface CashierAnalyticsModalProps {
    onClose: () => void
    sessionId?: string
}

interface TodayStats {
    totalSales: number
    orderCount: number
    avgBasket: number
    hourlyData: { hour: number; sales: number; orders: number }[]
    topProducts: { name: string; qty: number; revenue: number }[]
    paymentMethods: { method: string; amount: number; count: number }[]
    comparison: {
        salesChange: number
        ordersChange: number
    }
}

// Animated number component
function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1200 }: {
    value: number
    prefix?: string
    suffix?: string
    duration?: number
}) {
    const [displayed, setDisplayed] = useState(0)
    const startRef = useRef<number | null>(null)
    const frameRef = useRef<number | null>(null)

    useEffect(() => {
        startRef.current = null

        const animate = (timestamp: number) => {
            if (!startRef.current) startRef.current = timestamp
            const progress = Math.min((timestamp - startRef.current) / duration, 1)

            // Easing function for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayed(Math.floor(eased * value))

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate)
            }
        }

        frameRef.current = requestAnimationFrame(animate)
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current)
        }
    }, [value, duration])

    return <span>{prefix}{displayed.toLocaleString('id-ID')}{suffix}</span>
}

export default function CashierAnalyticsModal({ onClose }: CashierAnalyticsModalProps) {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<TodayStats | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'payments'>('overview')
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadTodayStats()
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

    const loadTodayStats = async () => {
        try {
            const now = new Date()
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const todayEnd = new Date(todayStart)
            todayEnd.setDate(todayEnd.getDate() + 1)

            const yesterdayStart = new Date(todayStart)
            yesterdayStart.setDate(yesterdayStart.getDate() - 1)

            // Fetch today's data
            const [dailyData, productData, paymentData, comparison] = await Promise.all([
                ReportingService.getDailySales(todayStart, todayEnd),
                ReportingService.getProductPerformance(todayStart, todayEnd),
                ReportingService.getPaymentMethodStats(),
                ReportingService.getSalesComparison(todayStart, todayEnd, yesterdayStart, todayStart)
            ])

            // Calculate today's totals
            const todayTotal = dailyData[0] || { total_sales: 0, total_orders: 0, avg_basket: 0 }

            // Mock hourly data (would need a dedicated endpoint for real data)
            const hourlyData = generateHourlyData(todayTotal.total_sales, todayTotal.total_orders)

            // Top 5 products
            const topProducts = productData.slice(0, 5).map(p => ({
                name: p.product_name,
                qty: p.quantity_sold,
                revenue: p.total_revenue
            }))

            // Payment methods
            const paymentMethods = paymentData.map(p => ({
                method: p.payment_method,
                amount: p.total_revenue,
                count: p.transaction_count
            }))

            // Calculate comparison
            const currentPeriod = comparison.find(c => c.period_label === 'current')
            const previousPeriod = comparison.find(c => c.period_label === 'previous')

            const salesChange = previousPeriod?.total_revenue
                ? ((currentPeriod?.total_revenue || 0) - previousPeriod.total_revenue) / previousPeriod.total_revenue * 100
                : 0
            const ordersChange = previousPeriod?.transaction_count
                ? ((currentPeriod?.transaction_count || 0) - previousPeriod.transaction_count) / previousPeriod.transaction_count * 100
                : 0

            setStats({
                totalSales: todayTotal.total_sales,
                orderCount: todayTotal.total_orders,
                avgBasket: todayTotal.avg_basket,
                hourlyData,
                topProducts,
                paymentMethods,
                comparison: { salesChange, ordersChange }
            })
        } catch (error) {
            console.error('Failed to load analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    // Generate mock hourly distribution based on totals
    const generateHourlyData = (totalSales: number, totalOrders: number) => {
        const now = new Date()
        const currentHour = now.getHours()
        const distribution = [0.02, 0.03, 0.05, 0.08, 0.12, 0.15, 0.14, 0.12, 0.10, 0.08, 0.06, 0.05]

        return Array.from({ length: 12 }, (_, i) => {
            const hour = 7 + i // 7 AM to 6 PM
            const factor = hour <= currentHour ? distribution[i] : 0
            return {
                hour,
                sales: Math.round(totalSales * factor),
                orders: Math.round(totalOrders * factor)
            }
        })
    }

    const maxHourlySales = stats ? Math.max(...stats.hourlyData.map(h => h.sales), 1) : 1
    const maxProductRevenue = stats?.topProducts[0]?.revenue || 1
    const totalPayments = stats?.paymentMethods.reduce((sum, p) => sum + p.amount, 0) || 1

    const getPaymentIcon = (method: string) => {
        const lower = method.toLowerCase()
        if (lower.includes('cash') || lower.includes('tunai')) return Banknote
        if (lower.includes('qris') || lower.includes('ovo') || lower.includes('gopay')) return Smartphone
        return CreditCard
    }

    const getPaymentColor = (method: string) => {
        const lower = method.toLowerCase()
        if (lower.includes('cash') || lower.includes('tunai')) return 'var(--analytics-cash)'
        if (lower.includes('qris')) return 'var(--analytics-qris)'
        return 'var(--analytics-card)'
    }

    return (
        <div className="analytics-overlay">
            <div className="analytics-modal" ref={modalRef}>
                {/* Header */}
                <header className="analytics-header">
                    <div className="analytics-header__brand">
                        <Coffee className="analytics-header__icon" />
                        <div>
                            <h2 className="analytics-header__title">
                                {t('pos.analytics.title', "Aujourd'hui")}
                            </h2>
                            <p className="analytics-header__date">
                                {new Date().toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </p>
                        </div>
                    </div>
                    <button className="analytics-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                {loading ? (
                    <div className="analytics-loading">
                        <div className="analytics-loading__spinner" />
                        <span>{t('common.loading', 'Chargement...')}</span>
                    </div>
                ) : stats && (
                    <>
                        {/* Hero KPIs */}
                        <div className="analytics-hero">
                            <div className="analytics-kpi analytics-kpi--primary">
                                <div className="analytics-kpi__label">
                                    {t('pos.analytics.total_sales', 'Ventes')}
                                </div>
                                <div className="analytics-kpi__value">
                                    <span className="analytics-kpi__currency">Rp</span>
                                    <AnimatedNumber value={stats.totalSales} />
                                </div>
                                <div className={`analytics-kpi__trend ${stats.comparison.salesChange >= 0 ? 'up' : 'down'}`}>
                                    {stats.comparison.salesChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    <span>{Math.abs(stats.comparison.salesChange).toFixed(1)}% vs hier</span>
                                </div>
                            </div>

                            <div className="analytics-kpi-group">
                                <div className="analytics-kpi analytics-kpi--secondary">
                                    <div className="analytics-kpi__icon">
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div className="analytics-kpi__content">
                                        <div className="analytics-kpi__value">
                                            <AnimatedNumber value={stats.orderCount} />
                                        </div>
                                        <div className="analytics-kpi__label">
                                            {t('pos.analytics.orders', 'Commandes')}
                                        </div>
                                    </div>
                                </div>

                                <div className="analytics-kpi analytics-kpi--secondary">
                                    <div className="analytics-kpi__icon">
                                        <Award size={20} />
                                    </div>
                                    <div className="analytics-kpi__content">
                                        <div className="analytics-kpi__value">
                                            {formatCurrency(stats.avgBasket)}
                                        </div>
                                        <div className="analytics-kpi__label">
                                            {t('pos.analytics.avg_basket', 'Panier moyen')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <nav className="analytics-tabs">
                            <button
                                className={`analytics-tab ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                {t('pos.analytics.tab_overview', 'Aperçu')}
                            </button>
                            <button
                                className={`analytics-tab ${activeTab === 'products' ? 'active' : ''}`}
                                onClick={() => setActiveTab('products')}
                            >
                                {t('pos.analytics.tab_products', 'Produits')}
                            </button>
                            <button
                                className={`analytics-tab ${activeTab === 'payments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('payments')}
                            >
                                {t('pos.analytics.tab_payments', 'Paiements')}
                            </button>
                        </nav>

                        {/* Tab Content */}
                        <div className="analytics-content">
                            {activeTab === 'overview' && (
                                <div className="analytics-panel" style={{ animationDelay: '0ms' }}>
                                    <h3 className="analytics-section__title">
                                        {t('pos.analytics.hourly_sales', 'Ventes par heure')}
                                    </h3>
                                    <div className="analytics-chart">
                                        {stats.hourlyData.map((data, i) => (
                                            <div
                                                key={data.hour}
                                                className="analytics-bar"
                                                style={{ animationDelay: `${i * 50}ms` }}
                                            >
                                                <div
                                                    className="analytics-bar__fill"
                                                    style={{
                                                        height: `${(data.sales / maxHourlySales) * 100}%`,
                                                        animationDelay: `${200 + i * 50}ms`
                                                    }}
                                                >
                                                    {data.sales > 0 && (
                                                        <span className="analytics-bar__tooltip">
                                                            {formatCurrency(data.sales)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="analytics-bar__label">
                                                    {data.hour}h
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'products' && (
                                <div className="analytics-panel" style={{ animationDelay: '0ms' }}>
                                    <h3 className="analytics-section__title">
                                        {t('pos.analytics.top_products', 'Top 5 Produits')}
                                    </h3>
                                    <div className="analytics-products">
                                        {stats.topProducts.length === 0 ? (
                                            <div className="analytics-empty">
                                                {t('pos.analytics.no_sales', 'Aucune vente pour le moment')}
                                            </div>
                                        ) : (
                                            stats.topProducts.map((product, i) => (
                                                <div
                                                    key={product.name}
                                                    className="analytics-product"
                                                    style={{ animationDelay: `${i * 80}ms` }}
                                                >
                                                    <div className="analytics-product__rank">
                                                        {i + 1}
                                                    </div>
                                                    <div className="analytics-product__info">
                                                        <span className="analytics-product__name">
                                                            {product.name}
                                                        </span>
                                                        <span className="analytics-product__qty">
                                                            {product.qty} {t('pos.analytics.sold', 'vendus')}
                                                        </span>
                                                    </div>
                                                    <div className="analytics-product__revenue">
                                                        {formatCurrency(product.revenue)}
                                                    </div>
                                                    <div
                                                        className="analytics-product__bar"
                                                        style={{
                                                            width: `${(product.revenue / maxProductRevenue) * 100}%`,
                                                            animationDelay: `${300 + i * 80}ms`
                                                        }}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="analytics-panel" style={{ animationDelay: '0ms' }}>
                                    <h3 className="analytics-section__title">
                                        {t('pos.analytics.payment_breakdown', 'Répartition des paiements')}
                                    </h3>
                                    <div className="analytics-payments">
                                        {stats.paymentMethods.length === 0 ? (
                                            <div className="analytics-empty">
                                                {t('pos.analytics.no_payments', 'Aucun paiement pour le moment')}
                                            </div>
                                        ) : (
                                            stats.paymentMethods.map((payment, i) => {
                                                const Icon = getPaymentIcon(payment.method)
                                                const color = getPaymentColor(payment.method)
                                                const percentage = (payment.amount / totalPayments) * 100

                                                return (
                                                    <div
                                                        key={payment.method}
                                                        className="analytics-payment"
                                                        style={{ animationDelay: `${i * 100}ms` }}
                                                    >
                                                        <div
                                                            className="analytics-payment__icon"
                                                            style={{ backgroundColor: color }}
                                                        >
                                                            <Icon size={20} />
                                                        </div>
                                                        <div className="analytics-payment__info">
                                                            <span className="analytics-payment__method">
                                                                {payment.method}
                                                            </span>
                                                            <span className="analytics-payment__count">
                                                                {payment.count} {t('pos.analytics.transactions', 'transactions')}
                                                            </span>
                                                        </div>
                                                        <div className="analytics-payment__amount">
                                                            {formatCurrency(payment.amount)}
                                                        </div>
                                                        <div className="analytics-payment__percent">
                                                            {percentage.toFixed(0)}%
                                                        </div>
                                                        <div
                                                            className="analytics-payment__bar"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor: color,
                                                                animationDelay: `${300 + i * 100}ms`
                                                            }}
                                                        />
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
