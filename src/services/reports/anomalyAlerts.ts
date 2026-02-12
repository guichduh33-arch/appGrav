/**
 * Anomaly Alerts Service
 * Epic 10: Story 10.6
 *
 * Detects and reports unusual activity in the system
 */

import { supabase } from '@/lib/supabase'
import { logError } from '@/utils/logger'

export interface ISystemAlert {
    id: string
    alert_type: string
    severity: 'info' | 'warning' | 'critical'
    title: string
    description: string | null
    reference_type: string | null
    reference_id: string | null
    is_read: boolean
    is_resolved: boolean
    resolved_by: string | null
    resolved_at: string | null
    resolution_notes: string | null
    created_at: string
}

export type AlertType =
    | 'high_discount'
    | 'excessive_discount'
    | 'high_void'
    | 'stock_anomaly'
    | 'price_change'
    | 'unusual_activity'
    | 'late_payment'
    | 'low_stock'
    | 'negative_stock'

// Story 10.6: Get all alerts
export async function getSystemAlerts(options?: {
    unreadOnly?: boolean
    unresolvedOnly?: boolean
    alertType?: AlertType
    severity?: 'info' | 'warning' | 'critical'
    limit?: number
}): Promise<ISystemAlert[]> {
    let query = supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })

    if (options?.unreadOnly) {
        query = query.eq('is_read', false)
    }

    if (options?.unresolvedOnly) {
        query = query.eq('is_resolved', false)
    }

    if (options?.alertType) {
        query = query.eq('alert_type', options.alertType)
    }

    if (options?.severity) {
        query = query.eq('severity', options.severity)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
        logError('Error fetching alerts:', error)
        return []
    }

    return (data || []) as ISystemAlert[]
}

// Story 10.6: Get alert counts by severity
export async function getAlertCounts(): Promise<{
    total: number
    unread: number
    critical: number
    warning: number
    info: number
}> {
    const { data, error } = await supabase
        .from('system_alerts')
        .select('id, severity, is_read, is_resolved')
        .eq('is_resolved', false)

    if (error) {
        logError('Error fetching alert counts:', error)
        return { total: 0, unread: 0, critical: 0, warning: 0, info: 0 }
    }

    const alerts = data || []
    return {
        total: alerts.length,
        unread: alerts.filter(a => !a.is_read).length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length
    }
}

// Story 10.6: Mark alert as read
export async function markAlertAsRead(alertId: string): Promise<boolean> {
    const { error } = await supabase
        .from('system_alerts')
        .update({ is_read: true })
        .eq('id', alertId)

    return !error
}

// Story 10.6: Mark all alerts as read
export async function markAllAlertsAsRead(): Promise<boolean> {
    const { error } = await supabase
        .from('system_alerts')
        .update({ is_read: true })
        .eq('is_read', false)

    return !error
}

// Story 10.6: Resolve alert
export async function resolveAlert(
    alertId: string,
    resolutionNotes?: string
): Promise<{ success: boolean; error?: string }> {
    const userId = (await supabase.auth.getUser()).data.user?.id

    const { error } = await supabase
        .from('system_alerts')
        .update({
            is_resolved: true,
            resolved_by: userId,
            resolved_at: new Date().toISOString(),
            resolution_notes: resolutionNotes || null
        })
        .eq('id', alertId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Story 10.6: Create custom alert
export async function createAlert(
    alertType: AlertType,
    severity: 'info' | 'warning' | 'critical',
    title: string,
    description?: string,
    referenceType?: string,
    referenceId?: string
): Promise<{ success: boolean; alertId?: string; error?: string }> {
    const { data, error } = await supabase
        .from('system_alerts')
        .insert({
            alert_type: alertType,
            severity,
            title,
            description: description || null,
            reference_type: referenceType || null,
            reference_id: referenceId || null
        })
        .select('id')
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, alertId: data.id }
}

// Story 10.6: Check for void rate anomalies
export async function checkVoidRateAnomaly(): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get today's orders
    const { data: orders } = await supabase
        .from('orders')
        .select('id, status')
        .gte('created_at', today.toISOString())

    if (!orders || orders.length === 0) return 0

    const voidedCount = orders.filter(o => o.status === 'cancelled' || String(o.status) === 'voided').length
    const voidRate = (voidedCount / orders.length) * 100

    // Alert if void rate > 10%
    if (voidRate > 10 && voidedCount > 3) {
        await createAlert(
            'high_void',
            'warning',
            'Taux d\'annulation élevé',
            `${voidedCount} commandes annulées aujourd'hui (${voidRate.toFixed(1)}%)`,
            'daily_report',
            undefined
        )
    }

    // Alert if void rate > 25%
    if (voidRate > 25 && voidedCount > 5) {
        await createAlert(
            'high_void',
            'critical',
            'Taux d\'annulation critique',
            `${voidedCount} commandes annulées aujourd'hui (${voidRate.toFixed(1)}%)`,
            'daily_report',
            undefined
        )
    }

    return voidedCount
}

// Story 10.6: Check for negative stock anomalies
export async function checkNegativeStockAnomaly(): Promise<number> {
    const { data: products } = await supabase
        .from('products')
        .select('id, name, current_stock')
        .lt('current_stock', 0)
        .eq('is_active', true)

    if (!products || products.length === 0) return 0

    for (const product of products) {
        await createAlert(
            'negative_stock',
            'critical',
            'Stock négatif détecté',
            `${product.name}: ${product.current_stock} unités`,
            'product',
            product.id
        )
    }

    return products.length
}

// Story 10.6: Check for price change anomalies
export async function checkPriceChangeAnomaly(
    productId: string,
    oldPrice: number,
    newPrice: number
): Promise<void> {
    const changePercent = Math.abs((newPrice - oldPrice) / oldPrice) * 100

    // Alert if price change > 30%
    if (changePercent > 30) {
        const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', productId)
            .single()

        await createAlert(
            'price_change',
            changePercent > 50 ? 'critical' : 'warning',
            'Changement de prix important',
            `${product?.name}: ${oldPrice} → ${newPrice} (${changePercent.toFixed(0)}%)`,
            'product',
            productId
        )
    }
}

// Story 10.6: Get alert type label
export function getAlertTypeLabel(alertType: string): string {
    const labels: Record<string, string> = {
        high_discount: 'Remise élevée',
        excessive_discount: 'Remise excessive',
        high_void: 'Taux d\'annulation',
        stock_anomaly: 'Anomalie stock',
        price_change: 'Changement de prix',
        unusual_activity: 'Activité inhabituelle',
        late_payment: 'Retard de paiement',
        low_stock: 'Stock bas',
        negative_stock: 'Stock négatif'
    }
    return labels[alertType] || alertType
}

// Story 10.6: Get severity color
export function getSeverityColor(severity: string): string {
    switch (severity) {
        case 'critical': return '#ef4444'
        case 'warning': return '#f59e0b'
        case 'info': return '#3b82f6'
        default: return '#6b7280'
    }
}
