/**
 * CSV Export Service
 * Epic 10: Story 10.5 + Epic 2: Story 2.1
 *
 * Export reports and data to CSV format
 */

import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// =============================================================
// Types
// =============================================================

export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  format?: (value: unknown, row: T) => string;
}

export interface CsvExportOptions {
  filename: string;
  reportName?: string;
  dateRange?: { from: Date; to: Date };
  includeTimestamp?: boolean;
}

// =============================================================
// Helper Functions
// =============================================================

// Helper to escape CSV values
function escapeCSV(value: unknown): string {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

// Helper to convert data to CSV
function toCSV<T extends Record<string, unknown>>(
    data: T[],
    columns: { key: keyof T; header: string }[]
): string {
    const headers = columns.map(c => escapeCSV(c.header)).join(',')
    const rows = data.map(row =>
        columns.map(c => escapeCSV(row[c.key])).join(',')
    )
    return [headers, ...rows].join('\n')
}

// Helper to download CSV
function downloadCSV(content: string, filename: string) {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
}

// =============================================================
// Generic Export Function (Story 2.1: Enhanced CSV Export)
// =============================================================

/**
 * Export any data array to CSV with custom columns
 * This is the main function for exporting report data
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: CsvColumn<T>[],
  options: CsvExportOptions
): { success: boolean; error?: string } {
  try {
    // Build rows
    const rows = data.map((row) =>
      columns.map((col) => {
        const key = col.key as keyof T;
        const value = key.toString().includes('.')
          ? getNestedValue(row, key.toString())
          : row[key];

        if (col.format) {
          return escapeCSV(col.format(value, row));
        }
        return escapeCSV(value);
      }).join(',')
    );

    // Build headers
    const headers = columns.map((c) => escapeCSV(c.header)).join(',');

    // Combine
    const csvContent = [headers, ...rows].join('\n');

    // Generate filename
    let filename = options.filename;
    if (options.dateRange) {
      const fromStr = format(options.dateRange.from, 'yyyy-MM-dd');
      const toStr = format(options.dateRange.to, 'yyyy-MM-dd');
      filename = `${filename}_${fromStr}_${toStr}`;
    } else if (options.includeTimestamp !== false) {
      filename = `${filename}_${format(new Date(), 'yyyy-MM-dd')}`;
    }
    filename = `${filename}.csv`;

    downloadCSV(csvContent, filename);

    return { success: true };
  } catch (err) {
    console.error('CSV Export error:', err);
    return { success: false, error: 'Erreur lors de l\'export CSV' };
  }
}

/**
 * Helper to get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Format number for CSV export (French locale)
 */
export function formatNumber(value: unknown): string {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return num.toLocaleString('fr-FR');
}

/**
 * Format currency for CSV export (IDR)
 */
export function formatCurrency(value: unknown): string {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return `${num.toLocaleString('fr-FR')} IDR`;
}

/**
 * Format date for CSV export
 */
export function formatDate(value: unknown): string {
  if (!value) return '';
  const date = new Date(value as string);
  if (isNaN(date.getTime())) return String(value);
  return format(date, 'dd/MM/yyyy', { locale: fr });
}

/**
 * Format datetime for CSV export
 */
export function formatDateTime(value: unknown): string {
  if (!value) return '';
  const date = new Date(value as string);
  if (isNaN(date.getTime())) return String(value);
  return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
}

/**
 * Format percentage for CSV export
 */
export function formatPercentage(value: unknown): string {
  if (value === null || value === undefined) return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return `${(num * 100).toFixed(1)}%`;
}

// =============================================================
// Legacy Export Functions (backwards compatibility)
// =============================================================

// Story 10.5: Export sales report
export async function exportSalesReport(
    startDate: Date,
    endDate: Date
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                order_number,
                order_type,
                status,
                subtotal,
                discount_value,
                tax_amount,
                total,
                payment_method,
                customer:customers(name),
                created_at
            `)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false })

        if (error) throw error

        const csvData = (data || []).map((o) => {
            // Handle Supabase relation which may return array or object
            const customerRaw = o.customer as unknown
            const customer = Array.isArray(customerRaw) ? customerRaw[0] : customerRaw
            return {
                order_number: o.order_number,
                date: new Date(o.created_at || '').toLocaleDateString('fr-FR'),
                time: new Date(o.created_at || '').toLocaleTimeString('fr-FR'),
                type: o.order_type,
                status: o.status,
                customer: (customer as { name: string } | null)?.name || '-',
                subtotal: o.subtotal,
                discount: o.discount_value || 0,
                tax: o.tax_amount || 0,
                total: o.total,
                payment: o.payment_method
            }
        })

        const csv = toCSV(csvData, [
            { key: 'order_number', header: 'N° Commande' },
            { key: 'date', header: 'Date' },
            { key: 'time', header: 'Heure' },
            { key: 'type', header: 'Type' },
            { key: 'status', header: 'Statut' },
            { key: 'customer', header: 'Client' },
            { key: 'subtotal', header: 'Sous-total' },
            { key: 'discount', header: 'Remise' },
            { key: 'tax', header: 'TVA' },
            { key: 'total', header: 'Total' },
            { key: 'payment', header: 'Paiement' }
        ])

        const filename = `ventes_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`
        downloadCSV(csv, filename)

        return { success: true }
    } catch (err) {
        console.error('Export error:', err)
        return { success: false, error: 'Erreur lors de l\'export' }
    }
}

// Story 10.5: Export inventory report
export async function exportInventoryReport(): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                sku,
                name,
                category:categories(name),
                product_type,
                current_stock,
                unit,
                min_stock_level,
                cost_price,
                retail_price,
                is_active
            `)
            .order('name')

        if (error) throw error

        const csvData = (data || []).map((p) => {
            // Handle Supabase relation which may return array or object
            const catRaw = p.category as unknown
            const category = Array.isArray(catRaw) ? catRaw[0] : catRaw
            return {
                sku: p.sku || '-',
                name: p.name,
                category: (category as { name: string } | null)?.name || '-',
                type: p.product_type,
                stock: p.current_stock,
                unit: p.unit,
                min_stock: p.min_stock_level || 0,
                cost: p.cost_price,
                price: p.retail_price,
                active: p.is_active ? 'Oui' : 'Non'
            }
        })

        const csv = toCSV(csvData, [
            { key: 'sku', header: 'SKU' },
            { key: 'name', header: 'Produit' },
            { key: 'category', header: 'Catégorie' },
            { key: 'type', header: 'Type' },
            { key: 'stock', header: 'Stock' },
            { key: 'unit', header: 'Unité' },
            { key: 'min_stock', header: 'Stock Min' },
            { key: 'cost', header: 'Coût' },
            { key: 'price', header: 'Prix Vente' },
            { key: 'active', header: 'Actif' }
        ])

        downloadCSV(csv, `inventaire_${new Date().toISOString().split('T')[0]}.csv`)

        return { success: true }
    } catch (err) {
        console.error('Export error:', err)
        return { success: false, error: 'Erreur lors de l\'export' }
    }
}

// Story 10.5: Export customers report
export async function exportCustomersReport(): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('customers')
            .select(`
                name,
                company_name,
                phone,
                email,
                customer_type,
                category:customer_categories(name),
                loyalty_points,
                loyalty_tier,
                total_spent,
                total_visits,
                credit_limit,
                credit_balance,
                is_active,
                created_at
            `)
            .order('name')

        if (error) throw error

        const csvData = (data || []).map((c: Record<string, unknown>) => ({
            name: c.name,
            company: c.company_name || '-',
            phone: c.phone || '-',
            email: c.email || '-',
            type: c.customer_type,
            category: (c.category as Record<string, string>)?.name || '-',
            points: c.loyalty_points,
            tier: c.loyalty_tier,
            spent: c.total_spent,
            visits: c.total_visits,
            credit_limit: c.credit_limit || 0,
            credit_balance: c.credit_balance || 0,
            active: c.is_active ? 'Oui' : 'Non',
            since: new Date(c.created_at as string).toLocaleDateString('fr-FR')
        }))

        const csv = toCSV(csvData, [
            { key: 'name', header: 'Nom' },
            { key: 'company', header: 'Société' },
            { key: 'phone', header: 'Téléphone' },
            { key: 'email', header: 'Email' },
            { key: 'type', header: 'Type' },
            { key: 'category', header: 'Catégorie' },
            { key: 'points', header: 'Points' },
            { key: 'tier', header: 'Niveau' },
            { key: 'spent', header: 'Total dépensé' },
            { key: 'visits', header: 'Visites' },
            { key: 'credit_limit', header: 'Limite crédit' },
            { key: 'credit_balance', header: 'Solde crédit' },
            { key: 'active', header: 'Actif' },
            { key: 'since', header: 'Client depuis' }
        ])

        downloadCSV(csv, `clients_${new Date().toISOString().split('T')[0]}.csv`)

        return { success: true }
    } catch (err) {
        console.error('Export error:', err)
        return { success: false, error: 'Erreur lors de l\'export' }
    }
}

// Story 10.5: Export stock movements report
export async function exportStockMovementsReport(
    startDate: Date,
    endDate: Date,
    productId?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        let query = supabase
            .from('stock_movements')
            .select(`
                product:products(name, sku),
                movement_type,
                quantity,
                unit_cost,
                reference_type,
                notes,
                created_at
            `)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false })

        if (productId) {
            query = query.eq('product_id', productId)
        }

        const { data, error } = await query

        if (error) throw error

        const csvData = (data || []).map((m: Record<string, unknown>) => ({
            date: new Date(m.created_at as string).toLocaleDateString('fr-FR'),
            time: new Date(m.created_at as string).toLocaleTimeString('fr-FR'),
            product: (m.product as Record<string, string>)?.name || '-',
            sku: (m.product as Record<string, string>)?.sku || '-',
            type: m.movement_type,
            quantity: m.quantity,
            cost: m.unit_cost || '-',
            reference: m.reference_type || '-',
            notes: m.notes || '-'
        }))

        const csv = toCSV(csvData, [
            { key: 'date', header: 'Date' },
            { key: 'time', header: 'Heure' },
            { key: 'product', header: 'Produit' },
            { key: 'sku', header: 'SKU' },
            { key: 'type', header: 'Type' },
            { key: 'quantity', header: 'Quantité' },
            { key: 'cost', header: 'Coût' },
            { key: 'reference', header: 'Référence' },
            { key: 'notes', header: 'Notes' }
        ])

        downloadCSV(csv, `mouvements_stock_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`)

        return { success: true }
    } catch (err) {
        console.error('Export error:', err)
        return { success: false, error: 'Erreur lors de l\'export' }
    }
}

// Story 10.5: Export purchase orders report
export async function exportPurchaseOrdersReport(
    startDate: Date,
    endDate: Date
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('purchase_orders')
            .select(`
                po_number,
                supplier:suppliers(name),
                order_date,
                expected_delivery_date,
                actual_delivery_date,
                status,
                subtotal,
                discount_amount,
                tax_amount,
                total_amount,
                payment_status
            `)
            .gte('order_date', startDate.toISOString())
            .lte('order_date', endDate.toISOString())
            .order('order_date', { ascending: false })

        if (error) throw error

        const csvData = (data || []).map((po) => {
            // Handle Supabase relation which may return array or object
            const supplierRaw = po.supplier as unknown
            const supplier = Array.isArray(supplierRaw) ? supplierRaw[0] : supplierRaw
            return {
                po_number: po.po_number,
                supplier: (supplier as { name: string } | null)?.name || '-',
                order_date: new Date(po.order_date).toLocaleDateString('fr-FR'),
                expected: po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString('fr-FR') : '-',
                received: po.actual_delivery_date ? new Date(po.actual_delivery_date).toLocaleDateString('fr-FR') : '-',
                status: po.status,
                subtotal: po.subtotal,
                discount: po.discount_amount || 0,
                tax: po.tax_amount || 0,
                total: po.total_amount,
                payment: po.payment_status
            }
        })

        const csv = toCSV(csvData, [
            { key: 'po_number', header: 'N° BC' },
            { key: 'supplier', header: 'Fournisseur' },
            { key: 'order_date', header: 'Date commande' },
            { key: 'expected', header: 'Livraison prévue' },
            { key: 'received', header: 'Livraison effective' },
            { key: 'status', header: 'Statut' },
            { key: 'subtotal', header: 'Sous-total' },
            { key: 'discount', header: 'Remise' },
            { key: 'tax', header: 'TVA' },
            { key: 'total', header: 'Total' },
            { key: 'payment', header: 'Paiement' }
        ])

        downloadCSV(csv, `bons_commande_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`)

        return { success: true }
    } catch (err) {
        console.error('Export error:', err)
        return { success: false, error: 'Erreur lors de l\'export' }
    }
}
