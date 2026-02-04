import { RotateCcw } from 'lucide-react'
import { formatCurrency } from '@/utils/helpers'
import { canReceiveItems, type TPOStatus } from '@/hooks/purchasing'
import type { IPOItemsTableProps } from './types'

export function POItemsTable({
  items,
  purchaseOrder,
  isOnline,
  isReceiving,
  onReceiveItem,
  onOpenReturnModal,
}: IPOItemsTableProps) {
  const canReceive = canReceiveItems(purchaseOrder.status as TPOStatus)

  return (
    <div className="po-detail-card">
      <h2>Ordered items</h2>
      <div className="po-items-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Discount</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Received</th>
              <th>Returned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.product_name}</strong>
                  {item.description && <div className="po-item-desc">{item.description}</div>}
                </td>
                <td>{parseFloat(item.quantity.toString()).toFixed(2)}</td>
                <td>{formatCurrency(parseFloat(item.unit_price.toString()))}</td>
                <td>{formatCurrency(parseFloat(item.discount_amount.toString()))}</td>
                <td>{parseFloat(item.tax_rate.toString())}%</td>
                <td>
                  <strong>{formatCurrency(parseFloat(item.line_total.toString()))}</strong>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max={parseFloat(item.quantity.toString())}
                    step="0.01"
                    key={`receive-${item.id}-${item.quantity_received}`}
                    defaultValue={parseFloat(item.quantity_received.toString())}
                    onBlur={(e) => {
                      const newValue = parseFloat(e.target.value) || 0
                      const currentValue = parseFloat(item.quantity_received.toString())
                      if (newValue !== currentValue) {
                        onReceiveItem(item.id, newValue)
                      }
                    }}
                    className="po-receive-input"
                    disabled={!isOnline || !canReceive || isReceiving}
                  />
                </td>
                <td>{parseFloat(item.quantity_returned.toString()).toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => onOpenReturnModal(item)}
                    disabled={parseFloat(item.quantity_received.toString()) === 0 || !isOnline}
                  >
                    <RotateCcw size={14} />
                    Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
