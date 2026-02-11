import { formatCurrency } from '../../utils/helpers'
import type { OrderItem } from './b2bOrderDetailTypes'

interface B2BOrderItemsTabProps {
    items: OrderItem[]
}

export default function B2BOrderItemsTab({ items }: B2BOrderItemsTabProps) {
    return (
        <div className="b2b-items-list">
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th>Total</th>
                        <th>Delivered</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>
                                <div className="item-product">
                                    <span className="item-name">{item.product_name}</span>
                                    {item.product_sku && (
                                        <span className="item-sku">{item.product_sku}</span>
                                    )}
                                </div>
                            </td>
                            <td>{item.quantity} {item.unit}</td>
                            <td>{formatCurrency(item.unit_price)}</td>
                            <td>
                                {item.discount_percentage > 0
                                    ? `${item.discount_percentage}%`
                                    : '-'
                                }
                            </td>
                            <td><strong>{formatCurrency(item.line_total)}</strong></td>
                            <td>
                                <span className={`delivery-progress ${item.quantity_delivered >= item.quantity ? 'complete' : ''}`}>
                                    {item.quantity_delivered}/{item.quantity}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
