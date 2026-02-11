import { formatCurrency } from '../../utils/helpers'
import { escapeHtml } from '../../utils/sanitize'
import { formatDate, STATUS_CONFIG } from './b2bOrderDetailHelpers'
import type { B2BOrder, OrderItem } from './b2bOrderDetailTypes'

export function printB2BOrder(order: B2BOrder, items: OrderItem[]): void {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
        alert('Unable to open print window. Please check that popups are not blocked.')
        return
    }

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order ${escapeHtml(order.order_number)}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                h1 { font-size: 24px; margin-bottom: 5px; }
                .order-info { color: #666; margin-bottom: 20px; }
                .section { margin-bottom: 20px; }
                .section-title { font-size: 14px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .card { border: 1px solid #ddd; padding: 15px; border-radius: 4px; }
                .card h3 { margin: 0 0 10px; font-size: 14px; color: #666; }
                .card p { margin: 5px 0; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; font-size: 13px; }
                th { background: #f5f5f5; font-weight: bold; }
                .text-right { text-align: right; }
                .summary { margin-left: auto; width: 250px; }
                .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
                .summary-row.total { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; margin-top: 5px; }
                .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                .status-delivered { background: #d4edda; color: #155724; }
                .status-confirmed { background: #cce5ff; color: #004085; }
                .status-draft { background: #e2e3e5; color: #383d41; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <h1>Order ${escapeHtml(order.order_number)}</h1>
            <p class="order-info">
                Created on ${formatDate(order.order_date)} |
                Status: <span class="status status-${escapeHtml(order.status)}">${escapeHtml(STATUS_CONFIG[order.status]?.label || order.status)}</span>
            </p>

            <div class="grid">
                <div class="card">
                    <h3>Customer</h3>
                    <p><strong>${escapeHtml(order.customer?.company_name || order.customer?.name || '-')}</strong></p>
                    ${order.customer?.company_name ? `<p>${escapeHtml(order.customer.name)}</p>` : ''}
                    ${order.customer?.phone ? `<p>Phone: ${escapeHtml(order.customer.phone)}</p>` : ''}
                    ${order.customer?.email ? `<p>Email: ${escapeHtml(order.customer.email)}</p>` : ''}
                </div>
                <div class="card">
                    <h3>Delivery</h3>
                    ${order.requested_delivery_date ? `<p>Requested date: ${formatDate(order.requested_delivery_date)}</p>` : ''}
                    ${order.actual_delivery_date ? `<p>Delivered date: ${formatDate(order.actual_delivery_date)}</p>` : ''}
                    ${order.delivery_address ? `<p>Address: ${escapeHtml(order.delivery_address)}</p>` : ''}
                </div>
            </div>

            <div class="section">
                <div class="section-title">Items</div>
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">Unit Price</th>
                            <th class="text-right">Discount</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>
                                    ${escapeHtml(item.product_name)}
                                    ${item.product_sku ? `<br><small style="color:#666">${escapeHtml(item.product_sku)}</small>` : ''}
                                </td>
                                <td class="text-right">${item.quantity} ${escapeHtml(item.unit)}</td>
                                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                                <td class="text-right">${item.discount_percentage > 0 ? `${item.discount_percentage}%` : '-'}</td>
                                <td class="text-right">${formatCurrency(item.line_total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="summary">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>${formatCurrency(order.subtotal)}</span>
                    </div>
                    ${order.discount_amount > 0 ? `
                    <div class="summary-row">
                        <span>Discount</span>
                        <span>-${formatCurrency(order.discount_amount)}</span>
                    </div>
                    ` : ''}
                    <div class="summary-row">
                        <span>Tax (${order.tax_rate}%)</span>
                        <span>${formatCurrency(order.tax_amount)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span>${formatCurrency(order.total_amount)}</span>
                    </div>
                </div>
            </div>

            ${order.notes ? `
            <div class="section">
                <div class="section-title">Notes</div>
                <p>${escapeHtml(order.notes)}</p>
            </div>
            ` : ''}

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
}
